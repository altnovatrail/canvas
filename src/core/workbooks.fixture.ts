// The workbooks of the boxes' rule (R37): pages laid out by R35, with what a hand wrote in their
// boxes and beside them, drawn by code as every test's strokes are (CLAUDE.md). Each stroke comes
// with where it belongs as a teacher sees it — its box, the draft, or either — set down as it was
// written, before any run of the rule. The tests of the rule and its test vectors take them, and
// the sweep of T48 took them, each at four densities of points. A module of the tests alone: the
// build leaves it out (tsconfig.build.json).

import { type Cell, cellsOf } from "./boxes.js";
import { pageOf } from "./page.js";
import { line, PAGES } from "./pages.fixture.js";
import { type Density, DIGITS, type Font, Hand, random } from "./sheets.fixture.js";
import type { Work } from "./work.js";

/**
 * Where a stroke belongs, as a teacher sees it: a box, by its item and slot from 1, the draft, or
 * either — a stroke a teacher would not call, which the rule may take or leave.
 */
export type Place = readonly [item: number, slot: number] | "draft" | "either";

/** A workbook the hand wrote on, and where each of its strokes belongs. */
export interface Workbook {
  readonly name: string;
  readonly about: string;
  readonly cells: readonly Cell[];
  readonly work: Work;
  /** Every stroke the hand wrote, the erased ones too: the page shows those of `work.strokes`. */
  readonly places: ReadonlyMap<number, Place>;
  /**
   * The characters written in boxes, each its strokes: one whose strokes go different ways is cut
   * in two, as the rule takes each stroke alone (R34).
   */
  readonly characters: readonly (readonly number[])[];
}

/** The densities of the sweep: points at the corners alone, and every 1, 2 and 3 units. */
export const DENSITIES: readonly (Density | undefined)[] = [
  undefined,
  { step: 1, wobble: 0.5, seed: 11 },
  { step: 2, wobble: 0.5, seed: 12 },
  { step: 3, wobble: 0.5, seed: 13 },
];

/** A font `height` units high, of the proportions of the digits of the synthetic sheets. */
function fontOf(height: number): Font {
  return {
    ...DIGITS,
    height,
    width: Math.round((height * DIGITS.width) / DIGITS.height),
    advance: Math.round((height * DIGITS.advance) / DIGITS.height),
  };
}

/** How text is set in a box: its height, and its middle moved off the box's middle. */
interface Setting {
  readonly height?: number;
  readonly dx?: number;
  readonly dy?: number;
}

/** The part of a character beyond its box, of its size, that still leaves it the box's answer. */
const OUT = 0.3;

/**
 * Where a character written for a box belongs: the box's, if its middle is in the box and no more
 * than three tenths of it, across or down, stand beyond the box's edges; either, if more do.
 */
function placeOf(cell: Cell, left: number, top: number, wide: number, high: number): Place {
  const { box } = cell;
  const beyond = (from: number, size: number, edge: number, span: number) =>
    Math.max(0, edge - from) + Math.max(0, from + size - (edge + span));
  const middle = (from: number, size: number, edge: number, span: number) =>
    from + size / 2 >= edge && from + size / 2 <= edge + span;
  const holds =
    middle(left, wide, box.left, box.width) &&
    middle(top, high, box.top, box.height) &&
    beyond(left, wide, box.left, box.width) <= OUT * wide &&
    beyond(top, high, box.top, box.height) <= OUT * high;
  return holds ? [cell.item, cell.slot] : "either";
}

/** A hand on a laid out page, which notes where each stroke it writes belongs. */
class Writer {
  readonly hand: Hand;
  readonly cells: readonly Cell[];
  readonly places = new Map<number, Place>();
  readonly characters: number[][] = [];

  constructor(cells: readonly Cell[], density?: Density) {
    this.cells = cells;
    this.hand = new Hand(density);
  }

  /** The box of an item and a slot, from 1. */
  cell(item: number, slot = 1): Cell {
    const cell = this.cells.find((each) => each.item === item && each.slot === slot);
    if (cell === undefined) throw new Error(`no box ${item}.${slot}`);
    return cell;
  }

