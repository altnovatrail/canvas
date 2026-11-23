import type { PaperGrid, TracingReading, TracingState } from "@altnovatrail/spec/canvas";
import { record, shown } from "./fields.js";
import type { Box } from "./geometry.js";
import { tenths } from "./geometry.js";
import type { Grid } from "./grid.js";
import type { Stroke } from "./ink.js";
import type { Point } from "./screen.js";
import { REACH } from "./sheet.js";

/**
 * Where the tracing paper of a task from paper lies on the sheet, and whether it is hidden (R87):
 * spec's type, of the contract of canvas and app.
 */
export type { TracingState };

/**
 * The tracing paper's rule, in sheet units: the crop is drawn as large as fits within
 * `width` × `height`, in its own proportions; it starts at `at`, right of the bar of buttons, which
 * stands over the sheet's left edge; the keyboard moves it by `step`, or by `leap` with Shift. The
 * dots of its sheet stand `dots` apart.
 */
export const TRACING = Object.freeze({
  width: 800,
  height: 700,
  at: Object.freeze([180, 60] as const),
  step: 20,
  leap: 100,
  dots: 25,
});

/**
 * The tracing paper's scale (R89): from `min` to `max` times its own size, as the mockup's
 * `Zadacha-masshtab` has it; a button's press multiplies it by `button`, a notch of the wheel by
 * `wheel`, and a scale is kept in hundredths, as the percentage shows it.
 */
export const SCALE = Object.freeze({ min: 0.4, max: 4, button: 1.2, wheel: 1.08 });

/** A scale kept to the rule's bounds, in hundredths. */
export function scaleOf(scale: number): number {
  return Math.round(clamp(scale, SCALE.min, SCALE.max) * 100) / 100;
}

/** The scale of a tracing state: 1 where it has none. */
export function scaleIn(state: TracingState): number {
  return state.scale ?? 1;
}

/** A size as large as `scale` makes it. */
export function scaled(size: Size, scale: number): Size {
  return { width: size.width * scale, height: size.height * scale };
}

/**
 * The grids of a task from paper's sheet in the order its button turns them, round, the first as
 * the task comes.
 */
export const PAPER_GRIDS: readonly PaperGrid[] = Object.freeze([
  "dots",
  "lines",
  "blank",
  "squares",
]);

/** Each grid's rulings, in sheet units, as the mockup draws them: a blank sheet has none. */
const RULINGS: Readonly<Record<PaperGrid, Grid | undefined>> = Object.freeze({
  dots: Object.freeze({ kind: "dots", step: TRACING.dots }),
  lines: Object.freeze({ kind: "lines", step: 40 }),
  blank: undefined,
  squares: Object.freeze({ kind: "squares", step: TRACING.dots }),
});

/** Whether a value is a grid of a task from paper's sheet. */
export function isPaperGrid(value: unknown): value is PaperGrid {
  return typeof value === "string" && (PAPER_GRIDS as readonly string[]).includes(value);
}

/** The rulings of a task from paper's grid, or none for a blank sheet. */
export function rulingsOf(grid: PaperGrid): Grid | undefined {
  return RULINGS[grid];
}

/** The grid the button turns a task from paper's grid to: the next, round. */
export function nextGrid(grid: PaperGrid): PaperGrid {
  return PAPER_GRIDS[(PAPER_GRIDS.indexOf(grid) + 1) % PAPER_GRIDS.length] as PaperGrid;
}

/** The tracing paper's size on the sheet, in units. */
export interface Size {
  readonly width: number;
  readonly height: number;
}

/** The size before the crop's picture is read: the largest the tracing paper may be. */
export const LARGEST: Size = Object.freeze({ width: TRACING.width, height: TRACING.height });

/**
 * The tracing paper's size for a crop `width` × `height` px: as large as fits within the
 * rule's box, in the crop's proportions. A picture of no size has the largest.
 */
export function sizeOf(width: number, height: number): Size {
  if (!(width > 0 && height > 0)) return LARGEST;
  const scale = Math.min(TRACING.width / width, TRACING.height / height);
  return Object.freeze({ width: width * scale, height: height * scale });
}

/** Where a task from paper starts its tracing paper: at the rule's place, shown. */
export const TRACING_START: TracingState = Object.freeze({
  at: Object.freeze([TRACING.at[0], TRACING.at[1]] as const),
  hidden: false,
  scale: 1,
});

/**
 * A tracing state a consumer gives, checked and frozen: an object of `at`, [x, y] in
 * units, finite numbers, `hidden`, true or false, and `scale`, if any, from 0.4 to 4; other fields
 * are passed over. A state that puts the tracing paper of `size` at its scale wholly off the sheet
 * is a TypeError, as is anything else that is not such a state.
 */
export function tracingStateOf(value: unknown, size: Size): TracingState {
  const state = tracingFieldsOf(value, "tracing");
  if (whollyOff(state.at, scaled(size, scaleIn(state)))) {
    throw new TypeError(
      `tracing.at: ${shown(state.at)} puts the tracing paper wholly off the sheet`,
    );
  }
  return state;
}

