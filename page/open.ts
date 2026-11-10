// What the samples page shows of a sample file it opens (T87 in RUN.md; R64 in docs/decisions.md):
// the strokes the file holds, its crops and the texts of its markup, for the organizer of an eval
// set, the author of a module or of a measurement to look for a name, a signature or a contact
// before the file goes on (R110 spec; П-12). It is drawn from the file alone — the sheet, a
// workbook's boxes, the strokes — for a module's task is none of the build's (R62). A history of
// writing shows what the sheet showed at the end, and apart what was written and erased: the file
// holds that too. Nothing here checks the file beyond reading it: spec's sample-check holds the
// rules (R93 spec). This module knows no DOM; page/main.ts draws what it gives.

import {
  type CropSet,
  PartKind,
  Purpose,
  type Sample,
  Writer,
} from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import {
  type AnswerSlotObservation,
  type AnswerSlotPlace,
  Unreadable,
} from "@altnovatrail/contracts/novatrail/observation/v1/observation_pb.js";
import { type HistoryEvent, replay } from "../src/core/history.js";
import { INK_WIDTH } from "../src/core/outline.js";
import { placeOf } from "./markup.js";
import { OPEN } from "./texts.js";

/** A stroke as the file holds it: its ID and its points, across and down in units of the sheet. */
export interface Line {
  readonly id: number;
  readonly points: readonly (readonly [x: number, y: number])[];
}

