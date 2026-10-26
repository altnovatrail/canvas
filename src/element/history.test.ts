import { afterEach, expect, test, vi } from "vitest";
import type { HistoryEvent } from "../core/history.js";
import type { View } from "../core/screen.js";
import { type HistoryChange, NovatrailCanvas } from "./index.js";
import { at } from "./pointer.fixture.js";
import { probe } from "./probe.js";

// The history of writing as the element takes and gives it (R27): read as the sheet has it, told
// of by historychange after every action, and given back to open a sheet as it was — the same
// history changing nothing, any other replacing the sheet, a wrong one a TypeError.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
/** Two frames: one for the element's layout, one for its drawing. */
async function settle(): Promise<void> {
  await frame();
  await frame();
}

/** A sheet `width` CSS pixels wide, as tall as the sheet unless given a height. */
async function sheet(width = 400, height?: number) {
  const element = document.createElement("novatrail-canvas");
  element.style.width = `${width}px`;
  if (height !== undefined) element.style.height = `${height}px`;
  document.body.append(element);
  made.push(element);
  await settle();
  const canvas = element.shadowRoot?.querySelector("canvas");
  const viewport = element.shadowRoot?.querySelector(".viewport");
  if (!canvas || !viewport) throw new Error("the element has no canvas in a viewport");
  const view = (): View => {
    const { view } = probe(element);
    if (view === undefined) throw new Error("the element is not laid out");
    return view;
  };
  return { element, canvas, viewport, view };
}

/** A pointer on the canvas, made by a script, at points of the sheet: a mouse's, or as given. */
function hand(canvas: HTMLCanvasElement, view: () => View, init: PointerEventInit = {}) {
  const pointer = { pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true, ...init };
  const send = (type: string, x: number, y: number, state: PointerEventInit) =>
    canvas.dispatchEvent(
      new PointerEvent(type, { ...pointer, ...at(canvas, view(), x, y), ...state }),
    );
  return {
    down: (x: number, y: number) =>
      send("pointerdown", x, y, { button: 0, buttons: 1, pressure: 0.5 }),
    move: (x: number, y: number) =>
      send("pointermove", x, y, { button: -1, buttons: 1, pressure: 0.5 }),
    up: (x: number, y: number) => send("pointerup", x, y, { button: 0, buttons: 0, pressure: 0 }),
    cancel: (x: number, y: number) => send("pointercancel", x, y, { button: 0, buttons: 0 }),
  };
}

/** A level stroke at `y`, from `from` to `to`. */
function level(canvas: HTMLCanvasElement, view: () => View, y: number, from: number, to: number) {
  const pen = hand(canvas, view);
  pen.down(from, y);
  pen.move(to, y);
  pen.up(to, y);
}

/** Whether the canvas has ink at a point of the sheet in sight. */
function inkAt(canvas: HTMLCanvasElement, view: View, x: number, y: number): boolean {
  const scale = canvas.width / 1000;
  const pixel = canvas
    .getContext("2d")
    ?.getImageData(Math.floor(x * scale), Math.floor((y - view.vy) * scale), 1, 1);
  return (pixel?.data[3] ?? 0) > 0;
}

/** What historychange tells an element's listener, in order. */
function told(element: HTMLElement): HistoryChange[] {
  const heard: HistoryChange[] = [];
  element.addEventListener("historychange", (event) => heard.push(event.detail));
  return heard;
}

/** A copy of a history through JSON, as a store of the consumer's gives it back. */
const stored = (history: readonly HistoryEvent[]): HistoryEvent[] =>
  JSON.parse(JSON.stringify(history));

