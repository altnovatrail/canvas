import { afterEach, expect, test } from "vitest";
import type { View } from "../core/screen.js";
import { axeOf } from "./axe.fixture.js";
import { type ExportedPaper, NovatrailCanvas, type TracingState } from "./index.js";
import { at, buttonOf, settle, upgraded } from "./pointer.fixture.js";
import { probe } from "./probe.js";

// A task from paper in a browser (R87): the crop as tracing paper over a dotted sheet, its grip and
// its button atop the tools, a stroke on it from its corner, and the work for checking with the
// task's crop beside it.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

/** A task's crop: a PNG of 200 × 50 px, grey, as app cuts one, made on a canvas. */
async function crop(): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 50;
  const context = canvas.getContext("2d");
  if (context === null) throw new Error("no 2D context");
  context.fillStyle = "#ddd";
  context.fillRect(0, 0, 200, 50);
  context.fillStyle = "#000";
  context.fillRect(20, 20, 60, 10);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob === null ? reject(new Error("no PNG")) : resolve(blob))),
  );
}

async function paper(width = 500) {
  const element = document.createElement("novatrail-canvas");
  element.style.width = `${width}px`;
  document.body.append(element);
  made.push(element);
  const statement = await crop();
  element.paper = { statement };
  await settle();
  const root = element.shadowRoot;
  const canvas = root?.querySelector("canvas");
  const grip = root?.querySelector<HTMLButtonElement>("button.grip");
  if (!root || !canvas || !grip) throw new Error("the element has no tracing paper");
  // The paper shows, and takes strokes, once its picture is read.
  await expect.poll(() => grip.hidden).toBe(false);
  return { element, root, canvas, grip, statement, view: () => viewOf(element) };
}

function viewOf(element: HTMLElement): View {
  const { view } = probe(element);
  if (view === undefined) throw new Error("the element is not laid out");
  return view;
}

const mouse = { pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true };

/** A mouse's stroke on the canvas through the points of the sheet given, by a script. */
function write(canvas: HTMLCanvasElement, view: () => View, ...points: [number, number][]) {
  const send = (type: string, [x, y]: [number, number], init: PointerEventInit) =>
    canvas.dispatchEvent(
      new PointerEvent(type, { ...mouse, ...at(canvas, view(), x, y), ...init }),
    );
  const [first, ...rest] = points;
  if (first === undefined) return;
  send("pointerdown", first, { button: 0, buttons: 1, pressure: 0.5 });
  for (const point of rest) send("pointermove", point, { buttons: 1, pressure: 0.5 });
  send("pointerup", rest.at(-1) ?? first, { button: 0, buttons: 0 });
}

test("shows a dotted sheet, the tracing paper at its start, and its grip and button", async () => {
  const { element, root, grip } = await paper();
  expect(element.tracing).toEqual({ at: [180, 60], hidden: false });
  expect(root.querySelector(".grid")?.classList.contains("dots")).toBe(true);
  expect(grip.getAttribute("aria-label")).toBe("Move the task");
  expect(grip.hidden).toBe(false);
  expect(buttonOf(element, "Hide the task").hidden).toBe(false);
  expect(root.querySelector(".viewport")?.getAttribute("aria-label")).toBe("Task from paper");
});

test("has no violation axe finds, the tracing paper shown and hidden", async () => {
  const { element } = await paper();
  await axeOf(element);
  buttonOf(element, "Hide the task").click();
  await settle();
  await axeOf(element);
});

test("takes no task, no example and no tracing state without the paper", async () => {
  const { element } = await paper();
  expect(() => {
    element.task = {
      id: "t",
      statement: [],
      canvas: { kind: "handwriting_sheet" },
      items: [],
    } as never;
  }).toThrow(TypeError);
  const bare = document.createElement("novatrail-canvas");
  made.push(bare);
  expect(() => {
    bare.tracing = { at: [0, 0], hidden: false };
  }).toThrow(TypeError);
  expect(() => {
    bare.paper = { statement: "a crop" } as never;
  }).toThrow(TypeError);
});

test("writes a stroke begun on the tracing paper from its corner, and one elsewhere on the sheet", async () => {
  const { element, canvas, view } = await paper();
  write(canvas, view, [300, 100], [320, 110]);
  write(canvas, view, [300, 900], [320, 910]);
  const writes = element.history.filter((event) => event.kind === "write");
  expect(writes.map((event) => ("on" in event ? event.on : undefined))).toEqual([
    "tracing",
    undefined,
  ]);
  const [onPaper] = writes;
  if (onPaper?.kind !== "write") throw new Error("no stroke");
  expect(onPaper.stroke.points[0]?.x).toBeCloseTo(120, 0);
  expect(element.filled).toEqual([[true]]);
});

test("hides and shows the tracing paper by its button, which tells", async () => {
  const { element, grip } = await paper();
  const told: TracingState[] = [];
  element.addEventListener("tracingchange", (event) => told.push(event.detail));
  buttonOf(element, "Hide the task").click();
  await settle();
  expect(element.tracing?.hidden).toBe(true);
  expect(grip.hidden).toBe(true);
  buttonOf(element, "Show the task").click();
  expect(told.map(({ hidden }) => hidden)).toEqual([true, false]);
  // The consumer's state tells nothing.
  element.tracing = { at: [100, 200], hidden: false };
  expect(told).toHaveLength(2);
  expect(() => {
    element.tracing = { at: [2000, 0], hidden: false };
  }).toThrow(TypeError);
});

