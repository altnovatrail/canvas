// The popovers of the pen, the eraser and Select, as the mockup of the pen's settings draws them,
// in the glass of the bar: a second press of the chosen pen opens the pen's — the kind of pen, its
// width, its opacity and its colour, each kind with its own —, a second press of the chosen
// eraser the eraser's — whether it takes a stroke whole or only what it passes over, and its size
// —, and a second press of Select its shapes, the lasso and the rectangle, each with its icon.
// Each is a dialog that is no modal one, named in the element's language: its choices are toggle
// buttons in named groups, the opacity a slider, and the other colours behind a disclosure button.
// It stands to the right of the bar, level with its button and kept within the element, its arrow
// at the button, or docked along the element's bottom when the element is narrow. It pops in
// only to whom motion is no harm. Escape closes it and gives the focus back to its button; the
// focus leaving it to anywhere but its button closes it too, and so does whatever the bar or the
// element closes it for. Every target is 44 × 44 at least (WCAG 2.5.5). The popover shows no text
// on a fill seen through: its fill is the paper's, so that the contrast of its words holds over any
// ink (WCAG 1.4.3). This module is no entry point of the package.

import {
  ERASER_MODES,
  ERASER_SIZES,
  type EraserMode,
  MARKER_WIDTHS,
  OTHER_COLOURS,
  PALETTE,
  PEN_KINDS,
  PEN_SETTINGS,
  PEN_WIDTHS,
  type PenKind,
  type PenSettings,
  penSettingsOf,
  SELECT_SHAPES,
  type SelectShape,
  type StrokeStyle,
  sameStyle,
} from "../core/style.js";
import { SVG, write } from "./attributes.js";
import { ICONS, ROW } from "./icons.js";
import { type Labels, labelsFor, say } from "./labels.js";

/** The tools whose popovers these are. */
export type Opener = "pen" | "eraser" | "select";

/** The IDs in the shadow root of the hint the chosen pen and eraser are described by, and of the
 * other colours, which the colour wheel shows and hides. */
export const HINT_ID = "pens-hint";
const MORE_ID = "pens-more";
const MODE_ID = "pens-mode";
const SIZE_ID = "pens-size";
const SHAPE_ID = "pens-shape";

/** How narrow an element is, in CSS pixels, below which a popover is docked along its bottom. */
export const NARROW_PX = 600;
/** How far a popover keeps from the bar and from the element's edges, in CSS pixels. */
const GAP_PX = 14;
const EDGE_PX = 8;

/** The mockup's sample stroke of a width, on 30 × 26. */
const SAMPLE =
  "M4 20c3-8 8-12 11-12 4 0 4 6 1 9-2.6 2.6-5.2 2-4.8-0.5 0.6-3.6 6.4-6.8 9.8-5.5 2 0.8 2.5 3.8 3 9";

/** The labels of the kinds, of the palette's colours and of the others, in their orders. */
const KIND_LABELS = {
  pen: "kindPen",
  liner: "kindLiner",
  marker: "kindMarker",
} as const satisfies Record<PenKind, keyof Labels>;
const PALETTE_LABELS = ["black", "blue", "green", "yellow", "red"] as const;
const OTHER_LABELS = [
  "grey",
  "purple",
  "orange",
  "teal",
  "pink",
  "brown",
  "skyBlue",
  "lightGreen",
  "amber",
  "violet",
  "scarlet",
  "white",
] as const;
const MODE_LABELS = {
  stroke: "wholeStroke",
  part: "partly",
} as const satisfies Record<EraserMode, keyof Labels>;

/** The widths a kind offers: the marker's four times the pen's. */
export function widthsOf(kind: PenKind): readonly number[] {
  return kind === "marker" ? MARKER_WIDTHS : PEN_WIDTHS;
}

/** Whether two settings say the same, field by field. */
export function samePens(a: PenSettings, b: PenSettings): boolean {
  return (
    a === b ||
    (a.pen === b.pen &&
      a.eraser === b.eraser &&
      a.eraserSize === b.eraserSize &&
      a.select === b.select &&
      PEN_KINDS.every((kind) => sameStyle(a.styles[kind], b.styles[kind])))
  );
}

/**
 * The colour a stroke of a style is drawn in on the screen: its own, but for the palette's black,
 * which is the theme's ink, so that a dark theme keeps it in sight, and none at all in forced
 * colours, where every stroke is the ink. `ink` is the ink's colour as the theme gives it.
 */
