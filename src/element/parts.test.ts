import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import {
  type ExampleChange,
  moduleManifest,
  REMAINDERS,
  sheetTask,
  workedExample,
} from "../core/tasks.fixture.js";
import type { DemoChangeEvent, DemoState, NovatrailCanvas } from "./index.js";
import { Parts } from "./parts.js";
import { Pictures } from "./pictures.js";
import {
  accessibilityTree,
  arrive,
  type Colour,
  deferred,
  file,
  placed,
  QUARTERS,
  quarters,
  sameColours,
  settle,
  sheetColours,
  spacer,
  upgraded,
  watch,
} from "./pointer.fixture.js";
import { probe } from "./probe.js";

// The parts of a worked example's demo in Chromium (R42): the row's Next opens them one at a time
// into a numbered list between the statement and the sheet, and Demo hides and shows the whole
// demo; demoState tells how far the learner has gone, and demochange tells of the learner's own
// presses alone. A polite region tells a screen reader of the part just opened, the list keeps its
// items as they were built, and a part comes into sight at once, below the row of buttons. DEMO,
// the demo of the tests, has four parts: a paragraph, a picture beside the sheet, a picture on an
// area of it, and a paragraph. The pictures' files come from the consumer's media, each reference
// once, as the example comes, with the statement's (T64). A picture on an area stands on the layer
// of the author's demo, stretched over its area, and the sheet scrolls to the area as it opens
// (T61).

const made: HTMLElement[] = [];
// The decodes the element asks for, which arrive() waits for.
beforeEach(() => {
  vi.spyOn(HTMLImageElement.prototype, "decode");
});
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
  window.scrollTo(0, 0);
  vi.restoreAllMocks();
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

/** The pictures on areas of the sheet, on the layer of the author's demo, in its order (T61). */
const onTheSheet = (root: ShadowRoot): SVGImageElement[] => [
  ...root.querySelectorAll<SVGImageElement>(".show image"),
];

/**
 * A demo of DEMO, or of the example these changes make, whose pictures come from the consumer's
 * media — the file `give` gives for a reference — with every file come and decoded: what it asked
 * for, and the addresses the element made of the files and let go, in order.
 */
async function pictured(
  change?: ExampleChange,
  give: (ref: string) => Promise<Blob> = async () => file(),
) {
  const created = vi.spyOn(URL, "createObjectURL");
  const revoked = vi.spyOn(URL, "revokeObjectURL");
  const media = vi.fn(give);
  const shown = await demo();
  if (change !== undefined) shown.element.workedExample = workedExample(change);
  shown.element.media = media;
  // The loads first, however long the consumer's media takes: a file a canvas encodes may come
  // after the first task, and arrive() waits only for the decodes of files that have come.
  await new Promise((resolve) => setTimeout(resolve));
  await Promise.allSettled(media.mock.results.map(({ value }) => value));
  await arrive();
  return {
    ...shown,
    asked: () => media.mock.calls.map(([ref]) => ref),
    addresses: () => created.mock.results.map(({ value }) => String(value)),
    gone: () => revoked.mock.calls.map(([url]) => url),
  };
}

/** A lamp beside the sheet, the picture of DEMO's second part, in a statement. */
const LAMP = {
  picture: "pictures/lamp.png",
  alt: "A lamp, as the statement has it.",
  width: 60,
  height: 120,
};

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
  // On the sheet it stands all the same (T61).
  expect(onTheSheet(root)).toHaveLength(1);
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

