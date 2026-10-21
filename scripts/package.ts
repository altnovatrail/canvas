// After just build: the package the way a consumer takes it (R07, R12 in docs/decisions.md).
//
//   node scripts/package.ts
//
// The DOM-free part imports in plain Node by the package's name, with no DOM around; both entry
// points and their declarations are where package.json says; and npm pack takes the build and
// nothing of the sources, the tests or the tools. Run from the repository's root, inside the
// package, where Node resolves the package's own name.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** The paths npm pack takes, besides the build: package.json and the files npm always adds. */
const ALWAYS = new Set(["package.json", "README.md", "LICENSE"]);
/** A file of the build: JavaScript or a declaration, at any depth under lib/core or lib/element. */
const BUILT = /^lib\/(core|element)\/(?:[^/]+\/)*[^/]+\.(js|d\.ts)$/;
/** What the build leaves out (tsconfig.build.json): the tests and the type-only checks. */
const NOT_SHIPPED = /\.(test|check)\.(js|d\.ts)$/;

/** Every problem with the files npm pack takes. */
export function packProblems(paths: readonly string[]): string[] {
  const problems: string[] = [];
  for (const path of paths) {
    if (ALWAYS.has(path)) continue;
    if (!BUILT.test(path) || NOT_SHIPPED.test(path)) {
      problems.push(`npm pack takes ${path}, which is not part of the build`);
    }
  }
  for (const path of ["package.json", "LICENSE", "lib/core/index.js", "lib/element/index.js"]) {
    if (!paths.includes(path)) problems.push(`npm pack leaves out ${path}`);
  }
  return problems;
}

type Exports = Record<string, { types: string; default: string }>;

async function main(): Promise<string[]> {
  const problems: string[] = [];
  const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
    name: string;
    exports: Exports;
  };

  for (const [entry, files] of Object.entries(manifest.exports)) {
    for (const file of [files.types, files.default]) {
      if (!existsSync(file)) problems.push(`${entry}: ${file} is not built`);
    }
  }

  if ("document" in globalThis || "window" in globalThis) {
    problems.push("this check runs with a DOM around, and proves nothing about the DOM-free part");
  }
  // By the package's name, as a consumer imports it. The name is held in a variable, so that the
  // type checker, which runs before the build, does not look for the build's declarations.
  const core = `${manifest.name}/core`;
  const { SHEET } = (await import(core)) as { SHEET?: { width: number; height: number } };
  if (SHEET?.width !== 1000 || SHEET.height !== 1400) {
    problems.push(`${core} does not give the sheet of 1000 × 1400 units`);
  }
  const element = fileURLToPath(import.meta.resolve(manifest.name));
  if (!element.endsWith("/lib/element/index.js")) {
    problems.push(`${manifest.name} resolves to ${element}, not to the element's build`);
  }

  const packed = JSON.parse(
    execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { encoding: "utf8" }),
  ) as { files: { path: string }[] }[];
  problems.push(...packProblems(packed[0]?.files.map((file) => file.path) ?? []));
  return problems;
}

if (import.meta.main) {
  const problems = await main();
  for (const problem of problems) console.log(`package: ${problem}`);
  console.log(problems.length === 0 ? "package: ok" : `package: ${problems.length} problems`);
  process.exitCode = problems.length === 0 ? 0 : 1;
}
