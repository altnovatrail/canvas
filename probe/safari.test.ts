// What the driver of Safari on macOS works out for itself: which files of the Downloads
// folder are saved reports. The run itself is the workflow's, on a runner of macOS.

import { expect, test } from "vitest";
import { reports } from "./safari.ts";

test("the saved reports are the probe's report files, in order", () => {
  expect(
    reports(["t29-probe-csp.html", "report-t29-probe-csp.json", "report-a.json", "x.json"]),
  ).toEqual(["report-a.json", "report-t29-probe-csp.json"]);
});
