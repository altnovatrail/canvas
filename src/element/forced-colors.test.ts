import { afterEach, expect, test } from "vitest";
import { toScreen, type View } from "../core/screen.js";
import { SHEET } from "../core/sheet.js";
import "./index.js";
import { probe } from "./probe.js";

// The sheet with forced colours, in a browser context that is in the mode from the start (R23):
// the system's colours stand in for the consumer's theme on the screen, and the picture of the
// work is as it always is. vitest.config.ts runs this file alone, in a project of its own.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
async function settle(): Promise<void> {
  await frame();
  await frame();
}

/** The colour a system colour keyword computes to here, read off an element of the page. */
function system(keyword: string): string {
  const swatch = document.createElement("div");
  swatch.style.color = keyword;
  document.body.append(swatch);
  const colour = getComputedStyle(swatch).color;
  swatch.remove();
  return colour;
}

/** "rgb(r, g, b)" as its three numbers. */
function channels(colour: string): number[] {
  return (colour.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);
}

test("with forced colours the sheet takes the system's colours, whatever the consumer's theme, and the picture of the work keeps its own", async () => {
  expect(matchMedia("(forced-colors: active)").matches).toBe(true);
  // The mode forces colours, not the media query alone: a page's own colour gives way.
  expect(system("rgb(255, 0, 0)")).toBe(system("CanvasText"));
  const theme = document.createElement("div");
  theme.style.setProperty("--novatrail-canvas-ink", "rgb(0, 0, 255)");
  theme.style.setProperty("--novatrail-canvas-grid", "rgb(200, 0, 0)");
  document.body.append(theme);
  made.push(theme);
  const element = document.createElement("novatrail-canvas");
  element.style.width = "400px";
  theme.append(element);
  await settle();
  const root = element.shadowRoot;
  const canvas = root?.querySelector("canvas");
  const grid = root?.querySelector(".grid");
  const sheet = root?.querySelector(".sheet");
  if (!canvas || !grid || !sheet) throw new Error("the element has no stage");

  const text = system("CanvasText");
  expect(getComputedStyle(canvas).color).toBe(text);
  expect(getComputedStyle(grid).stroke).toBe(system("GrayText"));
  expect(getComputedStyle(sheet).outlineColor).toBe(text);

  // The ink, six strokes over one another so that the middle of the line is covered.
  const view = probe(element).view as View;
  const rect = canvas.getBoundingClientRect();
  const mouse = { pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true };
  for (let i = 0; i < 6; i++) {
    for (const [type, x, button, buttons] of [
      ["pointerdown", 100, 0, 1],
      ["pointermove", 300, -1, 1],
      ["pointerup", 300, 0, 0],
    ] as const) {
      const point = toScreen(view, x, 300);
      canvas.dispatchEvent(
        new PointerEvent(type, {
          ...mouse,
          clientX: rect.left + point.x,
          clientY: rect.top + point.y,
          button,
          buttons,
          pressure: buttons === 0 ? 0 : 0.5,
        }),
      );
    }
  }
  await settle();
  const scale = canvas.width / SHEET.width;
  const ink = canvas
    .getContext("2d")
    ?.getImageData(Math.floor(200 * scale), Math.floor(300 * scale), 1, 1);
  const drawn = [...(ink?.data ?? [])].slice(0, 3);
  for (const [i, channel] of channels(text).entries()) {
    expect(Math.abs((drawn[i] ?? Number.NaN) - channel)).toBeLessThanOrEqual(3);
  }

  const png = await element.exportPNG();
  if (png === null) throw new Error("the sheet gave no picture");
  const bitmap = await createImageBitmap(png);
  const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext("2d");
  context?.drawImage(bitmap, 0, 0);
  expect([...(context?.getImageData(200, 300, 1, 1).data ?? [])]).toEqual([17, 17, 17, 255]);
  expect([...(context?.getImageData(200, 600, 1, 1).data ?? [])]).toEqual([255, 255, 255, 255]);
});
