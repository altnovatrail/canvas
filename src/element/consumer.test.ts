import type * as open from "@altnovatrail/spec/formatv0/open";
import { afterEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { type Anchor, type HistoryEvent, SHEET, type Submission } from "../core/index.js";
import {
  type DemoState,
  type ExportedSheet,
  type ExportedWorkbook,
  type Marks,
  NovatrailCanvas,
  type Task,
  type Tool,
} from "./index.js";

// The trial consumer (R27, R28, R32, R38, R39, R41, R42; RUN.md, T15, T41, T44, T49, T53, T55,
// T57, T59, T60): a page that takes the element as app is to take it. It gives the task and the module's
// manifest, of spec's types as app holds them, the media and the language, keeps the history of
// writing as historychange tells it and gives it back, hears the learner's choice of tool, reads
// which answer slots are filled, takes the work for checking at Check, and gives the tutor's marks
// back with their submission's context, then opens the sheet again in a new element. On a workbook
// it writes in the boxes and beside them, reads which are filled, takes the crop of each filled
// box, and gives a mark on a box back. A lesson's worked example it gives to a new element, where
// the learner writes nothing, opens the parts of its demo and hides it, while app keeps how far
// the learner has gone, as demochange tells it, and gives that back to a new element. It goes through the package's entry points alone, never the
// probe the other tests read. It writes as a script does: pointer events on the canvas in the
// element's open shadow root, at the points the canvas's rectangle gives. The learner's erasing,
// undo and clearing go through the sheet's own buttons, and the workbook's boxes are found the same
// way, by their roles and their Russian names.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
async function settle(): Promise<void> {
  await frame();
  await frame();
}

/** What the task's statement gives and asks: app's chips (R57 spec). */
const CHIPS = {
  givens: ["The path is 20 m long.", "A post stands every 4 m, from one end to the other."],
  unknown: "How many posts there are.",
};

/**
 * The open view of a task, as app is to have it from api, of spec's type (R73 spec): a statement
 * with a picture, what it gives and asks, and the answer anywhere on the sheet. The chips of what it
 * gives and asks are app's to show, and the element shows nothing of them (R57 spec).
 */
const TASK: open.Task = {
  id: "posts-along-a-path",
  statement: [
    { text: "How many posts stand along a path 20 m long, one every 4 m?" },
    { picture: "pictures/path.png", alt: "A path with posts along it", width: 200, height: 60 },
  ],
  ...CHIPS,
  canvas: { kind: "handwriting_sheet", grid: "squares", grid_step: 50 },
  items: [{ answer_slots: [{ binding: "anywhere" }] }],
};

/**
 * The open view of the task's module's manifest, whole, as app has it, of spec's type: the element
 * reads its format version, its height of digits, 16 px — not the format's 24, so that the test
 * sees the manifest's — and its explanation language, English, and passes over the rest.
 */
const MODULE: open.Manifest = {
  module_format_version: "0.2",
  id: "novatrail/olympiad-math",
  version: "0.1.0",
  title: "Olympiad mathematics, grades 1–6",
  subject: "mathematics",
  audience: { age_categories: ["under_13"] },
  languages: { explanation: "en" },
  canvas: { digit_height: 16 },
  authors: [{ name: "The NovaTrail authors" }],
  license: "Apache-2.0",
};

const PATH = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><rect width="200" height="60" fill="#eee"/></svg>`;

/**
 * The open view of a lesson's worked example, as app is to have it from api, of spec's type (R73
 * spec): a statement with a picture, a sheet ruled in lines, and the author's demo — a paragraph, a
 * picture on an area of the sheet and a paragraph (R58 spec).
 */
const EXAMPLE: open.WorkedExample = {
  statement: [
    { text: "How many posts stand along a path 12 m long, one every 4 m?" },
    { picture: "pictures/path.png", alt: "A path with posts along it", width: 200, height: 60 },
  ],
  canvas: { kind: "handwriting_sheet", grid: "lines" },
  demo: [
    { text: "Draw the path, and mark a post every 4 m." },
    {
      picture: "pictures/path.png",
      alt: "The path cut into 3 gaps of 4 m, with a post at every mark.",
      area: { left: 100, top: 100, width: 800, height: 240 },
    },
    { text: "12 ÷ 4 = 3 gaps, and one post more than gaps: 4 posts." },
  ],
};

/**
 * The open view of a workbook's task: two lines of one box, and one of two, «47 ÷ 6 = [ ] r [ ]»
 * (R51 spec).
 */
const BOOK: Task = {
  id: "tables-of-seven",
  statement: [{ text: "Fill in the boxes." }],
  canvas: { kind: "workbook" },
  items: [
    { line: [{ text: "7 ×" }, { binding: "box" }, { text: "= 56" }] },
    { line: [{ binding: "box" }, { text: "÷ 8 = 4" }] },
    { line: [{ text: "47 ÷ 6 =" }, { binding: "box" }, { text: "r" }, { binding: "box" }] },
  ],
};

/** app's sheet: the element with the task and the media, and the history it keeps for it. */
async function app(history?: readonly HistoryEvent[], task: Task = TASK) {
  const sheet = document.createElement("novatrail-canvas");
  sheet.style.width = "500px";
  sheet.style.height = "400px";
  // The language of app's interface: the sheet's buttons are labelled in it.
  sheet.lang = "ru";
  sheet.task = task;
  sheet.manifest = MODULE;
  sheet.media = async () => new Blob([PATH], { type: "image/svg+xml" });
  // The history first, then the marks: they hold on to its strokes.
  if (history !== undefined) sheet.history = history;
  // app listens on the element itself: an event of a sheet taken off the page reaches no ancestor.
  const store: HistoryEvent[] = [...(history ?? [])];
  sheet.addEventListener("historychange", ({ detail }) => {
    expect(detail.from).toBe(store.length);
    store.push(...detail.events);
  });
  // The tool the learner chooses with the sheet's own buttons, which app keeps up with.
  const chosen: Tool[] = [];
  sheet.addEventListener("toolchange", ({ detail }) => chosen.push(detail.tool));
  document.body.append(sheet);
  made.push(sheet);
  await settle();
  return { sheet, store, chosen };
}

/** The sheet's own buttons, as the learner finds them: by their roles and names, in Russian. */
function buttons(sheet: HTMLElement) {
  const within = page.elementLocator(sheet);
  return {
    pen: within.getByRole("radio", { name: "Перо" }),
    eraser: within.getByRole("radio", { name: "Ластик" }),
    undo: within.getByRole("button", { name: "Отменить" }),
    clear: within.getByRole("button", { name: "Очистить" }),
  };
}

/** The canvas of a sheet, and its rectangle on the page with the CSS pixels of a unit. */
function canvasOf(sheet: HTMLElement) {
  const canvas = sheet.shadowRoot?.querySelector("canvas");
  if (!canvas) throw new Error("the element has no canvas");
  // The sheet is not scrolled: a unit is the canvas's width over the sheet's, from its top left.
  const rect = canvas.getBoundingClientRect();
  return { canvas, rect, k: rect.width / SHEET.width };
}

/** A pointer on a sheet, at points of the sheet: a mouse's, pointerId 1, unless told otherwise. */
function pointer(sheet: HTMLElement, init: PointerEventInit = {}) {
  const { canvas } = canvasOf(sheet);
  const send = (type: string, x: number, y: number, state: PointerEventInit) => {
    const { rect, k } = canvasOf(sheet);
    const at = { clientX: rect.left + x * k, clientY: rect.top + y * k };
    const mouse = { pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true };
    canvas.dispatchEvent(new PointerEvent(type, { ...mouse, ...init, ...at, ...state }));
  };
  return {
    down: (x: number, y: number) =>
      send("pointerdown", x, y, { button: 0, buttons: 1, pressure: 0.5 }),
    move: (x: number, y: number) =>
      send("pointermove", x, y, { button: -1, buttons: 1, pressure: 0.5 }),
    up: (x: number, y: number) => send("pointerup", x, y, { button: 0, buttons: 0, pressure: 0 }),
  };
}

/** A level stroke at `y`, from `from` to `to`. */
function write(sheet: HTMLElement, y: number, from: number, to: number) {
  const hand = pointer(sheet);
  hand.down(from, y);
  hand.move((from + to) / 2, y);
  hand.move(to, y);
  hand.up(to, y);
}

/** The PNG signature, the first eight bytes of every PNG file. */
const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

/** A PNG of the work for checking, read as app would: its bytes, its header, its pixels decoded. */
async function decoded(png: Blob) {
  const bytes = new Uint8Array(await png.arrayBuffer());
  const header = new DataView(bytes.buffer);
  const bitmap = await createImageBitmap(png);
  const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext("2d");
  if (context === null) throw new Error("no context to read the crop with");
  context.drawImage(bitmap, 0, 0);
  const pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
  return {
    bytes,
    type: png.type,
    signature: [...bytes.subarray(0, 8)],
    size: [header.getUint32(16), header.getUint32(20)],
    decoded: [bitmap.width, bitmap.height],
    /** The grey of the pixel at (px, py) of the picture: ink is dark, paper 255. */
    grey: (px: number, py: number) => pixels[(py * bitmap.width + px) * 4] ?? 255,
  };
}

/** A sheet's crop, read as app would, and the grey of its pixel over a point of the sheet. */
async function read(work: ExportedSheet) {
  const picture = await decoded(work.png);
  const { width, height, sheetBox } = work.submission.crop;
  const [ymin, xmin, ymax, xmax] = sheetBox;
  /** The grey of the crop's pixel over a point of the sheet: sheet_box says where the crop lies. */
  const grey = (x: number, y: number) =>
    picture.grey(
      Math.floor(((x - xmin) / (xmax - xmin)) * width),
      Math.floor(((y - ymin) / (ymax - ymin)) * height),
    );
  return { ...picture, grey };
}

/** The work for checking, which a sheet with strokes has: the crop of a sheet. */
async function check(sheet: NovatrailCanvas): Promise<ExportedSheet> {
  const work = await sheet.exportWork();
  if (work === null || !("png" in work)) throw new Error("the sheet gave no work for checking");
  return work;
}

/** The work for checking, which a workbook with a box filled has: the crops of its boxes. */
async function checkBoxes(book: NovatrailCanvas): Promise<ExportedWorkbook> {
  const work = await book.exportWork();
  if (work === null || !("cells" in work)) throw new Error("the workbook gave no work of boxes");
  return work;
}

/** The bytes of the crops of a workbook's work, in its order. */
function bytesOf(work: ExportedWorkbook): Promise<Uint8Array[]> {
  return Promise.all(work.cells.map(async ({ png }) => new Uint8Array(await png.arrayBuffer())));
}

/** A workbook's boxes, as the learner finds them: by their role and their names, in Russian. */
function boxesOf(book: HTMLElement): Element[] {
  return page
    .elementLocator(book)
    .getByRole("img", { name: /^Окошко/ })
    .elements();
}

/** A level stroke across the middle of a box the learner sees, a quarter of its width in. */
function writeIn(book: HTMLElement, box: Element) {
  const { rect, k } = canvasOf(book);
  const { left, top, width, height } = box.getBoundingClientRect();
  const y = (top + height / 2 - rect.top) / k;
  write(book, y, (left + width / 4 - rect.left) / k, (left + (3 * width) / 4 - rect.left) / k);
}

/** A tutor's mark of a submission as app has it back from api, through JSON: on A unless told. */
function marksOf(submission: Submission, name: string, at: Anchor = { group: "A" }): Marks {
  return JSON.parse(JSON.stringify({ submission, marks: [{ kind: "frame", at, name }] }));
}

test("app's path: write, erase, undo and clear with the sheet's buttons, keep the history as it is told, give it back, check, and take the tutor's marks", async () => {
  const { sheet, store, chosen } = await app();
  const onDocument: Event[] = [];
  const listen = (event: Event) => onDocument.push(event);
  document.addEventListener("historychange", listen);
  try {
    // Check on an empty sheet: there is no work, and app asks for a solution first. The step's exit
    // condition that every answer slot holds something reads filled: the answer anywhere is empty.
    expect(sheet.filled).toEqual([[false]]);
    expect(await sheet.exportWork()).toBeNull();
    // What the statement gives and asks the element takes, and shows nothing of: app shows the
    // chips (R57 spec).
    const shown = sheet.shadowRoot?.textContent ?? "";
    for (const chip of [...CHIPS.givens, CHIPS.unknown]) {
      expect(shown).not.toContain(chip);
    }
    expect(shown).toContain("How many posts stand along a path");

    // «A», two lines 40 units apart, and «B» far off: a group is strokes within 50 units (R24).
    write(sheet, 100, 100, 300);
    write(sheet, 140, 100, 300);
    write(sheet, 600, 500, 800);
    // The learner erases «B» with the sheet's Eraser and takes up the Pen again: app hears both.
    await userEvent.click(buttons(sheet).eraser);
    write(sheet, 600, 600, 700);
    await userEvent.click(buttons(sheet).pen);
    expect(chosen).toEqual(["eraser", "pen"]);
    expect(sheet.tool).toBe("pen");
    // Undo brings «B» back, Clear takes everything off, and Undo brings it all back.
    await userEvent.click(buttons(sheet).undo);
    await userEvent.click(buttons(sheet).clear);
    await userEvent.click(buttons(sheet).undo);
    // Every action told, from the element, bubbling and leaving shadow trees: app's store is the
    // history.
    expect(onDocument).toHaveLength(7);
    expect(
      onDocument.every((event) => event.target === sheet && event.bubbles && event.composed),
    ).toBe(true);
    expect(store).toEqual(sheet.history);

    // A render gives the store back: nothing changes, and a stroke under way lands.
    const before = sheet.history;
    sheet.history = store;
    expect(sheet.history).toBe(before);
    const hand = pointer(sheet);
    hand.down(100, 220);
    hand.move(300, 220);
    sheet.history = [...store];
    hand.up(300, 220);
    expect(sheet.history).toHaveLength(before.length + 1);
    expect(store).toEqual(sheet.history);

    // Check: the crop as a PNG and the context of its submission, which app keeps. The answer
    // anywhere holds strokes now, so the step's exit condition holds (R42).
    expect(sheet.filled).toEqual([[true]]);
    const work = await check(sheet);
    const crop = await read(work);
    expect(crop.type).toBe("image/png");
    expect(crop.signature).toEqual(SIGNATURE);
    expect(crop.size).toEqual([work.submission.crop.width, work.submission.crop.height]);
    expect(crop.decoded).toEqual(crop.size);
    // The ink of the strokes where sheet_box puts them, and white far from them.
    expect(crop.grey(200, 100)).toBeLessThan(128);
    expect(crop.grey(650, 600)).toBeLessThan(128);
    expect(crop.grey(450, 400)).toBe(255);
    expect(work.submission.groups.map(({ label }) => label)).toEqual(["A", "B", "C"]);
    // At the height of digits the module's manifest gives, and the statement in its language,
    // while the buttons are in app's.
    expect(work.submission.crop.drawn).toBe(16);
    expect(sheet.shadowRoot?.querySelector(".statement")?.getAttribute("lang")).toBe("en");

    // The tutor's marks come back with the context, through JSON: a frame read by its name.
    sheet.marks = marksOf(work.submission, "Look at this line");
    await settle();
    await expect.element(page.getByRole("img", { name: "Look at this line" })).toBeVisible();
  } finally {
    document.removeEventListener("historychange", listen);
  }
});

test("a sheet opened again from app's store is the same sheet, its context and marks too, and goes on from where it was", async () => {
  const first = await app();
  write(first.sheet, 100, 100, 300);
  write(first.sheet, 140, 100, 300);
  write(first.sheet, 600, 500, 800);
  first.sheet.undo();
  write(first.sheet, 700, 500, 800);
  const work = await check(first.sheet);
  const marks = marksOf(work.submission, "These two lines");
  first.sheet.marks = marks;
  const kept = JSON.parse(JSON.stringify(first.store));
  first.sheet.remove();

  // Another element, as after the page is opened again: the history first, then the marks.
  const { sheet, store } = await app(kept);
  expect(sheet.history).toEqual(first.sheet.history);
  const again = await check(sheet);
  expect((await read(again)).bytes).toEqual((await read(work)).bytes);
  expect(again.submission).toEqual(work.submission);
  sheet.marks = marks;
  await settle();
  await expect.element(page.getByRole("img", { name: "These two lines" })).toBeVisible();

  // Undo goes on across the reload, and a stroke written right next to the old ones after it is a
  // group of its own: the clock goes on more than the groups' pause later.
  await userEvent.click(buttons(sheet).undo);
  expect(sheet.history.at(-1)?.kind).toBe("undo");
  write(sheet, 170, 100, 300);
  expect(store).toEqual(sheet.history);
  const groups = (await check(sheet)).submission.groups;
  expect(groups.map(({ ids }) => ids)).toEqual([[1, 2], [5]]);

  // Another element's context with the same IDs is not this sheet's.
  const other = await app();
  write(other.sheet, 900, 100, 300);
  write(other.sheet, 960, 100, 300);
  expect(() => {
    other.sheet.marks = marks;
  }).toThrow(TypeError);
});

test("a history without the marked strokes takes the marks off, and the next task is a new, empty element", async () => {
  const { sheet } = await app();
  write(sheet, 100, 100, 300);
  sheet.marks = marksOf((await check(sheet)).submission, "This line");
  await settle();
  await expect.element(page.getByRole("img", { name: "This line" })).toBeVisible();
  sheet.history = [];
  await settle();
  expect(sheet.marks).toBeUndefined();
  await expect.element(page.getByRole("img", { name: "This line" })).not.toBeInTheDocument();

  // The next task: a new element in place of the old one, with nothing of the old work.
  const next = document.createElement("novatrail-canvas");
  next.style.width = "500px";
  next.style.height = "400px";
  next.lang = "ru";
  next.task = TASK;
  next.manifest = MODULE;
  made.push(next);
  sheet.replaceWith(next);
  await settle();
  expect(await next.exportWork()).toBeNull();
  expect(next.undo()).toBe(false);
  expect(next.history).toEqual([]);
  // Nothing to undo nor to clear: the sheet's buttons say so, and the pen is the tool again.
  await expect
    .element(page.elementLocator(next).getByRole("button", { name: "Отменить", disabled: true }))
    .toBeVisible();
  await expect.element(buttons(next).pen).toBeChecked();
});

test("app's path through a lesson: after a task, its worked example on a new element, named so, with Next, Demo, Up and Down alone, on which the learner writes nothing", async () => {
  const { sheet, store } = await app();
  write(sheet, 100, 100, 300);
  expect(store).toHaveLength(1);
  // The lesson's next segment, its worked example: a new element in place of the task's (R20, R42).
  const example = document.createElement("novatrail-canvas");
  example.style.width = "500px";
  example.style.height = "400px";
  example.lang = "ru";
  example.manifest = MODULE;
  example.media = async () => new Blob([PATH], { type: "image/svg+xml" });
  example.workedExample = EXAMPLE;
  const told: unknown[] = [];
  example.addEventListener("historychange", ({ detail }) => told.push(detail));
  made.push(example);
  sheet.replaceWith(example);
  await settle();
  const within = page.elementLocator(example);
  await expect.element(within.getByRole("toolbar", { name: "Пример" })).toBeVisible();
  expect(
    within
      .getByRole("button")
      .elements()
      .map((each) => each.textContent),
  ).toEqual(["Дальше", "Показ", "Выше", "Ниже"]);
  await expect.element(within.getByText(/How many posts stand along a path 12 m/)).toBeVisible();
  await expect
    .element(within.getByRole("img", { name: "A path with posts along it" }))
    .toBeVisible();
  // The learner writes nothing on it, and app has nothing to keep, to read or to check.
  write(example, 100, 100, 300);
  expect(example.history).toEqual([]);
  expect(told).toEqual([]);
  expect(example.filled).toBeNull();
  expect(await example.exportWork()).toBeNull();
  // The segment after it is a new element too: a task is a TypeError on the example's.
  expect(() => {
    example.task = TASK;
  }).toThrow(TypeError);
  expect(example.workedExample).toBe(EXAMPLE);
});

test("app's path through a worked example's demo: it keeps how far the learner has gone as demochange tells it, and a new element it gives that to shows the same, telling nothing", async () => {
  let kept: DemoState | undefined;
  let told = 0;
  /** app's worked example: a new element, the example, and then the state app keeps, if any. */
  const lesson = async (state?: DemoState) => {
    const element = document.createElement("novatrail-canvas");
    element.style.width = "500px";
    element.style.height = "400px";
    element.lang = "ru";
    element.manifest = MODULE;
    // The example before its state, as the JSX of app's React is to have them (R42).
    element.workedExample = EXAMPLE;
    if (state !== undefined) element.demoState = state;
    element.addEventListener("demochange", ({ detail }) => {
      kept = detail;
      told += 1;
    });
    document.body.append(element);
    made.push(element);
    await settle();
    return element;
  };
  const first = await lesson();
  expect(first.demoState).toEqual({ opened: 0, hidden: false });
  const within = page.elementLocator(first);
  const next = within.getByRole("button", { name: "Дальше" });
  await next.click();
  await next.click();
  expect(kept).toEqual({ opened: 2, hidden: false });
  expect(kept).toBe(first.demoState);
  expect(within.getByRole("listitem").elements()).toHaveLength(2);
  await within.getByRole("button", { name: "Показ", expanded: true }).click();
  expect(kept).toEqual({ opened: 2, hidden: true });
  expect(within.getByRole("listitem").elements()).toHaveLength(0);
  expect(told).toBe(3);
  // The next time the learner comes to the segment: a new element, as app gives every one (R20).
  first.remove();
  const again = await lesson(kept);
  expect(told).toBe(3);
  expect(again.demoState).toEqual({ opened: 2, hidden: true });
  const shown = page.elementLocator(again);
  await shown.getByRole("button", { name: "Показ", expanded: false }).click();
  expect(shown.getByRole("listitem").elements()).toHaveLength(2);
  expect(kept).toEqual({ opened: 2, hidden: false });
  await expect
    .element(shown.getByRole("button", { name: "Дальше" }))
    .not.toHaveAttribute("aria-disabled");
});

test("the height of digits is the manifest's at the moment of Check: another manifest between two checks gives another, and none gives 24", async () => {
  const { sheet } = await app();
  write(sheet, 100, 100, 300);
  write(sheet, 140, 100, 300);
  expect((await check(sheet)).submission.crop.drawn).toBe(16);
  sheet.manifest = { ...MODULE, canvas: { digit_height: 48 } };
  expect((await check(sheet)).submission.crop.drawn).toBe(48);
  sheet.manifest = undefined;
  expect((await check(sheet)).submission.crop.drawn).toBe(24);
  // A manifest app changes in place and gives again is read again.
  const kept = { ...MODULE, canvas: { digit_height: 40 } };
  sheet.manifest = kept;
  kept.canvas.digit_height = 20;
  sheet.manifest = kept;
  expect((await check(sheet)).submission.crop.drawn).toBe(20);
});

test("historychange goes out of a consumer's own shadow tree too, from the host it is in", async () => {
  // A consumer that is a custom element itself, with the sheet in its own shadow tree.
  const host = document.createElement("div");
  const root = host.attachShadow({ mode: "open" });
  const sheet = document.createElement("novatrail-canvas");
  sheet.style.width = "500px";
  sheet.style.height = "300px";
  root.append(sheet);
  document.body.append(host);
  made.push(host);
  await settle();
  const heard: (EventTarget | null)[] = [];
  const listen = (event: Event) => heard.push(event.target);
  document.addEventListener("historychange", listen);
  try {
    write(sheet, 100, 100, 300);
    expect(heard).toEqual([host]);
  } finally {
    document.removeEventListener("historychange", listen);
  }
});

test("a sheet taken off the page in the middle of a stroke tells its own listeners, and no one above", async () => {
  const { sheet, store } = await app();
  let onDocument = 0;
  const onPage = () => onDocument++;
  document.addEventListener("historychange", onPage);
  try {
    const hand = pointer(sheet);
    hand.down(100, 100);
    hand.move(300, 100);
    sheet.remove();
    expect(onDocument).toBe(0);
    expect(store).toEqual(sheet.history);
    expect(store.map((event) => event.kind)).toEqual(["write"]);
    // The stroke landed where it was, and a sheet off the page still gives its work.
    expect(await sheet.exportWork()).not.toBeNull();
  } finally {
    document.removeEventListener("historychange", onPage);
  }
});

test("app's path on a workbook: write in its boxes and beside them, read which are filled, check, take a mark on a box, and open it again from the store", async () => {
  const first = await app(undefined, BOOK);
  const { sheet } = first;
  expect(await sheet.exportWork()).toBeNull();
  const boxes = boxesOf(sheet);
  expect(boxes).toHaveLength(4);
  // The remainder before the quotient, and a sum beside the lines: the draft, which goes nowhere.
  writeIn(sheet, boxes[3] as Element);
  writeIn(sheet, boxes[1] as Element);
  write(sheet, 700, 100, 300);
  expect(sheet.filled).toEqual([[false], [true], [false, true]]);

  // Check: the crop of each filled box, in the task's order, and the context app keeps.
  const work = await checkBoxes(sheet);
  expect(work.cells.map(({ item, slot }) => [item, slot])).toEqual([
    [2, 1],
    [3, 2],
  ]);
  for (const { png } of work.cells) {
    const crop = await decoded(png);
    expect(crop.type).toBe("image/png");
    expect(crop.signature).toEqual(SIGNATURE);
    expect(crop.decoded).toEqual(crop.size);
    // The box's stroke alone, in the middle of a crop of R25's least side, and paper round it.
    expect(crop.size).toEqual([200, 200]);
    expect(Math.min(crop.grey(100, 99), crop.grey(100, 100))).toBeLessThan(128);
    expect(crop.grey(100, 60)).toBe(255);
  }
  expect(work.submission.boxes).toEqual([
    { item: 2, slot: 1, ids: [2] },
    { item: 3, slot: 2, ids: [1] },
  ]);
  expect(JSON.parse(JSON.stringify(work.submission))).toEqual(work.submission);
  // The tutor's mark on the remainder's box comes back with the context: a frame read by its name.
  const marks = marksOf(work.submission, "Посмотри на остаток", { cell: { item: 3, slot: 2 } });
  sheet.marks = marks;
  await settle();
  await expect.element(page.getByRole("img", { name: "Посмотри на остаток" })).toBeVisible();

  // Opened again from the store, through JSON: the same boxes filled, the same crops and context,
  // and the mark back on its box.
  const kept = JSON.parse(JSON.stringify(first.store));
  sheet.remove();
  const again = await app(kept, BOOK);
  expect(again.sheet.filled).toEqual(sheet.filled);
  const reopened = await checkBoxes(again.sheet);
  expect(await bytesOf(reopened)).toEqual(await bytesOf(work));
  expect(reopened.submission).toEqual(work.submission);
  again.sheet.marks = marks;
  await settle();
  await expect.element(page.getByRole("img", { name: "Посмотри на остаток" })).toBeVisible();
});

test("the element is the package's, by its tag", () => {
  expect(document.createElement("novatrail-canvas")).toBeInstanceOf(NovatrailCanvas);
});
