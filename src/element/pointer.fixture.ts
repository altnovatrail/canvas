// The pointer of the element's tests in Chromium: a sheet put on the page, the client point over a
// point of it, a level stroke that a script makes, real input through the DevTools protocol — a
// mouse, a pen and touches (R29) — the pixels of a screenshot, Chromium's own accessibility tree
// and an element given its properties before it was upgraded; and for the pictures, a picture's
// file — an SVG, or a PNG of four colours — a load the test settles, the wait for the files that
// came, and what changes in a node (R23, R42). The tests take them from here rather than each
// keeping a copy. Like the tests, the build leaves this module out (tsconfig.build.json), and the
// package never has it.

import { vi } from "vitest";
import { cdp, page } from "vitest/browser";
import { toScreen, type View } from "../core/screen.js";
import "./index.js";
import { type ExportedSheet, NovatrailCanvas, type Task } from "./index.js";
import { probe } from "./probe.js";

/** The work of a sheet for checking, as its exportWork() gives it (R27): a sheet's, and not null. */
export async function sheetWork(element: NovatrailCanvas): Promise<ExportedSheet> {
  const work = await element.exportWork();
  if (work === null || !("png" in work)) throw new Error("the sheet gave no work for checking");
  return work;
}

/** Two frames: one for the element's layout, one for its drawing. */
export async function settle(): Promise<void> {
  for (let frames = 0; frames < 2; frames += 1) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
}

/** A picture's file: a small SVG, which a browser shows. */
export function file(colour = "#c33"): Blob {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20" fill="${colour}"/></svg>`;
  return new Blob([svg], { type: "image/svg+xml" });
}

/** A colour as a screenshot's pixel has it: red, green and blue. */
export type Colour = readonly [number, number, number];

/** The colours of the quarters of a picture by `quarters()`: the top left first, then by rows. */
export const QUARTERS: readonly Colour[] = [
  [255, 0, 0],
  [0, 160, 0],
  [0, 0, 255],
  [255, 200, 0],
];

/**
 * A raster picture's file, as the module format has its pictures: a PNG 40 × 20 pixels in four
 * quarters of their own colours, so that where each corner of it stands on the screen tells how
 * it is laid out, as a picture of one colour would not.
 */
export async function quarters(colours: readonly Colour[] = QUARTERS): Promise<Blob> {
  const canvas = new OffscreenCanvas(40, 20);
  const context = canvas.getContext("2d");
  if (context === null) throw new Error("no context to draw the picture with");
  colours.forEach(([red, green, blue], n) => {
    context.fillStyle = `rgb(${red} ${green} ${blue})`;
    context.fillRect((n % 2) * 20, Math.floor(n / 2) * 10, 20, 10);
  });
  return canvas.convertToBlob({ type: "image/png" });
}

/** A promise and the hands that settle it: a load of media the test settles when it will. */
export function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  let reject: (reason: unknown) => void = () => {};
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

/**
 * The loads that settled run on, the files they gave decode, and the frames after them come. It
 * waits for the decodes themselves, not for a time: under the load of the whole suite a decode can
 * take longer than any time the test would guess. The decodes are those a spy on
 * `HTMLImageElement.prototype.decode` records, which the test's file puts before each test.
 */
export async function arrive(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve));
  const decode = HTMLImageElement.prototype.decode;
  if (!vi.isMockFunction(decode)) throw new Error("arrive waits for the decodes a spy records");
  await Promise.allSettled(decode.mock.results.map((result) => result.value));
  await settle();
}

/**
 * What changes in a node and under it from now on: the function it gives back stops watching and
 * gives every change, those not yet told too.
 */
export function watch(node: Node): () => MutationRecord[] {
  const records: MutationRecord[] = [];
  const observer = new MutationObserver((list) => records.push(...list));
  observer.observe(node, { subtree: true, childList: true, attributes: true, characterData: true });
  return () => {
    records.push(...observer.takeRecords());
    observer.disconnect();
    return records;
  };
}

/**
 * A sheet `width` CSS pixels wide in `parent`, as tall as its row, statement and sheet unless given
 * a height, laid out and drawn, with the parts of it the tests reach for. What goes on the page
 * goes into `made`, for the test to take off: the element, or the parent it was put in.
 */
