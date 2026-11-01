import { afterEach, expect, test } from "vitest";
import { replay } from "../core/history.js";
import { sheetTask } from "../core/tasks.fixture.js";
import type { NovatrailCanvas } from "./index.js";
import { level, placed, press } from "./pointer.fixture.js";
import { probe } from "./probe.js";

// What filled tells on a handwriting sheet (R42): a task's one answer anywhere on the sheet, or the
// whole sheet, is filled by any stroke the work for checking would take, and a sheet of choices,
// whose options app marks, or with no task has nothing to say. The workbook's boxes are
// workbook.test.ts's.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

/** A sheet of choices, whose options app shows and marks: none of them is the sheet's to fill. */
const CHOICES = sheetTask({
  items: [
    { text: "a)", answer_slots: [{ binding: "choice", options: ["6", "7"] }] },
    { text: "b)", answer_slots: [{ binding: "choice", options: ["5", "6"] }] },
  ],
});

/**
 * What filled tells of a sheet's one answer, as the history and the work for checking have it: a
 * stroke the work would take is one the history leaves on the sheet (R27).
 */
async function agreed(element: NovatrailCanvas): Promise<boolean> {
  const stroked = replay(element.history).length > 0;
  expect((await element.exportWork()) !== null).toBe(stroked);
  expect(element.filled).toEqual([[stroked]]);
  return stroked;
}

test("a sheet's answer anywhere is filled once a stroke lands: not by the stroke under way, still by those under an eraser not yet lifted, and undo and clearing take it back, the same frozen arrays throughout", async () => {
  const { element, canvas, view } = await placed(made, 400, undefined, { task: sheetTask() });
  const blank = element.filled;
  expect(await agreed(element)).toBe(false);
  expect(Object.isFrozen(blank) && blank?.every(Object.isFrozen)).toBe(true);
  // A stroke under way is no stroke of the sheet's yet: it lands when it lifts.
  const writing = press(canvas, view(), 300, 100, 400);
  expect(element.filled).toBe(blank);
  writing.lift();
  const stroked = element.filled;
  expect(await agreed(element)).toBe(true);
  level(canvas, view(), 500, 100, 400);
  expect(element.filled).toBe(stroked);
  element.undo();
  expect(element.filled).toBe(stroked);
  element.undo();
  expect(element.filled).toBe(blank);
  level(canvas, view(), 300, 100, 400);
  expect(element.filled).toBe(stroked);
  element.clear();
  expect(await agreed(element)).toBe(false);
  element.undo();
  expect(element.filled).toBe(stroked);
  // The eraser's stroke stays on the sheet until it lifts, as it stays in the work for checking.
  element.tool = "eraser";
  const erasing = press(canvas, view(), 300, 50, 450);
  expect(probe(element).pending).toHaveLength(1);
  expect(await agreed(element)).toBe(true);
  erasing.lift();
  expect(await agreed(element)).toBe(false);
  // Every sheet's answer is filled with the same arrays.
  const other = await placed(made, 400, undefined, { task: sheetTask() });
  expect(other.element.filled).toBe(blank);
});

test("an answer of the whole sheet is filled as one anywhere is, and a sheet of choices or with no task has nothing to say", async () => {
  const essay = sheetTask({ grid: "lines", items: [{ answer_slots: [{ binding: "sheet" }] }] });
  const { element, canvas, view } = await placed(made, 400, undefined, { task: essay });
  expect(element.filled).toEqual([[false]]);
  level(canvas, view(), 300, 100, 400);
  expect(element.filled).toEqual([[true]]);
  const choices = await placed(made, 400, undefined, { task: CHOICES });
  expect(choices.element.filled).toBeNull();
  level(choices.canvas, choices.view(), 300, 100, 400);
  expect(choices.element.filled).toBeNull();
  const none = await placed(made, 400);
  expect(none.element.filled).toBeNull();
  level(none.canvas, none.view(), 300, 100, 400);
  expect(none.element.filled).toBeNull();
});

test("an action's historychange finds filled already new, and a task or a history given changes it with no event", async () => {
  const { element, canvas, view } = await placed(made, 400, undefined, { task: sheetTask() });
  const told: unknown[] = [];
  element.addEventListener("historychange", () => told.push(element.filled));
  level(canvas, view(), 300, 100, 400);
  expect(told).toEqual([[[true]]]);
  told.length = 0;
  // Another task of the same grid asks another answer: choices say nothing, and the strokes stay.
  element.task = CHOICES;
  expect(element.filled).toBeNull();
  element.task = sheetTask({ id: "posts-2" });
  expect(element.filled).toEqual([[true]]);
  element.task = undefined;
  expect(element.filled).toBeNull();
  element.task = sheetTask({ grid: "dots" });
  expect(element.filled).toEqual([[true]]);
  element.history = [];
  expect(element.filled).toEqual([[false]]);
  expect(told).toEqual([]);
});
