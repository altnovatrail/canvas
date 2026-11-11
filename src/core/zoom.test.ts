import { expect, test } from "vitest";
import { PageZoom, ZOOMS } from "./zoom.js";

test("the zoom goes from the fit to twice it by quarters, and stops at both ends", () => {
  expect(ZOOMS).toEqual([1, 1.25, 1.5, 1.75, 2]);
  const zoom = new PageZoom();
  expect([zoom.value, zoom.larger, zoom.smaller]).toEqual([1, true, false]);
  expect(zoom.step(false)).toBe(false);
  const seen: number[] = [];
  for (const _ of ZOOMS.slice(1)) {
    expect(zoom.step(true)).toBe(true);
    seen.push(zoom.value);
  }
  expect(seen).toEqual([1.25, 1.5, 1.75, 2]);
  expect([zoom.larger, zoom.smaller]).toEqual([false, true]);
  expect(zoom.step(true)).toBe(false);
  expect(zoom.value).toBe(2);
  expect(zoom.step(false)).toBe(true);
  expect(zoom.value).toBe(1.75);
});

test("every watcher hears of a step, and none of a step that goes nowhere or after it stops", () => {
  const zoom = new PageZoom();
  const heard: string[] = [];
  const one = zoom.watch(() => heard.push(`one ${zoom.value}`));
  zoom.watch(() => heard.push(`two ${zoom.value}`));
  zoom.step(false);
  zoom.step(true);
  one();
  zoom.step(true);
  expect(heard).toEqual(["one 1.25", "two 1.25", "two 1.5"]);
});
