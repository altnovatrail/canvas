import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { PartKind, SampleSchema } from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import { Unreadable } from "@altnovatrail/contracts/novatrail/observation/v1/observation_pb.js";
import { equals } from "@bufbuild/protobuf";
import { beforeAll, describe, expect, test } from "vitest";
import { Purpose, readSample, type Sample, sampleText, Writer } from "./sample.js";
import {
  type Entry,
  moduleSample,
  SCENARIOS,
  SET,
  type Synthetic,
  syntheticSample,
  syntheticSet,
} from "./synthetic.js";
import { moduleTasksOf, type OpenTask, type OpenTasks, openTasksOf, TUTOR_FILE } from "./tasks.js";

// Every stroke of these samples the code draws from a seed: no hand wrote any (CLAUDE.md). Whether
// a file keeps the protocol's rules is spec's sample-check's to say, which ci-licenses runs on the
// whole set (R93 spec): these tests hold the generator to what it says it draws.

const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");
const file = readFileSync(new URL(`../../tasks/${TUTOR_FILE.name}`, import.meta.url), "utf8");
const tasks: OpenTasks = openTasksOf(JSON.parse(file), TUTOR_FILE.tag, TUTOR_FILE.sha256, sha256);

let set: Synthetic[];
beforeAll(() => {
  set = syntheticSet(tasks);
});

/** The sample of a scenario, the first of the set's. */
const of = (scenario: string): Sample => {
  const found = set.find((each) => each.scenario === scenario);
  if (found === undefined) throw new Error(`no sample shows ${scenario}`);
  return found.sample;
};

/** What the history of a sample holds: the cases of its events. */
const events = (sample: Sample) =>
  sample.ink.case === "history" ? sample.ink.value.events.map((event) => event.event.case) : [];

/** The sheet's one answer slot's truth: its value, or why there is none. */
const truth = (sample: Sample) => sample.markup?.truth?.answerSlots[0]?.read.value;

/** The parts of a sheet's markup. */
const parts = (sample: Sample) =>
  sample.markup?.writing.case === "parts" ? sample.markup.writing.value : undefined;

test("a seed gives its sample byte for byte, and its ID", () => {
  const again = syntheticSet(tasks);
  expect(again.map(({ sample }) => sampleText(sample))).toEqual(
    set.map(({ sample }) => sampleText(sample)),
  );
  expect(set.map(({ id }) => id)).toEqual(SET.map(({ seed }) => `synthetic-${seed}`));
  expect(new Set(SET.map(({ seed }) => seed)).size).toBe(SET.length);
  for (const { sample } of set) {
    expect(sample.origin).toEqual({
      case: "synthetic",
      value: expect.objectContaining({ seed: sample.id.slice(10) }),
    });
    expect(sample.canvasVersion).toBe("0.0.0");
    expect(sample.textSetVersion).toBe("none");
    expect(equals(SampleSchema, readSample(sampleText(sample)), sample)).toBe(true);
  }
}, 30_000);

test("the set holds every composition on a sheet and on a workbook, and every writer", () => {
  const composition = ({ sample }: Synthetic) =>
    `${sample.surface.case} ${Purpose[sample.purpose]} ${sample.writer === Writer.CHILD ? "child" : "adult"} ${sample.ink.case}`;
  const shown = new Set(set.map(composition));
  for (const surface of ["sheet", "workbook"]) {
    expect(shown).toContain(`${surface} EVAL_SET adult geometry`);
    expect(shown).toContain(`${surface} MEASUREMENT adult history`);
    expect(shown).toContain(`${surface} MEASUREMENT child geometry`);
  }
  expect(new Set(set.map(({ sample }) => sample.writer))).toEqual(
    new Set([Writer.ADULT, Writer.ADULT_AS_CHILD, Writer.CHILD]),
  );
  expect(new Set(set.flatMap(({ sample }) => events(sample)))).toEqual(
    new Set(["write", "erase", "clear", "undo"]),
  );
  expect(new Set(set.map(({ scenario }) => scenario))).toEqual(new Set(Object.keys(SCENARIOS)));
});

test("each sample answers a task of the file of open tasks, by its reference", () => {
  const references = [...tasks.values()].flat().map(({ reference }) => reference);
  for (const [n, { sample }] of set.entries()) {
    const bank = SET[n]?.bank;
    const found = references.find((reference) => reference.task === sample.task?.task);
    expect(sample.task?.source.value).toMatchObject({ tag: TUTOR_FILE.tag, bank });
    expect(sample.task?.openViewDigest).toBe(found?.openViewDigest);
  }
});

