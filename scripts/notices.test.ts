// The license notices a file of a release carries (R55, R68 in docs/decisions.md): which packages a
// bundle carries, and the text of each one's license, or why the build stops.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { temporary } from "./folders.fixture.ts";
import { carried, keptName, packagesOf } from "./notices.ts";

test("finds the folders of a bundle's packages, scoped and nested ones too, once each", () => {
  expect(
    packagesOf([
      "/w/node_modules/rbush/index.js",
      "/w/node_modules/rbush/other.js",
      "/w/node_modules/@bufbuild/protobuf/dist/esm/wire/varint.js",
      "/w/node_modules/rbush/node_modules/quickselect/index.js",
      "C:\\w\\node_modules\\perfect-freehand\\dist\\index.js",
      "/w/src/core/ink.ts",
    ]),
  ).toEqual([
    "/w/node_modules/@bufbuild/protobuf",
    "/w/node_modules/rbush",
    "/w/node_modules/rbush/node_modules/quickselect",
    "C:/w/node_modules/perfect-freehand",
  ]);
  expect(keptName("@bufbuild/protobuf", "2.16.0")).toBe("bufbuild-protobuf-2.16.0.txt");
});

test("takes a package's license from its folder or the kept copy, and refuses one off the list or without a text", () => {
  const root = temporary("canvas-carried");
  const pkg = (name: string, license: string, file?: string) => {
    const at = join(root, name);
    mkdirSync(at, { recursive: true });
    writeFileSync(join(at, "package.json"), JSON.stringify({ name, version: "1.0.0", license }));
    if (file) writeFileSync(join(at, "LICENSE.md"), file);
    return at;
  };
  const kept = join(root, "kept");
  mkdirSync(kept);
  writeFileSync(join(kept, "b-1.0.0.txt"), "kept text");
  expect(carried(pkg("a", "MIT", "own text"), kept).text).toBe("own text");
  expect(carried(pkg("b", "ISC"), kept).text).toBe("kept text");
  expect(() => carried(pkg("c", "MIT"), kept)).toThrow("c 1.0.0 has no text of its license");
  expect(() => carried(pkg("d", "GPL-3.0-only", "text"), kept)).toThrow(
    "d carries GPL-3.0-only, which is off the list",
  );
});
