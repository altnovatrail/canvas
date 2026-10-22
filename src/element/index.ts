// The package's entry point @altnovatrail/canvas: the canvas as a custom element, one for every
// canvas kind, with its markup in an open shadow root (R07). Importing it registers the element,
// once: a page has one element of this name. So far it is the handwriting sheet with its input,
// one pointer at a time (RUN.md, T09; R18), its undo and clearing, which the consumer calls from
// buttons of its own (T33; R19), and what tutor's check board needs to take it in place of its own
// sheet: the picture of the work and an event after every change of the work (T34; R20). Its
// other layers and the element's other properties, methods and events come with the tasks of the
// sheet (T10–T15).

import type { Vec2 } from "perfect-freehand";
import type { Stroke } from "../core/ink.js";
import { evenOutline, followsPressure, outline } from "../core/outline.js";
import { type PointerSample, Recorder } from "../core/recorder.js";
import { scaleFor, toSheet, type View } from "../core/screen.js";
import { SHEET } from "../core/sheet.js";
import { Work } from "../core/work.js";
import { attachProbe } from "./probe.js";

/** The name the element is registered under. */
export const TAG = "novatrail-canvas";

/** The colour of the ink: the check board's (R19 tutor). */
const INK = "#111";
/** The colour of the sheet, on the screen and on the picture of the work: the board's white. */
const PAPER = "#fff";
/** The event the element sends after every change of the work (R20). */
const WORK_CHANGE = "workchange";

// The sheet scrolls in a container of its own, by the browser's own scrolling: the wheel, the
// scroll bar and the keyboard work as anywhere on a page. The canvas stays in the container's
// visible part and draws what lies there, shifted by its matrix (R18; architecture 3.2 in
// docs/architecture.md). The element is as tall as the sheet unless it is given a height: then
// the sheet scrolls in it. On the canvas the browser neither scrolls nor zooms: the pointer writes.
const STYLE = `
:host { display: flex; flex-direction: column; }
:host([hidden]) { display: none; }
.viewport { flex: 1 1 auto; min-height: 0; overflow-x: hidden; overflow-y: auto; }
.sheet { aspect-ratio: ${SHEET.width} / ${SHEET.height}; background: ${PAPER}; }
canvas {
  position: sticky; top: 0; display: block; width: 100%; max-height: 100%;
  touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
}
`;

/** The view of the sheet, with the visible part's top left corner and height on the screen. */
interface Screen extends View {
  readonly left: number;
  readonly top: number;
  readonly height: number;
}

/** A finished stroke's path, with the top and the bottom of its outline on the sheet. */
interface Ink {
  readonly path: Path2D;
  readonly top: number;
  readonly bottom: number;
}

