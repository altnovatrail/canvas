import { afterEach, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { PICTURE_BYTES, pictureOf, SHEET } from "../core/sheet.js";
import {
  ERASER_SIZES,
  MARKER_WIDTHS,
  OTHER_COLOURS,
  PALETTE,
  PEN_SETTINGS,
  PEN_WIDTHS,
  type PenSettings,
  type StrokeStyle,
} from "../core/style.js";
import { sheetTask, workedExample } from "../core/tasks.fixture.js";
import type { HistoryChange, NovatrailCanvas } from "./index.js";
import { NARROW_PX } from "./pens.js";
import {
  buttonOf,
  hand,
  paperCrop,
  placed as placed_,
  settle,
  upgraded,
} from "./pointer.fixture.js";
import { probe } from "./probe.js";

// The settings of the pen and the eraser in a browser: the property `pens` and the event
// `penchange`; the popovers a second press of the chosen pen or eraser opens, by the pointer and
// by the keyboard, their names, groups and states, where they stand and what closes them; a stroke
// written in the style of the kind in use, on the screen in its colour and opacity, a marker
// multiplied, and in the picture of the work; the eraser that cuts a part, its event and its undo;
// the circle of a hovering pen; and the attribute `unstyled`, which writes as the pen wrote before.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
  vi.restoreAllMocks();
});

/** A sheet with its task, `width` CSS pixels wide. */
async function sheet(width = 400, height?: number) {
  return placed_(made, width, height, { task: sheetTask() });
}

/** The popover of a tool, by its name, and a choice in it by its name or its text. */
function popoverOf(element: HTMLElement, name: string) {
  const pop = element.shadowRoot?.querySelector<HTMLElement>(
    `[role="dialog"][aria-label="${name}"]`,
  );
  if (!pop) throw new Error(`the element has no popover ${name}`);
  const choice = (label: string) => {
    const found = [...pop.querySelectorAll("button")].find(
      (button) => (button.getAttribute("aria-label") ?? button.textContent) === label,
    );
    if (!found) throw new Error(`the popover ${name} has no choice ${label}`);
    return found;
  };
  const slider = pop.querySelector<HTMLInputElement>('input[type="range"]');
  return { pop, choice, slider };
}

/** The `penchange` details a target hears. */
function heard(target: EventTarget): { detail: PenSettings; event: Event }[] {
  const told: { detail: PenSettings; event: Event }[] = [];
  target.addEventListener("penchange", (event) => {
    told.push({ detail: (event as CustomEvent<PenSettings>).detail, event });
  });
  return told;
}

/** The settings with the kind in use and its style changed. */
function using(kind: StrokeStyle["pen"], change: Partial<StrokeStyle>): PenSettings {
  const { styles } = PEN_SETTINGS;
  return {
    ...PEN_SETTINGS,
    pen: kind,
    styles: { ...styles, [kind]: { ...styles[kind], ...change } },
  };
}

/** The RGBA of the canvas's buffer at a point of the sheet in sight. */
function rgbaAt(element: NovatrailCanvas, x: number, y: number): number[] {
  const canvas = element.shadowRoot?.querySelector("canvas");
  const { view } = probe(element);
  if (!canvas || view === undefined) throw new Error("the element is not laid out");
  const scale = canvas.width / (canvas.getBoundingClientRect().width / view.k);
  const pixel = canvas
    .getContext("2d")
    ?.getImageData(Math.floor((x - view.vx) * scale), Math.floor((y - view.vy) * scale), 1, 1);
  return [...(pixel?.data ?? [])];
}

/** Whether two colours are the same but for a rounding. */
function near(rgba: readonly number[], expected: readonly number[], by = 4): boolean {
  return expected.every((channel, i) => Math.abs((rgba[i] ?? Number.NaN) - channel) <= by);
}

/** A level stroke of a mouse at `y`, through these places along it. */
function stroke(
  element: { canvas: HTMLCanvasElement; view: () => ReturnType<typeof probe>["view"] },
  y: number,
  ...xs: number[]
): void {
  const mouse = hand(element.canvas, () => {
    const view = element.view();
    if (view === undefined) throw new Error("the element is not laid out");
    return view;
  });
  const [first, ...rest] = xs;
  if (first === undefined) return;
  mouse.down(first, y);
  for (const x of rest) mouse.move(x, y);
  mouse.up(xs.at(-1) ?? first, y);
}

