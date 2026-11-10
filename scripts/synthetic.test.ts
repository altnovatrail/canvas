import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { TUTOR_FILE } from "../src/eval/tasks.js";
import { temporary } from "./folders.fixture.ts";
import { listOf, writeSet } from "./synthetic.ts";

test("the set is written one file to a sample, named by its ID, and a line printed for each", () => {
  const folder = temporary("synthetic");
  // A file of an older set goes; anything else in the folder stays.
  writeFileSync(join(folder, "synthetic-1.json"), "{}");
  writeFileSync(join(folder, "notes.txt"), "kept");
  mkdirSync(join(folder, "synthetic-2.json.d"));
  const lines = writeSet(folder, ".");
  const ids = lines.map((line) => line.split("\t")[0]);
  expect(readdirSync(folder).sort()).toEqual(
    [...ids.map((id) => `${id}.json`), "notes.txt", "synthetic-2.json.d"].sort(),
  );
  expect(lines[0]).toBe(
    "synthetic-101\tMEASUREMENT\tADULT\ta solution of lines and its final answer, ringed, with no first error",
  );
  expect(listOf(lines.slice(0, 2)).split("\n")).toEqual([
    "id\tpurpose\twriter\tscenario",
    lines[0],
    lines[1],
    "",
  ]);
  const text = readFileSync(join(folder, `${ids[0]}.json`), "utf8");
  expect(JSON.parse(text)).toMatchObject({ id: ids[0], protocol: "novatrail.eval.v1" });
}, 30_000);

test("ci-licenses verifies the release of tutor the samples answer", () => {
  expect(readFileSync("justfile", "utf8")).toContain(`\ntutor_tag := "${TUTOR_FILE.tag}"\n`);
  expect(TUTOR_FILE.name).toBe(`tutor_${TUTOR_FILE.tag}_open-tasks.json`);
});

test("a file of open tasks other than the one release-verify accepted is refused", () => {
  const root = temporary("synthetic");
  mkdirSync(join(root, "tasks"));
  const bytes = readFileSync(join("tasks", TUTOR_FILE.name));
  writeFileSync(join(root, "tasks", TUTOR_FILE.name), Buffer.concat([bytes, Buffer.from(" ")]));
  expect(() => writeSet(join(root, "set"), root)).toThrow(`not ${TUTOR_FILE.sha256}`);
  expect(readdirSync(root)).toEqual(["tasks"]);
});
