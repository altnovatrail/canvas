import type { HistoryEvent, Piece } from "@altnovatrail/spec/canvas";
import { record, shown } from "./fields.js";
import { segmentDistance } from "./geometry.js";
import type { InkPoint, Stroke } from "./ink.js";
import { REACH } from "./sheet.js";
import { sameStyle, styleOf } from "./style.js";

/**
 * An event of the history of writing: spec's type, of the contract of canvas and app.
 * What an action on the sheet did, at the sheet's time `t` when it landed, in the
 * order the actions landed; each event says which strokes it put on the sheet or took off, so
 * whoever reads the history replays it without the rules of the stack of undo. Those the
 * sheet hands out are frozen through. A piece of a stroke the eraser cut, spec's type too: the ID
 * of the stroke it was cut of, and the piece, a stroke of its own.
 */
export type { HistoryEvent, Piece };

/**
 * The strokes a history leaves on the sheet, in the sheet's order: as they were written, and each
 * piece a cut left at the place of the stroke it was cut of, as the sheet puts it there. What the
 * sheet shows after it.
 */
export function replay(history: readonly HistoryEvent[]): Stroke[] {
  const written: Stroke[] = [];
  // The pieces cut of each stroke, which stand where it stood.
  const cutOf = new Map<number, Stroke[]>();
  const visible = new Set<number>();
  for (const event of history) {
    switch (event.kind) {
      case "write":
        written.push(event.stroke);
        visible.add(event.stroke.id);
        break;
      case "erase":
      case "clear":
        for (const id of event.ids) visible.delete(id);
        break;
      case "cut":
        for (const id of event.ids) visible.delete(id);
        for (const { of, stroke } of event.pieces) {
          const pieces = cutOf.get(of);
          if (pieces === undefined) cutOf.set(of, [stroke]);
          else pieces.push(stroke);
          visible.add(stroke.id);
        }
        break;
      case "tutor":
        for (const id of event.ids) visible.delete(id);
        for (const stroke of event.strokes) {
          written.push(stroke);
          visible.add(stroke.id);
        }
        break;
      case "undo":
        for (const id of event.removed) visible.delete(id);
        for (const id of event.restored) visible.add(id);
        break;
    }
  }
  const strokes: Stroke[] = [];
  // A stack rather than a recursion: a stroke cut again and again nests its pieces as deep.
  const next = [...written].reverse();
  for (let stroke = next.pop(); stroke !== undefined; stroke = next.pop()) {
    if (visible.has(stroke.id)) strokes.push(stroke);
    const pieces = cutOf.get(stroke.id) ?? [];
    for (let k = pieces.length - 1; k >= 0; k--) next.push(pieces[k] as Stroke);
  }
  return strokes;
}

/**
 * The events of a history given to the sheet, each checked field by field and copied into
 * frozen objects of the sheet's own, with only the fields the sheet keeps: others are passed over.
 * A value that is not such a history is a TypeError that names the field. Each event must be one of
 * the five, at a time from 0 that never goes back along the history; a stroke must have a new ID, a
 * whole number from 1, its style if it has one, and one point at least, each on the sheet, with a
 * pressure from 0 to 1, its times never going back and none after the time it landed. Times are
 * checked for their order alone: strokes may overlap in time, as several pointers at once would
 * write them. A cut names one stroke written at least, none twice, and its pieces are new strokes,
 * in the order of its IDs and along each stroke, each of one of them with its pointer and style: a
 * run of its points with one point of its own at most at each end, at times within the stroke's,
 * and never the whole stroke. On a task from paper, `paper`, a stroke written on the tracing
 * paper says so, `on: "tracing"`, its points from the paper's top left corner within the sheet's
 * size, and a piece cut of it is the tracing paper's too; anywhere else `on` is a TypeError. There
 * alone the tutor acts too, `tutor`: strokes or IDs to take off, one at least; its strokes new,
 * their IDs ascending above every ID before them, each of the pointer "tutor", of the pen "liner"
 * at full opacity, of two points at least, each at the event's time and of no pressure, and on the
 * tracing paper, `on: "tracing"`, as a stroke written there is. Whether the actions keep the rules of the stack, and take off strokes the sheet shows, the work
 * on the sheet checks as it replays them (`Work.restore`).
 */
