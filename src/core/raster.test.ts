import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { type Crop, cropOf } from "./crop.js";
import { groupsOf } from "./groups.js";
import type { Stroke } from "./ink.js";
import { pictureOf, rasterOf } from "./raster.js";
import { CROP_SHEETS, dot, later, SHEETS, staircase, stroke, whole } from "./sheets.fixture.js";

// The pixels of the crop (R25) on the synthetic sheets: what is ink and what is white, measured
// against the strokes themselves, each pixel's distance to them found the long way round.

function cropAt(strokes: readonly Stroke[], digit = 32): Crop {
  const crop = cropOf(strokes, groupsOf(strokes), digit);
  if (crop === null) throw new Error("the sheet has no crop");
  return crop;
}

/** The segments of strokes on a crop, in its px: a stroke of one point, a segment of no length. */
function segmentsOf(strokes: readonly Stroke[], crop: Crop): [number, number, number, number][] {
  const [top, left] = crop.margins;
  const { box } = crop.exact;
  const spot = (x: number, y: number) => [
    ((Math.round(x * 10) - box.minX) * crop.scale) / 10 + left,
    ((Math.round(y * 10) - box.minY) * crop.scale) / 10 + top,
  ];
  return strokes.flatMap(({ points }) => {
    const spots = points.map(({ x, y }) => spot(x, y));
    const pairs =
      spots.length === 1 ? [[spots[0], spots[0]]] : spots.slice(1).map((b, k) => [spots[k], b]);
    return pairs.map(([a, b]) => [a?.[0] ?? 0, a?.[1] ?? 0, b?.[0] ?? 0, b?.[1] ?? 0]);
  });
}

/** Each pixel's distance from its centre to the nearest of the segments. */
function distances(segments: readonly number[][], crop: Crop): Float64Array {
  const near = new Float64Array(crop.width * crop.height).fill(Number.POSITIVE_INFINITY);
  for (const [ax = 0, ay = 0, bx = 0, by = 0] of segments) {
    const dx = bx - ax;
    const dy = by - ay;
    const length = dx * dx + dy * dy;
    for (let row = 0; row < crop.height; row++) {
      for (let column = 0; column < crop.width; column++) {
        const cx = column + 0.5;
        const cy = row + 0.5;
        const along =
          length === 0 ? 0 : Math.min(1, Math.max(0, ((cx - ax) * dx + (cy - ay) * dy) / length));
        const d = Math.hypot(cx - ax - along * dx, cy - ay - along * dy);
        const at = row * crop.width + column;
        if (d < (near[at] ?? 0)) near[at] = d;
      }
    }
  }
  return near;
}

const SMALL: readonly [() => { work: { strokes: readonly Stroke[] }; name: string }, number][] = [
  [later, 32],
  [later, 16],
  [staircase, 16],
  [dot, 24],
  [whole, 16],
];

