import { describe, expect, test } from "vitest";
import { Clock } from "./clock.js";
import { type HistoryEvent, replay } from "./history.js";
import type { Stroke } from "./ink.js";
import { nextIdOf, Work } from "./work.js";

/** A level line in liner at y = 10 × id, from x 0 to 40, its points 10 apart, written at `t`. */
function level(id: number, t = id): Stroke {
  return {
    id,
    kind: "touch",
    style: { pen: "liner", color: "#0a63d6", width: 2, opacity: 100 },
    points: [0, 10, 20, 30, 40].map((x) => ({ x, y: 10 * id, t, p: 0.5 })),
  };
}

/** A sheet of the lines given, its clock at 0 at the page's 1000, and how it numbers new strokes. */
function sheet(lines: readonly number[], paper = false) {
  const clock = new Clock();
  clock.at(1000);
  const work = new Work(clock);
  for (const id of lines) work.write(level(id));
  let next = Math.max(0, ...lines) + 1;
  const reserve = (count: number) => {
    const first = next;
    next += count;
    return first;
  };
  /** The history the work wrote, as a sheet takes it back: it holds the same strokes. */
  const replays = () => {
    const again = Work.restore(work.history, new Clock(), paper);
    expect(again.strokes).toEqual(work.strokes);
    expect(replay(work.history)).toEqual(work.strokes);
    expect(nextIdOf(work.history)).toBeLessThanOrEqual(next);
  };
  return { work, reserve, replays };
}

const ids = (work: Work) => work.strokes.map(({ id }) => id);
const last = (work: Work): HistoryEvent | undefined => work.history.at(-1);

