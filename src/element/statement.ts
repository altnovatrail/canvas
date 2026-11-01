// The statement of a task, above the sheet, in the element's own scrolling (R23): its paragraphs
// as text and its pictures from the consumer's media, which the element's pictures load (R42).
// Each picture keeps a frame of its own size, so that nothing moves under the pen when it comes,
// and the frame shows what the picture shows in words until it comes, or if it never does. This
// module is no entry point of the package.

import type { PicturePart, StatementPart } from "../core/task.js";
import type { Pictures } from "./pictures.js";

/** The statement of a task above the sheet, as the element shows it. */
export class Statement {
  /**
   * The statement's element: the paragraphs and the pictures, in the module's explanation language,
   * or in the element's own without a manifest (R32).
   */
  readonly element = document.createElement("div");
  readonly #pictures: Pictures;
  /** What takes the statement's pictures off, once another statement takes its place. */
  #off: readonly (() => void)[] = [];

  /** A statement whose pictures the element's pictures give their files. */
  constructor(pictures: Pictures) {
    this.#pictures = pictures;
    this.element.className = "statement";
  }

  /**
   * The language the statement is in, a BCP 47 tag, or `undefined` for the element's own, which
   * the statement inherits. A new language changes the attribute alone: the paragraphs and the
   * pictures stay as they are.
   */
  set lang(lang: string | undefined) {
    if (lang === undefined) this.element.removeAttribute("lang");
    else this.element.lang = lang;
  }

  /**
   * The statement of a task, in place of the last, whose pictures are taken off. A picture whose
   * file has come shows it at once: the element names the new statement's pictures first.
   */
  show(statement: readonly StatementPart[]): void {
    for (const off of this.#off) off();
    const off: (() => void)[] = [];
    const parts = statement.map((part) => {
      if ("text" in part) {
        const paragraph = document.createElement("p");
        // Text, never markup: a module is data (R02 spec).
        paragraph.textContent = part.text;
        return paragraph;
      }
      const picture = framed(this.#pictures, part);
      off.push(picture.off);
      return picture.frame;
    });
    this.element.replaceChildren(...parts);
    this.#off = off;
  }
}

/** A picture beside the sheet in its frame, and what takes it off when the frame leaves. */
export interface Framed {
  readonly frame: HTMLElement;
  readonly off: () => void;
}

/**
 * A picture beside the sheet in a frame of its size, placed with the element's pictures: a
 * statement's, and a worked example's in its list of parts (R42). The frame shows the picture once
 * its file has come and is decoded, and what it shows in words till then, or if it never does.
 */
export function framed(pictures: Pictures, part: PicturePart): Framed {
  const frame = document.createElement("div");
  frame.className = "picture";
  frame.style.width = `${part.width}px`;
  frame.style.aspectRatio = `${part.width} / ${part.height}`;
  fillFrame(frame, part);
  /** The address the frame is to show, until it goes. */
  let shown: string | undefined;
  const off = pictures.place(part.picture, {
    show(url) {
      shown = url;
      const image = document.createElement("img");
      image.alt = part.alt;
      image.src = url;
      const swap = () => {
        frame.removeAttribute("role");
        frame.removeAttribute("aria-label");
        frame.classList.add("shown");
        frame.replaceChildren(image);
      };
      // A browser that keeps the decoded address at hand has the picture whole at once, as
      // Chromium does; another decodes it again, and the frame shows its words till then (T64).
      if (image.complete && image.naturalWidth > 0) {
        swap();
        return;
      }
      image.decode().then(
        () => {
          if (shown === url) swap();
        },
        // The address went while it was decoded: the frame keeps its words.
        () => undefined,
      );
    },
    hide() {
      shown = undefined;
      fillFrame(frame, part);
    },
  });
  return { frame, off };
}

/**
 * A frame without its picture shows what the picture shows in words, and is read as the picture.
 * One that only decorates shows nothing and is not read.
 */
function fillFrame(frame: HTMLElement, part: PicturePart): void {
  frame.classList.remove("shown");
  if (part.alt === "") {
    frame.classList.add("decorative");
    frame.removeAttribute("role");
    frame.removeAttribute("aria-label");
    frame.replaceChildren();
    return;
  }
  frame.setAttribute("role", "img");
  frame.setAttribute("aria-label", part.alt);
  frame.textContent = part.alt;
}
