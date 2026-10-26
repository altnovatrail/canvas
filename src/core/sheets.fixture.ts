// The synthetic sheets of the tests, drawn by code as every test's strokes are: no hand wrote them
// (CLAUDE.md). Each sheet comes with what a teacher sees on it, set down before any run of the
// code: its groups (R24) and the median height its crop scales by (R25). The tests of the groups
// and of the crop take them, and so do their test vectors. A module of the tests alone: the build
// leaves it out, as it leaves out the tests (tsconfig.build.json), and the package check holds to
// that (scripts/package.ts).

import { Clock } from "./clock.js";
import type { Stroke } from "./ink.js";
import { type PointerSample, Recorder } from "./recorder.js";
import { Work } from "./work.js";

/** A generator of numbers in [0, 1) from a seed: mulberry32. */
export function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stroke of these points, each [x, y, t]: sheet units and the sheet's milliseconds. */
export function stroke(id: number, ...points: (readonly [number, number, number])[]): Stroke {
  return { id, kind: "pen", points: points.map(([x, y, t]) => ({ x, y, t, p: 0.5 })) };
}

// The synthetic sheets. A hand writes them as the element hands a pen's events over: through the
// recorder onto the work, on the sheet's one clock, and it erases and undoes on that clock too
// (R22). Their characters are boxes 10 by 10 of points, scaled to a font.

/** Where a point is, in whole tenths of a unit. */
export type Spot = readonly [x: number, y: number];

/** The tenths of a place on the sheet given in units. */
export const spot = (x: number, y: number): Spot => [Math.round(x * 10), Math.round(y * 10)];

/** The strokes of each character, as a hand writes them, in a box 10 wide and 10 high. */
export const GLYPHS: Readonly<Record<string, readonly (readonly Spot[])[]>> = {
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
export interface Font {
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
export const DIGITS: Font = {
  width: 20,
  height: 36,
  advance: 26,
  within: () => 150,
  between: () => 250,
};

/** The writer of tutor: 120 to 249 ms between any two strokes (internal/synth/synth.go in tutor). */
export const TUTOR: Font = {
  ...DIGITS,
  within: (n) => 120 + ((n * 53) % 130),
  between: (n) => 120 + ((n * 71) % 130),
};

/** The time a pen takes from one point to the next: 8 ms for every 3 units, as tutor's writer goes. */
function stepMs(a: Spot, b: Spot): number {
  return 8 * Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) / 30));
}

/** A pen on a sheet: its events through the recorder onto the work, on the sheet's one clock. */
export class Hand {
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
 * A sheet for the crop, with the height of its writing as a teacher sees it: the median its crop
 * scales by, in units, set down before any run of the rule (R25).
 */
export interface CropSheet {
  readonly name: string;
  readonly about: string;
  readonly work: Work;
  readonly median: number;
}

/**
 * A sheet, with the groups a teacher sees on it: set down by the IDs of their strokes before any
 * run of the rule (R24). The crop takes it too.
 */
export interface Sheet extends CropSheet {
  readonly groups: readonly (readonly number[])[];
}

/** The research's example: a ladder, «30» beside it, «180 : 30 = 5», the 5 erased, then 6 in a ring. */
export function staircase(): Sheet {
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
    median: 36,
    groups: [ladder, label, expression, answer],
  };
}

export function later(): Sheet {
  const hand = new Hand();
  const expression = hand.write("12 + 5 =", 100, 200);
  hand.wait(8000);
  const answer = hand.write("17", 334, 200);
  return {
    name: "later",
    about:
      "«12 + 5 =», and 8 s later «17» right after it: what is written later next to old writing is a group of its own (R06).",
    work: hand.work,
    median: 36,
    groups: [expression, answer],
  };
}

export function lines(): Sheet {
  const hand = new Hand();
  const first = hand.write("12 + 5 = 17", 100, 200);
  hand.wait(1500);
  const second = hand.write("17 − 4 = 13", 100, 250);
  return {
    name: "lines",
    about:
      "Two lines a cell apart, the second begun 1.5 s after the first, with no pause to think: a group each.",
    work: hand.work,
    median: 36,
    groups: [first, second],
  };
}

export function signs(): Sheet {
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
    median: 30,
    groups: [sum, quotient],
  };
}

export function words(): Sheet {
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
    median: 20,
    groups: [first, second],
  };
}

