import { afterEach, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import type { View } from "../core/screen.js";
import { sheetTask, workedExample } from "../core/tasks.fixture.js";
import { axeOf } from "./axe.fixture.js";
import { type ExportedPaper, NovatrailCanvas, type TracingState } from "./index.js";
import { at, buttonOf, paperCrop, settle, upgraded } from "./pointer.fixture.js";
import { probe } from "./probe.js";

// A task from paper in a browser (R87): the crop as tracing paper over a dotted sheet, its grip and
// its button atop the tools, a stroke on it from its corner, and the work for checking with the
// task's crop beside it.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

async function paper(width = 500) {
  const element = document.createElement("novatrail-canvas");
  element.style.width = `${width}px`;
  document.body.append(element);
  made.push(element);
  const statement = await paperCrop();
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

/** A mouse's pointer event on the canvas at a point of the sheet, by a script. */
function sendOn(
  canvas: HTMLCanvasElement,
  view: () => View,
  type: string,
  [x, y]: [number, number],
  init: PointerEventInit,
) {
  canvas.dispatchEvent(new PointerEvent(type, { ...mouse, ...at(canvas, view(), x, y), ...init }));
}

/** A mouse's stroke on the canvas through the points of the sheet given, by a script. */
function write(canvas: HTMLCanvasElement, view: () => View, ...points: [number, number][]) {
  const send = (type: string, point: [number, number], init: PointerEventInit) =>
    sendOn(canvas, view, type, point, init);
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
  expect(root.querySelector(".tools")?.getAttribute("aria-label")).toBe("Task from paper buttons");
  // The tracing paper's layer shows the sheet by the view the others do.
  const matrix = (layer: string) => {
    const ctm = root.querySelector<SVGSVGElement>(`.stage > .${layer}`)?.getScreenCTM();
    return ctm && [ctm.a, ctm.d, ctm.e, ctm.f];
  };
  expect(matrix("tracing")).toEqual(matrix("template"));
  // The container is a region, by the kind's name, once it scrolls in a height of its own.
  element.style.height = "300px";
  await expect
    .poll(() => root.querySelector(".viewport")?.getAttribute("aria-label"))
    .toBe("Task from paper");
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

test("ends a stroke under way on the tracing paper when the paper is hidden", async () => {
  const { element, canvas, view } = await paper();
  sendOn(canvas, view, "pointerdown", [300, 100], { button: 0, buttons: 1, pressure: 0.5 });
  sendOn(canvas, view, "pointermove", [320, 110], { buttons: 1, pressure: 0.5 });
  buttonOf(element, "Hide the task").click();
  const writes = () => element.history.filter((event) => event.kind === "write");
  expect(writes().map((event) => ("on" in event ? event.on : undefined))).toEqual(["tracing"]);
  // The pointer goes on over a paper that is not there, and writes nothing more.
  sendOn(canvas, view, "pointermove", [340, 120], { buttons: 1, pressure: 0.5 });
  sendOn(canvas, view, "pointerup", [340, 120], { button: 0, buttons: 0 });
  expect(writes()).toHaveLength(1);
});

test("drops a stroke under way on the tracing paper when the paper goes", async () => {
  const { element, canvas, view } = await paper();
  sendOn(canvas, view, "pointerdown", [300, 100], { button: 0, buttons: 1, pressure: 0.5 });
  sendOn(canvas, view, "pointermove", [320, 110], { buttons: 1, pressure: 0.5 });
  element.paper = undefined;
  sendOn(canvas, view, "pointerup", [320, 110], { button: 0, buttons: 0 });
  expect(element.history).toEqual([]);
  expect(element.tracing).toBeUndefined();
});

test("keeps the tracing paper where it lies for a new object of the same crop", async () => {
  const { element, statement } = await paper();
  const told: TracingState[] = [];
  element.addEventListener("tracingchange", (event) => told.push(event.detail));
  element.tracing = { at: [100, 200], hidden: true };
  const again = { statement };
  element.paper = again;
  expect(element.paper).toBe(again);
  expect(element.tracing).toEqual({ at: [100, 200], hidden: true });
  // Another crop is another task: its paper starts again.
  element.paper = { statement: await paperCrop() };
  expect(element.tracing).toEqual({ at: [180, 60], hidden: false });
  expect(told).toHaveLength(0);
});

test("brings a paper given wholly off the sheet at its real size onto it once its picture is read", async () => {
  const element = document.createElement("novatrail-canvas");
  element.style.width = "500px";
  document.body.append(element);
  made.push(element);
  const told: TracingState[] = [];
  element.addEventListener("tracingchange", (event) => told.push(event.detail));
  // A tall crop: 175 × 700 on the sheet, and the largest paper, 800 wide, till it is read.
  element.paper = { statement: await paperCrop(50, 200) };
  element.tracing = { at: [-750, 100], hidden: false };
  expect(element.tracing).toEqual({ at: [-750, 100], hidden: false });
  await expect.poll(() => element.tracing?.at).toEqual([0, 100]);
  expect(told).toHaveLength(0);
});

test("hides a mark on the tracing paper's strokes with the paper", async () => {
  const { element, root, canvas, view } = await paper();
  write(canvas, view, [300, 100], [320, 140]);
  const work = (await element.exportWork()) as ExportedPaper | null;
  if (work === null || !("statement" in work)) throw new Error("no work of a task from paper");
  const [group] = work.submission.groups;
  if (group === undefined) throw new Error("no group");
  element.marks = {
    submission: work.submission,
    marks: [{ kind: "frame", at: { group: group.label }, name: "Look here" }],
  };
  await settle();
  const frame = root.querySelector(".marks rect[role=img]");
  expect(frame?.getAttribute("display")).toBeNull();
  buttonOf(element, "Hide the task").click();
  await settle();
  expect(frame?.getAttribute("display")).toBe("none");
  buttonOf(element, "Show the task").click();
  await settle();
  expect(frame?.getAttribute("display")).toBeNull();
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
  // A verdict's place is 28 CSS px square, 24 units: the halo's circle leaves its hairline room.
  expect((signs[0]?.getScreenCTM()?.a ?? 0) * 24).toBeCloseTo(28, 3);
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

test("takes no worked example while it shows a paper, nor a paper while it shows a task or an example, and the same paper or no state changes nothing", async () => {
  const { element } = await paper();
  expect(() => {
    element.workedExample = workedExample();
  }).toThrow(/shows a task from paper: a worked example/);
  const given = element.paper;
  const state = element.tracing;
  element.paper = given;
  element.tracing = undefined;
  expect(element.paper).toBe(given);
  expect(element.tracing).toBe(state);
  const statement = await paperCrop();
  const tasked = document.createElement("novatrail-canvas");
  made.push(tasked);
  tasked.task = sheetTask();
  expect(() => {
    tasked.paper = { statement };
  }).toThrow(/shows a task: a task from paper/);
  const example = document.createElement("novatrail-canvas");
  made.push(example);
  example.workedExample = workedExample();
  expect(() => {
    example.paper = { statement };
  }).toThrow(/shows a worked example: a task from paper/);
});

test("moves the tracing paper by a drag of its grip, kept to the sheet, and tells once the drag is let go", async () => {
  const { element, grip, view } = await paper();
  const told: TracingState[] = [];
  element.addEventListener("tracingchange", (event) => told.push(event.detail));
  const { k } = view();
  const send = (type: string, init: PointerEventInit) =>
    grip.dispatchEvent(new PointerEvent(type, { ...mouse, ...init }));
  // Another button than the main one starts no drag.
  send("pointerdown", { button: 2, buttons: 2, clientX: 100, clientY: 50 });
  send("pointermove", { buttons: 2, clientX: 140, clientY: 50 });
  expect(element.tracing?.at).toEqual([180, 60]);
  send("pointerdown", { button: 0, buttons: 1, clientX: 100, clientY: 50 });
  expect(grip.classList.contains("dragging")).toBe(true);
  // A second pointer starts no drag of its own, and its moves are none of this one's.
  send("pointerdown", { pointerId: 2, button: 0, buttons: 1, clientX: 0, clientY: 0 });
  send("pointermove", { pointerId: 2, buttons: 1, clientX: 400, clientY: 400 });
  send("pointerup", { pointerId: 2, button: 0, buttons: 0, clientX: 400, clientY: 400 });
  expect(element.tracing?.at).toEqual([180, 60]);
  send("pointermove", { buttons: 1, clientX: 100 - 40 * k, clientY: 50 + 20 * k });
  expect(element.tracing?.at[0]).toBeCloseTo(140, 6);
  expect(element.tracing?.at[1]).toBeCloseTo(80, 6);
  expect(told).toHaveLength(0);
  send("pointerup", { button: 0, buttons: 0, clientX: 100 - 40 * k, clientY: 50 + 20 * k });
  expect(grip.classList.contains("dragging")).toBe(false);
  expect(told).toHaveLength(1);
  expect(told[0]?.at[0]).toBeCloseTo(140, 6);
  // A drag far beyond the sheet's edge leaves the paper at it; a cancelled one ends there too.
  send("pointerdown", { button: 0, buttons: 1, clientX: 100, clientY: 50 });
  send("pointermove", { buttons: 1, clientX: 100 - 2000 * k, clientY: 50 - 2000 * k });
  send("pointercancel", { buttons: 0, clientX: 100 - 2000 * k, clientY: 50 - 2000 * k });
  expect(element.tracing?.at).toEqual([0, 0]);
  expect(told).toHaveLength(2);
  // A drag that leaves the paper where it was tells nothing.
  send("pointerdown", { button: 0, buttons: 1, clientX: 100, clientY: 50 });
  send("pointermove", { buttons: 1, clientX: 100 - 50 * k, clientY: 50 });
  send("pointerup", { button: 0, buttons: 0, clientX: 100 - 50 * k, clientY: 50 });
  expect(told).toHaveLength(2);
});

test("moves the tracing paper by every arrow, and takes no other key nor an arrow with Ctrl, Alt or Meta", async () => {
  const { element, grip } = await paper();
  const told: TracingState[] = [];
  element.addEventListener("tracingchange", (event) => told.push(event.detail));
  const press = (key: string, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
    grip.dispatchEvent(event);
    return event.defaultPrevented;
  };
  expect(press("ArrowRight")).toBe(true);
  expect(press("ArrowDown", { shiftKey: true })).toBe(true);
  expect(element.tracing?.at).toEqual([200, 160]);
  expect(press("a")).toBe(false);
  for (const modifier of ["ctrlKey", "altKey", "metaKey"]) {
    expect(press("ArrowLeft", { [modifier]: true })).toBe(false);
  }
  expect(element.tracing?.at).toEqual([200, 160]);
  expect(told).toHaveLength(2);
  // At the sheet's edge an arrow toward it moves nothing, and tells nothing.
  press("ArrowUp", { shiftKey: true });
  press("ArrowUp", { shiftKey: true });
  expect(element.tracing?.at).toEqual([200, 0]);
  press("ArrowUp");
  expect(told).toHaveLength(4);
});

test("shows the grip's name in a tooltip on a mouse's hover, not a finger's touch, and Escape dismisses it", async () => {
  const { root, grip } = await paper();
  const tip = root.querySelector<HTMLElement>(".grip-tip");
  if (!tip) throw new Error("the grip has no tooltip");
  expect(tip.hidden).toBe(true);
  grip.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "touch" }));
  expect(tip.hidden).toBe(true);
  await userEvent.hover(grip);
  expect(tip.hidden).toBe(false);
  expect(tip.textContent).toBe("Move the task");
  expect(tip.getAttribute("aria-hidden")).toBe("true");
  // Another key passes it by; Escape dismisses it, the pointer still on the grip.
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
  expect(tip.hidden).toBe(false);
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  expect(tip.hidden).toBe(true);
  // The pointer leaves and comes back: it shows again, and a drag dismisses it.
  grip.dispatchEvent(new PointerEvent("pointerleave"));
  grip.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "mouse" }));
  expect(tip.hidden).toBe(false);
  grip.dispatchEvent(new PointerEvent("pointerdown", { ...mouse, button: 0, buttons: 1 }));
  expect(tip.hidden).toBe(true);
  grip.dispatchEvent(new PointerEvent("pointerup", { ...mouse, button: 0, buttons: 0 }));
  grip.dispatchEvent(new PointerEvent("pointerleave"));
  // The focus shows it as the browser shows the focus, and its loss hides it.
  grip.focus();
  expect(tip.hidden).toBe(!grip.matches(":focus-visible"));
  grip.blur();
  expect(tip.hidden).toBe(true);
});

