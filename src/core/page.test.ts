import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vitest";
import { isBox, LAYOUT, type Page, type PageBox, type PageText, pageOf } from "./page.js";
import { type CorpusPage, LONG, line, PAGES, SHORT } from "./pages.fixture.js";
import type { WorkbookItem } from "./task.js";
import { refusal, under } from "./tasks.fixture.js";
import {
  BREAKS,
  BY_WIDTH,
  DIGIT,
  SIGN,
  SIGNS,
  SPACE,
  SPACES,
  UNKNOWN,
  WIDE,
  WIDE_RANGES,
  ZERO,
} from "./widths.js";

/** A page of the corpus by its name. */
function corpus(name: string): CorpusPage {
  const page = PAGES.find((each) => each.name === name);
  if (page === undefined) throw new Error(`no page ${name} in the corpus`);
  return page;
}

/** The pages of the corpus that fit, laid out. */
const FITTING = PAGES.filter(({ refused }) => refused === undefined).map(
  (page) => [page.name, pageOf(page.items)] as const,
);

/** Every text and box of a page, the numbers among the texts. */
function partsOf(page: Page): (PageText | PageBox)[] {
  return page.items.flatMap((item) => [item.number, ...item.line]);
}

function texts(page: Page, item: number): string[] {
  return (page.items[item]?.line ?? []).flatMap((part) => (isBox(part) ? [] : [part.text]));
}

