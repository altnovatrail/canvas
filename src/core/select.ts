import { type Box, boxOf } from "./geometry.js";
import type { Stroke } from "./ink.js";
import type { Point } from "./screen.js";

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
