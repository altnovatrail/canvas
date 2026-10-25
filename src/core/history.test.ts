import { expect, test } from "vitest";
import { type HistoryEvent, replay } from "./history.js";
import type { Stroke } from "./ink.js";

function stroke(id: number, ...times: number[]): Stroke {
  return { id, kind: "pen", points: times.map((t) => ({ x: id, y: id, t, p: 0.5 })) };
}

test("replay leaves on the sheet what the events put there and did not take off, in the order written", () => {
  const history: HistoryEvent[] = [
    { kind: "write", t: 10, stroke: stroke(1, 0, 10) },
    { kind: "write", t: 30, stroke: stroke(2, 20, 30) },
    { kind: "write", t: 50, stroke: stroke(3, 40, 50) },
    { kind: "erase", t: 60, ids: [1, 3] },
    { kind: "undo", t: 70, removed: [], restored: [1, 3] },
    { kind: "undo", t: 80, removed: [3], restored: [] },
  ];
  expect(replay(history).map((each) => each.id)).toEqual([1, 2]);
  expect(replay(history.slice(0, 4)).map((each) => each.id)).toEqual([2]);
  expect(replay([...history, { kind: "clear", t: 90, ids: [1, 2] }])).toEqual([]);
  expect(replay([])).toEqual([]);
});
