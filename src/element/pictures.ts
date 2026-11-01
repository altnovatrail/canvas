// The files of the pictures an element shows, by their references (R23, R42): a task's statement's,
// and a worked example's — its statement's and its demo's, beside the sheet and on areas of it.
// One reference is one file and one call of the consumer's media, however many pictures show it,
// and a file stays while what the element shows names its reference. On the page a file has one
// address, decoded once, before any picture shows it: a picture placed then shows it at once. What
// a picture is — a frame of the statement or of the list of parts, or a picture on the sheet — is
// its own: the pictures here are told when to show the address and when it has gone. This module is
// no entry point of the package.

/**
 * What gives the file of a picture of a task or a worked example: the consumer's, for the canvas
 * goes to no network (R07; repositories 2.1 spec). app takes the files from what api serves, the
 * samples page from its own build.
 */
export type Media = (ref: string) => Promise<Blob>;

/** A picture on show, as what shows it has it. */
export interface PictureView {
  /** Its file's address came, decoded: the picture shows it. */
  show(url: string): void;
  /** The address it showed went: the picture shows what it shows in words again. */
  hide(): void;
}

/** What the element has of a reference that what it shows names. */
interface Held {
  /** The file, once it came. */
  file: Blob | undefined;
  /** The file's address, while the element is on the page. */
  url: string | undefined;
  /** The image that decodes the address, kept while the address lives. */
  image: HTMLImageElement | undefined;
  /** Whether the image has decoded it, and the pictures show it. */
  decoded: boolean;
}

/** The files of the pictures of an element, by their references, and their addresses. */
export class Pictures {
  /** The references named, in the order they were named, and what the element has of each. */
  readonly #held = new Map<string, Held>();
  /** The pictures on show, by reference: placed apart from the naming. */
  readonly #views = new Map<string, Set<PictureView>>();
  /** The loads under way, by reference: a reference named again waits for the load it began. */
  readonly #loading = new Map<string, Promise<unknown>>();
  #media: Media | undefined;
  #connected = false;

  get media(): Media | undefined {
    return this.#media;
  }

  /**
   * A new function serves the references that have no file and no load under way: those waiting
   * for one, and those whose load failed. It stops no load the last one began.
   */
  set media(media: Media | undefined) {
    this.#media = media;
    if (this.#connected) this.#load();
  }

  /**
   * The references of the pictures the element shows, or may show: a new task's statement's, or a
   * new worked example's statement's and demo's. Those no longer named go: their addresses at once,
   * so their pictures show their words, and their files; a load under way goes on, and its file
   * goes to the reference only if it is named again by then. A reference named before keeps what it
   * has. On the page, every reference without a file asks for it: one that did not come, or did
   * not decode, is asked for again with each new task or example.
   */
  name(refs: Iterable<string>): void {
    const named = new Set(refs);
    for (const [ref, held] of this.#held) {
      if (named.has(ref)) continue;
      this.#release(ref, held);
      this.#held.delete(ref);
    }
    for (const ref of named) {
      if (this.#held.has(ref)) continue;
      this.#held.set(ref, { file: undefined, url: undefined, image: undefined, decoded: false });
    }
    if (this.#connected) this.#load();
  }

  /**
   * A picture of a reference on show: it shows the file's address at once if the address is
   * decoded, and otherwise once it is. What it gives back takes the picture off, and lets no
   * address go: an address lives while its reference is named and the element is on the page.
   */
  place(ref: string, view: PictureView): () => void {
    let views = this.#views.get(ref);
    if (views === undefined) {
      views = new Set();
      this.#views.set(ref, views);
    }
    views.add(view);
    const held = this.#held.get(ref);
    if (held?.decoded === true && held.url !== undefined) view.show(held.url);
    return () => {
      const placed = this.#views.get(ref);
      placed?.delete(view);
      if (placed?.size === 0) this.#views.delete(ref);
    };
  }

  /** The element came to the page: the files it has get their addresses, and the rest load. */
  connect(): void {
    this.#connected = true;
    for (const [ref, held] of this.#held) this.#attach(ref, held);
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
      for (const [ref, held] of this.#held) this.#release(ref, held);
    });
  }

  /** Each reference without its file and without a load under way asks the consumer for it. */
  #load(): void {
    const media = this.#media;
    if (media === undefined) return;
    for (const [ref, held] of this.#held) {
      if (held.file !== undefined || this.#loading.has(ref)) continue;
      // A function that throws fails the load as one whose promise is rejected does.
      const load = Promise.resolve()
        .then(() => media(ref))
        .then((file: unknown) => {
          if (!(file instanceof Blob)) throw new TypeError(`media gave ${typeof file}, not a Blob`);
          // The file of a reference no longer named is not kept.
          const named = this.#held.get(ref);
          if (named === undefined) return;
          named.file = file;
          this.#attach(ref, named);
        })
        .catch((reason: unknown) => {
          console.warn(`the picture "${ref}" did not come: ${String(reason)}`);
        })
        .finally(() => this.#loading.delete(ref));
      this.#loading.set(ref, load);
    }
  }

  /**
   * A file gets its address, if the element is on the page and the file has none, and an image
   * decodes it: then the pictures of its reference show it.
   */
  #attach(ref: string, held: Held): void {
    if (held.file === undefined || held.url !== undefined || !this.#connected) return;
    const url = URL.createObjectURL(held.file);
    const image = new Image();
    held.url = url;
    held.image = image;
    image.src = url;
    image.decode().then(
      () => {
        // The address may have gone, or its reference, while the file was decoded.
        if (held.image !== image) return;
        held.decoded = true;
        for (const view of this.#views.get(ref) ?? []) view.show(url);
      },
      () => {
        if (held.image !== image) return;
        // A file that is no picture: it goes, and a new media function may give another.
        this.#release(ref, held);
        held.file = undefined;
        console.warn(`the picture "${ref}" is no picture a browser shows`);
      },
    );
  }

  /** A file lets its address go, and the pictures that showed it show their words again. */
  #release(ref: string, held: Held): void {
    if (held.url === undefined) return;
    URL.revokeObjectURL(held.url);
    const shown = held.decoded;
    held.url = undefined;
    held.image = undefined;
    held.decoded = false;
    if (!shown) return;
    for (const view of this.#views.get(ref) ?? []) view.hide();
  }
}
