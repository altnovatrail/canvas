import type { CropNumbers, CropStroke, TracingState, TutorAct } from "@altnovatrail/spec/canvas";
import { CROP, sheetBoxOf, tokensOf } from "./crop.js";
import { record, shown } from "./fields.js";
import { type Box, boxOf, tenths } from "./geometry.js";
import type { InkPoint, Stroke } from "./ink.js";
import type { Point } from "./screen.js";
import { REACH } from "./sheet.js";
import { reachOf, STYLE_BOUNDS, type StrokeStyle } from "./style.js";
import { onSheet, tracingFieldsOf } from "./tracing.js";

/**
 * A stroke a crop of a task from paper shows, and the tutor's act on such a crop in grown-up mode:
 * spec's types, of the contract of canvas and app, their points in the crop's pixels.
 */
export type { CropStroke, TutorAct };

/**
 * The tutor's rule in grown-up mode: a stroke the crop shows goes to the drawing with `points`
 * points at most, thinned first at `tolerance` px off its line, a tolerance multiplied by `growth`
 * until it has no more, and its places in crop pixels to the `places`th digit. A stroke the
 * tutor writes is drawn as a hand writes it: `speed` sheet units a millisecond, `least` ms a stroke
 * at the least and `pause` ms between strokes, all of it within `most` ms, the times shortened
 * alike to keep within it.
 */
export const TUTOR = Object.freeze({
  points: 128,
  tolerance: 0.25,
  growth: 1.5,
  places: 100,
  speed: 0.45,
  least: 90,
  pause: 40,
  most: 3000,
});

/**
 * What the tutor's act reads of a task from paper's context: where its crop lies on the sheet, its
 * size in px, and where the tracing paper lay. The Check's context and the drawing's are both one.
 */
export interface DrawingContext {
  readonly crop: Pick<CropNumbers, "sheetBox" | "width" | "height">;
  readonly tracing: TracingState;
}

/** A digest as the element writes one. */
const DIGEST = /^[0-9a-f]{16}$/;

/**
 * A task from paper's context given back for the tutor's act, checked as far as the act reads it:
 * its crop's `sheetBox`, [ymin, xmin, ymax, xmax] of finite units, min < max, and its size, whole
 * px from 1 to `CROP.edge`; its groups a list; where its tracing paper lay; and its digest. A
 * sheet's context, a workbook's, and anything else is a TypeError.
 */
export function drawingContextOf(value: unknown, path: string): DrawingContext {
  const fields = record(value, path);
  if (fields.tracing === undefined) {
    throw new TypeError(
      `${path}: a task from paper's context, with its tracing paper, not another`,
    );
  }
  const tracing = tracingFieldsOf(fields.tracing, `${path}.tracing`);
  const crop = record(fields.crop, `${path}.crop`);
  const size = (v: unknown, at: string) => {
    if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > CROP.edge) {
      throw new TypeError(`${path}.crop.${at}: whole px from 1 to ${CROP.edge}, not ${shown(v)}`);
    }
    return v;
  };
  const width = size(crop.width, "width");
  const height = size(crop.height, "height");
  const box = crop.sheetBox;
  if (
    !Array.isArray(box) ||
    box.length !== 4 ||
    !box.every((v) => typeof v === "number" && Number.isFinite(v)) ||
    !(box[0] < box[2] && box[1] < box[3])
  ) {
    throw new TypeError(
      `${path}.crop.sheetBox: [ymin, xmin, ymax, xmax] in units, min < max, not ${shown(box)}`,
    );
  }
  if (!Array.isArray(fields.groups)) {
    throw new TypeError(
      `${path}.groups: the groups of the strokes sent, not ${shown(fields.groups)}`,
    );
  }
  if (typeof fields.digest !== "string" || !DIGEST.test(fields.digest)) {
    throw new TypeError(`${path}.digest: 16 hex digits, not ${shown(fields.digest)}`);
  }
  const sheetBox = Object.freeze([box[0], box[1], box[2], box[3]] as const);
  return { crop: { sheetBox, width, height }, tracing };
}