describe("the layout of a workbook's page", () => {
  test("is a function of the items alone, the same every time, and frozen to its leaves", () => {
    const items = corpus("mixed").items;
    const page = pageOf(items);
    expect(pageOf(structuredClone(items) as WorkbookItem[])).toEqual(page);
    expect(Object.isFrozen(page)).toBe(true);
    expect(Object.isFrozen(page.items)).toBe(true);
    for (const item of page.items) {
      expect(Object.isFrozen(item.number)).toBe(true);
      expect(Object.isFrozen(item.line)).toBe(true);
      for (const part of item.line) expect(Object.isFrozen(part)).toBe(true);
    }
  });

  test("puts short lines two to a row, in the task's order, rows 132 units apart", () => {
    const page = pageOf(corpus("times-ten").items);
    expect(page.items.map(({ boxes }) => [boxes[0]?.top, (boxes[0]?.left ?? 0) < 500])).toEqual([
      [40, true],
      [40, false],
      [172, true],
      [172, false],
      [304, true],
      [304, false],
      [436, true],
      [436, false],
      [568, true],
      [568, false],
    ]);
    // The second column starts at 520, and each line 56 units after its item's left.
    expect(page.items[0]?.line[0]).toMatchObject({ text: "7 × 2 =", left: 96 });
    expect(page.items[1]?.line[0]).toMatchObject({ text: "7 × 3 =", left: 576 });
    expect(page.bottom).toBe(668);
  });

  test("puts a short line before a long one alone in the left column, and the long one across the page", () => {
    const page = pageOf(corpus("workbook-page").items);
    const [first, second, third, long, last] = page.items;
    expect(first?.number.baseline).toBe(second?.number.baseline);
    expect(third?.number.left).toBe(56);
    expect((long?.number.baseline ?? 0) - (third?.number.baseline ?? 0)).toBe(132);
    expect(texts(page, 3)).toEqual(["Tom has 3 bags of 4 apples. He has", "apples."]);
    expect((last?.number.baseline ?? 0) - (long?.number.baseline ?? 0)).toBe(132);
    expect(last?.boxes).toHaveLength(2);
  });

  test("stands every short line of a school page in a column, and a remainder in brackets across the page", () => {
    for (const item of SHORT) {
      const page = pageOf([item, item]);
      expect(page.items[0]?.number.baseline, JSON.stringify(item)).toBe(
        page.items[1]?.number.baseline,
      );
    }
    const page = pageOf([LONG, LONG]);
    expect(page.items[1]?.number.baseline).toBeGreaterThan(page.items[0]?.number.baseline ?? 0);
  });

  test("leaves the draft at least half of a page of ten examples", () => {
    for (const name of ["times-ten", "fractions-ten"]) {
      expect(pageOf(corpus(name).items).bottom, name).toBeLessThanOrEqual(700);
    }
  });

  test("wraps a long line under itself, after its number, never wider than the page within its margins", () => {
    const page = pageOf(corpus("russian-problems").items);
    const lefts = new Set(
      page.items.flatMap(({ line }) => line.map((part) => part.left)).filter((x) => x < 120),
    );
    expect([...lefts]).toEqual([96]);
    const fourth = page.items[3];
    const baselines = new Set(fourth?.line.flatMap((part) => (isBox(part) ? [] : [part.baseline])));
    expect(baselines.size).toBeGreaterThanOrEqual(3);
  });

  test("keeps a box with the word after it, a closing mark with what it closes and an opening one with what it opens", () => {
    const page = pageOf(corpus("punctuation").items);
    expect(texts(page, 0)).toEqual(["He has", "."]);
    const [has, box, stop] = page.items[0]?.line ?? [];
    expect(box).toMatchObject({ left: (has?.left ?? 0) + (has?.width ?? 0) + 16 });
    expect(stop).toMatchObject({ left: (box?.left ?? 0) + 100 + 16 });
    // Two pieces of text with a closing mark between them stand with no room between them.
    const [apples, dot] = page.items[2]?.line ?? [];
    expect(dot?.left).toBe((apples?.left ?? 0) + (apples?.width ?? 0));
    // A line breaks before a box, never after it: the box and «apples.» go down together.
    const english = pageOf(corpus("russian-problems").items).items[1]?.line ?? [];
    const at = english.findIndex(isBox);
    expect(english[at]?.left).toBe(96);
    expect(english[at + 1]).toMatchObject({ text: "рублей." });
  });

  test("breaks a word wider than a line between its letters", () => {
    const page = pageOf(corpus("long-word").items);
    const words = texts(page, 0);
    expect(words.join("").replaceAll(" ", "")).toBe(
      `Thelongestword:${"supercalifragilistic".repeat(5)}anditsbox`,
    );
    for (const part of page.items[0]?.line ?? []) {
      expect(part.left + part.width).toBeLessThanOrEqual(960);
    }
    expect(new Set(page.items[0]?.line.map((part) => part.left))).toContain(96);
  });

  test("makes a run of white space one space and none at a piece's ends; a no-break space is a character", () => {
    const page = pageOf(corpus("white-space").items);
    expect(texts(page, 0)).toEqual(["7 ×", "= 56"]);
    expect(texts(page, 1)).toEqual([]);
    const [one, two] = page.items[1]?.boxes ?? [];
    expect((two?.left ?? 0) - (one?.left ?? 0)).toBe(100 + 32);
    expect(texts(page, 2)[0]).toBe(`2${String.fromCodePoint(0xa0)}км =`);
  });

  test("puts each number right in its column, on the baseline of its first line", () => {
    for (const [name, page] of FITTING) {
      for (const { number, line } of page.items) {
        const first = line[0];
        const left = first === undefined ? number.left : first.left;
        expect((number.left + number.width) % 1, name).toBe(0);
        expect(left - (number.left + number.width), name).toBeGreaterThanOrEqual(16);
      }
    }
    const page = pageOf(corpus("times-ten").items);
    expect(page.items[8]?.number).toEqual({ text: "9.", left: 56, baseline: 628, width: 24 });
    expect(page.items[9]?.number).toEqual({ text: "10.", left: 520, baseline: 628, width: 40 });
  });

  test("sets the baseline a third of the size below the middle of its line: of a box's, or of a line of text's", () => {
    const page = pageOf(corpus("long-word").items);
    const [first] = page.items[0]?.line ?? [];
    expect(first).toMatchObject({ text: "The longest word:", baseline: 40 + 23 + 10 });
    const box = page.items[0]?.boxes[0];
    const after = page.items[0]?.line.at(-2);
    expect(after).toMatchObject({ baseline: (box?.top ?? 0) + 50 + 10 });
  });

  test("gives every number whole, within the margins, and no two boxes nearer than 32 units", () => {
    for (const [name, page] of FITTING) {
      for (const part of partsOf(page)) {
        for (const value of Object.values(part)) {
          if (typeof value === "number") expect(Number.isInteger(value), name).toBe(true);
        }
        expect(part.left, name).toBeGreaterThanOrEqual(40);
        expect(part.left + part.width, name).toBeLessThanOrEqual(960);
        if (isBox(part)) {
          expect(part.top, name).toBeGreaterThanOrEqual(40);
          expect(part.top + part.height, name).toBeLessThanOrEqual(1360);
        }
      }
      const boxes = page.items.flatMap(({ boxes }) => boxes);
      boxes.forEach((a, i) => {
        for (const b of boxes.slice(i + 1)) {
          const across = Math.max(b.left - (a.left + a.width), a.left - (b.left + b.width));
          const down = Math.max(b.top - (a.top + a.height), a.top - (b.top + b.height));
          expect(Math.max(across, down), name).toBeGreaterThanOrEqual(32);
        }
      });
      expect(page.bottom, name).toBeLessThanOrEqual(1360);
    }
  });

  test("gives the boxes of an item by slot, the same objects its line has, in the order they are read", () => {
    for (const [, page] of FITTING) {
      for (const { line, boxes } of page.items) expect(boxes).toEqual(line.filter(isBox));
    }
    const boxes = PAGES.flatMap(({ refused, items }) =>
      refused === undefined ? pageOf(items).items.flatMap((item) => item.boxes) : [],
    );
    expect(boxes.every((box) => box.width === 100 && box.height === 100)).toBe(true);
  });

  test("refuses a task whose rows go below the page's margin, at the first item of the row with no room", () => {
    for (const { name, items, refused } of PAGES) {
      if (refused === undefined) continue;
      const message = refusal(() => pageOf(items));
      expect(under(message, `task.items[${refused}]`), `${name}: ${message}`).toBe(true);
    }
    // Twenty short lines are the most: ten rows.
    expect(pageOf(corpus("twenty-short").items).bottom).toBe(1328);
  });

  test("sizes characters by the table: е and its combining diaeresis as ё, a family or a flag as one square", () => {
    const page = pageOf(corpus("scripts").items);
    const width = (item: number) => page.items[item]?.line[0]?.width;
    // «е» + U+0308 «=» «ё»: 50 + 0, 26, 56, 26, 50 hundredths of 30.
    expect(width(0)).toBe(Math.ceil((30 * (50 + 26 + 56 + 26 + 50)) / 100));
    // 三 + 四 =: three squares and a sign.
    expect(width(1)).toBe(Math.ceil((30 * (100 + 26 + 56 + 26 + 100 + 26 + 56)) / 100));
    expect(width(3)).toBe(Math.ceil((30 * (100 + 26 + 56)) / 100));
    expect(width(4)).toBe(30);
    expect(width(5)).toBe(Math.ceil((30 * (60 + 26 + 56)) / 100));
  });

  test("breaks a line between two boxes, and a run no line may break word by word when it is wider than a line", () => {
    const boxes = pageOf(corpus("many-boxes").items).items[0];
    const tops = new Set(boxes?.boxes.map(({ top }) => top));
    expect(tops.size).toBe(2);
    const first = boxes?.line.find(isBox);
    expect(first?.left).toBeGreaterThan(96);
    const glued = pageOf(corpus("glued-run").items).items[0]?.line ?? [];
    const lines = new Set(glued.flatMap((part) => (isBox(part) ? [] : [part.baseline])));
    expect(lines.size).toBeGreaterThanOrEqual(2);
    for (const part of glued) expect(part.left + part.width).toBeLessThanOrEqual(960);
  });

  test("holds no more than 99 items, whatever the numbers let fit: their column is two digits wide", () => {
    const tiny = { ...LAYOUT, boxWidth: 10, boxHeight: 10, line: 10, items: 1, margin: 10 };
    const items = Array.from({ length: 100 }, () => line("[]"));
    const message = refusal(() => pageOf(items, tiny));
    expect(under(message, "task.items[99]"), message).toBe(true);
    expect(pageOf(items.slice(0, 99), tiny).items).toHaveLength(99);
  });

  test("takes other numbers, for the sweep that chose these", () => {
    const larger = { ...LAYOUT, boxWidth: 104, boxHeight: 104 };
    const message = refusal(() => pageOf(corpus("twenty-short").items, larger));
    expect(under(message, "task.items[18]"), message).toBe(true);
    const page = pageOf([line("7 × [] = 56")], { ...LAYOUT, size: 36 });
    expect(page.items[0]?.line[0]?.width).toBe(Math.ceil((36 * (53 + 26 + 56)) / 100));
  });
});

