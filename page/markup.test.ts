// The markup the samples page makes (T81 in RUN.md; R56 in docs/decisions.md): what a form gives
// and what it still lacks, by the rules spec's sample-check holds a file to, and two example
// samples written by it, a sheet's and a workbook's, which ci-licenses checks by sample-check as it
// checks those of src/eval/ (R48). Their strokes are the code's: the synthetic sheets and pages of
// the tests of the groups and the boxes (CLAUDE.md).

import { PartKind } from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import { Unreadable } from "@altnovatrail/contracts/novatrail/observation/v1/observation_pb.js";
import { describe, expect, test } from "vitest";
import { groupsOf } from "../src/core/groups.js";
import { replay } from "../src/core/history.js";
import { staircase } from "../src/core/sheets.fixture.js";
import { numbers } from "../src/core/workbooks.fixture.js";
import { Purpose, readSample, sampleOf, sampleText, Writer } from "../src/eval/sample.js";
import {
  type BoxForm,
  changed,
  joined,
  type Made,
  moved,
  type Part,
  parted,
  partsOf,
  type SheetForm,
  sheetMarkup,
  workbookMarkup,
} from "./markup.js";
import { LACKS } from "./texts.js";

const GROUPS = [
  { label: "A", ids: [1, 2] },
  { label: "B", ids: [3] },
  { label: "C", ids: [4, 5] },
];

/** A form of a sheet: its parts, the answer, and no note. */
function form(parts: readonly Part[], answer = "2", rest: Partial<SheetForm> = {}): SheetForm {
  return { parts, answer, mirrored: false, rewritten: false, ...rest };
}

/** The parts of the three groups, each with a text, the last the final answer. */
function written(): Part[] {
  let parts = partsOf(GROUPS);
  parts = changed(parts, 0, { text: "3x + 1 = 7" });
  parts = changed(parts, 1, { text: "3x = 6" });
  return changed(parts, 2, { text: "x = 2", finalAnswer: true });
}

function markupOf(made: Made) {
  if ("lacks" in made) throw new Error(`lacks ${made.lacks.join("; ")}`);
  return made.markup;
}

