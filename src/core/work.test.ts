import { describe, expect, test } from "vitest";
import { Clock } from "./clock.js";
import { type HistoryEvent, replay } from "./history.js";
import type { Stroke } from "./ink.js";
import { type PointerSample, Recorder } from "./recorder.js";
import { SHEET } from "./sheet.js";
import { nextIdOf, resumeOf, Work } from "./work.js";

/** A stroke of one point, named by its ID, 50 units right of the one before: a query near it finds it alone. */
function stroke(id: number): Stroke {
  return { id, kind: "mouse", points: [{ x: 50 * id, y: 50, t: id, p: 0.5 }] };
}

const ids = (work: Work) => work.strokes.map((each) => each.id);
const idsOf = (strokes: readonly Stroke[]) => strokes.map((each) => each.id);
/** Every stroke on the sheet, by a segment across it with a reach wider than it. */
const everything = (work: Work) =>
  work.near({ x: 0, y: 0 }, { x: SHEET.width, y: SHEET.height }, SHEET.height);

describe("undo", () => {
  test("takes back the last stroke written, and on a sheet without actions changes nothing", () => {
    const work = new Work();
    expect(work.undo(0)).toBe(false);
    expect(ids(work)).toEqual([]);
    work.write(stroke(1));
    work.write(stroke(2));
    expect(work.undo(10)).toBe(true);
    expect(ids(work)).toEqual([1]);
    expect(work.undo(20)).toBe(true);
    expect(work.undo(30)).toBe(false);
    expect(ids(work)).toEqual([]);
  });

  test("says whether it has an action to take back, till every one is taken back", () => {
    const work = new Work();
    expect(work.undoable).toBe(false);
    work.write(stroke(1));
    expect(work.undoable).toBe(true);
    work.undo(10);
    expect(work.undoable).toBe(false);
    // Clearing an empty sheet is no action; an erasing and a clearing are.
    expect(work.clear(20)).toBe(false);
    expect(work.undoable).toBe(false);
    work.write(stroke(2));
    work.erase([2], 30);
    work.undo(40);
    expect(work.undoable).toBe(true);
    work.clear(50);
    work.undo(60);
    work.undo(70);
    expect(work.undoable).toBe(false);
    // A history given to the sheet leaves the stack its actions build.
    const written: HistoryEvent = {
      kind: "write",
      t: 0,
      stroke: { id: 1, kind: "pen", points: [{ x: 10, y: 10, t: 0, p: 0.5 }] },
    };
    const undone: HistoryEvent = { kind: "undo", t: 5, removed: [1], restored: [] };
    const clock = new Clock();
    expect(Work.restore([written], clock).undoable).toBe(true);
    expect(Work.restore([written, undone], clock).undoable).toBe(false);
    expect(Work.restore([], clock).undoable).toBe(false);
  });
});

describe("clear", () => {
  test("takes every stroke away, and undo brings them all back, in their order", () => {
    const work = new Work();
    work.write(stroke(1));
    work.write(stroke(2));
    const before = work.strokes;
    expect(work.clear(10)).toBe(true);
    expect(ids(work)).toEqual([]);
    expect(work.undo(20)).toBe(true);
    expect(work.strokes).toBe(before);
    expect(ids(work)).toEqual([1, 2]);
  });

  test("is undone after the strokes written since", () => {
    const work = new Work();
    work.write(stroke(1));
    work.clear(10);
    work.write(stroke(2));
    expect(ids(work)).toEqual([2]);
    work.undo(20);
    expect(ids(work)).toEqual([]);
    work.undo(30);
    expect(ids(work)).toEqual([1]);
    work.undo(40);
    expect(ids(work)).toEqual([]);
  });

  test("of an empty sheet is no action", () => {
    const work = new Work();
    expect(work.clear(0)).toBe(false);
    work.write(stroke(1));
    work.clear(10);
    expect(work.clear(20)).toBe(false);
    // One undo takes back the one clearing, and the next the stroke.
    work.undo(30);
    expect(ids(work)).toEqual([1]);
    work.undo(40);
    expect(ids(work)).toEqual([]);
    expect(work.undo(50)).toBe(false);
  });
});

