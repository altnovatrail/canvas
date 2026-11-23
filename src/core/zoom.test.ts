import { expect, test } from "vitest";
import { clampZoom, PageZoom, stepZoom, ZOOM_MAX, ZOOM_MIN } from "./zoom.js";

test("the buttons go from half the fit to twice it by quarters, and stop at both ends", () => {
  const zoom = new PageZoom();
  expect([zoom.value, zoom.larger, zoom.smaller]).toEqual([1, true, true]);
  const up: number[] = [];
  while (zoom.step(true)) up.push(zoom.value);
  expect(up).toEqual([1.25, 1.5, 1.75, 2]);
  expect([zoom.larger, zoom.smaller]).toEqual([false, true]);
  const down: number[] = [];
  while (zoom.step(false)) down.push(zoom.value);
  expect(down).toEqual([1.75, 1.5, 1.25, 1, 0.75, 0.5]);
  expect([zoom.larger, zoom.smaller]).toEqual([true, false]);
  expect(zoom.step(false)).toBe(false);
  expect(zoom.value).toBe(ZOOM_MIN);
});

test("a press after a pinch goes to the next quarter, and a hair off one counts as it", () => {
  expect(stepZoom(1.1, true)).toBe(1.25);
  expect(stepZoom(1.1, false)).toBe(1);
  expect(stepZoom(1.25 + 1e-9, true)).toBe(1.5);
  expect(stepZoom(1.25 - 1e-9, false)).toBe(1);
  expect(stepZoom(1.9, true)).toBe(ZOOM_MAX);
  expect(stepZoom(0.6, false)).toBe(ZOOM_MIN);
});

test("a pinch sets any zoom within the bounds, and nothing that is not a number", () => {
  const zoom = new PageZoom();
  expect(zoom.set(1.37)).toBe(true);
  expect(zoom.value).toBe(1.37);
  zoom.set(9);
  expect(zoom.value).toBe(ZOOM_MAX);
  zoom.set(0.1);
  expect(zoom.value).toBe(ZOOM_MIN);
  expect(clampZoom(Number.NaN)).toBe(1);
  expect(clampZoom(Number.POSITIVE_INFINITY)).toBe(1);
});

test("every watcher hears of a change, and none of one that goes nowhere or after it stops", () => {
  const zoom = new PageZoom();
  const heard: string[] = [];
  const one = zoom.watch(() => heard.push(`one ${zoom.value}`));
  zoom.watch(() => heard.push(`two ${zoom.value}`));
  zoom.step(true);
  zoom.set(1.25);
  one();
  zoom.step(true);
  expect(heard).toEqual(["one 1.25", "two 1.25", "two 1.5"]);
});
