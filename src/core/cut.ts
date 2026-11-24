import { boxOf } from "./geometry.js";
import type { InkPoint, Stroke } from "./ink.js";
import { MIN_STEP } from "./recorder.js";
import type { Point } from "./screen.js";

/**
 * What an eraser that takes a part leaves of a stroke: the eraser's path, the sheet's points of
 * one press, is a line `radius` wide on either side, round at its ends — a tap is a dot of that
 * radius —, and the stroke's line, the segments between its points, loses every stretch that lies
 * within it. Computed exactly, not by samples: each segment of the stroke is inside each capsule
 * of the path, the segment between two of its points widened by the radius, along one interval,
 * for a capsule is convex.
 *
 * Each stretch the eraser left is a piece: a point of its own where the eraser's edge crossed the
 * stroke, unless that is a point of the stroke's, then the stroke's points within it, and a point
 * of its own at its other end. A point of its own lies on its segment, its time and its pressure
 * between those of the segment's ends, so the pressure stays the pointer's and the time within the
 * stroke's. A stretch shorter than `MIN_STEP`, the least step the recorder keeps, is no piece. A
 * stroke of one point, or of points all in one place, is covered whole or not at all.
 *
 * `radius` is in the stroke's own units — on the tracing paper, the paper's. The element gives
 * the eraser's radius and the half width of the stroke's line (`reachOf`), so that no ink a piece
 * keeps lies within the eraser's path: what the eraser comes near, by `Work.near`, it cuts.
 *
 * The path may be given a segment at a time (`add`), as the eraser moves, and the pieces asked for
 * at any time, as the screen shows the strokes under an eraser still down.
 */
export class Cut {
  readonly stroke: Stroke;
  readonly radius: number;
  /** The stroke's box, widened by the radius: a capsule that misses it misses every segment. */
  readonly #reach: { minX: number; minY: number; maxX: number; maxY: number };
  /** The parts of each segment the eraser covered, by the segment's place: merged intervals. */
  readonly #covered = new Map<number, [number, number][]>();
  /** Whether the stroke has no length: one point, or every point in one place. */
  readonly #still: boolean;
  /** Whether a stroke of no length is covered: its one place is within a capsule. */
  #whole = false;

