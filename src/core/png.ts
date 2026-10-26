/**
 * The PNG of a grey image, a byte to a pixel, row by row from the top (R25): own code, so that the
 * same pixels give the same bytes in every browser and in Node, as no browser's canvas promises
 * (R05). The file is the least PNG holds: its signature, the header, one chunk of data and the end,
 * no ancillary chunk, for a decoder may ignore them (PNG Third Edition, 11.3). The data is a zlib
 * stream of one deflate block with the fixed Huffman codes (RFC 1950, RFC 1951): every row
 * unfiltered, and a repeat looked for in two places only — the byte before, which takes the runs of
 * white, and the row above, which takes the rows a stroke runs straight down through.
 */
export function encodePNG(
  gray: Uint8Array,
  width: number,
  height: number,
): Uint8Array<ArrayBuffer> {
  for (const [name, side] of [
    ["width", width],
    ["height", height],
  ] as const) {
    if (!Number.isInteger(side) || side < 1 || side > MOST) {
      throw new RangeError(`the image's ${name} is ${side}, not a whole number from 1 to ${MOST}`);
    }
  }
  if (gray.length !== width * height) {
    throw new RangeError(`${gray.length} pixels are no image ${width} × ${height}`);
  }
  // Each row after its filter, 0: none.
  const stride = width + 1;
  const rows = new Uint8Array(stride * height);
  for (let row = 0; row < height; row++) {
    rows.set(gray.subarray(row * width, (row + 1) * width), row * stride + 1);
  }
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  // A depth of 8 bits, the colour type of grey, and the one method of compression, of filtering
  // and of no interlacing there is.
  header.set([8, 0, 0, 0, 0], 8);
  const stream = deflate(rows, stride);
  const zlib = new Uint8Array(2 + stream.length + 4);
  // The deflate method with a window of 32 KiB, and the fastest algorithm; FCHECK makes 0x7801 a
  // multiple of 31.
  zlib.set([0x78, 0x01], 0);
  zlib.set(stream, 2);
  new DataView(zlib.buffer).setUint32(2 + stream.length, adler32(rows));
  return joined([
    SIGNATURE,
    chunk("IHDR", header),
    chunk("IDAT", zlib),
    chunk("IEND", new Uint8Array(0)),
  ]);
}

/** The largest width or height PNG takes: 2^31 − 1. */
const MOST = 0x7fffffff;

const SIGNATURE = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** A chunk: the length of its data, its type, the data, and the CRC of the type and the data. */
function chunk(type: string, data: Uint8Array): Uint8Array {
  const bytes = new Uint8Array(12 + data.length);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, data.length);
  for (let k = 0; k < 4; k++) bytes[4 + k] = type.charCodeAt(k);
  bytes.set(data, 8);
  view.setUint32(8 + data.length, crc32(bytes.subarray(4, 8 + data.length)));
  return bytes;
}

function joined(parts: readonly Uint8Array[]): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    bytes.set(part, at);
    at += part.length;
  }
  return bytes;
}

/** The CRC of PNG and zlib's gzip: the polynomial 0xEDB88320, one byte at a time from a table. */
const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

export function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const byte of bytes) c = (CRC_TABLE[(c ^ byte) & 0xff] ?? 0) ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** zlib's checksum of the data before compression: two sums modulo 65521 (RFC 1950). */
export function adler32(bytes: Uint8Array): number {
  let s1 = 1;
  let s2 = 0;
  for (const byte of bytes) {
    s1 = (s1 + byte) % 65521;
    s2 = (s2 + s1) % 65521;
  }
  return (s2 * 65536 + s1) >>> 0;
}

/**
 * The lengths of a match, 3 to 258, by their codes from 257 up: each code's least length and its
 * extra bits (RFC 1951, 3.2.5). 258 has a code of its own, 285, with no extra bits: 284 with all
 * its extra bits set would also read 258, and decoders refuse it.
 */
const LENGTHS = [
  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131,
  163, 195, 227, 258,
];
const LENGTH_BITS = [
  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0,
];

/** The distances of a match, 1 to 32768, by their codes from 0: least distance and extra bits. */
const DISTANCES = [
  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049,
  3073, 4097, 6145, 8193, 12289, 16385, 24577,
];
const DISTANCE_BITS = [
  0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13,
];

