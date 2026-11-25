// The element by axe-core: every kind of canvas has no violation of WCAG 2.2 level AA that
// axe finds in its shadow tree, and a violation put into it fails the helper. axe cannot
// tell the background of a workbook's printed lines, which the layer of input covers, nor that of a
// worked example's labelled buttons, which stand on glass over the canvas and the pictures of the
// sheet, which axe takes for images: their contrast is this test's own, against the glass over the
// paper, as the bar's ring of focus is. A tooltip's fill is opaque, and axe tells its contrast
// itself. The same kinds in forced colours are forced-colors.test.ts's.

import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { sheetTask } from "../core/tasks.fixture.js";
import { axeOf, contrast, KINDS, WORKBOOK_INCOMPLETE } from "./axe.fixture.js";
import { buttonOf, hand, level, placed, rest, settle } from "./pointer.fixture.js";

const made: HTMLElement[] = [];

// The decodes the element asks for, which the kinds with pictures wait for.
beforeEach(() => {
  vi.spyOn(HTMLImageElement.prototype, "decode");
});

afterEach(() => {
  for (const element of made.splice(0)) element.remove();
  vi.restoreAllMocks();
});

test.each(KINDS)("$name has no violation that axe finds", async ({ put, incomplete }) => {
  await axeOf(await put(made), incomplete);
});

/** The container of an element given a height, laid out anew. */
async function container(element: HTMLElement): Promise<HTMLElement> {
  await settle();
  const viewport = element.shadowRoot?.querySelector<HTMLElement>(".viewport");
  if (!viewport) throw new Error("the element has no container");
  return viewport;
}

test.each(KINDS)(
  "$name, of a height its content overflows, has none either: its container is a region with a stop of Tab, which axe's scrollable-region-focusable asks of it",
  async ({ put, incomplete, clear = incomplete, low = clear }) => {
    const element = await put(made);
    element.style.height = "300px";
    const viewport = await container(element);
    expect(viewport.getAttribute("role")).toBe("region");
    await axeOf(element, low);
  },
);

test.each(KINDS)(
  "$name, of that height, in a lang its labels are not in, has none either: the container is in English, which it is named in, and the column in German",
  async ({ put, incomplete, clear = incomplete, low = clear }) => {
    const element = await put(made);
    element.style.height = "300px";
    element.setAttribute("lang", "de");
    const viewport = await container(element);
    expect([viewport.getAttribute("role"), viewport.getAttribute("lang")]).toEqual([
      "region",
      "en",
    ]);
    expect(viewport.firstElementChild?.getAttribute("lang")).toBe("de");
    expect(["Sheet", "Workbook", "Worked example", "Task from paper"]).toContain(
      viewport.getAttribute("aria-label"),
    );
    await axeOf(element, low);
  },
);

test.each(KINDS.filter(({ incomplete }) => incomplete === WORKBOOK_INCOMPLETE))(
  "$name: its printed lines stand out from its paper, as axe cannot tell",
  async ({ put }) => {
    const root = (await put(made)).shadowRoot;
    const paper = root?.querySelector(".sheet");
    const texts = [...(root?.querySelectorAll(".print text") ?? [])];
    if (!paper) throw new Error("the element has no sheet");
    expect(texts.length).toBeGreaterThan(0);
    // WCAG 1.4.3 Contrast (Minimum): «at least 4.5:1» for text of the size of the lines.
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
  await expect(axeOf(element, ["color-contrast"])).rejects.toThrow(
    /incomplete nothing, not color-contrast:\ncolor-contrast: decided/,
  );
});

test("a tooltip the mouse shows over the sheet, white on its opaque fill, is one axe tells the contrast of, and finds none to fault", async () => {
  const { element } = await placed(made, 400, undefined, { task: sheetTask() });
  try {
    await userEvent.hover(buttonOf(element, "Undo"));
    const tip = element.shadowRoot?.querySelector<HTMLElement>(".tip");
    expect(tip?.hidden).toBe(false);
    await axeOf(element);
  } finally {
    await rest();
  }
});

/**
 * A colour as getComputedStyle gives it — rgb(), rgba(), or color(srgb …), as a color-mix() with
 * transparent computes — laid over an opaque one, as rgb() of whole channels: what the eye sees of
 * a fill seen through, such as the bar's glass over the paper.
 */
