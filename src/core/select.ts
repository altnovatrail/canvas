import { type Box, boxOf } from "./geometry.js";
import type { Stroke } from "./ink.js";
import type { Point } from "./screen.js";
import { STYLE_BOUNDS } from "./style.js";

/**
 * How much of a stroke Select's shape must hold to take it: four of its points in five. A stroke
 * the learner drew round as they wrote it is taken though its ends stray out of the shape, and one
 * that only reaches into it is not.
 */
export const SELECT_SHARE = 0.8;

/** The rectangle Select draws from where its press began, `a`, to the pointer, `b`. */
export function rectangleOf(a: Point, b: Point): Point[] {
  return [a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }];
}

/**
 * Whether a shape, its last point joined to its first, holds a point: by how many of its edges a
 * ray from the point crosses, even–odd, as SVG fills a path that crosses itself.
 */
export function holds(shape: readonly Point[], point: Point): boolean {
  let inside = false;
  for (let i = 0, j = shape.length - 1; i < shape.length; j = i++) {
    const a = shape[i] as Point;
    const b = shape[j] as Point;
    if (a.y > point.y !== b.y > point.y) {
      const x = ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
      if (point.x < x) inside = !inside;
    }
  }
  return inside;
}

/**
 * The IDs of the strokes a shape takes, in their order: those it holds `SELECT_SHARE` of the points
 * of at least. A shape of fewer than three points, or of no area, takes none.
 */
export function takenBy(strokes: readonly Stroke[], shape: readonly Point[]): number[] {
  if (shape.length < 3) return [];
  const { minX, minY, maxX, maxY } = boxOf(shape);
  if (!(maxX > minX && maxY > minY)) return [];
  const taken: number[] = [];
  for (const stroke of strokes) {
    const { points } = stroke;
    let held = 0;
    for (const point of points) if (holds(shape, point)) held++;
    if (points.length > 0 && held >= SELECT_SHARE * points.length) taken.push(stroke.id);
  }
  return taken;
}

/**
 * An offset for strokes whose points are within `box`, kept so that every point stays within
 * `[0, width]` across and `[0, height]` down: as near the one asked as that lets it be.
 */
export function keptOffset(
  box: Box,
  [dx, dy]: readonly [number, number],
  width: number,
  height: number,
): [number, number] {
  return [
    Math.min(Math.max(dx, -box.minX), width - box.maxX),
    Math.min(Math.max(dy, -box.minY), height - box.maxY),
  ];
}

/**
 * How Select scales the strokes it took: by `factor`, the same across and down, from the point `at`
 * that stays where it is, in their layer's units.
 */
export interface Scaling {
  readonly factor: number;
  readonly at: readonly [number, number];
}

/**
 * How far one scale goes, as the mockup has it: from a quarter to four times, and never below
 * `SCALE_LEAST` units on the longer side of the box of what it scales.
 */
export const SCALE_BOUNDS: readonly [number, number] = Object.freeze([0.25, 4] as const);
export const SCALE_LEAST = 24;

/** A style's width scaled: in sheet units to a tenth, kept within a style's bounds. */
export function scaledWidth(width: number, factor: number): number {
  const [thinnest, widest] = STYLE_BOUNDS.width;
  return Math.min(Math.max(Math.round(width * factor * 10) / 10, thinnest), widest);
}

/**
 * A stroke scaled, under a new ID: every point from `at` by `factor`, its time and pressure as they
 * were, and its line as much wider or finer; a stroke of no style keeps none, and its width.
 */
export function scaledStroke(
  stroke: Stroke,
  { factor, at: [ax, ay] }: Scaling,
  id: number,
): Stroke {
  const { style } = stroke;
  const points = stroke.points.map((point) => ({
    ...point,
    x: ax + (point.x - ax) * factor,
    y: ay + (point.y - ay) * factor,
  }));
  return style === undefined
    ? { ...stroke, id, points }
    : { ...stroke, id, points, style: { ...style, width: scaledWidth(style.width, factor) } };
}

/**
 * The factors a scale of strokes whose points are within `box` may take from `at`, a corner of the
 * box: the lower of the bounds and `SCALE_LEAST` — or none below 1 for a box already as small —,
 * and the upper of the bounds and of keeping every point within `[0, width]` across and
 * `[0, height]` down.
 */
export function scaleRange(
  box: Box,
  [ax, ay]: readonly [number, number],
  width: number,
  height: number,
): [number, number] {
  const [least, most] = SCALE_BOUNDS;
  const side = Math.max(box.maxX - box.minX, box.maxY - box.minY);
  const lo = side > 0 ? Math.min(1, Math.max(least, SCALE_LEAST / side)) : 1;
  let hi = most;
  // Each side the scale moves away from `at` reaches the edge it faces no farther than the edge.
  if (box.maxX > ax) hi = Math.min(hi, (width - ax) / (box.maxX - ax));
  if (box.minX < ax) hi = Math.min(hi, ax / (ax - box.minX));
  if (box.maxY > ay) hi = Math.min(hi, (height - ay) / (box.maxY - ay));
  if (box.minY < ay) hi = Math.min(hi, ay / (ay - box.minY));
  return [lo, Math.max(1, hi)];
}
