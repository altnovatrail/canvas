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

import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Purpose, sampleText, Writer } from "../src/eval/sample.js";
import { SCENARIOS, type Synthetic, syntheticSet } from "../src/eval/synthetic.js";
import { openTasksOf, TUTOR_FILE } from "../src/eval/tasks.js";

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

if (import.meta.main) {
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
