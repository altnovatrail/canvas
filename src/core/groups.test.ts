import { describe, expect, test } from "vitest";
import {
  GROUP_RULE,
  type Group,
  type GroupRule,
  groupsOf,
  labelOf,
  neighboursOf,
  rectOf,
} from "./groups.js";
import { type HistoryEvent, replay } from "./history.js";
import type { Stroke } from "./ink.js";
import { random, SHEETS, staircase, stroke, undone } from "./sheets.fixture.js";

// The sheets of these tests are drawn by code, as every test's strokes are: no hand wrote them
// (CLAUDE.md). The synthetic sheets, in sheets.fixture.ts, lie in whole tenths of a unit and whole
// milliseconds, so that they come out the same on every machine, and so do the test vectors made
// of them. The tests of rounding, the crowded sheets and the sheet of rounding among the vectors
// take hundredths and fractions of a millisecond on purpose: those are what the rule rounds.

const idsOf = (groups: readonly Group[]) => groups.map(({ ids }) => ids);

/** Groups as sets, whatever their labels and order: each one's IDs ascending, the lists by their first. */
function setsOf(groups: readonly (readonly number[])[]): number[][] {
  return groups
    .map((ids) => [...ids].sort((a, b) => a - b))
    .sort((a, b) => (a[0] ?? 0) - (b[0] ?? 0));
}

describe("neighbours", () => {
  test("are strokes near in place and in time, and a chain of them is a group", () => {
    const strokes = [
      stroke(1, [100, 100, 0]),
      stroke(2, [140, 100, 500]),
      stroke(3, [180, 100, 1000]),
      stroke(4, [400, 100, 1500]),
    ];
    expect(neighboursOf(strokes)).toEqual([
      [1, 2],
      [2, 3],
    ]);
    expect(idsOf(groupsOf(strokes))).toEqual([[1, 2, 3], [4]]);
  });

  test("are no more than 2 s apart: the pause is from the end of one to the start of the other", () => {
    const at = (pause: number) => [
      stroke(1, [100, 100, 0], [110, 100, 30]),
      stroke(2, [120, 100, 30 + pause], [130, 100, 60 + pause]),
    ];
    expect(neighboursOf(at(2000))).toEqual([[1, 2]]);
    expect(neighboursOf(at(2001))).toEqual([]);
  });

  test("come within 50 units across and 50 down, both at once", () => {
    const pair = (dx: number, dy: number) => [
      stroke(1, [100, 100, 0], [100, 140, 100]),
      stroke(2, [100 + dx, 140 + dy, 200], [100 + dx, 180 + dy, 300]),
    ];
    expect(neighboursOf(pair(50, 0))).toEqual([[1, 2]]);
    expect(neighboursOf(pair(50.1, 0))).toEqual([]);
    expect(neighboursOf(pair(0, 50))).toEqual([[1, 2]]);
    expect(neighboursOf(pair(0, 50.1))).toEqual([]);
    expect(neighboursOf(pair(50, 50))).toEqual([[1, 2]]);
  });

  test("are measured in whole tenths of a unit and whole milliseconds", () => {
    // 50.08 units apart, 1001 and 1501 tenths: 500 tenths, neighbours.
    expect(neighboursOf([stroke(1, [100.06, 100, 0]), stroke(2, [150.14, 100, 10])])).toEqual([
      [1, 2],
    ]);
    // 50.02 units apart, 1000 and 1501 tenths: 501, not neighbours.
    expect(neighboursOf([stroke(1, [100.04, 100, 0]), stroke(2, [150.06, 100, 10])])).toEqual([]);
    // 2000.8 ms apart, 1 and 2001 ms: 2000, neighbours.
    expect(neighboursOf([stroke(1, [100, 100, 0.6]), stroke(2, [110, 100, 2001.4])])).toEqual([
      [1, 2],
    ]);
  });

  test("have no pause between them while they overlap in time", () => {
    const long = stroke(1, [100, 100, 0], [100, 200, 5000]);
    expect(neighboursOf([long, stroke(2, [120, 150, 2500])])).toEqual([[1, 2]]);
    expect(neighboursOf([long, stroke(2, [120, 150, 4000], [130, 150, 9000])])).toEqual([[1, 2]]);
  });

  test("follow the rule they are given", () => {
    const strokes = [stroke(1, [100, 100, 0]), stroke(2, [130, 100, 900])];
    expect(neighboursOf(strokes, { pause: 500, across: 50, down: 25 })).toEqual([]);
    expect(neighboursOf(strokes, { pause: 2000, across: 20, down: 25 })).toEqual([]);
    expect(neighboursOf(strokes, GROUP_RULE)).toEqual([[1, 2]]);
  });
});

