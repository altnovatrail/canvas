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
 * The speed at which a pen of the kind "pen" without a pen's pressure draws its finest line, in
 * sheet units a millisecond: a quick stroke of a finger or a mouse. Slower, the line is wider.
 */
export const SPEED_FINEST = 1.5;

/**
 * The share of a pen's line, of the kind "pen", that its speed sets without a pen's pressure: as
 * a pressure, 0.45 at its first point, then each point's leaning on the one's before it by
 * `SPEED_FOLLOW`, from 0.75 at rest down to 0.15 at `SPEED_FINEST` and faster.
 */
const SPEED_START = 0.45;
const SPEED_FOLLOW = 0.25;
const SPEED_SLOWEST = 0.75;
const SPEED_RANGE = 0.6;

/**
 * How a pen's line of the kind "pen" thins at its ends: its width there is this share of what it
 * would be, and it widens to all of it over `TAPER_LENGTH` widths along the stroke.
 */
const TAPER_LEAST = 0.45;
const TAPER_LENGTH = 4;

/**
 * The outline of a stroke on the screen, as perfect-freehand draws it: a closed polygon around the
 * stroke's points, in sheet units, to be filled. `complete` says the stroke has ended: its last
 * point is then taken as it is, rather than eased toward. A stroke without a style is 3 units wide,
 * black in the theme's ink: a pen's line widens with its pressure, and a mouse's or a
 * finger's is as wide all along. A stroke with a style is its width: a liner's and a marker's line
 * as wide all along; one of the kind "pen" wider and finer by a pen's pressure, as a pen without a
 * style, or without one by the speed between its points, slow wider, and finer at its start, and
 * at its end once it is complete. Its pressure stays the pointer's: a width from the speed is
 * never written into a point.
 */
export function outline(stroke: Stroke, complete: boolean): Vec2[] {
  const { style } = stroke;
  if (style === undefined) {
    return polygon(stroke, followsPressure(stroke) ? PEN_THINNING : EVEN, complete);
  }
  if (style.pen !== "pen")
    return styled(
      stroke.points.map(() => 1),
      stroke,
      style.width,
      complete,
    );
  const factors =
    stroke.kind === "pen" ? pressed(stroke.points) : stroke.points.map(speedOf(stroke.points));
  return styled(
    tapered(factors, stroke.points, style.width, complete),
    stroke,
    style.width,
    complete,
  );
}

/** A pen's pressure, eased from point to point, as the width it gives the line, in widths. */
function pressed(points: Stroke["points"]): number[] {
  return eased(points).map(penWidth);
}

/** Each point's pressure leaning on the point's before it, so the line widens and narrows smoothly. */
function eased(points: Stroke["points"]): number[] {
  let last: number | undefined;
  return points.map(({ p }) => {
    last = last === undefined ? p : (1 - PEN_FOLLOW) * last + PEN_FOLLOW * p;
    return last;
  });
}

/** The width the speed gives each point of a line without a pen's pressure, in widths. */
function speedOf(points: Stroke["points"]): (point: Stroke["points"][number], k: number) => number {
  let share = SPEED_START;
  return (point, k) => {
    const before = points[k - 1];
    // A point at the time of the one before it has no speed of its own, and changes nothing.
    if (before !== undefined && point.t > before.t) {
      const speed = Math.hypot(point.x - before.x, point.y - before.y) / (point.t - before.t);
      const target = SPEED_SLOWEST - SPEED_RANGE * Math.min(speed / SPEED_FINEST, 1);
      share = (1 - SPEED_FOLLOW) * share + SPEED_FOLLOW * target;
    }
    return penWidth(share);
  };
}

/**
 * Widths of a line, finer at its start, and at its end once it is complete. A dot or a dash of two
 * points keeps its width.
 */
function tapered(
  factors: readonly number[],
  points: Stroke["points"],
  width: number,
  complete: boolean,
): readonly number[] {
  if (points.length <= 2) return factors;
  const along: number[] = [];
  let length = 0;
  for (const [k, point] of points.entries()) {
    const before = points[k - 1];
    if (before !== undefined) length += Math.hypot(point.x - before.x, point.y - before.y);
    along.push(length);
  }
  const reach = TAPER_LENGTH * width;
  const share = (distance: number) =>
    Math.max(TAPER_LEAST, Math.min(1, TAPER_LEAST + ((1 - TAPER_LEAST) * distance) / reach));
  return factors.map((factor, k) => {
    const from = along[k] ?? 0;
    const thinned = complete ? Math.min(share(from), share(length - from)) : share(from);
    return factor * thinned;
  });
}

/**
 * The outline of a stroke in a style, each point its width in widths of the style's: the library
 * takes the width as each point's pressure and halves it, so its radius is the style's width times
 * that, halved. Its size is the line's without a style, and its easing scales it to the style's
 * width: the size also sets how far the library smooths the outline and how much of the stroke's
 * start it passes over, which a wide marker would otherwise draw as a chord. A liner as wide as
 * the line without a style draws a finger's very line.
 */
function styled(
  factors: readonly number[],
  stroke: Stroke,
  width: number,
  complete: boolean,
): Vec2[] {
  const points = stroke.points.map(({ x, y }, k) => [x, y, factors[k] ?? 1]);
  const scale = width / INK_WIDTH;
  return freehand(points, {
    ...OPTIONS,
    easing: (factor: number) => (factor * scale) / 2,
    thinning: PEN_THINNING,
    last: complete,
  });
}

function polygon(stroke: Stroke, thinning: number, complete: boolean): Vec2[] {
  const pressures = eased(stroke.points);
  const points = stroke.points.map(({ x, y }, k) => [x, y, pressures[k] ?? 0]);
  return freehand(points, { ...OPTIONS, thinning, last: complete });
}

/** perfect-freehand's outline of points [x, y, pressure], with the few points it draws amiss. */
function freehand(points: number[][], options: StrokeOptions): Vec2[] {
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
  return getStroke(points, options);
}
