// The synthetic samples (R49; R38 spec): sample files whose strokes code draws from a seed, with no
// hand behind them (CLAUDE.md), each with the markup of what it drew, for tasks of tutor's file of
// open tasks. tutor's CI checks that its eval runner reads them (T32 tutor); they measure nothing
// of AI. A seed gives its sample byte for byte, and its ID (R09). The code knows no key and no
// subject (R05, R25): the numbers it writes, a solution's first error among them, are the seed's,
// and say nothing of whether the solution is right (the 2026-11-08 amendment to R95 spec).

import {
  type AnswerSlotNoteSchema,
  type MarkupSchema,
  PartKind,
  Purpose,
  Writer,
  type WritingPartSchema,
} from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import {
  type ObservationSchema,
  Unreadable,
} from "@altnovatrail/contracts/novatrail/observation/v1/observation_pb.js";
import type { MessageInitShape } from "@bufbuild/protobuf";
import { type Cell, cellsOf } from "../core/boxes.js";
import { NO_MANIFEST } from "../core/manifest.js";
import { pageOf } from "../core/page.js";
import { type Font, fontOf, GLYPHS, Hand, random, spot, TUTOR, widthOf } from "./hand.js";
import { type Sample, type Surface, sampleOf, syntheticId, writerCode } from "./sample.js";
import type { OpenTask, OpenTasks } from "./tasks.js";

/** What a synthetic sample shows, which its file does not say (T32 tutor): one line each. */
export const SCENARIOS = Object.freeze({
  right: "a solution of lines and its final answer, ringed, with no first error",
  wrong: "the same, with a first error the seed chose",
  erased: "a solution whose final answer was erased and written again",
  undone: "a sheet cleared, a stray stroke undone, then a solution",
  crossed: "a solution whose final answer was crossed out and written again below",
  mirrored: "a solution whose final answer has a digit written mirrored",
  illegible: "a solution whose final answer is a scribble",
  "two-answers": "a solution with two final answers, each ringed",
  "no-answer": "a solution with no final answer",
  blank: "a sheet with no stroke",
  "number-line": "a number line with jumps along it, a line of the sum, and the final answer",
  filled: "a page with every box filled",
  gaps: "a page with boxes left empty, and one whose answer was crossed out and written again",
  "mirrored-box":
    "a page with a digit mirrored in one box and an answer erased and rewritten in another",
  "empty-page": "a page with no stroke",
} as const);

export type Scenario = keyof typeof SCENARIOS;

/** A sample of the set: its seed, what it shows, its composition, and the bank its task is from. */
export interface Entry {
  readonly seed: number;
  readonly scenario: Scenario;
  readonly purpose: Purpose;
  readonly writer: Writer;
  readonly bank: string;
}

const BANK = "eval/bank.json";
const FREE = "eval/free-bank.json";
const WORKBOOK = "eval/workbook.json";
const { MEASUREMENT, EVAL_SET } = Purpose;
const { ADULT, ADULT_AS_CHILD, CHILD } = Writer;

/**
 * The synthetic set (R49): every composition on a sheet and on a workbook, every writer, every
 * event of a history and every kind of a markup's part, each scenario once or twice. The seeds
 * start at 101, clear of the examples' (src/eval/sample.test.ts).
 */
