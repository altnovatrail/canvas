// The element's own row of buttons (R28): the tools the task allows — the pen and the eraser — and
// undo and clearing. It is a toolbar as WAI-ARIA's Authoring Practices have one: one stop of Tab,
// the arrow keys from button to button, and the tools a group of radio buttons that the arrows go
// through without choosing one. Undo and Clear with nothing to take back or to clear stay where the
// focus can reach them, marked unavailable: a last undo from the keyboard leaves the focus where it
// was. Up and Down scroll the sheet with a single pointer, and stand unavailable at the end they
// scroll to (R33). In pen mode a last button lets a finger write again (R29). The labels are in
// the element's language (labels.ts), and the row is named by the canvas kind: the sheet or the
// workbook (R36). A lesson's worked example names it too, and has no tools of writing in it: the
// learner does not write on its sheet, and Up and Down are the row's first buttons (R42). A button
// that goes gives its stop of Tab and the focus to the first button shown. This module is no entry
// point of the package.

import type { Tool } from "../core/task.js";
import { write } from "./attributes.js";
import { labelsFor } from "./labels.js";

/**
 * What the row asks of the element: a tool the learner chose — perhaps the one in use — an undo, a
 * clearing, a scroll on down the sheet, for `onward`, or back up it, and the finger to write again,
 * out of pen mode.
 */
export interface ToolActions {
  readonly choose: (tool: Tool) => void;
  readonly undo: () => void;
  readonly clear: () => void;
  readonly upOrDown: (onward: boolean) => void;
  readonly fingers: () => void;
}

/** What the row is of, and is named by: a sheet, a workbook or a worked example (R36, R42). */
export type RowKind = "sheet" | "workbook" | "example";

/**
 * What the row shows: what it is of, the tools the task allows, the one in use, whether undo and
 * clearing have anything to do, and whether the finger may be asked to write again.
 */
export interface ToolState {
  readonly kind: RowKind;
  readonly tools: readonly Tool[];
  readonly tool: Tool;
  readonly undoable: boolean;
  readonly clearable: boolean;
  readonly finger: boolean;
}