test("pens are canvas's own as the element comes, frozen; settings given are checked, a TypeError names the field and leaves them, undefined changes nothing, and none of it sends penchange", async () => {
  const { element } = await sheet();
  const told = heard(element);
  expect(element.pens).toBe(PEN_SETTINGS);
  expect(Object.isFrozen(element.pens)).toBe(true);
  expect(Object.isFrozen(element.pens.styles.marker)).toBe(true);
  const given = using("liner", { color: "#e5322d", width: 7 });
  element.pens = given;
  expect(element.pens).toEqual(given);
  expect(element.pens).not.toBe(given);
  expect(Object.isFrozen(element.pens.styles.liner)).toBe(true);
  const kept = element.pens;
  // The same settings again keep the very object.
  element.pens = { ...given };
  expect(element.pens).toBe(kept);
  element.pens = undefined;
  expect(element.pens).toBe(kept);
  expect(() => {
    element.pens = { ...given, eraserSize: 500 };
  }).toThrow(/^pens\.eraserSize: /);
  expect(() => {
    element.pens = using("pen", { width: 0 });
  }).toThrow(/^pens\.styles\.pen\.width: /);
  expect(() => {
    element.pens = { ...given, styles: { ...given.styles, marker: given.styles.liner } };
  }).toThrow(/^pens\.styles\.marker\.pen: /);
  expect(() => {
    element.pens = null as unknown as PenSettings;
  }).toThrow(TypeError);
  expect(element.pens).toBe(kept);
  expect(told).toEqual([]);
});

test("pens given before the element is upgraded are taken, and settings it cannot take leave it as it starts, with a warning", () => {
  const given = using("marker", { opacity: 70 });
  expect(upgraded(made, { pens: given }).pens).toEqual(given);
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  expect(upgraded(made, { pens: { pen: "brush" } }).pens).toBe(PEN_SETTINGS);
  expect(warn).toHaveBeenCalledWith(expect.stringMatching(/^pens\.pen: .* goes on as it starts$/));
});

test("a second press of the chosen pen opens its popover, a dialog named in the element's language, a press more closes it, and a first press only chooses; the chosen pen and eraser are described by the hint of a second press and marked", async () => {
  const { element, root } = await sheet(NARROW_PX + 200);
  element.lang = "ru";
  const pen = buttonOf(element, "Перо");
  const eraser = buttonOf(element, "Ластик");
  const { pop } = popoverOf(element, "Настройки пера");
  const { pop: eraserPop } = popoverOf(element, "Настройки ластика");
  const hint = root.getElementById(pen.getAttribute("aria-describedby") ?? "");
  expect(hint?.textContent).toBe("Нажмите ещё раз — настройки");
  expect(hint?.hidden).toBe(true);
  expect(eraser.hasAttribute("aria-describedby")).toBe(false);
  // No popup's attributes on a radio button: its role allows none of them.
  for (const button of [pen, eraser]) {
    expect(button.hasAttribute("aria-haspopup")).toBe(false);
    expect(button.hasAttribute("aria-expanded")).toBe(false);
  }
  expect(getComputedStyle(pen, "::after").content).not.toBe("none");
  expect(getComputedStyle(eraser, "::after").content).toBe("none");
  expect(pop.hidden).toBe(true);
  await userEvent.click(pen);
  expect(pop.hidden).toBe(false);
  expect(root.activeElement).toBe(pen);
  await userEvent.click(pen);
  expect(pop.hidden).toBe(true);
  // The eraser, pressed once, is only chosen; pressed again, its popover opens.
  await userEvent.click(eraser);
  expect([element.tool, eraserPop.hidden]).toEqual(["eraser", true]);
  expect(eraser.getAttribute("aria-describedby")).toBe(hint?.id);
  expect(pen.hasAttribute("aria-describedby")).toBe(false);
  await userEvent.click(eraser);
  expect(eraserPop.hidden).toBe(false);
  expect(pop.hidden).toBe(true);
  // The language changes live, the popovers' with the bar's.
  element.lang = "en";
  expect(eraserPop.getAttribute("aria-label")).toBe("Eraser settings");
  expect(popoverOf(element, "Eraser settings").choice("Whole stroke").textContent).toBe(
    "Whole stroke",
  );
  expect(hint?.textContent).toBe("Press again for settings");
  // The pen chosen closes the eraser's popover.
  await userEvent.click(buttonOf(element, "Pen"));
  expect(eraserPop.hidden).toBe(true);
});

