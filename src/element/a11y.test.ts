// The element by axe-core (T90 in RUN.md; R70 in docs/decisions.md): every kind of canvas has no
// violation of WCAG 2.2 level AA that axe finds in its shadow tree (R90 spec), and a violation put
// into it fails the helper. axe cannot tell the background of a workbook's printed lines, which the
// layer of input covers: their contrast is this test's own. The same kinds in forced colours are
// forced-colors.test.ts's.

import { afterEach, expect, test } from "vitest";
import { sheetTask } from "../core/tasks.fixture.js";
import { axeOf, contrast, KINDS } from "./axe.fixture.js";
import { placed } from "./pointer.fixture.js";

const made: HTMLElement[] = [];

afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

test.each(KINDS)("$name has no violation that axe finds", async ({ put, incomplete }) => {
  await axeOf(await put(made), incomplete);
});

test.each(KINDS.filter(({ incomplete }) => incomplete.includes("color-contrast")))(
  "$name: its printed lines stand out from its paper, as axe cannot tell",
  async ({ put }) => {
    const root = (await put(made)).shadowRoot;
    const paper = root?.querySelector(".sheet");
    const texts = [...(root?.querySelectorAll(".print text") ?? [])];
    if (!paper) throw new Error("the element has no sheet");
    expect(texts.length).toBeGreaterThan(0);
    // 1.4.3 Contrast (Minimum): «at least 4.5:1» for text of the size of the lines.
    const background = getComputedStyle(paper).backgroundColor;
    for (const text of texts) {
      expect(contrast(getComputedStyle(text).fill, background)).toBeGreaterThanOrEqual(4.5);
    }
  },
);

test("the contrast of the default ink on paper, and none for a colour seen through", () => {
  expect(contrast("rgb(17, 17, 17)", "rgb(255, 255, 255)")).toBeCloseTo(18.88, 1);
  expect(() => contrast("rgba(17, 17, 17, 0.3)", "rgb(255, 255, 255)")).toThrow(/not opaque/);
  expect(() => contrast("rgb(17, 17, 17)", "rgba(0, 0, 0, 0)")).toThrow(/not opaque/);
});

test("a violation in the shadow tree fails the helper, and so does an incomplete rule not named", async () => {
  const { element } = await placed(made, 400, undefined, { task: sheetTask() });
  const nameless = document.createElement("button");
  element.shadowRoot?.append(nameless);
  await expect(axeOf(element)).rejects.toThrow(/button-name/);
  nameless.remove();
  await axeOf(element);
  await expect(axeOf(element, ["color-contrast"])).rejects.toThrow(/incomplete nothing/);
});