export function tutor(): Sheet {
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
    median: 36,
    groups: [first, second],
  };
}

export function crossed(): Sheet {
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
    median: 36,
    groups: [first, second, [strike]],
  };
}

export function bridge(): Sheet {
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
    median: 36,
    groups: [joined, left, right, [under]],
  };
}

export function undone(): Sheet {
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
    median: 36,
    groups: [twelve, three],
  };
}

export function bounds(): Sheet {
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
    median: 40,
    groups,
  };
}

/**
 * Dots off the tenths and the milliseconds, in pairs: on a half, which the rule rounds up, and
 * just below and above one. Written straight onto the work, for no hand writes off the tenths.
 */
export function rounding(): Sheet {
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
    median: 15,
    groups: [[1, 2], [3], [4], [5, 6], [7, 8], [9, 10], [11, 12]],
  };
}

export const SHEETS: readonly (() => Sheet)[] = [
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

// The sheets of the crop: what the median of its bundles meets — drawings, fractions, rows that
// touch, signs and lines — and the bounds of its rule (R25). The median of each is the height of
// its writing as a teacher sees it, and where the rule falls short of that, what the rule gives:
// the lone drawing and the rows that touch say so.

/** A ladder of two posts 300 high and seven rungs between them, from (x, y). */
function ladderAt(hand: Hand, x: number, y: number): void {
  hand.line(x, y, x, y + 300);
  hand.wait(250);
  hand.line(x + 60, y, x + 60, y + 300);
  for (let rung = y + 300; rung >= y; rung -= 50) {
    hand.wait(250);
    hand.line(x, rung, x + 60, rung);
  }
}

/** A stroke through corners given in units. */
function path(hand: Hand, ...corners: (readonly [number, number])[]): number {
  return hand.stroke(corners.map(([x, y]) => spot(x, y)));
}

export function ladder(): CropSheet {
  const hand = new Hand();
  ladderAt(hand, 100, 300);
  return {
    name: "ladder",
    about:
      "A ladder alone, two posts 300 high and seven rungs. The rungs are lines, the posts two bundles, and their median, 300, is over the ceiling: the scale takes 100, and the ladder comes out three digits high.",
    work: hand.work,
    median: 300,
  };
}

export function ladderAndNumber(): CropSheet {
  const hand = new Hand();
  ladderAt(hand, 100, 300);
  hand.wait(3000);
  hand.write("30", 175, 410);
  return {
    name: "ladder-30",
    about:
      "The ladder and «30» beside it: four bundles, the two posts and the two digits, and the lower median of them is a digit's height.",
    work: hand.work,
    median: 36,
  };
}

export function house(): CropSheet {
  const hand = new Hand();
  path(hand, [100, 400], [100, 600], [300, 600], [300, 400], [100, 400]);
  hand.wait(300);
  path(hand, [100, 400], [200, 300]);
  hand.wait(200);
  path(hand, [200, 300], [300, 400]);
  hand.wait(400);
  path(hand, [180, 520], [180, 600], [220, 600], [220, 520], [180, 520]);
  hand.wait(400);
  path(hand, [120, 440], [160, 440], [160, 480], [120, 480], [120, 440]);
  hand.wait(3000);
  hand.write("3", 400, 560);
  return {
    name: "house",
    about:
      "A house — walls, a roof of two strokes, a door and a window, all touching — and «3» beside it: the house is one bundle 300 high, the digit another, and the lower median of the two is the digit.",
    work: hand.work,
    median: 36,
  };
}

export function fraction(): CropSheet {
  const hand = new Hand();
  // A bar 28 long that sags 2 units: it touches the digit above it and the one below.
  const bar = (x: number) => path(hand, [x - 4, 336], [x + 10, 338], [x + 24, 336]);
  for (const [n, [top, bottom]] of [
    ["3", "4"],
    ["6", "8"],
  ].entries()) {
    const x = 100 + 80 * n;
    if (n > 0) {
      hand.wait(250);
      hand.write("=", 140, 319);
    }
    hand.wait(250);
    hand.write(top ?? "", x, 300);
    hand.wait(250);
    bar(x);
    hand.wait(250);
    hand.write(bottom ?? "", x, 338);
  }
  return {
    name: "fraction",
    about:
      "«3/4 = 6/8», each bar touching both its digits, which are 2 units apart: the bars are lines and join nothing, so each digit is a bundle of its own.",
    work: hand.work,
    median: 36,
  };
}

export function rows(): CropSheet {
  const hand = new Hand();
  const tall: Font = { ...DIGITS, width: 30, height: 50, advance: 40 };
  for (const [n, text] of ["123", "456", "789"].entries()) {
    if (n > 0) hand.wait(1500);
    hand.write(text, 100, 100 + 50 * n, tall);
  }
  return {
    name: "rows",
    about:
      "Three rows of digits 50 high, a row to a cell of the default grid, each touching the next: the digits of a column join into one bundle 150 high, and the median is over the ceiling. The rule's weak spot, and one reason for its ceiling.",
    work: hand.work,
    median: 150,
  };
}

export function slant(): CropSheet {
  const hand = new Hand();
  hand.write("5", 100, 200);
  hand.wait(400);
  hand.line(95, 240, 245, 250.5);
  return {
    name: "slant",
    about:
      "«5» and an underline 150 long that slants 4°, 10.5 units from end to end: under the floor of 15, a line, so the median is the digit's.",
    work: hand.work,
    median: 36,
  };
}

export function ringed(): CropSheet {
  const hand = new Hand();
  hand.write("7 − 1 = 6", 100, 300);
  hand.wait(600);
  hand.ring(300, 290, 36, 56);
  return {
    name: "ringed",
    about:
      "«7 − 1 = 6» with a ring round the 6: the ring's box holds the digit's, so the two are one bundle 56 high, and the lower median of the three bundles is a digit's.",
    work: hand.work,
    median: 36,
  };
}

export function crossedOut(): CropSheet {
  const hand = new Hand();
  hand.write("47 + 19 = 56", 100, 200);
  hand.wait(1500);
  hand.line(90, 195, 410, 241);
  hand.wait(200);
  hand.line(90, 241, 410, 195);
  hand.wait(3000);
  hand.write("47 + 19 = 66", 100, 300);
  return {
    name: "crossed-out",
    about:
      "«47 + 19 = 56» crossed out by an X over the whole line, and «47 + 19 = 66» written below: the X joins the line it crosses into one bundle 46 high, and the line below gives the median.",
    work: hand.work,
    median: 36,
  };
}

export function table(): CropSheet {
  const hand = new Hand();
  for (const x of [100, 200, 300]) {
    hand.line(x, 100, x, 220);
    hand.wait(300);
  }
  for (const y of [100, 160, 220]) {
    hand.line(100, y, 300, y);
    hand.wait(300);
  }
  for (const [text, x, y] of [
    ["12", 127, 112],
    ["34", 227, 112],
    ["56", 127, 172],
    ["78", 227, 172],
  ] as const) {
    hand.wait(2500);
    hand.write(text, x, y);
  }
  return {
    name: "table",
    about:
      "A drawn table of two rows and two columns, a number in each cell clear of its lines: the upright lines are bundles 120 high, the others are lines, and the digits give the median.",
    work: hand.work,
    median: 36,
  };
}

export function column(): CropSheet {
  const hand = new Hand();
  hand.write("47", 100, 100);
  hand.wait(250);
  hand.write("+", 60, 125);
  hand.wait(250);
  hand.write("19", 100, 150);
  hand.wait(250);
  hand.line(55, 195, 150, 195);
  hand.wait(250);
  hand.write("66", 100, 205);
  return {
    name: "column",
    about:
      "47 + 19 summed in a column without a pause to think: one group 141 high, but each digit a bundle of its own, so the median is a digit's.",
    work: hand.work,
    median: 36,
  };
}

export function fours(): CropSheet {
  const hand = new Hand();
  hand.write("4 + 4 = 8", 100, 200);
  return {
    name: "fours",
    about:
      "«4 + 4 = 8»: each 4, of two strokes that cross, is one bundle, the + a bundle 21.6 high, and the lower median of the four is a digit's.",
    work: hand.work,
    median: 36,
  };
}

export function dashes(): CropSheet {
  const hand = new Hand();
  hand.write("− − −", 100, 200);
  hand.wait(500);
  hand.dot(300, 218);
  return {
    name: "dashes",
    about:
      "Three minus signs and a dot: lines, all of them, so there is no bundle and the median is the floor, 15.",
    work: hand.work,
    median: 15,
  };
}

export function dot(): CropSheet {
  const hand = new Hand();
  hand.dot(500, 700);
  return {
    name: "dot",
    about:
      "A dot alone: no bundle, so the median is the floor, and the crop is 200 px each way, the least, the dot in its middle.",
    work: hand.work,
    median: 15,
  };
}

export function whole(): CropSheet {
  const hand = new Hand();
  hand.write("7", 0, 0);
  hand.wait(3000);
  hand.write("12", 480, 682);
  hand.wait(3000);
  hand.write("7", 980, 1364);
  return {
    name: "whole",
    about:
      "Digits at the top left corner, in the middle and at the bottom right corner: the work is the whole sheet. Its crop fits Claude's standard tier at 32 px, and at 48 px it would not, so its digits come out 32 px.",
    work: hand.work,
    median: 36,
  };
}

export function answer(): CropSheet {
  const hand = new Hand();
  hand.write("5", 500, 700);
  return {
    name: "answer",
    about:
      "A one-digit answer, under the least size of a crop: the crop is 200 px each way, and its margins widen to keep the digit in the middle.",
    work: hand.work,
    median: 36,
  };
}

/** Strokes written straight onto a work, 10 s apart, each its own group: the rule's bounds. */
function straight(...strokes: (readonly (readonly [number, number])[])[]): Work {
  const work = new Work();
  for (const [n, points] of strokes.entries()) {
    work.write(stroke(n + 1, ...points.map(([x, y], k) => [x, y, 10000 * n + 100 * k] as const)));
  }
  return work;
}

export function touching(): CropSheet {
  return {
    name: "touching",
    about: "Two strokes 36 high whose boxes touch at a corner, 0 tenths apart: one bundle 72 high.",
    work: straight(
      [
        [100, 100],
        [110, 136],
      ],
      [
        [110, 136],
        [120, 172],
      ],
    ),
    median: 72,
  };
}

export function apart(): CropSheet {
  return {
    name: "apart",
    about: "The same strokes, the second a tenth of a unit to the right: two bundles 36 high.",
    work: straight(
      [
        [100, 100],
        [110, 136],
      ],
      [
        [110.1, 136],
        [120.1, 172],
      ],
    ),
    median: 36,
  };
}

export function underFloor(): CropSheet {
  return {
    name: "under-floor",
    about: "A stroke 36 high and one 14.9 high, 149 tenths: a line, so the median is the first's.",
    work: straight(
      [
        [100, 100],
        [100, 136],
      ],
      [
        [300, 100],
        [300, 114.9],
      ],
    ),
    median: 36,
  };
}

export function atFloor(): CropSheet {
  return {
    name: "at-floor",
    about:
      "A stroke 36 high and one 15 high, 150 tenths: at the floor a bundle, and the lower median of the two is 15.",
    work: straight(
      [
        [100, 100],
        [100, 136],
      ],
      [
        [300, 100],
        [300, 115],
      ],
    ),
    median: 15,
  };
}

/** A sheet of one stroke `tall` units high, by the ceiling. */
function upright(name: string, tall: number, about: string): CropSheet {
  return {
    name,
    about,
    work: straight([
      [500, 300],
      [500, 300 + tall],
    ]),
    median: tall,
  };
}

export const underCeiling = () =>
  upright("under-ceiling", 99.9, "One stroke 99.9 high, 999 tenths: the scale takes it as it is.");
export const atCeiling = () =>
  upright("at-ceiling", 100, "One stroke 100 high, 1000 tenths: the ceiling itself.");
export const overCeiling = () =>
  upright("over-ceiling", 100.1, "One stroke 100.1 high, 1001 tenths: the scale takes 100.");

export function limit(): CropSheet {
  return {
    name: "limit",
    about:
      "Three dots that span 660 by 1362 units: no bundle, so the median is 15. At 17 px the crop is 772 by 1568 px, 28 by 56 tiles of 28 px, 1568 tokens: at both of Claude's limits at once. From 18 px up it is drawn at 17.",
    work: straight([[100, 10]], [[760, 10]], [[100, 1372]]),
    median: 15,
  };
}

/** The sheets of the crop alone, after those of the groups. */
export const CROP_SHEETS: readonly (() => CropSheet)[] = [
  ladder,
  ladderAndNumber,
  house,
  fraction,
  rows,
  slant,
  ringed,
  crossedOut,
  table,
  column,
  fours,
  dashes,
  dot,
  whole,
  answer,
  touching,
  apart,
  underFloor,
  atFloor,
  underCeiling,
  atCeiling,
  overCeiling,
  limit,
];
