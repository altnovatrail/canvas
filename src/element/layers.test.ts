import { afterEach, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { CROP } from "../core/crop.js";
import { gridPath } from "../core/grid.js";
import { toScreen, type View } from "../core/screen.js";
import { SHEET } from "../core/sheet.js";
import { workForCheck } from "../core/submission.js";
import { NovatrailCanvas, type Task } from "./index.js";
import { probe } from "./probe.js";

// The sheet's layers in Chromium (R23): the stack in the order of concepts 8 spec, one view for
// every layer at any width and scroll, the cap of k, the task's grid, the theme, and the task as a
// property.

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

/** The client point over a point of the sheet. */
function at(canvas: HTMLCanvasElement, view: View, x: number, y: number) {
  const rect = canvas.getBoundingClientRect();
  const onScreen = toScreen(view, x, y);
  return { clientX: rect.left + onScreen.x, clientY: rect.top + onScreen.y };
}

/** A level stroke at `y`, from `from` to `to`, made by a script: a mouse's. */
function level(canvas: HTMLCanvasElement, view: View, y: number, from: number, to: number) {
  const mouse = { pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true };
  const event = (type: string, x: number, init: PointerEventInit) =>
    new PointerEvent(type, { ...mouse, ...at(canvas, view, x, y), ...init });
  canvas.dispatchEvent(event("pointerdown", from, { button: 0, buttons: 1, pressure: 0.5 }));
  canvas.dispatchEvent(event("pointermove", to, { button: -1, buttons: 1, pressure: 0.5 }));
  canvas.dispatchEvent(event("pointerup", to, { button: 0, buttons: 0, pressure: 0 }));
}

/** The red, green and blue of the canvas's device pixel over a point of the sheet, and its alpha. */
function rgbaAt(canvas: HTMLCanvasElement, view: View, x: number, y: number): number[] {
  const scale = canvas.width / SHEET.width;
  const pixel = canvas
    .getContext("2d")
    ?.getImageData(Math.floor(x * scale), Math.floor((y - view.vy) * scale), 1, 1);
  return [...(pixel?.data ?? [])];
}

const sheetKind = { kind: "handwriting-sheet" } as const;

test("the sheet is a stack of layers in the order of concepts 8 spec, and the canvas alone takes pointer events, as the element does", async () => {
  const { element, root, canvas, stage, viewport } = await sheet(400);
  const layers = [...stage.children];
  expect(layers.map((layer) => layer.getAttribute("class") ?? layer.localName)).toEqual([
    "template",
    "widget",
    "show",
    "sketch",
    "canvas",
    "marks",
  ]);
  const box = stage.getBoundingClientRect();
  for (const layer of layers) {
    const rect = layer.getBoundingClientRect();
    expect([rect.left, rect.top, rect.width, rect.height]).toEqual([
      box.left,
      box.top,
      box.width,
      box.height,
    ]);
    if (layer !== canvas) expect(getComputedStyle(layer).pointerEvents).toBe("none");
    // The marks' layer is no picture of its own: a screen reader reads each mark by its name (R26).
    if (layer.classList.contains("marks")) {
      expect(layer.getAttribute("role")).toBe("none");
      expect(layer.hasAttribute("aria-hidden")).toBe(false);
    } else if (layer !== canvas) {
      expect(layer.getAttribute("aria-hidden")).toBe("true");
    }
  }
  const sheetBox = root.querySelector(".sheet");
  if (!sheetBox) throw new Error("the element has no sheet");
  for (const box of [canvas, stage, sheetBox, viewport]) {
    expect(getComputedStyle(box).pointerEvents).toBe("auto");
  }
  // The marks over the ink take no pointer: what is under the pointer is the canvas.
  const middle = canvas.getBoundingClientRect();
  const hit = root.elementFromPoint(middle.left + 100, middle.top + 100);
  expect(hit).toBe(canvas);

  // The consumer's pointer-events: none reaches the canvas.
  element.style.pointerEvents = "none";
  for (const box of [canvas, stage, sheetBox, viewport]) {
    expect(getComputedStyle(box).pointerEvents).toBe("none");
  }
});

test("every layer shows the sheet by one view, whatever the width and the scroll, and the sheet is at most 1000 CSS pixels wide, in the middle", async () => {
  for (const width of [400, 1000, 1400]) {
    const { element, root, canvas, viewport, view } = await sheet(width, 300);
    const svgs = [...root.querySelectorAll<SVGSVGElement>(".stage > svg")];
    expect(svgs).toHaveLength(3);
    const k = Math.min(width, 1000) / 1000;
    expect(view().k).toBeCloseTo(k, 6);
    const rect = canvas.getBoundingClientRect();
    const host = element.getBoundingClientRect();
    expect(rect.left - host.left).toBeCloseTo((width - 1000 * k) / 2, 6);
    expect(canvas.width).toBe(Math.round(1000 * k * devicePixelRatio));

    const end = viewport.scrollHeight - viewport.clientHeight;
    for (const scrollTop of [0, Math.round(end / 2), end]) {
      viewport.scrollTop = scrollTop;
      await settle();
      const shown = view();
      expect(shown.vy).toBeCloseTo(scrollTop / k, 3);
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
  expect(template.viewBox.baseVal.height).toBeCloseTo(200 / 0.4, 3);
  element.style.width = "300px";
  // An observer made after the element's own reports after it, in the same frame, before paint.
  const height = await new Promise<number>((resolve) => {
    const observer = new ResizeObserver(() => {
      observer.disconnect();
      resolve(template.viewBox.baseVal.height);
    });
    observer.observe(viewport);
  });
  expect(height).toBeCloseTo(200 / 0.3, 3);
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
  const { element, grid } = await sheet(400);
  expect(grid.getAttribute("d")).toBe(gridPath({ kind: "squares", step: 50 }));
  expect(grid.classList.contains("dots")).toBe(false);

  const dots: Task = { canvas: { ...sheetKind, grid: "dots", step: 40 } };
  element.task = dots;
  expect(element.task).toBe(dots);
  expect(grid.getAttribute("d")).toBe(gridPath({ kind: "dots", step: 40 }));
  expect(grid.classList.contains("dots")).toBe(true);
  await settle();

  const root = element.shadowRoot;
  if (!root) throw new Error("the element has no shadow root");
  const records: MutationRecord[] = [];
  const observer = new MutationObserver((list) => records.push(...list));
  observer.observe(root, { subtree: true, childList: true, attributes: true, characterData: true });
  // The same object, and then another of the same template, with a field the sheet passes over.
  element.task = dots;
  const same = { canvas: { ...sheetKind, grid: "dots", step: 40 }, id: "posts" } as Task;
  element.task = same;
  expect(element.task).toBe(same);
  await settle();
  observer.takeRecords();
  expect(records).toEqual([]);

  element.task = { canvas: { ...sheetKind, grid: "lines" } };
  expect(grid.getAttribute("d")).toBe(gridPath({ kind: "lines", step: 50 }));
  element.task = undefined;
  expect(grid.getAttribute("d")).toBe(gridPath({ kind: "squares", step: 50 }));
  observer.disconnect();
});

/** The pixels of a screenshot of an element, at the density of the screen, without a file. */
async function screenshot(element: HTMLElement) {
  const base64 = await page.screenshot({ element, save: false });
  const file = await (await fetch(`data:image/png;base64,${base64}`)).blob();
  const bitmap = await createImageBitmap(file);
  const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext("2d");
  if (context === null) throw new Error("no context to read the screenshot with");
  context.drawImage(bitmap, 0, 0);
  const scale = bitmap.width / element.getBoundingClientRect().width;
  /** The red, green and blue of the screenshot's pixel at a CSS point of the element. */
  return (x: number, y: number) => [
    ...context.getImageData(Math.floor(x * scale), Math.floor(y * scale), 1, 1).data.subarray(0, 3),
  ];
}

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
  const { element, canvas, view } = await sheet(410);
  dense(canvas, view(), 300, 20, 330);
  await settle();
  const pixel = await screenshot(element);
  const k = 0.41;
  const dark = (rgb: number[]) => rgb.every((channel) => channel < 90);
  const paper = (rgb: number[]) => rgb.every((channel) => channel > 250);
  // The ink over the line down at 50: the ink's colour, not the grid's.
  expect(dark(pixel(50 * k, 300 * k))).toBe(true);
  // The line down at 50, away from the ink: the grid's colour, neither paper nor ink.
  const line = pixel(50 * k, 175 * k);
  expect(paper(line) || dark(line)).toBe(false);
  // The paper in the middle of a square.
  expect(paper(pixel(75 * k, 175 * k))).toBe(true);

  element.task = { canvas: { ...sheetKind, grid: "dots" } };
  await settle();
  const dotted = await screenshot(element);
  const dot = dotted(50 * k, 50 * k);
  expect(paper(dot) || dark(dot)).toBe(false);
  // Between the dots, along where a line of squares would be: paper.
  expect(paper(dotted(50 * k, 75 * k))).toBe(true);
});

test("writing, erasing, undo() and clear() leave the template as it was", async () => {
  const { element, root, canvas, grid, view } = await sheet(400);
  element.task = {
    canvas: { ...sheetKind, grid: "lines" },
    statement: [{ text: "Write the answer below." }],
  };
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

test("the consumer's custom properties colour the paper, the grid and the ink, and a new ink is drawn without a scroll; the crop for checking keeps its own", async () => {
  const theme = document.createElement("div");
  theme.style.setProperty("--novatrail-canvas-paper", "rgb(10, 20, 30)");
  theme.style.setProperty("--novatrail-canvas-grid", "rgb(200, 0, 0)");
  theme.style.setProperty("--novatrail-canvas-ink", "rgb(0, 0, 255)");
  document.body.append(theme);
  const { element, root, canvas, grid, view } = await sheet(400, undefined, theme);
  const paper = root.querySelector(".sheet");
  if (!paper) throw new Error("the element has no sheet");
  expect(getComputedStyle(paper).backgroundColor).toBe("rgb(10, 20, 30)");
  expect(getComputedStyle(grid).stroke).toBe("rgb(200, 0, 0)");

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

  // The crop for checking is the sheet's own raster, ink on white whatever the theme (R25).
  const work = await element.exportWork();
  const own = workForCheck(probe(element).strokes, CROP.digit);
  if (work === null || own === null) throw new Error("the sheet gave no work for checking");
  expect(new Uint8Array(await work.png.arrayBuffer())).toEqual(own.png);
});

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
    const lines: Task = { canvas: { ...sheetKind, grid: "lines" } };
    const taken = upgrade(lines);
    expect(taken.task).toBe(lines);
    expect(taken.shadowRoot?.querySelector(".grid")?.getAttribute("d")).toBe(
      gridPath({ kind: "lines", step: 50 }),
    );
    expect(warn).not.toHaveBeenCalled();

    const left = upgrade({ canvas: { kind: "text" } });
    expect(left.task).toBeUndefined();
    expect(left.shadowRoot?.querySelector(".grid")?.getAttribute("d")).toBe(
      gridPath({ kind: "squares", step: 50 }),
    );
    expect(warn).toHaveBeenCalledOnce();

    expect(() => {
      taken.task = { canvas: { ...sheetKind, step: 5 } };
    }).toThrow(TypeError);
    expect(taken.task).toBe(lines);
    expect(() => {
      taken.media = "pictures/" as unknown as NonNullable<typeof taken.media>;
    }).toThrow(TypeError);
  } finally {
    warn.mockRestore();
  }
});