  /**
   * Text whose box of `height` units has its top left corner at (x, y): its strokes the draft or
   * either, or, written for a box, each character's where `placeOf` puts it.
   */
  text(x: number, y: number, text: string, height: number, place: Place): number[] {
    const font = fontOf(height);
    const ids: number[] = [];
    for (const [n, char] of [...text].entries()) {
      const left = x + n * font.advance;
      const written = this.hand.write(char, left, y, font);
      const own =
        typeof place === "string"
          ? place
          : placeOf(this.cell(place[0], place[1]), left, y, font.width, height);
      for (const id of written) this.places.set(id, own);
      if (typeof own !== "string") this.characters.push(written);
      ids.push(...written);
    }
    return ids;
  }

  /** Text written for a box: in its middle, moved by the setting, a character a hand would. */
  answer(item: number, slot: number, text: string, setting: Setting = {}): number[] {
    const { height = 44, dx = 0, dy = 0 } = setting;
    const { box } = this.cell(item, slot);
    const font = fontOf(height);
    const wide = font.advance * ([...text].length - 1) + font.width;
    const x = box.left + (box.width - wide) / 2 + dx;
    const y = box.top + (box.height - height) / 2 + dy;
    return this.text(x, y, text, height, [item, slot]);
  }

  /**
   * A fraction written for a box, in two storeys: the numerator over a bar `bar` units long and
   * the denominator under it, 3 units off the bar, the whole moved by the setting.
   */
  fraction(item: number, slot: number, over: string, under: string, bar: number, setting: Setting) {
    const { height = 36, dx = 0, dy = 0 } = setting;
    const { box } = this.cell(item, slot);
    const font = fontOf(height);
    const middle = box.left + box.width / 2 + dx;
    const barY = box.top + box.height / 2 + dy;
    const centred = (text: string) =>
      middle - (font.advance * ([...text].length - 1) + font.width) / 2;
    this.text(centred(over), barY - 3 - height, over, height, [item, slot]);
    const id = this.hand.line(middle - bar / 2, barY, middle + bar / 2, barY);
    const own = placeOf(this.cell(item, slot), middle - bar / 2, barY, bar, 0);
    this.places.set(id, own);
    if (typeof own !== "string") this.characters.push([id]);
    this.text(centred(under), barY + 3, under, height, [item, slot]);
  }

  line(x1: number, y1: number, x2: number, y2: number, place: Place): number {
    const id = this.hand.line(x1, y1, x2, y2);
    this.places.set(id, place);
    return id;
  }

  dot(x: number, y: number, place: Place): number {
    const id = this.hand.dot(x, y);
    this.places.set(id, place);
    return id;
  }

  ring(x: number, y: number, width: number, height: number, place: Place): number {
    const id = this.hand.ring(x, y, width, height);
    this.places.set(id, place);
    return id;
  }

  word(x: number, y: number, humps: number, place: Place): number {
    const id = this.hand.word(x, y, humps);
    this.places.set(id, place);
    return id;
  }

  done(name: string, about: string): Workbook {
    const { cells, places, characters } = this;
    return { name, about, cells, work: this.hand.work, places, characters };
  }
}

/** The boxes of the page of a corpus page of the layout's tests. */
function cellsOfPage(name: string): readonly Cell[] {
  const page = PAGES.find((each) => each.name === name);
  if (page === undefined) throw new Error(`no page ${name}`);
  return cellsOf(pageOf(page.items));
}

/** The boxes of a page of these lines. */
function cellsOfLines(lines: readonly string[]): readonly Cell[] {
  return cellsOf(pageOf(lines.map(line)));
}

/** Ten lines whose boxes a comparison sign answers. */
const COMPARISONS = [
  "56 [] 65",
  "2/5 [] 3/5",
  "1/2 [] 2/4",
  "7 × 8 [] 54",
  "100 [] 99",
  "3/4 [] 1/2",
  "48 [] 84",
  "1000 [] 999",
  "6 × 6 [] 36",
  "0 [] 1",
];