test("Enter on the chosen pen opens its popover with the focus on the kind in use, Escape closes it and gives the focus back, and Space on the chosen eraser opens its own on its mode", async () => {
  const { element, root } = await sheet();
  await userEvent.tab();
  const pen = buttonOf(element, "Pen");
  expect(root.activeElement).toBe(pen);
  const { pop, choice } = popoverOf(element, "Pen settings");
  await userEvent.keyboard("{Enter}");
  expect(pop.hidden).toBe(false);
  expect(root.activeElement).toBe(choice("Pen"));
  expect(choice("Pen").getAttribute("aria-pressed")).toBe("true");
  await userEvent.keyboard("{Tab}");
  expect(pop.contains(root.activeElement)).toBe(true);
  await userEvent.keyboard("{Escape}");
  expect(pop.hidden).toBe(true);
  expect(root.activeElement).toBe(pen);
  // The arrows move along the bar without choosing; Enter chooses, Space again opens.
  await userEvent.keyboard("{ArrowDown}");
  const eraser = buttonOf(element, "Eraser");
  expect([root.activeElement, element.tool]).toEqual([eraser, "pen"]);
  await userEvent.keyboard("{Enter}");
  expect(element.tool).toBe("eraser");
  const erasing = popoverOf(element, "Eraser settings");
  expect(erasing.pop.hidden).toBe(true);
  await userEvent.keyboard(" ");
  expect(erasing.pop.hidden).toBe(false);
  expect(root.activeElement).toBe(erasing.choice("Whole stroke"));
  await userEvent.keyboard("{Escape}");
  expect([erasing.pop.hidden, root.activeElement]).toEqual([true, eraser]);
  // Closed for a new task while it holds the focus, it gives the focus back to its button.
  await userEvent.keyboard(" ");
  expect(erasing.pop.contains(root.activeElement)).toBe(true);
  element.task = sheetTask({ id: "posts-2", statement: [{ text: "Another task." }] });
  expect([erasing.pop.hidden, root.activeElement]).toEqual([true, eraser]);
});

test("a press on the sheet closes the popover and writes its stroke; so a press of another button of the bar, the focus leaving it, a new task and the element leaving the page close it", async () => {
  const placed = await sheet(NARROW_PX + 200);
  const { element, root } = placed;
  const pen = buttonOf(element, "Pen");
  const { pop, choice } = popoverOf(element, "Pen settings");
  const open = async () => {
    await userEvent.click(pen);
    if (pop.hidden) await userEvent.click(pen);
    expect(pop.hidden).toBe(false);
  };
  await open();
  stroke(placed, 300, 100, 200, 300);
  expect(pop.hidden).toBe(true);
  expect(probe(element).strokes).toHaveLength(1);
  await open();
  await userEvent.click(buttonOf(element, "Zoom out"));
  expect(pop.hidden).toBe(true);
  // The focus that goes from the popover to another of the element's buttons takes it.
  await open();
  choice("Blue").focus();
  buttonOf(element, "Undo").focus();
  expect(pop.hidden).toBe(true);
  // To nowhere, it stays: Safari takes the focus off a button it presses.
  await open();
  choice("Blue").focus();
  choice("Blue").blur();
  expect(pop.hidden).toBe(false);
  element.task = sheetTask({ id: "posts-2", statement: [{ text: "Another task." }] });
  expect(pop.hidden).toBe(true);
  await open();
  element.setAttribute("tools-hidden", "");
  expect(pop.hidden).toBe(true);
  element.removeAttribute("tools-hidden");
  await open();
  element.tool = "hand";
  expect(pop.hidden).toBe(true);
  element.tool = "pen";
  await open();
  element.remove();
  expect(pop.hidden).toBe(true);
  expect(root.activeElement).toBeNull();
});