describe("the pixels", () => {
  test("are white but for the ink: black within the line, white past its edge", () => {
    for (const [make, digit] of SMALL) {
      const { name, work } = make();
      const crop = cropAt(work.strokes, digit);
      const gray = rasterOf(work.strokes, crop);
      const near = distances(segmentsOf(work.strokes, crop), crop);
      const reach = crop.line / 2;
      let inked = 0;
      let wrong = 0;
      for (const [at, d] of near.entries()) {
        if (d >= reach + 0.5 + 1e-9 && gray[at] !== 255) wrong++;
        if (d <= reach - 0.5 - 1e-9 && gray[at] !== 0) wrong++;
        if ((gray[at] ?? 255) < 255) inked++;
      }
      expect(wrong, `${name} ${digit}`).toBe(0);
      expect(inked, name).toBeGreaterThan(0);
    }
  });

  test("hold nothing of what was erased", () => {
    // The staircase's 5 was erased and a 6 written where it was: what of the 5 lies clear of the
    // 6's ink, and of every other stroke's, is white.
    const { work } = staircase();
    const erased = new Set(
      work.history.flatMap((event) => (event.kind === "erase" ? event.ids : [])),
    );
    const gone = work.history.flatMap((event) =>
      event.kind === "write" && erased.has(event.stroke.id) ? [event.stroke] : [],
    );
    expect(gone.length).toBeGreaterThan(0);
    const crop = cropAt(work.strokes, 32);
    const gray = rasterOf(work.strokes, crop);
    const visible = distances(segmentsOf(work.strokes, crop), crop);
    const under = distances(segmentsOf(gone, crop), crop);
    const reach = crop.line / 2;
    let clear = 0;
    let inked = 0;
    for (const [at, distance] of under.entries()) {
      if (distance <= reach && (visible[at] ?? 0) >= reach + 0.5 + 1e-9) {
        clear++;
        if (gray[at] !== 255) inked++;
      }
    }
    expect(clear).toBeGreaterThan(20);
    expect(inked).toBe(0);
  });

  test("draw the line D′ / 12 px wide, 1 px at least, whatever the stroke", () => {
    // A level line: across it, the ink adds up to the line's width.
    for (const digit of [8, 16, 24, 32, 48]) {
      const strokes = [stroke(1, [100, 100, 0], [300, 100, 200])];
      const crop = cropAt(strokes, digit);
      const gray = rasterOf(strokes, crop);
      const column = Math.floor(crop.width / 2);
      let ink = 0;
      for (let row = 0; row < crop.height; row++)
        ink += 1 - (gray[row * crop.width + column] ?? 255) / 255;
      expect(crop.line).toBe(Math.max(digit, 12) / 12);
      expect(ink, `${digit} px`).toBeCloseTo(crop.line, 1);
    }
  });

  test("of each group lie within its frame, every pixel its ink shades", () => {
    for (const make of [...SHEETS, ...CROP_SHEETS]) {
      const { name, work } = make();
      const groups = groupsOf(work.strokes);
      for (const digit of [16, 32, 48]) {
        const crop = cropAt(work.strokes, digit);
        let outside = 0;
        for (const [n, { box }] of crop.frames.entries()) {
          const ids = new Set(groups[n]?.ids);
          const gray = rasterOf(
            work.strokes.filter(({ id }) => ids.has(id)),
            crop,
          );
          const [y0, x0, y1, x1] = box;
          for (const [at, value] of gray.entries()) {
            if (value === 255) continue;
            const row = Math.floor(at / crop.width);
            const column = at % crop.width;
            // The whole pixel, from its left and top edges to its right and bottom ones.
            if (
              column < (x0 * crop.width) / 1000 ||
              column + 1 > (x1 * crop.width) / 1000 ||
              row < (y0 * crop.height) / 1000 ||
              row + 1 > (y1 * crop.height) / 1000
            ) {
              outside++;
            }
          }
        }
        expect(outside, `${name} at ${digit} px`).toBe(0);
      }
    }
  });

  test("put the ink of a line of digits D′ and a line high, give or take a pixel", () => {
    // «12 + 5 =» and «17»: one line of digits 36 high, so 36 units are D′ px.
    const { work } = later();
    for (const digit of [16, 24, 32, 48]) {
      const crop = cropAt(work.strokes, digit);
      const gray = rasterOf(work.strokes, crop);
      const rows = Array.from({ length: crop.height }, (_, row) =>
        gray.subarray(row * crop.width, (row + 1) * crop.width).some((value) => value < 128),
      );
      const inked = rows.lastIndexOf(true) - rows.indexOf(true) + 1;
      expect(Math.abs(inked - (crop.drawn + crop.line)), `${digit} px`).toBeLessThanOrEqual(1);
    }
  });

  test("leave the margin white, but for the line's half and its edge", () => {
    for (const make of [...SHEETS, ...CROP_SHEETS]) {
      const { name, work } = make();
      for (const digit of [16, 32, 48]) {
        const crop = cropAt(work.strokes, digit);
        const gray = rasterOf(work.strokes, crop);
        const [top, left] = crop.margins;
        const { box } = crop.exact;
        const right =
          crop.width - left - Math.ceil(((box.maxX - box.minX) * crop.drawn) / crop.exact.median);
        const bottom =
          crop.height - top - Math.ceil(((box.maxY - box.minY) * crop.drawn) / crop.exact.median);
        const clear = Math.ceil(crop.line / 2 + 0.5);
        let inked = 0;
        for (let row = 0; row < crop.height; row++) {
          for (let column = 0; column < crop.width; column++) {
            const outside =
              row < top - clear ||
              column < left - clear ||
              row >= crop.height - bottom + clear ||
              column >= crop.width - right + clear;
            if (outside && gray[row * crop.width + column] !== 255) inked++;
          }
        }
        expect(inked, `${name} ${digit}`).toBe(0);
      }
    }
  });

  test("are the same bytes for the same strokes, in any order, each drawn either way", () => {
    for (const make of [staircase, whole]) {
      const strokes = make().work.strokes;
      const crop = cropAt(strokes, 32);
      const moved = [...strokes]
        .reverse()
        .map((each) => ({ ...each, id: each.id + 500, points: [...each.points].reverse() }));
      const same = (a: Uint8Array, b: Uint8Array) => Buffer.from(a).equals(Buffer.from(b));
      expect(same(rasterOf(moved, crop), rasterOf(strokes, crop))).toBe(true);
      expect(same(pictureOf(moved, crop), pictureOf(strokes, crop))).toBe(true);
      expect(same(pictureOf(strokes, crop), pictureOf(strokes, crop))).toBe(true);
    }
  });
});

test("the crop's code uses only what ECMAScript rounds alike in every engine", () => {
  // Math.sqrt, the four operations and the rounding of Math.round, floor and ceil are exact, but
  // ** and Math.pow, hypot and the trigonometry are left to each engine, and a Uint8ClampedArray
  // rounds half to even.
  const loose =
    /\*\*|Math\.(?:pow|hypot|exp|expm1|log|log1p|log2|log10|sin|cos|tan|asin|acos|atan|atan2|sinh|cosh|tanh|asinh|acosh|atanh|cbrt|fround)\b|Uint8ClampedArray/;
  for (const file of ["crop.ts", "raster.ts", "png.ts"]) {
    const code = readFileSync(new URL(file, import.meta.url), "utf8")
      .split("\n")
      .filter((text) => !/^\s*(?:\/\/|\/?\*)/.test(text))
      .join("\n");
    expect(code, file).not.toMatch(loose);
  }
});
