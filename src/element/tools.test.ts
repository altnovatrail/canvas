import { afterEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { HistoryEvent } from "../core/history.js";
import { sheetTask, workedExample } from "../core/tasks.fixture.js";
import { ROW } from "./icons.js";
import { NovatrailCanvas, type ToolChange } from "./index.js";
import { labelsFor } from "./labels.js";
import {
  at,
  buttonOf,
  consumerButton,
  devtools,
  iconOf,
  input,
  level,
  placed,
  rest,
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
// 1.4.13). A worked example's bar holds the zoom's pair alone, and its Next and Demo, with their
// labels beside their icons, stand in a row of the same glass at the bottom, the consumer's buttons
// of the slot actions after them (R42, R84). The sheet has no buttons that scroll it: a hand drags
// it, the wheel and the keys scroll it (R84), and the zoom itself is zoom.test.ts's.

const made: HTMLElement[] = [];
afterEach(async () => {
  for (const element of made.splice(0)) element.remove();
  // A pen puts the whole page in pen mode: the next test starts without it.
  PEN_MODE.on = false;
  window.scrollTo(0, 0);
  // The mouse a test left over a button: the next test, or file, has no tooltip it did not ask for.
  await rest();
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

/**
 * The mouse moved off the element, onto a button of the page below it: the test before may have
 * left it where a button of this element now stands, which shows its tooltip till its grace ends.
 */
async function off(): Promise<HTMLButtonElement> {
  const away = pageButton("Away");
  await userEvent.hover(away);
  await wait(PAST_GRACE);
  return away;
}

test("the bar is a vertical toolbar of the pen and the eraser, undo and clear, named in English for an element of no language, before the sheet in the order of Tab", async () => {
  const { element, root, row, actions } = await sheet();
  const found = buttons(element);
  await expect.element(found.row).toBeVisible();
  await expect.element(found.group).toBeVisible();
  await expect.element(found.pen).toBeChecked();
  await expect.element(found.eraser).not.toBeChecked();
  await expect.element(found.undo).toBeVisible();
  await expect.element(found.clear).toBeVisible();
  expect(row.getAttribute("aria-orientation")).toBe("vertical");
  // The order the arrow keys go through, and the language the names are in. Zoom in and Zoom out
  // are on every device (T94). The last button is pen mode's, which out of it the bar hides (R29).
  // A worked example's Next and Demo are not the bar's: they stand in its row, which a sheet hides.
  expect([...row.querySelectorAll("button")].map((each) => each.textContent)).toEqual([
    "Pen",
    "Eraser",
    "Undo",
    "Clear",
    "Zoom in",
    "Zoom out",
    "Draw with finger",
  ]);
  expect(row.querySelectorAll("button[hidden]")).toHaveLength(1);
  expect(actions.hidden).toBe(true);
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
  const { element, root } = await sheet();
  // The bar's buttons, then those of a worked example's row.
  const each = [...root.querySelectorAll("button")];
  expect(each.map((one) => drawn(one).name)).toEqual([
    ROW.pen.filled,
    ROW.eraser.outline,
    ROW.undo.outline,
    ROW.clear.outline,
    ROW.zoomIn.outline,
    ROW.zoomOut.outline,
    ROW.finger.outline,
    ROW.next.outline,
    ROW.demoShown.outline,
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
  buttonOf(element, "Eraser").click();
  await settle();
  expect(drawn(buttonOf(element, "Pen")).name).toBe(ROW.pen.outline);
  expect(drawn(buttonOf(element, "Eraser")).name).toBe(ROW.eraser.filled);
  // A change of language changes the labels alone.
  element.setAttribute("lang", "ru");
  expect(drawn(buttonOf(element, "Ластик")).name).toBe(ROW.eraser.filled);
  expect(buttonOf(element, "Ластик").querySelectorAll("svg")).toHaveLength(1);
});

test("in an element whose text runs right to left, the icons of Next, Undo and a hidden Demo are mirrored, and no other; the bar's arrows still go down, and a worked example's row runs from the right, Next first", async () => {
  const parent = document.createElement("div");
  parent.dir = "rtl";
  document.body.append(parent);
  const { element, root } = await sheet(400, undefined, parent);
  /** Whether each button shown mirrors its icon. */
  const mirrored = () =>
    Object.fromEntries(
      [...root.querySelectorAll("button:not([hidden])")].map((one) => [
        one.textContent,
        drawn(one).mirrored,
      ]),
    );
  const unturned = { "Zoom in": false, "Zoom out": false };
  expect(mirrored()).toEqual({ Pen: false, Eraser: false, Undo: true, Clear: false, ...unturned });
  // The bar runs down whichever way the text runs: the arrows across are not its (APG).
  buttonOf(element, "Pen").focus();
  await moves(root, [
    ["{ArrowDown}", "Eraser"],
    ["{ArrowLeft}", "Eraser"],
    ["{ArrowRight}", "Eraser"],
    ["{ArrowUp}", "Pen"],
  ]);
  element.workedExample = workedExample();
  await settle();
  expect(mirrored()).toEqual({ Next: true, Demo: false, ...unturned });
  // The row runs as the text does: Demo stands to the left of Next, where Next's arrow points (R46).
  const across = (label: string) => buttonOf(element, label).getBoundingClientRect();
  expect(across("Demo").right).toBeLessThanOrEqual(across("Next").left);
  buttonOf(element, "Demo").click();
  await settle();
  expect(drawn(buttonOf(element, "Demo")).name).toBe(ROW.demoHidden.outline);
  expect(mirrored()).toEqual({ Next: true, Demo: true, ...unturned });
  // Left to right, nothing is mirrored, and Next comes first from the left.
  parent.dir = "ltr";
  expect(Object.values(mirrored()).some(Boolean)).toBe(false);
  expect(across("Next").right).toBeLessThanOrEqual(across("Demo").left);
});

test("the labels follow the element's own lang: Russian for ru and its regions, English for any other and for none", async () => {
  const { element, root, row, actions } = await sheet();
  const russian = labelsFor("ru").labels;
  for (const tag of ["ru", "ru-RU", "RU", "ru-Cyrl-RU-x-school"]) {
    element.setAttribute("lang", tag);
    expect([row.lang, actions.lang]).toEqual(["ru", "ru"]);
    await expect.element(buttons(element, russian).row).toBeVisible();
    await expect.element(buttons(element, russian).undo).toBeVisible();
  }
  // The bar's buttons, then those of a worked example's row.
  expect([...root.querySelectorAll("button")].map((each) => each.textContent)).toEqual([
    "Перо",
    "Ластик",
    "Отменить",
    "Очистить",
    "Крупнее",
    "Мельче",
    "Рисовать пальцем",
    "Дальше",
    "Показ",
  ]);
  // A language the labels are not in reads as English, in English: the bar says its own.
  for (const tag of ["de", "", "constructor", "x-ru", "zh-Hant-CN"]) {
    element.setAttribute("lang", tag);
    expect([row.lang, actions.lang]).toEqual(["en", "en"]);
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
  const eraser = buttonOf(element, "Eraser");
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
  buttonOf(element, "Eraser").click();
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
  expect(root.activeElement?.textContent).toBe("Pen");
  // Undo, Clear and Zoom out are reached while unavailable, the arrows go round the bar, Home and
  // End go to its ends, and a key with Control is not the bar's, nor are the arrows across a bar
  // that runs down: the keys, and the button they leave focused.
  await moves(root, [
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
  const undo = buttonOf(element, "Undo");
  const clear = buttonOf(element, "Clear");
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
  const undo = buttonOf(element, "Undo");
  const clear = buttonOf(element, "Clear");
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
  const eraser = buttonOf(element, "Eraser");
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

test("a worked example's toolbar is a vertical bar of the zoom's pair alone, named so in the element's language, with the stop of Tab, and the focus when the button it was on goes; Next and Demo stand out of it in the row with their labels, and leaving the example brings the sheet's bar back", async () => {
  // A device with touch, in pen mode: a worked example's bar has no finger's button even so (R42).
  Object.defineProperty(navigator, "maxTouchPoints", { value: 5, configurable: true });
  try {
    // Till a button has had the focus, Tab comes to the first button shown, whichever it is now.
    const fresh = await sheet();
    const stop = () => fresh.root.querySelector('[tabindex="0"]')?.textContent;
    fresh.element.workedExample = workedExample();
    expect(stop()).toBe("Zoom in");
    fresh.element.workedExample = undefined;
    expect(stop()).toBe("Pen");
    const { element, root, row, actions } = await sheet();
    PEN_MODE.on = true;
    await settle();
    const shown = (box: HTMLElement) =>
      [...box.querySelectorAll("button:not([hidden])")].map((each) => each.textContent);
    const stops = () =>
      [...root.querySelectorAll('[tabindex="0"]')].map((each) => each.textContent);
    expect(shown(row)).toHaveLength(7);
    buttonOf(element, "Pen").focus();
    element.workedExample = workedExample();
    expect(row.getAttribute("aria-label")).toBe("Worked example buttons");
    expect(row.getAttribute("aria-orientation")).toBe("vertical");
    expect(shown(row)).toEqual(["Zoom in", "Zoom out"]);
    expect(row.querySelectorAll(".line:not([hidden])")).toHaveLength(0);
    expect(page.elementLocator(element).getByRole("radiogroup").elements()).toHaveLength(0);
    // The pen went with the focus on it: the focus is on the bar's first button.
    expect(root.activeElement?.textContent).toBe("Zoom in");
    expect(stops()).toEqual(["Zoom in"]);
    // Next and Demo are actions, not the bar's: plain buttons of the row, each a stop of Tab of its
    // own, which show their labels beside their icons (R90 spec).
    expect([actions.hidden, actions.getAttribute("role")]).toEqual([false, null]);
    expect(shown(actions)).toEqual(["Next", "Demo"]);
    await settle();
    for (const name of ["Next", "Demo"]) {
      const one = buttonOf(element, name);
      expect([one.tabIndex, one.hasAttribute("tabindex")], name).toEqual([0, false]);
      expect(one.querySelector(".label")?.getBoundingClientRect().width, name).toBeGreaterThan(8);
    }
    // The bar's arrows go down and up its pair alone, round it, and none goes across.
    await moves(root, [
      ["{ArrowDown}", "Zoom out"],
      ["{ArrowDown}", "Zoom in"],
      ["{ArrowUp}", "Zoom out"],
      ["{ArrowRight}{ArrowLeft}", "Zoom out"],
      ["{Home}", "Zoom in"],
      ["{End}", "Zoom out"],
    ]);
    // The row's buttons take none of the bar's keys.
    buttonOf(element, "Next").focus();
    await moves(root, [["{ArrowDown}{ArrowRight}{Home}", "Next"]]);
    expect(stops()).toEqual(["Zoom out"]);
    element.setAttribute("lang", "ru");
    const russian = labelsFor("ru").labels;
    await expect
      .element(
        page
          .elementLocator(element)
          .getByRole("toolbar", { name: russian.exampleButtons, exact: true }),
      )
      .toBeVisible();
    expect(shown(row)).toEqual([russian.zoomIn, russian.zoomOut]);
    expect(shown(actions)).toEqual([russian.next, russian.demo]);
    // Out of the example the bar is the sheet's again, and the row goes: the focus on Next, which
    // goes with it, goes to the bar's first button, and the stop of Tab with it.
    element.workedExample = undefined;
    await settle();
    expect(row.getAttribute("aria-label")).toBe(russian.sheetButtons);
    expect(row.getAttribute("aria-orientation")).toBe("vertical");
    expect(shown(row)).toHaveLength(7);
    expect(actions.hidden).toBe(true);
    expect(root.activeElement?.textContent).toBe(russian.pen);
    expect(stops()).toEqual([russian.pen]);
    // A worked example again, the focus on the bar as it leaves: the stop stays where it was.
    element.workedExample = workedExample();
    buttonOf(element, russian.zoomOut).focus();
    element.workedExample = undefined;
    expect(root.activeElement?.textContent).toBe(russian.zoomOut);
    expect(stops()).toEqual([russian.zoomOut]);
  } finally {
    Reflect.deleteProperty(navigator, "maxTouchPoints");
  }
});

test("a consumer's buttons in the slot actions stand in a worked example's row after Next, Demo and a line, on its glass, take the pointer, and come after Demo in the order of Tab; the line shows only while the slot has any", async () => {
  const before = pageButton("Before");
  const { element, root, actions } = await sheet();
  const after = pageButton("After");
  element.workedExample = workedExample();
  await settle();
  const line = actions.querySelector<HTMLElement>(".line");
  const slot = actions.querySelector("slot");
  if (!line || !slot) throw new Error("the row has no line and no slot");
  expect([slot.name, line.getAttribute("aria-hidden"), line.hidden]).toEqual([
    "actions",
    "true",
    true,
  ]);
  const own = consumerButton();
  const clicks = vi.fn();
  own.addEventListener("click", clicks);
  element.append(own);
  await settle();
  expect(slot.assignedElements()).toEqual([own]);
  expect(line.hidden).toBe(false);
  // Across the row, in its order, each within its glass.
  const glass = actions.getBoundingClientRect();
  const boxes = [buttonOf(element, "Next"), buttonOf(element, "Demo"), line, own].map((each) =>
    each.getBoundingClientRect(),
  );
  for (const [n, box] of boxes.entries()) {
    expect(box.left, `${n}`).toBeGreaterThanOrEqual((boxes[n - 1]?.right ?? glass.left) - 0.5);
    expect(box.top, `${n}`).toBeGreaterThanOrEqual(glass.top);
    expect(box.bottom, `${n}`).toBeLessThanOrEqual(glass.bottom);
  }
  expect(boxes.at(-1)?.right).toBeLessThanOrEqual(glass.right);
  // A pointer on the consumer's button meets it, over the sheet, and clicks it.
  const { clientX, clientY } = middle(own);
  expect(document.elementFromPoint(clientX, clientY)).toBe(own);
  await userEvent.click(own);
  expect(clicks).toHaveBeenCalledOnce();
  // Tab: the bar's one stop, Next, Demo, the consumer's button, and what follows the element.
  before.focus();
  for (const to of ["Zoom in", "Next", "Demo"]) {
    await userEvent.tab();
    expect(root.activeElement?.textContent).toBe(to);
  }
  await userEvent.tab();
  expect(document.activeElement).toBe(own);
  await userEvent.tab();
  expect(document.activeElement).toBe(after);
  await userEvent.tab({ shift: true });
  await userEvent.tab({ shift: true });
  expect(root.activeElement?.textContent).toBe("Demo");
  // The slot empty again, the line goes; a button given in markup, before the element is
  // upgraded, brings it from the start.
  own.remove();
  await settle();
  expect(line.hidden).toBe(true);
  const markup = document.createElement("div");
  markup.innerHTML = `<novatrail-canvas><button slot="actions">Continue</button></novatrail-canvas>`;
  document.body.append(markup);
  made.push(markup);
  const early = markup.querySelector("novatrail-canvas");
  if (!(early instanceof NovatrailCanvas)) throw new Error("the element was not upgraded");
  early.workedExample = workedExample();
  await settle();
  expect(early.shadowRoot?.querySelector<HTMLElement>(".tools.row .line")?.hidden).toBe(false);
});

test("a consumer's button in the slot actions shows only in a worked example's row: not on a sheet, nor with tools-hidden, where it is out of the order of Tab too", async () => {
  const { element, actions } = await sheet(400, 600);
  const own = consumerButton();
  element.append(own);
  await settle();
  const visible = (expected: boolean) => {
    expect(own.getBoundingClientRect().width > 0).toBe(expected);
    own.focus();
    expect(document.activeElement === own).toBe(expected);
    own.blur();
  };
  expect(actions.hidden).toBe(true);
  visible(false);
  element.workedExample = workedExample();
  await settle();
  visible(true);
  element.toggleAttribute("tools-hidden", true);
  await settle();
  expect(actions.getBoundingClientRect().width).toBe(0);
  visible(false);
  element.removeAttribute("tools-hidden");
  await settle();
  visible(true);
});

/** The places a worked example's row is tried in: an element with a height, one taller than the
 * window, one narrower than the row would be, and each away from the window's left edge. */
const ROWS = [
  { name: "an element 400 × 600", width: 400, height: 600 },
  { name: "an element 300 wide and taller than the window", width: 300, height: 1200 },
  { name: "an element 200 wide", width: 200, height: 600 },
];

test.each(ROWS)(
  "in $name, a worked example's row stands in the middle of it across, 16 pixels above the bottom of the part in sight, 56 pixels tall and round at its ends, and no wider than the element less 32 pixels",
  async ({ width, height }) => {
    const { element, actions } = await sheet(width, height);
    element.style.marginLeft = "10px";
    const own = consumerButton();
    element.append(own);
    element.workedExample = workedExample();
    await settle();
    const box = element.getBoundingClientRect();
    const row = actions.getBoundingClientRect();
    expect(row.left + row.width / 2).toBeCloseTo(box.left + box.width / 2, 0);
    expect(row.bottom).toBeCloseTo(Math.min(box.bottom, window.innerHeight) - 16, 0);
    expect(row.height).toBeCloseTo(56, 1);
    expect(getComputedStyle(actions).borderRadius).toBe("28px");
    expect(row.width).toBeLessThanOrEqual(width - 32 + 0.5);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    // A row narrower than its buttons scrolls them inside its glass, and the focus brings each of
    // them, the element's and the consumer's, whole into sight there, within its padding (2.4.11).
    if (width === 200) {
      expect(actions.scrollWidth).toBeGreaterThan(actions.clientWidth);
      for (const button of [own, buttonOf(element, "Next"), buttonOf(element, "Demo")]) {
        button.focus();
        // WebKit scrolls to it at the next update of the layout.
        await settle();
        const shown = button.getBoundingClientRect();
        expect(shown.left, button.textContent ?? "").toBeGreaterThanOrEqual(row.left + 6 - 0.5);
        expect(shown.right, button.textContent ?? "").toBeLessThanOrEqual(row.right - 6 + 0.5);
      }
    }
  },
);

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
    const { element, root } = await sheet(400);
    PEN_MODE.on = true;
    // A sheet's seven buttons, then a worked example's four: its bar's two and its row's (R42).
    for (const count of [7, 4]) {
      if (count === 4) element.workedExample = workedExample();
      for (const tag of ["en", "ru"]) {
        element.setAttribute("lang", tag);
        await settle();
        const shown = root.querySelectorAll("button:not([hidden])");
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
    // A sheet 700 pixels tall, by its width, in an element of 600: the container scrolls it.
    const { element, root, row, viewport } = await sheet(500, 600, parent);
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
  const pen = buttonOf(element, "Pen");
  const eraser = buttonOf(element, "Eraser");
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
  await off();
  const tip = tipOf(root);
  expect(tip.getAttribute("aria-hidden")).toBe("true");
  expect(said(tip)).toBeNull();
  for (const tag of ["en", "ru"]) {
    element.setAttribute("lang", tag);
    const { labels } = labelsFor(tag);
    for (const key of ["pen", "undo", "zoomOut"] as const) {
      const one = buttonOf(element, labels[key]);
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
  await userEvent.hover(buttonOf(element, "Clear"));
  expect(said(tip)).toBe("Clear");
  element.remove();
  expect(said(tip)).toBeNull();
});

test("a tooltip stays a moment after the pointer leaves its button, and while the pointer is on it", async () => {
  const { element, root } = await sheet(400, 600);
  const away = await off();
  const tip = tipOf(root);
  const pen = buttonOf(element, "Pen");
  await userEvent.hover(pen);
  expect(said(tip)).toBe("Pen");
  pen.dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse" }));
  expect(said(tip)).toBe("Pen");
  await wait(PAST_GRACE);
  expect(said(tip)).toBeNull();
  // From a button onto its tooltip, which keeps it, and off it.
  await userEvent.hover(buttonOf(element, "Eraser"));
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
  await off();
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

test("in a bar that scrolls inside its glass, the tooltip of the button the keys bring stands level with it, and moves with it as the bar scrolls", async () => {
  const before = pageButton("Before");
  const { element, root, row } = await sheet(400, 200);
  await off();
  const tip = tipOf(root);
  const level = () => {
    const shown = tip.getBoundingClientRect();
    return shown.top + shown.height / 2;
  };
  before.focus();
  await userEvent.tab();
  await userEvent.keyboard("{End}");
  const zoomOut = buttonOf(element, "Zoom out");
  expect(said(tip)).toBe("Zoom out");
  expect(row.scrollTop).toBeGreaterThan(0);
  expect(level()).toBeCloseTo(middle(zoomOut).clientY, 0);
  row.scrollTop = 0;
  await settle();
  expect(level()).toBeCloseTo(middle(zoomOut).clientY, 0);
});

test("a button the mouse was over that goes takes its tooltip along, and the keyboard's focus shows its own", async () => {
  const before = pageButton("Before");
  const { element, root } = await sheet(400, 600);
  await off();
  const tip = tipOf(root);
  await userEvent.hover(buttonOf(element, "Eraser"));
  expect(said(tip)).toBe("Eraser");
  element.task = sheetTask({ tools: ["pen"] });
  await settle();
  before.focus();
  await userEvent.tab();
  expect(said(tip)).toBe("Pen");
});

test("a press on the glass between the buttons, of the bar or of a worked example's row, takes the focus nowhere, and one on a button takes it there", async () => {
  const { element, root, row, actions } = await sheet(400, 600);
  element.workedExample = workedExample();
  await settle();
  const pressed = (target: Element) => {
    const down = new MouseEvent("mousedown", { bubbles: true, cancelable: true, composed: true });
    target.dispatchEvent(down);
    return down.defaultPrevented;
  };
  const line = root.querySelector(".tools.row .line");
  if (line === null) throw new Error("the row has no line");
  expect([pressed(row), pressed(actions), pressed(line)]).toEqual([true, true, true]);
  const icon = buttonOf(element, "Next").querySelector("svg");
  if (icon === null) throw new Error("Next has no icon");
  expect([pressed(buttonOf(element, "Zoom in")), pressed(icon)]).toEqual([false, false]);
});

test("on a worked example in a low element the bar stands above the row, 16 pixels clear of it", async () => {
  const { element, row, actions } = await sheet(400, 220);
  element.workedExample = workedExample();
  await settle();
  const bar = row.getBoundingClientRect();
  expect(bar.height).toBeGreaterThan(0);
  expect(bar.bottom).toBeLessThanOrEqual(actions.getBoundingClientRect().top - 16 + 0.5);
});

test("on a worked example Next and Demo, which show their labels, have no tooltip, nor has the consumer's button, and the zoom's buttons have theirs beside the bar", async () => {
  const { element, root, row } = await sheet(400, 600);
  const own = consumerButton();
  element.append(own);
  element.workedExample = workedExample();
  await off();
  const tip = tipOf(root);
  for (const one of [buttonOf(element, "Next"), buttonOf(element, "Demo"), own]) {
    await userEvent.hover(one);
    expect(said(tip), one.textContent ?? "").toBeNull();
  }
  const zoomIn = buttonOf(element, "Zoom in");
  await userEvent.hover(zoomIn);
  expect(said(tip)).toBe("Zoom in");
  const shown = tip.getBoundingClientRect();
  expect(shown.left).toBeGreaterThanOrEqual(row.getBoundingClientRect().right);
  expect(shown.top + shown.height / 2).toBeCloseTo(middle(zoomIn).clientY, 0);
});

test.runIf(devtools)(
  "a finger's touch of an icon button presses it and shows no tooltip: a finger has no hover",
  async () => {
    const { element, root } = await sheet(400, 600);
    await off();
    const finger = { id: 1, ...middle(buttonOf(element, "Eraser")) };
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
    await press(buttonOf(element, "Eraser"));
    expect(element.tool).toBe("eraser");
    await press(buttonOf(element, "Pen"));
    expect(element.tool).toBe("pen");
    expect(probe(element).strokes).toEqual([]);
    // A stroke from the sheet onto Clear, over the sheet's edge: it lands, and Clear stays unpressed.
    level(canvas, view(), 300, 100, 200);
    await input("mousePressed", at(canvas, view(), 100, 100));
    await input("mouseMoved", at(canvas, view(), 300, 100));
    await input("mouseMoved", middle(buttonOf(element, "Clear")));
    await input("mouseReleased", middle(buttonOf(element, "Clear")));
    expect(probe(element).strokes).toHaveLength(2);
  },
);

test.runIf(devtools)(
  "with the consumer's pointer-events: none the buttons take no pointer, and their keys still work",
  async () => {
    const { element } = await sheet(400, 300);
    element.style.pointerEvents = "none";
    await press(buttonOf(element, "Eraser"));
    expect(element.tool).toBe("pen");
    buttonOf(element, "Eraser").focus();
    await userEvent.keyboard(" ");
    expect(element.tool).toBe("eraser");
    // Zoom in's key zooms the sheet, though two fingers would start no gesture then (R29, T94).
    const zoomOut = buttonOf(element, "Zoom out");
    await press(buttonOf(element, "Zoom in"));
    expect(zoomOut.getAttribute("aria-disabled")).toBe("true");
    buttonOf(element, "Zoom in").focus();
    await userEvent.keyboard("{Enter}");
    expect(zoomOut.getAttribute("aria-disabled")).toBeNull();
  },
);
