import { describe, expect, test } from "vitest";
import { Clock } from "./clock.js";
import { type HistoryEvent, replay } from "./history.js";
import type { Stroke } from "./ink.js";
import { type PointerSample, Recorder } from "./recorder.js";
import { SHEET } from "./sheet.js";
import { Work } from "./work.js";

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
    }
    // The history is plain data: as JSON it replays to the same sheet.
    const parsed = JSON.parse(JSON.stringify(work.history)) as HistoryEvent[];
    expect(idsOf(replay(parsed))).toEqual(ids(work));
  }
  // All 15,625 sequences take a second and a half here, but up to five on a CI runner, where the
  // browsers of the other projects run beside them: past Vitest's default of five.
}, 30_000);