/** Digits pushed past each side of their boxes, by up to 20 units. */
export function edgeDigits(density?: Density): Workbook {
  const pen = new Writer(cellsOfPage("times-ten"), density);
  const pushes: [string, number, number][] = [
    ["6", 0, 0],
    ["8", 4, 0],
    ["3", 12, 0],
    ["5", 20, 0],
    ["4", -8, 0],
    ["2", -16, 0],
    ["9", 0, -6],
    ["7", 0, -14],
    ["1", 0, 10],
    ["0", 0, 20],
  ];
  for (const [n, [digit, out, down]] of pushes.entries()) {
    const height = 50;
    const width = fontOf(height).width;
    // The push is past the edge: from the middle, half the box less half the character, and more.
    const dx = out === 0 ? 0 : Math.sign(out) * (50 - width / 2 + Math.abs(out));
    const dy = down === 0 ? 0 : Math.sign(down) * (50 - height / 2 + Math.abs(down));
    pen.answer(n + 1, 1, digit, { height, dx, dy });
  }
  return pen.done(
    "edge-digits",
    "Ten answers of one digit 50 high, pushed past the right, the left, the top and the bottom of their boxes by 0 to 20 units: each is its box's.",
  );
}

/** Characters of two strokes at the edge of their boxes, by 6 to 14 units. */
export function edgeSigns(density?: Density): Workbook {
  const pen = new Writer(cellsOfPage("times-ten"), density);
  const pushes: [string, number, number][] = [
    ["4", 6, 0],
    ["5", 10, 0],
    ["+", 14, 0],
    ["×", 8, 0],
    ["=", 0, 12],
    ["4", -10, 0],
    ["5", 0, -8],
    ["+", 0, 14],
    ["×", -14, 0],
    ["=", 0, -10],
  ];
  for (const [n, [text, out, down]] of pushes.entries()) {
    const height = 44;
    const width = fontOf(height).width;
    const dx = out === 0 ? 0 : Math.sign(out) * (50 - width / 2 + Math.abs(out));
    const dy = down === 0 ? 0 : Math.sign(down) * (50 - height / 2 + Math.abs(down));
    pen.answer(n + 1, 1, text, { height, dx, dy });
  }
  return pen.done(
    "edge-signs",
    "«4», «5», «+», «×» and «=», each two strokes, pushed past an edge of their boxes by 6 to 14 units: one stroke of each may stand outside, and the character is its box's.",
  );
}

/** Numbers of two and three digits, of three heights, the last digit up to 20 units past the edge. */
export function numbers(density?: Density): Workbook {
  const pen = new Writer(cellsOfPage("times-ten"), density);
  const answers = ["14", "21", "28", "35", "42", "49", "56", "63", "70", "7"];
  for (const [n, text] of answers.entries()) {
    const height = [36, 44, 50][n % 3] ?? 44;
    const dx = [0, 6, 14, 20, -12][n % 5] ?? 0;
    pen.answer(n + 1, 1, text, { height, dx });
  }
  return pen.done(
    "numbers",
    "Answers of two digits, 36, 44 and 50 high, moved up to 20 units right or 12 left: the last digit of the widest stands past the box's edge.",
  );
}

/** Numbers of up to three digits on the page of many kinds of lines. */
export function mixedNumbers(density?: Density): Workbook {
  const pen = new Writer(cellsOfPage("mixed"), density);
  const answers: [number, number, string, number, number][] = [
    [1, 1, "8", 60, 0],
    [2, 1, "12", 44, 10],
    [3, 1, "32", 50, 0],
    [5, 1, "1", 50, 0],
    [6, 1, "12", 44, -6],
    [7, 1, "7", 50, 8],
    [7, 2, "5", 50, 0],
    [8, 1, "635", 44, 0],
    [9, 1, "7", 44, 0],
    [9, 2, "5", 44, 0],
    [10, 1, "135", 50, 0],
    [11, 1, "10", 56, 0],
    [12, 1, "3", 40, 0],
  ];
  for (const [item, slot, text, height, dx] of answers)
    pen.answer(item, slot, text, { height, dx });
  pen.answer(4, 1, "<", { height: 36 });
  return pen.done(
    "mixed-numbers",
    "The page of many kinds of lines: answers of one to three digits 40 to 60 high — «635» and «135» as wide as their boxes — and a «<».",
  );
}

