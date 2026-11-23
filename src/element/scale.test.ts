import { afterEach, expect, test } from "vitest";
import type { View } from "../core/screen.js";
import { NovatrailCanvas, type TracingState } from "./index.js";
import { at, buttonOf, paperCrop, settle } from "./pointer.fixture.js";
import { probe } from "./probe.js";

// The tracing paper's scale and the reading of its statement (R89), as the mockup's
// `Zadacha-masshtab` has them: the grip chooses the paper, its corners and its bar scale it, Ctrl
// with the wheel too, and "Recognise" puts the statements read in place of the crop.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

/** A task from paper whose crop, 200 × 50 px, is a paper of 800 × 200 units at its own size. */
async function paper(width = 500) {
  const element = document.createElement("novatrail-canvas");
  element.style.width = `${width}px`;
  element.style.height = "700px";
  document.body.append(element);
  made.push(element);
  element.paper = { statement: await paperCrop() };
  await settle();
  const root = element.shadowRoot;
  const canvas = root?.querySelector("canvas");
  const grip = root?.querySelector<HTMLButtonElement>("button.grip");
  const bar = root?.querySelector<HTMLElement>(".tracing-scale");
  const frame = root?.querySelector<HTMLElement>(".tracing-frame");
  const sign = root?.querySelector<HTMLElement>(".tracing-sign");
  if (!root || !canvas || !grip || !bar || !frame || !sign) throw new Error("no tracing paper");
  await expect.poll(() => grip.hidden).toBe(false);
  const changes: TracingState[] = [];
  element.addEventListener("tracingchange", (event) => changes.push(event.detail));
  return { element, root, canvas, grip, bar, frame, sign, changes, view: () => viewOf(element) };
}

function viewOf(element: HTMLElement): View {
  const { view } = probe(element);
  if (view === undefined) throw new Error("the element is not laid out");
  return view;
}

const mouse = { pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true };

/** The grip's press and release: the paper is chosen, and stays where it lies. */
function choose(grip: HTMLButtonElement) {
  const { left, top } = grip.getBoundingClientRect();
  const where = { clientX: left + 10, clientY: top + 10 };
  grip.dispatchEvent(
    new PointerEvent("pointerdown", { ...mouse, ...where, button: 0, buttons: 1 }),
  );
  grip.dispatchEvent(new PointerEvent("pointerup", { ...mouse, ...where, button: 0, buttons: 0 }));
}

test("the grip chooses the paper: its frame, its corners and its bar; a press on the sheet lets it go", async () => {
  const { canvas, grip, bar, frame, view } = await paper();
  expect(frame.hidden && bar.hidden).toBe(true);
  choose(grip);
  await settle();
  expect(frame.hidden || bar.hidden).toBe(false);
  expect(frame.querySelectorAll(".corner").length).toBe(4);
  expect(bar.getAttribute("role")).toBe("toolbar");
  expect(bar.getAttribute("aria-label")).toBe("Task scale");
  // The bar stands under the paper, centred on it.
  const paperBox = frame.getBoundingClientRect();
  const barBox = bar.getBoundingClientRect();
  expect(barBox.top).toBeGreaterThan(paperBox.bottom);
  expect(
    Math.abs((barBox.left + barBox.right) / 2 - (paperBox.left + paperBox.right) / 2),
  ).toBeLessThan(1);
  canvas.dispatchEvent(
    new PointerEvent("pointerdown", {
      ...mouse,
      ...at(canvas, view(), 900, 1200),
      button: 0,
      buttons: 1,
    }),
  );
  canvas.dispatchEvent(
    new PointerEvent("pointerup", {
      ...mouse,
      ...at(canvas, view(), 900, 1200),
      button: 0,
      buttons: 0,
    }),
  );
  await settle();
  expect(frame.hidden && bar.hidden).toBe(true);
});

