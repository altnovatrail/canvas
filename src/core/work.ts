import RBush from "rbush";
import { Clock } from "./clock.js";
import { shown } from "./fields.js";
import { type Box, boxOf, segmentBox, segmentDistance } from "./geometry.js";
import { GROUP_RULE } from "./groups.js";
import { frozen, type HistoryEvent, historyOf, sameEvent } from "./history.js";
import type { Stroke } from "./ink.js";
import type { Point } from "./screen.js";

/**
 * An action on the sheet, the thing undo takes back (R19, R22): a stroke written; strokes erased,
 * each with the place it had on the sheet; or the sheet cleared, with the strokes that were on it.
 */
type Action =
  | { readonly kind: "write"; readonly stroke: Stroke }
  | { readonly kind: "erase"; readonly erased: readonly Erased[] }
  | { readonly kind: "clear"; readonly strokes: readonly Stroke[] };

/** An erased stroke, with its place among the strokes on the sheet before the erasing. */
interface Erased {
  readonly at: number;
  readonly stroke: Stroke;
}

/** A stroke in the index: the box around its points. */
interface Entry extends Box {
  readonly stroke: Stroke;
}

/**
 * The work on the sheet: the strokes in sight, the stack of the actions that undo takes back, the
 * last first (R19), and the history of writing, every action as an event at the sheet's time
 * (R22). Clearing and erasing are actions too, so undo brings their strokes back. Nothing is
 * redone. The times its methods take are the page's, and the sheet's clock turns one into the
 * sheet's time only when the action lands: an undo that has nothing to take back is no event. A
 * history given to the sheet is replayed by the same rules, each action at its own time (R27).
 */
export class Work {
  readonly #clock: Clock;
  #strokes: readonly Stroke[] = [];
  /**
   * Whether a history is being replayed into the work (`restore`): a stroke written then goes onto
   * the array of the sheet as it is, for no one has been handed that array yet.
   */
  #replaying = false;
  readonly #done: Action[] = [];
  /** The history's events, and the copy of them last handed out, until the next action. */
  readonly #events: HistoryEvent[] = [];
  #history: readonly HistoryEvent[] | undefined;
  /** The index of the strokes on the sheet, built anew for each new array of them. */
  #index = new RBush<Entry>();
  #indexed: readonly Stroke[] = this.#strokes;
  readonly #entries = new WeakMap<Stroke, Entry>();

  constructor(clock = new Clock()) {
    this.#clock = clock;
  }

  /**
   * The work a history of writing given to the sheet leaves (R27): its strokes, its stack of
   * actions for undo and the history itself, in frozen objects of the work's own. The events are
   * checked as `historyOf` checks them, then replayed by the work's own rules, each at its own time,
   * and each must be what the work records for it: an erasing takes off strokes on the sheet, in
   * the sheet's order; a clearing clears a sheet with strokes, all of them; an undo takes back the
   * last action still in force and says what the stack says. A history the sheet could not have
   * written is a TypeError that names the event. The clock is not asked: it goes on as the sheet
   * that takes the work tells it (`Clock.resume`).
   */
  static restore(value: unknown, clock: Clock): Work {
    const work = new Work(clock);
    work.#replaying = true;
    for (const [n, event] of historyOf(value).entries()) work.#replay(event, `history[${n}]`);
    work.#replaying = false;
    // A new array for the sheet, which the index of the strokes is then built for.
    work.#strokes = [...work.#strokes];
    return work;
  }

  /**
   * The strokes on the sheet, in the order they were written. Every action gives a new array, and
   * undoing a clearing gives back the very one it cleared.
   */
  get strokes(): readonly Stroke[] {
    return this.#strokes;
  }

  /**
   * Whether undo has an action to take back (R19): the stack is not empty. The element's Undo
   * button stands unavailable while it is (R28).
   */
  get undoable(): boolean {
    return this.#done.length > 0;
  }

  /**
   * The history of writing: every action, in the order it landed, frozen through. An array once
   * handed out never changes: after an action the history is a new one, made when it is next asked
   * for.
   */
  get history(): readonly HistoryEvent[] {
    this.#history ??= Object.freeze([...this.#events]);
    return this.#history;
  }

