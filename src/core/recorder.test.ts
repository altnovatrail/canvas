import { describe, expect, test } from "vitest";
import { MIN_STEP, type PointerSample, Recorder } from "./recorder.js";

// The events of a pointer as the element hands them over, in sheet units. A pen by default, with
// pointerId 1; a mouse's pressure is 0.5 while a button is pressed and 0 otherwise.
function sample(over: Partial<PointerSample>): PointerSample {
  return {
    pointerId: 1,
    kind: "pen",
    button: -1,
    buttons: 1,
    x: 0,
    y: 0,
    time: 0,
    pressure: 0.5,
    ...over,
  };
}
const down = (x: number, y: number, time: number, over: Partial<PointerSample> = {}) =>
  sample({ button: 0, buttons: 1, x, y, time, ...over });
const move = (x: number, y: number, time: number, over: Partial<PointerSample> = {}) =>
  sample({ button: -1, buttons: 1, x, y, time, ...over });
const up = (x: number, y: number, time: number, over: Partial<PointerSample> = {}) =>
  sample({ button: 0, buttons: 0, x, y, time, pressure: 0, ...over });

describe("a stroke", () => {
  test("keeps its points in order, with the time since the sheet's first event and the pen's pressure", () => {
    const recorder = new Recorder();
    expect(recorder.down(down(100, 200, 5000, { pressure: 0.3 }))).toBe(true);
    expect(recorder.live?.points).toHaveLength(1);
    expect(recorder.move(move(110, 205, 5008, { pressure: 0.6 }))).toBe(true);
    expect(recorder.move(move(120, 210, 5016, { pressure: 0.7 }))).toBe(true);
    expect(recorder.up(up(121, 211, 5020))).toBe(true);

    expect(recorder.live).toBeUndefined();
    expect(recorder.strokes).toEqual([
      {
        id: 1,
        kind: "pen",
        points: [
          { x: 100, y: 200, t: 0, p: 0.3 },
          { x: 110, y: 205, t: 8, p: 0.6 },
          { x: 120, y: 210, t: 16, p: 0.7 },
          { x: 121, y: 211, t: 20, p: 0.7 },
        ],
      },
    ]);
  });

  test("of a tap is its one place, and a hold keeps the time the pointer left", () => {
    const recorder = new Recorder();
    recorder.down(down(300, 400, 1000));
    recorder.up(up(300, 400, 1300));
    expect(recorder.strokes[0]?.points).toEqual([
      { x: 300, y: 400, t: 0, p: 0.5 },
      { x: 300, y: 400, t: 300, p: 0.5 },
    ]);
  });

  test(`drops points nearer than ${MIN_STEP} to the last one recorded, but always keeps the last`, () => {
    const recorder = new Recorder();
    recorder.down(down(100, 100, 0));
    // Steps of 1/16, exact in binary: every second one is far enough from the last recorded.
    for (let i = 1; i <= 4; i++) recorder.move(move(100 + i / 16, 100, i));
    recorder.up(up(100 + 5 / 16, 100, 5));
    expect(recorder.strokes[0]?.points.map((point) => [point.x, point.t])).toEqual([
      [100, 0],
      [100.125, 2],
      [100.25, 4],
      [100.3125, 5],
    ]);
  });

  test("of a mouse ends with the pressure of the drag, not pointerup's 0", () => {
    const recorder = new Recorder();
    const mouse = { kind: "mouse", pointerId: 1 };
    recorder.down(down(10, 10, 0, mouse));
    recorder.move(move(20, 10, 10, mouse));
    recorder.up(up(20, 10, 20, mouse));
    expect(recorder.strokes[0]?.kind).toBe("mouse");
    expect(recorder.strokes[0]?.points.map((point) => point.p)).toEqual([0.5, 0.5, 0.5]);
  });

  test("ends without pointerup once the primary button is no longer held, where it last was", () => {
    const recorder = new Recorder();
    recorder.down(down(10, 10, 0, { kind: "mouse" }));
    recorder.move(move(20, 10, 10, { kind: "mouse" }));
    // The left button went up beyond the page, and the pointer comes back with no button held.
    expect(recorder.move(move(500, 500, 30, { kind: "mouse", buttons: 0 }))).toBe(true);
    expect(recorder.live).toBeUndefined();
    expect(recorder.strokes[0]?.points.map((point) => [point.x, point.y])).toEqual([
      [10, 10],
      [20, 10],
    ]);
  });

  test("ends where the pointer last was when its capture is lost, even at a point not recorded", () => {
    const recorder = new Recorder();
    recorder.down(down(10, 10, 0));
    recorder.move(move(10.05, 10, 4));
    expect(recorder.end(2)).toBe(false);
    expect(recorder.end(1)).toBe(true);
    expect(recorder.strokes[0]?.points.map((point) => point.x)).toEqual([10, 10.05]);
  });
});

describe("the pointer", () => {
  test("draws with its primary button only: a pen's barrel button and eraser, a mouse's right and middle buttons draw nothing", () => {
    const recorder = new Recorder();
    for (const button of [2, 5, 1]) {
      expect(recorder.down(down(10, 10, 0, { button, buttons: 1 << button }))).toBe(false);
    }
    expect(recorder.live).toBeUndefined();
    expect(recorder.strokes).toEqual([]);
  });

  test("is one: a second pointer writes nothing while a stroke is under way", () => {
    const recorder = new Recorder();
    recorder.down(down(10, 10, 0, { pointerId: 1, kind: "touch" }));
    expect(recorder.down(down(50, 50, 1, { pointerId: 2, kind: "touch" }))).toBe(false);
    expect(recorder.move(move(60, 50, 2, { pointerId: 2, kind: "touch" }))).toBe(false);
    expect(recorder.up(up(60, 50, 3, { pointerId: 2, kind: "touch" }))).toBe(false);
    expect(recorder.pointer).toBe(1);
    recorder.up(up(10, 10, 4, { pointerId: 1, kind: "touch" }));
    expect(recorder.strokes).toHaveLength(1);
    expect(recorder.strokes[0]?.points.every((point) => point.x === 10)).toBe(true);
  });

  test("cancelled drops its stroke, whose ID is not used again", () => {
    const recorder = new Recorder();
    recorder.down(down(10, 10, 0));
    recorder.move(move(20, 10, 5));
    expect(recorder.cancel(2)).toBe(false);
    expect(recorder.cancel(1)).toBe(true);
    expect(recorder.live).toBeUndefined();
    expect(recorder.strokes).toEqual([]);
    recorder.down(down(30, 10, 10));
    recorder.up(up(30, 10, 12));
    expect(recorder.strokes.map((stroke) => stroke.id)).toEqual([2]);
  });
});

describe("the sheet", () => {
  test("numbers its strokes 1, 2, … and counts their time from its first event, never going back", () => {
    const recorder = new Recorder();
    recorder.down(down(10, 10, 2000));
    recorder.move(move(20, 10, 2010));
    // A coalesced event stamped before the last one keeps the time of the last.
    recorder.move(move(30, 10, 2005));
    recorder.up(up(30, 10, 2020));
    recorder.down(down(40, 10, 2500));
    recorder.up(up(40, 10, 2600));
    expect(recorder.strokes.map((stroke) => stroke.id)).toEqual([1, 2]);
    expect(recorder.strokes.flatMap((stroke) => stroke.points.map((point) => point.t))).toEqual([
      0, 10, 10, 20, 500, 600,
    ]);
  });
});
