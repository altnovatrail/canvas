import { inflateSync, crc32 as zlibCrc32 } from "node:zlib";
import { describe, expect, test } from "vitest";
import { cropOf } from "./crop.js";
import { groupsOf } from "./groups.js";
import { adler32, crc32, encodePNG } from "./png.js";
import { pictureOf, rasterOf } from "./raster.js";
import { CROP_SHEETS, random, SHEETS } from "./sheets.fixture.js";

// The PNG of the crop (R25), read back two ways: by Node's zlib, and by a reader of the fixed
// Huffman codes written here from RFC 1951, which also says which codes the stream holds.

interface Chunk {
  readonly type: string;
  readonly data: Uint8Array;
  readonly crc: number;
}

/** The chunks after the signature. */
function chunksOf(png: Uint8Array): Chunk[] {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const chunks: Chunk[] = [];
  for (let at = 8; at < png.length; ) {
    const length = view.getUint32(at);
    chunks.push({
      type: String.fromCharCode(...png.subarray(at + 4, at + 8)),
      data: png.subarray(at + 8, at + 8 + length),
      crc: view.getUint32(at + 8 + length),
    });
    at += 12 + length;
  }
  return chunks;
}

/** The zlib stream of a PNG: its one IDAT. */
function streamOf(png: Uint8Array): Uint8Array {
  const data = chunksOf(png).find(({ type }) => type === "IDAT")?.data;
  if (data === undefined) throw new Error("no IDAT");
  return data;
}

const LENGTHS = [
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131,
  163, 195, 227, 258,
];
const LENGTH_BITS = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0,
];
const DISTANCES = [
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049,
  3073, 4097, 6145, 8193, 12289, 16385, 24577,
];
const DISTANCE_BITS = [
  0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13,
];

/** What a stream of one block of the fixed codes holds: its bytes, and the codes it took. */
function readFixed(zlib: Uint8Array): {
  bytes: number[];
  symbols: number[];
  matches: [symbol: number, length: number][];
  distanceCodes: number[];
} {
  const deflate = zlib.subarray(2, zlib.length - 4);
  let bit = 0;
  const take = () => ((deflate[bit >> 3] ?? 0) >> (bit++ & 7)) & 1;
  // Other numbers from their least significant bit, Huffman codes from their most (3.1.1).
  const number = (count: number) => {
    let value = 0;
    for (let k = 0; k < count; k++) value |= take() << k;
    return value;
  };
  const code = (count: number, from = 0) => {
    let value = from;
    for (let k = 0; k < count; k++) value = (value << 1) | take();
    return value;
  };
  expect(number(1)).toBe(1);
  expect(number(2)).toBe(1);
  const bytes: number[] = [];
  const symbols: number[] = [];
  const matches: [number, number][] = [];
  const distanceCodes: number[] = [];
  for (;;) {
    // The fixed codes by their lengths, 7, 8 and 9 bits (3.2.6).
    let symbol: number;
    const seven = code(7);
    if (seven <= 0b0010111) symbol = 256 + seven;
    else {
      const eight = code(1, seven);
      if (eight >= 0b00110000 && eight <= 0b10111111) symbol = eight - 0b00110000;
      else if (eight >= 0b11000000 && eight <= 0b11000111) symbol = 280 + eight - 0b11000000;
      else symbol = 144 + code(1, eight) - 0b110010000;
    }
    symbols.push(symbol);
    if (symbol < 256) {
      bytes.push(symbol);
      continue;
    }
    if (symbol === 256) break;
    const lengthCode = symbol - 257;
    const length = (LENGTHS[lengthCode] ?? 0) + number(LENGTH_BITS[lengthCode] ?? 0);
    matches.push([symbol, length]);
    const distanceCode = code(5);
    distanceCodes.push(distanceCode);
    const distance = (DISTANCES[distanceCode] ?? 0) + number(DISTANCE_BITS[distanceCode] ?? 0);
    for (let k = 0; k < length; k++) bytes.push(bytes[bytes.length - distance] ?? -1);
  }
  return { bytes, symbols, matches, distanceCodes };
}

/** A grey image of noise, which has nothing to repeat. */
function noise(width: number, height: number, seed: number): Uint8Array {
  const next = random(seed);
  return Uint8Array.from({ length: width * height }, () => Math.floor(next() * 256));
}