describe("erase", () => {
  test("takes the strokes off whole, in one action, and undo puts them back in their places", () => {
    const work = new Work();
    for (const id of [1, 2, 3, 4]) work.write(stroke(id));
    expect(work.erase([3, 1], 10)).toBe(true);
    expect(ids(work)).toEqual([2, 4]);
    expect(work.undo(20)).toBe(true);
    expect(ids(work)).toEqual([1, 2, 3, 4]);
    // The writing before the erasing is the next undo's.
    work.undo(30);
    expect(ids(work)).toEqual([1, 2, 3]);
  });

  test("of strokes no longer on the sheet is no action, no event, and leaves the clock alone", () => {
    const clock = new Clock();
    const work = new Work(clock);
    expect(work.erase([1], 500)).toBe(false);
    expect(work.undo(600)).toBe(false);
    expect(work.clear(700)).toBe(false);
    expect(work.history).toEqual([]);
    // The clock has not started: the first moment asked about is still the sheet's 0.
    expect(clock.at(1000)).toBe(0);
    work.write(stroke(1));
    work.erase([1], 1100);
    expect(work.erase([1], 1200)).toBe(false);
    expect(work.history).toHaveLength(2);
  });

  test("takes only the strokes still on the sheet", () => {
    const work = new Work();
    work.write(stroke(1));
    work.write(stroke(2));
    work.undo(10);
    expect(work.erase([2, 1], 20)).toBe(true);
    expect(ids(work)).toEqual([]);
    expect(work.history.at(-1)).toEqual({ kind: "erase", t: 10, ids: [1] });
  });
});

describe("the history of writing", () => {
  test("says what every action did, at the sheet's time, in the order the actions landed", () => {
    const clock = new Clock();
    // The sheet's 0 is the page's 1000; the strokes' points are at 1, 2 and 3.
    clock.at(1000);
    const work = new Work(clock);
    const one = stroke(1);
    const two = stroke(2);
    const three = stroke(3);
    work.write(one);
    work.write(two);
    work.write(three);
    work.erase([3, 1], 1010);
    work.undo(1020);
    work.clear(1030);
    work.undo(1040);
    work.undo(1050);
    expect(work.history).toEqual<HistoryEvent[]>([
      { kind: "write", t: 1, stroke: one },
      { kind: "write", t: 2, stroke: two },
      { kind: "write", t: 3, stroke: three },
      { kind: "erase", t: 10, ids: [1, 3] },
      { kind: "undo", t: 20, removed: [], restored: [1, 3] },
      { kind: "clear", t: 30, ids: [1, 2, 3] },
      { kind: "undo", t: 40, removed: [], restored: [1, 2, 3] },
      { kind: "undo", t: 50, removed: [3], restored: [] },
    ]);
    expect(idsOf(replay(work.history))).toEqual(ids(work));
  });

  test("is a new array after every action, and the same one between them", () => {
    const work = new Work();
    const empty = work.history;
    expect(work.undo(0)).toBe(false);
    expect(work.history).toBe(empty);
    work.write(stroke(1));
    const written = work.history;
    expect(written).not.toBe(empty);
    expect(empty).toEqual([]);
    expect(work.history).toBe(written);
  });

  test("puts an undo or a clearing during a stroke before the stroke, its points' times earlier", () => {
    const clock = new Clock();
    const work = new Work(clock);
    const recorder = new Recorder((finished) => work.write(finished), clock);
    recorder.down(sample({ button: 0, buttons: 1, x: 10, time: 1000 }));
    recorder.up(sample({ button: 0, buttons: 0, x: 20, time: 1010 }));
    recorder.down(sample({ button: 0, buttons: 1, x: 30, time: 1100 }));
    work.undo(1150);
    work.clear(1160);
    recorder.up(sample({ button: 0, buttons: 0, x: 40, time: 1200 }));
    const kinds = work.history.map((event) => event.kind);
    expect(kinds).toEqual(["write", "undo", "write"]);
    // The clearing found the sheet empty, and the stroke under way landed after the undo.
    expect(work.history.map((event) => event.t)).toEqual([10, 150, 200]);
    const last = work.history.at(-1);
    expect(last?.kind === "write" ? last.stroke.points[0]?.t : undefined).toBe(100);
  });

  test("lands a stroke that ends without its pointerup no earlier than an action that landed while it was under way", () => {
    const clock = new Clock();
    const work = new Work(clock);
    const recorder = new Recorder((finished) => work.write(finished), clock);
    recorder.down(sample({ button: 0, buttons: 1, x: 10, time: 1000 }));
    recorder.up(sample({ button: 0, buttons: 0, x: 20, time: 1010 }));
    recorder.down(sample({ button: 0, buttons: 1, x: 30, time: 1100 }));
    recorder.move(sample({ button: -1, buttons: 1, x: 40, time: 1110 }));
    work.undo(1150);
    // The pointer's capture is lost: the stroke ends where and when the pointer last was.
    recorder.end();
    const last = work.history.at(-1);
    expect(last?.kind === "write" ? last.stroke.points.at(-1)?.t : undefined).toBe(110);
    expect(work.history.map((event) => event.t)).toEqual([10, 150, 150]);
  });
});

