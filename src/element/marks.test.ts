import { afterEach, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { type Box, boxOf } from "../core/geometry.js";
import type { Mark, Marks, SheetSubmission } from "../core/marks.js";
import type { View } from "../core/screen.js";
import { SHEET } from "../core/sheet.js";
import { NovatrailCanvas } from "./index.js";
import { at, screenshot, sheetWork } from "./pointer.fixture.js";
import { probe } from "./probe.js";

// The tutor's marks on the sheet in Chromium (R26): a frame round the strokes a mark holds on to,
// as they are now, over the work and through to the pen, read by its name; fading while a stroke
// comes into it; and nothing written while nothing changes. The submissions are the element's own,
// from its exportWork() (R27): the crop's numbers, the groups and their digest.

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

/** A sheet `width` CSS pixels wide, as tall as the sheet unless given a height. */
async function sheet(width: number, height?: number) {
  const element = document.createElement("novatrail-canvas");
  element.style.width = `${width}px`;
  if (height !== undefined) element.style.height = `${height}px`;
  document.body.append(element);
  made.push(element);
  await settle();
  const root = element.shadowRoot;
  const canvas = root?.querySelector("canvas");
  const layer = root?.querySelector<SVGSVGElement>("svg.marks");
  const viewport = root?.querySelector(".viewport");
  if (!root || !canvas || !layer || !viewport) throw new Error("the element has no stage");
  return { element, root, canvas, layer, viewport, view: () => viewOf(element) };
}

function viewOf(element: HTMLElement): View {
  const { view } = probe(element);
  if (view === undefined) throw new Error("the element is not laid out");
  return view;
}

const mouse = { pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true };

/** A mouse's press on the canvas, through the points of the sheet given, by a script. */
function press(canvas: HTMLCanvasElement, view: () => View) {
  const send = (type: string, [x, y]: readonly [number, number], init: PointerEventInit) =>
    canvas.dispatchEvent(
      new PointerEvent(type, { ...mouse, ...at(canvas, view(), x, y), ...init }),
    );
  return {
    down: (point: readonly [number, number]) =>
      send("pointerdown", point, { button: 0, buttons: 1, pressure: 0.5 }),
    move: (point: readonly [number, number]) =>
      send("pointermove", point, { button: -1, buttons: 1, pressure: 0.5 }),
    up: (point: readonly [number, number]) =>
      send("pointerup", point, { button: 0, buttons: 0, pressure: 0 }),
    cancel: (point: readonly [number, number]) =>
      send("pointercancel", point, { button: 0, buttons: 0 }),
  };
}

/** A stroke through the points given, start to end. */
function draw(canvas: HTMLCanvasElement, view: () => View, ...points: [number, number][]) {
  const hand = press(canvas, view);
  const [first, ...rest] = points;
  if (first === undefined) throw new Error("a stroke needs a point");
  hand.down(first);
  for (const point of rest) hand.move(point);
  hand.up(points.at(-1) ?? first);
}

/** «A», two level strokes, and «B», one far off: the sheet most tests write. */
function twoGroups(canvas: HTMLCanvasElement, view: () => View): void {
  draw(canvas, view, [100, 100], [200, 100]);
  draw(canvas, view, [100, 140], [200, 140]);
  draw(canvas, view, [600, 600], [800, 600]);
}

/** The element's submission, as its exportWork() gives it (R27): its crop at 32 px, its groups. */
async function sentOf(element: NovatrailCanvas): Promise<SheetSubmission> {
  return (await sheetWork(element)).submission;
}

function frameOf(name: string, at: Mark["at"]): Mark {
  return { kind: "frame", at, name };
}

/** The frame a mark is to show: round the points of the strokes given, 10 units off, on the sheet. */
function around(element: HTMLElement, ids: readonly number[], half = 0): Box {
  const box = boxOf(
    probe(element)
      .strokes.filter(({ id }) => ids.includes(id))
      .flatMap(({ points }) => points),
  );
  return {
    minX: Math.max(box.minX - 10, half),
    minY: Math.max(box.minY - 10, half),
    maxX: Math.min(box.maxX + 10, SHEET.width - half),
    maxY: Math.min(box.maxY + 10, SHEET.height - half),
  };
}

const rects = (layer: SVGSVGElement) => [...layer.querySelectorAll("rect")];
const shown = (layer: SVGSVGElement) =>
  rects(layer).filter((rect) => !rect.hasAttribute("display"));

function geometry(rect: SVGRectElement): Box {
  const x = Number(rect.getAttribute("x"));
  const y = Number(rect.getAttribute("y"));
  return {
    minX: x,
    minY: y,
    maxX: x + Number(rect.getAttribute("width")),
    maxY: y + Number(rect.getAttribute("height")),
  };
}

function expectNear(actual: Box | null | undefined, expected: Box): void {
  if (actual === null || actual === undefined) throw new Error("no frame");
  for (const key of ["minX", "minY", "maxX", "maxY"] as const) {
    expect(Math.abs(actual[key] - expected[key]), key).toBeLessThan(1e-9);
  }
}

test("a frame stands round its strokes, 10 units off their points, over the work: a screen reader reads its name, and the pen writes through it", async () => {
  const { element, root, canvas, layer, view } = await sheet(500);
  twoGroups(canvas, view);
  await settle();
  const submission = await sentOf(element);
  expect(submission.groups.map(({ ids }) => ids)).toEqual([[1, 2], [3]]);
  const marks: Marks = { submission, marks: [frameOf("Look at these lines", { group: "A" })] };
  element.marks = marks;
  expect(element.marks).toBe(marks);
  await settle();
  const [mark] = probe(element).marks;
  expect(mark?.ids).toEqual([1, 2]);
  expectNear(mark?.frame, around(element, [1, 2]));
  const [rect] = shown(layer);
  if (rect === undefined) throw new Error("no frame drawn");
  expectNear(geometry(rect), around(element, [1, 2]));
  expect(getComputedStyle(rect).stroke).toBe("rgb(37, 99, 235)");
  expect(layer.getAttribute("role")).toBe("none");
  expect(layer.hasAttribute("aria-hidden")).toBe(false);
  await expect.element(page.getByRole("img", { name: "Look at these lines" })).toBeVisible();
  expect(page.getByRole("img").elements()).toHaveLength(1);
  // Under the pointer, on the frame's line too, is the canvas: the pen writes through the marks.
  const line = at(canvas, view(), 90, 120);
  expect(root.elementFromPoint(line.clientX, line.clientY)).toBe(canvas);
  draw(canvas, view, [90, 120], [95, 160]);
  await settle();
  expect(probe(element).strokes).toHaveLength(4);
});

test("a box on the crop takes the strokes the model saw there, and what is written after the submission is none of the mark", async () => {
  const { element, canvas, view } = await sheet(500);
  twoGroups(canvas, view);
  await settle();
  const submission = await sentOf(element);
  // Written after the submission, from inside the frame of «A» to well past it.
  draw(canvas, view, [150, 120], [300, 120]);
  await settle();
  const box = submission.crop.frames[0]?.box;
  if (box === undefined) throw new Error("no frame of A");
  element.marks = { submission, marks: [frameOf("The place the model named", { box })] };
  await settle();
  const [mark] = probe(element).marks;
  expect(mark?.ids).toEqual([1, 2]);
  expectNear(mark?.frame, around(element, [1, 2]));
});

test("the frame follows its strokes as they are erased, is gone when all are, and comes back with undo", async () => {
  const { element, canvas, layer, view } = await sheet(500);
  twoGroups(canvas, view);
  await settle();
  element.marks = { submission: await sentOf(element), marks: [frameOf("This", { group: "A" })] };
  await settle();
  element.tool = "eraser";
  const eraser = press(canvas, view);
  eraser.down([150, 100]);
  eraser.up([150, 100]);
  await settle();
  expect(probe(element).strokes.map(({ id }) => id)).toEqual([2, 3]);
  expectNear(probe(element).marks[0]?.frame, around(element, [2]));
  eraser.down([150, 140]);
  eraser.up([150, 140]);
  await settle();
  expect(probe(element).marks[0]?.frame).toBeNull();
  expect(shown(layer)).toEqual([]);
  expect(page.getByRole("img").elements()).toHaveLength(0);
  element.undo();
  element.undo();
  await settle();
  expectNear(probe(element).marks[0]?.frame, around(element, [1, 2]));
  expect(page.getByRole("img").elements()).toHaveLength(1);
});

test("strokes under the eraser take the frame off at once; a cancelled press brings it back, a lifted one takes it, and undo returns it", async () => {
  const { element, canvas, view } = await sheet(500);
  twoGroups(canvas, view);
  await settle();
  element.marks = { submission: await sentOf(element), marks: [frameOf("This", { group: "A" })] };
  await settle();
  element.tool = "eraser";
  const eraser = press(canvas, view);
  eraser.down([150, 90]);
  eraser.move([150, 150]);
  await settle();
  expect(probe(element).pending).toEqual([1, 2]);
  expect(probe(element).marks[0]?.frame).toBeNull();
  eraser.cancel([150, 150]);
  await settle();
  expectNear(probe(element).marks[0]?.frame, around(element, [1, 2]));
  eraser.down([150, 90]);
  eraser.move([150, 150]);
  eraser.up([150, 150]);
  await settle();
  expect(probe(element).marks[0]?.frame).toBeNull();
  element.undo();
  await settle();
  expectNear(probe(element).marks[0]?.frame, around(element, [1, 2]));
});

test("new strokes inside a frame do not move it, and marks given after clear() show their strokes when undo brings them back", async () => {
  const { element, canvas, view } = await sheet(500);
  twoGroups(canvas, view);
  await settle();
  const submission = await sentOf(element);
  element.clear();
  element.marks = { submission, marks: [frameOf("This", { group: "A" })] };
  await settle();
  expect(probe(element).marks[0]?.frame).toBeNull();
  element.undo();
  await settle();
  const before = around(element, [1, 2]);
  expectNear(probe(element).marks[0]?.frame, before);
  draw(canvas, view, [120, 110], [180, 130]);
  draw(canvas, view, [60, 60], [250, 200]);
  await settle();
  expectNear(probe(element).marks[0]?.frame, before);
});

test("a box over empty paper, and an answer cell on a sheet, which takes no zones, have no frame", async () => {
  const { element, canvas, layer, view } = await sheet(500);
  twoGroups(canvas, view);
  await settle();
  element.marks = {
    submission: await sentOf(element),
    marks: [
      frameOf("Nothing here", { box: [0, 0, 1, 1] }),
      frameOf("The answer", { cell: { item: 1, slot: 1 } }),
    ],
  };
  await settle();
  expect(probe(element).marks).toEqual([]);
  expect(rects(layer)).toEqual([]);
  expect(page.getByRole("img").elements()).toHaveLength(0);
});

test("a frame fades while the stroke under way comes into it, back when it lands, and not for a stroke elsewhere", async () => {
  const { element, canvas, layer, view } = await sheet(500);
  twoGroups(canvas, view);
  await settle();
  element.marks = { submission: await sentOf(element), marks: [frameOf("This", { group: "A" })] };
  await settle();
  const [rect] = shown(layer);
  if (rect === undefined) throw new Error("no frame drawn");
  const hand = press(canvas, view);
  // From outside the frame into it: the frame fades as the stroke comes in.
  hand.down([300, 120]);
  await settle();
  expect(rect.classList.contains("under")).toBe(false);
  hand.move([150, 120]);
  await settle();
  expect(rect.classList.contains("under")).toBe(true);
  expect(getComputedStyle(rect).opacity).toBe("0.25");
  // It stays faded while the stroke goes on beyond it, till it lands.
  hand.move([300, 300]);
  await settle();
  expect(rect.classList.contains("under")).toBe(true);
  hand.up([300, 300]);
  await settle();
  expect(rect.classList.contains("under")).toBe(false);
  // A stroke far from the frame leaves it as it is.
  hand.down([700, 900]);
  hand.move([800, 950]);
  await settle();
  expect(rect.classList.contains("under")).toBe(false);
  hand.up([800, 950]);
  await settle();
  // Marks that come while a stroke is under way in their frame fade at once.
  element.marks = undefined;
  hand.down([150, 120]);
  hand.move([160, 125]);
  await settle();
  element.marks = { submission: await sentOf(element), marks: [frameOf("This", { group: "A" })] };
  await settle();
  const [late] = shown(layer);
  expect(late?.classList.contains("under")).toBe(true);
  hand.up([160, 125]);
  await settle();
  expect(late?.classList.contains("under")).toBe(false);
});

test("marks equal to those shown, writing far from every frame and a scroll write nothing to the frames", async () => {
  const { element, canvas, layer, viewport, view } = await sheet(500, 300);
  twoGroups(canvas, view);
  await settle();
  const marks: Marks = {
    submission: await sentOf(element),
    marks: [frameOf("This", { group: "A" })],
  };
  element.marks = marks;
  await settle();
  const records: MutationRecord[] = [];
  const observer = new MutationObserver((list) => records.push(...list));
  observer.observe(layer, { subtree: true, childList: true, attributes: true });
  element.marks = JSON.parse(JSON.stringify(marks));
  await settle();
  draw(canvas, view, [600, 200], [700, 200]);
  await settle();
  viewport.scrollTop = 200;
  await settle();
  observer.takeRecords();
  observer.disconnect();
  // The layer's own view box moves with the scroll; the frames do not.
  expect(records.filter((record) => record.target !== layer)).toEqual([]);
  expect(records.some((record) => record.attributeName === "viewBox")).toBe(true);
});

test("a frame at the sheet's edge stays whole on it, and two marks of one name are two pictures", async () => {
  const { element, canvas, view } = await sheet(500);
  draw(canvas, view, [0, 2], [100, 2]);
  draw(canvas, view, [700, 700], [800, 700]);
  await settle();
  element.marks = {
    submission: await sentOf(element),
    marks: [frameOf("Here", { group: "A" }), frameOf("Here", { group: "B" })],
  };
  await settle();
  const half = 1 / viewOf(element).k;
  const [edge] = probe(element).marks;
  expectNear(edge?.frame, around(element, [1], half));
  expect(edge?.frame?.minX).toBe(half);
  expect(page.getByRole("img", { name: "Here" }).elements()).toHaveLength(2);
  // The same object, its list grown, given again: every value is checked as it comes.
  const list: Mark[] = [frameOf("Here", { group: "A" })];
  const marks: Marks = { submission: await sentOf(element), marks: list };
  element.marks = marks;
  await settle();
  expect(probe(element).marks).toHaveLength(1);
  list.push(frameOf("There", { group: "B" }));
  element.marks = marks;
  await settle();
  expect(probe(element).marks.map(({ name }) => name)).toEqual(["Here", "There"]);
});

test("the frame takes the theme's colour, and leaves its own strokes' ink as it is on the screen", async () => {
  const { element, canvas, layer, view } = await sheet(500);
  // The same level stroke, six times over, so that the middle of the line is covered.
  for (let i = 0; i < 6; i++) draw(canvas, view, [100, 300], [300, 300]);
  await settle();
  element.style.setProperty("--novatrail-canvas-mark", "rgb(0, 160, 0)");
  element.marks = { submission: await sentOf(element), marks: [frameOf("This", { group: "A" })] };
  await settle();
  const [rect] = shown(layer);
  if (rect === undefined) throw new Error("no frame drawn");
  expect(getComputedStyle(rect).stroke).toBe("rgb(0, 160, 0)");
  const shot = await screenshot(element);
  const box = element.getBoundingClientRect();
  const pixel = (x: number, y: number) => {
    const point = at(canvas, view(), x, y);
    return shot(point.clientX - box.left, point.clientY - box.top);
  };
  // The ink: dark, untinted by the frame. The frame's line: green.
  for (const x of [120, 200, 280]) {
    const [r = 255, g = 255, b = 255] = pixel(x, 300);
    expect(Math.max(r, g, b), `ink at ${x}`).toBeLessThan(80);
  }
  const [r = 0, g = 0, b = 0] = pixel(200, 290);
  expect(g).toBeGreaterThan(r + 60);
  expect(g).toBeGreaterThan(b + 60);
});

test("marks not of a submission of this sheet are a TypeError, undefined takes the marks off, and marks given before the element is upgraded that are not its own leave it without marks, with a warning", async () => {
  const { element, canvas, layer, view } = await sheet(500);
  twoGroups(canvas, view);
  await settle();
  const own: Marks = {
    submission: await sentOf(element),
    marks: [frameOf("This", { group: "A" })],
  };
  expect(() => {
    element.marks = null as unknown as Marks;
  }).toThrow(TypeError);
  // Another element's sheet: strokes of the same IDs, elsewhere.
  const other = await sheet(500);
  draw(other.canvas, other.view, [500, 800], [700, 800]);
  draw(other.canvas, other.view, [500, 840], [700, 840]);
  draw(other.canvas, other.view, [100, 1200], [300, 1200]);
  await settle();
  const theirs: Marks = { submission: await sentOf(other.element), marks: own.marks };
  expect(() => {
    element.marks = theirs;
  }).toThrow(/not this sheet's/);
  expect(element.marks).toBeUndefined();
  element.marks = own;
  await settle();
  expect(shown(layer)).toHaveLength(1);
  element.marks = undefined;
  await settle();
  expect(rects(layer)).toEqual([]);
  expect(probe(element).marks).toEqual([]);

  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const template = document.createElement("template");
    template.innerHTML = "<novatrail-canvas></novatrail-canvas>";
    const early = template.content.firstElementChild;
    if (!(early instanceof HTMLElement)) throw new Error("the template has no element");
    Reflect.set(early, "marks", own);
    document.body.append(early);
    made.push(early);
    expect(early).toBeInstanceOf(NovatrailCanvas);
    expect(early instanceof NovatrailCanvas && early.marks).toBeUndefined();
    expect(warn).toHaveBeenCalledOnce();
  } finally {
    warn.mockRestore();
  }
});

test("a new history puts the marks back on their strokes, or takes them off; the same history in another element takes them, and marks before their history are a TypeError", async () => {
  const { element, canvas, layer, view } = await sheet(500);
  twoGroups(canvas, view);
  await settle();
  const marks: Marks = {
    submission: await sentOf(element),
    marks: [frameOf("This", { group: "A" })],
  };
  element.marks = marks;
  await settle();
  const drawn = probe(element).marks;
  expect(drawn).toHaveLength(1);

  // The history with the writing of «B» undone: the marks' strokes are all in it, and the frame of
  // «A» stays as it was, nothing written to it.
  const records: MutationRecord[] = [];
  const observer = new MutationObserver((list) => records.push(...list));
  observer.observe(layer, { subtree: true, attributes: true, childList: true });
  const history = JSON.parse(JSON.stringify(element.history));
  const last = element.history.at(-1)?.t ?? 0;
  element.history = [...history, { kind: "undo", t: last + 10, removed: [3], restored: [] }];
  await settle();
  observer.disconnect();
  expect(probe(element).strokes.map(({ id }) => id)).toEqual([1, 2]);
  expect(element.marks).toBe(marks);
  expect(probe(element).marks).toEqual(drawn);
  expect(records.filter((record) => record.attributeName !== "viewBox")).toEqual([]);

  // The same history in another element, as after the page is opened again.
  const other = await sheet(500);
  other.element.history = history;
  other.element.marks = marks;
  await settle();
  expect(probe(other.element).marks.map(({ ids }) => ids)).toEqual(drawn.map(({ ids }) => ids));

  // Marks given before their history: the sheet knows none of their strokes.
  const early = await sheet(500);
  expect(() => {
    early.element.marks = marks;
  }).toThrow(/not this sheet's/);

  // A history without their strokes takes them off.
  element.history = undefined;
  await settle();
  expect(element.marks).toBeUndefined();
  expect(rects(layer)).toEqual([]);
  expect(probe(element).marks).toEqual([]);
});

test("a new history places the marks as they were checked when given, whatever the consumer did to its object since", async () => {
  const { element, canvas, view } = await sheet(500);
  twoGroups(canvas, view);
  await settle();
  const given = JSON.parse(
    JSON.stringify({ submission: await sentOf(element), marks: [frameOf("This", { group: "A" })] }),
  );
  element.marks = given;
  await settle();
  const drawn = probe(element).marks;
  // The consumer reuses its object: a mark the sheet would not take, and «A» gone from its table.
  given.marks.push({ kind: "underline", at: { group: "A" }, name: "Not a frame" });
  given.submission.groups = given.submission.groups.slice(1);
  const last = element.history.at(-1)?.t ?? 0;
  element.history = [
    ...JSON.parse(JSON.stringify(element.history)),
    { kind: "undo", t: last + 10, removed: [3], restored: [] },
  ];
  await settle();
  expect(element.marks).toBe(given);
  expect(probe(element).marks).toEqual(drawn);
});
