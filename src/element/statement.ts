// The statement of a task, above the sheet, in the element's own scrolling (R23): its paragraphs
// as text and its pictures from the consumer's media. Each picture keeps a frame of its own size,
// so that nothing moves under the pen when it comes, and the frame shows what the picture shows in
// words until it comes, or if it never does. This module is no entry point of the package.

import type { PicturePart, Template } from "../core/task.js";

/**
 * What gives the file of a picture of a task: the consumer's, for the canvas goes to no network
 * (R07; repositories 2.1 spec). app takes the files from what api serves, the samples page from
 * its own build.
 */
export type Media = (ref: string) => Promise<Blob>;

/** A picture of the statement on show, and what it has of its file. */
interface Picture {
  readonly part: PicturePart;
  readonly frame: HTMLElement;
  /** The file's address while the picture shows it, in a tree on the page. */
  url: string | undefined;
}

/** The statement of a task above the sheet, as the element shows it. */
export class Statement {
  /** The statement's element: the paragraphs and the pictures, in the task's language. */
  readonly element = document.createElement("div");
  #pictures: readonly Picture[] = [];
  /**
   * The files that came, by reference, of the pictures the statement shows: kept while they are in
   * it, for the element may leave the page and come back. A reference names one file while its
   * picture stays: a new task with the same picture keeps it, and a new media function gives only
   * the files of the pictures without one.
   */
  readonly #files = new Map<string, Blob>();
  /** The loads under way, by reference: a picture shown again waits for the load it began. */
  readonly #loading = new Map<string, Promise<unknown>>();
  #media: Media | undefined;
  #connected = false;

  constructor() {
    this.element.className = "statement";
  }

  get media(): Media | undefined {
    return this.#media;
  }

  /**
   * A new function serves the pictures that have no file and no load under way: those waiting for
   * one, and those whose load failed. It stops no load the last one began.
   */
  set media(media: Media | undefined) {
    this.#media = media;
    if (this.#connected) this.#load();
  }

  /**
   * The statement of a template, in place of the last. The last one's pictures leave: their
   * addresses go, and their files too, unless the new statement shows the same picture.
   */
  show(template: Template): void {
    for (const picture of this.#pictures) revoke(picture);
    const pictures: Picture[] = [];
    const parts = template.statement.map((part) => {
      if ("text" in part) {
        const paragraph = document.createElement("p");
        // Text, never markup: a module is data (R02 spec).
        paragraph.textContent = part.text;
        return paragraph;
      }
      const picture: Picture = { part, frame: frameOf(part), url: undefined };
      pictures.push(picture);
      return picture.frame;
    });
    this.element.replaceChildren(...parts);
    if (template.lang === undefined) this.element.removeAttribute("lang");
    else this.element.lang = template.lang;
    this.#pictures = pictures;
    for (const ref of this.#files.keys()) {
      if (!this.#shows(ref)) this.#files.delete(ref);
    }
    if (this.#connected) {
      for (const picture of pictures) this.#attach(picture);
      this.#load();
    }
  }

  /** The element came to the page: its pictures show the files they have, and the rest load. */
  connect(): void {
    this.#connected = true;
    for (const picture of this.#pictures) this.#attach(picture);
    this.#load();
  }

  /**
   * The element left the page. The addresses of its files go, unless it comes back at once, as an
   * element moved in the page does; the files stay with it, for it may come back later.
   */
  disconnect(): void {
    this.#connected = false;
    queueMicrotask(() => {
      if (this.#connected) return;
      for (const picture of this.#pictures) this.#release(picture);
    });
  }

  /** Each picture without its file and without a load under way asks the consumer for it. */
  #load(): void {
    const media = this.#media;
    if (media === undefined) return;
    for (const { part } of this.#pictures) {
      const ref = part.picture;
      if (this.#files.has(ref) || this.#loading.has(ref)) continue;
      // A function that throws fails the load as one whose promise is rejected does.
      const load = Promise.resolve()
        .then(() => media(ref))
        .then((file: unknown) => {
          if (!(file instanceof Blob)) throw new TypeError(`media gave ${typeof file}, not a Blob`);
          // The file of a picture that has left the statement meanwhile is not kept.
          if (!this.#shows(ref)) return;
          this.#files.set(ref, file);
          for (const picture of this.#pictures) {
            if (picture.part.picture === ref) this.#attach(picture);
          }
        })
        .catch((reason: unknown) => {
          console.warn(`the picture "${ref}" of the statement did not come: ${String(reason)}`);
        })
        .finally(() => this.#loading.delete(ref));
      this.#loading.set(ref, load);
    }
  }

  /** A picture shows its file, if it has one and the element is on the page, once it is decoded. */
  #attach(picture: Picture): void {
    const file = this.#files.get(picture.part.picture);
    if (file === undefined || picture.url !== undefined || !this.#connected) return;
    const url = URL.createObjectURL(file);
    picture.url = url;
    const image = document.createElement("img");
    image.alt = picture.part.alt;
    image.src = url;
    image.decode().then(
      () => {
        // The picture may have left, or lost its address, while its file was decoded.
        if (picture.url !== url) return;
        picture.frame.removeAttribute("role");
        picture.frame.removeAttribute("aria-label");
        picture.frame.classList.add("shown");
        picture.frame.replaceChildren(image);
      },
      () => {
        if (picture.url !== url) return;
        // A file that is no picture: it goes, and a new media function may give another.
        this.#release(picture);
        this.#files.delete(picture.part.picture);
        console.warn(
          `the picture "${picture.part.picture}" of the statement is no picture a browser shows`,
        );
      },
    );
  }

  /** A picture on show lets its file's address go and shows what it shows in words again. */
  #release(picture: Picture): void {
    if (picture.url === undefined) return;
    revoke(picture);
    fillFrame(picture.frame, picture.part);
  }

  /** Whether the statement shows a picture of this reference. */
  #shows(ref: string): boolean {
    return this.#pictures.some((picture) => picture.part.picture === ref);
  }
}

/** A picture lets its file's address go. */
function revoke(picture: Picture): void {
  if (picture.url === undefined) return;
  URL.revokeObjectURL(picture.url);
  picture.url = undefined;
}

/** The frame of a picture, at the picture's size: narrower when the statement is. */
function frameOf(part: PicturePart): HTMLElement {
  const frame = document.createElement("div");
  frame.className = "picture";
  frame.style.width = `${part.width}px`;
  frame.style.aspectRatio = `${part.width} / ${part.height}`;
  fillFrame(frame, part);
  return frame;
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