function over(colour: string, under: string): string {
  const numbers = (text: string) => (text.match(/[\d.]+(?:e-?\d+)?/g) ?? []).map(Number);
  const scale = colour.startsWith("color(srgb") ? 255 : 1;
  const [r = 0, g = 0, b = 0, alpha = colour === "transparent" ? 0 : 1] = numbers(colour);
  const below = numbers(under);
  const mixed = [r, g, b].map((c, n) =>
    Math.round(c * scale * alpha + (below[n] ?? 0) * (1 - alpha)),
  );
  return `rgb(${mixed.join(", ")})`;
}

/** The colour of the sheet's paper, which the bar and the tooltip stand over. */
function paperOf(element: HTMLElement): string {
  const paper = element.shadowRoot?.querySelector(".sheet");
  if (!paper) throw new Error("the element has no sheet");
  return getComputedStyle(paper).backgroundColor;
}

/** What a button of the bar or of a worked example's row stands on: its glass, over the paper. */
function glassOf(element: HTMLElement, box: Element): string {
  return over(getComputedStyle(box).backgroundColor, paperOf(element));
}

/** The bar's parts as the element has them, and the glass its buttons stand on. */
function barOf(element: HTMLElement) {
  const root = element.shadowRoot;
  const bar = root?.querySelector<HTMLElement>(".tools");
  if (!root || !bar) throw new Error("the element has no bar");
  const [pen, clear] = ["Pen", "Clear"].map((label) => buttonOf(element, label));
  if (!pen || !clear) throw new Error("the bar has no pen and no Clear");
  return { root, bar, pen, clear, glass: glassOf(element, bar) };
}

test("a colour seen through, laid over the paper, is what the eye sees of the two", () => {
  expect(over("rgba(255, 255, 255, 0.76)", "rgb(0, 0, 0)")).toBe("rgb(194, 194, 194)");
  expect(over("color(srgb 0 0.443137 0.890196 / 0.12)", "rgb(255, 255, 255)")).toBe(
    "rgb(224, 238, 252)",
  );
  expect(over("transparent", "rgb(17, 17, 17)")).toBe("rgb(17, 17, 17)");
  expect(over("rgb(1, 2, 3)", "rgb(17, 17, 17)")).toBe("rgb(1, 2, 3)");
});

test.each([
  { theme: "the default theme", colours: {}, accent: "rgb(0, 113, 227)" },
  {
    theme: "a dark theme of the consumer's",
    colours: {
      paper: "#111111",
      ink: "#eeeeee",
      glass: "rgba(28, 28, 30, 0.76)",
      accent: "#8fb4ff",
    },
    accent: "rgb(143, 180, 255)",
  },
])(
  "in $theme a button in focus shows a solid ring two pixels wide at its edge, in the accent, at least 3:1 to the glass over the paper and to the button's own fill, on the tool in use and on an unavailable Clear alike",
  async ({ colours, accent }) => {
    const { element } = await placed(made, 400, undefined, { task: sheetTask() });
    for (const [name, value] of Object.entries(colours)) {
      element.style.setProperty(`--novatrail-canvas-${name}`, value);
    }
    const { root, bar, pen, clear, glass } = barOf(element);
    await userEvent.tab();
    for (const focused of [pen, clear]) {
      // Clear stands before the zoom's two buttons, the last of the bar.
      if (focused === clear) await userEvent.keyboard("{End}{ArrowUp}{ArrowUp}");
      expect(root.activeElement).toBe(focused);
      expect(focused.matches(":focus-visible")).toBe(true);
      const style = getComputedStyle(focused);
      expect([style.outlineStyle, style.outlineWidth, style.outlineOffset]).toEqual([
        "solid",
        "2px",
        "0px",
      ]);
      expect(style.outlineColor).toBe(accent);
      // WCAG 1.4.11 Non-text Contrast: «at least 3:1 against adjacent color(s)» — the glass over
      // the paper outside the ring, and inside it the button's own fill over that glass: the accent
      // at an eighth on the tool in use. An opacity would pale the ring with its button.
      for (const adjacent of [glass, over(style.backgroundColor, glass)]) {
        expect(contrast(style.outlineColor, adjacent)).toBeGreaterThan(3);
      }
      expect(style.opacity).toBe("1");
    }
    expect(clear.getAttribute("aria-disabled")).toBe("true");
    // The unavailable button is paler by its colour, between the ink and the paper.
    expect(getComputedStyle(clear).color).not.toBe(getComputedStyle(bar).color);
    // Its tooltip shows, over the canvas, which axe takes for an image: the tooltip's fill is
    // opaque, so that axe tells its contrast without looking behind it, WCAG 1.4.3's «at least
    // 4.5:1».
    const tip = root.querySelector<HTMLElement>(".tip");
    if (!tip || tip.hidden) throw new Error("the button in focus shows no tooltip");
    const { color, backgroundColor } = getComputedStyle(tip);
    expect(contrast(color, backgroundColor)).toBeGreaterThanOrEqual(4.5);
    await axeOf(element);
  },
);

