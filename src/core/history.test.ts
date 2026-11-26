import { describe, expect, test } from "vitest";
import { begins, type HistoryEvent, historyOf, replay, sameHistory, writtenBy } from "./history.js";
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

test("writtenBy gives the strokes each event puts on the sheet with IDs of their own, and none for the rest", () => {
  const history: HistoryEvent[] = [
    { kind: "write", t: 10, stroke: stroke(1, 0, 10) },
    { kind: "cut", t: 20, ids: [1], pieces: [{ of: 1, stroke: stroke(2, 0, 5) }] },
    { kind: "move", t: 30, ids: [2], strokes: [stroke(3, 0, 5)] },
    { kind: "copy", t: 40, ids: [3], strokes: [stroke(4, 0, 5)] },
    { kind: "erase", t: 50, ids: [4] },
    { kind: "clear", t: 60, ids: [3] },
    { kind: "undo", t: 70, removed: [], restored: [3] },
  ];
  expect(history.map((event) => writtenBy(event).map(({ id }) => id))).toEqual([
    [1],
    [2],
    [3],
    [4],
    [],
    [],
    [],
  ]);
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

describe("a cut", () => {
  const liner = { pen: "liner", color: "#0a63d6", width: 2, opacity: 100 } as const;
  // A level line in liner, x 0 to 40 at y 10, its points 10 apart and 10 ms apart.
  const line: Stroke = {
    id: 1,
    kind: "touch",
    style: liner,
    points: [0, 10, 20, 30, 40].map((x) => ({ x, y: 10, t: x, p: 0.5 })),
  };
  const at = (x: number) => ({ x, y: 10, t: x, p: 0.5 });
  const piece = (id: number, ...xs: number[]): Stroke => ({ ...line, id, points: xs.map(at) });
  // The eraser over x 15 to 25 leaves the line's start, to 15, and its end, from 25.
  const cut: HistoryEvent = {
    kind: "cut",
    t: 100,
    ids: [1],
    pieces: [
      { of: 1, stroke: piece(2, 0, 10, 15) },
      { of: 1, stroke: piece(3, 25, 30, 40) },
    ],
  };
  const history: HistoryEvent[] = [{ kind: "write", t: 40, stroke: line }, cut];

  test("is read with its pieces, their pointer and style, frozen through", () => {
    const [, read] = historyOf(JSON.parse(JSON.stringify(history)));
    expect(read).toEqual(cut);
    if (read?.kind !== "cut") throw new Error("no cut");
    const [first] = read.pieces;
    for (const frozen of [read, read.ids, read.pieces, first, first?.stroke, first?.stroke.style]) {
      expect(Object.isFrozen(frozen)).toBe(true);
    }
    expect(Object.isFrozen(first?.stroke.points[0])).toBe(true);
    // A stroke without a style stays without one.
    const [plain] = historyOf([
      { kind: "write", t: 0, stroke: { ...stroke(1, 0), style: undefined } },
    ]);
    expect(plain?.kind === "write" && "style" in plain.stroke).toBe(false);
  });

  test("leaves its pieces where the stroke it cut stood, and an undo puts the stroke back", () => {
    const sheet: HistoryEvent[] = [
      { kind: "write", t: 0, stroke: stroke(9, 0) },
      ...history,
      { kind: "write", t: 110, stroke: stroke(4, 110) },
    ];
    // The line's pieces stand where it stood: after the stroke written before it, before the one after.
    expect(replay(sheet).map(({ id }) => id)).toEqual([9, 2, 3, 4]);
    // A piece cut again: its own pieces stand where it stood.
    const again: HistoryEvent = {
      kind: "cut",
      t: 120,
      ids: [2],
      pieces: [{ of: 2, stroke: piece(5, 0, 5) }],
    };
    expect(replay([...sheet, again]).map(({ id }) => id)).toEqual([9, 5, 3, 4]);
    const undone: HistoryEvent = { kind: "undo", t: 130, removed: [2, 3], restored: [1] };
    expect(replay([...sheet, undone]).map(({ id }) => id)).toEqual([9, 1, 4]);
  });

  test("is the same by its IDs and its pieces, their strokes' styles too", () => {
    expect(sameHistory(JSON.parse(JSON.stringify(history)), history)).toBe(true);
    // A copy of the history through JSON, with one value set at a path of fields.
    const changedAt = (path: readonly (string | number)[], value: unknown): unknown => {
      const copy: unknown = JSON.parse(JSON.stringify(history));
      let at = copy as Record<string | number, unknown>;
      for (const key of path.slice(0, -1)) at = at[key] as Record<string | number, unknown>;
      at[path.at(-1) ?? ""] = value;
      return copy;
    };
    const others: [readonly (string | number)[], unknown][] = [
      [[1, "ids"], [2]],
      [[1, "pieces"], [cut.kind === "cut" ? cut.pieces[0] : null]],
      [[1, "pieces"], "pieces"],
      [[1, "pieces", 0], null],
      [[1, "pieces", 0, "of"], 2],
      [[1, "pieces", 0, "stroke", "style", "width"], 3],
      [[1, "pieces", 0, "stroke", "style"], null],
      [[1, "pieces", 0, "stroke", "style"], undefined],
      [[0, "stroke", "style", "color"], "#000000"],
    ];
    for (const [path, value] of others) {
      expect(sameHistory(changedAt(path, value), history), path.join(".")).toBe(false);
    }
    // A style where the stroke has none is another stroke too.
    const plain: HistoryEvent[] = [{ kind: "write", t: 0, stroke: stroke(1, 0) }];
    const styled = [{ ...plain[0], stroke: { ...stroke(1, 0), style: liner } }];
    expect(sameHistory(styled, plain)).toBe(false);
  });

  test("that the sheet could not have written is a TypeError that names the field", () => {
    const written = { kind: "write", t: 40, stroke: line };
    const with_ = (over: Record<string, unknown>) => [written, { ...cut, ...over }];
    const pieced = (...pieces: unknown[]) => with_({ pieces });
    const of1 = (stroke: unknown) => ({ of: 1, stroke });
    const cases: [unknown, RegExp][] = [
      [with_({ ids: [] }), /^history\[1\]\.ids: a list of stroke IDs, one at least/],
      [with_({ ids: "1" }), /^history\[1\]\.ids: a list of stroke IDs/],
      [with_({ ids: [1, 1] }), /^history\[1\]\.ids\[1\]: 1, named twice$/],
      [with_({ ids: [1, 7] }), /^history\[1\]\.ids\[1\]: 7, no stroke written before$/],
      [with_({ pieces: {} }), /^history\[1\]\.pieces: a list of pieces/],
      [pieced(null), /^history\[1\]\.pieces\[0\]: an object/],
      [pieced({ of: 0, stroke: piece(2, 0, 15) }), /^history\[1\]\.pieces\[0\]\.of: a stroke's ID/],
      [
        pieced({ of: 7, stroke: piece(2, 0, 15) }),
        /^history\[1\]\.pieces\[0\]\.of: 7, none of the strokes the cut takes off$/,
      ],
      [
        pieced(of1(piece(1, 0, 15))),
        /^history\[1\]\.pieces\[0\]\.stroke\.id: 1, the ID of a stroke written before$/,
      ],
      [
        pieced(of1(piece(2, 0, 15)), of1(piece(2, 25, 40))),
        /^history\[1\]\.pieces\[1\]\.stroke\.id: 2, the ID of a stroke written before$/,
      ],
      [
        pieced(of1({ ...piece(2, 0, 15), kind: "pen" })),
        /^history\[1\]\.pieces\[0\]\.stroke\.kind: "touch", the pointer of the stroke 1/,
      ],
      [
        pieced(of1({ ...piece(2, 0, 15), style: { ...liner, opacity: 50 } })),
        /^history\[1\]\.pieces\[0\]\.stroke\.style: .*the style of the stroke 1 it was cut of/,
      ],
      [
        pieced(of1({ ...piece(2, 0, 15), style: undefined })),
        /^history\[1\]\.pieces\[0\]\.stroke\.style:/,
      ],
      [
        pieced(of1({ ...piece(2, 0, 15), style: { ...liner, color: "blue" } })),
        /^history\[1\]\.pieces\[0\]\.stroke\.style\.color: a colour/,
      ],
      [
        pieced(of1(piece(2, 0, 10, 20, 30, 40))),
        /^history\[1\]\.pieces\[0\]\.stroke\.points: the whole stroke 1/,
      ],
      [
        pieced(of1(piece(2, 0, 20, 10, 40))),
        /^history\[1\]\.pieces\[0\]\.stroke\.points\[2\]\.t: 10, earlier/,
      ],
      [
        pieced(
          of1({
            ...piece(2, 5, 10, 20, 25),
            points: [at(5), { ...at(10), y: 11 }, at(20), at(25)],
          }),
        ),
        /^history\[1\]\.pieces\[0\]\.stroke\.points: no run of the points of the stroke 1/,
      ],
      [
        pieced(
          of1({
            ...piece(2, 5, 10, 20, 25),
            points: [{ ...at(5), y: 999 }, at(10), at(20), at(25)],
          }),
        ),
        /^history\[1\]\.pieces\[0\]\.stroke\.points\[0\]: not on the line of the stroke 1/,
      ],
      [
        pieced(of1(piece(2, 5, 30, 35)), of1(piece(3, 15, 20, 25))),
        /^history\[1\]\.pieces\[1\]\.stroke\.points: a run of the stroke 1 before the end of its piece before/,
      ],
      [
        pieced(of1(piece(2, 5, 25)), of1(piece(3, 20, 25))),
        /^history\[1\]\.pieces\[1\]\.stroke\.points\[0\]\.t: 20, before the piece of the stroke 1 before it ends, at 25$/,
      ],
      [
        pieced(
          of1({
            ...piece(2, 0, 10, 15),
            points: [{ ...at(0), t: 0 }, at(10), { ...at(15), t: 45 }],
          }),
        ),
        /^history\[1\]\.pieces\[0\]\.stroke\.points\[2\]\.t: 45, outside the times of the stroke 1, 0 to 40$/,
      ],
      [
        [
          {
            ...written,
            t: 45,
            stroke: { ...line, points: line.points.map((p) => ({ ...p, t: p.t + 5 })) },
          },
          { ...cut, t: 100, pieces: [of1(piece(2, 0, 15))] },
        ],
        /^history\[1\]\.pieces\[0\]\.stroke\.points\[0\]\.t: 0, outside the times of the stroke 1, 5 to 45$/,
      ],
      [
        with_({
          t: 41,
          pieces: [of1({ ...piece(2, 0, 15), points: [at(0), { ...at(15), t: 42 }] })],
        }),
        /^history\[1\]\.t: 41, earlier than the stroke's last point, at 42$/,
      ],
    ];
    for (const [value, message] of cases) {
      expect(() => historyOf(value), String(message)).toThrow(TypeError);
      expect(() => historyOf(value), String(message)).toThrow(message);
    }
    // The pieces of strokes in the order of the cut's IDs, the later stroke's first among them.
    const two: Stroke = { ...line, id: 2, points: line.points.map((p) => ({ ...p, y: 20 })) };
    const both = [written, { kind: "write", t: 40, stroke: two }];
    const ofTwo = { of: 2, stroke: { ...two, id: 4, points: two.points.slice(0, 2) } };
    const ofOne = of1(piece(3, 0, 10));
    expect(() =>
      historyOf([...both, { ...cut, ids: [2, 1], pieces: [ofTwo, ofOne] }]),
    ).not.toThrow();
    expect(() => historyOf([...both, { ...cut, ids: [1, 2], pieces: [ofTwo, ofOne] }])).toThrow(
      /^history\[2\]\.pieces\[1\]\.of: 1, after a piece of a stroke later in ids/,
    );
    // A stroke written with a style out of its bounds.
    expect(() =>
      historyOf([{ ...written, stroke: { ...line, style: { ...liner, width: 0 } } }]),
    ).toThrow(/^history\[0\]\.stroke\.style\.width:/);
  });
});
