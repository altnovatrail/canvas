import RBush from "rbush";
import { Clock } from "./clock.js";
import { type Box, boxOf, segmentBox, segmentDistance } from "./geometry.js";
import type { HistoryEvent } from "./history.js";
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
 * sheet's time only when the action lands: an undo that has nothing to take back is no event.
 */
export class Work {
  readonly #clock: Clock;
  #strokes: readonly Stroke[] = [];
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
   * The strokes on the sheet, in the order they were written. Every action gives a new array, and
   * undoing a clearing gives back the very one it cleared.
   */
  get strokes(): readonly Stroke[] {
    return this.#strokes;
  }

  /**
   * The history of writing: every action, in the order it landed. An array once handed out never
   * changes: after an action the history is a new one, copied when it is next asked for.
   */
  get history(): readonly HistoryEvent[] {
    this.#history ??= [...this.#events];
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
    this.#strokes = [...this.#strokes, stroke];
    this.#done.push({ kind: "write", stroke });
    const t = Math.max(this.#clock.latest, stroke.points.at(-1)?.t ?? 0);
    this.#record({ kind: "write", t, stroke });
  }

  /**
   * Takes the strokes of these IDs off the sheet, whole, in one action — one press of the eraser.
   * IDs no longer on the sheet are left out; if none is on it, nothing is done.
   */
  erase(ids: Iterable<number>, time: number): boolean {
    const wanted = new Set(ids);
    const erased: Erased[] = [];
    const kept: Stroke[] = [];
    for (const [at, stroke] of this.#strokes.entries()) {
      if (wanted.has(stroke.id)) erased.push({ at, stroke });
      else kept.push(stroke);
    }
    if (erased.length === 0) return false;
    this.#strokes = kept;
    this.#done.push({ kind: "erase", erased });
    const t = this.#clock.at(time);
    this.#record({ kind: "erase", t, ids: erased.map(({ stroke }) => stroke.id) });
    return true;
  }

  /**
   * Takes back the last action: a written stroke goes, erased strokes come back to their places, a
   * clearing brings its strokes back. On a sheet without actions nothing changes.
   */
  undo(time: number): boolean {
    const action = this.#done.pop();
    if (action === undefined) return false;
    const t = this.#clock.at(time);
    if (action.kind === "write") {
      // Each undo gives back the sheet as it was after the action before, so a written stroke is
      // the last on the sheet when its writing is undone.
      this.#strokes = this.#strokes.slice(0, -1);
      this.#record({ kind: "undo", t, removed: [action.stroke.id], restored: [] });
    } else if (action.kind === "erase") {
      // The sheet is as the erasing left it: each stroke goes back to its place, the first first.
      const strokes = [...this.#strokes];
      for (const { at, stroke } of action.erased) strokes.splice(at, 0, stroke);
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

  /** Takes every stroke off the sheet, in one action. Clearing an empty sheet is no action. */
  clear(time: number): boolean {
    if (this.#strokes.length === 0) return false;
    const strokes = this.#strokes;
    this.#done.push({ kind: "clear", strokes });
    this.#strokes = [];
    const ids = strokes.map((stroke) => stroke.id);
    this.#record({ kind: "clear", t: this.#clock.at(time), ids });
    return true;
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

  #record(event: HistoryEvent): void {
    this.#events.push(event);
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
