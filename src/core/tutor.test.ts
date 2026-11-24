import { describe, expect, test } from "vitest";
import { Clock } from "./clock.js";
import { CROP, tokensOf } from "./crop.js";
import { segmentDistance } from "./geometry.js";
import { type HistoryEvent, historyOf, replay, TUTOR_POINTER } from "./history.js";
import type { Stroke } from "./ink.js";
import type { PaperSubmission } from "./marks.js";
import { digestOf } from "./marks.js";
import { stroke } from "./sheets.fixture.js";
import { drawingSubmissionOf, paperWorkForCheck } from "./submission.js";
import { onSheet, rectOf } from "./tracing.js";
import {
  cropStrokesOf,
  drawingContextOf,
  drawingCropOf,
  drawnPart,
  fromCrop,
  lengthOf,
  TUTOR,
  thinned,
  timingsOf,
  toCrop,
  tutorPlanOf,
} from "./tutor.js";
import { nextIdOf, resumeOf, Work } from "./work.js";

// The tutor's act in grown-up mode: the history's event, the work's action and its undo, the
// crop's pixels laid on the sheet and on the tracing paper and back, the strokes the crop shows
// thinned for the drawing, and the times its strokes are drawn at.

const liner = { pen: "liner", color: "#ff3b30", width: 2, opacity: 100 } as const;

/** A stroke of the tutor's, its points at `t` and of no pressure. */
function tutorStroke(id: number, t: number, ...points: [number, number][]): Stroke {
  return {
    id,
    kind: TUTOR_POINTER,
    style: liner,
    points: points.map(([x, y]) => ({ x, y, t, p: 0 })),
  };
}

const written: HistoryEvent[] = [
  { kind: "write", t: 10, stroke: stroke(1, [100, 100, 0], [140, 100, 10]) },
  { kind: "write", t: 30, stroke: stroke(2, [100, 200, 20], [140, 200, 30]) },
];
const acted: HistoryEvent = {
  kind: "tutor",
  t: 40,
  strokes: [tutorStroke(3, 40, [90, 90], [150, 110]), tutorStroke(4, 40, [90, 110], [150, 90])],
  ids: [1],
};

describe("the tutor's event in a history", () => {
  test("is a task from paper's alone, and replays its strokes on and the IDs it takes off", () => {
    const history = historyOf([...written, acted], true);
    expect(history[2]).toEqual(acted);
    expect(Object.isFrozen((history[2] as HistoryEvent & { kind: "tutor" }).strokes[0])).toBe(true);
    expect(replay(history).map(({ id }) => id)).toEqual([2, 3, 4]);
    expect(() => historyOf([...written, acted])).toThrow(/"tutor"/);
    expect(historyOf([...written, { ...acted, on: "tracing" }], true)[2]).toHaveProperty(
      "on",
      "tracing",
    );
  });

  test("takes no stroke that is not the tutor's, numbered on, and no act of nothing", () => {
    const [first, second] = (acted as HistoryEvent & { kind: "tutor" }).strokes as [Stroke, Stroke];
    const bad = (event: Record<string, unknown>) => () =>
      historyOf([...written, { ...acted, ...event }], true);
    expect(bad({ strokes: [{ ...first, kind: "pen" }] })).toThrow(/kind/);
    expect(bad({ strokes: [{ ...first, style: { ...liner, pen: "pen" } }] })).toThrow(/liner/);
    expect(bad({ strokes: [{ ...first, style: { ...liner, opacity: 50 } }] })).toThrow(/liner/);
    expect(bad({ strokes: [{ ...first, style: undefined }] })).toThrow(/liner/);
    expect(bad({ strokes: [tutorStroke(3, 40, [90, 90])] })).toThrow(/two points/);
    expect(bad({ strokes: [tutorStroke(3, 39, [90, 90], [10, 10])] })).toThrow(/time/);
    const pressed = { ...first, points: first.points.map((point) => ({ ...point, p: 0.5 })) };
    expect(bad({ strokes: [pressed] })).toThrow(/pressure/);
    // New IDs, ascending, above every ID before.
    expect(bad({ strokes: [second, first] })).toThrow(/not above 4/);
    expect(bad({ strokes: [tutorStroke(2, 40, [1, 1], [2, 2])] })).toThrow(/not above 2/);
    expect(bad({ strokes: [], ids: [] })).toThrow(/one at least/);
    expect(bad({ on: "sheet" })).toThrow(/on/);
    expect(bad({ strokes: [tutorStroke(3, 40, [90, 90], [10_001, 10])] })).toThrow(/x/);
  });

  test("restores as the work replays it: the IDs it takes off are on the sheet, in its order", () => {
    const clock = new Clock();
    const work = Work.restore([...written, acted], clock, true);
    expect(work.strokes.map(({ id }) => id)).toEqual([2, 3, 4]);
    expect(work.tutored).toBe(true);
    expect(nextIdOf(work.history)).toBe(5);
    expect(resumeOf(work.history)).toBeGreaterThan(40);
    expect(() =>
      Work.restore([...written, { kind: "erase", t: 35, ids: [1] }, acted], clock, true),
    ).toThrow(/history\[3\]/);
    expect(() => Work.restore([...written, { ...acted, ids: [2, 1] }], clock, true)).toThrow(
      /in its order/,
    );
    const both = Work.restore([...written, { ...acted, ids: [1, 2] }], clock, true);
    expect(both.strokes.map(({ id }) => id)).toEqual([3, 4]);
    const tracing = Work.restore([...written, { ...acted, on: "tracing" }], clock, true);
    expect([3, 4].map((id) => tracing.onTracing(id))).toEqual([true, true]);
  });
});

