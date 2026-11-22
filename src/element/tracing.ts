// The tracing paper of a task from paper (R87): the task's crop over the dotted sheet, on a layer
// of its own between the author's demo and the learner's ink, in sheet units, so that it moves with
// the sheet as it scrolls and zooms. The crop is multiplied over the sheet: the white of its paper
// lets the dots and the strokes under it show, and its print stays dark. Its grip "Move the task",
// a bar above its top edge, moves it by the pointer — a drag, kept to the sheet — and by the arrow
// keys, a step at a time, Shift a leap (WCAG 2.1.1); a drag is the pointer's one way, as the sheet
// moves under the hand (R90 spec). The grip's tooltip says its name on the hover of a pointer that
// hovers and on the keyboard's focus, and Escape dismisses it, as the bar's do (WCAG 1.4.13). The
// crop's picture is read once, to its grey pixels, for the crop of the work.
//
// Its scale (R89), as the mockup's `Zadacha-masshtab` has it: the grip's press, or its focus,
// chooses the paper — a blue frame round it with a handle at each corner, which a drag scales from
// the corner across, and under it the bar of scale: smaller, the percentage, which sets it back to
// its own size, larger, and fit to the window —; a press on the sheet lets it go. The bar's buttons
// are the keyboard's way, and a drag's alternative (WCAG 2.5.7). Above its corner a sign says what
// it shows: the photo, the reading on its way, or the statements the AI read, which the bar's last
// button offers, waits for and gives back the photo from. This module is no entry point of the
// package.

import type { TracingReading } from "@altnovatrail/spec/canvas";
import {
  type Gray,
  grayOf,
  LARGEST,
  SCALE,
  type Size,
  scaleOf,
  sizeOf,
  TRACING,
} from "../core/tracing.js";
import { SVG, write } from "./attributes.js";
import { ICONS, type IconName, ROW } from "./icons.js";
import { type Labels, say } from "./labels.js";
import { draw, plainButton } from "./tools.js";

/**
 * What the grip, the corners and the bar ask of the element: the tracing paper moved to a place,
 * or to a place at a scale, or fit to the window, the change ended, and the statement read.
 */
export interface TracingMoves {
  /** The place the learner moves it to: the element keeps it to the sheet, and gives where it lies. */
  readonly move: (at: readonly [number, number]) => readonly [number, number];
  /** The place and the scale the learner gives it: the element keeps it to the sheet. */
  readonly resize: (at: readonly [number, number], scale: number) => Placed;
  /** As large as the window's width takes it, right of the bar of tools. */
  readonly fit: () => void;
  /** The change is over: a drag let go, a key pressed, a button pressed, the wheel at rest. */
  readonly moved: () => void;
  /** The learner pressed "Recognise" while the reading is offered. */
  readonly read: () => void;
}

/**
 * Where the sheet is on the stage: `k` CSS pixels a unit, the visible part's top left corner, and
 * the stage's size, CSS pixels.
 */
export interface StageView {
  readonly k: number;
  readonly vx: number;
  readonly vy: number;
  readonly width: number;
  readonly height: number;
}

/** Where the paper lies and how large, as the element kept it to the sheet. */
interface Placed {
  readonly at: readonly [number, number];
  readonly scale: number;
}

/** A corner of the frame, by its sides: top or bottom, then left or right. */
type Corner = "tl" | "tr" | "bl" | "br";

/** What the paper shows: the crop, or the statements read. */
type View = "photo" | "text";

/** The grip's size, CSS pixels: a target of 68 × 44 (WCAG 2.5.5), the bar above the paper's edge. */
const GRIP = Object.freeze({ width: 68, height: 44, over: 29 });

/**
 * The bar of scale and the sign, CSS pixels, as the mockup sets them: the bar `gap` under the
 * paper, `height` high, and kept `margin` within the stage; the sign `over` above the paper's top.
 */
const BAR = Object.freeze({ gap: 18, height: 52, margin: 8 });
const SIGN = Object.freeze({ over: 34 });

/** How long the wheel rests before a scale by it is over, ms. */
const WHEEL_REST = 300;

/** The crop's picture as the element read it: its size on the sheet and its grey pixels. */
interface Read {
  readonly size: Size;
  readonly gray: Gray | null;
}

