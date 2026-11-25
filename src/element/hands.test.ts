import { afterEach, beforeEach, expect, test } from "vitest";
import { SLOP_PX } from "../core/hands.js";
import type { HistoryEvent } from "../core/history.js";
import type { View } from "../core/screen.js";
import { sheetTask } from "../core/tasks.fixture.js";
import "./index.js";
import { budget } from "../core/budget.fixture.js";
import type { HistoryChange, Task } from "./index.js";
import { labelsFor } from "./labels.js";
import {
  at,
  devtools,
  type Finger,
  input,
  placed,
  settle,
  spacer,
  touches,
} from "./pointer.fixture.js";
import { probe } from "./probe.js";
import { PEN_MODE } from "./session.js";

// Input on a tablet in Chromium: a pen, fingers and a palm, through the DevTools protocol as
// the browser gives them — the pen mode they put the page in, which no button of the bar turns off,
// one finger in pen mode dragging the sheet, and two fingers scrolling the sheet or the page.
// The bar stands over the sheet's left edge, so the pointers here come down to the right of it.

const made: HTMLElement[] = [];
beforeEach(() => {
  // A device with touch: Chrome Headless Shell says it has none, though it takes touches.
  Object.defineProperty(navigator, "maxTouchPoints", { value: 5, configurable: true });
});
afterEach(async () => {
  // A test that failed with fingers down lifts them.
  await touches("touchCancel", []).catch(() => {});
  for (const element of made.splice(0)) element.remove();
  PEN_MODE.on = false;
  Reflect.deleteProperty(navigator, "maxTouchPoints");
  window.scrollTo(0, 0);
});

/** A sheet `width` CSS pixels wide, as tall as its statement and sheet unless given a height. */
async function sheet(
  width = 400,
  height?: number,
  options: { parent?: HTMLElement; task?: Task } = {},
) {
  return placed(made, width, height, options);
}

/** The labels of the bar's buttons it shows, in their order. */
const shownButtons = (row: HTMLElement) =>
  [...row.querySelectorAll("button")]
    .filter((each) => !each.hidden)
    .map((each) => each.textContent);

/** A stroke of a pen, through the DevTools protocol, from one point of the sheet to another. */
async function pen(canvas: HTMLCanvasElement, view: () => View, from: number[], to: number[]) {
  const [x0 = 0, y0 = 0] = from;
  const [x1 = 0, y1 = 0] = to;
  await input("mousePressed", at(canvas, view(), x0, y0), { pointerType: "pen", force: 0.5 });
  await input("mouseMoved", at(canvas, view(), x1, y1), { pointerType: "pen", force: 0.5 });
  await input("mouseReleased", at(canvas, view(), x1, y1), { pointerType: "pen", force: 0 });
}

/** A finger on a point of the sheet: a fingertip unless given a radius. */
function fingerAt(
  id: number,
  canvas: HTMLCanvasElement,
  view: View,
  x: number,
  y: number,
  radius = 10,
): Finger {
  return { id, ...at(canvas, view, x, y), radius };
}

/** Fingers moved by `dy` CSS pixels down the screen, each from where it is. */
const moved = (fingers: readonly Finger[], dy: number): Finger[] =>
  fingers.map((each) => ({ ...each, clientY: each.clientY + dy }));

/** A finger's stroke: down at a point of the sheet, along to the right in steps, and up. */
async function swipe(canvas: HTMLCanvasElement, view: () => View, x: number, y: number) {
  const finger = fingerAt(1, canvas, view(), x, y);
  await touches("touchStart", [finger]);
  for (let step = 1; step <= 4; step++) {
    await touches("touchMove", [{ ...finger, clientX: finger.clientX + 10 * step }]);
  }
  await touches("touchEnd", []);
}

/**
 * Two fingers that come down together in the middle of the sheet's visible part, or the first of
 * them `alone`, and go `dy` CSS pixels down the screen in five steps, lifting at the end unless
 * told to stay.
 */
