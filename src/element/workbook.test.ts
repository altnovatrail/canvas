import { afterEach, expect, test } from "vitest";
import { cdp, page } from "vitest/browser";
import { isBox, type Page, type PageBox, type PageText, pageOf } from "../core/page.js";
import { PAGES, SHORT, shortLines } from "../core/pages.fixture.js";
import { moduleManifest, sheetTask, workbookTask } from "../core/tasks.fixture.js";
import type { Task, WorkbookItem } from "./index.js";
import { at, level, placed, screenshot, settle } from "./pointer.fixture.js";
import { probe } from "./probe.js";

// The workbook in Chromium (R34, R35, R36): its lines on the template where the layout puts them,
// whatever the font and the styles the element inherits; its boxes over the ink they take; a list a
// screen reader reads, in the DOM and in Chromium's own tree; the theme; the way between the kinds
// of canvas; and the work for checking, which comes in a later version.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

/** An element with a task, `width` CSS pixels wide, with the parts of it the tests reach for. */
async function opened(task: Task, width = 414, height?: number, parent?: HTMLElement) {
  const placing = await placed(made, width, height, { parent, task });
  const { root } = placing;
  const template = root.querySelector<SVGSVGElement>(".template");
  const grid = root.querySelector<SVGPathElement>(".grid");
  const print = root.querySelector<SVGGElement>(".print");
  if (!template || !grid || !print) throw new Error("the element has no template");
  return { ...placing, template, grid, print };
}

/** A workbook of these lines, and the page the layout makes of them. */
async function workbook(
  items: readonly WorkbookItem[],
  width?: number,
  height?: number,
  parent?: HTMLElement,
) {
  return { ...(await opened(workbookTask(items), width, height, parent)), page: pageOf(items) };
}

/** The texts of a page in the order the template draws them: each item's number, then its line. */
function textsOf(page: Page): PageText[] {
  return page.items.flatMap((item) => [
    item.number,
    ...item.line.filter((part): part is PageText => !isBox(part)),
  ]);
}

/** A page's boxes in the order the template draws them. */
function boxesOf(page: Page): PageBox[] {
  return page.items.flatMap((item) => item.boxes);
}

/** What a screen reader hears of each item, in order: "Box" for a box alone in its line. */
function heard(page: Page, box: string): string[][] {
  return page.items.map((item) => [
    item.number.text,
    ...item.line.map((part) => {
      if (!isBox(part)) return part.text;
      return item.boxes.length > 1 ? `${box} ${item.boxes.indexOf(part) + 1}` : box;
    }),
  ]);
}

/** Styles an ancestor of the element passes down, none of which the print may take. */
const HOSTILE = [
  "letter-spacing: 7px; word-spacing: 30px; font-weight: 900; font-style: italic",
  "text-transform: uppercase; font-size: 40px; font-variant: small-caps; font-stretch: condensed",
  "text-anchor: end; dominant-baseline: hanging; alignment-baseline: hanging; baseline-shift: 10px",
  "fill: red; stroke: blue; stroke-width: 5; paint-order: stroke; -webkit-text-stroke: 2px green",
  "font-kerning: none; font-feature-settings: 'smcp' 1; font-size-adjust: 0.3; white-space: pre",
  "font-variant-numeric: oldstyle-nums proportional-nums; text-size-adjust: 300%",
].join("; ");

test("every piece of text starts and ends where the layout puts it, on its baseline, in any font and under any style the element inherits", async () => {
  const parent = document.createElement("div");
  parent.dir = "rtl";
  parent.setAttribute("style", HOSTILE);
  document.body.append(parent);
  const shown = PAGES.filter(({ fonts, refused }) => fonts && refused === undefined);
  expect(shown.length).toBeGreaterThan(10);
  const { element, print } = await workbook(SHORT, 414, undefined, parent);
  for (const family of ["Liberation Sans", "Liberation Serif", "Liberation Mono"]) {
    parent.style.fontFamily = `"${family}"`;
    for (const { name, items } of shown) {
      element.task = workbookTask(items);
      const expected = textsOf(pageOf(items));
      const texts = [...print.querySelectorAll("text")];
      expect(
        texts.map((text) => text.textContent),
        name,
      ).toEqual(expected.map(({ text }) => text));
      for (const [n, text] of texts.entries()) {
        const { left, baseline, width } = expected[n] as PageText;
        const first = text.getStartPositionOfChar(0);
        const last = text.getEndPositionOfChar(text.getNumberOfChars() - 1);
        const where = `${name} ${family} ${text.textContent}`;
        // A twentieth of a unit: a glyph that SVG scales alone, as "м" is, ends off by a rounding.
        expect(Math.abs(first.x - left), where).toBeLessThan(0.05);
        expect(Math.abs(first.y - baseline), where).toBeLessThan(0.05);
        expect(Math.abs(last.x - (left + width)), where).toBeLessThan(0.05);
        expect(Math.abs(last.y - baseline), where).toBeLessThan(0.05);
        // What is drawn: the glyphs' boxes, which a small scale rounds by a unit or two.
        const box = text.getBBox();
        expect(Math.abs(box.x - left), where).toBeLessThan(3);
        expect(Math.abs(box.width - width), where).toBeLessThan(3);
        expect(box.y < baseline && box.y + box.height > baseline, where).toBe(true);
      }
    }
  }
  const style = getComputedStyle(print.querySelector("text") as SVGTextElement);
  expect([style.fontWeight, style.fontStyle, style.letterSpacing, style.direction]).toEqual([
    "400",
    "normal",
    "normal",
    "ltr",
  ]);
  expect(style.fontVariantNumeric).toBe("tabular-nums");
});

