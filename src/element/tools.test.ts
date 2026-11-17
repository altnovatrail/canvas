import { afterEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { HistoryEvent } from "../core/history.js";
import { sheetTask, workedExample } from "../core/tasks.fixture.js";
import { ROW } from "./icons.js";
import { NovatrailCanvas, type ToolChange } from "./index.js";
import { labelsFor } from "./labels.js";
import {
  at,
  devtools,
  iconOf,
  input,
  level,
  placed,
  settle,
  spacer,
  touches,
} from "./pointer.fixture.js";
import { probe } from "./probe.js";
import { PEN_MODE } from "./session.js";
import { TIP_GRACE_MS } from "./tools.js";

// The element's own buttons in a browser (R28, R84): a vertical bar of glass over the sheet's left
// edge, as the interface mockup draws it (R148 spec), a toolbar of the tools the task allows, of
// undo and clearing and of the zoom's pair (T94), found by its roles and names in the element's
// language, worked with the pointer and with the keyboard, telling of the learner's choice of
// tool, standing in the middle of what is in sight of the element and taking no room of its own.
// Each button shows an icon alone, its label its name and its tooltip, which the pointer's hover
// and the keyboard's focus show and Escape dismisses (the 2026-11-14 amendment to R90 spec; WCAG
// 1.4.13). A worked example's toolbar is a row of the same glass at the bottom, of Next and Demo
// with their labels beside their icons and of the zoom's pair (R42). The sheet has no buttons that
// scroll it: a hand drags it, the wheel and the keys scroll it (R84), and the zoom itself is
// zoom.test.ts's.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
  // A pen puts the whole page in pen mode: the next test starts without it.
  PEN_MODE.on = false;
  window.scrollTo(0, 0);
});

/** A sheet `width` CSS pixels wide, as tall as its statement and sheet unless given a height. */
const sheet = (width = 400, height?: number, parent: HTMLElement = document.body) =>
  placed(made, width, height, { parent });

/** The bar's buttons by their roles and names, as a screen reader finds them, in the element. */
function buttons(element: HTMLElement, names = labelsFor(null).labels) {
  const within = page.elementLocator(element);
  return {
    row: within.getByRole("toolbar", { name: names.sheetButtons, exact: true }),
    group: within.getByRole("radiogroup", { name: names.tool }),
    pen: within.getByRole("radio", { name: names.pen }),
    eraser: within.getByRole("radio", { name: names.eraser }),
    undo: within.getByRole("button", { name: names.undo }),
    clear: within.getByRole("button", { name: names.clear }),
  };
}

/** One button of the bar, as the element has it, by its label. */
function button(element: HTMLElement, name: string): HTMLButtonElement {
  const found = [...(element.shadowRoot?.querySelectorAll("button") ?? [])].find(
    (each) => each.textContent === name,
  );
  if (found === undefined) throw new Error(`the bar has no ${name}`);
  return found;
}

