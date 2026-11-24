// The DOM-free part of the canvas, the package's entry point @altnovatrail/canvas/core: plain
// TypeScript that runs the same in a browser and in Node, for the tests and the synthetic samples
// too. Importing it registers no element: the element is the other entry point. It
// gives the sheet's size, the types of the data the element takes and gives — the strokes, their
// styles and the pieces the eraser cuts, the history of writing, the settings of the pen and the
// eraser, the task, the worked example and the manifest, how far the learner has gone
// through the example's demo and the context of a submission, of a sheet, a workbook or a
// task from paper with where its tracing paper lay, all of spec's types, and the tutor's marks,
// spec's types too — and the fold of a history into the strokes it leaves, so that a consumer reads
// a history it keeps without the DOM. The code runs without the DOM, but spec's declarations of the
// element's contract, which its types come from, name the DOM's types too: a consumer without the
// DOM's types skips them with skipLibCheck. The rules of the groups, the crop and the snapping stay
// inside: the eval protocol has taken them as they are, and spec's test vectors pin them.

export type { Box } from "@altnovatrail/spec/canvas";
export type { Filling } from "./boxes.js";
export type { Crop, Frame } from "./crop.js";
export type { DemoState, WorkedExample } from "./example.js";
export type { GridKind } from "./grid.js";
export type { Group } from "./groups.js";
export { type HistoryEvent, type Piece, replay } from "./history.js";
export type { InkPoint, Stroke } from "./ink.js";
export type { Manifest } from "./manifest.js";
export type {
  Anchor,
  CellPlace,
  CropNumbers,
  Mark,
  Marks,
  PaperSubmission,
  SheetSubmission,
  Submission,
  WorkbookSubmission,
} from "./marks.js";
export { SHEET } from "./sheet.js";
export type { EraserMode, PenKind, PenSettings, StrokeStyle } from "./style.js";
export type { Canvas, Task } from "./task.js";
export type { TracingState } from "./tracing.js";
export type { CropStroke, TutorAct } from "./tutor.js";
