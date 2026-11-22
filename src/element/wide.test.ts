import { afterEach, expect, test } from "vitest";
import { server, userEvent } from "vitest/browser";
import { budget } from "../core/budget.fixture.js";
import { gridPath } from "../core/grid.js";
import { SLOP_PX } from "../core/hands.js";
import type { HistoryEvent } from "../core/history.js";
import { INK_REACH } from "../core/outline.js";
import type { View } from "../core/screen.js";
import { pictureOf, REACH, SHEET } from "../core/sheet.js";
import { sheetTask, workedExample } from "../core/tasks.fixture.js";
import { rulingsOf } from "../core/tracing.js";
import { axeOf } from "./axe.fixture.js";
import type { HistoryChange, ToolChange } from "./index.js";
import {
  at,
  devtools,
  input,
  level,
  paperCrop,
  placed,
  settle,
  spacer,
  touches,
  wheel,
} from "./pointer.fixture.js";
import { probe } from "./probe.js";
import { PEN_MODE } from "./session.js";

// The sheet past the task's page in a browser (R73): the page fits the width up to a pixel a unit
// at the sheet's left, and the sheet goes on right and down as far as the ink and one view more,
// within its reach, nothing zooming it. The container scrolls it across as well as down — by the
// wheel, the keys, two fingers and the hand, for the bar has no buttons that scroll it (R84; R88)
// — the statement staying as wide as the page. The canvas stays as small as the container, and the
// input and the eraser stay in units of the sheet. A worked example's sheet is its page alone.

const made: HTMLElement[] = [];
afterEach(async () => {
  await touches("touchCancel", []).catch(() => {});
  for (const element of made.splice(0)) element.remove();
  PEN_MODE.on = false;
  window.scrollTo(0, 0);
});

/** How far the sheet goes as laid out, in units: its box on the screen by the view's k. */
function extentOf(root: ShadowRoot, view: View): { width: number; height: number } {
  const box = root.querySelector(".sheet")?.getBoundingClientRect();
  if (box === undefined) throw new Error("the element has no sheet");
  return { width: box.width / view.k, height: box.height / view.k };
}

/**
 * The extent the sheet should have past ink reaching `right` and `bottom`, by one view of the
 * window as room, at the window's own fit, whatever the element's own width.
 */
function expected(right: number = SHEET.width, bottom: number = SHEET.height) {
  const fit = Math.min(innerWidth / SHEET.width, 1);
  const room = { width: innerWidth / fit, height: innerHeight / fit };
  return {
    width: Math.min(REACH.width, Math.ceil(Math.max(right, SHEET.width) + room.width)),
    height: Math.min(REACH.height, Math.ceil(Math.max(bottom, SHEET.height) + room.height)),
  };
}

/** Whether two extents are the same but for the layout's rounding of pixels. */
function same(got: { width: number; height: number }, want: { width: number; height: number }) {
  expect(got.width).toBeCloseTo(want.width, 0);
  expect(got.height).toBeCloseTo(want.height, 0);
}

/** The alpha of the canvas's device pixel over a point of the sheet: 0 where there is no ink. */
function inkAt(canvas: HTMLCanvasElement, view: View, x: number, y: number): number {
  const scale = (canvas.width / canvas.getBoundingClientRect().width) * view.k;
  const pixel = canvas
    .getContext("2d")
    ?.getImageData(Math.floor((x - view.vx) * scale), Math.floor((y - view.vy) * scale), 1, 1);
  return pixel?.data[3] ?? 0;
}

/** A scroll of the container that the browser may animate, come to rest, or a second gone. */
function rested(viewport: HTMLElement): Promise<unknown> {
  return new Promise((resolve) => {
    viewport.addEventListener("scrollend", resolve, { once: true });
    setTimeout(resolve, 1000);
  });
}

