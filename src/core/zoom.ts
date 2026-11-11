/**
 * The zooms of the sheet, from its fit to twice it, by quarters (T94): the learner steps through
 * them with the row's Zoom in and Zoom out, so that the workbook's printed lines, and the ink, can
 * be read at 200 % (WCAG 1.4.4, by the technique G178; R90 spec).
 */
export const ZOOMS: readonly number[] = [1, 1.25, 1.5, 1.75, 2];

/**
 * The page's zoom (T94): one for every sheet of the page, from 100 % when the page is loaded, as
 * the pen mode is (R29). The next task is a new element (R20), and the zoom stays: a learner who
 * needs it larger asks once. It lives in memory alone: nothing is stored or sent.
 */
export class PageZoom {
  #step = 0;
  readonly #watchers = new Set<() => void>();

  /** The zoom now: 1 for the fit, 2 for twice it. */
  get value(): number {
    return ZOOMS[this.#step] ?? 1;
  }

  /** Whether there is a larger zoom to step to, for Zoom in, or a smaller one, for Zoom out. */
  get larger(): boolean {
    return this.#step < ZOOMS.length - 1;
  }

  get smaller(): boolean {
    return this.#step > 0;
  }

  /** A step larger, for `larger`, or smaller, if there is one: every watcher hears of it. */
  step(larger: boolean): boolean {
    const step = this.#step + (larger ? 1 : -1);
    if (step < 0 || step >= ZOOMS.length) return false;
    this.#step = step;
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
