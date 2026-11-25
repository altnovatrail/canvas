import RBush from "rbush";
import { Clock } from "./clock.js";
import { shown } from "./fields.js";
import { type Box, boxOf, segmentBox, segmentDistance } from "./geometry.js";
import { GROUP_RULE } from "./groups.js";
import {
  frozen,
  type HistoryEvent,
  historyOf,
  type Piece,
  sameEvent,
  TUTOR_POINTER,
} from "./history.js";
import type { Stroke } from "./ink.js";
import type { Point } from "./screen.js";
import { reachOf, type StrokeStyle } from "./style.js";

/**
 * An action on the sheet, the thing undo takes back: a stroke written; strokes erased,
 * each with the place it had on the sheet; strokes cut, with the sheet as it was before and the
 * pieces left; the sheet cleared, with the strokes that were on it; the tutor's act, with the
 * sheet as it was before, its strokes and the IDs it took off; or Select's move or copy, with the
 * sheet as it was before, the new strokes and the IDs they are of.
 */
type Action =
  | { readonly kind: "write"; readonly stroke: Stroke }
  | { readonly kind: "erase"; readonly erased: readonly Erased[] }
  | {
      readonly kind: "cut";
      readonly before: readonly Stroke[];
      readonly ids: readonly number[];
      readonly pieces: readonly Piece[];
    }
  | { readonly kind: "clear"; readonly strokes: readonly Stroke[] }
  | {
      readonly kind: "tutor" | "move" | "copy";
      readonly before: readonly Stroke[];
      readonly strokes: readonly Stroke[];
      readonly ids: readonly number[];
    };

/** What Select does with the strokes it took: moves them, or copies them. */
export type SelectAction = "move" | "copy";

/**
 * A stroke the tutor writes, before it lands: its ID, its style and its points in the units of its
 * layer. It lands with every point at the act's time and of no pressure, of the tutor's pointer.
 */
export interface TutorDraft {
  readonly id: number;
  readonly style: StrokeStyle;
  readonly points: readonly Point[];
}

/**
 * What one press of the eraser that takes a part left of a stroke it crossed: the stroke's ID,
 * and its pieces along it, new strokes with their own IDs — none when it covered the stroke whole.
 */
export interface Cutting {
  readonly id: number;
  readonly pieces: readonly Stroke[];
}

/** An erased stroke, with its place among the strokes on the sheet before the erasing. */
interface Erased {
  readonly at: number;
  readonly stroke: Stroke;
}

/** A stroke in the index: the box around its points, widened by how far its ink reaches. */
interface Entry extends Box {
  readonly stroke: Stroke;
}