/**
 * The numbers of the drawing's crop of a part of the sheet, `region` in units: its places in whole
 * tenths, no margin, and as many px as keep its longer edge within `CROP.edge` and its visual
 * tokens within `CROP.tokens`, as every model of Claude takes it unscaled. The median it counts by
 * is the crop's ceiling, and D′ what makes a tenth of a unit D′ / median px. It holds no groups
 * and no frames: the drawing's crop goes to no check.
 */
export function drawingCropOf(region: Box): CropNumbers {
  const box = {
    minX: tenths(region.minX),
    minY: tenths(region.minY),
    maxX: Math.max(tenths(region.maxX), tenths(region.minX) + 1),
    maxY: Math.max(tenths(region.maxY), tenths(region.minY) + 1),
  };
  const median = CROP.ceiling * 10;
  const across = box.maxX - box.minX;
  const down = box.maxY - box.minY;
  const sized = (longer: number) => {
    const scale = longer / Math.max(across, down);
    return {
      scale,
      width: Math.max(1, Math.min(CROP.edge, Math.ceil(across * scale))),
      height: Math.max(1, Math.min(CROP.edge, Math.ceil(down * scale))),
    };
  };
  let size = sized(CROP.edge);
  for (let longer = CROP.edge; tokensOf(size) > CROP.tokens && longer > CROP.patch; ) {
    longer -= 8;
    size = sized(longer);
  }
  const { scale, width, height } = size;
  const drawn = scale * median;
  const numbers = { drawn, width, height, margins: [0, 0] as const, exact: { box, median } };
  return { ...numbers, sheetBox: sheetBoxOf(numbers), frames: [] };
}

/** A colour of the act: `#rrggbb`, its digits in either case, kept in lowercase as a style's. */
const COLOUR = /^#[0-9a-f]{6}$/i;

/** How a crop's pixels lie on the sheet: the crop's top left corner, in units, and px to a unit. */
interface Mapping {
  readonly x: number;
  readonly y: number;
  readonly across: number;
  readonly down: number;
}

/** The mapping of a crop by its numbers: its `sheetBox` on the sheet, and its size in px. */
function mappingOf({ crop }: DrawingContext): Mapping {
  const [ymin, xmin, ymax, xmax] = crop.sheetBox;
  return {
    x: xmin,
    y: ymin,
    across: crop.width / (xmax - xmin),
    down: crop.height / (ymax - ymin),
  };
}

/** A point of the sheet, in units, on the crop, in its pixels. */
export function toCrop(point: Point, submission: DrawingContext): Point {
  const map = mappingOf(submission);
  return { x: (point.x - map.x) * map.across, y: (point.y - map.y) * map.down };
}

/** A point of the crop, in its pixels, on the sheet, in units. */
export function fromCrop(point: Point, submission: DrawingContext): Point {
  const map = mappingOf(submission);
  return { x: map.x + point.x / map.across, y: map.y + point.y / map.down };
}

/**
 * The strokes a crop of a task from paper shows, for the drawing: of the strokes on the sheet, in
 * its order, those whose ink reaches into the crop, each where it lay when the crop was made — a
 * stroke of the tracing paper, `onTracing`, where the submission's tracing paper lay, and none of
 * it while that paper was hidden, as the drawing's crop shows it —, its points in the crop's pixels to a hundredth, thinned to `TUTOR.points`
 * at most.
 */
export function cropStrokesOf(
  strokes: readonly Stroke[],
  onTracing: (id: number) => boolean,
  submission: DrawingContext,
): CropStroke[] {
  const { at } = submission.tracing;
  const scale = submission.tracing.scale ?? 1;
  const [ymin, xmin, ymax, xmax] = submission.crop.sheetBox;
  const found: CropStroke[] = [];
  for (const stroke of strokes) {
    const traced = onTracing(stroke.id);
    if (traced && submission.tracing.hidden) continue;
    const placed = traced ? onSheet(stroke, at, scale) : stroke;
    const reach = reachOf(placed);
    const box = boxOf(placed.points);
    if (box.maxX + reach < xmin || box.minX - reach > xmax) continue;
    if (box.maxY + reach < ymin || box.minY - reach > ymax) continue;
    const points = placed.points.map((point) => toCrop(point, submission));
    const flat = thinned(points, TUTOR.points).flatMap(({ x, y }) => [rounded(x), rounded(y)]);
    found.push(Object.freeze({ id: stroke.id, points: Object.freeze(flat) }));
  }
  return found;
}