export function historyOf(value: unknown, paper = false): HistoryEvent[] {
  if (!Array.isArray(value)) throw new TypeError(`history: a list of events, not ${shown(value)}`);
  const written = new Map<number, Stroke>();
  let latest = 0;
  // The highest ID so far, which the tutor's strokes number on from.
  let highest = 0;
  // A stroke written or a piece cut, which no stroke before it had the ID of.
  const fresh = (stroke: Stroke, path: string) => {
    if (written.has(stroke.id)) {
      throw new TypeError(`${path}.id: ${stroke.id}, the ID of a stroke written before`);
    }
    written.set(stroke.id, stroke);
    highest = Math.max(highest, stroke.id);
  };
  // Array.from visits every index, a hole too, which map would pass over unchecked.
  return Array.from(value, (item: unknown, n): HistoryEvent => {
    const path = `history[${n}]`;
    const fields = record(item, path);
    const t = timeOf(fields.t, `${path}.t`);
    if (t < latest) {
      throw new TypeError(`${path}.t: ${t}, earlier than the event before it, at ${latest}`);
    }
    latest = t;
    switch (fields.kind) {
      case "write": {
        const stroke = strokeOf(fields.stroke, `${path}.stroke`);
        fresh(stroke, `${path}.stroke`);
        landed(stroke, t, path);
        if (fields.on === undefined) return frozen({ kind: "write", t, stroke });
        if (fields.on !== "tracing" || !paper) {
          throw new TypeError(
            `${path}.on: ${paper ? '"tracing", or none' : "none, on a sheet with no task from paper"}, not ${shown(fields.on)}`,
          );
        }
        return frozen({ kind: "write", t, stroke, on: "tracing" });
      }
      case "tutor": {
        if (!paper) {
          throw new TypeError(
            `${path}.kind: "write", "erase", "cut", "clear" or "undo" on a sheet with no task from paper, not "tutor"`,
          );
        }
        const event = tutorOf(fields, t, path, highest);
        for (const [k, stroke] of event.strokes.entries()) fresh(stroke, `${path}.strokes[${k}]`);
        return frozen(event);
      }
      case "erase":
        return frozen({ kind: "erase", t, ids: idsOf(fields.ids, `${path}.ids`) });
      case "cut":
        return frozen(cutOf(fields, t, path, written, fresh));
      case "clear":
        return frozen({ kind: "clear", t, ids: idsOf(fields.ids, `${path}.ids`) });
      case "undo":
        return frozen({
          kind: "undo",
          t,
          removed: idsOf(fields.removed, `${path}.removed`),
          restored: idsOf(fields.restored, `${path}.restored`),
        });
      default:
        throw new TypeError(
          `${path}.kind: "write", "erase", "cut", "clear"${paper ? ', "tutor"' : ""} or "undo", not ${shown(fields.kind)}`,
        );
    }
  });
}

/** The pointer's kind of the tutor's strokes, which no browser reports for a pointer. */
export const TUTOR_POINTER = "tutor";

/**
 * A tutor's act's fields, checked: its strokes, each of the tutor's pointer, a liner at full
 * opacity, of two points at least at the event's time `t` and of no pressure, their IDs ascending
 * above `highest`; its IDs to take off, none twice; one of them at least; and `on`, "tracing" or
 * none.
 */