test.each(KINDS.filter(({ name }) => name.startsWith("a worked example")))(
  "$name: Next and Demo, labelled on the glass of its row, stand out from the glass over the paper, as axe cannot tell",
  async ({ put }) => {
    const element = await put(made);
    // Every part closed: Next has one to open, and is available.
    element.demoState = { opened: 0, hidden: false };
    await settle();
    const row = element.shadowRoot?.querySelector(".tools.row");
    if (!row) throw new Error("the worked example has no row");
    const glass = glassOf(element, row);
    const labelled = ["Next", "Demo"].map((label) => buttonOf(element, label));
    expect(labelled.every((button) => row.contains(button))).toBe(true);
    expect(
      labelled.map((button) => [button.textContent, button.hasAttribute("aria-disabled")]),
    ).toEqual([
      ["Next", false],
      ["Demo", false],
    ]);
    // WCAG 1.4.3 Contrast (Minimum): «at least 4.5:1» for text of the size of the labels.
    for (const button of labelled) {
      const { color, backgroundColor } = getComputedStyle(button);
      expect(contrast(color, over(backgroundColor, glass))).toBeGreaterThanOrEqual(4.5);
    }
  },
);

test("Select's popover has no violation axe finds, nor its bar over the strokes it took, whose labels stand out from the glass over the paper, as axe cannot tell", async () => {
  const { element, canvas, view } = await placed(made, 500, undefined, { task: sheetTask() });
  level(canvas, view(), 200, 100, 300);
  await settle();
  element.tool = "select";
  await userEvent.click(buttonOf(element, "Select"));
  // Once it has popped in: on its way its words are paler than they stand.
  const pop = element.shadowRoot?.querySelector<HTMLElement>(".pop.select");
  await Promise.all(pop?.getAnimations().map((animation) => animation.finished) ?? []);
  await axeOf(element);
  await userEvent.keyboard("{Escape}");
  const mouse = hand(canvas, view);
  mouse.down(60, 160);
  for (const [x, y] of [
    [340, 160],
    [340, 260],
    [60, 260],
  ] as const)
    mouse.move(x, y);
  mouse.up(60, 170);
  await settle();
  const bar = element.shadowRoot?.querySelector(".selection-bar");
  if (!(bar instanceof HTMLElement) || bar.hidden) throw new Error("Select shows no bar");
  // The bar stands on glass over the canvas, which axe takes for an image.
  await axeOf(element, ["color-contrast"]);
  const glass = glassOf(element, bar);
  // WCAG 1.4.3 Contrast (Minimum): «at least 4.5:1» for text of the size of the labels.
  for (const button of ["Copy", "Delete"].map((label) => buttonOf(element, label))) {
    const { color, backgroundColor } = getComputedStyle(button);
    expect(contrast(color, over(backgroundColor, glass))).toBeGreaterThanOrEqual(4.5);
  }
});

test("a bar taller than the band it stands in scrolls inside its glass and is still one stop of Tab, and End brings its last button whole into the glass's sight, as focus() does in Chromium and WebKit (1.4.10, 2.4.11)", async () => {
  const { root, row, viewport } = await placed(made, 400, 200, { task: sheetTask() });
  expect(row.scrollHeight).toBeGreaterThan(row.clientHeight);
  await userEvent.tab();
  expect(root.activeElement?.textContent).toBe("Pen");
  await userEvent.tab();
  expect(root.activeElement).toBe(viewport);
  await userEvent.tab({ shift: true });
  await userEvent.keyboard("{End}");
  const last = root.activeElement;
  expect(last?.textContent).toBe("Zoom out");
  const box = last?.getBoundingClientRect();
  const glass = row.getBoundingClientRect();
  expect(box?.top).toBeGreaterThanOrEqual(glass.top - 0.5);
  expect(box?.bottom).toBeLessThanOrEqual(glass.bottom + 0.5);
});
