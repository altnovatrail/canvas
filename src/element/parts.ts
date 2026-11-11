// The parts of a worked example's demo the learner has opened (R42): a numbered list above the
// sheet, under the statement, in the element's own scrolling, and a polite region that tells a
// screen reader of the part just opened. A part opens at the list's end, and an item, once built,
// stays as it is while the demo is the same: hidden, the list keeps its open parts out of sight. A
// paragraph is its text; a picture beside the sheet is a frame of its size, as a statement's
// picture is, which shows the picture once the element's pictures have its file and what it shows
// in words till then. A picture on an area of the sheet is read by its words here, while the
// picture itself stands on the layer of the author's demo, stretched over its area, the later part
// over the earlier, and nothing stands there till its file is decoded (T61). A box of a workbook
// the demo fills is read as the box and its value, which the element writes in the box itself
// (T85). This module is no entry point of the package.

import {
  type AreaPicture,
  type DemoState,
  type ExamplePart,
  type FillPart,
  isFill,
  onSheet,
} from "../core/example.js";
import { SHEET } from "../core/sheet.js";
import type { Zone } from "../core/task.js";
import { placeOver, SVG, write } from "./attributes.js";
import { labelsFor, say } from "./labels.js";
import type { Pictures } from "./pictures.js";
import { framed } from "./statement.js";

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
  /**
   * The pictures on areas of the sheet, for the layer of the author's demo: in sheet units, as the
   * layer's view box counts, in the demo's order, so that a later part is drawn over an earlier.
   */
  readonly layer = document.createElementNS(SVG, "g");
  /**
   * Where the sheet scrolls to for a picture on an area just opened: a box of the area in the
   * sheet's own flow, not on its sticky stage, whose pictures move only at the next frame. It is
   * hidden, so it paints nothing and takes no pointer, but it has a box to scroll into sight.
   */
  readonly spot = document.createElement("div");
  readonly #pictures: Pictures;
  /** What takes the picture of an item off, once the item leaves the list. */
  readonly #off = new WeakMap<Element, () => void>();
  /** The area of the sheet of an item whose picture stands there. */
  readonly #areas = new WeakMap<Element, Zone>();

  /** The open items of parts that fill a box, which a new language words anew. */
  readonly #fills = new Map<HTMLLIElement, FillPart>();
  /**
   * What a part that fills a box says, and in what language: the box, in the labels' language, and
   * its value. The element sets it with each example and as its language changes; `words` says the
   * open items again in the new one.
   */
  #fillWords: (part: FillPart) => Told = ({ fill }) => {
    const { lang, labels } = labelsFor(null);
    return { number: say(labels.boxIn, { line: fill.line, slot: fill.box }), lang };
  };

  /** What a part that fills a box says from now on, the items already open too. */
  set fillWords(words: (part: FillPart) => Told) {
    this.#fillWords = words;
    for (const [item, part] of this.#fills) this.#sayFill(item, part);
  }

  /** The list and the region, by their IDs, whose pictures the element's pictures give files. */
  constructor(ids: { readonly status: string; readonly parts: string }, pictures: Pictures) {
    this.#pictures = pictures;
    this.list.className = "parts";
    this.list.id = ids.parts;
    this.status.className = "status";
    this.status.id = ids.status;
    this.status.setAttribute("role", "status");
    this.spot.className = "spot";
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
   * written: hidden, the parts keep their pictures.
   */
  show(demo: readonly ExamplePart[], { opened, hidden }: DemoState): void {
    let last = this.list.lastElementChild;
    while (last !== null && this.list.childElementCount > opened) {
      this.#takeOff(last);
      last.remove();
      last = this.list.lastElementChild;
    }
    for (let n = this.list.childElementCount; n < opened; n++) {
      const part = demo[n];
      if (part !== undefined) this.list.append(this.#itemOf(part));
    }
    if (this.list.hidden !== hidden) this.list.hidden = hidden;
    // An SVG element has no hidden attribute: the presentation attribute hides it.
    write(this.layer, "display", hidden ? "none" : null);
  }

  /** No part open, the list shown, and nothing told: a demo begins, or goes. */
  clear(): void {
    for (const item of [...this.list.children]) this.#takeOff(item);
    this.list.replaceChildren();
    this.list.hidden = false;
    write(this.layer, "display", null);
    this.spot.removeAttribute("style");
    this.quiet();
  }

  /**
   * What the `n`th part, from 1, comes into sight by once it is open (R42): its item, or for a
   * picture on an area of the sheet the spot, which it places on that area, in shares of the sheet,
   * which keeps its proportions.
   */
  target(n: number): HTMLElement | undefined {
    const item = this.list.children[n - 1];
    const area = item === undefined ? undefined : this.#areas.get(item);
    if (area !== undefined) {
      const { left, top, width, height } = area;
      const share = (value: number, of: number) => `${(100 * value) / of}%`;
      Object.assign(this.spot.style, {
        left: share(left, SHEET.width),
        top: share(top, SHEET.height),
        width: share(width, SHEET.width),
        height: share(height, SHEET.height),
      });
      return this.spot;
    }
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
    const said = document.createElement("span");
    if (isFill(part)) {
      // A box and its value, in the labels' language, as its item says them.
      const { number: words, lang } = this.#fillWords(part);
      said.lang = lang;
      said.textContent = words;
      this.status.replaceChildren(number, " ", said);
      return;
    }
    const words = "text" in part ? part.text : part.alt;
    if (words === "") {
      this.status.replaceChildren(number);
      return;
    }
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

  /** An item of a part that fills a box says the box and its value, in the labels' language. */
  #sayFill(item: HTMLLIElement, part: FillPart): void {
    const { number, lang } = this.#fillWords(part);
    item.lang = lang;
    item.textContent = number;
  }

  /** An item leaving the list takes its picture off, once, and is no fill's any more. */
  #takeOff(item: Element): void {
    this.#off.get(item)?.();
    this.#off.delete(item);
    if (item instanceof HTMLLIElement) this.#fills.delete(item);
  }

  /**
   * The item of an open part: a paragraph's text, a picture beside the sheet in its frame, or the
   * words of a picture on an area of the sheet, which a screen reader reads as the picture, while
   * the item stays an item of the list, and the picture itself on the sheet. One that only
   * decorates leaves its item empty, and on the sheet it stands all the same.
   */
  #itemOf(part: ExamplePart): HTMLLIElement {
    const item = document.createElement("li");
    if (isFill(part)) {
      this.#fills.set(item, part);
      this.#sayFill(item, part);
    } else if ("text" in part) {
      // Text, never markup: a module is data (R02 spec).
      item.textContent = part.text;
    } else if (!onSheet(part)) {
      const { frame, off } = framed(this.#pictures, part);
      this.#off.set(item, off);
      item.append(frame);
    } else {
      this.#off.set(item, this.#onTheSheet(part));
      this.#areas.set(item, part.area);
      if (part.alt !== "") {
        const words = document.createElement("div");
        words.setAttribute("role", "img");
        words.setAttribute("aria-label", part.alt);
        words.textContent = part.alt;
        item.append(words);
      }
    }
    return item;
  }

  /**
   * A picture on its area of the sheet, at the end of the layer, stretched over the area: its
   * corners at the area's (README of the format, §21; SVG 2). It shows its file's address once the
   * element's pictures have it decoded, and nothing till then: its words are in its item. What it
   * gives back takes the picture off the sheet.
   */
  #onTheSheet(part: AreaPicture): () => void {
    const image = document.createElementNS(SVG, "image");
    placeOver(image, part.area);
    image.setAttribute("preserveAspectRatio", "none");
    this.layer.append(image);
    const off = this.#pictures.place(part.picture, {
      show: (url) => image.setAttribute("href", url),
      hide: () => image.removeAttribute("href"),
    });
    return () => {
      off();
      image.remove();
    };
  }
}
