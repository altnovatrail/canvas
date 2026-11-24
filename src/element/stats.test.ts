import { afterEach, expect, test } from "vitest";
import type { View } from "../core/screen.js";
import type { NovatrailCanvas } from "./index.js";
import { at, level, settle } from "./pointer.fixture.js";
import { probe } from "./probe.js";

// What the drawing holds and costs, `paintStats`, and the flash of what a frame paints,
// `paintFlash`: app's debug view of the device's load.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

async function sheet(width: number, height: number) {
  const element = document.createElement("novatrail-canvas") as NovatrailCanvas;
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  document.body.append(element);
  made.push(element);
  await settle();
  const canvas = element.shadowRoot?.querySelector("canvas");
  const viewport = element.shadowRoot?.querySelector(".viewport");
  if (!canvas || !viewport) throw new Error("the element has no canvas in a viewport");
  const view = (): View => {
    const shown = probe(element).view;
    if (shown === undefined) throw new Error("the element is not laid out");
    return shown;
  };
  return { element, canvas, viewport, view };
}

/** A touch pressed on the sheet at (x, y) and moved to `to` across, not lifted. */
function under(canvas: HTMLCanvasElement, view: () => View, y: number, x: number, to: number) {
  const pointer = { pointerId: 7, pointerType: "touch", isPrimary: true, bubbles: true };
  const send = (type: string, across: number, buttons: number) =>
    canvas.dispatchEvent(
      new PointerEvent(type, { ...pointer, ...at(canvas, view(), across, y), button: 0, buttons }),
    );
  send("pointerdown", x, 1);
  send("pointermove", to, 1);
  return { lift: () => send("pointerup", to, 0) };
}

test("paintStats counts the strokes and their points, and each reading is new and frozen", async () => {
  const { element, canvas, view } = await sheet(400, 300);
  expect(element.paintStats.strokes).toBe(0);
  level(canvas, view(), 100, 100, 600);
  level(canvas, view(), 200, 100, 600);
  await settle();
  const stats = element.paintStats;
  const strokes = probe(element).strokes;
  expect(stats.strokes).toBe(2);
  expect(stats.points).toBe(strokes.reduce((n, stroke) => n + stroke.points.length, 0));
  expect(stats.fills).toBe(probe(element).fills);
  expect(Object.isFrozen(stats)).toBe(true);
  expect(Object.isFrozen(stats.paintMs)).toBe(true);
  expect(Object.isFrozen(stats.buffers)).toBe(true);
  expect(element.paintStats).not.toBe(stats);
  expect(stats.buffers[0]).toEqual({ width: canvas.width, height: canvas.height });
  expect(stats.paintMs).toHaveLength(Math.min(stats.frames, 120));
  for (const ms of stats.paintMs) expect(ms).toBeGreaterThanOrEqual(0);
});

test("a stroke under way paints its rectangle alone, with its buffer beside the canvas, and a scroll paints all in sight", async () => {
  const { element, canvas, viewport, view } = await sheet(400, 300);
  level(canvas, view(), 100, 100, 900);
  await settle();
  const before = element.paintStats;

  const stroke = under(canvas, view, 250, 100, 300);
  await settle();
  const writing = element.paintStats;
  expect(writing.frames).toBeGreaterThan(before.frames);
  expect(writing.fullRepaints).toBe(before.fullRepaints);
  expect(writing.last?.fills).toBe(1);
  expect(writing.last?.area).toBeGreaterThan(0);
  expect(writing.last?.area).toBeLessThan(0.5);
  expect(writing.last?.ms).toBeGreaterThanOrEqual(0);
  // The buffer of the finished ink under the stroke is the canvas's size.
  expect(writing.buffers).toEqual([
    { width: canvas.width, height: canvas.height },
    { width: canvas.width, height: canvas.height },
  ]);
  stroke.lift();
  await settle();

  viewport.scrollTop = 40;
  await settle();
  const scrolled = element.paintStats;
  expect(scrolled.fullRepaints).toBeGreaterThan(writing.fullRepaints);
  expect(scrolled.last?.area).toBe(1);
});

test("paintStats keeps the times of the last 120 frames", async () => {
  const { element, canvas, viewport, view } = await sheet(300, 200);
  level(canvas, view(), 100, 100, 900);
  await settle();
  for (let n = 0; n < 150; n++) {
    viewport.scrollTop = n % 2 === 0 ? 30 : 0;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
  await settle();
  const stats = element.paintStats;
  expect(stats.frames).toBeGreaterThan(120);
  expect(stats.paintMs).toHaveLength(120);
});

test("paintFlash lays a canvas over the ink that takes no pointer and shows what a frame painted, and neither the ink nor the picture holds it", async () => {
  const { element, canvas, view } = await sheet(400, 300);
  expect(element.paintFlash).toBe(false);
  expect(element.shadowRoot?.querySelector("canvas.flash")).toBeNull();
  // @ts-expect-error The flash is on or off, nothing else.
  expect(() => (element.paintFlash = "on")).toThrow(TypeError);

  element.paintFlash = true;
  expect(element.paintFlash).toBe(true);
  const flash = element.shadowRoot?.querySelector<HTMLCanvasElement>("canvas.flash");
  if (!flash) throw new Error("no flash");
  // The ink's canvas comes first, and takes the pointer through the flash.
  expect(element.shadowRoot?.querySelector("canvas")).toBe(canvas);
  expect(getComputedStyle(flash).pointerEvents).toBe("none");

  level(canvas, view(), 100, 100, 600);
  const stroke = under(canvas, view, 200, 100, 500);
  await settle();
  expect(flash.width).toBe(canvas.width);
  const red = flash.getContext("2d")?.getImageData(0, 0, flash.width, flash.height).data ?? [];
  expect(red.some((value, i) => i % 4 === 3 && value > 0)).toBe(true);
  stroke.lift();
  await settle();

  // The ink holds no red of the flash: its pixels are the theme's grey ink alone. Two elements'
  // canvases are not compared pixel for pixel: a clip's antialiased edge differs by the frames a
  // stroke happened to be painted in.
  const ink = canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height).data ?? [];
  let inked = 0;
  for (let i = 0; i < ink.length; i += 4) {
    if ((ink[i + 3] ?? 0) === 0) continue;
    inked++;
    expect(Math.abs((ink[i] ?? 0) - (ink[i + 1] ?? 0))).toBeLessThan(8);
  }
  expect(inked).toBeGreaterThan(0);
  const bytes = async () =>
    Array.from(new Uint8Array(await (await element.exportPicture()).arrayBuffer()));
  const shown = await bytes();

  // It fades: a moment after the last frame painted, nothing is left on it.
  await new Promise((resolve) => setTimeout(resolve, 400));
  await settle();
  const left = flash.getContext("2d")?.getImageData(0, 0, flash.width, flash.height).data ?? [];
  expect(left.some((value, i) => i % 4 === 3 && value > 0)).toBe(false);

  element.paintFlash = false;
  expect(element.paintFlash).toBe(false);
  expect(element.shadowRoot?.querySelector("canvas.flash")).toBeNull();
  // The picture of the work is the same with the flash and without it.
  expect(await bytes()).toEqual(shown);
});
