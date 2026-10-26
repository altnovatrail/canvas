/**
 * The sheet's clock: milliseconds of the sheet, never going back (R09, R18). The page's time it is
 * given — a pointer event's `timeStamp`, or `performance.now()` for a method the consumer calls —
 * both count from the page's time origin (DOM Standard; High Resolution Time), so one clock serves
 * the strokes, the eraser and the actions of the sheet alike (R22). A new sheet's time starts at
 * its first event; a sheet given a history of writing goes on from where that history leaves off
 * (R27): the sheet's time is its history's.
 */
export class Clock {
  #origin: number | undefined;
  /** The sheet's time at the origin: 0, or where a history given to the sheet goes on. */
  #base = 0;
  #last = 0;

  /**
   * The sheet's time at a moment of the page's clock. The first moment asked about is the sheet's
   * 0, or the time the clock resumed at, and a moment earlier than one asked about before takes
   * that one's time.
   */
  at(time: number): number {
    this.#origin ??= time;
    const t = Math.max(this.#base + (time - this.#origin), this.#last);
    this.#last = t;
    return t;
  }

  /** The latest time the clock has given, or the one it resumed at, or 0 before it is first asked. */
  get latest(): number {
    return this.#last;
  }

  /**
   * The clock goes on at `t`: the next moment asked about is the sheet's `t`, whatever the page's
   * time, and the clock counts on from there (R27). It may go back, when the sheet takes a history
   * shorter than the one it had; `resume(0)` makes it a new sheet's clock.
   */
  resume(t: number): void {
    this.#origin = undefined;
    this.#base = t;
    this.#last = t;
  }
}
