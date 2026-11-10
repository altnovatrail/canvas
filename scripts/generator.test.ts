// The generator's file (T96 in RUN.md; R68 in docs/decisions.md): one ES module for Node that
// writes a module's synthetic samples as writeModuleSamples does, byte for byte, with no package of
// npm beside it, the same bytes on every build, and the license notices of all it carries.

import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, expect, test } from "vitest";
import { PACKAGE as MODULE_PACKAGE } from "../src/eval/packages.fixture.ts";
import { temporary } from "./folders.fixture.ts";
import { buildGenerator, fileName, header } from "./generator.ts";
import { moduleDigests, writeModuleSamples } from "./synthetic-module.ts";

/** grade-3-math 0.2.0 of the release of modules v0.2.0, which ci-licenses verifies (T86). */
const PACKAGE = fileURLToPath(MODULE_PACKAGE);

/** The calls ci-licenses makes: one sample of each task of the package, seeds 201 to 212. */
const CALLS = [
  "comparing-fractions-d1:201",
  "comparing-fractions-d3:202",
  "comparing-fractions-d5:203",
  "division-with-remainder-d1:204",
  "division-with-remainder-d3:205",
  "division-with-remainder-d5:206",
  "fractions-of-a-whole-d1:207",
  "fractions-of-a-whole-d3:208",
  "fractions-of-a-whole-d5:209",
  "times-tables-d1:210",
  "times-tables-d3:211",
  "times-tables-d5:212",
];

let file = "";
let text = "";
let packages: readonly string[] = [];

beforeAll(async () => {
  // The file runs from a folder of its own, outside the repository, where no node_modules is.
  const built = await buildGenerator(join(temporaryFolder(), "release"), "1.2.3");
  file = join(temporaryFolder(), fileName("1.2.3"));
  copyFileSync(built.path, file);
  text = readFileSync(file, "utf8");
  packages = built.packages.map(({ name }) => name);
}, 120_000);

/** The folders that outlive one test — the build's, which every test of the file reads, and those
 * the file runs from —, gone after the last. */
const folders: string[] = [];
afterAll(() => {
  for (const folder of folders) rmSync(folder, { recursive: true, force: true });
});

/** A temporary folder for the whole file. */
function temporaryFolder(): string {
  const folder = mkdtempSync(join(tmpdir(), "generator-"));
  folders.push(folder);
  return folder;
}

/** Run the file with Node, from a folder of its own, and give what it printed and its exit code. */
function run(args: readonly string[]): { out: string; err: string; status: number | null } {
  const result = spawnSync(process.execPath, [file, ...args], {
    encoding: "utf8",
    cwd: temporaryFolder(),
  });
  return { out: result.stdout, err: result.stderr, status: result.status };
}

test("names the file by a version X.Y.Z, and refuses another", () => {
  expect(fileName("1.2.3")).toBe("synthetic-module_v1.2.3.mjs");
  expect(() => fileName("v1.2.3")).toThrow("no version X.Y.Z");
});

test("of a version is the same bytes on every build, the other build in a process of its own", () => {
  const folder = temporary("generator");
  const again =
    execFileSync(process.execPath, ["scripts/generator.ts", folder, "1.2.3"], {
      encoding: "utf8",
    }).split("\n")[0] ?? "";
  expect(again).toBe(join(folder, "synthetic-module_v1.2.3.mjs"));
  expect(readFileSync(again, "utf8")).toBe(text);
}, 60_000);

