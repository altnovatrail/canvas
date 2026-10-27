import { afterEach, expect, test, vi } from "vitest";
import type { View } from "../core/screen.js";
import { SHEET } from "../core/sheet.js";
import { NovatrailCanvas, type Tool } from "./index.js";
import { at, input, level } from "./pointer.fixture.js";
import { probe } from "./probe.js";
import { PEN_MODE } from "./session.js";

// The sheet's input in Chromium (R18): events that a script makes, with their coalesced points,
// and real input through the DevTools protocol — a mouse, and a pen with its pressure.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
  // A pen puts the whole page in pen mode: the next test starts without it.
  PEN_MODE.on = false;
});

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
/** Two frames: one for the element's layout, one for its drawing. */
async function settle(): Promise<void> {
  await frame();
  await frame();
}

/** A sheet `width` CSS pixels wide, and as tall as the sheet unless given a height. */
async function sheet(width: number, height?: number) {
  const element = document.createElement("novatrail-canvas");
  element.style.width = `${width}px`;
  if (height !== undefined) element.style.height = `${height}px`;
  document.body.append(element);
  made.push(element);
  await settle();
  const canvas = element.shadowRoot?.querySelector("canvas");
  const viewport = element.shadowRoot?.querySelector(".viewport");
  if (!canvas || !viewport) throw new Error("the element has no canvas in a viewport");
  return { element, canvas, viewport, view: () => viewOf(element) };
}

function viewOf(element: HTMLElement): View {
  const { view } = probe(element);
  if (view === undefined) throw new Error("the element is not laid out");
  return view;
}

/** The alpha of the canvas's device pixel over a point of the sheet: 0 where there is no ink. */
function inkAt(canvas: HTMLCanvasElement, view: View, x: number, y: number): number {
  const scale = canvas.width / SHEET.width;
  const pixel = canvas
    .getContext("2d")
    ?.getImageData(Math.floor(x * scale), Math.floor((y - view.vy) * scale), 1, 1);
  return pixel?.data[3] ?? 0;
}

test("pointer events on the canvas, with their coalesced points, make a stroke in sheet units and ink where it went", async () => {
  const { element, canvas, view } = await sheet(400);
  expect(view().k).toBeCloseTo(0.4, 6);
  const pen = { pointerId: 7, pointerType: "pen", isPrimary: true, bubbles: true };
  const event = (type: string, x: number, init: PointerEventInit) =>
    new PointerEvent(type, { ...pen, ...at(canvas, view(), x, 100), ...init });
  canvas.dispatchEvent(event("pointerdown", 100, { button: 0, buttons: 1, pressure: 0.4 }));
  const moves = [125, 150, 175, 200].map((x) =>
    event("pointermove", x, { button: -1, buttons: 1, pressure: 0.6 }),
  );
  canvas.dispatchEvent(
    event("pointermove", 200, { button: -1, buttons: 1, pressure: 0.6, coalescedEvents: moves }),
  );
  canvas.dispatchEvent(event("pointerup", 200, { button: 0, buttons: 0, pressure: 0 }));

  const [stroke, ...more] = probe(element).strokes;
  expect(more).toEqual([]);
  expect(stroke?.kind).toBe("pen");
  expect(stroke?.points.map((point) => Math.round(point.x * 1000) / 1000)).toEqual([
    100, 125, 150, 175, 200, 200,
  ]);
  expect(stroke?.points.map((point) => Math.round(point.y * 1000) / 1000)).toEqual([
    100, 100, 100, 100, 100, 100,
  ]);
  // pressure is a float of 32 bits.
  expect(stroke?.points.map((point) => Math.round(point.p * 100) / 100)).toEqual([
    0.4, 0.6, 0.6, 0.6, 0.6, 0.6,
  ]);
  await settle();
  expect(inkAt(canvas, view(), 150, 100)).toBeGreaterThan(0);
  expect(inkAt(canvas, view(), 150, 300)).toBe(0);
});

