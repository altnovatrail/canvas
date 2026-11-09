// The markup of a sample as the samples page makes it on the screen (T81 in RUN.md; R56 in
// docs/decisions.md): what the writer says their writing is, by the eval protocol (R95 spec;
// spec/contracts/README.md, section 11, "The markup"). No DOM: the page's screen holds a form of
// it, and this turns the form into the sample's `markup` and names what it still lacks, by the
// rules spec's sample-check holds a file to, so that the page saves no sample the check refuses.
//
// On a sheet the parts of the solution are the device's groups of strokes (R06), each part one or
// more neighbouring groups that the writer joins: every stroke the sheet shows is in one part. The
// truth of the task's one answer slot, bound `anywhere`, follows from the parts that hold the final
// answer. An essay, whose one answer slot is the whole sheet, has no parts: its truth is its text as
// written, or blank, or illegible as a whole, and the marks of its criteria the organizer adds after
// the writing, so the page writes none (T21). On a workbook the truth is every box of the page, by
// its place: an empty one is blank.

import { PartKind } from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import { Unreadable } from "@altnovatrail/contracts/novatrail/observation/v1/observation_pb.js";
import type { SampleInput } from "../src/eval/sample.js";
import { LACKS } from "./texts.js";

/** The markup `sampleOf` takes. */
export type MarkupInput = SampleInput["markup"];

/** A group of the sheet's strokes, by its label, as the element gives it. */
export interface Group {
  readonly label: string;
  readonly ids: readonly number[];
}

/** A part of a solution: the labels of its groups, its kind, its text and its flags. */
export interface Part {
  readonly groups: readonly string[];
  readonly kind: "text" | "drawing";
  readonly text: string;
  readonly crossedOut: boolean;
  readonly illegible: boolean;
  readonly finalAnswer: boolean;
}

/** What the writer marks on a sheet. */
export interface SheetForm {
  readonly parts: readonly Part[];
  /** The place of the part where the solution went wrong, from 1; none when it did not. */
  readonly firstError?: number;
  /** The final answer as it is written, when one part holds it. */
  readonly answer: string;
  /** A digit of the final answer written mirrored: then the answer reads more than one way. */
  readonly mirrored: boolean;
  /** Something crossed out and written again in the answer. */
  readonly rewritten: boolean;
}

/** What the writer marks on an essay: its text as written, or that it cannot be read as a whole. */
export interface EssayForm {
  readonly illegible: boolean;
  readonly text: string;
}

/** What the writer marks on a box of a workbook. */
export interface BoxForm {
  readonly item: number;
  readonly slot: number;
  /** Whether the box holds a stroke: an empty one is blank, whatever else is said. */
  readonly filled: boolean;
  readonly read: "value" | "illegible" | "ambiguous";
  readonly value: string;
  readonly mirrored: boolean;
  readonly rewritten: boolean;
}

/** A markup made of a form, or what the form still lacks, in the page's words. */
export type Made = { readonly markup: MarkupInput } | { readonly lacks: readonly string[] };

/** The task's one answer slot on a sheet, bound `anywhere` or, on an essay, `sheet`. */
const ONE_SLOT = { item: 1, slot: 1 };

/** Nothing but white space: no value and no text. */
function blank(text: string): boolean {
  return /^\s*$/u.test(text);
}

/** The parts a sheet starts with: one for each group, in the order of the labels. */
export function partsOf(groups: readonly Group[]): Part[] {
  return groups.map(({ label }) => ({
    groups: [label],
    kind: "text",
    text: "",
    crossedOut: false,
    illegible: false,
    finalAnswer: false,
  }));
}

