import { afterEach, expect, test } from "vitest";
import { server, userEvent } from "vitest/browser";
import { line } from "../core/pages.fixture.js";
import { sheetTask, workbookTask, workedExample } from "../core/tasks.fixture.js";
import "./index.js";
import { devtools, placed } from "./pointer.fixture.js";
import { probe } from "./probe.js";

// No text of the element is selected, nor does a pen's touch on the sheet start a gesture of the
// system: on an iPad a pen's double tap or long press would select text and bring up the menu of the
// selection over the sheet.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
  document.getSelection()?.removeAllRanges();
});

test("a triple click on the statement selects nothing, on a sheet and on a workbook", async () => {
  for (const task of [sheetTask(), workbookTask([line("3 + 4 = []")])]) {
    const { root } = await placed(made, 500, undefined, { task });
    const statement = root.querySelector(".statement p");
    if (statement === null) throw new Error("the element shows no statement");
    await userEvent.tripleClick(statement);
    expect(document.getSelection()?.toString()).toBe("");
  }
});

// Firefox computes the property auto under a host of none, which the triple click above holds.
test.skipIf(server.browser === "firefox")(
  "every element of the shadow tree, on each kind, computes no selection and no menu of a long press",
  async () => {
    const shown = [sheetTask(), workbookTask([line("3 + 4 = []")]), undefined];
    for (const task of shown) {
      const { element, root } = await placed(made, 500, undefined, task && { task });
      if (task === undefined) element.workedExample = workedExample();
      for (const part of [element, ...root.querySelectorAll("*")]) {
        const style: CSSStyleDeclaration & { webkitTouchCallout?: string } = getComputedStyle(part);
        const name = `${part.tagName} ${part.getAttribute("class") ?? ""}`;
        expect(style.webkitUserSelect || style.userSelect, name).toBe("none");
        expect(style.webkitTouchCallout ?? "none", name).toBe("none");
      }
    }
  },
);

test("a selection starts nowhere in the shadow tree: on the bar, the statement or the sheet", async () => {
  const { root } = await placed(made, 500, undefined, { task: sheetTask() });
  for (const selector of [".tools button .label", ".statement p", ".viewport", "canvas"]) {
    const target = root.querySelector(selector);
    if (target === null) throw new Error(`the element has no ${selector}`);
    const event = new Event("selectstart", { bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    expect(event.defaultPrevented, selector).toBe(true);
  }
});

test.runIf(devtools)(
  "a pen's touch on the canvas starts none of the system's gestures, and a finger's is left to it",
  async () => {
    const { element, canvas } = await placed(made, 500);
    // A touch's type is WebKit's alone: Chromium makes a touch without it, and it is set here.
    const touchOf = (touchType: string) => {
      const touch = new Touch({ identifier: 1, target: canvas, clientX: 200, clientY: 200 });
      Object.defineProperty(touch, "touchType", { value: touchType });
      return touch;
    };
    for (const type of ["touchstart", "touchmove"]) {
      for (const [touchType, prevented] of [
        ["stylus", true],
        ["direct", false],
      ] as const) {
        const touch = touchOf(touchType);
        const event = new TouchEvent(type, {
          bubbles: true,
          cancelable: true,
          changedTouches: [touch],
          touches: [touch],
        });
        canvas.dispatchEvent(event);
        expect(event.defaultPrevented, `${type} of ${touchType}`).toBe(prevented);
      }
    }
    // The touches write nothing: the pen writes by its pointer events.
    expect(probe(element).strokes).toEqual([]);
  },
);
