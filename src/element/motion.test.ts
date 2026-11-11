import { afterEach, beforeEach, expect, test } from "vitest";
import { cdp } from "vitest/browser";
import { sheetTask, workedExample } from "../core/tasks.fixture.js";
import { placed, settle, spacer } from "./pointer.fixture.js";

// Motion and the learner's wish for less of it (T92; WCAG 2.3.3, which R90 spec asks of canvas):
// nothing in the element moves but the scrolling, and its scrolls jump to where they go — Up and
// Down, two fingers and a part of a worked example brought into sight — whatever smoothness the
// page asks of its scrolling. The style animates nothing: its one transition, of the canvas's
// colour, a millisecond long, moves nothing and only tells the element to draw the ink anew. The
// page asks for reduced motion here, through the DevTools protocol, so that a smoothness that
// came in quietly would fail where a learner who asked for none would see it.

const made: HTMLElement[] = [];
const smooth: HTMLElement[] = [];

beforeEach(async () => {
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  expect(matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
});

afterEach(async () => {
  for (const each of smooth.splice(0)) each.style.scrollBehavior = "";
  for (const element of made.splice(0)) element.remove();
  window.scrollTo({ top: 0, behavior: "instant" });
  await cdp().send("Emulation.setEmulatedMedia", { features: [] });
});

/** A page, or an ancestor, that asks its scrolling to be smooth. */
function smoothly(element: HTMLElement): void {
  element.style.scrollBehavior = "smooth";
  smooth.push(element);
}

/** A button of the row by its label. */
function buttonOf(row: HTMLElement, label: string): HTMLButtonElement {
  const found = [...row.querySelectorAll("button")].find((each) => each.textContent === label);
  if (found === undefined) throw new Error(`the row has no ${label}`);
  return found;
}

test("Up and Down jump to where they scroll, the sheet's container, an ancestor and the page alike, though the page asks for smooth scrolling", async () => {
  smoothly(document.documentElement);
  const held = await placed(made, 400, 300, { task: sheetTask() });
  const down = buttonOf(held.row, "Down");
  down.click();
  // At once, in the same task: a smooth scroll would have gone nowhere yet.
  expect(held.viewport.scrollTop).toBeCloseTo(Math.round(0.8 * held.viewport.clientHeight), 0);
  buttonOf(held.row, "Up").click();
  expect(held.viewport.scrollTop).toBe(0);
  held.element.remove();

  const scroller = document.createElement("div");
  scroller.style.cssText = "height: 300px; overflow: auto;";
  smoothly(scroller);
  document.body.append(scroller);
  const free = await placed(made, 400, undefined, { parent: scroller, task: sheetTask() });
  buttonOf(free.row, "Down").click();
  expect(scroller.scrollTop).toBeGreaterThan(0);
  const after = scroller.scrollTop;
  await settle();
  expect(scroller.scrollTop).toBe(after);
  scroller.remove();

  const page = await placed(made, 400, undefined, { task: sheetTask() });
  spacer(made);
  await settle();
  buttonOf(page.row, "Down").click();
  expect(window.scrollY).toBeGreaterThan(0);
});

test("Next brings a part into sight at once, though the page asks for smooth scrolling", async () => {
  smoothly(document.documentElement);
  const { element, row } = await placed(made, 400);
  element.workedExample = workedExample();
  spacer(made);
  await settle();
  // The page scrolled well below the list: the part comes back up into sight.
  window.scrollTo({ top: 1200, behavior: "instant" });
  await settle();
  buttonOf(row, "Next").click();
  const item = element.shadowRoot?.querySelector(".parts li")?.getBoundingClientRect();
  expect(item?.top).toBeGreaterThanOrEqual(row.getBoundingClientRect().bottom - 0.5);
  expect(item?.bottom).toBeLessThanOrEqual(window.innerHeight);
});

/** Every style rule of a sheet, those inside its media queries too. */
function rulesOf(rules: CSSRuleList): CSSStyleRule[] {
  return [...rules].flatMap((rule) => {
    if (rule instanceof CSSStyleRule) return [rule];
    if (rule instanceof CSSGroupingRule) return rulesOf(rule.cssRules);
    return [];
  });
}

test("the element's style animates nothing and asks for no smooth scrolling, and its one transition is the canvas's colour, which moves nothing", async () => {
  const { root } = await placed(made, 400, undefined, { task: sheetTask() });
  const sheets = root.adoptedStyleSheets;
  expect(sheets.length).toBeGreaterThan(0);
  const all = sheets.flatMap((sheet) => [...sheet.cssRules]);
  expect(all.some((rule) => rule instanceof CSSKeyframesRule)).toBe(false);
  const rules = sheets.flatMap((sheet) => rulesOf(sheet.cssRules));
  expect(rules.length).toBeGreaterThan(0);
  const moving: string[] = [];
  for (const rule of rules) {
    for (const property of rule.style) {
      if (property.startsWith("animation")) moving.push(`${rule.selectorText} { ${property} }`);
      if (property === "scroll-behavior" && rule.style.scrollBehavior === "smooth") {
        moving.push(`${rule.selectorText} { scroll-behavior: smooth }`);
      }
      if (property.startsWith("transition") && rule.selectorText !== "canvas") {
        moving.push(`${rule.selectorText} { ${property} }`);
      }
    }
  }
  expect(moving).toEqual([]);
  const canvas = rules.filter((rule) => rule.selectorText === "canvas");
  expect(canvas.map((rule) => rule.style.transition).filter(Boolean)).toEqual([
    "color 1ms step-end",
  ]);
});
