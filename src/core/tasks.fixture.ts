// The tasks, worked examples and manifests of the tests and of the demo page: open views of the
// module format 0.1 that the element takes (R32, R42), each changed only where its test needs it,
// so that the tests say one thing about the format and change together when it does. A module of
// the tests alone: the build leaves it out, as it leaves out the tests (tsconfig.build.json), and
// the package check holds to that (scripts/package.ts).

import type { CheckedExample, ExampleCanvas, ExamplePart } from "./example.js";
import type { Manifest } from "./manifest.js";
import type {
  SheetCanvas,
  SheetItem,
  SheetTask,
  StatementPart,
  WorkbookItem,
  WorkbookTask,
} from "./task.js";

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

/** A task on a workbook of these lines, with a statement of one line and the tools given, if any. */
export function workbookTask(
  items: readonly WorkbookItem[],
  tools?: readonly string[],
): WorkbookTask {
  const canvas = { kind: "workbook" as const, ...(tools === undefined ? {} : { tools }) };
  return { id: "tables-1", statement: [{ text: "Fill in the boxes." }], canvas, items };
}

/**
 * A module's manifest, whole, as app has its open view: the module of olympiad mathematics, in
 * English unless the test says another, with the height of a digit only if the test gives one.
 */
export function moduleManifest(
  change: { readonly digit_height?: number; readonly explanation?: string } = {},
): Manifest {
  const { digit_height, explanation = "en" } = change;
  return {
    module_format_version: "0.1",
    id: "novatrail/olympiad-math",
    version: "0.1.0",
    title: "Olympiad mathematics, grades 1–6",
    subject: "mathematics",
    audience: { age_categories: ["under_13"] },
    languages: { explanation },
    ...(digit_height === undefined ? {} : { canvas: { digit_height } }),
    authors: [{ name: "The NovaTrail authors" }],
    license: "Apache-2.0",
  };
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

/** What a test gives a worked example: its statement, its demo and its grid, and the rest. */
export interface ExampleChange {
  readonly statement?: readonly StatementPart[];
  readonly demo?: readonly ExamplePart[];
  readonly grid?: ExampleCanvas["grid"];
  readonly grid_step?: number;
}

/**
 * The demo of most worked examples: a paragraph, a picture beside the sheet, a picture on an area
 * of it, and a paragraph, as the format's lesson of gaps and posts has them.
 */
export const DEMO: readonly ExamplePart[] = Object.freeze([
  { text: "Draw the path, and mark a lamp at each end." },
  { picture: "pictures/lamp.png", alt: "A lamp.", width: 60, height: 120 },
  {
    picture: "pictures/path-in-gaps.png",
    alt: "A line for the path, cut into 4 equal gaps of 5 m, with a lamp at every mark.",
    area: { left: 100, top: 150, width: 800, height: 200 },
  },
  { text: "20 ÷ 5 = 4 gaps, and one lamp more than gaps: 5 lamps." },
]);

/**
 * A worked example on a handwriting sheet ruled in squares: a statement of one line and the demo
 * of DEMO, unless the test gives others.
 */
export function workedExample(change: ExampleChange = {}): CheckedExample {
  const {
    statement = [{ text: "A path is 20 m long, with a lamp every 5 m. How many lamps are there?" }],
    demo = DEMO,
    ...canvas
  } = change;
  return { statement, canvas: { kind: "handwriting_sheet", ...canvas }, demo };
}