/** A box of a workbook's page, by its place `item.slot`, in whole units. */
export interface PageBox {
  readonly place: string;
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

/** A field of the file said in words: its name and its value. */
export interface Field {
  readonly name: string;
  readonly value: string;
}

/** The crops of one set of strokes: the sheet's, or a filled box's, each at its height. */
export interface Crops {
  readonly title: string;
  readonly crops: readonly { readonly label: string; readonly png: Uint8Array }[];
}

/** A part of a sheet's solution, as the markup holds it. */
export interface PartShown {
  readonly title: string;
  readonly text: string;
  readonly flags: readonly string[];
}

/** The markup said in words. */
export interface MarkupShown {
  readonly truth: readonly Field[];
  readonly notes: readonly Field[];
  readonly parts: readonly PartShown[];
  readonly firstError?: string;
  readonly marks: readonly Field[];
}

/** What the page shows of a sample. */
export interface SampleView {
  /** The sheet's or the page's size, in units, as the file gives it. */
  readonly width: number;
  readonly height: number;
  /** What the picture takes in: the sheet, and any stroke the file has beyond it, so that none is
   * cut off. */
  readonly frame: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
  readonly boxes: readonly PageBox[];
  /** The strokes the sheet showed at the end. */
  readonly shown: readonly Line[];
  /** The strokes a history wrote and the sheet did not show at the end — erased, cleared or taken
   * off by undo, and still in the file; a geometry has none. */
  readonly hidden: readonly Line[];
  readonly about: readonly Field[];
  readonly task: readonly Field[];
  readonly crops: readonly Crops[];
  /** The markup, or undefined for a file without one. */
  readonly markup?: MarkupShown;
}

/** The margin of the picture around the sheet and the strokes, in units: a pen's line's width. */
const MARGIN = INK_WIDTH;

/** A value of an enum in the page's words, or by its name in the protocol when they have none. */
function named<E extends number>(
  words: Partial<Record<E, string>>,
  names: Record<number, string>,
  value: E,
): string {
  return words[value] ?? names[value] ?? String(value);
}

const PURPOSES: Partial<Record<Purpose, string>> = {
  [Purpose.MEASUREMENT]: OPEN.purposeMeasurement,
  [Purpose.EVAL_SET]: OPEN.purposeEvalSet,
};
const WRITERS: Partial<Record<Writer, string>> = {
  [Writer.ADULT]: OPEN.writerAdult,
  [Writer.ADULT_AS_CHILD]: OPEN.writerAdultAsChild,
  [Writer.CHILD]: OPEN.writerChild,
};
const REASONS: Partial<Record<Unreadable, string>> = {
  [Unreadable.BLANK]: OPEN.blank,
  [Unreadable.ILLEGIBLE]: OPEN.illegible,
  [Unreadable.AMBIGUOUS]: OPEN.ambiguous,
  [Unreadable.NO_FINAL_ANSWER]: OPEN.noFinalAnswer,
  [Unreadable.SEVERAL_FINAL_ANSWERS]: OPEN.severalFinalAnswers,
};
const KINDS: Partial<Record<PartKind, string>> = {
  [PartKind.TEXT]: OPEN.kindText,
  [PartKind.DRAWING]: OPEN.kindDrawing,
};

/** An answer slot's place as the page names a box, or a question mark where the file has none. */
const slotOf = (place: AnswerSlotPlace | undefined) => (place ? placeOf(place) : "?");

/**
 * The strokes of the file: a geometry's, all shown, or a history's replayed by the sheet's own rule
 * (`replay`, src/core/history.ts), with what it wrote and did not show at the end apart — erased,
 * cleared or taken off by undo, and still in the file.
 */
function linesOf(ink: Sample["ink"]): { shown: Line[]; hidden: Line[] } {
  const line = (id: number, points: readonly { x: number; y: number }[]): Line => ({
    id,
    points: points.map(({ x, y }) => [x, y] as const),
  });
  if (ink.case === "geometry") {
    return { shown: ink.value.strokes.map(({ id, points }) => line(id, points)), hidden: [] };
  }
  if (ink.case !== "history") return { shown: [], hidden: [] };
  const written: Line[] = [];
  const history = ink.value.events.flatMap(({ tMs: t, event }): HistoryEvent[] => {
    switch (event.case) {
      case "write": {
        const { id, points } = event.value;
        written.push(line(id, points));
        const stroke = { id, kind: "", points: points.map(({ x, y }) => ({ x, y, t, p: 0 })) };
        return [{ kind: "write", t, stroke }];
      }
      case "erase":
      case "clear":
        return [{ kind: event.case, t, ids: event.value.ids }];
      case "undo":
        return [{ kind: "undo", t, removed: event.value.removed, restored: event.value.restored }];
      default:
        return [];
    }
  });
  const visible = new Set(replay(history).map(({ id }) => id));
  return {
    shown: written.filter(({ id }) => visible.has(id)),
    hidden: written.filter(({ id }) => !visible.has(id)),
  };
}

/** One set of crops, each at its height of a digit, ascending as the file holds them. */
function cropsOf(title: string, set: CropSet | undefined): Crops[] {
  if (!set || set.crops.length === 0) return [];
  return [
    {
      title,
      crops: set.crops.map(({ digitHeight, png }) => ({
        label: OPEN.cropHeight(digitHeight),
        png,
      })),
    },
  ];
}

/** The crops of a surface: the sheet's one set, or a set for each filled box of a workbook. */
function surfaceCrops(surface: Sample["surface"]): Crops[] {
  if (surface.case === "sheet") return cropsOf(OPEN.sheetCrops, surface.value.crops);
  if (surface.case !== "workbook") return [];
  return surface.value.filledBoxes.flatMap(({ answerSlot, crops }) =>
    cropsOf(OPEN.boxCrops(slotOf(answerSlot)), crops),
  );
}

/** How the sample came to be: a person's, or drawn by code from its seed. */
function originOf(origin: Sample["origin"]): string {
  if (origin.case === "synthetic") return OPEN.synthetic(origin.value.seed);
  return origin.case === "person" ? OPEN.person : OPEN.none;
}

/** What the strokes are: a history of writing, or the final geometry. */
function inkOf(ink: Sample["ink"]): string {
  if (ink.case === "history") return OPEN.history(ink.value.events.length);
  return ink.case === "geometry" ? OPEN.geometry : OPEN.none;
}

/** What the truth says of an answer slot: its value as written, or why there is none. */
function readOf(read: AnswerSlotObservation["read"]): string {
  if (read.case === "value") return OPEN.value(read.value);
  return read.case === "unreadable" ? named(REASONS, Unreadable, read.value) : OPEN.none;
}

/** Who the file says wrote it, and how it came to be. */
function aboutOf(sample: Sample): Field[] {
  const about: Field[] = [
    { name: OPEN.id, value: sample.id },
    { name: OPEN.purpose, value: named(PURPOSES, Purpose, sample.purpose) },
    { name: OPEN.writer, value: named(WRITERS, Writer, sample.writer) },
    { name: OPEN.origin, value: originOf(sample.origin) },
  ];
  if (sample.writerCode !== undefined) about.push({ name: OPEN.code, value: sample.writerCode });
  if (sample.license !== undefined) about.push({ name: OPEN.license, value: sample.license });
  about.push(
    { name: OPEN.textSet, value: sample.textSetVersion },
    { name: OPEN.canvasVersion, value: sample.canvasVersion },
    { name: OPEN.ink, value: inkOf(sample.ink) },
  );
  return about;
}

/** The task the file names, without its key: its source, its ID and the digest of its view. */
function taskOf(sample: Sample): Field[] {
  const reference = sample.task;
  if (!reference) return [{ name: OPEN.source, value: OPEN.none }];
  const fields: Field[] = [];
  const { source } = reference;
  if (source.case === "modules") {
    const { tag, module, version, packageDigest } = source.value;
    fields.push(
      { name: OPEN.source, value: OPEN.fromModules },
      { name: OPEN.tag, value: tag },
      { name: OPEN.module, value: `${module} ${version}` },
      { name: OPEN.packageDigest, value: packageDigest },
    );
  } else if (source.case === "tutor") {
    fields.push(
      { name: OPEN.source, value: OPEN.fromTutor },
      { name: OPEN.tag, value: source.value.tag },
      { name: OPEN.fileDigest, value: source.value.fileDigest },
      { name: OPEN.bank, value: source.value.bank },
      { name: OPEN.bankDigest, value: source.value.bankDigest },
    );
  } else if (source.case === "file") {
    fields.push(
      { name: OPEN.source, value: OPEN.fromFile },
      { name: OPEN.fileDigest, value: source.value.fileDigest },
      { name: OPEN.bank, value: source.value.bank },
      { name: OPEN.bankDigest, value: source.value.bankDigest },
    );
  } else {
    fields.push({ name: OPEN.source, value: OPEN.none });
  }
  fields.push({ name: OPEN.task, value: reference.task });
  if (reference.seed !== undefined) fields.push({ name: OPEN.seed, value: reference.seed });
  fields.push({ name: OPEN.openView, value: reference.openViewDigest });
  return fields;
}

/** The markup in words: the truth of each answer slot, the notes, the parts or the marks. */
function markupOf(markup: NonNullable<Sample["markup"]>): MarkupShown {
  const truth = (markup.truth?.answerSlots ?? []).map(({ answerSlot, read }) => ({
    name: OPEN.slot(slotOf(answerSlot)),
    value: readOf(read),
  }));
  const notes = markup.notes.map(({ answerSlot, mirrored, crossedOut }) => ({
    name: OPEN.slot(slotOf(answerSlot)),
    value: [mirrored ? OPEN.mirrored : "", crossedOut ? OPEN.crossedOutNote : ""]
      .filter(Boolean)
      .join("; "),
  }));
  const { writing } = markup;
  const parts =
    writing.case === "parts"
      ? writing.value.parts.map((part, at) => ({
          title: OPEN.part(at + 1, named(KINDS, PartKind, part.kind), part.strokeIds.length),
          text: part.text,
          flags: [
            part.crossedOut ? OPEN.crossedOut : "",
            part.illegible ? OPEN.illegiblePart : "",
            part.finalAnswer ? OPEN.finalAnswer : "",
          ].filter(Boolean),
        }))
      : [];
  const firstError = writing.case === "parts" ? writing.value.firstError : undefined;
  const marks =
    writing.case === "marks"
      ? writing.value.marks.map(({ criterion, met }) => ({
          name: OPEN.criterion(criterion),
          value: met ? OPEN.met : OPEN.notMet,
        }))
      : [];
  return {
    truth,
    notes,
    parts,
    ...(firstError === undefined ? {} : { firstError: OPEN.firstErrorAt(firstError) }),
    marks,
  };
}

/** What the picture takes in: the sheet and every stroke, with a margin of a pen's width. */
function frameOf(width: number, height: number, lines: readonly Line[]): SampleView["frame"] {
  const xs = [0, width, ...lines.flatMap(({ points }) => points.map(([x]) => x))];
  const ys = [0, height, ...lines.flatMap(({ points }) => points.map(([, y]) => y))];
  const [x, y] = [Math.min(...xs) - MARGIN, Math.min(...ys) - MARGIN];
  return {
    x,
    y,
    width: Math.max(...xs) + MARGIN - x,
    height: Math.max(...ys) + MARGIN - y,
  };
}

/** What the page shows of a sample the person opened: nothing of it is changed or kept. */
export function viewOf(sample: Sample): SampleView {
  const { shown, hidden } = linesOf(sample.ink);
  const { surface } = sample;
  const { width, height } = surface.case === undefined ? { width: 0, height: 0 } : surface.value;
  const boxes =
    surface.case === "workbook"
      ? surface.value.boxes.map(({ answerSlot, left, top, width, height }) => ({
          place: slotOf(answerSlot),
          left,
          top,
          width,
          height,
        }))
      : [];
  return {
    width,
    height,
    frame: frameOf(width, height, [...shown, ...hidden]),
    boxes,
    shown,
    hidden,
    about: aboutOf(sample),
    task: taskOf(sample),
    crops: surfaceCrops(surface),
    ...(sample.markup ? { markup: markupOf(sample.markup) } : {}),
  };
}