function tutorOf(
  fields: Record<string, unknown>,
  t: number,
  path: string,
  highest: number,
): HistoryEvent & { kind: "tutor" } {
  if (!Array.isArray(fields.strokes)) {
    throw new TypeError(
      `${path}.strokes: a list of the tutor's strokes, not ${shown(fields.strokes)}`,
    );
  }
  let above = highest;
  const strokes = Array.from(fields.strokes, (item: unknown, k): Stroke => {
    const at = `${path}.strokes[${k}]`;
    const stroke = strokeOf(item, at);
    if (stroke.id <= above) {
      throw new TypeError(
        `${at}.id: ${stroke.id}, not above ${above}: the tutor's strokes number on`,
      );
    }
    above = stroke.id;
    if (stroke.kind !== TUTOR_POINTER) {
      throw new TypeError(`${at}.kind: "${TUTOR_POINTER}", not ${shown(stroke.kind)}`);
    }
    if (stroke.style?.pen !== "liner" || stroke.style.opacity !== 100) {
      throw new TypeError(
        `${at}.style: a liner at 100 opacity, not ${shown(stroke.style ?? null)}`,
      );
    }
    if (stroke.points.length < 2) {
      throw new TypeError(`${at}.points: two points at least, not ${stroke.points.length}`);
    }
    for (const [n, point] of stroke.points.entries()) {
      if (point.t !== t || point.p !== 0) {
        throw new TypeError(
          `${at}.points[${n}]: at the event's time, ${t}, with no pressure, 0, not at ${point.t} with ${point.p}`,
        );
      }
    }
    return stroke;
  });
  const ids = idsOf(fields.ids, `${path}.ids`);
  if (strokes.length === 0 && ids.length === 0) {
    throw new TypeError(`${path}: strokes to write or IDs to take off, one at least, not neither`);
  }
  if (fields.on === undefined) return { kind: "tutor", t, strokes, ids };
  if (fields.on !== "tracing") {
    throw new TypeError(`${path}.on: "tracing", or none, not ${shown(fields.on)}`);
  }
  return { kind: "tutor", t, strokes, ids, on: "tracing" };
}

/** A stroke lands no sooner than its last point: a piece too, when its cut lands. */
function landed(stroke: Stroke, t: number, path: string): void {
  const end = stroke.points.at(-1)?.t ?? 0;
  if (t < end) {
    throw new TypeError(`${path}.t: ${t}, earlier than the stroke's last point, at ${end}`);
  }
}

/** A cut's fields, checked against the strokes written before it, `written`. */
function cutOf(
  fields: Record<string, unknown>,
  t: number,
  path: string,
  written: ReadonlyMap<number, Stroke>,
  fresh: (stroke: Stroke, path: string) => void,
): HistoryEvent & { kind: "cut" } {
  const ids = idsOf(fields.ids, `${path}.ids`);
  if (ids.length === 0) {
    throw new TypeError(`${path}.ids: a list of stroke IDs, one at least, not an empty one`);
  }
  const named = new Set<number>();
  for (const [k, id] of ids.entries()) {
    if (named.has(id)) throw new TypeError(`${path}.ids[${k}]: ${id}, named twice`);
    if (!written.has(id)) throw new TypeError(`${path}.ids[${k}]: ${id}, no stroke written before`);
    named.add(id);
  }
  if (!Array.isArray(fields.pieces)) {
    throw new TypeError(`${path}.pieces: a list of pieces, not ${shown(fields.pieces)}`);
  }
  // How far along its stroke the last piece of each went: the place of its last point of the
  // stroke's own, and its last time.
  const along = new Map<number, { readonly index: number; readonly time: number }>();
  let order = 0;
  const pieces = Array.from(fields.pieces, (item: unknown, j): Piece => {
    const at = `${path}.pieces[${j}]`;
    const piece = record(item, at);
    const of = idOf(piece.of, `${at}.of`);
    const place = ids.indexOf(of);
    if (place < 0) throw new TypeError(`${at}.of: ${of}, none of the strokes the cut takes off`);
    if (place < order) {
      throw new TypeError(
        `${at}.of: ${of}, after a piece of a stroke later in ids: the pieces go in their order`,
      );
    }
    order = place;
    const stroke = strokeOf(piece.stroke, `${at}.stroke`);
    fresh(stroke, `${at}.stroke`);
    landed(stroke, t, path);
    // Every ID the cut names is of a stroke written: no lookup misses.
    const source = written.get(of) as Stroke;
    along.set(of, pieceOf(stroke, source, `${at}.stroke`, along.get(of)));
    return { of, stroke };
  });
  return { kind: "cut", t, ids, pieces };
}

