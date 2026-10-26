// The pointer of the element's tests in Chromium: a sheet put on the page, the client point over a
// point of it, a level stroke that a script makes, and real input through the DevTools protocol —
// a mouse, a pen and touches (R29). The tests take them from here rather than each keeping a copy.
// Like the tests, the build leaves this module out (tsconfig.build.json), and the package never has
// it.

import { cdp } from "vitest/browser";
import { toScreen, type View } from "../core/screen.js";
import "./index.js";
import type { Task } from "./index.js";
import { probe } from "./probe.js";

/** Two frames: one for the element's layout, one for its drawing. */
export async function settle(): Promise<void> {
  for (let frames = 0; frames < 2; frames += 1) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
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

/** The client point over a point of the sheet. */
export function at(canvas: HTMLCanvasElement, view: View, x: number, y: number) {
  const rect = canvas.getBoundingClientRect();
  const onScreen = toScreen(view, x, y);
  return { clientX: rect.left + onScreen.x, clientY: rect.top + onScreen.y };
}

/** A level stroke at `y`, from `from` to `to`, made by a script: a mouse's, pointerId 1. */
export function level(canvas: HTMLCanvasElement, view: View, y: number, from: number, to: number) {
  const mouse = { pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true };
  const event = (type: string, x: number, init: PointerEventInit) =>
    new PointerEvent(type, { ...mouse, ...at(canvas, view, x, y), ...init });
  canvas.dispatchEvent(event("pointerdown", from, { button: 0, buttons: 1, pressure: 0.5 }));
  canvas.dispatchEvent(event("pointermove", to, { button: -1, buttons: 1, pressure: 0.5 }));
  canvas.dispatchEvent(event("pointerup", to, { button: 0, buttons: 0, pressure: 0 }));
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
