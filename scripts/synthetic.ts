// The synthetic samples written into a folder, one file each, <ID>.json (R49), as just synthetic
// runs it: from the build of tsconfig.synthetic.json, since the code of src/ imports its modules by
// .js names, which Node does not take for .ts ones.
//
//   node build/scripts/synthetic.js <folder> [<list>]
//
// It reads tutor's file of open tasks from tasks/ of the repository it was built in, which
// ci-licenses verifies by spec's release-verify (R77 spec), and refuses one whose bytes are not
// those TUTOR_FILE names. Of what the folder holds it removes only the files of a set,
// synthetic-*.json, so that none of an older set stays, and prints a line for each sample — its
// ID, its composition and what it shows. Given a list, it writes the lines there too, under a line
// of the columns' names: the release's synthetic-samples_v<X.Y.Z>.tsv (R50).
//
//   node build/scripts/synthetic.js --module <package> <tag> <folder> <task>:<seed>...
//
// writes the synthetic samples of a module's eval set instead (T86; R110 spec, R63), as just
// synthetic-module runs it: one of each task and seed the call names, on the package that
// module-kit build wrote of the module at the commit the samples go into — its inventory.json and
// server.json —, naming the newest release of modules by its tag. Into the folder, the module's
// eval/, go synthetic-<seed>.json files. A file there already of the same seed is written anew when
// it is a sample of the same task of the same module, which a change of the task's open view
// re-makes; of any other, the call writes nothing. A template, a choice, an essay or a zone has no
// sample: the call names each and writes nothing. It exits 1 then, and 2 when called out of form.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Purpose, readSample, sampleText, Writer } from "../src/eval/sample.js";
import { moduleSample, SCENARIOS, type Synthetic, syntheticSet } from "../src/eval/synthetic.js";
import { moduleTasksOf, openTasksOf, TUTOR_FILE } from "../src/eval/tasks.js";

const sha256 = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");

/** The name of a file of a synthetic sample: its ID, synthetic-<seed>, and .json. */
const SET_FILE = /^synthetic-\d+\.json$/;

/** A sample's line: its ID, its purpose and writer as the protocol names them, and its scenario. */
export function lineOf({ id, scenario, sample }: Synthetic): string {
  const purpose = Purpose[sample.purpose] ?? "";
  const writer = Writer[sample.writer] ?? "";
  return `${id}\t${purpose}\t${writer}\t${SCENARIOS[scenario]}`;
}

/** The list of the set: a line of the columns' names, then the set's lines, each ended. */
export function listOf(lines: readonly string[]): string {
  return `${["id\tpurpose\twriter\tscenario", ...lines].join("\n")}\n`;
}

/** Write the set into `folder`, with tutor's file from `root`/tasks, and give each sample's line. */
export function writeSet(folder: string, root: string): string[] {
  const bytes = readFileSync(join(root, "tasks", TUTOR_FILE.name));
  const digest = sha256(bytes);
  if (digest !== TUTOR_FILE.sha256) {
    throw new Error(`tasks/${TUTOR_FILE.name} is sha256 ${digest}, not ${TUTOR_FILE.sha256}`);
  }
  const tasks = openTasksOf(JSON.parse(bytes.toString("utf8")), TUTOR_FILE.tag, digest, sha256);
  mkdirSync(folder, { recursive: true });
  for (const name of readdirSync(folder)) {
    if (SET_FILE.test(name)) rmSync(join(folder, name));
  }
  return syntheticSet(tasks).map((synthetic) => {
    writeFileSync(join(folder, `${synthetic.id}.json`), sampleText(synthetic.sample));
    return lineOf(synthetic);
  });
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

/** Run the call of a module's samples: their lines, or why none is written, and the exit code. */
function moduleMain(args: readonly string[]): void {
  const [pack, tag, folder, ...calls] = args;
  if (!pack || !tag || !folder || calls.length === 0) {
    console.error(
      "usage: node build/scripts/synthetic.js --module <package> <tag> <folder> <task>:<seed>...",
    );
    process.exit(2);
  }
  try {
    for (const line of writeModuleSamples(pack, tag, folder, calls)) console.log(line);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (import.meta.main && process.argv[2] === "--module") {
  moduleMain(process.argv.slice(3));
} else if (import.meta.main) {
  const [folder, list, ...rest] = process.argv.slice(2);
  if (folder === undefined || rest.length > 0) {
    console.error("usage: node build/scripts/synthetic.js <folder> [<list>]");
    process.exit(2);
  }
  // The build is build/scripts/ of the repository, whose root holds tasks/.
  const root = fileURLToPath(new URL("../..", import.meta.url));
  const lines = writeSet(folder, root);
  if (list !== undefined) writeFileSync(list, listOf(lines));
  for (const line of lines) console.log(line);
}
