import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { CROP } from "../core/crop.js";
import { pageOf } from "../core/page.js";
import { SHORT } from "../core/pages.fixture.js";
import { toScreen, type View } from "../core/screen.js";
import { SHEET } from "../core/sheet.js";
import { workForCheck } from "../core/submission.js";
import { workbookTask, workedExample } from "../core/tasks.fixture.js";
import { axeOf, KINDS } from "./axe.fixture.js";
import "./index.js";
import {
  arrive,
  iconOf,
  QUARTERS,
  quarters,
  sameColours,
  sheetColours,
  sheetWork,
} from "./pointer.fixture.js";
import { probe } from "./probe.js";

// The sheet with forced colours, in a browser context that is in the mode from the start (R23):
// the system's colours stand in for the consumer's theme on the screen, the tutor's frames and a
// workbook's print too, and the crop for checking is as it always is; a picture keeps its own
// colours. vitest.config.ts runs this file alone, in a project of its own.

const made: HTMLElement[] = [];
// The decodes the element asks for, which arrive() and the kinds with pictures wait for.
beforeEach(() => {
  vi.spyOn(HTMLImageElement.prototype, "decode");
});
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
  vi.restoreAllMocks();
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
  const sent = await sheetWork(element);
  element.marks = {
    submission: sent.submission,
    marks: [{ kind: "frame", at: { group: "A" }, name: "This line" }],
  };
  await settle();
  const frame = root?.querySelector(".marks rect");
  if (!frame) throw new Error("no frame drawn");
  expect(getComputedStyle(frame).stroke).toBe(system("Highlight"));

  // The crop for checking is the sheet's own raster, whatever colours the system forces (R25).
  const work = await sheetWork(element);
  const own = workForCheck(probe(element).strokes, CROP.digit);
  if (own === null) throw new Error("the sheet gave no work for checking");
  expect(new Uint8Array(await work.png.arrayBuffer())).toEqual(own.png);
});

test("with forced colours the row of buttons takes the system's colours of buttons, its icons too: the tool in use the highlight's, an unavailable button the grey of disabled text", async () => {
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
  // A worked example's Next and Demo come first, hidden on a sheet (R42).
  const [, , pen, eraser, undo, , up] = [...(root?.querySelectorAll(".tools button") ?? [])];
  if (!row || !pen || !eraser || !undo || !up) throw new Error("the element has no row of buttons");
  expect(getComputedStyle(row).backgroundColor).toBe(system("Canvas"));
  expect(getComputedStyle(eraser).backgroundColor).toBe(system("ButtonFace"));
  expect(getComputedStyle(eraser).color).toBe(system("ButtonText"));
  expect(getComputedStyle(eraser).borderTopColor).toBe(system("ButtonBorder"));
  // The pen is in use: not by its background alone, which the mode would take away.
  expect(pen.getAttribute("aria-checked")).toBe("true");
  expect(getComputedStyle(pen).backgroundColor).toBe(system("Highlight"));
  expect(getComputedStyle(pen).color).toBe(system("HighlightText"));
  // An icon is the colour of its button's text, whatever the mode makes it (R46).
  expect(getComputedStyle(iconOf(eraser)).fill).toBe(system("ButtonText"));
  expect(getComputedStyle(iconOf(pen)).fill).toBe(system("HighlightText"));
  // Nothing to undo yet, and nothing above to scroll back up to (R33).
  for (const unavailable of [undo, up]) {
    expect(unavailable.getAttribute("aria-disabled")).toBe("true");
    expect(getComputedStyle(unavailable).color).toBe(system("GrayText"));
    expect(getComputedStyle(unavailable).borderTopColor).toBe(system("GrayText"));
    expect(getComputedStyle(iconOf(unavailable)).fill).toBe(system("GrayText"));
  }
});

test("with forced colours the ring of a button in focus is the system's highlight, on the tool in use and on an unavailable button alike (T92)", async () => {
  const element = document.createElement("novatrail-canvas");
  element.style.width = "400px";
  element.style.setProperty("--novatrail-canvas-ink", "rgb(0, 0, 255)");
  document.body.append(element);
  made.push(element);
  await settle();
  const root = element.shadowRoot;
  const [, , pen, , , , up] = [...(root?.querySelectorAll(".tools button") ?? [])];
  if (!pen || !up) throw new Error("the element has no row of buttons");
  await userEvent.tab();
  for (const focused of [pen, up]) {
    if (focused === up) await userEvent.keyboard("{End}{ArrowLeft}{ArrowLeft}{ArrowLeft}");
    expect(root?.activeElement).toBe(focused);
    expect(focused.matches(":focus-visible")).toBe(true);
    const style = getComputedStyle(focused);
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineWidth).toBe("2px");
    expect(style.outlineColor).toBe(system("Highlight"));
  }
});

test("with forced colours the ring of the sheet's container in focus is the system's highlight (T93)", async () => {
  const element = document.createElement("novatrail-canvas");
  element.style.width = "400px";
  element.style.height = "300px";
  element.style.setProperty("--novatrail-canvas-ink", "rgb(0, 0, 255)");
  document.body.append(element);
  made.push(element);
  await settle();
  const root = element.shadowRoot;
  const viewport = root?.querySelector(".viewport");
  const ring = root?.querySelector(".ring");
  if (!viewport || !ring) throw new Error("the element has no container and ring");
  await userEvent.tab();
  await userEvent.tab();
  expect(root?.activeElement).toBe(viewport);
  const style = getComputedStyle(ring);
  expect([style.display, style.outlineStyle, style.outlineWidth]).toEqual([
    "block",
    "solid",
    "2px",
  ]);
  expect(style.outlineColor).toBe(system("Highlight"));
});

