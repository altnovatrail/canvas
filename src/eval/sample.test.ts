import {
  MarkupSchema,
  PartKind,
  SampleSchema,
  type TaskReferenceSchema,
} from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import { Unreadable } from "@altnovatrail/contracts/novatrail/observation/v1/observation_pb.js";
import type { MessageInitShape } from "@bufbuild/protobuf";
import { clone, create, equals } from "@bufbuild/protobuf";
import { describe, expect, test } from "vitest";
import { tableOf } from "../core/boxes.js";
import { cropOf } from "../core/crop.js";
import { extentOf } from "../core/geometry.js";
import { groupsOf } from "../core/groups.js";
import { type HistoryEvent, replay } from "../core/history.js";
import type { Stroke } from "../core/ink.js";
import { ladder, staircase, undone } from "../core/sheets.fixture.js";
import { draft, numbers } from "../core/workbooks.fixture.js";
import {
  Purpose,
  personId,
  readSample,
  type Sample,
  type SampleInput,
  sampleOf,
  sampleText,
  syntheticId,
  Writer,
  writerCode,
} from "./sample.js";

// The sheets and the pages of these tests are the synthetic ones of the tests of the groups, the
// crop and the boxes, drawn by code: no hand wrote them (CLAUDE.md). The files they write into
// examples/ are synthetic samples, one of each composition, which spec's sample-check holds to the
// protocol in ci-licenses (R48).

/** The task of a sheet the examples answer: one of the open tasks of tutor v0.1.1, as spec's are. */
const SHEET_TASK: MessageInitShape<typeof TaskReferenceSchema> = {
  source: {
    case: "tutor",
    value: {
      tag: "v0.1.1",
      fileDigest: "sha256:8e6857777c3ebb6e628096c3089a67dcb60718356a166e52120c9c6c538087f1",
      bank: "eval/bank.json",
      bankDigest: "sha256:c6f25b486faa79aa344eeb1dee6bd2aae8c069fd670a0d20c3fe929aeb9fdf13",
    },
  },
  task: "equation-1",
  openViewDigest: "sha256:96d317ad771f0a9478406ae88992f4495c8e1d7665d088f6d54a4b86b3ede0b8",
};

/** The task of a workbook the examples answer, from the same file. */
const WORKBOOK_TASK: MessageInitShape<typeof TaskReferenceSchema> = {
  source: {
    case: "tutor",
    value: {
      tag: "v0.1.1",
      fileDigest: "sha256:8e6857777c3ebb6e628096c3089a67dcb60718356a166e52120c9c6c538087f1",
      bank: "eval/workbook.json",
      bankDigest: "sha256:fbc262aca2f1bd7e8e2293bca0a42bfee6b79f484a3b512c2131150e8730d26f",
    },
  },
  task: "workbook-01",
  openViewDigest: "sha256:62c09c1e098e33c8eb8f2598ec187b19b72facebb61c2a6064b4d2a89e1e43da",
};

/** The staircase sheet's markup: what its strokes say, by the IDs its history gave them. */
function staircaseMarkup(): MessageInitShape<typeof MarkupSchema> {
  const [ladder, label, expression, answer] = staircase().groups;
  const part = (
    kind: PartKind,
    text: string,
    ids: readonly number[] | undefined,
    finalAnswer = false,
  ) => ({
    kind,
    text,
    strokeIds: [...(ids ?? [])],
    finalAnswer,
  });
  return {
    truth: {
      answerSlots: [{ answerSlot: { item: 1, slot: 1 }, read: { case: "value", value: "6" } }],
    },
    writing: {
      case: "parts",
      value: {
        parts: [
          part(PartKind.DRAWING, "a ladder of two posts and seven rungs", ladder),
          part(PartKind.TEXT, "30", label),
          part(PartKind.TEXT, "180 : 30 =", expression),
          part(PartKind.TEXT, "6", answer, true),
        ],
      },
    },
  };
}

