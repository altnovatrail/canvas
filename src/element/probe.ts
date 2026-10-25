// What a test sees of an element: its strokes, its history of writing, what the eraser is about to
// take, its view of the sheet and how many outlines it has drawn. This module is no entry point of
// the package, so the element's interface stays what the tasks of the sheet make it (R07, R12,
// R19, R22; RUN.md, T10, T33, T34).

import type { HistoryEvent } from "../core/history.js";
import type { Stroke } from "../core/ink.js";
import type { View } from "../core/screen.js";

/** An element's state, as its test reads it. */
export interface Probe {
  /** The strokes on the sheet, in the order they were written: the work's, after any undo. */
  readonly strokes: readonly Stroke[];
  /** The stroke being written, or nothing between strokes. */
  readonly live: Stroke | undefined;
  /** The history of writing: every action on the sheet, in the order it landed. */
  readonly history: readonly HistoryEvent[];
  /** The IDs of the strokes the eraser under way has come near, or none between presses. */
  readonly pending: readonly number[];
  /** How many outlines of strokes the element has computed so far. */
  readonly outlines: number;
  /** Where the sheet is on the screen, or nothing while the element is not laid out. */
  readonly view: View | undefined;
}

const probes = new WeakMap<object, () => Probe>();

/** Called by each element as it is built, with what reads its state. */
export function attachProbe(element: object, read: () => Probe): void {
  probes.set(element, read);
}

/** The state of an element of this package. */
export function probe(element: object): Probe {
  const read = probes.get(element);
  if (read === undefined) throw new Error("not an element of this package");
  return read();
}