test("each box lies where the ink is, at any width and scroll: a stroke through its middle lands in it, in page units", async () => {
  const items = shortLines(20);
  for (const width of [414, 700]) {
    const { element, canvas, viewport, print, page, view } = await workbook(items, width, 500);
    const rects = [...print.querySelectorAll("rect")];
    const boxes = boxesOf(page);
    expect(rects).toHaveLength(boxes.length);
    const end = viewport.scrollHeight - viewport.clientHeight;
    expect(end).toBeGreaterThan(0);
    for (const scrollTop of [0, end]) {
      viewport.scrollTop = scrollTop;
      await settle();
      const shown = view();
      const bottom = shown.vy + viewport.clientHeight / shown.k;
      for (const [n, rect] of rects.entries()) {
        const { left, top, width: wide, height } = boxes[n] as PageBox;
        const ctm = rect.getScreenCTM();
        if (ctm === null) throw new Error("the box has no matrix to the screen");
        for (const [x, y] of [
          [left, top],
          [left + wide, top + height],
        ] as const) {
          const point = new DOMPoint(x, y).matrixTransform(ctm);
          const expected = at(canvas, shown, x, y);
          expect(Math.abs(point.x - expected.clientX)).toBeLessThan(0.05);
          expect(Math.abs(point.y - expected.clientY)).toBeLessThan(0.05);
        }
        // A stroke through the middle of the first box in sight.
        if (top < shown.vy || top + height > bottom || probe(element).strokes.length > 0) continue;
        level(canvas, shown, top + height / 2, left + wide / 4, left + (3 * wide) / 4);
        const points = probe(element).strokes[0]?.points ?? [];
        expect(points.length).toBeGreaterThan(0);
        for (const { x, y } of points) {
          expect(x >= left && x <= left + wide && y >= top && y <= top + height).toBe(true);
        }
      }
      expect(probe(element).strokes).toHaveLength(1);
      element.clear();
    }
    element.remove();
  }
});

test("the template is no ink: the eraser over a line and its box takes the stroke alone, and nothing of the print changes", async () => {
  const { element, canvas, print, page, view } = await workbook(SHORT);
  const box = boxesOf(page)[0] as PageBox;
  const y = box.top + box.height / 2;
  const observer = new MutationObserver(() => undefined);
  observer.observe(print, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  });
  level(canvas, view(), y, box.left - 40, box.left + box.width + 40);
  expect(probe(element).strokes).toHaveLength(1);
  element.tool = "eraser";
  level(canvas, view(), y, 40, 960);
  expect(probe(element).strokes).toHaveLength(0);
  element.undo();
  element.clear();
  await settle();
  expect(observer.takeRecords()).toEqual([]);
  observer.disconnect();
});

test("a box's frame is one CSS pixel on whole device pixels, in the ink's colour all round", async () => {
  const { element, print, page } = await workbook(SHORT, 700);
  const rect = print.querySelector("rect") as SVGRectElement;
  const style = getComputedStyle(rect);
  expect([style.shapeRendering, style.vectorEffect, style.strokeWidth, style.fill]).toEqual([
    "crispedges",
    "non-scaling-stroke",
    "1px",
    "none",
  ]);
  expect(style.stroke).toBe("rgb(17, 17, 17)");
  const pixel = await screenshot(element);
  const host = element.getBoundingClientRect();
  const ctm = rect.getScreenCTM();
  if (ctm === null) throw new Error("the box has no matrix to the screen");
  const { left, top, width, height } = boxesOf(page)[0] as PageBox;
  const point = (x: number, y: number) => {
    const { x: clientX, y: clientY } = new DOMPoint(x, y).matrixTransform(ctm);
    return [clientX - host.left, clientY - host.top] as const;
  };
  // Across each edge at its middle: the darkest pixel is the ink itself, not a grey of it.
  const [x0, y0] = point(left, top);
  const [x1, y1] = point(left + width, top + height);
  const across = [-1, -0.5, 0, 0.5, 1];
  const edges = [
    across.map((d) => pixel(x0 + d, (y0 + y1) / 2)),
    across.map((d) => pixel(x1 + d, (y0 + y1) / 2)),
    across.map((d) => pixel((x0 + x1) / 2, y0 + d)),
    across.map((d) => pixel((x0 + x1) / 2, y1 + d)),
  ];
  for (const edge of edges) {
    const darkest = Math.min(...edge.map(([r = 255]) => r));
    expect(darkest).toBeLessThanOrEqual(17 + 3);
  }
});

