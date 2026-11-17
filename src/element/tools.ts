// The element's own buttons (R28, R84): the tools the task allows — the pen and the eraser — undo
// and clearing, the page's zoom and, in pen mode, the finger's button, on a vertical bar of glass at
// the left edge of the element, as the interface mockup draws it (R148 spec). It is a toolbar as
// WAI-ARIA's Authoring Practices have one: one stop of Tab, the arrow keys up and down from button
// to button, and the tools a group of radio buttons that the arrows go through without choosing
// one. Undo and Clear with nothing to take back or to clear stay where the focus can reach them,
// marked unavailable: a last undo from the keyboard leaves the focus where it was. Zoom in and Zoom
// out step the page's zoom of the sheet, from its fit to twice it, each unavailable at its end
// (T94). In pen mode a last button lets a finger write again (R29). The sheet has no buttons that
// scroll it: a hand drags it, the wheel and the keys scroll it (R84; the second 2026-11-14
// amendment to R90 spec).
// The buttons of the bar show an icon alone, of the set every NovaTrail package of the interface
// draws from (R46; R78 spec): each is named by its label, in the element's language (labels.ts),
// which only a screen reader reads, and shows it in a tooltip of its own on the pointer's hover and
// on the keyboard's focus, which Escape dismisses and the pointer can move onto (the 2026-11-14
// amendment to R90 spec; WCAG 1.4.13). The bar is named by the canvas kind's buttons: the sheet's
// or the workbook's (R36), for the kind's own name is the scroll container's (T93). A lesson's
// worked example names it too, and has no tools of writing: the learner does not write on its
// sheet, and its bar holds the zoom's pair alone. Its demo's buttons, Next, which opens the next
// part, and Demo, a disclosure button that hides the whole demo and shows it again, are actions,
// not tools (R42; R90 spec): each shows its label beside its icon, a stop of Tab of its own, in a
// row of glass at the bottom of the element, and after a line the slot `actions`, where the
// consumer puts its own buttons — app's Continue —, as the mockup has one row (R84; the
// 2026-11-17 amendment to R36 spec). A button that goes gives its stop of Tab and the focus to
// the first button shown. This module is no entry point of the package.

import type { Tool } from "../core/task.js";
import { SVG, write } from "./attributes.js";
import { ICONS, ROW } from "./icons.js";
import { type Labels, labelsFor } from "./labels.js";

/** A value of the bar, by its button's key: what its icon shows (icons.ts). */
type Value = keyof typeof ROW;

/**
 * What the bar asks of the element: a tool the learner chose — perhaps the one in use — an undo, a
 * clearing, a step of the zoom, larger or smaller, the finger to write again, out of pen mode, and
 * on a worked example the next part of its demo, or the whole demo hidden or shown (R42).
 */
export interface ToolActions {
  readonly choose: (tool: Tool) => void;
  readonly undo: () => void;
  readonly clear: () => void;
  readonly zoom: (larger: boolean) => void;
  readonly fingers: () => void;
  readonly next: () => void;
  readonly toggle: () => void;
}

/** What Next and Demo control, by their IDs in the element's shadow root (R42). */
export interface DemoControls {
  /** The region that tells of the part Next opens. */
  readonly status: string;
  /** The list of the open parts, which Demo hides and shows. */
  readonly parts: string;
}

/** What the bar is of, and is named by: a sheet, a workbook or a worked example (R36, R42). */
export type RowKind = "sheet" | "workbook" | "example";

/**
 * What the bar shows: what it is of, the tools the task allows, the one in use, whether undo and
 * clearing have anything to do, whether the zoom has a larger step and a smaller one, whether the
 * finger may be asked to write again, and on a worked example whether Next has a part to open and
 * whether the demo is shown (R42).
 */
export interface ToolState {
  readonly kind: RowKind;
  readonly tools: readonly Tool[];
  readonly tool: Tool;
  readonly undoable: boolean;
  readonly clearable: boolean;
  readonly larger: boolean;
  readonly smaller: boolean;
  readonly finger: boolean;
  readonly opens: boolean;
  readonly expanded: boolean;
}

