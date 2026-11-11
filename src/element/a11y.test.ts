// The element by axe-core (T90 in RUN.md; R70 in docs/decisions.md): every kind of canvas has no
// violation of WCAG 2.2 level AA that axe finds in its shadow tree (R90 spec), and a violation put
// into it fails the helper. axe cannot tell the background of a workbook's printed lines, which the
// layer of input covers: their contrast is this test's own. The same kinds in forced colours are
// forced-colors.test.ts's.

import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { sheetTask } from "../core/tasks.fixture.js";
import { axeOf, contrast, KINDS } from "./axe.fixture.js";
import { placed, settle } from "./pointer.fixture.js";

const made: HTMLElement[] = [];

afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

test.each(KINDS)("$name has no violation that axe finds", async ({ put, incomplete }) => {
  await axeOf(await put(made), incomplete);
});

test.each(KINDS)(
  "$name, of a height its content overflows, has none either: its container is a region with a stop of Tab, which axe's scrollable-region-focusable asks of it (T93)",
  async ({ put, incomplete }) => {
    const element = await put(made);
    element.style.height = "300px";
    await settle();
    const viewport = element.shadowRoot?.querySelector(".viewport");
    expect(viewport?.getAttribute("role")).toBe("region");
    await axeOf(element, incomplete);
  },
);

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

/** The row's buttons as the element has them: a worked example's Next and Demo, hidden, first. */
function rowOf(element: HTMLElement) {
  const root = element.shadowRoot;
  const row = root?.querySelector<HTMLElement>(".tools");
  const [, , pen, , , , up] = [...(root?.querySelectorAll(".tools button") ?? [])];
  if (!root || !row || !pen || !up) throw new Error("the element has no row of buttons");
  return { root, row, pen, up };
}

test.each([
  { theme: "the default theme", paper: undefined, ink: undefined },
  { theme: "a dark theme of the consumer's", paper: "rgb(17, 17, 17)", ink: "rgb(238, 238, 238)" },
])(
  "in $theme a button in focus shows a solid ring two pixels wide and two out, in the ink's colour, at least 3:1 to the row's paper, on the tool in use and on an unavailable Up alike (T92)",
  async ({ paper, ink }) => {
    const { element } = await placed(made, 400, undefined, { task: sheetTask() });
    if (paper !== undefined) element.style.setProperty("--novatrail-canvas-paper", paper);
    if (ink !== undefined) element.style.setProperty("--novatrail-canvas-ink", ink);
    const { root, row, pen, up } = rowOf(element);
    await userEvent.tab();
    for (const focused of [pen, up]) {
      if (focused === up) await userEvent.keyboard("{End}{ArrowLeft}{ArrowLeft}{ArrowLeft}");
      expect(root.activeElement).toBe(focused);
      expect(focused.matches(":focus-visible")).toBe(true);
      const style = getComputedStyle(focused);
      expect([style.outlineStyle, style.outlineWidth, style.outlineOffset]).toEqual([
        "solid",
        "2px",
        "2px",
      ]);
      expect(style.outlineColor).toBe(getComputedStyle(row).color);
      // 1.4.11 Non-text Contrast: «at least 3:1 against adjacent color(s)» — the row's paper, which
      // the ring stands on, its offset too. An opacity would pale the ring with its button.
      expect(contrast(style.outlineColor, getComputedStyle(row).backgroundColor)).toBeGreaterThan(
        3,
      );
      expect(style.opacity).toBe("1");
    }
    expect(up.getAttribute("aria-disabled")).toBe("true");
    // The unavailable button is paler by its colour, between the ink and the paper.
    expect(getComputedStyle(up).color).not.toBe(getComputedStyle(row).color);
    await axeOf(element);
  },
);
