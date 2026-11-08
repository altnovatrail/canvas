// Type-checked by ci-lint and never built: the element's interface as a consumer's types see it
// (R07, R27, R28, R32, R37, R38, R39, R42). What a consumer may do type-checks; each line under a
// directive must be an error, and were it not, the directive would go unused, and that would be the
// error instead. The types of the contract are spec's (R74 spec; T69): the element is its
// CanvasElement, and the entry point gives the same types as spec's package.

import type * as spec from "@altnovatrail/spec/canvas";
import type * as open from "@altnovatrail/spec/formatv0/open";
import type { All, Same } from "../core/entry.check.js";
import type {
  CanvasElement,
  CanvasEventMap,
  DemoChangeEvent,
  DemoState,
  ExportedCell,
  ExportedSheet,
  ExportedWork,
  ExportedWorkbook,
  Filled,
  HistoryChange,
  HistoryChangeEvent,
  HistoryEvent,
  Manifest,
  Mark,
  Marks,
  Media,
  NovatrailCanvas,
  SheetSubmission,
  Tool,
  ToolChange,
  ToolChangeEvent,
  WorkbookSubmission,
  WorkedExample,
} from "./index.js";

/**
 * The entry point's types of the contract are spec's, under spec's names (R74 spec; T69): a copy
 * that went its own way would be false here. The DOM's map of events holds the contract's, each
 * event's type, which the package puts there. The data's types the DOM-free part checks the same.
 */
export type Contract = All<
  [
    Same<CanvasElement, spec.CanvasElement>,
    Same<CanvasEventMap, spec.CanvasEventMap>,
    Same<DemoChangeEvent, spec.DemoChangeEvent>,
    Same<ExportedCell, spec.ExportedCell>,
    Same<ExportedSheet, spec.ExportedSheet>,
    Same<ExportedWork, spec.ExportedWork>,
    Same<ExportedWorkbook, spec.ExportedWorkbook>,
    Same<HistoryChange, spec.HistoryChange>,
    Same<HistoryChangeEvent, spec.HistoryChangeEvent>,
    Same<Mark, spec.Mark>,
    Same<Marks, spec.Marks>,
    Same<Media, spec.Media>,
    Same<ToolChange, spec.ToolChange>,
    Same<ToolChangeEvent, spec.ToolChangeEvent>,
    Same<Filled, spec.Filled>,
    Same<Tool, spec.Tool>,
    Same<GlobalEventHandlersEventMap["historychange"], CanvasEventMap["historychange"]>,
    Same<GlobalEventHandlersEventMap["toolchange"], CanvasEventMap["toolchange"]>,
    Same<GlobalEventHandlersEventMap["demochange"], CanvasEventMap["demochange"]>,
  ]
>;
export const contract: Contract = true;

declare const sheet: NovatrailCanvas;
declare const crop: SheetSubmission["crop"];
declare const done: ExportedWork;
declare const boxes: WorkbookSubmission;
declare const manifest: Manifest;
declare const given: open.Task;
declare const lesson: open.WorkedExample;

/** A task's open view on a handwriting sheet, as the module format 0.3 has it (R32). */
const posts = {
  id: "posts-1",
  statement: [{ text: "How many posts are there?" }],
  canvas: { kind: "handwriting_sheet" },
  items: [{ answer_slots: [{ binding: "anywhere" }] }],
} as const;

/** The tag gives the element's type, made or found. */
export const made: NovatrailCanvas = document.createElement("novatrail-canvas");
export const found: NovatrailCanvas | null = document.querySelector("novatrail-canvas");
/** The element is the contract's, as app holds it by spec's types (R74 spec). */
export const held: spec.CanvasElement = made;

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
/**
 * How far the learner has gone through the demo, which app keeps as demochange tells it and gives
 * back after the example (R42); the event's type holds on the element and on the document alike.
 */
sheet.demoState = { opened: 2, hidden: true };
sheet.demoState = undefined;
export const state: DemoState | undefined = sheet.demoState;
sheet.addEventListener("demochange", (event: DemoChangeEvent) => event.detail.opened);
document.addEventListener("demochange", (event) => {
  const kept: DemoState = event.detail;
  sheet.demoState = kept;
});

/** A task's temporary tools the element takes, though the contract's task has none (R28, R41). */
sheet.task = { ...posts, canvas: { kind: "handwriting_sheet", tools: ["pen"] } };

// @ts-expect-error The tools are the element's own: the contract's task has no tools (R41).
held.task = { ...posts, canvas: { kind: "handwriting_sheet", tools: ["pen"] } };
// The media are the contract's: app gives them through it (the 2026-11-02 amendment to R36 spec).
held.media = async (ref) => new Blob([ref]);
held.media = undefined;
// @ts-expect-error A picture's file comes as a Blob, not as its address.
held.media = async (ref: string) => ref;
// The tutor's marks are the contract's too, with the submission's context (R83 spec; T16).
held.marks = sheet.marks;
held.marks = undefined;
// @ts-expect-error Nor the commands undo and clear: the element's own buttons call them (R28).
held.undo();
// @ts-expect-error The same for clear.
held.clear();
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
// @ts-expect-error null is no state of a demo: undefined, and undefined alone, changes nothing.
sheet.demoState = null;
// @ts-expect-error A state says whether the demo is hidden too.
sheet.demoState = { opened: 1 };
document.addEventListener("demochange", (event) => {
  // @ts-expect-error The state told is the learner's, to read.
  event.detail.opened = 2;
});
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
