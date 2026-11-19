import { describe, expect, test } from "vitest";
import { Clock } from "./clock.js";
import { cropOf } from "./crop.js";
import { tenths } from "./geometry.js";
import { groupsOf } from "./groups.js";
import { historyOf } from "./history.js";
import { digestOf, marksOf, placesOf } from "./marks.js";
import { rasterOf } from "./raster.js";
import { stroke } from "./sheets.fixture.js";
import { paperWorkForCheck } from "./submission.js";
import {
  grayOf,
  keptOn,
  LARGEST,
  layOver,
  onSheet,
  onTracing,
  rectOf,
  sizeOf,
  TRACING,
  TRACING_START,
  tenthsOf,
  toTracing,
  tracingStateOf,
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

  test("is kept wholly on the sheet by the grip and the keys", () => {
    const size = { width: 400, height: 100 };
    expect(keptOn([-50, -10], size)).toEqual([0, 0]);
    expect(keptOn([900, 1390], size)).toEqual([600, 1300]);
    expect(keptOn([300, 500], size)).toEqual([300, 500]);
  });

  test("takes a state that leaves it in part on the sheet, and no other", () => {
    const size = { width: 400, height: 100 };
    const state = tracingStateOf({ at: [-399, 1399], hidden: true, more: 1 }, size);
    expect(state).toEqual({ at: [-399, 1399], hidden: true });
    expect(Object.isFrozen(state) && Object.isFrozen(state.at)).toBe(true);
    for (const at of [
      [-400, 0],
      [1000, 0],
      [0, 1400],
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

  test("holds a point by its corner, kept to it, and puts its strokes back on the sheet", () => {
    const size = { width: 400, height: 100 };
    expect(onTracing({ x: 300, y: 150 }, [200, 100], size)).toBe(true);
    expect(onTracing({ x: 199, y: 150 }, [200, 100], size)).toBe(false);
    expect(toTracing({ x: 250, y: 260 }, [200, 100], size)).toEqual({ x: 50, y: 100 });
    const moved = onSheet(stroke(3, [10, 20, 5], [990, 30, 9]), [100, 50]);
    expect(moved.points.map(({ x, y }) => [x, y])).toEqual([
      [110, 70],
      [1000, 80],
    ]);
    expect(moved.id).toBe(3);
    expect(Object.isFrozen(moved.points[0])).toBe(true);
    expect(tenthsOf(rectOf([-10, 1350], size))).toEqual({
      minX: 0,
      minY: 13500,
      maxX: 3900,
      maxY: 14000,
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

  test("leaves the pixels beyond the crop as they are", () => {
    const ink = new Uint8Array(4).fill(255);
    layOver(ink, 2, plain(2, 2, 0), { left: -1, top: -1, right: 1, bottom: 1 });
    expect([...ink]).toEqual([0, 255, 255, 255]);
    expect(tenths(TRACING.width)).toBe(8000);
  });
});