export function screenColourOf(style: StrokeStyle | undefined, ink: string, forced: boolean) {
  if (style === undefined || forced || style.color === PALETTE[0]) return ink;
  return style.color;
}

/** The popovers' style, of the element's one sheet, in its colours unless the theme gives its own. */
export function pensStyle(ink: string, paper: string, accent: string): string {
  const INK = `var(--novatrail-canvas-ink, ${ink})`;
  const PAPER = `var(--novatrail-canvas-paper, ${paper})`;
  const ACCENT = `var(--novatrail-canvas-accent, ${accent})`;
  const SECONDARY = `color-mix(in srgb, ${INK} 62%, ${PAPER})`;
  const HAIR = `color-mix(in srgb, ${INK} 14%, transparent)`;
  return `
.tools .settings { position: relative; }
.tools .settings[aria-checked="true"]::after {
  content: ""; position: absolute; right: 7px; bottom: 7px; width: 0; height: 0;
  border-left: 4px solid transparent; border-top: 4px solid transparent;
  border-right: 4px solid currentColor; border-bottom: 4px solid currentColor;
  border-radius: 0 0 2px 0; opacity: 0.55;
}
.tools .settings.dotted::before {
  content: ""; position: absolute; right: 7px; top: 7px; width: 8px; height: 8px;
  box-sizing: border-box; border-radius: 50%; background: var(--pen-dot, ${INK});
  box-shadow: 0 0 0 1px color-mix(in srgb, ${INK} 25%, transparent); forced-color-adjust: none;
}
.pop {
  position: absolute; left: var(--pop-x, 76px); top: var(--pop-y, 0px); z-index: 3;
  box-sizing: border-box; width: 320px; border-radius: 22px; font-size: 15px; line-height: 1.35; color: ${INK}; background: ${PAPER};
  box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.1), 0 18px 50px rgba(0, 0, 0, 0.16),
    0 2px 6px rgba(0, 0, 0, 0.06);
  transform-origin: left center;
}
.pop.docked { width: var(--pop-width, auto); transform-origin: bottom center; }
.pop[hidden] { display: none; }
.pop > .arrow {
  position: absolute; left: -7px; top: var(--arrow, 50%); width: 14px; height: 14px;
  margin-top: -7px; background: ${PAPER}; transform: rotate(45deg); border-radius: 2px;
  box-shadow: -0.5px 0.5px 0 rgba(0, 0, 0, 0.08);
}
.pop.docked > .arrow { display: none; }
.pop .body {
  box-sizing: border-box; max-height: var(--pop-max, none); overflow-y: auto; padding: 14px;
  overscroll-behavior: contain; scrollbar-width: none; border-radius: inherit;
}
.pop section + section { margin-top: 14px; padding-top: 14px; border-top: 1px solid ${HAIR}; }
.pop .heading { margin: 0 0 10px; font-size: 13px; font-weight: 600; color: ${SECONDARY}; }
.pop button {
  box-sizing: border-box; min-width: 44px; min-height: 44px; margin: 0; padding: 0;
  font: inherit; color: inherit; background: transparent; border: none; cursor: pointer;
}
.pop button:focus-visible, .pop input:focus-visible {
  outline: 2px solid ${ACCENT}; outline-offset: 2px;
}
.pop .kinds { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.pop .kind {
  border-radius: 14px; padding: 6px 4px 8px; display: flex; flex-direction: column;
  align-items: center; gap: 4px; font-size: 12px; color: ${SECONDARY};
}
.pop .kind svg { display: block; width: 30px; height: 64px; forced-color-adjust: none; }
.pop .kind[aria-pressed="true"] {
  background: color-mix(in srgb, ${ACCENT} 12%, transparent); color: ${INK}; font-weight: 600;
}
.pop .widths { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }
.pop .width { height: 48px; border-radius: 12px; display: grid; place-items: center; }
.pop .width svg { display: block; width: 38px; height: 30px; overflow: visible; }
.pop .width[aria-pressed="true"] { background: ${INK}; color: ${PAPER}; }
.pop .width[aria-pressed="true"] :is(path, circle) { stroke: currentColor; stroke-opacity: 1; }
.pop .opacity { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
.pop .opacity output {
  flex: none; min-width: 44px; text-align: end; font-size: 13px; color: ${SECONDARY};
  font-variant-numeric: tabular-nums;
}
.pop input[type="range"] {
  user-select: none; -webkit-user-select: none;
  -webkit-appearance: none; appearance: none; flex: 1 1 auto; min-width: 0; height: 44px;
  margin: 0; padding: 8px 0; box-sizing: border-box; border-radius: 22px; background-clip: content-box;
  background-color: transparent;
  background-image: linear-gradient(90deg, color-mix(in srgb, ${INK} 4%, transparent),
    var(--swatch, ${INK}));
  touch-action: none; cursor: pointer;
}
.pop input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none; width: 26px; height: 26px; border-radius: 50%;
  background: #fff; border: 3px solid #fff;
  box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.2);
}
.pop input[type="range"]::-moz-range-thumb {
  width: 22px; height: 22px; border-radius: 50%; background: #fff; border: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}
.pop .swatches, .pop .more {
  display: grid; grid-template-columns: repeat(6, 44px); justify-content: space-between;
  row-gap: 4px;
}
.pop .more { margin-top: 8px; }
.pop .more[hidden] { display: none; }
.pop .swatch { position: relative; border-radius: 50%; forced-color-adjust: none; }
.pop .swatch::before {
  content: ""; position: absolute; inset: 5px; border-radius: 50%; background: var(--c, ${INK});
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);
}
.pop .swatch[aria-pressed="true"]::before {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2), 0 0 0 2px ${PAPER}, 0 0 0 4px ${ACCENT};
}
.pop .swatch.wheel::before {
  background: conic-gradient(#ff3b30, #ff9500, #ffcc00, #34c759, #00c7be, #0a84ff, #5e5ce6,
    #bf5af2, #ff2d55, #ff3b30);
}
.pop .swatch.wheel[aria-pressed="true"]::after {
  content: ""; position: absolute; inset: 14px; border-radius: 50%; background: var(--c);
  box-shadow: 0 0 0 2px ${PAPER};
}
.pop .seg {
  display: flex; padding: 2px; border-radius: 12px;
  background: color-mix(in srgb, rgb(118, 118, 128) 12%, transparent);
}
.pop .seg button { flex: 1 1 0; border-radius: 10px; padding: 0 6px; font-size: 13px; }
.pop .seg button[aria-pressed="true"] {
  background: ${PAPER}; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12); font-weight: 600;
}
.pop .seg button:focus-visible { outline-offset: -2px; }
.pop.select:not(.docked) { width: 220px; }
.pop .shapes { display: flex; flex-direction: column; gap: 2px; }
.pop .shape {
  display: flex; align-items: center; gap: 10px; padding: 0 10px; border-radius: 12px;
  text-align: start; font-size: 14px; font-weight: 600;
}
.pop .shape svg { display: block; flex: none; width: 20px; height: 20px; fill: currentColor; }
/* The shape chosen: its name in the ink, which the accent's wash would pale below 4.5:1, and its
   icon in the accent. */
.pop .shape[aria-pressed="true"] { background: color-mix(in srgb, ${ACCENT} 12%, transparent); }
.pop .shape[aria-pressed="true"] svg { fill: ${ACCENT}; }
@media (prefers-reduced-motion: no-preference) {
  .pop:not([hidden]) { animation: novatrail-pop 160ms cubic-bezier(0.2, 0.9, 0.3, 1.2); }
}
@keyframes novatrail-pop { from { opacity: 0; transform: scale(0.94); } }
@media (forced-colors: active) {
  .pop { background: Canvas; color: CanvasText; border: 1px solid CanvasText; }
  .pop > .arrow { background: Canvas; border-left: 1px solid CanvasText; border-bottom: 1px solid CanvasText; }
  .pop section + section { border-top-color: CanvasText; }
  .pop .heading, .pop .opacity output { color: CanvasText; }
  .pop button { background: ButtonFace; color: ButtonText; border: 1px solid ButtonBorder; }
  .pop .swatch { background: Canvas; border-color: transparent; }
  .pop .swatch::before { box-shadow: inset 0 0 0 1px CanvasText; }
  .pop .swatch[aria-pressed="true"]::before {
    box-shadow: inset 0 0 0 1px CanvasText, 0 0 0 2px Canvas, 0 0 0 4px Highlight;
  }
  .pop .swatch.wheel[aria-pressed="true"]::after { box-shadow: 0 0 0 2px Canvas; }
  .pop .kind[aria-pressed="true"], .pop .width[aria-pressed="true"],
  .pop .seg button[aria-pressed="true"], .pop .shape[aria-pressed="true"] {
    background: Highlight; color: HighlightText; border-color: Highlight;
  }
  .pop .width :is(path, circle) { stroke: currentColor; stroke-opacity: 1; }
  .pop .shape[aria-pressed="true"] svg { fill: currentColor; }
  .pop .seg { background: Canvas; }
  .pop button:focus-visible, .pop input:focus-visible { outline-color: Highlight; }
  .tools .settings[aria-checked="true"]::after { border-right-color: HighlightText; border-bottom-color: HighlightText; }
  .tools .settings.dotted::before { box-shadow: 0 0 0 1px ButtonText; }
}
`;
}