test.each([320, 640, 1000, 1400])(
  "at %i CSS px the page fits the width up to a pixel a unit, at the sheet's left, and the sheet goes one view past it right and down: the canvas no larger than the container, which scrolls across by the page's width",
  async (width) => {
    const { root, canvas, viewport, view } = await placed(made, width, 300);
    const k = Math.min(viewport.clientWidth, SHEET.width) / SHEET.width;
    expect(view().k).toBeCloseTo(k, 6);
    expect(view().vx).toBe(0);
    // The page stands at the sheet's left, whatever room the container has beside it.
    expect(canvas.getBoundingClientRect().left).toBeCloseTo(
      viewport.getBoundingClientRect().left,
      3,
    );
    const extent = extentOf(root, view());
    same(extent, expected());
    // The canvas takes the visible part alone, across and down, a pixel for each device pixel.
    const shown = canvas.getBoundingClientRect();
    expect(shown.width).toBeCloseTo(viewport.clientWidth, 3);
    expect(shown.height).toBeCloseTo(viewport.clientHeight, 3);
    expect(canvas.width).toBe(Math.round(shown.width * devicePixelRatio));
    expect(canvas.height).toBe(Math.round(shown.height * devicePixelRatio));
    const across = viewport.scrollWidth - viewport.clientWidth;
    expect(Math.abs(across - (extent.width * k - viewport.clientWidth))).toBeLessThanOrEqual(1);
  },
);

test("the sheet grows past the ink by one view, right and down, and shrinks back as an undo or a clearing takes the ink off", async () => {
  const { element, root, canvas, viewport, view } = await placed(made, 400, 300);
  const k = view().k;
  same(extentOf(root, view()), expected());
  // Right across, past the page: the visible part starts where the page ends.
  viewport.scrollLeft = viewport.scrollWidth;
  await settle();
  expect(view().vx).toBeCloseTo(SHEET.width, 0);
  level(canvas, view(), 100, 1200, 1800);
  await settle();
  const [stroke] = probe(element).strokes;
  for (const point of stroke?.points ?? []) {
    expect(point.x).toBeGreaterThanOrEqual(1200 - 1e-6);
    expect(point.x).toBeLessThanOrEqual(1800 + 1e-6);
  }
  same(extentOf(root, view()), expected(1800));
  expect(viewport.scrollWidth - viewport.clientWidth).toBeGreaterThan(SHEET.width * k + 300);
  element.undo();
  await settle();
  same(extentOf(root, view()), expected());
  // Down, below the page.
  viewport.scrollTop = viewport.scrollHeight;
  await settle();
  const { vx, vy } = view();
  expect(vy).toBeGreaterThan(SHEET.height - 1);
  level(canvas, view(), vy + 500, vx + 200, vx + 300);
  await settle();
  same(extentOf(root, view()), expected(vx + 300, vy + 500));
  element.clear();
  await settle();
  same(extentOf(root, view()), expected());
});

test("a history given with ink far past the page lays the sheet out as far as it, within the sheet's reach", async () => {
  const { element, root, viewport, view } = await placed(made, 400, 300);
  const far: HistoryEvent[] = [
    {
      kind: "write",
      t: 10,
      stroke: {
        id: 1,
        kind: "pen",
        points: [
          { x: 9000, y: 100, t: 0, p: 0.5 },
          { x: 9900, y: 13900, t: 10, p: 0.5 },
        ],
      },
    },
  ];
  element.history = far;
  await settle();
  same(extentOf(root, view()), REACH);
  viewport.scrollLeft = viewport.scrollWidth;
  viewport.scrollTop = viewport.scrollHeight;
  await settle();
  // The visible part's far corner is the reach's.
  const { k, vx, vy } = view();
  expect(vx + viewport.clientWidth / k).toBeCloseTo(REACH.width, 0);
  expect(vy + viewport.clientHeight / k).toBeCloseTo(REACH.height, 0);
  element.history = [];
  await settle();
  same(extentOf(root, view()), expected());
});

