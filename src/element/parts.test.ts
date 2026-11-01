import { afterEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { moduleManifest, sheetTask, workedExample } from "../core/tasks.fixture.js";
import type { DemoChangeEvent, DemoState, NovatrailCanvas } from "./index.js";
import { accessibilityTree, placed, settle, spacer, upgraded } from "./pointer.fixture.js";
import { probe } from "./probe.js";

// The parts of a worked example's demo in Chromium (R42): the row's Next opens them one at a time
// into a numbered list between the statement and the sheet, and Demo hides and shows the whole
// demo; demoState tells how far the learner has gone, and demochange tells of the learner's own
// presses alone. A polite region tells a screen reader of the part just opened, the list keeps its
// items as they were built, and a part comes into sight at once, below the row of buttons. DEMO,
// the demo of the tests, has four parts: a paragraph, a picture beside the sheet, a picture on an
// area of it, and a paragraph.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
  window.scrollTo(0, 0);
});

/**
 * A sheet 400 CSS pixels wide in `parent`, as tall as its row, statement, parts and sheet unless
 * given a height, showing a worked example of DEMO, with what it has told by demochange, its list
 * of parts, its region, and its Next and Demo.
 */
async function demo(height?: number, parent?: HTMLElement) {
  const parts = await placed(made, 400, height, parent === undefined ? {} : { parent });
  const { element, root } = parts;
  element.workedExample = workedExample();
  const told: DemoState[] = [];
  element.addEventListener("demochange", ({ detail }) => told.push(detail));
  await settle();
  const list = root.querySelector<HTMLOListElement>("ol.parts");
  const status = root.querySelector<HTMLElement>('[role="status"]');
  const row = page.elementLocator(element);
  const next = row.getByRole("button", { name: "Next" }).element();
  const shown = row.getByRole("button", { name: "Demo" }).element();
  if (!list || !status || !(next instanceof HTMLButtonElement)) throw new Error("no demo");
  if (!(shown instanceof HTMLButtonElement)) throw new Error("no Demo");
  return { ...parts, told, list, status, next, demo: shown };
}

/** The items of the list, as nodes. */
const itemsOf = (list: HTMLOListElement): Element[] => [...list.children];

test("Next opens the demo's parts one at a time at the end of the list, which keeps the items it has, by Enter, Space and the pointer alike; at the last it stands unavailable, keeps the focus and opens nothing", async () => {
  const { element, root, list, next, told } = await demo();
  expect(element.demoState).toStrictEqual({ opened: 0, hidden: false });
  expect(Object.isFrozen(element.demoState)).toBe(true);
  // No part open: the list takes no room.
  expect(getComputedStyle(list).display).toBe("none");
  expect(next.getAttribute("aria-disabled")).toBeNull();
  next.focus();
  await userEvent.keyboard("{Enter}");
  const first = list.firstElementChild;
  await userEvent.keyboard(" ");
  next.click();
  expect(itemsOf(list)).toHaveLength(3);
  expect(list.firstElementChild).toBe(first);
  next.click();
  expect(told.map(({ opened, hidden }) => [opened, hidden])).toEqual([
    [1, false],
    [2, false],
    [3, false],
    [4, false],
  ]);
  // The event tells the state the element has: the very object.
  expect(told.at(-1)).toBe(element.demoState);
  expect(next.getAttribute("aria-disabled")).toBe("true");
  expect(root.activeElement).toBe(next);
  next.click();
  await userEvent.keyboard("{Enter}");
  expect(told).toHaveLength(4);
  expect(element.demoState?.opened).toBe(4);
  // Each part as it is: a paragraph's text, a picture beside the sheet in a frame of its size
  // named by its words, a picture on an area of the sheet read by its words, and a paragraph.
  const [draw, lamp, path, count] = itemsOf(list);
  expect(draw?.textContent).toBe("Draw the path, and mark a lamp at each end.");
  const frame = lamp?.querySelector<HTMLElement>(".picture");
  expect(frame?.getAttribute("role")).toBe("img");
  expect(frame?.getAttribute("aria-label")).toBe("A lamp.");
  expect(frame?.style.width).toBe("60px");
  const words = path?.querySelector('[role="img"]');
  const alt = "A line for the path, cut into 4 equal gaps of 5 m, with a lamp at every mark.";
  expect(words?.getAttribute("aria-label")).toBe(alt);
  expect(words?.textContent).toBe(alt);
  expect(path?.getAttribute("role")).toBeNull();
  expect(count?.textContent).toBe("20 ÷ 5 = 4 gaps, and one lamp more than gaps: 5 lamps.");
});

