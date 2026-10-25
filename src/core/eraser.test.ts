import { describe, expect, test } from "vitest";
import { Clock } from "./clock.js";
import { ERASER_BUTTON, Eraser } from "./eraser.js";
import type { Stroke } from "./ink.js";
import type { PointerSample } from "./recorder.js";
import { Work } from "./work.js";

/** A level line, down the sheet at x = 100 × id, from y = 100 to y = 300. */
function stroke(id: number): Stroke {
  return {
    id,
    kind: "mouse",
    points: [
      { x: 100 * id, y: 100, t: id, p: 0.5 },
      { x: 100 * id, y: 300, t: id + 1, p: 0.5 },
    ],
  };
}

/** A sheet with the strokes 1 to 4 on it, its clock at 0 at the page's 1000, and its eraser. */
function sheet() {
  const clock = new Clock();
  clock.at(1000);
  const work = new Work(clock);
  for (const id of [1, 2, 3, 4]) work.write(stroke(id));
  const landed: { ids: readonly number[]; time: number }[] = [];
  const eraser = new Eraser(
    (from, to, reach) => work.near(from, to, reach),
    (ids, time) => {
      landed.push({ ids, time });
      work.erase(ids, time);
    },
  );
  return { work, eraser, landed };
}

const ids = (work: Work) => work.strokes.map((each) => each.id);

// The events of a pointer as the element hands them over, in sheet units: a mouse, pointerId 1.
function sample(over: Partial<PointerSample>): PointerSample {
  return {
    pointerId: 1,
    kind: "mouse",
    button: -1,
    buttons: 1,
    x: 0,
    y: 200,
    time: 1000,
    pressure: 0.5,
    ...over,
  };
}
const down = (x: number, time: number, over: Partial<PointerSample> = {}) =>
  sample({ button: 0, buttons: 1, x, time, ...over });
const move = (x: number, time: number, over: Partial<PointerSample> = {}) =>
  sample({ button: -1, buttons: 1, x, time, ...over });
const up = (x: number, time: number, over: Partial<PointerSample> = {}) =>
  sample({ button: 0, buttons: 0, x, time, ...over });

/** How near a stroke the eraser takes it, in sheet units. */
const REACH = 10;