describe("the tutor's act on the work", () => {
  test("is one action, which an undo takes back whole, and the eraser takes its strokes as any", () => {
    const clock = new Clock();
    const work = Work.restore(written, clock, true);
    clock.resume(resumeOf(work.history));
    const before = work.strokes;
    const drafts = [
      {
        id: 3,
        style: liner,
        points: [
          { x: 90, y: 90 },
          { x: 150, y: 110 },
        ],
      },
      {
        id: 4,
        style: liner,
        points: [
          { x: 90, y: 110 },
          { x: 150, y: 90 },
        ],
      },
    ];
    expect(work.tutor(drafts, [2, 1, 99], 1000)).toBe(true);
    expect(work.strokes.map(({ id }) => id)).toEqual([3, 4]);
    const event = work.history.at(-1);
    if (event?.kind !== "tutor") throw new Error("no act of the tutor");
    expect(event.ids).toEqual([1, 2]);
    expect(event.strokes[0]?.kind).toBe(TUTOR_POINTER);
    expect(event.strokes[0]?.points.every(({ t, p }) => t === event.t && p === 0)).toBe(true);
    // The history it wrote is one the sheet takes back.
    expect(Work.restore(work.history, new Clock(), true).strokes).toEqual(work.strokes);
    // The eraser takes a stroke of the tutor's, and an undo brings it back.
    const near = work.near({ x: 120, y: 100 }, { x: 120, y: 100 }, 2);
    expect(near.map(({ id }) => id).sort()).toEqual([3, 4]);
    expect(work.erase([3], 1100)).toBe(true);
    expect(work.undo(1200)).toBe(true);
    expect(work.undo(1300)).toBe(true);
    expect(work.strokes).toBe(before);
    expect(work.history.at(-1)).toEqual({
      kind: "undo",
      t: expect.any(Number),
      removed: [3, 4],
      restored: [1, 2],
    });
    expect(Work.restore(work.history, new Clock(), true).strokes).toEqual(before);
    // An act of nothing is no action.
    expect(work.tutor([], [99], 1400)).toBe(false);
  });

  test("puts its strokes on the tracing paper when it says so", () => {
    const work = Work.restore(written, new Clock(), true);
    work.tutor(
      [
        {
          id: 3,
          style: liner,
          points: [
            { x: 0, y: 0 },
            { x: 5, y: 5 },
          ],
        },
      ],
      [],
      50,
      "tracing",
    );
    expect(work.onTracing(3)).toBe(true);
    expect(work.history.at(-1)).toHaveProperty("on", "tracing");
  });
});