test("the history is frozen, the same array between actions, and what historychange told of it", async () => {
  const { element, canvas, view } = await sheet();
  const heard = told(element);
  level(canvas, view, 100, 100, 300);
  const once = element.history;
  expect(element.history).toBe(once);
  level(canvas, view, 200, 100, 300);
  expect(element.undo()).toBe(true);
  expect(element.clear()).toBe(true);
  expect(element.history).not.toBe(once);
  expect(Object.isFrozen(element.history)).toBe(true);
  expect(element.history.every((event) => Object.isFrozen(event))).toBe(true);
  // One event for each action, frozen, each with the history's new events and where they begin.
  expect(heard.map(({ from }) => from)).toEqual([0, 1, 2, 3]);
  expect(heard.flatMap(({ events }) => events)).toEqual(element.history);
  expect(heard.every((detail) => Object.isFrozen(detail) && Object.isFrozen(detail.events))).toBe(
    true,
  );
  expect(heard.flatMap(({ events }) => events.map((event) => event.kind))).toEqual([
    "write",
    "write",
    "undo",
    "clear",
  ]);
});

test("no event comes for a cancelled stroke, a press of the eraser that took nothing, an undo or a clearing that changed nothing, or a history given", async () => {
  const { element, canvas, view } = await sheet();
  const heard = told(element);
  expect(element.undo()).toBe(false);
  expect(element.clear()).toBe(false);
  const pen = hand(canvas, view);
  pen.down(100, 100);
  pen.move(300, 100);
  pen.cancel(300, 100);
  element.tool = "eraser";
  level(canvas, view, 900, 100, 300);
  element.tool = "pen";
  element.history = [];
  expect(heard).toEqual([]);
  level(canvas, view, 100, 100, 300);
  const given = stored(element.history);
  const other = await sheet();
  const otherHeard = told(other.element);
  other.element.history = given;
  expect(otherHeard).toEqual([]);
  expect(heard).toHaveLength(1);
});

test("a listener that acts while it hears leaves every store that adds what it is told equal to the history", async () => {
  const { element, canvas, view } = await sheet();
  const first: HistoryEvent[] = [];
  const second: HistoryEvent[] = [];
  let undone = false;
  element.addEventListener("historychange", ({ detail }) => {
    first.push(...detail.events);
    // The first listener takes the second stroke back as soon as it hears of it.
    if (!undone && element.history.length === 2) {
      undone = true;
      element.undo();
    }
  });
  element.addEventListener("historychange", ({ detail }) => {
    expect(detail.from).toBe(second.length);
    second.push(...detail.events);
  });
  level(canvas, view, 100, 100, 300);
  level(canvas, view, 200, 100, 300);
  expect(element.history.map((event) => event.kind)).toEqual(["write", "write", "undo"]);
  expect(first).toEqual(element.history);
  expect(second).toEqual(element.history);
});

test("the same history changes nothing: the very array, a copy through JSON, one with fields of the consumer's, undefined for an empty sheet", async () => {
  const { element, canvas, view } = await sheet();
  element.history = undefined;
  element.history = [];
  expect(element.history).toHaveLength(0);
  level(canvas, view, 100, 100, 300);
  level(canvas, view, 200, 100, 300);
  await settle();
  const history = element.history;
  const outlines = probe(element).outlines;
  const heard = told(element);
  const noted = history.map((event) => ({ ...event, savedAt: "the consumer's own field" }));
  for (const same of [history, stored(history), noted]) {
    element.history = same;
    await settle();
    expect(element.history).toBe(history);
    expect(probe(element).outlines).toBe(outlines);
  }
  expect(heard).toEqual([]);
  // A stroke under way goes on, and lands: the sheet was not rebuilt under it.
  const pen = hand(canvas, view);
  pen.down(100, 300);
  pen.move(200, 300);
  element.history = stored(history);
  pen.move(300, 300);
  pen.up(300, 300);
  expect(element.history.map((event) => event.kind)).toEqual(["write", "write", "write"]);
  expect(heard).toHaveLength(1);
});