test("a real mouse drag, captured beyond the canvas, writes on to the sheet's edge", async () => {
  const { element, canvas, view } = await sheet(400);
  // A mouse of the protocol presses with the force it is given, 0 unless told; a real one with
  // 0.5 while its button is down, and with 0 once it is up.
  const pressed = { force: 0.5 };
  await input("mousePressed", at(canvas, view(), 100, 100), pressed);
  await input("mouseMoved", at(canvas, view(), 300, 100), pressed);
  // Below the canvas, and so below the sheet: the canvas holds the pointer, and the point is
  // clamped to the sheet's bottom edge.
  const below = {
    ...at(canvas, view(), 300, 0),
    clientY: canvas.getBoundingClientRect().bottom + 100,
  };
  await input("mouseMoved", below, pressed);
  await input("mouseReleased", below, { force: 0 });

  const [stroke] = probe(element).strokes;
  expect(stroke?.kind).toBe("mouse");
  const points = stroke?.points ?? [];
  expect(points[0]?.x).toBeCloseTo(100, 0);
  expect(points[0]?.y).toBeCloseTo(100, 0);
  expect(points.at(-1)?.y).toBe(SHEET.height);
  // The last point keeps the pressure of the drag, not pointerup's 0.
  expect(points.map((point) => point.p)).toEqual(points.map(() => 0.5));
});

test("a real pen writes with its pressure", async () => {
  const { element, canvas, view } = await sheet(400);
  const pen = (force: number) => ({ pointerType: "pen" as const, force });
  await input("mousePressed", at(canvas, view(), 100, 200), pen(0.8));
  await input("mouseMoved", at(canvas, view(), 200, 200), pen(0.3));
  await input("mouseReleased", at(canvas, view(), 200, 200), pen(0));

  const [stroke] = probe(element).strokes;
  expect(stroke?.kind).toBe("pen");
  expect(stroke?.points.map((point) => Math.round(point.p * 100) / 100)).toEqual([0.8, 0.3, 0.3]);
});

test("a sheet taller than the element scrolls, and input lands where its visible part shows", async () => {
  const { element, canvas, viewport, view } = await sheet(400, 200);
  // The container takes what the element's height leaves under its row of buttons (R28).
  const row = element.shadowRoot?.querySelector(".tools")?.getBoundingClientRect().height ?? 0;
  expect(row).toBeGreaterThan(0);
  expect(canvas.getBoundingClientRect().height).toBeCloseTo(200 - row, 6);
  viewport.scrollTop = 100;
  await settle();
  // 100 CSS pixels down: 250 units at k 0.4, a little more if a scroll bar takes some width.
  expect(view().vy).toBeCloseTo(100 / view().k, 6);

  level(canvas, view(), 300, 100, 200);
  expect(probe(element).strokes[0]?.points[0]?.y).toBeCloseTo(300, 6);
  await settle();
  expect(inkAt(canvas, view(), 150, 300)).toBeGreaterThan(0);
  expect(inkAt(canvas, view(), 150, 400)).toBe(0);
});

// It runs at two densities, 1 and 2: vitest.config.ts has a browser of each.
test("the canvas has a pixel for each device pixel, and a stroke stays in its place on the sheet when the element is resized", async () => {
  const { canvas, element, view } = await sheet(400);
  const devicePixels = () => canvas.getBoundingClientRect().width * devicePixelRatio;
  expect(canvas.width).toBe(devicePixels());
  level(canvas, view(), 700, 400, 600);
  await settle();
  expect(inkAt(canvas, view(), 500, 700)).toBeGreaterThan(0);

  element.style.width = "300px";
  await settle();
  expect(view().k).toBeCloseTo(0.3, 6);
  expect(canvas.width).toBe(devicePixels());
  expect(inkAt(canvas, view(), 500, 700)).toBeGreaterThan(0);
  expect(inkAt(canvas, view(), 500, 750)).toBe(0);
});

