import { type Cell, tableOf } from "./boxes.js";
import { type Crop, cropOf } from "./crop.js";
import { type Box, tenths } from "./geometry.js";
import { type Group, groupsOf } from "./groups.js";
import type { Stroke } from "./ink.js";
import {
  type CropNumbers,
  digestOf,
  type Paper,
  type PaperSubmission,
  type SheetSubmission,
  type WorkbookSubmission,
  workbookDigestOf,
} from "./marks.js";
import { encodePNG } from "./png.js";
import { pictureOf, rasterOf } from "./raster.js";
import { type Gray, layOver, type TracingState, tenthsOf } from "./tracing.js";

/** The work of a sheet for checking: the PNG of its crop, and the context of the submission. */
export interface WorkForCheck {
  readonly png: Uint8Array<ArrayBuffer>;
  readonly submission: SheetSubmission;
}

/**
 * The work of a task from paper for checking: the PNG of the crop of its work, and the
 * context of the submission.
 */
export interface PaperForCheck {
  readonly png: Uint8Array<ArrayBuffer>;
  readonly submission: PaperSubmission;
}

/** The crop of one filled box of a workbook (R38): its item and its slot, from 1, and its PNG. */
export interface CellForCheck {
  readonly item: number;
  readonly slot: number;
  readonly png: Uint8Array<ArrayBuffer>;
}

/**
 * The work of a workbook for checking: the crop of each filled box, in the task's order,
 * and the context of the submission.
 */
export interface CellsForCheck {
  readonly cells: readonly CellForCheck[];
  readonly submission: WorkbookSubmission;
}

/**
 * The work of a sheet for checking, as `exportWork()` gives it: of the strokes the sheet
 * shows, their groups by the sheet's rule, their crop with its digits `digit` px high and its
 * PNG, and the context of the submission — the crop's numbers that place the tutor's marks,
 * the groups, the table «label → stroke IDs», and their digest — frozen through. A sheet
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
 * The work of a workbook for checking, as `exportWork()` gives it: of the strokes the
 * page shows, the table of the boxes they fill by the rule of boxes, and the crop of each
 * filled box by the crop's rule — the box's strokes alone, one group of them, its digits `digit` px
 * high — with its item and its slot, in the task's order, and the context of the submission: the
 * table and its digest. The draft goes nowhere. A page with no box filled has no work to check, and
 * gives null, though it holds draft. The crops are frozen, not their bytes, which no freezing
 * holds; the context is frozen through. One crop of every box's strokes, which spec may choose, is
 * `croppedOf` of the table's strokes with the table's rows for groups.
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

/**
 * The work of a task from paper for checking, as `exportWork()` gives it with the task's crop:
 *of the strokes the sheet and the tracing paper hold, where they lie on the sheet, their
 * groups by the sheet's rule, and their crop by the crop's rule with its digits `digit` px high,
 * taking in the tracing paper's rectangle `rect`, in units, at the same scale — the crop's picture,
 * `picture`, laid over it there as the screen lays it — and the context: the crop's numbers, the
 * groups, where the tracing paper lay, `tracing`, and the digest of it all, which holds the strokes
 * written on the tracing paper, `paper`. Hidden or shown, the tracing paper is in the crop. No
 * stroke on either is no work to check: null (H3). The picture not read yet, or not at all, `null`,
 * leaves the paper white.
 */
export function paperWorkForCheck(
  strokes: readonly Stroke[],
  paper: Paper,
  tracing: TracingState,
  rect: Box,
  picture: Gray | null,
  digit: number,
): PaperForCheck | null {
  const groups = groupsOf(strokes);
  const crop = cropOf(strokes, groups, digit, tenthsOf(rect));
  if (crop === null) return null;
  const ink = rasterOf(strokes, crop);
  if (picture !== null) layOver(ink, crop.width, picture, pixelsOf(rect, crop));
  const { drawn, width, height, margins, sheetBox, frames, exact } = crop;
  const numbers: CropNumbers = { drawn, width, height, margins, sheetBox, frames, exact };
  const submission = {
    crop: numbers,
    groups,
    tracing: {
      at: [tracing.at[0], tracing.at[1]] as const,
      hidden: tracing.hidden,
      scale: tracing.scale ?? 1,
    },
    digest: digestOf(strokes, numbers, groups, paper),
  };
  return Object.freeze({
    png: encodePNG(ink, crop.width, crop.height),
    submission: frozen(submission),
  });
}

/** Where a rectangle of the sheet, in units, lies on a crop, in px, as its raster places points. */
function pixelsOf(
  rect: Box,
  crop: Crop,
): {
  left: number;
  top: number;
  right: number;
  bottom: number;
} {
  const [top, left] = crop.margins;
  const { box, median: unit } = crop.exact;
  const across = (x: number) => ((tenths(x) - box.minX) * crop.drawn + left * unit) / unit;
  const down = (y: number) => ((tenths(y) - box.minY) * crop.drawn + top * unit) / unit;
  return {
    left: across(rect.minX),
    top: down(rect.minY),
    right: across(rect.maxX),
    bottom: down(rect.maxY),
  };
}

/** The crop of strokes in their groups, its digits `digit` px high, and its PNG. */
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