test("each choice changes pens and sends penchange, frozen, bubbling and composed, a step of the slider too; a choice that changes nothing sends none, and each kind keeps its own style", async () => {
  const { element } = await sheet();
  const told = heard(document);
  element.lang = "ru";
  const pen = buttonOf(element, "Перо");
  await userEvent.click(pen);
  const { pop, choice, slider } = popoverOf(element, "Настройки пера");
  expect(pop.hidden).toBe(false);
  // The kind in use, chosen again, changes nothing.
  await userEvent.click(choice("Ручка"));
  expect(told).toEqual([]);
  await userEvent.click(choice("Линер"));
  expect(element.pens.pen).toBe("liner");
  expect(told).toHaveLength(1);
  const [first] = told;
  expect(first?.detail).toBe(element.pens);
  expect(Object.isFrozen(first?.detail)).toBe(true);
  expect([first?.event.bubbles, first?.event.composed]).toEqual([true, true]);
  expect(first?.event.target).toBe(element);
  // The liner's widths, named of five, the one in use pressed.
  const widths = [1, 2, 3, 4, 5].map((n) => choice(`Толщина ${n} из 5`));
  expect(widths.map((button) => button.getAttribute("aria-pressed"))).toEqual(
    PEN_WIDTHS.map((width) => String(width === PEN_SETTINGS.styles.liner.width)),
  );
  await userEvent.click(widths[4] as HTMLButtonElement);
  expect(element.pens.styles.liner.width).toBe(PEN_WIDTHS[4]);
  expect(widths[4]?.getAttribute("aria-pressed")).toBe("true");
  // The slider tells each of its steps, in whole percent, and says its value.
  if (!slider) throw new Error("the popover has no slider of opacity");
  expect([slider.min, slider.max, slider.step, slider.getAttribute("aria-label")]).toEqual([
    "10",
    "100",
    "1",
    "Непрозрачность",
  ]);
  slider.value = "55";
  slider.dispatchEvent(new Event("input", { bubbles: true }));
  expect(element.pens.styles.liner.opacity).toBe(55);
  expect(slider.getAttribute("aria-valuetext")).toBe("55 %");
  expect(pop.querySelector("output")?.textContent).toBe("55 %");
  await userEvent.click(choice("Красный"));
  expect(element.pens.styles.liner.color).toBe(PALETTE[4]);
  expect(choice("Красный").getAttribute("aria-pressed")).toBe("true");
  // The other colours behind the wheel, a disclosure button that controls their group.
  const wheel = choice("Другие цвета");
  const more = element.shadowRoot?.getElementById(wheel.getAttribute("aria-controls") ?? "");
  expect([wheel.getAttribute("aria-expanded"), more?.hidden]).toEqual(["false", true]);
  await userEvent.click(wheel);
  expect([wheel.getAttribute("aria-expanded"), more?.hidden]).toEqual(["true", false]);
  expect(told).toHaveLength(4);
  const others = [...(more?.querySelectorAll("button") ?? [])];
  expect(others.map((button) => button.getAttribute("aria-label"))).toEqual([
    "Серый",
    "Фиолетовый",
    "Оранжевый",
    "Бирюзовый",
    "Розовый",
    "Коричневый",
    "Голубой",
    "Салатовый",
    "Янтарный",
    "Сиреневый",
    "Алый",
    "Белый",
  ]);
  await userEvent.click(choice("Фиолетовый"));
  expect(element.pens.styles.liner.color).toBe(OTHER_COLOURS[1]);
  expect(wheel.getAttribute("aria-pressed")).toBe("true");
  expect(choice("Красный").getAttribute("aria-pressed")).toBe("false");
  // The marker shows its own style, and its widths four times the pen's.
  await userEvent.click(choice("Маркер"));
  expect(element.pens.styles.marker).toEqual(PEN_SETTINGS.styles.marker);
  expect(slider.value).toBe(String(PEN_SETTINGS.styles.marker.opacity));
  expect(wheel.getAttribute("aria-pressed")).toBe("false");
  await userEvent.click(widths[0] as HTMLButtonElement);
  expect(element.pens.styles.marker.width).toBe(MARKER_WIDTHS[0]);
  // The liner kept its own.
  expect(element.pens.styles.liner).toEqual({
    pen: "liner",
    color: OTHER_COLOURS[1],
    width: PEN_WIDTHS[4],
    opacity: 55,
  });
  // The eraser's popover: its mode and its size.
  await userEvent.click(buttonOf(element, "Ластик"));
  await userEvent.click(buttonOf(element, "Ластик"));
  const erasing = popoverOf(element, "Настройки ластика");
  expect(erasing.pop.hidden).toBe(false);
  await userEvent.click(erasing.choice("Частично"));
  expect(element.pens.eraser).toBe("part");
  expect(erasing.choice("Штрих целиком").getAttribute("aria-pressed")).toBe("false");
  await userEvent.click(erasing.choice("Размер 5 из 5"));
  expect(element.pens.eraserSize).toBe(ERASER_SIZES[4]);
  const count = told.length;
  await userEvent.click(erasing.choice("Размер 5 из 5"));
  expect(told).toHaveLength(count);
  expect(told.every(({ detail }) => Object.isFrozen(detail))).toBe(true);
});

test("a stroke takes the style of the kind in use, in the history and in historychange", async () => {
  const placed = await sheet();
  const { element } = placed;
  const changes: HistoryChange[] = [];
  element.addEventListener("historychange", (event) => changes.push(event.detail));
  stroke(placed, 200, 100, 300);
  element.pens = using("marker", { color: "#5ac8fa" });
  stroke(placed, 300, 100, 300);
  const written = element.history.flatMap((event) => (event.kind === "write" ? [event] : []));
  expect(written.map(({ stroke }) => stroke.style)).toEqual([
    PEN_SETTINGS.styles.pen,
    { ...PEN_SETTINGS.styles.marker, color: "#5ac8fa" },
  ]);
  const told = changes.flatMap(({ events }) => events);
  expect(told).toEqual(element.history);
});