async function twoFingers(
  viewport: HTMLElement,
  dy: number,
  { stay = false, alone = false }: { stay?: boolean; alone?: boolean } = {},
): Promise<Finger[]> {
  const box = viewport.getBoundingClientRect();
  const top = Math.max(box.top, 0);
  const bottom = Math.min(box.bottom, window.innerHeight);
  const one = { id: 1, clientX: box.left + box.width / 3, clientY: (top + bottom) / 2 };
  const two = { ...one, id: 2, clientX: one.clientX + 60 };
  // The second finger 10 ms after the first by the events' own times, well within PAIR_MS: a frame
  // between the two on a loaded runner may take longer than that by the clock.
  const down = Date.now() / 1000;
  const fingers = alone ? [one] : [one, two];
  await touches("touchStart", [one], down);
  if (!alone) await touches("touchStart", fingers, down + 0.01);
  let now = fingers;
  for (let step = 1; step <= 5; step++) {
    now = moved(fingers, (dy * step) / 5);
    await touches("touchMove", now);
  }
  if (!stay) await touches("touchEnd", []);
  return now;
}

const ids = (element: HTMLElement) => probe(element).strokes.map((each) => each.id);
const roles = (element: HTMLElement) => [...probe(element).roles.values()].sort();

test.runIf(devtools)(
  "a pen's touch puts the page in pen mode: a finger then writes nothing, and a mouse writes as before",
  {
    timeout: budget(803),
  },
  async () => {
    const { element, canvas, view } = await sheet();
    await swipe(canvas, view, 300, 100);
    expect(ids(element)).toEqual([1]);
    expect(probe(element).strokes[0]?.kind).toBe("touch");
    expect(PEN_MODE.on).toBe(false);
    await pen(canvas, view, [300, 300], [600, 300]);
    expect(PEN_MODE.on).toBe(true);
    expect(ids(element)).toEqual([1, 2]);
    await swipe(canvas, view, 300, 500);
    expect(ids(element)).toEqual([1, 2]);
    await input("mousePressed", at(canvas, view(), 300, 700));
    await input("mouseMoved", at(canvas, view(), 500, 700));
    await input("mouseReleased", at(canvas, view(), 500, 700));
    expect(ids(element)).toEqual([1, 2, 3]);
  },
);

test.runIf(devtools)(
  "pen mode stays on till the page goes: no button of the bar comes with it or turns it off, in the element's language too, and a finger writes nothing after the pen",
  {
    timeout: budget(775),
  },
  async () => {
    const { element, canvas, row, view } = await sheet();
    const before = shownButtons(row);
    expect(before).not.toContain("Draw with finger");
    // While the pen writes, and after it, the bar stays as it is.
    await input("mousePressed", at(canvas, view(), 300, 300), { pointerType: "pen", force: 0.5 });
    await settle();
    expect(PEN_MODE.on).toBe(true);
    expect(shownButtons(row)).toEqual(before);
    await input("mouseReleased", at(canvas, view(), 300, 300), { pointerType: "pen", force: 0 });
    await settle();
    expect(PEN_MODE.on).toBe(true);
    expect(shownButtons(row)).toEqual(before);
    element.lang = "ru";
    await settle();
    const russian = labelsFor("ru").labels;
    expect(shownButtons(row)).toEqual([
      russian.pen,
      russian.eraser,
      russian.select,
      russian.hand,
      russian.undo,
      russian.redo,
      russian.clear,
      russian.zoomIn,
      russian.zoomOut,
    ]);
    await swipe(canvas, view, 300, 500);
    await pen(canvas, view, [300, 700], [500, 700]);
    expect(PEN_MODE.on).toBe(true);
    expect(probe(element).strokes.map((each) => each.kind)).toEqual(["pen", "pen"]);
  },
);

