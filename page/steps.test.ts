// The steps before writing (T20, T84 in RUN.md; R58, R59 in docs/decisions.md): the purposes each
// set of texts opens, a child's session among them, the statements asked, the writer's code typed,
// and what the start lacks; and the sets of page/sets/ held to the rules of page/sets.ts.

import { expect, test } from "vitest";
import draftJson from "./sets/draft-0.json" with { type: "json" };
import approvedJson from "./sets/test-approved-0.json" with { type: "json" };
import { isTestSet, textSetOf } from "./sets.js";
import { codeOf, lacks, purposes, statements } from "./steps.js";
import { PURPOSE_NOTES, START_LACKS } from "./texts.js";

const draft = textSetOf(draftJson);
const approved = textSetOf(approvedJson);

test("the sets in page/sets/ hold to the rules, and only the test one is a test set", () => {
  expect(draft.version).toBe("draft-0");
  expect(draft.status).toBe("draft");
  expect(draft.evalSet).toBeUndefined();
  expect(isTestSet(draft)).toBe(false);
  expect(approved.status).toBe("approved");
  expect(isTestSet(approved)).toBe(true);
});

test("a set is refused for a version out of shape, none, a status unknown or texts missing", () => {
  const good: Record<string, unknown> = { ...draftJson };
  const bad = (change: Record<string, unknown>) => () => textSetOf({ ...good, ...change });
  expect(bad({ version: "none" })).toThrow(TypeError);
  expect(bad({ version: "draft 0" })).toThrow(TypeError);
  expect(bad({ version: "x".repeat(33) })).toThrow(TypeError);
  expect(bad({ status: "final" })).toThrow(TypeError);
  expect(bad({ adult: " " })).toThrow(TypeError);
  expect(bad({ measurement: { notice: [], statement: "s", handOver: "h" } })).toThrow(TypeError);
  // A draft with the eval set's texts, or a child's session's.
  expect(bad({ evalSet: draftJson.measurement })).toThrow(TypeError);
  expect(bad({ child: draftJson.measurement })).toThrow(TypeError);
  expect(bad({ status: "approved", child: { notice: ["n"], statement: "s" } })).toThrow(TypeError);
  // An approved set may come for the adults' measurement alone: the lawyer reads each consent apart.
  const { evalSet: _evalSet, child: _child, ...adults } = approvedJson;
  expect(textSetOf(adults)).toEqual({ ...approved, evalSet: undefined, child: undefined });
});

test("a draft opens the measurement to the author alone and keeps the eval set and a child's session closed, with why", () => {
  expect(purposes(draft, true)).toEqual([
    { key: "measurement", open: true, note: PURPOSE_NOTES.measurementDraft },
    { key: "evalSet", open: false, note: PURPOSE_NOTES.evalSetDraft },
    { key: "child", open: false, note: PURPOSE_NOTES.childDraft },
  ]);
});

test("an approved set opens the eval set only in a build with tasks of modules, and each of the eval set and the session only with its texts", () => {
  expect(purposes(approved, true)).toEqual([
    { key: "measurement", open: true },
    { key: "evalSet", open: true },
    { key: "child", open: true },
  ]);
  // The lawyer may approve the adults' texts before a child's, or the other way round.
  const { evalSet: _evalSet, child: _child, ...adults } = approved;
  expect(purposes(adults, true).slice(1)).toEqual([
    { key: "evalSet", open: false, note: PURPOSE_NOTES.noTexts },
    { key: "child", open: false, note: PURPOSE_NOTES.noTexts },
  ]);
  // A sample of a task of tutor would be refused by a module's eval set.
  expect(purposes(approved, false)[1]).toEqual({
    key: "evalSet",
    open: false,
    note: PURPOSE_NOTES.evalSetNoModule,
  });
});

test("each purpose asks the age and its own statement: the author's samples, or the form", () => {
  expect(statements(draft, "measurement")).toEqual([
    draft.adult,
    "Я автор проекта и пишу свои образцы.",
  ]);
  expect(statements(approved, "evalSet")[1]).toMatch(/Форма согласия версии test-approved-0/);
  expect(statements(approved, "child")[1]).toMatch(/родителя или опекуна этого ребёнка/);
});

test("a typed code is forgiven its case and spaces, and kept to the protocol's shape", () => {
  expect(codeOf(" ab12 cd34 ")).toBe("AB12CD34");
  expect(codeOf("ABC12")).toBeUndefined();
  expect(codeOf("A".repeat(17))).toBeUndefined();
  expect(codeOf("AB-12CD")).toBeUndefined();
  expect(codeOf("абв123")).toBeUndefined();
  // Letters outside Latin that raise to Latin ones are no code the person wrote.
  expect(codeOf("abcdeß")).toBeUndefined();
  expect(codeOf("abcdeı")).toBeUndefined();
});

test("the start lacks a purpose, then a code for the measurement, then the statements", () => {
  const none = { typed: false, agreed: [] };
  expect(lacks(draft, false, none)).toEqual([START_LACKS.purpose]);
  // A closed purpose is no purpose.
  expect(lacks(draft, true, { ...none, purpose: "evalSet" })).toEqual([START_LACKS.purpose]);
  expect(lacks(approved, false, { ...none, purpose: "evalSet" })).toEqual([START_LACKS.purpose]);
  expect(lacks(draft, false, { ...none, purpose: "measurement" })).toEqual([
    START_LACKS.code,
    START_LACKS.statements,
  ]);
  expect(
    lacks(draft, false, { ...none, purpose: "measurement", typed: true, agreed: [true, true] }),
  ).toEqual([START_LACKS.codeShape]);
  const code = { purpose: "measurement" as const, code: "AB12CD34", typed: true };
  expect(lacks(draft, false, { ...code, agreed: [true, false] })).toEqual([START_LACKS.statements]);
  expect(lacks(draft, false, { ...code, agreed: [true, true] })).toEqual([]);
});

test("an eval set's start asks no code: its sample has none", () => {
  expect(lacks(approved, true, { purpose: "evalSet", typed: false, agreed: [true, true] })).toEqual(
    [],
  );
});

test.each([
  ["no way chosen", {}, [START_LACKS.childCode]],
  [
    "a new code, which goes into a form first",
    { way: "new", code: "AB12CD34" },
    [START_LACKS.childNew],
  ],
  ["a code out of shape", { way: "own", typed: true }, [START_LACKS.childCodeShape]],
  ["the code of the form", { way: "own", code: "AB12CD34", typed: true }, []],
] as const)(
  "a child's session begins only with the code of the form typed: %s",
  (_, given, want) => {
    const start = { purpose: "child" as const, typed: false, agreed: [true, true], ...given };
    expect(lacks(approved, false, start)).toEqual(want);
  },
);
