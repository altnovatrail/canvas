import { afterEach, expect, test, vi } from "vitest";
import { gridPath } from "../core/grid.js";
import { moduleManifest, sheetTask, workedExample } from "../core/tasks.fixture.js";
import type { HistoryChange, WorkedExample } from "./index.js";
import { at, input, level, placed, press, settle, touches, upgraded } from "./pointer.fixture.js";
import { probe } from "./probe.js";
import { PEN_MODE } from "./session.js";

// A lesson's worked example on the element, in Chromium (R42): the property workedExample, which
// the element takes instead of a task, and the mode in which the learner does not write — the
// canvas takes no input, a finger on the sheet scrolls it as the browser does, and there is no work
// to give, to check or to mark. Its row is tools.test.ts's, its layers layers.test.ts's.

const made: HTMLElement[] = [];
afterEach(async () => {
  // A test that failed with a finger down lifts it.
  await touches("touchCancel", []).catch(() => {});
  for (const element of made.splice(0)) element.remove();
  PEN_MODE.on = false;
  window.scrollTo(0, 0);
});

/**
 * A sheet 400 CSS pixels wide, as tall as its row, statement and sheet unless given a height, with
 * what it tells: its `historychange` events, and how many `toolchange` events it sent.
 */
async function sheet(height?: number) {
  const parts = await placed(made, 400, height);
  const told = { history: [] as HistoryChange[], tools: 0 };
  parts.element.addEventListener("historychange", (event) => told.history.push(event.detail));
  parts.element.addEventListener("toolchange", () => {
    told.tools += 1;
  });
  return { ...parts, told };
}

/** A stroke the sheet has written, as its history has it: the history of another sheet. */
async function written() {
  const { element, canvas, view } = await placed(made, 400);
  level(canvas, view(), 200, 100, 300);
  return element.history;
}

test("a worked example shows its statement above the sheet in the manifest's language, and its grid, and gives no work", async () => {
  const { element, root, told } = await sheet();
  element.manifest = moduleManifest({ explanation: "ru" });
  const question = "Сколько фонарей стоит вдоль дорожки?";
  const given = workedExample({ statement: [{ text: question }], grid: "dots", grid_step: 40 });
  element.workedExample = given;
  expect(element.workedExample).toBe(given);
  expect(element.task).toBeUndefined();
  const statement = root.querySelector(".statement");
  expect(statement?.textContent).toBe(question);
  expect(statement?.getAttribute("lang")).toBe("ru");
  expect(root.querySelector(".grid")?.getAttribute("d")).toBe(gridPath({ kind: "dots", step: 40 }));
  // Nothing of a work: the learner does not write on a worked example's sheet (R42).
  expect(element.history).toEqual([]);
  expect(element.filled).toBeNull();
  expect(await element.exportWork()).toBeNull();
  expect(element.tool).toBe("pen");
  expect(element.undo()).toBe(false);
  expect(element.clear()).toBe(false);
  expect(told).toEqual({ history: [], tools: 0 });
});

test("while a worked example is shown a task, a history, marks and the eraser are TypeErrors, and undefined of each changes nothing", async () => {
  const { element, told } = await sheet();
  const history = await written();
  const given = workedExample();
  element.workedExample = given;
  const refused: [what: string, give: () => void, message: RegExp][] = [
    ["task", () => Reflect.set(element, "task", sheetTask()), /shows a worked example: a task/],
    ["history", () => Reflect.set(element, "history", history), /no history of writing/],
    ["marks", () => Reflect.set(element, "marks", {}), /nothing to mark/],
    ["tool", () => Reflect.set(element, "tool", "eraser"), /worked example .* allows no eraser/],
    ["null", () => Reflect.set(element, "workedExample", null), /^workedExample: /],
  ];
  for (const [what, give, message] of refused) {
    expect(give, what).toThrow(TypeError);
    expect(give, what).toThrow(message);
  }
  element.task = undefined;
  element.history = undefined;
  element.history = [];
  element.marks = undefined;
  element.tool = "pen";
  expect(element.workedExample).toBe(given);
  expect(element.task).toBeUndefined();
  expect(element.marks).toBeUndefined();
  expect(element.history).toEqual([]);
  expect(told).toEqual({ history: [], tools: 0 });
});

