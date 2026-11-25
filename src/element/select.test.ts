import { afterEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { HistoryEvent } from "../core/history.js";
import type { Stroke } from "../core/ink.js";
import type { Marks, SheetSubmission } from "../core/marks.js";
import { ROW } from "./icons.js";
import type { NovatrailCanvas } from "./index.js";
import { labelsFor } from "./labels.js";
import {
  buttonOf,
  hand,
  iconOf,
  level,
  placed,
  rest,
  settle,
  sheetWork,
} from "./pointer.fixture.js";
import { probe } from "./probe.js";
import { PEN_MODE } from "./session.js";

// Select in a browser: its button between the eraser and the hand, its popover of the lasso and
// the rectangle, the shape it draws over the sheet, the dashed box round the strokes it takes, which
// a drag inside moves, and the bar over the box that copies them or deletes them; each action one
// undo, its history the sheet's own. Its marks say nothing to a screen reader, and its bar is a
// group of buttons named in the element's language.

const made: HTMLElement[] = [];
afterEach(async () => {
  for (const element of made.splice(0)) element.remove();
  PEN_MODE.on = false;
  await rest();
});

/** A sheet with two level strokes, one over the other, and Select chosen. */
async function written() {
  const placedSheet = await placed(made, 500);
  const { element, canvas, view } = placedSheet;
  level(canvas, view(), 200, 100, 300);
  level(canvas, view(), 500, 100, 300);
  await settle();
  element.tool = "select";
  await settle();
  return placedSheet;
}

/** A lasso drawn by a script round the sheet's points from `[x0, y0]` to `[x1, y1]`, lifted. */
async function lasso(
  canvas: HTMLCanvasElement,
  view: () => import("../core/screen.js").View,
  [x0, y0]: [number, number],
  [x1, y1]: [number, number],
) {
  const mouse = hand(canvas, view);
  mouse.down(x0, y0);
  const steps = 8;
  for (let k = 1; k <= steps; k++) mouse.move(x0 + ((x1 - x0) * k) / steps, y0);
  for (let k = 1; k <= steps; k++) mouse.move(x1, y0 + ((y1 - y0) * k) / steps);
  for (let k = 1; k <= steps; k++) mouse.move(x1 - ((x1 - x0) * k) / steps, y1);
  for (let k = 1; k < steps; k++) mouse.move(x0, y1 - ((y1 - y0) * k) / steps);
  mouse.up(x0, y0 + 2);
  await settle();
}

/** The last event of the history, of the kind given. */
function lastOf<K extends HistoryEvent["kind"]>(element: NovatrailCanvas, kind: K) {
  const event = element.history.at(-1);
  if (event?.kind !== kind) throw new Error(`the history ends in ${event?.kind}, not ${kind}`);
  return event as HistoryEvent & { kind: K };
}

/** The box of a stroke's points. */
function boxOfStroke(stroke: Stroke | undefined): [number, number, number, number] {
  if (stroke === undefined) throw new Error("no stroke");
  const xs = stroke.points.map(({ x }) => x);
  const ys = stroke.points.map(({ y }) => y);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

test("Select stands between the eraser and the hand, its popover chooses the lasso or the rectangle, and its icon follows", async () => {
  const { element, row } = await placed(made, 500);
  const names = labelsFor(null).labels;
  const within = page.elementLocator(element);
  const select = within.getByRole("radio", { name: names.select });
  await expect.element(select).toBeVisible();
  const order = [...row.querySelectorAll('[role="radio"]')].map((each) => each.textContent);
  expect(order).toEqual(["Pen", "Eraser", "Select", "Hand"]);
  expect(element.pens.select).toBe("lasso");
  await userEvent.click(select);
  expect(element.tool).toBe("select");
  await expect.element(select).toBeChecked();
  expect(iconOf(buttonOf(element, "Select")).dataset.icon).toBe(ROW.selectLasso.filled);
  // Chosen, a press opens its settings.
  await userEvent.click(select);
  const dialog = within.getByRole("dialog", { name: names.selectSettings });
  await expect.element(dialog).toBeVisible();
  const rectangle = dialog.getByRole("button", { name: names.rectangle });
  await expect
    .element(dialog.getByRole("button", { name: names.lasso }))
    .toHaveAttribute("aria-pressed", "true");
  await userEvent.click(rectangle);
  expect(element.pens.select).toBe("rectangle");
  await expect.element(rectangle).toHaveAttribute("aria-pressed", "true");
  expect(iconOf(buttonOf(element, "Select")).dataset.icon).toBe(ROW.selectRectangle.filled);
});

test("the lasso takes the strokes almost wholly inside it, shows their box and the bar, and Escape lets them go", async () => {
  const { element, root, canvas, view } = await written();
  const box = root.querySelector<SVGRectElement>(".selection .box");
  const bar = root.querySelector<HTMLElement>(".selection-bar");
  if (box === null || bar === null) throw new Error("no marks of Select");
  expect(bar.hidden).toBe(true);
  expect(box.getAttribute("display")).toBe("none");
  // A press and a lift where nothing is takes nothing, and writes nothing.
  const events = element.history.length;
  await lasso(canvas, view, [60, 160], [340, 260]);
  expect(element.history.length).toBe(events);
  expect(bar.hidden).toBe(false);
  expect(box.getAttribute("display")).toBeNull();
  const group = page.elementLocator(element).getByRole("group", {
    name: labelsFor(null).labels.selectionButtons,
  });
  await expect.element(group).toBeVisible();
  // The box holds the stroke taken, and not the other.
  const x = Number(box.getAttribute("x"));
  const y = Number(box.getAttribute("y"));
  const height = Number(box.getAttribute("height"));
  expect(x).toBeLessThan(100);
  expect(y).toBeLessThan(200);
  expect(y + height).toBeLessThan(500);
  expect(root.querySelector(".selection")?.getAttribute("aria-hidden")).toBe("true");
  canvas.closest<HTMLElement>(".viewport")?.focus();
  await userEvent.keyboard("{Escape}");
  await settle();
  expect(bar.hidden).toBe(true);
});

test("a drag inside the box moves the strokes taken, in one action that an undo takes back", async () => {
  const { element, canvas, view } = await written();
  const [first] = element.history.map((event) =>
    event.kind === "write" ? event.stroke : undefined,
  );
  await lasso(canvas, view, [60, 160], [340, 260]);
  const mouse = hand(canvas, view);
  mouse.down(200, 200);
  for (let k = 1; k <= 5; k++) mouse.move(200 + 20 * k, 200 + 10 * k);
  await settle();
  mouse.up(300, 250);
  await settle();
  const move = lastOf(element, "move");
  expect(move.ids).toEqual([first?.id]);
  const [x0, y0] = boxOfStroke(first);
  const [x1, y1] = boxOfStroke(move.strokes[0]);
  expect(x1 - (x0 ?? 0)).toBeCloseTo(100, 0);
  expect(y1 - (y0 ?? 0)).toBeCloseTo(50, 0);
  // The strokes moved stay taken: a second drag moves them on.
  mouse.down(300, 250);
  mouse.move(300, 300);
  mouse.up(300, 300);
  await settle();
  expect(lastOf(element, "move").ids).toEqual([move.strokes[0]?.id]);
  expect(element.undo()).toBe(true);
  expect(element.undo()).toBe(true);
  expect(lastOf(element, "undo").restored).toEqual([first?.id]);
  await settle();
});

test("Copy puts the strokes taken just below themselves and takes the copies; Delete erases them", async () => {
  const { element, root, canvas, view } = await written();
  await lasso(canvas, view, [60, 160], [340, 260]);
  await userEvent.click(buttonOf(element, "Copy"));
  await settle();
  const copy = lastOf(element, "copy");
  const strokes = element.history.flatMap((event) =>
    event.kind === "write" ? [event.stroke] : [],
  );
  const [, y0, , y1] = boxOfStroke(strokes[0]);
  const [, top] = boxOfStroke(copy.strokes[0]);
  expect(top).toBeGreaterThan(y1 ?? 0);
  expect(top - (y0 ?? 0)).toBeLessThan(100);
  await userEvent.click(buttonOf(element, "Delete"));
  await settle();
  expect(lastOf(element, "erase").ids).toEqual(copy.strokes.map(({ id }) => id));
  expect(root.querySelector<HTMLElement>(".selection-bar")?.hidden).toBe(true);
  expect(element.undo()).toBe(true);
  expect(element.undo()).toBe(true);
  expect(lastOf(element, "undo").removed).toEqual(copy.strokes.map(({ id }) => id));
});

test("the rectangle takes what it spans, Delete or Backspace erases it, and another tool lets it go", async () => {
  const { element, root, canvas, view } = await written();
  element.pens = { ...element.pens, select: "rectangle" };
  const mouse = hand(canvas, view);
  mouse.down(60, 100);
  mouse.move(200, 300);
  mouse.move(340, 600);
  mouse.up(340, 600);
  await settle();
  const ids = element.history.flatMap((event) => (event.kind === "write" ? [event.stroke.id] : []));
  const bar = root.querySelector<HTMLElement>(".selection-bar");
  expect(bar?.hidden).toBe(false);
  canvas.closest<HTMLElement>(".viewport")?.focus();
  await userEvent.keyboard("{Backspace}");
  await settle();
  expect(lastOf(element, "erase").ids).toEqual(ids);
  expect(element.undo()).toBe(true);
  await settle();
  // The rectangle goes from where the press began to where it lifts: the path between is no shape.
  mouse.down(60, 160);
  mouse.move(200, 400);
  mouse.up(340, 260);
  await settle();
  expect(bar?.hidden).toBe(false);
  element.tool = "pen";
  await settle();
  expect(bar?.hidden).toBe(true);
});

test("marks of a submission hold on to the strokes a move and a copy landed, and marks of one before them are still the sheet's", async () => {
  const { element, canvas, view } = await written();
  const before = (await sheetWork(element)).submission;
  await lasso(canvas, view, [60, 160], [340, 260]);
  const mouse = hand(canvas, view);
  mouse.down(200, 200);
  mouse.move(250, 250);
  mouse.up(250, 250);
  await settle();
  const move = lastOf(element, "move");
  await userEvent.click(buttonOf(element, "Copy"));
  await settle();
  const copy = lastOf(element, "copy");
  const { submission } = await sheetWork(element);
  const landed = [...move.strokes, ...copy.strokes].map(({ id }) => id);
  expect(submission.groups.flatMap(({ ids }) => ids)).toEqual(expect.arrayContaining(landed));
  const framed = (given: SheetSubmission): Marks => ({
    submission: given,
    marks: given.groups.map(({ label }) => ({
      kind: "frame",
      at: { group: label },
      name: `Group ${label}`,
    })),
  });
  element.marks = framed(submission);
  await settle();
  expect(probe(element).marks.map(({ ids }) => ids)).toEqual(
    submission.groups.map(({ ids }) => ids),
  );
  // The strokes the move took off are still the sheet's, erased: a submission of them is its own.
  const earlier = framed(before);
  element.marks = earlier;
  expect(element.marks).toBe(earlier);
});

test("its bar speaks the element's language", async () => {
  const { element, canvas, view } = await written();
  element.setAttribute("lang", "ru");
  await settle();
  await lasso(canvas, view, [60, 160], [340, 260]);
  const ru = labelsFor("ru").labels;
  const group = page.elementLocator(element).getByRole("group", { name: ru.selectionButtons });
  await expect.element(group).toBeVisible();
  await expect.element(group.getByRole("button", { name: ru.copy })).toBeVisible();
  await expect.element(group.getByRole("button", { name: ru.remove })).toBeVisible();
});
