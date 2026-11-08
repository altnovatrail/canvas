// The sample file of the eval protocol (R48; R93–R95 spec): one sample of writing on a sheet or a
// page of a workbook, the message Sample of novatrail.eval.v1, one JSON file to a sample. The
// samples page writes it (T20), and so does the code that draws the synthetic samples (T18); the
// eval runner of tutor reads it, and spec's sample-check holds each file to the rules of the
// protocol (contracts/README.md, section «The sample file»). What a sample holds its purpose and
// its writer set (R09): a sample of measurement by an adult keeps the history of writing, one of
// an eval set and one of a child the final geometry. Its crops are drawn from the strokes the file
// holds, by the rules the sheet shares with the runner (R94 spec). This module is no part of the
// package: no consumer of the element writes samples (R48).

import {
  type CropSetSchema,
  type GeometrySchema,
  type HistoryEventSchema,
  MarkupSchema,
  Purpose,
  type Sample,
  SampleSchema,
  type TaskReferenceSchema,
  Writer,
} from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import {
  clone,
  create,
  fromJsonString,
  type MessageInitShape,
  toJsonString,
} from "@bufbuild/protobuf";
import { type Cell, tableOf } from "../core/boxes.js";
import { CROP, cropOf } from "../core/crop.js";
import { extentOf, tenths } from "../core/geometry.js";
import { type Group, groupsOf } from "../core/groups.js";
import { type HistoryEvent, replay } from "../core/history.js";
import type { Stroke } from "../core/ink.js";
import { pictureOf } from "../core/raster.js";
import type { Point } from "../core/screen.js";
import { SHEET } from "../core/sheet.js";
import { byPlace, finalPoints } from "./resample.js";

/** The protocol a sample file is written in: the package of its message. */
export const PROTOCOL = "novatrail.eval.v1";

/** What the samples page writes of a person's sample: the version of its texts and its own (R11). */
export interface PersonOrigin {
  readonly person: { readonly textSetVersion: string; readonly canvasVersion: string };
}

/**
 * What code that draws a sample gives: its seed, an unsigned integer of 64 bits in decimal digits.
 * The page did not write it, so it has canvas_version "0.0.0" and text_set_version "none" (the
 * 2026-11-07 amendment to R93 spec).
 */
export interface SyntheticOrigin {
  readonly synthetic: { readonly seed: string };
}

/** Where a sample was written: a sheet, or a page of a workbook with its boxes in the task's order. */
export type Surface =
  | { readonly sheet: { readonly history: readonly HistoryEvent[]; readonly digit: number } }
  | {
      readonly workbook: {
        readonly history: readonly HistoryEvent[];
        readonly cells: readonly Cell[];
        readonly digit: number;
      };
    };

/**
 * What a sample is made of. The markup names strokes by the IDs the sheet's history gave them; a
 * sample of the final geometry renumbers them by place, as it does its groups and its table (R09).
 */
export interface SampleInput {
  /** The sample's ID: a person's at random (`personId`), a synthetic one's from its seed. */
  readonly id: string;
  readonly purpose: Purpose;
  readonly writer: Writer;
  readonly origin: PersonOrigin | SyntheticOrigin;
  /** The writer's code (`writerCode`): a sample of measurement has one, an eval set's none. */
  readonly writerCode?: string;
  /** The task the sample answers, without its key (R05 spec): as the caller found it. */
  readonly task: MessageInitShape<typeof TaskReferenceSchema>;
  readonly surface: Surface;
  readonly markup: MessageInitShape<typeof MarkupSchema>;
}

/** The license a sample of an eval set is published under, as modules publishes it (R20 spec). */
const EVAL_SET_LICENSE = "Apache-2.0";

/** The writers whose sample of measurement keeps the history of writing: adults (R09). */
const ADULTS = new Set([Writer.ADULT, Writer.ADULT_AS_CHILD]);

/**
 * The sample of the input (R09; R93 spec), checked as far as the input alone tells: a sample with
 * no purpose or no writer, a child's sample of an eval set, and a writer's code where its
 * composition has none, or none where it has one, are each a TypeError. The rest — the shape of an
 * ID, a code, a version, a digest, the markup against the strokes — is spec's sample-check's.
 */
