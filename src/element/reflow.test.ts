import { afterEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { SHORT } from "../core/pages.fixture.js";
import { sheetTask, workbookTask, workedExample } from "../core/tasks.fixture.js";
import type { NovatrailCanvas } from "./index.js";
import { placed, settle, spacer } from "./pointer.fixture.js";

// The row of buttons in a low window (T92; R28): it sticks over what scrolls the element while it
// is no taller than a quarter of it, below the consumer's --novatrail-canvas-top, and stands in its
// place otherwise, as WCAG's technique C34 un-fixes a sticky header (1.4.10, 2.4.11). The window of
// 1.4.10 is 320 × 256 CSS px: 1280 × 1024 at a zoom of 400 %. A button in focus keeps its whole
// ring in the row, at the window's edge too (2.4.7). Each test sets the window it needs, and the
// next starts at Vitest's own, 414 × 896.

const made: HTMLElement[] = [];
afterEach(async () => {
  for (const element of made.splice(0)) element.remove();
  document.body.style.margin = "";
  window.scrollTo({ top: 0, behavior: "instant" });
  await page.viewport(414, 896);
});

/** A window of this size, and its layout come. */
async function windowOf(width: number, height: number): Promise<void> {
  await page.viewport(width, height);
  await settle();
}

/** A button of the row by its label. */
function buttonOf(row: HTMLElement, label: string): HTMLButtonElement {
  const found = [...row.querySelectorAll("button")].find((each) => each.textContent === label);
  if (found === undefined) throw new Error(`the row has no ${label}`);
  return found;
}

/** Down pressed at the top of the page, which it scrolls by four fifths of the whole window. */
function downByWindow(row: HTMLElement) {
  const down = buttonOf(row, "Down");
  const sight = window.visualViewport?.height ?? window.innerHeight;
  down.click();
  expect(window.scrollY).toBeCloseTo(Math.round(0.8 * sight), 0);
  return { down, sight };
}

/** How the row stands now: sticky or static. */
const position = (row: HTMLElement) => getComputedStyle(row).position;

/** The kinds of canvas whose rows are tried: a sheet, a workbook and a worked example. */
const KINDS: readonly {
  readonly name: string;
  readonly put: (width: number) => Promise<{ element: NovatrailCanvas; row: HTMLElement }>;
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
  "$name: in a window of 320 × 256 the row, wrapped over more than a quarter of it, stands in its place and goes with the page, and in a taller window it sticks",
  async ({ put }) => {
    await windowOf(320, 256);
    const { row } = await put(304);
    spacer(made);
    await settle();
    expect(row.getBoundingClientRect().height).toBeGreaterThan(256 / 4);
    expect(position(row)).toBe("static");
    window.scrollTo({ top: 300, behavior: "instant" });
    await settle();
    expect(row.getBoundingClientRect().bottom).toBeLessThanOrEqual(0);

    window.scrollTo({ top: 0, behavior: "instant" });
    await windowOf(320, 896);
    expect(position(row)).toBe("sticky");
    window.scrollTo({ top: 300, behavior: "instant" });
    await settle();
    expect(row.getBoundingClientRect().top).toBeCloseTo(0, 3);
  },
);

test("in a wide low window a row of one line sticks, until the consumer's offset leaves it more than a quarter of the rest, heard at the next scroll; a taller window lets it stick again", async () => {
  await windowOf(1024, 256);
  const { element, row } = await placed(made, 1000, undefined, { task: sheetTask() });
  spacer(made);
  await settle();
  // One line of buttons, 44 px tall, and the row's margins: 60 px, a quarter of 256 less 4 px.
  expect(row.getBoundingClientRect().height).toBeCloseTo(60, 0);
  expect(position(row)).toBe("sticky");
  // 60 px over a quarter of 256 − 40: the offset changes no size, and the next scroll hears it.
  // A scroller that holds nothing of the element, fixed so that the page keeps its size.
  const other = document.createElement("div");
  other.style.cssText =
    "position: fixed; top: 0; left: 0; width: 50px; height: 50px; overflow: auto;";
  const tall = document.createElement("div");
  tall.style.height = "200px";
  other.append(tall);
  document.body.append(other);
  made.push(other);
  await settle();
  element.style.setProperty("--novatrail-canvas-top", "40px");
  // Its scroll tells the element nothing.
  other.scrollTop = 30;
  await settle();
  expect(position(row)).toBe("sticky");
  window.scrollTo({ top: 10, behavior: "instant" });
  await settle();
  expect(position(row)).toBe("static");
  await windowOf(1024, 896);
  expect(position(row)).toBe("sticky");
});

test.each(["auto", "hidden"])(
  "in an ancestor of overflow %s, which the row sticks in, it stands in its place while it covers more than a quarter of it, and sticks once the ancestor grows",
  async (overflow) => {
    const scroller = document.createElement("div");
    scroller.style.overflow = overflow;
    scroller.style.height = "1000px";
    document.body.append(scroller);
    const { row } = await placed(made, 400, undefined, { parent: scroller, task: sheetTask() });
    const tall = row.getBoundingClientRect().height;
    expect(position(row)).toBe("sticky");
    // The ancestor's size alone, and not the window's, makes the row stand or stick.
    scroller.style.height = `${3 * tall}px`;
    await settle();
    expect(position(row)).toBe("static");
    scroller.style.height = `${5 * tall}px`;
    await settle();
    expect(position(row)).toBe("sticky");
    // An ancestor that no longer contains it hands the row to the window, 896 px tall: it sticks.
    scroller.style.overflow = "visible";
    scroller.style.height = `${3 * tall}px`;
    await settle();
    expect(position(row)).toBe("sticky");
  },
);

test("with the row in its place, Down scrolls the page by four fifths of the window, the row's height not taken off, but the consumer's band over it", async () => {
  await windowOf(320, 256);
  const { element, row } = await placed(made, 304, undefined, { task: sheetTask() });
  spacer(made);
  await settle();
  expect(position(row)).toBe("static");
  const { down, sight } = downByWindow(row);

  window.scrollTo({ top: 0, behavior: "instant" });
  element.style.setProperty("--novatrail-canvas-top", "40px");
  await settle();
  down.click();
  expect(window.scrollY).toBeCloseTo(Math.round(0.8 * (sight - 40)), 0);
});

test("with the row in its place, a part Next opens comes out from under the consumer's band, not the row", async () => {
  await windowOf(320, 256);
  const { element, row } = await placed(made, 304);
  element.workedExample = workedExample();
  element.style.setProperty("--novatrail-canvas-top", "40px");
  spacer(made);
  await settle();
  expect(position(row)).toBe("static");
  const next = buttonOf(row, "Next");
  next.click();
  await settle();
  // The page scrolled past the open part, which the next part comes in under.
  const first = element.shadowRoot?.querySelector(".parts li");
  if (!first) throw new Error("the list has no part");
  window.scrollTo({
    top: window.scrollY + first.getBoundingClientRect().bottom + 50,
    behavior: "instant",
  });
  await settle();
  next.click();
  const second = element.shadowRoot?.querySelectorAll(".parts li")[1];
  if (!second) throw new Error("the list has no second part");
  expect(second.getBoundingClientRect().top).toBeCloseTo(40, 0);
});

test("at the edge of a window 320 wide every button's ring of focus stays in the row, on its paper", async () => {
  await windowOf(320, 896);
  document.body.style.margin = "0";
  const { element, row } = await placed(made, 320, undefined, { task: sheetTask() });
  await userEvent.tab();
  expect(element.shadowRoot?.activeElement?.textContent).toBe("Pen");
  const box = row.getBoundingClientRect();
  expect(box.left).toBeGreaterThanOrEqual(0);
  // The ring stands two pixels out and is two wide.
  for (const each of row.querySelectorAll("button")) {
    const button = each.getBoundingClientRect();
    if (button.width === 0) continue;
    expect(button.left - 4).toBeGreaterThanOrEqual(box.left);
    expect(button.right + 4).toBeLessThanOrEqual(box.right);
    expect(button.top - 4).toBeGreaterThanOrEqual(box.top);
    expect(button.bottom + 4).toBeLessThanOrEqual(box.bottom);
  }
});

test("with the row in its place in a panel of its own, Down handed on to the page counts the whole window: the band over the panel is not the page's", async () => {
  const above = document.createElement("div");
  above.style.height = "500px";
  document.body.append(above);
  made.push(above);
  const panel = document.createElement("div");
  panel.style.cssText = "height: 200px; overflow: auto;";
  document.body.append(panel);
  const { element, row } = await placed(made, 400, undefined, { parent: panel, task: sheetTask() });
  element.style.setProperty("--novatrail-canvas-top", "20px");
  spacer(made);
  panel.scrollTop = panel.scrollHeight;
  await settle();
  expect(position(row)).toBe("static");
  downByWindow(row);
});

test("an offset in percent counts of the window, and an offset of auto counts nothing", async () => {
  await windowOf(1024, 256);
  const { element, row } = await placed(made, 1000, undefined, { task: sheetTask() });
  // 10 % of 256 is 25.6 px, and 4 × 60 is more than the 230.4 px below it.
  element.style.setProperty("--novatrail-canvas-top", "10%");
  await windowOf(1024, 257);
  expect(position(row)).toBe("static");
  await windowOf(1024, 256);
  expect(position(row)).toBe("static");
  element.style.setProperty("--novatrail-canvas-top", "auto");
  await windowOf(1024, 257);
  expect(position(row)).toBe("sticky");
});

test("a hidden element, whose row has no height, leaves the row as it was, and shown again it stands as before", async () => {
  await windowOf(320, 256);
  const { element, row } = await placed(made, 304, undefined, { task: sheetTask() });
  expect(position(row)).toBe("static");
  element.hidden = true;
  await settle();
  expect(row.classList.contains("loose")).toBe(true);
  element.hidden = false;
  await settle();
  expect(position(row)).toBe("static");
});