describe("near", () => {
  // A stroke like an L: down from (100, 100) to (100, 300), then right to (300, 300).
  const ell: Stroke = {
    id: 1,
    kind: "pen",
    points: [
      { x: 100, y: 100, t: 0, p: 0.5 },
      { x: 100, y: 300, t: 10, p: 0.5 },
      { x: 300, y: 300, t: 20, p: 0.5 },
    ],
  };

  test("takes a stroke whose line comes within the reach, and not one just beyond", () => {
    const work = new Work();
    work.write(ell);
    expect(idsOf(work.near({ x: 105, y: 200 }, { x: 105, y: 200 }, 5))).toEqual([1]);
    expect(idsOf(work.near({ x: 105.01, y: 200 }, { x: 105.01, y: 200 }, 5))).toEqual([]);
    // A segment that crosses the line takes it, however small the reach.
    expect(idsOf(work.near({ x: 50, y: 250 }, { x: 150, y: 250 }, 0.1))).toEqual([1]);
  });

  test("goes by the line, not by the box around the stroke", () => {
    const work = new Work();
    work.write(ell);
    // Inside the box, in the corner the L leaves empty.
    expect(idsOf(work.near({ x: 250, y: 150 }, { x: 280, y: 120 }, 10))).toEqual([]);
  });

  test("takes a stroke of one point by that point", () => {
    const work = new Work();
    work.write(stroke(2));
    expect(idsOf(work.near({ x: 100, y: 57 }, { x: 100, y: 57 }, 7))).toEqual([2]);
    expect(idsOf(work.near({ x: 100, y: 58 }, { x: 100, y: 58 }, 7))).toEqual([]);
  });

  test("finds what is on the sheet after every action, and nothing else", () => {
    const work = new Work();
    for (const id of [1, 2, 3]) work.write(stroke(id));
    expect(idsOf(everything(work)).sort()).toEqual([1, 2, 3]);
    work.erase([2], 10);
    expect(idsOf(everything(work)).sort()).toEqual([1, 3]);
    work.clear(20);
    expect(everything(work)).toEqual([]);
    work.undo(30);
    work.undo(40);
    expect(idsOf(everything(work)).sort()).toEqual([1, 2, 3]);
  });
});

// The events of a pointer as the element hands them over, in sheet units: a mouse, pointerId 1.
function sample(over: Partial<PointerSample>): PointerSample {
  return {
    pointerId: 1,
    kind: "mouse",
    button: -1,
    buttons: 1,
    x: 0,
    y: 10,
    time: 0,
    pressure: 0.5,
    ...over,
  };
}

