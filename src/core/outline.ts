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

/**
 * The outline of a stroke, as perfect-freehand draws it: a closed polygon around the stroke's
 * points, in sheet units, to be filled. A pen's line widens with its pressure; a mouse's or a
 * finger's is as wide all along (R18). `complete` says the stroke has ended: its last point is then
 * taken as it is, rather than eased toward.
 */
export function outline(stroke: Stroke, complete: boolean): Vec2[] {
  const points = stroke.points.map(({ x, y, p }) => [x, y, p]);
  // One point alone perfect-freehand pairs with another a unit off and draws as an oval. The same
  // point twice it draws as a round dot, as wide as the line.
  const [only] = points;
  if (points.length === 1 && only !== undefined) points.push(only);
  return getStroke(points, {
    ...OPTIONS,
    thinning: stroke.kind === "pen" ? PEN_THINNING : 0,
    last: complete,
  });
}