export function sampleOf(input: SampleInput): Sample {
  const { purpose, writer, writerCode } = input;
  if (purpose === Purpose.UNSPECIFIED || writer === Writer.UNSPECIFIED) {
    throw new TypeError("a sample has a purpose and a writer");
  }
  const evalSet = purpose === Purpose.EVAL_SET;
  if (evalSet && writer === Writer.CHILD) {
    throw new TypeError("a child writes no sample of an eval set");
  }
  if (evalSet !== (writerCode === undefined)) {
    throw new TypeError(
      evalSet
        ? "a sample of an eval set has no writer's code: it would link published samples"
        : "a sample of measurement has its writer's code",
    );
  }
  const { history, digit } =
    "sheet" in input.surface ? input.surface.sheet : input.surface.workbook;
  const cells = "workbook" in input.surface ? input.surface.workbook.cells : null;
  // The groups and the table of boxes are the device's, of the strokes as they came (R09; R24).
  const raw = replay(history);
  const groups = cells === null ? groupsOf(raw) : [];
  const table = cells === null ? [] : tableOf(raw, cells);
  // An adult's sample of measurement keeps the history; an eval set's and a child's, the geometry.
  const ink =
    !evalSet && ADULTS.has(writer)
      ? historyInk(history, raw)
      : geometryInk(cells === null ? raw : inBoxes(raw, table));
  // A stroke the file does not hold — erased, or the draft of a workbook — has no number in it.
  const renumbered = (ids: readonly number[]) =>
    ids
      .map((id) => {
        const number = ink.numbers.get(id);
        if (number === undefined) throw new TypeError(`the sample holds no stroke ${id}`);
        return number;
      })
      .sort(byNumber);
  // A copy: the caller's markup keeps the sheet's IDs, whatever this sample numbers them.
  const markup = clone(MarkupSchema, create(MarkupSchema, input.markup));
  if (markup.writing.case === "parts") {
    for (const part of markup.writing.value.parts) part.strokeIds = renumbered(part.strokeIds);
  }
  const byId = new Map(ink.strokes.map((stroke) => [stroke.id, stroke]));
  const own = (ids: readonly number[]) => ids.flatMap((id) => byId.get(id) ?? []);
  const page = { width: SHEET.width, height: SHEET.height, digitHeight: digit };
  let surface: MessageInitShape<typeof SampleSchema>["surface"];
  if (cells === null) {
    const named = groups.map(({ label, ids }) => ({ label, ids: renumbered(ids) }));
    surface = {
      case: "sheet",
      value: {
        ...page,
        groups: named.map(({ label, ids }) => ({ label, strokeIds: ids })),
        ...cropsField(ink.strokes, named, digit),
      },
    };
  } else {
    surface = {
      case: "workbook",
      value: {
        ...page,
        boxes: cells.map(({ item, slot, box }) => ({
          answerSlot: { item, slot },
          ...wholeBox(box, item, slot),
        })),
        filledBoxes: table.map(({ item, slot, ids }) => {
          const strokeIds = renumbered(ids);
          return {
            answerSlot: { item, slot },
            strokeIds,
            ...cropsField(own(strokeIds), [], digit),
          };
        }),
      },
    };
  }
  const versions =
    "person" in input.origin
      ? input.origin.person
      : { textSetVersion: "none", canvasVersion: "0.0.0" };
  return create(SampleSchema, {
    protocol: PROTOCOL,
    id: input.id,
    purpose,
    writer,
    origin:
      "person" in input.origin
        ? { case: "person", value: {} }
        : { case: "synthetic", value: { seed: input.origin.synthetic.seed } },
    ...(writerCode === undefined ? {} : { writerCode }),
    textSetVersion: versions.textSetVersion,
    canvasVersion: versions.canvasVersion,
    ...(evalSet ? { license: EVAL_SET_LICENSE } : {}),
    task: input.task,
    ink: ink.message,
    surface,
    markup,
  });
}

/** The text of a sample file, as a writer writes it: every field, its zero too, by proto names. */
export function sampleText(sample: Sample): string {
  const text = toJsonString(SampleSchema, sample, {
    useProtoFieldName: true,
    alwaysEmitImplicit: true,
    prettySpaces: 2,
  });
  return `${text}\n`;
}