/** A task from paper's work and its context: one stroke on the paper, one on the sheet. */
function paperWork(scale: number): {
  strokes: Stroke[];
  onTracing: (id: number) => boolean;
  submission: PaperSubmission;
} {
  const at = [200, 100] as const;
  const size = { width: 400, height: 300 };
  const tracing = { at, hidden: false, scale };
  const onPaper = stroke(1, [20, 20, 0], [60, 70, 100], [90, 40, 200]);
  const below = stroke(2, [300, 600, 3000], [340, 660, 3100]);
  const onTracing = (id: number) => id === 1;
  const placed = [onSheet(onPaper, at, scale), below];
  const sized = { width: size.width * scale, height: size.height * scale };
  const work = paperWorkForCheck(
    placed,
    { at, scale, onTracing },
    tracing,
    rectOf(at, sized),
    null,
    24,
  );
  if (work === null) throw new Error("no work");
  // Through JSON, as app keeps it.
  return {
    strokes: [onPaper, below],
    onTracing,
    submission: JSON.parse(JSON.stringify(work.submission)) as PaperSubmission,
  };
}

describe("the crop's pixels and the sheet", () => {
  test("a point goes from the crop to the sheet and back where it was", () => {
    const { submission } = paperWork(1);
    const [ymin, xmin] = submission.crop.sheetBox;
    expect(fromCrop({ x: 0, y: 0 }, submission)).toEqual({ x: xmin, y: ymin });
    for (const point of [
      { x: 0, y: 0 },
      { x: 17.25, y: 133.5 },
      { x: submission.crop.width, y: submission.crop.height },
    ]) {
      const back = toCrop(fromCrop(point, submission), submission);
      expect(back.x).toBeCloseTo(point.x, 9);
      expect(back.y).toBeCloseTo(point.y, 9);
    }
  });

  test("the crop's strokes are where the crop drew them, the tracing paper's where the context laid it", () => {
    for (const scale of [1, 1.5]) {
      const { strokes, onTracing, submission } = paperWork(scale);
      const seen = cropStrokesOf(strokes, onTracing, submission);
      expect(seen.map(({ id }) => id)).toEqual([1, 2]);
      const [first] = seen;
      const placed = onSheet(strokes[0] as Stroke, submission.tracing.at, scale);
      const expected = placed.points.flatMap((point) => {
        const { x, y } = toCrop(point, submission);
        return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
      });
      expect(first?.points).toEqual(expected);
      expect(Object.isFrozen(first)).toBe(true);
    }
  });

  test("leaves out a stroke the crop does not reach", () => {
    const { strokes, onTracing, submission } = paperWork(1);
    const far = stroke(9, [5000, 9000, 4000], [5040, 9040, 4100]);
    expect(cropStrokesOf([...strokes, far], onTracing, submission).map(({ id }) => id)).toEqual([
      1, 2,
    ]);
  });

  test("an act on the crop goes on the sheet, or on the tracing paper shown, and back on the crop as it was", () => {
    for (const [scale, hidden] of [
      [1, true],
      [1, false],
      [2, false],
    ] as const) {
      const { strokes, onTracing, submission: shownPaper } = paperWork(scale);
      const submission = { ...shownPaper, tracing: { ...shownPaper.tracing, hidden } };
      const act = {
        strokes: [{ points: [40, 50, 80.5, 90.25, 120, 60], color: "#FF3B30", width: 3 }],
        erase: [2, 2],
      };
      const plan = tutorPlanOf(act, submission, new Set([1, 2]));
      expect(plan.on).toBe(hidden ? undefined : "tracing");
      expect(plan.erase).toEqual([2]);
      const style = plan.strokes[0]?.style;
      expect(style?.color).toBe("#ff3b30");
      expect(style?.pen).toBe("liner");
      // Three px at the crop's scale, in the layer's units to a tenth.
      const across =
        submission.crop.width / (submission.crop.sheetBox[3] - submission.crop.sheetBox[1]);
      expect(style?.width).toBeCloseTo(3 / across / (hidden ? 1 : scale), 1);
      const work = Work.restore([], new Clock(), true);
      for (const each of strokes) work.write(each, onTracing(each.id) ? "tracing" : undefined);
      const drafts = plan.strokes.map((each, k) => ({ id: 10 + k, ...each }));
      work.tutor(drafts, plan.erase, 5000, plan.on);
      const seen = cropStrokesOf(work.strokes, (id) => work.onTracing(id), submission);
      const back = seen.find(({ id }) => id === 10)?.points ?? [];
      expect(back.length).toBe(6);
      for (const [k, value] of act.strokes[0]?.points.entries() ?? []) {
        expect(back[k]).toBeCloseTo(value, 1);
      }
    }
  });

  test("an act with an ID the sheet does not show, a point off the sheet, a bad colour or width is a TypeError", () => {
    const { submission } = paperWork(1);
    const line = { points: [10, 10, 20, 20], color: "#000000", width: 2 };
    const plan = (act: unknown) => () => tutorPlanOf(act, submission, new Set([1, 2]));
    expect(plan({ strokes: [], erase: [3] })).toThrow(/erase\[0\]/);
    expect(plan({ strokes: [{ ...line, points: [-1e6, 10, 20, 20] }], erase: [] })).toThrow(/off/);
    expect(plan({ strokes: [{ ...line, points: [10, 10] }], erase: [] })).toThrow(/two points/);
    expect(plan({ strokes: [{ ...line, points: [10, 10, 20] }], erase: [] })).toThrow(/pairs/);
    expect(plan({ strokes: [{ ...line, color: "red" }], erase: [] })).toThrow(/color/);
    expect(plan({ strokes: [{ ...line, width: 0 }], erase: [] })).toThrow(/width/);
    expect(plan({ strokes: [line] })).toThrow(/erase/);
    expect(plan(null)).toThrow(TypeError);
    // Widths past a style's bounds are kept to them.
    expect(plan({ strokes: [{ ...line, width: 1e-6 }], erase: [] })().strokes[0]?.style.width).toBe(
      0.1,
    );
  });

  test("takes the Check's context back as it reads it, and no sheet's, nor one of other numbers", () => {
    const { submission } = paperWork(1.5);
    const context = drawingContextOf(submission, "submission");
    expect(context.crop).toEqual({
      sheetBox: submission.crop.sheetBox,
      width: submission.crop.width,
      height: submission.crop.height,
    });
    expect(context.tracing).toEqual(submission.tracing);
    const bad = (value: unknown) => () => drawingContextOf(value, "s");
    expect(bad({ ...submission, tracing: undefined })).toThrow(/task from paper/);
    expect(bad({ ...submission, digest: "x" })).toThrow(/digest/);
    expect(bad({ ...submission, groups: undefined })).toThrow(/groups/);
    const crop = (change: Record<string, unknown>) => ({
      ...submission,
      crop: { ...submission.crop, ...change },
    });
    expect(bad(crop({ width: 0 }))).toThrow(/width/);
    expect(bad(crop({ height: CROP.edge + 1 }))).toThrow(/height/);
    expect(bad(crop({ sheetBox: [10, 10, 10, 20] }))).toThrow(/sheetBox/);
    expect(bad(crop({ sheetBox: [0, 0, 1] }))).toThrow(/sheetBox/);
  });

  test("leaves out the tracing paper's strokes of a context whose paper was hidden", () => {
    const { strokes, onTracing, submission } = paperWork(1);
    const hidden = { ...submission, tracing: { ...submission.tracing, hidden: true } };
    expect(cropStrokesOf(strokes, onTracing, hidden).map(({ id }) => id)).toEqual([2]);
  });
});