describe("a sheet", () => {
  test("starts with a part for each group, and its parts join, part again and move", () => {
    const parts = partsOf(GROUPS);
    expect(parts.map(({ groups }) => groups)).toEqual([["A"], ["B"], ["C"]]);
    const one = joined(changed(parts, 0, { text: "a" }), 0);
    expect(one.map(({ groups }) => groups)).toEqual([["A", "B"], ["C"]]);
    expect(parted(one, 0).map(({ groups, text }) => [groups, text])).toEqual([
      [["A"], "a"],
      [["B"], ""],
      [["C"], ""],
    ]);
    // Parted again, only the first keeps its flags: a final answer copied would make several.
    const final = changed(one, 0, { finalAnswer: true, crossedOut: true });
    expect(
      parted(final, 0).map(({ finalAnswer, crossedOut }) => [finalAnswer, crossedOut]),
    ).toEqual([
      [true, true],
      [false, false],
      [false, false],
    ]);
    expect(moved(one, 1, -1).map(({ groups }) => groups)).toEqual([["C"], ["A", "B"]]);
    expect(() => joined(one, 1)).toThrow(RangeError);
    expect(() => moved(one, 0, -1)).toThrow(RangeError);
  });

  test("gives the parts their strokes, and the truth the one final answer as written", () => {
    const markup = markupOf(
      sheetMarkup(GROUPS, form(joined(written(), 0), " 2 ", { firstError: 1 })),
    );
    expect(markup.truth?.answerSlots).toEqual([
      { answerSlot: { item: 1, slot: 1 }, read: { case: "value", value: "2" } },
    ]);
    expect(markup.notes).toEqual([]);
    const writing = markup.writing;
    if (writing?.case !== "parts") throw new Error("no parts");
    expect(writing.value.parts?.map((part) => [part.kind, part.text, part.strokeIds])).toEqual([
      [PartKind.TEXT, "3x + 1 = 7 3x = 6", [1, 2, 3]],
      [PartKind.TEXT, "x = 2", [4, 5]],
    ]);
    expect(writing.value.firstError).toBe(1);
  });

  test("reads no final answer, several, an illegible one and a mirrored one by its reason", () => {
    const reason = (made: Made) => {
      const read = markupOf(made).truth?.answerSlots?.[0]?.read;
      return read?.case === "unreadable" ? read.value : read?.value;
    };
    const none = changed(written(), 2, { finalAnswer: false });
    expect(reason(sheetMarkup(GROUPS, form(none, "")))).toBe(Unreadable.NO_FINAL_ANSWER);
    const two = changed(written(), 1, { finalAnswer: true });
    expect(reason(sheetMarkup(GROUPS, form(two, "")))).toBe(Unreadable.SEVERAL_FINAL_ANSWERS);
    const illegible = changed(written(), 2, { illegible: true });
    expect(reason(sheetMarkup(GROUPS, form(illegible, "")))).toBe(Unreadable.ILLEGIBLE);
    const mirrored = sheetMarkup(GROUPS, form(written(), "", { mirrored: true, rewritten: true }));
    expect(reason(mirrored)).toBe(Unreadable.AMBIGUOUS);
    expect(markupOf(mirrored).notes).toEqual([
      { answerSlot: { item: 1, slot: 1 }, mirrored: true, crossedOut: true },
    ]);
    // A part crossed out holds no final answer: one crossed out and one not are one answer.
    const crossed = changed(changed(written(), 1, { crossedOut: true }), 1, { finalAnswer: false });
    expect(reason(sheetMarkup(GROUPS, form(crossed)))).toBe("2");
    expect(reason(sheetMarkup([], form([], "")))).toBe(Unreadable.BLANK);
  });

  test("names what it lacks, as sample-check would refuse it", () => {
    const lacks = (made: Made) => ("lacks" in made ? made.lacks : []);
    expect(lacks(sheetMarkup(GROUPS, form(partsOf(GROUPS), "")))).toEqual([
      LACKS.text(1),
      LACKS.text(2),
      LACKS.text(3),
    ]);
    expect(lacks(sheetMarkup(GROUPS, form(written(), " ")))).toEqual([LACKS.answer]);
    const crossedFinal = changed(written(), 2, { crossedOut: true });
    expect(lacks(sheetMarkup(GROUPS, form(crossedFinal)))).toContain(LACKS.crossedFinal(3));
    const crossedError = changed(written(), 0, { crossedOut: true });
    expect(lacks(sheetMarkup(GROUPS, form(crossedError, "2", { firstError: 1 })))).toEqual([
      LACKS.crossedError(1),
    ]);
    expect(lacks(sheetMarkup(GROUPS, form(written(), "2", { firstError: 4 })))).toEqual([
      LACKS.firstErrorPlace,
    ]);
    const two = changed(written(), 1, { finalAnswer: true });
    expect(lacks(sheetMarkup(GROUPS, form(two, "", { mirrored: true })))).toEqual([
      LACKS.mirroredOne,
    ]);
    expect(lacks(sheetMarkup(GROUPS, form(written().slice(1))))).toEqual([LACKS.groups]);
    expect(lacks(sheetMarkup([], form([], "", { rewritten: true })))).toEqual([
      LACKS.rewrittenBlank,
    ]);
  });
});

describe("a workbook", () => {
  const box = (item: number, rest: Partial<BoxForm> = {}): BoxForm => ({
    item,
    slot: 1,
    filled: true,
    read: "value",
    value: String(item * 7),
    mirrored: false,
    rewritten: false,
    ...rest,
  });

  test("names every box in order, an empty one blank, and notes those set apart", () => {
    const markup = markupOf(
      workbookMarkup([
        box(1),
        box(2, { filled: false, value: "" }),
        box(3, { read: "illegible" }),
        box(4, { mirrored: true }),
        box(5, { read: "ambiguous", rewritten: true }),
      ]),
    );
    expect(markup.truth?.answerSlots?.map((slot) => slot.read)).toEqual([
      { case: "value", value: "7" },
      { case: "unreadable", value: Unreadable.BLANK },
      { case: "unreadable", value: Unreadable.ILLEGIBLE },
      { case: "unreadable", value: Unreadable.AMBIGUOUS },
      { case: "unreadable", value: Unreadable.AMBIGUOUS },
    ]);
    expect(
      markup.notes?.map((note) => [note.answerSlot?.item, note.mirrored, note.crossedOut]),
    ).toEqual([
      [4, true, false],
      [5, false, true],
    ]);
    expect(markup.writing).toBeUndefined();
  });

  test("names what it lacks: a value as written, and no note on an empty box", () => {
    const made = workbookMarkup([
      box(1, { value: " " }),
      box(2, { filled: false, rewritten: true }),
    ]);
    expect("lacks" in made && made.lacks).toEqual([LACKS.boxValue("1.1"), LACKS.emptyNote("2.1")]);
  });
});