describe("groups", () => {
  test("give a stroke written later next to old writing a group of its own (R06)", () => {
    const strokes = [
      stroke(1, [100, 100, 0], [100, 136, 200]),
      stroke(2, [120, 100, 450], [120, 136, 650]),
      stroke(3, [140, 100, 8650], [140, 136, 8850]),
    ];
    expect(idsOf(groupsOf(strokes))).toEqual([[1, 2], [3]]);
  });

  test("are joined by a stroke between them only if it is near both in time", () => {
    // Two writings 100 units apart, a second apart, and a line under both.
    const two = [
      stroke(1, [100, 100, 0], [100, 136, 200]),
      stroke(2, [220, 100, 1200], [220, 136, 1400]),
    ];
    const under = (t: number) => stroke(3, [95, 145, t], [225, 145, t + 300]);
    expect(idsOf(groupsOf([...two, under(1600)]))).toEqual([[1, 2, 3]]);
    // 2.5 s after the first writing and 1.1 s after the second: it joins the second alone.
    expect(setsOf(idsOf(groupsOf([...two, under(2500)])))).toEqual([[1], [2, 3]]);
    // Long after both: a group of its own.
    expect(setsOf(idsOf(groupsOf([...two, under(6000)])))).toEqual([[1], [2], [3]]);
  });

  test("hold the IDs of their strokes in ascending order, whatever the order of the strokes", () => {
    const strokes = [
      stroke(7, [100, 100, 0]),
      stroke(3, [110, 100, 100]),
      stroke(5, [120, 100, 200]),
    ];
    expect(idsOf(groupsOf(strokes))).toEqual([[3, 5, 7]]);
  });

  test("of an empty sheet are none", () => {
    expect(groupsOf([])).toEqual([]);
    expect(neighboursOf([])).toEqual([]);
  });

  test("take no stroke without points, and no ID twice", () => {
    expect(() => groupsOf([{ id: 1, kind: "pen", points: [] }])).toThrow(TypeError);
    expect(() => groupsOf([stroke(1, [100, 100, 0]), stroke(1, [200, 100, 0])])).toThrow(TypeError);
  });

  test("take no rule whose limits are not finite numbers of 0 or more, and keep their own", () => {
    const strokes = [stroke(1, [100, 100, 0])];
    for (const rule of [
      { ...GROUP_RULE, pause: Number.NaN },
      { ...GROUP_RULE, across: -1 },
      { ...GROUP_RULE, down: Number.POSITIVE_INFINITY },
    ]) {
      expect(() => groupsOf(strokes, rule)).toThrow(RangeError);
      expect(() => neighboursOf(strokes, rule)).toThrow(RangeError);
    }
    expect(Object.isFrozen(GROUP_RULE)).toBe(true);
  });

  test("leave out erased and undone strokes, and take those undo brings back with their own time", () => {
    const { work, groups } = undone();
    expect(work.history.map(({ kind }) => kind)).toEqual([
      "write",
      "write",
      "erase",
      "undo",
      "write",
      "clear",
      "undo",
    ]);
    expect(setsOf(idsOf(groupsOf(replay(work.history))))).toEqual(setsOf(groups));
  });
});

describe("labels", () => {
  test("go by place, from the top down, then from the left, and on past Z", () => {
    // 30 dots in five rows of six, far apart, written in a scrambled order.
    const order = Array.from({ length: 30 }, (_, n) => (n * 7) % 30);
    const strokes = order.map((n, k) =>
      stroke(k + 1, [100 + 100 * (n % 6), 100 + 100 * Math.floor(n / 6), k * 50]),
    );
    const groups = groupsOf(strokes);
    expect(groups.map(({ label }) => label)).toEqual([
      ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      "AA",
      "AB",
      "AC",
      "AD",
    ]);
    // The first label is the dot at the top left, whichever was written first.
    expect(groups[0]?.ids).toEqual([order.indexOf(0) + 1]);
    expect(groups[6]?.ids).toEqual([order.indexOf(6) + 1]);
  });

  test("of groups alike in place go by which was begun first, not by the IDs", () => {
    const strokes = [stroke(9, [100, 100, 5000]), stroke(2, [100, 100, 0])];
    expect(groupsOf(strokes)).toEqual([
      { label: "A", ids: [2] },
      { label: "B", ids: [9] },
    ]);
  });

  test("are letters in base 26 without a zero", () => {
    expect([0, 1, 25, 26, 27, 51, 52, 701, 702].map(labelOf)).toEqual([
      "A",
      "B",
      "Z",
      "AA",
      "AB",
      "AZ",
      "BA",
      "ZZ",
      "AAA",
    ]);
  });
});