test("a resize puts the ink back before the frame is painted", async () => {
  const { canvas, element, viewport, view } = await sheet(400);
  level(canvas, view(), 700, 400, 600);
  await settle();
  element.style.width = "300px";
  // An observer made after the element's own reports after it, in the same frame, before paint:
  // the element has resized its canvas, which clears it, by then.
  const ink = await new Promise<number>((resolve) => {
    const observer = new ResizeObserver(() => {
      observer.disconnect();
      resolve(inkAt(canvas, view(), 500, 700));
    });
    observer.observe(viewport);
  });
  expect(view().k).toBeCloseTo(0.3, 6);
  expect(ink).toBeGreaterThan(0);
});

test("finished strokes are outlined once: a new frame outlines only the stroke under way", async () => {
  const { element, canvas, viewport, view } = await sheet(400, 300);
  level(canvas, view(), 100, 100, 300);
  level(canvas, view(), 150, 100, 300);
  await settle();
  const once = probe(element).outlines;
  expect(once).toBe(2);

  viewport.scrollTop = 50;
  element.style.width = "380px";
  await settle();
  expect(probe(element).outlines).toBe(once);

  const pointer = { pointerId: 3, pointerType: "touch", isPrimary: true, bubbles: true };
  canvas.dispatchEvent(
    new PointerEvent("pointerdown", {
      ...pointer,
      ...at(canvas, view(), 500, 500),
      button: 0,
      buttons: 1,
    }),
  );
  await settle();
  expect(probe(element).outlines).toBe(once + 1);
});

test("a sheet taken off the page ends the stroke under way where it was", async () => {
  const { element, canvas, view } = await sheet(400);
  const pointer = { pointerId: 4, pointerType: "pen", isPrimary: true, bubbles: true };
  canvas.dispatchEvent(
    new PointerEvent("pointerdown", {
      ...pointer,
      ...at(canvas, view(), 50, 50),
      button: 0,
      buttons: 1,
    }),
  );
  canvas.dispatchEvent(
    new PointerEvent("pointermove", {
      ...pointer,
      ...at(canvas, view(), 80, 50),
      button: -1,
      buttons: 1,
    }),
  );
  element.remove();
  expect(probe(element).live).toBeUndefined();
  expect(probe(element).strokes[0]?.points.map((point) => Math.round(point.x))).toEqual([50, 80]);
});

test("undo() and clear() take ink off the sheet and bring it back, each stroke's path built once", async () => {
  const { element, canvas, view } = await sheet(400);
  level(canvas, view(), 300, 100, 300);
  level(canvas, view(), 600, 100, 300);
  await settle();
  const ids = () => probe(element).strokes.map((stroke) => stroke.id);
  // Whether there is ink in the middle of the first stroke, and of the second.
  const ink = () => [inkAt(canvas, view(), 200, 300) > 0, inkAt(canvas, view(), 200, 600) > 0];
  expect(ids()).toEqual([1, 2]);
  expect(ink()).toEqual([true, true]);

  expect(element.clear()).toBe(true);
  await settle();
  expect(ids()).toEqual([]);
  expect(ink()).toEqual([false, false]);
  expect(element.clear()).toBe(false);

  expect(element.undo()).toBe(true);
  await settle();
  expect(ids()).toEqual([1, 2]);
  expect(ink()).toEqual([true, true]);

  expect(element.undo()).toBe(true);
  await settle();
  expect(ids()).toEqual([1]);
  expect(ink()).toEqual([true, false]);

  expect(element.undo()).toBe(true);
  await settle();
  expect(ids()).toEqual([]);
  expect(ink()).toEqual([false, false]);
  expect(element.undo()).toBe(false);
  expect(probe(element).outlines).toBe(2);
});

