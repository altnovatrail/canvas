// What the samples page shows of a sample file it opens (T87 in RUN.md; R64 in docs/decisions.md),
// on the synthetic examples of every composition in examples/ (R48): the strokes the file holds and
// those a history erased, a workbook's boxes, the crops and the markup in words.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  GeometrySchema,
  type Purpose,
  SampleSchema,
  SheetSchema,
} from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import { Unreadable } from "@altnovatrail/contracts/novatrail/observation/v1/observation_pb.js";
import { create } from "@bufbuild/protobuf";
import { describe, expect, test } from "vitest";
import { readSample, type Sample } from "../src/eval/sample.js";
import { viewOf } from "./open.js";
import { OPEN } from "./texts.js";

/** An example sample file, read as the page reads it. */
const example = (name: string): Sample =>
  readSample(readFileSync(join("examples", `${name}.json`), "utf8"));

/** The strokes a sample's file holds that the sheet showed at the end, and the crops it holds. */
function held(sample: Sample): { strokes: number; crops: number } {
  const { ink, surface } = sample;
  const strokes = ink.case === "geometry" ? ink.value.strokes.length : 0;
  if (surface.case === "sheet") {
    return { strokes, crops: surface.value.crops?.crops.length ?? 0 };
  }
  const boxes = surface.case === "workbook" ? surface.value.filledBoxes : [];
  return { strokes, crops: boxes.reduce((sum, box) => sum + (box.crops?.crops.length ?? 0), 0) };
}

describe("a sample file of every composition", () => {
  test.each(["sheet-eval-set", "module-sheet-eval-set", "workbook-child"])(
    "%s, of the final geometry, shows its every stroke and crop, and erased none",
    (name) => {
      const sample = example(name);
      const view = viewOf(sample);
      const { strokes, crops } = held(sample);
      expect(view.shown).toHaveLength(strokes);
      expect(view.hidden).toEqual([]);
      expect(view.crops.flatMap((set) => set.crops)).toHaveLength(crops);
      expect(view.width).toBe(1000);
      expect(view.height).toBe(1400);
    },
  );

  test.each([
    "sheet-measurement",
    "page-sheet-measurement",
    "page-essay-measurement",
    "workbook-measurement",
    "page-workbook-measurement",
  ])("%s, of a history, shows what the sheet showed at the end, and the erased apart", (name) => {
    const sample = example(name);
    const view = viewOf(sample);
    const events = sample.ink.case === "history" ? sample.ink.value.events : [];
    const written = events.filter(({ event }) => event.case === "write").length;
    const erased = new Set(
      events.flatMap(({ event }) => (event.case === "erase" ? event.value.ids : [])),
    );
    expect(view.shown.length + view.hidden.length).toBe(written);
    expect(view.hidden.map(({ id }) => id).sort()).toEqual([...erased].sort());
    expect(view.crops.flatMap((set) => set.crops)).toHaveLength(held(sample).crops);
  });

  test("a sheet of an eval set says its purpose, writer, license and module, with no code", () => {
    const view = viewOf(example("module-sheet-eval-set"));
    const about = Object.fromEntries(view.about.map(({ name, value }) => [name, value]));
    expect(about[OPEN.purpose]).toBe(OPEN.purposeEvalSet);
    expect(about[OPEN.writer]).toBe(OPEN.writerAdultAsChild);
    expect(about[OPEN.license]).toBe("Apache-2.0");
    expect(about[OPEN.code]).toBeUndefined();
    const task = Object.fromEntries(view.task.map(({ name, value }) => [name, value]));
    expect(task[OPEN.source]).toBe(OPEN.fromModules);
  });

  test("a sheet's markup gives its parts' texts as written, its flags and its first error", () => {
    const sample = example("sheet-measurement");
    const markup = sample.markup;
    const parts = markup?.writing.case === "parts" ? markup.writing.value.parts : [];
    const shown = viewOf(sample).markup;
    expect(shown?.parts.map(({ text }) => text)).toEqual(parts.map(({ text }) => text));
    expect(shown?.parts.some(({ flags }) => flags.includes(OPEN.finalAnswer))).toBe(true);
    expect(shown?.truth).toHaveLength(markup?.truth?.answerSlots.length ?? -1);
  });

  test("a workbook names its every box by its place, and the crops by their box", () => {
    const sample = example("workbook-child");
    const view = viewOf(sample);
    const boxes = sample.surface.case === "workbook" ? sample.surface.value.boxes : [];
    expect(view.boxes.map(({ place }) => place)).toEqual(
      boxes.map(({ answerSlot }) => `${answerSlot?.item}.${answerSlot?.slot}`),
    );
    expect(view.crops[0]?.title).toMatch(/^Окошко \d+\.\d+$/);
    expect(view.about.find(({ name }) => name === OPEN.writer)?.value).toBe(OPEN.writerChild);
  });

  test("an essay's markup gives the marks of its criteria", () => {
    const sample = example("page-essay-measurement");
    const markup = viewOf(sample).markup;
    const marks = sample.markup?.writing.case === "marks" ? sample.markup.writing.value.marks : [];
    expect(markup?.marks).toHaveLength(marks.length);
    expect(markup?.parts).toEqual([]);
  });
});

