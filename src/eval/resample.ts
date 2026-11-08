// The final geometry of a sample (R09; contracts/README.md, section 11): the strokes a sheet shows,
// without the time, the pressure, the order and the direction they were written in. Each stroke
// runs in its canonical direction, its points go along it a step apart, and the strokes are
// numbered by their place. The step keeps every point that holds the stroke's box, so the box,
// the bundles and h_med — every number of a crop — are the same as of the points as they came
// (the 2026-10-25 amendment to R09; R25): only the pixels move, and too little to see (R48).

import { type Box, tenths } from "../core/geometry.js";
import type { Point } from "../core/screen.js";

/**
 * The step of the final geometry along a stroke, in units: the largest of 0.25, 0.5 and 1 at which
 * no pixel of a crop, at any height of eval, moves by more than a quarter of the grey scale on the
 * synthetic sheets (R48; resample.test.ts). At the largest scale a crop draws at, 3.2 px to a unit,
 * the points are 0.8 px apart. At 0.5 the edge of a line moves by up to half the scale, on small
 * letters drawn at 48 px.
 */
export const STEP = 0.25;

/**
 * The points of a stroke in its canonical direction (R09): of the points and their reverse, the one
 * that comes first by its points in whole tenths, each down then across. A stroke written from its
 * bottom, or from its right, runs the other way; a closed one, from the same point either way,
 * goes the way of its smaller second point.
 */
export function canonical(points: readonly Point[]): Point[] {
  const forward = [...points];
  const backward = [...points].reverse();
  return order(backward, forward) < 0 ? backward : forward;
}

/**
 * A stroke's points along its length, `step` units apart, to a tenth (R09): its first and its last
 * point, every point that holds its box — the first that reaches each edge —, and between them
 * points at every `step` of the length, on the segments as they were written. A point on a segment
 * lies within the box, and rounding it to a tenth keeps it there, for the box's edges are tenths:
 * so the box is that of the points as they came. Points that round to the one before are dropped.
 * A stroke of one point keeps it.
 */
export function resampled(points: readonly Point[], step: number = STEP): Point[] {
  if (!(step > 0)) throw new RangeError(`a step along a stroke is above 0, not ${step}`);
  const spots = points.map(({ x, y }) => ({ x: tenths(x), y: tenths(y) }));
  const [first] = spots;
  if (first === undefined) throw new TypeError("a stroke has a point at least");
  // Where each point lies along the stroke, in tenths of its length.
  const along = [0];
  for (let k = 1; k < spots.length; k++) {
    const a = spots[k - 1] ?? first;
    const b = spots[k] ?? first;
    along.push((along[k - 1] ?? 0) + Math.hypot(b.x - a.x, b.y - a.y));
  }
  const length = along[along.length - 1] ?? 0;
  const kept = new Set([0, spots.length - 1, ...holdersOf(spots)]);
  // The places along the stroke: every step, and the points kept, each once and in order.
  const places: { at: number; vertex?: number }[] = [];
  for (let n = 0; 10 * step * n < length; n++) places.push({ at: 10 * step * n });
  for (const vertex of kept) places.push({ at: along[vertex] ?? 0, vertex });
  // At one place a point kept comes before a step's, which then rounds to it and is dropped.
  const rank = ({ vertex }: { vertex?: number }) => (vertex === undefined ? spots.length : vertex);
  places.sort((a, b) => a.at - b.at || rank(a) - rank(b));
  const out: Point[] = [];
  let segment = 0;
  for (const { at, vertex } of places) {
    let spot: { x: number; y: number };
    if (vertex !== undefined) spot = spots[vertex] ?? first;
    else {
      while (segment < spots.length - 2 && (along[segment + 1] ?? 0) < at) segment += 1;
      spot = between(spots, along, segment, at);
    }
    const last = out[out.length - 1];
    const point = { x: spot.x / 10, y: spot.y / 10 };
    if (last === undefined || last.x !== point.x || last.y !== point.y) out.push(point);
  }
  return out;
}

/** The first point to reach each edge of the box of the points, by its place among them. */
function holdersOf(spots: readonly { x: number; y: number }[]): number[] {
  const first = (better: (a: { x: number; y: number }, b: { x: number; y: number }) => boolean) => {
    let held = 0;
    spots.forEach((spot, k) => {
      const best = spots[held];
      if (best !== undefined && better(spot, best)) held = k;
    });
    return held;
  };
  return [
    first((a, b) => a.x < b.x),
    first((a, b) => a.y < b.y),
    first((a, b) => a.x > b.x),
    first((a, b) => a.y > b.y),
  ];
}

/** The point `at` tenths along the stroke on its segment from point `k`, in whole tenths. */
function between(
  spots: readonly { x: number; y: number }[],
  along: readonly number[],
  k: number,
  at: number,
): { x: number; y: number } {
  const a = spots[k];
  const b = spots[k + 1] ?? a;
  if (a === undefined || b === undefined) throw new Error("no segment there");
  const start = along[k] ?? 0;
  const span = (along[k + 1] ?? start) - start;
  const share = span === 0 ? 0 : (at - start) / span;
  return { x: Math.round(a.x + (b.x - a.x) * share), y: Math.round(a.y + (b.y - a.y) * share) };
}

/**
 * The points of a stroke in the final geometry (R09): along it, `step` units apart, from one end or
 * from the other, each in its canonical direction, and of the two the one whose points come first.
 * The direction is chosen on the points the file keeps, so a reader that compares them finds it
 * the same, and a stroke written the other way gives the same points.
 */
export function finalPoints(points: readonly Point[], step: number = STEP): Point[] {
  const one = canonical(resampled(points, step));
  const other = canonical(resampled([...points].reverse(), step));
  return order(other, one) < 0 ? other : one;
}

/** Which of two runs of points comes first: by each point in whole tenths, down then across. */
function order(a: readonly Point[], b: readonly Point[]): number {
  for (let k = 0; k < Math.min(a.length, b.length); k++) {
    const p = a[k];
    const q = b[k];
    if (p === undefined || q === undefined) break;
    const step = tenths(p.y) - tenths(q.y) || tenths(p.x) - tenths(q.x);
    if (step !== 0) return step;
  }
  return a.length - b.length;
}

/**
 * The order of strokes by their place (R09): by the box of each stroke's points in whole tenths —
 * its top, then its left, its bottom and its right —, then by its points in their canonical
 * direction, and last by the ID it had, which only strokes alike in all of it reach. The final
 * geometry numbers them from 1 in this order, so the numbers tell no order of writing.
 */
export function byPlace(
  a: { readonly id: number; readonly box: Box; readonly points: readonly Point[] },
  b: { readonly id: number; readonly box: Box; readonly points: readonly Point[] },
): number {
  const edges =
    a.box.minY - b.box.minY ||
    a.box.minX - b.box.minX ||
    a.box.maxY - b.box.maxY ||
    a.box.maxX - b.box.maxX;
  return edges || order(a.points, b.points) || a.id - b.id;
}
