import { expect, test } from "vitest";
import { archiveName, archiveProblems, type Packed } from "./release.ts";

const NAME = "@altnovatrail/canvas";

const archive: Packed = {
  name: NAME,
  version: "0.1.0",
  filename: "altnovatrail-canvas-0.1.0.tgz",
  files: [
    { path: "package.json" },
    { path: "LICENSE" },
    { path: "NOTICE" },
    { path: "README.md" },
    { path: "lib/core/index.js" },
    { path: "lib/core/index.d.ts" },
    { path: "lib/element/index.js" },
    { path: "lib/element/index.d.ts" },
  ],
};

test("npm pack names the archive of a scoped package by its scope and name joined by a dash", () => {
  expect(archiveName(NAME, "0.1.0")).toBe("altnovatrail-canvas-0.1.0.tgz");
  expect(archiveName("plain", "1.2.3")).toBe("plain-1.2.3.tgz");
});

test("the release's archive, at its version and with the build alone, has no problem", () => {
  expect(archiveProblems([archive], NAME, "0.1.0")).toEqual([]);
});

test("another version, name or file name than the release's is a problem, each of them", () => {
  expect(
    archiveProblems(
      [{ ...archive, name: "@altnovatrail/sheet", version: "0.0.0", filename: "canvas.tgz" }],
      NAME,
      "0.1.0",
    ),
  ).toEqual([
    "the archive holds @altnovatrail/sheet, not @altnovatrail/canvas",
    "the archive holds version 0.0.0, not the release's 0.1.0",
    "the archive is canvas.tgz, not altnovatrail-canvas-0.1.0.tgz",
  ]);
});

test("a file the build does not ship is a problem, and so is a file it leaves out", () => {
  const files = [...archive.files.filter(({ path }) => path !== "LICENSE"), { path: "src/x.ts" }];
  expect(archiveProblems([{ ...archive, files }], NAME, "0.1.0")).toEqual([
    "npm pack takes src/x.ts, which is not part of the build",
    "npm pack leaves out LICENSE",
  ]);
});

test("no archive, or two, is a problem of its own", () => {
  expect(archiveProblems([], NAME, "0.1.0")).toEqual(["npm pack made 0 archives, not one"]);
  expect(archiveProblems([archive, archive], NAME, "0.1.0")).toEqual([
    "npm pack made 2 archives, not one",
  ]);
});