test("a stroke under way stays through clear() and lands on the sheet when it ends", async () => {
  const { element, canvas, view } = await sheet(400);
  level(canvas, view(), 300, 100, 300);
  const pen = { pointerId: 5, pointerType: "pen", isPrimary: true, bubbles: true };
  const event = (type: string, x: number, init: PointerEventInit) =>
    new PointerEvent(type, { ...pen, ...at(canvas, view(), x, 600), ...init });
  canvas.dispatchEvent(event("pointerdown", 100, { button: 0, buttons: 1, pressure: 0.5 }));
  expect(element.clear()).toBe(true);
  canvas.dispatchEvent(event("pointermove", 300, { button: -1, buttons: 1, pressure: 0.5 }));
  canvas.dispatchEvent(event("pointerup", 300, { button: 0, buttons: 0, pressure: 0 }));
  await settle();
  expect(probe(element).strokes.map((stroke) => stroke.id)).toEqual([2]);
  expect(inkAt(canvas, view(), 200, 300)).toBe(0);
  expect(inkAt(canvas, view(), 200, 600)).toBeGreaterThan(0);
});

test("a stroke under way stays through undo() and lands after the strokes left", async () => {
  const { element, canvas, view } = await sheet(400);
  level(canvas, view(), 300, 100, 300);
  level(canvas, view(), 450, 100, 300);
  const pen = { pointerId: 6, pointerType: "pen", isPrimary: true, bubbles: true };
  const event = (type: string, x: number, init: PointerEventInit) =>
    new PointerEvent(type, { ...pen, ...at(canvas, view(), x, 600), ...init });
  canvas.dispatchEvent(event("pointerdown", 100, { button: 0, buttons: 1, pressure: 0.5 }));
  expect(element.undo()).toBe(true);
  canvas.dispatchEvent(event("pointermove", 300, { button: -1, buttons: 1, pressure: 0.5 }));
  canvas.dispatchEvent(event("pointerup", 300, { button: 0, buttons: 0, pressure: 0 }));
  await settle();
  expect(probe(element).strokes.map((stroke) => stroke.id)).toEqual([1, 3]);
  expect(inkAt(canvas, view(), 200, 300)).toBeGreaterThan(0);
  expect(inkAt(canvas, view(), 200, 450)).toBe(0);
  expect(inkAt(canvas, view(), 200, 600)).toBeGreaterThan(0);
});

// A consumer stops the writing with a style of its own, as the board would while it checks
// (R20): pointer-events inherits into the shadow tree, and a real pointer then hits nothing of it.
test("pointer-events: none on the element lets no real pointer write, and one historychange comes for each stroke", async () => {
  const { element, canvas, view } = await sheet(400);
  let heard = 0;
  element.addEventListener("historychange", () => heard++);
  const drag = async () => {
    const pressed = { force: 0.5 };
    await input("mousePressed", at(canvas, view(), 100, 100), pressed);
    await input("mouseMoved", at(canvas, view(), 300, 100), pressed);
    await input("mouseReleased", at(canvas, view(), 300, 100), { force: 0 });
    await settle();
  };

  element.style.pointerEvents = "none";
  await drag();
  expect(probe(element).strokes).toEqual([]);
  expect(heard).toBe(0);

  element.style.pointerEvents = "";
  await drag();
  expect(probe(element).strokes).toHaveLength(1);
  // The pointer's capture goes after its pointerup, and that ends no second stroke.
  expect(heard).toBe(1);
});

test("a stroke under way when pointer-events: none comes goes on to its end: the canvas holds its pointer", async () => {
  const { element, canvas, view } = await sheet(400);
  let heard = 0;
  element.addEventListener("historychange", () => heard++);
  const pressed = { force: 0.5 };
  await input("mousePressed", at(canvas, view(), 100, 100), pressed);
  await input("mouseMoved", at(canvas, view(), 200, 100), pressed);
  element.style.pointerEvents = "none";
  await input("mouseMoved", at(canvas, view(), 300, 100), pressed);
  await input("mouseReleased", at(canvas, view(), 300, 100), { force: 0 });
  await settle();
  const [stroke, ...more] = probe(element).strokes;
  expect(more).toEqual([]);
  expect(stroke?.points.at(-1)?.x).toBeCloseTo(300, 0);
  expect(heard).toBe(1);
});