/** Fractions in two storeys, of bars up to 140 units long. */
export function fractions(density?: Density): Workbook {
  const pen = new Writer(cellsOfPage("fractions-ten"), density);
  const answers: [number, string, string, number, number, number][] = [
    [1, "3", "4", 30, 28, 0],
    [2, "2", "4", 36, 40, 0],
    [3, "3", "3", 40, 60, 0],
    [4, "4", "5", 44, 80, 0],
    [5, "2", "8", 36, 120, 0],
    [6, "3", "6", 36, 140, 0],
    [8, "2", "4", 32, 44, 10],
    [9, "4", "10", 36, 70, -8],
  ];
  for (const [item, over, under, height, bar, dy] of answers) {
    pen.fraction(item, 1, over, under, bar, { height, dy });
  }
  pen.answer(7, 1, "<", { height: 36 });
  pen.answer(10, 1, "=", { height: 30 });
  return pen.done(
    "fractions",
    "Fractions in two storeys, digits 30 to 44 high and bars 28 to 80 long, and two bars of 120 and 140, wider than their boxes; a «<» and a «=» answer the comparisons.",
  );
}

/** Fractions written in a line, 72 to 112 units wide. */
export function inline(density?: Density): Workbook {
  const pen = new Writer(cellsOfPage("fractions-ten"), density);
  const answers: [number, string, number][] = [
    [1, "3/4", 36],
    [2, "2/4", 44],
    [3, "3/3", 40],
    [4, "4/5", 36],
    [5, "2/8", 44],
    [6, "1/2", 36],
    [8, "2/4", 40],
    [9, "4/10", 40],
  ];
  for (const [item, text, height] of answers) pen.answer(item, 1, text, { height });
  return pen.done(
    "inline",
    "Fractions written in a line with «/», 36 to 44 high: «4/10» at 40 is 109 wide, past both sides of its box.",
  );
}

/** Comparison signs of 20 to 50 units, one «=» across the bottom edge. */
export function comparisons(density?: Density): Workbook {
  const pen = new Writer(cellsOfLines(COMPARISONS), density);
  const signs: [string, number, number][] = [
    ["<", 20, 0],
    ["<", 30, 6],
    ["<", 40, -6],
    ["<", 50, 0],
    [">", 36, 10],
    [">", 44, 0],
    ["<", 30, -10],
    [">", 50, 0],
    ["=", 36, 34],
    ["<", 26, 0],
  ];
  for (const [n, [sign, height, dy]] of signs.entries()) pen.answer(n + 1, 1, sign, { height, dy });
  return pen.done(
    "comparisons",
    "Comparison signs 20 to 50 high as the answers of ten lines; the «=» of the ninth stands across the bottom edge of its box, its lower bar 4 units past it.",
  );
}

/** Answers that drift toward the box beside and the row below, by 4 to 14 units. */
export function neighbours(density?: Density): Workbook {
  const pen = new Writer(cellsOfPage("many-boxes"), density);
  const drifts: [number, string, number, number][] = [
    [1, "3", 4, 0],
    [2, "8", 10, 0],
    [3, "5", 14, 0],
    [4, "9", -14, 0],
    [5, "6", 0, 14],
    [6, "2", 12, 0],
    [7, "4", -10, -12],
  ];
  for (const [slot, digit, out, down] of drifts) {
    const height = 50;
    const width = fontOf(height).width;
    const dx = out === 0 ? 0 : Math.sign(out) * (50 - width / 2 + Math.abs(out));
    const dy = down === 0 ? 0 : Math.sign(down) * (50 - height / 2 + Math.abs(down));
    pen.answer(1, slot, digit, { height, dx, dy });
  }
  return pen.done(
    "neighbours",
    "Seven boxes 32 apart, five in a row and two in the row below: each answer drifts 4 to 14 units into the gap toward a box beside or the row below, and stays its own box's.",
  );
}

