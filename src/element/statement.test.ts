import { afterEach, beforeEach, expect, type MockInstance, test, vi } from "vitest";
import { page } from "vitest/browser";
import type { View } from "../core/screen.js";
import { moduleManifest, sheetTask } from "../core/tasks.fixture.js";
import { type Media, NovatrailCanvas, type Task } from "./index.js";
import { at, level } from "./pointer.fixture.js";
import { probe } from "./probe.js";

// The task's statement above the sheet in Chromium (R23): its text, its language, which the
// module's manifest gives (R32), and its pictures, which come from the consumer's media, the frames
// that stand in for them, and the addresses of their files, which go when the pictures leave.

const made: HTMLElement[] = [];
/** The decodes the element asks for: a picture shows only once its file is decoded. */
let decodes: MockInstance<HTMLImageElement["decode"]>;
beforeEach(() => {
  decodes = vi.spyOn(HTMLImageElement.prototype, "decode");
});
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
  vi.restoreAllMocks();
});

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
async function settle(): Promise<void> {
  await frame();
  await frame();
}

/**
 * The loads that settled run on, the pictures they gave decode, and the frames after them come.
 * It waits for the decodes themselves, not for a time: under the load of the whole suite a decode
 * can take longer than any time the test would guess.
 */
async function arrive(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve));
  await Promise.allSettled(decodes.mock.results.map((result) => result.value));
  await settle();
}

/** A sheet `width` CSS pixels wide, with a task, and media if given, before it is on the page. */
async function sheet(width: number, task: Task, media?: Media, height?: number) {
  const element = document.createElement("novatrail-canvas");
  element.style.width = `${width}px`;
  if (height !== undefined) element.style.height = `${height}px`;
  element.task = task;
  if (media !== undefined) element.media = media;
  document.body.append(element);
  made.push(element);
  await settle();
  const root = element.shadowRoot;
  const statement = root?.querySelector<HTMLElement>(".statement");
  const canvas = root?.querySelector("canvas");
  const viewport = root?.querySelector<HTMLElement>(".viewport");
  if (!root || !statement || !canvas || !viewport) throw new Error("the element has no statement");
  return { element, root, statement, canvas, viewport, view: () => viewOf(element) };
}

function viewOf(element: HTMLElement): View {
  const { view } = probe(element);
  if (view === undefined) throw new Error("the element is not laid out");
  return view;
}

/** A picture's file: a small SVG, which a browser shows. */
function file(colour = "#c33"): Blob {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20" fill="${colour}"/></svg>`;
  return new Blob([svg], { type: "image/svg+xml" });
}

/** A task with these pictures, each 120 × 60 CSS pixels, after a line of text. */
function withPictures(...pictures: [ref: string, alt: string][]): Task {
  return sheetTask({
    statement: [
      { text: "Look at the pictures." },
      ...pictures.map(([picture, alt]) => ({ picture, alt, width: 120, height: 60 })),
    ],
  });
}

/**
 * What changes in a node and under it from now on: the function it gives back stops watching and
 * gives every change, those not yet told too.
 */
function watch(node: Node): () => MutationRecord[] {
  const records: MutationRecord[] = [];
  const observer = new MutationObserver((list) => records.push(...list));
  observer.observe(node, { subtree: true, childList: true, attributes: true, characterData: true });
  return () => {
    records.push(...observer.takeRecords());
    observer.disconnect();
    return records;
  };
}

/** A promise and the hands that settle it. */
function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  let reject: (reason: unknown) => void = () => {};
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

test("the statement stands above the sheet as text, in the module's language, and the element is as tall as both and the row of buttons", async () => {
  const { element, root, statement, canvas, view } = await sheet(
    400,
    sheetTask({
      statement: [{ text: "<b>Count</b> the posts." }, { text: "Then write the answer." }],
    }),
  );
  element.manifest = moduleManifest({ explanation: "ru" });
  const paragraphs = [...statement.querySelectorAll("p")];
  expect(paragraphs.map((paragraph) => paragraph.textContent)).toEqual([
    "<b>Count</b> the posts.",
    "Then write the answer.",
  ]);
  // Markup in the text is text.
  expect(statement.querySelector("b")).toBeNull();
  expect(statement.getAttribute("lang")).toBe("ru");
  const sheetBox = root.querySelector(".sheet")?.getBoundingClientRect();
  const above = statement.getBoundingClientRect();
  expect(sheetBox?.top).toBeGreaterThanOrEqual(above.bottom);
  // The row of the element's own buttons stands above the statement (R28).
  const row = root.querySelector(".tools")?.getBoundingClientRect();
  expect(above.top).toBeGreaterThanOrEqual(row?.bottom ?? Number.NaN);
  expect(element.getBoundingClientRect().height).toBeCloseTo(
    (row?.height ?? Number.NaN) + above.height + 1400 * 0.4,
    0,
  );

  // The sheet below the statement takes its strokes where they are on it.
  level(canvas, view(), 100, 100, 300);
  expect(probe(element).strokes[0]?.points[0]?.y).toBeCloseTo(100, 6);

  // The language is the module's, not the task's: a new task keeps it, and without a manifest the
  // statement is in the element's own.
  element.task = sheetTask({ statement: [{ text: "Another task of the module." }] });
  expect(statement.getAttribute("lang")).toBe("ru");
  element.manifest = undefined;
  expect(statement.hasAttribute("lang")).toBe(false);
});