/** Where a piece of a stroke ends along it: the place of its last point of the stroke's, and its time. */
interface Along {
  readonly index: number;
  readonly time: number;
}

/** Where the first piece of a stroke may begin: anywhere along it. */
const ALONG_START: Along = Object.freeze({ index: -1, time: Number.NEGATIVE_INFINITY });

/**
 * What a piece must be of the stroke it was cut of: its pointer and its style, and a run of its
 * points with one point of its own at most at each end, past the piece of it before, `after`, at
 * times within the stroke's, and not the whole stroke. Where it ends along the stroke.
 */
function pieceOf(piece: Stroke, source: Stroke, path: string, after: Along = ALONG_START): Along {
  if (piece.kind !== source.kind) {
    throw new TypeError(
      `${path}.kind: ${shown(source.kind)}, the pointer of the stroke ${source.id} it was cut of, not ${shown(piece.kind)}`,
    );
  }
  if (!sameStyle(piece.style, source.style)) {
    throw new TypeError(
      `${path}.style: ${shown(source.style ?? null)}, the style of the stroke ${source.id} it was cut of, not ${shown(piece.style ?? null)}`,
    );
  }
  const { points } = piece;
  const own = source.points;
  if (points.length === own.length && points.every((point, k) => equalPoints(point, own[k]))) {
    throw new TypeError(`${path}.points: the whole stroke ${source.id}: a cut leaves only pieces`);
  }
  const inner = points.slice(1, -1);
  let start = -1;
  if (inner.length > 0) {
    const runAt = (k: number) => inner.every((point, j) => equalPoints(point, own[k + j]));
    for (let k = after.index + 1; k + inner.length <= own.length && start < 0; k++) {
      if (runAt(k)) start = k;
    }
    if (start < 0) {
      const anywhere = own.some((_, k) => runAt(k));
      throw new TypeError(
        anywhere
          ? `${path}.points: a run of the stroke ${source.id} before the end of its piece before: the pieces go along it`
          : `${path}.points: no run of the points of the stroke ${source.id}, with one of its own at most at each end`,
      );
    }
  }
  for (const k of [0, points.length - 1]) {
    const end = points[k];
    if (end !== undefined && !onLine(end, own)) {
      throw new TypeError(
        `${path}.points[${k}]: not on the line of the stroke ${source.id}, where a cut's edge crosses it`,
      );
    }
  }
  const first = own[0]?.t ?? 0;
  const last = own.at(-1)?.t ?? 0;
  const begins = points[0]?.t ?? 0;
  const ends = points.at(-1)?.t ?? 0;
  if (begins < after.time) {
    throw new TypeError(
      `${path}.points[0].t: ${begins}, before the piece of the stroke ${source.id} before it ends, at ${after.time}`,
    );
  }
  for (const [k, time] of [
    [0, begins],
    [points.length - 1, ends],
  ] as const) {
    if (time < first || time > last) {
      throw new TypeError(
        `${path}.points[${k}].t: ${time}, outside the times of the stroke ${source.id}, ${first} to ${last}`,
      );
    }
  }
  return { index: start < 0 ? after.index : start + inner.length - 1, time: ends };
}

/**
 * How far a piece's own end may lie off its stroke's line, in units: it was put on a segment by
 * interpolation, which rounds in the last bits alone.
 */
const ON_LINE = 1e-6;

/** Whether a point lies on the line through a stroke's points, a segment of it or its one point. */
function onLine(point: InkPoint, own: readonly InkPoint[]): boolean {
  if (own.length === 1 && own[0] !== undefined) {
    return segmentDistance(point, point, own[0], own[0]) <= ON_LINE;
  }
  for (let k = 1; k < own.length; k++) {
    const [a, b] = [own[k - 1], own[k]];
    if (a !== undefined && b !== undefined && segmentDistance(point, point, a, b) <= ON_LINE) {
      return true;
    }
  }
  return false;
}

