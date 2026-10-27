import type { Stroke } from "./ink.js";
import type { Point } from "./screen.js";
import { SHEET } from "./sheet.js";

/** A rectangle on the sheet, in its units, as rbush takes one (R05). */
export interface Box {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

/**
 * A length or a place in whole tenths of a unit, as a sample file keeps them (R09), rounded half
 * up: 100.05 units, 1000.5 tenths, are 1001. The groups and the crop count in them (R24, R25).
 */
export function tenths(value: number): number {
  return Math.round(value * 10);
}

/** A stroke's box in whole tenths, with its ID: what the crop and the boxes' rule count by. */
export interface Extent extends Box {
  readonly id: number;
}

/**
 * The box of a stroke's points in whole tenths (R25, R37): rounding keeps order, so its edges are
 * the rounded least and most of the points. A stroke with no points is a TypeError, and one with a
 * point off the sheet, or no number, a RangeError: the rules' whole numbers hold on the sheet alone.
 */
export function extentOf({ id, points }: Stroke): Extent {
  if (points.length === 0) throw new TypeError(`the stroke ${id} has no points`);
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const { x, y } of points) {
    if (!onSheet(x, SHEET.width) || !onSheet(y, SHEET.height)) {
      throw new RangeError(`the stroke ${id} has a point (${x}, ${y}) off the sheet`);
    }
    minX = Math.min(minX, tenths(x));
    minY = Math.min(minY, tenths(y));
    maxX = Math.max(maxX, tenths(x));
    maxY = Math.max(maxY, tenths(y));
  }
  return { id, minX, minY, maxX, maxY };
}

function onSheet(value: number, size: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= size;
}

/** The box around a stroke's points, the raw points rather than the ink's outline. */
export function boxOf(points: readonly Point[]): Box {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const { x, y } of points) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY };
}

/** The box around boxes. */
export function around(boxes: readonly Box[]): Box {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const box of boxes) {
    minX = Math.min(minX, box.minX);
    minY = Math.min(minY, box.minY);
    maxX = Math.max(maxX, box.maxX);
    maxY = Math.max(maxY, box.maxY);
  }
  return { minX, minY, maxX, maxY };
}

/** The box around a segment, wider by `margin` on every side. */
export function segmentBox(a: Point, b: Point, margin: number): Box {
  return {
    minX: Math.min(a.x, b.x) - margin,
    minY: Math.min(a.y, b.y) - margin,
    maxX: Math.max(a.x, b.x) + margin,
    maxY: Math.max(a.y, b.y) + margin,
  };
}

/**
 * How near two segments come, ab and cd: 0 if they cross or touch. A segment whose ends are one
 * point is that point.
 */
export function segmentDistance(a: Point, b: Point, c: Point, d: Point): number {
  if (crosses(a, b, c, d)) return 0;
  return Math.min(
    pointDistance(a, c, d),
    pointDistance(b, c, d),
    pointDistance(c, a, b),
    pointDistance(d, a, b),
  );
}

/** How near a point comes to the segment ab. */
function pointDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = dx * dx + dy * dy;
  // The point of the segment nearest p, as a fraction of the way from a to b.
  const along = length === 0 ? 0 : clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / length, 0, 1);
  return Math.hypot(p.x - (a.x + along * dx), p.y - (a.y + along * dy));
}

/**
 * Whether ab and cd cross: each segment's ends lie on either side of the other's line. Segments that
 * only touch, or lie along one line, are left to the distances of their ends, which are 0 then.
 */
function crosses(a: Point, b: Point, c: Point, d: Point): boolean {
  const abc = turn(a, b, c);
  const abd = turn(a, b, d);
  const cda = turn(c, d, a);
  const cdb = turn(c, d, b);
  return abc * abd < 0 && cda * cdb < 0;
}

/** Which way a, b, c turn: above 0 one way, below the other, 0 on one line. */
function turn(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}