describe("a sheet's markup says what its scenario drew", () => {
  test("a right solution has no first error, a wrong one has it where the seed put it", () => {
    expect(parts(of("right"))?.firstError).toBeUndefined();
    const wrong = parts(of("wrong"));
    expect(wrong?.firstError).toBeGreaterThanOrEqual(1);
    expect(wrong?.firstError).toBeLessThan(wrong?.parts.length ?? 0);
    // Its final answer is a value, the last part's text.
    const last = wrong?.parts.at(-1);
    expect(last?.finalAnswer).toBe(true);
    expect(truth(of("wrong"))).toBe(last?.text);
  });

  test("an erased answer, an undone stroke and a cleared sheet leave the solution alone", () => {
    expect(events(of("erased"))).toContain("erase");
    expect(events(of("undone"))).toEqual(expect.arrayContaining(["clear", "undo"]));
    for (const scenario of ["erased", "undone"]) {
      expect(parts(of(scenario))?.parts.filter((part) => part.finalAnswer)).toHaveLength(1);
    }
  });

  test("an answer crossed out is a part crossed out, and the answer slot's note says so", () => {
    const sample = of("crossed");
    const [crossed, again] = parts(sample)?.parts.slice(-2) ?? [];
    expect(crossed).toMatchObject({ crossedOut: true, finalAnswer: false });
    // The final answer, written again below the one crossed out.
    expect(again).toMatchObject({ crossedOut: false, finalAnswer: true });
    expect(crossed?.text).not.toBe(again?.text);
    expect(truth(sample)).toBe(again?.text);
    expect(sample.markup?.notes).toMatchObject([{ crossedOut: true, mirrored: false }]);
  });

  test("a mirrored digit, a scribble, two answers and none have the reason of their truth", () => {
    expect(truth(of("mirrored"))).toBe(Unreadable.AMBIGUOUS);
    expect(of("mirrored").markup?.notes).toMatchObject([{ mirrored: true }]);
    expect(truth(of("illegible"))).toBe(Unreadable.ILLEGIBLE);
    expect(parts(of("illegible"))?.parts.at(-1)).toMatchObject({
      illegible: true,
      finalAnswer: true,
    });
    expect(truth(of("two-answers"))).toBe(Unreadable.SEVERAL_FINAL_ANSWERS);
    expect(parts(of("two-answers"))?.parts.filter((part) => part.finalAnswer)).toHaveLength(2);
    expect(truth(of("no-answer"))).toBe(Unreadable.NO_FINAL_ANSWER);
    expect(parts(of("no-answer"))?.parts.some((part) => part.finalAnswer)).toBe(false);
  });

  test("a blank sheet has no stroke, no part and a blank truth", () => {
    const sample = of("blank");
    expect(events(sample)).toEqual([]);
    expect(parts(sample)?.parts).toEqual([]);
    expect(truth(sample)).toBe(Unreadable.BLANK);
    expect(sample.surface.case === "sheet" && sample.surface.value.crops).toBeUndefined();
  });

  test("a number line is a drawing, then the line of its sum, then the answer", () => {
    for (const { sample, scenario } of set) {
      if (scenario !== "number-line") continue;
      const [drawing, sum, answer] = parts(sample)?.parts ?? [];
      expect(drawing?.kind).toBe(PartKind.DRAWING);
      expect(drawing?.text).toMatch(/^числовая прямая/);
      expect(sum?.text.split(" = ")[1]).toBe(answer?.text);
      expect(truth(sample)).toBe(answer?.text);
    }
  });
});

