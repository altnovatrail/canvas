import { getStroke, type StrokeOptions, type Vec2 } from "perfect-freehand";
import type { Stroke } from "./ink.js";

/**
 * The width of the line, in sheet units: 3, as the check board of tutor draws with a `lineWidth`
 * of 3 px on its sheet 1000 wide.
 */
export const INK_WIDTH = 3;

/** A pen's line at no pressure, and at full pressure, in widths of a finger's line. */
export const PEN_THINNEST = 0.5;
export const PEN_WIDEST = 2;

/**
 * The power of the pressure in a pen's width, below 1: Apple Pencil in WebKit gives writing a
 * pressure of about 0–0.2, its median about 0.1 (measurements 1.8), and the curve widens the line
 * more in that low range than a straight one would.
 */
const PEN_POWER = 0.8;

/** How much of a point's pressure is its own: the rest is the point's before it, so that the line
 * does not jump with the pointer's noise. */
const PEN_FOLLOW = 0.65;

/**
 * A pen's line at a pressure, in widths of a finger's line: `PEN_THINNEST` at none, `PEN_WIDEST`
 * at full, and between by the pressure to the power `PEN_POWER`. A pressure past 0–1 is taken as
 * the nearer end.
 */
export function penWidth(pressure: number): number {
  const p = Math.min(Math.max(pressure, 0), 1);
  return PEN_THINNEST + (PEN_WIDEST - PEN_THINNEST) * p ** PEN_POWER;
}

/**
 * How far the ink reaches from a stroke's points, in sheet units, at most: half the widest line, a
 * pen's at full pressure.
 */
export const INK_REACH = (INK_WIDTH * PEN_WIDEST) / 2;

/**
 * Every option of perfect-freehand 1.2.3 is given: its code's defaults are not its README's.
 * The pressure is the pointer's own, the third number of each point, never simulated, and
 * the ends are round, without a taper. The library's radius is `size × easing(0.5 − thinning ×
 * (0.5 − pressure))`: a pen's `thinning` of 1 hands `easing` the pressure itself, and half the
 * pen's width is the radius. With a `thinning` of 0 the library calls no `easing`, and the radius
 * is half the size.
 */
const OPTIONS = {
  size: INK_WIDTH,
  smoothing: 0.5,
  streamline: 0.5,
  simulatePressure: false,
  easing: (pressure: number) => penWidth(pressure) / 2,
  start: { cap: true, taper: false },
  end: { cap: true, taper: false },
} satisfies StrokeOptions;

/** perfect-freehand's `thinning` of a pen's line, and of an even one. */
const PEN_THINNING = 1;
const EVEN = 0;

/** Whether a stroke's line widens with its pressure on the screen: only a pen's does. */
export function followsPressure(stroke: Stroke): boolean {
  return stroke.kind === "pen";
}

/**
 * The outline of a stroke on the screen, as perfect-freehand draws it: a closed polygon around the
 * stroke's points, in sheet units, to be filled. A pen's line widens with its pressure; a mouse's
 * or a finger's is as wide all along. `complete` says the stroke has ended: its last point is
 * then taken as it is, rather than eased toward.
 */
export function outline(stroke: Stroke, complete: boolean): Vec2[] {
  return polygon(stroke, followsPressure(stroke) ? PEN_THINNING : EVEN, complete);
}

function polygon(stroke: Stroke, thinning: number, complete: boolean): Vec2[] {
  // Each point's pressure leans on the point's before it: the line widens and narrows smoothly.
  let eased: number | undefined;
  const points = stroke.points.map(({ x, y, p }) => {
    eased = eased === undefined ? p : (1 - PEN_FOLLOW) * eased + PEN_FOLLOW * p;
    return [x, y, eased];
  });
  // One point alone perfect-freehand pairs with another a unit off and draws as an oval. The same
  // point twice it draws as a round dot, as wide as the line.
  const [only, end] = points;
  if (points.length === 1 && only !== undefined) points.push(only);
  // Two points it takes as the first and four of its own toward the second, of a pressure of 0.5
  // whatever the two had: three are put between them here, at the pressures between.
  if (points.length === 2 && only !== undefined && end !== undefined) {
    const between = [1, 2, 3].map((quarter) =>
      only.map((value, i) => value + ((end[i] ?? value) - value) * (quarter / 4)),
    );
    points.splice(1, 0, ...between);
  }
  return getStroke(points, { ...OPTIONS, thinning, last: complete });
}