export const SET: readonly Entry[] = Object.freeze([
  { seed: 101, scenario: "right", purpose: MEASUREMENT, writer: ADULT, bank: BANK },
  { seed: 102, scenario: "wrong", purpose: EVAL_SET, writer: ADULT_AS_CHILD, bank: BANK },
  { seed: 103, scenario: "erased", purpose: MEASUREMENT, writer: ADULT_AS_CHILD, bank: BANK },
  { seed: 104, scenario: "undone", purpose: MEASUREMENT, writer: ADULT, bank: BANK },
  { seed: 105, scenario: "crossed", purpose: MEASUREMENT, writer: CHILD, bank: BANK },
  { seed: 106, scenario: "mirrored", purpose: MEASUREMENT, writer: ADULT, bank: BANK },
  { seed: 107, scenario: "illegible", purpose: EVAL_SET, writer: ADULT, bank: BANK },
  { seed: 108, scenario: "two-answers", purpose: MEASUREMENT, writer: ADULT, bank: BANK },
  { seed: 109, scenario: "no-answer", purpose: MEASUREMENT, writer: CHILD, bank: BANK },
  { seed: 110, scenario: "blank", purpose: MEASUREMENT, writer: ADULT, bank: BANK },
  { seed: 111, scenario: "number-line", purpose: MEASUREMENT, writer: ADULT, bank: FREE },
  { seed: 112, scenario: "number-line", purpose: EVAL_SET, writer: ADULT_AS_CHILD, bank: FREE },
  { seed: 113, scenario: "filled", purpose: MEASUREMENT, writer: ADULT, bank: WORKBOOK },
  { seed: 114, scenario: "gaps", purpose: MEASUREMENT, writer: CHILD, bank: WORKBOOK },
  { seed: 115, scenario: "mirrored-box", purpose: EVAL_SET, writer: ADULT, bank: WORKBOOK },
  {
    seed: 116,
    scenario: "empty-page",
    purpose: MEASUREMENT,
    writer: ADULT_AS_CHILD,
    bank: WORKBOOK,
  },
]);

/** A synthetic sample, with what it shows. */
export interface Synthetic {
  readonly id: string;
  readonly scenario: Scenario;
  readonly sample: Sample;
}

/** Every sample of the set, in its order. */
export function syntheticSet(tasks: OpenTasks): Synthetic[] {
  return SET.map((entry) => syntheticSample(entry, tasks));
}

/**
 * The sample of an entry: its task, from its bank by the seed; its strokes, which a hand draws as
 * the scenario has it, on the seed's clock and wobble; and the markup of what it drew.
 */
export function syntheticSample(entry: Entry, tasks: OpenTasks): Synthetic {
  const next = random(entry.seed);
  const bank = tasks.get(entry.bank);
  const task = bank?.[Math.floor(next() * bank.length)];
  if (task === undefined) throw new RangeError(`no task in the bank ${entry.bank}`);
  const code = writerCode(Uint8Array.from({ length: 8 }, () => Math.floor(next() * 256)));
  const hand = new Hand({ step: 2, wobble: 0.4, seed: entry.seed });
  hand.wait(1500);
  const { surface, markup } = drawn(entry.scenario, task, hand, next);
  const seed = String(entry.seed);
  const sample = sampleOf({
    id: syntheticId(seed),
    purpose: entry.purpose,
    writer: entry.writer,
    origin: { synthetic: { seed } },
    ...(entry.purpose === EVAL_SET ? {} : { writerCode: code }),
    task: task.reference,
    surface,
    markup,
  });
  return { id: sample.id, scenario: entry.scenario, sample };
}

type Markup = MessageInitShape<typeof MarkupSchema>;
type Part = MessageInitShape<typeof WritingPartSchema>;
type PartFlags = {
  readonly crossedOut?: boolean;
  readonly illegible?: boolean;
  readonly finalAnswer?: boolean;
};
type Read = NonNullable<MessageInitShape<typeof ObservationSchema>["answerSlots"]>[number]["read"];

/** What a scenario draws: the surface the hand wrote on, and its markup. */
function drawn(
  scenario: Scenario,
  task: OpenTask,
  hand: Hand,
  next: () => number,
): { surface: Surface; markup: Markup } {
  const digit = NO_MANIFEST.digit;
  if ("workbook" in task.canvas) {
    if (!WORKBOOK_SCENARIOS.has(scenario)) throw new TypeError(`${scenario} is no page's`);
    const cells = cellsOf(pageOf(task.canvas.workbook));
    const page = new Page(hand, cells, next);
    page.draw(scenario);
    const surface = { workbook: { history: hand.work.history, cells, digit } };
    return { surface, markup: page.markup() };
  }
  if (WORKBOOK_SCENARIOS.has(scenario)) throw new TypeError(`${scenario} is no sheet's`);
  const sheet = new SheetWriter(hand, next);
  sheet.draw(scenario);
  return { surface: { sheet: { history: hand.work.history, digit } }, markup: sheet.markup() };
}