test("under the attribute unstyled a stroke has no style, no popover opens, and the eraser takes whole strokes as near as it always took them, whatever pens say", async () => {
  const placed = await sheet();
  const { element, root } = placed;
  element.setAttribute("unstyled", "");
  element.pens = { ...using("marker", {}), eraser: "part", eraserSize: 64 };
  expect(element.pens.pen).toBe("marker");
  stroke(placed, 200, 100, 300);
  expect(element.history[0]?.kind === "write" && element.history[0].stroke.style).toBe(undefined);
  const pen = buttonOf(element, "Pen");
  await userEvent.click(pen);
  await userEvent.click(pen);
  expect(root.querySelectorAll('[role="dialog"]:not([hidden])')).toHaveLength(0);
  expect(pen.hasAttribute("aria-describedby")).toBe(false);
  expect(getComputedStyle(pen, "::after").content).toBe("none");
  // The eraser takes the stroke whole, from 10 CSS px off its points and its ink, not 32 units.
  element.tool = "eraser";
  const { k } = placed.view();
  stroke(placed, 200 + 3 + 9 / k, 200);
  expect(element.history.at(-1)?.kind).toBe("erase");
  element.undo();
  stroke(placed, 200 + 3 + 11 / k, 200);
  expect(element.history.at(-1)?.kind).toBe("undo");
  // Taken off, the attribute gives the strokes their style again.
  element.removeAttribute("unstyled");
  element.tool = "pen";
  stroke(placed, 400, 100, 300);
  const last = element.history.at(-1);
  expect(last?.kind === "write" && last.stroke.style?.pen).toBe("marker");
});

test("the eraser that takes whole strokes reaches as far as its size, and never less on the screen than 10 CSS px", async () => {
  const placed = await sheet(NARROW_PX + 200);
  const { element } = placed;
  element.pens = { ...using("liner", { width: 2 }), eraserSize: 64 };
  stroke(placed, 200, 100, 300);
  element.tool = "eraser";
  const { k } = placed.view();
  expect(10 / k).toBeLessThan(32);
  // 32 units, and the liner's half width, but not further.
  stroke(placed, 200 + 32.5, 200);
  expect(element.history.at(-1)?.kind).toBe("erase");
  element.undo();
  stroke(placed, 200 + 34, 200);
  expect(element.history.at(-1)?.kind).toBe("undo");
  // The smallest size reaches 10 CSS px all the same.
  element.pens = { ...element.pens, eraserSize: ERASER_SIZES[0] as number };
  stroke(placed, 200 + 1 + 9.5 / k, 200);
  expect(element.history.at(-1)?.kind).toBe("erase");
  element.undo();
  stroke(placed, 200 + 1 + 10.5 / k, 200);
  expect(element.history.at(-1)?.kind).toBe("undo");
});

test("the eraser that takes a part cuts what it crosses into pieces of new IDs, each of its stroke, shows them while down, and one undo of the bar puts the stroke back; a cancelled press cuts nothing", async () => {
  const placed = await sheet();
  const { element } = placed;
  element.pens = {
    ...using("liner", { width: 7, color: "#0a63d6" }),
    eraser: "part",
    eraserSize: 44,
  };
  stroke(placed, 200, 100, 200, 300);
  stroke(placed, 600, 100, 300);
  element.tool = "eraser";
  const eraser = hand(placed.canvas, placed.view, { pointerId: 2 });
  eraser.down(200, 150);
  eraser.move(200, 250);
  await settle();
  // While it is down, the screen shows the pieces: the cut is clear, the rest drawn.
  expect(rgbaAt(element, 200, 200)[3]).toBe(0);
  expect(rgbaAt(element, 120, 200)[3]).toBeGreaterThan(200);
  expect(element.history.at(-1)?.kind).toBe("write");
  eraser.cancel(200, 250);
  await settle();
  expect(rgbaAt(element, 200, 200)[3]).toBeGreaterThan(200);
  expect(element.history).toHaveLength(2);
  const changes: HistoryChange[] = [];
  element.addEventListener("historychange", (event) => changes.push(event.detail));
  eraser.down(200, 150);
  eraser.move(200, 250);
  eraser.up(200, 250);
  const cut = element.history.at(-1);
  if (cut?.kind !== "cut") throw new Error(`no cut but ${cut?.kind}`);
  expect(cut.ids).toEqual([1]);
  expect(cut.pieces.map(({ of, stroke }) => [of, stroke.id, stroke.kind])).toEqual([
    [1, 3, "mouse"],
    [1, 4, "mouse"],
  ]);
  const [left, right] = cut.pieces.map(({ stroke }) => stroke);
  expect(left?.style).toEqual(element.pens.styles.liner);
  // No ink of a piece lies under the eraser's path: 22 units and the line's half width off it.
  expect(Math.max(...(left?.points ?? []).map(({ x }) => x))).toBeCloseTo(200 - 22 - 3.5, 6);
  expect(Math.min(...(right?.points ?? []).map(({ x }) => x))).toBeCloseTo(200 + 22 + 3.5, 6);
  expect(changes.flatMap(({ events }) => events)).toEqual([cut]);
  expect(probe(element).strokes.map(({ id }) => id)).toEqual([3, 4, 2]);
  // The next stroke numbers on past the pieces.
  element.tool = "pen";
  stroke(placed, 800, 100, 300);
  expect(probe(element).strokes.map(({ id }) => id)).toEqual([3, 4, 2, 5]);
  element.undo();
  buttonOf(element, "Undo").click();
  const undone = element.history.at(-1);
  expect(undone).toMatchObject({ kind: "undo", removed: [3, 4], restored: [1] });
  expect(probe(element).strokes.map(({ id }) => id)).toEqual([1, 2]);
  // A press that reaches no stroke writes nothing.
  element.tool = "eraser";
  const length = element.history.length;
  eraser.down(300 + 22 + 3.5 + 1, 200);
  eraser.up(300 + 22 + 3.5 + 1, 200);
  expect(element.history).toHaveLength(length);
  // The mode "stroke" erases whole, as it always did.
  element.pens = { ...element.pens, eraser: "stroke" };
  eraser.down(200, 600);
  eraser.up(200, 600);
  expect(element.history.at(-1)).toMatchObject({ kind: "erase", ids: [2] });
});

