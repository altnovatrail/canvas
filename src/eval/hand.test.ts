import { expect, test } from "vitest";
import { Hand } from "./hand.js";

test("a hand's points stand a tenth of a unit apart at the least", () => {
  expect(() => new Hand({ step: 0.04, wobble: 0, seed: 1 }).line(0, 0, 10, 0)).toThrow(RangeError);
  const hand = new Hand({ step: 1, wobble: 0, seed: 1 });
  hand.line(0, 0, 10, 0);
  expect(hand.work.strokes[0]?.points.map(({ x }) => x)).toEqual([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  ]);
});