test("imports nothing but Node's own modules, and opens with what it is and its notices", () => {
  // Any form that names a module — an import or a re-export over any lines, an import for its
  // effects alone, a dynamic import or a require — names one of Node's own.
  const code = text.slice(text.indexOf("\n*/\n") + 4);
  const named = [
    /^(?:import|export)\b[^;]*?\bfrom\s*["']([^"']+)["']/gm,
    /^import\s*["']([^"']+)["']/gm,
    /\b(?:import|require)\(\s*["'`]([^"'`]+)["'`]/g,
  ].flatMap((form) => [...code.matchAll(form)].map(([, from]) => from));
  expect(named.length).toBeGreaterThan(0);
  expect(named.filter((from) => !from?.startsWith("node:"))).toEqual([]);
  expect(packages).toEqual([
    "@altnovatrail/contracts",
    "@bufbuild/protobuf",
    "quickselect",
    "rbush",
  ]);
  const comment = text.slice(0, text.indexOf("\n*/\n"));
  expect(comment.startsWith("/*!\nsynthetic-module_v1.2.3.mjs")).toBe(true);
  expect(comment).toContain("release-verify canvas v1.2.3 synthetic-module_v1.2.3.mjs");
  expect(comment).toContain("synthetic-module_v1.2.3.mjs --digest <package> <task>...");
  expect(comment).toContain("NovaTrail canvas — Apache-2.0");
  for (const name of packages) expect(comment).toContain(`\n${name} `);
  // Nothing in a notice ends the comment before its end.
  expect(comment.includes("*/")).toBe(false);
  expect(header("1.2.3", "a */ b", [])).toContain("a * / b");
  expect(() => header("1.2.3", "a\r\nb", [])).toThrow("carriage return");
});

test("writes a module's samples as writeModuleSamples does, byte for byte, and prints the same lines", () => {
  const ours = temporary("ours");
  const lines = writeModuleSamples(PACKAGE, "v0.2.0", ours, CALLS);
  const theirs = temporary("theirs");
  const { out, err, status } = run(["--module", PACKAGE, "v0.2.0", theirs, ...CALLS]);
  expect({ status, err }).toEqual({ status: 0, err: "" });
  expect(out).toBe(`${lines.join("\n")}\n`);
  const names = readdirSync(ours).sort();
  expect(readdirSync(theirs).sort()).toEqual(names);
  expect(names).toHaveLength(CALLS.length);
  for (const name of names) {
    expect(readFileSync(join(theirs, name), "utf8")).toBe(readFileSync(join(ours, name), "utf8"));
  }
}, 60_000);

test("prints the digests of the tasks' open views as moduleDigests does, and exits 1 naming a task without one (T97)", () => {
  const tasks = ["times-tables-d5", "comparing-fractions-d1"];
  expect(run(["--digest", PACKAGE, ...tasks])).toEqual({
    out: `${moduleDigests(PACKAGE, tasks).lines.join("\n")}\n`,
    err: "",
    status: 0,
  });
  expect(run(["--digest", PACKAGE, "no-such-task", "times-tables-d5"])).toEqual({
    out: `${moduleDigests(PACKAGE, ["times-tables-d5"]).lines[0]}\n`,
    err: "no-such-task: novatrail/grade-3-math has no task no-such-task\n",
    status: 1,
  });
}, 60_000);

test("exits 2 on a call out of form and 1 on a call it refuses, writing nothing", () => {
  const usage =
    "usage: node synthetic-module_v1.2.3.mjs --module <package> <tag> <folder> <task>:<seed>...\n" +
    "       node synthetic-module_v1.2.3.mjs --digest <package> <task>...\n";
  expect(run([])).toEqual({ out: "", err: usage, status: 2 });
  expect(run(["--digest", PACKAGE])).toEqual({ out: "", err: usage, status: 2 });
  expect(run(["--module", PACKAGE, "v0.2.0"])).toEqual({ out: "", err: usage, status: 2 });
  const folder = temporary("refused");
  const refused = run(["--module", PACKAGE, "v0.2.0", folder, "no-such-task:1"]);
  expect(refused.status).toBe(1);
  expect(refused.err).toContain("no-such-task:1: novatrail/grade-3-math has no task no-such-task");
  expect(readdirSync(folder)).toEqual([]);
}, 60_000);
