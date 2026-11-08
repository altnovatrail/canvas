// Type-checked by ci-lint and never built: what the entry point @altnovatrail/canvas/core gives
// (R27). The types of the data and the fold of a history are there; the rules of the groups, the
// crop, the snapping and the boxes are not, though the eval protocol has taken them (R94 spec),
// nor is the workbook's layout. Were the entry to give one of them, the directive over it would go
// unused, and that would be the error. The data's types of the contract are spec's, the same types
// (R74 spec; T69), and the tutor's marks are among them (R83 spec; T16).

import type * as spec from "@altnovatrail/spec/canvas";
import type * as open from "@altnovatrail/spec/formatv0/open";
import type * as types from "./index.js";
import * as core from "./index.js";

export type Given = [
  types.Anchor,
  types.Box,
  types.Canvas,
  types.CellPlace,
  types.Crop,
  types.CropNumbers,
  types.DemoState,
  types.Filling,
  types.Frame,
  types.GridKind,
  types.Group,
  types.HistoryEvent,
  types.InkPoint,
  types.Manifest,
  types.Mark,
  types.Marks,
  types.SheetSubmission,
  types.Stroke,
  types.Submission,
  types.Task,
  types.WorkedExample,
  types.WorkbookSubmission,
];

/** Whether two types are one: each takes what the other does, readonly and optional fields too. */
export type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

/** The entry's types of the data are spec's, under spec's names: a copy gone astray is false. */
export type Data = All<
  [
    Same<types.Anchor, spec.Anchor>,
    Same<types.Box, spec.Box>,
    Same<types.CellPlace, spec.CellPlace>,
    Same<types.CropNumbers, spec.CropNumbers>,
    Same<types.DemoState, spec.DemoState>,
    Same<types.Filling, spec.Filling>,
    Same<types.Frame, spec.Frame>,
    Same<types.Group, spec.Group>,
    Same<types.HistoryEvent, spec.HistoryEvent>,
    Same<types.InkPoint, spec.InkPoint>,
    Same<types.Manifest, open.Manifest>,
    Same<types.Mark, spec.Mark>,
    Same<types.Marks, spec.Marks>,
    Same<types.SheetSubmission, spec.SheetSubmission>,
    Same<types.Stroke, spec.Stroke>,
    Same<types.Submission, spec.Submission>,
    Same<types.WorkbookSubmission, spec.WorkbookSubmission>,
    Same<types.WorkedExample, open.WorkedExample>,
  ]
>;
export const data: Data = true;
/** Whether every check of a list holds: `true`, or `never`, which no value is. */
export type All<T extends readonly boolean[]> = T extends readonly true[] ? true : never;

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
// @ts-expect-error Nor its check of a worked example (R42).
export const example = core.exampleOf;
// @ts-expect-error Nor of the state of its demo.
export const demoState = core.demoStateOf;
// @ts-expect-error Nor its reading of a manifest.
export const settings = core.settingsOf;
// @ts-expect-error Nor the layout of a workbook's page, which vectors/pages.json pins (R34, R35).
export const page = core.pageOf;
// @ts-expect-error Nor the rule of its boxes, which spec's test vectors pin (R37; R94 spec).
export const box = core.cellOf;
// @ts-expect-error Nor the element's own shape of a task it checked: a task is of spec's type (R41).
export type Checked = types.SheetTask;
