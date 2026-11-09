// Waiting for a sign within a time (T83 in RUN.md; R54 in docs/decisions.md), on a clock of the
// test's own: a wait lasts its seconds, however long each try takes.

import { expect, test } from "vitest";
import { type Clock, until } from "./wait.ts";

/** A clock that moves only when the test or a pause moves it. */
function clock(): Clock & { at: number } {
  const own = {
    at: 0,
    now: () => own.at,
    pause: async (ms: number) => {
      own.at += ms;
    },
  };
  return own;
}

test("a slow probe is tried as long as the seconds last, not as many times as there are seconds", async () => {
  const time = clock();
  let tries = 0;
  const value = await until(
    5,
    () => {
      tries += 1;
      time.at += 3000;
      return undefined;
    },
    1000,
    time,
  );
  expect(value).toBeUndefined();
  // Three seconds a try and a second between: 0–3, 4–7, and none after the fifth second.
  expect(tries).toBe(2);
  expect(time.at).toBeLessThanOrEqual(8000);
});

test("a value comes back at once, false and undefined are no value", async () => {
  const time = clock();
  const answers = [undefined, false, "found"];
  const value = await until(10, () => answers.shift(), 1000, time);
  expect(value).toBe("found");
  expect(time.at).toBe(2000);
});

test("the probe is tried once at least, even with no time to wait", async () => {
  const time = clock();
  let tries = 0;
  const value = await until(
    0,
    () => {
      tries += 1;
      return undefined;
    },
    1000,
    time,
  );
  expect(value).toBeUndefined();
  expect(tries).toBe(1);
});

test("the last pause is cut to the time left, and the probe looks once more at its end", async () => {
  const time = clock();
  const at: number[] = [];
  await until(
    2.5,
    () => {
      at.push(time.at);
      return undefined;
    },
    1000,
    time,
  );
  expect(at).toEqual([0, 1000, 2000, 2500]);
});

test("a probe that answers by a promise is awaited", async () => {
  const value = await until(1, async () => 42, 1000, clock());
  expect(value).toBe(42);
});
