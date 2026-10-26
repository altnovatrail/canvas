import { expect, test } from "vitest";
import { packProblems } from "./package.ts";

const build = [
  "package.json",
  "LICENSE",
  "README.md",
  "lib/core/index.js",
  "lib/core/index.d.ts",
  "lib/element/index.js",
  "lib/element/index.d.ts",
];

test("the build, package.json, README.md and LICENSE are what the package takes", () => {
  expect(packProblems(build)).toEqual([]);
});

test("the build may have folders of its own", () => {
  expect(packProblems([...build, "lib/core/ink/stroke.js", "lib/core/ink/stroke.d.ts"])).toEqual(
    [],
  );
});

test("anything else in the package is a problem: sources, tests and their fixtures, a build nested a level deeper", () => {
  expect(
    packProblems([
      ...build,
      "src/core/index.ts",
      "lib/core/sheet.test.js",
      "lib/core/sheets.fixture.js",
      "lib/src/core/index.js",
    ]),
  ).toEqual([
    "npm pack takes src/core/index.ts, which is not part of the build",
    "npm pack takes lib/core/sheet.test.js, which is not part of the build",
    "npm pack takes lib/core/sheets.fixture.js, which is not part of the build",
    "npm pack takes lib/src/core/index.js, which is not part of the build",
  ]);
});

test("a package without the build or the license is a problem", () => {
  expect(packProblems(["package.json", "README.md"])).toEqual([
    "npm pack leaves out LICENSE",
    "npm pack leaves out lib/core/index.js",
    "npm pack leaves out lib/element/index.js",
  ]);
});