export async function placed(
  made: HTMLElement[],
  width: number,
  height?: number,
  { parent = document.body, task }: { parent?: HTMLElement; task?: Task } = {},
) {
  const element = document.createElement("novatrail-canvas");
  element.style.width = `${width}px`;
  if (height !== undefined) element.style.height = `${height}px`;
  if (task !== undefined) element.task = task;
  parent.append(element);
  made.push(parent === document.body ? element : parent);
  await settle();
  const root = element.shadowRoot;
  const canvas = root?.querySelector("canvas");
  const viewport = root?.querySelector<HTMLElement>(".viewport");
  const row = root?.querySelector<HTMLElement>(".tools");
  if (!root || !canvas || !viewport || !row) throw new Error("the element has no row and canvas");
  const view = (): View => {
    const { view } = probe(element);
    if (view === undefined) throw new Error("the element is not laid out");
    return view;
  };
  return { element, root, canvas, viewport, row, view };
}

/** A page taller than the screen, which scrolls the element: it goes into `made`, to be taken off. */
export function spacer(made: HTMLElement[]): void {
  const rest = document.createElement("div");
  rest.style.height = "2000px";
  document.body.append(rest);
  made.push(rest);
}

/**
 * An element given these properties before it was upgraded, as a page that renders before it
 * imports the package gives them, then put on the page, where it is upgraded: it goes into `made`.
 */
export function upgraded(made: HTMLElement[], given: Record<string, unknown>): NovatrailCanvas {
  const template = document.createElement("template");
  template.innerHTML = "<novatrail-canvas></novatrail-canvas>";
  const early = template.content.firstElementChild;
  if (!(early instanceof HTMLElement)) throw new Error("the template has no element");
  for (const [name, value] of Object.entries(given)) Reflect.set(early, name, value);
  document.body.append(early);
  made.push(early);
  if (!(early instanceof NovatrailCanvas)) throw new Error("the element was not upgraded");
  return early;
}

/**
 * The nodes of Chromium's own accessibility tree of the test's frame, through the DevTools
 * protocol: the frame named vitest-iframe, found in the page's tree of frames.
 */
export async function accessibilityTree() {
  const { frameTree } = await cdp().send("Page.getFrameTree");
  const frames = [frameTree];
  let frameId: string | undefined;
  while (frames.length > 0 && frameId === undefined) {
    const next = frames.shift();
    if (next?.frame.name === "vitest-iframe") frameId = next.frame.id;
    frames.push(...(next?.childFrames ?? []));
  }
  if (frameId === undefined) throw new Error("no frame of the test in the tree");
  const { nodes } = await cdp().send("Accessibility.getFullAXTree", { frameId });
  return nodes;
}

/** The client point over a point of the sheet. */
export function at(canvas: HTMLCanvasElement, view: View, x: number, y: number) {
  const rect = canvas.getBoundingClientRect();
  const onScreen = toScreen(view, x, y);
  return { clientX: rect.left + onScreen.x, clientY: rect.top + onScreen.y };
}

/**
 * A level press at `y`, from `from` to `to`, made by a script — a mouse's, pointerId 1 — not yet
 * lifted: `lift()` ends it there.
 */
export function press(canvas: HTMLCanvasElement, view: View, y: number, from: number, to: number) {
  const mouse = { pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true };
  const event = (type: string, x: number, init: PointerEventInit) =>
    new PointerEvent(type, { ...mouse, ...at(canvas, view, x, y), ...init });
  canvas.dispatchEvent(event("pointerdown", from, { button: 0, buttons: 1, pressure: 0.5 }));
  canvas.dispatchEvent(event("pointermove", to, { button: -1, buttons: 1, pressure: 0.5 }));
  return {
    lift: () =>
      canvas.dispatchEvent(event("pointerup", to, { button: 0, buttons: 0, pressure: 0 })),
  };
}

/** A level stroke at `y`, from `from` to `to`, made by a script: a mouse's, pointerId 1. */
export function level(canvas: HTMLCanvasElement, view: View, y: number, from: number, to: number) {
  press(canvas, view, y, from, to).lift();
}

/**
 * The point of the page over a client point of this test's frame, which the runner may have moved
 * and scaled.
 */
