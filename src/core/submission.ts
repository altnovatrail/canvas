import { cropOf } from "./crop.js";
import { groupsOf } from "./groups.js";
import type { Stroke } from "./ink.js";
import { type CropNumbers, digestOf, type Submission } from "./marks.js";
import { pictureOf } from "./raster.js";

/** The work of a sheet for checking (R27): the PNG of its crop, and the context of the submission. */
export interface WorkForCheck {
  readonly png: Uint8Array<ArrayBuffer>;
  readonly submission: Submission;
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
  const crop = cropOf(strokes, groups, digit);
  if (crop === null) return null;
  const { drawn, width, height, margins, sheetBox, frames, exact } = crop;
  const numbers: CropNumbers = { drawn, width, height, margins, sheetBox, frames, exact };
  const submission = { crop: numbers, groups, digest: digestOf(strokes, numbers, groups) };
  return Object.freeze({ png: pictureOf(strokes, crop), submission: frozen(submission) });
}

/** A value of plain objects and arrays, frozen through. */
function frozen<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    for (const each of Object.values(value)) frozen(each);
    Object.freeze(value);
  }
  return value;
}