test("Larger, Smaller and the percentage scale it about its centre, each telling of itself", async () => {
  const { element, grip, changes } = await paper();
  choose(grip);
  await settle();
  expect(buttonOf(element, "100%").getAttribute("aria-label")).toBe("100%: back to 100%");
  buttonOf(element, "Larger").click();
  expect(element.tracing?.scale).toBe(1.2);
  expect(element.tracing?.at[0]).toBeCloseTo(100, 6);
  expect(element.tracing?.at[1]).toBeCloseTo(40, 6);
  expect(changes.at(-1)).toBe(element.tracing);
  await settle();
  buttonOf(element, "120%").click();
  expect(element.tracing?.scale).toBe(1);
  expect(element.tracing?.at[0]).toBeCloseTo(180, 6);
  buttonOf(element, "Smaller").click();
  expect(element.tracing?.scale).toBe(0.83);
  expect(changes.length).toBe(3);
  // Never smaller than 0.4 of its size.
  for (let n = 0; n < 10; n++) buttonOf(element, "Smaller").click();
  expect(element.tracing?.scale).toBe(0.4);
});

test("hiding the paper and showing it again keeps its scale and its place", async () => {
  const { element, grip, changes } = await paper();
  choose(grip);
  await settle();
  buttonOf(element, "Larger").click();
  const scaled = element.tracing;
  buttonOf(element, "Hide the task").click();
  await settle();
  expect(element.tracing).toEqual({ ...scaled, hidden: true });
  buttonOf(element, "Show the task").click();
  await settle();
  expect(element.tracing).toEqual(scaled);
  expect(changes.at(-1)).toEqual(scaled);
});

test("a corner's drag scales it from the corner across, and tells once it is let go", async () => {
  const { element, grip, frame, changes, view } = await paper();
  element.tracing = { at: [600, 400], hidden: false };
  choose(grip);
  await settle();
  const corner = frame.querySelector<HTMLElement>(".corner.br");
  if (corner === null) throw new Error("no corner");
  const { left, top, width, height } = corner.getBoundingClientRect();
  const from = { clientX: left + width / 2, clientY: top + height / 2 };
  // Half the paper's width on the screen, outward: half its size again.
  const by = 400 * view().k;
  corner.dispatchEvent(
    new PointerEvent("pointerdown", { ...mouse, ...from, button: 0, buttons: 1 }),
  );
  corner.dispatchEvent(
    new PointerEvent("pointermove", {
      ...mouse,
      clientX: from.clientX + by,
      clientY: from.clientY,
      buttons: 1,
    }),
  );
  expect(element.tracing).toEqual({ at: [600, 400], hidden: false, scale: 1.5 });
  expect(changes.length).toBe(0);
  corner.dispatchEvent(
    new PointerEvent("pointerup", {
      ...mouse,
      clientX: from.clientX + by,
      clientY: from.clientY,
      button: 0,
    }),
  );
  expect(changes.length).toBe(1);
  // The top left corner scales it from the bottom right.
  await settle();
  const tl = frame.querySelector<HTMLElement>(".corner.tl");
  if (tl === null) throw new Error("no corner");
  const box = tl.getBoundingClientRect();
  const start = { clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 };
  tl.dispatchEvent(new PointerEvent("pointerdown", { ...mouse, ...start, button: 0, buttons: 1 }));
  tl.dispatchEvent(
    new PointerEvent("pointerup", {
      ...mouse,
      clientX: start.clientX - 400 * view().k,
      clientY: start.clientY,
      button: 0,
    }),
  );
  expect(element.tracing).toEqual({ at: [200, 300], hidden: false, scale: 2 });
});

test("Ctrl with the wheel over the paper scales it by a notch, and tells once the wheel rests", async () => {
  const { element, root, changes } = await paper();
  const viewport = root.querySelector(".viewport");
  const image = root.querySelector(".tracing image");
  if (viewport === null || image === null) throw new Error("no viewport");
  const box = image.getBoundingClientRect();
  const over = { clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 };
  const notch = new WheelEvent("wheel", {
    ...over,
    deltaY: -100,
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  });
  viewport.dispatchEvent(notch);
  expect(notch.defaultPrevented).toBe(true);
  expect(element.tracing?.scale).toBe(1.08);
  expect(changes.length).toBe(0);
  await expect.poll(() => changes.length).toBe(1);
  // Without Ctrl, or off the paper, the wheel is the page's.
  const plain = new WheelEvent("wheel", { ...over, deltaY: -100, bubbles: true, cancelable: true });
  viewport.dispatchEvent(plain);
  expect(plain.defaultPrevented).toBe(false);
  const off = new WheelEvent("wheel", {
    clientX: box.left + box.width / 2,
    clientY: box.bottom + 200,
    deltaY: -100,
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  });
  viewport.dispatchEvent(off);
  expect(off.defaultPrevented).toBe(false);
});