/** Strokes across two boxes. */
export function across(density?: Density): Workbook {
  const pen = new Writer(cellsOfPage("many-boxes"), density);
  const one = pen.cell(1, 1).box;
  const two = pen.cell(1, 2).box;
  const three = pen.cell(1, 3).box;
  pen.line(one.left + 50, one.top + 50, two.left + 50, two.top + 50, "draft");
  // A tall «1» in the second box that runs 14 units into the gap below.
  pen.text(two.left + 40, two.top + 10, "1", 104, [1, 2]);
  pen.word(three.left + 60, three.top + 40, 9, "either");
  pen.answer(1, 5, "7", { height: 50 });
  const four = pen.cell(1, 7).box;
  pen.line(four.left + 20, four.top - 60, four.left + 80, four.top + 140, "draft");
  return pen.done(
    "across",
    "A line from the middle of one box to the middle of the next is no answer; a tall «1» running 14 units below its box is its own; a scribble over two boxes is either; a line from the row above through a box and below it is the draft.",
  );
}

/** Draft beside the boxes: a column sum, numbers off the boxes, dots near them. */
export function draft(density?: Density): Workbook {
  const pen = new Writer(cellsOfPage("times-ten"), density);
  // A column sum between the two columns of boxes, 30 units off the left column at least.
  pen.text(340, 60, "56", 30, "draft");
  pen.text(340, 96, "+7", 30, "draft");
  pen.line(336, 132, 400, 132, "draft");
  pen.text(340, 140, "63", 30, "draft");
  for (const [n, off] of [8, 16, 24, 48].entries()) {
    const { box } = pen.cell(2 * n + 3);
    pen.text(box.left + box.width + off, box.top + 30, "7", 36, "draft");
  }
  const { box } = pen.cell(9);
  pen.dot(box.left + box.width + 8, box.top + 50, "draft");
  pen.dot(box.left + box.width + 16, box.top + 20, "draft");
  pen.dot(box.left + box.width + 2, box.top + 70, "either");
  pen.dot(box.left - 4, box.top + 50, "either");
  pen.dot(box.left + 6, box.top + 6, [9, 1]);
  pen.answer(1, 1, "14");
  pen.answer(10, 1, "7");
  return pen.done(
    "draft",
    "A column sum between the columns of boxes, a «7» 8 to 48 units right of four boxes and dots 8 and 16 off a box are the draft; dots 2 and 4 off it are either; a dot in its corner is its own.",
  );
}

/** Rings round an answer, a box and a line. */
export function rings(density?: Density): Workbook {
  const pen = new Writer(cellsOfPage("times-ten"), density);
  for (const item of [1, 3, 5]) {
    const { box } = pen.cell(item);
    pen.answer(item, 1, String(7 * (item + 1)), { height: 40 });
    if (item === 1) pen.ring(box.left + 12, box.top + 18, 76, 64, [item, 1]);
    if (item === 3) pen.ring(box.left - 15, box.top - 15, 130, 130, "either");
    if (item === 5) pen.ring(box.left - 180, box.top - 10, 300, 120, "draft");
  }
  return pen.done(
    "rings",
    "A ring round the answer within its box is its own; a ring round a whole box is either; a ring round the whole line, its text and its box, is the draft.",
  );
}

/** Lines crossing out a line, and an answer crossed out and written again. */
export function crossed(density?: Density): Workbook {
  const pen = new Writer(cellsOfPage("times-ten"), density);
  const first = pen.cell(1).box;
  pen.answer(1, 1, "14");
  pen.line(30, first.top + 50, first.left + first.width + 20, first.top + 50, "draft");
  const third = pen.cell(3).box;
  pen.answer(3, 1, "28");
  pen.line(30, third.top, third.left + third.width + 10, third.top + third.height, "draft");
  pen.line(30, third.top + third.height, third.left + third.width + 10, third.top, "draft");
  // An answer crossed out within its box, and the right one squeezed beside it, past the edge.
  const fifth = pen.cell(5).box;
  pen.answer(5, 1, "24", { height: 36, dx: -20 });
  pen.line(fifth.left + 14, fifth.top + 70, fifth.left + 56, fifth.top + 30, [5, 1]);
  pen.text(fifth.left + 62, fifth.top + 20, "42", 36, [5, 1]);
  const seventh = pen.cell(7).box;
  pen.answer(7, 1, "9", { height: 44, dx: -24 });
  pen.line(seventh.left + 12, seventh.top + 76, seventh.left + 40, seventh.top + 24, [7, 1]);
  pen.text(seventh.left + 70, seventh.top + 26, "56", 36, [7, 1]);
  return pen.done(
    "crossed",
    "A line through a whole line and a cross over another are the draft; an answer crossed out in its box and the right one written beside it, up to 25 units past the edge, are the box's.",
  );
}

