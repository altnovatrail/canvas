// axe-core over the element's shadow tree, in the tests in Chromium (T90 in RUN.md; R70 in
// docs/decisions.md): app's CI does not look into the canvas's element, so canvas's own does (R90
// spec). The rules are those of WCAG 2.0, 2.1 and 2.2 at levels A and AA (wcag.fixture.ts). Its
// target-size measures 2.5.8, 24 × 24 CSS px; the 44 × 44 of 2.5.5, which R90 spec asks of canvas
// too, is the row's own test (R28). What axe cannot tell it leaves incomplete: a test names those
// it expects of its kind of canvas, so that a new one does not pass in silence. Like the tests, the
// build leaves this module out, and the package never has it.

import axe from "axe-core";
import { expect, vi } from "vitest";
import { SHORT } from "../core/pages.fixture.js";
import { DEMO, REMAINDERS, sheetTask, workbookTask, workedExample } from "../core/tasks.fixture.js";
import type { NovatrailCanvas, WorkedExample } from "./index.js";
import { arrive, level, placed, quarters, settle, sheetWork } from "./pointer.fixture.js";
import { TAGS } from "./wcag.fixture.js";

/**
 * Run axe over a root — the element, whose open shadow root it enters — and throw, naming each rule
 * and node, on any violation, and on incomplete rules other than those named.
 */
export async function axeOf(root: Element, incomplete: readonly string[] = []): Promise<void> {
  const result = await axe.run(root, { runOnly: { type: "tag", values: [...TAGS] } });
  const violations = result.violations.map(
    ({ id, nodes }) =>
      `${id}: ${nodes.map((node) => `${String(node.target)} — ${node.failureSummary}`).join("; ")}`,
  );
  if (violations.length > 0) throw new Error(`axe finds violations:\n${violations.join("\n")}`);
  const left = new Set(result.incomplete.map(({ id }) => id));
  const named = new Set(incomplete);
  if (left.size !== named.size || [...left].some((id) => !named.has(id))) {
    throw new Error(
      `axe leaves incomplete ${[...left].join(", ") || "nothing"}, not ${incomplete.join(", ") || "nothing"}`,
    );
  }
}

/** The relative luminance of an opaque colour as getComputedStyle gives it (WCAG 2.2, «relative
 * luminance»): a colour seen through, of an alpha below 1, has none of its own. */
function luminance(colour: string): number {
  const found = /^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/.exec(colour);
  if (!found) throw new Error(`${colour} is no rgb() colour`);
  if (found[4] !== undefined && Number(found[4]) < 1) throw new Error(`${colour} is not opaque`);
  const [r = 0, g = 0, b = 0] = found.slice(1, 4).map((value) => {
    const c = Number(value) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The contrast ratio of two opaque colours, from 1 to 21 (WCAG 2.2, «contrast ratio»). */
export function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

/** What axe leaves incomplete on a workbook: the contrast of its printed lines, which the layer of
 * input covers, so that axe cannot tell their background. */
export const WORKBOOK_INCOMPLETE: readonly string[] = ["color-contrast"];

/** A kind of canvas axe looks at: how to put one on the page, and what axe leaves incomplete. */
export interface Kind {
  readonly name: string;
  readonly put: (made: HTMLElement[]) => Promise<NovatrailCanvas>;
  readonly incomplete: readonly string[];
}

/** The consumer's media, a new one for each element: every picture the same file of four colours,
 * and every call kept, so that the files given can be waited for. */
const media = () => vi.fn(() => quarters());

/**
 * The pictures an element shows once their files have come: as many images, HTML and SVG, as
 * given, and the frames they were drawn in. It waits for the files and their decodes themselves,
 * not for a time: under load a file of the consumer's can take longer than any time a test would
 * guess (R75). The decodes are those a spy on `HTMLImageElement.prototype.decode` records, which
 * the test's file puts before each test, as arrive() asks.
 */
async function pictured(element: NovatrailCanvas, images: number): Promise<void> {
  // The loads first, however long the consumer's media takes: a file a canvas encodes may come
  // after the first task, and arrive() waits only for the decodes of files that have come.
  await new Promise((resolve) => setTimeout(resolve));
  const given = element.media;
  if (!vi.isMockFunction(given)) throw new Error("pictured waits for the files a mock gave");
  if (images > 0 && given.mock.calls.length === 0) throw new Error("the element asked for no file");
  await Promise.allSettled(given.mock.results.map(({ value }) => value));
  await arrive();
  expect(element.shadowRoot?.querySelectorAll("img, image").length).toBe(images);
}

/** A sheet put on the page, 400 CSS px wide, with a level stroke on it. */
async function written(made: HTMLElement[]) {
  const { element, canvas, view } = await placed(made, 400, undefined, { task: sheetTask() });
  level(canvas, view(), 200, 100, 300);
  await settle();
  return element;
}

/** A worked example on a new element — it shows one only before it shows a task —, every part of
 * its demo opened, and its pictures come. */
function example(given: WorkedExample, images = 0) {
  return async (made: HTMLElement[]) => {
    const { element } = await placed(made, 400);
    element.media = media();
    element.workedExample = given;
    element.demoState = { opened: given.demo.length, hidden: false };
    await pictured(element, images);
    return element;
  };
}

/** Every kind of canvas the element shows: a sheet with its task and a stroke, a statement with
 * pictures, a workbook, marks on a sheet, a worked example on a sheet with pictures beside it and
 * on its sheet, and one on a workbook. */
export const KINDS: readonly Kind[] = [
  { name: "a sheet with its task and a stroke", put: written, incomplete: [] },
  {
    name: "a statement with pictures",
    put: async (made) => {
      const statement = [
        { text: "Look at the pictures." },
        {
          picture: "pictures/posts.png",
          alt: "A path with posts along it",
          width: 120,
          height: 60,
        },
        { picture: "pictures/clock.png", alt: "A clock at three", width: 120, height: 60 },
      ];
      const { element } = await placed(made, 400);
      element.media = media();
      element.task = sheetTask({ statement });
      await pictured(element, 2);
      return element;
    },
    incomplete: [],
  },
  {
    name: "a workbook",
    put: async (made) =>
      (await placed(made, 400, undefined, { task: workbookTask(SHORT) })).element,
    incomplete: WORKBOOK_INCOMPLETE,
  },
  {
    name: "marks on a sheet",
    put: async (made) => {
      const element = await written(made);
      const { submission } = await sheetWork(element);
      element.marks = { submission, marks: [{ kind: "frame", at: { group: "A" }, name: "This" }] };
      await settle();
      return element;
    },
    incomplete: [],
  },
  {
    name: "a worked example on a sheet, with pictures",
    put: example(workedExample(), DEMO.filter((part) => "picture" in part).length),
    incomplete: [],
  },
  {
    name: "a worked example on a workbook",
    put: example(REMAINDERS as WorkedExample),
    incomplete: WORKBOOK_INCOMPLETE,
  },
];
