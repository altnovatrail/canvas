// Type-checked by ci-lint and never built: the element's interface as a consumer's types see it
// (R07, R27, R28, R32, R37, R38, R39, R42). What a consumer may do type-checks; each line under a
// directive must be an error, and were it not, the directive would go unused, and that would be the
// error instead.

import type * as open from "@altnovatrail/spec/formatv0/open";
import type {
  ExportedWork,
  Filled,
  HistoryChangeEvent,
  HistoryEvent,
  Manifest,
  NovatrailCanvas,
  SheetSubmission,
  Tool,
  ToolChangeEvent,
  WorkbookSubmission,
  WorkedExample,
} from "./index.js";

declare const sheet: NovatrailCanvas;
declare const crop: SheetSubmission["crop"];
declare const done: ExportedWork;
declare const boxes: WorkbookSubmission;
declare const manifest: Manifest;
declare const given: open.Task;
declare const lesson: open.WorkedExample;

/** A task's open view on a handwriting sheet, as the module format 0.1 has it (R32). */
const posts = {
  id: "posts-1",
  statement: [{ text: "How many posts are there?" }],
  canvas: { kind: "handwriting_sheet" },
  items: [{ answer_slots: [{ binding: "anywhere" }] }],
} as const;

/** The tag gives the element's type, made or found. */
export const made: NovatrailCanvas = document.createElement("novatrail-canvas");
export const found: NovatrailCanvas | null = document.querySelector("novatrail-canvas");

/** The event's type holds on the element and on the document it bubbles up to. */
sheet.addEventListener("historychange", (event: HistoryChangeEvent) => event.detail.from);
document.addEventListener("historychange", (event) => {
  const events: readonly HistoryEvent[] = event.detail.events;
  return events;
});

/** The learner's choice of tool is told on the element and on the document alike (R28). */
sheet.addEventListener("toolchange", (event: ToolChangeEvent) => event.detail.tool);
document.addEventListener("toolchange", (event) => {
  const tool: Tool = event.detail.tool;
  return tool;
});
sheet.tool = "eraser";
sheet.task = posts;
sheet.task = { ...posts, canvas: { kind: "handwriting_sheet", grid: "dots", grid_step: 40 } };
sheet.task = {
  id: "tables-1",
  statement: posts.statement,
  canvas: { kind: "workbook" },
  items: [{ line: [{ text: "7 ×" }, { binding: "box" }, { text: "= 56" }] }],
};
sheet.manifest = manifest;
sheet.manifest = undefined;
/** app's task, of spec's type, goes in as it is (R73 spec; R41), the chips of what it gives too. */
sheet.task = given;
sheet.task = { ...posts, givens: ["A post every 4 m."], unknown: "How many posts there are." };

export const work: Promise<ExportedWork | null> = sheet.exportWork();
/** The work's key tells its kind: the crop of a sheet, or the crops of a workbook's boxes (R38). */
export const sent: Blob | readonly Blob[] =
  "png" in done ? done.png : done.cells.map(({ png }) => png);
export const place: readonly [number, number] | undefined =
  "cells" in done ? [done.cells[0]?.item ?? 1, done.cells[0]?.slot ?? 1] : undefined;
export const history: readonly HistoryEvent[] = sheet.history;
/** A workbook's marks stand on answer cells, by their item and slot (R39). */
sheet.marks = {
  submission: boxes,
  marks: [{ kind: "frame", at: { cell: { item: 1, slot: 2 } }, name: "This box" }],
};
/**
 * Which answer slots the strokes fill, per item, per slot: a workbook's boxes, or a sheet's one answer
 * anywhere or the whole sheet; null for a sheet of choices or with no task (R37, R42).
 */
export const filled: Filled | null = sheet.filled;
export const first: boolean | undefined = sheet.filled?.[0]?.[0];
sheet.history = undefined;
sheet.history = [];
/** A lesson's worked example, of spec's type, goes in as it is, and off by undefined (R42). */
sheet.workedExample = lesson;
sheet.workedExample = {
  statement: posts.statement,
  canvas: { kind: "handwriting_sheet", grid: "lines" },
  demo: [
    { text: "Draw the path." },
    { picture: "pictures/path.png", alt: "", width: 60, height: 20 },
  ],
};
sheet.workedExample = undefined;
export const example: WorkedExample | undefined = sheet.workedExample;

// @ts-expect-error The picture of the whole sheet is no part of the interface (R27).
sheet.exportPNG();
// @ts-expect-error null is no history: undefined, and undefined alone, is the empty one.
sheet.history = null;
document.addEventListener("historychange", (event) => {
  // @ts-expect-error The events told are the sheet's, to read.
  event.detail.events.push(event.detail.events[0]);
});
document.addEventListener("toolchange", (event) => {
  // @ts-expect-error The tool told is the learner's choice, to read.
  event.detail.tool = "pen";
});
// @ts-expect-error The filled boxes are the element's to tell, not the consumer's to set.
sheet.filled = null;
// @ts-expect-error Nor to change in place.
sheet.filled?.[0]?.push(true);
// @ts-expect-error A workbook's work has no PNG of a sheet: its key tells which it is.
export const png: Blob = done.png;
if ("cells" in done) {
  // @ts-expect-error The crops are the element's to give, not the consumer's to change.
  done.cells.push({ item: 1, slot: 1, png: new Blob() });
}
// @ts-expect-error An answer cell has no ID: its place names it (R51 spec).
sheet.marks = { submission: boxes, marks: [{ kind: "frame", at: { cell: "a" }, name: "This" }] };
// @ts-expect-error null is no manifest: undefined, and undefined alone, is none.
sheet.manifest = null;
// @ts-expect-error null is no worked example: undefined, and undefined alone, is none (R42).
sheet.workedExample = null;
// @ts-expect-error A task is no worked example: it has items and no demo.
sheet.workedExample = posts;
// @ts-expect-error The grid's step is grid_step in the format, not step.
sheet.task = { ...posts, canvas: { kind: "handwriting_sheet", step: 40 } };
// @ts-expect-error The height of a digit is the manifest's, not the task's.
sheet.task = { ...posts, canvas: { kind: "handwriting_sheet", digit: 48 } };
// @ts-expect-error What the statement gives is a list of texts, not one (R57 spec).
sheet.task = { ...posts, givens: "A post every 4 m." };
// @ts-expect-error A tool the sheet has not is no tool of it.
sheet.tool = "ruler";
// @ts-expect-error Marks whose submission has no digest are no marks of a submission (R27).
sheet.marks = { submission: { crop, groups: [] }, marks: [] };