/**
 * The sample a file's text holds, read strictly (R93 spec): a field the message does not have, or
 * a file of another protocol, is a TypeError. Whether it keeps the protocol's rules is spec's
 * sample-check's to say.
 */
export function readSample(text: string): Sample {
  let sample: Sample;
  try {
    sample = fromJsonString(SampleSchema, text);
  } catch (error) {
    throw new TypeError(`not a sample of ${PROTOCOL}: ${(error as Error).message}`);
  }
  if (sample.protocol !== PROTOCOL) {
    throw new TypeError(`a sample of ${PROTOCOL}, not of ${JSON.stringify(sample.protocol)}`);
  }
  return sample;
}

/** The ID of a synthetic sample, from its seed, as spec's examples name theirs. */
export function syntheticId(seed: string): string {
  return `synthetic-${seed}`;
}

/** What the IDs and the codes are made of: 32 letters each, so the low five bits of a byte pick one. */
const ID_LETTERS = "abcdefghijklmnopqrstuvwxyz234567";
const CODE_LETTERS = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * A person's sample ID, at random: 12 lowercase letters and digits, 60 bits, of the first 12 of the
 * random bytes the caller gives — the page, from crypto.getRandomValues.
 */
export function personId(random: Uint8Array): string {
  return lettersOf(random, 12, ID_LETTERS);
}

/**
 * A writer's code, at random: 8 digits and capital letters, 40 bits, of the first 8 of the random
 * bytes given (R09). The page makes it, and the adult writes it down beside the consent (T20).
 */
export function writerCode(random: Uint8Array): string {
  return lettersOf(random, 8, CODE_LETTERS);
}

function lettersOf(random: Uint8Array, count: number, letters: string): string {
  if (random.length < count) throw new RangeError(`${count} random bytes, not ${random.length}`);
  return Array.from(random.subarray(0, count), (byte) => letters[byte & 31]).join("");
}

/** The ink of a sample: its message, the strokes it holds, and each stroke's number in it. */
interface Ink {
  readonly message: MessageInitShape<typeof SampleSchema>["ink"];
  readonly strokes: readonly Stroke[];
  readonly numbers: ReadonlyMap<number, number>;
}

/** A place to a tenth of a unit, as a sample keeps it (R09): round(10 × v), half up. */
const toTenth = (value: number) => tenths(value) / 10;

/** A time in whole milliseconds, half up. */
const toMs = (t: number) => Math.round(t);

/**
 * The history of writing as a sample keeps it (R09; R93 spec): each event at its time in whole
 * milliseconds, a stroke's points to a tenth of a unit and in whole milliseconds, without the
 * pressure. Rounding keeps the order of times, so a stroke still lands no sooner than its last
 * point (R22). Its strokes are those the history shows at the end, as the file holds them.
 */
function historyInk(history: readonly HistoryEvent[], shown: readonly Stroke[]): Ink {
  const events = history.map((event): MessageInitShape<typeof HistoryEventSchema> => {
    const tMs = toMs(event.t);
    switch (event.kind) {
      case "write": {
        const { id, kind: pointer, points } = event.stroke;
        const ink = points.map(({ x, y, t }) => ({ x: toTenth(x), y: toTenth(y), tMs: toMs(t) }));
        return { tMs, event: { case: "write", value: { id, pointer, points: ink } } };
      }
      case "erase":
      case "clear":
        return { tMs, event: { case: event.kind, value: { ids: [...event.ids] } } };
      default: {
        const { removed, restored } = event;
        return {
          tMs,
          event: { case: "undo", value: { removed: [...removed], restored: [...restored] } },
        };
      }
    }
  });
  const strokes = shown.map((stroke) => ({
    ...stroke,
    points: stroke.points.map((point) => ({ ...point, x: toTenth(point.x), y: toTenth(point.y) })),
  }));
  return {
    message: { case: "history", value: { events } },
    strokes,
    numbers: new Map(strokes.map(({ id }) => [id, id])),
  };
}

