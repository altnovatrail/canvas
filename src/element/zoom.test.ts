import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { SLOP_PX } from "../core/hands.js";
import { LAYOUT } from "../core/page.js";
import { SHORT } from "../core/pages.fixture.js";
import type { View } from "../core/screen.js";
import { sheetTask, workbookTask } from "../core/tasks.fixture.js";
import { axeOf } from "./axe.fixture.js";
import { at, level, placed, press, settle, sheetWork, spacer, touches } from "./pointer.fixture.js";
import { probe } from "./probe.js";
import { PAGE_ZOOM, PEN_MODE } from "./session.js";

// The page's zoom of the sheet in Chromium (T94; R90 spec): Zoom in and Zoom out step it from the
// sheet's fit to twice it, for every sheet of the page, and a zoomed sheet scrolls across as well
// as down — with Left and Right, two fingers and the keys — its statement staying as wide as the
// fit. The workbook's printed lines grow with it, as 1.4.4 asks; the canvas stays as small as the
// container, and the input, the eraser and the work for checking stay in units of the sheet.

const made: HTMLElement[] = [];
afterEach(async () => {
  await touches("touchCancel", []).catch(() => {});
  for (const element of made.splice(0)) element.remove();
  // The zoom is the page's: the next test starts at the fit.
  while (PAGE_ZOOM.step(false)) {}
  PEN_MODE.on = false;
  window.scrollTo(0, 0);
});

/** A button of an element's row, by its label. */
function button(element: HTMLElement, name: string): HTMLButtonElement {
  const found = [...(element.shadowRoot?.querySelectorAll("button") ?? [])].find(
    (each) => each.textContent === name,
  );
  if (found === undefined) throw new Error(`the row has no ${name}`);
  return found;
}

/** The page's zoom stepped to `zoom` with an element's Zoom in or Zoom out, laid out and drawn. */
async function zoomTo(element: HTMLElement, zoom: number): Promise<void> {
  while (PAGE_ZOOM.value !== zoom) {
    button(element, PAGE_ZOOM.value < zoom ? "Zoom in" : "Zoom out").click();
  }
  await settle();
}

/** What `aria-disabled` says of each button: "true" while it stands unavailable. */
const unavailable = (element: HTMLElement, ...names: string[]) =>
  names.map((name) => button(element, name).getAttribute("aria-disabled"));

/** The alpha of the canvas's device pixel over a point of the sheet: 0 where there is no ink. */
function inkAt(canvas: HTMLCanvasElement, view: View, x: number, y: number): number {
  const scale = (canvas.width / canvas.getBoundingClientRect().width) * view.k;
  const pixel = canvas
    .getContext("2d")
    ?.getImageData(Math.floor((x - view.vx) * scale), Math.floor((y - view.vy) * scale), 1, 1);
  return pixel?.data[3] ?? 0;
}

test.each([
  { width: 320, zoom: 2 },
  { width: 640, zoom: 2 },
  { width: 640, zoom: 1.25 },
  { width: 1000, zoom: 2 },
  { width: 1400, zoom: 2 },
  { width: 1400, zoom: 1.25 },
])(
  "at $width CSS px and $zoom the sheet is the fit times the zoom, the canvas no larger than the container, and the container scrolls across while the sheet is wider",
  async ({ width, zoom }) => {
    const { element, canvas, viewport, view } = await placed(made, width, 300);
    const fit = Math.min(width, 1000) / 1000;
    expect(view().k).toBeCloseTo(fit, 6);
    expect(unavailable(element, "Zoom in", "Zoom out")).toEqual([null, "true"]);
    await zoomTo(element, zoom);
    const k = fit * zoom;
    expect(view().k).toBeCloseTo(k, 6);
    // The canvas takes the visible part alone, across and down, a pixel for each device pixel.
    const shown = canvas.getBoundingClientRect();
    expect(shown.width).toBeCloseTo(Math.min(width, 1000 * k), 3);
    expect(shown.height).toBeCloseTo(Math.min(viewport.clientHeight, 1400 * k), 3);
    expect(canvas.width).toBe(Math.round(shown.width * devicePixelRatio));
    expect(canvas.height).toBe(Math.round(shown.height * devicePixelRatio));
    const across = viewport.scrollWidth - viewport.clientWidth;
    expect(across).toBeCloseTo(Math.max(0, 1000 * k - width), 0);
    expect(unavailable(element, "Zoom in")).toEqual([zoom === 2 ? "true" : null]);
    // Left stands unavailable at the left, and Right while neither the container nor the page
    // scrolls on across: an element wider than the window of the test makes the page scroll.
    const page = document.documentElement.scrollWidth > window.innerWidth;
    const right = across > 0.5 || page ? null : "true";
    expect(unavailable(element, "Left", "Right")).toEqual(["true", right]);
  },
);

