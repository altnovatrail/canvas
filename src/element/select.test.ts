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
import { Selection } from "./selection.js";
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

/** A grip's pointer: a mouse's, which bubbles and crosses the shadow root as a browser's does. */
const gripPointer = { pointerId: 7, pointerType: "mouse", bubbles: true, composed: true };

/** A grip of the box, by its corner, and the client point at its middle. */
function gripOf(root: ShadowRoot, corner: string) {
  const grip = root.querySelector<HTMLElement>(`.selection-grips .corner.${corner}`);
  if (grip === null) throw new Error(`no grip ${corner}`);
  const { left, top, width, height } = grip.getBoundingClientRect();
  return { grip, clientX: left + width / 2, clientY: top + height / 2 };
}

test("a corner's grip scales the strokes taken from the corner across, the share in the bar while it goes, in one action an undo takes back", async () => {
  const { element, root, canvas, view } = await written();
  const [first] = element.history.flatMap((event) =>
    event.kind === "write" ? [event.stroke] : [],
  );
  const grips = root.querySelector<HTMLElement>(".selection-grips");
  expect(grips?.hidden).toBe(true);
  await lasso(canvas, view, [60, 160], [340, 260]);
  expect(grips?.hidden).toBe(false);
  expect(grips?.getAttribute("aria-hidden")).toBe("true");
  expect(grips?.querySelectorAll(".corner").length).toBe(4);
  const [x0, y0, x1, y1] = boxOfStroke(first);
  const { grip, clientX, clientY } = gripOf(root, "br");
  // Half the box's diagonal on the screen, outward: half its size again.
  const { k } = view();
  const to = { clientX: clientX + ((x1 - x0) * k) / 2, clientY: clientY + ((y1 - y0) * k) / 2 };
  grip.dispatchEvent(
    new PointerEvent("pointerdown", { ...gripPointer, clientX, clientY, button: 0, buttons: 1 }),
  );
  grip.dispatchEvent(new PointerEvent("pointermove", { ...gripPointer, ...to, buttons: 1 }));
  await settle();
  const bar = root.querySelector<HTMLElement>(".selection-bar");
  const percent = bar?.querySelector<HTMLElement>(".percent");
  expect(percent?.hidden).toBe(false);
  expect(percent?.textContent).toBe("150%");
  expect(buttonOf(element, "Copy").hidden).toBe(true);
  const events = element.history.length;
  grip.dispatchEvent(new PointerEvent("pointerup", { ...gripPointer, ...to, button: 0 }));
  await settle();
  expect(element.history.length).toBe(events + 1);
  const scale = lastOf(element, "scale");
  expect(scale.ids).toEqual([first?.id]);
  expect(scale.factor).toBe(1.5);
  expect(scale.at).toEqual([x0, y0]);
  const [sx0, sy0, sx1] = boxOfStroke(scale.strokes[0]);
  expect([sx0, sy0]).toEqual([x0, y0]);
  expect(sx1 - sx0).toBeCloseTo((x1 - x0) * 1.5, 6);
  expect(scale.strokes[0]?.style?.width).toBe(
    Math.round((first?.style?.width ?? 0) * 1.5 * 10) / 10,
  );
  expect(percent?.hidden).toBe(true);
  expect(buttonOf(element, "Copy").hidden).toBe(false);
  // The strokes scaled stay taken: a press and a lift on a grip, with no drag, scales nothing.
  const again = gripOf(root, "tl");
  again.grip.dispatchEvent(
    new PointerEvent("pointerdown", { ...gripPointer, ...again, button: 0, buttons: 1 }),
  );
  again.grip.dispatchEvent(new PointerEvent("pointerup", { ...gripPointer, ...again, button: 0 }));
  await settle();
  expect(element.history.length).toBe(events + 1);
  // A drag cancelled scales nothing either.
  again.grip.dispatchEvent(
    new PointerEvent("pointerdown", { ...gripPointer, ...again, button: 0, buttons: 1 }),
  );
  again.grip.dispatchEvent(
    new PointerEvent("pointermove", { ...gripPointer, clientX: again.clientX + 60, buttons: 1 }),
  );
  again.grip.dispatchEvent(new PointerEvent("pointercancel", { ...gripPointer }));
  await settle();
  expect(element.history.length).toBe(events + 1);
  expect(element.undo()).toBe(true);
  expect(lastOf(element, "undo")).toMatchObject({
    removed: scale.strokes.map(({ id }) => id),
    restored: [first?.id],
  });
  await settle();
});

test("a grip shrinks the strokes taken no smaller than a quarter, and the share speaks the element's language", async () => {
  const { element, root, canvas, view } = await written();
  element.setAttribute("lang", "ru");
  await lasso(canvas, view, [60, 160], [340, 260]);
  const { grip, clientX, clientY } = gripOf(root, "br");
  // Far inward, past the corner across: the scale stops at its least.
  const to = { clientX: clientX - 2000, clientY };
  grip.dispatchEvent(
    new PointerEvent("pointerdown", { ...gripPointer, clientX, clientY, button: 0, buttons: 1 }),
  );
  grip.dispatchEvent(new PointerEvent("pointermove", { ...gripPointer, ...to, buttons: 1 }));
  await settle();
  const percent = root.querySelector<HTMLElement>(".selection-bar .percent");
  expect(percent?.textContent).toBe(
    new Intl.NumberFormat("ru", { style: "percent", maximumFractionDigits: 0 }).format(0.25),
  );
  grip.dispatchEvent(new PointerEvent("pointerup", { ...gripPointer, ...to, button: 0 }));
  await settle();
  expect(lastOf(element, "scale").factor).toBe(0.25);
});

test("the bar keeps to the part of the stage in sight: over the box, or under it, or at that part's edge", () => {
  const none = () => {};
  const selection = new Selection({
    copy: none,
    remove: none,
    scaleDown: none,
    scaleMove: none,
    scaleUp: none,
  });
  const view = { vx: 0, vy: 0, k: 1 };
  const y = () => Number.parseFloat(selection.bar.style.getPropertyValue("--select-y"));
  // Room over the box in sight: the bar stands there.
  selection.box(
    { minX: 100, minY: 200, maxX: 200, maxY: 260 },
    view,
    { top: 0, bottom: 500 },
    false,
  );
  expect(y()).toBe(200 - 10 - 52);
  // The stage's top is out of sight, under the statement: the bar goes under the box.
  selection.box(
    { minX: 100, minY: 200, maxX: 200, maxY: 260 },
    view,
    { top: 180, bottom: 500 },
    false,
  );
  expect(y()).toBe(260 + 10);
  // Nor is there room under it before the part in sight ends: the bar stands at that edge, over the box.
  selection.box(
    { minX: 100, minY: 200, maxX: 200, maxY: 400 },
    view,
    { top: 180, bottom: 420 },
    false,
  );
  expect(y()).toBe(420 - 52);
  // While a grip scales, the bar shows the share alone.
  selection.box(
    { minX: 100, minY: 200, maxX: 200, maxY: 400 },
    view,
    { top: 0, bottom: 600 },
    false,
    1.5,
  );
  expect(selection.bar.querySelector<HTMLElement>(".percent")?.textContent).toBe("150%");
  expect(selection.bar.querySelector<HTMLElement>(".percent")?.hidden).toBe(false);
  expect(selection.grips.hidden).toBe(false);
  // A drag of the box takes the bar and the grips away.
  selection.box(
    { minX: 100, minY: 200, maxX: 200, maxY: 400 },
    view,
    { top: 0, bottom: 600 },
    true,
  );
  expect([selection.bar.hidden, selection.grips.hidden]).toEqual([true, true]);
});