test("Demo hides the whole demo and shows it again: aria-expanded tells which, the open parts stay as they were, Next stands unavailable while it is hidden, and the region tells nothing", async () => {
  const { element, list, status, next, demo: shown, told } = await demo();
  next.click();
  next.click();
  const items = itemsOf(list);
  expect(status.textContent).not.toBe("");
  expect(shown.getAttribute("aria-expanded")).toBe("true");
  shown.click();
  expect(element.demoState).toStrictEqual({ opened: 2, hidden: true });
  expect(list.hidden).toBe(true);
  expect(getComputedStyle(list).display).toBe("none");
  expect(shown.getAttribute("aria-expanded")).toBe("false");
  expect(next.getAttribute("aria-disabled")).toBe("true");
  expect(status.textContent).toBe("");
  // Next opens nothing of a hidden demo, and tells nothing.
  next.click();
  expect(told).toHaveLength(3);
  shown.click();
  expect(element.demoState).toStrictEqual({ opened: 2, hidden: false });
  expect(itemsOf(list)).toEqual(items);
  expect(list.children[0]).toBe(items[0]);
  expect(shown.getAttribute("aria-expanded")).toBe("true");
  expect(next.getAttribute("aria-disabled")).toBeNull();
  expect(status.textContent).toBe("");
  expect(told.map(({ hidden }) => hidden)).toEqual([false, false, true, false]);
});

test("the region is in the shadow root from the start, empty, and tells of each part as it opens: its number in the labels' language, of how many, and its words in the module's; Next and Demo control the region and the list", async () => {
  const task = await placed(made, 400, undefined, { task: sheetTask() });
  const quiet = task.root.querySelector('[role="status"]');
  expect(quiet?.textContent).toBe("");
  const { element, root, status, list, next, demo: shown } = await demo();
  expect(root.getElementById(next.getAttribute("aria-controls") ?? "")).toBe(status);
  expect(root.getElementById(shown.getAttribute("aria-controls") ?? "")).toBe(list);
  element.lang = "ru";
  element.manifest = moduleManifest({ explanation: "en" });
  next.click();
  const said = () =>
    [...status.children].map((span) => [span.getAttribute("lang"), span.textContent]);
  expect(said()).toEqual([
    ["ru", "Часть 1 из 4."],
    ["en", "Draw the path, and mark a lamp at each end."],
  ]);
  expect(list.lang).toBe("en");
  // A language the labels are not in: the number is English, and says so.
  element.lang = "fr";
  next.click();
  expect(said()).toEqual([
    ["en", "Part 2 of 4."],
    ["en", "A lamp."],
  ]);
  // Without a manifest the words are in the element's own language, which they inherit.
  element.manifest = undefined;
  next.click();
  expect(said()[1]?.[0]).toBeNull();
  expect(status.textContent).toMatch(/^Part 3 of 4\. A line for the path/);
});

test("a picture that only decorates is its number alone in the region: beside the sheet a frame of its size that names nothing, on an area an empty item", async () => {
  const { element, root, list, status } = await demo();
  element.workedExample = workedExample({
    demo: [
      { picture: "pictures/lamp.png", alt: "", width: 60, height: 120 },
      { picture: "pictures/path.png", alt: "", area: { left: 0, top: 0, width: 500, height: 200 } },
    ],
  });
  const next = page.elementLocator(element).getByRole("button", { name: "Next" });
  await next.click();
  expect(status.textContent).toBe("Part 1 of 2.");
  const frame = list.querySelector(".picture");
  expect(frame?.classList.contains("decorative")).toBe(true);
  expect(frame?.hasAttribute("role")).toBe(false);
  expect(frame?.getBoundingClientRect().height).toBe(120);
  await next.click();
  expect(status.textContent).toBe("Part 2 of 2.");
  expect(list.lastElementChild?.childNodes).toHaveLength(0);
  expect(root.querySelectorAll('.parts [role="img"]')).toHaveLength(0);
});

