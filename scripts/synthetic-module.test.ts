// The synthetic samples of a module's eval set (T86, T96 in RUN.md; R63, R68 in
// docs/decisions.md): what writeModuleSamples writes and refuses, as the generator's file runs it,
// and the digests of the tasks' open views that moduleDigests prints (T97).

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import {
  type Json,
  PACKAGE as MODULE_PACKAGE,
  repackaged,
  taskIn,
} from "../src/eval/packages.fixture.ts";
import { readSample } from "../src/eval/sample.ts";
import { temporary } from "./folders.fixture.ts";
import { moduleDigests, writeModuleSamples } from "./synthetic-module.ts";

// The samples of a module's eval set (T86; R63), on grade-3-math 0.2.0 from the release of modules
// v0.2.0, which ci-licenses verifies.
const PACKAGE = fileURLToPath(MODULE_PACKAGE);

/** A package written into a folder of its own: grade-3-math with its view changed, named anew. */
function packageWith(change: (view: Json) => void, module?: string): string {
  const [inventory, server] = repackaged(change, module);
  const folder = temporary("package");
  writeFileSync(join(folder, "inventory.json"), inventory);
  writeFileSync(join(folder, "server.json"), server);
  return folder;
}

test("a module's samples are written one file to a seed, and a seed of the same task again", () => {
  const folder = temporary("eval");
  const lines = writeModuleSamples(PACKAGE, "v0.2.0", folder, [
    "times-tables-d1:201",
    "division-with-remainder-d1:202",
  ]);
  expect(lines.map((line) => line.split("\t").slice(0, 2))).toEqual([
    ["synthetic-201", "times-tables-d1"],
    ["synthetic-202", "division-with-remainder-d1"],
  ]);
  const first = readFileSync(join(folder, "synthetic-201.json"), "utf8");
  expect(JSON.parse(first)).toMatchObject({ purpose: "PURPOSE_EVAL_SET", license: "Apache-2.0" });
  writeFileSync(join(folder, "synthetic-201.json"), "{}");
  // A file of the seed that is no sample of the task is no sample to write over.
  expect(() => writeModuleSamples(PACKAGE, "v0.2.0", folder, ["times-tables-d1:201"])).toThrow(
    "synthetic-201.json is no sample file",
  );
  writeFileSync(join(folder, "synthetic-201.json"), first);
  writeModuleSamples(PACKAGE, "v0.2.0", folder, ["times-tables-d1:201"]);
  expect(readFileSync(join(folder, "synthetic-201.json"), "utf8")).toBe(first);
}, 30_000);

test("a call that names another task's seed, a task the generator draws none of, or none, writes nothing", () => {
  const folder = temporary("eval");
  writeModuleSamples(PACKAGE, "v0.2.0", folder, ["times-tables-d1:201"]);
  const before = readFileSync(join(folder, "synthetic-201.json"), "utf8");
  const choice = packageWith((view) => {
    const task = taskIn(view, "times-tables-d3");
    task.canvas = { kind: "handwriting_sheet" };
    task.items = [{ answer_slots: [{ binding: "choice", options: ["1", "2"] }] }];
  });
  const calls = [
    "times-tables-d5:201",
    "times-tables-d3:203",
    "fractions:204",
    "x",
    "times-tables-d1:205",
    "times-tables-d1:205",
  ];
  expect(() => writeModuleSamples(choice, "v0.2.0", folder, calls)).toThrow(
    [
      "times-tables-d5:201: synthetic-201.json is a sample of times-tables-d1 of novatrail/grade-3-math",
      "times-tables-d3:203: times-tables-d3 is a choice",
      "fractions:204: novatrail/grade-3-math has no task fractions",
      "x: no <task>:<seed>, a seed below 2^32",
      "times-tables-d1:205: the seed 205 is named twice",
    ].join("\n"),
  );
  expect(() => writeModuleSamples(PACKAGE, "v0.2.0", folder, [])).toThrow(
    "no <task>:<seed> is named",
  );
  // A seed of 33 bits, and a page that does not lay out: named too, and still nothing is written.
  const crowded = packageWith((view) => {
    const task = taskIn(view);
    task.items = Array.from({ length: 30 }, () => ({
      line: [{ text: "1 + 1 =" }, { binding: "box" }],
    }));
  });
  expect(() =>
    writeModuleSamples(crowded, "v0.2.0", folder, [
      "times-tables-d1:206",
      "times-tables-d3:4294967296",
    ]),
  ).toThrow(
    /times-tables-d1:206: .+\ntimes-tables-d3:4294967296: no <task>:<seed>, a seed below 2\^32/,
  );
  expect(readdirSync(folder)).toEqual(["synthetic-201.json"]);
  expect(readFileSync(join(folder, "synthetic-201.json"), "utf8")).toBe(before);
});