/** What a popover's choice asks of the element: the settings as the learner made them. */
export type PenChoice = (settings: PenSettings) => void;

/** The icons of Select's shapes, by their values on the bar. */
const SHAPE_ICONS = {
  lasso: "selectLasso",
  rectangle: "selectRectangle",
} as const satisfies Record<SelectShape, keyof typeof ROW>;

/**
 * The popovers of the pen, the eraser and Select, as the bar shows them: at most one open at a
 * time, by its tool's button, and every choice in it a change of the settings the element decides
 * on.
 */
export class Pens {
  readonly pen = dialog();
  readonly eraser = dialog();
  readonly select = dialog("select");
  /** What the chosen pen and eraser say of a second press, which a screen reader reads. */
  readonly hint = document.createElement("span");
  readonly #choose: PenChoice;
  /** The bar asks to hear when a popover opens or closes: its tooltips give way to it. */
  readonly #toggled: () => void;
  readonly #kinds = PEN_KINDS.map((kind) => kindButton(kind));
  readonly #kindGroup = group("kinds");
  readonly #widths = PEN_WIDTHS.map(() => toggle("width", sampleOf()));
  readonly #widthGroup = group("widths");
  readonly #opacity = document.createElement("input");
  readonly #opacityShown = document.createElement("output");
  readonly #swatchGroup = group("swatches");
  readonly #palette = PALETTE.map((colour) => swatch(colour));
  readonly #wheel = toggle("swatch wheel");
  readonly #more = group("more");
  readonly #others = OTHER_COLOURS.map((colour) => swatch(colour));
  readonly #modeHeading = heading(MODE_ID);
  readonly #modes = ERASER_MODES.map(() => toggle(""));
  readonly #sizeHeading = heading(SIZE_ID);
  readonly #sizes = ERASER_SIZES.map((size) => toggle("width", circleOf(size)));
  readonly #shapeHeading = heading(SHAPE_ID);
  readonly #shapes = SELECT_SHAPES.map((shape) => shapeButton(shape));
  #settings: PenSettings = PEN_SETTINGS;
  #open: Opener | undefined;
  #opener: HTMLElement | undefined;
  #lang: string | undefined;
  /**
   * Escape, heard on the document while a popover is open, wherever the focus is: on its button
   * after a press of the pointer too. The focus goes back to the button from within the popover.
   */
  readonly #escape = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || this.#open === undefined) return;
    const pop = this.#popOf(this.#open);
    const root = pop.getRootNode();
    const focused = root instanceof ShadowRoot ? root.activeElement : null;
    event.preventDefault();
    this.close(focused !== null && pop.contains(focused));
  };

  constructor(choose: PenChoice, toggled: () => void) {
    this.#choose = choose;
    this.#toggled = toggled;
    this.hint.id = HINT_ID;
    this.hint.hidden = true;
    this.#kindGroup.append(...this.#kinds);
    this.#widthGroup.append(...this.#widths);
    this.#opacity.type = "range";
    this.#opacity.min = "10";
    this.#opacity.max = "100";
    this.#opacity.step = "1";
    // The slider says its value already: the output is for the eye, and no live region.
    this.#opacityShown.setAttribute("aria-hidden", "true");
    const opacity = document.createElement("div");
    opacity.className = "opacity";
    opacity.append(this.#opacity, this.#opacityShown);
    this.#more.id = MORE_ID;
    this.#more.hidden = true;
    this.#more.append(...this.#others);
    this.#wheel.setAttribute("aria-controls", MORE_ID);
    this.#wheel.setAttribute("aria-expanded", "false");
    this.#swatchGroup.append(...this.#palette, this.#wheel);
    this.pen.append(
      body(
        section(this.#kindGroup),
        section(this.#widthGroup, opacity),
        section(this.#swatchGroup, this.#more),
      ),
    );
    const modes = document.createElement("div");
    modes.className = "seg";
    modes.setAttribute("role", "group");
    modes.setAttribute("aria-labelledby", MODE_ID);
    modes.append(...this.#modes);
    const sizes = group("widths");
    sizes.removeAttribute("aria-label");
    sizes.setAttribute("aria-labelledby", SIZE_ID);
    sizes.append(...this.#sizes);
    this.eraser.append(body(section(this.#modeHeading, modes), section(this.#sizeHeading, sizes)));
    const shapes = document.createElement("div");
    shapes.className = "shapes";
    shapes.setAttribute("role", "group");
    shapes.setAttribute("aria-labelledby", SHAPE_ID);
    shapes.append(...this.#shapes);
    this.select.append(body(section(this.#shapeHeading, shapes)));

    for (const [k, button] of this.#kinds.entries()) {
      button.addEventListener("click", () => this.#change({ pen: PEN_KINDS[k] as PenKind }));
    }
    for (const [k, button] of this.#widths.entries()) {
      button.addEventListener("click", () => {
        const width = widthsOf(this.#settings.pen)[k];
        if (width !== undefined) this.#restyle({ width });
      });
    }
    this.#opacity.addEventListener("input", () => {
      this.#restyle({ opacity: Number(this.#opacity.value) });
    });
    for (const button of [...this.#palette, ...this.#others]) {
      button.addEventListener("click", () => {
        const color = button.dataset.colour;
        if (color !== undefined) this.#restyle({ color });
      });
    }
    this.#wheel.addEventListener("click", () => {
      this.#more.hidden = !this.#more.hidden;
      write(this.#wheel, "aria-expanded", String(!this.#more.hidden));
      this.place();
    });
    for (const [k, button] of this.#modes.entries()) {
      button.addEventListener("click", () => this.#change({ eraser: ERASER_MODES[k] }));
    }
    for (const [k, button] of this.#sizes.entries()) {
      button.addEventListener("click", () => this.#change({ eraserSize: ERASER_SIZES[k] }));
    }
    for (const [k, button] of this.#shapes.entries()) {
      button.addEventListener("click", () => this.#change({ select: SELECT_SHAPES[k] }));
    }
    for (const [which, pop] of [
      ["pen", this.pen],
      ["eraser", this.eraser],
      ["select", this.select],
    ] as const) {
      // The focus gone to another of the element's controls, or out of it, takes the popover
      // with it, but not to its own button, whose press closes it, nor to nowhere: Safari takes the
      // focus off a button it presses, and the window may lose it for a while. A popover already
      // closed can still lose the focus it kept while hidden, to the other one as it opens.
      pop.addEventListener("focusout", (event) => {
        const to = event.relatedTarget;
        if (this.#open !== which) return;
        if (!(to instanceof Node) || pop.contains(to) || to === this.#opener) return;
        this.#hide();
      });
    }
    this.label(null);
    this.show(PEN_SETTINGS);
  }

  /** The tool whose popover is open, if one is. */
  get opened(): Opener | undefined {
    return this.#open;
  }

  /**
   * A tool's popover opens by its button, and the others close. From the keyboard the focus goes
   * to its first choice: the kind of pen in use, the eraser's mode, or Select's shape.
   */
  open(which: Opener, opener: HTMLElement, focus: boolean): void {
    const pop = this.#popOf(which);
    for (const other of [this.pen, this.eraser, this.select])
      if (other !== pop) other.hidden = true;
    this.#open = which;
    this.#opener = opener;
    pop.hidden = false;
    document.addEventListener("keydown", this.#escape, true);
    this.place();
    this.#toggled();
    if (!focus) return;
    const choices = which === "pen" ? this.#kinds : which === "eraser" ? this.#modes : this.#shapes;
    const first = choices.find((button) => button.getAttribute("aria-pressed") === "true");
    (first ?? choices[0])?.focus();
  }

  /** The popover open closes, the focus back on its button if asked, or if the popover held it. */
  close(refocus = false): void {
    const opener = this.#opener;
    if (this.#open === undefined) return;
    const root = this.pen.getRootNode();
    const focused = root instanceof ShadowRoot ? root.activeElement : null;
    const held =
      focused !== null && [this.pen, this.eraser, this.select].some((pop) => pop.contains(focused));
    this.#hide();
    // The focus a popover held would be lost with it: it goes back to the popover's button.
    if (refocus || held) opener?.focus();
  }

  #hide(): void {
    this.#open = undefined;
    this.#opener = undefined;
    document.removeEventListener("keydown", this.#escape, true);
    this.pen.hidden = true;
    this.eraser.hidden = true;
    this.select.hidden = true;
    this.#more.hidden = true;
    write(this.#wheel, "aria-expanded", "false");
    this.#toggled();
  }

  /** The popovers as the settings are: only what has changed is written. */
  show(settings: PenSettings): void {
    this.#settings = settings;
    const style = settings.styles[settings.pen];
    for (const [k, button] of this.#kinds.entries()) {
      const kind = PEN_KINDS[k] as PenKind;
      write(button, "aria-pressed", String(kind === settings.pen));
      for (const tint of button.querySelectorAll(".tint")) {
        write(tint, "fill", settings.styles[kind].color);
      }
    }
    const widths = widthsOf(settings.pen);
    const marker = settings.pen === "marker";
    for (const [k, button] of this.#widths.entries()) {
      const width = widths[k] ?? 0;
      write(button, "aria-pressed", String(width === style.width));
      const path = button.querySelector("path");
      if (path === null) continue;
      write(path, "stroke-width", String(Math.min(9, Math.max(1, width * 0.55))));
      write(path, "stroke", marker ? style.color : "currentColor");
      write(path, "stroke-opacity", marker ? "0.7" : "1");
    }
    const opacity = String(style.opacity);
    if (this.#opacity.value !== opacity) this.#opacity.value = opacity;
    this.#opacity.style.setProperty("--swatch", style.color);
    const inPalette = PALETTE.includes(style.color);
    for (const button of [...this.#palette, ...this.#others]) {
      write(button, "aria-pressed", String(button.dataset.colour === style.color));
    }
    write(this.#wheel, "aria-pressed", String(!inPalette));
    this.#wheel.style.setProperty("--c", style.color);
    for (const [k, button] of this.#modes.entries()) {
      write(button, "aria-pressed", String(ERASER_MODES[k] === settings.eraser));
    }
    for (const [k, button] of this.#sizes.entries()) {
      write(button, "aria-pressed", String(ERASER_SIZES[k] === settings.eraserSize));
    }
    for (const [k, button] of this.#shapes.entries()) {
      write(button, "aria-pressed", String(SELECT_SHAPES[k] === settings.select));
    }
    this.#nameOpacity();
  }

  /** The popovers' words in the language of a tag, the element's `lang`, and their `lang` theirs. */
  label(tag: string | null): void {
    const { lang, labels } = labelsFor(tag);
    if (lang === this.#lang) return;
    this.#lang = lang;
    for (const node of [this.pen, this.eraser, this.select, this.hint]) node.lang = lang;
    this.hint.textContent = labels.settingsHint;
    this.pen.setAttribute("aria-label", labels.penSettings);
    this.eraser.setAttribute("aria-label", labels.eraserSettings);
    this.select.setAttribute("aria-label", labels.selectSettings);
    this.#shapeHeading.textContent = labels.shape;
    for (const [k, button] of this.#shapes.entries()) {
      const name = button.lastElementChild;
      if (name !== null) name.textContent = labels[SELECT_SHAPES[k] as SelectShape];
    }
    for (const [k, button] of this.#kinds.entries()) {
      const name = button.lastElementChild;
      if (name !== null) name.textContent = labels[KIND_LABELS[PEN_KINDS[k] as PenKind]];
    }
    this.#kindGroup.setAttribute("aria-label", labels.penKind);
    this.#widthGroup.setAttribute("aria-label", labels.widths);
    const total = PEN_WIDTHS.length;
    for (const [k, button] of this.#widths.entries()) {
      button.setAttribute("aria-label", say(labels.widthAt, { n: k + 1, total }));
    }
    this.#opacity.setAttribute("aria-label", labels.opacity);
    this.#swatchGroup.setAttribute("aria-label", labels.colour);
    for (const [k, button] of this.#palette.entries()) {
      button.setAttribute("aria-label", labels[PALETTE_LABELS[k] as keyof Labels]);
    }
    this.#wheel.setAttribute("aria-label", labels.otherColours);
    this.#more.setAttribute("aria-label", labels.otherColours);
    for (const [k, button] of this.#others.entries()) {
      button.setAttribute("aria-label", labels[OTHER_LABELS[k] as keyof Labels]);
    }
    this.#modeHeading.textContent = labels.whatToErase;
    for (const [k, button] of this.#modes.entries()) {
      button.textContent = labels[MODE_LABELS[ERASER_MODES[k] as EraserMode]];
    }
    this.#sizeHeading.textContent = labels.size;
    for (const [k, button] of this.#sizes.entries()) {
      button.setAttribute(
        "aria-label",
        say(labels.sizeAt, { n: k + 1, total: ERASER_SIZES.length }),
      );
    }
    this.#nameOpacity(true);
    this.place();
  }

  /**
   * The popover open stands to the right of the bar, level with the middle of its button as far as
   * the element lets it, its arrow at the button; in an element narrower than `NARROW_PX`, along
   * the element's bottom, `EDGE_PX` off its sides and above the consumer's bar at its bottom. It is
   * kept within the part of the element in sight, and scrolls in itself when taller than that.
   * Read from the layout, which a page's transform may scale: the places are the rail's own.
   */
  place(): void {
    const opener = this.#opener;
    const pop = this.#popOf(this.#open);
    const rail = pop.parentElement;
    if (this.#open === undefined || opener === undefined || rail === null) return;
    const root = rail.getRootNode();
    const host = root instanceof ShadowRoot ? root.host : rail;
    const outer = rail.getBoundingClientRect();
    const scale = rail.offsetHeight > 0 ? outer.height / rail.offsetHeight : 1;
    const box = host.getBoundingClientRect();
    const below = Number.parseFloat(
      getComputedStyle(host).getPropertyValue("--novatrail-canvas-pad-bottom"),
    );
    const top = Math.max(box.top, 0) + EDGE_PX * scale;
    const bottom =
      Math.min(box.bottom, innerHeight) - ((Number.isFinite(below) ? below : 0) + EDGE_PX) * scale;
    const narrow = box.width / scale < NARROW_PX;
    pop.classList.toggle("docked", narrow);
    const set = (name: string, client: number) =>
      pop.style.setProperty(name, `${client / scale}px`);
    set("--pop-max", Math.max(0, bottom - top));
    if (narrow) set("--pop-width", box.width - 2 * EDGE_PX * scale);
    const height = pop.offsetHeight * scale;
    if (narrow) {
      set("--pop-x", box.left + EDGE_PX * scale - outer.left);
      set("--pop-y", Math.max(top, bottom - height) - outer.top);
      return;
    }
    const bar = (opener.closest(".tools") ?? opener).getBoundingClientRect();
    const button = opener.getBoundingClientRect();
    const middle = button.top + button.height / 2;
    const y = Math.max(top, Math.min(middle - height / 2, bottom - height));
    set("--pop-x", bar.right + GAP_PX * scale - outer.left);
    set("--pop-y", y - outer.top);
    // The arrow stays on the popover's side, clear of its round corners.
    const corner = 22 * scale;
    set("--arrow", Math.max(corner, Math.min(middle - y, height - corner)));
  }

  /** A tool's popover: the pen's while none is open, which shows nothing then. */
  #popOf(which: Opener | undefined): HTMLDivElement {
    return which === "eraser" ? this.eraser : which === "select" ? this.select : this.pen;
  }

  /** The opacity's value, said and shown in the labels' language. */
  #nameOpacity(anew = false): void {
    const { labels } = labelsFor(this.#lang ?? null);
    const style = this.#settings.styles[this.#settings.pen];
    const said = say(labels.percent, { percent: style.opacity });
    if (!anew && this.#opacity.getAttribute("aria-valuetext") === said) return;
    this.#opacity.setAttribute("aria-valuetext", said);
    this.#opacityShown.textContent = said;
  }

  /** A choice of the style of the kind in use. */
  #restyle(patch: Partial<StrokeStyle>): void {
    const { styles, pen } = this.#settings;
    this.#change({ styles: { ...styles, [pen]: { ...styles[pen], ...patch } } });
  }

  /** A choice: the settings with it, which the element takes and tells of, if they changed. */
  #change(patch: Partial<PenSettings>): void {
    const next = penSettingsOf({ ...this.#settings, ...patch });
    if (samePens(next, this.#settings)) return;
    this.#choose(next);
  }
}

/**
 * A popover: a dialog that is no modal one, hidden till its button opens it, with its arrow. The
 * arrow is an element of its own, not the popover's pseudo-element: axe cannot tell the background
 * of text under an ancestor's pseudo-element, and leaves its contrast undecided.
 */
function dialog(kind?: string): HTMLDivElement {
  const pop = document.createElement("div");
  pop.className = kind === undefined ? "pop" : `pop ${kind}`;
  pop.setAttribute("role", "dialog");
  pop.hidden = true;
  const arrow = document.createElement("span");
  arrow.className = "arrow";
  arrow.setAttribute("aria-hidden", "true");
  pop.append(arrow);
  return pop;
}

/** What a popover holds, which scrolls within it when the element is shorter: its arrow stays. */
function body(...children: Node[]): HTMLDivElement {
  const inside = document.createElement("div");
  inside.className = "body";
  inside.append(...children);
  return inside;
}

function section(...children: Node[]): HTMLElement {
  const part = document.createElement("section");
  part.append(...children);
  return part;
}

/** A named group of choices. */
function group(className: string): HTMLDivElement {
  const choices = document.createElement("div");
  choices.className = className;
  choices.setAttribute("role", "group");
  return choices;
}

/** A heading of a section, which names its group. */
function heading(id: string): HTMLDivElement {
  const text = document.createElement("div");
  text.className = "heading";
  text.id = id;
  return text;
}

/** A toggle button, its picture hidden from a screen reader. */
function toggle(className: string, picture?: SVGSVGElement): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  if (className !== "") button.className = className;
  button.setAttribute("aria-pressed", "false");
  if (picture !== undefined) button.append(picture);
  return button;
}

/** A shape of Select: a toggle button with its icon, hidden from a screen reader, and its name. */
function shapeButton(shape: SelectShape): HTMLButtonElement {
  const icon = document.createElementNS(SVG, "svg");
  icon.setAttribute("aria-hidden", "true");
  const { viewBox, paths } = ICONS[ROW[SHAPE_ICONS[shape]].outline];
  icon.setAttribute("viewBox", viewBox);
  for (const d of paths) {
    const path = document.createElementNS(SVG, "path");
    path.setAttribute("d", d);
    icon.append(path);
  }
  const button = toggle("shape", icon);
  const name = document.createElement("span");
  button.append(name);
  return button;
}

/** A colour's swatch, its colour its data. */
function swatch(colour: string): HTMLButtonElement {
  const button = toggle("swatch");
  button.dataset.colour = colour;
  button.style.setProperty("--c", colour);
  return button;
}

/** An SVG drawing that says nothing, of these shapes. */
function drawing(
  viewBox: string,
  shapes: readonly (readonly [string, Readonly<Record<string, string | number>>])[],
): SVGSVGElement {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("aria-hidden", "true");
  for (const [tag, attributes] of shapes) {
    const shape = document.createElementNS(SVG, tag);
    for (const [name, value] of Object.entries(attributes)) {
      shape.setAttribute(name, String(value));
    }
    svg.append(shape);
  }
  return svg;
}

/** The body of a pen, a liner or a marker, as the mockup draws it. */
const BODY = { fill: "#f2f2f4", stroke: "#d1d1d6" };

/** A kind's button: the mockup's picture of the pen, its tip in the kind's colour, and its name. */
function kindButton(kind: PenKind): HTMLButtonElement {
  const tint = { class: "tint", fill: "#000" };
  const shapes =
    kind === "marker"
      ? ([
          ["rect", { x: 8, y: 22, width: 14, height: 40, rx: 3, ...BODY }],
          ["path", { d: "M10 22l2-12h6l2 12z", fill: "#e5e5ea", stroke: BODY.stroke }],
          ["path", { d: "M12 10l1-6h4l1 6z", ...tint }],
        ] as const)
      : kind === "liner"
        ? ([
            ["rect", { x: 9, y: 22, width: 12, height: 40, rx: 5, ...BODY }],
            ["path", { d: "M9 26l6-22 6 22z", ...BODY }],
            ["rect", { x: 13.6, y: 4, width: 2.8, height: 7, rx: 1, ...tint }],
          ] as const)
        : ([
            ["rect", { x: 9, y: 22, width: 12, height: 40, rx: 5, ...BODY }],
            ["path", { d: "M9 26l6-22 6 22z", ...BODY }],
            ["path", { d: "M12.6 12.8L15 4l2.4 8.8z", ...tint }],
            ["rect", { x: 9, y: 30, width: 12, height: 4, ...tint }],
          ] as const);
  const button = toggle("kind", drawing("0 0 30 64", shapes));
  button.append(document.createElement("span"));
  return button;
}

/** A width's sample stroke, which `show` gives its width and colour. */
function sampleOf(): SVGSVGElement {
  return drawing("0 0 30 26", [
    [
      "path",
      {
        d: SAMPLE,
        fill: "none",
        stroke: "currentColor",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
    ],
  ]);
}

/** An eraser's size, a circle as large as the mockup draws it. */
function circleOf(size: number): SVGSVGElement {
  return drawing("0 0 30 26", [
    [
      "circle",
      {
        cx: 15,
        cy: 13,
        r: Math.max(2, size / 5.5),
        fill: "none",
        stroke: "currentColor",
        "stroke-width": 1.6,
      },
    ],
  ]);
}
