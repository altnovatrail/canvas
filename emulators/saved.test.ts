// The check of the files the samples page saved in the emulators (T78 in RUN.md; R54, R55 in
// docs/decisions.md), on the example samples of examples/, which the code wrote (R48), made the
// page's own: by a person, of its draft of texts and of one opening's code; and, of the test build,
// a child's session (T22; R59).

import { readFileSync } from "node:fs";
import { PersonSchema, Writer } from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import { create } from "@bufbuild/protobuf";
import { expect, test } from "vitest";
import { readSample, type Sample } from "../src/eval/sample.ts";
import { builtOf, problemsOf, problemsOfAll } from "./saved.ts";
import { CHILD_CODE } from "./watch.ts";

/** An example sample of measurement, and the same as the page would write it. */
function example(surface: "sheet" | "workbook"): Sample {
  return readSample(readFileSync(`examples/${surface}-measurement.json`, "utf8"));
}

function asPage(sample: Sample, code = "ABCD2345", texts = "draft-0"): Sample {
  sample.origin = { case: "person", value: create(PersonSchema) };
  sample.textSetVersion = texts;
  sample.writerCode = code;
  return sample;
}

/** The example of a child's workbook, as a child's session of the test build saves it (R59). */
function child(): Sample {
  return asPage(
    readSample(readFileSync("examples/workbook-child.json", "utf8")),
    CHILD_CODE,
    "test-approved-0",
  );
}

/** The example workbook, written by an adult imitating a child's hand. */
function imitated(): Sample {
  const workbook = asPage(example("workbook"));
  workbook.writer = Writer.ADULT_AS_CHILD;
  return workbook;
}

test("a sample of the page's own is right, and one of another origin, version or texts is not", () => {
  expect(problemsOf(asPage(example("sheet")), "0.0.0")).toEqual([]);
  expect(problemsOf(imitated(), "0.0.0")).toEqual([]);
  expect(problemsOf(example("sheet"), "0.0.0")).toEqual([
    "not by a person",
    "not of the draft of texts",
  ]);
  expect(problemsOf(asPage(example("workbook")), "1.2.3")).toEqual(["not of version 1.2.3"]);
  const empty = asPage(example("sheet"));
  if (empty.ink.case === "history") empty.ink.value.events = [];
  expect(problemsOf(empty, "0.0.0")).toEqual(["no strokes in its history"]);
});

test("a device's samples are a sheet's and a workbook's, of one writer's code, in the adult's own hand and imitating a child's (T22)", () => {
  const sheet = asPage(example("sheet"));
  expect(problemsOfAll([sheet])).toEqual([
    "no sample of the workbook",
    "none imitating a child's hand",
  ]);
  const other = imitated();
  other.writerCode = "WXYZ6789";
  expect(problemsOfAll([sheet, other])).toEqual(["more than one writer's code"]);
  expect(problemsOfAll([sheet, asPage(example("workbook"))])).toEqual([
    "none imitating a child's hand",
  ]);
  expect(problemsOfAll([sheet, imitated()])).toEqual([]);
});

test("a test build's folder holds a child's session: by a child, its final geometry, the test set and the code typed (T22)", () => {
  expect([builtOf("build/page-android-test"), builtOf("build/page-ipad-26.5")]).toEqual([
    "test",
    "release",
  ]);
  expect(problemsOf(child(), "0.0.0", "test")).toEqual([]);
  // A child's workbook whose strokes fell in the draft holds none in its final geometry (R53).
  const draft = child();
  if (draft.ink.case === "geometry") draft.ink.value.strokes = [];
  expect(problemsOf(draft, "0.0.0", "test")).toEqual([]);
  expect(problemsOf(asPage(example("sheet")), "0.0.0", "test")).toEqual([
    "not by a child",
    "not of the test set of texts",
    `not of the code typed, ${CHILD_CODE}`,
    "no strokes in its final geometry",
  ]);
  expect(problemsOf(child(), "0.0.0")).toEqual([
    "not by an adult",
    "not of the draft of texts",
    "no strokes in its history",
  ]);
  expect(problemsOfAll([child()], "test")).toEqual(["no sample of the sheet"]);
});