test.runIf(devtools)(
  "pen mode is the page's: a second sheet is in it as well, and a finger writes on neither",
  async () => {
    const one = await sheet();
    const two = await sheet();
    await pen(one.canvas, one.view, [300, 300], [600, 300]);
    expect(PEN_MODE.on).toBe(true);
    await swipe(two.canvas, two.view, 300, 500);
    await swipe(one.canvas, one.view, 300, 500);
    expect([ids(one.element), ids(two.element)]).toEqual([[1], []]);
  },
);

test.runIf(devtools)(
  "pen mode moves no sheet when it comes: the bars of the page stay as they were, and so do the sheets",
  async () => {
    // Each of a height of its own, so that both stand in the window, past the page as they go.
    const above = await sheet(400, 300);
    const below = await sheet(400, 300);
    const sheets = [above, below];
    const boxes = () =>
      sheets.map(({ element, canvas, row }) => [
        canvas.getBoundingClientRect().top,
        element.getBoundingClientRect().height,
        row.getBoundingClientRect().height,
      ]);
    const before = boxes();
    const options = { pointerType: "pen", force: 0.5 } as const;
    await input("mousePressed", at(below.canvas, below.view(), 300, 300), options);
    await settle();
    await input("mouseMoved", at(below.canvas, below.view(), 600, 300), options);
    await settle();
    expect(boxes()).toEqual(before);
    await input("mouseReleased", at(below.canvas, below.view(), 600, 300), {
      ...options,
      force: 0,
    });
    await settle();
    expect(PEN_MODE.on).toBe(true);
    expect(boxes()).toEqual(before);
  },
);

test.runIf(devtools)(
  "in pen mode one finger that drags up the sheet scrolls its container down by the drag past the slop, writing nothing and telling no historychange; a pen's drag writes and scrolls nothing, and without pen mode a finger writes",
  {
    timeout: budget(1_000),
  },
  async () => {
    const { element, canvas, viewport, view } = await sheet(400, 300);
    const told: HistoryChange[] = [];
    element.addEventListener("historychange", (event) => told.push(event.detail));
    PEN_MODE.on = true;
    await twoFingers(viewport, -60, { alone: true });
    await settle();
    expect(viewport.scrollTop).toBeCloseTo(60 - SLOP_PX, 0);
    expect(view().vy).toBeCloseTo(viewport.scrollTop / view().k, 3);
    expect([ids(element), told, probe(element).roles.size]).toEqual([[], [], 0]);
    // A pen's drag up the visible part writes, and the sheet stays.
    const scrolled = viewport.scrollTop;
    const { vy } = view();
    await pen(canvas, view, [300, vy + 500], [300, vy + 200]);
    await settle();
    expect(viewport.scrollTop).toBe(scrolled);
    expect([ids(element), told.length]).toEqual([[1], 1]);
    // Out of pen mode, as a new page starts, one writes again, and drags nothing.
    PEN_MODE.on = false;
    await twoFingers(viewport, -60, { alone: true });
    await settle();
    expect(viewport.scrollTop).toBe(scrolled);
    expect(probe(element).strokes.map((each) => each.kind)).toEqual(["pen", "touch"]);
    expect(told.length).toBe(2);
  },
);