test("Fit makes it as wide as the window right of the bar of tools", async () => {
  const { element, grip, view } = await paper();
  choose(grip);
  await settle();
  buttonOf(element, "Fit").click();
  const { k } = view();
  const across = element.getBoundingClientRect().width / k;
  const scale = element.tracing?.scale ?? 0;
  expect(Math.abs(scale - (across - 240) / 800)).toBeLessThan(0.01);
  expect(element.tracing?.at[0]).toBe(180);
});

test("a state with a scale draws the paper and its strokes at it, and the work tells it", async () => {
  const { element, root, canvas, view } = await paper();
  element.tracing = { at: [100, 100], hidden: false, scale: 2 };
  await settle();
  const image = root.querySelector(".tracing image");
  expect(image?.getAttribute("width")).toBe("1600");
  expect(image?.getAttribute("height")).toBe("400");
  // A stroke on the paper at twice its size keeps its points on the paper, in its own units.
  const send = (type: string, x: number, y: number, init: PointerEventInit) =>
    canvas.dispatchEvent(
      new PointerEvent(type, { ...mouse, ...at(canvas, view(), x, y), ...init }),
    );
  send("pointerdown", 300, 200, { button: 0, buttons: 1, pressure: 0.5 });
  send("pointermove", 500, 300, { buttons: 1, pressure: 0.5 });
  send("pointerup", 500, 300, { button: 0, buttons: 0 });
  const history = element.history;
  const write = history?.find((event) => event.kind === "write");
  expect(write?.kind === "write" && write.on).toBe("tracing");
  const points = write?.kind === "write" ? write.stroke.points : [];
  expect(points[0]?.x).toBeCloseTo(100, 0);
  expect(points[0]?.y).toBeCloseTo(50, 0);
  const work = await element.exportWork();
  expect(work !== null && "tracing" in work.submission && work.submission.tracing?.scale).toBe(2);
  expect(() => {
    element.tracing = { at: [0, 0], hidden: false, scale: 5 };
  }).toThrow(TypeError);
});

test("Recognise asks for the reading, waits, shows the statements in place of the crop, and Original the photo", async () => {
  const { element, root, grip, sign } = await paper();
  choose(grip);
  await settle();
  const mode = root.querySelector<HTMLButtonElement>(".tracing-scale .mode");
  if (mode === null) throw new Error("no button");
  // No reading given: no button.
  expect(mode.hidden).toBe(true);
  expect(sign.textContent).toBe("Photo of the task");
  let asked = 0;
  element.addEventListener("tracingread", () => asked++);
  element.reading = { state: "ready" };
  expect(mode.hidden).toBe(false);
  expect(mode.textContent).toBe("Recognise");
  mode.click();
  expect(asked).toBe(1);
  element.reading = { state: "busy" };
  expect(mode.textContent).toBe("Recognising…");
  expect(mode.getAttribute("aria-disabled")).toBe("true");
  expect(sign.textContent).toBe("Recognising…");
  expect(root.querySelector<HTMLElement>(".scan")?.hidden).toBe(false);
  // The sweeping line runs through the middle of its glow, which has no edge to one side.
  const glow = root.querySelector<HTMLElement>(".scan i");
  if (glow === null) throw new Error("no glow");
  expect(getComputedStyle(glow).borderRightStyle).toBe("none");
  expect(glow.getBoundingClientRect().width).toBeGreaterThan(0);
  const line = getComputedStyle(glow, "::after");
  expect(Number.parseFloat(line.left) + Number.parseFloat(line.width) / 2).toBeCloseTo(
    glow.getBoundingClientRect().width / 2,
    1,
  );
  mode.click();
  expect(asked).toBe(1);
  element.reading = { state: "done", statements: ["□ − 3 = 7"] };
  await settle();
  const text = root.querySelector<HTMLElement>(".statements");
  expect(text?.hidden).toBe(false);
  expect(text?.textContent).toBe(" − 3 = 7");
  expect(text?.querySelectorAll(".slot").length).toBe(1);
  expect(root.querySelector(".tracing image")?.getAttribute("display")).toBe("none");
  expect(sign.textContent).toBe("Recognised by AI");
  expect(mode.textContent).toBe("Original");
  mode.click();
  expect(text?.hidden).toBe(true);
  expect(sign.textContent).toBe("Photo of the task");
  expect(mode.textContent).toBe("Recognise");
  // The statements that came show again with no new reading.
  mode.click();
  expect(asked).toBe(1);
  expect(text?.hidden).toBe(false);
  expect(() => {
    element.reading = { state: "done" } as never;
  }).toThrow(TypeError);
  expect(Object.isFrozen(element.reading)).toBe(true);
});

