// The width table of the workbook's layout against the fonts of the image the tests run in (R35):
// its numbers are the canvas's own, each the mean of Liberation Sans and Liberation Serif, and the
// text SVG fits to them keeps its shape — what the fitting stretches or squeezes stays within an
// eighth in either font. A font of another width, as Liberation Mono, is fitted all the same: its
// text is measured, and only bounded. T22 measures the fonts of the devices.

import { afterAll, expect, test } from "vitest";
import { isBox, LAYOUT, pageOf } from "../core/page.js";
import { PAGES } from "../core/pages.fixture.js";
import { BY_WIDTH, DIGIT, SIGN, SIGNS, SPACES } from "../core/widths.js";

const SVG = "http://www.w3.org/2000/svg";
const SANS = "Liberation Sans";
const SERIF = "Liberation Serif";
const MONO = "Liberation Mono";

/** ⋅ and ∶, which the fonts lack: the table gives them the widths of · and :. */
const BORROWED = [0x22c5, 0x2236];

const svg = document.createElementNS(SVG, "svg");
svg.setAttribute("width", "2000");
svg.setAttribute("height", "200");
document.body.append(svg);
afterAll(() => svg.remove());

/** How long a text is in a font at a size, with nothing fitted: the browser's own measure. */
function natural(text: string, family: string, size: number): number {
  const element = document.createElementNS(SVG, "text");
  element.setAttribute("font-family", family);
  element.setAttribute("font-size", String(size));
  element.textContent = text;
  svg.append(element);
  const length = element.getComputedTextLength();
  element.remove();
  return length;
}

/** The table's number for a character from the fonts: their mean, in hundredths of the size. */
function measured(character: string): number {
  return (natural(character, SANS, 1000) + natural(character, SERIF, 1000)) / 20;
}

test("each number of the width table is the rounded mean of Liberation Sans and Serif", () => {
  for (const [width, characters] of BY_WIDTH) {
    for (const character of characters) {
      if (BORROWED.includes(character.codePointAt(0) ?? 0)) continue;
      expect(Math.round(measured(character)), character).toBe(width);
    }
  }
  for (const [code, width] of SPACES) {
    expect(Math.round(measured(String.fromCodePoint(code))), code.toString(16)).toBe(width);
  }
  const mean = (characters: string) =>
    Array.from(characters, measured).reduce((sum, each) => sum + each, 0) / characters.length;
  expect(Math.round(mean("0123456789"))).toBe(DIGIT);
  expect(Math.round(mean(SIGNS))).toBe(SIGN);
});

test("fitting the corpus's texts to the table stretches or squeezes them by an eighth at most in Sans and Serif", () => {
  const ratios: Record<string, number[]> = { [SANS]: [], [SERIF]: [], [MONO]: [] };
  for (const page of PAGES) {
    if (!page.fonts || page.refused !== undefined) continue;
    for (const item of pageOf(page.items).items) {
      for (const part of [item.number, ...item.line]) {
        if (isBox(part)) continue;
        for (const family of [SANS, SERIF, MONO]) {
          const ratio = natural(part.text, family, LAYOUT.size) / part.width;
          ratios[family]?.push(ratio);
          if (family === MONO) continue;
          expect(ratio, `${part.text} in ${family}`).toBeGreaterThanOrEqual(0.88);
          expect(ratio, `${part.text} in ${family}`).toBeLessThanOrEqual(1.12);
        }
      }
    }
  }
  // A font of another width is fitted all the same: Mono's half of the texts squeezed by more than
  // two fifths, and a lone «.» the most, to less than half its own width (R35).
  expect(Math.max(...(ratios[MONO] ?? []))).toBeLessThanOrEqual(2.5);
  expect(ratios[SANS]?.length).toBeGreaterThan(100);
});
