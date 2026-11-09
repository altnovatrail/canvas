// The check of the files the samples page saved in the emulators (T78 in RUN.md; R54, R55 in
// docs/decisions.md), on the example samples of examples/, which the code wrote (R48), made the
// page's own: by a person, of its draft of texts and of one opening's code.

import { readFileSync } from "node:fs";
import { PersonSchema } from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import { create } from "@bufbuild/protobuf";
import { expect, test } from "vitest";
import { readSample, type Sample } from "../src/eval/sample.ts";
import { problemsOf, problemsOfAll } from "./saved.ts";

/** An example sample of measurement, and the same as the page would write it. */
function example(surface: "sheet" | "workbook"): Sample {
  return readSample(readFileSync(`examples/${surface}-measurement.json`, "utf8"));
}

function asPage(sample: Sample, code = "ABCD2345"): Sample {
  sample.origin = { case: "person", value: create(PersonSchema) };
  sample.textSetVersion = "draft-0";
  sample.writerCode = code;
  return sample;
}

test("a sample of the page's own is right, and one of another origin, version or texts is not", () => {
  expect(problemsOf(asPage(example("sheet")), "0.0.0")).toEqual([]);
  expect(problemsOf(example("sheet"), "0.0.0")).toEqual([
    "not by a person",
    "not of the draft of texts",
  ]);
  expect(problemsOf(asPage(example("workbook")), "1.2.3")).toEqual(["not of version 1.2.3"]);
  const empty = asPage(example("sheet"));
  if (empty.ink.case === "history") empty.ink.value.events = [];
  expect(problemsOf(empty, "0.0.0")).toEqual(["no strokes in its history"]);
});

test("a device's samples are a sheet's and a workbook's, of one writer's code", () => {
  const sheet = asPage(example("sheet"));
  expect(problemsOfAll([sheet])).toEqual(["no sample of the workbook"]);
  expect(problemsOfAll([sheet, asPage(example("workbook"), "WXYZ6789")])).toEqual([
    "more than one writer's code",
  ]);
  expect(problemsOfAll([sheet, asPage(example("workbook"))])).toEqual([]);
});