test("the statement stays as wide as the page and in sight across, wrapping as before, while the sheet goes by under it", async () => {
  const lines = Array.from({ length: 3 }, (_, i) => ({
    text: `Line ${i + 1} of the statement, long enough to wrap at the width of the page.`,
  }));
  const { root, viewport } = await placed(made, 320, 400, {
    task: sheetTask({ statement: lines }),
  });
  const statement = root.querySelector<HTMLElement>(".statement");
  if (!statement) throw new Error("no statement");
  const tall = statement.getBoundingClientRect().height;
  for (const left of [0, 160, viewport.scrollWidth]) {
    viewport.scrollLeft = left;
    await settle();
    const box = statement.getBoundingClientRect();
    const port = viewport.getBoundingClientRect();
    expect(box.left).toBeCloseTo(port.left, 0);
    expect(box.width).toBeCloseTo(viewport.clientWidth, 0);
    expect(box.height).toBeCloseTo(tall, 0);
  }
  // The page at 320 pixels, and the sheet a page's width more past it.
  expect(viewport.scrollLeft).toBeCloseTo(viewport.clientWidth, 0);
});

test("a new width keeps the top left corner in sight where it was on the sheet, unless the sheet's left is in sight", async () => {
  const { element, viewport, view } = await placed(made, 400, 300);
  viewport.scrollTop = 300;
  await settle();
  const { vy } = view();
  expect(vy).toBeGreaterThan(0);
  // Where the corner is, to half a unit, and in WebKit to a device pixel of the screen at the k
  // shown: WebKit scrolls by whole pixels, so the corner the element asks for lands within one.
  const near = (got: number, want: number) =>
    expect(Math.abs(got - want)).toBeLessThanOrEqual(
      server.browser === "webkit" ? 1 / (devicePixelRatio * view().k) : 0.5,
    );
  element.style.width = "300px";
  await settle();
  expect(view().k).toBeCloseTo(viewport.clientWidth / SHEET.width, 6);
  expect(view().vx).toBe(0);
  near(view().vy, vy);
  viewport.scrollLeft = 120;
  await settle();
  const { vx } = view();
  expect(vx).toBeCloseTo(120 / view().k, 0);
  element.style.width = "500px";
  await settle();
  near(view().vx, vx);
  near(view().vy, vy);
});

test("a consumer's bars over the element's top and bottom, --novatrail-canvas-pad-top and -bottom, move the statement and the sheet down by the first and leave room after the sheet by the second, the view in sheet units as before", async () => {
  const { element, root, canvas, viewport, view } = await placed(made, 400, 600, {
    task: sheetTask({ statement: [{ text: "A line of the statement." }] }),
  });
  const statement = root.querySelector(".statement");
  if (!statement) throw new Error("no statement");
  const top = () => statement.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
  const sheetTop = () => canvas.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
  const [before, sheetBefore, tall] = [top(), sheetTop(), viewport.scrollHeight];
  element.style.setProperty("--novatrail-canvas-pad-top", "50px");
  element.style.setProperty("--novatrail-canvas-pad-bottom", "70px");
  await settle();
  expect(top()).toBeCloseTo(before + 50, 0);
  expect(sheetTop()).toBeCloseTo(sheetBefore + 50, 0);
  expect(viewport.scrollHeight).toBeCloseTo(tall + 120, 0);
  // At the container's end the sheet's bottom stands the pad above its bottom.
  viewport.scrollTop = viewport.scrollHeight;
  await settle();
  const sheet = root.querySelector(".sheet")?.getBoundingClientRect();
  expect(sheet?.bottom).toBeCloseTo(viewport.getBoundingClientRect().bottom - 70, 0);
  // A stroke lands where it is drawn, in sheet units.
  const { vy } = view();
  level(canvas, view(), vy + 200, 300, 500);
  const [stroke] = probe(element).strokes;
  expect(stroke?.points[0]?.y).toBeCloseTo(vy + 200, 3);
});