describe("with the recorder", () => {
  // The recorder hands its finished strokes over to the work, as the element has it.
  function sheet() {
    const clock = new Clock();
    const work = new Work(clock);
    const recorder = new Recorder((finished) => work.write(finished), clock);
    return { work, recorder };
  }
  const down = (x: number, time: number) => sample({ button: 0, buttons: 1, x, time });
  const up = (x: number, time: number) => sample({ button: 0, buttons: 0, x, time });
  const written = (recorder: Recorder, x: number, time: number) => {
    recorder.down(down(x, time));
    recorder.up(up(x + 10, time + 5));
  };

  test("clearing leaves a stroke under way alone, and it lands on the sheet when it ends", () => {
    const { work, recorder } = sheet();
    written(recorder, 10, 0);
    recorder.down(down(50, 100));
    expect(work.clear(105)).toBe(true);
    expect(ids(work)).toEqual([]);
    recorder.up(up(60, 110));
    expect(ids(work)).toEqual([2]);
    work.undo(120);
    expect(ids(work)).toEqual([]);
    work.undo(130);
    expect(ids(work)).toEqual([1]);
  });

  test("undo leaves a stroke under way alone, and it lands after the strokes left", () => {
    const { work, recorder } = sheet();
    written(recorder, 10, 0);
    written(recorder, 30, 20);
    recorder.down(down(50, 100));
    expect(work.undo(105)).toBe(true);
    expect(ids(work)).toEqual([1]);
    recorder.up(up(60, 110));
    expect(ids(work)).toEqual([1, 3]);
  });

  test("a stroke taken back keeps its ID: the next one gets a new one", () => {
    const { work, recorder } = sheet();
    written(recorder, 10, 0);
    work.undo(10);
    written(recorder, 30, 20);
    expect(ids(work)).toEqual([2]);
  });
});