/** The element `<novatrail-canvas>`. */
export class NovatrailCanvas extends HTMLElement {
  readonly #viewport = document.createElement("div");
  readonly #sheet = document.createElement("div");
  readonly #canvas = document.createElement("canvas");
  readonly #context = this.#canvas.getContext("2d");
  /** The strokes on the sheet and the actions undo takes back (R19). */
  readonly #work = new Work();
  /** The input: a finished stroke goes onto the work, and the work has changed. */
  readonly #recorder = new Recorder((stroke) => {
    this.#work.write(stroke);
    this.#changed();
  });
  /** The path of each finished stroke, outlined once (R18). */
  readonly #inks = new WeakMap<Stroke, Ink>();
  /** The path of each pen's stroke on the picture of the work, without its pressure, outlined once. */
  readonly #evens = new WeakMap<Stroke, Path2D>();
  readonly #resize = new ResizeObserver((entries) => {
    const box = entries.at(-1)?.contentBoxSize[0];
    if (box !== undefined) this.#area = { width: box.inlineSize, height: box.blockSize };
    this.#layout();
  });
  /** The size of the container's visible part, in CSS pixels as laid out, before any transform. */
  #area: { readonly width: number; readonly height: number } | undefined;
  /** `k` of the last layout, and the top of the visible part, kept from the last scroll. */
  #k = 0;
  #vy = 0;
  #frame = 0;
  #outlines = 0;
  #unwatchDensity: (() => void) | undefined;

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE;
    this.#viewport.className = "viewport";
    this.#sheet.className = "sheet";
    this.#sheet.append(this.#canvas);
    this.#viewport.append(this.#sheet);
    root.append(style, this.#viewport);

    this.#canvas.addEventListener("pointerdown", (event) => this.#down(event));
    this.#canvas.addEventListener("pointermove", (event) => this.#move(event));
    this.#canvas.addEventListener("pointerup", (event) => this.#up(event));
    this.#canvas.addEventListener("pointercancel", (event) => {
      if (this.#recorder.cancel(event.pointerId)) this.#request();
    });
    // A stroke that ends here, or on its pointerup, lands through the recorder's handler, which
    // draws the sheet anew.
    this.#canvas.addEventListener("lostpointercapture", (event) => {
      this.#recorder.end(event.pointerId);
    });
    // A long press of a pen or a finger, or a right click, opens no menu over the sheet.
    this.#canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    this.#viewport.addEventListener("scroll", () => this.#scrolled(), { passive: true });

    attachProbe(this, () => ({
      strokes: this.#work.strokes,
      live: this.#recorder.live,
      outlines: this.#outlines,
      view: this.#view(),
    }));
  }

  connectedCallback(): void {
    this.#resize.observe(this.#viewport);
    this.#watchDensity();
  }

  /**
   * Takes back the last action on the sheet — the last stroke written, or the clearing — and says
   * whether there was one (R19), with a `workchange` if there was (R20). A stroke under way stays:
   * it lands when it ends.
   */
  undo(): boolean {
    const undone = this.#work.undo();
    if (undone) this.#changed();
    return undone;
  }

  /**
   * Takes every stroke off the sheet, an action that undo takes back, and says whether there were
   * any (R19), with a `workchange` if there were (R20). A stroke under way stays: it lands when it
   * ends.
   */
  clear(): boolean {
    const cleared = this.#work.clear();
    if (cleared) this.#changed();
    return cleared;
  }

  /**
   * The picture of the work, a PNG, as tutor's check board sends its sheet to the models (R20; R19
   * tutor): the whole sheet, a pixel to a unit — 1000 × 1400, whatever the screen and the
   * element's size — its strokes in ink on white. The line is as wide all along, a pen's too: the
   * pressure goes into no picture for checking. The browser's own canvas draws it, so its bytes are
   * the browser's.
   *
   * It is the sheet as it is when this is called: a stroke under way is not on it yet, and one that
   * ends before the promise settles is not in it. A sheet without strokes has no picture, and the
   * promise gives null; it is rejected if the browser cannot draw or encode the picture.
   */
  async exportPNG(): Promise<Blob | null> {
    const strokes = this.#work.strokes;
    if (strokes.length === 0) return null;
    // A canvas of its own, in no document: toBlob is older in browsers than OffscreenCanvas.
    const picture = document.createElement("canvas");
    picture.width = SHEET.width;
    picture.height = SHEET.height;
    const context = picture.getContext("2d");
    // Not null: a consumer would take it for an empty sheet.
    if (context === null) throw new Error("the browser gives no 2D context to draw the picture on");
    context.fillStyle = PAPER;
    context.fillRect(0, 0, SHEET.width, SHEET.height);
    context.fillStyle = INK;
    for (const stroke of strokes) context.fill(this.#even(stroke));
    // toBlob copies the canvas as it is now, before anything else can write on the sheet, and
    // encodes the copy after (HTML Standard).
    return new Promise((resolve, reject) => {
      picture.toBlob((png) => {
        if (png === null) reject(new Error("the browser could not encode the picture"));
        else resolve(png);
      }, "image/png");
    });
  }

  disconnectedCallback(): void {
    // A stroke under way ends where it is: its pointerup will not reach a sheet off the page. Its
    // workchange reaches only the element's own listeners, for the element is in no tree now.
    this.#recorder.end();
    this.#resize.disconnect();
    this.#unwatchDensity?.();
    this.#unwatchDensity = undefined;
    cancelAnimationFrame(this.#frame);
    this.#frame = 0;
  }

  #down(event: PointerEvent): void {
    const screen = this.#view();
    if (screen === undefined || !this.#recorder.down(this.#sample(event, screen))) return;
    // The stroke goes on beyond the canvas, clamped to the sheet's edge, until the pointer
    // comes up.
    try {
      this.#canvas.setPointerCapture(event.pointerId);
    } catch {
      // The pointer is no longer active, or never was: an event that a script made.
    }
    this.#request();
  }

  #move(event: PointerEvent): void {
    if (this.#recorder.pointer !== event.pointerId) return;
    const screen = this.#view();
    if (screen === undefined) return;
    let changed = false;
    for (const each of coalesced(event)) {
      changed = this.#recorder.move(this.#sample(each, screen)) || changed;
    }
    if (changed) this.#request();
  }

  #up(event: PointerEvent): void {
    if (this.#recorder.pointer !== event.pointerId) return;
    const screen = this.#view();
    if (screen === undefined) this.#recorder.end(event.pointerId);
    else this.#recorder.up(this.#sample(event, screen));
  }

  #sample(event: PointerEvent, screen: Screen): PointerSample {
    const { x, y } = toSheet(screen, event.clientX - screen.left, event.clientY - screen.top);
    return {
      pointerId: event.pointerId,
      kind: event.pointerType,
      button: event.button,
      buttons: event.buttons,
      x,
      y,
      time: event.timeStamp,
      pressure: event.pressure,
    };
  }

  /**
   * Where the sheet is on the screen now. The rectangles of the canvas and of the sheet give it:
   * the canvas is as wide as the sheet, and its top is the top of the visible part.
   */
  #view(): Screen | undefined {
    const canvas = this.#canvas.getBoundingClientRect();
    if (canvas.width <= 0) return undefined;
    const k = scaleFor(canvas.width);
    const sheet = this.#sheet.getBoundingClientRect();
    const vy = (canvas.top - sheet.top) / k;
    return { k, vy, left: canvas.left, top: canvas.top, height: canvas.height };
  }

  #scrolled(): void {
    if (this.#k > 0) this.#vy = this.#viewport.scrollTop / this.#k;
    this.#request();
  }

  /**
   * The canvas takes the visible part of the sheet, and a pixel of its buffer for each device
   * pixel: its size on the screen times the density (R18).
   */
  #layout(): void {
    const area = this.#area;
    if (area === undefined || area.width === 0) return;
    // The container is as wide as the sheet, and the canvas as tall as the visible part of it.
    const k = scaleFor(area.width);
    // A new width scales the sheet: the top of the visible part stays where it was on the sheet.
    if (this.#k > 0 && k !== this.#k) this.#viewport.scrollTop = this.#vy * k;
    this.#k = k;
    this.#canvas.style.height = `${Math.min(area.height, SHEET.height * k)}px`;
    const onScreen = this.#canvas.getBoundingClientRect();
    const width = Math.round(onScreen.width * devicePixelRatio);
    const height = Math.round(onScreen.height * devicePixelRatio);
    if (this.#canvas.width === width && this.#canvas.height === height) {
      this.#request();
      return;
    }
    // A new size clears the canvas, and the ink goes back at once: a ResizeObserver reports after
    // the frame's animation callbacks, but before the frame is painted.
    this.#canvas.width = width;
    this.#canvas.height = height;
    this.#draw();
  }

  /** A new density — the window on another screen, the page zoomed — lays the canvas out anew. */
  #watchDensity(): void {
    const density = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
    const changed = (): void => {
      this.#layout();
      this.#watchDensity();
    };
    density.addEventListener("change", changed, { once: true });
    this.#unwatchDensity = () => density.removeEventListener("change", changed);
  }

  /**
   * The work has changed — a stroke landed, an undo, a clearing: the sheet is drawn anew, and
   * whoever listens hears of it at once, the work already as it now is (R20). The event goes up
   * from the element itself, and out of a consumer's own shadow tree too, should the element be
   * in one.
   */
  #changed(): void {
    this.#request();
    this.dispatchEvent(new Event(WORK_CHANGE, { bubbles: true, composed: true }));
  }

  #request(): void {
    if (this.#frame !== 0 || !this.isConnected) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0;
      this.#draw();
    });
  }

  /**
   * The strokes in the visible part, in device pixels: each finished stroke by the path it was
   * given once, the stroke under way outlined anew.
   */
  #draw(): void {
    const context = this.#context;
    const screen = this.#view();
    const { width, height } = this.#canvas;
    if (context === null || screen === undefined || width === 0 || height === 0) return;
    // Device pixels to a unit, across and down. The canvas is as wide as the sheet, and the ratio
    // of its rectangles holds under any scale the page puts on the element.
    const across = width / SHEET.width;
    const down = (height / screen.height) * screen.k;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, width, height);
    context.setTransform(across, 0, 0, down, 0, -screen.vy * down);
    context.fillStyle = INK;
    const bottom = screen.vy + screen.height / screen.k;
    for (const stroke of this.#work.strokes) {
      const ink = this.#finished(stroke);
      if (ink.bottom >= screen.vy && ink.top <= bottom) context.fill(ink.path);
    }
    const live = this.#recorder.live;
    if (live !== undefined) context.fill(pathOf(this.#outline(live, false)));
  }

  #finished(stroke: Stroke): Ink {
    let ink = this.#inks.get(stroke);
    if (ink === undefined) {
      const polygon = this.#outline(stroke, true);
      const ys = polygon.map(([, y]) => y);
      ink = { path: pathOf(polygon), top: Math.min(...ys), bottom: Math.max(...ys) };
      this.#inks.set(stroke, ink);
    }
    return ink;
  }

  /**
   * A finished stroke's path on the picture of the work: a mouse's or a finger's is its path on the
   * screen, and a pen's its own, as wide all along, outlined once.
   */
  #even(stroke: Stroke): Path2D {
    if (!followsPressure(stroke)) return this.#finished(stroke).path;
    let path = this.#evens.get(stroke);
    if (path === undefined) {
      this.#outlines++;
      path = pathOf(evenOutline(stroke));
      this.#evens.set(stroke, path);
    }
    return path;
  }

  #outline(stroke: Stroke, complete: boolean): Vec2[] {
    this.#outlines++;
    return outline(stroke, complete);
  }
}

