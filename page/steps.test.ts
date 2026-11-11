// The steps before writing (T20, T84, T89 in RUN.md; R58, R59, R69 in docs/decisions.md): the
// purposes the build's texts open, a child's session among them, the statements asked, the writer's
// code typed, and what the start lacks.

import { expect, test } from "vitest";
import type { LegalSet, PageTexts } from "./sets.js";
import { codeOf, handOverOf, lacks, purposes, statements, versionOf } from "./steps.js";
import { HAND_OVER, PURPOSE_NOTES, START_LACKS, STATEMENTS } from "./texts.js";

/** A current set of the legal texts, as the build gives one. */
function legal(version: string): LegalSet {
  return { version, notice: [{ paragraph: [{ text: "The notice." }] }], gist: "Суть." };
}

/** A build of the adults' sets of v0.15.0 of spec: the measurement's alone here (T102). */
const adults: PageTexts = { measurement: legal("measure-2") };
/** A build with a current set for every purpose. */
const approved: PageTexts = {
  measurement: legal("measure-1"),
  evalSet: legal("eval-set-1"),
  child: legal("child-sample-1"),
};

test("a purpose with no set is closed, with why: the measurement too, now that the author's draft is gone (T102)", () => {
  expect(purposes({}, true)).toEqual([
    { key: "measurement", open: false, note: PURPOSE_NOTES.measurementNoSet },
    { key: "evalSet", open: false, note: PURPOSE_NOTES.evalSetNoSet },
    { key: "child", open: false, note: PURPOSE_NOTES.childNoSet },
  ]);
  expect(purposes(adults, true)[0]).toEqual({ key: "measurement", open: true });
});

test("each purpose opens with its own set, and the eval set only in a build with tasks of modules", () => {
  expect(purposes(approved, true)).toEqual([
    { key: "measurement", open: true },
    { key: "evalSet", open: true },
    { key: "child", open: true },
  ]);
  // The author approves the adults' consent and a child's apart.
  expect(purposes({ measurement: legal("measure-1") }, true).slice(1)).toEqual([
    { key: "evalSet", open: false, note: PURPOSE_NOTES.evalSetNoSet },
    { key: "child", open: false, note: PURPOSE_NOTES.childNoSet },
  ]);
  expect(purposes({ child: legal("child-sample-1") }, true)[2]).toEqual({
    key: "child",
    open: true,
  });
  // A sample of a task of tutor would be refused by a module's eval set.
  expect(purposes(approved, false)[1]).toEqual({
    key: "evalSet",
    open: false,
    note: PURPOSE_NOTES.evalSetNoModule,
  });
});

test("a purpose's samples name its set's version, and its file goes where the page's words say", () => {
  expect(versionOf(approved, "measurement")).toBe("measure-1");
  expect(versionOf(approved, "child")).toBe("child-sample-1");
  expect(versionOf(adults, "measurement")).toBe("measure-2");
  expect(versionOf(adults, "evalSet")).toBeUndefined();
  expect(handOverOf(approved, "evalSet")).toBe(HAND_OVER.evalSet);
  expect(handOverOf(approved, "child")).toBe(HAND_OVER.child);
  expect(handOverOf(adults, "measurement")).toBe(HAND_OVER.measurement);
  expect(handOverOf(adults, "child")).toBeUndefined();
});

test("each purpose asks the age and its own statement: the form of its version", () => {
  expect(statements(adults, "measurement")).toEqual([
    STATEMENTS.adult,
    STATEMENTS.form("measure-2"),
  ]);
  expect(statements(approved, "measurement")[1]).toBe(
    "Форма согласия версии measure-1 подписана и принята организатором.",
  );
  expect(statements(approved, "evalSet")[1]).toMatch(/Форма согласия версии eval-set-1/);
  expect(statements(approved, "child")[1]).toMatch(
    /родителя или опекуна этого ребёнка версии child-sample-1/,
  );
  expect(statements(adults, "child")).toEqual([STATEMENTS.adult]);
  // The age, and the right to make the agreement where the adult lives (R124 spec; T88).
  expect(STATEMENTS.adult).toContain(
    "18 лет или больше, и по законам места, где я живу, я вправе заключить этот договор.",
  );
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
  expect(lacks(adults, false, none)).toEqual([START_LACKS.purpose]);
  // A closed purpose is no purpose.
  expect(lacks(adults, true, { ...none, purpose: "evalSet" })).toEqual([START_LACKS.purpose]);
  expect(lacks(approved, false, { ...none, purpose: "evalSet" })).toEqual([START_LACKS.purpose]);
  expect(lacks(adults, false, { ...none, purpose: "measurement" })).toEqual([
    START_LACKS.code,
    START_LACKS.statements,
  ]);
  expect(
    lacks(adults, false, { ...none, purpose: "measurement", typed: true, agreed: [true, true] }),
  ).toEqual([START_LACKS.codeShape]);
  const code = { purpose: "measurement" as const, code: "AB12CD34", typed: true };
  expect(lacks(adults, false, { ...code, agreed: [true, false] })).toEqual([
    START_LACKS.statements,
  ]);
  expect(lacks(adults, false, { ...code, agreed: [true, true] })).toEqual([]);
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
