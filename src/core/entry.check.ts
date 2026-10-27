// Type-checked by ci-lint and never built: what the entry point @altnovatrail/canvas/core gives
// (R27). The types of the data and the fold of a history are there; the rules of the groups, the
// crop and the snapping are not, until the eval protocol takes them. Were the entry to give one of
// them, the directive over it would go unused, and that would be the error.

import type * as types from "./index.js";
import * as core from "./index.js";

export type Given = [
  types.Anchor,
  types.AnswerSlot,
  types.Box,
  types.Crop,
  types.CropNumbers,
  types.Frame,
  types.GridKind,
  types.Group,
  types.HistoryEvent,
  types.InkPoint,
  types.LinePart,
  types.Manifest,
  types.Mark,
  types.Marks,
  types.PicturePart,
  types.SheetCanvas,
  types.SheetItem,
  types.SheetTask,
  types.StatementPart,
  types.Stroke,
  types.Submission,
  types.Task,
  types.TextPart,
  types.WorkbookCanvas,
  types.WorkbookItem,
  types.WorkbookTask,
  types.Zone,
];

/** The fold reads a history as the sheet hands it out, into the strokes it leaves. */
export const folded: (history: readonly types.HistoryEvent[]) => types.Stroke[] = core.replay;
export const sheet: { readonly width: 1000; readonly height: 1400 } = core.SHEET;

// @ts-expect-error The rule of the groups is not the entry's.
export const groups = core.groupsOf;
// @ts-expect-error Nor is the crop's.
export const crop = core.cropOf;
// @ts-expect-error Nor the snapping.
export const snap = core.snapOf;
// @ts-expect-error The element's own check of a task is no part of the entry (R32).
export const task = core.taskOf;
// @ts-expect-error Nor what the sheet makes of one.
export const template = core.templateOf;
// @ts-expect-error Nor its reading of a manifest.
export const settings = core.settingsOf;