test("a manifest in another language changes the statement's language alone, and its pictures stay", async () => {
  const { element, statement } = await sheet(
    400,
    withPictures(["pictures/posts.png", "Posts"]),
    async () => file(),
  );
  element.manifest = moduleManifest();
  await arrive();
  const image = statement.querySelector("img");
  expect(image).not.toBeNull();
  const changes = watch(statement);
  element.manifest = moduleManifest({ explanation: "ru" });
  // Another manifest of the same language writes nothing.
  element.manifest = moduleManifest({ explanation: "ru", digit_height: 48 });
  await arrive();
  expect(changes().map(({ type, attributeName }) => [type, attributeName])).toEqual([
    ["attributes", "lang"],
  ]);
  expect(statement.getAttribute("lang")).toBe("ru");
  expect(statement.querySelector("img")).toBe(image);
});

test("a manifest given before the element is upgraded is taken, and one it cannot read leaves it without, with a warning; after the upgrade such a manifest is a TypeError that changes nothing", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const upgrade = (manifest: unknown) => {
    const template = document.createElement("template");
    template.innerHTML = "<novatrail-canvas></novatrail-canvas>";
    const early = template.content.firstElementChild;
    if (!(early instanceof HTMLElement)) throw new Error("the template has no element");
    Reflect.set(early, "task", sheetTask());
    Reflect.set(early, "manifest", manifest);
    document.body.append(early);
    made.push(early);
    if (!(early instanceof NovatrailCanvas)) throw new Error("the element was not upgraded");
    expect(Object.hasOwn(early, "manifest")).toBe(false);
    return early;
  };
  const language = (element: HTMLElement) =>
    element.shadowRoot?.querySelector(".statement")?.getAttribute("lang");
  const russian = moduleManifest({ explanation: "ru" });
  const taken = upgrade(russian);
  expect(taken.manifest).toBe(russian);
  expect(language(taken)).toBe("ru");
  expect(warn).not.toHaveBeenCalled();

  const left = upgrade({ ...russian, module_format_version: "0.2" });
  expect(left.manifest).toBeUndefined();
  expect(language(left)).toBeNull();
  expect(warn).toHaveBeenCalledOnce();

  expect(() => {
    taken.manifest = { ...russian, canvas: { digit_height: 0 } };
  }).toThrow(TypeError);
  expect(taken.manifest).toBe(russian);
  expect(language(taken)).toBe("ru");
});

test("each picture comes from the consumer's media, in a frame of its size until it does, and a screen reader reads each by what it shows", async () => {
  const media = vi.fn(async (_ref: string) => file());
  const { root } = await sheet(
    400,
    withPictures(
      ["pictures/posts.png", "A path with posts along it"],
      ["pictures/clock.png", "A clock at three"],
    ),
    media,
  );
  const frames = [...root.querySelectorAll<HTMLElement>(".picture")];
  expect(frames.map((frame) => frame.style.width)).toEqual(["120px", "120px"]);
  await arrive();
  expect(media.mock.calls.map(([ref]) => ref)).toEqual([
    "pictures/posts.png",
    "pictures/clock.png",
  ]);
  const images = [...root.querySelectorAll("img")];
  expect(images.map((image) => image.alt)).toEqual([
    "A path with posts along it",
    "A clock at three",
  ]);
  expect(images.every((image) => image.src.startsWith("blob:") && image.naturalWidth > 0)).toBe(
    true,
  );
  expect(frames.every((frame) => frame.getBoundingClientRect().height === 60)).toBe(true);

  await expect.element(page.getByRole("img", { name: "A path with posts along it" })).toBeVisible();
  await expect.element(page.getByRole("img", { name: "A clock at three" })).toBeVisible();
  // The grid, the canvas and the tutor's layer are not read as pictures.
  expect(page.getByRole("img").elements()).toHaveLength(2);
});