  /**
   * A stroke is written: it goes on the sheet and on the stack. The sheet gets a new array rather
   * than a longer one, for an array once handed out never changes: a clearing keeps the one it
   * cleared, and whoever read `strokes` keeps what they read. It lands at the sheet's latest time:
   * its last point's, unless an action landed while it was under way and it ended without its
   * pointerup, its last point earlier.
   */
  write(stroke: Stroke): void {
    this.#write(stroke, Math.max(this.#clock.latest, stroke.points.at(-1)?.t ?? 0));
  }

  /**
   * Takes the strokes of these IDs off the sheet, whole, in one action — one press of the eraser.
   * IDs no longer on the sheet are left out; if none is on it, nothing is done.
   */
  erase(ids: Iterable<number>, time: number): boolean {
    return this.#erase(ids, () => this.#clock.at(time));
  }

  /**
   * Takes back the last action: a written stroke goes, erased strokes come back to their places, a
   * clearing brings its strokes back. On a sheet without actions nothing changes.
   */
  undo(time: number): boolean {
    return this.#undo(() => this.#clock.at(time));
  }

  /** Takes every stroke off the sheet, in one action. Clearing an empty sheet is no action. */
  clear(time: number): boolean {
    return this.#clear(() => this.#clock.at(time));
  }

  /**
   * The strokes on the sheet whose line comes within `reach` of the segment from `from` to `to`, in
   * sheet units: the index finds those whose box is near enough, and the distance to each segment
   * of their points decides (R05). A segment whose ends are one point is that point.
   */
  near(from: Point, to: Point, reach: number): Stroke[] {
    const hits: Stroke[] = [];
    for (const { stroke } of this.#indexOf().search(segmentBox(from, to, reach))) {
      if (lineDistance(stroke, from, to) <= reach) hits.push(stroke);
    }
    return hits;
  }

  // The actions, each with the sheet's time it lands at, asked for only once it does.

  #write(stroke: Stroke, t: number): void {
    // A history replayed writes its strokes one after another, without a copy of the sheet for
    // each: thousands of strokes would copy the sheet thousands of times. A clearing keeps the array
    // it cleared and leaves the sheet a new one, so no array an action keeps grows by it.
    if (this.#replaying) (this.#strokes as Stroke[]).push(stroke);
    else this.#strokes = [...this.#strokes, stroke];
    this.#done.push({ kind: "write", stroke });
    this.#record({ kind: "write", t, stroke });
  }

  #erase(ids: Iterable<number>, at: () => number): boolean {
    const wanted = new Set(ids);
    const erased: Erased[] = [];
    const kept: Stroke[] = [];
    for (const [place, stroke] of this.#strokes.entries()) {
      if (wanted.has(stroke.id)) erased.push({ at: place, stroke });
      else kept.push(stroke);
    }
    if (erased.length === 0) return false;
    this.#strokes = kept;
    this.#done.push({ kind: "erase", erased });
    this.#record({ kind: "erase", t: at(), ids: erased.map(({ stroke }) => stroke.id) });
    return true;
  }

  #undo(at: () => number): boolean {
    const action = this.#done.pop();
    if (action === undefined) return false;
    const t = at();
    if (action.kind === "write") {
      // Each undo gives back the sheet as it was after the action before, so a written stroke is
      // the last on the sheet when its writing is undone.
      this.#strokes = this.#strokes.slice(0, -1);
      this.#record({ kind: "undo", t, removed: [action.stroke.id], restored: [] });
    } else if (action.kind === "erase") {
      // The sheet is as the erasing left it: each stroke goes back to its place, the first first.
      const strokes = [...this.#strokes];
      for (const { at: place, stroke } of action.erased) strokes.splice(place, 0, stroke);
      this.#strokes = strokes;
      const restored = action.erased.map(({ stroke }) => stroke.id);
      this.#record({ kind: "undo", t, removed: [], restored });
    } else {
      this.#strokes = action.strokes;
      const restored = action.strokes.map((stroke) => stroke.id);
      this.#record({ kind: "undo", t, removed: [], restored });
    }
    return true;
  }

  #clear(at: () => number): boolean {
    if (this.#strokes.length === 0) return false;
    const strokes = this.#strokes;
    this.#done.push({ kind: "clear", strokes });
    this.#strokes = [];
    this.#record({ kind: "clear", t: at(), ids: strokes.map((stroke) => stroke.id) });
    return true;
  }

  /**
   * One event of a history given to the sheet, replayed at its own time: what the work records for
   * it must be the event itself, or the history is not one the sheet could have written.
   */
  #replay(event: HistoryEvent, path: string): void {
    const at = () => event.t;
    let done = true;
    if (event.kind === "write") this.#write(event.stroke, event.t);
    else if (event.kind === "erase") done = this.#erase(event.ids, at);
    else if (event.kind === "clear") done = this.#clear(at);
    else done = this.#undo(at);
    const recorded = this.#events.at(-1);
    if (done && recorded !== undefined && sameEvent(recorded, event)) return;
    throw new TypeError(`${path}: ${what(event)}, ${done ? instead(recorded) : unable(event)}`);
  }

  #record(event: HistoryEvent): void {
    this.#events.push(frozen(event));
    this.#history = undefined;
  }

  /** The index of the strokes on the sheet, built anew if they are a new array since it was built. */
  #indexOf(): RBush<Entry> {
    if (this.#indexed !== this.#strokes) {
      this.#index = new RBush<Entry>().load(this.#strokes.map((stroke) => this.#entryOf(stroke)));
      this.#indexed = this.#strokes;
    }
    return this.#index;
  }

  #entryOf(stroke: Stroke): Entry {
    let entry = this.#entries.get(stroke);
    if (entry === undefined) {
      entry = { ...boxOf(stroke.points), stroke };
      this.#entries.set(stroke, entry);
    }
    return entry;
  }
}

