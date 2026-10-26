import { afterEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { HistoryEvent } from "../core/history.js";
import type { View } from "../core/screen.js";
import { NovatrailCanvas, type ToolChange } from "./index.js";
import { labelsFor } from "./labels.js";
import { at, input, level } from "./pointer.fixture.js";
import { probe } from "./probe.js";

// The element's own row of buttons in Chromium (R28): a toolbar of the tools the task allows and of
// undo and clearing, found by its roles and names in the element's language, worked with the
// pointer and with the keyboard, telling of the learner's choice of tool, and standing above the
// statement and the sheet, outside their scrolling.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
  window.scrollTo(0, 0);
});

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
/** Two frames: one for the element's layout, one for its drawing. */
async function settle(): Promise<void> {
  await frame();
  await frame();
}

const sheetKind = { kind: "handwriting-sheet" } as const;

/** A sheet `width` CSS pixels wide, as tall as its row and the sheet unless given a height. */
async function sheet(width = 400, height?: number, parent: HTMLElement = document.body) {
  const element = document.createElement("novatrail-canvas");
  element.style.width = `${width}px`;
  if (height !== undefined) element.style.height = `${height}px`;
  parent.append(element);
  made.push(parent === document.body ? element : parent);
  await settle();
  const root = element.shadowRoot;
  const canvas = root?.querySelector("canvas");
  const viewport = root?.querySelector<HTMLElement>(".viewport");
  const row = root?.querySelector<HTMLElement>(".tools");
  if (!root || !canvas || !viewport || !row) throw new Error("the element has no row and canvas");
  const view = (): View => {
    const { view } = probe(element);
    if (view === undefined) throw new Error("the element is not laid out");
    return view;
  };
  return { element, root, canvas, viewport, row, view };
}

/** The row's buttons by their roles and names, as a screen reader finds them, in the element. */
function buttons(element: HTMLElement, names = labelsFor(null).labels) {
  const within = page.elementLocator(element);
  return {
    row: within.getByRole("toolbar", { name: names.sheet }),
    group: within.getByRole("radiogroup", { name: names.tool }),
    pen: within.getByRole("radio", { name: names.pen }),
    eraser: within.getByRole("radio", { name: names.eraser }),
    undo: within.getByRole("button", { name: names.undo }),
    clear: within.getByRole("button", { name: names.clear }),
  };
}

/** One button of the row, as the element has it. */
function button(element: HTMLElement, name: string): HTMLButtonElement {
  const found = [...(element.shadowRoot?.querySelectorAll("button") ?? [])].find(
    (each) => each.textContent === name,
  );
  if (found === undefined) throw new Error(`the row has no ${name}`);
  return found;
}