describe("the drawing's crop", () => {
  test("is the part of the sheet given, at one scale, within 1568 px and the crop's tokens", () => {
    for (const region of [
      { minX: 0, minY: 0, maxX: 1000, maxY: 1400 },
      { minX: 120.04, minY: 2000, maxX: 2120, maxY: 2600 },
      { minX: 0, minY: 0, maxX: 300, maxY: 300 },
      { minX: 9000, minY: 13999, maxX: 10000, maxY: 14000 },
    ]) {
      const crop = drawingCropOf(region);
      expect(Math.max(crop.width, crop.height)).toBeLessThanOrEqual(CROP.edge);
      expect(tokensOf(crop)).toBeLessThanOrEqual(CROP.tokens);
      const [ymin, xmin, ymax, xmax] = crop.sheetBox;
      expect(xmin).toBeCloseTo(region.minX, 1);
      expect(ymin).toBeCloseTo(region.minY, 1);
      // It takes in the whole region, by less than a pixel more.
      const unit = crop.width / (xmax - xmin);
      expect(unit).toBeCloseTo(crop.height / (ymax - ymin), 9);
      expect(xmax).toBeGreaterThanOrEqual(region.maxX - 0.05);
      expect((xmax - region.maxX) * unit).toBeLessThan(1);
      expect(crop.frames).toEqual([]);
      expect(crop.margins).toEqual([0, 0]);
    }
    // A page in sight is drawn tall, its longer edge as long as the tokens let it be.
    const page = drawingCropOf({ minX: 0, minY: 0, maxX: 1000, maxY: 1400 });
    expect(page.height).toBeGreaterThan(page.width);
    expect(page.height).toBeGreaterThan(1200);
  });

  test("its context goes back to the act: a blank sheet's too, an act in its blank part lands where it was put", () => {
    const at = [180, 60] as const;
    const tracing = { at, hidden: false, scale: 1 };
    const paper = { at, scale: 1, onTracing: () => false };
    const crop = drawingCropOf({ minX: 0, minY: 0, maxX: 1000, maxY: 1400 });
    const submission = drawingSubmissionOf([], paper, tracing, crop);
    expect(Object.isFrozen(submission.crop.sheetBox)).toBe(true);
    expect(submission.groups).toEqual([]);
    expect(submission.digest).toBe(digestOf([], crop, [], paper));
    const context = drawingContextOf(JSON.parse(JSON.stringify(submission)), "submission");
    const blank = { x: 500, y: 1200 };
    const { x, y } = toCrop(blank, context);
    const act = { strokes: [{ points: [x, y, x + 50, y], color: "#000000", width: 2 }], erase: [] };
    // Below the tracing paper, shown: on the tracing paper, from its corner.
    const plan = tutorPlanOf(act, context, new Set());
    expect(plan.on).toBe("tracing");
    expect(plan.strokes[0]?.points[0]?.x).toBeCloseTo(blank.x - at[0], 6);
    expect(plan.strokes[0]?.points[0]?.y).toBeCloseTo(blank.y - at[1], 6);
    const sheet = { ...context, tracing: { ...tracing, hidden: true } };
    const onSheetPlan = tutorPlanOf(act, sheet, new Set());
    expect(onSheetPlan.on).toBeUndefined();
    expect(onSheetPlan.strokes[0]?.points[0]?.x).toBeCloseTo(blank.x, 6);
    expect(onSheetPlan.strokes[0]?.points[0]?.y).toBeCloseTo(blank.y, 6);
  });

  test("gives the strokes that reach into it alone", () => {
    const tracing = { at: [180, 60] as const, hidden: false, scale: 1 };
    const crop = drawingCropOf({ minX: 0, minY: 500, maxX: 1000, maxY: 1200 });
    const inSight = stroke(1, [100, 600, 0], [140, 650, 10]);
    const across = stroke(2, [300, 450, 20], [300, 520, 30]);
    const above = stroke(3, [300, 100, 40], [300, 200, 50]);
    const submission = drawingSubmissionOf(
      [],
      { ...tracing, onTracing: () => false },
      tracing,
      crop,
    );
    const seen = cropStrokesOf([inSight, across, above], () => false, submission);
    expect(seen.map(({ id }) => id)).toEqual([1, 2]);
    // The stroke partly out of sight keeps its points above the crop, as negative pixels.
    expect(seen[1]?.points[1]).toBeLessThan(0);
  });
});

