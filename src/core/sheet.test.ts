import { expect, test } from "vitest";
import { SHEET } from "./index.js";
import { extentOf, PICTURE_BYTES, pictureOf, REACH } from "./sheet.js";

test("the sheet is 1000 × 1400 logical units, and nothing changes it", () => {
  expect(SHEET).toEqual({ width: 1000, height: 1400 });
  expect(Object.isFrozen(SHEET)).toBe(true);
});

test("the sheet goes on past the page by one view, and past the ink by one view, within its reach", () => {
  const room = { width: 400, height: 600 };
  expect(extentOf(undefined, room)).toEqual({ width: 1400, height: 2000 });
  // Ink within the page leaves the sheet as it is.
  expect(extentOf({ maxX: 900, maxY: 100 }, room)).toEqual({ width: 1400, height: 2000 });
  expect(extentOf({ maxX: 2000.4, maxY: 1500 }, room)).toEqual({ width: 2401, height: 2100 });
  expect(extentOf({ maxX: 9900, maxY: 13900 }, room)).toEqual(REACH);
  expect(REACH).toEqual({ width: 10000, height: 14000 });
});

test("the picture of a work is the page at a pixel a unit, the ink past it too, and scaled down past the page's bytes, to the reach (R83)", () => {
  expect(pictureOf(undefined)).toEqual({ ...SHEET, scale: 1 });
  expect(pictureOf({ maxX: 400, maxY: 900 })).toEqual({ ...SHEET, scale: 1 });
  for (const ink of [
    { maxX: 1500, maxY: 200 },
    { maxX: 300, maxY: 3000 },
    { maxX: REACH.width, maxY: REACH.height },
    { maxX: SHEET.width, maxY: REACH.height },
    { maxX: REACH.width, maxY: SHEET.height },
  ]) {
    const picture = pictureOf(ink);
    expect((picture.width + 1) * picture.height).toBeLessThanOrEqual(PICTURE_BYTES);
    expect(picture.scale).toBeLessThan(1);
    // The ink's extent fills it, but for the floor of a pixel.
    const extent = extentOf(ink, { width: 0, height: 0 });
    expect(Math.abs(picture.width - extent.width * picture.scale)).toBeLessThan(1);
    expect(Math.abs(picture.height - extent.height * picture.scale)).toBeLessThan(1);
    // Not a pixel short: one more row would be past the bound.
    expect((picture.width + 2) * (picture.height + 1)).toBeGreaterThan(PICTURE_BYTES);
  }
});