describe("redo", () => {
  test("writes again what undo took back, the last first, each a new stroke under a new ID", () => {
    const { work, reserve, replays } = sheet([1, 2]);
    expect(work.redoable).toBe(false);
    expect(work.redo(1010, reserve)).toBe(false);
    work.undo(1020);
    work.undo(1030);
    expect(work.redoable).toBe(true);
    expect(work.redo(1040, reserve)).toBe(true);
    expect(last(work)).toEqual({ kind: "write", t: 40, stroke: { ...level(1), id: 3 } });
    expect(work.redo(1050, reserve)).toBe(true);
    expect(ids(work)).toEqual([3, 4]);
    expect(work.strokes.map(({ points }) => points)).toEqual([level(1).points, level(2).points]);
    expect(work.redoable).toBe(false);
    expect(work.redo(1060, reserve)).toBe(false);
    // A redo is an action as any other: an undo takes it back, and a redo does it again.
    work.undo(1070);
    expect(work.redo(1080, reserve)).toBe(true);
    expect(ids(work)).toEqual([3, 5]);
    replays();
  });

  test("leaves nothing to redo after any other action", () => {
    const { work, reserve } = sheet([1, 2]);
    work.undo(1010);
    work.write(level(3));
    expect(work.redoable).toBe(false);
    expect(work.redo(1020, reserve)).toBe(false);
    work.undo(1030);
    work.erase([1], 1040);
    expect(work.redoable).toBe(false);
  });

  test("erases again the strokes a redo wrote anew, by their new IDs", () => {
    const { work, reserve, replays } = sheet([1, 2]);
    work.erase([1], 1010);
    for (const t of [1020, 1030, 1040]) work.undo(t);
    expect(ids(work)).toEqual([]);
    for (const t of [1050, 1060, 1070]) work.redo(t, reserve);
    expect(ids(work)).toEqual([4]);
    expect(last(work)).toEqual({ kind: "erase", t: 70, ids: [3] });
    replays();
  });

  test("clears the sheet again", () => {
    const { work, reserve, replays } = sheet([1, 2]);
    work.clear(1010);
    work.undo(1020);
    expect(work.redo(1030, reserve)).toBe(true);
    expect(ids(work)).toEqual([]);
    expect(last(work)).toEqual({ kind: "clear", t: 30, ids: [1, 2] });
    replays();
  });

  test("cuts again, its pieces new strokes, and a piece of the tracing paper's stroke the paper's", () => {
    const { work, reserve, replays } = sheet([1, 2], true);
    work.write(
      { ...level(3), points: level(3).points.map((point) => ({ ...point, t: 5 })) },
      "tracing",
    );
    const [, two, three] = work.strokes as [Stroke, Stroke, Stroke];
    const piece = (of: Stroke, id: number, from: number, to: number): Stroke => ({
      ...of,
      id,
      points: of.points.slice(from, to),
    });
    const pieces = [piece(two, 4, 0, 2), piece(three, 5, 3, 5)];
    work.cut(
      [
        { id: 2, pieces: [pieces[0] as Stroke] },
        { id: 3, pieces: [pieces[1] as Stroke] },
      ],
      1010,
    );
    // The IDs written by hand above, which the sheet numbers on from.
    reserve(3);
    work.undo(1020);
    expect(work.redo(1030, reserve)).toBe(true);
    expect(ids(work)).toEqual([1, 6, 7]);
    expect(last(work)).toEqual({
      kind: "cut",
      t: 30,
      ids: [2, 3],
      pieces: [
        { of: 2, stroke: { ...pieces[0], id: 6 } },
        { of: 3, stroke: { ...pieces[1], id: 7 } },
      ],
    });
    expect(work.onTracing(7)).toBe(true);
    expect(work.onTracing(6)).toBe(false);
    expect(work.cutFrom(7)).toEqual([3]);
    replays();
  });

  test("moves and copies again, the new strokes above every ID before", () => {
    const { work, reserve, replays } = sheet([1, 2]);
    work.select("move", [1], [20, 30], reserve(1), 1010);
    work.select("copy", [2], [0, 60], reserve(1), 1020);
    expect(ids(work)).toEqual([2, 3, 4]);
    work.undo(1030);
    work.undo(1040);
    expect(ids(work)).toEqual([1, 2]);
    work.redo(1050, reserve);
    work.redo(1060, reserve);
    expect(ids(work)).toEqual([2, 5, 6]);
    expect(last(work)).toMatchObject({ kind: "copy", ids: [2] });
    expect(work.strokes.map(({ points }) => points[0])).toEqual([
      level(2).points[0],
      { ...level(1).points[0], x: 20, y: 40 },
      { ...level(2).points[0], y: 80 },
    ]);
    replays();
  });

  test("puts the tutor's act again, its strokes at the redo's time", () => {
    const { work, reserve, replays } = sheet([1, 2], true);
    const style = { pen: "liner", color: "#0a63d6", width: 2, opacity: 100 } as const;
    const drafts = [
      {
        id: reserve(1),
        style,
        points: [
          { x: 90, y: 90 },
          { x: 150, y: 110 },
        ],
      },
    ];
    work.tutor(drafts, [1], 1010);
    work.undo(1020);
    expect(work.redo(1030, reserve)).toBe(true);
    expect(ids(work)).toEqual([2, 4]);
    const event = last(work);
    if (event?.kind !== "tutor") throw new Error("no act of the tutor");
    expect(event.t).toBe(30);
    expect(event.ids).toEqual([1]);
    expect(event.strokes[0]?.points.every(({ t, p }) => t === 30 && p === 0)).toBe(true);
    replays();
  });

  test("a history given to the sheet leaves to redo what the undos at its end took back", () => {
    const { work } = sheet([1, 2]);
    work.undo(1010);
    work.undo(1020);
    const clock = new Clock();
    const again = Work.restore(work.history, clock);
    expect(again.redoable).toBe(true);
    const first = nextIdOf(again.history);
    expect(again.redo(1030, () => first)).toBe(true);
    expect(again.strokes.map(({ points }) => points)).toEqual([level(1).points]);
    // An action after the undos leaves nothing to redo.
    work.write(level(3));
    expect(Work.restore(work.history, new Clock()).redoable).toBe(false);
  });
});
