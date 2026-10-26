// Type-checked by ci-lint and never built: the element's interface as a consumer's types see it
// (R07, R27, R28). What a consumer may do type-checks; each line under a directive must be an
// error, and were it not, the directive would go unused, and that would be the error instead.

import type {
  ExportedWork,
  HistoryChangeEvent,
  HistoryEvent,
  NovatrailCanvas,
  Submission,
  Tool,
  ToolChangeEvent,
} from "./index.js";

declare const sheet: NovatrailCanvas;
declare const crop: Submission["crop"];

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

export const work: Promise<ExportedWork | null> = sheet.exportWork();
export const history: readonly HistoryEvent[] = sheet.history;
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
// @ts-expect-error A tool the sheet has not is no tool of it.
sheet.tool = "ruler";
// @ts-expect-error Marks whose submission has no digest are no marks of a submission (R27).
sheet.marks = { submission: { crop, groups: [] }, marks: [] };