test("names the button atop the tools by the paper's state in its tooltip too, as it is pressed", async () => {
  const { element, root } = await paper();
  const tip = root.querySelector<HTMLElement>(".tip:not(.grip-tip)");
  if (!tip) throw new Error("the bar has no tooltip");
  const button = buttonOf(element, "Hide the task");
  await userEvent.hover(button);
  expect(tip.textContent).toBe("Hide the task");
  button.click();
  expect(button.textContent).toBe("Show the task");
  expect(tip.textContent).toBe("Show the task");
});

test("lays the crop's picture and both layers' strokes into the picture of the work, the paper hidden or not", async () => {
  const { element, canvas, view } = await paper();
  write(canvas, view, [300, 100], [340, 100]);
  write(canvas, view, [300, 900], [340, 900]);
  for (const hidden of [false, true]) {
    if (hidden) buttonOf(element, "Hide the task").click();
    const bitmap = await createImageBitmap(await element.exportPicture());
    const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext("2d");
    if (context === null) throw new Error("no context to read the picture with");
    context.drawImage(bitmap, 0, 0);
    const gray = (x: number, y: number) => context.getImageData(x, y, 1, 1).data[0];
    // The crop is 800 × 200 on the sheet at [180, 60]: its grey paper, its black bar, the
    // stroke on it, the stroke on the sheet, and the sheet's white.
    expect(gray(220, 70), "the crop's paper").toBe(221);
    expect(gray(400, 160), "the crop's print").toBe(0);
    expect(gray(320, 100), "the paper's stroke").toBeLessThan(100);
    expect(gray(320, 900), "the sheet's stroke").toBeLessThan(100);
    expect(gray(100, 1200), "the sheet").toBe(255);
  }
});

