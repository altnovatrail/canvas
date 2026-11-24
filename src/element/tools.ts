// The element's own buttons: the tools the task allows — the pen and the eraser — and
// the hand, which moves the sheet, undo and clearing, on a vertical bar of glass at the left
// edge of the element, as the interface mockup draws it. It is a toolbar as WAI-ARIA's
// Authoring Practices have one: one stop of Tab, the arrow keys up and down from button to button,
// and the tools a group of radio buttons that the arrows go through without choosing one. Undo and
// Clear with nothing to take back or to clear stay where the focus can reach them, marked
// unavailable: a last undo from the keyboard leaves the focus where it was. After a line, Zoom in
// and Zoom out step the page's zoom of the sheet by quarters from half its fit to twice it, each
// unavailable at its end, as a pinch of two fingers sets it between. The sheet has no
// buttons that scroll it: the hand, two fingers or a finger in pen mode drag it, the wheel and the
// keys scroll it. The buttons of the bar show an icon alone, of the set every
// NovaTrail package of the interface draws from: each is named by its label, in the
// element's language (labels.ts), which only a screen reader reads, and shows it in a tooltip of
// its own on the pointer's hover and on the keyboard's focus, which Escape dismisses and the
// pointer can move onto (WCAG 1.4.13). The bar is named by the canvas kind's buttons: the
// sheet's or the workbook's, for the kind's own name is the scroll container's. A
// lesson's worked example has no bar: the learner does not write on its sheet, which scrolls as the
// page does. Its demo's buttons, Next, which opens the next part, and Demo, a disclosure button
// that hides the whole demo and shows it again, are actions, not tools: each shows
// its label beside its icon, a stop of Tab of its own, in a row of glass at the bottom of the
// element, and after a line the slot `actions`, where the consumer puts its own buttons — app's
// Continue —, as the mockup has one row. A task from paper's bar has one button
// more, atop the tools, after a line: "Hide the task" while its tracing paper is shown, its icon
// filled, and "Show the task" while it is hidden — the name says the state, so the button is no
// toggle button as well, which would say it twice —, and one last, after a line:
// the sheet's grid, its icon and its name the grid shown now, which a press turns to the next,
// round — dots, lines, blank, squares. A button that goes gives its stop of Tab and the focus
// to the first button shown. The chosen pen and the chosen eraser open their popovers by a second
// press, Enter or Space from the keyboard (pens.ts), which their description says, unless the
// element writes without styles; the pen shows a dot of its colour, and each of them a mark in its
// corner while chosen. A press of any other button closes the popover, and so does the choice of
// another tool; its button's tooltip gives way to it. This module is no entry point of the
// package.

import type { PaperGrid } from "@altnovatrail/spec/canvas";
import { PALETTE, type PenSettings } from "../core/style.js";
import type { Tool } from "../core/task.js";
import { SVG, write } from "./attributes.js";
import { ICONS, ROW } from "./icons.js";
import { type Labels, labelsFor } from "./labels.js";
import { HINT_ID, type Opener, Pens } from "./pens.js";

/** A value of the bar, by its button's key: what its icon shows (icons.ts). */
export type Value = keyof typeof ROW;

/**
 * What the bar asks of the element: a tool the learner chose — perhaps the one in use — an undo, a
 * clearing, a step of the zoom, larger or smaller, and on a worked example the next part of its
 * demo, or the whole demo hidden or shown.
 */
export interface ToolActions {
  readonly choose: (tool: Tool) => void;
  readonly undo: () => void;
  readonly clear: () => void;
  readonly zoom: (larger: boolean) => void;
  /** A task from paper's grid turned to the next. */
  readonly turnGrid: () => void;
  readonly next: () => void;
  readonly toggle: () => void;
  /** A task from paper's tracing paper hidden, or shown again. */
  readonly trace: () => void;
  /** The settings of the pen and the eraser as the learner made them in a popover. */
  readonly pens: (settings: PenSettings) => void;
}

/** What Next and Demo control, by their IDs in the element's shadow root. */
export interface DemoControls {
  /** The region that tells of the part Next opens. */
  readonly status: string;
  /** The list of the open parts, which Demo hides and shows. */
  readonly parts: string;
}

/**
 * What the bar is of, and is named by: a sheet, a workbook, a task from paper or a worked example.
 */
export type RowKind = "sheet" | "workbook" | "paper" | "example";

/**
 * What the bar shows: what it is of, the tools the task allows — the hand besides, always —, the
 * one in use, whether undo and clearing have anything to do, whether the zoom has a larger step
 * and a smaller one, and on a worked example whether Next has a part to open and whether the
 * demo is shown.
 */