// The layout by spec's page (T85; R60): the numbers of format/page.yaml and its test vectors
// format/vectors/pages/, which the npm package @altnovatrail/spec carries as JSON (README of the
// format, §§9 and 14). They began as canvas's own, vectors/pages.json (R35), and spec made them the
// format's rule (R108 spec): the element lays a page out by the same numbers, and its tests hold its
// layout to the vectors. vectors/pages.json stays as it was last written, a record the decisions of
// E6 name, and no test writes it any more.

const require = createRequire(import.meta.url);
/** The page of format/page.yaml, as the package gives it. */
const SPEC_PAGE = require("@altnovatrail/spec/format/page.json") as {
  sheet: { width: number; height: number };
  numbers: Record<string, number>;
  most_items: number;
  widths: {
    digits: { characters: string; width: number };
    signs: { characters: string; width: number };
    space: number;
    characters: { width: number; characters: string }[];
    spaces: { code_point: string; width: number }[];
    zero: string[];
    wide: { width: number; ranges: string[] };
    breaks: string[];
    unknown: number;
  };
};
/** The folder of the page's vectors in the package. */
const SPEC_VECTORS = join(
  dirname(require.resolve("@altnovatrail/spec/format/page.json")),
  "vectors",
  "pages",
);

/** A code point as the page writes it: U+00A0. */
function hex(code: number): string {
  return `U+${code.toString(16).toUpperCase().padStart(4, "0")}`;
}