test("a person's sample of the same task is never written over", () => {
  const folder = temporary("eval");
  writeModuleSamples(PACKAGE, "v0.2.0", folder, ["times-tables-d1:207"]);
  const path = join(folder, "synthetic-207.json");
  const person = JSON.parse(readFileSync(path, "utf8"));
  delete person.synthetic;
  person.person = {};
  writeFileSync(path, JSON.stringify(person));
  expect(() => writeModuleSamples(PACKAGE, "v0.2.0", folder, ["times-tables-d1:207"])).toThrow(
    "synthetic-207.json is a person's sample",
  );
});

test("examples/module-sheet-eval-set.json is a module's sheet, as the generator writes it", async () => {
  // A module of its own name, whose task is a sheet of one answer slot anywhere, keyed as any.
  const sheet = packageWith((view) => {
    const task = taskIn(view);
    task.canvas = { kind: "handwriting_sheet", grid: "squares" };
    task.statement = [{ text: "How many legs do 3 spiders have?" }];
    task.items = [{ answer_slots: [{ binding: "anywhere", check: { kind: "number", key: 24 } }] }];
  }, "example/sheets");
  const folder = temporary("eval");
  writeModuleSamples(sheet, "v0.2.0", folder, ["times-tables-d1:401"]);
  await expect(readFileSync(join(folder, "synthetic-401.json"), "utf8")).toMatchFileSnapshot(
    "../examples/module-sheet-eval-set.json",
  );
});

// The digests of the tasks' open views (T97): a module's CI holds people's samples to them.
const TASKS = [
  "comparing-fractions-d1",
  "comparing-fractions-d3",
  "comparing-fractions-d5",
  "division-with-remainder-d1",
  "division-with-remainder-d3",
  "division-with-remainder-d5",
  "fractions-of-a-whole-d1",
  "fractions-of-a-whole-d3",
  "fractions-of-a-whole-d5",
  "times-tables-d1",
  "times-tables-d3",
  "times-tables-d5",
];

test("a task's digest is the one its sample names, a line to a task in the order named", () => {
  const folder = temporary("eval");
  writeModuleSamples(
    PACKAGE,
    "v0.2.0",
    folder,
    TASKS.map((task, index) => `${task}:${501 + index}`),
  );
  const named = TASKS.map((task, index) => {
    const sample = readSample(readFileSync(join(folder, `synthetic-${501 + index}.json`), "utf8"));
    return `${task}\t${sample.task?.openViewDigest}`;
  });
  const order = [...TASKS].reverse();
  expect(moduleDigests(PACKAGE, order)).toEqual({ lines: [...named].reverse(), wrong: [] });
  expect(named.every((line) => /\tsha256:[0-9a-f]{64}$/.test(line))).toBe(true);
  // Twelve drawn, workbooks among them: a time of its own, as the generator's tests have.
}, 60_000);

test("a task the generator draws none of has a digest, but a template or a task not there is named", () => {
  const choice = packageWith((view) => {
    const task = taskIn(view);
    task.canvas = { kind: "handwriting_sheet" };
    task.items = [{ answer_slots: [{ binding: "choice", options: ["1", "2"] }] }];
  });
  const [line] = moduleDigests(choice, ["times-tables-d1"]).lines;
  expect(line).toMatch(/^times-tables-d1\tsha256:[0-9a-f]{64}$/);
  expect(line).not.toBe(moduleDigests(PACKAGE, ["times-tables-d1"]).lines[0]);
  // The others' lines come all the same, and each that has no digest is named.
  const template = packageWith((view) => {
    taskIn(view).template = { parameters: {} };
  });
  expect(moduleDigests(template, ["times-tables-d1", "times-tables-d3", "no-such-task"])).toEqual({
    lines: moduleDigests(PACKAGE, ["times-tables-d3"]).lines,
    wrong: [
      "times-tables-d1: no open view, being a template: its instance by a seed is module-kit's",
      "no-such-task: novatrail/grade-3-math has no task no-such-task",
    ],
  });
});