test("on the tracing paper a stroke takes the style in use, its width in the paper's units, and the eraser that takes a part is as large as on the sheet: its size over the paper's scale", async () => {
  const placed = await placed_(made, NARROW_PX + 200);
  const { element, root } = placed;
  element.paper = { statement: await paperCrop() };
  await expect.poll(() => root.querySelector<HTMLElement>(".grip")?.hidden).toBe(false);
  // Half its size, 400 × 100 units, from [100, 100].
  element.tracing = { at: [100, 100], hidden: false, scale: 0.5 };
  await settle();
  element.pens = { ...using("liner", { width: 2 }), eraser: "part", eraserSize: 44 };
  stroke(placed, 150, 150, 450);
  const written = element.history.at(-1);
  if (written?.kind !== "write") throw new Error(`no stroke but ${written?.kind}`);
  expect([written.on, written.stroke.style]).toEqual(["tracing", element.pens.styles.liner]);
  const { points } = written.stroke;
  // A layout of another scale rounds its client points a hair off.
  const ends = [points[0], points.at(-1)].flatMap((point) => [point?.x ?? 0, point?.y ?? 0]);
  for (const [k, value] of ends.entries()) {
    expect(value).toBeCloseTo([100, 100, 700, 100][k] ?? 0, 6);
  }
  element.tool = "eraser";
  const eraser = hand(placed.canvas, placed.view);
  eraser.down(300, 120);
  eraser.move(300, 180);
  eraser.up(300, 180);
  const cut = element.history.at(-1);
  if (cut?.kind !== "cut") throw new Error(`no cut but ${cut?.kind}`);
  const [left, right] = cut.pieces.map(({ stroke }) => stroke.points.map(({ x }) => x));
  // 22 units of the sheet are 44 of the paper, and the liner's half width past them.
  expect(Math.max(...(left ?? []))).toBeCloseTo(400 - 44 - 1, 6);
  expect(Math.min(...(right ?? []))).toBeCloseTo(400 + 44 + 1, 6);
});

test("the screen draws a stroke in its colour, filled once at its opacity, a marker multiplied with the ink under it, and the palette's black in the theme's ink", async () => {
  const placed = await sheet();
  const { element } = placed;
  element.style.setProperty("--novatrail-canvas-ink", "rgb(0, 128, 0)");
  element.pens = using("liner", { width: 7, color: "#e5322d" });
  stroke(placed, 200, 100, 300);
  // Half seen through, back over itself in one press: one layer, no darker where it crosses.
  element.pens = using("liner", { width: 7, color: "#0a63d6", opacity: 50 });
  stroke(placed, 300, 100, 300, 100, 300);
  element.pens = using("liner", { width: 7, color: "#1c1c1e" });
  stroke(placed, 400, 100, 300);
  element.pens = using("liner", { width: 7, color: "#0a63d6" });
  stroke(placed, 500, 100, 300);
  element.pens = using("marker", { width: 28, color: "#ffcc00", opacity: 40 });
  stroke(placed, 500, 200, 400);
  await settle();
  expect(near(rgbaAt(element, 200, 200), [0xe5, 0x32, 0x2d, 255])).toBe(true);
  expect(near(rgbaAt(element, 200, 300), [0x0a, 0x63, 0xd6, 128], 6)).toBe(true);
  expect(near(rgbaAt(element, 200, 400), [0, 128, 0, 255])).toBe(true);
  // Over the blue: the blue multiplied by the yellow at 40 %; past it, the yellow at 40 %.
  const blue = [0x0a, 0x63, 0xd6];
  const yellow = [0xff, 0xcc, 0x00];
  const multiplied = blue.map((b, c) => b * 0.6 + ((b * (yellow[c] ?? 0)) / 255) * 0.4);
  expect(near(rgbaAt(element, 250, 500), [...multiplied, 255], 6)).toBe(true);
  expect(near(rgbaAt(element, 350, 500), [...yellow, 102], 6)).toBe(true);
});

