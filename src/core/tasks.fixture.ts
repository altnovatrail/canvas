// The tasks and manifests of the tests and of the demo page: open views of the module format's
// draft 0.1 that the element takes (R32), each changed only where its test needs it, so that the
// tests say one thing about the format and change together when it does. A module of the tests
// alone: the build leaves it out, as it leaves out the tests (tsconfig.build.json), and the
// package check holds to that (scripts/package.ts).

import type { Manifest } from "./manifest.js";
import type { SheetCanvas, SheetItem, SheetTask, StatementPart } from "./task.js";

/** What a test gives a task on a handwriting sheet: the settings of its canvas, and the rest. */
export interface SheetChange {
  readonly id?: string;
  readonly statement?: readonly StatementPart[];
  readonly items?: readonly SheetItem[];
  readonly grid?: SheetCanvas["grid"];
  readonly grid_step?: number;
  readonly tools?: readonly string[];
}

/**
 * A task on a handwriting sheet: a statement of one line and an answer anywhere on the sheet,
 * unless the test gives others.
 */
export function sheetTask(change: SheetChange = {}): SheetTask {
  const {
    id = "posts-1",
    statement = [{ text: "How many posts are there?" }],
    items = [{ answer_slots: [{ binding: "anywhere" }] }],
    ...canvas
  } = change;
  return { id, statement, canvas: { kind: "handwriting_sheet", ...canvas }, items };
}

/** A module's manifest in the format the element reads, in English unless the test says another. */
export function moduleManifest(
  change: { readonly digit_height?: number; readonly explanation?: string } = {},
): Manifest {
  const { digit_height, explanation = "en" } = change;
  const languages = { explanation };
  if (digit_height === undefined) return { module_format_version: "0.1", languages };
  return { module_format_version: "0.1", languages, canvas: { digit_height } };
}

/**
 * The path a TypeError names for a place that a JSON Pointer in URI fragment form names, as the
 * format's invalid examples do in their first line: #/items/0/zone is `task.items[0].zone`.
 */
export function pathOf(pointer: string, root: string): string {
  return pointer
    .split("/")
    .slice(1)
    .reduce((path, step) => (/^\d+$/.test(step) ? `${path}[${step}]` : `${path}.${step}`), root);
}

/** Whether a TypeError's message names this path, or a place under it, as `task.items[0]` does. */
export function under(message: string, path: string): boolean {
  return message.startsWith(path) && /^[:.[]/.test(message.slice(path.length));
}

/** The message of the TypeError a call throws: anything else it throws goes on, and none fails. */
export function refusal(call: () => unknown): string {
  try {
    call();
  } catch (error) {
    if (error instanceof TypeError) return error.message;
    throw error;
  }
  throw new Error("the call threw no TypeError");
}