test("a screen reader reads the row, the statement and the list of the open parts in that order, in Chromium's own tree, a picture on an area of the sheet by its words, and not the picture itself on the sheet", async () => {
  const { root: shadow, next } = await pictured();
  for (let n = 0; n < 3; n++) next.click();
  expect(onTheSheet(shadow)[0]?.getAttribute("href")).toMatch(/^blob:/);
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

test("a picture beside the sheet shows its file in its frame once it has come and is decoded, read by its words; till then, and if it never comes, the frame shows them, and a picture on an area is asked for as the example comes", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const lamp = deferred<Blob>();
  const media = vi.fn((ref: string) =>
    ref === "pictures/lamp.png" ? lamp.promise : Promise.reject(new Error("offline")),
  );
  const { element, list, next } = await demo();
  element.media = media;
  next.click();
  next.click();
  const frame = list.querySelector<HTMLElement>(".picture");
  expect(frame?.getAttribute("aria-label")).toBe("A lamp.");
  expect(frame?.textContent).toBe("A lamp.");
  lamp.resolve(file());
  await arrive();
  const image = frame?.querySelector("img");
  expect(image?.alt).toBe("A lamp.");
  expect(image?.src).toMatch(/^blob:/);
  expect(image?.naturalWidth).toBeGreaterThan(0);
  expect(frame?.hasAttribute("role")).toBe(false);
  expect(frame?.getBoundingClientRect().height).toBe(120);
  await expect
    .element(page.elementLocator(element).getByRole("img", { name: "A lamp." }))
    .toBeVisible();
  // The picture on an area was asked for with the example, before its part opened; it did not
  // come, and the one warning is of the picture.
  expect(media.mock.calls.map(([ref]) => ref)).toEqual([
    "pictures/lamp.png",
    "pictures/path-in-gaps.png",
  ]);
  expect(warn.mock.calls.map(([message]) => String(message))).toEqual([
    'the picture "pictures/path-in-gaps.png" did not come: Error: offline',
  ]);
  // A new example asks again for the file that did not come, and not for the one that did.
  element.workedExample = workedExample({ statement: [{ text: "Another example." }] });
  await arrive();
  expect(media.mock.calls.map(([ref]) => ref).slice(2)).toEqual(["pictures/path-in-gaps.png"]);
  expect(warn).toHaveBeenCalledTimes(2);
});

test("in a browser that keeps no decoded address at hand, a part's frame shows its words till its own picture decodes", async () => {
  const { list, next } = await pictured();
  vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(false);
  next.click();
  next.click();
  const frame = list.querySelector<HTMLElement>(".picture");
  expect(frame?.querySelector("img")).toBeNull();
  expect(frame?.getAttribute("aria-label")).toBe("A lamp.");
  await arrive();
  expect(frame?.querySelector("img")?.alt).toBe("A lamp.");
  expect(frame?.hasAttribute("role")).toBe(false);
});

test("one call of media for a reference, the statement's and the demo's alike, as the example comes; a part opened shows the statement's address at once, and so does one opened again after the consumer gave fewer", async () => {
  const { element, root, list, next, asked, addresses } = await pictured({
    statement: [{ text: "Look at the lamp." }, LAMP],
  });
  expect(asked()).toEqual(["pictures/lamp.png", "pictures/path-in-gaps.png"]);
  expect(addresses()).toHaveLength(2);
  const shown = root.querySelector<HTMLImageElement>(".statement img")?.src;
  expect(shown).toBe(addresses()[0]);
  next.click();
  next.click();
  // In the same press: the address is decoded, and the picture is whole.
  const image = list.querySelector("img");
  expect(image?.src).toBe(shown);
  expect(image?.complete).toBe(true);
  expect(image?.naturalWidth).toBeGreaterThan(0);
  element.demoState = { opened: 1, hidden: false };
  expect(list.querySelector("img")).toBeNull();
  next.click();
  expect(list.querySelector("img")?.src).toBe(shown);
  await arrive();
  expect(asked()).toHaveLength(2);
  expect(addresses()).toHaveLength(2);
});

test("a new example names its pictures before the last one's go: a file both name stays, one only the last named lets its address go at once, and taking the example off lets the rest go", async () => {
  const { element, list, next, asked, addresses, gone } = await pictured();
  const [lamp, path] = addresses();
  element.workedExample = workedExample({
    demo: [
      { picture: "pictures/lamp.png", alt: "A lamp.", width: 60, height: 120 },
      { picture: "pictures/posts.png", alt: "Posts.", width: 120, height: 40 },
    ],
  });
  expect(gone()).toEqual([path]);
  next.click();
  expect(list.querySelector("img")?.src).toBe(lamp);
  await arrive();
  expect(asked()).toEqual(["pictures/lamp.png", "pictures/path-in-gaps.png", "pictures/posts.png"]);
  element.workedExample = undefined;
  expect(gone()).toEqual([path, lamp, addresses()[2]]);
  expect(list.children).toHaveLength(0);
});

test("the files of a hidden demo stay: Demo hides and shows the list and the pictures on the sheet alone, as they were, asking for nothing and letting no address go", async () => {
  const { root, list, next, demo: shown, asked, gone } = await pictured();
  for (let n = 0; n < 3; n++) next.click();
  const image = list.querySelector("img");
  expect(image).not.toBeNull();
  const [onSheet] = onTheSheet(root);
  const layer = root.querySelector(".show g");
  if (!layer || !onSheet) throw new Error("no picture on the sheet");
  const changes = [watch(list), watch(layer)];
  shown.click();
  expect(onSheet.getBoundingClientRect().width).toBe(0);
  shown.click();
  await arrive();
  expect(
    changes.flatMap((change) => change().map(({ type, attributeName }) => [type, attributeName])),
  ).toEqual([
    ["attributes", "hidden"],
    ["attributes", "hidden"],
    ["attributes", "display"],
    ["attributes", "display"],
  ]);
  expect(list.querySelector("img")).toBe(image);
  expect(onTheSheet(root)).toEqual([onSheet]);
  expect(onSheet.getBoundingClientRect().width).toBeGreaterThan(0);
  expect(asked()).toHaveLength(2);
  expect(gone()).toEqual([]);
});

test("the addresses go when the element leaves the page and come back with it, the statement's and the list's alike, with no new call of media", async () => {
  const { element, root, next, asked, gone } = await pictured({ statement: [LAMP] });
  next.click();
  next.click();
  const before = [...root.querySelectorAll("img")].map((image) => image.src);
  expect(before).toHaveLength(2);
  element.remove();
  await Promise.resolve();
  await Promise.resolve();
  expect(gone()).toEqual([before[0], expect.stringMatching(/^blob:/)]);
  expect(root.querySelectorAll("img")).toHaveLength(0);
  expect(root.querySelector(".parts .picture")?.textContent).toBe("A lamp.");
  document.body.append(element);
  await arrive();
  const after = [...root.querySelectorAll("img")].map((image) => image.src);
  expect(after).toHaveLength(2);
  expect(after[0]).toBe(after[1]);
  expect(before).not.toContain(after[0]);
  expect((await fetch(after[0] ?? "")).ok).toBe(true);
  expect(asked()).toHaveLength(2);
});

test("a picture on an area stands on the layer of the author's demo once its part opens, stretched over the area, its corners at the area's, and of two that overlap the later stands over the earlier; in the same press it has its address, decoded", async () => {
  const over: Colour = [200, 0, 200];
  const { element, root, next, addresses } = await pictured(
    {
      demo: [
        {
          picture: "pictures/under.png",
          alt: "Under.",
          area: { left: 100, top: 100, width: 400, height: 300 },
        },
        {
          picture: "pictures/over.png",
          alt: "",
          area: { left: 300, top: 250, width: 400, height: 300 },
        },
      ],
    },
    (ref) => quarters(ref === "pictures/over.png" ? [over, over, over, over] : QUARTERS),
  );
  expect(onTheSheet(root)).toHaveLength(0);
  next.click();
  const [under] = onTheSheet(root);
  expect(addresses()).toContain(under?.getAttribute("href"));
  expect(
    ["x", "y", "width", "height", "preserveAspectRatio"].map((name) => under?.getAttribute(name)),
  ).toEqual(["100", "100", "400", "300", "none"]);
  // A tenth in from each corner of the area: a picture fitted in it, 2 : 1 in 4 : 3, would leave
  // the top and the bottom of the area bare.
  const corners = [
    [140, 130],
    [460, 130],
    [140, 370],
    [460, 370],
  ] as const;
  expect(sameColours(await sheetColours(element, corners), QUARTERS)).toEqual([
    true,
    true,
    true,
    true,
  ]);
  next.click();
  expect(onTheSheet(root).map((image) => image.getAttribute("y"))).toEqual(["100", "250"]);
  // The earlier alone, where they overlap, and the later alone.
  const shown = await sheetColours(element, [
    [140, 130],
    [460, 370],
    [680, 530],
  ]);
  expect(sameColours(shown, [QUARTERS[0] ?? over, over, over])).toEqual([true, true, true]);
});

test("a picture on the sheet shows nothing till its file is decoded, while its item says its words; its address goes when the element leaves the page and comes back with it, with no new call of media", async () => {
  const path = deferred<Blob>();
  const media = vi.fn((ref: string) =>
    ref === "pictures/path-in-gaps.png" ? path.promise : Promise.resolve(file()),
  );
  const { element, root, list, next } = await demo();
  element.media = media;
  for (let n = 0; n < 3; n++) next.click();
  const [image] = onTheSheet(root);
  expect(image?.hasAttribute("href")).toBe(false);
  expect(list.lastElementChild?.textContent).toMatch(/^A line for the path/);
  path.resolve(file());
  await arrive();
  const shown = image?.getAttribute("href");
  expect(shown).toMatch(/^blob:/);
  element.remove();
  await Promise.resolve();
  await Promise.resolve();
  expect(image?.hasAttribute("href")).toBe(false);
  document.body.append(element);
  await arrive();
  expect(image?.getAttribute("href")).toMatch(/^blob:/);
  expect(image?.getAttribute("href")).not.toBe(shown);
  expect(media).toHaveBeenCalledTimes(2);
});

test("the pictures on the sheet go and come with their parts: a state the consumer gives takes them off from the end and puts them back, hidden with a hidden demo; an equal example keeps them, and another begins with none and with its pictures in sight", async () => {
  const { element, root, next } = await pictured();
  for (let n = 0; n < 3; n++) next.click();
  const layer = root.querySelector(".show g");
  const [image] = onTheSheet(root);
  element.demoState = { opened: 2, hidden: false };
  expect(onTheSheet(root)).toHaveLength(0);
  expect(image?.isConnected).toBe(false);
  element.demoState = { opened: 4, hidden: true };
  const [back] = onTheSheet(root);
  expect(back?.getAttribute("href")).toMatch(/^blob:/);
  expect(layer?.getAttribute("display")).toBe("none");
  element.workedExample = structuredClone(workedExample());
  expect(onTheSheet(root)).toEqual([back]);
  element.workedExample = workedExample({ grid: "dots" });
  expect(onTheSheet(root)).toHaveLength(0);
  expect(layer?.hasAttribute("display")).toBe(false);
});

/** A worked example of one part: a picture on this area of the sheet. */
const onArea = (area: { left: number; top: number; width: number; height: number }) =>
  workedExample({ demo: [{ picture: "pictures/path.png", alt: "A path.", area }] });

test("Next brings a picture on an area into sight by its area, not by its item: in the element's own container, where the picture then stands over the area's box", async () => {
  const { element, root, list, next, viewport } = await demo(300);
  element.workedExample = onArea({ left: 100, top: 1100, width: 800, height: 200 });
  await settle();
  next.click();
  const spot = root.querySelector(".spot");
  const port = viewport.getBoundingClientRect();
  const box = spot?.getBoundingClientRect();
  expect(box?.top).toBeGreaterThanOrEqual(port.top - 0.5);
  expect(box?.bottom).toBeLessThanOrEqual(port.bottom + 0.5);
  expect(list.lastElementChild?.getBoundingClientRect().bottom).toBeLessThan(port.top);
  await settle();
  const drawn = onTheSheet(root)[0]?.getBoundingClientRect();
  const still = spot?.getBoundingClientRect();
  for (const side of ["left", "top", "width", "height"] as const) {
    expect(drawn?.[side]).toBeCloseTo(still?.[side] ?? Number.NaN, 0);
  }
  expect(still?.top).toBeCloseTo(box?.top ?? Number.NaN, 0);
});

test("in a page that scrolls the element, Next brings a picture's area out from under the row stuck at the consumer's offset", async () => {
  const { element, root, list, next, row } = await demo();
  element.workedExample = onArea({ left: 100, top: 1100, width: 800, height: 200 });
  element.style.setProperty("--novatrail-canvas-top", "30px");
  spacer(made);
  await settle();
  const spot = root.querySelector(".spot");
  // The area's top just under the top of the screen, under the row that sticks there.
  window.scrollTo(0, window.scrollY + (spot?.getBoundingClientRect().top ?? 0) - 10);
  await settle();
  next.click();
  const top = row.getBoundingClientRect().bottom;
  expect(spot?.getBoundingClientRect().top).toBeCloseTo(top, 0);
  expect(list.lastElementChild?.getBoundingClientRect().bottom).toBeLessThan(0);
});

test("Next brings a picture on an area taller than what is in sight into sight by its top, under the row, whether the area is above what is in sight or below it", async () => {
  const { element, root, next, viewport, row } = await demo(300);
  const top = () => root.querySelector(".spot")?.getBoundingClientRect().top;
  // From above: the container scrolled to the sheet's bottom, past the area's top.
  element.workedExample = onArea({ left: 0, top: 100, width: 1000, height: 1300 });
  await settle();
  viewport.scrollTop = viewport.scrollHeight;
  await settle();
  next.click();
  expect(top()).toBeCloseTo(viewport.getBoundingClientRect().top, 0);
  expect(top()).toBeCloseTo(row.getBoundingClientRect().bottom, 0);
  // From below: the container at its top, and the area's top under what is in sight.
  element.workedExample = onArea({ left: 0, top: 600, width: 1000, height: 800 });
  viewport.scrollTop = 0;
  await settle();
  next.click();
  expect(viewport.scrollTop).toBeGreaterThan(0);
  expect(top()).toBeCloseTo(viewport.getBoundingClientRect().top, 0);
});

test("on a workbook the demo fills the example's boxes with their values as its parts open: a value in the middle of its box, at the width of its text, its box named with it, the item of the list the box and its value; hidden with a hidden demo, gone when the consumer gives fewer (T85)", async () => {
  const { element, root } = await placed(made, 400);
  element.lang = "ru";
  element.workedExample = REMAINDERS;
  await settle();
  const boxes = () => [...root.querySelectorAll<SVGRectElement>(".print rect")];
  const values = () => [...root.querySelectorAll<SVGTextElement>(".print text[aria-hidden]")];
  expect(boxes()).toHaveLength(2);
  expect(values()).toEqual([]);
  expect(boxes().map((rect) => rect.getAttribute("aria-label"))).toEqual(["Окошко 1", "Окошко 2"]);
  const next = page.elementLocator(element).getByRole("button", { name: "Дальше" });
  await next.click();
  await next.click();
  // The first box holds its value, centred, on the line's baseline, as the layout measures it.
  const [five] = values();
  const box = boxes()[0];
  if (five === undefined || box === undefined) throw new Error("no value");
  expect(five.textContent).toBe("5");
  const width = Number(five.getAttribute("textLength"));
  expect(width).toBe(16);
  const left = Number(box.getAttribute("x"));
  expect(Number(five.getAttribute("x"))).toBe(left + Math.floor((100 - width) / 2));
  expect(boxes().map((rect) => rect.getAttribute("aria-label"))).toEqual([
    "Окошко 1: 5",
    "Окошко 2",
  ]);
  const list = root.querySelector("ol.parts");
  expect(list?.lastElementChild?.textContent).toBe("Окошко 1.1: 5");
  await next.click();
  expect(values().map((text) => text.textContent)).toEqual(["5", "3"]);
  // Hidden with the demo, back with it, and gone from the end when the consumer gives fewer parts.
  await page.elementLocator(element).getByRole("button", { name: "Показ" }).click();
  expect(values()).toEqual([]);
  expect(boxes().map((rect) => rect.getAttribute("aria-label"))).toEqual(["Окошко 1", "Окошко 2"]);
  await page.elementLocator(element).getByRole("button", { name: "Показ" }).click();
  expect(values()).toHaveLength(2);
  element.demoState = { opened: 2, hidden: false };
  expect(values().map((text) => text.textContent)).toEqual(["5"]);
  // Taking the example off takes the values off with its page.
  element.workedExample = undefined;
  expect(values()).toEqual([]);
});

test("a box the demo fills is told in the labels' language, English without lang, and anew when lang changes; another example of the same lines starts with its boxes empty (T85)", async () => {
  const { element, root } = await placed(made, 400);
  element.manifest = moduleManifest({ explanation: "en" });
  const remainders = (quotient: string) => ({
    statement: [{ text: "Share the apples into equal heaps." }],
    canvas: { kind: "workbook" as const },
    lines: [{ line: [{ text: "23 ÷ 4 =" }, { binding: "box", value: quotient }] }],
    demo: [{ fill: { line: 1, box: 1 } }],
  });
  element.workedExample = remainders("5");
  await settle();
  await page.elementLocator(element).getByRole("button", { name: "Next" }).click();
  const item = () => root.querySelector("ol.parts li");
  // No lang: the element's own labels, English, in the item and the region alike.
  expect(item()?.textContent).toBe("Box 1.1: 5");
  expect(item()?.getAttribute("lang")).toBe("en");
  expect(root.querySelector('[role="status"]')?.textContent).toBe("Part 1 of 1. Box 1.1: 5");
  // In the labels' language, which is not the list's, the module's.
  element.lang = "ru";
  expect(item()?.textContent).toBe("Окошко 1.1: 5");
  expect(item()?.getAttribute("lang")).toBe("ru");
  expect(root.querySelector("ol.parts")?.getAttribute("lang")).toBe("en");
  // Another example on the same page: no value of the last one stays in its box or its name.
  element.workedExample = remainders("6");
  const values = root.querySelectorAll(".print text[aria-hidden]");
  expect(values).toHaveLength(0);
  expect(root.querySelector(".print rect")?.getAttribute("aria-label")).toBe("Окошко");
});

test("the list on its own, before an element gives it its words, names a box it fills by the English label, under its own lang", () => {
  const parts = new Parts({ status: "status", parts: "parts" }, new Pictures());
  parts.show([{ fill: { line: 1, box: 2 } }], { opened: 1, hidden: false });
  const item = parts.list.firstElementChild;
  expect(item?.textContent).toBe("Box 1.2");
  expect(item?.getAttribute("lang")).toBe("en");
});
