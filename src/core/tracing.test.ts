import { describe, expect, test } from "vitest";
import { Clock } from "./clock.js";
import { cropOf } from "./crop.js";
import { boxOf, tenths } from "./geometry.js";
import { groupsOf } from "./groups.js";
import { historyOf } from "./history.js";
import { digestOf, marksOf, placesOf, shownOf } from "./marks.js";
import { rasterOf } from "./raster.js";
import { stroke } from "./sheets.fixture.js";
import { paperWorkForCheck } from "./submission.js";
import {
  boxOnSheet,
  grayOf,
  isPaperGrid,
  keptOn,
  LARGEST,
  layOver,
  nextGrid,
  onSheet,
  onTracing,
  PAPER_GRIDS,
  rectOf,
  rulingsOf,
  sizeOf,
  TRACING,
  TRACING_START,
  tenthsOf,
  toTracing,
  tracingStateOf,
  whollyOff,
} from "./tracing.js";
import { Work } from "./work.js";

// The tracing paper of a task from paper (R87): its size and place, its strokes from its corner,
// the history and the work that hold them, and the work for checking with the crop's picture.

/** The value as a store that keeps JSON gives it back. */
function stored<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/** A grey picture of one value. */
function plain(width: number, height: number, value: number) {
  return { gray: new Uint8Array(width * height).fill(value), width, height };
}

describe("the grid of a task from paper (R88)", () => {
  test("it turns dots, lines, blank, squares, and round to dots again", () => {
    expect(PAPER_GRIDS).toEqual(["dots", "lines", "blank", "squares"]);
    expect(nextGrid("dots")).toBe("lines");
    expect(nextGrid("lines")).toBe("blank");
    expect(nextGrid("blank")).toBe("squares");
    expect(nextGrid("squares")).toBe("dots");
  });

  test("each grid has its rulings, and a blank sheet none", () => {
    expect(rulingsOf("dots")).toEqual({ kind: "dots", step: 25 });
    expect(rulingsOf("lines")).toEqual({ kind: "lines", step: 40 });
    expect(rulingsOf("squares")).toEqual({ kind: "squares", step: 25 });
    expect(rulingsOf("blank")).toBeUndefined();
  });

  test("only its four grids are grids", () => {
    expect(PAPER_GRIDS.every(isPaperGrid)).toBe(true);
    for (const each of ["none", "Dots", "", 1, null, undefined])
      expect(isPaperGrid(each)).toBe(false);
  });
});