/** The nodes of Chromium's own accessibility tree of this test's frame, through the DevTools protocol. */
async function accessibilityTree() {
  const { frameTree } = await cdp().send("Page.getFrameTree");
  const frames = [frameTree];
  let frameId: string | undefined;
  while (frames.length > 0 && frameId === undefined) {
    const next = frames.shift();
    if (next?.frame.name === "vitest-iframe") frameId = next.frame.id;
    frames.push(...(next?.childFrames ?? []));
  }
  if (frameId === undefined) throw new Error("no frame of the test in the tree");
  const { nodes } = await cdp().send("Accessibility.getFullAXTree", { frameId });
  return nodes;
}

/**
 * What the tree reads of each item of the list, in order: its text and the names of its pictures,
 * the generic wrappers and the boxes of inline text passed over.
 */
async function listOf(): Promise<string[][]> {
  const nodes = await accessibilityTree();
  const byId = new Map(nodes.map((node) => [node.nodeId, node]));
  const read = (id: string): string[] => {
    const node = byId.get(id);
    if (node === undefined) return [];
    const role = node.role?.value;
    if (!node.ignored && (role === "StaticText" || role === "image")) {
      return [String(node.name?.value ?? "")];
    }
    return (node.childIds ?? []).flatMap(read);
  };
  const lists = nodes.filter((node) => !node.ignored && node.role?.value === "list");
  expect(lists).toHaveLength(1);
  const items = (lists[0]?.childIds ?? []).map((id) => byId.get(id));
  expect(items.every((item) => item?.role?.value === "listitem")).toBe(true);
  return items.map((item) => (item?.childIds ?? []).flatMap(read));
}

test("a screen reader reads the lines as a list in the task's order, each item its number, its text and its boxes by name, in the DOM and in Chromium's own tree", async () => {
  const { element, root, template, page: laid } = await workbook(SHORT);
  element.lang = "ru";
  expect(template.getAttribute("role")).toBe("none");
  expect(template.hasAttribute("aria-hidden")).toBe(false);
  const within = page.elementLocator(element);
  await expect.element(within.getByRole("list")).toBeInTheDocument();
  expect(within.getByRole("listitem").all()).toHaveLength(SHORT.length);
  // A line of two boxes, as "47 ÷ 6 = [] r []", numbers them; a box alone in its line has none.
  const pairs = laid.items.filter(({ boxes }) => boxes.length === 2).length;
  expect(pairs).toBeGreaterThan(0);
  expect(within.getByRole("img", { name: "Окошко 2", exact: true }).all()).toHaveLength(pairs);
  const read = await listOf();
  expect(read).toEqual(heard(laid, "Окошко"));
  // Each name as it is, not only as the rule makes it: a box alone, and two in a line.
  expect(read[0]).toEqual(["1.", "7 ×", "Окошко", "= 56"]);
  expect(read[3]).toEqual(["4.", "47 ÷ 6 =", "Окошко 1", "r", "Окошко 2"]);
  // The panel is named by the canvas kind, in the labels' language.
  expect(within.getByRole("toolbar", { name: "Тетрадь" }).all()).toHaveLength(1);
  expect(root.querySelector(".tools")?.getAttribute("aria-label")).toBe("Тетрадь");
});

test("the lines are in the manifest's explanation language, or the element's own without one, and the boxes' names in the labels' language", async () => {
  const { element, root, print } = await workbook(SHORT);
  const list = print.querySelector('[role="list"]') as SVGGElement;
  const text = print.querySelector("text") as SVGTextElement;
  const box = print.querySelector("rect") as SVGRectElement;
  element.lang = "ru";
  element.manifest = moduleManifest({ explanation: "en" });
  expect(list.getAttribute("lang")).toBe("en");
  expect([text.matches(":lang(en)"), box.matches(":lang(ru)")]).toEqual([true, true]);
  expect(box.getAttribute("aria-label")).toBe("Окошко");
  element.lang = "en-GB";
  expect([box.getAttribute("aria-label"), box.matches(":lang(en)")]).toEqual(["Box", true]);
  expect(root.querySelector(".tools")?.getAttribute("aria-label")).toBe("Workbook");
  element.manifest = moduleManifest({ explanation: "ru" });
  expect(text.matches(":lang(ru)")).toBe(true);
  element.manifest = undefined;
  expect(list.hasAttribute("lang")).toBe(false);
  expect(text.matches(":lang(en-GB)")).toBe(true);
});

