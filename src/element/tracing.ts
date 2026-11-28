// The tracing paper of a task from paper: the task's crop over the dotted sheet, on a layer
// of its own between the author's demo and the learner's ink, in sheet units, so that it moves with
// the sheet as it scrolls and zooms. The crop is multiplied over the sheet: the white of its paper
// lets the dots and the strokes under it show, and its print stays dark. Its grip "Move the task",
// a bar above its top edge, moves it by the pointer — a drag, kept to the sheet — and by the arrow
// keys, a step at a time, Shift a leap (WCAG 2.1.1); a drag is the pointer's one way, as the sheet
// moves under the hand. The grip's tooltip says its name on the hover of a pointer that
// hovers and on the keyboard's focus, and Escape dismisses it, as the bar's do (WCAG 1.4.13). The
// crop's picture is read once, to its grey pixels, for the crop of the work. A task of a module's
// paper is opaque instead, white over the grid: its picture is the module's text on white, and the
// grid through it would only be noise under the print.
//
// Its scale, as the mockup's `Zadacha-masshtab` has it: the grip's press, or its focus,
// chooses the paper — a blue frame round it with a handle at each corner, which a drag scales from
// the corner across, and under it the bar of scale: smaller, the percentage, which sets it back to
// its own size, larger, and fit to the window —; a press on the sheet lets it go. The bar's buttons
// are the keyboard's way, and a drag's alternative (WCAG 2.5.7). Above its corner a sign says what
// it shows: the photo, the reading on its way, or the statements the AI read, which the bar's last
// button offers, waits for and gives back the photo from; or, for a task of a module, whose
// picture is the module's text, the module's book, with no button to read it.
//
// A task of a module whose answer is a choice has its options on the paper, under the picture, as
// the interface mockup draws them: first one pale pill, "Answer options", and once the learner
// presses it, in its place, the options as pills in a row that wraps, the one the consumer chose
// filled with the accent, each the consumer judged green with a tick or orange and struck out, and
// the rest faded once one is correct. The options stay behind the pill till a learner asks, so that
// a guess among them is no shortcut past the work; a new task shuts them again. A judged option
// tells nothing more, nor does any once one is correct. They are a part of the paper, which grows down to hold them: they move, scale and
// hide with it, and a press on the paper beside them writes on it. They are laid out at the paper's
// own size, a CSS pixel a unit, and scaled with it to the screen, so that how they wrap, and how far
// the paper grows, is the same at every zoom. They are a group of radio buttons, a stop of Tab with
// the arrow keys among them, as the tool bar's tools; a press, Enter or Space tells the consumer,
// which holds the choice and gives it back. This module is no entry point of the package.

import type { OptionVerdict, PaperTask, TracingReading } from "@altnovatrail/spec/canvas";
import { sameItems } from "../core/fields.js";
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
import { lineOf } from "./notation.js";
import { arrowedTo, asRadio, draw, plainButton } from "./tools.js";

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
  /** The learner pressed an option, by its index, the chosen one too. */
  readonly tap: (option: number) => void;
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

/** Where the paper's picture comes from: a photo's crop, or a module's text drawn. */
type Source = NonNullable<PaperTask["source"]>;

/** The grip's size, CSS pixels: a target of 68 × 44 (WCAG 2.5.5), the bar above the paper's edge. */
const GRIP = Object.freeze({ width: 68, height: 44, over: 29 });

/**
 * The bar of scale and the sign, CSS pixels, as the mockup sets them: the bar `gap` under the
 * paper, `height` high, and kept `margin` within the stage; the sign `over` above the paper's top.
 */
const BAR = Object.freeze({ gap: 18, height: 52, margin: 8 });
const SIGN = Object.freeze({ over: 34 });

/**
 * The options under the picture, as the mockup lays them out on a paper 272 of its pixels wide: in
 * 272ths of the paper's width, their letters `font` high and the rest in their letters' size, so
 * that the options grow with the statement the consumer drew to the paper's width. The style holds
 * the rest of the mockup's numbers in `em`.
 */
