import { record, shown } from "./fields.js";
import type { InkPoint, Stroke } from "./ink.js";
import { SHEET } from "./sheet.js";

/**
 * An event of the history of writing (R09, R22): what an action on the sheet did, at the sheet's
 * time `t` when it landed, in the order the actions landed — so `t` never goes back along a
 * history. Each event says which strokes it put on the sheet or took off, so whoever reads the
 * history replays it without the rules of the stack of undo (R19). The events are plain data, for
 * JSON as they are; those the sheet hands out are frozen through (R27).
 */
export type HistoryEvent =
  /**
   * A stroke written, and when it landed: its last point's time, or later, if it ended without its
   * pointerup after an action that landed while it was under way.
   */
  | { readonly kind: "write"; readonly t: number; readonly stroke: Stroke }
  /** One press of the eraser: the strokes it took off, in the sheet's order, when it lifted. */
  | { readonly kind: "erase"; readonly t: number; readonly ids: readonly number[] }
  /** The sheet cleared: every stroke that was on it, in the sheet's order. */
  | { readonly kind: "clear"; readonly t: number; readonly ids: readonly number[] }
  /**
   * The last action still in force taken back: the stroke it took off, if it was a writing, or the
   * strokes it brought back, if it was an erasing or a clearing.
   */
  | {
      readonly kind: "undo";
      readonly t: number;
      readonly removed: readonly number[];
      readonly restored: readonly number[];
    };

/**
 * The strokes a history leaves on the sheet, in the order they were written: what the sheet shows
 * after it (R09).
 */
export function replay(history: readonly HistoryEvent[]): Stroke[] {
  const written: Stroke[] = [];
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
      case "undo":
        for (const id of event.removed) visible.delete(id);
        for (const id of event.restored) visible.add(id);
        break;
    }
  }
  return written.filter((stroke) => visible.has(stroke.id));
}

/**
 * The events of a history given to the sheet (R27), each checked field by field and copied into
 * frozen objects of the sheet's own, with only the fields the sheet keeps: others are passed over.
 * A value that is not such a history is a TypeError that names the field. Each event must be one of
 * the four, at a time from 0 that never goes back along the history; a stroke must have a new ID, a
 * whole number from 1, and one point at least, each on the sheet, with a pressure from 0 to 1, its
 * times never going back and none after the time it landed. Times are checked for their order
 * alone: with several pointers at once (T35) strokes may overlap in time. Whether the actions keep
 * the rules of the stack, the work on the sheet checks as it replays them (`Work.restore`).
 */
export function historyOf(value: unknown): HistoryEvent[] {
  if (!Array.isArray(value)) throw new TypeError(`history: a list of events, not ${shown(value)}`);
  const ids = new Set<number>();
  let latest = 0;
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
        if (ids.has(stroke.id)) {
          throw new TypeError(`${path}.stroke.id: ${stroke.id}, the ID of a stroke written before`);
        }
        ids.add(stroke.id);
        const end = stroke.points.at(-1)?.t ?? 0;
        if (t < end) {
          throw new TypeError(`${path}.t: ${t}, earlier than the stroke's last point, at ${end}`);
        }
        return frozen({ kind: "write", t, stroke });
      }
      case "erase":
        return frozen({ kind: "erase", t, ids: idsOf(fields.ids, `${path}.ids`) });
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
          `${path}.kind: "write", "erase", "clear" or "undo", not ${shown(fields.kind)}`,
        );
    }
  });
}

/**
 * An event, frozen through: its stroke with its points, or its lists of IDs (R27). Whoever holds
 * an event the sheet handed out cannot change the sheet by it.
 */
export function frozen(event: HistoryEvent): HistoryEvent {
  if (event.kind === "write") {
    for (const point of event.stroke.points) Object.freeze(point);
    Object.freeze(event.stroke.points);
    Object.freeze(event.stroke);
  } else if (event.kind === "undo") {
    Object.freeze(event.removed);
    Object.freeze(event.restored);
  } else {
    Object.freeze(event.ids);
  }
  return Object.freeze(event);
}

/**
 * Whether a value given as a history is the history the sheet has (R27): the very array, or a list
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
      return sameStroke(given.stroke, event.stroke);
    case "erase":
    case "clear":
      return sameIds(given.ids, event.ids);
    case "undo":
      return sameIds(given.removed, event.removed) && sameIds(given.restored, event.restored);
  }
}

function sameStroke(value: unknown, stroke: Stroke): boolean {
  if (value === stroke) return true;
  if (typeof value !== "object" || value === null) return false;
  const given = value as Record<string, unknown>;
  const points = given.points;
  return (
    given.id === stroke.id &&
    given.kind === stroke.kind &&
    Array.isArray(points) &&
    points.length === stroke.points.length &&
    stroke.points.every((point, n) => samePoint(points[n], point))
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
    const x = within(point.x, `${at}.x`, 0, SHEET.width);
    const y = within(point.y, `${at}.y`, 0, SHEET.height);
    const t = timeOf(point.t, `${at}.t`);
    if (t < latest) {
      throw new TypeError(`${at}.t: ${t}, earlier than the point before it, at ${latest}`);
    }
    latest = t;
    const p = within(point.p, `${at}.p`, 0, 1);
    return { x, y, t, p };
  });
  return { id, kind: fields.kind, points };
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
