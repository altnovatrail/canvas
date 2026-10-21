import { expect, test } from "vitest";
import { SHEET } from "./index.js";

test("the sheet is 1000 × 1400 logical units, and nothing changes it", () => {
  expect(SHEET).toEqual({ width: 1000, height: 1400 });
  expect(Object.isFrozen(SHEET)).toBe(true);
});
