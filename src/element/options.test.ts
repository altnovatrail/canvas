import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import type { View } from "../core/screen.js";
import { sheetTask } from "../core/tasks.fixture.js";
import type { ExportedPaper, NovatrailCanvas } from "./index.js";
import { at, GRIP_MS, paperCrop, placed, settle } from "./pointer.fixture.js";

// A task of a module whose answer is a choice: its options are radio buttons on the tracing
// paper under its picture, a part of the paper that grows to hold them, moves and scales with it,
// and leaves the paper round them to the ink. A tap tells an optiontap, and the element shows as
// chosen what the consumer sets alone. Its work holds the crop of the strokes alone beside the
// crop with the paper.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

const THREE = ["7", "8", "9"];

/**
 * A task of a module on an element 500 CSS px wide: its picture a crop of 200 × 50 px, a paper of
 * 800 × 200 units at its own size where it starts, at (180, 60), and its options under it, laid out.
 */
async function module(options: readonly string[] | null = THREE) {
  const { element, root, canvas, view } = await placed(made, 500);
  const statement = await paperCrop();
  element.paper = { statement, source: "module", ...(options === null ? {} : { options }) };
  const grip = root.querySelector<HTMLElement>(".grip");
  const group = root.querySelector<HTMLElement>(".tracing-choices");
  const edge = root.querySelector<SVGRectElement>(".tracing .edge");
  const image = root.querySelector<SVGImageElement>(".tracing image");
  if (!grip || !group || !edge || !image) throw new Error("the element has no tracing paper");
  await expect.poll(() => grip.hidden, { timeout: GRIP_MS }).toBe(false);
  await settle();
  await settle();
  const taps: number[] = [];
  element.addEventListener("optiontap", (event) => taps.push(event.detail.option));
  const buttons = () => [...group.querySelectorAll("button")];
  return { element, root, canvas, view, group, edge, image, buttons, taps, statement };
}

/** A mouse's stroke on the canvas through the points of the sheet given, by a script. */
function write(canvas: HTMLCanvasElement, view: () => View, ...points: [number, number][]) {
  const mouse = { pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true };
  const send = (type: string, [x, y]: [number, number], init: PointerEventInit) =>
    canvas.dispatchEvent(
      new PointerEvent(type, { ...mouse, ...at(canvas, view(), x, y), ...init }),
    );
  const [first, ...rest] = points;
  if (first === undefined) return;
  send("pointerdown", first, { button: 0, buttons: 1, pressure: 0.5 });
  for (const point of rest) send("pointermove", point, { buttons: 1, pressure: 0.5 });
  send("pointerup", rest.at(-1) ?? first, { button: 0, buttons: 0 });
}

/** Whether two places on the screen meet, within the paper's edge of a CSS pixel and its rounding. */
function near(a: number, b: number): boolean {
  return Math.abs(a - b) < 1.5;
}

/** The layers a stroke of the history was written on: the paper's, or the sheet's. */
function layers(element: NovatrailCanvas) {
  return element.history.flatMap((event) =>
    event.kind === "write" ? [event.on === undefined ? "sheet" : event.on] : [],
  );
}

/** The work of a task from paper for checking, not null. */
async function paperWork(element: NovatrailCanvas): Promise<ExportedPaper> {
  const work = (await element.exportWork()) as ExportedPaper | null;
  if (work === null || !("statement" in work)) throw new Error("no work of a task from paper");
  return work;
}

test("shows a task of a module's options as radio buttons under its picture, a group named in the element's language, none chosen, the first a stop of Tab; the paper's edge holds them", async () => {
  const { element, group, edge, image, buttons } = await module();
  expect(group.hidden).toBe(false);
  expect(group.getAttribute("role")).toBe("radiogroup");
  expect(group.getAttribute("aria-label")).toBe("Answers");
  expect(buttons().map((button) => button.textContent)).toEqual(THREE);
  expect(buttons().map((button) => button.getAttribute("role"))).toEqual([
    "radio",
    "radio",
    "radio",
  ]);
  expect(buttons().map((button) => button.getAttribute("aria-checked"))).toEqual([
    "false",
    "false",
    "false",
  ]);
  expect(buttons().map((button) => button.tabIndex)).toEqual([0, -1, -1]);
  expect(element.chosen).toBeUndefined();
  // Under the picture, within the paper's edge, which grew down to hold them.
  const picture = image.getBoundingClientRect();
  const paper = edge.getBoundingClientRect();
  const options = group.getBoundingClientRect();
  expect(near(options.top, picture.bottom)).toBe(true);
  expect(near(options.bottom, paper.bottom)).toBe(true);
  expect(near(options.left, paper.left) && near(options.right, paper.right)).toBe(true);
  for (const button of buttons()) {
    const box = button.getBoundingClientRect();
    expect(box.top).toBeGreaterThan(picture.bottom);
    expect(box.bottom).toBeLessThan(paper.bottom);
  }
  element.lang = "ru";
  await settle();
  expect(group.getAttribute("aria-label")).toBe("Варианты ответа");
});

