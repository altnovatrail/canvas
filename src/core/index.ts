// The DOM-free part of the canvas, the package's entry point @altnovatrail/canvas/core: plain
// TypeScript that runs the same in a browser and in Node, for the tests and the synthetic samples
// too (R05, R07). Importing it registers no element: the element is the other entry point. It
// gives the sheet's size, the types of the data the element takes and gives — the strokes and the
// history of writing, the task, the worked example and the manifest, how far the learner has gone
// through the example's demo (R42) and the context of a submission, of a sheet or of a workbook,
// all of spec's types (R73 spec, R74 spec), and the tutor's marks, spec's types too (R83 spec) —
// and the fold of a history into the strokes it leaves, so that a consumer
// reads a history it keeps without the DOM (R27). The code runs without the DOM, but spec's
// declarations of the element's contract, which its types come from, name the DOM's types too: a
// consumer without the DOM's types skips them with skipLibCheck (T69). The rules of the groups, the
// crop and the snapping stay inside: the eval protocol has taken them as they are, and spec's test
// vectors pin them (R94 spec; T16).

export type { Box } from "@altnovatrail/spec/canvas";
export type { Filling } from "./boxes.js";
export type { Crop, Frame } from "./crop.js";
export type { DemoState, WorkedExample } from "./example.js";
export type { GridKind } from "./grid.js";
export type { Group } from "./groups.js";
export { type HistoryEvent, replay } from "./history.js";
export type { InkPoint, Stroke } from "./ink.js";
export type { Manifest } from "./manifest.js";
export type {
  Anchor,
  CellPlace,
  CropNumbers,
  Mark,
  Marks,
  SheetSubmission,
  Submission,
  WorkbookSubmission,
} from "./marks.js";
export { SHEET } from "./sheet.js";
export type { Canvas, Task } from "./task.js";