/** The part at a place joined with the next: its groups, and its text and flags kept. */
export function joined(parts: readonly Part[], at: number): Part[] {
  const [part, next] = [parts[at], parts[at + 1]];
  if (!part || !next) throw new RangeError(`no part after the part ${at + 1}`);
  const texts = [part.text, next.text].filter((text) => !blank(text));
  return [
    ...parts.slice(0, at),
    {
      ...part,
      groups: [...part.groups, ...next.groups],
      text: texts.join(" "),
      crossedOut: part.crossedOut && next.crossedOut,
      illegible: part.illegible || next.illegible,
      finalAnswer: part.finalAnswer || next.finalAnswer,
    },
    ...parts.slice(at + 2),
  ];
}

/** The part at a place parted again into its groups: the first keeps its kind, text and flags,
 * and the others start plain — a final answer copied to each would make several. */
export function parted(parts: readonly Part[], at: number): Part[] {
  const part = parts[at];
  if (!part) throw new RangeError(`no part ${at + 1}`);
  const [first, ...rest] = part.groups;
  const plain = partsOf(rest.map((label) => ({ label, ids: [] })));
  return [
    ...parts.slice(0, at),
    { ...part, groups: [first ?? ""] },
    ...plain,
    ...parts.slice(at + 1),
  ];
}

/** The parts with the part at a place moved one up or one down: the order the solution reads. */
export function moved(parts: readonly Part[], at: number, by: -1 | 1): Part[] {
  const to = at + by;
  const [part, other] = [parts[at], parts[to]];
  if (!part || !other) throw new RangeError(`the part ${at + 1} cannot move there`);
  const copy = [...parts];
  copy[at] = other;
  copy[to] = part;
  return copy;
}

/** The parts with the part at a place given new fields. */
export function changed(parts: readonly Part[], at: number, change: Partial<Part>): Part[] {
  const part = parts[at];
  if (!part) throw new RangeError(`no part ${at + 1}`);
  return parts.map((one, i) => (i === at ? { ...one, ...change, groups: one.groups } : one));
}

/** The read of the sheet's answer slot: what its parts say, and the answer as written. */
function sheetRead(
  form: SheetForm,
  shows: boolean,
): NonNullable<MarkupInput["truth"]>["answerSlots"] {
  const finals = form.parts.filter((part) => part.finalAnswer && !part.crossedOut);
  const read = (() => {
    if (!shows) return { case: "unreadable", value: Unreadable.BLANK } as const;
    if (finals.length === 0)
      return { case: "unreadable", value: Unreadable.NO_FINAL_ANSWER } as const;
    if (finals.length > 1)
      return { case: "unreadable", value: Unreadable.SEVERAL_FINAL_ANSWERS } as const;
    if (finals[0]?.illegible) return { case: "unreadable", value: Unreadable.ILLEGIBLE } as const;
    if (form.mirrored) return { case: "unreadable", value: Unreadable.AMBIGUOUS } as const;
    return { case: "value", value: form.answer.trim() } as const;
  })();
  return [{ answerSlot: ONE_SLOT, read }];
}

/** What a sheet's form lacks, or its markup: the parts with the strokes of their groups, the
 * truth they give, the note of the answer, and the first error. */