test("every sequence of six writes, erasings, clears and undos agrees with a stack of snapshots, and its history replays to the sheet", () => {
  const steps = ["write", "erase every second", "erase the last", "clear", "undo"] as const;
  for (let sequence = 0; sequence < steps.length ** 6; sequence++) {
    const clock = new Clock();
    const work = new Work(clock);
    const recorder = new Recorder((finished) => work.write(finished), clock);
    // The sheet after each action still in force, the latest last.
    const snapshots: number[][] = [[]];
    let written = 0;
    let code = sequence;
    for (let i = 0; i < 6; i++) {
      const step = steps[code % steps.length];
      code = Math.floor(code / steps.length);
      const now = snapshots[snapshots.length - 1] ?? [];
      const before = work.history.length;
      // The page's time of the step: 10 ms after the one before.
      const time = 10 * i;
      let next: number[] | undefined;
      let undone = false;
      if (step === "write") {
        written++;
        // Each stroke 50 units right of the one before, so that none comes near another.
        recorder.down(sample({ button: 0, buttons: 1, x: 50 * written, time }));
        recorder.up(sample({ button: 0, buttons: 0, x: 50 * written, time: time + 5 }));
        next = [...now, written];
      } else if (step === "erase every second") {
        const erased = now.filter((_, at) => at % 2 === 0);
        expect(work.erase(erased, time)).toBe(erased.length > 0);
        if (erased.length > 0) next = now.filter((_, at) => at % 2 === 1);
      } else if (step === "erase the last") {
        expect(work.erase(now.slice(-1), time)).toBe(now.length > 0);
        if (now.length > 0) next = now.slice(0, -1);
      } else if (step === "clear") {
        expect(work.clear(time)).toBe(now.length > 0);
        if (now.length > 0) next = [];
      } else {
        undone = snapshots.length > 1;
        expect(work.undo(time)).toBe(undone);
        if (undone) {
          snapshots.pop();
          const back = snapshots[snapshots.length - 1] ?? [];
          // The undo says what it took off and what it brought back.
          expect(work.history.at(-1)).toMatchObject({
            kind: "undo",
            removed: now.filter((id) => !back.includes(id)),
            restored: back.filter((id) => !now.includes(id)),
          });
        }
      }
      if (next !== undefined) snapshots.push(next);
      // An action that changed the sheet is one event, and one that changed nothing is none.
      expect(work.history.length).toBe(before + (next !== undefined || undone ? 1 : 0));

      const sheet = snapshots[snapshots.length - 1];
      expect(ids(work)).toEqual(sheet);
      expect(idsOf(replay(work.history))).toEqual(sheet);
      expect(idsOf(everything(work)).sort((a, b) => a - b)).toEqual(
        [...(sheet ?? [])].sort((a, b) => a - b),
      );
      const times = work.history.map((event) => event.t);
      expect(times).toEqual([...times].sort((a, b) => a - b));
      // Given back through JSON, the history is the same sheet and the same history.
      const back = Work.restore(JSON.parse(JSON.stringify(work.history)), new Clock());
      expect(back.strokes).toEqual(work.strokes);
      expect(back.history).toEqual(work.history);
    }
    // The history is plain data: as JSON it replays to the same sheet.
    const parsed = JSON.parse(JSON.stringify(work.history)) as HistoryEvent[];
    expect(idsOf(replay(parsed))).toEqual(ids(work));
    // And it rebuilds the stack: every undo after it takes back what the sheet's own would. The
    // two clocks count from other moments, so the times of these undos are left aside.
    const restored = Work.restore(parsed, new Clock());
    const untimed = (history: readonly HistoryEvent[]) =>
      history.map((event) => ({ ...event, t: 0 }));
    for (let k = 0; ; k++) {
      const time = 1000 + 10 * k;
      const undone = work.undo(time);
      expect(restored.undo(time)).toBe(undone);
      expect(restored.strokes).toEqual(work.strokes);
      expect(untimed(restored.history)).toEqual(untimed(work.history));
      if (!undone) break;
    }
  }
  // All 15,625 sequences, each history given back at every step, take three and a half seconds
  // here, and more on a CI runner, where the browsers of the other projects run beside them: past
  // Vitest's default of five.
}, 30_000);

