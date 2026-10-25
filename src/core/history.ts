import type { Stroke } from "./ink.js";

/**
 * An event of the history of writing (R09, R22): what an action on the sheet did, at the sheet's
 * time `t` when it landed, in the order the actions landed — so `t` never goes back along a
 * history. Each event says which strokes it put on the sheet or took off, so whoever reads the
 * history replays it without the rules of the stack of undo (R19). The events are plain data, for
 * JSON as they are.
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
