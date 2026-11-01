// The parts of a worked example's demo the learner has opened (R42): a numbered list above the
// sheet, under the statement, in the element's own scrolling, and a polite region that tells a
// screen reader of the part just opened. A part opens at the list's end, and an item, once built,
// stays as it is while the demo is the same: hidden, the list keeps its open parts out of sight. A
// paragraph is its text; a picture beside the sheet is a frame of its size, which shows what it
// shows in words, as a statement's picture without its file; a picture on an area of the sheet is
// read by its words here, while the picture itself stands on the sheet. This module is no entry
// point of the package.

import { type DemoState, type ExamplePart, onSheet } from "../core/example.js";
import { write } from "./attributes.js";
import { frameOf } from "./statement.js";

/** The number of a part the region tells of, as the labels say it, and the labels' language. */
export interface Told {
  /** The number of the part, of so many, in the labels' language: «Часть 2 из 4.». */
  readonly number: string;
  /** The language of the labels the number is in. */
  readonly lang: string;
}

/** The list of a demo's open parts and the region that tells of them, as the element shows them. */
export class Parts {
  /** The open parts, in the module's explanation language, or in the element's own without one. */
  readonly list = document.createElement("ol");
  /**
   * The polite region that tells of the part just opened: empty from the start, and hidden from
   * sight alone, for a region out of the tree of what a screen reader reads tells nothing.
   */
  readonly status = document.createElement("div");

  constructor(ids: { readonly status: string; readonly parts: string }) {
    this.list.className = "parts";
    this.list.id = ids.parts;
    this.status.className = "status";
    this.status.id = ids.status;
    this.status.setAttribute("role", "status");
  }

  /**
   * The language the parts are in, a BCP 47 tag, or `undefined` for the element's own, which the
   * list inherits. A new language changes the attribute alone.
   */
  set lang(lang: string | undefined) {
    write(this.list, "lang", lang ?? null);
  }

  /**
   * The demo as a state has it: as many parts open as it says, from the first, items added or
   * taken off at the list's end alone, and the list hidden or shown. Only what has changed is
   * written.
   */
  show(demo: readonly ExamplePart[], { opened, hidden }: DemoState): void {
    while (this.list.childElementCount > opened) this.list.lastElementChild?.remove();
    for (let n = this.list.childElementCount; n < opened; n++) {
      const part = demo[n];
      if (part !== undefined) this.list.append(itemOf(part));
    }
    if (this.list.hidden !== hidden) this.list.hidden = hidden;
  }

  /** No part open, the list shown, and nothing told: a demo begins, or goes. */
  clear(): void {
    this.list.replaceChildren();
    this.list.hidden = false;
    this.quiet();
  }

  /** The item of the `n`th part, from 1, if it is open. */
  item(n: number): HTMLElement | undefined {
    const item = this.list.children[n - 1];
    return item instanceof HTMLElement ? item : undefined;
  }

  /**
   * The region tells of a part just opened: its number, in the labels' language, and its words —
   * a paragraph's text, a picture's description — in the parts' own. A picture that only decorates
   * has its number alone.
   */
  tell(part: ExamplePart, told: Told): void {
    const number = document.createElement("span");
    number.lang = told.lang;
    number.textContent = told.number;
    const words = "text" in part ? part.text : part.alt;
    if (words === "") {
      this.status.replaceChildren(number);
      return;
    }
    const said = document.createElement("span");
    // The parts' language, which the list has, or none: then the element's own, as the list's.
    const lang = this.list.getAttribute("lang");
    if (lang !== null) said.lang = lang;
    said.textContent = words;
    this.status.replaceChildren(number, " ", said);
  }

  /** The region is empty: what it told is no more, and the same words may be told again. */
  quiet(): void {
    this.status.replaceChildren();
  }
}

/**
 * The item of an open part: a paragraph's text, a picture beside the sheet in its frame, or the
 * words of a picture on an area of the sheet, which a screen reader reads as the picture, while
 * the item stays an item of the list. One that only decorates leaves its item empty.
 */
function itemOf(part: ExamplePart): HTMLLIElement {
  const item = document.createElement("li");
  if ("text" in part) {
    // Text, never markup: a module is data (R02 spec).
    item.textContent = part.text;
  } else if (!onSheet(part)) {
    item.append(frameOf(part));
  } else if (part.alt !== "") {
    const words = document.createElement("div");
    words.setAttribute("role", "img");
    words.setAttribute("aria-label", part.alt);
    words.textContent = part.alt;
    item.append(words);
  }
  return item;
}
