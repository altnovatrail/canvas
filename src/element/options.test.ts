import { afterEach, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import type { View } from "../core/screen.js";
import { sheetTask } from "../core/tasks.fixture.js";
import type { ExportedPaper, NovatrailCanvas } from "./index.js";
import { at, GRIP_MS, paperCrop, placed, settle } from "./pointer.fixture.js";

// A task of a module whose answer is a choice: its options are radio buttons on the tracing
// paper under its picture, behind one button till the learner presses it, a part of the paper that
// grows to hold them, moves and scales with it, and leaves the paper round them to the ink. A tap
// tells an optiontap, and the element shows as chosen, and as judged, what the consumer sets alone.
// The paper of a task of a module is opaque. Its work holds the crop of the strokes alone beside
// the crop with the paper.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

const THREE = ["7", "8", "9"];

/**
 * A task of a module on an element 500 CSS px wide: its picture a crop of 200 × 50 px, a paper of
 * 800 × 200 units at its own size where it starts, at (180, 60), and its options under it, laid out,
 * shown by their button unless `shut`.
 */
async function module(options: readonly string[] | null = THREE, shut = false) {
  const { element, root, canvas, view } = await placed(made, 500);
  const statement = await paperCrop();
  element.paper = { statement, source: "module", ...(options === null ? {} : { options }) };
  const grip = root.querySelector<HTMLElement>(".grip");
  const band = root.querySelector<HTMLElement>(".tracing-choices");
  const group = root.querySelector<HTMLElement>(".tracing-choices .options");
  const reveal = root.querySelector<HTMLButtonElement>(".tracing-choices .reveal");
  const edge = root.querySelector<SVGRectElement>(".tracing .edge");
  const image = root.querySelector<SVGImageElement>(".tracing image");
  if (!grip || !band || !group || !reveal || !edge || !image) {
    throw new Error("the element has no tracing paper");
  }
  await expect.poll(() => grip.hidden, { timeout: GRIP_MS }).toBe(false);
  await settle();
  await settle();
  const taps: number[] = [];
  element.addEventListener("optiontap", (event) => taps.push(event.detail.option));
  if (!shut && options !== null) {
    reveal.click();
    await settle();
    await settle();
  }
  const buttons = () => [...group.querySelectorAll("button")];
  return {
    element,
    root,
    canvas,
    view,
    band,
    group,
    reveal,
    edge,
    image,
    buttons,
    taps,
    statement,
  };
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
  const { element, band, group, edge, image, buttons } = await module();
  expect(band.hidden).toBe(false);
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
  const options = band.getBoundingClientRect();
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
  for (const options of [[], ["7"], ["7", " "], ["7", ""], [7, 8], "7"]) {
    expect(() => {
      element.paper = { statement, source: "module", options } as never;
    }).toThrow(TypeError);
  }
  expect(() => {
    element.paper = { statement, options: ["7", "8"] };
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
  const { element: plain, band, group } = await module(null);
  expect(band.hidden).toBe(true);
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
  const { element, band: strip, edge, image, buttons } = await module(long);
  const rows = new Set(buttons().map((button) => Math.round(button.getBoundingClientRect().top)));
  expect(rows.size).toBeGreaterThan(2);
  const within = strip.getBoundingClientRect();
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
  const { element, band, group } = await module();
  element.tracing = { at: [180, 60], hidden: true };
  await settle();
  expect(band.hidden).toBe(true);
  element.tracing = { at: [180, 60], hidden: false };
  await settle();
  expect(band.hidden).toBe(false);
  expect(group.hidden).toBe(false);
});

test("keeps the options behind one button under the picture, as high as an option, which shows them in its place and tells nothing; a new task shuts them again", async () => {
  const { element, root, band, group, reveal, edge, image, taps } = await module(THREE, true);
  expect(band.hidden).toBe(false);
  expect(group.hidden).toBe(true);
  expect(reveal.hidden).toBe(false);
  expect(reveal.getAttribute("role")).toBeNull();
  expect(reveal.type).toBe("button");
  expect(reveal.textContent).toBe("Answer options");
  expect(reveal.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  // Under the picture, within the paper, which holds the one row of its height.
  const picture = image.getBoundingClientRect();
  const shut = reveal.getBoundingClientRect();
  expect(shut.top).toBeGreaterThan(picture.bottom);
  expect(shut.bottom).toBeLessThan(edge.getBoundingClientRect().bottom);
  const style = getComputedStyle(reveal);
  expect([style.backgroundColor, style.color]).toEqual(["rgb(229, 240, 255)", "rgb(0, 88, 184)"]);
  const before = edge.getBoundingClientRect().height;
  await userEvent.click(reveal);
  await settle();
  await settle();
  expect(taps).toEqual([]);
  expect(reveal.hidden).toBe(true);
  expect(group.hidden).toBe(false);
  const option = group.querySelector("button")?.getBoundingClientRect();
  if (!option) throw new Error("no option");
  expect(Math.abs(option.height - shut.height)).toBeLessThan(1);
  expect(Math.abs(edge.getBoundingClientRect().height - before)).toBeLessThan(1);
  // The same crop anew keeps them shown; another crop shuts them, the same texts too.
  const statement = element.paper?.statement as Blob;
  element.paper = { statement, source: "module", options: [...THREE] };
  expect(group.hidden).toBe(false);
  element.paper = { statement: await paperCrop(100, 50), source: "module", options: [...THREE] };
  expect(reveal.hidden).toBe(false);
  expect(group.hidden).toBe(true);
  element.lang = "ru";
  await settle();
  expect(reveal.textContent).toBe("Варианты ответа");
  expect(root.activeElement).not.toBe(reveal);
});

test("the button that shows the options is a stop of Tab, and Enter on it takes the focus to the option Tab comes to", async () => {
  const { element, root, reveal, buttons, taps } = await module(THREE, true);
  element.chosen = 2;
  reveal.focus();
  await userEvent.keyboard("{Enter}");
  await settle();
  expect(reveal.hidden).toBe(true);
  expect(root.activeElement).toBe(buttons()[2]);
  expect(taps).toEqual([]);
});

test("draws what each option came to: correct green with a tick, not yet orange and struck out, and once one is correct the rest faded; each named so", async () => {
  const { element, group, buttons } = await module();
  const look = () =>
    buttons().map((button) => {
      const style = getComputedStyle(button);
      const words = button.querySelector("span") as HTMLElement;
      const tick = button.querySelector(".tick") as Element;
      return {
        verdict: button.dataset.verdict,
        background: style.backgroundColor,
        color: style.color,
        struck: getComputedStyle(words).textDecorationLine,
        tick: getComputedStyle(tick).display !== "none",
        opacity: style.opacity,
        name: button.getAttribute("aria-label"),
        disabled: button.getAttribute("aria-disabled"),
      };
    });
  expect(element.optionVerdicts).toEqual([]);
  const plain = look();
  element.optionVerdicts = ["not_yet", null, null];
  expect(Object.isFrozen(element.optionVerdicts)).toBe(true);
  const [notYet, open, also] = look();
  expect(notYet).toEqual({
    verdict: "not_yet",
    background: "rgb(255, 241, 230)",
    color: "rgb(160, 65, 0)",
    struck: "line-through",
    tick: false,
    opacity: "1",
    name: "7: not yet",
    disabled: "true",
  });
  expect(open).toEqual(plain[1]);
  expect(also).toEqual(plain[2]);
  expect(group.hasAttribute("data-solved")).toBe(false);
  element.optionVerdicts = ["not_yet", "correct", null];
  const [first, right, faded] = look();
  expect(right).toEqual({
    verdict: "correct",
    background: "rgb(36, 138, 61)",
    color: "rgb(255, 255, 255)",
    struck: "none",
    tick: true,
    opacity: "1",
    name: "8: correct",
    disabled: "true",
  });
  expect([first?.opacity, faded?.opacity]).toEqual(["0.4", "0.4"]);
  expect([faded?.verdict, faded?.name, faded?.disabled]).toEqual([undefined, null, "true"]);
  // The words of the verdict in the element's language; the texts stay the options'.
  element.lang = "ru";
  await settle();
  expect(buttons().map((button) => button.getAttribute("aria-label"))).toEqual([
    "7: пока нет",
    "8: верно",
    null,
  ]);
  expect(buttons().map((button) => button.textContent)).toEqual(THREE);
  // None judged again, as it was.
  element.optionVerdicts = [null, null, null];
  expect(look()).toEqual(plain);
});

test("an option judged tells no optiontap, by a tap or the keyboard, nor does any once one is correct; the arrows still move among them", async () => {
  const { element, root, buttons, taps } = await module();
  element.optionVerdicts = ["not_yet", null, null];
  const [first, second, third] = buttons();
  if (!first || !second || !third) throw new Error("no options");
  // A pointer's press goes to a button marked disabled all the same: the element turns it away.
  const press = { force: true } as const;
  await userEvent.click(first, press);
  first.focus();
  await userEvent.keyboard("{Enter}");
  await userEvent.click(second);
  expect(taps).toEqual([1]);
  element.optionVerdicts = ["not_yet", null, "correct"];
  await userEvent.click(second, press);
  await userEvent.click(third, press);
  second.focus();
  await userEvent.keyboard(" ");
  await userEvent.keyboard("{ArrowRight}");
  expect(root.activeElement).toBe(third);
  await userEvent.keyboard("{Enter}");
  expect(taps).toEqual([1]);
  expect(element.history).toEqual([]);
});

test("takes the verdicts as a list of the options' length alone, each correct, not yet or none, and drops them with another task or other options", async () => {
  const { element } = await module();
  for (const verdicts of [
    [],
    [null, null],
    [null, null, null, null],
    ["right", null, null],
    [true, null, null],
    [undefined, null, null],
    "correct",
    null,
    undefined,
  ]) {
    expect(() => {
      element.optionVerdicts = verdicts as never;
    }, JSON.stringify(verdicts)).toThrow(TypeError);
  }
  expect(element.optionVerdicts).toEqual([]);
  element.optionVerdicts = ["correct", null, null];
  // The same crop anew with the same options keeps them; other options drop them.
  const statement = element.paper?.statement as Blob;
  element.paper = { statement, source: "module", options: [...THREE] };
  expect(element.optionVerdicts).toEqual(["correct", null, null]);
  element.paper = { statement, source: "module", options: ["7", "8"] };
  expect(element.optionVerdicts).toEqual([]);
  element.optionVerdicts = [null, "not_yet"];
  element.paper = { statement: await paperCrop(100, 50), source: "module", options: ["7", "8"] };
  expect(element.optionVerdicts).toEqual([]);
  // A paper without options, and an element without a paper, take an empty list alone.
  element.paper = { statement, source: "module" };
  element.optionVerdicts = [];
  expect(() => {
    element.optionVerdicts = [null];
  }).toThrow(TypeError);
  const bare = document.createElement("novatrail-canvas");
  made.push(bare);
  bare.optionVerdicts = [];
  expect(() => {
    bare.optionVerdicts = ["correct"];
  }).toThrow(TypeError);
});

test("lays a task of a module's paper opaque, white over the grid, its options' band too, and lets a photo's grid show through", async () => {
  const { root, edge } = await module();
  const layer = root.querySelector<SVGSVGElement>(".tracing");
  const ground = root.querySelector<SVGRectElement>(".tracing .ground");
  if (!layer || !ground) throw new Error("no tracing paper");
  expect(getComputedStyle(layer).mixBlendMode).toBe("normal");
  expect(getComputedStyle(ground).fill).toBe("rgb(255, 255, 255)");
  const paper = edge.getBoundingClientRect();
  const white = ground.getBoundingClientRect();
  expect(
    [white.left, white.top, white.right, white.bottom].map((side, n) =>
      near(side, [paper.left, paper.top, paper.right, paper.bottom][n] as number),
    ),
  ).toEqual([true, true, true, true]);
  const { element: photo } = await placed(made, 500);
  photo.paper = { statement: await paperCrop() };
  const own = photo.shadowRoot;
  await expect
    .poll(() => own?.querySelector<HTMLElement>(".grip")?.hidden, { timeout: GRIP_MS })
    .toBe(false);
  const through = own?.querySelector<SVGSVGElement>(".tracing");
  const bare = own?.querySelector<SVGRectElement>(".tracing .ground");
  if (!through || !bare) throw new Error("no tracing paper");
  expect(getComputedStyle(through).mixBlendMode).toBe("multiply");
  expect(getComputedStyle(bare).fill).toBe("none");
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
