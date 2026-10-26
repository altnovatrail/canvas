import { expect, test } from "vitest";
import type { Stroke } from "./ink.js";
import { followsPressure, INK_WIDTH, outline } from "./outline.js";

// A level stroke from x 100 to 200 at y 100, of one pointer and one pressure all along.
function level(kind: string, pressure: number): Stroke {
  const points = [];
  for (let x = 100; x <= 200; x += 5) points.push({ x, y: 100, t: x, p: pressure });
  return { id: 1, kind, points };
}

/** The extent of an outline across and along a level stroke. */
function extent(polygon: readonly (readonly [number, number])[]) {
  const xs = polygon.map(([x]) => x);
  const ys = polygon.map(([, y]) => y);
  return {
    left: Math.min(...xs),
    right: Math.max(...xs),
    width: Math.max(...ys) - Math.min(...ys),
  };
}

test(`a mouse's and a finger's line is ${INK_WIDTH} units wide whatever the pressure`, () => {
  for (const kind of ["mouse", "touch"]) {
    for (const pressure of [0, 0.5, 1]) {
      expect(extent(outline(level(kind, pressure), true)).width).toBeCloseTo(INK_WIDTH, 5);
    }
  }
});

test("a pen's line widens with its pressure", () => {
  const light = extent(outline(level("pen", 0.2), true)).width;
  const firm = extent(outline(level("pen", 0.9), true)).width;
  expect(light).toBeCloseTo(INK_WIDTH * 0.7, 5);
  expect(firm).toBeCloseTo(INK_WIDTH * 1.4, 5);
});

test("only a pen's line follows its pressure", () => {
  expect(["pen", "mouse", "touch", ""].map((kind) => followsPressure(level(kind, 0.5)))).toEqual([
    true,
    false,
    false,
    false,
  ]);
});

test("a complete stroke reaches its last point, and its round end goes half the width beyond", () => {
  const { left, right } = extent(outline(level("mouse", 0.5), true));
  expect(left).toBeCloseTo(100 - INK_WIDTH / 2, 1);
  expect(right).toBeCloseTo(200 + INK_WIDTH / 2, 1);
});

test("a stroke of one point is a round dot as wide as the line, where the point is", () => {
  const dot = outline({ id: 1, kind: "mouse", points: [{ x: 300, y: 400, t: 0, p: 0.5 }] }, true);
  const xs = dot.map(([x]) => x);
  const ys = dot.map(([, y]) => y);
  for (const [x, y] of dot) expect(Math.hypot(x - 300, y - 400)).toBeCloseTo(INK_WIDTH / 2, 5);
  expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(INK_WIDTH, 1);
  expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(INK_WIDTH, 1);
});
