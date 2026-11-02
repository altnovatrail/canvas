// After npm pack of a release's copy, in just release-files: the archive that goes out is the
// package at the release's version, the way a consumer takes it (R08 in docs/decisions.md).
//
//   npm pack --json … | node scripts/release.ts <version>
//
// It reads what npm pack says it packed and prints the archive's file name, for the recipe to sum.
// It fails with every problem: a name or a version other than the release's, a file name other
// than the one npm gives the package's archive, which .github's shared release looks for, or a
// file the build does not ship. Run from the repository's root, whose package.json names the
// package.

import { readFileSync } from "node:fs";
import { packProblems } from "./package.ts";

/** What npm pack --json says of an archive it made. */
export interface Packed {
  readonly name: string;
  readonly version: string;
  readonly filename: string;
  readonly files: readonly { readonly path: string }[];
}

/** The file name npm pack gives the archive of a package at a version: @scope/name, scope-name. */
export function archiveName(name: string, version: string): string {
  return `${name.replace(/^@/, "").replace("/", "-")}-${version}.tgz`;
}

/** Every problem with what npm pack made for the release of the package `name` at `version`. */
export function archiveProblems(
  packed: readonly Packed[],
  name: string,
  version: string,
): string[] {
  const [archive] = packed;
  if (archive === undefined || packed.length !== 1) {
    return [`npm pack made ${packed.length} archives, not one`];
  }
  const problems: string[] = [];
  if (archive.name !== name) problems.push(`the archive holds ${archive.name}, not ${name}`);
  if (archive.version !== version) {
    problems.push(`the archive holds version ${archive.version}, not the release's ${version}`);
  }
  const wanted = archiveName(name, version);
  if (archive.filename !== wanted) {
    problems.push(`the archive is ${archive.filename}, not ${wanted}`);
  }
  problems.push(...packProblems(archive.files.map((file) => file.path)));
  return problems;
}

if (import.meta.main) {
  const version = process.argv[2] ?? "";
  const { name } = JSON.parse(readFileSync("package.json", "utf8")) as { name: string };
  const packed = JSON.parse(readFileSync(0, "utf8")) as Packed[];
  const problems = archiveProblems(packed, name, version);
  for (const problem of problems) console.error(`release: ${problem}`);
  if (problems.length === 0) console.log(archiveName(name, version));
  process.exitCode = problems.length === 0 ? 0 : 1;
}
