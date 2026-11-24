import { expect, test } from "vitest";
import type { Stroke } from "./ink.js";
import {
  followsPressure,
  INK_REACH,
  INK_WIDTH,
  outline,
  PEN_THINNEST,
  PEN_WIDEST,
  penWidth,
} from "./outline.js";

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

test("a pen's line goes from half a finger's at no pressure to twice it at full, by the pressure to the power 0.8", () => {
  expect([PEN_THINNEST, PEN_WIDEST]).toEqual([0.5, 2]);
  for (const pressure of [0, 0.02, 0.09, 0.2, 0.5, 1]) {
    const width = 0.5 + 1.5 * pressure ** 0.8;
    expect(penWidth(pressure)).toBeCloseTo(width, 10);
    expect(extent(outline(level("pen", pressure), true)).width).toBeCloseTo(INK_WIDTH * width, 5);
  }
  // A pressure past 0–1, as a script may give, is the nearer end.
  expect([penWidth(-1), penWidth(2)]).toEqual([PEN_THINNEST, PEN_WIDEST]);
  // The more pressure, the wider, and Apple Pencil's ordinary writing, about 0.1, is wider than a
  // straight line from the thinnest to the widest would make it.
  for (let pressure = 0; pressure < 1; pressure += 0.01) {
    expect(penWidth(pressure + 0.01)).toBeGreaterThan(penWidth(pressure));
  }
  expect(penWidth(0.1)).toBeGreaterThan(PEN_THINNEST + (PEN_WIDEST - PEN_THINNEST) * 0.1);
});

test("the ink of a pen at full pressure reaches no farther from the points than INK_REACH, half the widest line", () => {
  expect(INK_REACH).toBe((INK_WIDTH * PEN_WIDEST) / 2);
  const firm = outline(level("pen", 1), true);
  expect(extent(firm).width).toBeCloseTo(2 * INK_REACH, 5);
  for (const [x, y] of firm) {
    const nearest = Math.hypot(Math.max(100 - x, 0, x - 200), y - 100);
    expect(nearest).toBeLessThanOrEqual(INK_REACH + 1e-9);
  }
});

test("a pen's pressure is eased from point to point: a spike of one point widens the line by less than its own width", () => {
  const stroke = level("pen", 0);
  const spiked = {
    ...stroke,
    points: stroke.points.map((point) => (point.x === 150 ? { ...point, p: 1 } : point)),
  };
  const width = extent(outline(spiked, true)).width;
  // The spike's point keeps 0.65 of its pressure, and the next one 0.65 of the drop.
  expect(width).toBeCloseTo(INK_WIDTH * penWidth(0.65), 1);
  expect(width).toBeLessThan(INK_WIDTH * PEN_WIDEST);
});

test("a pen's stroke of two points is as wide as their pressure, not the library's 0.5", () => {
  const dash: Stroke = {
    id: 1,
    kind: "pen",
    points: [
      { x: 100, y: 100, t: 0, p: 0.1 },
      { x: 130, y: 100, t: 10, p: 0.1 },
    ],
  };
  expect(extent(outline(dash, true)).width).toBeCloseTo(INK_WIDTH * penWidth(0.1), 5);
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

test("a pen's dot is as wide as its pressure makes the line", () => {
  const dot = outline({ id: 1, kind: "pen", points: [{ x: 300, y: 400, t: 0, p: 0.2 }] }, true);
  for (const [x, y] of dot) {
    expect(Math.hypot(x - 300, y - 400)).toBeCloseTo((INK_WIDTH * penWidth(0.2)) / 2, 5);
  }
});

test("a stroke of one point is a round dot as wide as the line, where the point is", () => {
  const dot = outline({ id: 1, kind: "mouse", points: [{ x: 300, y: 400, t: 0, p: 0.5 }] }, true);
  const xs = dot.map(([x]) => x);
  const ys = dot.map(([, y]) => y);
  for (const [x, y] of dot) expect(Math.hypot(x - 300, y - 400)).toBeCloseTo(INK_WIDTH / 2, 5);
  expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(INK_WIDTH, 1);
  expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(INK_WIDTH, 1);
});