/**
 * The work on the sheet: the strokes in sight, the stack of the actions that undo takes back, the
 * last first, and the history of writing, every action as an event at the sheet's time.
 * Clearing and erasing are actions too, so undo brings their strokes back. Nothing is
 * redone. The times its methods take are the page's, and the sheet's clock turns one into the
 * sheet's time only when the action lands: an undo that has nothing to take back is no event. A
 * history given to the sheet is replayed by the same rules, each action at its own time.
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
  /** The IDs of the strokes written on the tracing paper of a task from paper, and their pieces. */
  readonly #tracing = new Set<number>();
  /** The stroke each piece was cut of, by the piece's ID. */
  readonly #cutOf = new Map<number, number>();

  constructor(clock = new Clock()) {
    this.#clock = clock;
  }

  /**
   * The work a history of writing given to the sheet leaves: its strokes, its stack of
   * actions for undo and the history itself, in frozen objects of the work's own. The events are
   * checked as `historyOf` checks them, then replayed by the work's own rules, each at its own
   * time, and each must be what the work records for it: an erasing takes off strokes on the sheet,
   * in the sheet's order, and so does a cut, which leaves its pieces at their places, and the
   * tutor's act, which puts its strokes after every other; a clearing clears a sheet with strokes,
   * all of them; an undo takes back
   * the last action still in force and says what the stack says. A history the sheet could not have
   * written is a TypeError that names the event. The clock is not asked: it goes on as the sheet
   * that takes the work tells it (`Clock.resume`). On a task from paper, `paper`, a stroke may be
   * the tracing paper's.
   */
  static restore(value: unknown, clock: Clock, paper = false): Work {
    const work = new Work(clock);
    work.#replaying = true;
    for (const [n, event] of historyOf(value, paper).entries()) {
      work.#replay(event, `history[${n}]`);
    }
    work.#replaying = false;
    // A new array for the sheet, which the index of the strokes is then built for.
    work.#strokes = [...work.#strokes];
    return work;
  }

  /**
   * The strokes on the sheet, in the order they were written, each piece of a cut stroke at the
   * place the stroke had. Every action gives a new array, and undoing a clearing or a cut gives back
   * the very one it took off.
   */
  get strokes(): readonly Stroke[] {
    return this.#strokes;
  }

  /**
   * Whether undo has an action to take back: the stack is not empty. The element's Undo
   * button stands unavailable while it is.
   */
  get undoable(): boolean {
    return this.#done.length > 0;
  }

  /**
   * Whether a stroke of this ID was written on the tracing paper of a task from paper, its points
   * from the paper's corner.
   */
  onTracing(id: number): boolean {
    return this.#tracing.has(id);
  }

  /** Whether any stroke was written on the tracing paper, erased or not. */
  get traced(): boolean {
    return this.#tracing.size > 0;
  }

  /** Whether the tutor has acted on the sheet, whether an undo took the act back or not. */
  get tutored(): boolean {
    return this.#events.some((event) => event.kind === "tutor");
  }

  /**
   * The strokes a stroke was cut of, by their IDs: the stroke it is a piece of, the stroke that one
   * is a piece of, and on to a stroke written whole. None for a stroke written whole, or an ID the
   * work does not know.
   */
  cutFrom(id: number): readonly number[] {
    const from: number[] = [];
    for (let of = this.#cutOf.get(id); of !== undefined; of = this.#cutOf.get(of)) from.push(of);
    return from;
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
   * pointerup, its last point earlier. A stroke on the tracing paper says so, `on`.
   */
  write(stroke: Stroke, on?: "tracing"): void {
    this.#write(stroke, Math.max(this.#clock.latest, stroke.points.at(-1)?.t ?? 0), on);
  }

  /**
   * Takes the strokes of these IDs off the sheet, whole, in one action — one press of the eraser.
   * IDs no longer on the sheet are left out; if none is on it, nothing is done.
   */
  erase(ids: Iterable<number>, time: number): boolean {
    return this.#erase(ids, () => this.#clock.at(time));
  }

  /**
   * One press of the eraser that takes a part, in one action: each stroke it crossed, by its ID,
   * goes off the sheet, and its pieces come on at the place it had, so the strokes keep their order.
   * The event names the strokes in the sheet's order, and their pieces in that order and along
   * each. A stroke no longer on the sheet is left out, with its pieces; if none is on it, nothing is
   * done. The pieces' IDs are the caller's, new ones the history never had, and the pieces are the
   * cut stroke's layer's: a piece of the tracing paper's stroke is the tracing paper's.
   */
  cut(cuts: readonly Cutting[], time: number): boolean {
    return this.#cut(cuts, () => this.#clock.at(time));
  }

  /**
   * Takes back the last action: a written stroke goes, erased strokes come back to their places, a
   * cut takes its pieces off and puts its strokes back, a clearing brings its strokes back. On a
   * sheet without actions nothing changes.
   */
  undo(time: number): boolean {
    return this.#undo(() => this.#clock.at(time));
  }

  /**
   * The tutor's act, in one action: the strokes of these IDs the sheet shows go off it, and the
   * tutor's strokes come on after every other, at the act's time, on the tracing paper when `on`
   * says so. The IDs are the caller's, new ones above every ID the history had. An act that takes
   * nothing off and writes nothing is no action.
   */
  tutor(
    drafts: readonly TutorDraft[],
    ids: Iterable<number>,
    time: number,
    on?: "tracing",
  ): boolean {
    const strokesAt = (t: number) =>
      drafts.map(
        ({ id, style, points }): Stroke => ({
          id,
          kind: TUTOR_POINTER,
          style,
          points: points.map(({ x, y }) => ({ x, y, t, p: 0 })),
        }),
      );
    return this.#tutor(drafts.length, strokesAt, ids, () => this.#clock.at(time), on);
  }

  /**
   * Select's move or copy, in one action: the strokes of these IDs the sheet shows, all of one
   * layer, moved by `offset` in their layer's units, as new strokes after every other, their IDs
   * from `first` on in the sheet's order, the strokes they are of taken off for a move. IDs no
   * longer on the sheet are left out; none on it, or strokes of both layers, is no action.
   */
  select(
    kind: SelectAction,
    ids: Iterable<number>,
    offset: readonly [number, number],
    first: number,
    time: number,
  ): boolean {
    const [dx, dy] = offset;
    const moved = (taken: readonly Stroke[]) =>
      taken.map(
        (stroke, k): Stroke => ({
          ...stroke,
          id: first + k,
          points: stroke.points.map((point) => ({ ...point, x: point.x + dx, y: point.y + dy })),
        }),
      );
    return this.#select(kind, ids, moved, () => this.#clock.at(time));
  }

  /** Takes every stroke off the sheet, in one action. Clearing an empty sheet is no action. */
  clear(time: number): boolean {
    return this.#clear(() => this.#clock.at(time));
  }

  /**
   * The strokes on the sheet whose ink comes within `radius` of the segment from `from` to `to`,
   * in sheet units: whose line — the segments between its points — comes within `radius` and the
   * reach of its ink (`reachOf`). The index finds those whose box, widened by that reach, is near
   * enough, and the distance to each segment of their points decides. A segment whose ends are one
   * point is that point. On a task from paper an erasing takes the strokes of one layer alone,
   * `layer`: the tracing paper's, its points from its corner, or the sheet's.
   */
  near(from: Point, to: Point, radius: number, layer?: "tracing" | "sheet"): Stroke[] {
    const hits: Stroke[] = [];
    for (const { stroke } of this.#indexOf().search(segmentBox(from, to, radius))) {
      if (layer !== undefined && this.#tracing.has(stroke.id) !== (layer === "tracing")) continue;
      if (lineDistance(stroke, from, to) <= radius + reachOf(stroke)) hits.push(stroke);
    }
    return hits;
  }

  // The actions, each with the sheet's time it lands at, asked for only once it does.

  #write(stroke: Stroke, t: number, on?: "tracing"): void {
    // A history replayed writes its strokes one after another, without a copy of the sheet for
    // each: thousands of strokes would copy the sheet thousands of times. A clearing keeps the
    // array it cleared and leaves the sheet a new one, so no array an action keeps grows by it.
    if (this.#replaying) (this.#strokes as Stroke[]).push(stroke);
    else this.#strokes = [...this.#strokes, stroke];
    this.#done.push({ kind: "write", stroke });
    if (on === undefined) {
      this.#record({ kind: "write", t, stroke });
    } else {
      this.#tracing.add(stroke.id);
      this.#record({ kind: "write", t, stroke, on });
    }
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

  #cut(cuts: readonly Cutting[], at: () => number): boolean {
    const byId = new Map(cuts.map((cut) => [cut.id, cut.pieces]));
    const before = this.#strokes;
    const ids: number[] = [];
    const pieces: Piece[] = [];
    const strokes: Stroke[] = [];
    for (const stroke of before) {
      const left = byId.get(stroke.id);
      if (left === undefined) {
        strokes.push(stroke);
        continue;
      }
      ids.push(stroke.id);
      const traced = this.#tracing.has(stroke.id);
      for (const piece of left) {
        strokes.push(piece);
        pieces.push({ of: stroke.id, stroke: piece });
        this.#cutOf.set(piece.id, stroke.id);
        if (traced) this.#tracing.add(piece.id);
      }
    }
    if (ids.length === 0) return false;
    this.#strokes = strokes;
    this.#done.push({ kind: "cut", before, ids, pieces });
    this.#record({ kind: "cut", t: at(), ids, pieces });
    return true;
  }

  #tutor(
    count: number,
    strokesAt: (t: number) => readonly Stroke[],
    ids: Iterable<number>,
    at: () => number,
    on?: "tracing",
  ): boolean {
    const wanted = new Set(ids);
    const before = this.#strokes;
    const strokes: Stroke[] = [];
    const taken: number[] = [];
    for (const stroke of before) {
      if (wanted.has(stroke.id)) taken.push(stroke.id);
      else strokes.push(stroke);
    }
    if (taken.length === 0 && count === 0) return false;
    const t = at();
    const written = strokesAt(t);
    strokes.push(...written);
    if (on !== undefined) for (const stroke of written) this.#tracing.add(stroke.id);
    this.#strokes = strokes;
    this.#done.push({ kind: "tutor", before, strokes: written, ids: taken });
    this.#record(
      on === undefined
        ? { kind: "tutor", t, strokes: written, ids: taken }
        : { kind: "tutor", t, strokes: written, ids: taken, on },
    );
    return true;
  }

  #select(
    kind: SelectAction,
    ids: Iterable<number>,
    strokesOf: (taken: readonly Stroke[]) => readonly Stroke[],
    at: () => number,
    on?: "tracing",
  ): boolean {
    const wanted = new Set(ids);
    const before = this.#strokes;
    const taken = before.filter((stroke) => wanted.has(stroke.id));
    if (taken.length === 0) return false;
    const traced = this.#tracing.has((taken[0] as Stroke).id);
    if (taken.some((stroke) => this.#tracing.has(stroke.id) !== traced)) return false;
    // Replayed, the event says its layer, which must be the strokes'.
    if (on !== undefined && !traced) return false;
    const written = strokesOf(taken);
    if (written.length !== taken.length) return false;
    const t = at();
    const strokes =
      kind === "move" ? before.filter((stroke) => !wanted.has(stroke.id)) : [...before];
    strokes.push(...written);
    if (traced) for (const stroke of written) this.#tracing.add(stroke.id);
    this.#strokes = strokes;
    const taking = taken.map((stroke) => stroke.id);
    this.#done.push({ kind, before, strokes: written, ids: taking });
    this.#record(
      traced
        ? { kind, t, ids: taking, strokes: written, on: "tracing" }
        : { kind, t, ids: taking, strokes: written },
    );
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
    } else if (action.kind === "cut") {
      // The sheet is as the cut left it, so it goes back to the very sheet before the cut.
      this.#strokes = action.before;
      const removed = action.pieces.map(({ stroke }) => stroke.id);
      this.#record({ kind: "undo", t, removed, restored: [...action.ids] });
    } else if (action.kind === "tutor" || action.kind === "move") {
      // So is it as the tutor's act or the move left it, whole.
      this.#strokes = action.before;
      const removed = action.strokes.map((stroke) => stroke.id);
      this.#record({ kind: "undo", t, removed, restored: [...action.ids] });
    } else if (action.kind === "copy") {
      this.#strokes = action.before;
      this.#record({ kind: "undo", t, removed: action.strokes.map(({ id }) => id), restored: [] });
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
    if (event.kind === "write") this.#write(event.stroke, event.t, event.on);
    else if (event.kind === "erase") done = this.#erase(event.ids, at);
    else if (event.kind === "cut") done = this.#cut(cuttingsOf(event), at);
    else if (event.kind === "clear") done = this.#clear(at);
    else if (event.kind === "tutor") {
      done = this.#tutor(event.strokes.length, () => event.strokes, event.ids, at, event.on);
    } else if (event.kind === "move" || event.kind === "copy") {
      done = this.#select(event.kind, event.ids, () => event.strokes, at, event.on);
    } else done = this.#undo(at);
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
      const reach = reachOf(stroke);
      const { minX, minY, maxX, maxY } = boxOf(stroke.points);
      entry = {
        minX: minX - reach,
        minY: minY - reach,
        maxX: maxX + reach,
        maxY: maxY + reach,
        stroke,
      };
      this.#entries.set(stroke, entry);
    }
    return entry;
  }
}

