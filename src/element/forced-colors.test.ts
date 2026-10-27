import { afterEach, expect, test } from "vitest";
import { CROP } from "../core/crop.js";
import { toScreen, type View } from "../core/screen.js";
import { SHEET } from "../core/sheet.js";
import { workForCheck } from "../core/submission.js";
import "./index.js";
import { probe } from "./probe.js";

// The sheet with forced colours, in a browser context that is in the mode from the start (R23):
// the system's colours stand in for the consumer's theme on the screen, the tutor's frames too, and
// the crop for checking is as it always is. vitest.config.ts runs this file alone, in a project of
// its own.

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

test("with forced colours the sheet takes the system's colours, whatever the consumer's theme, and the crop for checking keeps its own", async () => {
  expect(matchMedia("(forced-colors: active)").matches).toBe(true);
  // The mode forces colours, not the media query alone: a page's own colour gives way.
  expect(system("rgb(255, 0, 0)")).toBe(system("CanvasText"));
  const theme = document.createElement("div");
  theme.style.setProperty("--novatrail-canvas-ink", "rgb(0, 0, 255)");
  theme.style.setProperty("--novatrail-canvas-grid", "rgb(200, 0, 0)");
  theme.style.setProperty("--novatrail-canvas-mark", "rgb(0, 160, 0)");
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

  // A frame of the tutor's round the strokes: the system's highlight, not the theme's colour.
  const sent = await element.exportWork();
  if (sent === null) throw new Error("the sheet gave no work for checking");
  element.marks = {
    submission: sent.submission,
    marks: [{ kind: "frame", at: { group: "A" }, name: "This line" }],
  };
  await settle();
  const frame = root?.querySelector(".marks rect");
  if (!frame) throw new Error("no frame drawn");
  expect(getComputedStyle(frame).stroke).toBe(system("Highlight"));

  // The crop for checking is the sheet's own raster, whatever colours the system forces (R25).
  const work = await element.exportWork();
  const own = workForCheck(probe(element).strokes, CROP.digit);
  if (work === null || own === null) throw new Error("the sheet gave no work for checking");
  expect(new Uint8Array(await work.png.arrayBuffer())).toEqual(own.png);
});

test("with forced colours the row of buttons takes the system's colours of buttons: the tool in use the highlight's, an unavailable button the grey of disabled text", async () => {
  const theme = document.createElement("div");
  theme.style.setProperty("--novatrail-canvas-ink", "rgb(0, 0, 255)");
  theme.style.setProperty("--novatrail-canvas-paper", "rgb(255, 255, 200)");
  document.body.append(theme);
  made.push(theme);
  const element = document.createElement("novatrail-canvas");
  element.style.width = "400px";
  theme.append(element);
  await settle();
  const root = element.shadowRoot;
  const row = root?.querySelector(".tools");
  const [pen, eraser, undo, , up] = [...(root?.querySelectorAll(".tools button") ?? [])];
  if (!row || !pen || !eraser || !undo || !up) throw new Error("the element has no row of buttons");
  expect(getComputedStyle(row).backgroundColor).toBe(system("Canvas"));
  expect(getComputedStyle(eraser).backgroundColor).toBe(system("ButtonFace"));
  expect(getComputedStyle(eraser).color).toBe(system("ButtonText"));
  expect(getComputedStyle(eraser).borderTopColor).toBe(system("ButtonBorder"));
  // The pen is in use: not by its background alone, which the mode would take away.
  expect(pen.getAttribute("aria-checked")).toBe("true");
  expect(getComputedStyle(pen).backgroundColor).toBe(system("Highlight"));
  expect(getComputedStyle(pen).color).toBe(system("HighlightText"));
  // Nothing to undo yet, and nothing above to scroll back up to (R33).
  for (const unavailable of [undo, up]) {
    expect(unavailable.getAttribute("aria-disabled")).toBe("true");
    expect(getComputedStyle(unavailable).color).toBe(system("GrayText"));
    expect(getComputedStyle(unavailable).borderTopColor).toBe(system("GrayText"));
  }
});
