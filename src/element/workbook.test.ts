import { afterEach, expect, test } from "vitest";
import { cdp, page } from "vitest/browser";
import { cellsOf } from "../core/boxes.js";
import { isBox, type Page, type PageBox, type PageText, pageOf } from "../core/page.js";
import { PAGES, SHORT, shortLines } from "../core/pages.fixture.js";
import type { View } from "../core/screen.js";
import { cellsForCheck } from "../core/submission.js";
import { moduleManifest, sheetTask, workbookTask } from "../core/tasks.fixture.js";
import type { ExportedWork, Filled, Task, WorkbookItem } from "./index.js";
import { at, level, placed, press, screenshot, settle } from "./pointer.fixture.js";
import { probe } from "./probe.js";

// The workbook in Chromium (R34, R35, R36): its lines on the template where the layout puts them,
// whatever the font and the styles the element inherits; its boxes over the ink they take; a list a
// screen reader reads, in the DOM and in Chromium's own tree; the theme; the way between the kinds
// of canvas; the boxes filled (R37); and the work for checking, the crop of each filled box (R38).

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

test("the template is no ink: the eraser over a line and its box takes the stroke alone, and a stroke in no box changes nothing of the print", async () => {
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

/** The lines of the format's example page: four of a box, and one of two. */
const EXAMPLE = PAGES.find(({ name }) => name === "workbook-page")?.items ?? [];

/** A stroke across the middle of a box, from a quarter of its width to three quarters. */
function inBox(canvas: HTMLCanvasElement, view: View, box: PageBox): void {
  const y = box.top + box.height / 2;
  level(canvas, view, y, box.left + box.width / 4, box.left + (3 * box.width) / 4);
}

/** A press across the middle of a box, not yet lifted: lift() ends it. */
function pressed(canvas: HTMLCanvasElement, view: View, box: PageBox) {
  return press(canvas, view, box.top + box.height / 2, box.left + 20, box.left + 80);
}

test("filled tells per item, per box, which boxes hold a stroke: writing in one fills it, draft beside it leaves the same array, and undo, clearing and the eraser take it back once lifted", async () => {
  const { element, canvas, page, view } = await workbook(EXAMPLE);
  const none = [[false], [false], [false], [false], [false, false]];
  const empty = element.filled;
  expect(empty).toEqual(none);
  expect(Object.isFrozen(empty) && empty?.every(Object.isFrozen)).toBe(true);
  const last = boxesOf(page)[5] as PageBox;
  // A stroke under way is in no box yet: it lands when it lifts.
  const writing = pressed(canvas, view(), last);
  expect(element.filled).toBe(empty);
  writing.lift();
  const written = element.filled;
  expect(written).toEqual([[false], [false], [false], [false], [false, true]]);
  // Draft beside the boxes fills none: the same array.
  level(canvas, view(), 1200, 100, 300);
  expect(element.filled).toBe(written);
  element.undo();
  expect(element.filled).toBe(written);
  element.clear();
  expect(element.filled).toEqual(none);
  element.undo();
  expect(element.filled).toEqual(written);
  // The eraser's strokes stay in their box until it lifts, as they stay in the work for checking.
  element.tool = "eraser";
  const erasing = pressed(canvas, view(), last);
  expect(probe(element).pending).toHaveLength(1);
  expect(element.filled?.[4]).toEqual([false, true]);
  erasing.lift();
  expect(element.filled).toEqual(none);
});

test("an action's historychange finds filled already new, and a history or a task given changes it with no event", async () => {
  const { element, canvas, page, view } = await workbook(EXAMPLE);
  const told: (Filled | null)[] = [];
  element.addEventListener("historychange", () => told.push(element.filled));
  inBox(canvas, view(), boxesOf(page)[0] as PageBox);
  expect(told).toEqual([[[true], [false], [false], [false], [false, false]]]);

  const other = await workbook(EXAMPLE);
  const heard: unknown[] = [];
  other.element.addEventListener("historychange", (event) => heard.push(event));
  other.element.history = element.history;
  expect(other.element.filled).toEqual(element.filled);
  const given = other.element.filled;
  // Another task of the same lines is the same page: the same array.
  other.element.task = {
    ...workbookTask(EXAMPLE),
    id: "tables-2",
    statement: [{ text: "Again." }],
  };
  expect(other.element.filled).toBe(given);
  // Other lines put the same stroke in no box, or in one of theirs.
  other.element.task = workbookTask(SHORT);
  expect(other.element.filled).toHaveLength(SHORT.length);
  other.element.task = sheetTask();
  expect(other.element.filled).toBeNull();
  other.element.task = workbookTask(EXAMPLE);
  expect(other.element.filled).toEqual(given);
  expect(heard).toEqual([]);
});

test("a filled box's frame is three CSS pixels of ink on whole device pixels, an empty one's stays one, and its name says it is filled, in the DOM and in Chromium's own tree", async () => {
  const { element, canvas, print, page, view } = await workbook(EXAMPLE, 700);
  element.lang = "ru";
  inBox(canvas, view(), boxesOf(page)[0] as PageBox);
  await settle();
  const [filled, empty] = [...print.querySelectorAll("rect")];
  if (!filled || !empty) throw new Error("no boxes");
  expect([filled.classList.contains("filled"), empty.classList.contains("filled")]).toEqual([
    true,
    false,
  ]);
  expect([getComputedStyle(filled).strokeWidth, getComputedStyle(empty).strokeWidth]).toEqual([
    "3px",
    "1px",
  ]);
  const pixel = await screenshot(element);
  const host = element.getBoundingClientRect();
  /** The dark device pixels across a box's left edge, at the middle of its height. */
  const across = (rect: SVGRectElement, { left, top, height }: PageBox) => {
    const ctm = rect.getScreenCTM();
    if (ctm === null) throw new Error("the box has no matrix to the screen");
    const edge = new DOMPoint(left, top + height / 2).matrixTransform(ctm);
    const step = 1 / devicePixelRatio;
    let dark = 0;
    for (let d = -4; d <= 4; d += step) {
      const [red = 255] = pixel(edge.x - host.left + d, edge.y - host.top);
      if (red <= 60) dark += 1;
    }
    return dark;
  };
  const [first, second] = boxesOf(page) as [PageBox, PageBox];
  expect(across(filled, first)).toBeGreaterThanOrEqual(3 * devicePixelRatio - 1);
  expect(across(filled, first)).toBeLessThanOrEqual(3 * devicePixelRatio + 1);
  expect(across(empty, second)).toBeLessThanOrEqual(devicePixelRatio + 1);
  expect([filled.getAttribute("aria-label"), empty.getAttribute("aria-label")]).toEqual([
    "Окошко, заполнено",
    "Окошко",
  ]);
  const read = await listOf();
  expect(read[0]).toEqual(["1.", "7 ×", "Окошко, заполнено", "= 56"]);
  element.lang = "en";
  expect(filled.getAttribute("aria-label")).toBe("Box, filled");
});

/** The places of a workbook's work, `[item, slot]`, in its order: none for null. */
function placesOf(work: ExportedWork | null): number[][] {
  return work !== null && "cells" in work ? work.cells.map(({ item, slot }) => [item, slot]) : [];
}

test("the work for checking is the crop of each filled box, in the task's order, of the boxes filled names, with the table of their strokes; draft and a stroke under way are in none, and no box filled is null", async () => {
  const { element, canvas, page, view } = await workbook(EXAMPLE);
  const boxes = boxesOf(page);
  expect(await element.exportWork()).toBeNull();
  // A stroke under way is in no box yet; draft alone goes to no check.
  const writing = pressed(canvas, view(), boxes[5] as PageBox);
  expect(await element.exportWork()).toBeNull();
  writing.lift();
  level(canvas, view(), 1200, 100, 300);
  inBox(canvas, view(), boxes[0] as PageBox);
  const work = await element.exportWork();
  if (work === null || !("cells" in work)) throw new Error("the workbook gave no work of boxes");
  expect(placesOf(work)).toEqual([
    [1, 1],
    [5, 2],
  ]);
  const filled = (element.filled ?? []).flatMap((row, i) =>
    row.flatMap((full, j) => (full ? [[i + 1, j + 1]] : [])),
  );
  expect(placesOf(work)).toEqual(filled);
  expect(work.submission.boxes).toEqual([
    { item: 1, slot: 1, ids: [3] },
    { item: 5, slot: 2, ids: [1] },
  ]);
  // The crops are the core's, at the height of a digit the manifest gives when it is called.
  for (const digit of [32, 48]) {
    element.manifest = moduleManifest({ digit_height: digit });
    const sent = await element.exportWork();
    const own = cellsForCheck(probe(element).strokes, cellsOf(page), digit);
    if (sent === null || !("cells" in sent) || own === null) throw new Error("no work of boxes");
    expect(sent.cells.every(({ png }) => png.type === "image/png")).toBe(true);
    const bytes = await Promise.all(
      sent.cells.map(async ({ png }) => new Uint8Array(await png.arrayBuffer())),
    );
    expect(bytes).toEqual(own.cells.map(({ png }) => png));
    expect(sent.submission).toEqual(own.submission);
  }
  // An eraser pressed and not yet lifted keeps its strokes in, as filled does.
  element.tool = "eraser";
  const erasing = pressed(canvas, view(), boxes[0] as PageBox);
  expect(placesOf(await element.exportWork())).toEqual([
    [1, 1],
    [5, 2],
  ]);
  erasing.lift();
  expect(placesOf(await element.exportWork())).toEqual([[5, 2]]);
  // The other kind of canvas gives a sheet's work, of all the strokes.
  element.task = sheetTask();
  const sheet = await element.exportWork();
  expect(sheet !== null && "png" in sheet && sheet.png.type).toBe("image/png");
});
