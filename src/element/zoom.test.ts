import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { budget } from "../core/budget.fixture.js";
import { SLOP_PX } from "../core/hands.js";
import { sheetTask } from "../core/tasks.fixture.js";
import { ZOOM_MAX, ZOOM_MIN } from "../core/zoom.js";
import {
  buttonOf,
  devtools,
  level,
  placed,
  settle,
  sheetWork,
  touches,
} from "./pointer.fixture.js";
import { probe } from "./probe.js";
import { PAGE_ZOOM, PEN_MODE } from "./session.js";

// The page's zoom of the sheet in a browser: Zoom in and Zoom out step it by quarters from
// half the page's fit to twice it, for every sheet of the page, about the middle of what is in
// sight, and two fingers pinch it about their middle. The canvas stays as small as the container,
// the statement as wide as the fit, and the input and the work for checking in units of the sheet.

const made: HTMLElement[] = [];
afterEach(async () => {
  await touches("touchCancel", []).catch(() => {});
  for (const element of made.splice(0)) element.remove();
  // The zoom is the page's: the next test starts at the fit.
  PAGE_ZOOM.set(1);
  PEN_MODE.on = false;
});

/** The page's zoom stepped to `zoom` with an element's Zoom in or Zoom out, laid out and drawn. */
async function zoomTo(element: HTMLElement, zoom: number): Promise<void> {
  while (PAGE_ZOOM.value !== zoom) {
    buttonOf(element, PAGE_ZOOM.value < zoom ? "Zoom in" : "Zoom out").click();
  }
  await settle();
}

/** What `aria-disabled` says of each button: "true" while it stands unavailable. */
const unavailable = (element: HTMLElement, ...names: string[]) =>
  names.map((name) => buttonOf(element, name).getAttribute("aria-disabled"));

test.each([
  { width: 400, zoom: 2 },
  { width: 400, zoom: 0.5 },
  { width: 1400, zoom: 1.5 },
  { width: 1400, zoom: 0.75 },
])(
  "at $width CSS px and $zoom the sheet is the page's fit times the zoom, the canvas no larger than the container, and the statement as wide as the fit",
  async ({ width, zoom }) => {
    const { element, root, canvas, viewport, view } = await placed(made, width, 300);
    const fit = Math.min(width, 1000) / 1000;
    expect(view().k).toBeCloseTo(fit, 6);
    expect(unavailable(element, "Zoom in", "Zoom out")).toEqual([null, null]);
    await zoomTo(element, zoom);
    expect(view().k).toBeCloseTo(fit * zoom, 6);
    const shown = canvas.getBoundingClientRect();
    expect(shown.width).toBeLessThanOrEqual(viewport.clientWidth + 0.5);
    expect(shown.height).toBeLessThanOrEqual(viewport.clientHeight + 0.5);
    expect(canvas.width).toBe(Math.round(shown.width * devicePixelRatio));
    // There is always room past the page to move to: across, and down twice a view.
    expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);
    const statement = root.querySelector<HTMLElement>(".statement");
    if (statement && statement.getBoundingClientRect().width > 0) {
      expect(statement.getBoundingClientRect().width).toBeCloseTo(fit * 1000, 0);
    }
    expect(unavailable(element, "Zoom in", "Zoom out")).toEqual([
      zoom === ZOOM_MAX ? "true" : null,
      zoom === ZOOM_MIN ? "true" : null,
    ]);
  },
);

test("the buttons step by quarters to both ends, from the keyboard too, and a press at an end does nothing and keeps the focus", async () => {
  const { element } = await placed(made, 400, 300);
  buttonOf(element, "Zoom out").focus();
  await userEvent.keyboard("{Enter}{Enter}{Enter}");
  await settle();
  expect(PAGE_ZOOM.value).toBe(ZOOM_MIN);
  expect(element.shadowRoot?.activeElement).toBe(buttonOf(element, "Zoom out"));
  expect(unavailable(element, "Zoom out")).toEqual(["true"]);
  buttonOf(element, "Zoom in").focus();
  await userEvent.keyboard("{Enter}".repeat(8));
  await settle();
  expect(PAGE_ZOOM.value).toBe(ZOOM_MAX);
  expect(unavailable(element, "Zoom in", "Zoom out")).toEqual(["true", null]);
});

test("a press keeps the point of the sheet in the middle of what is in sight where it was", async () => {
  const { element, viewport, view } = await placed(made, 400, 300);
  viewport.scrollTop = 200;
  viewport.scrollLeft = 100;
  await settle();
  const middle = () => {
    const { k, vx, vy } = view();
    return { x: vx + viewport.clientWidth / 2 / k, y: vy + viewport.clientHeight / 2 / k };
  };
  const before = middle();
  for (const zoom of [1.5, 2, 0.75]) {
    await zoomTo(element, zoom);
    expect(middle().x).toBeCloseTo(before.x, -1);
    expect(middle().y).toBeCloseTo(before.y, -1);
  }
});

