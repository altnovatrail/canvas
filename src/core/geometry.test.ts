import { describe, expect, test } from "vitest";
import { boxOf, segmentBox, segmentDistance } from "./geometry.js";

const p = (x: number, y: number) => ({ x, y });

describe("segmentDistance", () => {
  test("is 0 for segments that cross or touch", () => {
    expect(segmentDistance(p(0, 0), p(10, 10), p(0, 10), p(10, 0))).toBe(0);
    // An end of one on the other.
    expect(segmentDistance(p(0, 0), p(10, 0), p(5, 0), p(5, 7))).toBe(0);
    // Ends that meet.
    expect(segmentDistance(p(0, 0), p(10, 0), p(10, 0), p(20, 5))).toBe(0);
  });

  test("of parallel segments is the gap between them", () => {
    expect(segmentDistance(p(0, 0), p(10, 0), p(2, 3), p(8, 3))).toBe(3);
  });

  test("of segments along one line is the gap between their ends, or 0 if they overlap", () => {
    expect(segmentDistance(p(0, 0), p(10, 0), p(14, 0), p(20, 0))).toBe(4);
    expect(segmentDistance(p(0, 0), p(10, 0), p(5, 0), p(20, 0))).toBe(0);
  });

  test("goes to the nearest point, an end or one between", () => {
    // From the end (12, 4) to the end (10, 0) of the other.
    expect(segmentDistance(p(0, 0), p(10, 0), p(12, 4), p(20, 4))).toBeCloseTo(
      Math.hypot(2, 4),
      12,
    );
    // From the end (5, 4) straight down to the middle of the other.
    expect(segmentDistance(p(0, 0), p(10, 0), p(5, 4), p(5, 9))).toBe(4);
  });

  test("takes a segment whose ends are one point as that point", () => {
    expect(segmentDistance(p(3, 4), p(3, 4), p(0, 0), p(0, 0))).toBe(5);
    expect(segmentDistance(p(5, 2), p(5, 2), p(0, 0), p(10, 0))).toBe(2);
    expect(segmentDistance(p(0, 0), p(10, 0), p(5, 0), p(5, 0))).toBe(0);
  });
});

test("boxOf is the box around the points, and segmentBox the box around a segment and its margin", () => {
  expect(boxOf([p(4, 9), p(1, 3), p(7, 5)])).toEqual({ minX: 1, minY: 3, maxX: 7, maxY: 9 });
  expect(segmentBox(p(10, 2), p(4, 8), 1)).toEqual({ minX: 3, minY: 1, maxX: 11, maxY: 9 });
});