test.runIf(devtools)(
  "a palm writes nothing; a finger that grows into a palm, or that the device cancels, loses its stroke with no historychange, and its ID stays used",
  {
    timeout: budget(1_132),
  },
  async () => {
    const { element, canvas, view } = await sheet();
    const told: HistoryChange[] = [];
    element.addEventListener("historychange", (event) => told.push(event.detail));
    const palm = fingerAt(1, canvas, view(), 300, 300, 60);
    await touches("touchStart", [palm]);
    await touches("touchMove", moved([palm], 30));
    await touches("touchEnd", []);
    expect(probe(element).live).toBeUndefined();
    expect(ids(element)).toEqual([]);
    // A fingertip that grows: the stroke it began goes.
    const growing = fingerAt(1, canvas, view(), 300, 500);
    await touches("touchStart", [growing]);
    await touches("touchMove", moved([growing], 20));
    expect(probe(element).live).toBeDefined();
    await touches("touchMove", moved([{ ...growing, radius: 60 }], 40));
    expect(probe(element).live).toBeUndefined();
    await touches("touchMove", moved([growing], 60));
    await touches("touchEnd", []);
    // A touch the device takes for an accident.
    const cancelled = fingerAt(1, canvas, view(), 300, 700);
    await touches("touchStart", [cancelled]);
    await touches("touchMove", moved([cancelled], 20));
    await touches("touchCancel", []);
    expect(probe(element).live).toBeUndefined();
    expect(told).toEqual([]);
    await swipe(canvas, view, 300, 900);
    expect(ids(element)).toEqual([3]);
  },
);

test.runIf(devtools)(
  "two fingers scroll the sheet of an element with a height by their travel past the slop, and the view follows",
  {
    timeout: budget(901),
  },
  async () => {
    const { element, viewport, view } = await sheet(400, 300);
    const k = view().k;
    await twoFingers(viewport, -60);
    await settle();
    expect(viewport.scrollTop).toBeCloseTo(60 - SLOP_PX, 0);
    expect(view().vy).toBeCloseTo(viewport.scrollTop / k, 3);
    // The first finger's stroke went when the second came.
    expect(ids(element)).toEqual([]);
    await twoFingers(viewport, 30);
    expect(viewport.scrollTop).toBeCloseTo(60 - SLOP_PX - (30 - SLOP_PX), 0);
  },
);

test.runIf(devtools)(
  "without a height two fingers scroll the page, and a gesture keeps what it began to scroll: the container at its end hands on at the next gesture",
  {
    timeout: budget(1_451),
  },
  async () => {
    const free = await sheet(400);
    spacer(made);
    await twoFingers(free.viewport, -100);
    expect(window.scrollY).toBeCloseTo(100 - SLOP_PX, 0);
    for (const each of made.splice(0)) each.remove();
    window.scrollTo(0, 0);

    const held = await sheet(400, 300);
    spacer(made);
    const end = held.viewport.scrollHeight - held.viewport.clientHeight;
    held.viewport.scrollTop = end - 20;
    await settle();
    await twoFingers(held.viewport, -100);
    expect(held.viewport.scrollTop).toBeCloseTo(end, 0);
    expect(window.scrollY).toBe(0);
    await twoFingers(held.viewport, -100);
    expect(window.scrollY).toBeCloseTo(100 - SLOP_PX, 0);
    expect(held.viewport.scrollTop).toBeCloseTo(end, 0);
  },
);

test.runIf(devtools)(
  "a second finger soon after the first takes its stroke away, and one after the window or after the first went past the slop leaves the stroke be",
  {
    timeout: budget(1_067),
  },
  async () => {
    const { element, canvas, view } = await sheet();
    // The events' own times, from a moment ahead of the page's clock.
    let clock = Date.now() / 1000 + 1;
    const after = (ms: number) => {
      clock += ms / 1000;
      return clock;
    };
    const one = fingerAt(1, canvas, view(), 200, 300);
    const two = { ...one, id: 2, clientX: one.clientX + 60 };
    await touches("touchStart", [one], after(0));
    await touches("touchStart", [one, two], after(100));
    await touches("touchMove", moved([one, two], 30), after(10));
    await touches("touchEnd", [], after(10));
    expect(ids(element)).toEqual([]);

    const late = fingerAt(1, canvas, view(), 200, 600);
    await touches("touchStart", [late], after(500));
    await touches("touchStart", [late, { ...late, id: 2, clientX: late.clientX + 60 }], after(200));
    await touches("touchMove", [{ ...late, clientX: late.clientX + 40 }], after(10));
    await touches("touchEnd", [], after(10));
    expect(ids(element)).toEqual([2]);

    const far = fingerAt(1, canvas, view(), 200, 900);
    await touches("touchStart", [far], after(500));
    const gone = { ...far, clientX: far.clientX + SLOP_PX + 10 };
    await touches("touchMove", [gone], after(30));
    await touches("touchStart", [gone, { ...far, id: 2, clientX: far.clientX + 80 }], after(30));
    await touches("touchMove", [{ ...gone, clientX: gone.clientX + 20 }], after(10));
    await touches("touchEnd", [], after(10));
    expect(ids(element)).toEqual([2, 3]);
  },
);