/**
 * The final geometry of the strokes a sheet shows (R09): each in its canonical direction, its
 * points along it a step apart, the strokes numbered by place from 1. Its points have no time and
 * no pressure, and the crops are drawn from them.
 */
function geometryInk(shown: readonly Stroke[]): Ink {
  const placed = shown
    .map((stroke) => ({
      id: stroke.id,
      box: extentOf(stroke),
      points: finalPoints(stroke.points),
    }))
    .sort(byPlace);
  const numbers = new Map(placed.map(({ id }, n) => [id, n + 1]));
  const strokes = placed.map(({ points }, n) => finalStroke(n + 1, points));
  const value: MessageInitShape<typeof GeometrySchema> = {
    strokes: strokes.map(({ id, points }) => ({
      id,
      points: points.map(({ x, y }) => ({ x, y })),
    })),
  };
  return { message: { case: "geometry", value }, strokes, numbers };
}

/** A stroke of the final geometry as the sheet's rules take one: they read no time or pressure. */
function finalStroke(id: number, points: readonly Point[]): Stroke {
  return { id, kind: "", points: points.map(({ x, y }) => ({ x, y, t: 0, p: 0 })) };
}

/** The strokes of a workbook its boxes hold: the draft goes nowhere (R53 spec). */
function inBoxes(
  strokes: readonly Stroke[],
  table: readonly { ids: readonly number[] }[],
): Stroke[] {
  const held = new Set(table.flatMap(({ ids }) => ids));
  return strokes.filter(({ id }) => held.has(id));
}

/**
 * The field `crops` of a set of strokes with their groups (R25; R94 spec): a crop at each height of
 * eval and at the module's, each once, by the height ascending, with its PNG, and the box of the
 * points and h_med in whole tenths. Of no strokes, no field: a sheet without strokes has no crops.
 */
function cropsField(
  strokes: readonly Stroke[],
  groups: readonly Group[],
  digit: number,
): { crops?: MessageInitShape<typeof CropSetSchema> } {
  if (strokes.length === 0) return {};
  const heights = [...new Set([...CROP.heights, digit])].sort(byNumber);
  // A box's strokes are one group to the rule of the crop, and its crops have no frames (R38).
  const framed = groups.length > 0;
  const ruled = framed ? groups : [{ label: "A", ids: strokes.map(({ id }) => id) }];
  const drawn = heights.map((height) => {
    const crop = cropOf(strokes, ruled, height);
    if (crop === null) throw new Error("strokes with no crop");
    return crop;
  });
  const crops = drawn.map((crop) => {
    const [ymin, xmin, ymax, xmax] = crop.sheetBox;
    return {
      digitHeight: crop.digit,
      drawnHeight: crop.drawn,
      width: crop.width,
      height: crop.height,
      marginTop: crop.margins[0],
      marginLeft: crop.margins[1],
      scale: crop.scale,
      lineWidth: crop.line,
      sheetBox: { ymin, xmin, ymax, xmax },
      frames: (framed ? crop.frames : []).map(({ label, box: [y0, x0, y1, x1] }) => ({
        label,
        box: { ymin: y0, xmin: x0, ymax: y1, xmax: x1 },
      })),
      png: pictureOf(strokes, crop),
    };
  });
  // The box of the points and h_med are every crop's: h_med itself, not the crop's exact median,
  // which is H, the median the scale takes, min(h_med, 1000) (R25).
  const [first] = drawn;
  if (first === undefined) throw new Error("no heights of digits");
  const { minX, minY, maxX, maxY } = first.exact.box;
  const inkBox = { ymin: minY, xmin: minX, ymax: maxY, xmax: maxX };
  return { crops: { inkBox, bundleMedian: tenths(first.median), crops } };
}

/** A box of a page in whole units, as the protocol takes one: a box elsewhere is a RangeError. */
function wholeBox(
  { left, top, width, height }: Cell["box"],
  item: number,
  slot: number,
): { left: number; top: number; width: number; height: number } {
  if (![left, top, width, height].every(Number.isInteger)) {
    throw new RangeError(`the box ${item}.${slot} is not in whole units of the page`);
  }
  return { left, top, width, height };
}

function byNumber(a: number, b: number): number {
  return a - b;
}

export type { Sample };
export { Purpose, Writer };
