import { REACH, SHEET } from "./sheet.js";

/**
 * Where the sheet is on the screen, one view for every layer (R06): `k` CSS pixels to a logical
 * unit, for the page fits the width of its area, and `vx` and `vy`, the left and the top of the
 * sheet's visible part, in units.
 */
export interface View {
  readonly k: number;
  readonly vx: number;
  readonly vy: number;
}

/** A point, on the sheet in logical units or on the screen in CSS pixels. */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * The most CSS pixels to a unit: on a wide screen the page is 1000 CSS pixels wide, a pixel to a
 * unit as on the picture of the work, at the sheet's left, and the sheet goes on past it (R23).
 */
export const K_MAX = 1;

/** `k` of a sheet `width` CSS pixels wide as it is on the screen, `across` units wide: k = A / W. */
export function scaleFor(width: number, across: number = SHEET.width): number {
  return width / across;
}

/**
 * `k` for a sheet laid out in an area `width` CSS pixels wide: the page fits the width, up to
 * `K_MAX`. This is the layout's `k`, before any transform the page puts on the element; input takes
 * `k` from the sheet's rectangle on the screen, by `scaleFor`.
 */
export function fitScale(width: number): number {
  return Math.min(width / SHEET.width, K_MAX);
}

/**
 * The point of the sheet under a point of the screen, given in CSS pixels from the top left corner
 * of the sheet's visible part. A point beyond the sheet is clamped to its edge: a pointer captured
 * by the sheet goes on writing on its edge.
 */
export function toSheet(view: View, x: number, y: number): Point {
  return {
    x: clamp(x / view.k + view.vx, 0, REACH.width),
    y: clamp(y / view.k + view.vy, 0, REACH.height),
  };
}

/** The point of the screen over a point of the sheet, from the top left corner of its visible part. */
export function toScreen(view: View, x: number, y: number): Point {
  return { x: (x - view.vx) * view.k, y: (y - view.vy) * view.k };
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}