describe("a history", () => {
  test("is folded as the sheet folds it: an undo puts back, a clear takes off", () => {
    const write = (id: number) => ({
      tMs: id,
      event: {
        case: "write" as const,
        value: { id, pointer: "pen", points: [{ x: id, y: id, tMs: id }] },
      },
    });
    const sample = create(SampleSchema, {
      ink: {
        case: "history",
        value: {
          events: [
            write(1),
            write(2),
            { tMs: 3, event: { case: "erase", value: { ids: [1] } } },
            { tMs: 4, event: { case: "undo", value: { removed: [], restored: [1] } } },
            write(3),
            { tMs: 5, event: { case: "clear", value: { ids: [1, 2, 3] } } },
            write(4),
          ],
        },
      },
    });
    const view = viewOf(sample);
    expect(view.shown.map(({ id }) => id)).toEqual([4]);
    expect(view.hidden.map(({ id }) => id)).toEqual([1, 2, 3]);
    expect(view.shown[0]?.points).toEqual([[4, 4]]);
  });

  test("a stroke beyond the sheet, or a file with no sheet, is taken into the picture: none is cut off", () => {
    const sample = create(SampleSchema, {
      ink: {
        case: "geometry",
        value: {
          strokes: [
            {
              id: 1,
              points: [
                { x: -20, y: 5 },
                { x: 1100, y: 1500 },
              ],
            },
          ],
        },
      },
    });
    expect(viewOf(sample).frame).toEqual({ x: -23, y: -3, width: 1126, height: 1506 });
    sample.surface = { case: "sheet", value: create(SheetSchema, { width: 1000, height: 1400 }) };
    sample.ink = { case: "geometry", value: create(GeometrySchema, { strokes: [] }) };
    expect(viewOf(sample).frame).toEqual({ x: -3, y: -3, width: 1006, height: 1406 });
  });
});

describe("what the page's words do not name", () => {
  test("is shown by its name in the protocol, or its number, and an empty file shows nothing", () => {
    const sample = create(SampleSchema, {
      purpose: 7 as Purpose,
      markup: {
        truth: {
          answerSlots: [
            {
              answerSlot: { item: 1, slot: 1 },
              read: { case: "unreadable", value: 9 as Unreadable },
            },
            {
              answerSlot: { item: 1, slot: 2 },
              read: { case: "unreadable", value: Unreadable.UNSPECIFIED },
            },
          ],
        },
      },
    });
    const view = viewOf(sample);
    expect(view.about.find(({ name }) => name === OPEN.purpose)?.value).toBe("7");
    expect(view.about.find(({ name }) => name === OPEN.writer)?.value).toBe("UNSPECIFIED");
    expect(view.markup?.truth.map(({ value }) => value)).toEqual(["9", "UNSPECIFIED"]);
    expect(view.shown).toEqual([]);
    expect(view.boxes).toEqual([]);
    expect(view.crops).toEqual([]);
    expect(view.task).toEqual([{ name: OPEN.source, value: OPEN.none }]);
  });

  test("a file of no sample is refused by the reading, before anything is shown", () => {
    expect(() => readSample('{"protocol":"novatrail.eval.v1","name":"x"}')).toThrow(TypeError);
  });
});
