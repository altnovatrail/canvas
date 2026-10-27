// The element's own row of buttons (R28): the tools the task allows — the pen and the eraser — and
// undo and clearing. It is a toolbar as WAI-ARIA's Authoring Practices have one: one stop of Tab,
// the arrow keys from button to button, and the tools a group of radio buttons that the arrows go
// through without choosing one. Undo and Clear with nothing to take back or to clear stay where the
// focus can reach them, marked unavailable: a last undo from the keyboard leaves the focus where it
// was. Up and Down scroll the sheet with a single pointer, and stand unavailable at the end they
// scroll to (R33). In pen mode a last button lets a finger write again (R29). The labels are in
// the element's language (labels.ts). This module is no entry point of the package.

import type { Tool } from "../core/task.js";
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

/**
 * What the row shows: the tools the task allows, the one in use, whether undo and clearing have
 * anything to do, and whether the finger may be asked to write again.
 */
export interface ToolState {
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
    // Tab comes to the first button, until another has had the focus.
    this.#stopAt(this.#pen);
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
      if (focused !== undefined) this.#stopAt(focused);
    });
    this.label(null);
  }

  /** The row as the sheet now is. Only what has changed is written. */
  show({ tools, tool, undoable, clearable, finger }: ToolState): void {
    this.#reveal(this.#eraser, tools.includes("eraser"));
    this.#reveal(this.#finger, finger);
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
    this.element.setAttribute("aria-label", labels.sheet);
    this.#group.setAttribute("aria-label", labels.tool);
    this.#pen.textContent = labels.pen;
    this.#eraser.textContent = labels.eraser;
    this.#undo.textContent = labels.undo;
    this.#clear.textContent = labels.clear;
    this.#up.textContent = labels.up;
    this.#down.textContent = labels.down;
    this.#finger.textContent = labels.finger;
  }

  /**
   * The arrow keys move the focus to the next button or the one before, round the row, and Home
   * and End to the first and the last: nothing is chosen, and no other key is the row's.
   */
  #key(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const shown = this.#buttons.filter((button) => !button.hidden);
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

  /** A button comes or goes, and one that goes takes its stop of Tab and the focus to the pen. */
  #reveal(button: HTMLButtonElement, shown: boolean): void {
    if (button.hidden !== shown) return;
    const focused = button.matches(":focus");
    button.hidden = !shown;
    if (shown) return;
    if (button.tabIndex === 0) this.#stopAt(this.#pen);
    if (focused) this.#pen.focus();
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

/** An attribute set to a value, or taken off for null, and written only if it changes. */
function write(element: Element, name: string, value: string | null): void {
  if (element.getAttribute(name) === value) return;
  if (value === null) element.removeAttribute(name);
  else element.setAttribute(name, value);
}