/** The answers the workbook «numbers» writes, item by item. */
const NUMBERS = ["14", "21", "28", "35", "42", "49", "56", "63", "70", "7"];

/** A workbook's markup: the truth of every box of its page, a value or blank. */
function workbookMarkup(
  cells: readonly { item: number; slot: number }[],
  values: (item: number) => string | undefined,
) {
  return {
    truth: {
      answerSlots: cells.map(({ item, slot }) => {
        const value = values(item);
        return value === undefined
          ? {
              answerSlot: { item, slot },
              read: { case: "unreadable" as const, value: Unreadable.BLANK },
            }
          : { answerSlot: { item, slot }, read: { case: "value" as const, value } };
      }),
    },
  };
}

/** A sheet's sample of the staircase, synthetic, in the composition given. */
function sheetSample(purpose: Purpose, writer: Writer, seed: string): SampleInput {
  return {
    id: syntheticId(seed),
    purpose,
    writer,
    origin: { synthetic: { seed } },
    ...(purpose === Purpose.EVAL_SET ? {} : { writerCode: "S7NTH3T1C" }),
    task: SHEET_TASK,
    surface: { sheet: { history: staircase().work.history, digit: 24 } },
    markup: staircaseMarkup(),
  };
}

/** A workbook's sample of the page «numbers», synthetic, in the composition given. */
function workbookSample(purpose: Purpose, writer: Writer, seed: string): SampleInput {
  const book = numbers();
  return {
    id: syntheticId(seed),
    purpose,
    writer,
    origin: { synthetic: { seed } },
    ...(purpose === Purpose.EVAL_SET ? {} : { writerCode: "S7NTH3T1C" }),
    task: WORKBOOK_TASK,
    surface: { workbook: { history: book.work.history, cells: book.cells, digit: 24 } },
    markup: workbookMarkup(book.cells, (item) => NUMBERS[item - 1]),
  };
}

/** The examples, by the name of their file. */
const EXAMPLES: readonly (readonly [string, () => SampleInput])[] = [
  ["sheet-measurement", () => sheetSample(Purpose.MEASUREMENT, Writer.ADULT, "1")],
  ["sheet-eval-set", () => sheetSample(Purpose.EVAL_SET, Writer.ADULT_AS_CHILD, "2")],
  ["workbook-child", () => workbookSample(Purpose.MEASUREMENT, Writer.CHILD, "3")],
  ["workbook-measurement", () => workbookSample(Purpose.MEASUREMENT, Writer.ADULT, "4")],
];

/** The strokes a sample holds, as the sheet's rules take them: a geometry's have no time. */
function strokesOf(sample: Sample): Stroke[] {
  const stroke = (
    id: number,
    points: readonly { x: number; y: number; tMs?: number }[],
  ): Stroke => ({
    id,
    kind: "",
    points: points.map(({ x, y, tMs }) => ({ x, y, t: tMs ?? 0, p: 0 })),
  });
  if (sample.ink.case === "geometry") {
    return sample.ink.value.strokes.map(({ id, points }) => stroke(id, points));
  }
  if (sample.ink.case !== "history") throw new Error("a sample without ink");
  const history = sample.ink.value.events.map(({ tMs: t, event }): HistoryEvent => {
    switch (event.case) {
      case "write":
        return { kind: "write", t, stroke: stroke(event.value.id, event.value.points) };
      case "erase":
      case "clear":
        return { kind: event.case, t, ids: event.value.ids };
      case "undo":
        return { kind: "undo", t, removed: event.value.removed, restored: event.value.restored };
      default:
        throw new Error("an event of no kind");
    }
  });
  return replay(history);
}