describe("the tracing paper's size and place", () => {
  test("fits the rule's box in the crop's proportions", () => {
    expect(sizeOf(1600, 400)).toEqual({ width: 800, height: 200 });
    expect(sizeOf(300, 600)).toEqual({ width: 350, height: 700 });
    expect(sizeOf(0, 10)).toBe(LARGEST);
  });

  test("starts right of the bar, shown, frozen", () => {
    expect(TRACING_START).toEqual({ at: [180, 60], hidden: false });
    expect(Object.isFrozen(TRACING_START) && Object.isFrozen(TRACING_START.at)).toBe(true);
    // The largest paper at the start lies wholly on the sheet.
    expect(keptOn(TRACING_START.at, LARGEST)).toEqual([180, 60]);
  });

  test("is kept wholly within the sheet's reach by the grip and the keys, past the page too", () => {
    const size = { width: 400, height: 100 };
    expect(keptOn([-50, -10], size)).toEqual([0, 0]);
    expect(keptOn([900, 1390], size)).toEqual([900, 1390]);
    expect(keptOn([9900, 13990], size)).toEqual([9600, 13900]);
    expect(keptOn([300, 500], size)).toEqual([300, 500]);
  });

  test("takes a state that leaves it in part within the sheet's reach, and no other", () => {
    const size = { width: 400, height: 100 };
    const state = tracingStateOf({ at: [-399, 13999], hidden: true, more: 1 }, size);
    expect(state).toEqual({ at: [-399, 13999], hidden: true });
    expect(Object.isFrozen(state) && Object.isFrozen(state.at)).toBe(true);
    // Past the page it is on the sheet still (R73).
    expect(tracingStateOf({ at: [1000, 1400], hidden: false }, size).at).toEqual([1000, 1400]);
    for (const at of [
      [-400, 0],
      [10000, 0],
      [0, 14000],
      [0, -100],
    ]) {
      expect(() => tracingStateOf({ at, hidden: false }, size), String(at)).toThrow(TypeError);
    }
    for (const bad of [
      null,
      { at: [1], hidden: false },
      { at: [0, Number.NaN], hidden: false },
      { at: [0, 0], hidden: "no" },
    ]) {
      expect(() => tracingStateOf(bad, size), JSON.stringify(bad)).toThrow(TypeError);
    }
  });

  test("tells a place wholly off the sheet for a paper's size, which its real size may make so", () => {
    // A state checked against the largest paper may leave a smaller one wholly off.
    expect(whollyOff([-750, 100], LARGEST)).toBe(false);
    const read = { width: 400, height: 100 };
    expect(whollyOff([-750, 100], read)).toBe(true);
    expect(keptOn([-750, 100], read)).toEqual([0, 100]);
    expect(whollyOff([-400, 0], read)).toBe(true);
    expect(whollyOff([-399.9, 0], read)).toBe(false);
    expect(whollyOff([1000, 0], read)).toBe(false);
    expect(whollyOff([10000, 0], read)).toBe(true);
    expect(whollyOff([0, 14000], read)).toBe(true);
  });

  test("holds a point by its corner, kept to it, and puts its strokes back on the sheet", () => {
    const size = { width: 400, height: 100 };
    expect(onTracing({ x: 300, y: 150 }, [200, 100], size)).toBe(true);
    expect(onTracing({ x: 199, y: 150 }, [200, 100], size)).toBe(false);
    expect(toTracing({ x: 250, y: 260 }, [200, 100], size)).toEqual({ x: 50, y: 100 });
    const moved = onSheet(stroke(3, [10, 20, 5], [990, 30, 9]), [100, 50]);
    expect(moved.points.map(({ x, y }) => [x, y])).toEqual([
      [110, 70],
      [1090, 80],
    ]);
    // A stroke carried past the sheet's reach is kept to it.
    const far = onSheet(stroke(5, [10, 20, 5], [990, 30, 9]), [9500, 13980]);
    expect(far.points.map(({ x, y }) => [x, y])).toEqual([
      [9510, 14000],
      [10000, 14000],
    ]);
    expect(moved.id).toBe(3);
    // The box moved with the paper is the moved stroke's, kept to the sheet as its points are.
    const traced = stroke(4, [10, 20, 5], [990, 30, 9], [-5, 13995, 12]);
    for (const at of [
      [100, 50],
      [9500, 10],
      [-30, 10],
      [0, 0],
    ] as const) {
      expect(boxOnSheet(boxOf(traced.points), at), String(at)).toEqual(
        boxOf(onSheet(traced, at).points),
      );
    }
    expect(Object.isFrozen(moved.points[0])).toBe(true);
    expect(tenthsOf(rectOf([-10, 13950], size))).toEqual({
      minX: 0,
      minY: 139500,
      maxX: 3900,
      maxY: 140000,
    });
  });
});

describe("the history of a task from paper", () => {
  const written = { kind: "write", t: 10, stroke: stroke(1, [5, 5, 10]), on: "tracing" };

  test("keeps the strokes of the tracing paper, and a sheet takes none", () => {
    expect(historyOf([written], true)).toEqual([written]);
    expect(() => historyOf([written])).toThrow(/on: none/);
    expect(() => historyOf([{ ...written, on: "sheet" }], true)).toThrow(/"tracing", or none/);
  });

  test("replays into a work that knows which strokes are the paper's", () => {
    const history = [
      written,
      { kind: "write", t: 20, stroke: stroke(2, [500, 500, 20]) },
      { kind: "undo", t: 30, removed: [2], restored: [] },
    ];
    const work = Work.restore(history, new Clock(), true);
    expect(work.onTracing(1)).toBe(true);
    expect(work.onTracing(2)).toBe(false);
    expect(work.traced).toBe(true);
    expect(work.history).toEqual(history);
    expect(() => Work.restore(history, new Clock())).toThrow(TypeError);
  });

  test("writes a stroke on the paper with its mark, and erases by layer", () => {
    const clock = new Clock();
    const work = new Work(clock);
    work.write(stroke(1, [50, 50, 1], [60, 50, 2]), "tracing");
    work.write(stroke(2, [50, 50, 3], [60, 50, 4]));
    expect(work.history.map((event) => "on" in event && event.on)).toEqual(["tracing", false]);
    const at = { x: 55, y: 50 };
    expect(
      work
        .near(at, at, 5)
        .map(({ id }) => id)
        .sort(),
    ).toEqual([1, 2]);
    expect(work.near(at, at, 5, "tracing").map(({ id }) => id)).toEqual([1]);
    expect(work.near(at, at, 5, "sheet").map(({ id }) => id)).toEqual([2]);
  });
});