/**
 * The ID the next stroke takes after a history: one past the highest written, a piece a cut left
 * too, or 1.
 */
export function nextIdOf(history: readonly HistoryEvent[]): number {
  let highest = 0;
  for (const event of history) {
    if (event.kind === "write") highest = Math.max(highest, event.stroke.id);
    else if (event.kind === "cut") {
      for (const { stroke } of event.pieces) highest = Math.max(highest, stroke.id);
    } else if (event.kind === "tutor" || event.kind === "move" || event.kind === "copy") {
      for (const stroke of event.strokes) highest = Math.max(highest, stroke.id);
    }
  }
  return highest + 1;
}

/** A cut of a history as the work takes one: each stroke it names, with its pieces. */
function cuttingsOf(event: HistoryEvent & { kind: "cut" }): Cutting[] {
  return event.ids.map((id) => ({
    id,
    pieces: event.pieces.filter(({ of }) => of === id).map(({ stroke }) => stroke),
  }));
}

/**
 * Where the sheet's clock goes on after a history given to it: past its last event by more
 * than the pause of the groups, so that the first stroke after it is no neighbour of its
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
    case "cut":
      return `strokes ${shown(event.ids)} cut into ${shown(event.pieces.map(({ stroke }) => stroke.id))}`;
    case "clear":
      return `strokes ${shown(event.ids)} cleared`;
    case "tutor":
      return `the tutor's act that writes ${shown(event.strokes.map(({ id }) => id))} and takes off ${shown(event.ids)}`;
    case "move":
    case "copy":
      return `strokes ${shown(event.ids)} ${event.kind === "move" ? "moved" : "copied"} as ${shown(event.strokes.map(({ id }) => id))}`;
    case "undo":
      return `an undo that takes off ${shown(event.removed)} and brings back ${shown(event.restored)}`;
  }
}

/** What the sheet does instead, by the rules of its stack, for a message. */
function instead(recorded: HistoryEvent | undefined): string {
  switch (recorded?.kind) {
    case "erase":
    case "cut":
    case "tutor":
    case "move":
      return `where the sheet takes off ${shown(recorded.ids)}, in its order`;
    case "copy":
      return `where the sheet copies ${shown(recorded.ids)}, in its order`;
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
    case "cut":
    case "tutor":
      return "but none of them is on the sheet";
    case "move":
    case "copy":
      return "but none of them is on the sheet, or they are of both layers, or not of its layer";
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
