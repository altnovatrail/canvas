import { describe, expect, test } from "vitest";
import { budget } from "../core/budget.fixture.js";
import { CROP, type Crop, cropOf } from "../core/crop.js";
import { boxOf, tenths } from "../core/geometry.js";
import { groupsOf } from "../core/groups.js";
import type { Stroke } from "../core/ink.js";
import { rasterOf } from "../core/raster.js";
import type { Point } from "../core/screen.js";
import { CROP_SHEETS, SHEETS } from "../core/sheets.fixture.js";
import { byPlace, canonical, finalPoints, resampled, STEP } from "./resample.js";

// The sheets are the synthetic ones of the crop's tests, drawn by code: no hand wrote them
// (CLAUDE.md).

const at = (x: number, y: number): Point => ({ x, y });

describe("the canonical direction", () => {
  test("starts at the end that is higher, and of two as high at the one further left", () => {
    expect(canonical([at(10, 50), at(10, 20)])).toEqual([at(10, 20), at(10, 50)]);
    expect(canonical([at(10, 20), at(10, 50)])).toEqual([at(10, 20), at(10, 50)]);
    expect(canonical([at(60, 20), at(10, 20)])).toEqual([at(10, 20), at(60, 20)]);
  });

  test("goes the way of its smaller second point on a closed stroke, and keeps a dot", () => {
    const ring = [at(10, 10), at(20, 30), at(0, 30), at(10, 10)];
    expect(canonical(ring)).toEqual([at(10, 10), at(0, 30), at(20, 30), at(10, 10)]);
    expect(canonical([at(5, 5)])).toEqual([at(5, 5)]);
  });

  test("compares places in whole tenths: a hundredth apart is one place", () => {
    const points = [at(10.04, 20), at(10, 20)];
    expect(canonical(points)).toEqual(points);
  });
});

describe("the points along a stroke", () => {
  test("keep its ends and its box, and lie no more than a step apart along it, to a tenth", () => {
    const zigzag = [at(0, 0), at(3.3, 7.77), at(5, 1), at(9.95, 12.04), at(11, 6)];
    const points = resampled(zigzag, 0.5);
    expect(points[0]).toEqual(at(0, 0));
    expect(points.at(-1)).toEqual(at(11, 6));
    const box = (list: readonly Point[]) => {
      const { minX, minY, maxX, maxY } = boxOf(list);
      return [tenths(minX), tenths(minY), tenths(maxX), tenths(maxY)];
    };
    expect(box(points)).toEqual(box(zigzag));
    for (const { x, y } of points) {
      expect(tenths(x) / 10).toBe(x);
      expect(tenths(y) / 10).toBe(y);
    }
    for (let k = 1; k < points.length; k++) {
      const [a, b] = [points[k - 1] as Point, points[k] as Point];
      expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeLessThanOrEqual(0.5 + 0.15);
    }
  });

  test("of a straight line are every step, the same whichever way it was written", () => {
    const points = resampled([at(0, 0), at(2, 0)], 0.5);
    expect(points).toEqual([at(0, 0), at(0.5, 0), at(1, 0), at(1.5, 0), at(2, 0)]);
    // Dense points as they came give the same: the points are of the length, not of the pointer.
    const dense = Array.from({ length: 21 }, (_, n) => at(n / 10, 0));
    expect(resampled(dense, 0.5)).toEqual(points);
  });

  test("of a dot are the dot, and of no points or no step an error", () => {
    expect(resampled([at(4, 4), at(4, 4)])).toEqual([at(4, 4)]);
    expect(() => resampled([])).toThrow(TypeError);
    expect(() => resampled([at(0, 0)], 0)).toThrow(RangeError);
  });
});

test("a stroke's final points are the same whichever way it was written, and in their canonical direction", () => {
  const loop = [at(10, 10), at(13.3, 20.07), at(4.4, 26.1), at(1, 14.9), at(10, 10)];
  const points = finalPoints(loop);
  expect(finalPoints([...loop].reverse())).toEqual(points);
  expect(canonical(points)).toEqual(points);
  const hook = [at(30, 40), at(31.7, 12.2), at(22, 5)];
  expect(finalPoints([...hook].reverse())).toEqual(finalPoints(hook));
  expect(finalPoints(hook)[0]).toEqual(at(22, 5));
});

test("strokes go by place: the top of their box, its left, bottom and right, their points, then their ID", () => {
  const stroke = (id: number, ...points: Point[]) => ({ id, points, box: tenthsBox(points) });
  const strokes = [
    stroke(1, at(50, 10), at(60, 20)),
    stroke(2, at(10, 10), at(20, 20)),
    stroke(3, at(10, 5), at(20, 30)),
    stroke(4, at(10, 10), at(20, 20)),
    stroke(5, at(20, 10), at(10, 20)),
  ];
  expect([...strokes].sort(byPlace).map(({ id }) => id)).toEqual([3, 2, 4, 5, 1]);
});

/** A box of points in whole tenths, as the crop takes one. */
function tenthsBox(points: readonly Point[]) {
  const { minX, minY, maxX, maxY } = boxOf(points);
  return { minX: tenths(minX), minY: tenths(minY), maxX: tenths(maxX), maxY: tenths(maxY) };
}

/** The strokes as a sample of the final geometry keeps them, at a step. */
function along(strokes: readonly Stroke[], step: number): Stroke[] {
  return strokes.map((stroke) => ({
    ...stroke,
    points: finalPoints(stroke.points, step).map(({ x, y }) => ({ x, y, t: 0, p: 0 })),
  }));
}

/** The strokes as a sample of the history keeps them: to a tenth. */
function rounded(strokes: readonly Stroke[]): Stroke[] {
  return strokes.map((stroke) => ({
    ...stroke,
    points: stroke.points.map((p) => ({ ...p, x: tenths(p.x) / 10, y: tenths(p.y) / 10 })),
  }));
}

/** The numbers of a crop, its pixels aside. */
function numbersOf({
  digit,
  drawn,
  width,
  height,
  margins,
  scale,
  line,
  sheetBox,
  frames,
  exact,
}: Crop) {
  return { digit, drawn, width, height, margins, scale, line, sheetBox, frames, exact };
}

/** The most a pixel of the crops of the sheets moves at a step, of 255; the numbers stay the same. */
function moved(step: number): number {
  let most = 0;
  for (const make of [...SHEETS, ...CROP_SHEETS]) {
    const strokes = rounded(make().work.strokes);
    const groups = groupsOf(strokes);
    const resampledStrokes = along(strokes, step);
    for (const height of CROP.heights) {
      const crop = cropOf(strokes, groups, height);
      const again = cropOf(resampledStrokes, groups, height);
      if (crop === null || again === null) throw new Error("a sheet with no crop");
      expect(numbersOf(again)).toEqual(numbersOf(crop));
      const [a, b] = [rasterOf(strokes, crop), rasterOf(resampledStrokes, crop)];
      for (let k = 0; k < a.length; k++) most = Math.max(most, Math.abs((a[k] ?? 0) - (b[k] ?? 0)));
    }
  }
  return most;
}

test("the step is the largest of 0.25, 0.5 and 1 units at which no pixel of a crop moves by more than a quarter of the grey scale, and the crops' numbers stay the same", {
  timeout: budget(3_206),
}, () => {
  const quarter = 255 / 4;
  const steps = [0.25, 0.5, 1].filter((step) => moved(step) <= quarter);
  expect(steps.at(-1)).toBe(STEP);
});
