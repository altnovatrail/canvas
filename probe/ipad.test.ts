// What the driver of the iPad Simulator reads off WebDriverAgent's tree (T80 in RUN.md; R54 in
// docs/decisions.md): its elements, the one to tap and where, the page's first line and its
// report. The run itself is the workflow's, on a runner of macOS.

import { expect, test } from "vitest";
import { centre, elements, labelled, locate, quoted, reportOf, scriptState } from "./ipad.ts";

const REPORT = JSON.stringify({ probe: "2", file: "t29-probe-csp.html", settled: true }, null, 2);

const TREE = {
  type: "XCUIElementTypeApplication",
  label: "Safari",
  rect: { x: 0, y: 0, width: 1032, height: 1376 },
  children: [
    {
      type: "XCUIElementTypeButton",
      label: "Download",
      name: "Download",
      rect: { x: 400, y: 600, width: 120, height: 44 },
    },
    {
      type: "XCUIElementTypeButton",
      label: "View",
      rect: { x: 540, y: 600, width: 0, height: 44 },
    },
    {
      type: "XCUIElementTypeWebView",
      rect: { x: 0, y: 100, width: 1032, height: 1276 },
      children: [
        {
          type: "XCUIElementTypeStaticText",
          value: "The page's script ran: probe 2, t29-probe-csp.html.",
        },
        {
          type: "XCUIElementTypeStaticText",
          value: REPORT,
          rect: { x: 20, y: 900, width: 900, height: 400 },
        },
      ],
    },
  ],
};

test("a tree gives each element its words and its frame, children after their parent", () => {
  const all = elements(TREE);
  expect(all.map(({ type }) => type)).toEqual([
    "XCUIElementTypeApplication",
    "XCUIElementTypeButton",
    "XCUIElementTypeButton",
    "XCUIElementTypeWebView",
    "XCUIElementTypeStaticText",
    "XCUIElementTypeStaticText",
  ]);
  expect(all[1]).toEqual({
    type: "XCUIElementTypeButton",
    words: ["Download", "Download"],
    frame: [400, 600, 120, 44],
  });
  expect(elements(null)).toEqual([]);
});

test("an element is found by its words, whole or by a pattern, and one with no area never", () => {
  const all = elements(TREE);
  expect(locate(all, "Download")?.frame).toEqual([400, 600, 120, 44]);
  expect(locate(all, "View")).toBeUndefined();
  expect(locate(all, /^Down/)?.type).toBe("XCUIElementTypeButton");
  expect(centre({ type: "", words: [], frame: [400, 600, 121, 45] })).toEqual([461, 623]);
});

test("the page's first line says whether its script ran, and the report is read where it shows", () => {
  const all = elements(TREE);
  expect(scriptState(all)).toBe("ran");
  expect(reportOf(all)).toEqual({ probe: "2", file: "t29-probe-csp.html", settled: true });
  const quiet = elements({
    type: "XCUIElementTypeStaticText",
    value: "The page's script did not run.",
  });
  expect(scriptState(quiet)).toBe("did not run");
  expect(reportOf(quiet)).toBeUndefined();
  expect(scriptState(elements({ type: "XCUIElementTypeOther", label: "Loading" }))).toBe("unseen");
  expect(
    reportOf(elements({ type: "XCUIElementTypeStaticText", value: '{ "probe": ' })),
  ).toBeUndefined();
});

test("a predicate names a label whole or by its start, quoted, and a type when one is given", () => {
  expect(labelled("Download")).toBe("label == 'Download'");
  expect(labelled("t29-probe-csp", "BEGINSWITH", "XCUIElementTypeCell")).toBe(
    "type == 'XCUIElementTypeCell' AND label BEGINSWITH 't29-probe-csp'",
  );
  expect(quoted("it's a\\b")).toBe("'it\\'s a\\\\b'");
});

test("a report the tree splits into lines is read from the lines one after another", () => {
  const lines = REPORT.split("\n").map((value) => ({ type: "XCUIElementTypeStaticText", value }));
  const split = elements({ type: "XCUIElementTypeWebView", children: lines });
  expect(reportOf(split)).toEqual({ probe: "2", file: "t29-probe-csp.html", settled: true });
  const other = elements({ type: "XCUIElementTypeStaticText", value: '{ "x": 1 }' });
  expect(reportOf(other)).toBeUndefined();
});