test("a stroke on a sheet scrolled across lands in sheet units past the page, with its ink, the eraser takes nothing out of sight to the left, and the picture of the work is the page alone", async () => {
  const { element, canvas, viewport, view } = await placed(made, 400, 300);
  level(canvas, view(), 100, 100, 300);
  viewport.scrollLeft = 400;
  await settle();
  expect(view().vx).toBeCloseTo(SHEET.width, 3);
  level(canvas, view(), 100, 1100, 1300);
  await settle();
  const [, stroke] = probe(element).strokes;
  for (const point of stroke?.points ?? []) {
    expect(point.y).toBeCloseTo(100, 3);
    expect(point.x).toBeGreaterThanOrEqual(1100 - 1e-6);
    expect(point.x).toBeLessThanOrEqual(1300 + 1e-6);
  }
  expect(inkAt(canvas, view(), 1200, 100)).toBeGreaterThan(0);
  expect(inkAt(canvas, view(), 1200, 160)).toBe(0);
  // The eraser, pressed on the second stroke and taken left beyond the container, out of sight of
  // the first.
  element.tool = "eraser";
  const mouse = { pointerId: 5, pointerType: "mouse", isPrimary: true, bubbles: true };
  const event = (type: string, x: number, init: PointerEventInit) =>
    new PointerEvent(type, { ...mouse, ...at(canvas, view(), x, 100), ...init });
  canvas.dispatchEvent(event("pointerdown", 1250, { button: 0, buttons: 1 }));
  canvas.dispatchEvent(event("pointermove", 1050, { button: -1, buttons: 1 }));
  canvas.dispatchEvent(event("pointermove", 150, { button: -1, buttons: 1 }));
  canvas.dispatchEvent(event("pointerup", 150, { button: 0, buttons: 0 }));
  expect(probe(element).strokes.map((each) => each.id)).toEqual([1]);
  element.tool = "pen";
  element.undo();
  expect(probe(element).strokes.map((each) => each.id)).toEqual([1, 2]);
  // The picture is the page and the ink past it, scaled down to the page's bytes (R83).
  const picture = await createImageBitmap(await element.exportPicture());
  const right = Math.max(
    ...probe(element).strokes.flatMap((each) => each.points.map(({ x }) => x)),
  );
  const want = pictureOf({ maxX: right + INK_REACH, maxY: 0 });
  expect([picture.width, picture.height]).toEqual([want.width, want.height]);
  expect(want.width).toBeGreaterThan(want.height * (SHEET.width / SHEET.height));
  const drawn = new OffscreenCanvas(picture.width, picture.height).getContext("2d");
  drawn?.drawImage(picture, 0, 0);
  const pixel = (x: number, y: number) =>
    drawn?.getImageData(Math.round(x * want.scale), Math.round(y * want.scale), 1, 1).data[0];
  // The stroke past the page is in it, and white is below it.
  expect(pixel(1200, 100)).toBeLessThan(128);
  expect(pixel(1200, 160)).toBe(255);
});

test("an element without a height, whose sheet is wider than it, is a region with a stop of Tab, which the arrows scroll across, and axe finds nothing", async () => {
  const { element, viewport } = await placed(made, 400, undefined, { task: sheetTask() });
  expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);
  expect(viewport.getAttribute("tabindex")).toBe("0");
  expect(viewport.getAttribute("role")).toBe("region");
  expect(viewport.getAttribute("aria-label")).toBe("Sheet");
  // No scrollbar takes a strip of the sheet, across or down (R73).
  expect(viewport.offsetWidth - viewport.clientWidth).toBe(0);
  expect(viewport.offsetHeight - viewport.clientHeight).toBe(0);
  await axeOf(element);
  viewport.focus();
  for (const [key, check] of [
    ["{ArrowRight}", (left: number) => left > 0],
    ["{ArrowLeft}", (left: number) => left === 0],
  ] as const) {
    const done = rested(viewport);
    await userEvent.keyboard(key);
    await done;
    expect(check(viewport.scrollLeft), `${key} at ${viewport.scrollLeft}`).toBe(true);
  }
});

