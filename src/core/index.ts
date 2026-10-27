// The DOM-free part of the canvas, the package's entry point @altnovatrail/canvas/core: plain
// TypeScript that runs the same in a browser and in Node, for the tests and the synthetic samples
// too (R05, R07). Importing it registers no element: the element is the other entry point. It
// gives the sheet's size, the types of the data the element takes and gives — the strokes and the
// history of writing, the task, the tutor's marks with the context of their submission — and the
// fold of a history into the strokes it leaves, so that a consumer reads a history it keeps
// without the DOM (R27). The rules of the groups, the crop and the snapping stay inside until the
// eval protocol, which takes them as they are, comes out (epic E3 in spec's RUN.md; R31).

export type { Crop, Frame } from "./crop.js";
export type { Box } from "./geometry.js";
export type { GridKind } from "./grid.js";
export type { Group } from "./groups.js";
export { type HistoryEvent, replay } from "./history.js";
export type { InkPoint, Stroke } from "./ink.js";
export type { Manifest } from "./manifest.js";
export type { Anchor, CropNumbers, Mark, Marks, Submission } from "./marks.js";
export { SHEET } from "./sheet.js";
export type {
  AnswerSlot,
  LinePart,
  PicturePart,
  SheetCanvas,
  SheetItem,
  SheetTask,
  StatementPart,
  Task,
  TextPart,
  WorkbookCanvas,
  WorkbookItem,
  WorkbookTask,
  Zone,
} from "./task.js";