/** The row of the element's own buttons, as the element shows it. */
export class Tools {
  /** The row: a toolbar, named in the element's language. */
  readonly element = document.createElement("div");
  readonly #group = document.createElement("div");
  readonly #pen = radioButton();
  readonly #eraser = radioButton();
  readonly #undo = plainButton();
  readonly #clear = plainButton();
  /** Up and Down, a pair that a row wrapping on a narrow screen keeps together. */
  readonly #pair = document.createElement("div");
  readonly #up = plainButton();
  readonly #down = plainButton();
  readonly #finger = plainButton();
  /** The buttons in the order the arrow keys go through them: the row's own. */
  readonly #buttons: readonly HTMLButtonElement[] = [
    this.#pen,
    this.#eraser,
    this.#undo,
    this.#clear,
    this.#up,
    this.#down,
    this.#finger,
  ];
  /** The language of the labels shown. */
  #lang: string | undefined;
  /** What the row is of, named so. */
  #kind: RowKind = "sheet";
  /** Whether a button of the row has had the focus: Tab comes to the first button until one has. */
  #chosen = false;

  constructor(actions: ToolActions) {
    this.element.className = "tools";
    this.element.setAttribute("role", "toolbar");
    this.#group.className = "choice";
    this.#group.setAttribute("role", "radiogroup");
    this.#group.append(this.#pen, this.#eraser);
    this.#pair.className = "updown";
    this.#pair.append(this.#up, this.#down);
    // The finger's button comes last: coming and going, it moves no other button of the row.
    this.element.append(this.#group, this.#undo, this.#clear, this.#pair, this.#finger);
    this.#finger.hidden = true;
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
    // Up and Down ask the element anew at every press, unavailable or not: a scroll the element did
    // not hear may have left either standing as it no longer is.
    this.#up.addEventListener("click", () => actions.upOrDown(false));
    this.#down.addEventListener("click", () => actions.upOrDown(true));
    this.#finger.addEventListener("click", () => actions.fingers());
    this.element.addEventListener("keydown", (event) => this.#key(event));
    // The button that had the focus last is the one Tab comes back to.
    this.element.addEventListener("focusin", (event) => {
      const focused = this.#buttons.find((button) => button === event.target);
      if (focused === undefined) return;
      this.#chosen = true;
      this.#stopAt(focused);
    });
    this.label(null);
  }

  /**
   * The row as the sheet now is. Only what has changed is written. A worked example's row has no
   * tools of writing, no undo and no clearing, for the learner does not write on its sheet (R42).
   */
  show({ kind, tools, tool, undoable, clearable, finger }: ToolState): void {
    if (kind !== this.#kind) {
      this.#kind = kind;
      this.#name();
    }
    const writes = kind !== "example";
    this.#reveal([
      [this.#group, writes],
      [this.#pen, writes],
      [this.#eraser, writes && tools.includes("eraser")],
      [this.#undo, writes],
      [this.#clear, writes],
      [this.#finger, writes && finger],
    ]);
    write(this.#pen, "aria-checked", String(tool === "pen"));
    write(this.#eraser, "aria-checked", String(tool === "eraser"));
    write(this.#undo, "aria-disabled", undoable ? null : "true");
    write(this.#clear, "aria-disabled", clearable ? null : "true");
  }

  /**
   * Whether anything scrolls back up the sheet, for Up, and on down it, for Down: a button with
   * nowhere to go stands unavailable. Only what has changed is written.
   */
  edges(above: boolean, below: boolean): void {
    write(this.#up, "aria-disabled", above ? null : "true");
    write(this.#down, "aria-disabled", below ? null : "true");
  }

  /**
   * The labels in the language of a tag — the element's `lang` — and the row's own `lang` theirs,
   * so that a screen reader reads them in the language they are in.
   */
  label(tag: string | null): void {
    const { lang, labels } = labelsFor(tag);
    if (lang === this.#lang) return;
    this.#lang = lang;
    this.element.lang = lang;
    this.#name();
    this.#group.setAttribute("aria-label", labels.tool);
    this.#pen.textContent = labels.pen;
    this.#eraser.textContent = labels.eraser;
    this.#undo.textContent = labels.undo;
    this.#clear.textContent = labels.clear;
    this.#up.textContent = labels.up;
    this.#down.textContent = labels.down;
    this.#finger.textContent = labels.finger;
  }

  /** The row's name: the canvas kind's, in the labels' language. */
  #name(): void {
    const { labels } = labelsFor(this.#lang ?? null);
    write(this.element, "aria-label", labels[this.#kind]);
  }

  /**
   * The arrow keys move the focus to the next button or the one before, round the row, and Home
   * and End to the first and the last: nothing is chosen, and no other key is the row's.
   */
  #key(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const shown = this.#shown();
    const at = shown.indexOf(event.target as HTMLButtonElement);
    if (at < 0) return;
    let next: HTMLButtonElement | undefined;
    if (event.key === "ArrowRight") next = shown[(at + 1) % shown.length];
    else if (event.key === "ArrowLeft") next = shown[(at - 1 + shown.length) % shown.length];
    else if (event.key === "Home") next = shown[0];
    else if (event.key === "End") next = shown.at(-1);
    else return;
    event.preventDefault();
    next?.focus();
  }

  /**
   * Buttons come or go, all of them at once, and then a button that went gives its stop of Tab and
   * the focus to the first button shown: the pen on a sheet, Up on a worked example (R28, R42). Till
   * a button has had the focus, the stop is the first button shown, whichever it is now. Nothing is
   * read or written while every button stays as it is: the row is shown anew after every stroke.
   */
  #reveal(wanted: readonly (readonly [HTMLElement, boolean])[]): void {
    if (wanted.every(([element, shown]) => element.hidden !== shown)) return;
    // Read before a button hides: a hidden one loses the focus at the next update of the style.
    const focused = this.#buttons.find((button) => button.matches(":focus"));
    for (const [element, shown] of wanted) element.hidden = !shown;
    const first = this.#first();
    if (!this.#chosen || this.#buttons.some((button) => button.tabIndex === 0 && button.hidden)) {
      this.#stopAt(first);
    }
    if (focused?.hidden) first.focus();
  }

  /** The buttons the row shows, in its order. */
  #shown(): HTMLButtonElement[] {
    return this.#buttons.filter((button) => !button.hidden);
  }

  /** The first button the row shows: Up and Down are on every row (R33). */
  #first(): HTMLButtonElement {
    return this.#shown()[0] ?? this.#up;
  }

  /** The one button Tab comes to: the arrow keys reach the others. */
  #stopAt(stop: HTMLButtonElement): void {
    for (const button of this.#buttons) button.tabIndex = button === stop ? 0 : -1;
  }
}

/** A button of a tool: a radio button of the group, a button still, which the arrows leave alone. */
function radioButton(): HTMLButtonElement {
  const button = plainButton();
  button.setAttribute("role", "radio");
  button.setAttribute("aria-checked", "false");
  return button;
}

function plainButton(): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  return button;
}
