// What the driver of Safari on macOS works out for itself (T80 in RUN.md; R54 in
// docs/decisions.md): the AppleScript that runs a line in Safari's page, and which files are saved
// reports. The run itself is the workflow's, on a runner of macOS.

import { expect, test } from "vitest";
import { inFrontTab, reports } from "./safari.ts";

test("a line of JavaScript goes into AppleScript with its quotes and backslashes escaped", () => {
  expect(inFrontTab('document.getElementById("report").textContent')).toBe(
    'tell application "Safari" to do JavaScript "document.getElementById(\\"report\\").textContent" in current tab of front window',
  );
  expect(inFrontTab("'a\\b'")).toContain("\"'a\\\\b'\"");
});

test("the saved reports are the probe's report files, in order", () => {
  expect(
    reports(["t29-probe-csp.html", "report-t29-probe-csp.json", "report-a.json", "x.json"]),
  ).toEqual(["report-a.json", "report-t29-probe-csp.json"]);
});