test("another history replaces the sheet: its ink, its undo, the next ID, and a clock that goes on past the groups' pause", async () => {
  const first = await sheet();
  level(first.canvas, first.view, 100, 100, 300);
  level(first.canvas, first.view, 200, 100, 300);
  first.element.undo();
  level(first.canvas, first.view, 300, 100, 300);
  const history = stored(first.element.history);
  const last = history.at(-1)?.t ?? 0;

  const { element, canvas, view } = await sheet();
  element.history = history;
  await settle();
  expect(element.history).toEqual(first.element.history);
  expect(probe(element).strokes.map(({ id }) => id)).toEqual([1, 3]);
  expect([inkAt(canvas, view(), 200, 100), inkAt(canvas, view(), 200, 300)]).toEqual([true, true]);
  // The next stroke takes the next ID, and lands more than the groups' pause after the last event,
  // in a group of its own, though it is written right beside the old writing.
  level(canvas, view, 330, 100, 300);
  const written = element.history.at(-1);
  if (written?.kind !== "write") throw new Error("no stroke written");
  expect(written.stroke.id).toBe(4);
  expect(written.stroke.points[0]?.t).toBeGreaterThanOrEqual(last + 2001);
  const work = await element.exportWork();
  expect(work?.submission.groups.map(({ ids }) => ids)).toEqual([[1], [3], [4]]);
  // Undo takes back the new stroke, then the last action of the history given.
  expect(element.undo()).toBe(true);
  expect(element.undo()).toBe(true);
  expect(probe(element).strokes.map(({ id }) => id)).toEqual([1]);
});

test("a history given while a stroke or an erasing is under way drops it, and the ink of the history shows", async () => {
  const { element, canvas, view } = await sheet();
  level(canvas, view, 100, 100, 300);
  const history = stored(element.history);
  level(canvas, view, 200, 100, 300);
  const heard = told(element);

  const pen = hand(canvas, view);
  pen.down(100, 400);
  pen.move(300, 400);
  element.history = history;
  expect(probe(element).live).toBeUndefined();
  pen.move(350, 400);
  pen.up(350, 400);
  expect(element.history).toEqual(history);

  // An erasing under way over the stroke of the history: the press goes, and the stroke stays.
  element.tool = "eraser";
  const eraser = hand(canvas, view, { pointerId: 2 });
  eraser.down(200, 50);
  eraser.move(200, 150);
  await settle();
  expect(probe(element).pending).toEqual([1]);
  expect(inkAt(canvas, view(), 200, 100)).toBe(false);
  element.history = [];
  element.history = history;
  await settle();
  expect(probe(element).pending).toEqual([]);
  expect(inkAt(canvas, view(), 200, 100)).toBe(true);
  eraser.up(200, 150);
  expect(element.history).toEqual(history);
  expect(heard).toEqual([]);
});

test("a history the sheet could not have written is a TypeError that names the field, and the sheet stays as it was", async () => {
  const { element, canvas, view } = await sheet();
  level(canvas, view, 100, 100, 300);
  const history = element.history;
  const pen = hand(canvas, view);
  pen.down(100, 200);
  pen.move(300, 200);
  const wrong: [unknown, RegExp][] = [
    [null, /^history: a list of events/],
    [
      [{ kind: "write", t: 0, stroke: { id: 1, kind: "mouse", points: [] } }],
      /^history\[0\]\.stroke\.points/,
    ],
    [
      [{ kind: "erase", t: 0, ids: [1] }],
      /^history\[0\]: strokes \[1\] erased, but none of them is on the sheet$/,
    ],
  ];
  for (const [value, message] of wrong) {
    expect(() => {
      element.history = value as HistoryEvent[];
    }).toThrow(TypeError);
    expect(() => {
      element.history = value as HistoryEvent[];
    }).toThrow(message);
  }
  expect(element.history).toBe(history);
  // The stroke under way goes on, and lands.
  pen.up(300, 200);
  expect(element.history).toHaveLength(2);
});