describe("thinning for the drawing", () => {
  test("keeps a stroke of 128 points or fewer as it is", () => {
    expect(TUTOR.points).toBe(128);
    const points = Array.from({ length: 128 }, (_, k) => ({ x: k, y: (k * k) % 7 }));
    expect(thinned(points, TUTOR.points)).toEqual(points);
  });

  test("thins a longer one to 128 at most, its ends kept and its shape near", () => {
    // Two turns of a circle, of 5000 points, with a wobble a hand would give it.
    const points = Array.from({ length: 5000 }, (_, k) => {
      const angle = (k / 5000) * 4 * Math.PI;
      const radius = 300 + 0.2 * Math.sin(k);
      return { x: 500 + Math.cos(angle) * radius, y: 500 + Math.sin(angle) * radius };
    });
    const kept = thinned(points, TUTOR.points);
    expect(kept.length).toBeLessThanOrEqual(TUTOR.points);
    expect(kept.length).toBeGreaterThan(50);
    expect(kept[0]).toBe(points[0]);
    expect(kept.at(-1)).toBe(points.at(-1));
    // Every point dropped lies near the line kept.
    const off = Math.max(
      ...points.map((point) =>
        Math.min(
          ...kept.slice(1).map((each, k) => {
            const from = kept[k] ?? each;
            return segmentDistance(point, point, from, each);
          }),
        ),
      ),
    );
    expect(off).toBeLessThan(3);
  });

  test("thins a stroke the crop shows to 128 points", () => {
    const { onTracing, submission } = paperWork(1);
    const long = {
      ...stroke(2, [300, 600, 0]),
      points: Array.from({ length: 3000 }, (_, k) => ({
        x: 300 + 40 * Math.sin(k / 100),
        y: 600 + k / 50,
        t: k,
        p: 0.5,
      })),
    };
    const [seen] = cropStrokesOf([long], onTracing, submission);
    expect((seen?.points.length ?? 0) / 2).toBeLessThanOrEqual(TUTOR.points);
    expect((seen?.points.length ?? 0) / 2).toBeGreaterThan(20);
  });
});

