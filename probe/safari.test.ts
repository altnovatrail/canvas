// What the driver of Safari on macOS works out for itself (T80 in RUN.md; R54 in
// docs/decisions.md): the file:// address of a download, and which files are saved reports. The
// run itself is the workflow's, on a runner of macOS.

import { expect, test } from "vitest";
import { fileAddress, reports } from "./safari.ts";

test("a downloaded file opens by its file:// address, its name encoded", () => {
  expect(fileAddress("/Users/runner/Downloads", "t29-probe-csp.html")).toBe(
    "file:///Users/runner/Downloads/t29-probe-csp.html",
  );
  expect(fileAddress("/Users/runner/My Downloads", "a#b.html")).toBe(
    "file:///Users/runner/My%20Downloads/a%23b.html",
  );
});

test("the saved reports are the probe's report files, in order", () => {
  expect(
    reports(["t29-probe-csp.html", "report-t29-probe-csp.json", "report-a.json", "x.json"]),
  ).toEqual(["report-a.json", "report-t29-probe-csp.json"]);
});