test.runIf(devtools)(
  "a third finger does nothing, and when one of the two lifts the other does nothing until it lifts",
  async () => {
    const { element, viewport } = await sheet(400, 300);
    PEN_MODE.on = true;
    const [one, two] = await twoFingers(viewport, -30, { stay: true });
    if (one === undefined || two === undefined) throw new Error("no fingers");
    const scrolled = viewport.scrollTop;
    expect(scrolled).toBeCloseTo(30 - SLOP_PX, 0);
    const three = { ...one, id: 3, clientX: one.clientX + 120 };
    await touches("touchStart", [one, two, three]);
    expect(roles(element)).toEqual(["idle", "scrolls", "scrolls"]);
    await touches("touchEnd", [one]);
    expect(roles(element)).toEqual(["idle", "idle"]);
    await touches("touchMove", moved([two, three], -40));
    await settle();
    expect(viewport.scrollTop).toBe(scrolled);
    await touches("touchEnd", []);
    expect(probe(element).roles.size).toBe(0);
  },
);

test.runIf(devtools)(
  "a pen takes a finger's stroke away and ends a scroll, and a touch down during its stroke does nothing after it",
  {
    timeout: budget(786),
  },
  async () => {
    // Tall enough for the pen at 400: the bar over the sheet takes none of its height.
    const { element, canvas, viewport, view } = await sheet(400, 400);
    const finger = fingerAt(1, canvas, view(), 200, 200);
    await touches("touchStart", [finger]);
    await touches("touchMove", moved([finger], 20));
    expect(probe(element).live?.kind).toBe("touch");
    await input("mousePressed", at(canvas, view(), 500, 200), { pointerType: "pen", force: 0.5 });
    expect(probe(element).live?.kind).toBe("pen");
    await input("mouseMoved", at(canvas, view(), 700, 200), { pointerType: "pen", force: 0.5 });
    await input("mouseReleased", at(canvas, view(), 700, 200), { pointerType: "pen", force: 0 });
    await touches("touchMove", moved([finger], 60));
    await touches("touchEnd", []);
    expect(probe(element).strokes.map((each) => each.kind)).toEqual(["pen"]);

    // In pen mode now, two fingers scroll until a pen comes down.
    const [one, two] = await twoFingers(viewport, -30, { stay: true });
    if (one === undefined || two === undefined) throw new Error("no fingers");
    const scrolled = viewport.scrollTop;
    await input("mousePressed", at(canvas, view(), 500, 400), { pointerType: "pen", force: 0.5 });
    await touches("touchMove", moved([one, two], -50));
    await input("mouseReleased", at(canvas, view(), 500, 400), { pointerType: "pen", force: 0 });
    await settle();
    expect(viewport.scrollTop).toBe(scrolled);
    expect(roles(element)).toEqual(["idle", "idle"]);
    await touches("touchEnd", []);
  },
);

test.runIf(devtools)(
  "under a scaled ancestor two fingers scroll the sheet by their travel on the screen, the scale taken out",
  async () => {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "transform: scale(1.5); transform-origin: 0 0;";
    document.body.append(wrapper);
    const { viewport } = await sheet(400, 300, { parent: wrapper });
    await twoFingers(viewport, -60);
    expect(viewport.scrollTop).toBeCloseTo((60 - SLOP_PX) / 1.5, 0);
  },
);