/**
 * The fields of a tracing state at `path`, checked and frozen: `at`, [x, y] in units, finite
 * numbers, `hidden`, true or false, and `scale`, from 0.4 to 4, 1 where it is absent; other
 * fields are passed over. Anything else is a TypeError. Where it lies on the sheet is the caller's
 * to check.
 */
export function tracingFieldsOf(value: unknown, path: string): TracingState {
  const fields = record(value, path);
  const at = fields.at;
  if (
    !Array.isArray(at) ||
    at.length !== 2 ||
    !at.every((n) => typeof n === "number" && Number.isFinite(n))
  ) {
    throw new TypeError(`${path}.at: [x, y], its top left corner in sheet units, not ${shown(at)}`);
  }
  if (typeof fields.hidden !== "boolean") {
    throw new TypeError(`${path}.hidden: true or false, not ${shown(fields.hidden)}`);
  }
  const scale = fields.scale ?? 1;
  if (
    typeof scale !== "number" ||
    !Number.isFinite(scale) ||
    scale < SCALE.min ||
    scale > SCALE.max
  ) {
    throw new TypeError(
      `${path}.scale: a number from ${SCALE.min} to ${SCALE.max}, not ${shown(scale)}`,
    );
  }
  const [x, y] = at as [number, number];
  return Object.freeze({ at: Object.freeze([x, y] as const), hidden: fields.hidden, scale });
}

/** Whether the tracing paper of `size` at `at` lies wholly off the sheet, touching it at most. */
export function whollyOff(at: readonly [number, number], size: Size): boolean {
  const [x, y] = at;
  return x >= REACH.width || y >= REACH.height || x + size.width <= 0 || y + size.height <= 0;
}

/** The most statements a reading holds, as the attempt's tasks are. */
const STATEMENTS = 20;

/**
 * A reading of the statement a consumer gives, checked and frozen: `state` "ready" or
 * "busy", or "done" with `statements`, from none to 20 strings; other fields are passed over.
 * Anything else is a TypeError.
 */
export function readingOf(value: unknown): TracingReading {
  const fields = record(value, "reading");
  const state = fields.state;
  if (state === "ready" || state === "busy") return Object.freeze({ state });
  if (state !== "done") {
    throw new TypeError(`reading.state: "ready", "busy" or "done", not ${shown(state)}`);
  }
  const statements = fields.statements;
  if (
    !Array.isArray(statements) ||
    statements.length > STATEMENTS ||
    !statements.every((each) => typeof each === "string")
  ) {
    throw new TypeError(
      `reading.statements: up to ${STATEMENTS} strings, the statements read, not ${shown(statements)}`,
    );
  }
  return Object.freeze({ state, statements: Object.freeze([...(statements as string[])]) });
}

/** Whether two tracing states say the same. */
export function sameTracing(a: TracingState, b: TracingState): boolean {
  return (
    a.at[0] === b.at[0] && a.at[1] === b.at[1] && a.hidden === b.hidden && scaleIn(a) === scaleIn(b)
  );
}

/** The tracing paper's rectangle on the sheet, in units. */
export function rectOf(at: readonly [number, number], size: Size): Box {
  return { minX: at[0], minY: at[1], maxX: at[0] + size.width, maxY: at[1] + size.height };
}

/**
 * The place nearest `at` where the tracing paper of `size` lies wholly on the sheet: where the
 * learner's grip and keys leave it.
 */
export function keptOn(at: readonly [number, number], size: Size): readonly [number, number] {
  return Object.freeze([
    clamp(at[0], 0, Math.max(0, REACH.width - size.width)),
    clamp(at[1], 0, Math.max(0, REACH.height - size.height)),
  ] as const);
}

/** Whether a point of the sheet lies on the tracing paper, its edges too. */
export function onTracing(point: Point, at: readonly [number, number], size: Size): boolean {
  const { minX, minY, maxX, maxY } = rectOf(at, size);
  return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
}

/**
 * A point of the sheet as a stroke on the tracing paper of `size` at `scale` holds it: from the
 * paper's top left corner, in its own units, kept to the paper.
 */
export function toTracing(
  point: Point,
  at: readonly [number, number],
  size: Size,
  scale = 1,
): Point {
  return {
    x: clamp((point.x - at[0]) / scale, 0, size.width),
    y: clamp((point.y - at[1]) / scale, 0, size.height),
  };
}

/**
 * A stroke of the tracing paper where it lies on the sheet: its points scaled by `scale` and moved
 * by `at`, and kept to the sheet, should the paper lie in part beyond it — the rules of the groups
 * and the crop hold on the sheet alone. The same ID, kind and times.
 */
export function onSheet(stroke: Stroke, at: readonly [number, number], scale = 1): Stroke {
  return Object.freeze({
    id: stroke.id,
    kind: stroke.kind,
    points: Object.freeze(
      stroke.points.map(({ x, y, t, p }) =>
        Object.freeze({
          x: clamp(x * scale + at[0], 0, REACH.width),
          y: clamp(y * scale + at[1], 0, REACH.height),
          t,
          p,
        }),
      ),
    ),
  });
}

