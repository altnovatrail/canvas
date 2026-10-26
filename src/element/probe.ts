// What a test sees of an element beyond its interface: its strokes, the stroke under way, what the
// eraser is about to take, its view of the sheet, how many outlines it has drawn, the tutor's
// marks it shows and what each pointer down on it does (R29). The history of writing is the
// element's own property now (R27). This module is no entry point of the package, so the
// element's interface stays what the tasks of the sheet make it (R07, R12, R19, R22, R27, R29;
// RUN.md, T10, T14, T15, T33, T34, T35).

import type { Box } from "../core/geometry.js";
import type { Role } from "../core/hands.js";
import type { Stroke } from "../core/ink.js";
import type { View } from "../core/screen.js";

/** An element's state, as its test reads it. */
export interface Probe {
  /** The strokes on the sheet, in the order they were written: the work's, after any undo. */
  readonly strokes: readonly Stroke[];
  /** The stroke being written, or nothing between strokes. */
  readonly live: Stroke | undefined;
  /** The IDs of the strokes the eraser under way has come near, or none between presses. */
  readonly pending: readonly number[];
  /** How many outlines of strokes the element has computed so far. */
  readonly outlines: number;
  /** Where the sheet is on the screen, or nothing while the element is not laid out. */
  readonly view: View | undefined;
  /**
   * The tutor's marks the sheet shows, in their order: each one's name, the strokes it holds on to
   * and its frame as last drawn, in sheet units — null while none of its strokes is on the screen.
   * A mark without a place is not among them (R26).
   */
  readonly marks: readonly {
    readonly name: string;
    readonly ids: readonly number[];
    readonly frame: Box | null;
  }[];
  /** What each pointer down on the sheet does, by its `pointerId` (R29). */
  readonly roles: ReadonlyMap<number, Role>;
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