test("a crop the browser cannot read is a paper of the largest size, white in the work, and says so", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const element = document.createElement("novatrail-canvas");
    element.style.width = "500px";
    document.body.append(element);
    made.push(element);
    // A crop that goes before it is read is not the paper's: the one after it is.
    element.paper = { statement: await paperCrop() };
    element.paper = { statement: new Blob(["no picture"], { type: "image/png" }) };
    const grip = element.shadowRoot?.querySelector<HTMLButtonElement>("button.grip");
    await expect.poll(() => grip?.hidden).toBe(false);
    expect(warn).toHaveBeenCalledWith(
      "<novatrail-canvas> could not read the task's crop:",
      expect.anything(),
    );
    const edge = element.shadowRoot?.querySelector(".tracing rect.edge");
    expect([edge?.getAttribute("width"), edge?.getAttribute("height")]).toEqual(["800", "700"]);
    const canvas = element.shadowRoot?.querySelector("canvas");
    if (!canvas) throw new Error("no canvas");
    write(canvas, () => viewOf(element), [300, 100], [320, 140]);
    const work = (await element.exportWork()) as ExportedPaper | null;
    expect(work?.png.type).toBe("image/png");
    // The same sheet asked again gives the same work.
    const again = (await element.exportWork()) as ExportedPaper | null;
    expect(again?.submission).toEqual(work?.submission);
  } finally {
    warn.mockRestore();
  }
});