test.runIf(devtools)(
  "a history given while two fingers scroll lets them go on, and a sheet taken off the page and back keeps no gesture",
  {
    timeout: budget(867),
  },
  async () => {
    const { element, viewport } = await sheet(400, 300);
    PEN_MODE.on = true;
    const [one, two] = await twoFingers(viewport, -20, { stay: true });
    if (one === undefined || two === undefined) throw new Error("no fingers");
    const stroke: HistoryEvent = {
      kind: "write",
      t: 0,
      stroke: { id: 1, kind: "pen", points: [{ x: 10, y: 10, t: 0, p: 0.5 }] },
    };
    element.history = [stroke];
    // The fingers go 40 on from the 20 they had gone.
    await touches("touchMove", moved([one, two], -40));
    expect(viewport.scrollTop).toBeCloseTo(60 - SLOP_PX, 0);
    element.remove();
    expect(probe(element).roles.size).toBe(0);
    document.body.append(element);
    await settle();
    await touches("touchMove", moved([one, two], -80));
    await touches("touchEnd", []);
    expect(probe(element).roles.size).toBe(0);
    const before = viewport.scrollTop;
    await twoFingers(viewport, -30);
    expect(viewport.scrollTop).toBeCloseTo(before + 30 - SLOP_PX, 0);
  },
);

test.runIf(devtools)(
  "with the consumer's pointer-events: none two fingers start no scroll, and one finger on the statement scrolls it as the browser does",
  {
    timeout: budget(1_166),
  },
  async () => {
    const task = sheetTask({
      statement: [{ text: "Write the numbers from one to twenty, one under another. ".repeat(4) }],
    });
    const { element, root, viewport } = await sheet(400, 300, { task });
    element.style.pointerEvents = "none";
    await twoFingers(viewport, -60);
    await settle();
    expect(viewport.scrollTop).toBe(0);
    element.style.pointerEvents = "";
    // On the statement the browser scrolls by itself.
    const statement = root.querySelector(".statement")?.getBoundingClientRect();
    if (statement === undefined) throw new Error("no statement");
    // To the right of the bar, whose glass scrolls itself, and nothing beyond it.
    const on = { id: 1, clientX: statement.left + 150, clientY: statement.top + 20 };
    await touches("touchStart", [on]);
    for (let step = 1; step <= 10; step++) {
      await touches("touchMove", [{ ...on, clientY: on.clientY - 10 * step }]);
    }
    await touches("touchEnd", []);
    await settle();
    expect(viewport.scrollTop).toBeGreaterThan(0);
    expect(probe(element).strokes).toEqual([]);
  },
);

test("a pointer that comes down again under its ID lands the stroke it lost on its way up, and writes anew", async () => {
  const { element, canvas, view } = await sheet();
  const mouse = { pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true };
  const send = (type: string, x: number, y: number, init: PointerEventInit) =>
    canvas.dispatchEvent(
      new PointerEvent(type, { ...mouse, ...at(canvas, view(), x, y), ...init }),
    );
  send("pointerdown", 100, 100, { button: 0, buttons: 1, pressure: 0.5 });
  send("pointermove", 300, 100, { button: -1, buttons: 1, pressure: 0.5 });
  // Its pointerup is lost: it comes down again somewhere else.
  send("pointerdown", 100, 400, { button: 0, buttons: 1, pressure: 0.5 });
  expect(ids(element)).toEqual([1]);
  expect(probe(element).strokes[0]?.points.at(-1)?.x).toBeCloseTo(300, 0);
  send("pointermove", 300, 400, { button: -1, buttons: 1, pressure: 0.5 });
  send("pointerup", 300, 400, { button: 0, buttons: 0, pressure: 0 });
  expect(ids(element)).toEqual([1, 2]);
  expect(probe(element).roles.size).toBe(0);
});