/** Ranges of code points as the page writes them. */
function ranges(list: readonly (readonly [number, number])[]): string[] {
  return list.map(([from, to]) => (from === to ? hex(from) : `${hex(from)}–${hex(to)}`));
}

test("the layout's numbers and widths are those of spec's page, format/page.yaml", () => {
  const { numbers, widths } = SPEC_PAGE;
  expect(SPEC_PAGE.sheet).toEqual({ width: 1000, height: 1400 });
  expect({
    size: numbers.size,
    boxWidth: numbers.box_width,
    boxHeight: numbers.box_height,
    line: numbers.line,
    lead: numbers.lead,
    gap: numbers.gap,
    apart: numbers.apart,
    items: numbers.items,
    gutter: numbers.gutter,
    margin: numbers.margin,
  }).toEqual(LAYOUT);
  expect(SPEC_PAGE.most_items).toBe(99);
  expect(widths.digits).toEqual({ characters: "0123456789", width: DIGIT });
  expect(widths.signs).toEqual({ characters: SIGNS, width: SIGN });
  expect(widths.space).toBe(SPACE);
  expect(widths.characters).toEqual(BY_WIDTH.map(([width, characters]) => ({ width, characters })));
  expect(widths.spaces).toEqual(SPACES.map(([code, width]) => ({ code_point: hex(code), width })));
  expect(widths.zero).toEqual(ranges(ZERO));
  expect(widths.wide).toEqual({ width: WIDE, ranges: ranges(WIDE_RANGES) });
  expect(widths.breaks).toEqual(BREAKS.map(hex));
  expect(widths.unknown).toBe(UNKNOWN);
});

test("the layout gives each test vector of spec's page, a page or the item with no room", () => {
  const names = readdirSync(SPEC_VECTORS).filter((name) => name.endsWith(".json"));
  expect(names.length).toBeGreaterThanOrEqual(19);
  for (const name of names) {
    const vector = JSON.parse(readFileSync(join(SPEC_VECTORS, name), "utf8")) as {
      items: WorkbookItem[];
      no_room_at?: number;
      bottom?: number;
      page?: unknown;
    };
    if (vector.no_room_at !== undefined) {
      const message = refusal(() => pageOf(vector.items));
      expect(message.startsWith(`task.items[${vector.no_room_at}]:`), `${name}: ${message}`).toBe(
        true,
      );
      continue;
    }
    const laid = pageOf(vector.items);
    expect(
      { bottom: laid.bottom, page: laid.items.map(({ number, line }) => ({ number, line })) },
      name,
    ).toEqual({ bottom: vector.bottom, page: vector.page });
  }
});