test.each([
  { which: "without a height of its own", height: undefined },
  { which: "300 px tall", height: 300 },
])(
  "an element $which lays out its sheet past the page with no error on the window, such as a loop of a ResizeObserver, as it comes and as the ink grows it",
  async ({ height }) => {
    const errors: string[] = [];
    const heard = (event: ErrorEvent) => errors.push(event.message);
    addEventListener("error", heard);
    try {
      const { canvas, viewport, view } = await placed(made, 400, height);
      viewport.scrollLeft = viewport.scrollWidth;
      await settle();
      level(canvas, view(), 100, view().vx + 200, view().vx + 900);
      await settle();
      await settle();
    } finally {
      removeEventListener("error", heard);
    }
    expect(errors).toEqual([]);
  },
);

test.runIf(devtools)(
  "two fingers scroll the sheet across by their travel past the slop, and down alone on the rail of a scroll down",
  {
    timeout: budget(1_374),
  },
  async () => {
    const { canvas, viewport, view } = await placed(made, 400, 400);
    spacer(made);
    PEN_MODE.on = true;
    const one = { id: 1, ...at(canvas, view(), 300, 100) };
    const two = { ...one, id: 2, clientY: one.clientY + 60 };
    const down = Date.now() / 1000;
    await touches("touchStart", [one], down);
    await touches("touchStart", [one, two], down + 0.01);
    for (let step = 1; step <= 5; step++) {
      const dx = (-60 * step) / 5;
      await touches(
        "touchMove",
        [one, two].map((each) => ({ ...each, clientX: each.clientX + dx })),
      );
    }
    await touches("touchEnd", []);
    await settle();
    expect(viewport.scrollLeft).toBeCloseTo(60 - SLOP_PX, 0);
    expect(viewport.scrollTop).toBe(0);
    // Down, with a little sideways in it: the sheet goes down alone.
    const left = viewport.scrollLeft;
    await touches("touchStart", [one], down + 1);
    await touches("touchStart", [one, two], down + 1.01);
    for (let step = 1; step <= 5; step++) {
      const moved = { x: (-6 * step) / 5, y: (-60 * step) / 5 };
      await touches(
        "touchMove",
        [one, two].map((each) => ({
          ...each,
          clientX: each.clientX + moved.x,
          clientY: each.clientY + moved.y,
        })),
      );
    }
    await touches("touchEnd", []);
    await settle();
    expect(viewport.scrollLeft).toBe(left);
    expect(viewport.scrollTop).toBeCloseTo(60 - SLOP_PX, 0);
    // Up and to the left alike: both ways at once, by the share of each past the slop.
    const top = viewport.scrollTop;
    await touches("touchStart", [one], down + 2);
    await touches("touchStart", [one, two], down + 2.01);
    for (let step = 1; step <= 5; step++) {
      const by = (-30 * step) / 5;
      await touches(
        "touchMove",
        [one, two].map((each) => ({
          ...each,
          clientX: each.clientX + by,
          clientY: each.clientY + by,
        })),
      );
    }
    await touches("touchEnd", []);
    await settle();
    const each = 30 - SLOP_PX / Math.SQRT2;
    expect(Math.abs(viewport.scrollLeft - left - each)).toBeLessThan(1);
    expect(Math.abs(viewport.scrollTop - top - each)).toBeLessThan(1);
    expect(window.scrollY).toBe(0);
  },
);

test.runIf(devtools)("the wheel scrolls the sheet across, and down", async () => {
  const { canvas, viewport, view } = await placed(made, 400, 300);
  const point = at(canvas, view(), 500, 100);
  let done = rested(viewport);
  await wheel(point, 120, 0);
  await done;
  expect(viewport.scrollLeft).toBeGreaterThan(0);
  expect(viewport.scrollTop).toBe(0);
  done = rested(viewport);
  await wheel(point, 0, 120);
  await done;
  expect(viewport.scrollTop).toBeGreaterThan(0);
});