/**
 * The box of a tracing paper's stroke where it lies on the sheet, from the box of its points on the
 * paper: the box of `onSheet`'s points, for moving and keeping to the sheet keep the order of the
 * numbers, without a copy of the stroke.
 */
export function boxOnSheet(box: Box, at: readonly [number, number], scale = 1): Box {
  return {
    minX: clamp(box.minX * scale + at[0], 0, REACH.width),
    minY: clamp(box.minY * scale + at[1], 0, REACH.height),
    maxX: clamp(box.maxX * scale + at[0], 0, REACH.width),
    maxY: clamp(box.maxY * scale + at[1], 0, REACH.height),
  };
}

/**
 * The tracing paper's rectangle on the sheet in whole tenths of a unit, as the crop counts,
 * kept to the sheet: the part of it a crop of the work takes in.
 */
export function tenthsOf(rect: Box): Box {
  return {
    minX: tenths(clamp(rect.minX, 0, REACH.width)),
    minY: tenths(clamp(rect.minY, 0, REACH.height)),
    maxX: tenths(clamp(rect.maxX, 0, REACH.width)),
    maxY: tenths(clamp(rect.maxY, 0, REACH.height)),
  };
}

/** A grey picture, a byte to a pixel, row by row from the top: white 255. */
export interface Gray {
  readonly gray: Uint8Array;
  readonly width: number;
  readonly height: number;
}

/**
 * The grey of a picture's pixels, four bytes each — red, green, blue and alpha — as a canvas reads
 * them: the luma of BT.601 in whole numbers, over white where a pixel is transparent.
 */
export function grayOf(rgba: Uint8ClampedArray | Uint8Array, width: number, height: number): Gray {
  if (rgba.length !== 4 * width * height) {
    throw new RangeError(`${rgba.length} bytes are no picture ${width} × ${height}`);
  }
  const gray = new Uint8Array(width * height);
  for (let at = 0; at < gray.length; at++) {
    const r = rgba[4 * at] as number;
    const g = rgba[4 * at + 1] as number;
    const b = rgba[4 * at + 2] as number;
    const a = rgba[4 * at + 3] as number;
    const luma = Math.round((299 * r + 587 * g + 114 * b) / 1000);
    gray[at] = Math.round((luma * a + 255 * (255 - a)) / 255);
  }
  return { gray, width, height };
}

/**
 * The crop's picture laid into the pixels of a crop of the work, multiplied, as the screen
 * lays the tracing paper over the sheet: `ink` the crop's pixels, `width` px wide, and `rect`
 * where the tracing paper lies on them, in px, which may reach beyond them. Each pixel of the crop
 * under the paper takes the mean of the picture's pixels whose centres fall within it, or the one
 * nearest its centre when none does, so the crop shrinks or grows by sums of whole numbers alone,
 * the same in every engine. Changes `ink` in place.
 */
export function layOver(
  ink: Uint8Array,
  width: number,
  picture: Gray,
  rect: {
    readonly left: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
  },
): void {
  const height = ink.length / width;
  const across = (rect.right - rect.left) / picture.width;
  const down = (rect.bottom - rect.top) / picture.height;
  if (!(across > 0 && down > 0)) return;
  const firstColumn = Math.max(0, Math.floor(rect.left));
  const lastColumn = Math.min(width - 1, Math.ceil(rect.right) - 1);
  const firstRow = Math.max(0, Math.floor(rect.top));
  const lastRow = Math.min(height - 1, Math.ceil(rect.bottom) - 1);
  // The picture's columns, and rows, whose centres fall within each pixel of the crop.
  const spans = (first: number, last: number, start: number, scale: number, size: number) => {
    const out: [number, number][] = [];
    for (let at = first; at <= last; at++) {
      let from = Math.ceil((at - start) / scale - 0.5);
      let to = Math.ceil((at + 1 - start) / scale - 0.5) - 1;
      if (to < from) {
        from = Math.floor((at + 0.5 - start) / scale);
        to = from;
      }
      out.push([clamp(from, 0, size - 1), clamp(to, 0, size - 1)]);
    }
    return out;
  };
  const columns = spans(firstColumn, lastColumn, rect.left, across, picture.width);
  const rows = spans(firstRow, lastRow, rect.top, down, picture.height);
  for (const [r, [rowFrom, rowTo]] of rows.entries()) {
    const row = firstRow + r;
    for (const [c, [columnFrom, columnTo]] of columns.entries()) {
      let sum = 0;
      let count = 0;
      for (let y = rowFrom; y <= rowTo; y++) {
        for (let x = columnFrom; x <= columnTo; x++) {
          sum += picture.gray[y * picture.width + x] as number;
          count += 1;
        }
      }
      const at = row * width + firstColumn + c;
      const mean = Math.round(sum / count);
      ink[at] = Math.round(((ink[at] as number) * mean) / 255);
    }
  }
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}