/** Whether two points are the same: the place, the time and the pressure. */
function equalPoints(a: InkPoint, b: InkPoint | undefined): boolean {
  return b !== undefined && a.x === b.x && a.y === b.y && a.t === b.t && a.p === b.p;
}

/**
 * An event, frozen through: its stroke with its points and its style, a cut's pieces with theirs,
 * or its lists of IDs. Whoever holds an event the sheet handed out cannot change the sheet by it.
 */
export function frozen(event: HistoryEvent): HistoryEvent {
  if (event.kind === "write") {
    frozenStroke(event.stroke);
  } else if (event.kind === "undo") {
    Object.freeze(event.removed);
    Object.freeze(event.restored);
  } else if (event.kind === "tutor") {
    for (const stroke of event.strokes) frozenStroke(stroke);
    Object.freeze(event.strokes);
    Object.freeze(event.ids);
  } else {
    Object.freeze(event.ids);
    if (event.kind === "cut") {
      for (const piece of event.pieces) {
        frozenStroke(piece.stroke);
        Object.freeze(piece);
      }
      Object.freeze(event.pieces);
    }
  }
  return Object.freeze(event);
}

function frozenStroke(stroke: Stroke): void {
  for (const point of stroke.points) Object.freeze(point);
  Object.freeze(stroke.points);
  if (stroke.style !== undefined) Object.freeze(stroke.style);
  Object.freeze(stroke);
}

/**
 * Whether a value given as a history is the history the sheet has: the very array, or a list
 * whose every event says what the sheet's says, by the fields the sheet keeps — others are passed
 * over. `undefined` is the empty history. It never throws: a value that is no history is simply not
 * the same one.
 */
export function sameHistory(value: unknown, history: readonly HistoryEvent[]): boolean {
  if (value === history) return true;
  if (value === undefined) return history.length === 0;
  if (!Array.isArray(value) || value.length !== history.length) return false;
  try {
    return history.every((event, n) => sameEvent(value[n], event));
  } catch {
    // A getter of the consumer's that throws: no history the sheet keeps.
    return false;
  }
}

/** Whether a history is the beginning of another: shorter, and the same event for event. */
export function begins(history: readonly HistoryEvent[], of: readonly HistoryEvent[]): boolean {
  return history.length < of.length && history.every((event, n) => sameEvent(of[n], event));
}

/** Whether a value says what an event of the sheet's history says, by the fields it keeps. */
export function sameEvent(value: unknown, event: HistoryEvent): boolean {
  if (value === event) return true;
  if (typeof value !== "object" || value === null) return false;
  const given = value as Record<string, unknown>;
  if (given.kind !== event.kind || given.t !== event.t) return false;
  switch (event.kind) {
    case "write":
      return given.on === event.on && sameStroke(given.stroke, event.stroke);
    case "erase":
    case "clear":
      return sameIds(given.ids, event.ids);
    case "cut":
      return sameIds(given.ids, event.ids) && samePieces(given.pieces, event.pieces);
    case "tutor":
      return (
        given.on === event.on &&
        sameIds(given.ids, event.ids) &&
        sameStrokes(given.strokes, event.strokes)
      );
    case "undo":
      return sameIds(given.removed, event.removed) && sameIds(given.restored, event.restored);
  }
}

function sameStrokes(value: unknown, strokes: readonly Stroke[]): boolean {
  if (value === strokes) return true;
  if (!Array.isArray(value) || value.length !== strokes.length) return false;
  return strokes.every((stroke, n) => sameStroke(value[n], stroke));
}

function samePieces(value: unknown, pieces: readonly Piece[]): boolean {
  if (value === pieces) return true;
  if (!Array.isArray(value) || value.length !== pieces.length) return false;
  return pieces.every(({ of, stroke }, n) => {
    const given: unknown = value[n];
    if (typeof given !== "object" || given === null) return false;
    const piece = given as Record<string, unknown>;
    return piece.of === of && sameStroke(piece.stroke, stroke);
  });
}

