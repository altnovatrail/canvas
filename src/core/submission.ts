import { type Cell, tableOf } from "./boxes.js";
import { type Crop, cropOf } from "./crop.js";
import { type Group, groupsOf } from "./groups.js";
import type { Stroke } from "./ink.js";
import {
  type CropNumbers,
  digestOf,
  type SheetSubmission,
  type WorkbookSubmission,
  workbookDigestOf,
} from "./marks.js";
import { pictureOf } from "./raster.js";

/** The work of a sheet for checking (R27): the PNG of its crop, and the context of the submission. */
export interface WorkForCheck {
  readonly png: Uint8Array<ArrayBuffer>;
  readonly submission: SheetSubmission;
}

/** The crop of one filled box of a workbook (R38): its item and its slot, from 1, and its PNG. */
export interface CellForCheck {
  readonly item: number;
  readonly slot: number;
  readonly png: Uint8Array<ArrayBuffer>;
}

/**
 * The work of a workbook for checking (R34, R38): the crop of each filled box, in the task's order,
 * and the context of the submission.
 */
export interface CellsForCheck {
  readonly cells: readonly CellForCheck[];
  readonly submission: WorkbookSubmission;
}

/**
 * The work of a sheet for checking, as `exportWork()` gives it (R07, R27): of the strokes the sheet
 * shows, their groups by the sheet's rule (R24), their crop with its digits `digit` px high and its
 * PNG (R25), and the context of the submission — the crop's numbers that place the tutor's marks,
 * the groups, the table «label → stroke IDs», and their digest (R26, R27) — frozen through. A sheet
 * without strokes has no work to check, and gives null (H3).
 */
export function workForCheck(strokes: readonly Stroke[], digit: number): WorkForCheck | null {
  const groups = groupsOf(strokes);
  const cropped = croppedOf(strokes, groups, digit);
  if (cropped === null) return null;
  const { drawn, width, height, margins, sheetBox, frames, exact } = cropped.crop;
  const numbers: CropNumbers = { drawn, width, height, margins, sheetBox, frames, exact };
  const submission = { crop: numbers, groups, digest: digestOf(strokes, numbers, groups) };
  return Object.freeze({ png: cropped.png, submission: frozen(submission) });
}

/**
 * The work of a workbook for checking, as `exportWork()` gives it (R34, R38): of the strokes the
 * page shows, the table of the boxes they fill by the rule of boxes (R37), and the crop of each
 * filled box by R25 — the box's strokes alone, one group of them, its digits `digit` px high —
 * with its item and its slot, in the task's order, and the context of the submission: the table and
 * its digest. The draft goes nowhere. A page with no box filled has no work to check, and gives
 * null, though it holds draft. The crops are frozen, not their bytes, which no freezing holds; the
 * context is frozen through. One crop of every box's strokes, which spec may choose (В45 in
 * RUN.md), is `croppedOf` of the table's strokes with the table's rows for groups.
 */
export function cellsForCheck(
  strokes: readonly Stroke[],
  cells: readonly Cell[],
  digit: number,
): CellsForCheck | null {
  const boxes = tableOf(strokes, cells);
  if (boxes.length === 0) return null;
  const byId = new Map(strokes.map((stroke) => [stroke.id, stroke]));
  const own = (ids: readonly number[]) => ids.flatMap((id) => byId.get(id) ?? []);
  const crops = boxes.map(({ item, slot, ids }) => {
    // A row of the table holds a stroke at least, and a crop of strokes is never null.
    const cropped = croppedOf(own(ids), [{ label: "A", ids }], digit);
    if (cropped === null) throw new Error(`the box ${item}.${slot} has strokes and no crop`);
    return Object.freeze({ item, slot, png: cropped.png });
  });
  const sent = own(boxes.flatMap(({ ids }) => ids));
  const submission = { boxes, digest: workbookDigestOf(sent, boxes, cells) };
  return Object.freeze({ cells: Object.freeze(crops), submission: frozen(submission) });
}

/** The crop of strokes in their groups, its digits `digit` px high, and its PNG (R25). */
function croppedOf(
  strokes: readonly Stroke[],
  groups: readonly Group[],
  digit: number,
): { readonly crop: Crop; readonly png: Uint8Array<ArrayBuffer> } | null {
  const crop = cropOf(strokes, groups, digit);
  return crop === null ? null : { crop, png: pictureOf(strokes, crop) };
}

/** A value of plain objects and arrays, frozen through. */
function frozen<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    for (const each of Object.values(value)) frozen(each);
    Object.freeze(value);
  }
  return value;
}
