import { describe, expect, test } from "vitest";
import { Clock } from "./clock.js";
import { type HistoryEvent, historyOf, replay } from "./history.js";
import type { Stroke } from "./ink.js";
import {
  holds,
  keptOffset,
  rectangleOf,
  SCALE_BOUNDS,
  SCALE_LEAST,
  SELECT_SHARE,
  scaledStroke,
  scaledWidth,
  scaleRange,
  takenBy,
} from "./select.js";
import { REACH } from "./sheet.js";
import { stroke } from "./sheets.fixture.js";
import { nextIdOf, resumeOf, Work } from "./work.js";

// Select: the strokes its shape takes, the offset that keeps them on the sheet, and its move and
// its copy as the history records them, the work replays them and an undo takes them back.

const square = rectangleOf({ x: 0, y: 0 }, { x: 100, y: 100 });

/** A stroke of `n` points along a line from `[x0, y0]` to `[x1, y1]`, the k-th at time k. */
function along(id: number, n: number, [x0, y0]: [number, number], [x1, y1]: [number, number]) {
  return stroke(
    id,
    ...Array.from({ length: n }, (_, k): [number, number, number] => {
      const f = n === 1 ? 0 : k / (n - 1);
      return [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, k];
    }),
  );
}

describe("the strokes a shape takes", () => {
  test("the rectangle goes round from where it began to the pointer, either way", () => {
    expect(rectangleOf({ x: 10, y: 20 }, { x: 5, y: 40 })).toEqual([
      { x: 10, y: 20 },
      { x: 5, y: 20 },
      { x: 5, y: 40 },
      { x: 10, y: 40 },
    ]);
  });

  test("a shape holds a point inside it, even–odd where it crosses itself", () => {
    expect(holds(square, { x: 50, y: 50 })).toBe(true);
    expect(holds(square, { x: 150, y: 50 })).toBe(false);
    // A bow tie: its two halves hold, its crossing's outside does not.
    const bow = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      { x: 100, y: 0 },
      { x: 0, y: 100 },
    ];
    expect(holds(bow, { x: 10, y: 50 })).toBe(true);
    expect(holds(bow, { x: 50, y: 10 })).toBe(false);
  });

  test("takes, in their order, the strokes four points in five of which it holds", () => {
    expect(SELECT_SHARE).toBe(0.8);
    const inside = along(1, 10, [10, 10], [90, 90]);
    // Eight of its ten points inside: taken. Seven: not.
    const strays = along(2, 10, [20, 50], [112, 50]);
    const reaches = along(3, 10, [41, 50], [149, 50]);
    const outside = along(4, 3, [200, 200], [300, 300]);
    const taken = takenBy([outside, strays, reaches, inside], square);
    expect(taken).toEqual([2, 1]);
  });

  test("a shape of fewer than three points, or of no area, takes none", () => {
    const strokes = [along(1, 3, [10, 10], [20, 20])];
    expect(takenBy(strokes, square.slice(0, 2))).toEqual([]);
    expect(takenBy(strokes, rectangleOf({ x: 0, y: 0 }, { x: 0, y: 100 }))).toEqual([]);
  });

  test("an offset is kept so that every point stays on the sheet", () => {
    const box = { minX: 100, minY: 200, maxX: 300, maxY: 400 };
    expect(keptOffset(box, [50, -20], REACH.width, REACH.height)).toEqual([50, -20]);
    expect(keptOffset(box, [-500, -500], REACH.width, REACH.height)).toEqual([-100, -200]);
    expect(keptOffset(box, [20_000, 20_000], REACH.width, REACH.height)).toEqual([
      REACH.width - 300,
      REACH.height - 400,
    ]);
  });
});

const written: HistoryEvent[] = [
  { kind: "write", t: 10, stroke: stroke(1, [100, 100, 0], [140, 100, 10]) },
  { kind: "write", t: 30, stroke: stroke(2, [100, 200, 20], [140, 200, 30]) },
  { kind: "write", t: 50, stroke: stroke(3, [300, 300, 40], [340, 300, 50]) },
];

