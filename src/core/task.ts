// The open view of a task, in the names of the module format's draft 0.1 (R51 spec): the types are
// the element's own, of the composition the format gives, until spec's releases give its schemas
// and types (T35 in spec's RUN.md; R44 spec). The element checks a task as the schema does, every
// object closed: a field the open view has not — an old name, a closed field — is a TypeError
// (R32). One field is the element's own, `canvas.tools`, until the format has one (R28).

import { closed, listOf, shown, text, whole } from "./fields.js";
import {
  DEFAULT_GRID,
  GRID_KINDS,
  GRID_STEP,
  GRID_STEP_MAX,
  GRID_STEP_MIN,
  type Grid,
  type GridKind,
} from "./grid.js";

/** The canvas kinds of the module format: the handwriting sheet and the workbook. */
export const SHEET_KIND = "handwriting_sheet";
export const WORKBOOK_KIND = "workbook";

/**
 * What a press of the primary button does on the sheet: the pen writes, the eraser erases (R22). A
 * pen's eraser erases whatever the tool, if the task allows the eraser (R28).
 */
export type Tool = "pen" | "eraser";

/** The sheet's tools, in the order their buttons stand: the pen, the eraser. */
export const TOOLS: readonly Tool[] = Object.freeze(["pen", "eraser"]);

export function isTool(value: unknown): value is Tool {
  return (TOOLS as readonly unknown[]).includes(value);
}

/** A paragraph of a task's statement, or a piece of text of a workbook's line. */
export interface TextPart {
  readonly text: string;
}

/** A picture of a task's statement. */
export interface PicturePart {
  /** Its path from the module's media/, which the consumer's `media` takes to give its file. */
  readonly picture: string;
  /**
   * What the picture shows, in words: a screen reader reads it, and it stands in the picture's
   * place until the picture comes, or if it never does. Empty for a picture that only decorates.
   */
  readonly alt: string;
  /** The picture's size in whole CSS pixels, which it keeps narrower when the statement is. */
  readonly width: number;
  readonly height: number;
}

/** A part of a task's statement: a paragraph, or a picture. */
export type StatementPart = TextPart | PicturePart;