describe("the work of a task from paper for checking", () => {
  const at = [200, 100] as const;
  const size = { width: 400, height: 100 };
  const tracing = { at, hidden: false };
  // One stroke on the tracing paper, from its corner, and one on the sheet below it.
  const onPaper = stroke(1, [20, 20, 0], [20, 70, 100]);
  const below = stroke(2, [300, 400, 3000], [300, 460, 3100]);
  const strokes = [onSheet(onPaper, at), below];
  const paper = { at, onTracing: (id: number) => id === 1 };

  test("crops the paper with the strokes, and multiplies the crop's picture into it", () => {
    const work = paperWorkForCheck(strokes, paper, tracing, rectOf(at, size), plain(8, 2, 128), 24);
    if (work === null) throw new Error("no work");
    const { crop, groups, tracing: lay } = work.submission;
    expect(lay).toEqual(tracing);
    expect(groups).toEqual(groupsOf(strokes));
    // The crop takes in the whole paper: its box reaches its corners, in tenths.
    expect(crop.exact.box).toEqual({ minX: 2000, minY: 1000, maxX: 6000, maxY: 4600 });
    const expected = cropOf(strokes, groups, 24, tenthsOf(rectOf(at, size)));
    if (expected === null) throw new Error("no crop");
    expect(crop.sheetBox).toEqual(expected.sheetBox);
    // Under the paper and away from the ink the crop is the picture's grey; elsewhere white.
    const png = work.png;
    expect(png.subarray(1, 4)).toEqual(Uint8Array.from([0x50, 0x4e, 0x47]));
    const ink = rasterOf(strokes, expected);
    layOver(ink, expected.width, plain(8, 2, 128), {
      left: expected.margins[1],
      top: expected.margins[0],
      right: expected.margins[1] + (4000 * expected.drawn) / expected.exact.median,
      bottom: expected.margins[0] + (1000 * expected.drawn) / expected.exact.median,
    });
    expect(ink.includes(128)).toBe(true);
    expect(ink[0]).toBe(255);
    expect(Object.isFrozen(work.submission.tracing.at)).toBe(true);
  });

  test("has a digest that holds where the paper lay and its strokes", () => {
    const work = paperWorkForCheck(strokes, paper, tracing, rectOf(at, size), null, 24);
    if (work === null) throw new Error("no work");
    const { crop, groups, digest } = work.submission;
    expect(digest).toBe(digestOf(strokes, crop, groups, paper));
    expect(digest).not.toBe(digestOf(strokes, crop, groups));
    expect(digest).not.toBe(
      digestOf(strokes, crop, groups, { at: [200, 101], onTracing: paper.onTracing }),
    );
    expect(digest).not.toBe(digestOf(strokes, crop, groups, { at, onTracing: () => false }));
  });

  test("goes back to its sheet, the paper where it lay, and to no other", () => {
    const work = paperWorkForCheck(strokes, paper, tracing, rectOf(at, size), null, 24);
    if (work === null) throw new Error("no work");
    const marks = marksOf(
      stored({
        submission: work.submission,
        marks: [{ kind: "frame", at: { group: "A" }, name: "Tutor's mark 1 of 1" }],
      }),
    );
    expect("tracing" in marks.submission).toBe(true);
    const places = placesOf(marks, strokes, null, undefined, paper);
    expect(places[0]?.ids.length).toBeGreaterThan(0);
    expect(() => placesOf(marks, strokes)).toThrow(/a task from paper's context/);
    expect(() =>
      placesOf(marks, strokes, null, undefined, { at: [0, 0], onTracing: paper.onTracing }),
    ).toThrow(/lie elsewhere/);
    // A sheet's context is no task from paper's, which a sheet's marks never go back to.
    const { tracing: _, ...sheet } = work.submission;
    const sheets = marksOf(stored({ submission: sheet, marks: [] }));
    expect(() => placesOf(sheets, strokes, null, undefined, paper)).toThrow(
      /a sheet's context, and this is a task from paper/,
    );
  });

  test("stands a verdict by the strokes nearest its box, a group each, or at its box", () => {
    const work = paperWorkForCheck(strokes, paper, tracing, rectOf(at, size), null, 24);
    if (work === null) throw new Error("no work");
    const [top, left, bottom, right] = work.submission.crop.sheetBox;
    const on = ([ymin, xmin, ymax, xmax]: readonly [number, number, number, number]) => ({
      minX: left + ((right - left) * xmin) / 1000,
      minY: top + ((bottom - top) * ymin) / 1000,
      maxX: left + ((right - left) * xmax) / 1000,
      maxY: top + ((bottom - top) * ymax) / 1000,
    });
    const verdict = (box: [number, number, number, number], correct: boolean) => ({
      kind: "verdict",
      at: { box },
      correct,
      name: "Task",
    });
    // The paper's stroke, near the first box and the last; the sheet's, near the second; none
    // near the third, far right.
    const far = [0, 900, 100, 1000] as [number, number, number, number];
    const loose = [0, 0, 300, 150] as [number, number, number, number];
    const marks = marksOf(
      stored({
        submission: work.submission,
        marks: [
          verdict([100, 60, 250, 140], true),
          verdict([800, 150, 1000, 300], false),
          verdict(far, true),
          verdict(loose, false),
        ],
      }),
    );
    const places = placesOf(marks, strokes, null, undefined, paper);
    expect(places).toEqual([
      { ids: [], box: { minX: 220, minY: 120, maxX: 220, maxY: 170 }, correct: true },
      { ids: [], box: { minX: 300, minY: 400, maxX: 300, maxY: 460 }, correct: false },
      // No strokes within its reach: where the model saw the answer, which may be ink on the photo.
      { ids: [], box: on(far), correct: true },
      // The stroke it is nearest stands by a nearer verdict already.
      { ids: [], box: on(loose), correct: false },
    ]);
    const first = places[0];
    if (!first) throw new Error("no place");
    expect(shownOf(first, () => undefined)).toEqual(first.box);
  });

  test("takes a verdict at a box alone, with whether it is right, and on no sheet", () => {
    const work = paperWorkForCheck(strokes, paper, tracing, rectOf(at, size), null, 24);
    if (work === null) throw new Error("no work");
    const of = (mark: object) => () =>
      marksOf(stored({ submission: work.submission, marks: [mark] }));
    const box = { box: [0, 0, 500, 500] };
    expect(of({ kind: "verdict", at: { group: "A" }, correct: true, name: "T" })).toThrow(
      /a verdict stands at a box alone/,
    );
    expect(of({ kind: "verdict", at: box, name: "T" })).toThrow(/correct: whether the answer/);
    expect(of({ kind: "verdict", at: box, correct: "yes", name: "T" })).toThrow(/correct/);
    expect(of({ kind: "verdict", at: box, correct: true, name: " " })).toThrow(/name/);
    expect(of({ kind: "wavy_line", at: { group: "A" }, name: "T" })).toThrow(
      /a wavy line stands at a box alone/,
    );
    expect(of({ kind: "wavy_line", at: box, name: "" })).toThrow(/name/);
    expect(of({ kind: "underline", at: box, name: "T" })).toThrow(
      /"frame", "verdict" and "wavy_line" marks/,
    );
    const { tracing: _, ...sheet } = work.submission;
    expect(() =>
      marksOf(
        stored({
          submission: sheet,
          marks: [{ kind: "verdict", at: box, correct: true, name: "T" }],
        }),
      ),
    ).toThrow(/the sheet draws "frame" marks, not "verdict"/);
  });

  test("stands a wavy line under the strokes its box takes, or under its box", () => {
    const work = paperWorkForCheck(strokes, paper, tracing, rectOf(at, size), null, 24);
    if (work === null) throw new Error("no work");
    const [top, left, bottom, right] = work.submission.crop.sheetBox;
    const far: [number, number, number, number] = [0, 900, 100, 1000];
    const wavy = (box: [number, number, number, number]) => ({
      kind: "wavy_line",
      at: { box },
      name: "Tutor's mark: where the mistake is",
    });
    const marks = marksOf(
      stored({ submission: work.submission, marks: [wavy([0, 0, 1000, 1000]), wavy(far)] }),
    );
    expect(marks.marks[0]).toEqual(wavy([0, 0, 1000, 1000]));
    const [taken, none] = placesOf(marks, strokes, null, undefined, paper);
    if (!taken || !none) throw new Error("no place");
    expect(taken.ids.length).toBeGreaterThan(0);
    expect(taken.wavy).toBe(true);
    // Its strokes erased, it goes with them.
    expect(shownOf(taken, () => undefined)).toBeNull();
    const there = {
      minX: left + ((right - left) * far[1]) / 1000,
      minY: top + ((bottom - top) * far[0]) / 1000,
      maxX: left + ((right - left) * far[3]) / 1000,
      maxY: top + ((bottom - top) * far[2]) / 1000,
    };
    expect(none).toEqual({ ids: [], box: there, wavy: true });
    expect(shownOf(none, () => undefined)).toEqual(there);
  });

  test("is none with no stroke on the sheet or the paper", () => {
    expect(paperWorkForCheck([], paper, tracing, rectOf(at, size), null, 24)).toBeNull();
  });
});

describe("the crop's picture", () => {
  test("is grey by its luma, over white where it is transparent", () => {
    const rgba = Uint8Array.from([255, 0, 0, 255, 0, 0, 0, 0, 10, 20, 30, 255]);
    expect([...grayOf(rgba, 3, 1).gray]).toEqual([76, 255, 18]);
    expect(() => grayOf(rgba, 2, 1)).toThrow(RangeError);
  });

  test("lies over the ink multiplied, shrunk by the means of its pixels", () => {
    const ink = new Uint8Array(4 * 2).fill(255);
    ink[0] = 0;
    // A picture of four columns, 100 and 200 by turns, laid over two pixels of the first row.
    const picture = { gray: Uint8Array.from([100, 200, 100, 200]), width: 4, height: 1 };
    layOver(ink, 4, picture, { left: 0, top: 0, right: 2, bottom: 1 });
    expect([...ink]).toEqual([0, 150, 255, 255, 255, 255, 255, 255]);
  });

  test("grows by the pixel nearest each centre", () => {
    const ink = new Uint8Array(4).fill(255);
    layOver(
      ink,
      4,
      { gray: Uint8Array.from([0, 200]), width: 2, height: 1 },
      {
        left: 0,
        top: 0,
        right: 4,
        bottom: 1,
      },
    );
    expect([...ink]).toEqual([0, 0, 200, 200]);
  });

  test("lays nothing where the paper has no size", () => {
    const ink = new Uint8Array(4).fill(255);
    layOver(ink, 2, plain(2, 2, 0), { left: 1, top: 0, right: 1, bottom: 2 });
    layOver(ink, 2, plain(2, 2, 0), { left: 0, top: 1, right: 2, bottom: 1 });
    expect([...ink]).toEqual([255, 255, 255, 255]);
  });

  test("leaves the pixels beyond the crop as they are", () => {
    const ink = new Uint8Array(4).fill(255);
    layOver(ink, 2, plain(2, 2, 0), { left: -1, top: -1, right: 1, bottom: 1 });
    expect([...ink]).toEqual([0, 255, 255, 255]);
    expect(tenths(TRACING.width)).toBe(8000);
  });
});