/** A picture of the work: its PNG's header — width, height, depth, colour type — and its pixels. */
async function pictureOf_(element: NovatrailCanvas) {
  const blob = await element.exportPicture();
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(bytes.buffer);
  const bitmap = await createImageBitmap(blob);
  const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext("2d");
  context?.drawImage(bitmap, 0, 0);
  const pixel = (x: number, y: number) => [
    ...(context?.getImageData(x, y, 1, 1).data.subarray(0, 3) ?? []),
  ];
  return {
    header: [view.getUint32(16), view.getUint32(20), bytes[24], bytes[25]],
    pixel,
  };
}

test("the picture of the work draws each stroke in its own colour, on white with no theme: grey, a pixel a unit, while every stroke is black or grey, and RGB, scaled down within the same bytes, once one has a colour", async () => {
  const placed = await sheet();
  const { element } = placed;
  element.style.setProperty("--novatrail-canvas-ink", "rgb(0, 128, 0)");
  stroke(placed, 200, 100, 300);
  // A grey of its own, three channels alike: the palette's other grey has a hair of blue.
  element.pens = using("liner", { width: 7, color: "#808080" });
  stroke(placed, 300, 100, 300);
  const grey = await pictureOf_(element);
  expect(grey.header).toEqual([SHEET.width, SHEET.height, 8, 0]);
  expect(near(grey.pixel(200, 300), [0x80, 0x80, 0x80])).toBe(true);
  element.pens = using("liner", { width: 7, color: "#e5322d" });
  stroke(placed, 400, 100, 300);
  const colour = await pictureOf_(element);
  const want = pictureOf({ maxX: 300 + 3.5, maxY: 400 + 3.5 }, 3);
  expect(colour.header).toEqual([want.width, want.height, 8, 2]);
  expect((3 * want.width + 1) * want.height).toBeLessThanOrEqual(PICTURE_BYTES);
  const at = (x: number, y: number) =>
    colour.pixel(Math.floor(x * want.scale), Math.floor(y * want.scale));
  expect(near(at(200, 400), [0xe5, 0x32, 0x2d], 8)).toBe(true);
  // The palette's black is its own colour there, not the theme's ink.
  const [r, g, b] = at(200, 200);
  expect(r === g && (b ?? 0) < 96 && (r ?? 0) < 96).toBe(true);
});

test("a pen hovering over the sheet shows a circle as wide as its line, in its colour, and the eraser's as large as it erases; it goes when the pen comes down or leaves, and never shows without styles or with the hand", async () => {
  const placed = await sheet();
  const { element, root } = placed;
  const ring = root.querySelector<HTMLElement>(".hover");
  if (!ring) throw new Error("the element has no circle of a hovering pen");
  expect([ring.hidden, ring.getAttribute("aria-hidden")]).toEqual([true, "true"]);
  expect(getComputedStyle(ring).pointerEvents).toBe("none");
  const pen = hand(placed.canvas, placed.view, { pointerType: "pen", pointerId: 7 });
  const { k } = placed.view();
  element.pens = using("marker", { color: "#e5322d", opacity: 20 });
  pen.hover(200, 200);
  expect(ring.hidden).toBe(false);
  const style = getComputedStyle(ring);
  expect(Number.parseFloat(style.width)).toBeCloseTo(18 * k, 1);
  expect(style.backgroundColor).toBe("rgb(229, 50, 45)");
  expect(Number(style.opacity)).toBeCloseTo(0.35, 2);
  // Its middle at the pen's point.
  const box = ring.getBoundingClientRect();
  const point = placed.canvas.getBoundingClientRect();
  const { view } = probe(element);
  expect(box.left + box.width / 2 - point.left).toBeCloseTo((200 - (view?.vx ?? 0)) * k, 0);
  // A thin pen's circle is 4 CSS px at least.
  element.pens = using("pen", { width: 1.2 });
  pen.hover(210, 200);
  expect(Number.parseFloat(getComputedStyle(ring).width)).toBeCloseTo(4, 1);
  pen.down(210, 200);
  expect(ring.hidden).toBe(true);
  pen.up(220, 200);
  pen.hover(230, 200);
  expect(ring.hidden).toBe(false);
  pen.leave(230, 200);
  expect(ring.hidden).toBe(true);
  // The eraser's: never less than 10 CSS px across its radius while it takes strokes whole.
  element.tool = "eraser";
  pen.hover(230, 200);
  expect(ring.classList.contains("erasing")).toBe(true);
  expect(Number.parseFloat(getComputedStyle(ring).width)).toBeCloseTo(20, 1);
  element.pens = { ...element.pens, eraser: "part", eraserSize: 64 };
  pen.hover(232, 200);
  expect(Number.parseFloat(getComputedStyle(ring).width)).toBeCloseTo(64 * k, 1);
  // A mouse shows none, nor the hand, nor a sheet without styles.
  hand(placed.canvas, placed.view, { pointerId: 8 }).hover(240, 200);
  expect(ring.hidden).toBe(false);
  element.tool = "hand";
  pen.hover(240, 200);
  expect(ring.hidden).toBe(true);
  element.tool = "pen";
  element.setAttribute("unstyled", "");
  pen.hover(240, 200);
  expect(ring.hidden).toBe(true);
});

