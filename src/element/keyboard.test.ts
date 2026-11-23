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
  devtools,
  input,
  placed,
  screenshot,
  settle,
  spacer,
} from "./pointer.fixture.js";
import { probe } from "./probe.js";

// The sheet from the keyboard (R33): the element's own scroll container, while its content
// overflows it, is a region named by the canvas kind, with a stop of Tab of its own, so that the
// keyboard scrolls it in Safari too, where a container that nothing in it can take the focus in
// scrolls by no key (WebKit's bug 277290). Tab goes into it from the bar and out of it to
// what follows the element (WCAG 2.1.2), and the keys scroll it as the browser scrolls a
// container. A sheet goes past its page, wider than its container, which so is a region
// with or without a height of its own; a worked example's sheet is its page alone, and an element
// without a height of its own, or one its example fits in, scrolls with the page and has no such
// stop. A ring shows the focus the keyboard brought, over the sheet (WCAG 2.4.7).

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

/**
 * The kinds of canvas, put on the page, what the region and the bar are named in English — a
 * worked example has no bar —, and the buttons Tab comes to between the bar and the region: a
 * worked example's row.
 */
const KINDS = [
  {
    kind: "a sheet",
    give: (element: NovatrailCanvas) => {
      element.task = sheetTask();
    },
    region: "Sheet",
    row: "Sheet buttons",
    between: [],
  },
  {
    kind: "a workbook",
    give: (element: NovatrailCanvas) => {
      element.task = workbookTask(SHORT);
    },
    region: "Workbook",
    row: "Workbook buttons",
    between: [],
  },
  {
    kind: "a worked example",
    give: (element: NovatrailCanvas) => {
      element.workedExample = workedExample();
    },
    region: "Worked example",
    row: null,
    between: ["Next", "Demo"],
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
  "on $kind of a height its content overflows, Tab goes from the bar, or through a worked example's row, into the container, a region named by the kind in Chromium's own tree, and out of it to what follows; Shift+Tab comes back",
  async ({ give, region, row: rowName, between }) => {
    const { root, viewport, row, next } = await put(give, 300);
    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    expect(regionOf(viewport)).toEqual(["0", "region", region]);
    expect(row.getAttribute("aria-label")).toBe(rowName);
    if (devtools) {
      const nodes = await accessibilityTree();
      const named = (role: string) =>
        nodes
          .filter((node) => node.role?.value === role && !node.ignored)
          .map((node) => node.name?.value);
      expect(named("region")).toEqual([region]);
      expect(named("toolbar")).toEqual(rowName === null ? [] : [rowName]);
    }
    if (rowName !== null) {
      await userEvent.tab();
      expect(row.contains(root.activeElement)).toBe(true);
    }
    for (const label of between) {
      await userEvent.tab();
      expect(root.activeElement?.textContent).toBe(label);
    }
    await userEvent.tab();
    expect(root.activeElement).toBe(viewport);
    expect(viewport.matches(":focus-visible")).toBe(true);
    await userEvent.tab();
    expect(document.activeElement).toBe(next);
    await userEvent.tab({ shift: true });
    expect(root.activeElement).toBe(viewport);
    for (const label of [...between].reverse()) {
      await userEvent.tab({ shift: true });
      expect(root.activeElement?.textContent).toBe(label);
    }
    if (rowName !== null) {
      await userEvent.tab({ shift: true });
      expect(row.contains(root.activeElement)).toBe(true);
    }
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
  // The browsers scroll from the keyboard smoothly: the next key comes once the place the key
  // scrolls to has held for three frames, not after a time, which a loaded host outlasts, nor on a
  // scrollend, which the scroll of the key before may send late. A key that never gets
  // there stops the waiting after 600 frames, and the check says where it is.
  for (const [keys, check] of steps) {
    await userEvent.keyboard(keys);
    for (let still = 0, last = Number.NaN, frames = 0; still < 3 && frames < 600; frames++) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const top = viewport.scrollTop;
      still = top === last && check(top) ? still + 1 : 0;
      last = top;
    }
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
  { which: "an element of a height its worked example fits in", height: 1200 },
])(
  "$which has no container of its own on a worked example, whose sheet is its page alone: no stop of Tab, role or name, and Tab goes from its row to what follows; a sheet's, which goes past its page, is a region (R73)",
  async ({ height }) => {
    const { element, root, viewport, next } = await put((each) => {
      each.workedExample = workedExample();
    }, height);
    expect(viewport.scrollHeight - viewport.clientHeight).toBeLessThan(1);
    expect(viewport.scrollWidth - viewport.clientWidth).toBeLessThan(1);
    await expect.poll(() => regionOf(viewport), { timeout: 1000 }).toEqual([null, null, null]);
    await userEvent.tab();
    expect(root.activeElement?.textContent).toBe("Next");
    await userEvent.tab();
    expect(root.activeElement?.textContent).toBe("Demo");
    await userEvent.tab();
    expect(document.activeElement).toBe(next);
    element.workedExample = undefined;
    await settle();
    expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);
    await expect
      .poll(() => regionOf(viewport), { timeout: 1000 })
      .toEqual(["0", "region", "Sheet"]);
  },
);