test("a state the consumer gives shows its parts and hides or shows the demo with no event, nothing told and nothing scrolled; one that says the same keeps the object, fewer parts go from the end, and a wrong one is a TypeError that names its field and changes nothing", async () => {
  const { element, list, status, next, viewport, told } = await demo(300);
  next.click();
  expect(status.textContent).not.toBe("");
  const given = { opened: 3, hidden: false };
  element.demoState = given;
  const state = element.demoState;
  expect(state).toStrictEqual(given);
  expect(state).not.toBe(given);
  expect(Object.isFrozen(state)).toBe(true);
  expect(itemsOf(list)).toHaveLength(3);
  expect(status.textContent).toBe("");
  expect(viewport.scrollTop).toBe(0);
  const kept = itemsOf(list);
  element.demoState = { opened: 3, hidden: false };
  expect(element.demoState).toBe(state);
  element.demoState = undefined;
  expect(element.demoState).toBe(state);
  element.demoState = { opened: 1, hidden: true };
  expect(itemsOf(list)).toEqual(kept.slice(0, 1));
  expect(list.hidden).toBe(true);
  const wrong: [unknown, RegExp][] = [
    [null, /^demoState: an object, not null$/],
    [{ opened: 5, hidden: false }, /^demoState\.opened: a whole number from 0 to 4, not 5$/],
    [{ opened: 1 }, /^demoState\.hidden: true or false, not undefined$/],
    [{ opened: 1, hidden: false, part: 2 }, /^demoState\.part: no field of the state of a demo$/],
  ];
  for (const [value, message] of wrong) {
    expect(() => Reflect.set(element, "demoState", value)).toThrow(message);
  }
  expect(element.demoState).toStrictEqual({ opened: 1, hidden: true });
  expect(told).toHaveLength(1);
});

test("without a worked example demoState is undefined and a state is a TypeError; another example starts its demo at the beginning, an equal one changes nothing, and taking it off takes the parts off and gives the focus to the pen", async () => {
  const { element, root, list, status, next, told } = await demo();
  next.click();
  next.click();
  const items = itemsOf(list);
  const state = element.demoState;
  // An equal example, of other objects: the parts stay.
  element.workedExample = structuredClone(workedExample());
  expect(element.demoState).toBe(state);
  expect(itemsOf(list)).toEqual(items);
  // Another example: its demo begins, with no event.
  element.workedExample = workedExample({ grid: "lines" });
  expect(element.demoState).toStrictEqual({ opened: 0, hidden: false });
  expect(itemsOf(list)).toHaveLength(0);
  expect(status.textContent).toBe("");
  next.click();
  next.focus();
  element.workedExample = undefined;
  expect(element.demoState).toBeUndefined();
  expect(itemsOf(list)).toHaveLength(0);
  expect(status.textContent).toBe("");
  expect(root.activeElement?.textContent).toBe("Pen");
  expect(() => {
    element.demoState = { opened: 0, hidden: false };
  }).toThrow(/^<novatrail-canvas> shows no worked example: the state of its demo/);
  element.demoState = undefined;
  expect(told).toHaveLength(3);
});

test("demochange goes up from the element and out of a consumer's shadow tree, with the state the element has", async () => {
  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "open" });
  const place = document.createElement("div");
  shadow.append(place);
  document.body.append(host);
  made.push(host);
  const { element, next } = await demo(undefined, place);
  let event: DemoChangeEvent | undefined;
  document.addEventListener("demochange", (each) => {
    event = each;
  });
  next.click();
  expect(event?.composed).toBe(true);
  expect(event?.bubbles).toBe(true);
  expect(event?.target).toBe(host);
  expect(event?.detail).toBe(element.demoState);
});

