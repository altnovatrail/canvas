import { afterEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { SHORT } from "../core/pages.fixture.js";
import { sheetTask, workbookTask, workedExample } from "../core/tasks.fixture.js";
import { consumerButton, placed, settle, spacer } from "./pointer.fixture.js";

// The bar of buttons in a narrow or a low window (T121; R84, R90 spec): the rail it stands in the
// middle of sticks over what scrolls the element, below the consumer's --novatrail-canvas-top, as
// tall as the part of the element in sight, and the bar, 52 CSS px wide at the element's left edge,
// is never wider than that: at 320 CSS px the page does not scroll sideways (1.4.10), as the
// mockup's "Two sizes" has it. A bar taller than its rail, less the rail's margins of 16 px, scrolls
// inside its glass, and the keyboard's focus brings each of its buttons into sight there (2.4.11).
// A button's ring of focus, two pixels outside its edge, stays on the glass, which clips what
// overflows it (2.4.7). The window of 1.4.10 is 320 × 256 CSS px: 1280 × 1024 at a zoom of 400 %.
// Each test sets the window it needs, and the next starts at Vitest's own, 414 × 896, whose body
// has no margin. A worked example's row of Next, Demo and the consumer's buttons, at the bottom,
// keeps within the element less 16 px at each side, and scrolls inside its glass across.

const made: HTMLElement[] = [];
afterEach(async () => {
  for (const element of made.splice(0)) element.remove();
  window.scrollTo({ top: 0, behavior: "instant" });
  await page.viewport(414, 896);
});

/** A window of this size, and its layout come. */
async function windowOf(width: number, height: number): Promise<void> {
  await page.viewport(width, height);
  await settle();
}

/** The rail the bar stands in, in the element's shadow root. */
function railOf(root: ShadowRoot): HTMLElement {
  const rail = root.querySelector<HTMLElement>(".rail");
  if (rail === null) throw new Error("the element has no rail");
  return rail;
}

/** The middle of a box, down the screen. */
const middleOf = (box: DOMRect) => (box.top + box.bottom) / 2;

/** The kinds of canvas whose bars are tried: a sheet, a workbook and a worked example. */
const KINDS: readonly {
  readonly name: string;
  readonly put: (width: number) => ReturnType<typeof placed>;
}[] = [
  {
    name: "a sheet",
    put: (width) => placed(made, width, undefined, { task: sheetTask() }),
  },
  {
    name: "a workbook",
    put: (width) => placed(made, width, undefined, { task: workbookTask(SHORT) }),
  },
  {
    name: "a worked example",
    put: async (width) => {
      const found = await placed(made, width);
      found.element.workedExample = workedExample();
      await settle();
      return found;
    },
  },
];

test.each(KINDS)(
  "$name: in a window of 320 × 256 the page does not scroll sideways, the bar stands in the window, and every button's ring of focus stays across on its glass",
  async ({ put }) => {
    await windowOf(320, 256);
    const { row } = await put(320);
    spacer(made);
    await settle();
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
    const bar = row.getBoundingClientRect();
    expect(bar.left).toBeGreaterThanOrEqual(0);
    expect(bar.right).toBeLessThanOrEqual(320);
    const shown = [...row.querySelectorAll("button")].filter((each) => !each.hidden);
    expect(shown.length).toBeGreaterThan(0);
    // The ring is two pixels wide and stands outside the button's edge.
    for (const each of shown) {
      const button = each.getBoundingClientRect();
      expect(button.left - 2).toBeGreaterThanOrEqual(bar.left);
      expect(button.right + 2).toBeLessThanOrEqual(bar.right);
    }
  },
);

test("a worked example in a window of 320 × 256: its row of Next, Demo and the consumer's button stands in the window, in its middle across, its bottom 16 pixels above the window's, and the page does not scroll sideways", async () => {
  await windowOf(320, 256);
  const { element, actions } = await placed(made, 320);
  element.append(consumerButton());
  element.workedExample = workedExample();
  spacer(made);
  await settle();
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
  const row = actions.getBoundingClientRect();
  expect(row.left).toBeGreaterThanOrEqual(16 - 0.5);
  expect(row.right).toBeLessThanOrEqual(320 - 16 + 0.5);
  expect(row.left + row.width / 2).toBeCloseTo(160, 0);
  expect(row.bottom).toBeCloseTo(256 - 16, 0);
});

/** The low places a sheet's bar is tried in: a window of 1.4.10, and an element given a height. */
const LOW: readonly {
  readonly name: string;
  readonly put: () => ReturnType<typeof placed>;
}[] = [
  {
    name: "in a window of 320 × 256, the page scrolling the element",
    put: async () => {
      await windowOf(320, 256);
      const found = await placed(made, 320, undefined, { task: sheetTask() });
      spacer(made);
      await settle();
      return found;
    },
  },
  {
    name: "in an element 200 px tall",
    put: () => placed(made, 400, 200, { task: sheetTask() }),
  },
];

test.each(LOW)(
  "$name the bar is no taller than its rail less the rail's margins and scrolls inside its glass, and the keyboard's focus brings its last button into sight there and its first back",
  async ({ put }) => {
    const { root, row } = await put();
    const rail = railOf(root).getBoundingClientRect();
    const bar = row.getBoundingClientRect();
    expect(rail.top).toBeGreaterThanOrEqual(-0.5);
    expect(rail.bottom).toBeLessThanOrEqual(window.innerHeight + 0.5);
    expect(bar.height).toBeLessThanOrEqual(rail.height - 32 + 0.5);
    expect(bar.top).toBeGreaterThanOrEqual(rail.top + 16 - 0.5);
    expect(row.scrollHeight).toBeGreaterThan(row.clientHeight);
    await userEvent.tab();
    expect(root.activeElement?.textContent).toBe("Pen");
    await userEvent.keyboard("{End}");
    const last = root.activeElement;
    expect(last?.textContent).toBe("Zoom out");
    expect(row.scrollTop).toBeGreaterThan(0);
    const button = last?.getBoundingClientRect();
    const now = row.getBoundingClientRect();
    expect(button?.top).toBeGreaterThanOrEqual(now.top - 0.5);
    expect(button?.bottom).toBeLessThanOrEqual(now.bottom + 0.5);
    expect(button?.bottom).toBeLessThanOrEqual(window.innerHeight + 0.5);
    await userEvent.keyboard("{Home}");
    expect(root.activeElement?.textContent).toBe("Pen");
    expect(row.scrollTop).toBeCloseTo(0, 0);
  },
);

/**
 * The consumer's offsets tried on a page that scrolls the element in a window 400 px tall, and
 * where each puts the rail's top: pixels, a percentage of the window, and `auto`, which counts
 * nothing.
 */
const OFFSETS: readonly { readonly offset: string | undefined; readonly top: number }[] = [
  { offset: undefined, top: 0 },
  { offset: "40px", top: 40 },
  { offset: "10%", top: 40 },
  { offset: "auto", top: 0 },
];

test.each(OFFSETS)(
  "without a height, in a page that scrolls the element, the rail sticks at the offset $offset and reaches the window's bottom, so that the bar stays in the middle of what is in sight as the page scrolls",
  async ({ offset, top }) => {
    await windowOf(414, 400);
    const { element, root, row } = await placed(made, 400, undefined, { task: sheetTask() });
    // A sheet 400 px wide is some 560 px tall: taller than the window, which it scrolls past.
    if (offset !== undefined) element.style.setProperty("--novatrail-canvas-top", offset);
    spacer(made);
    await settle();
    const middle = (top + window.innerHeight) / 2;
    for (const scrolled of [100, 150]) {
      window.scrollTo({ top: scrolled, behavior: "instant" });
      await settle();
      expect(element.getBoundingClientRect().top).toBeCloseTo(-scrolled, 0);
      const rail = railOf(root).getBoundingClientRect();
      expect(rail.top).toBeCloseTo(top, 0);
      expect(rail.bottom).toBeCloseTo(window.innerHeight, 0);
      expect(middleOf(row.getBoundingClientRect())).toBeCloseTo(middle, 0);
    }
  },
);

test.each(["auto", "hidden"])(
  "in an ancestor of overflow %s lower than the window the rail sticks to the ancestor, below the offset, and the bar stands within what the ancestor shows",
  async (overflow) => {
    await windowOf(414, 400);
    const scroller = document.createElement("div");
    scroller.style.cssText = `height: 300px; overflow: ${overflow};`;
    document.body.append(scroller);
    const { element, root, row } = await placed(made, 400, undefined, {
      parent: scroller,
      task: sheetTask(),
    });
    element.style.setProperty("--novatrail-canvas-top", "20px");
    scroller.scrollTop = 100;
    await settle();
    const sight = scroller.getBoundingClientRect();
    expect(element.getBoundingClientRect().top).toBeCloseTo(sight.top - 100, 0);
    expect(railOf(root).getBoundingClientRect().top).toBeCloseTo(sight.top + 20, 0);
    const bar = row.getBoundingClientRect();
    expect(bar.top).toBeGreaterThanOrEqual(sight.top + 20);
    expect(bar.bottom).toBeLessThanOrEqual(sight.bottom);
  },
);

test("a hidden element, whose bar has no height, shown again stands its bar where it stood, still scrolling inside its glass", async () => {
  const { element, root, row } = await placed(made, 400, 200, { task: sheetTask() });
  const where = () => {
    const rail = railOf(root).getBoundingClientRect();
    const bar = row.getBoundingClientRect();
    return [rail.top, rail.height, bar.top, bar.left, bar.width, bar.height];
  };
  const before = where();
  element.hidden = true;
  await settle();
  expect(row.getBoundingClientRect().height).toBe(0);
  element.hidden = false;
  await settle();
  expect(where()).toEqual(before);
  expect(row.scrollHeight).toBeGreaterThan(row.clientHeight);
});