describe("the PNG", () => {
  test("is the signature, then IHDR, one IDAT and IEND, each with its CRC", () => {
    const png = encodePNG(Uint8Array.from([0, 64, 128, 255, 32, 16]), 3, 2);
    expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const chunks = chunksOf(png);
    expect(chunks.map(({ type }) => type)).toEqual(["IHDR", "IDAT", "IEND"]);
    for (const { type, data, crc } of chunks) {
      const typed = new Uint8Array([...type].map((char) => char.charCodeAt(0)));
      expect(crc, type).toBe(zlibCrc32(Buffer.concat([typed, data])));
    }
    const header = chunks[0]?.data ?? new Uint8Array(0);
    const view = new DataView(header.buffer, header.byteOffset, header.byteLength);
    // 3 by 2, 8 bits of grey, the one compression and filter method, no interlacing.
    expect([view.getUint32(0), view.getUint32(4), ...header.subarray(8)]).toEqual([
      3, 2, 8, 0, 0, 0, 0,
    ]);
    expect(chunks[2]?.data).toHaveLength(0);
  });

  test("holds the pixels in a zlib stream, row by row, each row unfiltered", () => {
    const gray = noise(37, 23, 1);
    const zlib = streamOf(encodePNG(gray, 37, 23));
    // The deflate method with a 32 KiB window; FCHECK makes the two bytes a multiple of 31.
    expect([...zlib.subarray(0, 2)]).toEqual([0x78, 0x01]);
    expect((0x78 * 256 + 0x01) % 31).toBe(0);
    const rows = inflateSync(zlib);
    expect(rows).toHaveLength(23 * 38);
    for (let row = 0; row < 23; row++) {
      expect(rows[row * 38]).toBe(0);
      expect([...rows.subarray(row * 38 + 1, (row + 1) * 38)]).toEqual([
        ...gray.subarray(row * 37, (row + 1) * 37),
      ]);
    }
  });

  test("takes a run of 258 bytes as code 285, and no code past 285 or distance code past 29", () => {
    // Two rows of white 700 wide: runs of the byte before, then a row like the one above.
    const width = 700;
    const gray = new Uint8Array(width * 2).fill(255);
    gray[350] = 0;
    const zlib = streamOf(encodePNG(gray, width, 2));
    const { bytes, symbols, matches, distanceCodes } = readFixed(zlib);
    expect(bytes).toEqual([...inflateSync(zlib)]);
    expect(Math.max(...symbols)).toBeLessThanOrEqual(285);
    expect(Math.max(...distanceCodes)).toBeLessThanOrEqual(29);
    // Every run of 258 goes as 285, none as 284 with its extra bits all set.
    const longest = matches.filter(([, length]) => length === 258);
    expect(longest.length).toBeGreaterThan(2);
    for (const [symbol] of longest) expect(symbol).toBe(285);
    for (const [symbol, length] of matches) if (symbol === 284) expect(length).toBeLessThan(258);
  });

  test("reads back the same by both readers, for a crop of each synthetic sheet", () => {
    for (const make of [...SHEETS, ...CROP_SHEETS]) {
      const { name, work } = make();
      const crop = cropOf(work.strokes, groupsOf(work.strokes), 32);
      if (crop === null) throw new Error(`${name} has no crop`);
      const gray = rasterOf(work.strokes, crop);
      const zlib = streamOf(pictureOf(work.strokes, crop));
      const rows = inflateSync(zlib);
      expect(Buffer.from(readFixed(zlib).bytes).equals(rows), name).toBe(true);
      const pixels = new Uint8Array(crop.width * crop.height);
      for (let row = 0; row < crop.height; row++) {
        pixels.set(
          rows.subarray(row * (crop.width + 1) + 1, (row + 1) * (crop.width + 1)),
          row * crop.width,
        );
      }
      expect(Buffer.from(pixels).equals(Buffer.from(gray)), name).toBe(true);
    }
  });

  test("is no larger than 9 bits to a byte, and its chunks", () => {
    // Noise has no repeats: each byte a literal of 8 or 9 bits.
    for (const [width, height] of [
      [300, 200],
      [1, 1],
      [1568, 3],
    ] as const) {
      const png = encodePNG(noise(width, height, width), width, height);
      const bound = 8 + 25 + 12 + 12 + 2 + 4 + Math.ceil((3 + 9 * (width + 1) * height + 7) / 8);
      expect(png.length).toBeLessThanOrEqual(bound);
    }
  });

  test("sums its data as zlib does: CRC-32 and Adler-32", () => {
    const text = (value: string) => new TextEncoder().encode(value);
    expect(crc32(text("123456789"))).toBe(0xcbf43926);
    expect(adler32(text("Wikipedia"))).toBe(0x11e60398);
    const data = noise(5000, 1, 7);
    expect(crc32(data)).toBe(zlibCrc32(data));
  });

  test("takes no image of no pixels, and no pixels of another count", () => {
    for (const [width, height] of [
      [0, 1],
      [1, 0],
      [1.5, 2],
      [-1, 1],
      [Number.NaN, 1],
    ] as const) {
      expect(() => encodePNG(new Uint8Array(0), width, height), `${width} × ${height}`).toThrow(
        RangeError,
      );
    }
    expect(() => encodePNG(new Uint8Array(5), 2, 3)).toThrow(RangeError);
  });
});
