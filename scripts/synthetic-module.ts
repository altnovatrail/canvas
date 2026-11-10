// The synthetic samples of a module's eval set (T86, T96 in RUN.md; R110 spec; R63, R68 in
// docs/decisions.md): one of each task and seed the call names, on the package that module-kit
// build wrote of the module at the commit the samples go into — its inventory.json and
// server.json —, naming the newest release of modules by its tag. Into the folder, the module's
// eval/, go synthetic-<seed>.json files. A file there already of the same seed is written anew when
// it is a sample of the same task of the same module, which a change of the task's open view
// re-makes; of any other, the call writes nothing. A template, a choice, an essay or a zone has no
// sample: the call names each and writes nothing.
//
// It needs nothing but its arguments, and scripts/generator.ts bundles it with its entry,
// scripts/synthetic-module.main.ts, into the file every release carries,
// synthetic-module_v<X.Y.Z>.mjs, which just synthetic-module runs too:
//
//   node synthetic-module_v<X.Y.Z>.mjs --module <package> <tag> <folder> <task>:<seed>...

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { readSample, sampleText } from "../src/eval/sample.ts";
import { moduleSample, SCENARIOS, type Synthetic } from "../src/eval/synthetic.ts";
import { moduleTasksOf } from "../src/eval/tasks.ts";

const sha256 = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");

/** A call of a module's sample: a task's ID and a seed, `<task>:<seed>`. */
const CALL = /^([a-z0-9][a-z0-9-]*):(0|[1-9]\d*)$/;

/**
 * Write the samples of a module's eval set that the calls name into `folder`, on the package in
 * `pack`, for the release of modules `tag`, and give each sample's line: its ID, its task and what
 * it shows. Every call is checked before any file is written: an Error names each that fails.
 */
export function writeModuleSamples(
  pack: string,
  tag: string,
  folder: string,
  calls: readonly string[],
): string[] {
  const module = moduleTasksOf(
    readFileSync(join(pack, "inventory.json"), "utf8"),
    readFileSync(join(pack, "server.json"), "utf8"),
    tag,
    sha256,
  );
  const wrong: string[] = [];
  const seeds = new Set<string>();
  const made: Synthetic[] = [];
  for (const call of calls) {
    const [, task = "", seed = ""] = CALL.exec(call) ?? [];
    const open = module.tasks.get(task);
    if (!task || Number(seed) > 0xffff_ffff)
      wrong.push(`${call}: no <task>:<seed>, a seed below 2^32`);
    else if (seeds.has(seed)) wrong.push(`${call}: the seed ${seed} is named twice`);
    else if (open === undefined) wrong.push(`${call}: ${module.module} has no task ${task}`);
    else if (!("reference" in open)) wrong.push(`${call}: ${task} is ${open.refused}`);
    else {
      seeds.add(seed);
      try {
        const synthetic = moduleSample(open, Number(seed));
        const there = otherSample(join(folder, `${synthetic.id}.json`), module.module, task);
        if (there) wrong.push(`${call}: ${synthetic.id}.json is ${there}`);
        made.push(synthetic);
      } catch (error) {
        // A page that does not lay out, say: named with the others.
        wrong.push(`${call}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  if (calls.length === 0) wrong.push("no <task>:<seed> is named");
  if (wrong.length > 0) throw new Error(wrong.join("\n"));
  mkdirSync(folder, { recursive: true });
  return made.map((synthetic) => {
    writeFileSync(join(folder, `${synthetic.id}.json`), sampleText(synthetic.sample));
    return `${synthetic.id}\t${synthetic.sample.task?.task ?? ""}\t${SCENARIOS[synthetic.scenario]}`;
  });
}

/** What a file already at a sample's place is, when it is not a synthetic sample of the same task
 * of the same module, which may be written anew; undefined when there is none, or it is that. A
 * person's sample is never written over. */
function otherSample(path: string, module: string, task: string): string | undefined {
  if (!existsSync(path)) return undefined;
  try {
    const sample = readSample(readFileSync(path, "utf8"));
    const source = sample.task?.source;
    if (sample.origin.case !== "synthetic") return "a person's sample";
    if (
      source?.case === "modules" &&
      source.value.module === module &&
      sample.task?.task === task
    ) {
      return undefined;
    }
    return `a sample of ${sample.task?.task ?? "no task"}${source?.case === "modules" ? ` of ${source.value.module}` : ""}`;
  } catch (error) {
    return `no sample file: ${String(error).slice(0, 120)}`;
  }
}

/** How the file is called, by the name it runs under: the release's, or the build's. */
export function usage(): string {
  const file = basename(process.argv[1] ?? "synthetic-module.mjs");
  return `usage: node ${file} --module <package> <tag> <folder> <task>:<seed>...`;
}

/** Run the call of a module's samples, its arguments after --module: their lines, or why none is
 * written, and the exit code — 0, 1 when a call fails, 2 when the call is out of form. */
export function moduleMain(args: readonly string[]): number {
  const [pack, tag, folder, ...calls] = args;
  if (!pack || !tag || !folder || calls.length === 0) {
    console.error(usage());
    return 2;
  }
  try {
    for (const line of writeModuleSamples(pack, tag, folder, calls)) console.log(line);
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}