test("a picture that does not come keeps its frame, which shows and names what it shows; one that only decorates shows nothing", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const media = (ref: string): Promise<Blob> => {
    if (ref === "pictures/throws.png") throw new Error("no such file");
    if (ref === "pictures/rejects.png") return Promise.reject(new Error("offline"));
    if (ref === "pictures/no-blob.png") return Promise.resolve("posts" as unknown as Blob);
    if (ref === "pictures/broken.png") {
      return Promise.resolve(new Blob(["not a picture"], { type: "image/png" }));
    }
    return Promise.reject(new Error("offline"));
  };
  const task = withPictures(
    ["pictures/throws.png", "Posts 1"],
    ["pictures/rejects.png", "Posts 2"],
    ["pictures/no-blob.png", "Posts 3"],
    ["pictures/broken.png", "Posts 4"],
    ["pictures/decoration.png", ""],
  );
  const { root } = await sheet(400, task, media);
  await arrive();
  const frames = [...root.querySelectorAll<HTMLElement>(".picture")];
  expect(root.querySelectorAll("img")).toHaveLength(0);
  for (const [i, frame] of frames.slice(0, 4).entries()) {
    expect(frame.getAttribute("role")).toBe("img");
    expect(frame.getAttribute("aria-label")).toBe(`Posts ${i + 1}`);
    expect(frame.textContent).toBe(`Posts ${i + 1}`);
    await expect.element(page.getByRole("img", { name: `Posts ${i + 1}` })).toBeVisible();
  }
  const decoration = frames[4];
  expect(decoration?.hasAttribute("role")).toBe(false);
  expect(decoration?.textContent).toBe("");
  // A warning for each picture that did not come.
  expect(warn).toHaveBeenCalledTimes(5);
});

test("a picture of a task that has gone never comes into the next, a picture asked for once is asked for once, and a new media function serves the pictures without a file, stopping no load under way", async () => {
  const loads = new Map<string, ReturnType<typeof deferred<Blob>>>();
  const first = vi.fn((ref: string) => {
    const load = deferred<Blob>();
    loads.set(ref, load);
    return load.promise;
  });
  const { element, root } = await sheet(
    400,
    withPictures(["pictures/old.png", "The old one"]),
    first,
  );
  await settle();
  element.task = withPictures(["pictures/new.png", "The new one"]);
  await settle();
  loads.get("pictures/old.png")?.resolve(file());
  await arrive();
  expect(root.querySelectorAll("img")).toHaveLength(0);
  expect(root.querySelector(".picture")?.getAttribute("aria-label")).toBe("The new one");

  // The same picture again, while it is still on its way: no second call, and none for a new
  // function either.
  element.task = withPictures(["pictures/new.png", "The new one, again"]);
  const second = vi.fn(async (_ref: string) => file("#3c3"));
  element.media = second;
  await settle();
  expect(first.mock.calls.map(([ref]) => ref)).toEqual(["pictures/old.png", "pictures/new.png"]);
  expect(second).not.toHaveBeenCalled();
  loads.get("pictures/new.png")?.resolve(file());
  await arrive();
  expect(root.querySelector("img")?.alt).toBe("The new one, again");

  // A picture still in the statement keeps its file: a new task with it shows it at once.
  element.task = withPictures(
    ["pictures/new.png", "The new one, once more"],
    ["pictures/old.png", "The old one"],
  );
  await arrive();
  expect([...root.querySelectorAll("img")].map((image) => image.alt)).toEqual([
    "The new one, once more",
    "The old one",
  ]);
  // The old picture's file came when it had left the statement, and was not kept: the newest
  // function gives it, and nothing gives the one still shown again.
  expect(second.mock.calls.map(([ref]) => ref)).toEqual(["pictures/old.png"]);
  expect(first).toHaveBeenCalledTimes(2);
});

test("a new grid leaves the statement and its pictures as they are", async () => {
  const task = withPictures(["pictures/posts.png", "Posts"]);
  const { element, statement } = await sheet(400, task, async () => file());
  await arrive();
  const image = statement.querySelector("img");
  expect(image).not.toBeNull();
  const changes = watch(statement);
  element.task = sheetTask({ statement: task.statement, grid: "dots", grid_step: 25 });
  await arrive();
  expect(changes()).toEqual([]);
  expect(statement.querySelector("img")).toBe(image);
});