describe("a press", () => {
  test("of a tap takes the stroke under it, when it lifts", () => {
    const { work, eraser, landed } = sheet();
    expect(eraser.down(down(205, 1010), REACH)).toBe(true);
    expect([...eraser.pending]).toEqual([2]);
    // Still on the sheet until the eraser lifts.
    expect(ids(work)).toEqual([1, 2, 3, 4]);
    expect(eraser.up(up(205, 1020))).toBe(true);
    expect(landed).toEqual([{ ids: [2], time: 1020 }]);
    expect(ids(work)).toEqual([1, 3, 4]);
    expect(work.history.at(-1)).toEqual({ kind: "erase", t: 20, ids: [2] });
    expect(eraser.pointer).toBeUndefined();
    expect([...eraser.pending]).toEqual([]);
  });

  test("along a path takes every stroke it comes near, in one erasing that one undo takes back", () => {
    const { work, eraser, landed } = sheet();
    eraser.down(down(50, 1010), REACH);
    // Right across strokes 3, 2 and 1, from beyond 3 back to before 1, in two moves.
    eraser.move(move(350, 1020));
    expect([...eraser.pending]).toEqual([1, 2, 3]);
    eraser.move(move(330, 1030));
    eraser.up(up(330, 1040));
    expect(landed).toEqual([{ ids: [1, 2, 3], time: 1040 }]);
    expect(ids(work)).toEqual([4]);
    expect(work.history.at(-1)).toEqual({ kind: "erase", t: 40, ids: [1, 2, 3] });
    work.undo(1050);
    expect(ids(work)).toEqual([1, 2, 3, 4]);
  });

  test("goes by the way between its samples, not only by the samples", () => {
    const { eraser } = sheet();
    eraser.down(down(150, 1010), REACH);
    // From 150 to 250: no sample comes near stroke 2 at 200, but the way between does.
    expect(eraser.move(move(250, 1020))).toBe(true);
    expect([...eraser.pending]).toEqual([2]);
  });

  test("takes nothing out of sight, and goes on from its last place in sight when it comes back", () => {
    const { eraser, landed } = sheet();
    eraser.down(down(150, 1010), REACH);
    // Beyond the part of the sheet on the screen, across strokes 2 and 3: nothing is taken.
    expect(eraser.move(move(350, 1020), false)).toBe(false);
    expect([...eraser.pending]).toEqual([]);
    // Back in sight: the way goes from 150, where it was last in sight, across stroke 1 only.
    expect(eraser.move(move(50, 1030))).toBe(true);
    expect([...eraser.pending]).toEqual([1]);
    // Lifted out of sight: the way there takes nothing more.
    eraser.up(up(450, 1040), false);
    expect(landed).toEqual([{ ids: [1], time: 1040 }]);
  });

  test("that comes near nothing is no action", () => {
    const { work, eraser, landed } = sheet();
    eraser.down(down(150, 1010), REACH);
    expect(eraser.move(move(160, 1020))).toBe(false);
    expect(eraser.up(up(160, 1030))).toBe(true);
    expect(landed).toEqual([]);
    expect(work.history).toHaveLength(4);
  });

  test("that the device cancels erases nothing", () => {
    const { work, eraser, landed } = sheet();
    eraser.down(down(195, 1010), REACH);
    expect(eraser.cancel(2)).toBe(false);
    expect(eraser.cancel(1)).toBe(true);
    expect([...eraser.pending]).toEqual([]);
    expect(eraser.up(up(195, 1020))).toBe(false);
    expect(landed).toEqual([]);
    expect(ids(work)).toEqual([1, 2, 3, 4]);
  });

  test("ends where it was when it moves without its button held, or when it is ended", () => {
    const { eraser, landed } = sheet();
    eraser.down(down(100, 1010), REACH);
    eraser.move(move(120, 1020));
    // The button came up out of sight: the move that tells of it takes nothing more.
    expect(eraser.move(move(300, 1030, { buttons: 0 }))).toBe(true);
    expect(landed).toEqual([{ ids: [1], time: 1020 }]);

    eraser.down(down(395, 1040), REACH);
    expect(eraser.end(2)).toBe(false);
    expect(eraser.end()).toBe(true);
    expect(landed.at(-1)).toEqual({ ids: [4], time: 1040 });
  });

  test("lets a stroke taken off the sheet meanwhile be: only what is still on it goes", () => {
    const { work, eraser, landed } = sheet();
    eraser.down(down(250, 1010), REACH);
    eraser.move(move(450, 1020));
    expect([...eraser.pending]).toEqual([3, 4]);
    // An undo while the eraser is down takes stroke 4's writing back.
    work.undo(1025);
    eraser.up(up(450, 1030));
    expect(landed.at(-1)?.ids).toEqual([3, 4]);
    expect(ids(work)).toEqual([1, 2]);
    expect(work.history.at(-1)).toEqual({ kind: "erase", t: 30, ids: [3] });
  });
});

describe("the buttons", () => {
  test("a pen's eraser erases, its other end and other buttons do not", () => {
    const { eraser, landed } = sheet();
    const pen = { kind: "pen" };
    // The pen's barrel button, and a mouse's right button: button 2.
    expect(eraser.down(down(200, 1010, { ...pen, button: 2, buttons: 2 }), REACH)).toBe(false);
    expect(eraser.down(down(200, 1010, { button: 2, buttons: 2 }), REACH)).toBe(false);
    // Button 5 is a pen's eraser: no other pointer has it.
    expect(eraser.down(down(200, 1010, { button: ERASER_BUTTON, buttons: 32 }), REACH)).toBe(false);
    expect(
      eraser.down(down(200, 1010, { ...pen, button: ERASER_BUTTON, buttons: 32 }), REACH),
    ).toBe(true);
    // The eraser's bit holds the press: the primary button's alone would end it.
    expect(eraser.move(move(300, 1020, { ...pen, buttons: 32 }))).toBe(true);
    expect(eraser.move(move(320, 1030, { ...pen, buttons: 1 }))).toBe(true);
    expect(landed).toEqual([{ ids: [2, 3], time: 1020 }]);
  });

  test("a second pointer neither starts a press nor moves the one under way", () => {
    const { eraser } = sheet();
    eraser.down(down(150, 1010), REACH);
    expect(eraser.down(down(300, 1015, { pointerId: 2 }), REACH)).toBe(false);
    expect(eraser.move(move(300, 1020, { pointerId: 2 }))).toBe(false);
    expect(eraser.up(up(300, 1025, { pointerId: 2 }))).toBe(false);
    expect(eraser.pointer).toBe(1);
    expect([...eraser.pending]).toEqual([]);
  });
});