test("shows as chosen what the consumer sets alone: a tap tells and chooses nothing, and other options drop the choice", async () => {
  const { element, buttons, taps } = await module();
  element.chosen = 1;
  expect(element.chosen).toBe(1);
  expect(buttons().map((button) => button.getAttribute("aria-checked"))).toEqual([
    "false",
    "true",
    "false",
  ]);
  expect(buttons().map((button) => button.tabIndex)).toEqual([-1, 0, -1]);
  buttons()[2]?.click();
  expect(taps).toEqual([2]);
  expect(element.chosen).toBe(1);
  expect(buttons()[2]?.getAttribute("aria-checked")).toBe("false");
  element.chosen = undefined;
  expect(buttons().map((button) => button.getAttribute("aria-checked"))).toEqual([
    "false",
    "false",
    "false",
  ]);
  // The same crop in a new object with the same options keeps the choice; other options drop it.
  element.chosen = 0;
  const statement = element.paper?.statement as Blob;
  element.paper = { statement, source: "module", options: [...THREE] };
  expect(element.chosen).toBe(0);
  element.paper = { statement, source: "module", options: ["7", "8"] };
  expect(element.chosen).toBeUndefined();
  expect(buttons().map((button) => button.textContent)).toEqual(["7", "8"]);
  // A new task from paper comes with none chosen.
  element.chosen = 1;
  element.paper = { statement: await paperCrop(100, 50), source: "module", options: ["7", "8"] };
  expect(element.chosen).toBeUndefined();
});

test("takes options on a task of a module alone, each a text, and a chosen index within them alone", async () => {
  const { element } = await module();
  const statement = element.paper?.statement as Blob;
  for (const options of [[], ["7", " "], ["7", ""], [7, 8], "7"]) {
    expect(() => {
      element.paper = { statement, source: "module", options } as never;
    }).toThrow(TypeError);
  }
  expect(() => {
    element.paper = { statement, options: ["7"] };
  }).toThrow(TypeError);
  for (const option of [3, -1, 1.5, "1", null]) {
    expect(() => {
      element.chosen = option as never;
    }).toThrow(TypeError);
  }
  expect(element.chosen).toBeUndefined();
  const bare = document.createElement("novatrail-canvas");
  made.push(bare);
  expect(() => {
    bare.chosen = 0;
  }).toThrow(TypeError);
  const { element: plain, group } = await module(null);
  expect(group.hidden).toBe(true);
  expect(group.children).toHaveLength(0);
  expect(() => {
    plain.chosen = 0;
  }).toThrow(TypeError);
});

test("a pointer's tap on an option tells an optiontap from the element, bubbling and composed, its detail frozen, and writes nothing", async () => {
  const { element, buttons } = await module();
  const heard: Event[] = [];
  document.addEventListener("optiontap", (event) => heard.push(event), { once: true });
  const button = buttons()[1];
  if (!button) throw new Error("no option");
  await userEvent.click(button);
  const [event] = heard;
  if (!(event instanceof CustomEvent)) throw new Error("no optiontap reached the document");
  expect(event.target).toBe(element);
  expect([event.bubbles, event.composed]).toEqual([true, true]);
  expect(event.detail).toEqual({ option: 1 });
  expect(Object.isFrozen(event.detail)).toBe(true);
  expect(element.history).toEqual([]);
});

test("the options are one stop of Tab, the arrows move among them round, choosing nothing, and Enter or Space tells", async () => {
  const { element, root, buttons, taps } = await module();
  element.chosen = 1;
  const [first, second, third] = buttons();
  if (!first || !second || !third) throw new Error("no options");
  second.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(root.activeElement).toBe(third);
  await userEvent.keyboard("{ArrowDown}");
  expect(root.activeElement).toBe(first);
  await userEvent.keyboard("{ArrowLeft}");
  expect(root.activeElement).toBe(third);
  await userEvent.keyboard("{Home}");
  expect(root.activeElement).toBe(first);
  await userEvent.keyboard("{End}");
  expect(root.activeElement).toBe(third);
  await userEvent.keyboard("{ArrowUp}");
  expect(root.activeElement).toBe(second);
  expect(taps).toEqual([]);
  expect(buttons().map((button) => button.tabIndex)).toEqual([-1, 0, -1]);
  await userEvent.keyboard("{ArrowLeft}");
  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard("{ArrowRight}");
  await userEvent.keyboard(" ");
  expect(taps).toEqual([0, 1]);
  expect(element.chosen).toBe(1);
});