/**
 * How long a tooltip stays after the pointer leaves its button, in milliseconds: long enough for
 * the pointer to cross the bar's edge and the gap onto the tooltip, which keeps it (WCAG 1.4.13).
 */
export const TIP_GRACE_MS = 200;

/** The element's own buttons, as the element shows them. */
export class Tools {
  /**
   * What the element puts beside its scroll container: the band the bar stands in the middle of,
   * as wide as nothing, so that only the bar and its tooltip, which stand out of it, take a pointer,
   * and as the element does: a consumer's pointer-events: none stops them too (R20, R28).
   */
  readonly rail = document.createElement("div");
  /** The bar: a toolbar, named in the element's language. */
  readonly element = document.createElement("div");
  /** A worked example's row: Next, Demo and the consumer's buttons in the slot `actions` (R84). */
  readonly row = document.createElement("div");
  readonly #actions = document.createElement("slot");
  readonly #beforeActions = separator();
  /** The tooltip of the button the pointer is over, or the keyboard's focus is on. */
  readonly tip = document.createElement("div");
  readonly #next = plainButton("next");
  readonly #demo = plainButton("demoShown");
  readonly #group = document.createElement("div");
  readonly #pen = radioButton("pen");
  readonly #eraser = radioButton("eraser");
  readonly #undo = plainButton("undo");
  readonly #clear = plainButton("clear");
  /** The lines between the bar's groups: before the zoom's pair, and before the finger's button. */
  readonly #beforeZoom = separator();
  readonly #beforeFinger = separator();
  readonly #zoomPair = document.createElement("div");
  readonly #zoomIn = plainButton("zoomIn");
  readonly #zoomOut = plainButton("zoomOut");
  readonly #finger = plainButton("finger");
  /**
   * The buttons with the keys of their labels, the row's and then the bar's in the order the arrow
   * keys go through them. A button is named only by its label (R46), so each is here with its key.
   */
  readonly #labelled: readonly (readonly [HTMLButtonElement, keyof Labels])[] = [
    [this.#next, "next"],
    [this.#demo, "demo"],
    [this.#pen, "pen"],
    [this.#eraser, "eraser"],
    [this.#undo, "undo"],
    [this.#clear, "clear"],
    [this.#zoomIn, "zoomIn"],
    [this.#zoomOut, "zoomOut"],
    [this.#finger, "finger"],
  ];
  /**
   * The bar's buttons in the order the arrow keys go through them: each shows an icon alone, and a
   * tooltip. Next and Demo show their labels (R90 spec).
   */
  readonly #buttons: readonly HTMLButtonElement[] = this.#labelled
    .map(([button]) => button)
    .filter((button) => button !== this.#next && button !== this.#demo);
  /** The language of the labels shown. */
  #lang: string | undefined;
  /** What the bar is of, named so. */
  #kind: RowKind = "sheet";
  /** Whether a button of the bar has had the focus: Tab comes to the first button until one has. */
  #chosen = false;
  /** The button the pointer is over, the one the keyboard's focus is on, and the tooltip's. */
  #hovered: HTMLButtonElement | undefined;
  #focused: HTMLButtonElement | undefined;
  #tipFor: HTMLButtonElement | undefined;
  /** Whether the pointer is over the tooltip, which keeps it. */
  #onTip = false;
  /** The tooltip Escape dismissed: it comes again only for another button, or anew. */
  #dismissed: HTMLButtonElement | undefined;
  #grace: ReturnType<typeof setTimeout> | undefined;
  /** Escape, heard on the document while a tooltip shows, wherever the focus is. */
  readonly #escape = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || this.#tipFor === undefined) return;
    this.#dismissed = this.#tipFor;
    this.#showTip();
  };

  constructor(actions: ToolActions, controls: DemoControls) {
    this.rail.className = "rail";
    this.element.className = "tools";
    this.element.setAttribute("role", "toolbar");
    this.element.setAttribute("aria-orientation", "vertical");
    // Glass that scrolls inside itself is no stop of Tab of its own, as Firefox makes it, and a
    // press on the glass between buttons, which would focus it then, takes the focus nowhere.
    for (const glass of [this.element, this.row]) {
      glass.tabIndex = -1;
      glass.addEventListener("mousedown", (event) => {
        const { target } = event;
        if (target === glass || (target instanceof HTMLElement && target.className === "line")) {
          event.preventDefault();
        }
      });
    }
    this.tip.className = "tip";
    // The tooltip says what the button's name says already: a screen reader reads that alone.
    this.tip.setAttribute("aria-hidden", "true");
    this.tip.hidden = true;
    this.row.className = "tools row";
    // Next and Demo control what they do not hold: the region that tells of a part, and the list.
    this.#next.setAttribute("aria-controls", controls.status);
    this.#demo.setAttribute("aria-controls", controls.parts);
    this.#demo.setAttribute("aria-expanded", "true");
    this.#actions.name = "actions";
    // The line stands between the element's buttons and the consumer's only while there are any.
    this.#beforeActions.hidden = true;
    this.#actions.addEventListener("slotchange", () => {
      this.#beforeActions.hidden = this.#actions.assignedNodes({ flatten: true }).length === 0;
    });
    this.row.append(this.#next, this.#demo, this.#beforeActions, this.#actions);
    this.#group.className = "choice";
    this.#group.setAttribute("role", "radiogroup");
    this.#group.append(this.#pen, this.#eraser);
    this.#zoomPair.className = "zoom";
    this.#zoomPair.append(this.#zoomIn, this.#zoomOut);
    // The finger's button comes last: coming and going, it moves no other button of the bar.
    this.element.append(
      this.#group,
      this.#undo,
      this.#clear,
      this.#beforeZoom,
      this.#zoomPair,
      this.#beforeFinger,
      this.#finger,
    );
    this.rail.append(this.element, this.row, this.tip);
    for (const button of this.#buttons) button.classList.add("icon");
    // A worked example's row and the finger's button come with what they are for.
    for (const hidden of [this.row, this.#next, this.#demo, this.#beforeFinger, this.#finger]) {
      hidden.hidden = true;
    }
    // Tab comes to the first button shown, until another has had the focus.
    this.#stopAt(this.#first());
    // The element decides whether a choice is a change: the tool in use, chosen again, is none.
    this.#pen.addEventListener("click", () => actions.choose("pen"));
    this.#eraser.addEventListener("click", () => actions.choose("eraser"));
    const doing = (button: HTMLButtonElement, act: () => void): void => {
      // aria-disabled stops no click: the button does nothing while it stands unavailable.
      button.addEventListener("click", () => {
        if (button.getAttribute("aria-disabled") !== "true") act();
      });
    };
    doing(this.#undo, actions.undo);
    doing(this.#clear, actions.clear);
    doing(this.#next, actions.next);
    doing(this.#zoomIn, () => actions.zoom(true));
    doing(this.#zoomOut, () => actions.zoom(false));
    this.#demo.addEventListener("click", () => actions.toggle());
    this.#finger.addEventListener("click", () => actions.fingers());
    this.element.addEventListener("keydown", (event) => this.#key(event));
    // The button that had the focus last is the one Tab comes back to.
    this.element.addEventListener("focusin", (event) => {
      const focused = this.#buttons.find((button) => button === event.target);
      if (focused === undefined) return;
      this.#chosen = true;
      this.#stopAt(focused);
      // The keyboard's focus shows the tooltip; a press of the pointer, which focuses too, not.
      this.#focused = focused.matches(":focus-visible") ? focused : undefined;
      this.#showTip();
    });
    // Next, Demo or the consumer's button, reached by Tab in a row narrower than its buttons.
    this.row.addEventListener("focusin", (event) => {
      if (event.target instanceof Element) bringIn(this.row, event.target);
    });
    // A tooltip stands by its button as the bar scrolls under it.
    this.element.addEventListener("scroll", () => this.#placeTip());
    this.element.addEventListener("focusout", () => {
      this.#focused = undefined;
      this.#showTip();
    });
    for (const button of this.#buttons) this.#hover(button);
    this.tip.addEventListener("pointerenter", () => {
      this.#onTip = true;
      this.#showTip();
    });
    this.tip.addEventListener("pointerleave", () => {
      this.#onTip = false;
      this.#leave();
    });
    this.label(null);
  }

  /**
   * The bar as the sheet now is. Only what has changed is written. A worked example's has no tools
   * of writing, no undo and no clearing, for the learner does not write on its sheet, and its row
   * has Next, unavailable while the demo is hidden or open whole, and Demo, expanded while the demo
   * is shown (R42). Zoom in and Zoom out stand unavailable at their ends (T94). The tool in use
   * shows its icon filled, and Demo's icon points down while the demo is shown, and along the row
   * while it is hidden (R46).
   */
  show(state: ToolState): void {
    const { kind, tools, tool, undoable, clearable, larger, smaller, finger, opens, expanded } =
      state;
    if (kind !== this.#kind) {
      this.#kind = kind;
      this.#name();
    }
    const writes = kind !== "example";
    this.rail.classList.toggle("example", !writes);
    this.#reveal([
      [this.row, !writes],
      [this.#next, !writes],
      [this.#demo, !writes],
      [this.#group, writes],
      [this.#pen, writes],
      [this.#eraser, writes && tools.includes("eraser")],
      [this.#undo, writes],
      [this.#clear, writes],
      [this.#beforeZoom, writes],
      [this.#beforeFinger, writes && finger],
      [this.#finger, writes && finger],
    ]);
    write(this.#pen, "aria-checked", String(tool === "pen"));
    write(this.#eraser, "aria-checked", String(tool === "eraser"));
    write(this.#undo, "aria-disabled", undoable ? null : "true");
    write(this.#clear, "aria-disabled", clearable ? null : "true");
    write(this.#next, "aria-disabled", opens ? null : "true");
    write(this.#zoomIn, "aria-disabled", larger ? null : "true");
    write(this.#zoomOut, "aria-disabled", smaller ? null : "true");
    write(this.#demo, "aria-expanded", String(expanded));
    draw(this.#pen, "pen", tool === "pen");
    draw(this.#eraser, "eraser", tool === "eraser");
    draw(this.#demo, expanded ? "demoShown" : "demoHidden", false);
  }

  /**
   * The labels in the language of a tag — the element's `lang` — and the bar's own `lang` theirs,
   * so that a screen reader reads them in the language they are in, and the tooltip too.
   */
  label(tag: string | null): void {
    const { lang, labels } = labelsFor(tag);
    if (lang === this.#lang) return;
    this.#lang = lang;
    this.element.lang = lang;
    this.row.lang = lang;
    this.tip.lang = lang;
    this.#name();
    this.#group.setAttribute("aria-label", labels.tool);
    for (const [button, key] of this.#labelled) {
      const label = button.lastElementChild;
      if (label !== null) label.textContent = labels[key];
    }
    this.#tipFor = undefined;
    this.#showTip();
  }

  /** The element left the page: a tooltip goes with it, and Escape is no longer heard. */
  disconnect(): void {
    clearTimeout(this.#grace);
    this.#hovered = undefined;
    this.#focused = undefined;
    this.#onTip = false;
    this.#showTip();
  }

  /** The bar's name: the canvas kind's buttons, in the labels' language. */
  #name(): void {
    const { labels } = labelsFor(this.#lang ?? null);
    write(this.element, "aria-label", labels[`${this.#kind}Buttons`]);
  }

  /**
   * A button's tooltip on the hover of a pointer that hovers — a mouse, a pen above the screen —,
   * not on a touch, which has no hover and would leave a tooltip standing over the sheet.
   */
  #hover(button: HTMLButtonElement): void {
    button.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") return;
      clearTimeout(this.#grace);
      this.#hovered = button;
      this.#showTip();
    });
    button.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "touch" || this.#hovered !== button) return;
      this.#leave();
    });
  }

  /** The pointer left a button or the tooltip: the tooltip goes, unless it comes back in time. */
  #leave(): void {
    clearTimeout(this.#grace);
    this.#grace = setTimeout(() => {
      if (this.#onTip) return;
      this.#hovered = undefined;
      this.#showTip();
    }, TIP_GRACE_MS);
  }

  /**
   * The tooltip of the button the pointer is over, or else of the one the keyboard's focus is on,
   * beside it at the bar's edge, unless Escape dismissed it: only what has changed is written.
   */
  #showTip(): void {
    // A button the pointer was over may have gone with no pointerleave: the focus's has its tooltip.
    const wanted = [this.#hovered, this.#focused].find((button) => button && !button.hidden);
    if (this.#dismissed !== undefined && this.#dismissed !== wanted) this.#dismissed = undefined;
    const button = wanted !== this.#dismissed ? wanted : undefined;
    if (button === this.#tipFor && this.tip.hidden === (button === undefined)) return;
    this.#tipFor = button;
    if (button === undefined) {
      this.tip.hidden = true;
      document.removeEventListener("keydown", this.#escape, true);
      return;
    }
    this.tip.textContent = button.lastElementChild?.textContent ?? "";
    this.#placeTip();
    this.tip.hidden = false;
    document.addEventListener("keydown", this.#escape, true);
  }

  /**
   * The tooltip stands beside its button, 8 pixels off the bar's edge and level with its middle,
   * read from the bar, which may scroll.
   */
  #placeTip(): void {
    const button = this.#tipFor;
    if (button === undefined) return;
    const rail = this.rail.getBoundingClientRect();
    const bar = this.element.getBoundingClientRect();
    const box = button.getBoundingClientRect();
    const scale = this.rail.offsetHeight > 0 ? rail.height / this.rail.offsetHeight : 1;
    const x = bar.right + 8 * scale;
    const y = box.top + box.height / 2;
    this.tip.style.setProperty("--tip-x", `${(x - rail.left) / scale}px`);
    this.tip.style.setProperty("--tip-y", `${(y - rail.top) / scale}px`);
  }

  /**
   * The arrow keys move the focus to the next button or the one before, round the bar, down and up,
   * and Home and End to the first and the last: nothing is chosen, and no other key is the bar's.
   */
  #key(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const shown = this.#shown();
    const at = shown.indexOf(event.target as HTMLButtonElement);
    if (at < 0) return;
    let next: HTMLButtonElement | undefined;
    if (event.key === "ArrowDown") next = shown[(at + 1) % shown.length];
    else if (event.key === "ArrowUp") next = shown[(at - 1 + shown.length) % shown.length];
    else if (event.key === "Home") next = shown[0];
    else if (event.key === "End") next = shown.at(-1);
    else return;
    event.preventDefault();
    if (next === undefined) return;
    next.focus();
    bringIn(this.element, next);
    this.#placeTip();
  }

  /**
   * Buttons come or go, all of them at once, and then a button that went gives its stop of Tab and
   * the focus to the first button shown: the pen on a sheet, Zoom in on a worked example (R28). Till
   * a button has had the focus, the stop is the first button shown, whichever it is now. Nothing is
   * read or written while every button stays as it is: the bar is shown anew after every stroke.
   */
  #reveal(wanted: readonly (readonly [HTMLElement, boolean])[]): void {
    if (wanted.every(([element, shown]) => element.hidden !== shown)) return;
    // Read before a button hides: a hidden one loses the focus at the next update of the style.
    const focused = this.#labelled.find(([button]) => button.matches(":focus"))?.[0];
    for (const [element, shown] of wanted) element.hidden = !shown;
    if (this.#hovered?.hidden) this.#hovered = undefined;
    const first = this.#first();
    if (!this.#chosen || this.#buttons.some((button) => button.tabIndex === 0 && button.hidden)) {
      this.#stopAt(first);
    }
    if (focused?.hidden) first.focus();
    // A tooltip of a button that went goes with it, and one of a button that stays moves with it.
    this.#tipFor = undefined;
    this.#showTip();
  }

  /** The buttons the bar shows, in its order. */
  #shown(): HTMLButtonElement[] {
    return this.#buttons.filter((button) => !button.hidden);
  }

  /** The first button the bar shows: Zoom in and Zoom out are on every bar (T94). */
  #first(): HTMLButtonElement {
    return this.#shown()[0] ?? this.#zoomIn;
  }

  /** The one button Tab comes to: the arrow keys reach the others. */
  #stopAt(stop: HTMLButtonElement): void {
    for (const button of this.#buttons) button.tabIndex = button === stop ? 0 : -1;
  }
}

/**
 * Glass that scrolls inside itself — the bar down, a worked example's row across — brings what has
 * the focus wholly into its view, within its padding, as the first button and the last stand at its
 * ends (2.4.11): Firefox's focus() leaves one in sight in part where it is, and so do all three
 * engines in a row. The glass alone scrolls, not what scrolls the element.
 */
function bringIn(glass: HTMLElement, item: Element): void {
  const outer = glass.getBoundingClientRect();
  const style = getComputedStyle(glass);
  const top = outer.top + Number.parseFloat(style.paddingTop);
  const bottom = outer.bottom - Number.parseFloat(style.paddingBottom);
  const left = outer.left + Number.parseFloat(style.paddingLeft);
  const right = outer.right - Number.parseFloat(style.paddingRight);
  const box = item.getBoundingClientRect();
  if (box.bottom > bottom) glass.scrollTop += box.bottom - bottom;
  else if (box.top < top) glass.scrollTop -= top - box.top;
  if (box.right > right) glass.scrollLeft += box.right - right;
  else if (box.left < left) glass.scrollLeft -= left - box.left;
}

/** A line between two groups of the bar, which says nothing to a screen reader. */
function separator(): HTMLDivElement {
  const line = document.createElement("div");
  line.className = "line";
  line.setAttribute("aria-hidden", "true");
  return line;
}

/** A button of a tool: a radio button of the group, a button still, which the arrows leave alone. */
function radioButton(value: Value): HTMLButtonElement {
  const button = plainButton(value);
  button.setAttribute("role", "radio");
  button.setAttribute("aria-checked", "false");
  return button;
}

/**
 * A button: its icon, an SVG that says nothing — no title, hidden from a screen reader — and its
 * label, which names it (R46; R78 spec): on the bar, only a screen reader reads it (R84).
 */
function plainButton(value: Value): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  const icon = document.createElementNS(SVG, "svg");
  icon.setAttribute("aria-hidden", "true");
  // The size of a letter, should the element's style not come; the style sets the one shown.
  icon.setAttribute("width", "1em");
  icon.setAttribute("height", "1em");
  const label = document.createElement("span");
  label.className = "label";
  button.append(icon, label);
  draw(button, value, false);
  return button;
}

/**
 * A value's icon on its button, filled or in outline, written only when it is another than the one
 * there: the icon's name stays on the SVG, as data. One mirrored in a row that runs right to left
 * says so by its class, which the style turns (R46).
 */
function draw(button: HTMLButtonElement, value: Value, filled: boolean): void {
  const icon = button.firstElementChild;
  if (!(icon instanceof SVGSVGElement)) return;
  const { outline, filled: full, mirrored } = ROW[value];
  const name = filled ? full : outline;
  if (icon.dataset.icon === name) return;
  const { viewBox, paths } = ICONS[name];
  icon.dataset.icon = name;
  icon.setAttribute("viewBox", viewBox);
  icon.classList.toggle("mirrored", mirrored);
  icon.replaceChildren(
    ...paths.map((d) => {
      const path = document.createElementNS(SVG, "path");
      path.setAttribute("d", d);
      return path;
    }),
  );
}