test("the statement stays as wide as the fit and in sight across, wrapping as before, while the sheet goes by under it", async () => {
  const lines = Array.from({ length: 3 }, (_, i) => ({
    text: `Line ${i + 1} of the statement, long enough to wrap at the width of the fit.`,
  }));
  const { element, root, viewport } = await placed(made, 320, 400, {
    task: sheetTask({ statement: lines }),
  });
  const statement = root.querySelector<HTMLElement>(".statement");
  if (!statement) throw new Error("no statement");
  const tall = statement.getBoundingClientRect().height;
  await zoomTo(element, 2);
  for (const left of [0, 160, viewport.scrollWidth]) {
    viewport.scrollLeft = left;
    await settle();
    const box = statement.getBoundingClientRect();
    const port = viewport.getBoundingClientRect();
    expect(box.left).toBeCloseTo(port.left, 0);
    expect(box.width).toBeCloseTo(320, 0);
    expect(box.height).toBeCloseTo(tall, 0);
  }
  expect(viewport.scrollLeft).toBeCloseTo(320, 0);
});

test("a zoom keeps the top left corner in sight where it was on the sheet, and at the fit the sheet scrolls across no more", async () => {
  const { element, viewport, view } = await placed(made, 400, 300);
  viewport.scrollTop = 300;
  await settle();
  const { vy } = view();
  expect(vy).toBeGreaterThan(0);
  await zoomTo(element, 1.5);
  expect(view().vx).toBe(0);
  expect(view().vy).toBeCloseTo(vy, 0);
  viewport.scrollLeft = 120;
  await settle();
  const { vx } = view();
  expect(vx).toBeCloseTo(120 / 0.6, 0);
  await zoomTo(element, 2);
  expect(view().vx).toBeCloseTo(vx, 0);
  expect(view().vy).toBeCloseTo(vy, 0);
  await zoomTo(element, 1.25);
  expect(view().vx).toBeCloseTo(vx, 0);
  expect(view().vy).toBeCloseTo(vy, 0);
  await zoomTo(element, 1);
  expect(viewport.scrollLeft).toBe(0);
  expect(view().vx).toBe(0);
  expect(view().vy).toBeCloseTo(vy, 0);
});

test("a stroke on a zoomed sheet scrolled across lands in sheet units, with its ink, and the eraser takes nothing out of sight to the left", async () => {
  const { element, canvas, viewport, view } = await placed(made, 400, 300);
  level(canvas, view(), 100, 100, 300);
  await zoomTo(element, 2);
  viewport.scrollLeft = 400;
  await settle();
  expect(view().vx).toBeCloseTo(500, 3);
  level(canvas, view(), 100, 600, 800);
  await settle();
  const [, stroke] = probe(element).strokes;
  for (const point of stroke?.points ?? []) {
    expect(point.y).toBeCloseTo(100, 3);
    expect(point.x).toBeGreaterThanOrEqual(600 - 1e-6);
    expect(point.x).toBeLessThanOrEqual(800 + 1e-6);
  }
  expect(inkAt(canvas, view(), 700, 100)).toBeGreaterThan(0);
  expect(inkAt(canvas, view(), 700, 160)).toBe(0);
  // The work for checking is the strokes': the zoom puts nothing in it.
  const zoomed = await sheetWork(element);
  // The eraser, pressed on the second stroke and taken left beyond the container, out of sight of
  // the first.
  element.tool = "eraser";
  const mouse = { pointerId: 5, pointerType: "mouse", isPrimary: true, bubbles: true };
  const event = (type: string, x: number, init: PointerEventInit) =>
    new PointerEvent(type, { ...mouse, ...at(canvas, view(), x, 100), ...init });
  canvas.dispatchEvent(event("pointerdown", 900, { button: 0, buttons: 1 }));
  canvas.dispatchEvent(event("pointermove", 550, { button: -1, buttons: 1 }));
  canvas.dispatchEvent(event("pointermove", 150, { button: -1, buttons: 1 }));
  canvas.dispatchEvent(event("pointerup", 150, { button: 0, buttons: 0 }));
  expect(probe(element).strokes.map((each) => each.id)).toEqual([1]);
  element.tool = "pen";
  element.undo();
  await zoomTo(element, 1);
  const fit = await sheetWork(element);
  expect(new Uint8Array(await fit.png.arrayBuffer())).toEqual(
    new Uint8Array(await zoomed.png.arrayBuffer()),
  );
  expect(fit.submission).toEqual(zoomed.submission);
});

