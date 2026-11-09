// A lesson's worked example (R58 spec; R42): the open view of a segment `worked_example`, of spec's
// type WorkedExample (R73 spec; R41) — its statement, the handwriting sheet or the workbook the
// author's demo is shown on, and the demo's parts in order: paragraphs, pictures beside the sheet,
// pictures on areas of a sheet, and on a workbook the boxes it fills (format 0.4; T85, R60). The
// element checks it as the schema does, every object closed (R32), and by the format's rules
// lesson.areas, lesson.example-fills and lesson.workbook-page too: an area lies on the sheet, the
// demo fills each box of the lines once, and the lines fit the page, each value its box. What the
// check gives is the element's own shape of the same example, the kinds of its parts apart, which
// the rest of the element reads, and the canvas makes a template of it as of a task: its grid or
// its lines, its statement and the pen alone. How far the learner has gone through the demo is a
// state of its own, which app keeps and gives back.

import type { DemoState } from "@altnovatrail/spec/canvas";
import type * as open from "@altnovatrail/spec/formatv0/open";
import { closed, listOf, record, sameItems, shown, text, whole } from "./fields.js";
import type { GridKind } from "./grid.js";
import { LAYOUT, pageOf, pieceWidth } from "./page.js";
import { SHEET } from "./sheet.js";
import {
  altOf,
  gridFrom,
  gridOf,
  type PicturePart,
  partOf,
  pictureOf,
  SHEET_KIND,
  type StatementPart,
  samePart,
  type Template,
  type TextPart,
  type Tool,
  textOrPictureOf,
  WORKBOOK_KIND,
  type WorkbookItem,
  type Zone,
  zoneOf,
} from "./task.js";

/** A lesson's worked example as a consumer gives it: spec's type (R73 spec). */
export type WorkedExample = open.WorkedExample;

/**
 * What a worked example is shown on, as the element checked it: a handwriting sheet and its grid,
 * or a workbook, whose lines the example has (format 0.4).
 */
export type ExampleCanvas =
  | {
      readonly kind: typeof SHEET_KIND;
      /** Squares unless given. */
      readonly grid?: GridKind;
      /** The grid's step in sheet units, a whole number from 20 to 500: 50 unless given. */
      readonly grid_step?: number;
    }
  | { readonly kind: typeof WORKBOOK_KIND };

/** A box of a worked example's line, with what the demo writes in it. */
export interface ValueBox {
  readonly binding: "box";
  readonly value: string;
}

/** A line of a worked example on a workbook: its pieces of text and its boxes, a box at least. */
export interface ExampleLine {
  readonly line: readonly (TextPart | ValueBox)[];
}

/**
 * A part of the demo on a workbook that fills a box with its value: its line by its place among the
 * example's lines and its box by its place in the line, each from 1.
 */
export interface FillPart {
  readonly fill: { readonly line: number; readonly box: number };
}

/** A picture of the demo on the sheet: shown on the layer of the author's demo, in its area. */
export interface AreaPicture {
  /** Its path from the module's media/, which the consumer's `media` takes to give its file. */
  readonly picture: string;
  /** What the picture shows, in words: "" for a picture that only decorates. */
  readonly alt: string;
  /** The area of the sheet it is shown in, at its size: on the sheet, by the rule lesson.areas. */
  readonly area: Zone;
}

/**
 * A part of the author's demo: a paragraph, a picture beside the sheet, one on a handwriting sheet,
 * or a box of a workbook filled.
 */
export type ExamplePart = TextPart | PicturePart | AreaPicture | FillPart;

/** A worked example as the element checked it: its statement, its sheet and its demo's parts. */
export interface CheckedExample {
  /** What the example asks, in the module's explanation language, as a task's statement. */
  readonly statement: readonly StatementPart[];
  readonly canvas: ExampleCanvas;
  /** On a workbook, the example's lines, laid out as a task's are; on a sheet, none. */
  readonly lines?: readonly ExampleLine[];
  /** The parts of how the example is solved, in order: the learner opens them one at a time. */
  readonly demo: readonly ExamplePart[];
}

/**
 * How far the learner has gone through the author's demo (R42): how many of its parts are open,
 * from the first, and whether the whole demo is hidden. app keeps it and may give it back. spec's
 * type (R74 spec).
 */
export type { DemoState };

/** Where every demo starts: no part open, and nothing hidden. One for every element. */
export const DEMO_START: DemoState = Object.freeze({ opened: 0, hidden: false });

