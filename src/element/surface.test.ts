import { afterEach, expect, test } from "vitest";
import { cellsOf } from "../core/boxes.js";
import type { HistoryEvent } from "../core/history.js";
import type { InkPoint, Stroke } from "../core/ink.js";
import { pageOf } from "../core/page.js";
import { shortLines } from "../core/pages.fixture.js";
import { SHEET } from "../core/sheet.js";
import { workbookTask, workedExample } from "../core/tasks.fixture.js";
import type { NovatrailCanvas } from "./index.js";
import { placed, settle } from "./pointer.fixture.js";
import { probe } from "./probe.js";

// The picture of the work (R83): the PNG of the strokes the surface shows, with no condition — a
// sheet's, or a workbook's whole page with its draft — before the work is sent and after, and the
// same drawing as the surface's own canvas.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

/** The PNG file's first eight bytes (PNG Third Edition, 5.2). */
const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

/** A stroke of a pen along these points, each [x, y, pressure], a millisecond apart from `t`. */
function pen(id: number, t: number, ...points: (readonly [number, number, number])[]): Stroke {
  const ink: InkPoint[] = points.map(([x, y, p], k) => ({ x, y, t: t + k, p }));
  return { id, kind: "pen", points: ink };
}

/** The history that writes these strokes, one after another. */
function written(strokes: readonly Stroke[]): HistoryEvent[] {
  return strokes.map((stroke) => ({
    kind: "write",
    t: stroke.points[stroke.points.length - 1]?.t ?? 0,
    stroke,
  }));
}

/** A level line at `y` from `from` to `to`, a point every 2 units, its pressure rising along it. */
function line(id: number, y: number, from: number, to: number): Stroke {
  const n = Math.floor((to - from) / 2);
  const points = Array.from({ length: n + 1 }, (_, k) => [from + 2 * k, y, k / n] as const);
  return pen(id, 1000 * id, ...points);
}

/** The picture's bytes, and its pixels decoded by the browser, grey as its red. */
async function pictureOf(element: NovatrailCanvas) {
  const blob = await element.exportPicture();
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const bitmap = await createImageBitmap(blob);
  const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext("2d");
  if (context === null) throw new Error("no context to read the picture with");
  context.drawImage(bitmap, 0, 0);
  const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height);
  const view = new DataView(bytes.buffer);
  return {
    type: blob.type,
    bytes,
    // The header's width and height, after the signature and the chunk's length and name.
    header: [view.getUint32(16), view.getUint32(20), bytes[24], bytes[25]],
    size: [bitmap.width, bitmap.height],
    /** The grey of a pixel, by its sheet unit. */
    gray: (x: number, y: number) => data[4 * (y * bitmap.width + x)] ?? -1,
    /** How many pixels are not white. */
    inked: () => data.filter((value, at) => at % 4 === 0 && value < 255).length,
  };
}

/** Whether a picture is a PNG of the whole surface: grey, eight bits, 1000 × 1400. */
function whole(picture: Awaited<ReturnType<typeof pictureOf>>): boolean {
  return (
    picture.type === "image/png" &&
    SIGNATURE.every((byte, k) => picture.bytes[k] === byte) &&
    [...picture.header].join() === `${SHEET.width},${SHEET.height},8,0` &&
    picture.size.join() === `${SHEET.width},${SHEET.height}`
  );
}

test("a sheet's picture is a PNG of the whole sheet, white with no strokes, and the strokes it shows before the work is sent and after, the same bytes", async () => {
  const { element } = await placed(made, 400);
  const empty = await pictureOf(element);
  expect(whole(empty)).toBe(true);
  expect(empty.inked()).toBe(0);
  // No condition: a sheet with no work for checking still has its picture.
  expect(await element.exportWork()).toBeNull();
  element.history = written([line(1, 100, 100, 300), line(2, 1300, 600, 900)]);
  const before = await pictureOf(element);
  expect(whole(before)).toBe(true);
  expect(before.gray(200, 100)).toBeLessThan(64);
  expect(before.gray(800, 1300)).toBeLessThan(64);
  expect(before.gray(500, 700)).toBe(255);
  expect(await element.exportWork()).not.toBeNull();
  const after = await pictureOf(element);
  expect(after.bytes).toEqual(before.bytes);
  // An undone stroke is gone from the surface, and from its picture.
  element.undo();
  const undone = await pictureOf(element);
  expect(undone.gray(800, 1300)).toBe(255);
  expect(undone.gray(200, 100)).toBeLessThan(64);
});

