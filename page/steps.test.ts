// The steps before writing (T20, T84, T89 in RUN.md; R58, R59, R69 in docs/decisions.md): the
// purposes the build's texts open, a child's session among them, the statements asked, the writer's
// code typed, and what the start lacks; and the author's draft in page/sets/ held to the rules of
// page/sets.ts.

import { expect, test } from "vitest";
import draftJson from "./sets/draft-0.json" with { type: "json" };
import { draftOf, type LegalSet, type PageTexts } from "./sets.js";
import { codeOf, handOverOf, lacks, purposes, statements, versionOf } from "./steps.js";
import { HAND_OVER, PURPOSE_NOTES, START_LACKS, STATEMENTS } from "./texts.js";

/** A current set of the legal texts, as the build gives one. */
function legal(version: string): LegalSet {
  return { version, notice: [{ paragraph: [{ text: "The notice." }] }], gist: "Суть." };
}

const author = draftOf(draftJson);
/** A build whose measurement has no current set: the author's draft opens it. */
const draft: PageTexts = { measurement: author };
/** A build with a current set for every purpose. */
const approved: PageTexts = {
  measurement: legal("measure-1"),
  evalSet: legal("eval-set-1"),
  child: legal("child-sample-1"),
};

test("the author's draft holds to the rules, and is no version of a set of the legal texts", () => {
  expect(author.version).toBe("draft-0");
  // The file of a sample holds no pressure (R93 spec).
  expect(author.notice.join(" ")).toContain("без нажима");
});

test("a draft is refused for a version out of shape, none, or texts missing", () => {
  const bad = (change: Record<string, unknown>) => () => draftOf({ ...draftJson, ...change });
  expect(bad({ version: "none" })).toThrow(TypeError);
  expect(bad({ version: "draft 0" })).toThrow(TypeError);
  expect(bad({ version: "x".repeat(33) })).toThrow(TypeError);
  expect(bad({ notice: [] })).toThrow(TypeError);
  expect(bad({ notice: [" "] })).toThrow(TypeError);
  expect(bad({ statement: "" })).toThrow(TypeError);
  expect(bad({ handOver: undefined })).toThrow(TypeError);
});

test("the draft opens the measurement to the author alone, and a purpose with no set is closed, with why", () => {
  expect(purposes(draft, true)).toEqual([
    { key: "measurement", open: true, note: PURPOSE_NOTES.measurementDraft },
    { key: "evalSet", open: false, note: PURPOSE_NOTES.evalSetNoSet },
    { key: "child", open: false, note: PURPOSE_NOTES.childNoSet },
  ]);
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
  expect(purposes({ measurement: author, child: legal("child-sample-1") }, true)[2]).toEqual({
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
  expect(versionOf(draft, "measurement")).toBe("draft-0");
  expect(versionOf(draft, "evalSet")).toBeUndefined();
  expect(handOverOf(approved, "evalSet")).toBe(HAND_OVER.evalSet);
  expect(handOverOf(approved, "child")).toBe(HAND_OVER.child);
  expect(handOverOf(draft, "measurement")).toBe(author.handOver);
  expect(handOverOf(draft, "child")).toBeUndefined();
});

test("each purpose asks the age and its own statement: the author's samples, or the form of its version", () => {
  expect(statements(draft, "measurement")).toEqual([
    STATEMENTS.adult,
    "Я автор проекта и пишу свои образцы.",
  ]);
  expect(statements(approved, "measurement")[1]).toBe(
    "Форма согласия версии measure-1 подписана и принята организатором.",
  );
  expect(statements(approved, "evalSet")[1]).toMatch(/Форма согласия версии eval-set-1/);
  expect(statements(approved, "child")[1]).toMatch(
    /родителя или опекуна этого ребёнка версии child-sample-1/,
  );
  expect(statements(draft, "child")).toEqual([STATEMENTS.adult]);
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
