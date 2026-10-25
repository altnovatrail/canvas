import { expect, test } from "vitest";
import { Clock } from "./clock.js";
import { Recorder } from "./recorder.js";

test("counts from the first moment asked about, and never goes back", () => {
  const clock = new Clock();
  expect(clock.at(5000)).toBe(0);
  expect(clock.at(5012.5)).toBe(12.5);
  // A moment earlier than one asked about before takes that one's time.
  expect(clock.at(5010)).toBe(12.5);
  expect(clock.at(5020)).toBe(20);
});

test("is one clock for the strokes and whatever else asks it", () => {
  const clock = new Clock();
  const recorder = new Recorder(() => {}, clock);
  expect(clock.at(1000)).toBe(0);
  recorder.down({
    pointerId: 1,
    kind: "pen",
    button: 0,
    buttons: 1,
    x: 0,
    y: 0,
    time: 1300,
    pressure: 0.5,
  });
  expect(recorder.live?.points[0]?.t).toBe(300);
});