describe("rectOf", () => {
  test("is the box of the points of a group's strokes, raw, in sheet units", () => {
    const strokes = [
      stroke(1, [100.04, 200, 0], [120, 236.06, 100]),
      stroke(2, [150, 190.5, 200]),
      stroke(3, [600, 600, 300]),
    ];
    expect(rectOf([1, 2], strokes)).toEqual({ minX: 100.04, minY: 190.5, maxX: 150, maxY: 236.06 });
    expect(() => rectOf([4], strokes)).toThrow(RangeError);
  });
});

// The rule written out once more, every pair against every pair, without the index: what the
// index has to find, on sheets a generator makes from a seed.

/** Every pair of neighbours by the rule's own words, from each point's tenths. */
function referencePairs(strokes: readonly Stroke[], rule: GroupRule): [number, number][] {
  const tenth = (value: number) => Math.round(value * 10);
  const spans = strokes.map(({ id, points }) => ({
    id,
    x: [Math.min(...points.map(({ x }) => tenth(x))), Math.max(...points.map(({ x }) => tenth(x)))],
    y: [Math.min(...points.map(({ y }) => tenth(y))), Math.max(...points.map(({ y }) => tenth(y)))],
    t: [
      Math.round(Math.min(...points.map(({ t }) => t))),
      Math.round(Math.max(...points.map(({ t }) => t))),
    ],
  }));
  const apart = (a: number[], b: number[]) =>
    Math.max(0, (a[0] ?? 0) - (b[1] ?? 0), (b[0] ?? 0) - (a[1] ?? 0));
  const pairs: [number, number][] = [];
  for (const [i, a] of spans.entries()) {
    for (const b of spans.slice(i + 1)) {
      if (
        apart(a.x, b.x) <= tenth(rule.across) &&
        apart(a.y, b.y) <= tenth(rule.down) &&
        apart(a.t, b.t) <= Math.round(rule.pause)
      ) {
        pairs.push(a.id < b.id ? [a.id, b.id] : [b.id, a.id]);
      }
    }
  }
  return pairs.sort(([a1, a2], [b1, b2]) => a1 - b1 || a2 - b2);
}

/** The sets that pairs join, by IDs. */
function components(ids: readonly number[], pairs: readonly [number, number][]): number[][] {
  const next = new Map(ids.map((id) => [id, [] as number[]]));
  for (const [a, b] of pairs) {
    next.get(a)?.push(b);
    next.get(b)?.push(a);
  }
  const seen = new Set<number>();
  const sets: number[][] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    const set: number[] = [];
    const queue = [id];
    seen.add(id);
    while (queue.length > 0) {
      const at = queue.pop() ?? id;
      set.push(at);
      for (const other of next.get(at) ?? []) {
        if (!seen.has(other)) {
          seen.add(other);
          queue.push(other);
        }
      }
    }
    sets.push(set);
  }
  return setsOf(sets);
}

/** A crowded sheet: 80 strokes of one to four points, places to hundredths, times to tenths. */
function crowded(seed: number): Stroke[] {
  const next = random(seed);
  const value = (scale: number, step: number) => Math.round(next() * scale * step) / step;
  return Array.from({ length: 80 }, (_, n) => {
    const x = value(400, 100);
    const y = value(300, 100);
    const t = value(30000, 10);
    const points = Array.from(
      { length: 1 + Math.floor(next() * 4) },
      (_, k) => [x + value(40, 100), y + value(40, 100), t + k * value(200, 10)] as const,
    );
    // IDs out of order, as a sheet after undo and erasing can hold them.
    return stroke(((n * 37) % 80) + 1, ...points);
  });
}

