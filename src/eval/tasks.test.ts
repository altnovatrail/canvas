import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import {
  ESSAYS,
  INVENTORY,
  type Json,
  RELEASE,
  repackaged,
  SERVER,
  taskIn,
} from "./packages.fixture.js";
import {
  canonicalText,
  MODULES_FILE,
  moduleTasksOf,
  type OpenTasks,
  openTasksOf,
  openViewsOf,
  TUTOR_FILE,
} from "./tasks.js";

const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");
/** A digest as the module format writes one: sha256 and 64 hexadecimal digits. */
const DIGEST = /^sha256:[0-9a-f]{64}$/;
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
        tag: "v0.1.22",
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
    module_format_version: "0.4",
    banks: [{ bank: "b.json", digest: "sha256:0", tasks }],
  });
  expect(open({ format: "tutor-open-tasks", version: 1, banks: [] })).toThrow(TypeError);
  // Of the version of the module format the element reads, and no other: the exception for 0.3 is
  // gone with tutor's file of 0.4 (T77, T85, T99).
  for (const other of ["0.2", "0.3", "0.5", undefined, 0.4, ["0.4"]]) {
    expect(open({ ...bank([]), module_format_version: other })).toThrow("module format 0.4");
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

/** The digests of the open views of the package's tasks, as module-kit open v0.3.0 gave them. */
const MODULE_KIT: Record<string, string> = {
  "comparing-fractions-d1": "72a81f42412f44185cd9cd10bd7d58e6d963ddaed0c94380da4788ba823a276c",
  "comparing-fractions-d3": "9e02e830e980e36060bf578c923a4b6195ac828e4c509ad9857dc14f14f38973",
  "comparing-fractions-d5": "6f21730493bd2c0c08caa2022e518d9a45358d6d1074317b29a2c2778e7177e5",
  "division-with-remainder-d1": "78cc6757e6014d698b86a5dbb1508454f69865e115684cfec9c9b201b7a57d0a",
  "division-with-remainder-d3": "52fd63d57be0cdea19078b3c2e807f8d6de121019ec4e3e9446c938a7a1f7718",
  "division-with-remainder-d5": "068018ebe0c6bf5d824708248d983518f9a9b5277b456b47b1a220358070f3bb",
  "fractions-of-a-whole-d1": "7c9c12957f9f42ea54e291d9178eaff901e360de45507b2a47ee887217c3ca11",
  "fractions-of-a-whole-d3": "51d00dbef8552b02688a9d3b788e00372d3d51f443c61830413eb75a1ee4094d",
  "fractions-of-a-whole-d5": "fa9260fc2e067f5aa0183f63b25d8546062224f3924cb22671e8b7b5e1c61c6d",
  "times-tables-d1": "fe02d3c41f49f2a4ffccc4b80fd385b6a2c492888f839c83154f8cb8ce0513fc",
  "times-tables-d3": "933fe0f2538bc59fef56d23b220e6ab5297be67c469bb33d79b516b72db56fac",
  "times-tables-d5": "e81bbfa41c551f462c4075ccf138bf76e41701c41a1c56510a80fb33ee84fe69",
};

test("a module's package gives each task the open view module-kit gives, by the chain from its release's index", () => {
  const index = JSON.parse(readFileSync(new URL("module-index.json", RELEASE), "utf8"));
  const entry = index.modules["novatrail/grade-3-math"]["0.2.0"];
  expect(entry.package_digest).toBe(`sha256:${sha256(INVENTORY)}`);
  const module = moduleTasksOf(INVENTORY, SERVER, "v0.2.0", sha256);
  expect([module.module, module.version, module.packageDigest]).toEqual([
    "novatrail/grade-3-math",
    "0.2.0",
    entry.package_digest,
  ]);
  const digests = Object.fromEntries(
    [...module.tasks].map(([id, task]) => [
      id,
      "reference" in task ? task.reference.openViewDigest?.replace("sha256:", "") : task.refused,
    ]),
  );
  expect(digests).toEqual(MODULE_KIT);
  const task = module.tasks.get("times-tables-d1");
  expect(task && "reference" in task && task.reference.source).toEqual({
    case: "modules",
    value: {
      tag: "v0.2.0",
      module: "novatrail/grade-3-math",
      version: "0.2.0",
      packageDigest: entry.package_digest,
    },
  });
  expect(task && "canvas" in task && "workbook" in task.canvas).toBe(true);
});

/** The digests of the open views of english-essays 0.2.0's tasks — five essays and three choices of
 * a first sentence, none of which the generator draws —, as module-kit open v0.3.0 gave them (T98). */
const MODULE_KIT_ESSAYS: Record<string, string> = {
  "a-day-you-remember-1": "ceb479179124f5eed1e7eed69b58dc6c4400cb283a81e1bd4a7d2e80b329798f",
  "best-first-sentence-1": "cc5418e741d51c3120837474b1393b8018752e68acc08e4c91a02fc650d89553",
  "best-first-sentence-2": "08a1e90c6c5edf8be1aa8040fc5ebb5265f0d1b8d71d5e02a70dc592ff90d491",
  "best-first-sentence-3": "090d28f5242e44a63951117b181ae0d05d02b00f3fe38c23c448bcd5096dd543",
  "dragon-draft-1": "26fb60fc8bb9c0cfcc1e5a2f783502b1483ad8a89cf45a13e0dcd451e8baa57b",
  "talking-umbrella-1": "bd9796689900f4801a2bebe82880c35867053ee0405b09333b6d91d7d9a77edc",
  "undiscovered-island-1": "b033ab537daafb06cc7170d562c439a97bda437cb7df0a4c5bd90d6461a1a08f",
  "weather-shop-1": "bbfeb4aee2a6514472f1ee9535e2242a18d37f487e32798217b5cff74edcf10d",
};

test("the essays and choices of english-essays 0.2.0 are refused with the digests module-kit gives their open views (T98)", () => {
  const index = JSON.parse(readFileSync(new URL("module-index.json", RELEASE), "utf8"));
  const inventory = readFileSync(new URL("inventory.json", ESSAYS), "utf8");
  const server = readFileSync(new URL("server.json", ESSAYS), "utf8");
  expect(`sha256:${sha256(inventory)}`).toBe(
    index.modules["novatrail/english-essays"]["0.2.0"].package_digest,
  );
  const module = moduleTasksOf(inventory, server, "v0.2.0", sha256);
  const digests = Object.fromEntries(
    [...module.tasks].map(([id, task]) => {
      const why = id.startsWith("best-first-sentence-") ? "a choice" : "an essay";
      expect(task).toEqual({ refused: why, openViewDigest: expect.any(String) });
      return [id, "openViewDigest" in task ? task.openViewDigest?.replace("sha256:", "") : ""];
    }),
  );
  expect(digests).toEqual(MODULE_KIT_ESSAYS);
});

// What the generator draws no sample of (T86; R63): each kept, with why, and with the digest of its
// open view, which a person's sample of it names (T97), but a template, which has none.
test.each([
  ["a template", (task: Json) => (task.template = { parameters: {} }), "a template"],
  [
    "a choice",
    (task: Json) => {
      task.canvas = { kind: "handwriting_sheet" };
      task.items = [{ answer_slots: [{ binding: "choice", options: ["1", "2"] }] }];
    },
    "a choice",
  ],
  [
    "an essay",
    (task: Json) => {
      task.canvas = { kind: "handwriting_sheet", grid: "lines" };
      task.items = [{ answer_slots: [{ binding: "sheet" }] }];
    },
    "an essay",
  ],
  [
    "two answer slots",
    (task: Json) => {
      task.canvas = { kind: "handwriting_sheet" };
      task.items = [
        { answer_slots: [{ binding: "anywhere" }] },
        { answer_slots: [{ binding: "anywhere" }] },
      ];
    },
    "not one answer slot anywhere on the sheet",
  ],
  [
    "a slot anywhere on a canvas of another kind",
    (task: Json) => {
      task.canvas = { kind: "number_line" };
      task.items = [{ answer_slots: [{ binding: "anywhere" }] }];
    },
    "a canvas of the kind number_line",
  ],
  [
    "a workbook of an answer slot outside its boxes",
    (task: Json) => {
      task.items = [...(task.items as Json[]), { answer_slots: [{ binding: "anywhere" }] }];
    },
    "a workbook with an answer slot outside its boxes",
  ],
])("a package's task that is %s is kept with why the generator draws none", (_, change, why) => {
  const [inventory, server] = repackaged((view) => change(taskIn(view)));
  const task = moduleTasksOf(inventory, server, "v0.2.0", sha256).tasks.get("times-tables-d1");
  expect(task).toEqual(
    why === "a template"
      ? { refused: expect.stringContaining(why) }
      : { refused: expect.stringContaining(why), openViewDigest: expect.stringMatching(DIGEST) },
  );
});

test("a sheet of one answer slot anywhere drops its closed fields, and a package out of shape is refused", () => {
  const [inventory, server] = repackaged((view) => {
    const task = taskIn(view);
    task.canvas = { kind: "handwriting_sheet" };
    task.items = [{ answer_slots: [{ binding: "anywhere", check: { kind: "number", key: 7 } }] }];
  });
  const sheet = moduleTasksOf(inventory, server, "v0.2.0", sha256).tasks.get("times-tables-d1");
  expect(sheet && "canvas" in sheet && sheet.canvas).toEqual({ sheet: true });
  const of =
    (texts: [string, string], tag = "v0.2.0") =>
    () =>
      moduleTasksOf(texts[0], texts[1], tag, sha256);
  expect(of([INVENTORY, SERVER], "0.2.0")).toThrow("no tag of a release");
  expect(of([INVENTORY, `${SERVER} `])).toThrow("not the server part its inventory names");
  const moved = (change: Record<string, unknown>) =>
    of([canonicalText({ ...JSON.parse(INVENTORY), ...change }), SERVER]);
  expect(moved({ module_format_version: "0.3" })).toThrow("module format 0.4");
  expect(moved({ id: "grade-3-math" })).toThrow("<publisher>/<name>");
  expect(moved({ version: "0.2" })).toThrow("MAJOR.MINOR.PATCH");
  expect(of(repackaged((view) => ((view.tasks as Json).other = taskIn(view))))).toThrow(
    "is not under its own ID",
  );
  expect(of(repackaged((view) => delete view.tasks))).toThrow("has no tasks");
  expect(of(repackaged((view) => ((view.tasks as Json).other = null)))).toThrow(
    "the task other of novatrail/grade-3-math is no object",
  );
});

/** The copy of the open views of modules the samples page carries (T101). */
const views = readFileSync(
  new URL(`../../tasks/modules-${MODULES_FILE.tag}/open-views.json`, import.meta.url),
);

test("the copy of the open views is the one module-kit wrote: its sum, its modules, and every task's digest its open view's (T101)", () => {
  expect(createHash("sha256").update(views).digest("hex")).toBe(MODULES_FILE.sha256);
  const modules = openViewsOf(views.toString("utf8"), sha256);
  expect(modules.map(({ module, version, tasks }) => [module, version, tasks.length])).toEqual([
    ["novatrail/english-essays", "0.2.0", 8],
    ["novatrail/grade-3-math", "0.3.0", 12],
    ["novatrail/olympiad-math", "0.3.0", 863],
  ]);
  const olympiad = modules[2];
  const instances = olympiad?.tasks.filter(({ open }) => open.reference.seed !== undefined) ?? [];
  // 22 templates, an instance of each of the five seeds.
  expect(instances).toHaveLength(22 * MODULES_FILE.seeds.length);
  expect(new Set(instances.map(({ open }) => open.reference.seed))).toEqual(
    new Set(MODULES_FILE.seeds),
  );
  const [first] = instances;
  expect(first?.open.reference).toEqual({
    source: {
      case: "modules",
      value: {
        tag: "v0.2.1",
        module: "novatrail/olympiad-math",
        version: "0.3.0",
        packageDigest: "sha256:e4de172e77b7cde20386b07c1cafbbf08babb41a164d623c62135659eec45786",
      },
    },
    task: "ages",
    seed: "1",
    openViewDigest: "sha256:5e8b8e08ed7ffc780db304fd062bed09c7805e9ef1b421a370c82def7d269080",
  });
  expect(olympiad?.manifest.module_format_version).toBe("0.4");
});

test("open views of another format, a closed field, another digest or a seed out of shape are refused (T101)", () => {
  const file = JSON.parse(views.toString("utf8")) as {
    format: string;
    module_format_version: string;
    modules: {
      release: string;
      tasks: { task: Json; seed?: unknown; open_view_digest: string }[];
    }[];
  };
  const refused = (change: (copy: typeof file) => void) => {
    const copy = structuredClone(file);
    change(copy);
    return () => openViewsOf(JSON.stringify(copy), sha256);
  };
  expect(refused((copy) => Object.assign(copy, { format: "tutor-open-tasks" }))).toThrow(
    "module-kit-open-views of the version 0",
  );
  expect(refused((copy) => Object.assign(copy, { module_format_version: "0.3" }))).toThrow(
    "of the module format 0.4",
  );
  expect(refused((copy) => Object.assign(copy.modules[0] ?? {}, { release: "main" }))).toThrow(
    "has no release of modules",
  );
  const module = (fields: object) =>
    refused((copy) => Object.assign(copy.modules[0] ?? {}, fields));
  expect(module({ id: "english-essays" })).toThrow("a module of the open views has an ID");
  expect(module({ version: "0.2" })).toThrow("has no version MAJOR.MINOR.PATCH");
  expect(module({ package_digest: "sha256:0" })).toThrow("has no digest of its package");
  expect(module({ module_format_version: "0.3" })).toThrow("is not of the module format 0.4");
  expect(module({ manifest: [] })).toThrow("has no manifest");
  expect(module({ tasks: {} })).toThrow("has no tasks");
  expect(
    refused((copy) => Object.assign(copy.modules[0]?.tasks[0]?.task ?? {}, { id: 7 })),
  ).toThrow("a task of novatrail/english-essays has no ID");
  expect(
    refused((copy) => Object.assign(copy.modules[0]?.tasks[0]?.task ?? {}, { solution: "x" })),
  ).toThrow("solution is no field of the open view");
  expect(
    refused((copy) =>
      Object.assign(copy.modules[0]?.tasks[0] ?? {}, {
        open_view_digest: `sha256:${"0".repeat(64)}`,
      }),
    ),
  ).toThrow("its digest is not that of its open view");
  expect(refused((copy) => Object.assign(copy.modules[2]?.tasks[0] ?? {}, { seed: "01" }))).toThrow(
    "a seed is an unsigned integer in decimal digits",
  );
});