test("moves the tracing paper by its grip's keys, kept to the sheet", async () => {
  const { element, grip } = await paper();
  const told: TracingState[] = [];
  element.addEventListener("tracingchange", (event) => told.push(event.detail));
  grip.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
  expect(element.tracing?.at).toEqual([160, 60]);
  grip.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowUp", shiftKey: true, bubbles: true }),
  );
  expect(element.tracing?.at).toEqual([160, 0]);
  expect(told).toHaveLength(2);
});

test("gives the work for checking: the task's crop, and the crop of the paper and the strokes", async () => {
  const { element, canvas, view, statement } = await paper();
  expect(await element.exportWork()).toBeNull();
  write(canvas, view, [300, 100], [320, 140]);
  const work = (await element.exportWork()) as ExportedPaper | null;
  if (work === null || !("statement" in work)) throw new Error("no work of a task from paper");
  expect(work.statement).toBe(statement);
  expect(work.png.type).toBe("image/png");
  expect(work.submission.tracing).toEqual({ at: [180, 60], hidden: false });
  // The marks of its submission go back to it, and not once the paper has moved.
  element.marks = { submission: work.submission, marks: [] };
  element.tracing = { at: [100, 60], hidden: false };
  expect(element.marks).toBeUndefined();
});

test("keeps the paper's strokes in a history given back, and no sheet takes them", async () => {
  const { element, canvas, view } = await paper();
  write(canvas, view, [300, 100], [320, 110]);
  const history = element.history;
  const again = upgraded(made, { paper: element.paper, history, tracing: element.tracing });
  expect(again.history).toEqual(history);
  const sheet = document.createElement("novatrail-canvas");
  made.push(sheet);
  expect(() => {
    sheet.history = history;
  }).toThrow(TypeError);
  expect(() => {
    element.paper = undefined;
  }).toThrow(TypeError);
  expect(again).toBeInstanceOf(NovatrailCanvas);
});

test("draws a verdict at each answer's box, a tick or a cross on its halo, by its name, with no violation", async () => {
  const { element, root, canvas, view } = await paper();
  write(canvas, view, [300, 100], [320, 140]);
  const work = (await element.exportWork()) as ExportedPaper | null;
  if (work === null || !("statement" in work)) throw new Error("no work of a task from paper");
  element.marks = {
    submission: work.submission,
    marks: [
      { kind: "verdict", at: { box: [0, 0, 400, 300] }, correct: true, name: "Task 1: right" },
      { kind: "verdict", at: { box: [500, 0, 900, 300] }, correct: false, name: "Task 2: not yet" },
    ],
  };
  await settle();
  const signs = [...root.querySelectorAll<SVGGElement>(".marks g[role=img]")];
  expect(
    signs.map((sign) => [sign.getAttribute("aria-label"), sign.getAttribute("class")]),
  ).toEqual([
    ["Task 1: right", "right"],
    ["Task 2: not yet", "not-yet"],
  ]);
  expect(signs.every((sign) => sign.getAttribute("display") === null)).toBe(true);
  // A tick and a cross, the second below the first: each stands by its own answer.
  const [first, second] = signs.map((sign) => sign.getBoundingClientRect());
  if (!first || !second) throw new Error("no verdict drawn");
  expect(second.top).toBeGreaterThan(first.top);
  expect(first.width).toBeCloseTo(28, 0);
  await axeOf(element);
  // A verdict is a task from paper's: a sheet of the other kind takes none.
  expect(() => {
    element.marks = {
      submission: work.submission,
      marks: [{ kind: "verdict", at: { group: "A" }, correct: true, name: "Task 1" }],
    } as never;
  }).toThrow(/a box alone/);
});

test("draws the wavy line of «Show where» under its place, over its halo, by its name, with no violation", async () => {
  const { element, root, canvas, view } = await paper();
  write(canvas, view, [300, 100], [320, 140]);
  const work = (await element.exportWork()) as ExportedPaper | null;
  if (work === null || !("statement" in work)) throw new Error("no work of a task from paper");
  const name = "Tutor's mark: where the mistake is";
  element.marks = {
    submission: work.submission,
    marks: [{ kind: "wavy_line", at: { box: [0, 0, 1000, 1000] }, name }],
  };
  await settle();
  const lines = [...root.querySelectorAll<SVGGElement>(".marks g.wavy[role=img]")];
  expect(lines.map((line) => line.getAttribute("aria-label"))).toEqual([name]);
  const [line] = lines;
  if (!line) throw new Error("no wavy line");
  expect(line.getAttribute("display")).toBeNull();
  const [glow, stroke] = [...line.querySelectorAll("path")];
  expect(glow?.getAttribute("class")).toBe("glow");
  expect(stroke?.getAttribute("d")).toMatch(/^M[\d.]+ [\d.]+( Q[\d.]+ [\d.]+ [\d.]+ [\d.]+)+$/);
  expect(stroke?.getAttribute("d")).toBe(glow?.getAttribute("d"));
  expect(getComputedStyle(stroke as Element).stroke).toBe("rgb(232, 89, 12)");
  await axeOf(element);
  // A sheet that is no task from paper takes none.
  expect(() => {
    element.marks = {
      submission: work.submission,
      marks: [{ kind: "wavy_line", at: { group: "A" }, name }],
    } as never;
  }).toThrow(/a box alone/);
});