test.each([1, 1.5])(
  "Left and Right come with the zoom, after its pair, and scroll the container by four fifths of what it shows across, under an ancestor scaled %s times as well",
  async (scale) => {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `transform: scale(${scale}); transform-origin: 0 0;`;
    document.body.append(wrapper);
    const { element, row, viewport } = await placed(made, 400, 300, { parent: wrapper });
    const shown = () =>
      [...row.querySelectorAll("button:not([hidden])")].map((each) => each.textContent);
    expect(shown()).not.toContain("Left");
    await zoomTo(element, 2);
    expect(shown().slice(-4)).toEqual(["Zoom in", "Zoom out", "Left", "Right"]);
    for (const name of ["Left", "Right"]) {
      const rect = button(element, name).getBoundingClientRect();
      expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44 * scale - 0.01);
    }
    const box = viewport.getBoundingClientRect();
    const seen = Math.min(box.right, window.innerWidth) - Math.max(box.left, 0);
    const step = Math.round((0.8 * seen) / scale);
    const end = viewport.scrollWidth - viewport.clientWidth;
    button(element, "Right").click();
    expect(viewport.scrollLeft).toBeCloseTo(Math.min(step, end), 0);
    button(element, "Right").click();
    expect(viewport.scrollLeft).toBeCloseTo(Math.min(2 * step, end), 0);
    // At the container's end Right hands on to the page, if the page scrolls across: a scaled
    // element is wider than the window of the test.
    const page = document.documentElement.scrollWidth > window.innerWidth;
    expect(unavailable(element, "Left", "Right")).toEqual([null, page ? null : "true"]);
    button(element, "Left").click();
    expect(viewport.scrollLeft).toBeCloseTo(Math.max(0, end - step), 0);
    expect(viewport.scrollTop).toBe(0);
    expect(window.scrollX).toBe(0);
    // Zoom out to the fit hides them, and the focus stays on Zoom out, which they come after.
    button(element, "Zoom out").focus();
    await userEvent.keyboard("{Enter}{Enter}{Enter}{Enter}");
    await settle();
    expect(PAGE_ZOOM.value).toBe(1);
    expect(shown()).not.toContain("Left");
    expect(element.shadowRoot?.activeElement).toBe(button(element, "Zoom out"));
    expect(unavailable(element, "Zoom out")).toEqual(["true"]);
  },
);

test("the zoom is the page's: a press on one sheet lays out every other, and a new one takes it, but nothing moves while a pointer writes", async () => {
  const one = await placed(made, 400, 300);
  const two = await placed(made, 400, 300);
  await zoomTo(one.element, 1.5);
  expect(two.view().k).toBeCloseTo(0.6, 6);
  expect(unavailable(two.element, "Zoom out")).toEqual([null]);
  const three = await placed(made, 400, 300);
  expect(three.view().k).toBeCloseTo(0.6, 6);
  // A stroke under way on the first: a press on another sheet's Zoom in does nothing.
  const writing = press(one.canvas, one.view(), 100, 100, 300);
  button(two.element, "Zoom in").click();
  await settle();
  expect(PAGE_ZOOM.value).toBe(1.5);
  writing.lift();
  button(two.element, "Zoom in").click();
  await settle();
  expect(PAGE_ZOOM.value).toBe(1.75);
  expect(one.view().k).toBeCloseTo(0.7, 6);
});