export interface ToolState {
  readonly kind: RowKind;
  readonly tools: readonly Tool[];
  readonly tool: Tool;
  readonly undoable: boolean;
  readonly clearable: boolean;
  readonly larger: boolean;
  readonly smaller: boolean;
  readonly opens: boolean;
  readonly expanded: boolean;
  /** On a task from paper, whether its tracing paper is shown, and its sheet's grid. */
  readonly traced: boolean;
  readonly grid: PaperGrid;
  /** The settings of the pen and the eraser, and whether the strokes take them, and the popovers. */
  readonly pens: PenSettings;
  readonly styled: boolean;
}

/** The value of the grid's button, and the key of its label, by the grid shown. */
const GRID_VALUES = {
  dots: "gridDots",
  lines: "gridLines",
  blank: "gridBlank",
  squares: "gridSquares",
} as const satisfies Record<PaperGrid, Value>;

/**
 * How long a tooltip stays after the pointer leaves its button, in milliseconds: long enough for
 * the pointer to cross the bar's edge and the gap onto the tooltip, which keeps it (WCAG 1.4.13).
 */
export const TIP_GRACE_MS = 200;

/** The element's own buttons, as the element shows them. */
export class Tools {
  /**
   * What the element puts beside its scroll container: the band the bar stands in the middle of,
   * as wide as nothing, so that only the bar and its tooltip, which stand out of it, take a
   * pointer, and as the element does: a consumer's pointer-events: none stops them too.
   */
  readonly rail = document.createElement("div");
  /** The bar: a toolbar, named in the element's language. */
  readonly element = document.createElement("div");
  /** A worked example's row: Next, Demo and the consumer's buttons in the slot `actions`. */
  readonly row = document.createElement("div");
  readonly #actions = document.createElement("slot");
  readonly #beforeActions = separator();
  /** The tooltip of the button the pointer is over, or the keyboard's focus is on. */
  readonly tip = document.createElement("div");
  readonly #next = plainButton("next");
  readonly #demo = plainButton("demoShown");
  /** A task from paper's button atop the tools, and the line under it. */
  readonly #task = plainButton("task");
  readonly #afterTask = separator();
  readonly #group = document.createElement("div");
  readonly #pen = radioButton("pen");
  readonly #eraser = radioButton("eraser");
  readonly #hand = radioButton("hand");
  readonly #undo = plainButton("undo");
  readonly #clear = plainButton("clear");
  /** The page's zoom of the sheet, after a line. */
  readonly #beforeZoom = separator();
  readonly #zoomIn = plainButton("zoomIn");
  readonly #zoomOut = plainButton("zoomOut");
  /** A task from paper's grid, after a line. */
  readonly #beforeGrid = separator();
  readonly #grid = plainButton("gridDots");
  /** The popovers of the pen and of the eraser, beside the bar. */
  readonly pens: Pens;
  /**
   * The buttons with the keys of their labels, the row's and then the bar's in the order the arrow
   * keys go through them. A button is named only by its label, so each is here with its key.
   */
  readonly #labelled: readonly (readonly [HTMLButtonElement, keyof Labels])[] = [
    [this.#next, "next"],
    [this.#demo, "demo"],
    [this.#task, "hideTask"],
    [this.#pen, "pen"],
    [this.#eraser, "eraser"],
    [this.#hand, "hand"],
    [this.#undo, "undo"],
    [this.#clear, "clear"],
    [this.#zoomIn, "zoomIn"],
    [this.#zoomOut, "zoomOut"],
    [this.#grid, "gridDots"],
  ];
  /**
   * The bar's buttons in the order the arrow keys go through them: each shows an icon alone, and a
   * tooltip. Next and Demo show their labels.
   */
  readonly #buttons: readonly HTMLButtonElement[] = this.#labelled
    .map(([button]) => button)
    .filter((button) => button !== this.#next && button !== this.#demo);
  /** The language of the labels shown. */
  #lang: string | undefined;
  /** What the bar is of, named so. */
  #kind: RowKind = "sheet";
  /** Whether a task from paper's tracing paper is shown: the button atop the tools says which. */
  #traced = true;
  /** A task from paper's grid: its button's icon and name say which. */
  #gridShown: PaperGrid = "dots";
  /** The tool in use, whether the bar is one to write with, and with the popovers. */
  #tool: Tool = "pen";
  #writes = true;
  #styled = true;
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
    this.#group.append(this.#pen, this.#eraser, this.#hand);
    this.element.append(
      this.#task,
      this.#afterTask,
      this.#group,
      this.#undo,
      this.#clear,
      this.#beforeZoom,
      this.#zoomIn,
      this.#zoomOut,
      this.#beforeGrid,
      this.#grid,
    );
    this.pens = new Pens(actions.pens, () => this.#showTip());
    this.rail.append(
      this.element,
      this.row,
      this.tip,
      this.pens.pen,
      this.pens.eraser,
      this.pens.hint,
    );
    for (const button of this.#buttons) button.classList.add("icon");
    // A worked example's row and a task from paper's buttons come with what they are for.
    for (const hidden of [
      this.row,
      this.#next,
      this.#demo,
      this.#task,
      this.#afterTask,
      this.#beforeGrid,
      this.#grid,
    ]) {
      hidden.hidden = true;
    }
    // Tab comes to the first button shown, until another has had the focus.
    this.#stopAt(this.#first());
    // The element decides whether a choice is a change: the tool in use, chosen again, is none,
    // but for the pen's and the eraser's popovers. A click from the keyboard has no detail.
    const press = (tool: Opener, button: HTMLButtonElement, event: MouseEvent): void => {
      if (this.#tool !== tool || !this.#styled || !this.#writes) {
        actions.choose(tool);
        return;
      }
      if (this.pens.opened === tool) this.pens.close();
      else this.pens.open(tool, button, event.detail === 0);
    };
    this.#pen.addEventListener("click", (event) => press("pen", this.#pen, event));
    this.#eraser.addEventListener("click", (event) => press("eraser", this.#eraser, event));
    this.#hand.addEventListener("click", () => actions.choose("hand"));
    // A press of any other button of the bar closes a popover.
    this.element.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("button") : null;
      if (button !== this.#pen && button !== this.#eraser) this.pens.close();
    });
    const doing = (button: HTMLButtonElement, act: () => void): void => {
      // aria-disabled stops no click: the button does nothing while it stands unavailable.
      button.addEventListener("click", () => {
        if (button.getAttribute("aria-disabled") !== "true") act();
      });
    };
    doing(this.#undo, actions.undo);
    doing(this.#clear, actions.clear);
    doing(this.#zoomIn, () => actions.zoom(true));
    doing(this.#zoomOut, () => actions.zoom(false));
    doing(this.#next, actions.next);
    this.#demo.addEventListener("click", () => actions.toggle());
    this.#grid.addEventListener("click", () => actions.turnGrid());
    this.#task.addEventListener("click", () => actions.trace());
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
    // A tooltip and a popover stand by their button as the bar scrolls under it.
    this.element.addEventListener("scroll", () => {
      this.#placeTip();
      this.pens.place();
    });
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
   * The bar as the sheet now is. Only what has changed is written. A worked example has no bar, for
   * the learner does not write on its sheet, and its row has Next, unavailable while the demo is
   * hidden or open whole, and Demo, expanded while the demo is shown. The tool in use shows its
   * icon filled, and Demo's icon points down while the demo is shown, and along the row while it is
   * hidden. A task from paper's button atop the tools says what it does to the tracing paper,
   * and fills its icon while the paper is shown, and its grid's button shows the grid.
   */
  show(state: ToolState): void {
    const {
      kind,
      tools,
      tool,
      undoable,
      clearable,
      larger,
      smaller,
      opens,
      expanded,
      traced,
      grid,
      pens,
      styled,
    } = state;
    if (kind !== this.#kind) {
      this.#kind = kind;
      this.#name();
    }
    const writes = kind !== "example";
    this.rail.classList.toggle("example", !writes);
    this.#reveal([
      [this.element, writes],
      [this.row, !writes],
      [this.#next, !writes],
      [this.#demo, !writes],
      [this.#task, kind === "paper"],
      [this.#afterTask, kind === "paper"],
      [this.#group, writes],
      [this.#pen, writes],
      [this.#eraser, writes && tools.includes("eraser")],
      [this.#hand, writes],
      [this.#undo, writes],
      [this.#clear, writes],
      [this.#beforeZoom, writes],
      [this.#zoomIn, writes],
      [this.#zoomOut, writes],
      [this.#beforeGrid, kind === "paper"],
      [this.#grid, kind === "paper"],
    ]);
    write(this.#pen, "aria-checked", String(tool === "pen"));
    write(this.#eraser, "aria-checked", String(tool === "eraser"));
    write(this.#hand, "aria-checked", String(tool === "hand"));
    write(this.#undo, "aria-disabled", undoable ? null : "true");
    write(this.#clear, "aria-disabled", clearable ? null : "true");
    write(this.#zoomIn, "aria-disabled", larger ? null : "true");
    write(this.#zoomOut, "aria-disabled", smaller ? null : "true");
    write(this.#next, "aria-disabled", opens ? null : "true");
    write(this.#demo, "aria-expanded", String(expanded));
    draw(this.#pen, "pen", tool === "pen");
    draw(this.#eraser, "eraser", tool === "eraser");
    draw(this.#hand, "hand", tool === "hand");
    draw(this.#grid, GRID_VALUES[grid], false);
    if (grid !== this.#gridShown) {
      this.#gridShown = grid;
      this.#nameGrid();
    }
    this.#settings(tool, writes, styled, pens);
    draw(this.#demo, expanded ? "demoShown" : "demoHidden", false);
    draw(this.#task, "task", traced);
    if (traced !== this.#traced) {
      this.#traced = traced;
      this.#nameTask();
    }
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
    this.#nameTask();
    this.#nameGrid();
    this.pens.label(tag);
    this.#tipFor = undefined;
    this.#showTip();
  }

  /**
   * The chosen pen and eraser as the settings are: described by the hint of a second press, marked
   * in the corner, and the pen's dot of its colour, while the strokes take a style. A popover of a
   * tool no longer in use, or of a bar without styles, closes.
   */
  #settings(tool: Tool, writes: boolean, styled: boolean, pens: PenSettings): void {
    this.#tool = tool;
    this.#writes = writes;
    this.#styled = styled;
    const opens = writes && styled;
    for (const [button, value] of [
      [this.#pen, "pen"],
      [this.#eraser, "eraser"],
    ] as const) {
      button.classList.toggle("settings", opens);
      write(button, "aria-describedby", opens && tool === value ? HINT_ID : null);
    }
    this.#pen.classList.toggle("dotted", opens);
    const { color } = pens.styles[pens.pen];
    // The palette's black is the theme's ink, as the sheet draws it.
    if (color === PALETTE[0]) this.#pen.style.removeProperty("--pen-dot");
    else this.#pen.style.setProperty("--pen-dot", color);
    this.pens.show(pens);
    if (!opens || (this.pens.opened !== undefined && this.pens.opened !== tool)) this.pens.close();
  }

  /** The element left the page: a tooltip goes with it, and Escape is no longer heard. */
  disconnect(): void {
    this.pens.close();
    clearTimeout(this.#grace);
    this.#hovered = undefined;
    this.#focused = undefined;
    this.#onTip = false;
    this.#showTip();
  }

  /**
   * The name of a task from paper's button atop the tools, by the tracing paper's state, and its
   * tooltip's, should it show.
   */
  #nameTask(): void {
    const { labels } = labelsFor(this.#lang ?? null);
    const label = this.#task.lastElementChild;
    const name = this.#traced ? labels.hideTask : labels.showTask;
    if (label === null || label.textContent === name) return;
    label.textContent = name;
    if (this.#tipFor === this.#task) this.tip.textContent = name;
  }

  /** The name of a task from paper's grid button, by the grid shown, and its tooltip's. */
  #nameGrid(): void {
    const { labels } = labelsFor(this.#lang ?? null);
    const label = this.#grid.lastElementChild;
    const name = labels[GRID_VALUES[this.#gridShown]];
    if (label === null || label.textContent === name) return;
    label.textContent = name;
    if (this.#tipFor === this.#grid) this.tip.textContent = name;
  }

  /** The bar's name: the canvas kind's buttons, in the labels' language; an example has none. */
  #name(): void {
    const { labels } = labelsFor(this.#lang ?? null);
    const kind = this.#kind;
    write(this.element, "aria-label", kind === "example" ? null : labels[`${kind}Buttons`]);
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
    // A button the pointer was over may have gone with no pointerleave: the focus's has its
    // tooltip.
    // An open popover stands where the tooltip would.
    const wanted =
      this.pens?.opened === undefined
        ? [this.#hovered, this.#focused].find((button) => button && !button.hidden)
        : undefined;
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
   * the focus to the first button shown: the pen on a sheet, or a task from paper's button. Till
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

  /** The first button the bar shows: the pen is on every bar a learner writes on. */
  #first(): HTMLButtonElement {
    return this.#shown()[0] ?? this.#pen;
  }

  /** The one button Tab comes to: the arrow keys reach the others. */
  #stopAt(stop: HTMLButtonElement): void {
    for (const button of this.#buttons) button.tabIndex = button === stop ? 0 : -1;
  }
}

/**
 * Glass that scrolls inside itself — the bar down, a worked example's row across — brings what has
 * the focus wholly into its view, within its padding, as the first button and the last stand at its
 * ends (WCAG 2.4.11): Firefox's focus() leaves one in sight in part where it is, and so do all
 * three engines in a row. The glass alone scrolls, not what scrolls the element.
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
 * label, which names it: on the bar, only a screen reader reads it.
 */
export function plainButton(value: Value): HTMLButtonElement {
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
 * says so by its class, which the style turns.
 */
export function draw(button: HTMLButtonElement, value: Value, filled: boolean): void {
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
