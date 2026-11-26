import { afterEach, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { CROP } from "../core/crop.js";
import { gridPath } from "../core/grid.js";
import { shortLines } from "../core/pages.fixture.js";
import type { View } from "../core/screen.js";
import { extentOf as reachOf, SHEET } from "../core/sheet.js";
import { workForCheck } from "../core/submission.js";
import { sheetTask, workedExample } from "../core/tasks.fixture.js";
import { NovatrailCanvas } from "./index.js";
import { at, dotTiles, dotTilesOf, level, screenshot, sheetWork } from "./pointer.fixture.js";
import { probe } from "./probe.js";

// The sheet's layers in a browser: the stack in its order, one view for every layer at any
// width and scroll — the author's demo too — the cap of k, the task's grid, the theme, and
// the task as a property. A worked example's canvas takes no pointer.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
/** Two frames: one for the element's layout, one for its drawing. */
async function settle(): Promise<void> {
  await frame();
  await frame();
}

/** A sheet `width` CSS pixels wide, as tall as the sheet unless given a height, in a parent. */
async function sheet(width: number, height?: number, parent: HTMLElement = document.body) {
  const element = document.createElement("novatrail-canvas");
  element.style.width = `${width}px`;
  if (height !== undefined) element.style.height = `${height}px`;
  parent.append(element);
  made.push(parent === document.body ? element : parent);
  await settle();
  const root = element.shadowRoot;
  const canvas = root?.querySelector("canvas");
  const viewport = root?.querySelector(".viewport");
  const stage = root?.querySelector(".stage");
  const grid = root?.querySelector(".grid");
  if (!root || !canvas || !viewport || !stage || !grid) throw new Error("the element has no stage");
  return { element, root, canvas, viewport, stage, grid, view: () => viewOf(element) };
}

function viewOf(element: HTMLElement): View {
  const { view } = probe(element);
  if (view === undefined) throw new Error("the element is not laid out");
  return view;
}

/** How far the sheet goes as laid out, in whole units, past the page. */
function extentOf(element: HTMLElement): { width: number; height: number } {
  const box = element.shadowRoot?.querySelector(".sheet")?.getBoundingClientRect();
  const { k } = viewOf(element);
  return { width: Math.round((box?.width ?? 0) / k), height: Math.round((box?.height ?? 0) / k) };
}

/** The red, green and blue of the canvas's device pixel over a point of the sheet, and its alpha. */
function rgbaAt(canvas: HTMLCanvasElement, view: View, x: number, y: number): number[] {
  const scale = canvas.width / SHEET.width;
  const pixel = canvas
    .getContext("2d")
    ?.getImageData(Math.floor(x * scale), Math.floor((y - view.vy) * scale), 1, 1);
  return [...(pixel?.data ?? [])];
}

test("the sheet is a stack of layers in the order spec's glossary gives them, and of them the canvas alone takes pointer events, as the element does, and so do the buttons of the bar, while the rail it stands in covers nothing of the sheet", async () => {
  const { element, root, canvas, stage, viewport } = await sheet(400);
  // Over the tracing paper, under the ink, its cover of the statements read; over the layers its
  // frame, its sign, its grip and tooltip and its bar of scale: they and the paper's layer show on
  // a task from paper alone.
  // The circle of a hovering pen is none either, nor is Select's bar. Select's marks are a layer
  // over them all.
  const parts =
    ".tracing-cover, .tracing-frame, .tracing-sign, .grip, .tip, .tracing-scale, .hover, .selection-bar";
  const layers = [...stage.children].filter((each) => !each.matches(parts));
  expect(layers.map((layer) => layer.getAttribute("class") ?? layer.localName)).toEqual([
    "template",
    "widget",
    "show",
    "tracing",
    "sketch",
    "canvas",
    "marks",
    "selection",
  ]);
  expect(
    [...stage.children]
      .filter((each) => each.matches(parts))
      .map((each) => [each.className, (each as HTMLElement).hidden]),
  ).toEqual([
    ["tracing-cover", true],
    ["hover", true],
    ["tracing-frame", true],
    ["tracing-sign", true],
    ["grip", true],
    ["tip grip-tip", true],
    ["tracing-scale", true],
    ["selection-bar", true],
  ]);
  expect(stage.querySelector(".tracing-cover")?.previousElementSibling?.getAttribute("class")).toBe(
    "tracing",
  );
  const box = stage.getBoundingClientRect();
  for (const layer of layers) {
    const rect = layer.getBoundingClientRect();
    if (layer.classList.contains("tracing")) expect(layer.getAttribute("display")).toBe("none");
    else {
      expect([rect.left, rect.top, rect.width, rect.height]).toEqual([
        box.left,
        box.top,
        box.width,
        box.height,
      ]);
    }
    if (layer !== canvas) expect(getComputedStyle(layer).pointerEvents).toBe("none");
    // The marks' layer is no picture of its own: a screen reader reads each mark by its name.
    if (layer.classList.contains("marks")) {
      expect(layer.getAttribute("role")).toBe("none");
      expect(layer.hasAttribute("aria-hidden")).toBe(false);
    } else if (layer !== canvas) {
      expect(layer.getAttribute("aria-hidden")).toBe("true");
    }
  }
  const sheetBox = root.querySelector(".sheet");
  if (!sheetBox) throw new Error("the element has no sheet");
  // The bar of the element's own buttons sets no pointer-events of its own either, Select and the
  // hand, a task from paper's buttons and a worked example's row of Next and Demo
  // too. The rail it stands in, as tall as the element in sight, is as wide as
  // nothing: the bar stands out of it, and beside the bar the pointer is on the sheet.
  const bar = root.querySelector(".tools");
  const row = root.querySelector(".tools.row");
  const rail = root.querySelector(".rail");
  const buttons = [...root.querySelectorAll(".tools button")];
  if (!bar || !row || !rail) throw new Error("the element has no bar and row in a rail");
  expect(buttons).toHaveLength(13);
  expect(rail.getBoundingClientRect().width).toBe(0);
  const boxes = [canvas, stage, sheetBox, viewport, rail, bar, row, ...buttons];
  for (const box of boxes) expect(getComputedStyle(box).pointerEvents).toBe("auto");
  const pen = buttons.find((button) => button.textContent === "Pen")?.getBoundingClientRect();
  if (!pen) throw new Error("the bar has no pen");
  const onPen = [pen.left + pen.width / 2, pen.top + pen.height / 2] as const;
  expect(root.elementFromPoint(...onPen)?.closest("button")?.textContent).toBe("Pen");
  const beside = bar.getBoundingClientRect();
  expect(root.elementFromPoint(beside.right + 10, onPen[1])).toBe(canvas);
  // The marks over the ink take no pointer: what is under the pointer is the canvas.
  const middle = canvas.getBoundingClientRect();
  const hit = root.elementFromPoint(middle.left + 100, middle.top + 100);
  expect(hit).toBe(canvas);

  // The consumer's pointer-events: none reaches the canvas, and the buttons: a press on the pen's
  // button goes through the element.
  element.style.pointerEvents = "none";
  for (const box of boxes) expect(getComputedStyle(box).pointerEvents).toBe("none");
  expect(element.contains(document.elementFromPoint(...onPen))).toBe(false);
});

test("a worked example's canvas alone takes no pointer, the stage keeps the menu off the sheet and the element the selection, and out of it the consumer's none reaches the canvas again", async () => {
  const { element, canvas, stage } = await sheet(400);
  const layers = [...stage.children];
  element.workedExample = workedExample();
  expect([...stage.children]).toEqual(layers);
  expect(getComputedStyle(canvas).pointerEvents).toBe("none");
  expect(getComputedStyle(stage).pointerEvents).toBe("auto");
  // A long press or a right click opens no menu over the sheet, on the stage as on the canvas.
  for (const target of [stage, canvas]) {
    const menu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    target.dispatchEvent(menu);
    expect(menu.defaultPrevented).toBe(true);
  }
  // No text of the element is selected, the sheet among it.
  expect(getComputedStyle(element).userSelect).toBe("none");
  // The class goes with the example, and the canvas inherits again: it set no pointer-events.
  element.workedExample = undefined;
  expect(getComputedStyle(canvas).pointerEvents).toBe("auto");
  element.style.pointerEvents = "none";
  expect(getComputedStyle(canvas).pointerEvents).toBe("none");
});

test("every layer shows the sheet by one view, whatever the width and the scroll, and the page is at most 1000 CSS pixels wide, at the sheet's left", async () => {
  for (const width of [400, 1000, 1400]) {
    const { element, root, canvas, viewport, view } = await sheet(width, 300);
    // The template, the author's demo, the tutor's sketch and the marks, and Select's marks over
    // them; the tracing paper's layer shows a task from paper's alone.
    const svgs = [...root.querySelectorAll<SVGSVGElement>('.stage > svg:not([display="none"])')];
    expect(svgs.map((svg) => svg.getAttribute("class"))).toEqual([
      "template",
      "show",
      "sketch",
      "marks",
      "selection",
    ]);
    const k = Math.min(width, 1000) / 1000;
    expect(view().k).toBeCloseTo(k, 6);
    const rect = canvas.getBoundingClientRect();
    const host = element.getBoundingClientRect();
    expect(rect.left - host.left).toBeCloseTo(0, 6);
    // The canvas is as wide as the container, for the sheet goes on past the page.
    expect(canvas.width).toBe(Math.round(viewport.clientWidth * devicePixelRatio));

    const end = viewport.scrollHeight - viewport.clientHeight;
    for (const scrollTop of [0, Math.round(end / 2), end]) {
      viewport.scrollTop = scrollTop;
      await settle();
      const shown = view();
      // The scroll ends on a whole pixel and the sheet in a fraction of one: at the end the canvas
      // stands on the sheet's bottom, short of the scroll by less than a pixel.
      if (scrollTop === end) expect(Math.abs(shown.vy - scrollTop / k)).toBeLessThan(1 / k);
      else expect(shown.vy).toBeCloseTo(scrollTop / k, 3);
      for (const svg of svgs) {
        const ctm = svg.getScreenCTM();
        if (ctm === null) throw new Error("the layer has no matrix to the screen");
        for (const [x, y] of [
          [0, shown.vy],
          [500, shown.vy + 100],
          [1000, shown.vy + 250],
        ]) {
          const point = new DOMPoint(x, y).matrixTransform(ctm);
          const expected = at(canvas, shown, x ?? 0, y ?? 0);
          expect(Math.abs(point.x - expected.clientX)).toBeLessThan(0.05);
          expect(Math.abs(point.y - expected.clientY)).toBeLessThan(0.05);
        }
      }
    }
    element.remove();
  }
});

test("a new width puts the layers on the new k in the frame it is laid out in, before it is painted", async () => {
  const { element, root, viewport } = await sheet(400, 200);
  const template = root.querySelector<SVGSVGElement>(".template");
  if (!template) throw new Error("the element has no template");
  // The sheet shows in the element's whole height: the bar of buttons stands over it.
  expect(template.viewBox.baseVal.height).toBeCloseTo(viewport.clientHeight / 0.4, 3);
  element.style.width = "300px";
  // An observer made after the element's own reports after it, in the same frame, before paint.
  const shown = await new Promise<{ height: number; port: number }>((resolve) => {
    const observer = new ResizeObserver(() => {
      observer.disconnect();
      resolve({ height: template.viewBox.baseVal.height, port: viewport.clientHeight });
    });
    observer.observe(viewport);
  });
  expect(shown.height).toBeCloseTo(shown.port / 0.3, 3);
});

test("the top of the visible part stays where it was on the sheet when the width changes, at the cap and under it", async () => {
  const { element, viewport, view } = await sheet(1400, 300);
  viewport.scrollTop = 300;
  await settle();
  expect(view().vy).toBeCloseTo(300, 3);

  element.style.width = "1200px";
  await settle();
  expect(view().vy).toBeCloseTo(300, 3);
  expect(viewport.scrollTop).toBeCloseTo(300, 0);

  element.style.width = "800px";
  await settle();
  expect(view().k).toBeCloseTo(0.8, 6);
  expect(view().vy).toBeCloseTo(300, 1);

  // A new height alone moves nothing on the sheet: the element writes no scroll, and one under
  // way, a fling of a finger, goes on.
  const scrollTop = Object.getOwnPropertyDescriptor(Element.prototype, "scrollTop");
  let writes = 0;
  Object.defineProperty(viewport, "scrollTop", {
    configurable: true,
    get(this: Element) {
      return scrollTop?.get?.call(this);
    },
    set(this: Element, value: number) {
      writes++;
      scrollTop?.set?.call(this, value);
    },
  });
  element.style.height = "260px";
  await settle();
  expect(writes).toBe(0);
  expect(view().vy).toBeCloseTo(300, 1);
  element.style.width = "700px";
  await settle();
  expect(writes).toBe(1);
  expect(view().vy).toBeCloseTo(300, 1);
});

test("an element the page scales writes its strokes in the sheet's own units, its k on the screen past the cap", async () => {
  const scaled = document.createElement("div");
  scaled.style.transform = "scale(1.5)";
  scaled.style.transformOrigin = "0 0";
  document.body.append(scaled);
  const { element, canvas } = await sheet(800, undefined, scaled);
  const rect = canvas.getBoundingClientRect();
  // 800 CSS pixels as laid out, 1200 on the screen: 1.2 pixels on the screen to a unit.
  expect(rect.width).toBeCloseTo(1200, 3);
  const pixels = rect.width / SHEET.width;
  const mouse = { pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true };
  const event = (type: string, x: number, init: PointerEventInit) =>
    new PointerEvent(type, {
      ...mouse,
      clientX: rect.left + x * pixels,
      clientY: rect.top + 300 * pixels,
      ...init,
    });
  canvas.dispatchEvent(event("pointerdown", 100, { button: 0, buttons: 1, pressure: 0.5 }));
  canvas.dispatchEvent(event("pointermove", 700, { button: -1, buttons: 1, pressure: 0.5 }));
  canvas.dispatchEvent(event("pointerup", 700, { button: 0, buttons: 0, pressure: 0 }));
  const points = probe(element).strokes[0]?.points ?? [];
  expect(points.map((point) => Math.round(point.x))).toEqual([100, 700, 700]);
  expect(points.every((point) => Math.abs(point.y - 300) < 1e-6)).toBe(true);
});

test("the task rules the sheet by its grid, and a task of the same template writes nothing", async () => {
  const { element, root, grid } = await sheet(400);
  // The grid rules the whole sheet, past the page as far as it goes.
  expect(grid.getAttribute("d")).toBe(gridPath({ kind: "squares", step: 50 }, extentOf(element)));
  expect(grid.classList.contains("dots")).toBe(false);
  expect(dotTilesOf(root)).toBeUndefined();

  // Dots are tiles of a pattern, not a path.
  const dots = sheetTask({ grid: "dots", grid_step: 40 });
  element.task = dots;
  expect(element.task).toBe(dots);
  expect(grid.getAttribute("d")).toBe("");
  expect(grid.classList.contains("dots")).toBe(true);
  expect(dotTilesOf(root)).toEqual(dotTiles(40, extentOf(element)));
  await settle();

  const records: MutationRecord[] = [];
  const observer = new MutationObserver((list) => records.push(...list));
  observer.observe(root, { subtree: true, childList: true, attributes: true, characterData: true });
  // The same object, and then another of the same template: another ID, and a choice, which app
  // shows.
  element.task = dots;
  const choice = [{ answer_slots: [{ binding: "choice", options: ["5", "6"] }] }] as const;
  const same = sheetTask({ id: "posts-2", grid: "dots", grid_step: 40, items: choice });
  element.task = same;
  expect(element.task).toBe(same);
  await settle();
  observer.takeRecords();
  expect(records).toEqual([]);

  element.task = sheetTask({ grid: "lines" });
  expect(grid.getAttribute("d")).toBe(gridPath({ kind: "lines", step: 50 }, extentOf(element)));
  expect(dotTilesOf(root)).toBeUndefined();
  element.task = undefined;
  expect(grid.getAttribute("d")).toBe(gridPath({ kind: "squares", step: 50 }, extentOf(element)));
  observer.disconnect();
});

/**
 * The same level stroke, six times over: a line 3 units wide is about a CSS pixel at these
 * widths, and the pixel in its middle is only partly covered by one.
 */
function dense(canvas: HTMLCanvasElement, view: View, y: number, from: number, to: number) {
  for (let i = 0; i < 6; i++) level(canvas, view, y, from, to);
}

/** Whether two colours are the same but for a rounding: a pixel only partly covered rounds. */
function near(rgb: readonly number[], expected: readonly number[]): boolean {
  return expected.every((channel, i) => Math.abs((rgb[i] ?? Number.NaN) - channel) <= 3);
}

test("on the screen the ink lies over the grid, and the grid's lines and dots over the paper", async () => {
  // k is 0.41, so that the ruling at 50 falls in the middle of a CSS pixel, at 20.5.
  const { element, root, canvas, view } = await sheet(410);
  // The task first, with its statement of a line 20 px high: the sheet stands under it, and a new
  // grid with the same statement leaves it there.
  element.style.lineHeight = "20px";
  element.task = sheetTask();
  await settle();
  dense(canvas, view(), 300, 20, 330);
  await settle();
  const k = 0.41;
  // The sheet stands under the statement, a whole number of CSS pixels down.
  const sheetTop = root.querySelector(".sheet")?.getBoundingClientRect().top ?? Number.NaN;
  const down = sheetTop - element.getBoundingClientRect().top;
  expect(Number.isInteger(down)).toBe(true);
  const shot = async () => {
    const at = await screenshot(element);
    return (x: number, y: number) => at(x, down + y);
  };
  const pixel = await shot();
  const dark = (rgb: number[]) => rgb.every((channel) => channel < 90);
  const paper = (rgb: number[]) => rgb.every((channel) => channel > 250);
  // The ink over the line down at 50: the ink's colour, not the grid's.
  expect(dark(pixel(50 * k, 300 * k))).toBe(true);
  // The line down at 50, away from the ink: the grid's colour, neither paper nor ink.
  const line = pixel(50 * k, 175 * k);
  expect(paper(line) || dark(line)).toBe(false);
  // The paper in the middle of a square.
  expect(paper(pixel(75 * k, 175 * k))).toBe(true);

  element.task = sheetTask({ grid: "dots" });
  await settle();
  const dotted = await shot();
  const dot = dotted(50 * k, 50 * k);
  expect(paper(dot) || dark(dot)).toBe(false);
  // Between the dots, along where a line of squares would be: paper.
  expect(paper(dotted(50 * k, 75 * k))).toBe(true);
});

test("writing, erasing, undo() and clear() leave the template as it was", async () => {
  const { element, root, canvas, grid, view } = await sheet(400);
  element.task = sheetTask({ grid: "lines", statement: [{ text: "Write the answer below." }] });
  await settle();
  const statement = root.querySelector(".statement");
  if (!statement) throw new Error("the element has no statement");
  const records: MutationRecord[] = [];
  const observer = new MutationObserver((list) => records.push(...list));
  observer.observe(grid, { attributes: true });
  observer.observe(statement, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  });

  level(canvas, view(), 100, 100, 300);
  level(canvas, view(), 200, 100, 300);
  element.tool = "eraser";
  level(canvas, view(), 100, 200, 200);
  element.undo();
  element.clear();
  element.undo();
  await settle();
  observer.takeRecords();
  expect(records).toEqual([]);
  expect(statement.textContent).toBe("Write the answer below.");
  observer.disconnect();
});