describe("what a sample holds, by its purpose and its writer", () => {
  test("an adult's sample of measurement keeps the history and the writer's code, and has no license", () => {
    const sample = sampleOf(sheetSample(Purpose.MEASUREMENT, Writer.ADULT, "1"));
    expect(sample.ink.case).toBe("history");
    expect(sample.writerCode).toBe("S7NTH3T1C");
    expect(sample.license).toBeUndefined();
    expect(sampleOf(sheetSample(Purpose.MEASUREMENT, Writer.ADULT_AS_CHILD, "1")).ink.case).toBe(
      "history",
    );
  });

  test("an eval set's keeps the final geometry and its license, and no writer's code", () => {
    const sample = sampleOf(sheetSample(Purpose.EVAL_SET, Writer.ADULT, "2"));
    expect(sample.ink.case).toBe("geometry");
    expect(sample.writerCode).toBeUndefined();
    expect(sample.license).toBe("Apache-2.0");
  });

  test("a child's keeps the final geometry and the writer's code", () => {
    const sample = sampleOf(workbookSample(Purpose.MEASUREMENT, Writer.CHILD, "3"));
    expect(sample.ink.case).toBe("geometry");
    expect(sample.writerCode).toBe("S7NTH3T1C");
    expect(sample.license).toBeUndefined();
  });

  test("a child's sample of an eval set, a code where none goes or none where one goes, and no purpose or writer are TypeErrors", () => {
    const sheet = sheetSample(Purpose.MEASUREMENT, Writer.ADULT, "1");
    const { writerCode: _, ...uncoded } = sheet;
    const cases: SampleInput[] = [
      { ...uncoded, purpose: Purpose.EVAL_SET, writer: Writer.CHILD },
      { ...sheet, purpose: Purpose.EVAL_SET },
      uncoded,
      { ...sheet, purpose: Purpose.UNSPECIFIED },
      { ...sheet, writer: Writer.UNSPECIFIED },
    ];
    for (const input of cases) expect(() => sampleOf(input)).toThrow(TypeError);
  });

  test("a person's sample names the page's texts and version; a synthetic one 'none' and 0.0.0, and its seed", () => {
    const synthetic = sampleOf(sheetSample(Purpose.MEASUREMENT, Writer.ADULT, "1"));
    expect([synthetic.textSetVersion, synthetic.canvasVersion]).toEqual(["none", "0.0.0"]);
    expect(synthetic.origin).toMatchObject({ case: "synthetic", value: { seed: "1" } });
    const input = sheetSample(Purpose.MEASUREMENT, Writer.ADULT, "1");
    const person = sampleOf({
      ...input,
      origin: { person: { textSetVersion: "0.1", canvasVersion: "0.1.3" } },
    });
    expect([person.textSetVersion, person.canvasVersion, person.origin.case]).toEqual([
      "0.1",
      "0.1.3",
      "person",
    ]);
  });
});

describe("the history of writing", () => {
  test("is the sheet's, each time in whole milliseconds, each place to a tenth, without the pressure", () => {
    const { history } = staircase().work;
    const sample = sampleOf(sheetSample(Purpose.MEASUREMENT, Writer.ADULT, "1"));
    if (sample.ink.case !== "history") throw new Error("no history");
    const { events } = sample.ink.value;
    expect(events.map(({ event }) => event.case)).toEqual(history.map(({ kind }) => kind));
    expect(events.map(({ tMs }) => tMs)).toEqual(history.map(({ t }) => Math.round(t)));
    for (const { tMs, event } of events) {
      if (event.case !== "write") continue;
      for (const point of event.value.points) {
        expect(Number.isInteger(point.tMs)).toBe(true);
        expect(Math.round(point.x * 10) / 10).toBe(point.x);
        // A stroke lands no sooner than its last point (R22).
        expect(point.tMs).toBeLessThanOrEqual(tMs);
      }
    }
    expect(sampleText(sample)).not.toMatch(/"p"|pressure/);
  });

  test("gives the groups and the crops the rules give the strokes it shows", () => {
    const sample = sampleOf(sheetSample(Purpose.MEASUREMENT, Writer.ADULT, "1"));
    const strokes = strokesOf(sample);
    if (sample.surface.case !== "sheet") throw new Error("no sheet");
    const { groups, crops } = sample.surface.value;
    const ruled = groupsOf(strokes);
    expect(groups.map(({ label, strokeIds }) => ({ label, ids: strokeIds }))).toEqual(ruled);
    for (const crop of crops?.crops ?? []) {
      const again = cropOf(strokes, ruled, crop.digitHeight);
      expect([crop.drawnHeight, crop.width, crop.height, crop.scale]).toEqual([
        again?.drawn,
        again?.width,
        again?.height,
        again?.scale,
      ]);
    }
  });
});