test("a workbook's picture is its whole page in one picture, its draft too, whether a box is filled or not", async () => {
  const items = shortLines(4);
  const { element } = await placed(made, 400, undefined, { task: workbookTask(items) });
  const [first] = cellsOf(pageOf(items));
  if (first === undefined) throw new Error("the page has no box");
  const { left, top, width, height } = first.box;
  const draft = line(1, 1300, 100, 400);
  element.history = written([draft]);
  // Draft alone: nothing to check, and yet the picture shows it.
  expect(await element.exportWork()).toBeNull();
  const drafted = await pictureOf(element);
  expect(whole(drafted)).toBe(true);
  expect(drafted.gray(250, 1300)).toBeLessThan(64);
  const middle = top + height / 2;
  const inBox = pen(2, 3000, [left + 20, middle, 0.5], [left + width - 20, middle, 0.5]);
  element.history = written([draft, inBox]);
  const work = await element.exportWork();
  expect(work !== null && "cells" in work ? work.cells.length : 0).toBe(1);
  const sent = await pictureOf(element);
  expect(sent.gray(Math.round(left + width / 2), Math.round(middle))).toBeLessThan(64);
  expect(sent.gray(250, 1300)).toBeLessThan(64);
});

test("a worked example's picture is a white sheet: the learner writes nothing on it", async () => {
  const { element } = await placed(made, 400);
  element.workedExample = workedExample();
  const picture = await pictureOf(element);
  expect(whole(picture)).toBe(true);
  expect(picture.inked()).toBe(0);
});

test("the picture is the drawing the surface's own canvas shows: a pen's widths as its pressure gives them, every inked pixel of one inked in the other", async () => {
  const { element, canvas } = await placed(made, 500);
  const strokes = [
    line(1, 80, 60, 440),
    pen(2, 5000, [100, 200, 0.1], [180, 300, 0.9], [260, 200, 0.3], [340, 320, 1]),
    pen(3, 6000, [420, 260, 0.5]),
  ];
  element.history = written(strokes);
  await settle();
  const picture = await pictureOf(element);
  const { view } = probe(element);
  const context = canvas.getContext("2d");
  if (view === undefined || context === null) throw new Error("the element is not laid out");
  const scale = canvas.width / SHEET.width;
  const screen = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const alpha = (x: number, y: number) =>
    screen[
      4 * (Math.floor((y - view.vy) * scale) * canvas.width + Math.floor((x - view.vx) * scale)) + 3
    ] ?? 0;
  let misses = 0;
  let dark = 0;
  for (let y = 40; y < 360; y++) {
    for (let x = 40; x < 480; x++) {
      const gray = picture.gray(x, y);
      // Ink of the picture lies on ink of the screen.
      if (gray < 64) {
        dark++;
        if (alpha(x, y) === 0) misses++;
      }
      // And the screen's full ink lies on the picture's ink, within its pixel.
      if (alpha(x, y) > 224 && picture.gray(x, y) === 255) {
        const near = [-1, 0, 1].some((dy) =>
          [-1, 0, 1].some((dx) => picture.gray(x + dx, y + dy) < 255),
        );
        if (!near) misses++;
      }
    }
  }
  expect(dark).toBeGreaterThan(1000);
  expect(misses).toBe(0);
  // The pen's line is wider where it pressed harder: a light end, a hard end.
  const across = (x: number) =>
    Array.from({ length: 12 }, (_, k) => picture.gray(x, 74 + k)).filter((gray) => gray < 128)
      .length;
  expect(across(430)).toBeGreaterThan(across(70));
});