/** A stroke written before, moved by `[dx, dy]` and numbered `id`. */
function shifted(of: number, id: number, [dx, dy]: [number, number]): Stroke {
  const event = written[of - 1] as HistoryEvent & { kind: "write" };
  const { points } = event.stroke;
  return { ...event.stroke, id, points: points.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy })) };
}

const moved: HistoryEvent = {
  kind: "move",
  t: 60,
  ids: [1, 2],
  strokes: [shifted(1, 4, [20, 30]), shifted(2, 5, [20, 30])],
};
const copied: HistoryEvent = { ...moved, kind: "copy", t: 70, ids: [3], strokes: [] };

describe("Select's events in a history", () => {
  test("a move takes the strokes off and puts them back moved, under new IDs, at the end", () => {
    const history = historyOf([...written, moved]);
    expect(history[3]).toEqual(moved);
    expect(replay(history).map(({ id }) => id)).toEqual([3, 4, 5]);
    expect(nextIdOf(history)).toBe(6);
  });

  test("a copy keeps the strokes and puts copies at the end", () => {
    const copy = { ...copied, strokes: [shifted(3, 4, [0, 60])] };
    const history = historyOf([...written, copy]);
    expect(replay(history).map(({ id }) => id)).toEqual([1, 2, 3, 4]);
    expect(
      replay(history)
        .at(-1)
        ?.points.map(({ y }) => y),
    ).toEqual([360, 360]);
  });

  test("takes no event of nothing, no stroke but the ones moved, by one offset, numbered on", () => {
    const [first, second] = (moved as HistoryEvent & { kind: "move" }).strokes as [Stroke, Stroke];
    const bad = (event: Record<string, unknown>) => () =>
      historyOf([...written, { ...moved, ...event }]);
    expect(bad({ ids: [], strokes: [] })).toThrow(/one stroke at least/);
    expect(bad({ ids: undefined })).toThrow(/ids/);
    expect(bad({ strokes: [first] })).toThrow(/a list of 2 strokes/);
    expect(
      bad({
        strokes: [
          { ...first, id: 5 },
          { ...second, id: 4 },
        ],
      }),
    ).toThrow(/not above 5/);
    expect(bad({ strokes: [{ ...first, id: 3 }, second] })).toThrow(/not above 3/);
    expect(bad({ ids: [1, 9] })).toThrow(/no stroke written before/);
    expect(bad({ strokes: [first, shifted(2, 5, [21, 30])] })).toThrow(/the one offset/);
    expect(bad({ strokes: [first, { ...second, kind: "touch" }] })).toThrow(/as they were/);
    expect(bad({ strokes: [first, shifted(3, 5, [20, 30])] })).toThrow(/the one offset/);
    const late = { ...second, points: second.points.map((p) => ({ ...p, t: p.t + 1 })) };
    expect(bad({ strokes: [first, late] })).toThrow(/the one offset/);
    expect(bad({ t: 25 })).toThrow(/earlier/);
    expect(bad({ on: "tracing" })).toThrow(/on/);
    expect(() => historyOf([...written, { ...moved, on: "sheet" }], true)).toThrow(/on/);
    expect(bad({ strokes: [shifted(1, 4, [0, 20_000]), shifted(2, 5, [0, 20_000])] })).toThrow(/y/);
  });
});

/** The work of the history written, its clock going on from it. */
function restored(paper = false): Work {
  const clock = new Clock();
  const work = Work.restore(written, clock, paper);
  clock.resume(resumeOf(work.history));
  return work;
}