describe("the examples of the page", () => {
  // A sample as the page saves it: the author's own measurement, a person's, of the draft of
  // texts, with a fixed ID and code, so that the file is the same at each run.
  const page = { purpose: Purpose.MEASUREMENT, writer: Writer.ADULT, writerCode: "PAGE2345" };
  const origin = { person: { textSetVersion: "draft-0", canvasVersion: "0.0.0" } };
  const task = (bank: string, id: string) => ({
    source: {
      case: "tutor" as const,
      value: {
        tag: "v0.1.1",
        fileDigest: "sha256:8e6857777c3ebb6e628096c3089a67dcb60718356a166e52120c9c6c538087f1",
        bank,
        bankDigest:
          bank === "eval/bank.json"
            ? "sha256:c6f25b486faa79aa344eeb1dee6bd2aae8c069fd670a0d20c3fe929aeb9fdf13"
            : "sha256:fbc262aca2f1bd7e8e2293bca0a42bfee6b79f484a3b512c2131150e8730d26f",
      },
    },
    task: id,
    openViewDigest:
      id === "equation-1"
        ? "sha256:96d317ad771f0a9478406ae88992f4495c8e1d7665d088f6d54a4b86b3ede0b8"
        : "sha256:62c09c1e098e33c8eb8f2598ec187b19b72facebb61c2a6064b4d2a89e1e43da",
  });

  test("examples/page-sheet-measurement.json is the staircase marked up as the page marks it", async () => {
    const sheet = staircase();
    const groups = groupsOf(replay(sheet.work.history));
    // The ladder and «30» beside it one part, a drawing; the expression and the ringed 6 one each.
    expect(groups.map(({ label }) => label)).toEqual(["A", "B", "C", "D"]);
    let parts = joined(partsOf(groups), 0);
    parts = changed(parts, 0, {
      kind: "drawing",
      text: "лесенка: две стойки и семь ступенек, рядом 30",
    });
    parts = changed(parts, 1, { text: "180 : 30 =" });
    parts = changed(parts, 2, { text: "6, обведено", finalAnswer: true });
    const markup = markupOf(sheetMarkup(groups, form(parts, "6")));
    const sample = sampleOf({
      ...page,
      id: "page-sheet",
      origin,
      task: task("eval/bank.json", "equation-1"),
      surface: { sheet: { history: sheet.work.history, digit: 24 } },
      markup,
    });
    const text = sampleText(sample);
    expect(readSample(text).markup?.writing.case).toBe("parts");
    await expect(text).toMatchFileSnapshot("../examples/page-sheet-measurement.json");
  });

  test("examples/page-workbook-measurement.json is the page of numbers marked up box by box", async () => {
    // Every box of the page holds its answer, as the hand wrote it.
    const book = numbers();
    const answers = ["14", "21", "28", "35", "42", "49", "56", "63", "70", "7"];
    const boxes = book.cells.map(
      (cell): BoxForm => ({
        item: cell.item,
        slot: cell.slot,
        filled: true,
        read: "value",
        value: answers[cell.item - 1] ?? "",
        mirrored: false,
        rewritten: false,
      }),
    );
    const sample = sampleOf({
      ...page,
      id: "page-workbook",
      origin,
      task: task("eval/workbook.json", "workbook-01"),
      surface: { workbook: { history: book.work.history, cells: book.cells, digit: 24 } },
      markup: markupOf(workbookMarkup(boxes)),
    });
    await expect(sampleText(sample)).toMatchFileSnapshot(
      "../examples/page-workbook-measurement.json",
    );
  });
});