/**
 * A line's points thinned to `most` at most, its ends kept: as it is if it has no more, else by
 * Ramer–Douglas–Peucker, the tolerance growing until no more are left.
 */
export function thinned<T extends Point>(points: readonly T[], most: number): T[] {
  if (points.length <= most) return [...points];
  for (let tolerance = TUTOR.tolerance; ; tolerance *= TUTOR.growth) {
    const kept = simplified(points, tolerance);
    if (kept.length <= most) return kept;
  }
}

/**
 * Ramer–Douglas–Peucker: the points no further than `tolerance` off the segment between the kept
 * points around them go. A stack rather than a recursion: a line of thousands of points would
 * nest as deep.
 */
function simplified<T extends Point>(points: readonly T[], tolerance: number): T[] {
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const spans: [number, number][] = [[0, points.length - 1]];
  for (let span = spans.pop(); span !== undefined; span = spans.pop()) {
    const [from, to] = span;
    const a = points[from] as T;
    const b = points[to] as T;
    let farthest = -1;
    let distance = tolerance;
    for (let k = from + 1; k < to; k++) {
      const off = offSegment(points[k] as T, a, b);
      if (off > distance) {
        distance = off;
        farthest = k;
      }
    }
    if (farthest < 0) continue;
    keep[farthest] = 1;
    spans.push([from, farthest], [farthest, to]);
  }
  return points.filter((_, k) => keep[k] === 1);
}

/** How far a point lies from the segment ab: from a itself, should a and b be one point. */
function offSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = dx * dx + dy * dy;
  const share =
    length === 0 ? 0 : Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.y - a.y) * dy) / length));
  return Math.hypot(p.x - (a.x + share * dx), p.y - (a.y + share * dy));
}

/** A stroke the tutor writes, as its act gives it on the sheet: its style and its points. */
export interface TutorStroke {
  readonly style: StrokeStyle;
  readonly points: readonly Point[];
}

/**
 * The tutor's act on the sheet, checked: its strokes where they go, on the tracing paper, `on`,
 * when the submission's was shown — from the paper's corner, in its units —, else on the sheet,
 * and the IDs it takes off, in the order given, each once.
 */
export interface TutorPlan {
  readonly strokes: readonly TutorStroke[];
  readonly erase: readonly number[];
  readonly on?: "tracing";
}

/**
 * The tutor's act on a crop of the submission, checked and laid on the sheet: each stroke of two
 * points at least, in pairs of finite crop pixels that lie on the sheet, a colour `#rrggbb` and a
 * width of px above 0, a liner of that colour at full opacity and its width in the layer's units to
 * a tenth, within a style's bounds; and the IDs to take off, each a stroke of `showing`. On the
 * tracing paper a point is kept to the reach of the paper's own units, which a corner of the crop
 * past the paper's top left corner would otherwise leave. Anything else is a TypeError.
 */