describe("the index", () => {
  test("finds the neighbours a search of every pair finds", () => {
    const rules: GroupRule[] = [GROUP_RULE, { pause: 500, across: 10, down: 5 }];
    for (const seed of Array.from({ length: 25 }, (_, n) => n + 1)) {
      const strokes = crowded(seed);
      for (const rule of rules) {
        const pairs = referencePairs(strokes, rule);
        expect(neighboursOf(strokes, rule)).toEqual(pairs);
        const ids = strokes.map(({ id }) => id);
        expect(setsOf(idsOf(groupsOf(strokes, rule)))).toEqual(components(ids, pairs));
      }
    }
  });

  test("gives the same groups and labels, whatever the order and the IDs of the strokes", () => {
    const strokes = staircase().work.strokes;
    const before = groupsOf(strokes);
    // Other IDs, one for one, and the strokes in another order.
    const renumbered = strokes.map((each) => ({ ...each, id: 1000 - each.id }));
    const shuffled = [...renumbered].sort((a, b) => ((a.id * 13) % 23) - ((b.id * 13) % 23));
    const after = groupsOf(shuffled);
    expect(
      after.map(({ label, ids }) => ({
        label,
        ids: ids.map((id) => 1000 - id).sort((a, b) => a - b),
      })),
    ).toEqual(before);
  });
});

describe("the synthetic sheets", () => {
  test("have the groups a teacher sees on them", () => {
    for (const make of SHEETS) {
      const sheet = make();
      expect(replay(sheet.work.history), sheet.name).toEqual(sheet.work.strokes);
      expect(setsOf(idsOf(groupsOf(sheet.work.strokes))), sheet.name).toEqual(setsOf(sheet.groups));
    }
  });

  test("label the staircase by place: the ladder, «30», the ringed answer, then the sum", () => {
    const sheet = staircase();
    const [ladder, label, expression, answer] = sheet.groups;
    expect(groupsOf(sheet.work.strokes)).toEqual([
      { label: "A", ids: ladder },
      { label: "B", ids: label },
      { label: "C", ids: answer },
      { label: "D", ids: expression },
    ]);
  });
});

/** What the test vectors say of themselves (R24). */
const ABOUT =
  "Test vectors of canvas's rule of stroke groups, R24 in docs/decisions.md: from a history of writing, as the element records it, to the groups of the strokes the sheet shows. A proposal for the eval protocol, epic E3 in spec's RUN.md: the protocol's own vectors come in spec's releases, and canvas will test against those.";

/** The test vectors, one line to an event, so that a reader can follow them. */
function vectors(): string {
  const lines = [
    "{",
    `  "about": ${JSON.stringify(ABOUT)},`,
    `  "rule": ${JSON.stringify(GROUP_RULE)},`,
    `  "units": ${JSON.stringify({
      places:
        "sheet units, the sheet 1000 × 1400 (R06); the rule takes them in whole tenths, round(10 × v), rounding half up: 100.05 units are 1001 tenths",
      times:
        "milliseconds from the sheet's first event (R22); the rule takes them whole, round(t), half up alike",
      rect: "[ymin, xmin, ymax, xmax] of the group's points, raw, in sheet units",
      labels:
        "by place: the group's rectangle in whole tenths, its top, then its left, bottom and right; then its earliest start in whole milliseconds; then its smallest ID. A to Z, then AA, AB and on",
    })},`,
    '  "cases": [',
  ];
  SHEETS.forEach((make, n) => {
    const sheet = make();
    const strokes = replay(sheet.work.history);
    const groups = groupsOf(strokes).map(({ label, ids }) => {
      const { minX, minY, maxX, maxY } = rectOf(ids, strokes);
      return { label, ids, rect: [minY, minX, maxY, maxX] };
    });
    const events = sheet.work.history.map(
      (event: HistoryEvent, k) =>
        `        ${JSON.stringify(event)}${k < sheet.work.history.length - 1 ? "," : ""}`,
    );
    lines.push(
      "    {",
      `      "name": ${JSON.stringify(sheet.name)},`,
      `      "about": ${JSON.stringify(sheet.about)},`,
      '      "history": [',
      ...events,
      "      ],",
      `      "visible": ${JSON.stringify(strokes.map(({ id }) => id))},`,
      `      "neighbours": ${JSON.stringify(neighboursOf(strokes))},`,
      '      "groups": [',
      ...groups.map(
        (group, k) => `        ${JSON.stringify(group)}${k < groups.length - 1 ? "," : ""}`,
      ),
      "      ]",
      n < SHEETS.length - 1 ? "    }," : "    }",
    );
  });
  lines.push("  ]", "}", "");
  return lines.join("\n");
}

test("the test vectors are what the rule gives on the synthetic sheets", async () => {
  await expect(vectors()).toMatchFileSnapshot("../../vectors/groups.json");
});