test("a workbook's printed lines are twice as tall on the screen at 200 %, at 320 and at 640 CSS px (1.4.4)", async () => {
  for (const width of [320, 640]) {
    const { element, root } = await placed(made, width, 400, { task: workbookTask(SHORT) });
    // The print's size on the screen: its units to CSS pixels, down, as the layers' view scales it.
    const print = root.querySelector<SVGGElement>(".print text");
    const size = () => (print?.getScreenCTM()?.d ?? 0) * LAYOUT.size;
    const before = size();
    expect(before).toBeCloseTo((LAYOUT.size * width) / 1000, 6);
    await zoomTo(element, 2);
    expect(size()).toBeCloseTo(2 * before, 6);
    await zoomTo(element, 1);
    element.remove();
  }
});

test("an element without a height whose zoomed sheet is wider than it is a region with a stop of Tab, which the arrows scroll across, and axe finds nothing", async () => {
  const { element, viewport } = await placed(made, 400, undefined, { task: sheetTask() });
  expect(viewport.hasAttribute("tabindex")).toBe(false);
  await zoomTo(element, 2);
  expect(viewport.getAttribute("tabindex")).toBe("0");
  expect(viewport.getAttribute("role")).toBe("region");
  expect(viewport.getAttribute("aria-label")).toBe("Sheet");
  await axeOf(element);
  viewport.focus();
  for (const [key, check] of [
    ["{ArrowRight}", (left: number) => left > 0],
    ["{ArrowLeft}", (left: number) => left === 0],
  ] as const) {
    const rested = new Promise((resolve) => {
      viewport.addEventListener("scrollend", resolve, { once: true });
      setTimeout(resolve, 1000);
    });
    await userEvent.keyboard(key);
    await rested;
    expect(check(viewport.scrollLeft), `${key} at ${viewport.scrollLeft}`).toBe(true);
  }
  await zoomTo(element, 1);
  viewport.blur();
  expect(viewport.hasAttribute("tabindex")).toBe(false);
});

test("two fingers scroll a zoomed sheet across by their travel past the slop, and down alone on the rail of a scroll down", async () => {
  const { element, canvas, viewport, view } = await placed(made, 400, 400);
  spacer(made);
  await zoomTo(element, 2);
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
});

test("every layer shows the zoomed sheet by the canvas's one view, scrolled across and down", async () => {
  const { element, root, canvas, viewport, view } = await placed(made, 400, 300);
  await zoomTo(element, 2);
  viewport.scrollLeft = 250;
  viewport.scrollTop = 400;
  await settle();
  const { k, vx, vy } = view();
  expect([vx, vy]).toEqual([expect.closeTo(250 / k, 3), expect.any(Number)]);
  expect(vy).toBeGreaterThan(0);
  const rect = canvas.getBoundingClientRect();
  for (const svg of root.querySelectorAll<SVGSVGElement>(".stage > svg")) {
    // A point of the sheet stands on the screen where the canvas draws it.
    const matrix = svg.getScreenCTM();
    expect(matrix?.a).toBeCloseTo(k, 6);
    expect(matrix?.d).toBeCloseTo(k, 6);
    expect(matrix?.e).toBeCloseTo(rect.left - vx * k, 3);
    expect(matrix?.f).toBeCloseTo(rect.top - vy * k, 3);
  }
});

test("in a page that runs right to left, by a style or by dir, the zoomed statement keeps the element's direction, and by dir, as the row's icons go (R46), Left stands left of Right", async () => {
  for (const runs of ["style", "dir"] as const) {
    const parent = document.createElement("div");
    if (runs === "style") parent.style.direction = "rtl";
    else parent.dir = "rtl";
    document.body.append(parent);
    const { element, root, viewport } = await placed(made, 400, 300, {
      parent,
      task: sheetTask({ statement: [{ text: "A line of the statement." }] }),
    });
    await zoomTo(element, 2);
    const statement = root.querySelector(".statement");
    if (!statement) throw new Error("no statement");
    expect(getComputedStyle(statement).direction).toBe("rtl");
    // The container runs left to right, from the sheet's left.
    expect(getComputedStyle(viewport).direction).toBe("ltr");
    expect(viewport.scrollLeft).toBe(0);
    const left = button(element, "Left").getBoundingClientRect();
    const right = button(element, "Right").getBoundingClientRect();
    if (runs === "dir") expect(left.right).toBeLessThanOrEqual(right.left);
    await zoomTo(element, 1);
  }
});
