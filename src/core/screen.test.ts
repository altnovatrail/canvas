import { expect, test } from "vitest";
import { fitScale, K_MAX, scaleFor, toScreen, toSheet } from "./screen.js";

test("the sheet fits the width of its area: 500 CSS pixels make k 0.5", () => {
  expect(scaleFor(500)).toBe(0.5);
  expect(fitScale(400)).toBe(0.4);
});

test("the layout's k stops at a pixel to a unit, and k on the screen follows the sheet's own width", () => {
  expect(K_MAX).toBe(1);
  expect(fitScale(1000)).toBe(1);
  expect(fitScale(1400)).toBe(1);
  // A sheet laid out 1000 pixels wide, scaled by the page to 1500 on the screen.
  expect(scaleFor(1500)).toBe(1.5);
});

test("a sheet past the page takes k from its own width in units: the page keeps its fit", () => {
  // A sheet 3000 units wide, laid out 1500 pixels wide, as the page at 500 pixels.
  expect(scaleFor(1500, 3000)).toBe(0.5);
  expect(fitScale(500)).toBe(0.5);
});

test("a point goes from the screen to the sheet and back, the visible part scrolled down", () => {
  const view = { k: 0.5, vx: 0, vy: 200 };
  const onSheet = toSheet(view, 50, 30);
  expect(onSheet).toEqual({ x: 100, y: 260 });
  expect(toScreen(view, onSheet.x, onSheet.y)).toEqual({ x: 50, y: 30 });
});

test("a point goes from the screen to the sheet and back, the visible part scrolled across too", () => {
  const view = { k: 2, vx: 300, vy: 100 };
  const onSheet = toSheet(view, 50, 30);
  expect(onSheet).toEqual({ x: 325, y: 115 });
  expect(toScreen(view, onSheet.x, onSheet.y)).toEqual({ x: 50, y: 30 });
});

test("a point beyond the sheet's reach is clamped to its edge", () => {
  const view = { k: 0.5, vx: 0, vy: 1000 };
  expect(toSheet(view, -10, -600)).toEqual({ x: 0, y: 0 });
  // Past the page the sheet goes on, as far as its reach.
  expect(toSheet(view, 600, 300)).toEqual({ x: 1200, y: 1600 });
  expect(toSheet(view, 6000, 7000)).toEqual({ x: 10000, y: 14000 });
});