/**
 * The events coalesced into a pointer event, in order, or the event alone. `getCoalescedEvents`
 * is there only in a secure context, and not in every browser; pointerup's list is empty.
 */
function coalesced(event: PointerEvent): readonly PointerEvent[] {
  const events = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : [];
  return events.length > 0 ? events : [event];
}

/**
 * A path around an outline: a closed curve through the midpoints of its edges, each point of the
 * outline the control point between two of them.
 */
function pathOf(polygon: readonly Vec2[]): Path2D {
  const path = new Path2D();
  const first = polygon[0];
  if (first === undefined) return path;
  const last = polygon[polygon.length - 1] ?? first;
  path.moveTo((last[0] + first[0]) / 2, (last[1] + first[1]) / 2);
  for (const [i, [x, y]] of polygon.entries()) {
    const [nextX, nextY] = polygon[i + 1] ?? first;
    path.quadraticCurveTo(x, y, (x + nextX) / 2, (y + nextY) / 2);
  }
  path.closePath();
  return path;
}

// A second copy of this module, from a second copy of the package, finds the name taken and
// leaves the first registration in place, rather than throwing when the page imports it. It says
// so, though: elements of the page are then built by the other copy, of whatever version it is.
const registered = customElements.get(TAG);
if (registered === undefined) {
  customElements.define(TAG, NovatrailCanvas);
} else if (registered !== NovatrailCanvas) {
  console.warn(
    `<${TAG}> is already registered by another copy of @altnovatrail/canvas; this copy's element is not used`,
  );
}

declare global {
  interface HTMLElementTagNameMap {
    "novatrail-canvas": NovatrailCanvas;
  }
}
