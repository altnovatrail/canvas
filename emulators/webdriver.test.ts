// The client of WebDriver for safaridriver (T78, T83 in RUN.md; R54 in docs/decisions.md): what
// it asks of, and how long it lets each command take.

import { expect, test } from "vitest";
import { isPath, timeoutOf } from "./webdriver.ts";

test("a path is WebDriver's own words and ids, and nothing that leads elsewhere", () => {
  expect(isPath("/session")).toBe(true);
  expect(isPath("/session/1A2B-3c/execute/sync")).toBe(true);
  expect(isPath("session")).toBe(false);
  expect(isPath("/session?x=1")).toBe(false);
  expect(isPath("/session/@host")).toBe(false);
});

test("a new session may take two minutes, a page's load one, and any other command half of one", () => {
  expect(timeoutOf("POST", "/session")).toBe(120_000);
  expect(timeoutOf("POST", "/session/abc/url")).toBe(60_000);
  expect(timeoutOf("POST", "/session/abc/execute/sync")).toBe(30_000);
  expect(timeoutOf("DELETE", "/session/abc")).toBe(30_000);
  expect(timeoutOf("GET", "/session")).toBe(30_000);
});