test("the consumer's custom properties colour the paper, the grid, the ink and the bar of buttons — its glass, its icons and the accent of the tool in use and of the focus —, and a new ink is drawn without a scroll; the crop for checking keeps its own", async () => {
  const theme = document.createElement("div");
  theme.style.setProperty("--novatrail-canvas-paper", "rgb(10, 20, 30)");
  theme.style.setProperty("--novatrail-canvas-grid", "rgb(200, 0, 0)");
  theme.style.setProperty("--novatrail-canvas-ink", "rgb(0, 0, 255)");
  theme.style.setProperty("--novatrail-canvas-accent", "rgb(255, 128, 0)");
  theme.style.setProperty("--novatrail-canvas-glass", "rgba(40, 50, 60, 0.5)");
  document.body.append(theme);
  const { element, root, canvas, grid, view } = await sheet(400, undefined, theme);
  const paper = root.querySelector(".sheet");
  if (!paper) throw new Error("the element has no sheet");
  expect(getComputedStyle(paper).backgroundColor).toBe("rgb(10, 20, 30)");
  expect(getComputedStyle(grid).stroke).toBe("rgb(200, 0, 0)");
  // The bar of buttons in the glass, or the paper where nothing blurs, its icons in the ink, and
  // the tool in use filled with the accent at an eighth, its icon in the accent.
  const bar = root.querySelector(".tools");
  const inUse = root.querySelector<HTMLElement>('.tools [aria-checked="true"]');
  const other = root.querySelector('.tools [aria-checked="false"] svg');
  if (!bar || !inUse || !other) throw new Error("the element has no bar of buttons");
  const blurs = ["backdrop-filter", "-webkit-backdrop-filter"].some((name) =>
    CSS.supports(name, "blur(1px)"),
  );
  const glass = blurs ? "rgba(40, 50, 60, 0.5)" : "rgb(10, 20, 30)";
  expect(getComputedStyle(bar).backgroundColor).toBe(glass);
  expect(getComputedStyle(bar).color).toBe("rgb(0, 0, 255)");
  expect(getComputedStyle(other).fill).toBe("rgb(0, 0, 255)");
  // The accent at an eighth, as this browser computes the same mix.
  const mixed = document.createElement("div");
  mixed.style.backgroundColor = "color-mix(in srgb, rgb(255, 128, 0) 12%, transparent)";
  theme.append(mixed);
  expect(getComputedStyle(inUse).backgroundColor).toBe(getComputedStyle(mixed).backgroundColor);
  expect(getComputedStyle(inUse).color).toBe("rgb(255, 128, 0)");
  // The keyboard's focus on the tool in use: a ring in the accent, on the button's edge.
  await userEvent.tab();
  expect(root.activeElement).toBe(inUse);
  const ring = getComputedStyle(inUse);
  expect([ring.outlineStyle, ring.outlineWidth, ring.outlineColor]).toEqual([
    "solid",
    "2px",
    "rgb(255, 128, 0)",
  ]);
  inUse.blur();

  // A black liner as wide as the line of a stroke without a style: the palette's black is the
  // theme's ink on the screen.
  const { styles } = element.pens;
  element.pens = {
    ...element.pens,
    pen: "liner",
    styles: { ...styles, liner: { ...styles.liner, color: "#1c1c1e", width: 3 } },
  };
  dense(canvas, view(), 300, 100, 300);
  await settle();
  expect(near(rgbaAt(canvas, view(), 200, 300), [0, 0, 255, 255])).toBe(true);

  // A new colour ends the canvas's transition of its colour, a millisecond long, and the ink is
  // drawn anew in it.
  const ended = new Promise<void>((resolve) =>
    canvas.addEventListener("transitionend", () => resolve(), { once: true }),
  );
  theme.style.setProperty("--novatrail-canvas-ink", "rgb(0, 128, 0)");
  await ended;
  await settle();
  expect(near(rgbaAt(canvas, view(), 200, 300), [0, 128, 0, 255])).toBe(true);

  // The crop for checking is the sheet's own raster, ink on white whatever the theme.
  const work = await sheetWork(element);
  const own = workForCheck(probe(element).strokes, CROP.digit);
  if (own === null) throw new Error("the sheet gave no work for checking");
  expect(new Uint8Array(await work.png.arrayBuffer())).toEqual(own.png);
});

