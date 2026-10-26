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

test("resumes at a time it is told: the next moment is that time, and it counts on from there", () => {
  const clock = new Clock();
  clock.at(1000);
  clock.at(1500);
  // A history given to the sheet left off at 9000 ms of the sheet's time.
  clock.resume(9000);
  expect(clock.latest).toBe(9000);
  expect(clock.at(2000)).toBe(9000);
  expect(clock.at(2012.5)).toBe(9012.5);
  // It never goes back after it resumed, either.
  expect(clock.at(2010)).toBe(9012.5);
});

test("resumes earlier than it was, for the sheet's time is its history's, and at 0 as a new sheet's", () => {
  const clock = new Clock();
  clock.at(0);
  clock.at(20_000);
  clock.resume(300);
  expect(clock.at(50_000)).toBe(300);
  clock.resume(0);
  expect(clock.latest).toBe(0);
  expect(clock.at(70_000)).toBe(0);
  expect(clock.at(70_250)).toBe(250);
});