describe("Select's actions on the work", () => {
  test("a move is one action, which an undo takes back whole, and the history it writes replays", () => {
    const work = restored();
    const before = work.strokes;
    expect(work.select("move", [2, 1], [20, 30], 4, 1000)).toBe(true);
    expect(work.strokes.map(({ id }) => id)).toEqual([3, 4, 5]);
    const event = work.history.at(-1);
    if (event?.kind !== "move") throw new Error("no move");
    expect(event.ids).toEqual([1, 2]);
    expect(event.strokes).toEqual([shifted(1, 4, [20, 30]), shifted(2, 5, [20, 30])]);
    expect(Work.restore(work.history, new Clock()).strokes).toEqual(work.strokes);
    expect(work.undo(1100)).toBe(true);
    expect(work.strokes).toBe(before);
    expect(work.history.at(-1)).toEqual({
      kind: "undo",
      t: expect.any(Number),
      removed: [4, 5],
      restored: [1, 2],
    });
    expect(Work.restore(work.history, new Clock()).strokes).toEqual(before);
  });

  test("a copy is one action too: an undo takes the copies off and leaves the strokes", () => {
    const work = restored();
    const before = work.strokes;
    expect(work.select("copy", [3], [0, 60], 4, 1000)).toBe(true);
    expect(work.strokes.map(({ id }) => id)).toEqual([1, 2, 3, 4]);
    expect(work.undo(1100)).toBe(true);
    expect(work.strokes).toBe(before);
    expect(work.history.at(-1)).toMatchObject({ kind: "undo", removed: [4], restored: [] });
    expect(Work.restore(work.history, new Clock()).strokes).toEqual(before);
  });

  test("of nothing, of strokes gone, or of both layers, it is no action", () => {
    const work = restored(true);
    expect(work.select("move", [], [1, 1], 4, 1000)).toBe(false);
    expect(work.select("move", [99], [1, 1], 4, 1000)).toBe(false);
    work.tutor(
      [
        {
          id: 4,
          style: { pen: "liner", color: "#ff3b30", width: 2, opacity: 100 },
          points: [
            { x: 0, y: 0 },
            { x: 5, y: 5 },
          ],
        },
      ],
      [],
      1000,
      "tracing",
    );
    const events = work.history.length;
    expect(work.select("move", [1, 4], [1, 1], 5, 1100)).toBe(false);
    expect(work.history.length).toBe(events);
  });

  test("strokes on the tracing paper move there, and the event says so", () => {
    const work = restored(true);
    work.tutor(
      [
        {
          id: 4,
          style: { pen: "liner", color: "#ff3b30", width: 2, opacity: 100 },
          points: [
            { x: 0, y: 0 },
            { x: 5, y: 5 },
          ],
        },
      ],
      [],
      1000,
      "tracing",
    );
    expect(work.select("copy", [4], [0, 10], 5, 1100)).toBe(true);
    expect(work.onTracing(5)).toBe(true);
    expect(work.history.at(-1)).toHaveProperty("on", "tracing");
    expect(Work.restore(work.history, new Clock(), true).strokes).toEqual(work.strokes);
  });
});

