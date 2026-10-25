import { getStroke, type StrokeOptions, type Vec2 } from "perfect-freehand";
import type { Stroke } from "./ink.js";

/**
 * The width of the line, in sheet units: 3, as the check board of tutor draws with a `lineWidth`
 * of 3 px on its sheet 1000 wide (R19 tutor; R18).
 */
export const INK_WIDTH = 3;

/** How much a pen's pressure changes the width: from half of it to one and a half (R05, R18). */
const PEN_THINNING = 0.5;

/**
 * How far the ink reaches from a stroke's points, in sheet units, at most: half the widest line, a
 * pen's at full pressure. perfect-freehand's radius at a point is `size × (0.5 − thinning × (0.5 −
 * pressure))`, so 2.25 units with a pressure of 1.
 */
export const INK_REACH = INK_WIDTH * (0.5 + PEN_THINNING / 2);

/**
 * Every option of perfect-freehand 1.2.3 is given: its code's defaults are not its README's
 * (R18). The pressure is the pointer's own, the third number of each point, never simulated, and
 * the ends are round, without a taper.
 */
const OPTIONS = {
  size: INK_WIDTH,
  smoothing: 0.5,
  streamline: 0.5,
  simulatePressure: false,
  easing: (pressure: number) => pressure,
  start: { cap: true, taper: false },
  end: { cap: true, taper: false },
} satisfies StrokeOptions;

/** Whether a stroke's line widens with its pressure on the screen: only a pen's does (R05, R18). */
export function followsPressure(stroke: Stroke): boolean {
  return stroke.kind === "pen";
}

/**
 * The outline of a stroke on the screen, as perfect-freehand draws it: a closed polygon around the
 * stroke's points, in sheet units, to be filled. A pen's line widens with its pressure; a mouse's
 * or a finger's is as wide all along (R18). `complete` says the stroke has ended: its last point is
 * then taken as it is, rather than eased toward.
 */
export function outline(stroke: Stroke, complete: boolean): Vec2[] {
  return polygon(stroke, followsPressure(stroke) ? PEN_THINNING : 0, complete);
}

/**
 * The outline of a finished stroke on the picture of the work: as wide all along, whatever the
 * pointer and its pressure, for the pressure goes into no picture for checking (spec 3.1 of
 * canvas-api; R20). A mouse's or a finger's is its outline on the screen.
 */
export function evenOutline(stroke: Stroke): Vec2[] {
  return polygon(stroke, 0, true);
}

function polygon(stroke: Stroke, thinning: number, complete: boolean): Vec2[] {
  const points = stroke.points.map(({ x, y, p }) => [x, y, p]);
  // One point alone perfect-freehand pairs with another a unit off and draws as an oval. The same
  // point twice it draws as a round dot, as wide as the line.
  const [only] = points;
  if (points.length === 1 && only !== undefined) points.push(only);
  return getStroke(points, { ...OPTIONS, thinning, last: complete });
}
