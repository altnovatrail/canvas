// A lesson's worked example (R58 spec; R42): the open view of a segment `worked_example`, of spec's
// type WorkedExample (R73 spec; R41) — its statement, the handwriting sheet the author's demo is
// shown on, and the demo's parts in order: paragraphs, pictures beside the sheet and pictures on
// areas of it. The element checks it as the schema does, every object closed (R32), and by the
// format's rule lesson.areas too: an area lies on the sheet. What the check gives is the element's
// own shape of the same example, the kinds of its parts apart, which the rest of the element reads,
// and the sheet makes a template of it as of a task: its grid, its statement and the pen alone. How
// far the learner has gone through the demo is a state of its own, which app keeps and gives back.

import type { DemoState } from "@altnovatrail/spec/canvas";
import type * as open from "@altnovatrail/spec/formatv0/open";
import { closed, listOf, sameItems, shown, whole } from "./fields.js";
import type { GridKind } from "./grid.js";
import { SHEET } from "./sheet.js";
import {
  altOf,
  gridFrom,
  gridOf,
  type PicturePart,
  partOf,
  pictureOf,
  SHEET_KIND,
  type SheetTemplate,
  type StatementPart,
  samePart,
  type TextPart,
  type Tool,
  textOrPictureOf,
  type Zone,
  zoneOf,
} from "./task.js";

/** A lesson's worked example as a consumer gives it: spec's type (R73 spec). */
export type WorkedExample = open.WorkedExample;

/** The sheet of a worked example, as the element checked it: a handwriting sheet and its grid. */
export interface ExampleCanvas {
  readonly kind: typeof SHEET_KIND;
  /** Squares unless given. */
  readonly grid?: GridKind;
  /** The grid's step in sheet units, a whole number from 20 to 500: 50 unless given. */
  readonly grid_step?: number;
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

/** A part of the author's demo: a paragraph, a picture beside the sheet, or one on the sheet. */
export type ExamplePart = TextPart | PicturePart | AreaPicture;

/** A worked example as the element checked it: its statement, its sheet and its demo's parts. */
export interface CheckedExample {
  /** What the example asks, in the module's explanation language, as a task's statement. */
  readonly statement: readonly StatementPart[];
  readonly canvas: ExampleCanvas;
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
  const example = closed(value, ROOT, ["statement", "canvas", "demo"], "a worked example");
  const statement = listOf(example.statement, `${ROOT}.statement`, 1, "parts", partOf);
  const canvas = exampleCanvasOf(example.canvas, `${ROOT}.canvas`);
  const demo = listOf(example.demo, `${ROOT}.demo`, 1, "parts of the demo", demoPartOf);
  return { statement, canvas, demo };
}

/**
 * What the sheet makes of a worked example, as of a task (R42): the grid on the sheet, the
 * statement above it, and the pen alone, for the learner does not write on it.
 */
export function exampleTemplate(example: CheckedExample): SheetTemplate {
  return { grid: gridFrom(example.canvas), statement: example.statement, tools: PEN_ALONE };
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
  const [one, other] = [gridFrom(a.canvas), gridFrom(b.canvas)];
  return (
    sameItems(a.statement, b.statement, samePart) &&
    one.kind === other.kind &&
    one.step === other.step &&
    sameItems(a.demo, b.demo, sameDemoPart)
  );
}

/**
 * The sheet of a worked example: a handwriting sheet and its grid, and no tools, for the learner
 * does not write on it (README of the format, §21). A workbook is in no version of the format yet.
 */
function exampleCanvasOf(value: unknown, path: string): ExampleCanvas {
  const canvas = closed(value, path, ["kind", "grid", "grid_step"], "a worked example's canvas");
  if (canvas.kind !== SHEET_KIND) {
    throw new TypeError(
      `${path}.kind: "${SHEET_KIND}", for a worked example is shown on a handwriting sheet, not ${shown(canvas.kind)}`,
    );
  }
  return { kind: SHEET_KIND, ...gridOf(canvas, path) };
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

/** Whether two parts of the demo show the same: a paragraph, or a picture beside or on the sheet. */
function sameDemoPart(a: ExamplePart, b: ExamplePart): boolean {
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