const OPTIONS = Object.freeze({ across: 272, font: 12.5 });
/** The room the options take before they are laid out: one row, in their letters' size. */
const ONE_ROW = (4 + 28 + 12) / 12.5;

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
  /** Under the picture, the whole paper: white for a task of a module, nothing for a photo. */
  readonly #ground = document.createElementNS(SVG, "rect");
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
  /**
   * Over the ink: the options of a task of a module under the picture, which take the pointer
   * where they stand and leave the paper round them to the ink: the button that shows them, and
   * once it is pressed, in its place, the group of radio buttons.
   */
  readonly choices = document.createElement("div");
  readonly #reveal = plainButton("options");
  readonly #group = document.createElement("div");
  /** The options' texts, in their order, the one the consumer chose, and what each came to. */
  #options: readonly string[] = [];
  #picked: number | undefined;
  #verdicts: readonly (OptionVerdict | null)[] = [];
  /** The learner pressed the button that shows the options. */
  #open = false;
  /**
   * How far the options reach below the picture, in their letters' size: the same at any width of
   * the paper, whose 272ths their letters are, and at any zoom, which only scales them.
   */
  #band = 0;
  /** The options laid out anew, by their texts, their font or the paper's width. */
  readonly #laid = new ResizeObserver((entries) => this.#measure(entries));
  /** The paper's width, in units, that the options were last laid out across, a CSS pixel each. */
  #across: number | undefined;
  /** Hears that the paper's size is known, or changed as its options were laid out. */
  #sized: () => void = () => undefined;
  readonly #moves: TracingMoves;
  #labels: Labels | undefined;
  #lang = "en";
  #scale = 1;
  #chosen = false;
  #reading: TracingReading | undefined;
  #source: Source = "photo";
  #shows: View = "photo";
  /** The learner asked for the statements: they take the crop's place once they come. */
  #asked = false;
  /** The statements drawn, and the size they were fitted to: drawn again only when either changes. */
  #drawn = "";
  /** The letters' size the paper's height gives the statements, before they are fitted. */
  #full = 0;
  /**
   * The lines' sizes, which change when they are first laid out — the paper hidden when they were
   * drawn, or the font not yet loaded — and when they are fitted: each time they are fitted again.
   */
  readonly #lines = new ResizeObserver(() => this.#fitText());
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
  /** The picture's size on the sheet, and the paper's, with its options under the picture. */
  #picture: Size = LARGEST;
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
    this.#ground.setAttribute("class", "ground");
    this.#edge.setAttribute("class", "edge");
    this.layer.append(this.#ground, this.#image, this.#edge);
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
    this.choices.className = "tracing-choices";
    this.choices.hidden = true;
    this.#reveal.classList.add("reveal");
    this.#reveal.addEventListener("click", () => this.#openOptions());
    this.#group.className = "options";
    this.#group.setAttribute("role", "radiogroup");
    this.#group.hidden = true;
    this.#group.addEventListener("keydown", (event) => this.#arrow(event));
    this.choices.append(this.#reveal, this.#group);
    this.#laid.observe(this.choices);
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

  /**
   * Where the paper's picture comes from: a module's text has nothing to read, and its sign says
   * whose it is.
   */
  set source(source: Source) {
    if (source === this.#source) return;
    this.#source = source;
    this.layer.classList.toggle("module", source === "module");
    this.#shows = "photo";
    this.#drawn = "";
    this.#showReading();
  }

  /**
   * The options of a task of a module, or none: a button each under the picture, in their order,
   * none chosen and none judged till the consumer says. The same texts again change nothing, the
   * choice and the verdicts neither.
   */
  set options(options: readonly string[] | undefined) {
    const texts = options ?? [];
    if (sameItems(texts, this.#options)) return;
    this.#options = texts;
    this.#picked = undefined;
    this.#verdicts = [];
    this.#group.replaceChildren(
      ...texts.map((text, n) => {
        const button = asRadio(document.createElement("button"));
        button.type = "button";
        // Its words on a fill of their own over the button's, which is opaque in forced colours:
        // the system's Highlight may be translucent, and so has to lie on Canvas, not on the ink.
        const words = document.createElement("span");
        words.textContent = text;
        const tick = iconOf(ROW.correct.outline);
        tick.classList.add("tick");
        words.prepend(tick);
        button.append(words);
        button.tabIndex = n === 0 ? 0 : -1;
        button.addEventListener("click", () => {
          if (!this.#settled(n)) this.#moves.tap(n);
        });
        button.addEventListener("focus", () => this.#stopAt(n));
        return button;
      }),
    );
    this.#band = texts.length === 0 ? 0 : ONE_ROW;
    this.#resize();
    this.#showVerdicts();
  }

  /**
   * What each option came to, by its index, as the consumer checked it: drawn on its button, which
   * tells nothing more; once one is correct none does, and the others fade.
   */
  set verdicts(verdicts: readonly (OptionVerdict | null)[]) {
    this.#verdicts = verdicts;
    this.#showVerdicts();
  }

  /** The options behind their button again, as a new task from paper comes. */
  shut(): void {
    if (!this.#open) return;
    this.#open = false;
    this.#reveal.hidden = false;
    this.#group.hidden = true;
  }

  /**
   * The option the consumer chose, by its index among the options, or none: it alone shows as
   * chosen, and Tab comes to it.
   */
  set chosen(option: number | undefined) {
    if (option === this.#picked) return;
    this.#picked = option;
    const buttons = this.#group.children;
    for (let n = 0; n < buttons.length; n++) {
      write(buttons[n] as Element, "aria-checked", String(n === option));
    }
    if (option !== undefined) this.#stopAt(option);
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

  /**
   * The tracing paper's size on the sheet: the picture's, and under it its options', if any; the
   * largest till the crop's picture is read.
   */
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
    this.#sized = sized;
    this.#picture = LARGEST;
    this.#resize();
    this.#ready = false;
    this.#release();
    if (blob === undefined) {
      this.#read = Promise.resolve({ size: LARGEST, gray: null });
      return;
    }
    if (this.#connected) this.#address();
    this.#read = readOf(blob).then((read) => {
      if (this.#blob === blob) {
        this.#picture = read.size;
        this.#resize();
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
    write(this.#group, "aria-label", labels.options);
    write(this.choices, "lang", lang);
    const shows = this.#reveal.querySelector(".label");
    if (shows !== null && shows.textContent !== labels.showOptions) {
      shows.textContent = labels.showOptions;
    }
    this.#showVerdicts();
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
    const offered = shown && this.#options.length > 0;
    if (this.choices.hidden === offered) this.choices.hidden = !offered;
    const chosen = shown && this.#chosen;
    for (const part of [this.frame, this.bar]) if (part.hidden === chosen) part.hidden = !chosen;
    if (!shown) {
      this.#showTip();
      return;
    }
    const [x, y] = this.#at;
    const width = this.#size.width * scale;
    const height = this.#size.height * scale;
    // The picture above, and the edge round it and the options under it.
    const pictured = this.#picture.height * scale;
    for (const [shape, tall] of [
      [this.#ground, height],
      [this.#image, pictured],
      [this.#edge, height],
    ] as const) {
      write(shape, "x", String(x));
      write(shape, "y", String(y));
      write(shape, "width", String(width));
      write(shape, "height", String(tall));
    }
    const { k } = view;
    const box = {
      left: (x - view.vx) * k,
      top: (y - view.vy) * k,
      width: width * k,
      height: height * k,
    };
    if (offered) this.#placeChoices(box.left, box.top + pictured * k, k * scale);
    const left = box.left + box.width / 2 - GRIP.width / 2;
    const top = box.top - GRIP.over;
    this.grip.style.transform = `translate(${left}px, ${top}px)`;
    this.tip.style.setProperty("--tip-x", `${left + GRIP.width + 8}px`);
    this.tip.style.setProperty("--tip-y", `${top + GRIP.height / 2}px`);
    for (const [part, tall] of [
      [this.cover, pictured * k],
      [this.frame, box.height],
    ] as const) {
      part.style.transform = `translate(${box.left}px, ${box.top}px)`;
      part.style.width = `${box.width}px`;
      part.style.height = `${tall}px`;
    }
    this.sign.style.transform = `translate(${box.left}px, ${box.top - SIGN.over}px)`;
    // Under the paper, but kept within the stage: a paper as tall as the window keeps its bar.
    const under = Math.min(box.top + box.height + BAR.gap, view.height - BAR.height - BAR.margin);
    this.bar.style.setProperty("--bar-x", `${box.left + box.width / 2}px`);
    this.bar.style.setProperty("--bar-y", `${Math.max(BAR.margin, under)}px`);
    // The paper's corners round with its scale, as the mockup's: 6 px at its own size, 12 at most.
    this.frame.style.setProperty("--round", `${Math.round(6 * Math.min(scale, 2))}px`);
    this.#box = { width: box.width, height: pictured * k };
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
    this.#lines.disconnect();
    this.#drawn = "";
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

  /** The paper's size: its picture's, and its options' under it, in their letters' size. */
  #resize(): void {
    const { width, height } = this.#picture;
    this.#size =
      this.#band === 0
        ? this.#picture
        : Object.freeze({ width, height: height + this.#band * fontOf(width) });
  }

  /**
   * The options as the browser laid them out at the paper's own size: how far they reach, in their
   * letters' size. A change of it changes the paper's size, which `sized` hears.
   */
  #measure(entries: readonly ResizeObserverEntry[]): void {
    const { width } = this.#picture;
    const height = entries.at(-1)?.borderBoxSize[0]?.blockSize ?? 0;
    // Out of sight, or not yet laid out at this picture's width: it keeps what it reached last.
    if (this.choices.hidden || this.#across !== width || !(height > 0)) return;
    const band = height / fontOf(width);
    if (Math.abs(band - this.#band) < 1e-3) return;
    this.#band = band;
    this.#resize();
    if (this.#ready) this.#sized();
  }

  /**
   * The options at their place on the stage, under the picture's `left` and `top`: laid out a CSS
   * pixel a unit of the paper's own size, and scaled to the screen by `by`, its pixels a unit.
   */
  #placeChoices(left: number, top: number, by: number): void {
    const { width } = this.#picture;
    if (this.#across !== width) {
      this.#across = width;
      this.choices.style.width = `${width}px`;
      this.choices.style.fontSize = `${fontOf(width)}px`;
    }
    this.choices.style.transform = `translate(${left}px, ${top}px) scale(${by})`;
  }

  /**
   * The options in place of their button: the focus, if the button had it, goes to the option Tab
   * comes to, which leaves it nowhere else as the button goes.
   */
  #openOptions(): void {
    const focused = this.#reveal.matches(":focus");
    this.#open = true;
    this.#reveal.hidden = true;
    this.#group.hidden = false;
    if (!focused) return;
    for (const button of this.#group.children) {
      if ((button as HTMLElement).tabIndex === 0) (button as HTMLElement).focus();
    }
  }

  /** Whether the option at `n` tells nothing on a press: judged, or another is correct. */
  #settled(n: number): boolean {
    return (this.#verdicts[n] ?? null) !== null || this.#verdicts.includes("correct");
  }

  /**
   * Each option as what it came to: its verdict, on the button and in its name, in the element's
   * language; and on the group whether one is correct, which fades the rest.
   */
  #showVerdicts(): void {
    const solved = this.#verdicts.includes("correct");
    write(this.#group, "data-solved", solved ? "" : null);
    const buttons = this.#group.children;
    for (let n = 0; n < buttons.length; n++) {
      const button = buttons[n] as Element;
      const verdict = this.#verdicts[n] ?? null;
      write(button, "data-verdict", verdict);
      write(button, "aria-disabled", this.#settled(n) ? "true" : null);
      const labels = this.#labels;
      const name =
        verdict === null || labels === undefined
          ? null
          : say(verdict === "correct" ? labels.optionCorrect : labels.optionNotYet, {
              option: this.#options[n] ?? "",
            });
      write(button, "aria-label", name);
    }
  }

  /** The arrow keys, Home and End move the focus among the options, choosing none. */
  #arrow(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const buttons = [...this.#group.children] as HTMLElement[];
    const at = buttons.indexOf(event.target as HTMLElement);
    if (at < 0) return;
    const to = arrowedTo(event.key, buttons.length, at, "both");
    if (to === undefined) return;
    event.preventDefault();
    buttons[to]?.focus();
  }

  /** The one option Tab comes to: the last focused, or the one chosen. */
  #stopAt(option: number): void {
    const buttons = this.#group.children;
    for (let n = 0; n < buttons.length; n++) {
      (buttons[n] as HTMLElement).tabIndex = n === option ? 0 : -1;
    }
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
   * The scale a corner's drag gives, as the mockup's: the larger of the pointer's two moves
   * outward, each over the paper's own size on the screen, added to the scale it began at; the
   * corner across stays where it was.
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
   * "Recognise" offers the reading, waits for it, and gives the photo back once the statements
   * show; statements that came show again with no new reading.
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
    const module = this.#source === "module";
    const reading = module ? undefined : this.#reading;
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
    const shows = module ? "module" : busy ? "busy" : text ? "text" : "photo";
    if (this.sign.dataset.shows !== shows) {
      this.sign.dataset.shows = shows;
      this.sign.firstElementChild?.replaceWith(signOf(shows));
    }
    if (labels === undefined) return;
    const words = busy ? labels.recognising : text ? labels.original : labels.recognise;
    const label = this.#mode.querySelector(".label");
    if (label !== null && label.textContent !== words) label.textContent = words;
    const sign = module
      ? labels.moduleShown
      : busy
        ? labels.recognising
        : text
          ? labels.readingShown
          : labels.photoShown;
    if (this.#signWords.textContent !== sign) this.#signWords.textContent = sign;
  }

  /**
   * The statements in place of the crop, a line each, "□" a dashed box and a fraction built up
   * (./notation.ts): their letters as large as the paper's height shares out among them, and
   * smaller where the longest line, or the lines with their fractions, would not fit.
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
        line.append(...lineOf(statement));
        return line;
      }),
    );
    const count = Math.max(1, statements.length);
    this.#full = Math.min(height / (count * 1.5), height * 0.55);
    this.#text.style.fontSize = `${this.#full}px`;
    this.#lines.disconnect();
    for (const line of this.#text.children) this.#lines.observe(line);
    this.#fitText();
  }

  /**
   * The statements' letters at the paper's full size, or smaller by as much as the widest line, or
   * the lines together, exceed the paper. Measured at the size they have, and only ever smaller
   * than it: a fraction does not scale with its letters — WebKit lays it out by whole pixels —, so
   * a size measured anew may want a little more again, and the observer of the lines, which calls
   * this again, would swing between two sizes for good. Smaller each time by more than a rounding,
   * it stops once they fit; `#drawText` starts again from the full size.
   */
  #fitText(): void {
    const { width, height } = this.#box;
    // The lines as laid out, not the box's scroll: centred, they spill over both its edges.
    const lines = [...this.#text.children] as HTMLElement[];
    const wide = Math.max(0, ...lines.map((line) => line.offsetWidth));
    const first = lines[0];
    const last = lines.at(-1);
    const tall =
      first === undefined || last === undefined
        ? 0
        : last.offsetTop + last.offsetHeight - first.offsetTop;
    // Not laid out: hidden, or out of the page. The observer calls again once they are.
    if (wide === 0 || tall === 0) return;
    const size = Number.parseFloat(this.#text.style.fontSize) || this.#full;
    const k = Math.min((width * 0.92) / wide, (height * 0.92) / tall);
    const fitted = Math.min(this.#full, size, size * k);
    // Within half a percent it stays: a size that moves by a rounding feeds the observer again.
    if (size - fitted > size * 0.005) this.#text.style.fontSize = `${fitted}px`;
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

/** The size of the options' letters on a paper `width` units wide, in its units. */
function fontOf(width: number): number {
  return (width * OPTIONS.font) / OPTIONS.across;
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

/**
 * The sign's mark of what the paper shows: the photo's, the reading's wait, the AI's reading, or a
 * module's text.
 */
function signOf(shows: "busy" | "text" | "photo" | "module"): Element {
  if (shows === "busy") {
    const spinner = document.createElement("span");
    spinner.className = "spinner";
    return spinner;
  }
  return iconOf(
    ROW[shows === "module" ? "module" : shows === "text" ? "recognise" : "original"].outline,
  );
}

/** An icon of the set, which says nothing to a screen reader. */
function iconOf(name: IconName): SVGSVGElement {
  const { viewBox, paths } = ICONS[name];
  const icon = document.createElementNS(SVG, "svg");
  icon.setAttribute("viewBox", viewBox);
  icon.setAttribute("aria-hidden", "true");
  for (const d of paths) {
    const path = document.createElementNS(SVG, "path");
    path.setAttribute("d", d);
    icon.append(path);
  }
  return icon;
}
