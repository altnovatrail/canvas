import { expect, test } from "vitest";
import { begins, type HistoryEvent, replay, sameHistory } from "./history.js";
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

const sheet: HistoryEvent[] = [
  { kind: "write", t: 10, stroke: stroke(1, 0, 10) },
  { kind: "write", t: 30, stroke: stroke(2, 20, 30) },
  { kind: "erase", t: 40, ids: [1] },
  { kind: "undo", t: 50, removed: [], restored: [1] },
];

test("a history the sheet has is the same: the very array, or one that says the same, other fields passed over", () => {
  expect(sameHistory(sheet, sheet)).toBe(true);
  expect(sameHistory(JSON.parse(JSON.stringify(sheet)), sheet)).toBe(true);
  expect(sameHistory([...sheet], sheet)).toBe(true);
  const noted = sheet.map((event) => ({ ...event, note: "the consumer's own" }));
  expect(sameHistory(noted, sheet)).toBe(true);
  // undefined is the empty history.
  expect(sameHistory(undefined, [])).toBe(true);
  expect(sameHistory([], [])).toBe(true);
  expect(sameHistory(undefined, sheet)).toBe(false);
});

/** A copy of the sheet's history through JSON, with one value set at a path of fields. */
function changed(path: readonly (string | number)[], value: unknown): unknown {
  const copy: unknown = JSON.parse(JSON.stringify(sheet));
  let at = copy as Record<string | number, unknown>;
  for (const key of path.slice(0, -1)) at = at[key] as Record<string | number, unknown>;
  at[path.at(-1) ?? ""] = value;
  return copy;
}

test("a history that says anything else is another, and a value that is none is never the same", () => {
  const others: unknown[] = [
    sheet.slice(0, -1),
    [...sheet, sheet[0]],
    changed([1, "t"], 31),
    changed([0, "stroke", "points", 1, "x"], 1.5),
    changed([0, "stroke", "points", 0, "p"], 0.6),
    changed([0, "stroke", "kind"], "mouse"),
    changed([2, "ids"], [2]),
    changed([3, "restored"], []),
    changed([3, "kind"], "erase"),
    null,
    {},
    "history",
    [null, null, null, null],
    [1, 2, 3, 4],
  ];
  for (const other of others) expect(sameHistory(other, sheet), JSON.stringify(other)).toBe(false);
  // A getter that throws is no history the sheet keeps, and no error either.
  const thrown = JSON.parse(JSON.stringify(sheet));
  Object.defineProperty(thrown[0], "t", {
    get() {
      throw new Error("a getter of the consumer's");
    },
  });
  expect(sameHistory(thrown, sheet)).toBe(false);
});

test("a history begins another when it is shorter and the same event for event", () => {
  expect(begins(sheet.slice(0, 2), sheet)).toBe(true);
  expect(begins([], sheet)).toBe(true);
  expect(begins(sheet, sheet)).toBe(false);
  expect(begins([sheet[1] as HistoryEvent], sheet)).toBe(false);
});
