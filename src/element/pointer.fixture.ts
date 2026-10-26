// The pointer of the element's tests in Chromium: the client point over a point of the sheet, a
// level stroke that a script makes, and real input through the DevTools protocol. The tests take
// them from here rather than each keeping a copy. Like the tests, the build leaves this module out
// (tsconfig.build.json), and the package never has it.

import { cdp } from "vitest/browser";
import { toScreen, type View } from "../core/screen.js";

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
 * Real input, through the DevTools protocol: the point of the page over a client point of this
 * test's frame, which the runner may have moved and scaled.
 */
export async function input(
  type: "mousePressed" | "mouseMoved" | "mouseReleased",
  client: { clientX: number; clientY: number },
  extra: { pointerType?: "mouse" | "pen"; force?: number } = {},
): Promise<void> {
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