/** The path the element names a worked example's fields by: its property's name. */
const ROOT = "workedExample";

/** The path the element names the state of a demo's fields by: its property's name. */
const STATE = "demoState";

/** A worked example's tools: the pen alone, which writes nothing on its sheet (R42). */
const PEN_ALONE: readonly Tool[] = Object.freeze(["pen"]);

/**
 * A worked example's open view, checked as the format's schema and its rule lesson.areas check it,
 * and a copy of it with the fields the schema names: the element reads each field once. What they
 * refuse is a TypeError that names the field by its path. A field is left out by `undefined` alone:
 * `null` is a value, and a wrong one.
 */
export function exampleOf(value: unknown): CheckedExample {
  const fields = ["statement", "canvas", "lines", "demo"];
  const example = closed(value, ROOT, fields, "a worked example");
  const statement = listOf(example.statement, `${ROOT}.statement`, 1, "parts", partOf);
  const canvas = exampleCanvasOf(example.canvas, `${ROOT}.canvas`);
  if (canvas.kind === SHEET_KIND) {
    if (example.lines !== undefined) {
      throw new TypeError(`${ROOT}.lines: no lines on a handwriting sheet, only on a workbook`);
    }
    const demo = listOf(example.demo, `${ROOT}.demo`, 1, "parts of the demo", sheetDemoPartOf);
    return { statement, canvas, demo };
  }
  if (example.lines === undefined) {
    throw new TypeError(`${ROOT}: a worked example on a workbook has its lines, ${ROOT}.lines`);
  }
  const lines = listOf(example.lines, `${ROOT}.lines`, 1, "lines", exampleLineOf);
  // The lines fit the page as a task's do, a TypeError at the first that does not
  // (lesson.workbook-page).
  try {
    pageOf(itemsOf(lines));
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    throw new TypeError(error.message.replace(/^task\.items/, `${ROOT}.lines`));
  }
  const parts = listOf(example.demo, `${ROOT}.demo`, 1, "parts of the demo", workbookDemoPartOf);
  return { statement, canvas, lines, demo: fillsOf(parts, lines) };
}

/**
 * What the canvas makes of a worked example, as of a task (R42): the grid on the sheet, or the
 * example's lines laid out on the workbook's page as a task's are, its boxes empty till the demo
 * fills them; the statement above it, and the pen alone, for the learner does not write on it.
 */
export function exampleTemplate(example: CheckedExample): Template {
  const { canvas, lines, statement } = example;
  if (canvas.kind === WORKBOOK_KIND) {
    return { page: pageOf(itemsOf(lines ?? [])), statement, tools: PEN_ALONE };
  }
  return { grid: gridFrom(canvas), statement, tools: PEN_ALONE };
}

/** Whether a part of the demo fills a box of a workbook. */
export function isFill(part: ExamplePart): part is FillPart {
  return "fill" in part;
}

/**
 * The boxes the open parts of a demo have filled, by line and box from 1, with their values — none
 * while the demo is hidden, as a picture on the sheet goes with it.
 */
export function filledBy(
  example: CheckedExample,
  { opened, hidden }: DemoState,
): ReadonlyMap<string, string> {
  const filled = new Map<string, string>();
  if (hidden) return filled;
  for (const part of example.demo.slice(0, opened)) {
    if (isFill(part)) filled.set(`${part.fill.line}.${part.fill.box}`, fillValue(example, part));
  }
  return filled;
}

/** What a fill of the demo writes: the value of its box, which the check found among the lines. */
export function fillValue(example: CheckedExample, { fill }: FillPart): string {
  return boxesOf(example.lines?.[fill.line - 1])[fill.box - 1]?.value ?? "";
}

/** The boxes of a line of a worked example, in order: its pieces with a value. */
function boxesOf(line: ExampleLine | undefined): ValueBox[] {
  return (line?.line ?? []).filter((piece): piece is ValueBox => "value" in piece);
}

/**
 * The state of a demo of `parts` parts, checked (R42): an object of `opened`, a whole number from 0
 * to `parts`, and `hidden`, true or false, both of them and nothing else. What it refuses is a
 * TypeError that names the field by its path. It gives a frozen copy of its own.
 */
