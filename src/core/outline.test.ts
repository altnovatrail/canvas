import { describe, expect, test } from "vitest";
import type { Stroke } from "./ink.js";
import {
  followsPressure,
  INK_REACH,
  INK_WIDTH,
  outline,
  PEN_THINNEST,
  PEN_WIDEST,
  penWidth,
  SPEED_FINEST,
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

describe("a stroke in a style", () => {
  const style = (pen: "pen" | "liner" | "marker", width: number) =>
    ({ pen, color: "#1c1c1e", width, opacity: 100 }) as const;
  /** A level stroke from x 100 to 200 at y 100 in a style, its points `every` ms apart. */
  function styled(
    kind: string,
    pressure: number,
    pen: "pen" | "liner" | "marker",
    width: number,
    every = 5,
  ) {
    const stroke = level(kind, pressure);
    const points = stroke.points.map((point, k) => ({ ...point, t: k * every }));
    return { ...stroke, points, style: style(pen, width) };
  }
  /** How wide an outline is across a level stroke where it passes x. */
  function widthAt(polygon: readonly (readonly [number, number])[], x: number): number {
    const ys = polygon.filter(([px]) => Math.abs(px - x) < 1.5).map(([, y]) => y);
    return Math.max(...ys) - Math.min(...ys);
  }

  test("of a liner or a marker is as wide as its width all along, whatever the pointer's pressure", () => {
    for (const kind of ["pen", "mouse"]) {
      for (const pressure of [0, 1]) {
        expect(extent(outline(styled(kind, pressure, "liner", 7), true)).width).toBeCloseTo(7, 5);
        expect(extent(outline(styled(kind, pressure, "marker", 28), true)).width).toBeCloseTo(
          28,
          5,
        );
      }
    }
    // A liner as wide as the line without a style draws a finger's very line.
    expect(outline(styled("mouse", 0.5, "liner", INK_WIDTH), true)).toEqual(
      outline(level("mouse", 0.5), true),
    );
  });

  test("of the kind pen with a pen's pressure is its width times the pen's curve, finer at its ends", () => {
    for (const pressure of [0.1, 1]) {
      const width = 4.5 * penWidth(pressure);
      const polygon = outline(styled("pen", pressure, "pen", 4.5), true);
      expect(extent(polygon).width).toBeCloseTo(width, 5);
      expect(widthAt(polygon, 150)).toBeCloseTo(width, 5);
      // Finer at its start and its end, by less than half at the very ends.
      for (const end of [102, 198]) expect(widthAt(polygon, end)).toBeLessThan(0.7 * width);
    }
    // Under way, its end is as wide as its pressure makes it: only a complete stroke ends finer.
    const live = outline(styled("pen", 1, "pen", 4.5), false);
    expect(widthAt(live, 197)).toBeGreaterThan(0.9 * 4.5 * PEN_WIDEST);
    // A dot and a dash of two points keep their width.
    const dot = outline(
      { ...styled("pen", 1, "pen", 4.5), points: [{ x: 300, y: 400, t: 0, p: 1 }] },
      true,
    );
    for (const [x, y] of dot) expect(Math.hypot(x - 300, y - 400)).toBeCloseTo(4.5, 5);
  });

  test("of the kind pen without a pen's pressure is wider slow and finer fast, by its points' times", () => {
    // Points 5 units apart: 100 ms apart is slow, 1 ms fast, past SPEED_FINEST.
    const slow = outline(styled("touch", 0.5, "pen", 3, 100), false);
    const fast = outline(styled("mouse", 0.5, "pen", 3, 1), false);
    expect(5 / 1).toBeGreaterThan(SPEED_FINEST);
    // Near its end the share has gone most of the way from 0.45 to 0.75 slow, and to 0.15 fast; the
    // library's outline lags a little behind the points.
    const near = (polygon: typeof slow, from: number, to: number) => {
      const width = widthAt(polygon, 190);
      expect(width).toBeGreaterThan(3 * penWidth(Math.min(from, to)));
      expect(width).toBeLessThanOrEqual(3 * penWidth(Math.max(from, to)) + 1e-9);
    };
    near(slow, 0.7, 0.75);
    near(fast, 0.15, 0.2);
    // Its first point starts from the middle of the range, whatever the pointer's pressure.
    const pressed = outline(styled("touch", 1, "pen", 3, 100), false);
    expect(pressed).toEqual(slow);
    // Points at one time change nothing of the width.
    const still = styled("touch", 0.5, "pen", 3, 0);
    expect(widthAt(outline(still, false), 190)).toBeCloseTo(3 * penWidth(0.45), 1);
    // The pressure the stroke keeps is the pointer's.
    expect(still.points.every(({ p }) => p === 0.5)).toBe(true);
  });
});