/** A button's icon: its name in the set, and whether the style mirrors it (R46). */
function drawn(each: Element) {
  const icon = iconOf(each);
  return { icon, name: icon.dataset.icon, mirrored: getComputedStyle(icon).transform !== "none" };
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

/** Each of the keys pressed in turn, and the button, by its label, that the focus is on after it. */
async function moves(
  root: ShadowRoot,
  steps: readonly (readonly [keys: string, to: string])[],
): Promise<void> {
  for (const [keys, to] of steps) {
    await userEvent.keyboard(keys);
    expect(root.activeElement?.textContent, keys).toBe(to);
  }
}

/** A button of the page, before or after the element, for Tab to come from or go to. */
function pageButton(text: string): HTMLButtonElement {
  const one = document.createElement("button");
  one.textContent = text;
  document.body.append(one);
  made.push(one);
  return one;
}

/** The element's tooltip. */
function tipOf(root: ShadowRoot): HTMLElement {
  const tip = root.querySelector<HTMLElement>(".tip");
  if (tip === null) throw new Error("the bar has no tooltip");
  return tip;
}

/** What the tooltip says while it shows, and null while it is hidden. */
const said = (tip: HTMLElement) => (tip.hidden ? null : tip.textContent);

/** Longer than a tooltip stays after the pointer leaves, by a margin for a loaded host. */
const PAST_GRACE = TIP_GRACE_MS + 150;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test("the bar is a vertical toolbar of the pen and the eraser, undo and clear, named in English for an element of no language, before the sheet in the order of Tab", async () => {
  const { element, root, row } = await sheet();
  const found = buttons(element);
  await expect.element(found.row).toBeVisible();
  await expect.element(found.group).toBeVisible();
  await expect.element(found.pen).toBeChecked();
  await expect.element(found.eraser).not.toBeChecked();
  await expect.element(found.undo).toBeVisible();
  await expect.element(found.clear).toBeVisible();
  expect(row.getAttribute("aria-orientation")).toBe("vertical");
  // The order the arrow keys go through, and the language the names are in. A worked example's
  // Next and Demo come first, and a sheet hides them (R42). Zoom in and Zoom out are on every
  // device (T94). The last button is pen mode's, which out of it the bar hides (R29).
  expect([...row.querySelectorAll("button")].map((each) => each.textContent)).toEqual([
    "Next",
    "Demo",
    "Pen",
    "Eraser",
    "Undo",
    "Clear",
    "Zoom in",
    "Zoom out",
    "Draw with finger",
  ]);
  expect(row.querySelectorAll("button[hidden]")).toHaveLength(3);
  expect(row.lang).toBe("en");
  // The lines between the groups say nothing to a screen reader, and the finger's goes with it.
  const lines = [...row.querySelectorAll<HTMLElement>(".line")];
  expect(lines.map((line) => [line.getAttribute("aria-hidden"), line.hidden])).toEqual([
    ["true", false],
    ["true", true],
  ]);
  // The rail of the bar comes first in the frame: Tab reaches the bar before the sheet.
  const rail = root.querySelector(".frame")?.firstElementChild;
  expect(rail?.className).toBe("rail");
  expect(rail?.contains(row)).toBe(true);
});

test("each button shows its icon, its label after it: an SVG that names nothing, in outline, but filled for the tool in use", async () => {
  const { element, row } = await sheet();
  const each = [...row.querySelectorAll("button")];
  expect(each.map((one) => drawn(one).name)).toEqual([
    ROW.next.outline,
    ROW.demoShown.outline,
    ROW.pen.filled,
    ROW.eraser.outline,
    ROW.undo.outline,
    ROW.clear.outline,
    ROW.zoomIn.outline,
    ROW.zoomOut.outline,
    ROW.finger.outline,
  ]);
  for (const one of each) {
    const { icon } = drawn(one);
    // The label names the button, and the icon says nothing to a screen reader (R78 spec).
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.querySelector("title")).toBeNull();
    expect(icon.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(icon.querySelectorAll("path").length).toBeGreaterThan(0);
    expect(one.lastElementChild?.tagName).toBe("SPAN");
  }
  // The pen and the eraser outlined and filled are other icons, and so are Demo's two.
  expect(ROW.pen.filled).not.toBe(ROW.pen.outline);
  expect(ROW.eraser.filled).not.toBe(ROW.eraser.outline);
  expect(ROW.demoHidden.outline).not.toBe(ROW.demoShown.outline);
  button(element, "Eraser").click();
  await settle();
  expect(drawn(button(element, "Pen")).name).toBe(ROW.pen.outline);
  expect(drawn(button(element, "Eraser")).name).toBe(ROW.eraser.filled);
  // A change of language changes the labels alone.
  element.setAttribute("lang", "ru");
  expect(drawn(button(element, "Ластик")).name).toBe(ROW.eraser.filled);
  expect(button(element, "Ластик").querySelectorAll("svg")).toHaveLength(1);
});

test("in an element whose text runs right to left, the icons of Next, Undo and a hidden Demo are mirrored, and no other; the bar's arrows still go down, and a worked example's ArrowLeft goes on", async () => {
  const parent = document.createElement("div");
  parent.dir = "rtl";
  document.body.append(parent);
  const { element, root, row } = await sheet(400, undefined, parent);
  /** Whether each button shown mirrors its icon. */
  const mirrored = () =>
    Object.fromEntries(
      [...row.querySelectorAll("button:not([hidden])")].map((one) => [
        one.textContent,
        drawn(one).mirrored,
      ]),
    );
  const unturned = { "Zoom in": false, "Zoom out": false };
  expect(mirrored()).toEqual({ Pen: false, Eraser: false, Undo: true, Clear: false, ...unturned });
  // The bar runs down whichever way the text runs: the arrows across are not its (APG).
  button(element, "Pen").focus();
  await moves(root, [
    ["{ArrowDown}", "Eraser"],
    ["{ArrowLeft}", "Eraser"],
    ["{ArrowRight}", "Eraser"],
    ["{ArrowUp}", "Pen"],
  ]);
  element.workedExample = workedExample();
  await settle();
  expect(mirrored()).toEqual({ Next: true, Demo: false, ...unturned });
  // The arrow that points along the example's row goes on: the next button stands to the left (R46).
  button(element, "Next").focus();
  await moves(root, [
    ["{ArrowLeft}", "Demo"],
    ["{ArrowRight}", "Next"],
    ["{ArrowDown}", "Next"],
  ]);
  button(element, "Demo").click();
  await settle();
  expect(drawn(button(element, "Demo")).name).toBe(ROW.demoHidden.outline);
  expect(mirrored()).toEqual({ Next: true, Demo: true, ...unturned });
  // Left to right, nothing is mirrored.
  parent.dir = "ltr";
  expect(Object.values(mirrored()).some(Boolean)).toBe(false);
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
    "Дальше",
    "Показ",
    "Перо",
    "Ластик",
    "Отменить",
    "Очистить",
    "Крупнее",
    "Мельче",
    "Рисовать пальцем",
  ]);
  // A language the labels are not in reads as English, in English: the bar says its own.
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

test("tools-hidden takes the bar out of sight and of the accessibility tree, the focus off it, from markup too, and its going brings the bar back with its stop of Tab", async () => {
  const { element, root, row } = await sheet(400, 600);
  const eraser = button(element, "Eraser");
  eraser.focus();
  const within = page.elementLocator(element);
  const toolbars = () => within.getByRole("toolbar").elements();
  expect(toolbars()).toHaveLength(1);
  element.toggleAttribute("tools-hidden", true);
  await settle();
  expect(toolbars()).toHaveLength(0);
  expect(row.getBoundingClientRect().height).toBe(0);
  expect(root.activeElement).toBeNull();
  element.removeAttribute("tools-hidden");
  await settle();
  await expect.element(buttons(element).row).toBeVisible();
  expect(row.getBoundingClientRect().width).toBeCloseTo(52, 1);
  expect([...root.querySelectorAll('[tabindex="0"]')]).toEqual([eraser]);
  // An element made with the attribute has no bar from the start.
  const markup = document.createElement("div");
  markup.innerHTML = "<novatrail-canvas tools-hidden></novatrail-canvas>";
  document.body.append(markup);
  made.push(markup);
  await settle();
  const early = markup.querySelector("novatrail-canvas");
  expect(early?.shadowRoot?.querySelector<HTMLElement>(".rail")?.hidden).toBe(true);
  expect(page.elementLocator(markup).getByRole("toolbar").elements()).toHaveLength(0);
});

test("a tool the learner chooses with the bar is the element's tool, and toolchange tells of it once", async () => {
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

test("a tool the consumer sets shows on the bar and is told of by no event", async () => {
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

test("the bar is one stop of Tab, the arrows down and up move between its buttons choosing nothing, those across do nothing, and Space chooses", async () => {
  const before = pageButton("Before");
  const { element, root } = await sheet();
  const after = pageButton("After");
  const told = heard(element);
  const stops = () => [...root.querySelectorAll('[tabindex="0"]')].map((each) => each.textContent);
  expect(stops()).toEqual(["Pen"]);
  before.focus();
  await userEvent.tab();
  // Undo, Clear and Zoom out are reached while unavailable, the arrows go round the bar, Home and
  // End go to its ends, and a key with Control is not the bar's, nor are the arrows across a bar
  // that runs down: the keys, and the button they leave focused.
  await moves(root, [
    ["", "Pen"],
    ["{ArrowDown}", "Eraser"],
    ["{ArrowDown}{ArrowDown}", "Clear"],
    ["{ArrowDown}", "Zoom in"],
    ["{ArrowDown}{ArrowDown}", "Pen"],
    ["{ArrowUp}", "Zoom out"],
    ["{Home}", "Pen"],
    ["{End}", "Zoom out"],
    ["{Control>}{ArrowUp}{/Control}", "Zoom out"],
    ["{ArrowLeft}{ArrowRight}", "Zoom out"],
    ["{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}", "Eraser"],
  ]);
  expect(element.tool).toBe("pen");
  expect(stops()).toEqual(["Eraser"]);
  await userEvent.keyboard(" ");
  expect(element.tool).toBe("eraser");
  expect(told).toEqual([{ tool: "eraser" }]);
  // Out of the bar and back: the focus comes back to the button it left.
  await userEvent.tab();
  expect(document.activeElement).toBe(after);
  await userEvent.tab({ shift: true });
  expect(root.activeElement?.textContent).toBe("Eraser");
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
  element.task = sheetTask({ tools: ["pen"] });
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
  element.task = sheetTask({ tools: ["pen", "ruler", "calculator"] });
  expect(page.elementLocator(element).getByRole("radio").elements()).toHaveLength(1);
  expect(() => {
    element.task = sheetTask({ tools: ["eraser"] });
  }).toThrow(TypeError);
  // Pen, Undo, Clear, Zoom in and Zoom out.
  expect(root.querySelectorAll("button:not([hidden])")).toHaveLength(5);
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
  element.task = sheetTask({ tools: ["pen"] });
  expect(element.tool).toBe("pen");
  expect(told).toHaveLength(1);
  expect(eraser.hidden).toBe(true);
  expect(root.activeElement?.textContent).toBe("Pen");
  expect(root.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  canvas.dispatchEvent(event("pointerup", 150, { button: 0, buttons: 0 }));
  expect(probe(element).strokes).toEqual([]);
  // The eraser comes back with a task that allows it, and the pen stays the tool.
  element.task = sheetTask();
  expect(eraser.hidden).toBe(false);
  expect(element.tool).toBe("pen");
});

test("a worked example's toolbar is a row named so in the element's language, of Next and Demo with their labels and the zoom's pair alone, its arrows across, the stop of Tab and the focus on Next, and leaving it brings the bar back", async () => {
  // A device with touch, in pen mode: a worked example's row has no finger's button even so (R42).
  Object.defineProperty(navigator, "maxTouchPoints", { value: 5, configurable: true });
  try {
    // Till a button has had the focus, Tab comes to the first button shown, whichever it is now.
    const fresh = await sheet();
    const stop = () => fresh.root.querySelector('[tabindex="0"]')?.textContent;
    fresh.element.workedExample = workedExample();
    expect(stop()).toBe("Next");
    fresh.element.workedExample = undefined;
    expect(stop()).toBe("Pen");
    const { element, root, row } = await sheet();
    PEN_MODE.on = true;
    await settle();
    const shown = () =>
      [...row.querySelectorAll("button:not([hidden])")].map((each) => each.textContent);
    const stops = () =>
      [...root.querySelectorAll('[tabindex="0"]')].map((each) => each.textContent);
    expect(shown()).toHaveLength(7);
    button(element, "Pen").focus();
    element.workedExample = workedExample();
    expect(row.getAttribute("aria-label")).toBe("Worked example buttons");
    expect(row.getAttribute("aria-orientation")).toBe("horizontal");
    expect(row.parentElement?.classList.contains("example")).toBe(true);
    expect(shown()).toEqual(["Next", "Demo", "Zoom in", "Zoom out"]);
    expect(page.elementLocator(element).getByRole("radiogroup").elements()).toHaveLength(0);
    // Next and Demo are actions, and show their labels beside their icons (R90 spec).
    await settle();
    for (const name of ["Next", "Demo"]) {
      const label = button(element, name).querySelector(".label")?.getBoundingClientRect();
      expect(label?.width, name).toBeGreaterThan(8);
    }
    expect(root.activeElement?.textContent).toBe("Next");
    expect(stops()).toEqual(["Next"]);
    await moves(root, [
      ["{ArrowRight}", "Demo"],
      ["{ArrowRight}", "Zoom in"],
      ["{ArrowLeft}", "Demo"],
      ["{ArrowLeft}", "Next"],
      ["{ArrowLeft}", "Zoom out"],
      ["{ArrowUp}{ArrowDown}", "Zoom out"],
      ["{Home}", "Next"],
      ["{End}", "Zoom out"],
    ]);
    element.setAttribute("lang", "ru");
    const russian = labelsFor("ru").labels;
    await expect
      .element(
        page
          .elementLocator(element)
          .getByRole("toolbar", { name: russian.exampleButtons, exact: true }),
      )
      .toBeVisible();
    expect(shown()).toEqual([russian.next, russian.demo, russian.zoomIn, russian.zoomOut]);
    // Out of the example the bar is the sheet's again, and the stop stays where the focus left it.
    element.workedExample = undefined;
    await settle();
    expect(row.getAttribute("aria-label")).toBe(russian.sheetButtons);
    expect(row.getAttribute("aria-orientation")).toBe("vertical");
    expect(shown()).toHaveLength(7);
    expect(stops()).toEqual([russian.zoomOut]);
  } finally {
    Reflect.deleteProperty(navigator, "maxTouchPoints");
  }
});

test("an eraser given before the element is upgraded, with a task without it, leaves the pen and no warning", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const template = document.createElement("template");
    template.innerHTML = "<novatrail-canvas></novatrail-canvas>";
    const early = template.content.firstElementChild;
    if (!(early instanceof HTMLElement)) throw new Error("the template has no element");
    Reflect.set(early, "tool", "eraser");
    Reflect.set(early, "task", sheetTask({ tools: ["pen"] }));
    document.body.append(early);
    made.push(early);
    expect(early instanceof NovatrailCanvas && early.tool).toBe("pen");
    expect(warn).not.toHaveBeenCalled();
  } finally {
    warn.mockRestore();
  }
});

test("every button is at least 44 CSS pixels square, in English and in Russian, pen mode's too, and a worked example's", async () => {
  // A device with touch, in pen mode: the bar shows every button it has (R29).
  Object.defineProperty(navigator, "maxTouchPoints", { value: 5, configurable: true });
  try {
    const { element, row } = await sheet(400);
    PEN_MODE.on = true;
    // A sheet's seven buttons, then a worked example's four (R42).
    for (const count of [7, 4]) {
      if (count === 4) element.workedExample = workedExample();
      for (const tag of ["en", "ru"]) {
        element.setAttribute("lang", tag);
        await settle();
        const shown = row.querySelectorAll("button:not([hidden])");
        expect(shown).toHaveLength(count);
        for (const each of shown) {
          const rect = each.getBoundingClientRect();
          expect(rect.width).toBeGreaterThanOrEqual(44);
          expect(rect.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  } finally {
    Reflect.deleteProperty(navigator, "maxTouchPoints");
  }
});

test.each(["ltr", "rtl"])(
  "in an element with a height, %s, the bar stands 16 pixels from its left edge in the middle of it, 52 pixels wide, its icons in round targets of 44, takes no room, and stays while the sheet scrolls under it",
  async (dir) => {
    const parent = document.createElement("div");
    parent.dir = dir;
    document.body.append(parent);
    const { element, root, row, viewport } = await sheet(400, 600, parent);
    const box = element.getBoundingClientRect();
    const bar = row.getBoundingClientRect();
    expect(bar.width).toBeCloseTo(52, 1);
    expect(bar.left - box.left).toBeCloseTo(16, 1);
    expect(getComputedStyle(row).borderRadius).toBe("26px");
    // The middle of what is in sight of the element: the window may be lower than it.
    const top = Math.max(box.top, 0);
    const sight = Math.min(box.bottom, window.innerHeight) - top;
    expect(Math.abs(bar.top + bar.height / 2 - (top + sight / 2))).toBeLessThanOrEqual(1);
    for (const each of row.querySelectorAll("button:not([hidden])")) {
      const rect = each.getBoundingClientRect();
      expect([rect.width, rect.height]).toEqual([44, 44]);
      expect(getComputedStyle(each).borderRadius).toBe("22px");
      // The label is out of sight, and still the button's name (R46).
      expect(each.querySelector(".label")?.getBoundingClientRect().width).toBeLessThanOrEqual(1);
      expect(iconOf(each).getBoundingClientRect().width).toBeCloseTo(20, 1);
    }
    // The bar overlays the sheet: the container and the column start at the element's top.
    expect(viewport.getBoundingClientRect().top).toBeCloseTo(box.top, 3);
    expect(viewport.clientHeight).toBeCloseTo(600, 0);
    expect(root.querySelector(".column")?.getBoundingClientRect().top).toBeCloseTo(box.top, 3);
    expect(bar.left).toBeGreaterThan(viewport.getBoundingClientRect().left);
    viewport.scrollTop = 200;
    await settle();
    expect(viewport.scrollTop).toBeGreaterThan(0);
    expect(row.getBoundingClientRect().top).toBe(bar.top);
    expect(element.getBoundingClientRect().top).toBe(box.top);
  },
);

test("without a height, the bar sticks in the middle of what the window shows below --novatrail-canvas-top, over the sheet, which it takes the pointer from", async () => {
  // A sheet taller than the window, by its width: the page scrolls it, and the bar sticks.
  const width = Math.ceil(((window.innerHeight + 300) * 1000) / 1400);
  const { element, root, row, canvas } = await sheet(width);
  spacer(made);
  const rail = row.parentElement;
  if (rail === null) throw new Error("the bar has no rail");
  for (const band of [0, 40]) {
    element.style.setProperty("--novatrail-canvas-top", `${band}px`);
    window.scrollTo(0, 100);
    await settle();
    expect(element.getBoundingClientRect().top).toBeLessThan(band);
    expect(rail.getBoundingClientRect().top).toBeCloseTo(band, 3);
    const bar = row.getBoundingClientRect();
    const sight = window.innerHeight - band;
    expect(Math.abs(bar.top + bar.height / 2 - (band + sight / 2)), `${band}`).toBeLessThanOrEqual(
      1,
    );
    // Over the sheet: a pointer there meets the bar, not the canvas under it.
    const over = middle(row);
    const sheetBox = canvas.getBoundingClientRect();
    expect(over.clientX).toBeGreaterThan(sheetBox.left);
    expect(row.contains(root.elementFromPoint(over.clientX, over.clientY))).toBe(true);
  }
});

test("the tool in use is filled with the accent at an eighth and drawn in it, a button in focus ringed in it, and the bar is of glass: each the consumer's own where its theme gives one", async () => {
  const before = pageButton("Before");
  const { element, root, row } = await sheet();
  const pen = button(element, "Pen");
  const eraser = button(element, "Eraser");
  const plain = document.createElement("div");
  document.body.append(plain);
  made.push(plain);
  /** What the engine computes of a colour, read off a plain element of the page. */
  const computed = (property: string, value: string) => {
    plain.style.setProperty(property, value);
    return getComputedStyle(plain).getPropertyValue(property);
  };
  const themes = [
    { accent: "#0071E3", glass: "rgba(255, 255, 255, 0.76)" },
    { accent: "#c03030", glass: "rgb(10, 20, 30)", own: true },
  ];
  for (const { accent, glass, own } of themes) {
    if (own) {
      element.style.setProperty("--novatrail-canvas-accent", accent);
      element.style.setProperty("--novatrail-canvas-glass", glass);
    }
    const style = getComputedStyle(pen);
    const mixed = computed("background-color", `color-mix(in srgb, ${accent} 12%, transparent)`);
    expect(style.backgroundColor, accent).toBe(mixed);
    expect(style.color, accent).toBe(computed("color", accent));
    expect(getComputedStyle(eraser).backgroundColor).toBe(computed("background-color", "#0000"));
    expect(getComputedStyle(row).backgroundColor, glass).toBe(computed("background-color", glass));
    // The keyboard's focus on the bar: a ring of two pixels in the accent, on the button's edge.
    before.focus();
    await userEvent.tab();
    expect(root.activeElement).toBe(pen);
    const ring = getComputedStyle(pen);
    expect([ring.outlineStyle, ring.outlineWidth, ring.outlineOffset]).toEqual([
      "solid",
      "2px",
      "0px",
    ]);
    expect(ring.outlineColor).toBe(computed("color", accent));
  }
});

test("a mouse over an icon button shows its label in a tooltip beside the bar, level with the button, in the element's language, hidden from a screen reader; Escape dismisses it till another button, and it goes with the element", async () => {
  const { element, root, row } = await sheet(400, 600);
  const tip = tipOf(root);
  expect(tip.getAttribute("aria-hidden")).toBe("true");
  expect(said(tip)).toBeNull();
  for (const tag of ["en", "ru"]) {
    element.setAttribute("lang", tag);
    const { labels } = labelsFor(tag);
    for (const key of ["pen", "undo", "zoomOut"] as const) {
      const one = button(element, labels[key]);
      await userEvent.hover(one);
      expect(said(tip), key).toBe(labels[key]);
      expect(tip.lang).toBe(tag);
      const box = one.getBoundingClientRect();
      const shown = tip.getBoundingClientRect();
      expect(shown.width).toBeGreaterThan(0);
      expect(shown.left).toBeGreaterThanOrEqual(row.getBoundingClientRect().right);
      const level = shown.top + shown.height / 2;
      expect(level).toBeGreaterThan(box.top);
      expect(level).toBeLessThan(box.bottom);
    }
  }
  // Another language while it shows: it says the label in that one.
  element.setAttribute("lang", "en");
  expect(said(tip)).toBe("Zoom out");
  // Escape dismisses it, the pointer still over the button; another button shows its own.
  await userEvent.keyboard("{Escape}");
  expect(said(tip)).toBeNull();
  await userEvent.hover(button(element, "Clear"));
  expect(said(tip)).toBe("Clear");
  element.remove();
  expect(said(tip)).toBeNull();
});

test("a tooltip stays a moment after the pointer leaves its button, and while the pointer is on it", async () => {
  const { element, root } = await sheet(400, 600);
  const away = pageButton("Away");
  const tip = tipOf(root);
  const pen = button(element, "Pen");
  await userEvent.hover(pen);
  expect(said(tip)).toBe("Pen");
  pen.dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse" }));
  expect(said(tip)).toBe("Pen");
  await wait(PAST_GRACE);
  expect(said(tip)).toBeNull();
  // From a button onto its tooltip, which keeps it, and off it.
  await userEvent.hover(button(element, "Eraser"));
  await userEvent.hover(page.elementLocator(tip));
  await wait(PAST_GRACE);
  expect(said(tip)).toBe("Eraser");
  await userEvent.hover(away);
  await wait(PAST_GRACE);
  expect(said(tip)).toBeNull();
});

test("the keyboard's focus on an icon button shows its tooltip, the arrows move it with the focus, Escape dismisses it, and leaving the bar hides it", async () => {
  const before = pageButton("Before");
  const { root } = await sheet(400, 600);
  const tip = tipOf(root);
  before.focus();
  await userEvent.tab();
  expect(said(tip)).toBe("Pen");
  const steps: [keys: string, tip: string | null][] = [
    ["{ArrowDown}", "Eraser"],
    ["{Escape}", null],
    ["{ArrowDown}", "Undo"],
    ["{Shift>}{Tab}{/Shift}", null],
  ];
  for (const [keys, shown] of steps) {
    await userEvent.keyboard(keys);
    expect(said(tip), keys).toBe(shown);
  }
  expect(document.activeElement).toBe(before);
});

test("on a worked example Next and Demo, which show their labels, have no tooltip, and the zoom's buttons have theirs above the row", async () => {
  const { element, root, row } = await sheet(400, 600);
  element.workedExample = workedExample();
  await settle();
  const tip = tipOf(root);
  for (const name of ["Next", "Demo"]) {
    await userEvent.hover(button(element, name));
    expect(said(tip), name).toBeNull();
  }
  const zoomIn = button(element, "Zoom in");
  await userEvent.hover(zoomIn);
  expect(said(tip)).toBe("Zoom in");
  const shown = tip.getBoundingClientRect();
  expect(shown.bottom).toBeLessThanOrEqual(row.getBoundingClientRect().top);
  expect(shown.left + shown.width / 2).toBeCloseTo(middle(zoomIn).clientX, 0);
});

test.runIf(devtools)(
  "a finger's touch of an icon button presses it and shows no tooltip: a finger has no hover",
  async () => {
    const { element, root } = await sheet(400, 600);
    const finger = { id: 1, ...middle(button(element, "Eraser")) };
    await touches("touchStart", [finger]);
    await touches("touchEnd", [finger]);
    await settle();
    expect(element.tool).toBe("eraser");
    expect(said(tipOf(root))).toBeNull();
  },
);

test.runIf(devtools)(
  "a press on the bar starts no stroke, and a stroke let go over a button clicks none",
  async () => {
    const { element, canvas, view } = await sheet(400);
    await press(button(element, "Eraser"));
    expect(element.tool).toBe("eraser");
    await press(button(element, "Pen"));
    expect(element.tool).toBe("pen");
    expect(probe(element).strokes).toEqual([]);
    // A stroke from the sheet onto Clear, over the sheet's edge: it lands, and Clear stays unpressed.
    level(canvas, view(), 300, 100, 200);
    await input("mousePressed", at(canvas, view(), 100, 100));
    await input("mouseMoved", at(canvas, view(), 300, 100));
    await input("mouseMoved", middle(button(element, "Clear")));
    await input("mouseReleased", middle(button(element, "Clear")));
    expect(probe(element).strokes).toHaveLength(2);
  },
);

test.runIf(devtools)(
  "with the consumer's pointer-events: none the buttons take no pointer, and their keys still work",
  async () => {
    const { element } = await sheet(400, 300);
    element.style.pointerEvents = "none";
    await press(button(element, "Eraser"));
    expect(element.tool).toBe("pen");
    button(element, "Eraser").focus();
    await userEvent.keyboard(" ");
    expect(element.tool).toBe("eraser");
    // Zoom in's key zooms the sheet, though two fingers would start no gesture then (R29, T94).
    const zoomOut = button(element, "Zoom out");
    await press(button(element, "Zoom in"));
    expect(zoomOut.getAttribute("aria-disabled")).toBe("true");
    button(element, "Zoom in").focus();
    await userEvent.keyboard("{Enter}");
    expect(zoomOut.getAttribute("aria-disabled")).toBeNull();
  },
);
