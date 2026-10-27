// Type-checked by ci-lint and never built: the element's interface as a consumer's types see it
// (R07, R27, R28, R32, R37, R38). What a consumer may do type-checks; each line under a directive
// must be an error, and were it not, the directive would go unused, and that would be the error
// instead.

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
} from "./index.js";

declare const sheet: NovatrailCanvas;
declare const crop: SheetSubmission["crop"];
declare const done: ExportedWork;
declare const boxes: WorkbookSubmission;
declare const manifest: Manifest;

/** A task's open view on a handwriting sheet, in the names of the module format's draft (R32). */
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

export const work: Promise<ExportedWork | null> = sheet.exportWork();
/** The work's key tells its kind: the crop of a sheet, or the crops of a workbook's boxes (R38). */
export const sent: Blob | readonly Blob[] =
  "png" in done ? done.png : done.cells.map(({ png }) => png);
export const place: readonly [number, number] | undefined =
  "cells" in done ? [done.cells[0]?.item ?? 1, done.cells[0]?.slot ?? 1] : undefined;
export const history: readonly HistoryEvent[] = sheet.history;
/** Which boxes of a workbook are filled, per item, per box; null on a sheet (R37). */
export const filled: Filled | null = sheet.filled;
export const first: boolean | undefined = sheet.filled?.[0]?.[0];
sheet.history = undefined;
sheet.history = [];

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
// @ts-expect-error The marks of a workbook's submission are T53's: a sheet's alone come in so far.
sheet.marks = { submission: boxes, marks: [] };
// @ts-expect-error null is no manifest: undefined, and undefined alone, is none.
sheet.manifest = null;
// @ts-expect-error The grid's step is grid_step in the format, not step.
sheet.task = { ...posts, canvas: { kind: "handwriting_sheet", step: 40 } };
// @ts-expect-error The height of a digit is the manifest's, not the task's.
sheet.task = { ...posts, canvas: { kind: "handwriting_sheet", digit: 48 } };
// @ts-expect-error A line of text and boxes is an item of a workbook, not of a handwriting sheet.
sheet.task = { ...posts, items: [{ line: [{ binding: "box" }] }] };
// @ts-expect-error A tool the sheet has not is no tool of it.
sheet.tool = "ruler";
// @ts-expect-error Marks whose submission has no digest are no marks of a submission (R27).
sheet.marks = { submission: { crop, groups: [] }, marks: [] };
