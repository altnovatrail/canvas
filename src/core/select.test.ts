import { describe, expect, test } from "vitest";
import { Clock } from "./clock.js";
import { type HistoryEvent, historyOf, replay } from "./history.js";
import type { Stroke } from "./ink.js";
import { holds, keptOffset, rectangleOf, SELECT_SHARE, takenBy } from "./select.js";
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
