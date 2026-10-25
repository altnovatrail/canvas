import { describe, expect, test } from "vitest";
import { Clock } from "./clock.js";
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
import { type PointerSample, Recorder } from "./recorder.js";
import { Work } from "./work.js";

// The sheets of these tests are drawn by code, as every test's strokes are: no hand wrote them
// (CLAUDE.md). The synthetic sheets lie in whole tenths of a unit and whole milliseconds, so that
// they come out the same on every machine, and so do the test vectors made of them. The tests of
// rounding, the crowded sheets and the sheet of rounding among the vectors take hundredths and
// fractions of a millisecond on purpose: those are what the rule rounds.

/** A stroke of these points, each [x, y, t]: sheet units and the sheet's milliseconds. */
function stroke(id: number, ...points: (readonly [number, number, number])[]): Stroke {
  return { id, kind: "pen", points: points.map(([x, y, t]) => ({ x, y, t, p: 0.5 })) };
}

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

/** A generator of numbers in [0, 1) from a seed: mulberry32. */
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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

// The synthetic sheets. A hand writes them as the element hands a pen's events over: through the
// recorder onto the work, on the sheet's one clock, and it erases and undoes on that clock too
// (R22). Their characters are boxes 10 by 10 of points, scaled to a font.

/** Where a point is, in whole tenths of a unit. */
type Spot = readonly [x: number, y: number];

/** The tenths of a place on the sheet given in units. */
const spot = (x: number, y: number): Spot => [Math.round(x * 10), Math.round(y * 10)];

/** The strokes of each character, as a hand writes them, in a box 10 wide and 10 high. */
const GLYPHS: Readonly<Record<string, readonly (readonly Spot[])[]>> = {
  " ": [],
  "0": [
    [
      [5, 0],
      [8, 1],
      [10, 4],
      [10, 6],
      [8, 9],
      [5, 10],
      [2, 9],
      [0, 6],
      [0, 4],
      [2, 1],
      [5, 0],
    ],
  ],
  "1": [
    [
      [2, 3],
      [6, 0],
      [6, 10],
    ],
  ],
  "2": [
    [
      [0, 2],
      [3, 0],
      [7, 0],
      [10, 3],
      [9, 5],
      [0, 10],
      [10, 10],
    ],
  ],
  "3": [
    [
      [0, 1],
      [4, 0],
      [8, 1],
      [9, 3],
      [5, 5],
      [9, 7],
      [9, 9],
      [5, 10],
      [0, 9],
    ],
  ],
  "4": [
    [
      [7, 0],
      [0, 7],
      [10, 7],
    ],
    [
      [7, 3],
      [7, 10],
    ],
  ],
  "5": [
    [
      [1, 0],
      [1, 4],
      [6, 4],
      [9, 6],
      [9, 8],
      [6, 10],
      [0, 9],
    ],
    [
      [1, 0],
      [9, 0],
    ],
  ],
  "6": [
    [
      [8, 0],
      [3, 2],
      [0, 6],
      [1, 9],
      [5, 10],
      [9, 8],
      [9, 6],
      [5, 5],
      [1, 6],
    ],
  ],
  "7": [
    [
      [0, 0],
      [10, 0],
      [4, 10],
    ],
  ],
  "8": [
    [
      [5, 5],
      [1, 3],
      [2, 0],
      [8, 0],
      [9, 3],
      [5, 5],
      [0, 7],
      [1, 10],
      [9, 10],
      [10, 7],
      [5, 5],
    ],
  ],
  "9": [
    [
      [9, 4],
      [5, 5],
      [1, 4],
      [1, 1],
      [5, 0],
      [9, 1],
      [9, 4],
      [8, 10],
    ],
  ],
  "+": [
    [
      [5, 2],
      [5, 8],
    ],
    [
      [2, 5],
      [8, 5],
    ],
  ],
  "−": [
    [
      [1, 5],
      [9, 5],
    ],
  ],
  "=": [
    [
      [1, 3],
      [9, 3],
    ],
    [
      [1, 7],
      [9, 7],
    ],
  ],
  ":": [[[5, 3]], [[5, 7]]],
};

/** How a hand writes characters: their size in units, and its pauses in milliseconds. */
interface Font {
  readonly width: number;
  readonly height: number;
  /** From one character to the next. */
  readonly advance: number;
  /** The pause before the `n`-th stroke of a character, from 1. */
  readonly within: (n: number) => number;
  /** The pause before the `n`-th character of a text, from 1. */
  readonly between: (n: number) => number;
}

/** A digit 36 units high, as tutor's synthetic writer has it, in a cell of the default grid. */
const DIGITS: Font = { width: 20, height: 36, advance: 26, within: () => 150, between: () => 250 };