describe("the times of the tutor's strokes", () => {
  test("a few strokes go at a hand's speed, the least time each, a pause between", () => {
    const timings = timingsOf([45, 4.5]);
    expect(timings).toEqual([
      { start: 0, end: 100 },
      { start: 140, end: 140 + TUTOR.least },
    ]);
  });

  test("however many, they end within 3 s, one after another", () => {
    const timings = timingsOf(Array.from({ length: 300 }, () => 200));
    expect(timings.at(-1)?.end).toBeCloseTo(TUTOR.most, 6);
    for (let k = 1; k < timings.length; k++) {
      expect(timings[k]?.start).toBeGreaterThan(timings[k - 1]?.end ?? 0);
    }
  });

  test("the part drawn grows along the stroke's length, whole at its end", () => {
    const line = tutorStroke(5, 0, [0, 0], [10, 0], [10, 10]);
    expect(lengthOf(line.points)).toBe(20);
    expect(drawnPart(line, 1)).toBe(line);
    expect(drawnPart(line, 0.25).points.map(({ x, y }) => [x, y])).toEqual([
      [0, 0],
      [5, 0],
    ]);
    expect(drawnPart(line, 0.75).points.map(({ x, y }) => [x, y])).toEqual([
      [0, 0],
      [10, 0],
      [10, 5],
    ]);
    expect(drawnPart(line, 0).points).toHaveLength(2);
  });
});