test("every layer shows the sheet by the canvas's one view, scrolled across and down", async () => {
  const { root, canvas, viewport, view } = await placed(made, 400, 300);
  viewport.scrollLeft = 250;
  viewport.scrollTop = 400;
  await settle();
  const { k, vx, vy } = view();
  expect([vx, vy]).toEqual([expect.closeTo(250 / k, 3), expect.any(Number)]);
  expect(vy).toBeGreaterThan(0);
  const rect = canvas.getBoundingClientRect();
  // The tracing paper's layer shows a task from paper's alone (R87).
  for (const svg of root.querySelectorAll<SVGSVGElement>('.stage > svg:not([display="none"])')) {
    // A point of the sheet stands on the screen where the canvas draws it.
    const matrix = svg.getScreenCTM();
    expect(matrix?.a).toBeCloseTo(k, 6);
    expect(matrix?.d).toBeCloseTo(k, 6);
    expect(matrix?.e).toBeCloseTo(rect.left - vx * k, 3);
    expect(matrix?.f).toBeCloseTo(rect.top - vy * k, 3);
  }
});

test("the grid rules the whole sheet, past the page as far as it goes, and follows it as it grows", async () => {
  const { element, root, canvas, viewport, view } = await placed(made, 400, 300);
  const grid = root.querySelector(".grid");
  const extent = () => {
    const { width, height } = extentOf(root, view());
    return { width: Math.round(width), height: Math.round(height) };
  };
  expect(grid?.getAttribute("d")).toBe(gridPath({ kind: "squares", step: 50 }, extent()));
  viewport.scrollLeft = viewport.scrollWidth;
  await settle();
  level(canvas, view(), 100, 1200, 1900);
  await settle();
  expect(extent().width).toBeGreaterThan(2800);
  expect(grid?.getAttribute("d")).toBe(gridPath({ kind: "squares", step: 50 }, extent()));
  element.undo();
  await settle();
  expect(grid?.getAttribute("d")).toBe(gridPath({ kind: "squares", step: 50 }, extent()));
});

test("in a page that runs right to left, by a style or by dir, the statement keeps the element's direction, and the container runs left to right from the sheet's left", async () => {
  for (const runs of ["style", "dir"] as const) {
    const parent = document.createElement("div");
    if (runs === "style") parent.style.direction = "rtl";
    else parent.dir = "rtl";
    document.body.append(parent);
    const { root, viewport } = await placed(made, 400, 300, {
      parent,
      task: sheetTask({ statement: [{ text: "A line of the statement." }] }),
    });
    const statement = root.querySelector(".statement");
    if (!statement) throw new Error("no statement");
    expect(getComputedStyle(statement).direction).toBe("rtl");
    // The container runs left to right, from the sheet's left.
    expect(getComputedStyle(viewport).direction).toBe("ltr");
    expect(viewport.scrollLeft).toBe(0);
  }
});

test("a worked example's sheet is its page alone: as wide as the container, with nothing across to scroll, and its grid on the page", async () => {
  const { element, root, viewport, view } = await placed(made, 400, 300);
  element.workedExample = workedExample({ grid: "dots", grid_step: 40 });
  await settle();
  same(extentOf(root, view()), SHEET);
  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
  expect(root.querySelector(".grid")?.getAttribute("d")).toBe(gridPath({ kind: "dots", step: 40 }));
  // Taken off, the sheet goes past the page again.
  element.workedExample = undefined;
  await settle();
  same(extentOf(root, view()), expected());
});

// The hand (R88): a tool of the bar that moves the sheet under any pointer and writes nothing.

