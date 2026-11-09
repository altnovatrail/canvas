import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { canonicalText, type OpenTasks, openTasksOf, TUTOR_FILE } from "./tasks.js";

const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");
const bytes = readFileSync(new URL(`../../tasks/${TUTOR_FILE.name}`, import.meta.url));

/** The tasks of the file the tree holds, as the synthetic samples take them. */
function tasks(): OpenTasks {
  return openTasksOf(JSON.parse(bytes.toString("utf8")), TUTOR_FILE.tag, TUTOR_FILE.sha256, sha256);
}

test("the file the tree holds is the one release-verify accepted", () => {
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(TUTOR_FILE.sha256);
});

test("a task's reference names the release, the file, the bank and the digest of its open view", () => {
  const all = tasks();
  expect([...all.keys()]).toEqual([
    "eval/bank.json",
    "eval/free-bank.json",
    "eval/workbook.json",
    "eval/essays.json",
  ]);
  const [equation] = all.get("eval/bank.json") ?? [];
  expect(equation?.reference).toEqual({
    source: {
      case: "tutor",
      value: {
        tag: "v0.1.10",
        fileDigest: `sha256:${TUTOR_FILE.sha256}`,
        bank: "eval/bank.json",
        bankDigest: "sha256:c6f25b486faa79aa344eeb1dee6bd2aae8c069fd670a0d20c3fe929aeb9fdf13",
      },
    },
    task: "equation-1",
    // The digest spec's example sheet-measurement.json names for the same task of tutor v0.1.1.
    openViewDigest: "sha256:96d317ad771f0a9478406ae88992f4495c8e1d7665d088f6d54a4b86b3ede0b8",
  });
  expect(equation?.canvas).toEqual({ sheet: true });
  const [workbook] = all.get("eval/workbook.json") ?? [];
  // And the one its example workbook-child.json names.
  expect(workbook?.reference.openViewDigest).toBe(
    "sha256:62c09c1e098e33c8eb8f2598ec187b19b72facebb61c2a6064b4d2a89e1e43da",
  );
  expect(workbook?.canvas).toMatchObject({ workbook: { length: 10 } });
});

test("a file of another format, a bank or a task short of what it needs, is refused", () => {
  const open = (file: unknown) => () => openTasksOf(file, "v0.0.1", "0".repeat(64), sha256);
  const bank = (tasks: unknown) => ({
    format: "tutor-open-tasks",
    version: 0,
    module_format_version: "0.3",
    banks: [{ bank: "b.json", digest: "sha256:0", tasks }],
  });
  expect(open({ format: "tutor-open-tasks", version: 1, banks: [] })).toThrow(TypeError);
  // Of the version of the module format the element reads, or of 0.3 before it, and no other
  // (T77, T85): tutor's file is still of 0.3, whose open view 0.4 keeps.
  for (const other of ["0.2", "0.5", undefined, 0.4, ["0.3"]]) {
    expect(open({ ...bank([]), module_format_version: other })).toThrow("module format 0.4 or 0.3");
  }
  expect(open({ ...bank([]), module_format_version: "0.4" })()).toEqual(new Map([["b.json", []]]));
  expect(open({ ...bank([]), banks: [{ bank: "b.json" }] })).toThrow(TypeError);
  const twice = { bank: "b.json", digest: "sha256:0", tasks: [] };
  expect(open({ ...bank([]), banks: [twice, twice] })).toThrow("b.json is in the file twice");
  expect(open(bank([{ canvas: { kind: "handwriting_sheet" } }]))).toThrow("no ID");
  expect(open(bank([{ id: "t", canvas: { kind: "text" } }]))).toThrow("neither");
  expect(open(bank([{ id: "t", canvas: { kind: "workbook" } }]))).toThrow("neither");
  expect(open(bank([]))()).toEqual(new Map([["b.json", []]]));
});

/** A place in JSON: the names and indexes that lead to it. */
type Place = readonly (string | number)[];

/** The file the tree holds, its first workbook task given each value at its place in it. */
function changed(...changes: readonly (readonly [Place, unknown])[]): unknown {
  const file = JSON.parse(bytes.toString("utf8"));
  for (const [place, value] of changes) {
    const parent = place
      .slice(0, -1)
      .reduce(
        (at: Record<string | number, unknown>, step) => at[step] as typeof at,
        file.banks[2].tasks[0],
      );
    parent[place[place.length - 1] as string | number] = value;
  }
  return file;
}

/** The tasks of a file, of the tree's release and sum. */
const opened = (file: unknown) => () =>
  openTasksOf(file, TUTOR_FILE.tag, TUTOR_FILE.sha256, sha256);

// Closed fields of a task of the module format, and what is no field at all (T21; R62).
test.each<readonly [string, Place, unknown, string]>([
  ["solution", ["solution"], "5", "workbook-01: solution is no field"],
  ["traps", ["traps"], [], "workbook-01: traps is no field"],
  ["leading_question", ["leading_question"], "?", "leading_question is no field"],
  [
    "a key in an answer slot",
    ["items", 0, "line", 1, "check"],
    { kind: "number", key: 5 },
    "workbook-01: items[0] line[1] check is no field",
  ],
  [
    "a field in a zone",
    ["items", 0, "answer_slots"],
    [{ binding: "zone", zone: { left: 0, key: 1 } }],
    "answer_slots[0] zone key is no field",
  ],
  ["an object for a text", ["statement", 0, "text"], { key: 5 }, "no text, number or truth value"],
  ["an object for a list", ["items"], {}, "items is no list"],
  ["a text for a list of texts", ["givens"], "5", "givens is no list of texts"],
  ["a list for an object", ["canvas"], [], "canvas is no object"],
  ["a name no object owns", ["constructor"], 1, "constructor is no field"],
])("a task with %s is refused", (_, place, value, message) => {
  expect(opened(changed([place, value]))).toThrow(message);
});

test("every open field the format has passes", () => {
  const file = changed(
    [["givens"], ["23"]],
    [["unknown"], "x"],
    [["statement", 1], { picture: "p.png", alt: "a", width: 10, height: 10 }],
    [["canvas", "grid_step"], 50],
    [["items", 0, "text"], "t"],
    [["items", 0, "answer_slots"], [{ binding: "choice", options: ["a"] }]],
  );
  expect(opened(file)).not.toThrow();
});

test("the canonical text orders members by their names' code units, with no white space", () => {
  expect(canonicalText({ b: [1, "é"], a: { é: null, Z: true, z: false } })).toBe(
    '{"a":{"Z":true,"z":false,"é":null},"b":[1,"é"]}',
  );
  expect(canonicalText('"\\\n\u0007/<')).toBe('"\\"\\\\\\n\\u0007/<"');
  expect(() => canonicalText(0.5)).toThrow(RangeError);
});
