// The flash of what a frame paints, for app's debug view: a canvas of its own over the ink, the
// size of the ink's, where each rectangle a frame paints shows red and fades. It takes no pointer,
// no reader sees it, and no export reads it: the exports draw the strokes anew.

/** A rectangle of the ink's canvas, in device pixels: left, top, width, height. */
type Pixels = readonly [number, number, number, number];

/** How long a rectangle stays, ms. */
const FADE_MS = 300;

export class Flash {
  readonly canvas = document.createElement("canvas");
  readonly #rects: { readonly at: Pixels; readonly since: number }[] = [];
  #frame = 0;

  constructor() {
    this.canvas.className = "flash";
    this.canvas.setAttribute("aria-hidden", "true");
  }

  /** A rectangle a frame painted, on an ink's canvas of this size. */
  add(at: Pixels, width: number, height: number): void {
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.#rects.push({ at, since: performance.now() });
    if (this.#frame === 0) this.#frame = requestAnimationFrame((now) => this.#paint(now));
  }

  /** The flash off at once: nothing left on its canvas, nothing more asked of the browser. */
  stop(): void {
    cancelAnimationFrame(this.#frame);
    this.#frame = 0;
    this.#rects.length = 0;
    this.canvas.width = 0;
    this.canvas.height = 0;
  }

  #paint(now: number): void {
    this.#frame = 0;
    const context = this.canvas.getContext("2d");
    if (context === null) return;
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let kept = 0;
    for (const rect of this.#rects) {
      const left = 1 - (now - rect.since) / FADE_MS;
      if (left <= 0) continue;
      this.#rects[kept++] = rect;
      const [x, y, wide, high] = rect.at;
      context.fillStyle = `rgba(255, 59, 48, ${0.25 * left})`;
      context.fillRect(x, y, wide, high);
      context.strokeStyle = `rgba(255, 59, 48, ${0.9 * left})`;
      context.lineWidth = 2;
      context.strokeRect(x + 1, y + 1, Math.max(0, wide - 2), Math.max(0, high - 2));
    }
    this.#rects.length = kept;
    if (kept > 0) this.#frame = requestAnimationFrame((next) => this.#paint(next));
  }
}