test("ends an erasing under way on the tracing paper when the paper is hidden, and drops one when the paper goes", async () => {
  const { element, canvas, view } = await paper();
  write(canvas, view, [300, 100], [340, 100]);
  buttonOf(element, "Eraser").click();
  sendOn(canvas, view, "pointerdown", [320, 100], { button: 0, buttons: 1, pressure: 0.5 });
  sendOn(canvas, view, "pointermove", [322, 100], { buttons: 1, pressure: 0.5 });
  buttonOf(element, "Hide the task").click();
  expect(element.history.map(({ kind }) => kind)).toEqual(["write", "erase"]);
  sendOn(canvas, view, "pointerup", [322, 100], { button: 0, buttons: 0 });
  expect(element.history).toHaveLength(2);
  // On a paper with no strokes an erasing under way goes with the paper, and the sheet stays.
  const other = await paper();
  buttonOf(other.element, "Eraser").click();
  sendOn(other.canvas, other.view, "pointerdown", [600, 200], { button: 0, buttons: 1 });
  sendOn(other.canvas, other.view, "pointermove", [602, 200], { buttons: 1 });
  other.element.paper = undefined;
  expect(other.element.tracing).toBeUndefined();
  sendOn(other.canvas, other.view, "pointerup", [602, 200], { button: 0, buttons: 0 });
  expect(other.element.history).toEqual([]);
});
