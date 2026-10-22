import { afterEach, expect, test } from "vitest";
import { cdp } from "vitest/browser";
import { toScreen, type View } from "../core/screen.js";
import { SHEET } from "../core/sheet.js";
import "./index.js";
import { probe } from "./probe.js";

// The sheet's input in Chromium (R18): events that a script makes, with their coalesced points,
// and real input through the DevTools protocol — a mouse, and a pen with its pressure.

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

/** The client point over a point of the sheet. */
function at(canvas: HTMLCanvasElement, view: View, x: number, y: number) {
  const rect = canvas.getBoundingClientRect();
  const onScreen = toScreen(view, x, y);
  return { clientX: rect.left + onScreen.x, clientY: rect.top + onScreen.y };
}

/** The alpha of the canvas's device pixel over a point of the sheet: 0 where there is no ink. */
function inkAt(canvas: HTMLCanvasElement, view: View, x: number, y: number): number {
  const scale = canvas.width / SHEET.width;
  const pixel = canvas
    .getContext("2d")
    ?.getImageData(Math.floor(x * scale), Math.floor((y - view.vy) * scale), 1, 1);
  return pixel?.data[3] ?? 0;
}

/** A level stroke at `y`, from `from` to `to`, made by a script: a mouse's, pointerId 1. */
function level(canvas: HTMLCanvasElement, view: View, y: number, from: number, to: number) {
  const mouse = { pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true };
  const event = (type: string, x: number, init: PointerEventInit) =>
    new PointerEvent(type, { ...mouse, ...at(canvas, view, x, y), ...init });
  canvas.dispatchEvent(event("pointerdown", from, { button: 0, buttons: 1, pressure: 0.5 }));
  canvas.dispatchEvent(event("pointermove", to, { button: -1, buttons: 1, pressure: 0.5 }));
  canvas.dispatchEvent(event("pointerup", to, { button: 0, buttons: 0, pressure: 0 }));
}

/**
 * Real input, through the DevTools protocol: the point of the page over a client point of this
 * test's frame, which the runner may have moved and scaled.
 */
async function input(
  type: "mousePressed" | "mouseMoved" | "mouseReleased",
  client: { clientX: number; clientY: number },
  extra: { pointerType?: "mouse" | "pen"; force?: number } = {},
): Promise<void> {
  const frameElement = window.frameElement;
  let x = client.clientX;
  let y = client.clientY;
  if (frameElement !== null && "offsetWidth" in frameElement) {
    const host = frameElement as HTMLElement;
    const rect = host.getBoundingClientRect();
    const scale = rect.width / host.offsetWidth;
    x = rect.left + (host.clientLeft + x) * scale;
    y = rect.top + (host.clientTop + y) * scale;
  }
  await cdp().send("Input.dispatchMouseEvent", {
    type,
    x,
    y,
    button: "left",
    buttons: type === "mouseReleased" ? 0 : 1,
    clickCount: 1,
    ...extra,
  });
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
  expect(canvas.getBoundingClientRect().height).toBeCloseTo(200, 6);
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