test("the work for checking outlines no stroke: its crop is a raster of its own (R25)", async () => {
  const { element, canvas, view } = await sheet(400);
  level(canvas, view(), 100, 100, 300);
  await settle();
  expect(probe(element).outlines).toBe(1);
  expect(await element.exportWork()).not.toBeNull();
  expect(probe(element).outlines).toBe(1);
});

// The eraser (R22): a press takes off the sheet, whole, every stroke its way comes near — with the
// primary button when the tool is the eraser, and with a pen's eraser whatever the tool.

/**
 * A press of the eraser made by a script, at points of the sheet: a mouse's primary button, or a
 * pen's eraser — button 5, held by the bit 32 of `buttons`.
 */
function eraserHand(
  canvas: HTMLCanvasElement,
  view: () => View,
  by: "primary" | "pen eraser" = "primary",
  pointerId = 9,
) {
  const pen = by === "pen eraser";
  const pointer = { pointerId, pointerType: pen ? "pen" : "mouse", isPrimary: true, bubbles: true };
  const button = pen ? 5 : 0;
  const buttons = pen ? 32 : 1;
  const send = (type: string, x: number, y: number, init: PointerEventInit) =>
    canvas.dispatchEvent(
      new PointerEvent(type, { ...pointer, ...at(canvas, view(), x, y), ...init }),
    );
  return {
    down: (x: number, y: number) => send("pointerdown", x, y, { button, buttons, pressure: 0.5 }),
    move: (x: number, y: number) =>
      send("pointermove", x, y, { button: -1, buttons, pressure: 0.5 }),
    up: (x: number, y: number) => send("pointerup", x, y, { button, buttons: 0, pressure: 0 }),
    cancel: (x: number, y: number) => send("pointercancel", x, y, { button: 0, buttons: 0 }),
  };
}

/** The IDs of the strokes the work for checking is made of, ascending: those on the sheet. */
async function sent(element: NovatrailCanvas): Promise<number[]> {
  const work = await element.exportWork();
  const groups = work !== null && "png" in work ? work.submission.groups : [];
  return groups.flatMap(({ ids }) => ids).sort((a, b) => a - b);
}

const idsOn = (element: HTMLElement) => probe(element).strokes.map((stroke) => stroke.id);

test("the eraser takes strokes off whole along a press, out of sight at once and off the sheet when it lifts, and undo() brings them back", async () => {
  const { element, canvas, view } = await sheet(400);
  for (const y of [300, 600, 900]) level(canvas, view(), y, 100, 300);
  await settle();
  const outlined = probe(element).outlines;
  let heard = 0;
  element.addEventListener("historychange", () => heard++);
  // Whether there is ink in the middle of each stroke.
  const ink = () => [300, 600, 900].map((y) => inkAt(canvas, view(), 200, y) > 0);

  element.tool = "eraser";
  const hand = eraserHand(canvas, view);
  // Down across the first two strokes, from above the first to below the second.
  hand.down(200, 250);
  hand.move(200, 650);
  await settle();
  expect(probe(element).pending).toEqual([1, 2]);
  expect(ink()).toEqual([false, false, true]);
  // Off the sheet only when the eraser lifts: the work and the work for checking have them still.
  expect(idsOn(element)).toEqual([1, 2, 3]);
  expect(await sent(element)).toEqual([1, 2, 3]);
  expect(heard).toBe(0);

  hand.up(200, 650);
  await settle();
  expect(idsOn(element)).toEqual([3]);
  expect(heard).toBe(1);
  expect(element.history.at(-1)).toMatchObject({ kind: "erase", ids: [1, 2] });
  expect(ink()).toEqual([false, false, true]);
  expect(await sent(element)).toEqual([3]);

  expect(element.undo()).toBe(true);
  await settle();
  expect(idsOn(element)).toEqual([1, 2, 3]);
  expect(ink()).toEqual([true, true, true]);
  expect(heard).toBe(2);
  expect(element.history.at(-1)).toMatchObject({ kind: "undo", restored: [1, 2] });
  // The strokes come back by the paths they were given once.
  expect(probe(element).outlines).toBe(outlined);
});

