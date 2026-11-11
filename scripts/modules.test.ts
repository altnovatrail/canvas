// The copy of the open views of modules the samples page carries (T101; R71): which packages
// module-kit open takes of an index, which files the copy holds, and every difference from what
// module-kit wrote that the check finds. just modules-open runs module-kit itself, in ci-licenses.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { expect, test } from "vitest";
import { FORMAT } from "../src/core/manifest.ts";
import { MODULES_FILE } from "../src/eval/tasks.ts";
import { temporary } from "./folders.fixture.ts";
import { differencesOf, filesOf, packagesOf, writeCopy } from "./modules.ts";
import { MODULE_FORMAT } from "./open-views.ts";
import { modulesFolder } from "./page.ts";

const A = `sha256:${"a".repeat(64)}`;
const B = `sha256:${"b".repeat(64)}`;
const C = `sha256:${"c".repeat(64)}`;

test("the justfile's release of modules and seeds are MODULES_FILE's, and so is the copy's folder", () => {
  const justfile = readFileSync("justfile", "utf8");
  expect(justfile).toContain(`\npage_modules_tag := "${MODULES_FILE.tag}"\n`);
  expect(justfile).toContain(`\nopen_seeds := "${MODULES_FILE.seeds.join(" ")}"\n`);
  expect(justfile).toContain("\n    {{ quote(just_executable()) }} modules-open check\n");
  expect(modulesFolder(MODULES_FILE.tag)).toBe("tasks/modules-v0.2.4");
});

test("module-kit open takes of each module its newest version of the element's format, not withdrawn", () => {
  const index = {
    module_format_version: "0.4",
    modules: {
      "a/m": {
        "0.9.0": { module_format_version: "0.4", package_digest: A, release: "v0.1.0" },
        "0.10.0": { module_format_version: "0.4", package_digest: B, release: "v0.2.0" },
        "1.0.0": { module_format_version: "0.3", package_digest: C, release: "v0.3.0" },
      },
      "a/n": {
        "0.1.0": { module_format_version: "0.4", package_digest: A, release: "v0.1.0" },
        "0.2.0": {
          module_format_version: "0.4",
          package_digest: C,
          release: "v0.3.0",
          withdrawn: {},
        },
      },
      "a/o": { "0.1.0": { module_format_version: "0.3", package_digest: C, release: "v0.1.0" } },
    },
  };
  // 0.10.0 after 0.9.0, by numbers and not by text; 1.0.0 is of another format, 0.2.0 withdrawn,
  // and a/o has nothing of 0.4.
  expect(packagesOf(index)).toEqual([
    { release: "v0.2.0", digest: B },
    { release: "v0.1.0", digest: A },
  ]);
  expect(() => packagesOf({})).toThrow("an index of modules has its modules");
  expect(() => packagesOf({ modules: { "a/m": { "1.0": {} } } })).toThrow("a/m 1.0 is no version");
  expect(() =>
    packagesOf({ modules: { "a/m": { "1.0.0": { module_format_version: "0.4" } } } }),
  ).toThrow("a/m 1.0.0 has no release or digest of its package");
});

/** What module-kit open would write: open-views.json, and of each module its files. */
function written(folder: string, files: Readonly<Record<string, string>>): void {
  const views = {
    format: "module-kit-open-views",
    version: 0,
    module_format_version: "0.4",
    modules: [
      {
        id: "a/m",
        version: "1.0.0",
        tasks: [
          {
            task: {
              id: "s",
              statement: [{ picture: "pictures/s.png" }],
              canvas: { kind: "handwriting_sheet" },
              items: [{ answer_slots: [{ binding: "anywhere" }] }],
            },
          },
          {
            task: {
              id: "c",
              statement: [{ picture: "pictures/c.png" }],
              canvas: { kind: "handwriting_sheet" },
              items: [{ answer_slots: [{ binding: "choice", options: ["1", "2"] }] }],
            },
          },
        ],
      },
    ],
  };
  for (const [path, text] of Object.entries({
    "open-views.json": JSON.stringify(views),
    ...files,
  })) {
    mkdirSync(dirname(join(folder, path)), { recursive: true });
    writeFileSync(join(folder, path), text);
  }
}

const MODULE = "modules/a/m/1.0.0";

test("the copy holds the open views, each module's LICENSE and NOTICE, and the media of the tasks the page takes alone", () => {
  const out = temporary("modules-out");
  written(out, {
    [`${MODULE}/LICENSE`]: "license",
    [`${MODULE}/NOTICE`]: "notice",
    [`${MODULE}/media/pictures/s.png`]: "s",
    [`${MODULE}/media/pictures/c.png`]: "c",
    [`${MODULE}/media/lessons/l.png`]: "l",
  });
  // Not the picture of a choice the learner taps, nor a lesson's.
  expect(filesOf(out)).toEqual([
    `${MODULE}/LICENSE`,
    `${MODULE}/NOTICE`,
    `${MODULE}/media/pictures/s.png`,
  ]);
  const copy = temporary("modules-copy");
  writeFileSync(join(copy, "module-index.json"), "{}");
  // A file of an older copy goes; the index stays.
  mkdirSync(join(copy, "modules/a/old"), { recursive: true });
  writeFileSync(join(copy, "modules/a/old/LICENSE"), "old");
  writeCopy(out, copy);
  expect(differencesOf(out, copy)).toEqual([]);
  expect(readFileSync(join(copy, "module-index.json"), "utf8")).toBe("{}");
  expect(readFileSync(join(copy, `${MODULE}/media/pictures/s.png`), "utf8")).toBe("s");
});

test("the check names every difference from what module-kit wrote: other bytes, a file missing, a file no task names", () => {
  const out = temporary("modules-out");
  written(out, { [`${MODULE}/LICENSE`]: "license", [`${MODULE}/media/pictures/s.png`]: "s" });
  const copy = temporary("modules-copy");
  writeCopy(out, copy);
  writeFileSync(join(copy, "open-views.json"), "{}");
  writeFileSync(join(copy, `${MODULE}/LICENSE`), "another");
  writeFileSync(join(copy, `${MODULE}/media/pictures/x.png`), "x");
  expect(differencesOf(out, copy)).toEqual([
    "open-views.json: not the bytes module-kit open wrote",
    `${MODULE}/LICENSE: not the bytes module-kit open wrote`,
    `${MODULE}/media/pictures/x.png: no task the page takes names it`,
  ]);
  writeCopy(out, copy);
  writeFileSync(join(out, `${MODULE}/NOTICE`), "notice");
  expect(differencesOf(out, copy)).toEqual([`${MODULE}/NOTICE: not in the copy`]);
});

test("the copy's format is the element's, and a picture's path outside media/ is refused", () => {
  expect(MODULE_FORMAT).toBe(FORMAT);
  const out = temporary("modules-out");
  written(out, { [`${MODULE}/LICENSE`]: "license" });
  const views = JSON.parse(readFileSync(join(out, "open-views.json"), "utf8"));
  views.modules[0].tasks[0].task.statement[0].picture = "../../../../justfile";
  writeFileSync(join(out, "open-views.json"), JSON.stringify(views));
  expect(() => filesOf(out)).toThrow("../../../../justfile is no path inside a module's media/");
});
