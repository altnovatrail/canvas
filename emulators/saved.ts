// The files the samples page saved in the emulators (T78 in RUN.md; R54, R55 in
// docs/decisions.md), read in the toolchain stage by the workflow's job of the saved files once
// each device's job has left its own in the folder saved/ of its artifact:
//
//   node emulators/saved.ts <version> <folder>...
//
// Each file must be a sample file the protocol reads (readSample), by a person, of the page's
// version, with a task and with strokes. A folder of the release build holds the author's own
// measurement under the draft of texts: an adult's, with its history, one sheet in their own hand
// and one workbook imitating a child's. A folder of the test build, whose name ends in -test,
// holds a child's session under the test set: the final geometry and the code typed (T22; R59).
// Each folder must hold a sheet's and a workbook's, of one code, the code of the page's one
// opening. spec's sample-check holds the same files to the protocol after it, markup and all
// (T81). The strokes are the code's, drawn by the drivers. The code of src/ imports its modules by
// the names of their builds, so the reader comes through Vite's loader, as scripts/page.ts takes
// the tasks.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Purpose, Writer } from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import { createServer } from "vite";
import type { Sample } from "../src/eval/sample.ts";
import { CHILD_CODE } from "./watch.ts";

/** Which build a folder's files came from: the test build's folders end in -test (T22). */
export type Built = "release" | "test";

/** The build of a run's folder, by its name. */
export function builtOf(folder: string): Built {
  return /-test\/?$/.test(folder) ? "test" : "release";
}

/** What is wrong with one sample of a page of a version; nothing when it is right. A release's is
 * the author's measurement by an adult, in their own hand or imitating a child's, with its history,
 * under the draft of texts; a test build's is of a child's session, its final geometry and the
 * code the adult typed, under the test set (R59). */
export function problemsOf(sample: Sample, version: string, built: Built = "release"): string[] {
  const problems: string[] = [];
  const want = (ok: boolean, what: string) => {
    if (!ok) problems.push(what);
  };
  want(sample.purpose === Purpose.MEASUREMENT, "not of measurement");
  want(sample.origin.case === "person", "not by a person");
  want(sample.canvasVersion === version, `not of version ${version}`);
  want(Boolean(sample.task?.task), "no task");
  want(sample.license === undefined, "a license, which a sample of measurement has none of");
  if (built === "release") {
    want(
      sample.writer === Writer.ADULT || sample.writer === Writer.ADULT_AS_CHILD,
      "not by an adult",
    );
    want(sample.textSetVersion === "draft-0", "not of the draft of texts");
    want(Boolean(sample.writerCode), "no writer's code");
    want(
      sample.ink.case === "history" && sample.ink.value.events.length > 0,
      "no strokes in its history",
    );
  } else {
    want(sample.writer === Writer.CHILD, "not by a child");
    want(sample.textSetVersion === "test-approved-0", "not of the test set of texts");
    want(sample.writerCode === CHILD_CODE, `not of the code typed, ${CHILD_CODE}`);
    // A workbook's final geometry holds only the strokes in its boxes (R53), and the drivers'
    // stroke falls in the draft beside them: a child's workbook may hold none.
    want(
      sample.ink.case === "geometry" &&
        (sample.ink.value.strokes.length > 0 || sample.surface.case === "workbook"),
      "no strokes in its final geometry",
    );
  }
  return problems;
}

/** What is wrong with a device's samples of a build together: a sheet's and a workbook's, of one
 * code; of the release's, one in the adult's own hand and one imitating a child's. */
export function problemsOfAll(samples: readonly Sample[], built: Built = "release"): string[] {
  const problems: string[] = [];
  const surfaces = new Set(samples.map((sample) => sample.surface.case));
  if (!surfaces.has("sheet")) problems.push("no sample of the sheet");
  if (!surfaces.has("workbook")) problems.push("no sample of the workbook");
  if (new Set(samples.map((sample) => sample.writerCode)).size > 1) {
    problems.push("more than one writer's code");
  }
  if (built === "release") {
    const writers = new Set(samples.map((sample) => sample.writer));
    if (!writers.has(Writer.ADULT)) problems.push("none in the adult's own hand");
    if (!writers.has(Writer.ADULT_AS_CHILD)) problems.push("none imitating a child's hand");
  }
  return problems;
}

if (import.meta.main) {
  const [version, ...folders] = process.argv.slice(2);
  if (!version || folders.length === 0) {
    console.error("usage: node emulators/saved.ts <version> <folder>...");
    process.exit(2);
  }
  const server = await createServer({
    configFile: false,
    logLevel: "silent",
    appType: "custom",
    server: { middlewareMode: true, hmr: false, ws: false },
  });
  const { readSample } = (await server.ssrLoadModule(
    "/src/eval/sample.ts",
  )) as typeof import("../src/eval/sample.ts");
  let failed = 0;
  for (const folder of folders) {
    const into = join(folder, "saved");
    const names = readdirSync(into).filter((name) => name.endsWith(".json"));
    const samples: Sample[] = [];
    for (const name of names) {
      let problems: string[];
      try {
        const sample = readSample(readFileSync(join(into, name), "utf8"));
        samples.push(sample);
        problems = problemsOf(sample, version, builtOf(folder));
      } catch (error) {
        problems = [`not a sample file: ${String(error).slice(0, 200)}`];
      }
      failed += problems.length;
      console.log(
        `${problems.length ? "FAIL" : "ok  "} ${folder}: ${name}${problems.length ? ` — ${problems.join("; ")}` : ""}`,
      );
    }
    const together = problemsOfAll(samples, builtOf(folder));
    failed += together.length;
    console.log(
      `${together.length ? "FAIL" : "ok  "} ${folder}: ${names.length} file(s)${together.length ? ` — ${together.join("; ")}` : ""}`,
    );
  }
  await server.close();
  if (failed > 0) process.exitCode = 1;
}