test("a press of the eraser that the device cancels erases nothing, and the ink comes back", async () => {
  const { element, canvas, view } = await sheet(400);
  level(canvas, view(), 300, 100, 300);
  await settle();
  let heard = 0;
  element.addEventListener("historychange", () => heard++);
  element.tool = "eraser";
  const hand = eraserHand(canvas, view);
  hand.down(200, 250);
  hand.move(200, 350);
  await settle();
  expect(inkAt(canvas, view(), 200, 300)).toBe(0);
  hand.cancel(200, 350);
  await settle();
  expect(probe(element).pending).toEqual([]);
  expect(inkAt(canvas, view(), 200, 300)).toBeGreaterThan(0);
  expect(idsOn(element)).toEqual([1]);
  expect(heard).toBe(0);
});

test("a pen's eraser erases whatever the tool, and its barrel button neither erases nor writes", async () => {
  const { element, canvas, view } = await sheet(400);
  level(canvas, view(), 300, 100, 300);
  expect(element.tool).toBe("pen");
  const pen = { pointerId: 10, pointerType: "pen", isPrimary: true, bubbles: true };
  const send = (type: string, y: number, init: PointerEventInit) =>
    canvas.dispatchEvent(
      new PointerEvent(type, { ...pen, ...at(canvas, view(), 200, y), ...init }),
    );
  send("pointerdown", 250, { button: 2, buttons: 2, pressure: 0.5 });
  send("pointermove", 350, { button: -1, buttons: 2, pressure: 0.5 });
  send("pointerup", 350, { button: 2, buttons: 0, pressure: 0 });
  expect(idsOn(element)).toEqual([1]);

  const eraser = eraserHand(canvas, view, "pen eraser");
  eraser.down(200, 250);
  eraser.move(200, 350);
  eraser.up(200, 350);
  expect(idsOn(element)).toEqual([]);
  expect(element.history.at(-1)).toMatchObject({ kind: "erase", ids: [1] });
});

test("one pointer at a time writes or erases, and a press goes on as it began when the tool changes", async () => {
  const { element, canvas, view } = await sheet(400);
  level(canvas, view(), 300, 100, 300);
  // A stroke under way: a pen's eraser that comes down meanwhile erases nothing.
  const pen = { pointerId: 11, pointerType: "pen", isPrimary: true, bubbles: true };
  const send = (type: string, x: number, init: PointerEventInit) =>
    canvas.dispatchEvent(
      new PointerEvent(type, { ...pen, ...at(canvas, view(), x, 600), ...init }),
    );
  send("pointerdown", 100, { button: 0, buttons: 1, pressure: 0.5 });
  const eraser = eraserHand(canvas, view, "pen eraser", 12);
  eraser.down(200, 250);
  eraser.move(200, 350);
  eraser.up(200, 350);
  send("pointermove", 300, { button: -1, buttons: 1, pressure: 0.5 });
  send("pointerup", 300, { button: 0, buttons: 0, pressure: 0 });
  expect(idsOn(element)).toEqual([1, 2]);

  // An erasing under way: a mouse that writes meanwhile writes nothing, and the tool switched to
  // the pen leaves the press erasing.
  element.tool = "eraser";
  const hand = eraserHand(canvas, view);
  hand.down(200, 250);
  level(canvas, view(), 1200, 100, 300);
  element.tool = "pen";
  hand.move(200, 650);
  hand.up(200, 650);
  expect(idsOn(element)).toEqual([]);
  expect(element.history.map((event) => event.kind)).toEqual(["write", "write", "erase"]);
});