export function tutorPlanOf(
  value: unknown,
  submission: DrawingContext,
  showing: ReadonlySet<number>,
): TutorPlan {
  const act = record(value, "act");
  if (!Array.isArray(act.strokes)) {
    throw new TypeError(`act.strokes: a list of strokes, not ${shown(act.strokes)}`);
  }
  const tracing = submission.tracing.hidden ? undefined : submission.tracing;
  const scale = tracing?.scale ?? 1;
  const map = mappingOf(submission);
  const strokes = Array.from(act.strokes, (item: unknown, n): TutorStroke => {
    const path = `act.strokes[${n}]`;
    const stroke = record(item, path);
    const flat = stroke.points;
    if (
      !Array.isArray(flat) ||
      flat.length < 4 ||
      flat.length % 2 !== 0 ||
      !flat.every((v) => typeof v === "number" && Number.isFinite(v))
    ) {
      throw new TypeError(
        `${path}.points: pairs of crop pixels, two points at least, not ${shown(flat)}`,
      );
    }
    const points: Point[] = [];
    for (let k = 0; k < flat.length; k += 2) {
      const point = fromCrop({ x: flat[k] as number, y: flat[k + 1] as number }, submission);
      if (!(point.x >= 0 && point.x <= REACH.width && point.y >= 0 && point.y <= REACH.height)) {
        throw new TypeError(
          `${path}.points[${k}]: a point of the crop on the sheet, not one off it at ${shown([point.x, point.y])}`,
        );
      }
      points.push(
        tracing === undefined
          ? point
          : {
              x: clamp((point.x - tracing.at[0]) / scale, 0, REACH.width),
              y: clamp((point.y - tracing.at[1]) / scale, 0, REACH.height),
            },
      );
    }
    const color = stroke.color;
    if (typeof color !== "string" || !COLOUR.test(color)) {
      throw new TypeError(`${path}.color: a colour #rrggbb, not ${shown(color)}`);
    }
    const width = stroke.width;
    if (typeof width !== "number" || !Number.isFinite(width) || width <= 0) {
      throw new TypeError(`${path}.width: crop pixels above 0, not ${shown(width)}`);
    }
    const [thinnest, widest] = STYLE_BOUNDS.width;
    const units = Math.round((width / map.across / scale) * 10) / 10;
    const style = Object.freeze({
      pen: "liner" as const,
      color: color.toLowerCase(),
      width: clamp(units, thinnest, widest),
      opacity: 100,
    });
    return Object.freeze({ style, points: Object.freeze(points) });
  });
  if (!Array.isArray(act.erase)) {
    throw new TypeError(`act.erase: a list of stroke IDs, not ${shown(act.erase)}`);
  }
  const erase: number[] = [];
  for (const [n, id] of Array.from(act.erase as unknown[]).entries()) {
    if (typeof id !== "number" || !showing.has(id)) {
      throw new TypeError(`act.erase[${n}]: the ID of a stroke the sheet shows, not ${shown(id)}`);
    }
    if (!erase.includes(id)) erase.push(id);
  }
  return tracing === undefined ? { strokes, erase } : { strokes, erase, on: "tracing" };
}

/** When each of the tutor's strokes is drawn, in ms from the act: its start and its end. */
export interface Timing {
  readonly start: number;
  readonly end: number;
}

/**
 * The times the tutor's strokes are drawn at, by their lengths in sheet units, in order: each at
 * the speed of a hand, `TUTOR.least` at the least, `TUTOR.pause` after the one before, and all of
 * it shortened alike to end within `TUTOR.most`.
 */
export function timingsOf(lengths: readonly number[]): Timing[] {
  const own = lengths.map((length) => Math.max(TUTOR.least, length / TUTOR.speed));
  const whole =
    own.reduce((sum, each) => sum + each, 0) + TUTOR.pause * Math.max(0, own.length - 1);
  const by = whole > TUTOR.most ? TUTOR.most / whole : 1;
  let at = 0;
  return own.map((each) => {
    const start = at;
    const end = start + each * by;
    at = end + TUTOR.pause * by;
    return { start, end };
  });
}

/** The length of a stroke's line, in its own units. */
export function lengthOf(points: readonly Point[]): number {
  let length = 0;
  for (let k = 1; k < points.length; k++) {
    const a = points[k - 1] as Point;
    const b = points[k] as Point;
    length += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return length;
}

/**
 * The part of a stroke drawn so far, a share of its length from its start: the whole stroke at 1,
 * else its points up to there and a point between two of them where the share ends, two points at
 * the least. The same ID, kind and style.
 */
export function drawnPart(stroke: Stroke, share: number): Stroke {
  if (share >= 1) return stroke;
  const { points } = stroke;
  const target = Math.max(0, share) * lengthOf(points);
  const part: InkPoint[] = [];
  let along = 0;
  for (let k = 0; k < points.length; k++) {
    const point = points[k] as InkPoint;
    const before = points[k - 1];
    if (before !== undefined) {
      const step = Math.hypot(point.x - before.x, point.y - before.y);
      if (along + step >= target) {
        const t = step === 0 ? 0 : (target - along) / step;
        part.push({
          x: before.x + (point.x - before.x) * t,
          y: before.y + (point.y - before.y) * t,
          t: point.t,
          p: point.p,
        });
        break;
      }
      along += step;
    }
    part.push(point);
  }
  return { ...stroke, points: part };
}

function rounded(value: number): number {
  return Math.round(value * TUTOR.places) / TUTOR.places;
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}