describe("a history given to the sheet", () => {
  /** A sheet of three strokes, one erased and back, cleared and back, the last undone. */
  function written() {
    const clock = new Clock();
    const work = new Work(clock);
    const recorder = new Recorder((finished) => work.write(finished), clock);
    for (const [n, x] of [100, 300, 500].entries()) {
      recorder.down(sample({ button: 0, buttons: 1, x, time: 100 * n }));
      recorder.move(sample({ button: -1, buttons: 1, x: x + 20, time: 100 * n + 10 }));
      recorder.up(sample({ button: 0, buttons: 0, x: x + 40, time: 100 * n + 20 }));
    }
    work.erase([2], 400);
    work.undo(410);
    work.clear(420);
    work.undo(430);
    work.undo(440);
    return work;
  }

  test("gives back the strokes, the stack and the history, in objects of the sheet's own", () => {
    const work = written();
    const given = JSON.parse(JSON.stringify(work.history)) as HistoryEvent[];
    const restored = Work.restore(given, new Clock());
    expect(restored.strokes).toEqual(work.strokes);
    expect(restored.history).toEqual(work.history);
    // The given value is neither the sheet's, nor frozen, nor changed.
    expect(restored.history[0]).not.toBe(given[0]);
    expect(Object.isFrozen(given[0])).toBe(false);
    expect(given).toEqual(JSON.parse(JSON.stringify(work.history)));
    // Fields the sheet does not keep are passed over.
    const more = given.map((event) => ({ ...event, note: "kept by the consumer" }));
    expect(Work.restore(more, new Clock()).history).toEqual(work.history);
    // The eraser finds the strokes restored: the index is the sheet's.
    expect(idsOf(everything(restored)).sort()).toEqual([1, 2]);
    // Undo goes on where the history left off: 3's writing was the last taken back, 2's is next.
    expect(restored.undo(1000)).toBe(true);
    expect(restored.history.at(-1)).toMatchObject({ kind: "undo", removed: [2], restored: [] });
    expect(ids(restored)).toEqual([1]);
  });

  test("is frozen through, the history the sheet writes too", () => {
    for (const work of [written(), Work.restore(written().history, new Clock())]) {
      const { history } = work;
      expect(Object.isFrozen(history)).toBe(true);
      for (const event of history) {
        expect(Object.isFrozen(event)).toBe(true);
        if (event.kind === "write") {
          expect(Object.isFrozen(event.stroke)).toBe(true);
          expect(Object.isFrozen(event.stroke.points)).toBe(true);
          expect(event.stroke.points.every((point) => Object.isFrozen(point))).toBe(true);
        } else if (event.kind === "undo") {
          expect([Object.isFrozen(event.removed), Object.isFrozen(event.restored)]).toEqual([
            true,
            true,
          ]);
        } else {
          expect(Object.isFrozen(event.ids)).toBe(true);
        }
      }
    }
  });

  test("an empty one is a new sheet, and the clock goes on after the last event by more than the groups' pause", () => {
    expect(Work.restore([], new Clock()).strokes).toEqual([]);
    expect(resumeOf([])).toBe(0);
    const history = written().history;
    expect(resumeOf(history)).toBe((history.at(-1)?.t ?? 0) + 2001);
    expect(nextIdOf([])).toBe(1);
    expect(nextIdOf(history)).toBe(4);
  });

  test("that the sheet could not have written is a TypeError that names the field", () => {
    const one = (id: number, t = 10): HistoryEvent => ({
      kind: "write",
      t,
      stroke: { id, kind: "mouse", points: [{ x: 50 * id, y: 50, t, p: 0.5 }] },
    });
    const point = { x: 10, y: 10, t: 0, p: 0.5 };
    const write = (stroke: unknown, t: unknown = 10) => ({ kind: "write", t, stroke });
    const stroke = (points: unknown, id: unknown = 1, kind: unknown = "mouse") => ({
      id,
      kind,
      points,
    });
    // A list with a hole where its one item would be, as [ , ] writes it.
    const hole = (): unknown[] => {
      const list: unknown[] = [];
      list.length = 1;
      return list;
    };
    const cases: [unknown, RegExp][] = [
      [{}, /^history: a list of events/],
      [hole(), /^history\[0\]: an object/],
      [[write(stroke(hole()))], /^history\[0\]\.stroke\.points\[0\]: an object/],
      [[one(1), { kind: "erase", t: 20, ids: hole() }], /^history\[1\]\.ids\[0\]:/],
      [
        [write(stroke([point], Number.MAX_SAFE_INTEGER))],
        /^history\[0\]\.stroke\.id: a stroke's ID, a whole number from 1 below 2\^53 − 1/,
      ],
      [null, /^history: a list of events/],
      [[null], /^history\[0\]: an object/],
      [[{ kind: "draw", t: 0 }], /^history\[0\]\.kind: "write", "erase", "clear" or "undo"/],
      [[write(stroke([point]), Number.NaN)], /^history\[0\]\.t: .*not NaN$/],
      [[write(stroke([point]), -1)], /^history\[0\]\.t: .*from 0, not -1$/],
      [[one(1, 20), one(2, 10)], /^history\[1\]\.t: 10, earlier than the event before it, at 20$/],
      [
        [write(stroke([{ ...point, t: 30 }]), 20)],
        /^history\[0\]\.t: 20, earlier than the stroke's last point, at 30$/,
      ],
      [[write(stroke([]))], /^history\[0\]\.stroke\.points: .*one at least/],
      [[write(stroke("dots"))], /^history\[0\]\.stroke\.points: a list of points/],
      [
        [write(stroke([{ ...point, x: 1000.5 }]))],
        /^history\[0\]\.stroke\.points\[0\]\.x: a number from 0 to 1000/,
      ],
      [
        [write(stroke([{ ...point, y: -0.1 }]))],
        /^history\[0\]\.stroke\.points\[0\]\.y: a number from 0 to 1400/,
      ],
      [
        [write(stroke([{ ...point, p: 1.5 }]))],
        /^history\[0\]\.stroke\.points\[0\]\.p: a number from 0 to 1/,
      ],
      [
        [
          write(
            stroke([
              { ...point, t: 5 },
              { ...point, t: 4 },
            ]),
          ),
        ],
        /^history\[0\]\.stroke\.points\[1\]\.t: 4, earlier than the point before it, at 5$/,
      ],
      [
        [write(stroke([point], 1.5))],
        /^history\[0\]\.stroke\.id: a stroke's ID, a whole number from 1/,
      ],
      [[write(stroke([point], 0))], /^history\[0\]\.stroke\.id:/],
      [[write(stroke([point], 1, 5))], /^history\[0\]\.stroke\.kind: the pointer's type/],
      [[one(1), one(1, 20)], /^history\[1\]\.stroke\.id: 1, the ID of a stroke written before$/],
      [[one(1), { kind: "erase", t: 20, ids: ["1"] }], /^history\[1\]\.ids\[0\]:/],
      [
        [one(1), { kind: "erase", t: 20, ids: [9] }],
        /^history\[1\]: strokes \[9\] erased, but none of them is on the sheet$/,
      ],
      [[one(1), { kind: "erase", t: 20, ids: [] }], /^history\[1\]: strokes \[\] erased, but none/],
      [
        [one(1), one(2), { kind: "erase", t: 20, ids: [2, 1] }],
        /^history\[2\]: strokes \[2,1\] erased, where the sheet takes off \[1,2\], in its order$/,
      ],
      [
        [one(1), one(2), { kind: "erase", t: 20, ids: [1, 1] }],
        /^history\[2\]: .* where the sheet takes off \[1\]/,
      ],
      [
        [one(1), { kind: "erase", t: 20, ids: [1, 9] }],
        /^history\[1\]: .* where the sheet takes off \[1\]/,
      ],
      [
        [{ kind: "clear", t: 0, ids: [] }],
        /^history\[0\]: strokes \[\] cleared, but the sheet is empty$/,
      ],
      [
        [one(1), one(2), { kind: "clear", t: 20, ids: [1] }],
        /^history\[2\]: strokes \[1\] cleared, where the sheet clears \[1,2\]$/,
      ],
      [
        [{ kind: "undo", t: 0, removed: [], restored: [] }],
        /^history\[0\]: an undo .* but there is nothing to take back$/,
      ],
      [
        [one(1), { kind: "undo", t: 20, removed: [], restored: [1] }],
        /^history\[1\]: an undo that takes off \[\] and brings back \[1\], where the last action still in force takes off \[1\] and brings back \[\]$/,
      ],
      [
        [one(1), { kind: "undo", t: 20, removed: 1, restored: [] }],
        /^history\[1\]\.removed: a list of stroke IDs/,
      ],
    ];
    for (const [value, message] of cases) {
      expect(() => Work.restore(value, new Clock()), String(message)).toThrow(TypeError);
      expect(() => Work.restore(value, new Clock()), String(message)).toThrow(message);
    }
    // Times checked for their order alone: a write later than its last point, and strokes that
    // overlap in time, as several pointers at once would write them (T35).
    const overlapping: HistoryEvent[] = [
      {
        kind: "write",
        t: 50,
        stroke: {
          id: 2,
          kind: "touch",
          points: [
            { ...point, t: 0 },
            { ...point, t: 40 },
          ],
        },
      },
      {
        kind: "write",
        t: 60,
        stroke: {
          id: 1,
          kind: "touch",
          points: [
            { ...point, t: 10 },
            { ...point, t: 30 },
          ],
        },
      },
    ];
    expect(Work.restore(overlapping, new Clock()).strokes.map((each) => each.id)).toEqual([2, 1]);
  });
});