export function demoStateOf(value: unknown, parts: number): DemoState {
  const state = closed(value, STATE, ["opened", "hidden"], "the state of a demo");
  const opened = whole(state.opened, `${STATE}.opened`, 0, parts);
  if (typeof state.hidden !== "boolean") {
    throw new TypeError(`${STATE}.hidden: true or false, not ${shown(state.hidden)}`);
  }
  return Object.freeze({ opened, hidden: state.hidden });
}

/** Whether a part of the demo stands on the sheet, in an area of it. */
export function onSheet(part: ExamplePart): part is AreaPicture {
  return "area" in part;
}

/**
 * Whether two worked examples show the same (R42): the same statement, the same grid — its kind and
 * step as drawn, the defaults filled in — and the same parts of the demo in the same order.
 */
export function sameExample(a: CheckedExample, b: CheckedExample): boolean {
  if (a.canvas.kind !== b.canvas.kind) return false;
  if (a.canvas.kind === WORKBOOK_KIND) {
    return (
      sameItems(a.statement, b.statement, samePart) &&
      sameItems(a.lines ?? [], b.lines ?? [], sameLine) &&
      sameItems(a.demo, b.demo, sameDemoPart)
    );
  }
  const [one, other] = [gridFrom(a.canvas), gridFrom(b.canvas as typeof a.canvas)];
  return (
    sameItems(a.statement, b.statement, samePart) &&
    one.kind === other.kind &&
    one.step === other.step &&
    sameItems(a.demo, b.demo, sameDemoPart)
  );
}

/** Whether two lines of a worked example hold the same pieces and boxes, the same values in them. */
function sameLine(a: ExampleLine, b: ExampleLine): boolean {
  return sameItems(a.line, b.line, (one, other) =>
    "text" in one
      ? "text" in other && one.text === other.text
      : "value" in other && one.value === other.value,
  );
}

/**
 * What a worked example is shown on: a handwriting sheet and its grid, or a workbook, and no tools,
 * for the learner does not write on it (README of the format, §21).
 */
function exampleCanvasOf(value: unknown, path: string): ExampleCanvas {
  const canvas = closed(value, path, ["kind", "grid", "grid_step"], "a worked example's canvas");
  if (canvas.kind === WORKBOOK_KIND) {
    closed(canvas, path, ["kind"], "a worked example's workbook");
    return { kind: WORKBOOK_KIND };
  }
  if (canvas.kind !== SHEET_KIND) {
    throw new TypeError(
      `${path}.kind: "${SHEET_KIND}" or "${WORKBOOK_KIND}", what a worked example is shown on, not ${shown(canvas.kind)}`,
    );
  }
  return { kind: SHEET_KIND, ...gridOf(canvas, path) };
}

/**
 * A line of a worked example on a workbook: pieces of text and boxes, a box at least, each box with
 * its value, no wider than the box as a text of the line (lesson.workbook-page).
 */
function exampleLineOf(value: unknown, path: string): ExampleLine {
  const item = closed(value, path, ["line"], "a line of a worked example");
  const line = listOf(item.line, `${path}.line`, 1, "pieces of text and boxes", examplePieceOf);
  if (!line.some((part) => "value" in part)) {
    throw new TypeError(
      `${path}.line: at least one box, { binding: "box", value }, not ${shown(item.line)}`,
    );
  }
  return { line };
}

/** A piece of a worked example's line: a piece of text, or a box with what the demo writes. */
function examplePieceOf(value: unknown, path: string): TextPart | ValueBox {
  const part = closed(value, path, ["text", "binding", "value"], "a piece of a line");
  if (part.binding === undefined) {
    closed(part, path, ["text"], "a piece of a line's text");
    return { text: text(part.text, `${path}.text`, "a piece of the line's text") };
  }
  closed(part, path, ["binding", "value"], "a box of a line");
  if (part.binding !== "box") {
    throw new TypeError(`${path}.binding: "box", a box of a workbook, not ${shown(part.binding)}`);
  }
  const written = text(part.value, `${path}.value`, "what the demo writes in the box");
  const width = pieceWidth(written);
  if (width > LAYOUT.boxWidth) {
    throw new TypeError(
      `${path}.value: no wider than its box, ${LAYOUT.boxWidth} units, not ${width}: ${shown(written)}`,
    );
  }
  return { binding: "box", value: written };
}

/** A worked example's lines as a task's items, for the page to lay out: the boxes without values. */
function itemsOf(lines: readonly ExampleLine[]): WorkbookItem[] {
  return lines.map(({ line }) => ({
    line: line.map((part) => ("text" in part ? part : { binding: "box" as const })),
  }));
}