/** A rectangle of the handwriting sheet, in its units from the top left corner. */
export interface Zone {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/**
 * An answer slot of an item on a handwriting sheet: anywhere on the sheet, the whole sheet, a zone
 * of it, or a choice of options.
 */
export type AnswerSlot =
  | { readonly binding: "anywhere" | "sheet" }
  | { readonly binding: "zone"; readonly zone: Zone }
  | { readonly binding: "choice"; readonly options: readonly string[] };

/** An item of a handwriting sheet: its answer slots, and what it asks, "a)". */
export interface SheetItem {
  readonly text?: string;
  readonly answer_slots: readonly AnswerSlot[];
}

/** A piece of a workbook's line: a piece of text, or a box, an answer slot. */
export type LinePart = TextPart | { readonly binding: "box" };

/** An item of a workbook: a line of text and boxes, as in 7 × [ ] = 56. */
export interface WorkbookItem {
  readonly line: readonly LinePart[];
}

/** The canvas of a handwriting sheet: its grid, and the tools the task allows. */
export interface SheetCanvas {
  readonly kind: typeof SHEET_KIND;
  /** Squares unless given. */
  readonly grid?: GridKind;
  /** The grid's step in sheet units, a whole number from 20 to 500: 50 unless given. */
  readonly grid_step?: number;
  /**
   * The tools the task allows (concepts 8 spec; R28), the element's own field until the format has
   * one: the canvas takes "pen" and "eraser", and passes over the names it does not know — a
   * ruler, a calculator — which are app's to show or come with new versions of the canvas. The
   * pen and the eraser unless given; a list without the pen is a TypeError, for the canvas writes
   * with it.
   */
  readonly tools?: readonly string[];
}

/** The canvas of a workbook, which lays out its lines itself, and the tools the task allows. */
export interface WorkbookCanvas {
  readonly kind: typeof WORKBOOK_KIND;
  readonly tools?: readonly string[];
}

/** The open view of a task on a handwriting sheet. */
export interface SheetTask {
  /** The task's local ID. */
  readonly id: string;
  /** What the learner reads, in the module's explanation language, which the manifest names. */
  readonly statement: readonly StatementPart[];
  readonly canvas: SheetCanvas;
  readonly items: readonly SheetItem[];
}

/** The open view of a task on a workbook: a line for each item. */
export interface WorkbookTask {
  readonly id: string;
  readonly statement: readonly StatementPart[];
  readonly canvas: WorkbookCanvas;
  readonly items: readonly WorkbookItem[];
}

/**
 * The open view of a task, what the learner's app receives: its ID, its statement, its canvas and
 * its items — no key, solution or trap, nor its skills, band, difficulty and age categories
 * (R05 spec; R51 spec).
 */
export type Task = SheetTask | WorkbookTask;

/**
 * What the sheet makes of a task: the grid on the sheet, the statement above it and the tools it
 * allows, in the order of `TOOLS`.
 */
export interface Template {
  readonly grid: Grid;
  readonly statement: readonly StatementPart[];
  readonly tools: readonly Tool[];
}

/** The template of a sheet without a task: squares of 50 units, no statement, both tools. */
export const NO_TASK: Template = Object.freeze({
  grid: DEFAULT_GRID,
  statement: Object.freeze([]),
  tools: TOOLS,
});

/**
 * A task's open view, checked as the format's schema checks it, and a copy of it with the fields
 * the schema names: the element reads each field once, and what it shows is what it checked. What
 * the schema refuses is a TypeError that names the field by its path, a field the open view has not
 * among it. A field is left out by `undefined` alone: `null` is a value, and a wrong one.
 */
export function taskOf(value: unknown): Task {
  const task = closed(value, "task", ["id", "statement", "canvas", "items"], "a task's open view");
  const id = idOf(task.id, "task.id");
  const statement = listOf(task.statement, "task.statement", 1, "parts", partOf);
  const canvas = canvasOf(task.canvas, "task.canvas");
  if (canvas.kind === WORKBOOK_KIND) {
    const items = listOf(task.items, "task.items", 1, "items", workbookItemOf);
    return { id, statement, canvas, items };
  }
  return { id, statement, canvas, items: sheetItemsOf(task.items) };
}

/** Whether a task is on a handwriting sheet. */
export function isSheet(task: Task): task is SheetTask {
  return task.canvas.kind === SHEET_KIND;
}

/**
 * The template of a task `taskOf` gave, or of no task for `undefined`. What this version of the
 * element does not show is a TypeError: the workbook, until T47, and a zone, until an epic of its
 * own. A choice the sheet passes over, and an item's text too: app shows them (R32).
 */
export function templateOf(task: Task | undefined): Template {
  if (task === undefined) return NO_TASK;
  if (!isSheet(task)) {
    throw new TypeError(
      `task.canvas.kind: the element shows "${SHEET_KIND}" alone so far, and "${WORKBOOK_KIND}" comes in a later version`,
    );
  }
  for (const [i, item] of task.items.entries()) {
    for (const [j, slot] of item.answer_slots.entries()) {
      if (slot.binding === "zone") {
        throw new TypeError(
          `task.items[${i}].answer_slots[${j}].binding: the handwriting sheet takes no "zone" yet, only "anywhere", "sheet" and "choice"`,
        );
      }
    }
  }
  const { grid = DEFAULT_GRID.kind, grid_step = GRID_STEP, tools } = task.canvas;
  return {
    grid: { kind: grid, step: grid_step },
    statement: task.statement,
    // The tools the task allows, of those the canvas has, in the order of TOOLS (R28).
    tools: tools === undefined ? TOOLS : TOOLS.filter((tool) => tools.includes(tool)),
  };
}

/** Whether two templates show the same: the same grid, the same statement, the same tools. */
export function sameTemplate(a: Template, b: Template): boolean {
  return sameGrid(a, b) && sameStatement(a, b) && sameTools(a, b);
}

/** Whether two templates allow the same tools. */
export function sameTools(a: Template, b: Template): boolean {
  return a.tools.length === b.tools.length && a.tools.every((tool, i) => tool === b.tools[i]);
}

/** Whether two templates rule the sheet alike. */
export function sameGrid(a: Template, b: Template): boolean {
  return a.grid.kind === b.grid.kind && a.grid.step === b.grid.step;
}

/** Whether two templates show the same statement. */
export function sameStatement(a: Template, b: Template): boolean {
  if (a.statement.length !== b.statement.length) return false;
  return a.statement.every((part, i) => samePart(part, b.statement[i]));
}

/** The names of Windows devices, which no ID or file of a module has (common.schema.json). */
const DEVICES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/;

/** The file formats of a picture, by their extensions: PNG, JPEG and WebP. */
const PICTURES = ["png", "jpg", "webp"];

/**
 * Whether a name is in kebab-case from a letter, as a module's names are: counting-gaps. The name
 * is split at its hyphens rather than matched by a pattern of nested repeats: the check is linear.
 */
function kebab(name: string): boolean {
  const [first = "", ...rest] = name.split("-");
  return /^[a-z][a-z0-9]*$/.test(first) && rest.every((word) => /^[a-z0-9]+$/.test(word));
}

/** The task's local ID: kebab-case, at most 64 characters, no Windows device (local_id). */
function idOf(value: unknown, path: string): string {
  if (typeof value !== "string" || value.length > 64 || !kebab(value) || DEVICES.test(value)) {
    throw new TypeError(
      `${path}: the task's local ID, in kebab-case from a letter, at most 64 characters, no name of a Windows device, not ${shown(value)}`,
    );
  }
  return value;
}

function partOf(value: unknown, path: string): StatementPart {
  const part = closed(value, path, ["text", "picture", "alt", "width", "height"], "a part");
  if (part.picture === undefined) {
    closed(part, path, ["text"], "a paragraph of the statement");
    return { text: text(part.text, `${path}.text`, "a paragraph") };
  }
  closed(part, path, ["picture", "alt", "width", "height"], "a picture of the statement");
  const picture = pictureOf(part.picture, `${path}.picture`);
  if (typeof part.alt !== "string") {
    throw new TypeError(
      `${path}.alt: what the picture shows, in words, or "" for a picture that only decorates, not ${shown(part.alt)}`,
    );
  }
  const width = whole(part.width, `${path}.width`, 1);
  return { picture, alt: part.alt, width, height: whole(part.height, `${path}.height`, 1) };
}

/**
 * A picture's path from the module's media/: names in kebab-case, none a Windows device, joined by
 * /, and the extension of a PNG, JPEG or WebP file, at most 128 characters (picture_path).
 */
function pictureOf(value: unknown, path: string): string {
  if (typeof value === "string" && value.length <= 128) {
    const names = value.split("/");
    const file = names.pop() ?? "";
    const dot = file.lastIndexOf(".");
    names.push(file.slice(0, dot));
    if (
      dot > 0 &&
      PICTURES.includes(file.slice(dot + 1)) &&
      names.every((name) => kebab(name) && !DEVICES.test(name))
    ) {
      return value;
    }
  }
  throw new TypeError(
    `${path}: a picture's path from media/, in kebab-case, of a .png, .jpg or .webp file, not ${shown(value)}`,
  );
}

/** The canvas of a task: its kind, and the fields of that kind. */
function canvasOf(value: unknown, path: string): SheetCanvas | WorkbookCanvas {
  const canvas = closed(value, path, ["kind", "grid", "grid_step", "tools"], "a task's canvas");
  if (canvas.kind === WORKBOOK_KIND) {
    closed(canvas, path, ["kind", "tools"], "a workbook's canvas");
    if (canvas.tools === undefined) return { kind: WORKBOOK_KIND };
    return { kind: WORKBOOK_KIND, tools: toolsOf(canvas.tools, `${path}.tools`) };
  }
  if (canvas.kind !== SHEET_KIND) {
    throw new TypeError(
      `${path}.kind: "${SHEET_KIND}" or "${WORKBOOK_KIND}", not ${shown(canvas.kind)}`,
    );
  }
  const sheet: { -readonly [K in keyof SheetCanvas]: SheetCanvas[K] } = { kind: SHEET_KIND };
  if (canvas.grid !== undefined) {
    if (!GRID_KINDS.includes(canvas.grid as GridKind)) {
      throw new TypeError(`${path}.grid: "squares", "lines" or "dots", not ${shown(canvas.grid)}`);
    }
    sheet.grid = canvas.grid as GridKind;
  }
  if (canvas.grid_step !== undefined) {
    sheet.grid_step = whole(canvas.grid_step, `${path}.grid_step`, GRID_STEP_MIN, GRID_STEP_MAX);
  }
  if (canvas.tools !== undefined) sheet.tools = toolsOf(canvas.tools, `${path}.tools`);
  return sheet;
}

/**
 * The names of the tools a task allows (R28): strings, the pen among them. A name the canvas does
 * not know it passes over when it makes its template.
 */
function toolsOf(value: unknown, path: string): string[] {
  const names = listOf(value, path, 0, "tools", (name, at) => {
    if (typeof name !== "string") {
      throw new TypeError(`${at}: a tool's name, a string, not ${shown(name)}`);
    }
    return name;
  });
  if (!names.includes("pen")) {
    throw new TypeError(`${path}: the canvas writes with "pen", which ${shown(value)} lacks`);
  }
  return names;
}

/**
 * The items of a handwriting sheet. An answer anywhere on the sheet, or the whole sheet, is the
 * only answer slot of its task: AI could not tell two of them apart.
 */
function sheetItemsOf(value: unknown): SheetItem[] {
  const items = listOf(value, "task.items", 1, "items", sheetItemOf);
  const entire = items.some((item) =>
    item.answer_slots.some(({ binding }) => binding === "anywhere" || binding === "sheet"),
  );
  if (!entire) return items;
  if (items.length > 1) {
    throw new TypeError(
      `task.items: one item, for an answer anywhere on the sheet or the whole sheet is its task's only answer slot, not ${items.length}`,
    );
  }
  const slots = items[0]?.answer_slots.length ?? 0;
  if (slots > 1) {
    throw new TypeError(
      `task.items[0].answer_slots: one answer slot, for an answer anywhere on the sheet or the whole sheet is its task's only one, not ${slots}`,
    );
  }
  return items;
}

function sheetItemOf(value: unknown, path: string): SheetItem {
  const item = closed(value, path, ["text", "answer_slots"], "an item of a handwriting sheet");
  const asks =
    item.text === undefined ? undefined : text(item.text, `${path}.text`, "what the item asks");
  const slots = listOf(item.answer_slots, `${path}.answer_slots`, 1, "answer slots", slotOf);
  return asks === undefined ? { answer_slots: slots } : { text: asks, answer_slots: slots };
}

function slotOf(value: unknown, path: string): AnswerSlot {
  const slot = closed(value, path, ["binding", "zone", "options"], "an answer slot");
  const what = `an answer slot bound ${shown(slot.binding)}`;
  switch (slot.binding) {
    case "anywhere":
    case "sheet":
      closed(slot, path, ["binding"], what);
      return { binding: slot.binding };
    case "zone":
      closed(slot, path, ["binding", "zone"], what);
      return { binding: "zone", zone: zoneOf(slot.zone, `${path}.zone`) };
    case "choice":
      closed(slot, path, ["binding", "options"], what);
      return { binding: "choice", options: optionsOf(slot.options, `${path}.options`) };
    default:
      throw new TypeError(
        `${path}.binding: "anywhere", "sheet", "zone" or "choice", not ${shown(slot.binding)}`,
      );
  }
}

function zoneOf(value: unknown, path: string): Zone {
  const zone = closed(value, path, ["left", "top", "width", "height"], "a zone");
  return {
    left: whole(zone.left, `${path}.left`, 0, 999),
    top: whole(zone.top, `${path}.top`, 0, 1399),
    width: whole(zone.width, `${path}.width`, 1, 1000),
    height: whole(zone.height, `${path}.height`, 1, 1400),
  };
}

function optionsOf(value: unknown, path: string): string[] {
  const options = listOf(value, path, 2, "options", (option, at) => text(option, at, "an option"));
  if (new Set(options).size < options.length) {
    throw new TypeError(`${path}: options all different, not ${shown(value)}`);
  }
  return options;
}

/** An item of a workbook: a line with at least one box. */
function workbookItemOf(value: unknown, path: string): WorkbookItem {
  const item = closed(value, path, ["line"], "an item of a workbook");
  const line = listOf(item.line, `${path}.line`, 1, "pieces of text and boxes", linePartOf);
  if (!line.some((part) => "binding" in part)) {
    throw new TypeError(
      `${path}.line: at least one box, { binding: "box" }, not ${shown(item.line)}`,
    );
  }
  return { line };
}

/** A piece of a workbook's line: a piece of text, or a box. */
function linePartOf(value: unknown, path: string): LinePart {
  const part = closed(value, path, ["text", "binding"], "a piece of a line");
  if (part.binding === undefined) {
    closed(part, path, ["text"], "a piece of a line's text");
    return { text: text(part.text, `${path}.text`, "a piece of the line's text") };
  }
  closed(part, path, ["binding"], "a box of a line");
  if (part.binding !== "box") {
    throw new TypeError(`${path}.binding: "box", a box of a workbook, not ${shown(part.binding)}`);
  }
  return { binding: "box" };
}

function samePart(a: StatementPart, b: StatementPart | undefined): boolean {
  if (b === undefined) return false;
  if ("text" in a) return "text" in b && a.text === b.text;
  return (
    "picture" in b &&
    a.picture === b.picture &&
    a.alt === b.alt &&
    a.width === b.width &&
    a.height === b.height
  );
}
