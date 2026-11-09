// Waiting for a sign within a time, for the drivers of the emulators (T83 in RUN.md; R54 in
// docs/decisions.md). A wait counted in tries lasts as long as its tries take: a try of
// uiautomator's dump takes two or three seconds, and "five seconds" of them took fifteen. A wait
// here lasts the seconds it is given, however long each try takes, so a device that does not show
// the sign fails the pass in the time the step allows, and the run's second pass comes sooner.

import { setTimeout as sleep } from "node:timers/promises";

/** The clock and the pause a wait runs on: the real ones, or a test's own. */
export interface Clock {
  /** Milliseconds, as Date.now gives them. */
  readonly now: () => number;
  /** A pause of milliseconds. */
  readonly pause: (ms: number) => Promise<unknown>;
}

/** The real clock and pause. */
export const REAL: Clock = { now: Date.now, pause: sleep };

/** Try the probe until it gives a value — anything but undefined or false — or the seconds are
 * over; the value, or undefined when none came. The probe is tried once at least, and once more as
 * the time runs out, so a wait of a few seconds still looks. Between tries it pauses every
 * millisecond, a second unless said. */
export async function until<T>(
  seconds: number,
  probe: () => Promise<T | undefined | false> | T | undefined | false,
  every = 1000,
  clock: Clock = REAL,
): Promise<T | undefined> {
  const end = clock.now() + seconds * 1000;
  for (;;) {
    const value = await probe();
    if (value !== undefined && value !== false) return value;
    const left = end - clock.now();
    if (left <= 0) return undefined;
    await clock.pause(Math.min(every, left));
  }
}
