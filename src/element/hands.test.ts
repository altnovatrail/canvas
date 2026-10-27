import { afterEach, beforeEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { SLOP_PX } from "../core/hands.js";
import type { HistoryEvent } from "../core/history.js";
import type { View } from "../core/screen.js";
import { sheetTask } from "../core/tasks.fixture.js";
import "./index.js";
import type { HistoryChange, Task } from "./index.js";
import { labelsFor } from "./labels.js";
import { at, type Finger, input, placed, settle, touches } from "./pointer.fixture.js";
import { probe } from "./probe.js";
import { PEN_MODE } from "./session.js";

// Input on a tablet in Chromium (R29): a pen, fingers and a palm, through the DevTools protocol as
// the browser gives them — the pen mode they put the page in, the finger's button in the row, and
// two fingers scrolling the sheet or the page.

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

/** A sheet `width` CSS pixels wide, as tall as its row, statement and sheet unless given a height. */
async function sheet(
  width = 400,
  height?: number,
  options: { parent?: HTMLElement; task?: Task } = {},
) {
  const parts = await placed(made, width, height, options);
  const finger = parts.row.querySelectorAll("button")[4];
  if (finger === undefined) throw new Error("the row has no finger's button");
  return { ...parts, finger };
}

/** A page taller than the screen, which scrolls the element. */
function spacer(): void {
  const rest = document.createElement("div");
  rest.style.height = "2000px";
  document.body.append(rest);
  made.push(rest);
}

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
 * Two fingers that come down together in the middle of the sheet's visible part and go `dy` CSS
 * pixels down the screen in five steps, lifting at the end unless told to stay.
 */
async function twoFingers(
  viewport: HTMLElement,
  dy: number,
  { stay = false }: { stay?: boolean } = {},
): Promise<Finger[]> {
  const box = viewport.getBoundingClientRect();
  const top = Math.max(box.top, 0);
  const bottom = Math.min(box.bottom, window.innerHeight);
  const one = { id: 1, clientX: box.left + box.width / 3, clientY: (top + bottom) / 2 };
  const two = { ...one, id: 2, clientX: one.clientX + 60 };
  await touches("touchStart", [one]);
  await touches("touchStart", [one, two]);
  let now = [one, two];
  for (let step = 1; step <= 5; step++) {
    now = moved([one, two], (dy * step) / 5);
    await touches("touchMove", now);
  }
  if (!stay) await touches("touchEnd", []);
  return now;
}

const ids = (element: HTMLElement) => probe(element).strokes.map((each) => each.id);
const roles = (element: HTMLElement) => [...probe(element).roles.values()].sort();

test("a pen's touch puts the page in pen mode: a finger then writes nothing, and a mouse writes as before", async () => {
  const { element, canvas, view } = await sheet();
  await swipe(canvas, view, 100, 100);
  expect(ids(element)).toEqual([1]);
  expect(probe(element).strokes[0]?.kind).toBe("touch");
  expect(PEN_MODE.on).toBe(false);
  await pen(canvas, view, [100, 300], [400, 300]);
  expect(PEN_MODE.on).toBe(true);
  expect(ids(element)).toEqual([1, 2]);
  await swipe(canvas, view, 100, 500);
  expect(ids(element)).toEqual([1, 2]);
  await input("mousePressed", at(canvas, view(), 100, 700));
  await input("mouseMoved", at(canvas, view(), 300, 700));
  await input("mouseReleased", at(canvas, view(), 300, 700));
  expect(ids(element)).toEqual([1, 2, 3]);
});

test("the finger's button comes when a pen's stroke ends, named in the element's language; pressing it lets a finger write, gives the focus to Pen, and the next pen brings it back", async () => {
  const { element, root, canvas, finger, view } = await sheet();
  const named = () =>
    page.elementLocator(element).getByRole("button", { name: "Draw with finger" });
  expect(finger.hidden).toBe(true);
  // While the pen writes, the row stays as it is.
  await input("mousePressed", at(canvas, view(), 100, 300), { pointerType: "pen", force: 0.5 });
  await settle();
  expect(PEN_MODE.on).toBe(true);
  expect(finger.hidden).toBe(true);
  await input("mouseReleased", at(canvas, view(), 100, 300), { pointerType: "pen", force: 0 });
  await expect.element(named()).toBeVisible();
  element.lang = "ru";
  const russian = labelsFor("ru").labels;
  const pressed = page.elementLocator(element).getByRole("button", { name: russian.finger });
  await userEvent.click(pressed);
  await expect.poll(() => finger.hidden).toBe(true);
  expect(PEN_MODE.on).toBe(false);
  expect(root.activeElement?.textContent).toBe(russian.pen);
  await swipe(canvas, view, 100, 500);
  expect(probe(element).strokes.map((each) => each.kind)).toEqual(["pen", "touch"]);
  await pen(canvas, view, [100, 700], [300, 700]);
  await expect.poll(() => finger.hidden).toBe(false);
});

test("on a device without touch the finger's button never comes, in pen mode too", async () => {
  Reflect.deleteProperty(navigator, "maxTouchPoints");
  const { canvas, finger, view } = await sheet();
  await pen(canvas, view, [100, 300], [400, 300]);
  await settle();
  expect(PEN_MODE.on).toBe(true);
  expect(finger.hidden).toBe(true);
});

test("pen mode is the page's: a second sheet is in it as well, and the button of one takes it off both", async () => {
  const one = await sheet();
  const two = await sheet();
  await pen(one.canvas, one.view, [100, 300], [400, 300]);
  await expect.poll(() => two.finger.hidden).toBe(false);
  expect(one.finger.hidden).toBe(false);
  two.finger.click();
  await expect.poll(() => one.finger.hidden).toBe(true);
  expect(two.finger.hidden).toBe(true);
  await swipe(one.canvas, one.view, 100, 500);
  expect(ids(one.element)).toEqual([1, 2]);
});

test("every row of the page waits for the end of a pen's stroke: the sheet above wraps its row only then, and the sheet below moves only then", async () => {
  const above = await sheet(400);
  const below = await sheet(400);
  const top = below.canvas.getBoundingClientRect().top;
  const options = { pointerType: "pen", force: 0.5 } as const;
  await input("mousePressed", at(below.canvas, below.view(), 100, 300), options);
  await settle();
  await input("mouseMoved", at(below.canvas, below.view(), 300, 300), options);
  await settle();
  // In pen mode now, but the stroke goes on: no row has changed, and the sheet below is where it was.
  expect([above.finger.hidden, below.finger.hidden]).toEqual([true, true]);
  expect(below.canvas.getBoundingClientRect().top).toBe(top);
  await input("mouseReleased", at(below.canvas, below.view(), 300, 300), { ...options, force: 0 });
  await expect.poll(() => above.finger.hidden).toBe(false);
  expect(below.finger.hidden).toBe(false);
  await settle();
  expect(below.canvas.getBoundingClientRect().top).toBeGreaterThan(top);
});

test("a palm writes nothing; a finger that grows into a palm, or that the device cancels, loses its stroke with no historychange, and its ID stays used", async () => {
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
  await swipe(canvas, view, 100, 900);
  expect(ids(element)).toEqual([3]);
});

test("two fingers scroll the sheet of an element with a height by their travel past the slop, and the view follows", async () => {
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
});

test("without a height two fingers scroll the page, and a gesture keeps what it began to scroll: the container at its end hands on at the next gesture", async () => {
  const free = await sheet(400);
  spacer();
  await twoFingers(free.viewport, -100);
  expect(window.scrollY).toBeCloseTo(100 - SLOP_PX, 0);
  for (const each of made.splice(0)) each.remove();
  window.scrollTo(0, 0);

  const held = await sheet(400, 300);
  spacer();
  const end = held.viewport.scrollHeight - held.viewport.clientHeight;
  held.viewport.scrollTop = end - 20;
  await settle();
  await twoFingers(held.viewport, -100);
  expect(held.viewport.scrollTop).toBeCloseTo(end, 0);
  expect(window.scrollY).toBe(0);
  await twoFingers(held.viewport, -100);
  expect(window.scrollY).toBeCloseTo(100 - SLOP_PX, 0);
  expect(held.viewport.scrollTop).toBeCloseTo(end, 0);
});

test("a second finger soon after the first takes its stroke away, and one after the window or after the first went past the slop leaves the stroke be", async () => {
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
});

test("a third finger does nothing, and when one of the two lifts the other does nothing until it lifts", async () => {
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
});

test("a pen takes a finger's stroke away and ends a scroll, and a touch down during its stroke does nothing after it", async () => {
  const { element, canvas, viewport, view } = await sheet(400, 300);
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
});

test("under a scaled ancestor two fingers scroll the sheet by their travel on the screen, the scale taken out", async () => {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "transform: scale(1.5); transform-origin: 0 0;";
  document.body.append(wrapper);
  const { viewport } = await sheet(400, 300, { parent: wrapper });
  await twoFingers(viewport, -60);
  expect(viewport.scrollTop).toBeCloseTo((60 - SLOP_PX) / 1.5, 0);
});

test("a history given while two fingers scroll lets them go on, and a sheet taken off the page and back keeps no gesture", async () => {
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
});

test("the row, wrapped once the finger's button comes, moves the sheet only after the pen's stroke", async () => {
  const { canvas, finger, row, view } = await sheet(400);
  const tall = row.getBoundingClientRect().height;
  const top = canvas.getBoundingClientRect().top;
  await input("mousePressed", at(canvas, view(), 100, 300), { pointerType: "pen", force: 0.5 });
  await settle();
  await input("mouseMoved", at(canvas, view(), 300, 300), { pointerType: "pen", force: 0.5 });
  await settle();
  expect(canvas.getBoundingClientRect().top).toBe(top);
  await input("mouseReleased", at(canvas, view(), 300, 300), { pointerType: "pen", force: 0 });
  await expect.poll(() => finger.hidden).toBe(false);
  await settle();
  // Five buttons do not fit 400 px in one line: the row wraps, and the sheet goes down.
  expect(row.getBoundingClientRect().height).toBeGreaterThan(tall);
  expect(canvas.getBoundingClientRect().top).toBeGreaterThan(top);
});

test("with the consumer's pointer-events: none two fingers start no scroll, and one finger on the statement scrolls it as the browser does", async () => {
  const task = sheetTask({
    statement: [{ text: "Write the numbers from one to twenty, one under another. ".repeat(4) }],
  });
  const { element, root, viewport } = await sheet(400, 300, { task });
  element.style.pointerEvents = "none";
  await twoFingers(viewport, -60);
  await settle();
  expect(viewport.scrollTop).toBe(0);
  element.style.pointerEvents = "";
  // On the statement the browser scrolls by itself (R23).
  const statement = root.querySelector(".statement")?.getBoundingClientRect();
  if (statement === undefined) throw new Error("no statement");
  const on = { id: 1, clientX: statement.left + 50, clientY: statement.top + 20 };
  await touches("touchStart", [on]);
  for (let step = 1; step <= 10; step++) {
    await touches("touchMove", [{ ...on, clientY: on.clientY - 10 * step }]);
  }
  await touches("touchEnd", []);
  await settle();
  expect(viewport.scrollTop).toBeGreaterThan(0);
  expect(probe(element).strokes).toEqual([]);
});

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

test("a pen that came down writing nothing and lifted beyond the element leaves the hands nothing", async () => {
  const { element, canvas, view } = await sheet();
  const barrel = { pointerType: "pen" as const, force: 0.5, button: "right" as const, buttons: 2 };
  await input("mousePressed", at(canvas, view(), 300, 300), barrel);
  expect(probe(element).live).toBeUndefined();
  expect(probe(element).roles.size).toBe(1);
  const beyond = { clientX: canvas.getBoundingClientRect().right + 50, clientY: 20 };
  await input("mouseMoved", beyond, barrel);
  await input("mouseReleased", beyond, { ...barrel, buttons: 0 });
  expect(probe(element).roles.size).toBe(0);
});

test("two fingers scroll no page that hides its overflow, and the page whose body's overflow is the viewport's", async () => {
  const { viewport } = await sheet(400);
  spacer();
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
});
