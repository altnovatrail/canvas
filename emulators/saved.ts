// The files the samples page saved in the emulators (T78 in RUN.md; R54, R55 in
// docs/decisions.md), read in the toolchain stage by the workflow's job of the saved files once
// each device's job has left its own in the folder saved/ of its artifact:
//
//   node emulators/saved.ts <version> <folder>...
//
// Each file must be a sample file the protocol reads (readSample): of the author's own
// measurement, written by an adult, by a person, of the page's version and its draft of texts,
// with a task and with strokes. Each folder — a device — must hold a sheet's and a workbook's, of
// one writer's code, the code of the page's one opening. spec's sample-check joins when the page
// writes its markup (T20). The strokes are the code's, drawn by the drivers. The code of src/
// imports its modules by the names of their builds, so the reader comes through Vite's loader, as
// scripts/page.ts takes the tasks.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Purpose, Writer } from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import { createServer } from "vite";
import type { Sample } from "../src/eval/sample.ts";

/** What is wrong with one sample of a page of a version; nothing when it is right. */
export function problemsOf(sample: Sample, version: string): string[] {
  const problems: string[] = [];
  const want = (ok: boolean, what: string) => {
    if (!ok) problems.push(what);
  };
  want(sample.purpose === Purpose.MEASUREMENT, "not of measurement");
  want(sample.writer === Writer.ADULT, "not by an adult");
  want(sample.origin.case === "person", "not by a person");
  want(sample.canvasVersion === version, `not of version ${version}`);
  want(sample.textSetVersion === "draft-0", "not of the draft of texts");
  want(Boolean(sample.writerCode), "no writer's code");
  want(Boolean(sample.task?.task), "no task");
  want(
    sample.ink.case === "history" && sample.ink.value.events.length > 0,
    "no strokes in its history",
  );
  return problems;
}

/** What is wrong with a device's samples together: a sheet's and a workbook's, of one code. */
export function problemsOfAll(samples: readonly Sample[]): string[] {
  const problems: string[] = [];
  const surfaces = new Set(samples.map((sample) => sample.surface.case));
  if (!surfaces.has("sheet")) problems.push("no sample of the sheet");
  if (!surfaces.has("workbook")) problems.push("no sample of the workbook");
  if (new Set(samples.map((sample) => sample.writerCode)).size > 1) {
    problems.push("more than one writer's code");
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
        problems = problemsOf(sample, version);
      } catch (error) {
        problems = [`not a sample file: ${String(error).slice(0, 200)}`];
      }
      failed += problems.length;
      console.log(
        `${problems.length ? "FAIL" : "ok  "} ${folder}: ${name}${problems.length ? ` — ${problems.join("; ")}` : ""}`,
      );
    }
    const together = problemsOfAll(samples);
    failed += together.length;
    console.log(
      `${together.length ? "FAIL" : "ok  "} ${folder}: ${names.length} file(s)${together.length ? ` — ${together.join("; ")}` : ""}`,
    );
  }
  await server.close();
  if (failed > 0) process.exitCode = 1;
}