test("a worked example is a TypeError while a task is given, on a sheet written on, and while a stroke or an erasing is under way", async () => {
  const { element, canvas, view, told } = await sheet();
  const given = workedExample();
  const show = () => {
    element.workedExample = given;
  };
  element.task = sheetTask();
  expect(show).toThrow(/shows a task/);
  element.task = undefined;
  // A stroke under way: refused, and taken once the device has cancelled it, which writes nothing.
  press(canvas, view(), 200, 100, 300);
  expect(show).toThrow(/being written on/);
  canvas.dispatchEvent(
    new PointerEvent("pointercancel", { pointerId: 1, pointerType: "mouse", bubbles: true }),
  );
  expect(element.history).toEqual([]);
  show();
  element.workedExample = undefined;
  // An erasing under way: refused, and taken once it lifts with nothing erased, which is no action.
  element.tool = "eraser";
  const erasing = press(canvas, view(), 200, 100, 300);
  expect(show).toThrow(/being written on/);
  erasing.lift();
  expect(element.history).toEqual([]);
  show();
  // The example puts the pen back, as a task without the eraser does, with no event (R28).
  expect(element.tool).toBe("pen");
  element.workedExample = undefined;
  level(canvas, view(), 200, 100, 300);
  expect(show).toThrow(/history of writing/);
  expect(element.workedExample).toBeUndefined();
  expect(told.history).toHaveLength(1);
  expect(told.tools).toBe(0);
});

test("an example equal to the one shown changes nothing, and another changes its grid or its statement alone", async () => {
  const { element, root } = await sheet();
  const media = vi.fn(
    async (_ref: string) =>
      new Blob(['<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"/>'], {
        type: "image/svg+xml",
      }),
  );
  element.media = media;
  const statement = [
    { text: "How many lamps are there?" },
    { picture: "pictures/posts.png", alt: "A path with lamps.", width: 120, height: 40 },
  ];
  const given = workedExample({ statement });
  element.workedExample = given;
  await settle();
  const paragraph = root.querySelector(".statement p");
  const grid = root.querySelector(".grid")?.getAttribute("d");
  // The statement's picture and the demo's, each once, as the example comes (R42).
  const asked = ["pictures/posts.png", "pictures/lamp.png", "pictures/path-in-gaps.png"];
  expect(media.mock.calls.map(([ref]) => ref)).toEqual(asked);
  const same = structuredClone(given) as WorkedExample;
  element.workedExample = same;
  expect(element.workedExample).toBe(same);
  expect(root.querySelector(".statement p")).toBe(paragraph);
  element.workedExample = workedExample({ statement, grid: "lines" });
  expect(root.querySelector(".statement p")).toBe(paragraph);
  expect(root.querySelector(".grid")?.getAttribute("d")).not.toBe(grid);
  await settle();
  expect(media.mock.calls.map(([ref]) => ref)).toEqual(asked);
  element.workedExample = workedExample({ statement: [{ text: "How many posts are there?" }] });
  expect(root.querySelector(".statement p")).not.toBe(paragraph);
  expect(root.querySelector(".statement")?.textContent).toBe("How many posts are there?");
});