/** The writer of tutor: 120 to 249 ms between any two strokes (internal/synth/synth.go in tutor). */
const TUTOR: Font = {
  ...DIGITS,
  within: (n) => 120 + ((n * 53) % 130),
  between: (n) => 120 + ((n * 71) % 130),
};

/** The time a pen takes from one point to the next: 8 ms for every 3 units, as tutor's writer goes. */
function stepMs(a: Spot, b: Spot): number {
  return 8 * Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) / 30));
}

/** A pen on a sheet: its events through the recorder onto the work, on the sheet's one clock. */
class Hand {
  readonly #clock = new Clock();
  readonly work = new Work(this.#clock);
  readonly #recorder = new Recorder((done) => this.work.write(done), this.#clock);
  /** The page's time. The sheet's 0 is the hand's first event. */
  #now = 1000;

  /** The hand rests. */
  wait(ms: number): void {
    this.#now += ms;
  }

  /** One stroke through the spots; its ID. A single spot is a dot, 30 ms long. */
  stroke(spots: readonly Spot[]): number {
    const [first, ...rest] = spots;
    if (first === undefined) throw new Error("a stroke needs a point");
    this.#recorder.down(this.#sample(first, 0, 1));
    let last = first;
    for (const [n, next] of rest.entries()) {
      this.#now += stepMs(last, next);
      if (n < rest.length - 1) this.#recorder.move(this.#sample(next, -1, 1));
      last = next;
    }
    if (rest.length === 0) this.#now += 30;
    this.#recorder.up(this.#sample(last, 0, 0));
    const written = this.work.strokes.at(-1);
    if (written === undefined) throw new Error("the stroke did not land");
    return written.id;
  }

  /** A line from one place to another, in units. */
  line(x1: number, y1: number, x2: number, y2: number): number {
    return this.stroke([spot(x1, y1), spot(x2, y2)]);
  }

  /** A dot. */
  dot(x: number, y: number): number {
    return this.stroke([spot(x, y)]);
  }

  /** A ring in the box from (x, y), `width` by `height` units: the digit 0, scaled. */
  ring(x: number, y: number, width: number, height: number): number {
    const [zero] = GLYPHS["0"] ?? [];
    const [left, top] = spot(x, y);
    return this.stroke((zero ?? []).map(([gx, gy]) => [left + gx * width, top + gy * height]));
  }

  /** A written word: one stroke over `humps` humps 12 units wide and 20 high, from (x, y). */
  word(x: number, y: number, humps: number): number {
    const spots: Spot[] = [spot(x, y + 20)];
    for (let n = 0; n < humps; n++)
      spots.push(spot(x + 12 * n + 6, y), spot(x + 12 * (n + 1), y + 20));
    return this.stroke(spots);
  }

  /** Characters from (x, y) to the right, in the font's boxes; a space is a box left empty. */
  write(text: string, x: number, y: number, font: Font = DIGITS): number[] {
    const ids: number[] = [];
    const [left, top] = spot(x, y);
    for (const [n, char] of [...text].entries()) {
      if (n > 0) this.wait(font.between(n));
      const glyph = GLYPHS[char];
      if (glyph === undefined) throw new Error(`no glyph for ${char}`);
      for (const [k, spots] of glyph.entries()) {
        if (k > 0) this.wait(font.within(k));
        const at = left + Math.round(n * font.advance * 10);
        ids.push(
          this.stroke(spots.map(([gx, gy]) => [at + gx * font.width, top + gy * font.height])),
        );
      }
    }
    return ids;
  }

  /** One press of the eraser, lifted 200 ms on. */
  erase(ids: readonly number[]): void {
    this.wait(200);
    this.work.erase(ids, this.#now);
  }

  undo(): void {
    this.work.undo(this.#now);
  }

  clear(): void {
    this.work.clear(this.#now);
  }

  #sample([x, y]: Spot, button: number, buttons: number): PointerSample {
    return {
      pointerId: 1,
      kind: "pen",
      button,
      buttons,
      x: x / 10,
      y: y / 10,
      time: this.#now,
      pressure: 0.5,
    };
  }
}

/**
 * A sheet, with the groups a teacher sees on it: set down by the IDs of their strokes before any
 * run of the rule.
 */
interface Sheet {
  readonly name: string;
  readonly about: string;
  readonly work: Work;
  readonly groups: readonly (readonly number[])[];
}

/** The research's example: a ladder, «30» beside it, «180 : 30 = 5», the 5 erased, then 6 in a ring. */
function staircase(): Sheet {
  const hand = new Hand();
  const ladder = [hand.line(100, 300, 100, 600)];
  hand.wait(250);
  ladder.push(hand.line(160, 300, 160, 600));
  for (let y = 600; y >= 300; y -= 50) {
    hand.wait(250);
    ladder.push(hand.line(100, y, 160, y));
  }
  hand.wait(3000);
  const label = hand.write("30", 175, 410);
  hand.wait(3000);
  const expression = hand.write("180 : 30 = ", 260, 430);
  hand.wait(250);
  const five = hand.write("5", 546, 430);
  hand.wait(1500);
  hand.erase(five);
  hand.wait(1500);
  const answer = hand.write("6", 546, 430);
  hand.wait(400);
  answer.push(hand.ring(538, 420, 36, 56));
  return {
    name: "staircase",
    about:
      "The research's example: a ladder of two posts and seven rungs, «30» beside it after a pause, «180 : 30 = 5» after another, the 5 erased, then 6, ringed.",
    work: hand.work,
    groups: [ladder, label, expression, answer],
  };
}

function later(): Sheet {
  const hand = new Hand();
  const expression = hand.write("12 + 5 =", 100, 200);
  hand.wait(8000);
  const answer = hand.write("17", 334, 200);
  return {
    name: "later",
    about:
      "«12 + 5 =», and 8 s later «17» right after it: what is written later next to old writing is a group of its own (R06).",
    work: hand.work,
    groups: [expression, answer],
  };
}

function lines(): Sheet {
  const hand = new Hand();
  const first = hand.write("12 + 5 = 17", 100, 200);
  hand.wait(1500);
  const second = hand.write("17 − 4 = 13", 100, 250);
  return {
    name: "lines",
    about:
      "Two lines a cell apart, the second begun 1.5 s after the first, with no pause to think: a group each.",
    work: hand.work,
    groups: [first, second],
  };
}

function signs(): Sheet {
  const hand = new Hand();
  const small: Font = { ...DIGITS, width: 18, height: 30 };
  const sum: number[] = [];
  for (const [x, top] of [
    [100, "3"],
    [160, "1"],
  ] as const) {
    if (sum.length > 0) hand.wait(250);
    sum.push(...hand.write(top, x, 300, small));
    hand.wait(250);
    sum.push(hand.line(x - 2, 336, x + 20, 336));
    hand.wait(250);
    sum.push(...hand.write("4", x, 342, small));
    hand.wait(250);
    sum.push(...hand.write(x === 100 ? "+" : "=", x + 30, 321, small));
  }
  hand.wait(250);
  sum.push(...hand.write("1", 220, 318));
  hand.wait(400);
  sum.push(hand.line(95, 378, 245, 378));
  hand.wait(3000);
  const quotient = hand.write("12 : 4 = 3", 100, 430);
  return {
    name: "signs",
    about:
      "3/4 + 1/4 = 1 in fractions over bars, underlined; 3 s later «12 : 4 = 3» below: a group each, with their bars, dots and lines.",
    work: hand.work,
    groups: [sum, quotient],
  };
}

function words(): Sheet {
  const hand = new Hand();
  const first: number[] = [];
  for (const [x, humps, dot] of [
    [100, 5, 130],
    [180, 2, 186],
    [224, 4, undefined],
  ] as const) {
    if (first.length > 0) hand.wait(250);
    first.push(hand.word(x, 500, humps));
    if (dot !== undefined) {
      hand.wait(300);
      first.push(hand.dot(dot, 490));
    }
  }
  hand.wait(1500);
  const second = [hand.word(100, 560, 3)];
  hand.wait(250);
  second.push(hand.word(156, 560, 6));
  hand.wait(300);
  second.push(hand.dot(162, 550));
  return {
    name: "words",
    about:
      "Two lines of joined-up words, each word a stroke, with the dot of an i put after its word: a group a line.",
    work: hand.work,
    groups: [first, second],
  };
}

function tutor(): Sheet {
  const hand = new Hand();
  hand.wait(1500);
  const first = hand.write("47 + 19 = 66", 60, 100, TUTOR);
  hand.wait(1500);
  const second = hand.write("66 : 6 = 11", 60, 180, TUTOR);
  return {
    name: "tutor",
    about:
      "Two lines as tutor's synthetic writer draws them: digits 36 high, 26 apart, lines 80 apart, 1.5 s before a line and 120 to 249 ms between strokes.",
    work: hand.work,
    groups: [first, second],
  };
}

function crossed(): Sheet {
  const hand = new Hand();
  const first = hand.write("47 + 19 = 56", 100, 200);
  hand.wait(400);
  first.push(hand.line(94, 218, 410, 218));
  hand.wait(3000);
  const second = hand.write("47 + 19 = 66", 100, 300);
  hand.wait(3000);
  const strike = hand.line(94, 318, 410, 318);
  return {
    name: "crossed",
    about:
      "A line crossed out at once, 0.4 s after it, which is of its group; another crossed out 3 s after it, which is a group of its own.",
    work: hand.work,
    groups: [first, second, [strike]],
  };
}

function bridge(): Sheet {
  const hand = new Hand();
  const joined = hand.write("12", 100, 200);
  hand.wait(500);
  joined.push(...hand.write("34", 220, 200));
  hand.wait(300);
  joined.push(hand.line(98, 245, 268, 245));
  hand.wait(3000);
  const left = hand.write("56", 100, 400);
  hand.wait(500);
  const right = hand.write("78", 220, 400);
  hand.wait(4000);
  const under = hand.line(98, 445, 268, 445);
  return {
    name: "bridge",
    about:
      "«12» and «34» far apart, a line under both 0.3 s on, which joins them; «56» and «78» the same, the line 4 s on, which joins neither.",
    work: hand.work,
    groups: [joined, left, right, [under]],
  };
}

function undone(): Sheet {
  const hand = new Hand();
  const twelve = hand.write("12", 100, 200);
  hand.wait(500);
  hand.erase(twelve);
  hand.wait(3000);
  hand.undo();
  hand.wait(500);
  const three = hand.write("3", 160, 200);
  hand.wait(1000);
  hand.clear();
  hand.wait(500);
  hand.undo();
  return {
    name: "undone",
    about:
      "«12» erased and brought back by undo 3 s on, «3» written next to it 0.5 s after that, the sheet cleared and that undone: «12» keeps the time it was written, a group apart from «3».",
    work: hand.work,
    groups: [twelve, three],
  };
}

function bounds(): Sheet {
  const hand = new Hand();
  const groups: number[][] = [];
  const pair = (
    first: () => number,
    apart: () => void,
    second: () => number,
    neighbours: boolean,
  ) => {
    const a = first();
    apart();
    const b = second();
    groups.push(...(neighbours ? [[a, b]] : [[a], [b]]));
    hand.wait(100);
  };
  pair(
    () => hand.dot(100, 100),
    () => hand.wait(2000),
    () => hand.dot(110, 100),
    true,
  );
  pair(
    () => hand.dot(300, 100),
    () => hand.wait(2001),
    () => hand.dot(310, 100),
    false,
  );
  pair(
    () => hand.line(100, 300, 100, 340),
    () => hand.wait(100),
    () => hand.line(150, 300, 150, 340),
    true,
  );
  pair(
    () => hand.line(300, 300, 300, 340),
    () => hand.wait(100),
    () => hand.line(350.1, 300, 350.1, 340),
    false,
  );
  pair(
    () => hand.line(100, 500, 140, 500),
    () => hand.wait(100),
    () => hand.line(100, 550, 140, 550),
    true,
  );
  pair(
    () => hand.line(300, 700, 340, 700),
    () => hand.wait(100),
    () => hand.line(300, 750.1, 340, 750.1),
    false,
  );
  return {
    name: "bounds",
    about:
      "Pairs at the rule's bounds and just past them: 2000 and 2001 ms, 50 and 50.1 units across, 50 and 50.1 down.",
    work: hand.work,
    groups,
  };
}

/**
 * Dots off the tenths and the milliseconds, in pairs: on a half, which the rule rounds up, and
 * just below and above one. Written straight onto the work, for no hand writes off the tenths.
 */
function rounding(): Sheet {
  const work = new Work();
  const dots: (readonly [number, number, number])[] = [
    [100.05, 100, 10],
    [150.1, 100, 20],
    [300.04, 100, 30],
    [350.06, 100, 40],
    [500.06, 100, 50],
    [550.14, 100, 60],
    [100, 300, 100.5],
    [110, 300, 2101],
    [300, 300, 3000.6],
    [310, 300, 5001.4],
    [500, 300.05, 6000],
    [500, 350.1, 6010],
  ];
  for (const [n, dot] of dots.entries()) work.write(stroke(n + 1, dot));
  return {
    name: "rounding",
    about:
      "Dots in hundredths of a unit and fractions of a millisecond, in pairs. The rule rounds half up: 100.05 units are 1001 tenths, so the first pair is 500 tenths apart across, the fourth 2000 ms apart and the sixth 500 tenths apart down — neighbours all three, which rounding half to even or cutting the fraction off would part. The second pair, 50.02 units apart, is 501 tenths, and the third and fifth come out at the bounds from just above.",
    work,
    groups: [[1, 2], [3], [4], [5, 6], [7, 8], [9, 10], [11, 12]],
  };
}

const SHEETS: readonly (() => Sheet)[] = [
  staircase,
  later,
  lines,
  signs,
  words,
  tutor,
  crossed,
  bridge,
  undone,
  bounds,
  rounding,
];

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