/** The middle of an element, in client coordinates. */
function middle(element: Element) {
  const rect = element.getBoundingClientRect();
  return { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
}

/** A real click of the mouse at the middle of an element, whatever is over it. */
async function press(element: Element): Promise<void> {
  await input("mousePressed", middle(element));
  await input("mouseReleased", middle(element));
}

/** The `toolchange` events a target hears. */
function heard(target: EventTarget): ToolChange[] {
  const details: ToolChange[] = [];
  target.addEventListener("toolchange", (event) => {
    details.push((event as CustomEvent<ToolChange>).detail);
  });
  return details;
}

test("the row is a toolbar of the pen and the eraser, undo and clear, named in English for an element of no language", async () => {
  const { element, row } = await sheet();
  const found = buttons(element);
  await expect.element(found.row).toBeVisible();
  await expect.element(found.group).toBeVisible();
  await expect.element(found.pen).toBeChecked();
  await expect.element(found.eraser).not.toBeChecked();
  await expect.element(found.undo).toBeVisible();
  await expect.element(found.clear).toBeVisible();
  // The order the arrow keys go through, and the language the names are in.
  expect([...row.querySelectorAll("button")].map((each) => each.textContent)).toEqual([
    "Pen",
    "Eraser",
    "Undo",
    "Clear",
  ]);
  expect(row.lang).toBe("en");
});

test("the labels follow the element's own lang: Russian for ru and its regions, English for any other and for none", async () => {
  const { element, row } = await sheet();
  const russian = labelsFor("ru").labels;
  for (const tag of ["ru", "ru-RU", "RU", "ru-Cyrl-RU-x-school"]) {
    element.setAttribute("lang", tag);
    expect(row.lang).toBe("ru");
    await expect.element(buttons(element, russian).row).toBeVisible();
    await expect.element(buttons(element, russian).undo).toBeVisible();
  }
  expect([...row.querySelectorAll("button")].map((each) => each.textContent)).toEqual([
    "Перо",
    "Ластик",
    "Отменить",
    "Очистить",
  ]);
  // A language the labels are not in reads as English, in English: the row says its own.
  for (const tag of ["de", "", "constructor", "x-ru", "zh-Hant-CN"]) {
    element.setAttribute("lang", tag);
    expect(row.lang).toBe("en");
    await expect.element(buttons(element).pen).toBeVisible();
  }
  element.setAttribute("lang", "ru");
  element.removeAttribute("lang");
  expect(row.lang).toBe("en");
  await expect.element(buttons(element).clear).toBeVisible();
});

test("the lookup cuts a tag from its end, a single-letter subtag with the one after it", () => {
  expect(labelsFor("ru-Latn-RU").lang).toBe("ru");
  expect(labelsFor("en-x-ru").lang).toBe("en");
  expect(labelsFor("ru-u-ca-gregory").lang).toBe("ru");
  expect(labelsFor("-ru").lang).toBe("en");
  expect(labelsFor(null).lang).toBe("en");
});

test("the element reads its own lang alone, and has it from the start when made in markup", async () => {
  // An ancestor's language is the page's, not the element's: app gives the element its own.
  const wrapper = document.createElement("div");
  wrapper.lang = "ru";
  document.body.append(wrapper);
  const { row } = await sheet(400, undefined, wrapper);
  expect(row.lang).toBe("en");

  const markup = document.createElement("div");
  markup.innerHTML = `<novatrail-canvas lang="ru-RU"></novatrail-canvas>`;
  document.body.append(markup);
  made.push(markup);
  const parsed = markup.querySelector("novatrail-canvas");
  expect(parsed?.shadowRoot?.querySelector(".tools")?.getAttribute("lang")).toBe("ru");

  // An element of an inert template is upgraded when it comes into the page, its lang with it.
  const template = document.createElement("template");
  template.innerHTML = `<novatrail-canvas lang="ru"></novatrail-canvas>`;
  const early = template.content.firstElementChild;
  if (!(early instanceof HTMLElement)) throw new Error("the template has no element");
  expect(early).not.toBeInstanceOf(NovatrailCanvas);
  document.body.append(early);
  made.push(early);
  expect(early.shadowRoot?.querySelector(".tools")?.getAttribute("lang")).toBe("ru");
});

test("a tool the learner chooses with the row is the element's tool, and toolchange tells of it once", async () => {
  const { element } = await sheet();
  const told = heard(element);
  const found = buttons(element);
  await userEvent.click(found.eraser);
  expect(element.tool).toBe("eraser");
  await expect.element(found.eraser).toBeChecked();
  await expect.element(found.pen).not.toBeChecked();
  expect(told).toEqual([{ tool: "eraser" }]);
  expect(Object.isFrozen(told[0])).toBe(true);
  // The tool in use, chosen again, is no change.
  await userEvent.click(found.eraser);
  expect(told).toHaveLength(1);
  await userEvent.click(found.pen);
  expect(element.tool).toBe("pen");
  expect(told).toEqual([{ tool: "eraser" }, { tool: "pen" }]);
});

test("a tool the consumer sets shows on the row and is told of by no event", async () => {
  const { element } = await sheet();
  const told = heard(element);
  element.tool = "eraser";
  await expect.element(buttons(element).eraser).toBeChecked();
  element.tool = "pen";
  await expect.element(buttons(element).pen).toBeChecked();
  expect(told).toEqual([]);
});

test("toolchange goes up from the element and out of a consumer's shadow tree", async () => {
  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "open" });
  const place = document.createElement("div");
  shadow.append(place);
  document.body.append(host);
  const { element } = await sheet(400, undefined, place);
  made.push(host);
  const told = heard(document);
  let event: Event | undefined;
  document.addEventListener("toolchange", (each) => {
    event = each;
  });
  button(element, "Eraser").click();
  expect(told).toEqual([{ tool: "eraser" }]);
  expect(event?.composed).toBe(true);
  expect(event?.bubbles).toBe(true);
  // Retargeted at the consumer's host, as any event leaving a shadow tree is.
  expect(event?.target).toBe(host);
});