function sameStroke(value: unknown, stroke: Stroke): boolean {
  if (value === stroke) return true;
  if (typeof value !== "object" || value === null) return false;
  const given = value as Record<string, unknown>;
  const points = given.points;
  return (
    given.id === stroke.id &&
    given.kind === stroke.kind &&
    sameStyleOf(given.style, stroke) &&
    Array.isArray(points) &&
    points.length === stroke.points.length &&
    stroke.points.every((point, n) => samePoint(points[n], point))
  );
}

/** Whether a value says a stroke's style, by its four fields: none for a stroke without one. */
function sameStyleOf(value: unknown, stroke: Stroke): boolean {
  const { style } = stroke;
  if (style === undefined || value === undefined) return value === style;
  if (typeof value !== "object" || value === null) return false;
  const given = value as Record<string, unknown>;
  return (
    given.pen === style.pen &&
    given.color === style.color &&
    given.width === style.width &&
    given.opacity === style.opacity
  );
}

function samePoint(value: unknown, point: InkPoint): boolean {
  if (value === point) return true;
  if (typeof value !== "object" || value === null) return false;
  const given = value as Record<string, unknown>;
  return given.x === point.x && given.y === point.y && given.t === point.t && given.p === point.p;
}

function sameIds(value: unknown, ids: readonly number[]): boolean {
  return (
    value === ids ||
    (Array.isArray(value) && value.length === ids.length && ids.every((id, n) => value[n] === id))
  );
}

function strokeOf(value: unknown, path: string): Stroke {
  const fields = record(value, path);
  const id = idOf(fields.id, `${path}.id`);
  if (typeof fields.kind !== "string") {
    throw new TypeError(`${path}.kind: the pointer's type, a string, not ${shown(fields.kind)}`);
  }
  const style = fields.style === undefined ? undefined : styleOf(fields.style, `${path}.style`);
  if (!Array.isArray(fields.points)) {
    throw new TypeError(`${path}.points: a list of points, not ${shown(fields.points)}`);
  }
  if (fields.points.length === 0) {
    throw new TypeError(`${path}.points: a list of points, one at least, not an empty one`);
  }
  let latest = 0;
  const points = Array.from(fields.points, (item: unknown, n): InkPoint => {
    const at = `${path}.points[${n}]`;
    const point = record(item, at);
    const x = within(point.x, `${at}.x`, 0, REACH.width);
    const y = within(point.y, `${at}.y`, 0, REACH.height);
    const t = timeOf(point.t, `${at}.t`);
    if (t < latest) {
      throw new TypeError(`${at}.t: ${t}, earlier than the point before it, at ${latest}`);
    }
    latest = t;
    const p = within(point.p, `${at}.p`, 0, 1);
    return { x, y, t, p };
  });
  return style === undefined
    ? { id, kind: fields.kind, points }
    : { id, kind: fields.kind, style, points };
}

function idsOf(value: unknown, path: string): readonly number[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`${path}: a list of stroke IDs, not ${shown(value)}`);
  }
  return Array.from(value, (id: unknown, n) => idOf(id, `${path}[${n}]`));
}

/**
 * A stroke's ID: a whole number from 1, and below the largest safe integer, so that the ID the
 * sheet gives the next stroke is a whole number too.
 */
function idOf(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value + 1) || value < 1) {
    throw new TypeError(
      `${path}: a stroke's ID, a whole number from 1 below 2^53 − 1, not ${shown(value)}`,
    );
  }
  return value;
}

function timeOf(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${path}: the sheet's time in milliseconds, from 0, not ${shown(value)}`);
  }
  return value;
}

function within(value: unknown, path: string, least: number, most: number): number {
  if (typeof value !== "number" || !(value >= least && value <= most)) {
    throw new TypeError(`${path}: a number from ${least} to ${most}, not ${shown(value)}`);
  }
  return value;
}