test("a zoom out at the sheet's edge, where the scroll stops short, and back in comes back where it was, and a scroll between sets a new middle", async () => {
  const { element, viewport, view } = await placed(made, 400, 300);
  viewport.scrollTop = 40;
  viewport.scrollLeft = 30;
  await settle();
  const middle = () => {
    const { k, vx, vy } = view();
    return { x: vx + viewport.clientWidth / 2 / k, y: vy + viewport.clientHeight / 2 / k };
  };
  const before = middle();
  await zoomTo(element, 0.5);
  // Half the fit would need the scroll past the sheet's left: it stops at it.
  expect(viewport.scrollLeft).toBe(0);
  await zoomTo(element, 1);
  expect(viewport.scrollLeft).toBeCloseTo(30, 0);
  expect(viewport.scrollTop).toBeCloseTo(40, 0);
  await zoomTo(element, 0.5);
  viewport.scrollLeft = 0;
  viewport.scrollTop = 10;
  await settle();
  const moved = middle();
  await zoomTo(element, 1);
  expect(middle().x).toBeCloseTo(moved.x, -1);
  expect(middle().y).toBeCloseTo(moved.y, -1);
  expect(before.x).not.toBeCloseTo(moved.x, -1);
});

test("a stroke on a zoomed sheet lands in sheet units, and the work for checking is the same at any zoom", async () => {
  const { element, canvas, view } = await placed(made, 400, 300);
  await zoomTo(element, 2);
  level(canvas, view(), 100, 100, 300);
  await settle();
  const [stroke] = probe(element).strokes;
  for (const point of stroke?.points ?? []) {
    expect(point.y).toBeCloseTo(100, 3);
    expect(point.x).toBeGreaterThanOrEqual(100 - 1e-6);
    expect(point.x).toBeLessThanOrEqual(300 + 1e-6);
  }
  const zoomed = await sheetWork(element);
  await zoomTo(element, 0.5);
  const small = await sheetWork(element);
  expect(small.submission).toEqual(zoomed.submission);
  expect(new Uint8Array(await small.png.arrayBuffer())).toEqual(
    new Uint8Array(await zoomed.png.arrayBuffer()),
  );
});

test("a dot of the grid is 3 px across at the fit and above it, and smaller by the zoom below it", async () => {
  const { element, root } = await placed(made, 400, 300, { task: sheetTask({ grid: "dots" }) });
  const dots = [...root.querySelectorAll<SVGPathElement>(".grid")];
  // The sheet's grid, the dot of its pattern's tile, and the bands above and below it.
  expect(dots).toHaveLength(4);
  const across = () => dots.map((dot) => getComputedStyle(dot).strokeWidth);
  for (const [zoom, width] of [
    [1, "3px"],
    [2, "3px"],
    [0.75, "2.25px"],
    [0.5, "1.5px"],
  ] as const) {
    await zoomTo(element, zoom);
    expect(dots.every((dot) => dot.classList.contains("dots"))).toBe(true);
    expect(across()).toEqual([width, width, width, width]);
  }
});

test("the zoom is the page's: a press on one sheet lays out the other, and a new one takes it", async () => {
  const one = await placed(made, 400, 300);
  const two = await placed(made, 400, 300);
  await zoomTo(one.element, 1.5);
  expect(two.view().k).toBeCloseTo(0.6, 6);
  const three = await placed(made, 400, 300);
  expect(three.view().k).toBeCloseTo(0.6, 6);
  expect(unavailable(three.element, "Zoom in", "Zoom out")).toEqual([null, null]);
});

test.runIf(devtools)(
  "two fingers drawn apart zoom the sheet by the span's ratio past the slop, about their middle",
  { timeout: budget(901) },
  async () => {
    const { viewport, view } = await placed(made, 400, 300);
    PEN_MODE.on = true;
    const box = viewport.getBoundingClientRect();
    const y = box.top + 150;
    const middle = box.left + 200;
    const pair = (half: number) => [
      { id: 1, clientX: middle - half, clientY: y },
      { id: 2, clientX: middle + half, clientY: y },
    ];
    const { k, vx } = view();
    const under = vx + 200 / k;
    const now = Date.now() / 1000;
    await touches("touchStart", pair(40), now);
    // The last step 20 px a finger, past twice the slop: a browser tells the two fingers' moves
    // one by one, and the middle between them, half a step aside, must not scroll the sheet.
    for (const [i, half] of [44, 52, 60, 80].entries()) {
      await touches("touchMove", pair(half), now + 0.02 * (i + 1));
    }
    await touches("touchEnd", []);
    await settle();
    // From the slop on: 160 over 80 + SLOP_PX.
    expect(PAGE_ZOOM.value).toBeCloseTo(160 / (80 + SLOP_PX), 3);
    // A zoom off the quarters lays the sheet out in fractions of a pixel: k is the fit's times it
    // but for the layout's rounding.
    expect(view().k).toBeCloseTo(0.4 * PAGE_ZOOM.value, 4);
    expect(view().vx + 200 / view().k).toBeCloseTo(under, -1);
  },
);