test("an item at the bottom of the page that is brought into view stands in the container's visible part two frames later, under the row, in a page of any writing mode", async () => {
  for (const writing of ["horizontal-tb", "vertical-rl"]) {
    const parent = document.createElement("div");
    parent.style.writingMode = writing;
    document.body.append(parent);
    const { element, viewport, row, print } = await workbook(shortLines(20), 414, 500, parent);
    const last = print.querySelector('[role="list"]')?.lastElementChild;
    if (!last) throw new Error("the list has no items");
    last.scrollIntoView({ block: "nearest" });
    await settle();
    const item = last.getBoundingClientRect();
    const port = viewport.getBoundingClientRect();
    expect(viewport.scrollTop, writing).toBeGreaterThan(0);
    const top = Math.max(port.top, row.getBoundingClientRect().bottom);
    expect(item.top, writing).toBeGreaterThanOrEqual(top - 0.5);
    expect(item.bottom, writing).toBeLessThanOrEqual(port.bottom + 0.5);
    element.remove();
  }
});

test("a task of the other kind lays the template anew and the work stays, while one of the same lines writes nothing", async () => {
  const lined = sheetTask({ grid: "lines" });
  const { element, canvas, row, template, grid, print, view } = await opened(lined);
  const ruled = grid.getAttribute("d");
  level(canvas, view(), 700, 100, 300);
  expect([template.getAttribute("aria-hidden"), row.getAttribute("aria-label")]).toEqual([
    "true",
    "Sheet",
  ]);

  element.task = workbookTask(SHORT);
  expect(grid.getAttribute("d")).toBe("");
  expect(print.querySelectorAll('[role="listitem"]')).toHaveLength(SHORT.length);
  expect([template.hasAttribute("aria-hidden"), row.getAttribute("aria-label")]).toEqual([
    false,
    "Workbook",
  ]);
  expect(probe(element).strokes).toHaveLength(1);

  // Another task of the same lines, its own ID and statement: the template stays as it is.
  const observer = new MutationObserver(() => undefined);
  observer.observe(template, { subtree: true, childList: true, attributes: true });
  element.task = { ...workbookTask(SHORT), id: "tables-2", statement: [{ text: "Again." }] };
  expect(observer.takeRecords()).toEqual([]);
  observer.disconnect();

  element.task = lined;
  expect(grid.getAttribute("d")).toBe(ruled);
  expect(print.querySelector('[role="list"]')?.children).toHaveLength(0);
  expect([template.getAttribute("aria-hidden"), row.getAttribute("aria-label")]).toEqual([
    "true",
    "Sheet",
  ]);
  expect(probe(element).strokes).toHaveLength(1);
});

test("the print takes the theme's ink, and the text colour of the page for a value that is no colour, as the ink on the canvas does", async () => {
  const theme = document.createElement("div");
  theme.style.setProperty("--novatrail-canvas-ink", "rgb(0, 0, 255)");
  theme.style.color = "rgb(0, 128, 0)";
  document.body.append(theme);
  const { canvas, print } = await workbook(SHORT, 414, undefined, theme);
  const text = print.querySelector("text") as SVGTextElement;
  const rect = print.querySelector("rect") as SVGRectElement;
  expect([getComputedStyle(text).fill, getComputedStyle(rect).stroke]).toEqual([
    "rgb(0, 0, 255)",
    "rgb(0, 0, 255)",
  ]);
  // The canvas takes its new colour once its transition of a millisecond ends.
  const ended = new Promise<void>((resolve) =>
    canvas.addEventListener("transitionend", () => resolve(), { once: true }),
  );
  theme.style.setProperty("--novatrail-canvas-ink", "12px");
  await ended;
  expect([
    getComputedStyle(text).fill,
    getComputedStyle(rect).stroke,
    getComputedStyle(canvas).color,
  ]).toEqual(["rgb(0, 128, 0)", "rgb(0, 128, 0)", "rgb(0, 128, 0)"]);
});

test("the work of a workbook for checking comes in a later version: a NotSupportedError, written on or not, and the sheet's work as before", async () => {
  const { element, canvas, view } = await workbook(SHORT);
  await expect(element.exportWork()).rejects.toThrow(DOMException);
  await expect(element.exportWork()).rejects.toMatchObject({ name: "NotSupportedError" });
  level(canvas, view(), 700, 100, 300);
  await expect(element.exportWork()).rejects.toMatchObject({ name: "NotSupportedError" });
  element.task = sheetTask();
  const work = await element.exportWork();
  expect(work?.png.type).toBe("image/png");
});
