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
//   node synthetic-module_v<X.Y.Z>.mjs --digest <package> <task>...
//
// The second prints each task's ID and the digest of its open view, by the projection the samples
// name it by (T97): a module's CI holds people's samples to the package of its commit with it, and
// a task of a changed open view loses them (R95 spec). A template has no open view, and a task the
// package does not have no digest: the call prints the others' lines and names those, exit 1.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { readSample, sampleText } from "../src/eval/sample.ts";
import { moduleSample, SCENARIOS, type Synthetic } from "../src/eval/synthetic.ts";
import { type ModuleTasks, moduleTasksOf } from "../src/eval/tasks.ts";

const sha256 = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");

/** The tasks of the package in `pack`, its inventory.json and server.json, for samples that name
 * the release of modules `tag`. */
function packageOf(pack: string, tag: string): ModuleTasks {
  return moduleTasksOf(
    readFileSync(join(pack, "inventory.json"), "utf8"),
    readFileSync(join(pack, "server.json"), "utf8"),
    tag,
    sha256,
  );
}

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
  const module = packageOf(pack, tag);
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
  return [
    `usage: node ${file} --module <package> <tag> <folder> <task>:<seed>...`,
    `       node ${file} --digest <package> <task>...`,
  ].join("\n");
}

/** The tag a reference to a task names when the call names none: the digest of a task's open view
 * is of the view alone, whatever release the package comes from. */
const ANY_TAG = "v0.0.0";

/**
 * The digests of the named tasks' open views, on the package in `pack`, by the projection the
 * samples name a task by: `lines`, one to each task that has one, its ID and its digest, in the
 * order named; and `wrong`, why each other has none — a template has no open view, and a task the
 * package does not have no digest.
 */
export function moduleDigests(
  pack: string,
  tasks: readonly string[],
): { lines: string[]; wrong: string[] } {
  const module = packageOf(pack, ANY_TAG);
  const lines: string[] = [];
  const wrong: string[] = [];
  for (const task of tasks) {
    const open = module.tasks.get(task);
    if (open === undefined) wrong.push(`${task}: ${module.module} has no task ${task}`);
    else if ("reference" in open) lines.push(`${task}\t${open.reference.openViewDigest}`);
    else if (open.openViewDigest) lines.push(`${task}\t${open.openViewDigest}`);
    else wrong.push(`${task}: no open view, being ${open.refused}`);
  }
  return { lines, wrong };
}

/** Run a call: print its lines, then why it fails, if it does; give the exit code, 0 or 1. */
function run(call: () => { readonly lines: readonly string[]; readonly wrong: readonly string[] }) {
  try {
    const { lines, wrong } = call();
    for (const line of lines) console.log(line);
    if (wrong.length === 0) return 0;
    console.error(wrong.join("\n"));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
  }
  return 1;
}

/** Run the call of the digests, its arguments after --digest, and give the exit code: 0; 1 when a
 * task named has no digest, whose reason it prints after the others' lines, or the package cannot
 * be read; 2 when the call is out of form. */
export function digestMain(args: readonly string[]): number {
  const [pack, ...tasks] = args;
  if (!pack || tasks.length === 0) {
    console.error(usage());
    return 2;
  }
  return run(() => moduleDigests(pack, tasks));
}

/** Run the call of a module's samples, its arguments after --module: their lines, or why none is
 * written, and the exit code — 0, 1 when a call fails, 2 when the call is out of form. */
export function moduleMain(args: readonly string[]): number {
  const [pack, tag, folder, ...calls] = args;
  if (!pack || !tag || !folder || calls.length === 0) {
    console.error(usage());
    return 2;
  }
  return run(() => ({ lines: writeModuleSamples(pack, tag, folder, calls), wrong: [] }));
}