const WORKBOOK_SCENARIOS: ReadonlySet<Scenario> = new Set([
  "filled",
  "gaps",
  "mirrored-box",
  "empty-page",
]);

/** The one answer slot of a task on a sheet: bound anywhere, the first slot of the first item. */
const ANYWHERE = { item: 1, slot: 1 };

/** A whole number from `low` to `high`, by the seed. */
function between(next: () => number, low: number, high: number): number {
  return low + Math.floor(next() * (high - low + 1));
}

/** The digits whose mirror image is another shape: one of them, written mirrored, is ambiguous. */
const ASYMMETRIC = "234579";

/** Whether a number has a digit of another shape mirrored. */
function hasAsymmetric(number: string): boolean {
  return [...number].some((char) => ASYMMETRIC.includes(char));
}

/**
 * A hand writing a solution on a sheet: lines of a sum from the top, 80 units apart, in tutor's
 * writer's digits, each line a part of the markup, and the final answer ringed beside the last.
 */
class SheetWriter {
  readonly #hand: Hand;
  readonly #next: () => number;
  readonly #parts: Part[] = [];
  #truth: Read = { case: "unreadable", value: Unreadable.NO_FINAL_ANSWER };
  #firstError: number | undefined;
  #crossed = false;
  #mirrored = false;
  #row = 0;

  constructor(hand: Hand, next: () => number) {
    this.#hand = hand;
    this.#next = next;
  }