test("a pen that comes down while another pen is down lands that one's stroke where it was, and writes, a finger in pen mode still does not, and the hand lets the lost pen go", async () => {
  const { element, canvas, view } = await sheet();
  const send = (pointerId: number, kind: string, type: string, x: number, y: number) => {
    const down = type !== "pointerup";
    canvas.dispatchEvent(
      new PointerEvent(type, {
        pointerId,
        pointerType: kind,
        isPrimary: true,
        bubbles: true,
        button: type === "pointermove" ? -1 : 0,
        buttons: down ? 1 : 0,
        pressure: down ? 0.5 : 0,
        ...at(canvas, view(), x, y),
      }),
    );
  };
  send(5, "pen", "pointerdown", 100, 100);
  send(5, "pen", "pointermove", 300, 100);
  // The system took the pen's touch, and nothing of its lift came: the next touch of the pen comes
  // under another ID.
  send(6, "pen", "pointerdown", 100, 400);
  expect(ids(element)).toEqual([1]);
  expect(probe(element).strokes[0]?.points.at(-1)?.x).toBeCloseTo(300, 0);
  send(6, "pen", "pointermove", 300, 400);
  send(6, "pen", "pointerup", 300, 400);
  expect(ids(element)).toEqual([1, 2]);
  expect(probe(element).roles.size).toBe(0);
  // A late lift of the first takes nothing, and a finger writes nothing in pen mode.
  send(5, "pen", "pointerup", 300, 100);
  send(7, "touch", "pointerdown", 100, 600);
  send(7, "touch", "pointermove", 300, 600);
  send(7, "touch", "pointerup", 300, 600);
  expect(ids(element)).toEqual([1, 2]);

  // A pen that moves the sheet by the hand and loses its way up lets go when the pen comes again.
  element.tool = "hand";
  send(8, "pen", "pointerdown", 100, 100);
  send(9, "pen", "pointerdown", 100, 100);
  send(9, "pen", "pointerup", 100, 100);
  // The new pen took the hand over: the sheet is no longer held, so a third press takes it again.
  send(10, "mouse", "pointerdown", 100, 100);
  send(10, "mouse", "pointerup", 100, 100);
  expect(canvas.closest(".sheet")?.classList.contains("panning")).toBe(false);
});

test.runIf(devtools)(
  "a pen that came down writing nothing and lifted beyond the element leaves the hands nothing",
  async () => {
    const { element, canvas, view } = await sheet();
    const barrel = {
      pointerType: "pen" as const,
      force: 0.5,
      button: "right" as const,
      buttons: 2,
    };
    await input("mousePressed", at(canvas, view(), 300, 300), barrel);
    expect(probe(element).live).toBeUndefined();
    expect(probe(element).roles.size).toBe(1);
    const beyond = { clientX: canvas.getBoundingClientRect().right + 50, clientY: 20 };
    await input("mouseMoved", beyond, barrel);
    await input("mouseReleased", beyond, { ...barrel, buttons: 0 });
    expect(probe(element).roles.size).toBe(0);
  },
);

test.runIf(devtools)(
  "two fingers scroll no page that hides its overflow, and the page whose body's overflow is the viewport's",
  {
    timeout: budget(893),
  },
  async () => {
    const { viewport } = await sheet(400);
    spacer(made);
    const root = document.documentElement;
    try {
      root.style.overflow = "hidden";
      await twoFingers(viewport, -100);
      expect(window.scrollY).toBe(0);
      root.style.overflow = "";
      // With the root's overflow visible, the body's is the viewport's, and the page scrolls.
      document.body.style.overflowY = "auto";
      await twoFingers(viewport, -100);
      expect(window.scrollY).toBeCloseTo(100 - SLOP_PX, 0);
    } finally {
      root.style.overflow = "";
      document.body.style.overflowY = "";
    }
  },
);
