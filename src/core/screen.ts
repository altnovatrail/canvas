import { SHEET } from "./sheet.js";

/**
 * Where the sheet is on the screen, one view for every layer (R06; architecture 3.2 in
 * docs/architecture.md): `k` CSS pixels to a logical unit, for the sheet fits the width of its
 * area, and `vy`, the top of the sheet's visible part, in units.
 */
export interface View {
  readonly k: number;
  readonly vy: number;
}

/** A point, on the sheet in logical units or on the screen in CSS pixels. */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/** `k` for a sheet that fits an area `width` CSS pixels wide: k = A / W. */
export function scaleFor(width: number): number {
  return width / SHEET.width;
}

/**
 * The point of the sheet under a point of the screen, given in CSS pixels from the top left corner
 * of the sheet's visible part. A point beyond the sheet is clamped to its edge, as in spec 4.2 of
 * canvas-api: a pointer captured by the sheet goes on writing on its edge.
 */
export function toSheet(view: View, x: number, y: number): Point {
  return {
    x: clamp(x / view.k, 0, SHEET.width),
    y: clamp(y / view.k + view.vy, 0, SHEET.height),
  };
}

/** The point of the screen over a point of the sheet, from the top left corner of its visible part. */
export function toScreen(view: View, x: number, y: number): Point {
  return { x: x * view.k, y: (y - view.vy) * view.k };
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}