test("a history with an undo keeps it, the strokes it took off and put back", () => {
  const { history } = undone().work;
  const input = sheetSample(Purpose.MEASUREMENT, Writer.ADULT, "1");
  const sample = sampleOf({ ...input, surface: { sheet: { history, digit: 24 } }, markup: {} });
  if (sample.ink.case !== "history") throw new Error("no history");
  const undos = history.filter((event) => event.kind === "undo");
  expect(undos.length).toBeGreaterThan(0);
  expect(
    sample.ink.value.events
      .filter(({ event }) => event.case === "undo")
      .map(({ event }) => event.value),
  ).toMatchObject(undos.map(({ removed, restored }) => ({ removed, restored })));
  expect(strokesOf(sample).map(({ id }) => id)).toEqual(replay(history).map(({ id }) => id));
});

describe("the final geometry", () => {
  test("holds the strokes the sheet shows, numbered by place from 1 in their canonical direction, the erased one gone", () => {
    const sample = sampleOf(sheetSample(Purpose.EVAL_SET, Writer.ADULT, "2"));
    if (sample.ink.case !== "geometry") throw new Error("no geometry");
    const strokes = sample.ink.value.strokes;
    expect(strokes.map(({ id }) => id)).toEqual(strokes.map((_, n) => n + 1));
    expect(strokes.length).toBe(staircase().work.strokes.length);
    const tops = strokes.map(({ points }) => Math.min(...points.map(({ y }) => y)));
    for (let k = 1; k < tops.length; k++)
      expect(tops[k]).toBeGreaterThanOrEqual(tops[k - 1] as number);
    for (const { points } of strokes) {
      const [first, last] = [points[0], points.at(-1)];
      if (first === undefined || last === undefined) throw new Error("a stroke with no points");
      expect(first.y < last.y || (first.y === last.y && first.x <= last.x)).toBe(true);
    }
  });

  test("gives the same numbers of the crops as the history, its groups and its markup on the new numbers", () => {
    const history = sampleOf(sheetSample(Purpose.MEASUREMENT, Writer.ADULT, "1"));
    const geometry = sampleOf(sheetSample(Purpose.EVAL_SET, Writer.ADULT, "2"));
    if (history.surface.case !== "sheet" || geometry.surface.case !== "sheet")
      throw new Error("no sheets");
    const numbers = (sample: Sample) => {
      if (sample.surface.case !== "sheet") throw new Error("no sheet");
      const { crops } = sample.surface.value;
      return { ...crops, crops: crops?.crops.map(({ png: _, ...rest }) => rest) };
    };
    expect(numbers(geometry)).toEqual(numbers(history));
    // The groups name the same strokes, each by its new number.
    const strokes = strokesOf(geometry);
    const sizes = (groups: readonly { strokeIds: number[] }[]) =>
      groups.map(({ strokeIds }) => strokeIds.length);
    expect(sizes(geometry.surface.value.groups)).toEqual(sizes(history.surface.value.groups));
    const named = new Set(geometry.surface.value.groups.flatMap(({ strokeIds }) => strokeIds));
    expect([...named].sort((a, b) => a - b)).toEqual(strokes.map(({ id }) => id));
    if (geometry.markup?.writing.case !== "parts") throw new Error("no parts");
    // The parts go in the order they read, the groups by their labels: the same sets of strokes.
    const sets = (lists: readonly { strokeIds: number[] }[]) =>
      lists.map(({ strokeIds }) => strokeIds.join(",")).sort();
    expect(sets(geometry.markup.writing.value.parts)).toEqual(sets(geometry.surface.value.groups));
  });

  test("of a workbook holds its boxes' strokes alone, and its table on the new numbers", () => {
    const book = draft();
    const input = workbookSample(Purpose.MEASUREMENT, Writer.CHILD, "5");
    const sample = sampleOf({
      ...input,
      surface: { workbook: { history: book.work.history, cells: book.cells, digit: 24 } },
      markup: workbookMarkup(book.cells, () => undefined),
    });
    if (sample.ink.case !== "geometry" || sample.surface.case !== "workbook")
      throw new Error("no page");
    const table = tableOf(book.work.strokes, book.cells);
    const held = table.flatMap(({ ids }) => ids);
    expect(book.work.strokes.length).toBeGreaterThan(held.length);
    expect(sample.ink.value.strokes.length).toBe(held.length);
    const filled = sample.surface.value.filledBoxes;
    expect(
      filled.map(({ answerSlot, strokeIds }) => [
        answerSlot?.item,
        answerSlot?.slot,
        strokeIds.length,
      ]),
    ).toEqual(table.map(({ item, slot, ids }) => [item, slot, ids.length]));
    expect(filled.flatMap(({ strokeIds }) => strokeIds).sort((a, b) => a - b)).toEqual(
      sample.ink.value.strokes.map(({ id }) => id),
    );
    for (const box of filled)
      for (const crop of box.crops?.crops ?? []) expect(crop.frames).toEqual([]);
  });
});