test("undefined after a history is an empty sheet: its IDs start again from 1, and a context of the old one is not its", async () => {
  const { element, canvas, view } = await sheet();
  level(canvas, view, 100, 100, 300);
  level(canvas, view, 200, 100, 300);
  const work = await element.exportWork();
  if (work === null) throw new Error("no work for checking");
  element.history = undefined;
  await settle();
  expect(element.history).toEqual([]);
  expect(inkAt(canvas, view(), 200, 100)).toBe(false);
  expect(element.undo()).toBe(false);
  level(canvas, view, 900, 100, 300);
  level(canvas, view, 1000, 100, 300);
  expect(probe(element).strokes.map(({ id }) => id)).toEqual([1, 2]);
  expect(() => {
    element.marks = { submission: work.submission, marks: [] };
  }).toThrow(/not this sheet's/);
});

test("a history where the sheet's began replaces it too, and says in the console what is lost", async () => {
  const { element, canvas, view } = await sheet();
  level(canvas, view, 100, 100, 300);
  const begun = stored(element.history);
  level(canvas, view, 200, 100, 300);
  element.undo();
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    element.history = begun;
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0]?.[0])).toMatch(/the 2 actions after it are gone/);
  } finally {
    warn.mockRestore();
  }
  expect(element.history).toEqual(begun);
});

test("a history given before the element is upgraded is taken, with marks after it; one it cannot take leaves it empty, with a warning", async () => {
  const first = await sheet();
  level(first.canvas, first.view, 100, 100, 300);
  const history = stored(first.element.history);
  const work = await first.element.exportWork();
  if (work === null) throw new Error("no work for checking");
  const marks = {
    submission: work.submission,
    marks: [{ kind: "frame" as const, at: { group: "A" }, name: "This" }],
  };
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const upgrade = (values: Record<string, unknown>) => {
      const template = document.createElement("template");
      template.innerHTML = "<novatrail-canvas></novatrail-canvas>";
      const early = template.content.firstElementChild;
      if (!(early instanceof HTMLElement)) throw new Error("the template has no element");
      // The marks before the history, as a page might set them: the element takes the history first.
      for (const [name, value] of Object.entries(values)) Reflect.set(early, name, value);
      document.body.append(early);
      made.push(early);
      if (!(early instanceof NovatrailCanvas)) throw new Error("not upgraded");
      return early;
    };
    const taken = upgrade({ marks, history });
    expect(taken.history).toEqual(history);
    expect(taken.marks).toBe(marks);
    expect(warn).not.toHaveBeenCalled();
    const empty = upgrade({ history: [{ kind: "undo", t: 0, removed: [], restored: [] }] });
    expect(empty.history).toEqual([]);
    expect(warn).toHaveBeenCalledOnce();
  } finally {
    warn.mockRestore();
  }
});

test("strokes out of sight are outlined only when they come into sight", async () => {
  const first = await sheet();
  level(first.canvas, first.view, 100, 100, 300);
  level(first.canvas, first.view, 1300, 100, 300);
  const history = stored(first.element.history);
  // 400 px wide and 300 tall, the sheet shows its top 750 units.
  const { element, viewport } = await sheet(400, 300);
  const outlines = probe(element).outlines;
  element.history = history;
  await settle();
  expect(probe(element).outlines).toBe(outlines + 1);
  viewport.scrollTop = viewport.scrollHeight;
  await settle();
  expect(probe(element).outlines).toBe(outlines + 2);
});

test("a store that adds what it is told to an array of its own and gives that array back changes nothing, however often", async () => {
  const { element, canvas, view } = await sheet();
  level(canvas, view, 100, 100, 300);
  const mine = stored(element.history);
  element.addEventListener("historychange", ({ detail }) => {
    mine.push(...detail.events);
  });
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    element.history = mine;
    level(canvas, view, 200, 100, 300);
    await settle();
    const outlines = probe(element).outlines;
    const history = element.history;
    // Given back as it has grown, and again as long: the sheet's own strokes and history stay.
    element.history = mine;
    element.history = mine;
    await settle();
    expect(element.history).toBe(history);
    expect(probe(element).outlines).toBe(outlines);
    expect(warn).not.toHaveBeenCalled();
  } finally {
    warn.mockRestore();
  }
});