  draw(scenario: Scenario): void {
    if (scenario === "blank") {
      this.#truth = { case: "unreadable", value: Unreadable.BLANK };
      return;
    }
    if (scenario === "number-line") {
      this.#numberLine();
      return;
    }
    const count = between(this.#next, 2, 3);
    const wrong = scenario === "wrong";
    let sum = this.#sum(count, wrong);
    // A mirrored answer needs a digit whose mirror image is another shape.
    while (scenario === "mirrored" && !hasAsymmetric(sum.answer)) sum = this.#sum(count, false);
    const { lines, answer, error, slipped } = sum;
    if (scenario === "undone") {
      // A line written and cleared away before the solution.
      this.#hand.write(slipped, 60, 100, TUTOR);
      this.#hand.wait(1500);
      this.#hand.clear();
      this.#hand.wait(1500);
    }
    for (const line of lines) this.#part(PartKind.TEXT, line, this.#write(line));
    if (wrong) this.#firstError = error;
    if (scenario === "undone") {
      this.#hand.wait(600);
      this.#hand.line(60, this.#y() + 20, 120, this.#y() + 30);
      this.#hand.wait(300);
      this.#hand.undo();
    }
    if (scenario === "no-answer") return;
    if (scenario === "illegible") {
      this.#hand.wait(1500);
      const ids = [this.#hand.word(80, this.#y() + 10, 4)];
      this.#hand.wait(400);
      ids.push(this.#hand.ring(70, this.#y() - 2, 66, 40));
      this.#part(PartKind.TEXT, "неразборчивый ответ", ids, { illegible: true, finalAnswer: true });
      this.#truth = { case: "unreadable", value: Unreadable.ILLEGIBLE };
      return;
    }
    if (scenario === "erased") {
      // Another answer where the final one goes, erased before it is written.
      this.#hand.wait(1500);
      const other = String(Number(answer) + between(this.#next, 1, 9));
      this.#hand.erase(this.#hand.write(other, 80, this.#y(), TUTOR));
    }
    if (scenario === "crossed") {
      // Another answer, struck through, and the final one written again below it: the answer
      // slot's own answer crossed out and written again.
      this.#hand.wait(1500);
      const other = String(Number(answer) + between(this.#next, 1, 9));
      const ids = this.#hand.write(other, 80, this.#y(), TUTOR);
      this.#hand.wait(400);
      const middle = this.#y() + TUTOR.height / 2;
      ids.push(this.#hand.line(74, middle, 86 + widthOf(other, TUTOR), middle));
      this.#part(PartKind.TEXT, other, ids, { crossedOut: true });
      this.#crossed = true;
      this.#row += 1;
    }
    const mirrored = scenario === "mirrored";
    this.#answer(answer, 80, mirrored);
    if (scenario === "two-answers") {
      const other = String(Number(answer) + between(this.#next, 1, 9));
      this.#row -= 1;
      this.#answer(other, 340, false);
      this.#truth = { case: "unreadable", value: Unreadable.SEVERAL_FINAL_ANSWERS };
    } else if (mirrored) {
      this.#truth = { case: "unreadable", value: Unreadable.AMBIGUOUS };
      this.#mirrored = true;
    } else this.#truth = { case: "value", value: answer };
  }

  /** The final answer on a line of its own from `x`, ringed: its part. */
  #answer(answer: string, x: number, mirrored: boolean): void {
    this.#hand.wait(1500);
    const y = this.#y();
    const ids = mirrored
      ? this.#writeMirrored(answer, x, y)
      : this.#hand.write(answer, x, y, TUTOR);
    this.#hand.wait(400);
    ids.push(this.#hand.ring(x - 10, y - 10, widthOf(answer, TUTOR) + 20, TUTOR.height + 20));
    this.#part(PartKind.TEXT, answer, ids, { finalAnswer: true });
    this.#row += 1;
  }

  /** The answer written, its first digit of another shape mirrored left to right. */
  #writeMirrored(answer: string, x: number, y: number): number[] {
    const at = [...answer].findIndex((char) => ASYMMETRIC.includes(char));
    return [...answer].flatMap((char, n) => {
      const left = x + n * TUTOR.advance;
      if (n !== at) return this.#hand.write(char, left, y, TUTOR);
      return mirroredGlyph(this.#hand, char, left, y, TUTOR);
    });
  }

  /** A line of the solution, at the next row; its strokes. */
  #write(line: string): number[] {
    if (this.#row > 0) this.#hand.wait(1500);
    const ids = this.#hand.write(line, 60, this.#y(), TUTOR);
    this.#row += 1;
    return ids;
  }

  /** The top of the next row. */
  #y(): number {
    return 100 + 80 * this.#row;
  }

  #part(kind: PartKind, text: string, strokeIds: readonly number[], flags: PartFlags = {}) {
    this.#parts.push({ kind, text, strokeIds: [...strokeIds], ...flags });
  }

  /**
   * A sum of `count` lines from a number of the seed, each adding, taking or multiplying by one;
   * with `slip`, a slip in the line `error`, from 1, which the lines after it carry. `slipped` is
   * the first line with a slip, whichever: a line a hand writes and takes back.
   */
  #sum(
    count: number,
    slip: boolean,
  ): { lines: string[]; answer: string; error: number; slipped: string } {
    const error = between(this.#next, 1, count);
    const off = between(this.#next, 1, 3);
    let value = between(this.#next, 12, 89);
    const lines: string[] = [];
    let slipped = "";
    for (let n = 1; n <= count; n++) {
      const by = between(this.#next, 2, 19);
      const sign = value > 40 && this.#next() < 0.5 ? "−" : this.#next() < 0.2 ? "×" : "+";
      const right = sign === "−" ? value - by : sign === "×" ? value * by : value + by;
      if (n === 1) slipped = `${value} ${sign} ${by} = ${right + off}`;
      const result = slip && n === error ? right + off : right;
      lines.push(`${value} ${sign} ${by} = ${result}`);
      value = result;
    }
    return { lines, answer: String(value), error, slipped };
  }

  /**
   * A number line from 0 to 20 with jumps along it: the line, its ticks, labels every 5 and the
   * arcs of the jumps, one part a drawing; the sum of the jumps, a line; and the final answer.
   */
  #numberLine(): void {
    const left = 60;
    const step = 30;
    const base = 300;
    const at = (value: number) => left + step * value;
    const ids = [this.#hand.line(left - 10, base, at(20) + 10, base)];
    for (let value = 0; value <= 20; value++) {
      this.#hand.wait(120);
      ids.push(this.#hand.line(at(value), base - 6, at(value), base + 6));
    }
    const small = fontOf(18);
    for (const value of [0, 5, 10, 15, 20]) {
      this.#hand.wait(200);
      ids.push(...this.#hand.write(String(value), at(value) - 6, base + 14, small));
    }
    const start = between(this.#next, 0, 5);
    const jump = between(this.#next, 2, 4);
    const back = between(this.#next, 1, 5);
    const stops = [
      start,
      start + jump,
      start + 2 * jump,
      start + 3 * jump,
      start + 3 * jump - back,
    ];
    for (let n = 1; n < stops.length; n++) {
      const [from, to] = [stops[n - 1] ?? 0, stops[n] ?? 0];
      const middle = (at(from) + at(to)) / 2;
      this.#hand.wait(300);
      ids.push(
        this.#hand.stroke([
          spot(at(from), base - 8),
          spot(middle, base - 40 - 4 * n),
          spot(at(to), base - 8),
        ]),
      );
    }
    const end = stops.at(-1) ?? 0;
    const route = stops.join(" → ");
    this.#part(
      PartKind.DRAWING,
      `числовая прямая от 0 до 20 с отметками через 1, подписаны 0, 5, 10, 15 и 20; прыжки ${route}`,
      ids,
    );
    this.#row = 4;
    const line = `${start} + ${jump} + ${jump} + ${jump} − ${back} = ${end}`;
    this.#part(PartKind.TEXT, line, this.#write(line));
    this.#answer(String(end), 80, false);
    this.#truth = { case: "value", value: String(end) };
    this.#firstError = this.#next() < 0.5 ? between(this.#next, 1, 2) : undefined;
  }

  markup(): Markup {
    const notes: MessageInitShape<typeof AnswerSlotNoteSchema>[] =
      this.#crossed || this.#mirrored
        ? [{ answerSlot: ANYWHERE, mirrored: this.#mirrored, crossedOut: this.#crossed }]
        : [];
    return {
      truth: { answerSlots: [{ answerSlot: ANYWHERE, read: this.#truth }] },
      notes,
      writing: {
        case: "parts",
        value: {
          parts: this.#parts,
          ...(this.#firstError === undefined ? {} : { firstError: this.#firstError }),
        },
      },
    };
  }
}

/** A character written mirrored left to right in its font's box at (x, y): its strokes. */
function mirroredGlyph(hand: Hand, char: string, x: number, y: number, font: Font): number[] {
  const glyph = GLYPHS[char];
  if (glyph === undefined) throw new Error(`no glyph for ${char}`);
  const [left, top] = spot(x, y);
  return glyph.map((spots, k) => {
    if (k > 0) hand.wait(font.within(k));
    return hand.stroke(
      spots.map(([gx, gy]) => [left + (10 - gx) * font.width, top + gy * font.height]),
    );
  });
}

/**
 * A hand filling the boxes of a page in the task's order, each answer in the box's middle, at a
 * size that keeps it inside: the truth of every box, and the notes of those set apart.
 */
class Page {
  readonly #hand: Hand;
  readonly #cells: readonly Cell[];
  readonly #next: () => number;
  readonly #reads = new Map<Cell, Read>();
  readonly #notes = new Map<Cell, MessageInitShape<typeof AnswerSlotNoteSchema>>();

  constructor(hand: Hand, cells: readonly Cell[], next: () => number) {
    this.#hand = hand;
    this.#cells = cells;
    this.#next = next;
  }

  draw(scenario: Scenario): void {
    if (scenario === "empty-page") return;
    const order = this.#cells.map((cell) => ({ cell, at: this.#next() }));
    const [crossed, erased, mirrored] = [...order].sort((a, b) => a.at - b.at).map((o) => o.cell);
    for (const cell of this.#cells) {
      const value = String(between(this.#next, 1, 99));
      if (scenario === "gaps" && cell !== crossed && this.#next() < 0.35) continue;
      if (scenario === "gaps" && cell === crossed) this.#crossedOut(cell, value);
      else if (scenario === "mirrored-box" && cell === mirrored) this.#mirrored(cell);
      else {
        if (scenario === "mirrored-box" && cell === erased) {
          this.#hand.erase(this.#answer(cell, String(between(this.#next, 1, 99))));
        }
        this.#answer(cell, value);
        this.#reads.set(cell, { case: "value", value });
      }
      this.#hand.wait(between(this.#next, 800, 2400));
    }
  }

  /** `text` written in the middle of a box, or in the part of it from `from` to `to` across. */
  #answer(cell: Cell, text: string, from = 0, to = 1): number[] {
    const { box } = cell;
    const room = box.width * (to - from);
    const font = fitting(text, room * 0.8, box.height * 0.6);
    const wide = widthOf(text, font);
    const x = box.left + box.width * from + (room - wide) / 2;
    const y = box.top + (box.height - font.height) / 2;
    return this.#hand.write(text, x, y, font);
  }

  /** An answer written in the left of a box, struck through, and another written in its right. */
  #crossedOut(cell: Cell, value: string): void {
    const first = String(between(this.#next, 1, 99));
    this.#answer(cell, first, 0.05, 0.45);
    const { box } = cell;
    const y = box.top + box.height / 2;
    this.#hand.wait(400);
    this.#hand.line(box.left + box.width * 0.06, y, box.left + box.width * 0.44, y);
    this.#hand.wait(800);
    this.#answer(cell, value, 0.55, 0.95);
    this.#reads.set(cell, { case: "value", value });
    this.#notes.set(cell, { answerSlot: placeOf(cell), mirrored: false, crossedOut: true });
  }

  /** A digit of another shape written mirrored in a box, which reads as ambiguous. */
  #mirrored(cell: Cell): void {
    const char = ASYMMETRIC[between(this.#next, 0, ASYMMETRIC.length - 1)] ?? "2";
    const { box } = cell;
    const font = fitting(char, box.width * 0.8, box.height * 0.6);
    const x = box.left + (box.width - font.width) / 2;
    mirroredGlyph(this.#hand, char, x, box.top + (box.height - font.height) / 2, font);
    this.#reads.set(cell, { case: "unreadable", value: Unreadable.AMBIGUOUS });
    this.#notes.set(cell, { answerSlot: placeOf(cell), mirrored: true, crossedOut: false });
  }

  markup(): Markup {
    return {
      truth: {
        answerSlots: this.#cells.map((cell) => ({
          answerSlot: placeOf(cell),
          read: this.#reads.get(cell) ?? { case: "unreadable", value: Unreadable.BLANK },
        })),
      },
      notes: this.#cells.flatMap((cell) => this.#notes.get(cell) ?? []),
    };
  }
}

/** The place of a box, as the markup names it. */
function placeOf({ item, slot }: Cell): { item: number; slot: number } {
  return { item, slot };
}

/** The largest font, in whole units, whose `text` fits `wide` across and `high` down. */
function fitting(text: string, wide: number, high: number): Font {
  const one = fontOf(36);
  const across = widthOf(text, one) / one.height;
  return fontOf(Math.max(8, Math.floor(Math.min(high, wide / across))));
}