test("a page's box that is not in whole units is a RangeError", () => {
  const book = numbers();
  const [first, ...rest] = book.cells;
  if (first === undefined) throw new Error("a page with no box");
  const moved = [{ ...first, box: { ...first.box, left: first.box.left + 0.5 } }, ...rest];
  const input = workbookSample(Purpose.MEASUREMENT, Writer.CHILD, "3");
  const surface = { workbook: { history: book.work.history, cells: moved, digit: 24 } };
  expect(() => sampleOf({ ...input, surface })).toThrow(RangeError);
});

test("a markup that names a stroke the sample does not hold is a TypeError, and the caller's markup is left as it was", () => {
  const input = sheetSample(Purpose.EVAL_SET, Writer.ADULT, "2");
  const markup = create(MarkupSchema, input.markup);
  const before = clone(MarkupSchema, markup);
  sampleOf({ ...input, markup });
  expect(equals(MarkupSchema, markup, before)).toBe(true);
  // The erased «5» of the staircase is no stroke of the sample.
  const erased = staircase().work.history.find((event) => event.kind === "erase");
  if (erased?.kind !== "erase") throw new Error("no erase");
  const stale: MessageInitShape<typeof MarkupSchema> = {
    writing: { case: "parts", value: { parts: [{ strokeIds: [...erased.ids] }] } },
  };
  expect(() => sampleOf({ ...input, markup: stale })).toThrow(/holds no stroke/);
});