export function sheetMarkup(groups: readonly Group[], form: SheetForm): Made {
  const ids = new Map(groups.map(({ label, ids }) => [label, ids]));
  const shows = groups.length > 0;
  const lacks: string[] = [];
  const finals = form.parts.filter((part) => part.finalAnswer && !part.crossedOut);
  const labels = form.parts.flatMap((part) => part.groups);
  if (
    labels.length !== groups.length ||
    new Set(labels).size !== groups.length ||
    labels.some((label) => !ids.has(label))
  ) {
    lacks.push(LACKS.groups);
  }
  form.parts.forEach((part, i) => {
    if (blank(part.text)) lacks.push(LACKS.text(i + 1));
    if (part.finalAnswer && part.crossedOut) lacks.push(LACKS.crossedFinal(i + 1));
  });
  if (form.firstError !== undefined) {
    const part = form.parts[form.firstError - 1];
    if (!part) lacks.push(LACKS.firstErrorPlace);
    else if (part.crossedOut) lacks.push(LACKS.crossedError(form.firstError));
  }
  const one = finals.length === 1 && !finals[0]?.illegible;
  if (one && !form.mirrored && blank(form.answer)) lacks.push(LACKS.answer);
  if (form.mirrored && !one) lacks.push(LACKS.mirroredOne);
  if (form.rewritten && !shows) lacks.push(LACKS.rewrittenBlank);
  if (lacks.length > 0) return { lacks };
  const notes =
    form.mirrored || form.rewritten
      ? [{ answerSlot: ONE_SLOT, mirrored: form.mirrored, crossedOut: form.rewritten }]
      : [];
  return {
    markup: {
      truth: { answerSlots: sheetRead(form, shows) },
      notes,
      writing: {
        case: "parts",
        value: {
          parts: form.parts.map((part) => ({
            kind: part.kind === "drawing" ? PartKind.DRAWING : PartKind.TEXT,
            text: part.text.trim(),
            strokeIds: part.groups.flatMap((label) => ids.get(label) ?? []).sort((a, b) => a - b),
            crossedOut: part.crossedOut,
            illegible: part.illegible,
            finalAnswer: part.finalAnswer,
          })),
          ...(form.firstError === undefined ? {} : { firstError: form.firstError }),
        },
      },
    },
  };
}

/** What an essay's form lacks, or its markup, of a sheet that shows strokes or none: the truth of
 * its one answer slot and no mark of a criterion (spec's contracts/README.md, «The markup»). */
export function essayMarkup(shows: boolean, form: EssayForm): Made {
  if (!shows && form.illegible) return { lacks: [LACKS.illegibleBlank] };
  // A text typed where the truth holds none would be lost on saving: the writer says which holds.
  if (!shows && !blank(form.text)) return { lacks: [LACKS.textBlank] };
  if (form.illegible && !blank(form.text)) return { lacks: [LACKS.textIllegible] };
  if (shows && !form.illegible && blank(form.text)) return { lacks: [LACKS.essayText] };
  const read = (() => {
    if (!shows) return { case: "unreadable", value: Unreadable.BLANK } as const;
    if (form.illegible) return { case: "unreadable", value: Unreadable.ILLEGIBLE } as const;
    return { case: "value", value: form.text.trim() } as const;
  })();
  return {
    markup: {
      truth: { answerSlots: [{ answerSlot: ONE_SLOT, read }] },
      notes: [],
      writing: { case: "marks", value: { marks: [] } },
    },
  };
}

/** What a workbook's form lacks, or its markup: every box of the page in the task's order, an
 * empty one blank, and the notes of those set apart. */
export function workbookMarkup(boxes: readonly BoxForm[]): Made {
  const lacks: string[] = [];
  for (const box of boxes) {
    const place = `${box.item}.${box.slot}`;
    if (!box.filled && (box.mirrored || box.rewritten)) lacks.push(LACKS.emptyNote(place));
    if (box.filled && box.read === "value" && !box.mirrored && blank(box.value)) {
      lacks.push(LACKS.boxValue(place));
    }
  }
  if (lacks.length > 0) return { lacks };
  const readOf = (box: BoxForm) => {
    if (!box.filled) return { case: "unreadable", value: Unreadable.BLANK } as const;
    if (box.mirrored || box.read === "ambiguous") {
      return { case: "unreadable", value: Unreadable.AMBIGUOUS } as const;
    }
    if (box.read === "illegible")
      return { case: "unreadable", value: Unreadable.ILLEGIBLE } as const;
    return { case: "value", value: box.value.trim() } as const;
  };
  return {
    markup: {
      truth: {
        answerSlots: boxes.map((box) => ({
          answerSlot: { item: box.item, slot: box.slot },
          read: readOf(box),
        })),
      },
      notes: boxes
        .filter((box) => box.filled && (box.mirrored || box.rewritten))
        .map((box) => ({
          answerSlot: { item: box.item, slot: box.slot },
          mirrored: box.mirrored,
          crossedOut: box.rewritten,
        })),
    },
  };
}
