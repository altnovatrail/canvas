// The tracing paper of a task from paper (R87): the task's crop over the dotted sheet, on a layer
// of its own between the author's demo and the learner's ink, in sheet units, so that it moves with
// the sheet as it scrolls and zooms. The crop is multiplied over the sheet: the white of its paper
// lets the dots and the strokes under it show, and its print stays dark. Its grip "Move the task",
// a bar above its top edge, moves it by the pointer — a drag, kept to the sheet — and by the arrow
// keys, a step at a time, Shift a leap (WCAG 2.1.1); a drag is the pointer's one way, as the sheet
// moves under the hand (R90 spec). The grip's tooltip says its name on the hover of a pointer that
// hovers and on the keyboard's focus, and Escape dismisses it, as the bar's do (WCAG 1.4.13). The
// crop's picture is read once, to its grey pixels, for the crop of the work. This module is no
// entry point of the package.

import { type Gray, grayOf, LARGEST, type Size, sizeOf, TRACING } from "../core/tracing.js";
import { SVG, write } from "./attributes.js";

/** What the grip asks of the element: the tracing paper moved to a place, and the move ended. */
export interface TracingMoves {
  /** The place the learner moves it to: the element keeps it to the sheet, and gives where it lies. */
  readonly move: (at: readonly [number, number]) => readonly [number, number];
  /** The move is over: a drag let go, or a key pressed. */
  readonly moved: () => void;
}

/** Where the sheet is on the stage: `k` CSS pixels a unit, and the visible part's top left corner. */
export interface StageView {
  readonly k: number;
  readonly vx: number;
  readonly vy: number;
}

/** The grip's size, CSS pixels: a target of 68 × 44 (WCAG 2.5.5), the bar above the paper's edge. */
const GRIP = Object.freeze({ width: 68, height: 44, over: 29 });

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
  readonly #moves: TracingMoves;
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
      this.#showTip();
    });
    this.grip.addEventListener("blur", () => {
      this.#focused = false;
      this.#dismissed = false;
      this.#showTip();
    });
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

  /** The label of the grip, in the element's language, and its tooltip's. */
  label(name: string, lang: string): void {
    write(this.grip, "aria-label", name);
    write(this.grip, "lang", lang);
    this.tip.textContent = name;
    write(this.tip, "lang", lang);
  }

  /**
   * The layer and the grip as the tracing paper now is: at `at`, shown or hidden, or not there at
   * all, and the grip where the sheet's view puts the paper's top edge on the stage.
   */
  place(
    state: { readonly at: readonly [number, number]; readonly hidden: boolean } | undefined,
    view: StageView,
  ): void {
    this.#at = state?.at ?? [0, 0];
    this.#k = view.k;
    const shown = state !== undefined && !state.hidden && this.#blob !== undefined && this.#ready;
    write(this.layer, "display", shown ? null : "none");
    if (this.grip.hidden === shown) this.grip.hidden = !shown;
    if (!shown) {
      this.#showTip();
      return;
    }
    const [x, y] = this.#at;
    const { width, height } = this.#size;
    for (const shape of [this.#image, this.#edge]) {
      write(shape, "x", String(x));
      write(shape, "y", String(y));
      write(shape, "width", String(width));
      write(shape, "height", String(height));
    }
    const left = (x + width / 2 - view.vx) * view.k - GRIP.width / 2;
    const top = (y - view.vy) * view.k - GRIP.over;
    this.grip.style.transform = `translate(${left}px, ${top}px)`;
    this.tip.style.setProperty("--tip-x", `${left + GRIP.width + 8}px`);
    this.tip.style.setProperty("--tip-y", `${top + GRIP.height / 2}px`);
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