  constructor(stroke: Stroke, radius: number) {
    if (stroke.points.length === 0) throw new TypeError(`the stroke ${stroke.id} has no points`);
    if (!(radius >= 0 && Number.isFinite(radius))) {
      throw new RangeError(`an eraser's radius is a number from 0, not ${radius}`);
    }
    this.stroke = stroke;
    this.radius = radius;
    const [first, ...rest] = stroke.points as [InkPoint, ...InkPoint[]];
    this.#still = rest.every(({ x, y }) => x === first.x && y === first.y);
    const box = boxOf(stroke.points);
    this.#reach = {
      minX: box.minX - radius,
      minY: box.minY - radius,
      maxX: box.maxX + radius,
      maxY: box.maxY + radius,
    };
  }

  /**
   * The eraser goes from `from` to `to`, a dot where they are one point: what it covers of the
   * stroke is added. Whether it covered anything of it that it had not.
   */
  add(from: Point, to: Point): boolean {
    const reach = this.#reach;
    if (
      Math.max(from.x, to.x) < reach.minX ||
      Math.min(from.x, to.x) > reach.maxX ||
      Math.max(from.y, to.y) < reach.minY ||
      Math.min(from.y, to.y) > reach.maxY
    ) {
      return false;
    }
    const { points } = this.stroke;
    const r = this.radius;
    const left = Math.min(from.x, to.x) - r;
    const right = Math.max(from.x, to.x) + r;
    const top = Math.min(from.y, to.y) - r;
    const bottom = Math.max(from.y, to.y) + r;
    if (this.#still) {
      if (this.#whole) return false;
      this.#whole = withinCapsule(points[0] as InkPoint, from, to, r);
      return this.#whole;
    }
    let more = false;
    for (let k = 1; k < points.length; k++) {
      const a = points[k - 1] as InkPoint;
      const b = points[k] as InkPoint;
      if (
        Math.max(a.x, b.x) < left ||
        Math.min(a.x, b.x) > right ||
        Math.max(a.y, b.y) < top ||
        Math.min(a.y, b.y) > bottom
      ) {
        continue;
      }
      const span = capsuleSpan(a, b, from, to, r);
      if (span !== null && this.#cover(k - 1, span)) more = true;
    }
    return more;
  }

  /**
   * The pieces the eraser leaves of the stroke, each the points of one, along the stroke: none
   * when it covered the stroke whole, and `null` when it did not cross it. A stroke whose every
   * stretch left is shorter than `MIN_STEP` leaves none.
   */
  pieces(): InkPoint[][] | null {
    if (this.#still) return this.#whole ? [] : null;
    if (this.#covered.size === 0) return null;
    const { points } = this.stroke;
    const last = points.length - 1;
    // The stretches left, as places along the stroke: the segment's place and the share of it.
    const left: [number, number][] = [];
    let from = 0;
    for (let k = 0; k < last; k++) {
      for (const [start, end] of this.#covered.get(k) ?? []) {
        if (k + start > from) left.push([from, k + start]);
        from = Math.max(from, k + end);
      }
    }
    if (from < last) left.push([from, last]);
    const pieces: InkPoint[][] = [];
    for (const [start, end] of left) {
      if (lengthOf(points, start, end) < MIN_STEP) continue;
      const piece = [pointAt(points, start)];
      for (let k = Math.floor(start) + 1; k < end; k++) piece.push(points[k] as InkPoint);
      piece.push(pointAt(points, end));
      pieces.push(piece);
    }
    // A touch at an end of the stroke too slight for the numbers to move its point: no cut.
    const [only] = pieces;
    if (pieces.length === 1 && only?.length === points.length) {
      if (only.every((point, k) => samePlace(point, points[k] as InkPoint))) return null;
    }
    return pieces;
  }

  /** An interval of a segment covered: merged with those it overlaps. Whether it adds to them. */
  #cover(segment: number, [start, end]: readonly [number, number]): boolean {
    // A touch at one point covers nothing a piece would lose.
    if (end <= start) return false;
    const intervals = this.#covered.get(segment) ?? [];
    let low = start;
    let high = end;
    const kept: [number, number][] = [];
    let added = true;
    for (const interval of intervals) {
      const [a, b] = interval;
      if (b < low || a > high) {
        kept.push(interval);
        continue;
      }
      if (a <= low && b >= high) added = false;
      low = Math.min(low, a);
      high = Math.max(high, b);
    }
    if (!added) return false;
    kept.push([low, high]);
    kept.sort((x, y) => x[0] - y[0]);
    this.#covered.set(segment, kept);
    return true;
  }
}

/**
 * The pieces an eraser's path, its points of one press, leaves of a stroke: as `Cut` gives them,
 * `null` when the path does not cross it.
 */
export function cutOf(stroke: Stroke, path: readonly Point[], radius: number): InkPoint[][] | null {
  const cut = new Cut(stroke, radius);
  const [first] = path;
  if (first !== undefined) cut.add(first, first);
  for (let k = 1; k < path.length; k++) cut.add(path[k - 1] as Point, path[k] as Point);
  return cut.pieces();
}

function samePlace(a: InkPoint, b: InkPoint): boolean {
  return a.x === b.x && a.y === b.y && a.t === b.t && a.p === b.p;
}

/** Whether a point lies within `radius` of the segment pq. */
function withinCapsule(point: Point, p: Point, q: Point, radius: number): boolean {
  const ux = q.x - p.x;
  const uy = q.y - p.y;
  const length = ux * ux + uy * uy;
  const along =
    length === 0
      ? 0
      : Math.min(1, Math.max(0, ((point.x - p.x) * ux + (point.y - p.y) * uy) / length));
  const dx = point.x - (p.x + along * ux);
  const dy = point.y - (p.y + along * uy);
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * Where the segment ab lies within the capsule of pq and `radius`, as shares of the way from a to
 * b, or `null` when it does not. The capsule is the disks at p and at q and the strip between
 * them; it is convex, so the parts of ab in each join into one interval.
 */
function capsuleSpan(
  a: Point,
  b: Point,
  p: Point,
  q: Point,
  radius: number,
): [number, number] | null {
  let low = Number.POSITIVE_INFINITY;
  let high = Number.NEGATIVE_INFINITY;
  const join = (span: readonly [number, number] | null) => {
    if (span === null) return;
    low = Math.min(low, span[0]);
    high = Math.max(high, span[1]);
  };
  join(diskSpan(a, b, p, radius));
  if (q.x !== p.x || q.y !== p.y) {
    join(diskSpan(a, b, q, radius));
    join(stripSpan(a, b, p, q, radius));
  }
  return low <= high ? [low, high] : null;
}

/** Where ab lies within the disk of centre c and `radius`: a quadratic in the share s. */
function diskSpan(a: Point, b: Point, c: Point, radius: number): [number, number] | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const fx = a.x - c.x;
  const fy = a.y - c.y;
  const qa = dx * dx + dy * dy;
  const qb = 2 * (dx * fx + dy * fy);
  const qc = fx * fx + fy * fy - radius * radius;
  if (qa === 0) return qc <= 0 ? [0, 1] : null;
  const discriminant = qb * qb - 4 * qa * qc;
  if (discriminant < 0) return null;
  const root = Math.sqrt(discriminant);
  return clipped((-qb - root) / (2 * qa), (-qb + root) / (2 * qa));
}

/**
 * Where ab lies within the strip of pq: its projection on pq within the segment, and its distance
 * from pq's line within `radius`. Two linear bounds on the share s.
 */
function stripSpan(
  a: Point,
  b: Point,
  p: Point,
  q: Point,
  radius: number,
): [number, number] | null {
  const ux = q.x - p.x;
  const uy = q.y - p.y;
  const length = ux * ux + uy * uy;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const fx = a.x - p.x;
  const fy = a.y - p.y;
  // Along pq, times its length squared: from 0 to that length squared.
  const along = linearSpan(fx * ux + fy * uy, dx * ux + dy * uy, 0, length);
  // Across pq, times its length: within the radius times the length on either side.
  const width = radius * Math.sqrt(length);
  const across = linearSpan(ux * fy - uy * fx, ux * dy - uy * dx, -width, width);
  if (along === null || across === null) return null;
  return clipped(Math.max(along[0], across[0]), Math.min(along[1], across[1]));
}

/** The shares s at which `value + s × slope` lies from `least` to `most`, or `null`. */
function linearSpan(
  value: number,
  slope: number,
  least: number,
  most: number,
): [number, number] | null {
  if (slope === 0) return value >= least && value <= most ? [-Infinity, Infinity] : null;
  const one = (least - value) / slope;
  const other = (most - value) / slope;
  return [Math.min(one, other), Math.max(one, other)];
}

/** An interval of shares within the segment, 0 to 1, or `null` when none of it is. */
function clipped(low: number, high: number): [number, number] | null {
  const start = Math.max(0, low);
  const end = Math.min(1, high);
  return start <= end ? [start, end] : null;
}

/** The point at a place along a stroke: a point of its own where the place is no point of it. */
function pointAt(points: readonly InkPoint[], place: number): InkPoint {
  const k = Math.floor(place);
  const share = place - k;
  const a = points[k] as InkPoint;
  if (share === 0) return a;
  const b = points[k + 1] as InkPoint;
  return {
    x: between(a.x, b.x, share),
    y: between(a.y, b.y, share),
    t: between(a.t, b.t, share),
    p: between(a.p, b.p, share),
  };
}

/** A value a share of the way from one to another, never past either. */
function between(from: number, to: number, share: number): number {
  const value = from + (to - from) * share;
  return Math.min(Math.max(value, Math.min(from, to)), Math.max(from, to));
}

/** How long a stroke's line is between two places along it. */
function lengthOf(points: readonly InkPoint[], start: number, end: number): number {
  let length = 0;
  let previous = pointAt(points, start);
  for (let k = Math.floor(start) + 1; k < end; k++) {
    const point = points[k] as InkPoint;
    length += Math.hypot(point.x - previous.x, point.y - previous.y);
    previous = point;
  }
  const last = pointAt(points, end);
  return length + Math.hypot(last.x - previous.x, last.y - previous.y);
}