test("a workbook that does not fit is a TypeError at its item, and so is an answer slot in a zone in this version, and the sheet stays as it was", async () => {
  const { element, root, grid } = await sheet(400);
  const dots = sheetTask({ grid: "dots", statement: [{ text: "Count the dots." }] });
  element.task = dots;
  // A workbook whose lines do not fit is refused at its item.
  const crowded = {
    id: "tables-1",
    statement: [{ text: "Write the missing numbers." }],
    canvas: { kind: "workbook" },
    items: shortLines(21),
  } as const;
  expect(() => {
    element.task = crowded;
  }).toThrow(/^task\.items\[20\]: no room for item 21 on the workbook's page/);
  const zone = { left: 100, top: 1000, width: 400, height: 200 };
  const zoned = sheetTask({ items: [{ answer_slots: [{ binding: "zone", zone }] }] });
  expect(() => {
    element.task = zoned;
  }).toThrow(/^task\.items\[0\]\.answer_slots\[0\]\.binding: .* no "zone" yet/);
  expect(element.task).toBe(dots);
  expect(grid.getAttribute("d")).toBe("");
  expect(dotTilesOf(root)).toEqual(dotTiles(50, extentOf(element)));
  expect(root.querySelector(".statement")?.textContent).toBe("Count the dots.");
});

/** The extent of an empty sheet: the page and one view of the window past it right, two down. */
function empty(): { width: number; height: number } {
  const fit = Math.min(innerWidth / SHEET.width, 1);
  return reachOf(undefined, { width: innerWidth / fit, height: (2 * innerHeight) / fit });
}

test("a task given before the element is upgraded is taken, and one it cannot show leaves it ruled as it starts, with a warning; after the upgrade such a task is a TypeError", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const upgrade = (task: unknown) => {
      const template = document.createElement("template");
      template.innerHTML = "<novatrail-canvas></novatrail-canvas>";
      const early = template.content.firstElementChild;
      if (!(early instanceof HTMLElement)) throw new Error("the template has no element");
      Reflect.set(early, "task", task);
      document.body.append(early);
      made.push(early);
      if (!(early instanceof NovatrailCanvas)) throw new Error("the element was not upgraded");
      expect(Object.hasOwn(early, "task")).toBe(false);
      return early;
    };
    const lines = sheetTask({ grid: "lines" });
    const taken = upgrade(lines);
    expect(taken.task).toBe(lines);
    expect(taken.shadowRoot?.querySelector(".grid")?.getAttribute("d")).toBe(
      gridPath({ kind: "lines", step: 50 }, empty()),
    );
    expect(warn).not.toHaveBeenCalled();

    const left = upgrade({ canvas: { kind: "text" } });
    expect(left.task).toBeUndefined();
    expect(left.shadowRoot?.querySelector(".grid")?.getAttribute("d")).toBe(
      gridPath({ kind: "squares", step: 50 }, empty()),
    );
    expect(warn).toHaveBeenCalledOnce();

    expect(() => {
      taken.task = sheetTask({ grid_step: 5 });
    }).toThrow(TypeError);
    expect(taken.task).toBe(lines);
    expect(() => {
      taken.media = "pictures/" as unknown as NonNullable<typeof taken.media>;
    }).toThrow(TypeError);
  } finally {
    warn.mockRestore();
  }
});