test("a pen hovering over a worked example shows no circle: nothing is written there", async () => {
  const placed = await placed_(made, 400);
  placed.element.workedExample = workedExample();
  await settle();
  hand(placed.canvas, placed.view, { pointerType: "pen" }).hover(200, 200);
  expect(placed.root.querySelector<HTMLElement>(".hover")?.hidden).toBe(true);
});

test("the popover stands right of the bar level with its button, its arrow at it, within the element; in an element narrower than 600 CSS px, along its bottom", async () => {
  const wide = await sheet(NARROW_PX + 200, 700);
  // The pen is in use as the element comes: one press opens its popover.
  await userEvent.click(buttonOf(wide.element, "Pen"));
  const { pop } = popoverOf(wide.element, "Pen settings");
  await Promise.all(pop.getAnimations().map((animation) => animation.finished));
  const bar = wide.row.getBoundingClientRect();
  const box = pop.getBoundingClientRect();
  const pen = buttonOf(wide.element, "Pen").getBoundingClientRect();
  expect(box.left - bar.right).toBeCloseTo(14, 0);
  const arrow = Number.parseFloat(pop.style.getPropertyValue("--arrow"));
  expect(box.top + arrow).toBeCloseTo(pen.top + pen.height / 2, 0);
  const host = wide.element.getBoundingClientRect();
  expect(box.top).toBeGreaterThanOrEqual(host.top + 8 - 0.5);
  expect(box.bottom).toBeLessThanOrEqual(host.bottom - 8 + 0.5);
  const narrow = await sheet(NARROW_PX - 200, 700);
  narrow.element.style.setProperty("--novatrail-canvas-pad-bottom", "40px");
  await userEvent.click(buttonOf(narrow.element, "Eraser"));
  await userEvent.click(buttonOf(narrow.element, "Eraser"));
  const docked = popoverOf(narrow.element, "Eraser settings").pop;
  await Promise.all(docked.getAnimations().map((animation) => animation.finished));
  const at = docked.getBoundingClientRect();
  const around = narrow.element.getBoundingClientRect();
  expect(at.left - around.left).toBeCloseTo(8, 0);
  expect(around.right - at.right).toBeCloseTo(8, 0);
  // Above the padding at the bottom, of the element or of the window, whichever is in sight.
  expect(Math.min(around.bottom, innerHeight) - at.bottom).toBeCloseTo(48, 0);
});

test("every target of the popovers is 44 × 44 CSS px at least", async () => {
  const { element } = await sheet(NARROW_PX + 200, 900);
  await userEvent.click(buttonOf(element, "Pen"));
  const { pop, choice } = popoverOf(element, "Pen settings");
  await userEvent.click(choice("Other colours"));
  await Promise.all(pop.getAnimations().map((animation) => animation.finished));
  const targets = [...pop.querySelectorAll<HTMLElement>("button, input")];
  element.tool = "eraser";
  await userEvent.click(buttonOf(element, "Eraser"));
  const erasing = popoverOf(element, "Eraser settings").pop;
  await Promise.all(erasing.getAnimations().map((animation) => animation.finished));
  expect(pop.hidden).toBe(true);
  expect(erasing.hidden).toBe(false);
  const all = [...erasing.querySelectorAll<HTMLElement>("button")];
  expect(targets.length + all.length).toBe(3 + 5 + 1 + 6 + 12 + 2 + 5);
  for (const target of all) {
    const { width, height } = target.getBoundingClientRect();
    expect(Math.min(width, height), target.textContent ?? "").toBeGreaterThanOrEqual(44);
  }
  // Those of the pen's, measured while it was open.
  await userEvent.click(buttonOf(element, "Pen"));
  await userEvent.click(buttonOf(element, "Pen"));
  await userEvent.click(choice("Other colours"));
  await Promise.all(pop.getAnimations().map((animation) => animation.finished));
  for (const target of targets) {
    const { width, height } = target.getBoundingClientRect();
    expect(Math.min(width, height), target.getAttribute("aria-label") ?? "").toBeGreaterThanOrEqual(
      44,
    );
  }
});
