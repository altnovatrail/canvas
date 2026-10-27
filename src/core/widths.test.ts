import { expect, test } from "vitest";
import {
  BY_WIDTH,
  breaks,
  clustersOf,
  DIGIT,
  SIGN,
  SIGNS,
  UNKNOWN,
  WIDE,
  widthOf,
  wordsOf,
  wordWidth,
} from "./widths.js";

const code = (character: string): number => character.codePointAt(0) ?? 0;
const of = (...codes: number[]): string => String.fromCodePoint(...codes);

const COMBINING_DIAERESIS = 0x0308;
const ZWJ = 0x200d;
const NO_BREAK_SPACE = 0x00a0;
const ZERO_WIDTH_SPACE = 0x200b;
const VARIATION = 0xfe0f;
const SKIN = 0x1f3fd;

test("a digit, a sign and a character of the table each have their width, in hundredths of the size", () => {
  for (const digit of "0123456789") expect(widthOf(code(digit))).toBe(DIGIT);
  for (const sign of SIGNS) expect(widthOf(code(sign)), sign).toBe(SIGN);
  for (const [width, characters] of BY_WIDTH) {
    for (const character of characters) expect(widthOf(code(character)), character).toBe(width);
  }
  expect(widthOf(code("r"))).toBe(33);
  expect(widthOf(code("Ю"))).toBe(102);
  expect(widthOf(NO_BREAK_SPACE)).toBe(26);
});

test("a character of no width, a wide one and one the table does not know", () => {
  expect(widthOf(COMBINING_DIAERESIS)).toBe(0);
  expect(widthOf(ZWJ)).toBe(0);
  expect(widthOf(VARIATION)).toBe(0);
  expect(widthOf(SKIN)).toBe(0);
  expect(widthOf(code("三"))).toBe(WIDE);
  expect(widthOf(code("🍎"))).toBe(WIDE);
  expect(widthOf(code("π"))).toBe(UNKNOWN);
  expect(widthOf(code("ש"))).toBe(UNKNOWN);
  expect(widthOf(code("é"))).toBe(UNKNOWN);
  // A lone surrogate is a code point of its own, of the unknown width.
  expect(widthOf(0xd83c)).toBe(UNKNOWN);
});

test("each character of the table has one width, and no digit or sign is among them", () => {
  const seen = new Set<string>();
  for (const [, characters] of BY_WIDTH) {
    for (const character of characters) {
      expect(seen.has(character), character).toBe(false);
      seen.add(character);
      expect("0123456789".includes(character) || SIGNS.includes(character), character).toBe(false);
    }
  }
});

test("a line breaks at runs of white space alone, which are one space; a no-break space is a character of its word", () => {
  expect(wordsOf("\t7  ×\n= 56 ")).toEqual(["7", "×", "=", "56"]);
  expect(wordsOf(" \t ")).toEqual([]);
  expect(wordsOf(`2${of(NO_BREAK_SPACE)}км`)).toEqual([`2${of(NO_BREAK_SPACE)}км`]);
  // The zero-width space neither breaks nor shows: joining the words again would draw a space.
  expect(wordsOf(`a${of(ZERO_WIDTH_SPACE)}b`)).toHaveLength(1);
  for (const at of [0x09, 0x0a, 0x0d, 0x20, 0x2028]) expect(breaks(at)).toBe(true);
  for (const at of [NO_BREAK_SPACE, ZERO_WIDTH_SPACE, 0x3000]) expect(breaks(at)).toBe(false);
});

test("a cluster is a character with what joins it: a combining mark, a joined emoji, a flag's second half", () => {
  const e = `е${of(COMBINING_DIAERESIS)}`;
  expect(clustersOf(`${e}ж`)).toEqual([e, "ж"]);
  expect(wordWidth(e)).toBe(wordWidth("ё"));
  const family = of(0x1f468, ZWJ, 0x1f469, ZWJ, 0x1f467);
  expect(clustersOf(family)).toEqual([family]);
  expect(wordWidth(family)).toBe(WIDE);
  const flags = of(0x1f1fa, 0x1f1e6, 0x1f1ec, 0x1f1e7);
  expect(clustersOf(flags)).toEqual([of(0x1f1fa, 0x1f1e6), of(0x1f1ec, 0x1f1e7)]);
  const waved = of(0x1f44b, SKIN);
  expect(clustersOf(`${waved}!`)).toEqual([waved, "!"]);
  expect(clustersOf(`★${of(VARIATION)}`)).toHaveLength(1);
  // A mark that starts a word is a cluster of its own, of no width.
  expect(clustersOf(of(COMBINING_DIAERESIS, code("a")))).toEqual([of(COMBINING_DIAERESIS), "a"]);
  expect(clustersOf(of(0xd83c, code("a")))).toEqual([of(0xd83c), "a"]);
});
