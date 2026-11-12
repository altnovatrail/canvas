import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { budget } from "../core/budget.fixture.js";
import { SHORT } from "../core/pages.fixture.js";
import { sheetTask, workbookTask, workedExample } from "../core/tasks.fixture.js";
import { contrast } from "./axe.fixture.js";
import type { NovatrailCanvas } from "./index.js";
import { labelsFor } from "./labels.js";
import {
  accessibilityTree,
  at,
  input,
  placed,
  screenshot,
  settle,
  spacer,
} from "./pointer.fixture.js";
import { probe } from "./probe.js";

// The sheet from the keyboard (T93; R33): the element's own scroll container, while its content
// overflows it, is a region named by the canvas kind, with a stop of Tab of its own, so that the
// keyboard scrolls it in Safari too, where a container that nothing in it can take the focus in
// scrolls by no key (R90 spec; WebKit's bug 277290). Tab goes into it from the row and out of it to
// what follows the element (2.1.2), and the keys scroll it as the browser scrolls a container. An
// element without a height of its own scrolls with the page and has no such stop, and neither has
// one whose task fits. A ring shows the focus the keyboard brought, over the sheet (2.4.7).

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
  window.scrollTo({ top: 0, behavior: "instant" });
});

/** A button after the element, where Tab goes out of it. */
function after(): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = "After";
  document.body.append(button);
  made.push(button);
  return button;
}

/** The kinds of canvas, put on the page, and what the region and the row are named in English. */
const KINDS = [
  {
    kind: "a sheet",
    give: (element: NovatrailCanvas) => {
      element.task = sheetTask();
    },
    region: "Sheet",
    row: "Sheet buttons",
  },
  {
    kind: "a workbook",
    give: (element: NovatrailCanvas) => {
      element.task = workbookTask(SHORT);
    },
    region: "Workbook",
    row: "Workbook buttons",
  },
  {
    kind: "a worked example",
    give: (element: NovatrailCanvas) => {
      element.workedExample = workedExample();
    },
    region: "Worked example",
    row: "Worked example buttons",
  },
];

/** An element of a kind, 400 CSS px wide and of a height, if given, with a button after it. */
async function put(give: (element: NovatrailCanvas) => void, height?: number) {
  const placedOne = await placed(made, 400, height);
  give(placedOne.element);
  await settle();
  return { ...placedOne, ring: ring(placedOne.root), next: after() };
}

/** The ring of the container's focus, its sibling. */
function ring(root: ShadowRoot): HTMLElement {
  const found = root.querySelector<HTMLElement>(".viewport + .ring");
  if (!found) throw new Error("the element has no ring");
  return found;
}

/** The container's attributes of a region: its stop of Tab, its role and its name. */
const regionOf = (viewport: HTMLElement) =>
  ["tabindex", "role", "aria-label"].map((name) => viewport.getAttribute(name));

test.each(KINDS)(
  "on $kind of a height its content overflows, Tab goes from the row into the container, a region named by the kind in Chromium's own tree, and out of it to what follows; Shift+Tab comes back",
  async ({ give, region, row: rowName }) => {
    const { root, viewport, row, next } = await put(give, 300);
    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    expect(regionOf(viewport)).toEqual(["0", "region", region]);
    expect(row.getAttribute("aria-label")).toBe(rowName);
    const nodes = await accessibilityTree();
    const named = (role: string) =>
      nodes
        .filter((node) => node.role?.value === role && !node.ignored)
        .map((node) => node.name?.value);
    expect(named("region")).toEqual([region]);
    expect(named("toolbar")).toEqual([rowName]);
    await userEvent.tab();
    expect(row.contains(root.activeElement)).toBe(true);
    await userEvent.tab();
    expect(root.activeElement).toBe(viewport);
    expect(viewport.matches(":focus-visible")).toBe(true);
    await userEvent.tab();
    expect(document.activeElement).toBe(next);
    await userEvent.tab({ shift: true });
    expect(root.activeElement).toBe(viewport);
    await userEvent.tab({ shift: true });
    expect(row.contains(root.activeElement)).toBe(true);
  },
);

test("the keys scroll the container in focus as the browser scrolls one, and the layers go with it: Page Down, End, Home, the arrow down, Page Up and space", {
  timeout: budget(1_247),
}, async () => {
  const { element, viewport } = await put((each) => {
    each.task = sheetTask();
  }, 300);
  const end = viewport.scrollHeight - viewport.clientHeight;
  expect(end).toBeGreaterThan(200);
  await userEvent.tab();
  await userEvent.tab();
  expect(element.shadowRoot?.activeElement).toBe(viewport);
  const steps: [keys: string, check: (top: number) => boolean][] = [
    ["{PageDown}", (top) => top > 100],
    ["{End}", (top) => Math.abs(top - end) < 1],
    ["{Home}", (top) => top === 0],
    ["{ArrowDown}", (top) => top > 0 && top < 100],
    ["{PageUp}", (top) => top === 0],
    [" ", (top) => top > 100],
  ];
  // Chromium scrolls from the keyboard smoothly: the next key comes once the scroll has come to
  // rest, or a second has gone by without one.
  for (const [keys, check] of steps) {
    const rested = new Promise((resolve) => {
      viewport.addEventListener("scrollend", resolve, { once: true });
      setTimeout(resolve, 1000);
    });
    await userEvent.keyboard(keys);
    await rested;
    expect(check(viewport.scrollTop), `${keys} at ${viewport.scrollTop} of ${end}`).toBe(true);
  }
  await settle();
  // The sheet's visible part follows the container: its top is in units of the sheet, under the
  // statement.
  expect(probe(element).view?.vy).toBeGreaterThan(0);
  expect(window.scrollY).toBe(0);
});

