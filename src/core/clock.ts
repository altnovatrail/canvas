/**
 * The sheet's clock: milliseconds since the sheet's first event, never going back (R09, R18). The
 * page's time it is given — a pointer event's `timeStamp`, or `performance.now()` for a method the
 * consumer calls — both count from the page's time origin (DOM Standard; High Resolution Time), so
 * one clock serves the strokes, the eraser and the actions of the sheet alike (R22).
 */
export class Clock {
  #origin: number | undefined;
  #last = 0;

  /**
   * The sheet's time at a moment of the page's clock. The first moment asked about is the sheet's
   * 0, and a moment earlier than one asked about before takes that one's time.
   */
  at(time: number): number {
    this.#origin ??= time;
    const t = Math.max(time - this.#origin, this.#last);
    this.#last = t;
    return t;
  }

  /** The latest time the clock has given, or 0 before it is first asked. */
  get latest(): number {
    return this.#last;
  }
}
