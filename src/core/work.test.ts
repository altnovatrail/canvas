import { describe, expect, test } from "vitest";
import type { Stroke } from "./ink.js";
import { type PointerSample, Recorder } from "./recorder.js";
import { Work } from "./work.js";

/** A stroke of one point, named by its ID. */
function stroke(id: number): Stroke {
  return { id, kind: "mouse", points: [{ x: id, y: id, t: id, p: 0.5 }] };
}

const ids = (work: Work) => work.strokes.map((each) => each.id);

describe("undo", () => {
  test("takes back the last stroke written, and on a sheet without actions changes nothing", () => {
    const work = new Work();
    expect(work.undo()).toBe(false);
    expect(ids(work)).toEqual([]);
    work.write(stroke(1));
    work.write(stroke(2));
    expect(work.undo()).toBe(true);
    expect(ids(work)).toEqual([1]);
    expect(work.undo()).toBe(true);
    expect(work.undo()).toBe(false);
    expect(ids(work)).toEqual([]);
  });
});

describe("clear", () => {
  test("takes every stroke away, and undo brings them all back, in their order", () => {
    const work = new Work();
    work.write(stroke(1));
    work.write(stroke(2));
    const before = work.strokes;
    expect(work.clear()).toBe(true);
    expect(ids(work)).toEqual([]);
    expect(work.undo()).toBe(true);
    expect(work.strokes).toBe(before);
    expect(ids(work)).toEqual([1, 2]);
  });

  test("is undone after the strokes written since", () => {
    const work = new Work();
    work.write(stroke(1));
    work.clear();
    work.write(stroke(2));
    expect(ids(work)).toEqual([2]);
    work.undo();
    expect(ids(work)).toEqual([]);
    work.undo();
    expect(ids(work)).toEqual([1]);
    work.undo();
    expect(ids(work)).toEqual([]);
  });

  test("of an empty sheet is no action", () => {
    const work = new Work();
    expect(work.clear()).toBe(false);
    work.write(stroke(1));
    work.clear();
    expect(work.clear()).toBe(false);
    // One undo takes back the one clearing, and the next the stroke.
    work.undo();
    expect(ids(work)).toEqual([1]);
    work.undo();
    expect(ids(work)).toEqual([]);
    expect(work.undo()).toBe(false);
  });
});

test("every sequence of six writes, clears and undos agrees with a stack of snapshots", () => {
  const steps = ["write", "clear", "undo"] as const;
  for (let sequence = 0; sequence < steps.length ** 6; sequence++) {
    const work = new Work();
    // The sheet after each action still in force, the latest last.
    const snapshots: number[][] = [[]];
    let nextId = 1;
    let code = sequence;
    for (let i = 0; i < 6; i++) {
      const step = steps[code % steps.length];
      code = Math.floor(code / steps.length);
      const now = snapshots[snapshots.length - 1] ?? [];
      if (step === "write") {
        work.write(stroke(nextId));
        snapshots.push([...now, nextId]);
        nextId++;
      } else if (step === "clear") {
        expect(work.clear()).toBe(now.length > 0);
        if (now.length > 0) snapshots.push([]);
      } else {
        expect(work.undo()).toBe(snapshots.length > 1);
        if (snapshots.length > 1) snapshots.pop();
      }
      expect(ids(work)).toEqual(snapshots[snapshots.length - 1]);
    }
  }
});

describe("with the recorder", () => {
  // The recorder hands its finished strokes over to the work, as the element has it.
  function sheet() {
    const work = new Work();
    const recorder = new Recorder((finished) => work.write(finished));
    return { work, recorder };
  }
  const sample = (over: Partial<PointerSample>): PointerSample => ({
    pointerId: 1,
    kind: "mouse",
    button: -1,
    buttons: 1,
    x: 0,
    y: 0,
    time: 0,
    pressure: 0.5,
    ...over,
  });
  const down = (x: number, time: number) => sample({ button: 0, buttons: 1, x, y: 10, time });
  const up = (x: number, time: number) => sample({ button: 0, buttons: 0, x, y: 10, time });
  const written = (recorder: Recorder, x: number, time: number) => {
    recorder.down(down(x, time));
    recorder.up(up(x + 10, time + 5));
  };

  test("clearing leaves a stroke under way alone, and it lands on the sheet when it ends", () => {
    const { work, recorder } = sheet();
    written(recorder, 10, 0);
    recorder.down(down(50, 100));
    expect(work.clear()).toBe(true);
    expect(ids(work)).toEqual([]);
    recorder.up(up(60, 110));
    expect(ids(work)).toEqual([2]);
    work.undo();
    expect(ids(work)).toEqual([]);
    work.undo();
    expect(ids(work)).toEqual([1]);
  });

  test("undo leaves a stroke under way alone, and it lands after the strokes left", () => {
    const { work, recorder } = sheet();
    written(recorder, 10, 0);
    written(recorder, 30, 20);
    recorder.down(down(50, 100));
    expect(work.undo()).toBe(true);
    expect(ids(work)).toEqual([1]);
    recorder.up(up(60, 110));
    expect(ids(work)).toEqual([1, 3]);
  });

  test("a stroke taken back keeps its ID: the next one gets a new one", () => {
    const { work, recorder } = sheet();
    written(recorder, 10, 0);
    work.undo();
    written(recorder, 30, 20);
    expect(ids(work)).toEqual([2]);
  });
});
