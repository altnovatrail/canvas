/** The smallest and the largest zoom of the sheet: half its fit, and twice it (R73). */
export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 2;

/**
 * The step of Zoom in and Zoom out, a quarter of the fit: from any zoom a pinch left, a
 * press goes to the next quarter, so 50, 75, … 200 % are where the buttons stop.
 */
export const ZOOM_STEP = 0.25;

/** The zoom `value` kept within its bounds; anything that is not a number is the fit. */
export function clampZoom(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(value, ZOOM_MIN), ZOOM_MAX);
}

/**
 * The next quarter from `value`, larger or smaller, within the bounds. A zoom within a hair of a
 * quarter counts as that quarter, so that the arithmetic of a pinch never makes a press a no-op.
 */
export function stepZoom(value: number, larger: boolean): number {
  const quarters = value / ZOOM_STEP;
  const next = larger ? Math.floor(quarters + 1e-6) + 1 : Math.ceil(quarters - 1e-6) - 1;
  return clampZoom(next * ZOOM_STEP);
}

/**
 * The page's zoom: one for every sheet of the page, from 100 % when the page is loaded, as
 * the pen mode is. The next task is a new element, and the zoom stays: a learner who
 * needs it larger or smaller asks once. It lives in memory alone: nothing is stored or sent.
 */
export class PageZoom {
  #value = 1;
  readonly #watchers = new Set<() => void>();

  /** The zoom now: 1 for the fit, 2 for twice it, 0.5 for half. */
  get value(): number {
    return this.#value;
  }

  /** Whether there is a larger zoom to go to, for Zoom in, or a smaller one, for Zoom out. */
  get larger(): boolean {
    return this.#value < ZOOM_MAX;
  }

  get smaller(): boolean {
    return this.#value > ZOOM_MIN;
  }

  /** A step to the next quarter, larger or smaller, if there is one. */
  step(larger: boolean): boolean {
    return this.set(stepZoom(this.#value, larger));
  }

  /** The zoom set to `value` within its bounds — a pinch's —: every watcher hears of a change. */
  set(value: number): boolean {
    const next = clampZoom(value);
    if (next === this.#value) return false;
    this.#value = next;
    for (const watcher of [...this.#watchers]) watcher();
    return true;
  }

  /** `watcher` hears of every change from now on, until the function this gives is called. */
  watch(watcher: () => void): () => void {
    this.#watchers.add(watcher);
    return () => {
      this.#watchers.delete(watcher);
    };
  }
}
