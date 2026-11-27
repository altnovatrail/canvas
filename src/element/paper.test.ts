import { afterEach, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { gridPath, thinned } from "../core/grid.js";
import type { View } from "../core/screen.js";
import { sheetTask, workedExample } from "../core/tasks.fixture.js";
import { axeOf } from "./axe.fixture.js";
import { type ExportedPaper, NovatrailCanvas, type TracingState } from "./index.js";
import {
  at,
  buttonOf,
  dotTiles,
  dotTilesOf,
  paperCrop,
  settle,
  upgraded,
} from "./pointer.fixture.js";
import { probe } from "./probe.js";

// A task from paper in a browser: the crop as tracing paper over a sheet of the learner's
// grid, dots as it comes, its grip and its button atop the tools, a stroke on it from its
// corner, and the work for checking with the task's crop beside it. The grid's button is
// tools.test.ts's.

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
  expect(element.tracing).toEqual({ at: [180, 60], hidden: false, scale: 1 });
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

test("a stroke written on the sheet under the tracing paper's marker leaves the canvas as a sheet drawn at once shows it", async () => {
  const { element, canvas, statement, view } = await paper();
  // A marker on the paper, across where the sheet's stroke will go.
  element.pens = { ...element.pens, pen: "marker" };
  write(canvas, view, [260, 100], [300, 104], [340, 100], [380, 104]);
  element.pens = { ...element.pens, pen: "pen" };
  await settle();
  // A pen's stroke begun on the sheet below the paper, up under the marker: each frame fills
  // the stroke and, over it, the paper's strokes in its rectangle.
  const send = (type: string, y: number, init: PointerEventInit) =>
    sendOn(canvas, view, type, [320, y], init);
  send("pointerdown", 900, { button: 0, buttons: 1, pressure: 0.5 });
  await settle();
  const filled: number[] = [];
  for (let y = 860; y >= 40; y -= 40) {
    const before = probe(element).fills;
    send("pointermove", y, { buttons: 1, pressure: 0.5 });
    await settle();
    filled.push(probe(element).fills - before);
  }
  // Far below the paper the stroke alone; once its outline reaches the marker, the marker too.
  expect(filled[0]).toBe(1);
  expect(filled.at(-1)).toBe(2);
  send("pointerup", 40, { button: 0, buttons: 0 });
  await settle();
  const writes = element.history.filter((event) => event.kind === "write");
  expect(writes.map((event) => ("on" in event ? event.on : undefined))).toEqual([
    "tracing",
    undefined,
  ]);

  const fresh = document.createElement("novatrail-canvas");
  fresh.style.width = "500px";
  document.body.append(fresh);
  made.push(fresh);
  fresh.paper = { statement };
  fresh.tracing = element.tracing;
  fresh.history = element.history;
  await settle();
  const freshCanvas = fresh.shadowRoot?.querySelector("canvas");
  const freshGrip = fresh.shadowRoot?.querySelector<HTMLButtonElement>("button.grip");
  if (!freshCanvas || !freshGrip) throw new Error("the element has no tracing paper");
  await expect.poll(() => freshGrip.hidden).toBe(false);
  await settle();
  const pixels = (of: HTMLCanvasElement) =>
    of.getContext("2d")?.getImageData(0, 0, of.width, of.height).data ?? new Uint8ClampedArray();
  const written = pixels(canvas);
  const whole = pixels(freshCanvas);
  expect(written.length).toBe(whole.length);
  // Chromium's and Firefox's rasterizer give the marker's smoothed edge, where the pen's
  // rectangle cuts it, up to 14 levels more or less than a painting of the whole does; the marker
  // filled twice there would be 40 off and more.
  let off = 0;
  for (let i = 0; i < whole.length; i++) {
    if (Math.abs((written[i] ?? 0) - (whole[i] ?? 0)) > 24) off++;
  }
  expect(off).toBe(0);
});

test("a stroke under way on the tracing paper shows where it goes, frame by frame", async () => {
  const { canvas, view } = await paper();
  const send = (type: string, x: number, init: PointerEventInit) =>
    sendOn(canvas, view, type, [x, 200], init);
  send("pointerdown", 220, { button: 0, buttons: 1, pressure: 0.5 });
  for (let x = 240; x <= 400; x += 20) {
    send("pointermove", x, { buttons: 1, pressure: 0.5 });
    await settle();
  }
  // The ink under way, in the device pixels of a point it has passed.
  const { k, vx, vy } = view();
  const scale = canvas.width / canvas.getBoundingClientRect().width;
  const alpha = canvas
    .getContext("2d")
    ?.getImageData(Math.floor((300 - vx) * k * scale), Math.floor((200 - vy) * k * scale), 1, 1)
    .data[3];
  expect(alpha).toBeGreaterThan(0);
  send("pointerup", 400, { button: 0, buttons: 0 });
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
  // Past the page it lies on the sheet still, which goes on as far as its reach.
  element.tracing = { at: [2000, 0], hidden: false };
  expect(element.tracing).toEqual({ at: [2000, 0], hidden: false, scale: 1 });
  expect(() => {
    element.tracing = { at: [10000, 0], hidden: false };
  }).toThrow(TypeError);
  expect(told).toHaveLength(2);
});

test("rules its sheet by the grid the consumer gives, dots as it comes, lines, squares or none, as far as the sheet goes, and tells nothing of it", async () => {
  const { element, root } = await paper();
  const grid = root.querySelector(".grid");
  const told: unknown[] = [];
  element.addEventListener("gridchange", (event) => told.push(event.detail));
  const extent = () => {
    const box = root.querySelector(".sheet")?.getBoundingClientRect();
    const { k } = viewOf(element);
    return { width: Math.round((box?.width ?? 0) / k), height: Math.round((box?.height ?? 0) / k) };
  };
  expect(element.grid).toBe("dots");
  // Dots are tiles of a pattern, and the path is empty.
  expect(grid?.getAttribute("d")).toBe("");
  // 25 units at k 0.5 are 12.5 px: the dots and the squares show every second, 25 px apart.
  expect(dotTilesOf(root)).toEqual(dotTiles(50, extent()));
  expect(grid?.classList.contains("dots")).toBe(true);
  for (const [given, path] of [
    ["lines", gridPath({ kind: "lines", step: 40 }, extent())],
    ["squares", gridPath({ kind: "squares", step: 50 }, extent())],
    ["blank", ""],
    ["dots", ""],
  ] as const) {
    element.grid = given;
    expect(element.grid).toBe(given);
    expect(grid?.getAttribute("d"), given).toBe(path);
    expect(grid?.classList.contains("dots"), given).toBe(given === "dots");
    expect(dotTilesOf(root), given).toEqual(given === "dots" ? dotTiles(50, extent()) : undefined);
  }
  // The bar's button says the grid the consumer gave.
  element.grid = "blank";
  expect(buttonOf(element, "Grid: blank").hidden).toBe(false);
  // Undefined changes nothing, and a grid of no name is a TypeError that changes nothing either.
  element.grid = undefined;
  expect(element.grid).toBe("blank");
  for (const bad of ["none", "Dots", 25, null]) {
    expect(() => {
      Reflect.set(element, "grid", bad);
    }).toThrow(
      /^the grid of <novatrail-canvas> is one of "dots", "lines", "blank", "squares", not /,
    );
  }
  expect(element.grid).toBe("blank");
  expect(told).toEqual([]);
  // The ruling follows the sheet as it grows past the page, by the ink on it.
  element.grid = "lines";
  const before = extent();
  element.history = [
    {
      kind: "write",
      t: 10,
      stroke: { id: 1, kind: "pen", points: [{ x: before.width + 500, y: 100, t: 0, p: 0.5 }] },
    },
  ];
  await settle();
  expect(extent().width).toBeGreaterThan(before.width);
  expect(grid?.getAttribute("d")).toBe(gridPath({ kind: "lines", step: 40 }, extent()));
});

test("thins its dots and squares as the sheet grows small on the screen, every ruling where the own step put one", async () => {
  const { element, root } = await paper(1000);
  const extent = () => {
    const box = root.querySelector(".sheet")?.getBoundingClientRect();
    const { k } = viewOf(element);
    return { width: Math.round((box?.width ?? 0) / k), height: Math.round((box?.height ?? 0) / k) };
  };
  // A tablet's width at the fit: every 25 units.
  expect(viewOf(element).k).toBeCloseTo(1, 6);
  expect(dotTilesOf(root)).toEqual(dotTiles(25, extent()));
  // A phone's: every 50, about 20 px.
  element.style.width = "393px";
  await settle();
  const k = viewOf(element).k;
  expect(thinned({ kind: "dots", step: 25 }, k).step).toBe(50);
  expect(dotTilesOf(root)).toEqual(dotTiles(50, extent()));
  element.grid = "squares";
  expect(root.querySelector(".grid")?.getAttribute("d")).toBe(
    gridPath({ kind: "squares", step: 50 }, extent()),
  );
  // Lines keep their step: they are a line's height.
  element.grid = "lines";
  expect(root.querySelector(".grid")?.getAttribute("d")).toBe(
    gridPath({ kind: "lines", step: 40 }, extent()),
  );
  // Wide again: every 25 once more.
  element.grid = "dots";
  element.style.width = "1000px";
  await settle();
  expect(dotTilesOf(root)).toEqual(dotTiles(25, extent()));
});

test("lays the sheet out past a tracing paper the consumer gives beyond it, by one view more, and back as it is given back", async () => {
  const { element, root } = await paper();
  const width = () => {
    const box = root.querySelector(".sheet")?.getBoundingClientRect();
    return Math.round((box?.width ?? 0) / viewOf(element).k);
  };
  const before = width();
  element.tracing = { at: [before - 100, 100], hidden: false };
  await settle();
  expect(width()).toBeGreaterThan(before);
  element.tracing = { at: [180, 60], hidden: false };
  await settle();
  expect(width()).toBe(before);
});

test("has a grid only while it shows a task from paper: none before it, a TypeError given then, the learner's kept for another crop, and dots again for a new task from paper", async () => {
  const bare = document.createElement("novatrail-canvas");
  document.body.append(bare);
  made.push(bare);
  expect(bare.grid).toBeUndefined();
  expect(() => {
    bare.grid = "lines";
  }).toThrow(/^<novatrail-canvas> shows no task from paper: its grid is given after the paper$/);
  bare.grid = undefined;
  expect(bare.grid).toBeUndefined();
  const { element } = await paper();
  element.grid = "squares";
  // Another crop in its place keeps the learner's grid.
  element.paper = { statement: await paperCrop(300, 60) };
  expect(element.grid).toBe("squares");
  element.paper = undefined;
  expect(element.grid).toBeUndefined();
  element.paper = { statement: await paperCrop() };
  expect(element.grid).toBe("dots");
  // A grid given before the element is upgraded comes after its paper.
  const early = upgraded(made, { paper: { statement: await paperCrop() }, grid: "lines" });
  expect(early.grid).toBe("lines");
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
  expect(element.tracing).toEqual({ at: [100, 200], hidden: true, scale: 1 });
  // Another crop is another task: its paper starts again.
  element.paper = { statement: await paperCrop() };
  expect(element.tracing).toEqual({ at: [180, 60], hidden: false, scale: 1 });
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
  expect(element.tracing).toEqual({ at: [-750, 100], hidden: false, scale: 1 });
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

test("moves the tracing paper past the page by its grip's keys, and the sheet goes on past it by one view more", async () => {
  const { element, root, grip } = await paper();
  const width = () => {
    const box = root.querySelector(".sheet")?.getBoundingClientRect();
    return Math.round((box?.width ?? 0) / viewOf(element).k);
  };
  const before = width();
  // The crop's paper is 800 units wide: from 180, its right edge goes past the page's at 1000.
  grip.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: true, bubbles: true }),
  );
  expect(element.tracing?.at).toEqual([280, 60]);
  await settle();
  expect(width()).toBe(before + 80);
});

