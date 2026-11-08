// The synthetic hand: a pen that writes characters, lines and words through the recorder onto the
// work, on the sheet's one clock, and erases, clears and undoes on that clock too (R22), as the
// element hands a pen's events over. Code draws every stroke of it, and no hand wrote any
// (CLAUDE.md): its characters are its own, boxes 10 by 10 of points scaled to a font. The synthetic
// samples draw with it (R49), and so do the synthetic sheets and pages of the tests.

import { Clock } from "../core/clock.js";
import { type PointerSample, Recorder } from "../core/recorder.js";
import { Work } from "../core/work.js";

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
  "×": [
    [
      [1, 1],
      [9, 9],
    ],
    [
      [9, 1],
      [1, 9],
    ],
  ],
  "<": [
    [
      [10, 0],
      [0, 5],
      [10, 10],
    ],
  ],
  ">": [
    [
      [0, 0],
      [10, 5],
      [0, 10],
    ],
  ],
  "/": [
    [
      [8, 0],
      [2, 10],
    ],
  ],
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

/** How wide `text` stands in a font, in units: from its first character's left to its last's right. */
export function widthOf(text: string, font: Font): number {
  return font.advance * ([...text].length - 1) + font.width;
}

/** A font `height` units high, of the proportions of the digits of the synthetic sheets. */
export function fontOf(height: number): Font {
  return {
    ...DIGITS,
    height,
    width: Math.round((height * DIGITS.width) / DIGITS.height),
    advance: Math.round((height * DIGITS.advance) / DIGITS.height),
  };
}

/** The time a pen takes from one point to the next: 8 ms for every 3 units, as tutor's writer goes. */
function stepMs(a: Spot, b: Spot): number {
  return 8 * Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) / 30));
}

/**
 * How densely a hand's points stand: as given, a point at each corner of a stroke, or a point every
 * `step` units between the corners, as the input gives one every 1 to 3 units. Those between move
 * by up to `wobble` units each way, by the seed, as a hand's do; the corners stay.
 */
export interface Density {
  readonly step: number;
  readonly wobble: number;
  readonly seed: number;
}

/**
 * The spots between the corners, every `step` tenths along the longer of the two axes — the
 * stroke's own direction, with no square root — each moved by up to `wobble` tenths.
 */
function densify(spots: readonly Spot[], { step, wobble, seed }: Density): Spot[] {
  const next = random(seed);
  const tenths = Math.round(step * 10);
  if (!(tenths >= 1))
    throw new RangeError(`a step of points is a tenth of a unit at least, not ${step}`);
  const shake = Math.round(wobble * 10);
  const out: Spot[] = [];
  for (const [n, [x, y]] of spots.entries()) {
    const last = spots[n - 1];
    if (last !== undefined) {
      const [lx, ly] = last;
      const parts = Math.ceil(Math.max(Math.abs(x - lx), Math.abs(y - ly)) / tenths);
      for (let k = 1; k < parts; k++) {
        const jitter = () => Math.round((2 * next() - 1) * shake);
        out.push([
          lx + Math.round(((x - lx) * k) / parts) + jitter(),
          ly + Math.round(((y - ly) * k) / parts) + jitter(),
        ]);
      }
    }
    out.push([x, y]);
  }
  return out;
}

/** A pen on a sheet: its events through the recorder onto the work, on the sheet's one clock. */
export class Hand {
  readonly #clock = new Clock();
  readonly work = new Work(this.#clock);
  readonly #recorder = new Recorder((done) => this.work.write(done), this.#clock);
  /** The page's time. The sheet's 0 is the hand's first event. */
  #now = 1000;
  /** How densely the points of its strokes stand: at their corners alone, unless given. */
  readonly #density: Density | undefined;
  /** How many strokes it has written: each wobbles by a seed of its own. */
  #written = 0;

  constructor(density?: Density) {
    this.#density = density;
  }

  /** The hand rests. */
  wait(ms: number): void {
    this.#now += ms;
  }

  /** One stroke through the spots; its ID. A single spot is a dot, 30 ms long. */
  stroke(given: readonly Spot[]): number {
    const density = this.#density;
    const spots =
      density === undefined
        ? given
        : densify(given, { ...density, seed: density.seed + this.#written });
    this.#written += 1;
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