test("the row is one stop of Tab, the arrow keys move between its buttons choosing nothing, and Space chooses", async () => {
  const before = document.createElement("button");
  before.textContent = "Before";
  const after = document.createElement("button");
  after.textContent = "After";
  document.body.append(before);
  made.push(before);
  const { element, root } = await sheet();
  document.body.append(after);
  made.push(after);
  const told = heard(element);
  const focused = () => root.activeElement?.textContent;
  const stops = () => [...root.querySelectorAll('[tabindex="0"]')].map((each) => each.textContent);
  expect(stops()).toEqual(["Pen"]);
  before.focus();
  await userEvent.tab();
  expect(focused()).toBe("Pen");
  await userEvent.keyboard("{ArrowRight}");
  expect(focused()).toBe("Eraser");
  expect(element.tool).toBe("pen");
  // Undo and Clear are reached while unavailable, the arrows go round the row, Home and End go to
  // its ends, and a key with Control is not the row's: the keys, and the button they leave focused.
  const moves: [keys: string, to: string][] = [
    ["{ArrowRight}{ArrowRight}", "Clear"],
    ["{ArrowRight}", "Pen"],
    ["{ArrowLeft}", "Clear"],
    ["{Home}", "Pen"],
    ["{End}", "Clear"],
    ["{Control>}{ArrowLeft}{/Control}", "Clear"],
    ["{ArrowLeft}{ArrowLeft}", "Eraser"],
  ];
  for (const [keys, to] of moves) {
    await userEvent.keyboard(keys);
    expect(focused(), keys).toBe(to);
  }
  expect(stops()).toEqual(["Eraser"]);
  await userEvent.keyboard(" ");
  expect(element.tool).toBe("eraser");
  expect(told).toEqual([{ tool: "eraser" }]);
  // Out of the row and back: the focus comes back to the button it left.
  await userEvent.tab();
  expect(document.activeElement).toBe(after);
  await userEvent.tab({ shift: true });
  expect(focused()).toBe("Eraser");
});

test("Undo and Clear stand unavailable while there is nothing to undo or to clear, and keep the focus", async () => {
  const { element, root, canvas, view } = await sheet();
  const found = buttons(element);
  const undo = button(element, "Undo");
  const clear = button(element, "Clear");
  const unavailable = () => [undo, clear].map((each) => each.getAttribute("aria-disabled"));
  expect(unavailable()).toEqual(["true", "true"]);
  // A screen reader finds them, and finds them unavailable; the disabled attribute is not used.
  const within = page.elementLocator(element);
  await expect.element(within.getByRole("button", { name: "Undo", disabled: true })).toBeVisible();
  expect(undo.hasAttribute("disabled") || clear.hasAttribute("disabled")).toBe(false);
  let changes = 0;
  element.addEventListener("historychange", () => changes++);

  level(canvas, view(), 100, 100, 300);
  expect(unavailable()).toEqual([null, null]);
  await userEvent.click(found.undo);
  expect(probe(element).strokes).toEqual([]);
  expect(unavailable()).toEqual(["true", "true"]);

  level(canvas, view(), 100, 100, 300);
  level(canvas, view(), 300, 100, 300);
  await userEvent.click(found.clear);
  expect(probe(element).strokes).toEqual([]);
  // The clearing is undone like any action, so Undo has something to take back.
  expect(unavailable()).toEqual([null, "true"]);

  // From the keyboard, to the last undo and beyond: the focus stays on Undo, which does nothing.
  undo.focus();
  await userEvent.keyboard("{Enter}");
  expect(probe(element).strokes).toHaveLength(2);
  expect(unavailable()).toEqual([null, null]);
  await userEvent.keyboard("{Enter}{Enter}");
  expect(probe(element).strokes).toEqual([]);
  expect(unavailable()).toEqual(["true", "true"]);
  expect(root.activeElement).toBe(undo);
  const before = changes;
  await userEvent.keyboard("{Enter} ");
  expect(changes).toBe(before);
  expect(root.activeElement).toBe(undo);
});