test("a worked example's canvas takes no input: a finger on the sheet scrolls it as the browser does, and a pen, a mouse and a script's event write nothing nor put the page in pen mode", async () => {
  const { element, root, canvas, viewport, view, told } = await sheet(300);
  element.workedExample = workedExample();
  await settle();
  const style = getComputedStyle(canvas);
  expect([style.pointerEvents, style.touchAction]).toEqual(["none", "auto"]);
  const point = at(canvas, view(), 500, 250);
  expect(root.elementFromPoint(point.clientX, point.clientY)).toBe(root.querySelector(".stage"));
  // A finger: the browser scrolls the container, as on the statement (R23).
  const finger = { id: 1, ...point };
  await touches("touchStart", [finger]);
  for (let step = 1; step <= 10; step++) {
    await touches("touchMove", [{ ...finger, clientY: finger.clientY - 10 * step }]);
  }
  await touches("touchEnd", []);
  await settle();
  expect(viewport.scrollTop).toBeGreaterThan(0);
  // A pen and a mouse, through the browser's input, in the middle of what the container shows, and
  // a pen's event a script sends the canvas.
  const box = viewport.getBoundingClientRect();
  const from = { clientX: box.left + 100, clientY: (box.top + box.bottom) / 2 };
  const to = { ...from, clientX: from.clientX + 100 };
  for (const pointerType of ["pen", "mouse"] as const) {
    await input("mousePressed", from, { pointerType, force: 0.5 });
    await input("mouseMoved", to, { pointerType, force: 0.5 });
    await input("mouseReleased", to, { pointerType, force: 0 });
  }
  canvas.dispatchEvent(
    new PointerEvent("pointerdown", {
      ...from,
      pointerId: 7,
      pointerType: "pen",
      button: 0,
      buttons: 1,
      pressure: 0.5,
      bubbles: true,
    }),
  );
  expect(PEN_MODE.on).toBe(false);
  expect(probe(element).roles.size).toBe(0);
  expect(probe(element).strokes).toEqual([]);
  expect(told.history).toEqual([]);
});

test("a palm on the sheet when a worked example comes is let go: the hands hold nothing on a sheet that takes no input", async () => {
  const { element, canvas, view } = await sheet(300);
  const palm = { id: 1, ...at(canvas, view(), 500, 250), radius: 60 };
  await touches("touchStart", [palm]);
  expect([...probe(element).roles.values()]).toEqual(["palm"]);
  element.workedExample = workedExample();
  expect(probe(element).roles.size).toBe(0);
  await touches("touchMove", [{ ...palm, clientY: palm.clientY - 40 }]);
  await touches("touchEnd", []);
  expect(probe(element).roles.size).toBe(0);
  expect(element.history).toEqual([]);
});

test("undefined takes the worked example off: the sheet is one with no task again, which takes the pointer and writes", async () => {
  const { element, root, canvas, view } = await sheet();
  element.workedExample = workedExample({ grid: "lines" });
  element.workedExample = undefined;
  expect(element.workedExample).toBeUndefined();
  expect(root.querySelector(".statement")?.textContent).toBe("");
  expect(root.querySelector(".grid")?.getAttribute("d")).toBe(
    gridPath({ kind: "squares", step: 50 }),
  );
  expect(getComputedStyle(canvas).pointerEvents).toBe("auto");
  const point = at(canvas, view(), 500, 250);
  expect(root.elementFromPoint(point.clientX, point.clientY)).toBe(canvas);
  level(canvas, view(), 200, 100, 300);
  expect(element.history).toHaveLength(1);
  // A task may follow on the same element now, though app gives each segment a new one (R20).
  element.workedExample = undefined;
  element.task = sheetTask();
  expect(element.task).toBeDefined();
});

test("a worked example given before the element is upgraded is taken, and with a task, marks or a history it cannot take, it leaves them as it starts, with a warning", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const upgrade = (given: Record<string, unknown>) => {
      const early = upgraded(made, given);
      expect(Object.hasOwn(early, "workedExample")).toBe(false);
      return early;
    };
    const given = workedExample();
    // The tool before the example: the eraser the sheet allowed goes, and the pen comes back.
    const taken = upgrade({ tool: "eraser", workedExample: given });
    expect(taken.workedExample).toBe(given);
    expect(taken.tool).toBe("pen");
    expect(taken.shadowRoot?.querySelector(".tools")?.getAttribute("aria-label")).toBe(
      "Worked example buttons",
    );
    expect(warn).not.toHaveBeenCalled();
    // The task before the example: the task stays, and the example goes.
    const task = sheetTask();
    const left = upgrade({ task, workedExample: given });
    expect(left.task).toBe(task);
    expect(left.workedExample).toBeUndefined();
    expect(warn).toHaveBeenCalledOnce();
    // The example before the history and the marks: they go.
    const kept = upgrade({ workedExample: given, history: [{ kind: "clear" }], marks: {} });
    expect(kept.workedExample).toBe(given);
    expect(kept.history).toEqual([]);
    expect(kept.marks).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(3);
  } finally {
    warn.mockRestore();
  }
});