test("a real mouse erases with the tool, and pointer-events: none on the element lets it erase nothing", async () => {
  const { element, canvas, view } = await sheet(400);
  level(canvas, view(), 300, 100, 300);
  element.tool = "eraser";
  const drag = async () => {
    const pressed = { force: 0.5 };
    await input("mousePressed", at(canvas, view(), 200, 250), pressed);
    await input("mouseMoved", at(canvas, view(), 200, 350), pressed);
    await input("mouseReleased", at(canvas, view(), 200, 350), { force: 0 });
  };
  element.style.pointerEvents = "none";
  await drag();
  expect(idsOn(element)).toEqual([1]);
  element.style.pointerEvents = "";
  await drag();
  expect(idsOn(element)).toEqual([]);
});

test("the tool is the pen until it is switched, is the pen or the eraser alone, and one given before the element is upgraded goes through its accessor", () => {
  const element = document.createElement("novatrail-canvas");
  expect(element.tool).toBe("pen");
  element.tool = "eraser";
  expect(element.tool).toBe("eraser");
  expect(() => {
    element.tool = "brush" as Tool;
  }).toThrow(TypeError);
  expect(element.tool).toBe("eraser");

  // An element of an inert template is not upgraded until it comes into the page.
  const template = document.createElement("template");
  template.innerHTML = "<novatrail-canvas></novatrail-canvas>";
  const early = template.content.firstElementChild;
  if (!(early instanceof HTMLElement)) throw new Error("the template has no element");
  expect(early).not.toBeInstanceOf(NovatrailCanvas);
  Reflect.set(early, "tool", "eraser");
  document.body.append(early);
  made.push(early);
  expect(early).toBeInstanceOf(NovatrailCanvas);
  expect(Object.hasOwn(early, "tool")).toBe(false);
  expect(early instanceof NovatrailCanvas && early.tool).toBe("eraser");
});

test("a tool the element does not take, given before it is upgraded, leaves it the pen with a warning rather than fail its upgrade", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const template = document.createElement("template");
    template.innerHTML = "<novatrail-canvas></novatrail-canvas>";
    const early = template.content.firstElementChild;
    if (!(early instanceof HTMLElement)) throw new Error("the template has no element");
    Reflect.set(early, "tool", "brush");
    document.body.append(early);
    made.push(early);
    expect(early).toBeInstanceOf(NovatrailCanvas);
    expect(early.shadowRoot).not.toBeNull();
    expect(early instanceof NovatrailCanvas && early.tool).toBe("pen");
    expect(warn).toHaveBeenCalledOnce();
  } finally {
    warn.mockRestore();
  }
});

test("the eraser takes nothing beyond the part of the sheet on the screen, where a captured pointer goes on", async () => {
  const { element, canvas, view } = await sheet(400, 200);
  // One stroke in sight, at 300, and one below the part on the screen, at 1000: the container, 140
  // CSS pixels tall under the row of buttons, shows the sheet down to 350 at k 0.4.
  const row = element.shadowRoot?.querySelector(".tools")?.getBoundingClientRect().height ?? 0;
  element.style.height = `${row + 140}px`;
  await settle();
  level(canvas, view(), 300, 100, 300);
  level(canvas, view(), 1000, 100, 300);
  element.tool = "eraser";
  const hand = eraserHand(canvas, view);
  hand.down(200, 250);
  hand.move(200, 350);
  // Below the canvas, 300 CSS pixels: 1100 on the sheet, past the stroke at 1000.
  const below = canvas.getBoundingClientRect().bottom + 300;
  const pointer = { pointerId: 9, pointerType: "mouse", isPrimary: true, bubbles: true };
  const out = { ...pointer, clientX: at(canvas, view(), 200, 0).clientX, clientY: below };
  canvas.dispatchEvent(new PointerEvent("pointermove", { ...out, button: -1, buttons: 1 }));
  canvas.dispatchEvent(new PointerEvent("pointerup", { ...out, button: 0, buttons: 0 }));
  expect(idsOn(element)).toEqual([2]);
});