/** A pointer on the canvas, made by a script, at client points: a mouse's unless told. */
function pointer(canvas: HTMLCanvasElement, init: PointerEventInit = {}) {
  const base = { pointerId: 7, pointerType: "mouse", isPrimary: true, bubbles: true, ...init };
  const send = (type: string, clientX: number, clientY: number, state: PointerEventInit) =>
    canvas.dispatchEvent(new PointerEvent(type, { ...base, clientX, clientY, ...state }));
  return {
    down: (x: number, y: number) => send("pointerdown", x, y, { button: 0, buttons: 1 }),
    move: (x: number, y: number) => send("pointermove", x, y, { button: -1, buttons: 1 }),
    up: (x: number, y: number) => send("pointerup", x, y, { button: 0, buttons: 0 }),
  };
}

test("with the hand a drag on the canvas moves the sheet both ways with it, as far as it goes, writes nothing and tells nothing, and the sheet shows a hand that grabs while it drags", async () => {
  const { element, root, canvas, viewport } = await placed(made, 400, 300);
  const told: (HistoryChange | ToolChange)[] = [];
  element.addEventListener("historychange", (event) => told.push(event.detail));
  element.addEventListener("toolchange", (event) => told.push(event.detail));
  element.tool = "hand";
  await settle();
  const sheet = root.querySelector(".sheet");
  expect(sheet?.classList.contains("hand")).toBe(true);
  expect(getComputedStyle(canvas).cursor).toBe("grab");
  const box = canvas.getBoundingClientRect();
  const [x, y] = [box.left + 200, box.top + 150];
  const mouse = pointer(canvas);
  mouse.down(x, y);
  expect(sheet?.classList.contains("panning")).toBe(true);
  expect(getComputedStyle(canvas).cursor).toBe("grabbing");
  // Left and up on the screen: the sheet goes with the pointer, and the container scrolls on.
  mouse.move(x - 50, y - 40);
  mouse.move(x - 100, y - 80);
  mouse.up(x - 100, y - 80);
  await settle();
  expect(viewport.scrollLeft).toBeCloseTo(100, 0);
  expect(viewport.scrollTop).toBeCloseTo(80, 0);
  expect(sheet?.classList.contains("panning")).toBe(false);
  expect(getComputedStyle(canvas).cursor).toBe("grab");
  // Back right and down further than the sheet goes: it stops at its top left corner.
  mouse.down(x, y);
  mouse.move(x + 300, y + 300);
  mouse.up(x + 300, y + 300);
  await settle();
  expect([viewport.scrollLeft, viewport.scrollTop]).toEqual([0, 0]);
  expect([probe(element).strokes, element.history, told]).toEqual([[], [], []]);
  // The pen writes again.
  element.tool = "pen";
  await settle();
  expect(sheet?.classList.contains("hand")).toBe(false);
  pointer(canvas).down(x, y);
  pointer(canvas).move(x + 40, y);
  pointer(canvas).up(x + 40, y);
  expect(probe(element).strokes).toHaveLength(1);
});

test("with the hand a second pointer while one drags does nothing, and the hand's pointer lifted lets go", async () => {
  const { element, canvas, viewport } = await placed(made, 400, 300);
  element.tool = "hand";
  const box = canvas.getBoundingClientRect();
  const [x, y] = [box.left + 200, box.top + 150];
  const one = pointer(canvas);
  const two = pointer(canvas, { pointerId: 8, isPrimary: false });
  one.down(x, y);
  two.down(x, y);
  two.move(x - 60, y - 60);
  two.up(x - 60, y - 60);
  expect([viewport.scrollLeft, viewport.scrollTop]).toEqual([0, 0]);
  one.move(x - 30, y);
  one.up(x - 30, y);
  await settle();
  expect(viewport.scrollLeft).toBeCloseTo(30, 0);
  // Lifted, it moves nothing more.
  one.move(x - 90, y);
  await settle();
  expect(viewport.scrollLeft).toBeCloseTo(30, 0);
  expect(probe(element).strokes).toEqual([]);
});