/**
 * The demo on a workbook, checked by its fills: each fill names a box of the lines, and the demo
 * fills each box once (lesson.example-fills). A TypeError names the fill, or the box never filled.
 */
function fillsOf(parts: ExamplePart[], lines: readonly ExampleLine[]): ExamplePart[] {
  const done = new Set<string>();
  for (const [n, part] of parts.entries()) {
    if (!isFill(part)) continue;
    const { line, box } = part.fill;
    const path = `${ROOT}.demo[${n}].fill`;
    if (boxesOf(lines[line - 1])[box - 1] === undefined) {
      throw new TypeError(`${path}: a box of the example's lines, not box ${box} of line ${line}`);
    }
    const key = `${line}.${box}`;
    if (done.has(key)) {
      throw new TypeError(`${path}: box ${box} of line ${line}, which the demo filled already`);
    }
    done.add(key);
  }
  for (const [l, line] of lines.entries()) {
    for (let b = 1; b <= boxesOf(line).length; b++) {
      if (!done.has(`${l + 1}.${b}`)) {
        throw new TypeError(
          `${ROOT}.demo: a part that fills box ${b} of line ${l + 1}, which no part fills`,
        );
      }
    }
  }
  return parts;
}

/** A part of the demo on a handwriting sheet: no box to fill. */
function sheetDemoPartOf(value: unknown, path: string): ExamplePart {
  const part = record(value, path);
  if (part.fill !== undefined) {
    throw new TypeError(`${path}.fill: no box to fill on a handwriting sheet, only on a workbook`);
  }
  return demoPartOf(part, path);
}

/** A part of the demo on a workbook: a paragraph, a picture beside the sheet, or a box filled. */
function workbookDemoPartOf(value: unknown, path: string): ExamplePart {
  const part = record(value, path);
  if (part.fill === undefined) {
    if (part.area !== undefined) {
      throw new TypeError(`${path}.area: no picture stands on a workbook's page, only beside it`);
    }
    return demoPartOf(part, path);
  }
  closed(part, path, ["fill"], "a box the demo fills");
  const fill = closed(part.fill, `${path}.fill`, ["line", "box"], "a box of the lines");
  return {
    fill: {
      line: whole(fill.line, `${path}.fill.line`, 1, 99),
      box: whole(fill.box, `${path}.fill.box`, 1, 99),
    },
  };
}

/**
 * A part of the demo: a paragraph, a picture beside the sheet with its size, or a picture on the
 * sheet with its area, which has no size of its own.
 */
function demoPartOf(value: unknown, path: string): ExamplePart {
  const fields = ["text", "picture", "alt", "width", "height", "area"];
  const part = closed(value, path, fields, "a part of the demo");
  if (part.picture === undefined) closed(part, path, ["text"], "a paragraph of the demo");
  if (part.area === undefined) return textOrPictureOf(part, path, "the demo");
  closed(part, path, ["picture", "alt", "area"], "a picture on the sheet");
  const picture = pictureOf(part.picture, `${path}.picture`);
  const alt = altOf(part.alt, `${path}.alt`);
  return { picture, alt, area: areaOf(part.area, `${path}.area`) };
}

/**
 * An area of the sheet, as a zone is, that lies on the sheet: its right edge at most at the sheet's
 * width and its bottom at most at its height, or the sheet could not show it (lesson.areas).
 */
function areaOf(value: unknown, path: string): Zone {
  const area = zoneOf(value, path);
  if (area.left + area.width > SHEET.width || area.top + area.height > SHEET.height) {
    throw new TypeError(
      `${path}: an area on the sheet, its right edge at most ${SHEET.width} and its bottom at most ${SHEET.height}, not ${shown(value)}`,
    );
  }
  return area;
}

/** Whether two parts of the demo show the same: a paragraph, a picture beside or on the sheet, a fill. */
function sameDemoPart(a: ExamplePart, b: ExamplePart): boolean {
  if (isFill(a) || isFill(b)) {
    return isFill(a) && isFill(b) && a.fill.line === b.fill.line && a.fill.box === b.fill.box;
  }
  if (!onSheet(a) || !onSheet(b)) return !onSheet(a) && !onSheet(b) && samePart(a, b);
  return (
    a.picture === b.picture &&
    a.alt === b.alt &&
    a.area.left === b.area.left &&
    a.area.top === b.area.top &&
    a.area.width === b.area.width &&
    a.area.height === b.area.height
  );
}
