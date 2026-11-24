import { describe, expect, test } from "vitest";
import { Cut, cutOf } from "./cut.js";
import type { InkPoint, Stroke } from "./ink.js";

/** A level line at y 10 through these places across, a point at each, its time its x. */
function line(...xs: number[]): Stroke {
  return { id: 1, kind: "touch", points: xs.map((x) => ({ x, y: 10, t: x, p: 0.5 })) };
}

/** Where the points of each piece lie across, to a thousandth. */
const across = (pieces: readonly (readonly InkPoint[])[] | null) =>
  pieces?.map((piece) => piece.map(({ x }) => Math.round(x * 1000) / 1000)) ?? null;

describe("an eraser that takes a part", () => {
  test("crossing a stroke in the middle leaves two pieces, each with a point of its own at the edge", () => {
    const stroke = line(0, 10, 20, 30, 40);
    const pieces = cutOf(stroke, [{ x: 20, y: 10 }], 5);
    expect(across(pieces)).toEqual([
      [0, 10, 15],
      [25, 30, 40],
    ]);
    // The stroke's own points are the very ones; the points at the edge are new.
    expect(pieces?.[0]?.[1]).toBe(stroke.points[1]);
    expect(pieces?.[1]?.[0]).not.toBe(stroke.points[2]);
    // Down across it, the path's strip covers the same.
    const down = cutOf(
      stroke,
      [
        { x: 20, y: 0 },
        { x: 20, y: 30 },
      ],
      5,
    );
    expect(across(down)).toEqual(across(pieces));
  });

  test("gives its points of its own the time and the pressure between those of their segment", () => {
    const stroke: Stroke = {
      id: 1,
      kind: "pen",
      points: [
        { x: 0, y: 10, t: 100, p: 0.2 },
        { x: 40, y: 10, t: 140, p: 0.6 },
      ],
    };
    // One segment crossed between its two points: each piece is a point of the stroke's and one
    // of its own.
    const pieces = cutOf(stroke, [{ x: 20, y: 10 }], 10);
    expect(pieces).toHaveLength(2);
    const [first, second] = pieces ?? [];
    expect(first?.[0]).toBe(stroke.points[0]);
    expect(first?.[1]?.x).toBe(10);
    expect(first?.[1]?.t).toBeCloseTo(110, 10);
    expect(first?.[1]?.p).toBeCloseTo(0.3, 10);
    expect(second?.[0]?.t).toBeCloseTo(130, 10);
    expect(second?.[0]?.p).toBeCloseTo(0.5, 10);
    expect(second?.[1]).toBe(stroke.points[1]);
  });

  test("at an end of a stroke leaves one piece, and over all of it none", () => {
    const stroke = line(0, 10, 20, 30, 40);
    expect(across(cutOf(stroke, [{ x: 0, y: 10 }], 5))).toEqual([[5, 10, 20, 30, 40]]);
    // Off the line by 2, the disk reaches √(5² − 2²) along it.
    expect(across(cutOf(stroke, [{ x: 40, y: 12 }], 5))).toEqual([[0, 10, 20, 30, 35.417]]);
    expect(
      cutOf(
        stroke,
        [
          { x: 0, y: 10 },
          { x: 40, y: 10 },
        ],
        1,
      ),
    ).toEqual([]);
  });

  test("covers exactly the path's line, the disks at its ends and the strip between them", () => {
    // Along the line, 2 units above it, 3 units wide: the strip from 5 to 35 and the disks past it,
    // to √(3² − 2²) beyond each end.
    const stroke = line(0, 10, 20, 30, 40);
    const pieces = cutOf(
      stroke,
      [
        { x: 5, y: 12 },
        { x: 35, y: 12 },
      ],
      3,
    );
    const reach = Math.sqrt(5);
    expect(pieces?.map((piece) => piece.map(({ x }) => x))).toEqual([
      [0, expect.closeTo(5 - reach, 10)],
      [expect.closeTo(35 + reach, 10), 40],
    ]);
    // Where a path turns, its segments' capsules join: an L across two segments of the stroke.
    const turned = cutOf(
      stroke,
      [
        { x: 12, y: 0 },
        { x: 12, y: 10 },
        { x: 28, y: 10 },
      ],
      1,
    );
    expect(across(turned)).toEqual([
      [0, 10, 11],
      [29, 30, 40],
    ]);
  });

  test("that does not cross a stroke, or only touches its edge, leaves it whole: no cut", () => {
    const stroke = line(0, 10, 20, 30, 40);
    expect(cutOf(stroke, [{ x: 20, y: 30 }], 5)).toBeNull();
    expect(
      cutOf(
        stroke,
        [
          { x: 500, y: 500 },
          { x: 600, y: 600 },
        ],
        5,
      ),
    ).toBeNull();
    // A disk whose edge touches the line at one point covers nothing of it.
    expect(cutOf(stroke, [{ x: 20, y: 15 }], 5)).toBeNull();
    expect(cutOf(stroke, [], 5)).toBeNull();
  });

  test("takes a stroke of one point, or of points in one place, whole or not at all", () => {
    const dot = line(20);
    expect(cutOf(dot, [{ x: 24, y: 13 }], 5)).toEqual([]);
    expect(cutOf(dot, [{ x: 24, y: 14 }], 5)).toBeNull();
    // The path passes it by: the segment between two places comes near it.
    expect(
      cutOf(
        dot,
        [
          { x: 0, y: 14 },
          { x: 40, y: 14 },
        ],
        5,
      ),
    ).toEqual([]);
    expect(cutOf(line(20, 20), [{ x: 20, y: 10 }], 1)).toEqual([]);
  });

  test("leaves no piece shorter than the recorder's least step", () => {
    const stroke = line(0, 10, 20, 30, 40);
    // Along from 10 on, its radius leaves the stroke's first 0.04 units, and then 0.2.
    expect(
      cutOf(
        stroke,
        [
          { x: 10, y: 10 },
          { x: 40, y: 10 },
        ],
        9.96,
      ),
    ).toEqual([]);
    expect(
      across(
        cutOf(
          stroke,
          [
            { x: 10, y: 10 },
            { x: 40, y: 10 },
          ],
          9.8,
        ),
      ),
    ).toEqual([[0, 0.2]]);
  });

  test("cuts a piece again as any stroke, its points of its own among its points", () => {
    const [piece] = cutOf(line(0, 10, 20, 30, 40), [{ x: 40, y: 10 }], 5) ?? [];
    if (piece === undefined) throw new Error("no piece");
    const again = cutOf({ ...line(), id: 2, points: piece }, [{ x: 35, y: 10 }], 2);
    expect(across(again)).toEqual([[0, 10, 20, 30, 33]]);
  });

  test("takes the path a segment at a time, and gives the pieces so far whenever asked", () => {
    const stroke = line(0, 10, 20, 30, 40);
    const cut = new Cut(stroke, 2);
    expect(cut.pieces()).toBeNull();
    expect(cut.add({ x: 10, y: 0 }, { x: 10, y: 0 })).toBe(false);
    expect(cut.add({ x: 10, y: 0 }, { x: 10, y: 20 })).toBe(true);
    expect(across(cut.pieces())).toEqual([
      [0, 8],
      [12, 20, 30, 40],
    ]);
    // The same way again covers nothing more; a way on covers more: slant down to the line, its
    // strip reaching it from 30 − 2√5 and its disk at the end to 32.
    expect(cut.add({ x: 10, y: 20 }, { x: 10, y: 0 })).toBe(false);
    expect(cut.add({ x: 10, y: 0 }, { x: 30, y: 10 })).toBe(true);
    expect(across(cut.pieces())).toEqual([
      [0, 8],
      [12, 20, 25.528],
      [32, 40],
    ]);
    expect(cut.add({ x: 20, y: 10 }, { x: 30, y: 10 })).toBe(true);
    expect(across(cut.pieces())).toEqual([
      [0, 8],
      [12, 18],
      [32, 40],
    ]);
    expect(cut.add({ x: 30, y: 10 }, { x: 40, y: 10 })).toBe(true);
    expect(across(cut.pieces())).toEqual([
      [0, 8],
      [12, 18],
    ]);
    // A stroke of no length is covered once.
    const dot = new Cut(line(20), 1);
    expect(dot.add({ x: 20, y: 10 }, { x: 20, y: 10 })).toBe(true);
    expect(dot.add({ x: 20, y: 10 }, { x: 20, y: 10 })).toBe(false);
  });

  test("takes a stroke with points and a radius from 0", () => {
    expect(() => new Cut({ ...line(), points: [] }, 1)).toThrow(TypeError);
    for (const radius of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => new Cut(line(0, 10), radius)).toThrow(RangeError);
    }
  });

  test("keeps its points of its own between their segment's ends, whatever the rounding", () => {
    const stroke: Stroke = {
      id: 1,
      kind: "touch",
      points: [
        { x: 0.1, y: 0.3, t: 0.7, p: 0.1 },
        { x: 9999.9, y: 13999.7, t: 1e6, p: 1 },
      ],
    };
    for (const piece of cutOf(stroke, [{ x: 5000, y: 7000 }], 333.3) ?? []) {
      for (const { x, y, t, p } of piece) {
        expect(x >= 0.1 && x <= 9999.9 && y >= 0.3 && y <= 13999.7).toBe(true);
        expect(t >= 0.7 && t <= 1e6 && p >= 0.1 && p <= 1).toBe(true);
      }
    }
  });
});