function pageOf(client: { clientX: number; clientY: number }): { x: number; y: number } {
  const frameElement = window.frameElement;
  let x = client.clientX;
  let y = client.clientY;
  if (frameElement !== null && "offsetWidth" in frameElement) {
    const host = frameElement as HTMLElement;
    const rect = host.getBoundingClientRect();
    const scale = rect.width / host.offsetWidth;
    x = rect.left + (host.clientLeft + x) * scale;
    y = rect.top + (host.clientTop + y) * scale;
  }
  return { x, y };
}

/** Real input of a mouse or a pen, through the DevTools protocol, at a client point. */
export async function input(
  type: "mousePressed" | "mouseMoved" | "mouseReleased",
  client: { clientX: number; clientY: number },
  extra: {
    pointerType?: "mouse" | "pen";
    force?: number;
    button?: "left" | "right";
    buttons?: number;
  } = {},
): Promise<void> {
  const { x, y } = pageOf(client);
  await cdp().send("Input.dispatchMouseEvent", {
    type,
    x,
    y,
    button: "left",
    buttons: type === "mouseReleased" ? 0 : 1,
    clickCount: 1,
    ...extra,
  });
}

/** A finger on the screen, at a client point, as the DevTools protocol takes it. */
export interface Finger {
  readonly id: number;
  readonly clientX: number;
  readonly clientY: number;
  /** The contact's radius in CSS pixels, 10 unless given: Chromium makes it half the width. */
  readonly radius?: number;
}

/**
 * Real touches through the DevTools protocol (R29), which Chromium gives the page as pointer events
 * of type `touch`. `touchStart` and `touchMove` take every finger that is down, the new ones with
 * them, and `touchEnd` the fingers that lift, or every finger when none is given. `at` is the
 * events' time in seconds since 1970, as the protocol takes it: their `timeStamp` follows. The
 * protocol answers before the page has the events, so this waits a frame for them.
 */
export async function touches(
  type: "touchStart" | "touchMove" | "touchEnd" | "touchCancel",
  fingers: readonly Finger[],
  at?: number,
): Promise<void> {
  await cdp().send("Input.dispatchTouchEvent", {
    type,
    touchPoints: fingers.map(({ id, clientX, clientY, radius = 10 }) => ({
      ...pageOf({ clientX, clientY }),
      radiusX: radius,
      radiusY: radius,
      id,
    })),
    ...(at === undefined ? {} : { timestamp: at }),
  });
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

/**
 * The colours of the screen at these points of an element's sheet, in sheet units, read off a
 * screenshot of it once its layout and drawing have run.
 */
export async function sheetColours(
  element: NovatrailCanvas,
  points: readonly (readonly [number, number])[],
): Promise<number[][]> {
  await settle();
  const shot = await screenshot(element);
  const canvas = element.shadowRoot?.querySelector("canvas");
  const { view } = probe(element);
  if (!canvas || view === undefined) throw new Error("the element's sheet is not laid out");
  const host = element.getBoundingClientRect();
  return points.map(([x, y]) => {
    const { clientX, clientY } = at(canvas, view, x, y);
    return shot(clientX - host.left, clientY - host.top);
  });
}

/** Which of the screen's colours are the colours expected, but for the screen's rounding. */
export function sameColours(
  shown: readonly (readonly number[])[],
  expected: readonly Colour[],
): boolean[] {
  return shown.map((colour, n) =>
    colour.every((value, c) => Math.abs(value - (expected[n]?.[c] ?? -99)) <= 12),
  );
}

/** The pixels of a screenshot of an element, at the density of the screen, without a file. */
export async function screenshot(element: HTMLElement) {
  const base64 = await page.screenshot({ element, save: false });
  const file = await (await fetch(`data:image/png;base64,${base64}`)).blob();
  const bitmap = await createImageBitmap(file);
  const context = new OffscreenCanvas(bitmap.width, bitmap.height).getContext("2d");
  if (context === null) throw new Error("no context to read the screenshot with");
  context.drawImage(bitmap, 0, 0);
  const scale = bitmap.width / element.getBoundingClientRect().width;
  /** The red, green and blue of the screenshot's pixel at a CSS point of the element. */
  return (x: number, y: number) => [
    ...context.getImageData(Math.floor(x * scale), Math.floor(y * scale), 1, 1).data.subarray(0, 3),
  ];
}