describe("the crops", () => {
  test("are at each height of eval and the module's, once each, ascending, with h_med and not the scale's median", () => {
    const at32 = sheetSample(Purpose.MEASUREMENT, Writer.ADULT, "1");
    const sample = sampleOf({
      ...at32,
      surface: { sheet: { history: staircase().work.history, digit: 20 } },
    });
    if (sample.surface.case !== "sheet") throw new Error("no sheet");
    const { crops } = sample.surface.value;
    expect(crops?.crops.map(({ digitHeight }) => digitHeight)).toEqual([16, 20, 24, 32, 48]);
    // On a sheet whose bundles are taller than the ceiling, h_med is above the scale's median, H.
    const tall = ladder().work;
    const high = sampleOf({
      ...at32,
      surface: { sheet: { history: tall.history, digit: 24 } },
      markup: {},
    });
    const crop = cropOf(tall.strokes, groupsOf(tall.strokes), 24);
    if (high.surface.case !== "sheet" || crop === null) throw new Error("no crop");
    expect(crop.median * 10).toBeGreaterThan(crop.exact.median);
    expect(high.surface.value.crops?.bundleMedian).toBe(Math.round(crop.median * 10));
    expect(
      sampleOf(sheetSample(Purpose.MEASUREMENT, Writer.ADULT, "1")).surface.value,
    ).toMatchObject({
      crops: {
        crops: [{ digitHeight: 16 }, { digitHeight: 24 }, { digitHeight: 32 }, { digitHeight: 48 }],
      },
    });
  });

  test("of a sheet with no stroke are none", () => {
    const input = sheetSample(Purpose.MEASUREMENT, Writer.ADULT, "1");
    const sample = sampleOf({
      ...input,
      surface: { sheet: { history: [], digit: 24 } },
      markup: {},
    });
    expect(sample.surface.case === "sheet" && sample.surface.value.crops).toBeUndefined();
  });
});

describe("the file", () => {
  test("reads back to the same sample and writes the same text again; a field it does not know and another protocol are TypeErrors", () => {
    for (const [, make] of EXAMPLES) {
      const sample = sampleOf(make());
      const text = sampleText(sample);
      const read = readSample(text);
      expect(equals(SampleSchema, read, sample)).toBe(true);
      expect(sampleText(read)).toBe(text);
    }
    const text = sampleText(sampleOf(sheetSample(Purpose.MEASUREMENT, Writer.ADULT, "1")));
    expect(() => readSample(text.replace('"id":', '"name": "A", "id":'))).toThrow(TypeError);
    expect(() => readSample(text.replace('"novatrail.eval.v1"', '"novatrail.eval.v2"'))).toThrow(
      TypeError,
    );
    expect(() => readSample("[]")).toThrow(TypeError);
  });

  test("of one seed is the same file, byte for byte, and holds no key, solution or trap", () => {
    for (const [, make] of EXAMPLES) {
      const text = sampleText(sampleOf(make()));
      expect(sampleText(sampleOf(make()))).toBe(text);
      expect(text).not.toMatch(/"(key|check|solution|traps?|expected|outcome)"/);
    }
  });

  test.each(EXAMPLES.map(([name, make]) => [name, make] as const))(
    "examples/%s.json is the sample its synthetic input gives, as spec's sample-check holds it in CI",
    async (name, make) => {
      await expect(sampleText(sampleOf(make()))).toMatchFileSnapshot(`../../examples/${name}.json`);
    },
  );
});

describe("the IDs and codes made at random", () => {
  test("take the low five bits of the bytes given: 12 letters and digits, and 8 digits and capitals", () => {
    const bytes = Uint8Array.from({ length: 16 }, (_, n) => n * 17);
    expect(personId(bytes)).toMatch(/^[a-z2-7]{12}$/);
    expect(writerCode(bytes)).toMatch(/^[0-9A-Z]{8}$/);
    expect(personId(bytes)).toBe(personId(bytes));
    expect(() => personId(new Uint8Array(4))).toThrow(RangeError);
    expect(() => writerCode(new Uint8Array(4))).toThrow(RangeError);
    expect(syntheticId("18446744073709551615")).toBe("synthetic-18446744073709551615");
  });
});

test("a stroke's box is held: the geometry's boxes are the strokes' as they came, in tenths", () => {
  const sample = sampleOf(sheetSample(Purpose.EVAL_SET, Writer.ADULT, "2"));
  const boxes = (strokes: readonly Stroke[]) =>
    strokes.map((stroke) => {
      const { minX, minY, maxX, maxY } = extentOf(stroke);
      return [minX, minY, maxX, maxY].join(",");
    });
  expect(boxes(strokesOf(sample)).sort()).toEqual(boxes(staircase().work.strokes).sort());
});