test("with forced colours a workbook's text and the frames of its boxes are the system's text colour, whatever the consumer's ink, and a filled box's frame and a mark's on it the highlight", async () => {
  const theme = document.createElement("div");
  theme.style.setProperty("--novatrail-canvas-ink", "rgb(0, 0, 255)");
  document.body.append(theme);
  made.push(theme);
  const element = document.createElement("novatrail-canvas");
  element.style.width = "400px";
  element.task = workbookTask(SHORT);
  theme.append(element);
  await settle();
  const text = element.shadowRoot?.querySelector(".print text");
  const box = element.shadowRoot?.querySelector(".print rect");
  if (!text || !box) throw new Error("the workbook has no print");
  // Explicit: SVG keeps its parent's colour in the mode, and the theme's ink would stay (R36).
  expect(getComputedStyle(text).fill).toBe(system("CanvasText"));
  expect(getComputedStyle(box).stroke).toBe(system("CanvasText"));
  // A stroke across the first box fills it (R37).
  const first = pageOf(SHORT).items[0]?.boxes[0];
  if (first === undefined) throw new Error("the page has no box");
  const y = first.top + first.height / 2;
  element.history = [
    {
      kind: "write",
      t: 100,
      stroke: {
        id: 1,
        kind: "pen",
        points: [
          { x: first.left + 30, y, t: 0, p: 0.5 },
          { x: first.left + 70, y, t: 60, p: 0.5 },
        ],
      },
    },
  ];
  expect(box.classList.contains("filled")).toBe(true);
  expect(getComputedStyle(box).stroke).toBe(system("Highlight"));
  // The tutor's mark on that box, as on a sheet (R39).
  const work = await element.exportWork();
  if (work === null || !("cells" in work)) throw new Error("the workbook gave no work of boxes");
  element.marks = {
    submission: work.submission,
    marks: [{ kind: "frame", at: { cell: { item: 1, slot: 1 } }, name: "This box" }],
  };
  await settle();
  const mark = element.shadowRoot?.querySelector(".marks rect");
  if (!mark) throw new Error("no frame drawn");
  expect(getComputedStyle(mark).stroke).toBe(system("Highlight"));
});

test("with forced colours a worked example's Demo draws its icon in the colour of button text, Next unavailable is the grey of disabled text, and a picture's frame in the list of parts the system's text colour", async () => {
  const element = document.createElement("novatrail-canvas");
  element.style.width = "400px";
  element.style.setProperty("--novatrail-canvas-ink", "rgb(0, 0, 255)");
  element.workedExample = workedExample();
  document.body.append(element);
  made.push(element);
  await settle();
  const root = element.shadowRoot;
  const [next, demo] = [...(root?.querySelectorAll(".tools .demo button") ?? [])];
  if (!(next instanceof HTMLButtonElement) || !demo)
    throw new Error("the row has no Next and Demo");
  const icon = iconOf(demo);
  expect(getComputedStyle(icon).fill).toBe(system("ButtonText"));
  // The paragraph and the picture beside the sheet, which stands in its frame till its file comes.
  next.click();
  next.click();
  const frame = root?.querySelector(".parts .picture");
  if (!frame) throw new Error("the list has no picture");
  expect(getComputedStyle(frame).borderTopColor).toBe(system("CanvasText"));
  // A hidden demo has no part for Next to open.
  (demo as HTMLButtonElement).click();
  expect(next.getAttribute("aria-disabled")).toBe("true");
  expect(getComputedStyle(next).color).toBe(system("GrayText"));
  expect(getComputedStyle(icon).fill).toBe(system("ButtonText"));
});

test("with forced colours a picture on an area of the sheet keeps the colours of its file, as a picture does (T61)", async () => {
  const element = document.createElement("novatrail-canvas");
  element.style.width = "400px";
  element.workedExample = workedExample({
    demo: [
      {
        picture: "pictures/path.png",
        alt: "A path.",
        area: { left: 100, top: 100, width: 400, height: 300 },
      },
    ],
  });
  // The file made before it is asked for: arrive() waits only for the decodes of files that have
  // come, and a canvas may take longer than that to encode one.
  const file = await quarters();
  element.media = async () => file;
  document.body.append(element);
  made.push(element);
  await arrive();
  const next = element.shadowRoot?.querySelector<HTMLButtonElement>(".tools .demo button");
  if (!next) throw new Error("the row has no Next");
  next.click();
  // The middle of each quarter of the picture, on the sheet.
  const shown = await sheetColours(element, [
    [200, 175],
    [400, 175],
    [200, 325],
    [400, 325],
  ]);
  expect(sameColours(shown, QUARTERS)).toEqual([true, true, true, true]);
});

test.each(KINDS)(
  "$name has no violation that axe finds in forced colours either (T90)",
  async ({ put, incomplete }) => {
    await axeOf(await put(made), incomplete);
  },
);