/** The longest match deflate allows, and the farthest back. */
const LONGEST = 258;
const WINDOW = 32768;

/**
 * The fixed Huffman codes of the 288 literals and lengths (RFC 1951, 3.2.6), each with its count of
 * bits, its bits turned end to front: a Huffman code goes out from its most significant bit, and
 * everything else from its least, so a code turned round goes out as any other number.
 */
const LITERALS = Array.from({ length: 288 }, (_, value) => {
  if (value < 144) return reversed(0x30 + value, 8);
  if (value < 256) return reversed(0x190 + value - 144, 9);
  if (value < 280) return reversed(value - 256, 7);
  return reversed(0xc0 + value - 280, 8);
});

function reversed(code: number, bits: number): readonly [code: number, bits: number] {
  let turned = 0;
  for (let k = 0; k < bits; k++) turned |= ((code >>> k) & 1) << (bits - 1 - k);
  return [turned, bits];
}

/** The index of the last entry no greater than `value`, in an ascending list. */
function codeOf(bounds: readonly number[], value: number): number {
  let code = 0;
  while (code + 1 < bounds.length && (bounds[code + 1] ?? Number.POSITIVE_INFINITY) <= value) {
    code++;
  }
  return code;
}

/** Bits as deflate packs them: each byte from its least significant bit up (RFC 1951, 3.1.1). */
class Bits {
  #bytes = new Uint8Array(1024);
  #length = 0;
  #buffer = 0;
  #count = 0;

  /** `count` bits of `value`, from its least significant. */
  put(value: number, count: number): void {
    this.#buffer |= value << this.#count;
    this.#count += count;
    while (this.#count >= 8) {
      this.#byte(this.#buffer & 0xff);
      this.#buffer >>>= 8;
      this.#count -= 8;
    }
  }

  /** The bits so far, the last byte filled out with zeros. */
  done(): Uint8Array {
    if (this.#count > 0) this.#byte(this.#buffer & 0xff);
    this.#buffer = 0;
    this.#count = 0;
    return this.#bytes.slice(0, this.#length);
  }

  #byte(value: number): void {
    if (this.#length === this.#bytes.length) {
      const larger = new Uint8Array(this.#bytes.length * 2);
      larger.set(this.#bytes);
      this.#bytes = larger;
    }
    this.#bytes[this.#length++] = value;
  }
}

/** One final block of fixed Huffman codes. */
function deflate(data: Uint8Array, stride: number): Uint8Array {
  const bits = new Bits();
  // BFINAL, then BTYPE 01: the fixed codes.
  bits.put(1, 1);
  bits.put(1, 2);
  const literal = (value: number) => {
    const [code, count] = LITERALS[value] ?? [0, 0];
    bits.put(code, count);
  };
  let at = 0;
  while (at < data.length) {
    const [length, distance] = repeatAt(data, at, stride);
    if (length < 3) {
      literal(data[at] ?? 0);
      at++;
      continue;
    }
    const lengthCode = codeOf(LENGTHS, length);
    literal(257 + lengthCode);
    bits.put(length - (LENGTHS[lengthCode] ?? 0), LENGTH_BITS[lengthCode] ?? 0);
    const distanceCode = codeOf(DISTANCES, distance);
    // A distance code is five bits of a Huffman code: from its most significant bit.
    const [code] = reversed(distanceCode, 5);
    bits.put(code, 5);
    bits.put(distance - (DISTANCES[distanceCode] ?? 0), DISTANCE_BITS[distanceCode] ?? 0);
    at += length;
  }
  // The end of the block.
  literal(256);
  return bits.done();
}

/**
 * The longest repeat at `at` of the byte before or of the row above: its length and how far back it
 * starts. The byte before is tried first, and the row above only wins by being longer.
 */
function repeatAt(
  data: Uint8Array,
  at: number,
  stride: number,
): [length: number, distance: number] {
  let best = 0;
  let distance = 0;
  const most = Math.min(LONGEST, data.length - at);
  for (const back of [1, stride]) {
    if (back > at || back > WINDOW) continue;
    let length = 0;
    while (length < most && data[at + length] === data[at + length - back]) length++;
    if (length > best) {
      best = length;
      distance = back;
    }
  }
  return [best, distance];
}