/** The tracing paper's layer, its grip and the grip's tooltip, and the crop's picture. */
export class TracingPaper {
  /** The layer, in sheet units by its view box, which says nothing to a screen reader. */
  readonly layer = document.createElementNS(SVG, "svg");
  readonly #image = document.createElementNS(SVG, "image");
  readonly #edge = document.createElementNS(SVG, "rect");
  /** The grip, a button of the stage's own, which takes the pointer as the canvas does. */
  readonly grip = document.createElement("button");
  /** The grip's tooltip, which says what its name says already: a screen reader reads that alone. */
  readonly tip = document.createElement("div");
  /**
   * Under the ink, over the paper: the statements read, in place of the crop, and the light that
   * sweeps the crop while they are read. It says nothing: the bar's button and the sign do.
   */
  readonly cover = document.createElement("div");
  readonly #text = document.createElement("div");
  readonly #scan = document.createElement("div");
  /** Over the ink: the frame of the paper chosen, and its corners, which scale it. */
  readonly frame = document.createElement("div");
  /** Over the ink: the sign above the paper's corner of what it shows. */
  readonly sign = document.createElement("div");
  readonly #signWords = document.createElement("span");
  /** Over the ink: the bar of scale under the paper chosen. */
  readonly bar = document.createElement("div");
  readonly #smaller = plainButton("smaller");
  readonly #percent = document.createElement("button");
  readonly #larger = plainButton("larger");
  readonly #fit = plainButton("fit");
  readonly #mode = plainButton("recognise");
  readonly #moves: TracingMoves;
  #labels: Labels | undefined;
  #lang = "en";
  #scale = 1;
  #chosen = false;
  #reading: TracingReading | undefined;
  #shows: View = "photo";
  /** The learner asked for the statements: they take the crop's place once they come. */
  #asked = false;
  /** The statements drawn, and the size they were fitted to: drawn again only when either changes. */
  #drawn = "";
  /** The paper on the stage, CSS pixels, as last placed. */
  #box = { width: 0, height: 0 };
  /** A corner's drag under way: its pointer, where it began, the paper then and the corner. */
  #corner:
    | {
        readonly pointerId: number;
        readonly x: number;
        readonly y: number;
        readonly at: readonly [number, number];
        readonly scale: number;
        readonly k: number;
        readonly corner: Corner;
      }
    | undefined;
  #wheel: ReturnType<typeof setTimeout> | undefined;
  #blob: Blob | undefined;
  #url: string | undefined;
  #connected = false;
  #read: Promise<Read> = Promise.resolve({ size: LARGEST, gray: null });
  #size: Size = LARGEST;
  /** The picture is read, or could not be: till then the paper is neither shown nor written on. */
  #ready = false;
  /** A drag under way: its pointer, where it began on the screen and the paper then. */
  #drag:
    | {
        readonly pointerId: number;
        readonly x: number;
        readonly y: number;
        readonly at: readonly [number, number];
        readonly k: number;
      }
    | undefined;
  #at: readonly [number, number] = [0, 0];
  #k = 1;
  #hovered = false;
  #focused = false;
  #dismissed = false;
  readonly #escape = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || this.tip.hidden) return;
    this.#dismissed = true;
    this.#showTip();
  };

  constructor(moves: TracingMoves) {
    this.#moves = moves;
    this.layer.setAttribute("class", "tracing");
    this.layer.setAttribute("preserveAspectRatio", "none");
    this.layer.setAttribute("aria-hidden", "true");
    this.#image.setAttribute("preserveAspectRatio", "none");
    this.#edge.setAttribute("class", "edge");
    this.layer.append(this.#image, this.#edge);
    this.layer.setAttribute("display", "none");
    this.grip.type = "button";
    this.grip.className = "grip";
    const bar = document.createElement("span");
    bar.className = "bar";
    bar.setAttribute("aria-hidden", "true");
    this.grip.append(bar);
    this.grip.hidden = true;
    this.tip.className = "tip grip-tip";
    this.tip.setAttribute("aria-hidden", "true");
    this.tip.hidden = true;
    this.grip.addEventListener("pointerdown", (event) => this.#down(event));
    this.grip.addEventListener("pointermove", (event) => this.#move(event));
    this.grip.addEventListener("pointerup", (event) => this.#up(event));
    this.grip.addEventListener("pointercancel", (event) => this.#up(event));
    this.grip.addEventListener("lostpointercapture", (event) => this.#up(event));
    this.grip.addEventListener("keydown", (event) => this.#key(event));
    this.grip.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") return;
      this.#hovered = true;
      this.#showTip();
    });
    this.grip.addEventListener("pointerleave", () => {
      this.#hovered = false;
      this.#dismissed = false;
      this.#showTip();
    });
    this.grip.addEventListener("focus", () => {
      this.#focused = this.grip.matches(":focus-visible");
      // The keyboard chooses the paper by its grip, and Tab goes on to the bar of scale.
      if (this.#focused) this.#choose(true);
      this.#showTip();
    });
    this.grip.addEventListener("blur", () => {
      this.#focused = false;
      this.#dismissed = false;
      this.#showTip();
    });
    this.#build();
  }

  /** The cover, the frame and its corners, the sign and the bar, out of sight till the paper is. */
  #build(): void {
    this.cover.className = "tracing-cover";
    this.cover.setAttribute("aria-hidden", "true");
    this.cover.hidden = true;
    this.#text.className = "statements";
    this.#text.hidden = true;
    this.#scan.className = "scan";
    this.#scan.hidden = true;
    this.#scan.append(document.createElement("i"));
    this.cover.append(this.#text, this.#scan);
    this.frame.className = "tracing-frame";
    this.frame.setAttribute("aria-hidden", "true");
    this.frame.hidden = true;
    for (const corner of ["tl", "tr", "bl", "br"] as const) {
      const handle = document.createElement("div");
      handle.className = `corner ${corner}`;
      handle.addEventListener("pointerdown", (event) => this.#cornerDown(event, corner));
      handle.addEventListener("pointermove", (event) => this.#cornerMove(event));
      handle.addEventListener("pointerup", (event) => this.#cornerUp(event));
      handle.addEventListener("pointercancel", (event) => this.#cornerUp(event));
      handle.addEventListener("lostpointercapture", (event) => this.#cornerUp(event));
      this.frame.append(handle);
    }
    this.sign.className = "tracing-sign";
    this.sign.setAttribute("aria-hidden", "true");
    this.sign.hidden = true;
    this.sign.append(document.createElement("span"), this.#signWords);
    this.bar.className = "tracing-scale";
    this.bar.setAttribute("role", "toolbar");
    this.bar.hidden = true;
    this.#smaller.classList.add("icon");
    this.#larger.classList.add("icon");
    this.#percent.type = "button";
    this.#percent.className = "percent";
    this.#mode.classList.add("mode");
    const line = document.createElement("span");
    line.className = "line";
    line.setAttribute("aria-hidden", "true");
    this.bar.append(this.#smaller, this.#percent, this.#larger, line, this.#fit, this.#mode);
    this.#smaller.addEventListener("click", () => this.#zoomBy(1 / SCALE.button));
    this.#larger.addEventListener("click", () => this.#zoomBy(SCALE.button));
    this.#percent.addEventListener("click", () => this.#zoomTo(1));
    this.#fit.addEventListener("click", () => {
      this.#moves.fit();
      this.#moves.moved();
    });
    this.#mode.addEventListener("click", () => this.#pressMode());
    // Escape lets the paper go, and the focus goes back to its grip.
    this.bar.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      this.#choose(false);
      this.grip.focus();
    });
  }

  /** The paper's scale, as the element last placed it. */
  get scale(): number {
    return this.#scale;
  }

  /**
   * The reading of the statement the consumer gives: the bar offers "Recognise" while it is any,
   * and the statements take the crop's place once they come for the learner who asked.
   */
  set reading(reading: TracingReading | undefined) {
    this.#reading = reading;
    if (reading === undefined || reading.state !== "done") {
      this.#shows = "photo";
      if (reading === undefined) this.#asked = false;
    } else if (this.#asked) {
      this.#asked = false;
      this.#shows = "text";
    }
    this.#drawn = "";
    this.#showReading();
  }

  /** The press on the sheet lets the paper go: its frame, corners and bar go out of sight. */
  letGo(): void {
    this.#choose(false);
  }

  /** Ctrl or ⌘ with the wheel over the paper: its scale by a notch, over once the wheel rests. */
  wheel(up: boolean): void {
    this.#zoomBy(up ? SCALE.wheel : 1 / SCALE.wheel, false);
    clearTimeout(this.#wheel);
    this.#wheel = setTimeout(() => {
      this.#wheel = undefined;
      this.#moves.moved();
    }, WHEEL_REST);
  }

  /** The tracing paper's size on the sheet: the largest till the crop's picture is read. */
  get size(): Size {
    return this.#size;
  }

  /**
   * Whether the paper's size is known: before it, a stroke would be kept to the largest paper and
   * the crop drawn stretched, so the paper waits for its picture.
   */
  get ready(): boolean {
    return this.#ready;
  }

  /** The crop's picture as read: its size and its grey pixels, or none if it could not be read. */
  get read(): Promise<Read> {
    return this.#read;
  }

  /**
   * A crop to lay as the tracing paper, or none. Its picture is read at once; `sized` hears when
   * the paper's size is known.
   */
  show(blob: Blob | undefined, sized: () => void): void {
    if (blob === this.#blob) return;
    this.#blob = blob;
    this.#size = LARGEST;
    this.#ready = false;
    this.#release();
    if (blob === undefined) {
      this.#read = Promise.resolve({ size: LARGEST, gray: null });
      return;
    }
    if (this.#connected) this.#address();
    this.#read = readOf(blob).then((read) => {
      if (this.#blob === blob) {
        this.#size = read.size;
        this.#ready = true;
        sized();
      }
      return read;
    });
  }

  /** The labels of the grip, its tooltip, the sign and the bar, in the element's language. */
  label(labels: Labels, lang: string): void {
    this.#labels = labels;
    this.#lang = lang;
    write(this.grip, "aria-label", labels.moveTask);
    write(this.grip, "lang", lang);
    this.tip.textContent = labels.moveTask;
    write(this.tip, "lang", lang);
    for (const part of [this.bar, this.sign]) write(part, "lang", lang);
    write(this.bar, "aria-label", labels.scaleButtons);
    for (const [button, words] of [
      [this.#smaller, labels.smaller],
      [this.#larger, labels.larger],
      [this.#fit, labels.fit],
    ] as const) {
      const label = button.querySelector(".label");
      if (label !== null && label.textContent !== words) label.textContent = words;
    }
    this.#showScale();
    this.#showReading();
  }

  /**
   * The layer and the grip as the tracing paper now is: at `at`, shown or hidden, or not there at
   * all, and the grip where the sheet's view puts the paper's top edge on the stage.
   */
  place(
    state:
      | {
          readonly at: readonly [number, number];
          readonly hidden: boolean;
          readonly scale?: number;
        }
      | undefined,
    view: StageView,
  ): void {
    this.#at = state?.at ?? [0, 0];
    this.#k = view.k;
    const scale = state?.scale ?? 1;
    if (scale !== this.#scale) {
      this.#scale = scale;
      this.#showScale();
    }
    const shown = state !== undefined && !state.hidden && this.#blob !== undefined && this.#ready;
    write(this.layer, "display", shown ? null : "none");
    if (this.grip.hidden === shown) this.grip.hidden = !shown;
    for (const part of [this.cover, this.sign]) if (part.hidden === shown) part.hidden = !shown;
    const chosen = shown && this.#chosen;
    for (const part of [this.frame, this.bar]) if (part.hidden === chosen) part.hidden = !chosen;
    if (!shown) {
      this.#showTip();
      return;
    }
    const [x, y] = this.#at;
    const width = this.#size.width * scale;
    const height = this.#size.height * scale;
    for (const shape of [this.#image, this.#edge]) {
      write(shape, "x", String(x));
      write(shape, "y", String(y));
      write(shape, "width", String(width));
      write(shape, "height", String(height));
    }
    const { k } = view;
    const box = {
      left: (x - view.vx) * k,
      top: (y - view.vy) * k,
      width: width * k,
      height: height * k,
    };
    const left = box.left + box.width / 2 - GRIP.width / 2;
    const top = box.top - GRIP.over;
    this.grip.style.transform = `translate(${left}px, ${top}px)`;
    this.tip.style.setProperty("--tip-x", `${left + GRIP.width + 8}px`);
    this.tip.style.setProperty("--tip-y", `${top + GRIP.height / 2}px`);
    for (const part of [this.cover, this.frame]) {
      part.style.transform = `translate(${box.left}px, ${box.top}px)`;
      part.style.width = `${box.width}px`;
      part.style.height = `${box.height}px`;
    }
    this.sign.style.transform = `translate(${box.left}px, ${box.top - SIGN.over}px)`;
    // Under the paper, but kept within the stage: a paper as tall as the window keeps its bar.
    const under = Math.min(box.top + box.height + BAR.gap, view.height - BAR.height - BAR.margin);
    this.bar.style.setProperty("--bar-x", `${box.left + box.width / 2}px`);
    this.bar.style.setProperty("--bar-y", `${Math.max(BAR.margin, under)}px`);
    // The paper's corners round with its scale, as the mockup's: 6 px at its own size, 12 at most.
    this.frame.style.setProperty("--round", `${Math.round(6 * Math.min(scale, 2))}px`);
    this.#box = { width: box.width, height: box.height };
    if (this.#shows === "text") this.#drawText();
    this.#showTip();
  }

  connect(): void {
    this.#connected = true;
    if (this.#blob !== undefined && this.#url === undefined) this.#address();
  }

  /** The element left the page: the crop's address goes, and a drag or a tooltip with it. */
  disconnect(): void {
    this.#connected = false;
    this.#release();
    this.#drag = undefined;
    this.grip.classList.remove("dragging");
    this.#hovered = false;
    this.#focused = false;
    this.#corner = undefined;
    if (this.#wheel !== undefined) {
      clearTimeout(this.#wheel);
      this.#wheel = undefined;
      this.#moves.moved();
    }
    this.#showTip();
  }

  #address(): void {
    if (this.#blob === undefined) return;
    this.#url = URL.createObjectURL(this.#blob);
    this.#image.setAttribute("href", this.#url);
  }

  #release(): void {
    if (this.#url !== undefined) URL.revokeObjectURL(this.#url);
    this.#url = undefined;
    this.#image.removeAttribute("href");
  }

  #down(event: PointerEvent): void {
    if (event.button !== 0 || this.#drag !== undefined) return;
    event.preventDefault();
    this.#choose(true);
    try {
      this.grip.setPointerCapture(event.pointerId);
    } catch {
      // An event a script made, which no pointer backs: the drag goes on by its moves all the same.
    }
    this.#drag = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      at: this.#at,
      k: this.#k,
    };
    this.grip.classList.add("dragging");
    this.#dismissed = true;
    this.#showTip();
  }

  #move(event: PointerEvent): void {
    const drag = this.#drag;
    if (drag === undefined || event.pointerId !== drag.pointerId) return;
    this.#at = this.#moves.move([
      drag.at[0] + (event.clientX - drag.x) / drag.k,
      drag.at[1] + (event.clientY - drag.y) / drag.k,
    ]);
  }

  #up(event: PointerEvent): void {
    const drag = this.#drag;
    if (drag === undefined || event.pointerId !== drag.pointerId) return;
    if (event.type === "pointerup") this.#move(event);
    this.#drag = undefined;
    this.grip.classList.remove("dragging");
    this.#moves.moved();
  }

  /** The arrow keys move the paper a step, and with Shift a leap; no other key is the grip's. */
  #key(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const by = event.shiftKey ? TRACING.leap : TRACING.step;
    const [x, y] = this.#at;
    let to: readonly [number, number];
    if (event.key === "ArrowLeft") to = [x - by, y];
    else if (event.key === "ArrowRight") to = [x + by, y];
    else if (event.key === "ArrowUp") to = [x, y - by];
    else if (event.key === "ArrowDown") to = [x, y + by];
    else return;
    event.preventDefault();
    // Where it lies now, not at the next frame's place(): keys pressed within one frame add up.
    this.#at = this.#moves.move(to);
    this.#moves.moved();
  }

  /** The paper chosen, or let go: its frame, corners and bar come or go with the next place. */
  #choose(chosen: boolean): void {
    if (this.#chosen === chosen) return;
    this.#chosen = chosen;
    const shown = chosen && !this.grip.hidden;
    for (const part of [this.frame, this.bar]) if (part.hidden === shown) part.hidden = !shown;
  }

  /** A scale about the paper's centre, kept to the rule; over at once unless the wheel goes on. */
  #zoomTo(scale: number, over = true): void {
    const to = scaleOf(scale);
    const from = this.#scale;
    if (to !== from) {
      const { width, height } = this.#size;
      const [x, y] = this.#at;
      // Where it lies now, not at the next frame's place(): presses within one frame add up.
      this.#resized(
        this.#moves.resize([x + (width * (from - to)) / 2, y + (height * (from - to)) / 2], to),
      );
    }
    if (over) this.#moves.moved();
  }

  #zoomBy(factor: number, over = true): void {
    this.#zoomTo(this.#scale * factor, over);
  }

  /** A corner's press: the paper scales from the corner across as the pointer goes. */
  #cornerDown(event: PointerEvent, corner: Corner): void {
    if (event.button !== 0 || this.#corner !== undefined) return;
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    try {
      if (handle instanceof Element) handle.setPointerCapture(event.pointerId);
    } catch {
      // An event a script made, which no pointer backs: the drag goes on by its moves all the same.
    }
    this.#corner = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      at: this.#at,
      scale: this.#scale,
      k: this.#k,
      corner,
    };
  }

  /**
   * The scale a corner's drag gives, as the mockup's: the larger of the pointer's two moves outward,
   * each over the paper's own size on the screen, added to the scale it began at; the corner across
   * stays where it was.
   */
  #cornerMove(event: PointerEvent): void {
    const drag = this.#corner;
    if (drag === undefined || event.pointerId !== drag.pointerId) return;
    const across = drag.corner.endsWith("r") ? 1 : -1;
    const down = drag.corner.startsWith("b") ? 1 : -1;
    const { width, height } = this.#size;
    const grown = Math.max(
      (across * (event.clientX - drag.x)) / (width * drag.k),
      (down * (event.clientY - drag.y)) / (height * drag.k),
    );
    const scale = scaleOf(drag.scale + grown);
    const [x, y] = drag.at;
    this.#resized(
      this.#moves.resize(
        [
          across < 0 ? x + width * (drag.scale - scale) : x,
          down < 0 ? y + height * (drag.scale - scale) : y,
        ],
        scale,
      ),
    );
  }

  #resized(placed: Placed): void {
    this.#at = placed.at;
    if (placed.scale === this.#scale) return;
    this.#scale = placed.scale;
    this.#showScale();
  }

  #cornerUp(event: PointerEvent): void {
    const drag = this.#corner;
    if (drag === undefined || event.pointerId !== drag.pointerId) return;
    if (event.type === "pointerup") this.#cornerMove(event);
    this.#corner = undefined;
    this.#moves.moved();
  }

  /** The percentage, in the element's language, and the name of the button that sets it back. */
  #showScale(): void {
    const percent = new Intl.NumberFormat(this.#lang, {
      style: "percent",
      maximumFractionDigits: 0,
    }).format(this.#scale);
    if (this.#percent.textContent !== percent) this.#percent.textContent = percent;
    if (this.#labels !== undefined) {
      write(this.#percent, "aria-label", say(this.#labels.scaleReset, { percent }));
    }
  }

  /**
   * "Recognise" offers the reading, waits for it, and gives the photo back once the statements show;
   * statements that came show again with no new reading.
   */
  #pressMode(): void {
    const reading = this.#reading;
    if (reading === undefined || reading.state === "busy") return;
    if (reading.state === "done") {
      this.#shows = this.#shows === "text" ? "photo" : "text";
      this.#drawn = "";
      this.#showReading();
      return;
    }
    this.#asked = true;
    this.#moves.read();
  }

  /** The bar's last button, the sign and the cover, by the reading and what the paper shows. */
  #showReading(): void {
    const labels = this.#labels;
    const reading = this.#reading;
    this.#mode.hidden = reading === undefined;
    const busy = reading?.state === "busy";
    const text = this.#shows === "text";
    this.#mode.classList.toggle("busy", busy);
    this.#mode.classList.toggle("back", text);
    if (busy) this.#mode.setAttribute("aria-disabled", "true");
    else this.#mode.removeAttribute("aria-disabled");
    draw(this.#mode, text ? "original" : "recognise", false);
    write(this.#image, "display", text ? "none" : null);
    this.#text.hidden = !text;
    this.#scan.hidden = !busy;
    if (text) this.#drawText();
    const shows = busy ? "busy" : text ? "text" : "photo";
    if (this.sign.dataset.shows !== shows) {
      this.sign.dataset.shows = shows;
      this.sign.firstElementChild?.replaceWith(signOf(shows));
    }
    if (labels === undefined) return;
    const words = busy ? labels.recognising : text ? labels.original : labels.recognise;
    const label = this.#mode.querySelector(".label");
    if (label !== null && label.textContent !== words) label.textContent = words;
    const sign = busy ? labels.recognising : text ? labels.readingShown : labels.photoShown;
    if (this.#signWords.textContent !== sign) this.#signWords.textContent = sign;
  }

  /**
   * The statements in place of the crop, a line each, "□" a dashed box: their letters as large as
   * the paper's height shares out among them, and smaller where the longest line would not fit.
   */
  #drawText(): void {
    const { width, height } = this.#box;
    const reading = this.#reading;
    const statements = reading?.state === "done" ? reading.statements : [];
    const key = JSON.stringify([statements, Math.round(width), Math.round(height)]);
    if (key === this.#drawn) return;
    this.#drawn = key;
    this.#text.replaceChildren(
      ...statements.map((statement) => {
        const line = document.createElement("div");
        line.className = "line";
        for (const [n, piece] of statement.split("□").entries()) {
          if (n > 0) {
            const box = document.createElement("span");
            box.className = "slot";
            line.append(box);
          }
          if (piece !== "") line.append(piece);
        }
        return line;
      }),
    );
    const lines = Math.max(1, statements.length);
    let size = Math.min(height / (lines * 1.5), height * 0.55);
    this.#text.style.fontSize = `${size}px`;
    const wide = this.#text.scrollWidth;
    if (wide > width && wide > 0) {
      size *= (width * 0.92) / wide;
      this.#text.style.fontSize = `${size}px`;
    }
  }

  /** The tooltip on hover or the keyboard's focus, unless Escape or a drag dismissed it. */
  #showTip(): void {
    const wanted = !this.grip.hidden && (this.#hovered || this.#focused) && !this.#dismissed;
    if (this.tip.hidden === !wanted) return;
    this.tip.hidden = !wanted;
    if (wanted) document.addEventListener("keydown", this.#escape, true);
    else document.removeEventListener("keydown", this.#escape, true);
  }
}

/**
 * The crop's picture, read: decoded by the browser, its size on the sheet by its proportions, and
 * its pixels drawn once at its own size and read back as grey. A picture the browser cannot decode
 * has the largest size and no pixels, and says so in the console.
 */
async function readOf(blob: Blob): Promise<Read> {
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const { naturalWidth: width, naturalHeight: height } = image;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (context === null) return { size: sizeOf(width, height), gray: null };
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, width, height);
    // The canvas's memory goes at once, not at a collection: WebKit caps what all canvases hold.
    canvas.width = 0;
    canvas.height = 0;
    return { size: sizeOf(width, height), gray: grayOf(data, width, height) };
  } catch (error) {
    console.warn("<novatrail-canvas> could not read the task's crop:", error);
    return { size: LARGEST, gray: null };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** The sign's mark of what the paper shows: the photo's, the reading's wait, or the AI's reading. */
function signOf(shows: "busy" | "text" | "photo"): Element {
  if (shows === "busy") {
    const spinner = document.createElement("span");
    spinner.className = "spinner";
    return spinner;
  }
  const name: IconName = ROW[shows === "text" ? "recognise" : "original"].outline;
  const { viewBox, paths } = ICONS[name];
  const icon = document.createElementNS(SVG, "svg");
  icon.setAttribute("viewBox", viewBox);
  for (const d of paths) {
    const path = document.createElementNS(SVG, "path");
    path.setAttribute("d", d);
    icon.append(path);
  }
  return icon;
}