test("gives the work for checking: the task's crop, and the crop of the paper and the strokes", async () => {
  const { element, canvas, view, statement } = await paper();
  expect(await element.exportWork()).toBeNull();
  write(canvas, view, [300, 100], [320, 140]);
  const work = (await element.exportWork()) as ExportedPaper | null;
  if (work === null || !("statement" in work)) throw new Error("no work of a task from paper");
  expect(work.statement).toBe(statement);
  expect(work.png.type).toBe("image/png");
  expect(work.submission.tracing).toEqual({ at: [180, 60], hidden: false, scale: 1 });
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

test("takes the marks of a work whose strokes on the tracing paper were copied and moved", async () => {
  const { element, root, canvas, view } = await paper();
  write(canvas, view, [220, 80], [340, 80]);
  element.tool = "select";
  await settle();
  write(canvas, view, [200, 68], [360, 68], [360, 100], [200, 100], [200, 70]);
  await settle();
  await userEvent.click(buttonOf(element, "Copy"));
  await settle();
  const copy = element.history.at(-1);
  if (copy?.kind !== "copy") throw new Error(`the history ends in ${copy?.kind}, not a copy`);
  expect(copy.on).toBe("tracing");
  // The copies stay taken: a drag of them moves them on the tracing paper.
  write(canvas, view, [280, 98], [300, 104]);
  await settle();
  expect(element.history.at(-1)?.kind).toBe("move");
  const work = (await element.exportWork()) as ExportedPaper | null;
  if (work === null || !("statement" in work)) throw new Error("no work of a task from paper");
  element.marks = {
    submission: work.submission,
    marks: [{ kind: "verdict", at: { box: [0, 0, 1000, 1000] }, correct: true, name: "Task 1" }],
  };
  await settle();
  expect(element.marks?.submission).toBe(work.submission);
  expect(root.querySelectorAll(".marks g[role=img]")).toHaveLength(1);
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
  // Beside the grip, to its right and at its middle, wherever the paper lies.
  const near = grip.getBoundingClientRect();
  const box = tip.getBoundingClientRect();
  expect(box.left).toBeCloseTo(near.right + 8, 0);
  expect((box.top + box.bottom) / 2).toBeCloseTo((near.top + near.bottom) / 2, 0);
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