test("a history given to the sheet sets Undo and Clear as its stack and its strokes are", async () => {
  const { element } = await sheet();
  const undo = button(element, "Undo");
  const clear = button(element, "Clear");
  const unavailable = () => [undo, clear].map((each) => each.getAttribute("aria-disabled"));
  const written: HistoryEvent = {
    kind: "write",
    t: 0,
    stroke: { id: 1, kind: "pen", points: [{ x: 10, y: 10, t: 0, p: 0.5 }] },
  };
  element.history = [written];
  expect(unavailable()).toEqual([null, null]);
  element.history = [written, { kind: "clear", t: 10, ids: [1] }];
  expect(unavailable()).toEqual([null, "true"]);
  element.history = undefined;
  expect(unavailable()).toEqual(["true", "true"]);
});

test("a task without the eraser has none: no button, no eraser of the pen, no tool of it", async () => {
  const { element, root, canvas, view } = await sheet();
  level(canvas, view(), 100, 100, 300);
  element.task = { canvas: { ...sheetKind, tools: ["pen"] } };
  await expect.element(buttons(element).pen).toBeChecked();
  expect(page.elementLocator(element).getByRole("radio").elements()).toHaveLength(1);
  // The pen's other end over the stroke neither erases nor writes.
  const pen = { pointerId: 3, pointerType: "pen", isPrimary: true, bubbles: true };
  const end = (type: string, x: number, init: PointerEventInit) =>
    new PointerEvent(type, { ...pen, ...at(canvas, view(), x, 100), ...init });
  canvas.dispatchEvent(end("pointerdown", 150, { button: 5, buttons: 32 }));
  canvas.dispatchEvent(end("pointermove", 250, { button: -1, buttons: 32 }));
  canvas.dispatchEvent(end("pointerup", 250, { button: 5, buttons: 0 }));
  expect(probe(element).strokes.map((stroke) => stroke.id)).toEqual([1]);
  expect(probe(element).pending).toEqual([]);
  expect(() => {
    element.tool = "eraser";
  }).toThrow(/allows no eraser/);
  expect(element.tool).toBe("pen");
  // The names the sheet does not know are passed over; a list without the pen is no task.
  element.task = { canvas: { ...sheetKind, tools: ["pen", "ruler", "calculator"] } };
  expect(page.elementLocator(element).getByRole("radio").elements()).toHaveLength(1);
  expect(() => {
    element.task = { canvas: { ...sheetKind, tools: ["eraser"] } };
  }).toThrow(TypeError);
  expect(root.querySelectorAll("button:not([hidden])")).toHaveLength(3);
});

test("a new task without the eraser puts the pen back, with no event, and the focus with it; an erasing under way ends as it began", async () => {
  const { element, root, canvas, view } = await sheet();
  level(canvas, view(), 100, 100, 300);
  const told = heard(element);
  const eraser = button(element, "Eraser");
  eraser.focus();
  await userEvent.keyboard(" ");
  expect(element.tool).toBe("eraser");
  expect(told).toHaveLength(1);
  // A press of the eraser begins over the stroke, then the task changes, then it lifts.
  const mouse = { pointerId: 4, pointerType: "mouse", isPrimary: true, bubbles: true };
  const event = (type: string, x: number, init: PointerEventInit) =>
    new PointerEvent(type, { ...mouse, ...at(canvas, view(), x, 100), ...init });
  canvas.dispatchEvent(event("pointerdown", 150, { button: 0, buttons: 1 }));
  expect(probe(element).pending).toEqual([1]);
  element.task = { canvas: { ...sheetKind, tools: ["pen"] } };
  expect(element.tool).toBe("pen");
  expect(told).toHaveLength(1);
  expect(eraser.hidden).toBe(true);
  expect(root.activeElement?.textContent).toBe("Pen");
  expect(root.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  canvas.dispatchEvent(event("pointerup", 150, { button: 0, buttons: 0 }));
  expect(probe(element).strokes).toEqual([]);
  // The eraser comes back with a task that allows it, and the pen stays the tool.
  element.task = { canvas: sheetKind };
  expect(eraser.hidden).toBe(false);
  expect(element.tool).toBe("pen");
});

test("an eraser given before the element is upgraded, with a task without it, leaves the pen and no warning", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const template = document.createElement("template");
    template.innerHTML = "<novatrail-canvas></novatrail-canvas>";
    const early = template.content.firstElementChild;
    if (!(early instanceof HTMLElement)) throw new Error("the template has no element");
    Reflect.set(early, "tool", "eraser");
    Reflect.set(early, "task", { canvas: { ...sheetKind, tools: ["pen"] } });
    document.body.append(early);
    made.push(early);
    expect(early instanceof NovatrailCanvas && early.tool).toBe("pen");
    expect(warn).not.toHaveBeenCalled();
  } finally {
    warn.mockRestore();
  }
});