test("the statements read draw a fraction built up, nested as printed, a power raised and the unknowns in italics, within the paper", async () => {
  const { element, root, grip } = await paper();
  choose(grip);
  element.reading = { state: "ready" };
  root.querySelector<HTMLButtonElement>(".tracing-scale .mode")?.click();
  element.reading = {
    state: "done",
    statements: [
      "\\frac{3}{17} + \\frac{1 + \\frac{1}{2}}{□} =",
      "x^{2} = 49",
      "Ann has 3 apples.",
    ],
  };
  await settle();
  const text = root.querySelector<HTMLElement>(".statements");
  if (text === null) throw new Error("no statements");
  const [first, second, third] = [...text.querySelectorAll<HTMLElement>(".line")];
  if (!first || !second || !third) throw new Error("not three lines");
  const fractions = [...first.querySelectorAll("mfrac")];
  expect(fractions.length).toBe(3);
  for (const fraction of fractions) {
    const [over, under] = [...fraction.children];
    if (!over || !under) throw new Error("a fraction without its two rows");
    const middle = (e: Element) => {
      const box = e.getBoundingClientRect();
      return { x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2 };
    };
    expect(middle(over).y).toBeLessThan(middle(under).y - 4);
    expect(Math.abs(middle(over).x - middle(under).x)).toBeLessThan(2);
  }
  // The fraction within a fraction is set smaller than the one on the line.
  const size = (e: Element | undefined) =>
    Number.parseFloat(getComputedStyle(e as Element).fontSize);
  expect(size(fractions[2]?.firstElementChild ?? undefined)).toBeLessThan(
    size(fractions[0]?.firstElementChild ?? undefined),
  );
  expect(first.querySelectorAll("mspace.slot").length).toBe(1);
  expect(second.querySelector("msup")?.textContent).toBe("x2");
  expect(second.querySelectorAll("i").length).toBe(0);
  expect(third.textContent).toBe("Ann has 3 apples.");
  expect(third.querySelector("i")).toBe(null);
  // Every line within the paper, the fractions too.
  const paperBox = text.getBoundingClientRect();
  for (const line of [first, second, third]) {
    const box = line.getBoundingClientRect();
    expect(box.top).toBeGreaterThanOrEqual(paperBox.top - 1);
    expect(box.bottom).toBeLessThanOrEqual(paperBox.bottom + 1);
    expect(box.width).toBeLessThanOrEqual(paperBox.width + 1);
  }
  element.reading = { state: "done", statements: ["3x + 5 = 20"] };
  await settle();
  expect([...text.querySelectorAll("i")].map((i) => i.textContent)).toEqual(["x"]);
});

test("a reading given without a task from paper is a TypeError", () => {
  const element = new NovatrailCanvas();
  expect(() => {
    element.reading = { state: "ready" };
  }).toThrow(TypeError);
});