test("a press on the paper beside the options writes on the paper, and the options take only their own presses", async () => {
  const { element, root, canvas, view, buttons, edge } = await module();
  // Right of the row of options, under the picture, on the paper.
  const beside: [number, number] = [650, 300];
  const point = at(canvas, view(), ...beside);
  expect(root.elementFromPoint(point.clientX, point.clientY)).toBe(canvas);
  const paper = edge.getBoundingClientRect();
  expect(point.clientY).toBeLessThan(paper.bottom);
  write(canvas, view, beside, [690, 320]);
  expect(layers(element)).toEqual(["tracing"]);
  const [onPaper] = element.history;
  if (onPaper?.kind !== "write") throw new Error("no stroke");
  expect(onPaper.stroke.points[0]?.y).toBeCloseTo(240, 0);
  // Under the paper, on the sheet.
  write(canvas, view, [650, 600], [690, 620]);
  expect(layers(element)).toEqual(["tracing", "sheet"]);
  // An option's middle is the option's.
  const box = buttons()[0]?.getBoundingClientRect();
  if (!box) throw new Error("no option");
  const middle = root.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
  expect(middle?.closest("button")).toBe(buttons()[0]);
});

test("lays long options out in rows that wrap within the paper, a long one within its pill, and the paper grows down to hold them, alike at any scale", async () => {
  const long = [
    "December",
    "January",
    "February",
    "September",
    "November",
    "A month whose name is far too long to stand in one line of the paper's width at all",
  ];
  const short = await module();
  const { element, group, edge, image, buttons } = await module(long);
  const rows = new Set(buttons().map((button) => Math.round(button.getBoundingClientRect().top)));
  expect(rows.size).toBeGreaterThan(2);
  const within = group.getBoundingClientRect();
  for (const button of buttons()) {
    const box = button.getBoundingClientRect();
    expect(box.left).toBeGreaterThanOrEqual(within.left);
    expect(box.right).toBeLessThanOrEqual(within.right);
  }
  const last = buttons().at(-1)?.getBoundingClientRect();
  const first = buttons()[0]?.getBoundingClientRect();
  if (!last || !first) throw new Error("no options");
  expect(last.height).toBeGreaterThan(first.height * 1.2);
  // The paper holds them all: taller than with one row, its edge at their bottom.
  const band = (paper: { edge: SVGRectElement; image: SVGImageElement }) =>
    paper.edge.getBoundingClientRect().height - paper.image.getBoundingClientRect().height;
  expect(band({ edge, image })).toBeGreaterThan(band(short) * 2);
  expect(near(within.bottom, edge.getBoundingClientRect().bottom)).toBe(true);
  // Twice the scale, twice as large on the screen, in the same rows.
  const before = band({ edge, image });
  element.tracing = { at: [180, 60], hidden: false, scale: 2 };
  await settle();
  await settle();
  expect(band({ edge, image }) / before).toBeCloseTo(2, 1);
  expect(
    new Set(buttons().map((button) => Math.round(button.getBoundingClientRect().top))).size,
  ).toBe(rows.size);
});

test("hides the options with the paper, and shows them with it again", async () => {
  const { element, group } = await module();
  element.tracing = { at: [180, 60], hidden: true };
  await settle();
  expect(group.hidden).toBe(true);
  element.tracing = { at: [180, 60], hidden: false };
  await settle();
  expect(group.hidden).toBe(false);
});

test("gives a task of a module's work the crop of the strokes alone beside the crop with the paper, the paper's strokes while it is shown, as a sheet's crop is made", async () => {
  const { element, canvas, view } = await module();
  write(canvas, view, [300, 900], [420, 930]);
  const alone = await paperWork(element);
  expect(alone.strokes?.type).toBe("image/png");
  expect(alone.png.type).toBe("image/png");
  // The crop of the sheet's stroke alone is a sheet's crop of it, byte for byte.
  const { element: sheet } = await placed(made, 500, undefined, { task: sheetTask() });
  sheet.history = element.history;
  const own = await sheet.exportWork();
  if (own === null || !("png" in own)) throw new Error("no work of the sheet");
  const bytes = async (blob: Blob | undefined) => [
    ...new Uint8Array((await blob?.arrayBuffer()) ?? new ArrayBuffer(0)),
  ];
  expect(await bytes(alone.strokes)).toEqual(await bytes(own.png));
  // With the paper's picture the crop is another.
  expect(await bytes(alone.png)).not.toEqual(await bytes(own.png));
  // A stroke on the paper is in it while the paper shows, and not while it is hidden.
  write(canvas, view, [300, 100], [340, 140]);
  const both = await paperWork(element);
  expect(await bytes(both.strokes)).not.toEqual(await bytes(own.png));
  element.tracing = { at: [180, 60], hidden: true };
  const hidden = await paperWork(element);
  expect(await bytes(hidden.strokes)).toEqual(await bytes(own.png));
});

test("gives a task from a photo's work no crop of the strokes alone", async () => {
  const { element, canvas, view } = await placed(made, 500);
  element.paper = { statement: await paperCrop() };
  await expect
    .poll(() => element.shadowRoot?.querySelector<HTMLElement>(".grip")?.hidden, {
      timeout: GRIP_MS,
    })
    .toBe(false);
  write(canvas, view, [300, 900], [420, 930]);
  expect("strokes" in (await paperWork(element))).toBe(false);
});