test("the region comes with an overflow and goes with it, but one that holds the focus stays till the focus leaves it, not when the window loses it", async () => {
  // A worked example, whose sheet is its page alone: a sheet's goes past it, and always overflows.
  const { element, root, viewport, next } = await put((each) => {
    each.workedExample = workedExample();
  });
  expect(regionOf(viewport)).toEqual([null, null, null]);
  element.style.height = "300px";
  await settle();
  expect(regionOf(viewport)).toEqual(["0", "region", "Worked example"]);
  element.style.height = "";
  await settle();
  expect(regionOf(viewport)).toEqual([null, null, null]);
  element.style.height = "300px";
  await settle();
  viewport.focus();
  element.style.height = "1200px";
  await settle();
  expect(root.activeElement).toBe(viewport);
  expect(regionOf(viewport)).toEqual(["0", "region", "Worked example"]);
  // The window losing the focus blurs the container, which still holds it.
  viewport.dispatchEvent(new FocusEvent("blur"));
  expect(regionOf(viewport)).toEqual(["0", "region", "Worked example"]);
  await userEvent.tab();
  expect(document.activeElement).toBe(next);
  expect(regionOf(viewport)).toEqual([null, null, null]);
});

test("the region and the row are named in the element's language, by the kind it shows", async () => {
  const { element, viewport, row } = await put((each) => {
    each.task = sheetTask();
  }, 300);
  const russian = labelsFor("ru").labels;
  // A worked example has no bar, which so has no name.
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
  expect(names()).toEqual(["Пример", null]);
  element.setAttribute("lang", "de");
  expect(names()).toEqual(["Worked example", null]);
  // The name is English, and the container is said in English: what it holds, in German.
  expect(viewport.matches(":lang(en)")).toBe(true);
});

test("for a lang the labels are not in, the container is in theirs and the column, the statement, a workbook's lines and a demo's parts in the element's, of every kind and through every change; a lang they are in gives both the element's, and none neither a lang of its own (T106, T111)", async () => {
  const { element, root, viewport } = await put((each) => {
    each.task = sheetTask();
  }, 300);
  const column = root.querySelector<HTMLElement>(".column");
  if (column?.parentElement !== viewport) throw new Error("the container holds no column");
  const langs = () => [viewport.getAttribute("lang"), column.getAttribute("lang")];
  /** Whether what a selector finds in the column is in German, as the element is. */
  const german = (selector: string) => {
    const found = column.querySelector(selector);
    if (!found) throw new Error(`the column has no ${selector}`);
    return found.matches(":lang(de)");
  };
  /** The container in English, named in it, and the column, all it holds, in the element's tag. */
  const apart = (tag: string, name: string) => {
    expect(langs()).toEqual(["en", tag]);
    expect([...viewport.children]).toEqual([column]);
    expect(viewport.getAttribute("aria-label")).toBe(name);
    expect(viewport.matches(":lang(en)")).toBe(true);
  };
  expect(langs()).toEqual([null, null]);
  element.setAttribute("lang", "de-CH");
  apart("de-CH", "Sheet");
  expect([german(".statement"), german(".sheet")]).toEqual([true, true]);
  element.task = workbookTask(SHORT);
  await settle();
  apart("de-CH", "Workbook");
  expect(german(".print [role='list']")).toBe(true);
  element.task = undefined;
  element.workedExample = workedExample();
  await settle();
  apart("de-CH", "Worked example");
  expect(german(".parts")).toBe(true);
  element.setAttribute("lang", "fr");
  apart("fr", "Worked example");
  // A lang of no language is out of the table too: the column keeps it, as the element has it.
  element.setAttribute("lang", "");
  apart("", "Worked example");
  // A lang the labels are in: both have it, for Firefox gives a shadow tree no language of its
  // host, and WebKit takes no new one into it.
  for (const tag of ["ru-RU", "en-GB", "ru"]) {
    element.setAttribute("lang", tag);
    expect(langs()).toEqual([tag, tag]);
    expect(viewport.matches(`:lang(${tag})`)).toBe(true);
  }
  element.setAttribute("lang", "de");
  apart("de", "Worked example");
  element.removeAttribute("lang");
  expect(langs()).toEqual([null, null]);
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
    // A point of the container's bottom edge, in its middle, where the sheet's paper is under the
    // ring, away from the bar of glass and its shadow at the left.
    const x = viewport.offsetLeft + viewport.clientWidth / 2;
    const y = viewport.getBoundingClientRect().bottom - element.getBoundingClientRect().top - 1;
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

test.runIf(devtools)(
  "a press on the sheet takes the focus to the container without a ring, and scrolls neither the page nor the container",
  async () => {
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
  },
);
