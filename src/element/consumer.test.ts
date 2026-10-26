import { afterEach, expect, test } from "vitest";
import { page } from "vitest/browser";
import { type HistoryEvent, SHEET, type Submission } from "../core/index.js";
import { type ExportedWork, type Marks, NovatrailCanvas, type Task } from "./index.js";

// The trial consumer (R27; RUN.md, T15): a page that takes the element as app is to take it. It
// gives the task and the media, keeps the history of writing as historychange tells it and gives
// it back, takes the work for checking at Check, and gives the tutor's marks back with their
// submission's context, then opens the sheet again in a new element. It goes through the package's
// entry points alone, never the probe the other tests read. It writes as a script does: pointer
// events on the canvas in the element's open shadow root, at the points the canvas's rectangle
// gives.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
async function settle(): Promise<void> {
  await frame();
  await frame();
}

/** The open view of a task, as app is to have it from api: a statement with a picture. */
const TASK: Task = {
  canvas: { kind: "handwriting-sheet", grid: "squares", step: 50, digit: 24 },
  statement: [
    { text: "How many posts stand along a path 20 m long, one every 4 m?" },
    { picture: "path.svg", alt: "A path with posts along it", width: 200, height: 60 },
  ],
  lang: "en",
};

const PATH = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><rect width="200" height="60" fill="#eee"/></svg>`;

/** app's sheet: the element with the task and the media, and the history it keeps for it. */
async function app(history?: readonly HistoryEvent[]) {
  const sheet = document.createElement("novatrail-canvas");
  sheet.style.width = "500px";
  sheet.style.height = "400px";
  sheet.task = TASK;
  sheet.media = async () => new Blob([PATH], { type: "image/svg+xml" });
  // The history first, then the marks: they hold on to its strokes.
  if (history !== undefined) sheet.history = history;
  // app listens on the element itself: an event of a sheet taken off the page reaches no ancestor.
  const store: HistoryEvent[] = [...(history ?? [])];
  sheet.addEventListener("historychange", ({ detail }) => {
    expect(detail.from).toBe(store.length);
    store.push(...detail.events);
  });
  document.body.append(sheet);
  made.push(sheet);
  await settle();
  return { sheet, store };
}

/** A pointer on a sheet, at points of the sheet: a mouse's, pointerId 1, unless told otherwise. */
function pointer(sheet: HTMLElement, init: PointerEventInit = {}) {
  const canvas = sheet.shadowRoot?.querySelector("canvas");
  if (!canvas) throw new Error("the element has no canvas");
  const send = (type: string, x: number, y: number, state: PointerEventInit) => {
    // The sheet is not scrolled: a unit is the canvas's width over the sheet's, from its top left.
    const rect = canvas.getBoundingClientRect();
    const k = rect.width / SHEET.width;
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

/** The crop of the work for checking, read as app would: its bytes, and its pixels decoded. */
async function read(work: ExportedWork) {
  const { png, submission } = work;
  const bytes = new Uint8Array(await png.arrayBuffer());
  const header = new DataView(bytes.buffer);
  const bitmap = await createImageBitmap(png);
  const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext("2d");
  if (context === null) throw new Error("no context to read the crop with");
  context.drawImage(bitmap, 0, 0);
  const pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
  const { width, height, sheetBox } = submission.crop;
  const [ymin, xmin, ymax, xmax] = sheetBox;
  /** The grey of the crop's pixel over a point of the sheet: sheet_box says where the crop lies. */
  const grey = (x: number, y: number) => {
    const px = Math.floor(((x - xmin) / (xmax - xmin)) * width);
    const py = Math.floor(((y - ymin) / (ymax - ymin)) * height);
    return pixels[(py * width + px) * 4] ?? 255;
  };
  return {
    bytes,
    type: png.type,
    signature: [...bytes.subarray(0, 8)],
    size: [header.getUint32(16), header.getUint32(20)],
    decoded: [bitmap.width, bitmap.height],
    grey,
  };
}

/** The work for checking, which a sheet with strokes has. */
async function check(sheet: NovatrailCanvas): Promise<ExportedWork> {
  const work = await sheet.exportWork();
  if (work === null) throw new Error("the sheet gave no work for checking");
  return work;
}

/** The tutor's marks of a submission as app has them back from api, through JSON. */
function marksOf(submission: Submission, name: string): Marks {
  return JSON.parse(
    JSON.stringify({ submission, marks: [{ kind: "frame", at: { group: "A" }, name }] }),
  );
}

test("app's path: write and keep the history as it is told, give it back, check, and take the tutor's marks", async () => {
  const { sheet, store } = await app();
  const onDocument: Event[] = [];
  const listen = (event: Event) => onDocument.push(event);
  document.addEventListener("historychange", listen);
  try {
    // Check on an empty sheet: there is no work, and app asks for a solution first.
    expect(await sheet.exportWork()).toBeNull();

    // «A», two lines 40 units apart, and «B» far off: a group is strokes within 50 units (R24).
    write(sheet, 100, 100, 300);
    write(sheet, 140, 100, 300);
    write(sheet, 600, 500, 800);
    sheet.tool = "eraser";
    write(sheet, 600, 600, 700);
    sheet.tool = "pen";
    expect(sheet.undo()).toBe(true);
    expect(sheet.clear()).toBe(true);
    expect(sheet.undo()).toBe(true);
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

    // Check: the crop as a PNG and the context of its submission, which app keeps.
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
  expect(sheet.undo()).toBe(true);
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
  next.task = TASK;
  made.push(next);
  sheet.replaceWith(next);
  await settle();
  expect(await next.exportWork()).toBeNull();
  expect(next.undo()).toBe(false);
  expect(next.history).toEqual([]);
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

test("the element is the package's, by its tag", () => {
  expect(document.createElement("novatrail-canvas")).toBeInstanceOf(NovatrailCanvas);
});