/** The ID the next stroke takes after a history (R27): one past the highest written, or 1. */
export function nextIdOf(history: readonly HistoryEvent[]): number {
  let highest = 0;
  for (const event of history) {
    if (event.kind === "write") highest = Math.max(highest, event.stroke.id);
  }
  return highest + 1;
}

/**
 * Where the sheet's clock goes on after a history given to it (R27): past its last event by more
 * than the pause of the groups (R24), so that the first stroke after it is no neighbour of its
 * strokes; at 0 after an empty history, which is a new sheet's.
 */
export function resumeOf(history: readonly HistoryEvent[]): number {
  const last = history.at(-1);
  return last === undefined ? 0 : last.t + GROUP_RULE.pause + 1;
}

/** What an event of a history says it does, for a message. */
function what(event: HistoryEvent): string {
  switch (event.kind) {
    case "write":
      return `stroke ${event.stroke.id} written`;
    case "erase":
      return `strokes ${shown(event.ids)} erased`;
    case "clear":
      return `strokes ${shown(event.ids)} cleared`;
    case "undo":
      return `an undo that takes off ${shown(event.removed)} and brings back ${shown(event.restored)}`;
  }
}

/** What the sheet does instead, by the rules of its stack, for a message. */
function instead(recorded: HistoryEvent | undefined): string {
  switch (recorded?.kind) {
    case "erase":
      return `where the sheet takes off ${shown(recorded.ids)}, in its order`;
    case "clear":
      return `where the sheet clears ${shown(recorded.ids)}`;
    case "undo":
      return `where the last action still in force takes off ${shown(recorded.removed)} and brings back ${shown(recorded.restored)}`;
    default:
      return "which the sheet does otherwise";
  }
}

/** Why the sheet does nothing for an event, for a message. */
function unable(event: HistoryEvent): string {
  switch (event.kind) {
    case "erase":
      return "but none of them is on the sheet";
    case "clear":
      return "but the sheet is empty";
    default:
      return "but there is nothing to take back";
  }
}

/** How near a stroke's line — the segments between its points — comes to the segment ab. */
function lineDistance(stroke: Stroke, a: Point, b: Point): number {
  const [first, ...rest] = stroke.points;
  if (first === undefined) return Number.POSITIVE_INFINITY;
  if (rest.length === 0) return segmentDistance(a, b, first, first);
  let nearest = Number.POSITIVE_INFINITY;
  let previous = first;
  for (const point of rest) {
    nearest = Math.min(nearest, segmentDistance(a, b, previous, point));
    previous = point;
  }
  return nearest;
}