test.each([
  { which: "an element without a height of its own", height: undefined },
  { which: "an element of a height its task fits in", height: 1200 },
])(
  "$which has no container of its own: no stop of Tab, role or name, and Tab goes from the row to what follows",
  async ({ height }) => {
    const { root, viewport, row, next } = await put((each) => {
      each.task = sheetTask();
    }, height);
    expect(viewport.scrollHeight - viewport.clientHeight).toBeLessThan(1);
    expect(regionOf(viewport)).toEqual([null, null, null]);
    await userEvent.tab();
    expect(row.contains(root.activeElement)).toBe(true);
    await userEvent.tab();
    expect(document.activeElement).toBe(next);
  },
);

test("the region comes with an overflow and goes with it, but one that holds the focus stays till the focus leaves it, not when the window loses it", async () => {
  const { element, root, viewport, next } = await put((each) => {
    each.task = sheetTask();
  });
  expect(regionOf(viewport)).toEqual([null, null, null]);
  element.style.height = "300px";
  await settle();
  expect(regionOf(viewport)).toEqual(["0", "region", "Sheet"]);
  element.style.height = "";
  await settle();
  expect(regionOf(viewport)).toEqual([null, null, null]);
  element.style.height = "300px";
  await settle();
  viewport.focus();
  element.style.height = "1200px";
  await settle();
  expect(root.activeElement).toBe(viewport);
  expect(regionOf(viewport)).toEqual(["0", "region", "Sheet"]);
  // The window losing the focus blurs the container, which still holds it.
  viewport.dispatchEvent(new FocusEvent("blur"));
  expect(regionOf(viewport)).toEqual(["0", "region", "Sheet"]);
  await userEvent.tab();
  expect(document.activeElement).toBe(next);
  expect(regionOf(viewport)).toEqual([null, null, null]);
});

test("the region and the row are named in the element's language, by the kind it shows", async () => {
  const { element, viewport, row } = await put((each) => {
    each.task = sheetTask();
  }, 300);
  const russian = labelsFor("ru").labels;
  const names = () => [viewport.getAttribute("aria-label"), row.getAttribute("aria-label")];
  element.setAttribute("lang", "ru");
  expect(names()).toEqual([russian.sheet, russian.sheetButtons]);
  expect([russian.sheet, russian.sheetButtons]).toEqual(["Лист", "Кнопки листа"]);
  element.task = workbookTask(SHORT);
  await settle();
  expect(names()).toEqual(["Тетрадь", "Кнопки тетради"]);
  element.task = undefined;
  element.workedExample = workedExample();
  await settle();
  expect(names()).toEqual(["Пример", "Кнопки примера"]);
  element.setAttribute("lang", "de");
  expect(names()).toEqual(["Worked example", "Worked example buttons"]);
  // The container takes no language of its own: the statement in it has the task's.
  expect(viewport.hasAttribute("lang")).toBe(false);
});

test.each([
  { theme: "the default theme", paper: undefined, ink: undefined },
  { theme: "a dark theme of the consumer's", paper: "rgb(17, 17, 17)", ink: "rgb(238, 238, 238)" },
])(
  "in $theme the focus the keyboard brings to the container shows a ring two pixels wide inside its edge, in the ink's colour, over the sheet, at least 3:1 to the paper",
  async ({ paper, ink }) => {
    const {
      element,
      root,
      viewport,
      row,
      ring: shown,
    } = await put((each) => {
      each.task = sheetTask();
    }, 300);
    if (paper !== undefined) element.style.setProperty("--novatrail-canvas-paper", paper);
    if (ink !== undefined) element.style.setProperty("--novatrail-canvas-ink", ink);
    await settle();
    expect(getComputedStyle(shown).display).toBe("none");
    // A point of the container's edge, low on it, where the sheet's paper is under the ring.
    const x = viewport.offsetLeft + 1;
    const y = viewport.getBoundingClientRect().bottom - element.getBoundingClientRect().top - 20;
    const before = (await screenshot(element))(x, y);
    await userEvent.tab();
    await userEvent.tab();
    expect(root.activeElement).toBe(viewport);
    const style = getComputedStyle(shown);
    expect([style.display, style.outlineStyle, style.outlineWidth, style.outlineOffset]).toEqual([
      "block",
      "solid",
      "2px",
      "-2px",
    ]);
    expect(style.outlineColor).toBe(getComputedStyle(row).color);
    const sheetPaper = getComputedStyle(root.querySelector(".sheet") as Element).backgroundColor;
    expect(contrast(style.outlineColor, sheetPaper)).toBeGreaterThan(3);
    expect(shown.getBoundingClientRect()).toEqual(viewport.getBoundingClientRect());
    const colour = (await screenshot(element))(x, y);
    expect(`rgb(${colour.join(", ")})`).toBe(style.outlineColor);
    expect(colour).not.toEqual(before);
  },
);

test("a press on the sheet takes the focus to the container without a ring, and scrolls neither the page nor the container", async () => {
  const {
    root,
    viewport,
    canvas,
    view,
    ring: shown,
  } = await put((each) => {
    each.task = sheetTask();
  }, 300);
  spacer(made);
  window.scrollTo({ top: 40, behavior: "instant" });
  viewport.scrollTop = 120;
  await settle();
  const scrolled = [window.scrollY, viewport.scrollTop];
  const point = at(canvas, view(), 500, view().vy + 100);
  await input("mousePressed", point);
  await input("mouseReleased", point);
  await settle();
  expect(root.activeElement).toBe(viewport);
  expect(viewport.matches(":focus-visible")).toBe(false);
  expect(getComputedStyle(shown).display).toBe("none");
  expect([window.scrollY, viewport.scrollTop]).toEqual(scrolled);
});