describe("a workbook's truth names every box", () => {
  /** The truth of each box, in the task's order. */
  const reads = (sample: Sample) => sample.markup?.truth?.answerSlots.map(({ read }) => read.value);
  const boxes = (sample: Sample) =>
    sample.surface.case === "workbook" ? sample.surface.value : undefined;

  test("filled: a value in every box, and a filled box each", () => {
    const sample = of("filled");
    expect(reads(sample)?.every((read) => typeof read === "string")).toBe(true);
    expect(boxes(sample)?.filledBoxes).toHaveLength(boxes(sample)?.boxes.length ?? -1);
  });

  test("gaps: an empty box is blank and not filled, and the crossed out one is noted", () => {
    const sample = of("gaps");
    const blank = reads(sample)?.filter((read) => read === Unreadable.BLANK).length ?? 0;
    expect(blank).toBeGreaterThan(0);
    expect(boxes(sample)?.filledBoxes.length).toBe((boxes(sample)?.boxes.length ?? 0) - blank);
    expect(sample.markup?.notes).toMatchObject([{ crossedOut: true }]);
  });

  test("a mirrored box is ambiguous, and an erased answer leaves its box the one written after", () => {
    const sample = of("mirrored-box");
    const [note] = sample.markup?.notes ?? [];
    expect(note?.mirrored).toBe(true);
    const at = sample.markup?.truth?.answerSlots.find(
      ({ answerSlot }) =>
        answerSlot?.item === note?.answerSlot?.item && answerSlot?.slot === note?.answerSlot?.slot,
    );
    expect(at?.read.value).toBe(Unreadable.AMBIGUOUS);
    // An eval set's sample keeps the final geometry: the erased answer is not in it.
    expect(sample.ink.case).toBe("geometry");
  });

  test("an empty page has no stroke and every box blank", () => {
    const sample = of("empty-page");
    expect(reads(sample)?.every((read) => read === Unreadable.BLANK)).toBe(true);
    expect(boxes(sample)?.filledBoxes).toEqual([]);
  });
});

test("a scenario of the other surface, or a bank with no task, is refused", () => {
  const entry = (change: Partial<Entry>): Entry => ({
    seed: 1,
    scenario: "right",
    purpose: Purpose.MEASUREMENT,
    writer: Writer.ADULT,
    bank: "eval/bank.json",
    ...change,
  });
  expect(() => syntheticSample(entry({ scenario: "filled" }), tasks)).toThrow(TypeError);
  expect(() => syntheticSample(entry({ bank: "eval/workbook.json" }), tasks)).toThrow(TypeError);
  expect(() => syntheticSample(entry({ bank: "eval/none.json" }), tasks)).toThrow(RangeError);
});

test("a module's sample is one of its eval set by an adult, of the task given, its scenario the seed's (T86)", () => {
  const folder = new URL(
    "../../tasks/modules-v0.2.0/novatrail-grade-3-math-0.2.0/",
    import.meta.url,
  );
  const module = moduleTasksOf(
    readFileSync(new URL("inventory.json", folder), "utf8"),
    readFileSync(new URL("server.json", folder), "utf8"),
    "v0.2.0",
    sha256,
  );
  const page = module.tasks.get("times-tables-d1");
  const [sheet] = tasks.get("eval/bank.json") ?? [];
  if (!page || !("reference" in page) || !sheet) throw new Error("no task to draw");
  // A sheet of the module: tutor's task, named as a module's.
  const named: OpenTask = { canvas: sheet.canvas, reference: page.reference };
  const seeds = Array.from({ length: 12 }, (_, i) => 301 + i);
  const drawn = [
    ...seeds.map((seed) => moduleSample(page, seed)),
    ...seeds.map((seed) => moduleSample(named, seed)),
  ];
  for (const { sample } of drawn) {
    expect(sample.purpose).toBe(Purpose.EVAL_SET);
    expect([Writer.ADULT, Writer.ADULT_AS_CHILD]).toContain(sample.writer);
    expect(sample.writerCode).toBeUndefined();
    expect(sample.license).toBe("Apache-2.0");
    expect(sample.task?.source.case).toBe("modules");
  }
  const scenarios = drawn.map(({ scenario }) => scenario);
  expect(new Set(scenarios.slice(0, 12)).size).toBeGreaterThan(1);
  expect(
    scenarios
      .slice(0, 12)
      .every((one) => ["filled", "gaps", "mirrored-box", "empty-page"].includes(one)),
  ).toBe(true);
  expect(
    scenarios
      .slice(12)
      .some((one) => ["filled", "gaps", "mirrored-box", "empty-page"].includes(one)),
  ).toBe(false);
  expect(new Set(drawn.map(({ sample }) => sample.writer)).size).toBe(2);
  expect(sampleText(moduleSample(page, 301).sample)).toBe(
    sampleText(drawn[0]?.sample ?? readSample("{}")),
  );
  expect(() => moduleSample(page, -1)).toThrow("is no seed");
  // Its generator takes 32 bits of a seed: one above would draw another seed's sample.
  expect(() => moduleSample(page, 2 ** 32 + 301)).toThrow("from 0 to 4294967295");
  // Twelve drawn twice, workbooks among them: past 5 s on a loaded machine (T97).
}, 30_000);