test("every button is at least 44 CSS pixels square, in English and in Russian, on a narrow sheet", async () => {
  const { element, row } = await sheet(400);
  for (const tag of ["en", "ru"]) {
    element.setAttribute("lang", tag);
    await settle();
    for (const each of row.querySelectorAll("button")) {
      const rect = each.getBoundingClientRect();
      expect(rect.width).toBeGreaterThanOrEqual(44);
      expect(rect.height).toBeGreaterThanOrEqual(44);
    }
  }
});

test("with a height, the row stays where it is while the statement and the sheet scroll under it", async () => {
  const { element, row, viewport } = await sheet(400, 300);
  const top = row.getBoundingClientRect().top;
  expect(viewport.getBoundingClientRect().top).toBeCloseTo(row.getBoundingClientRect().bottom, 3);
  expect(viewport.clientHeight).toBeCloseTo(300 - row.getBoundingClientRect().height, 0);
  viewport.scrollTop = 200;
  await settle();
  expect(row.getBoundingClientRect().top).toBe(top);
  expect(element.getBoundingClientRect().top).toBe(top);
});

test("without a height, the row sticks to the top of the page's scrolling, as far down as --novatrail-canvas-top says, over the sheet it hides from the eraser", async () => {
  const { element, root, row, canvas, view } = await sheet(400);
  // A page taller than the screen, which scrolls the element.
  const rest = document.createElement("div");
  rest.style.height = "2000px";
  document.body.append(rest);
  made.push(rest);
  // A stroke well down the sheet, and the page scrolled so that it is under the row.
  level(canvas, view(), 700, 100, 300);
  window.scrollTo(0, at(canvas, view(), 200, 700).clientY - 20);
  await settle();
  expect(window.scrollY).toBeGreaterThan(0);
  expect(row.getBoundingClientRect().top).toBeCloseTo(0, 3);
  const over = at(canvas, view(), 200, 700);
  expect(row.contains(root.elementFromPoint(over.clientX, over.clientY))).toBe(true);
  // An erasing that goes over the stroke under the row takes nothing there.
  element.tool = "eraser";
  const mouse = { pointerId: 5, pointerType: "mouse", isPrimary: true, bubbles: true };
  const below = row.getBoundingClientRect().bottom + 40;
  const event = (type: string, clientY: number, init: PointerEventInit) =>
    new PointerEvent(type, {
      ...mouse,
      clientX: at(canvas, view(), 200, 0).clientX,
      clientY,
      ...init,
    });
  canvas.dispatchEvent(event("pointerdown", below, { button: 0, buttons: 1 }));
  canvas.dispatchEvent(event("pointermove", at(canvas, view(), 200, 700).clientY, { buttons: 1 }));
  canvas.dispatchEvent(event("pointerup", at(canvas, view(), 200, 700).clientY, { buttons: 0 }));
  expect(probe(element).strokes.map((each) => each.id)).toEqual([1]);

  element.style.setProperty("--novatrail-canvas-top", "40px");
  await settle();
  expect(row.getBoundingClientRect().top).toBeCloseTo(40, 3);
});

test("a press on the row starts no stroke, and a stroke let go over a button clicks none", async () => {
  const { element, canvas, view } = await sheet(400);
  await press(button(element, "Eraser"));
  expect(element.tool).toBe("eraser");
  await press(button(element, "Pen"));
  expect(element.tool).toBe("pen");
  expect(probe(element).strokes).toEqual([]);
  // A stroke from the sheet up over Clear: it lands, and Clear stays unpressed.
  level(canvas, view(), 300, 100, 200);
  await input("mousePressed", at(canvas, view(), 100, 100));
  await input("mouseMoved", at(canvas, view(), 300, 100));
  await input("mouseMoved", middle(button(element, "Clear")));
  await input("mouseReleased", middle(button(element, "Clear")));
  expect(probe(element).strokes).toHaveLength(2);
});

test("with the consumer's pointer-events: none the buttons take no pointer, and their keys still work", async () => {
  const { element } = await sheet(400);
  element.style.pointerEvents = "none";
  await press(button(element, "Eraser"));
  expect(element.tool).toBe("pen");
  button(element, "Eraser").focus();
  await userEvent.keyboard(" ");
  expect(element.tool).toBe("eraser");
});
