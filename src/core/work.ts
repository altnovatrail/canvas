import type { Stroke } from "./ink.js";

/**
 * An action on the sheet, the thing undo takes back (R19): a stroke written, or the sheet cleared,
 * with the strokes that were on it. T10 adds the erasing of strokes.
 */
type Action =
  | { readonly kind: "write"; readonly stroke: Stroke }
  | { readonly kind: "clear"; readonly strokes: readonly Stroke[] };

/**
 * The work on the sheet: the strokes in sight, and the stack of the actions that undo takes back,
 * the last first (R19). Clearing is an action too, so undo brings the strokes back. Nothing is
 * redone.
 */
export class Work {
  #strokes: readonly Stroke[] = [];
  readonly #done: Action[] = [];

  /**
   * The strokes on the sheet, in the order they were written. Every action gives a new array, and
   * undoing a clearing gives back the very one it cleared.
   */
  get strokes(): readonly Stroke[] {
    return this.#strokes;
  }

  /**
   * A stroke is written: it goes on the sheet and on the stack. The sheet gets a new array rather
   * than a longer one, for an array once handed out never changes: a clearing keeps the one it
   * cleared, and whoever read `strokes` keeps what they read.
   */
  write(stroke: Stroke): void {
    this.#strokes = [...this.#strokes, stroke];
    this.#done.push({ kind: "write", stroke });
  }

  /**
   * Takes back the last action: a written stroke goes, a clearing brings its strokes back. On a
   * sheet without actions nothing changes.
   */
  undo(): boolean {
    const action = this.#done.pop();
    if (action === undefined) return false;
    if (action.kind === "write") {
      // Each undo gives back the sheet as it was after the action before, so a written stroke is
      // the last on the sheet when its writing is undone.
      this.#strokes = this.#strokes.slice(0, -1);
    } else {
      this.#strokes = action.strokes;
    }
    return true;
  }

  /** Takes every stroke off the sheet, in one action. Clearing an empty sheet is no action. */
  clear(): boolean {
    if (this.#strokes.length === 0) return false;
    this.#done.push({ kind: "clear", strokes: this.#strokes });
    this.#strokes = [];
    return true;
  }
}