test.runIf(devtools)(
  "with the hand a real mouse, a pen and a finger alike drag the sheet across and down, and write nothing",
  {
    timeout: budget(1_000),
  },
  async () => {
    const { element, root, canvas, viewport } = await placed(made, 400, 300);
    element.tool = "hand";
    const sheet = root.querySelector(".sheet");
    const box = canvas.getBoundingClientRect();
    const from = { clientX: box.left + 250, clientY: box.top + 200 };
    const to = { clientX: from.clientX - 60, clientY: from.clientY - 40 };
    let scrolled = { left: 0, top: 0 };
    const moved = async () => {
      await settle();
      expect(viewport.scrollLeft - scrolled.left).toBeCloseTo(60, 0);
      expect(viewport.scrollTop - scrolled.top).toBeCloseTo(40, 0);
      scrolled = { left: viewport.scrollLeft, top: viewport.scrollTop };
      expect(sheet?.classList.contains("panning")).toBe(false);
    };
    for (const pointerType of ["mouse", "pen"] as const) {
      const force = { pointerType, force: 0.5 };
      await input("mousePressed", from, force);
      await input("mouseMoved", to, force);
      expect(sheet?.classList.contains("panning")).toBe(true);
      await input("mouseReleased", to, { pointerType, force: 0 });
      await moved();
    }
    const finger = { id: 1, ...from };
    await touches("touchStart", [finger]);
    await touches("touchMove", [{ ...finger, ...to }]);
    await touches("touchEnd", []);
    await moved();
    expect([probe(element).strokes, element.history]).toEqual([[], []]);
  },
);

test("under the consumer's padding the grid goes on above the sheet and below it, a ruling on each step, and a padding of none shows no band", async () => {
  // A task from paper: its statement is the tracing paper, and the element draws none above the sheet.
  const { element, root, view } = await placed(made, 400, 300);
  element.paper = { statement: await paperCrop() };
  element.grid = "squares";
  await settle();
  const step = rulingsOf("squares")?.step ?? Number.NaN;
  const above = root.querySelector<SVGSVGElement>(".band.above");
  const below = root.querySelector<SVGSVGElement>(".band.below");
  const sheet = root.querySelector(".sheet");
  if (above === null || below === null || sheet === null) throw new Error("no bands");
  // No padding, no band to see.
  expect(above.getBoundingClientRect().height).toBe(0);
  expect(getComputedStyle(above).clipPath).toBe("inset(0px)");
  element.style.setProperty("--novatrail-canvas-pad-top", "40px");
  element.style.setProperty("--novatrail-canvas-pad-bottom", "60px");
  await settle();
  const k = view().k;
  const top = above.getBoundingClientRect();
  const box = sheet.getBoundingClientRect();
  expect(top.height).toBeCloseTo(40, 3);
  expect(top.bottom).toBeCloseTo(box.top, 3);
  expect(top.width).toBeCloseTo(box.width, 3);
  expect(below.getBoundingClientRect().top).toBeCloseTo(box.bottom, 3);
  expect(below.getBoundingClientRect().height).toBeCloseTo(60, 3);
  // The band's units are the sheet's: its rulings fall on the step, the last on the sheet's edge.
  const ruling = (svg: SVGSVGElement, y: number) => {
    const matrix = svg.getScreenCTM();
    return matrix === null ? Number.NaN : matrix.f + y * matrix.d;
  };
  expect(above.getScreenCTM()?.d).toBeCloseTo(k, 6);
  expect(ruling(above, 0)).toBeCloseTo(box.top, 3);
  expect(ruling(above, -step)).toBeCloseTo(box.top - step * k, 3);
  expect(above.firstElementChild?.getAttribute("d")).toContain(`M0 ${-step}H`);
  expect(ruling(below, box.height / k)).toBeCloseTo(box.bottom, 3);
  // A statement stands above the sheet in the padding: no band above it.
  element.paper = undefined;
  element.task = sheetTask();
  await settle();
  expect(getComputedStyle(above).display).toBe("none");
  expect(getComputedStyle(below).display).toBe("block");
});