test("the addresses of the pictures' files go when the pictures leave the task or the element the page, and come back with the element", async () => {
  const create = vi.spyOn(URL, "createObjectURL");
  const revoke = vi.spyOn(URL, "revokeObjectURL");
  const { element, root } = await sheet(
    400,
    withPictures(["pictures/posts.png", "Posts"]),
    async () => file(),
  );
  await arrive();
  const first = create.mock.results[0]?.value as string;
  expect(root.querySelector("img")?.src).toBe(first);

  element.task = withPictures(["pictures/clock.png", "A clock"]);
  expect(revoke).toHaveBeenCalledWith(first);
  await expect(fetch(first)).rejects.toThrow();
  await arrive();

  // Moved within one task: nothing goes.
  const elsewhere = document.createElement("div");
  document.body.append(elsewhere);
  made.push(elsewhere);
  const before = revoke.mock.calls.length;
  elsewhere.append(element);
  await arrive();
  expect(revoke.mock.calls.length).toBe(before);
  const shown = root.querySelector("img")?.src;
  expect(shown).toBeDefined();

  // Off the page: the address goes, after the moment a move would have taken.
  element.remove();
  await Promise.resolve();
  await Promise.resolve();
  expect(revoke).toHaveBeenCalledWith(shown);
  expect(root.querySelector("img")).toBeNull();
  if (shown !== undefined) await expect(fetch(shown)).rejects.toThrow();

  // Back on the page: the picture shows again, from the file the element kept.
  elsewhere.append(element);
  await arrive();
  const again = root.querySelector("img");
  expect(again?.alt).toBe("A clock");
  expect(again?.src).not.toBe(shown);
  expect((await fetch(again?.src ?? "")).ok).toBe(true);
});

test("with the statement in sight, the eraser takes nothing below the container's bottom, where the canvas goes on out of sight", async () => {
  const lines = Array.from({ length: 4 }, (_, i) => ({ text: `Line ${i + 1} of the statement.` }));
  const { element, canvas, viewport, view } = await sheet(
    400,
    sheetTask({ statement: lines }),
    undefined,
    300,
  );
  const shownBottom = viewport.getBoundingClientRect().bottom;
  const { top, bottom } = canvas.getBoundingClientRect();
  expect(bottom).toBeGreaterThan(shownBottom);
  // One stroke in sight, at 100, and one on the canvas but below the container: halfway between
  // the container's bottom and the canvas's.
  level(canvas, view(), 100, 100, 300);
  const hidden = Math.round(((shownBottom + bottom) / 2 - top) / view().k);
  expect(at(canvas, view(), 200, hidden).clientY).toBeGreaterThan(shownBottom);
  expect(at(canvas, view(), 200, hidden).clientY).toBeLessThan(
    canvas.getBoundingClientRect().bottom,
  );
  level(canvas, view(), hidden, 100, 300);
  element.tool = "eraser";
  const pointer = { pointerId: 9, pointerType: "mouse", isPrimary: true, bubbles: true };
  const event = (type: string, y: number, init: PointerEventInit) =>
    new PointerEvent(type, { ...pointer, ...at(canvas, view(), 200, y), ...init });
  canvas.dispatchEvent(event("pointerdown", 50, { button: 0, buttons: 1 }));
  canvas.dispatchEvent(event("pointermove", 150, { button: -1, buttons: 1 }));
  canvas.dispatchEvent(event("pointermove", hidden + 20, { button: -1, buttons: 1 }));
  canvas.dispatchEvent(event("pointerup", hidden + 20, { button: 0, buttons: 0 }));
  expect(probe(element).strokes.map((stroke) => stroke.id)).toEqual([2]);
});

test("a statement that grows while the sheet is scrolled keeps the top of the visible part where it was", async () => {
  const { element, viewport, view } = await sheet(
    400,
    sheetTask({ statement: [{ text: "One line." }] }),
    undefined,
    300,
  );
  viewport.scrollTop = viewport.scrollHeight / 2;
  await settle();
  const vy = view().vy;
  expect(vy).toBeGreaterThan(0);
  element.task = sheetTask({
    statement: Array.from({ length: 6 }, (_, i) => ({
      text: `Line ${i + 1} of a longer statement.`,
    })),
  });
  await settle();
  expect(view().vy).toBeCloseTo(vy, 1);
});
