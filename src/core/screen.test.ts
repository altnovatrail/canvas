import { expect, test } from "vitest";
import { scaleFor, toScreen, toSheet } from "./screen.js";

test("the sheet fits the width of its area: 500 CSS pixels make k 0.5", () => {
  expect(scaleFor(500)).toBe(0.5);
});

test("a point goes from the screen to the sheet and back, the visible part scrolled down", () => {
  const view = { k: 0.5, vy: 200 };
  const onSheet = toSheet(view, 50, 30);
  expect(onSheet).toEqual({ x: 100, y: 260 });
  expect(toScreen(view, onSheet.x, onSheet.y)).toEqual({ x: 50, y: 30 });
});

test("a point beyond the sheet is clamped to its edge", () => {
  const view = { k: 0.5, vy: 1000 };
  expect(toSheet(view, -10, -600)).toEqual({ x: 0, y: 0 });
  expect(toSheet(view, 600, 300)).toEqual({ x: 1000, y: 1400 });
});