describe("Select's scale", () => {
  const liner = { pen: "liner", color: "#0a63d6", width: 2, opacity: 100 } as const;
  const styled: HistoryEvent[] = [
    ...written,
    {
      kind: "write",
      t: 70,
      stroke: { ...stroke(4, [200, 400, 60], [260, 440, 65]), style: liner },
    },
  ];
  const at: [number, number] = [100, 100];
  /** A stroke written before, scaled from `at` by `factor` and numbered `id`. */
  function scaled(of: number, id: number, factor: number): Stroke {
    const event = styled[of - 1] as HistoryEvent & { kind: "write" };
    return scaledStroke(event.stroke, { factor, at }, id);
  }
  const scale: HistoryEvent = {
    kind: "scale",
    t: 80,
    ids: [1, 4],
    strokes: [scaled(1, 5, 1.5), scaled(4, 6, 1.5)],
    factor: 1.5,
    at,
  };

  test("a stroke scales from its point, its line with it to a tenth, and one of no style keeps none", () => {
    const line = scaled(4, 9, 1.5);
    expect(line.id).toBe(9);
    expect(line.points.map(({ x, y, t, p }) => [x, y, t, p])).toEqual([
      [250, 550, 60, 0.5],
      [340, 610, 65, 0.5],
    ]);
    expect(line.style).toEqual({ ...liner, width: 3 });
    expect(scaled(1, 9, 2).style).toBeUndefined();
    expect(scaledWidth(1.2, 1.37)).toBe(1.6);
    expect(scaledWidth(0.1, 0.25)).toBe(0.1);
    expect(scaledWidth(28, 4)).toBe(50);
  });

  test("its factors are a quarter to four, no smaller than the least size, kept to the sheet", () => {
    const box = { minX: 100, minY: 200, maxX: 300, maxY: 300 };
    expect(scaleRange(box, [100, 200], REACH.width, REACH.height)).toEqual(SCALE_BOUNDS);
    // A box of 40 on its longer side shrinks no further than to the least size.
    const small = { minX: 100, minY: 100, maxX: 140, maxY: 120 };
    expect(scaleRange(small, [100, 100], REACH.width, REACH.height)[0]).toBe(SCALE_LEAST / 40);
    // One already smaller shrinks no more.
    const dot = { minX: 100, minY: 100, maxX: 110, maxY: 105 };
    expect(scaleRange(dot, [100, 100], REACH.width, REACH.height)[0]).toBe(1);
    // From its bottom right, its top left reaches the sheet's corner at twice its size.
    expect(scaleRange(box, [300, 300], REACH.width, REACH.height)[1]).toBe(1.5);
    const edge = { minX: REACH.width - 100, minY: 0, maxX: REACH.width, maxY: 50 };
    expect(scaleRange(edge, [REACH.width - 100, 0], REACH.width, REACH.height)[1]).toBe(1);
  });

  test("its event takes the strokes off and puts them back scaled, under new IDs, at the end", () => {
    const history = historyOf([...styled, scale]);
    expect(history.at(-1)).toEqual(scale);
    expect(replay(history).map(({ id }) => id)).toEqual([2, 3, 5, 6]);
    expect(nextIdOf(history)).toBe(7);
    expect(Object.isFrozen((history.at(-1) as HistoryEvent & { kind: "scale" }).at)).toBe(true);
  });

  test("takes no event of another factor, point or width, nor a factor out of bounds", () => {
    const bad = (event: Record<string, unknown>) => () =>
      historyOf([...styled, { ...scale, ...event }]);
    expect(bad({ factor: 1 })).toThrow(/factor: from 0.25 to 4, and not 1/);
    expect(bad({ factor: 5 })).toThrow(/factor/);
    expect(bad({ factor: "2" })).toThrow(/factor/);
    expect(bad({ at: [100] })).toThrow(/at: a point/);
    expect(bad({ at: undefined })).toThrow(/at: a point/);
    expect(bad({ factor: 2 })).toThrow(/scaled from `at` by `factor`/);
    expect(bad({ at: [0, 0] })).toThrow(/scaled from `at` by `factor`/);
    const thin = { ...scaled(4, 6, 1.5), style: liner };
    expect(bad({ strokes: [scaled(1, 5, 1.5), thin] })).toThrow(/its width scaled/);
    expect(bad({ strokes: [scaled(1, 5, 1.5), shifted(2, 6, [0, 0])] })).toThrow(/as they were/);
    expect(() => historyOf([...styled, { ...scale, on: "tracing" }])).toThrow(/on/);
  });

  test("is one action, which an undo takes back whole and a redo puts back, and its history replays", () => {
    const clock = new Clock();
    const work = Work.restore(styled, clock);
    clock.resume(resumeOf(work.history));
    const before = work.strokes;
    expect(work.scale([4, 1], { factor: 1.5, at }, 5, 1000)).toBe(true);
    expect(work.strokes.map(({ id }) => id)).toEqual([2, 3, 5, 6]);
    expect(work.history.at(-1)).toEqual({ ...scale, t: expect.any(Number) });
    expect(Work.restore(work.history, new Clock()).strokes).toEqual(work.strokes);
    expect(work.undo(1100)).toBe(true);
    expect(work.strokes).toBe(before);
    expect(work.history.at(-1)).toMatchObject({ kind: "undo", removed: [5, 6], restored: [1, 4] });
    expect(work.redo(1200, () => 7)).toBe(true);
    expect(work.history.at(-1)).toMatchObject({ kind: "scale", factor: 1.5, at, ids: [1, 4] });
    expect(Work.restore(work.history, new Clock()).strokes).toEqual(work.strokes);
    expect(work.scale([99], { factor: 2, at }, 9, 1300)).toBe(false);
  });
});