test("a screen reader reads the row, the statement and the list of the open parts in that order, in Chromium's own tree, a picture on an area of the sheet by its words", async () => {
  const { next } = await demo();
  for (let n = 0; n < 3; n++) next.click();
  const nodes = await accessibilityTree();
  const byId = new Map(nodes.map((node) => [node.nodeId, node]));
  const order: typeof nodes = [];
  const walk = (id: string): void => {
    const node = byId.get(id);
    if (node === undefined) return;
    if (!node.ignored) order.push(node);
    for (const child of node.childIds ?? []) walk(child);
  };
  const root = nodes[0];
  if (root !== undefined) walk(root.nodeId);
  const at = (found: (node: (typeof nodes)[number]) => boolean) => order.findIndex(found);
  const role = (node: (typeof nodes)[number]) => node.role?.value;
  const toolbar = at((node) => role(node) === "toolbar");
  const statement = at(
    (node) => role(node) === "StaticText" && String(node.name?.value).startsWith("A path is 20 m"),
  );
  const list = at((node) => role(node) === "list");
  expect(toolbar).toBeGreaterThanOrEqual(0);
  expect(statement).toBeGreaterThan(toolbar);
  expect(list).toBeGreaterThan(statement);
  const items = order.filter((node) => role(node) === "listitem");
  expect(items).toHaveLength(3);
  const pictures = order.filter((node) => role(node) === "image").map((node) => node.name?.value);
  expect(pictures).toEqual([
    "A lamp.",
    "A line for the path, cut into 4 equal gaps of 5 m, with a lamp at every mark.",
  ]);
});

test("with the sheet scrolled into sight Next brings the part into sight above it, where it stays once the frames have run, and Demo keeps the sheet where it was", async () => {
  const { element, list, next, demo: shown, viewport } = await demo(300);
  const view = () => probe(element).view as { vy: number };
  viewport.scrollTop = 400;
  await settle();
  expect(view().vy).toBeGreaterThan(0);
  next.click();
  const inSight = (item: Element | null) => {
    const box = item?.getBoundingClientRect();
    const port = viewport.getBoundingClientRect();
    return box !== undefined && box.top >= port.top - 0.5 && box.bottom <= port.bottom + 0.5;
  };
  expect(inSight(list.lastElementChild)).toBe(true);
  await settle();
  expect(inSight(list.lastElementChild)).toBe(true);
  next.click();
  await settle();
  viewport.scrollTop = 500;
  await settle();
  const vy = view().vy;
  expect(vy).toBeGreaterThan(0);
  shown.click();
  await settle();
  expect(view().vy).toBeCloseTo(vy, 1);
  shown.click();
  await settle();
  expect(view().vy).toBeCloseTo(vy, 1);
});

test("in a page that scrolls the element, Next brings the part into sight below the row, stuck at the consumer's offset", async () => {
  const { element, list, next, row } = await demo();
  element.style.setProperty("--novatrail-canvas-top", "30px");
  spacer(made);
  window.scrollTo(0, 300);
  await settle();
  expect(row.getBoundingClientRect().top).toBeCloseTo(30, 0);
  next.click();
  const item = list.lastElementChild?.getBoundingClientRect();
  expect(item?.top).toBeGreaterThanOrEqual(row.getBoundingClientRect().bottom - 0.5);
  expect(item?.bottom).toBeLessThanOrEqual(window.innerHeight);
  await settle();
  expect(list.lastElementChild?.getBoundingClientRect().top).toBeCloseTo(item?.top ?? 0, 0);
});

test("an element with a height on a page scrolled past its top: the row sticks over its container, and Next brings the part out from under it", async () => {
  const { list, next, row, viewport } = await demo(300);
  spacer(made);
  viewport.scrollTop = 400;
  window.scrollTo(0, 100);
  await settle();
  const port = viewport.getBoundingClientRect();
  expect(row.getBoundingClientRect().bottom).toBeGreaterThan(port.top + 1);
  next.click();
  const item = list.lastElementChild?.getBoundingClientRect();
  expect(item?.top).toBeGreaterThanOrEqual(row.getBoundingClientRect().bottom - 0.5);
  expect(item?.bottom).toBeLessThanOrEqual(viewport.getBoundingClientRect().bottom + 0.5);
});

test("a state given before the element is upgraded is taken after its example, and without one the element starts without it, with a warning", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const state = { opened: 2, hidden: true };
    const taken = upgraded(made, { demoState: state, workedExample: workedExample() });
    expect(taken.demoState).toStrictEqual(state);
    expect(taken.shadowRoot?.querySelectorAll(".parts li")).toHaveLength(2);
    expect(warn).not.toHaveBeenCalled();
    const left: NovatrailCanvas = upgraded(made, { demoState: state });
    expect(left.demoState).toBeUndefined();
    expect(warn).toHaveBeenCalledOnce();
  } finally {
    warn.mockRestore();
  }
});