/** Answers erased and written again, and a page cleared and brought back. */
export function erased(density?: Density): Workbook {
  const pen = new Writer(cellsOfPage("times-ten"), density);
  const wrong = pen.answer(1, 1, "16");
  pen.hand.erase(wrong);
  pen.answer(1, 1, "14");
  pen.answer(2, 1, "21");
  pen.hand.clear();
  pen.hand.undo();
  const again = pen.answer(3, 1, "27");
  pen.hand.erase(again.slice(1));
  pen.answer(3, 1, "8", { dx: 12 });
  return pen.done(
    "erased",
    "An answer erased and written again, a page cleared and the clearing undone, and the last digit of an answer erased and written anew: only the strokes the page shows count.",
  );
}

/** The hand-made workbooks, each at a density. */
export const WORKBOOKS: readonly ((density?: Density) => Workbook)[] = [
  edgeDigits,
  edgeSigns,
  numbers,
  mixedNumbers,
  fractions,
  inline,
  comparisons,
  neighbours,
  across,
  draft,
  rings,
  crossed,
  erased,
];

/** The pages the seeded workbooks are written on. */
const SEEDED = ["times-ten", "fractions-ten", "mixed", "twenty-short"];

/**
 * A workbook of a seed: an answer in every box — one to three digits, a fraction or a sign, 28 to
 * 60 high, its middle up to 20 units off the box's — and three to six pieces of draft 8 to 48 units
 * off the nearest box and at least 8 off every box.
 */
export function seeded(seed: number, density?: Density): Workbook {
  const next = random(seed);
  const between = (from: number, to: number) => from + Math.floor(next() * (to - from + 1));
  const page = SEEDED[seed % SEEDED.length] ?? "times-ten";
  const pen = new Writer(cellsOfPage(page), density);
  for (const { item, slot } of pen.cells) {
    const kind = between(0, 4);
    const setting = { height: between(28, 60), dx: between(-20, 20), dy: between(-20, 20) };
    if (kind === 3) {
      const height = between(28, 40);
      pen.fraction(item, slot, String(between(1, 9)), String(between(2, 12)), between(28, 80), {
        height,
        dx: setting.dx / 2,
        dy: setting.dy / 2,
      });
    } else if (kind === 4) {
      pen.answer(item, slot, ["<", ">", "="][between(0, 2)] ?? "=", setting);
    } else {
      const digits = String(between(kind === 0 ? 0 : 10 ** kind, 10 ** (kind + 1) - 1));
      // Three digits higher than 44 stand far past both sides: a hand writes them smaller.
      pen.answer(item, slot, digits, {
        ...setting,
        height: Math.min(setting.height, 44 + 6 * (2 - kind)),
      });
    }
  }
  const pieces = between(3, 6);
  for (let made = 0, tries = 0; made < pieces && tries < 200; tries++) {
    const x = between(20, 940);
    const y = between(20, 1300);
    const off = (cell: Cell, wide: number, high: number) =>
      Math.max(
        cell.box.left - (x + wide),
        x - (cell.box.left + cell.box.width),
        cell.box.top - (y + high),
        y - (cell.box.top + cell.box.height),
      );
    const wide = 40;
    const high = 30;
    const offs = pen.cells.map((cell) => off(cell, wide, high));
    const nearest = Math.min(...offs);
    if (nearest < 8 || nearest > 48) continue;
    if (next() < 0.3) pen.dot(x + 10, y + 10, "draft");
    else pen.text(x, y, String(between(10, 99)), high, "draft");
    made += 1;
  }
  return pen.done(
    `seeded-${seed}`,
    `A workbook of seed ${seed} on the page ${page}: an answer in every box, and draft 8 to 48 units off the boxes.`,
  );
}
