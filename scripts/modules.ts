// The tasks of modules the samples page carries (T101 in RUN.md; R71 in docs/decisions.md): the
// open views module-kit open writes of a release of modules (R43 module-kit), as a copy in
// tasks/modules-<tag>/, since the build of a release runs with no network, token or spec/ and so
// cannot run module-kit itself. just modules-open fetches module-kit's binary and the packages the
// index names, has spec's release-verify accept each, runs module-kit open with the seeds of the
// justfile, and gives this script what it wrote:
//
//   node scripts/modules.ts packages <module-index.json>
//   node scripts/modules.ts copy <what module-kit open wrote> <copy>
//   node scripts/modules.ts check <what module-kit open wrote> <copy>
//
// packages prints, of each module, the release and the digest of the package module-kit open takes:
// its newest version of the module format the element reads, not withdrawn. copy writes the copy:
// open-views.json as it is, and of each module its LICENSE, its NOTICE if it has one, and the files
// of media/ that the statements of the tasks the page takes name — not the media of its lessons and
// solutions. check holds the copy to what module-kit wrote, byte for byte and file for file, and
// exits 1 on any difference, naming it. Which tasks the page takes is kindOf's, the build's own.

import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { kindOf, MODULE_FORMAT, OPEN_VIEWS, pictureType, type ViewTask } from "./open-views.ts";

/** The folder of each module's files, beside open-views.json. */
const MODULES = "modules";

/** A version as semver orders it: MAJOR.MINOR.PATCH, each a whole number. */
const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

/** An entry of the index of a release of modules: a version of a module. */
interface Entry {
  readonly module_format_version?: unknown;
  readonly package_digest?: unknown;
  readonly release?: unknown;
  readonly withdrawn?: unknown;
}

/** Whether a version comes after another, by semver. */
function newer(a: string, b: string): boolean {
  const [x, y] = [a, b].map((version) => version.split(".").map(Number));
  for (let i = 0; i < 3; i++) {
    if ((x?.[i] ?? 0) !== (y?.[i] ?? 0)) return (x?.[i] ?? 0) > (y?.[i] ?? 0);
  }
  return false;
}

/**
 * The packages module-kit open takes of an index: of each module, the release and the digest of its
 * newest version of the module format MODULE_FORMAT that the index does not mark withdrawn, as a new
 * attempt takes it (R43 module-kit). A module with none is left out, as module-kit leaves it.
 */
export function packagesOf(index: unknown): { release: string; digest: string }[] {
  const { modules } = index as { readonly modules?: unknown };
  if (modules === null || typeof modules !== "object" || Array.isArray(modules)) {
    throw new TypeError("an index of modules has its modules");
  }
  const packages: { release: string; digest: string }[] = [];
  for (const [module, versions] of Object.entries(modules as Record<string, unknown>)) {
    let best: { version: string; entry: Entry } | undefined;
    for (const [version, entry] of Object.entries((versions ?? {}) as Record<string, Entry>)) {
      if (!VERSION.test(version)) throw new TypeError(`${module} ${version} is no version`);
      if (entry.module_format_version !== MODULE_FORMAT || entry.withdrawn) continue;
      if (!best || newer(version, best.version)) best = { version, entry };
    }
    if (!best) continue;
    const { release, package_digest: digest } = best.entry;
    if (
      typeof release !== "string" ||
      typeof digest !== "string" ||
      !/^sha256:[0-9a-f]{64}$/.test(digest)
    ) {
      throw new TypeError(`${module} ${best.version} has no release or digest of its package`);
    }
    packages.push({ release, digest });
  }
  return packages;
}

/** A task of open-views.json: its open view, as module-kit wrote it. */
interface ViewEntry {
  readonly task?: {
    readonly statement?: readonly { readonly picture?: unknown }[];
  };
}

/**
 * The files of the copy, by their paths from it, beside open-views.json: of each module its LICENSE,
 * its NOTICE if module-kit wrote one, and every file of media/ a statement of a task the page takes
 * names, each once.
 */
export function filesOf(out: string): string[] {
  const { modules } = JSON.parse(readFileSync(join(out, OPEN_VIEWS), "utf8")) as {
    readonly modules?: readonly {
      readonly id?: unknown;
      readonly version?: unknown;
      readonly tasks?: readonly ViewEntry[];
    }[];
  };
  if (!Array.isArray(modules)) throw new TypeError(`${OPEN_VIEWS} has no modules`);
  const files = new Set<string>();
  for (const { id, version, tasks } of modules) {
    if (typeof id !== "string" || typeof version !== "string" || !Array.isArray(tasks)) {
      throw new TypeError(`a module of ${OPEN_VIEWS} has no ID, version or tasks`);
    }
    const folder = join(MODULES, id, version);
    files.add(join(folder, "LICENSE"));
    if (existsSync(join(out, folder, "NOTICE"))) files.add(join(folder, "NOTICE"));
    for (const { task } of tasks) {
      if (task === undefined || kindOf(task as ViewTask) === undefined) continue;
      for (const { picture } of task.statement ?? []) {
        if (picture === undefined) continue;
        // A path outside media/ would copy a file of the tree, or over it.
        if (typeof picture !== "string") throw new TypeError(`a picture of ${id} is no path`);
        pictureType(picture);
        files.add(join(folder, "media", picture));
      }
    }
  }
  // By UTF-16 code units, as the copy's listing is the same on every machine.
  return [...files].sort((a, b) => (a < b ? -1 : Number(a > b)));
}

/** Every file under a folder, by its path from `root`. */
function walk(root: string, folder = root): string[] {
  if (!existsSync(folder)) return [];
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    return entry.isDirectory() ? walk(root, path) : [relative(root, path)];
  });
}

/** The SHA-256 of a file's bytes. */
function sumOf(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

/** Write the copy of what module-kit open wrote: open-views.json and the files filesOf names. */
export function writeCopy(out: string, copy: string): void {
  rmSync(join(copy, OPEN_VIEWS), { force: true });
  rmSync(join(copy, MODULES), { recursive: true, force: true });
  for (const file of [OPEN_VIEWS, ...filesOf(out)]) {
    mkdirSync(dirname(join(copy, file)), { recursive: true });
    copyFileSync(join(out, file), join(copy, file));
  }
}

/**
 * How the copy differs from what module-kit open wrote: open-views.json not the same bytes, a file
 * filesOf names missing or of other bytes, or a file under modules/ it does not name. None, and the
 * copy is the one the build may take.
 */
export function differencesOf(out: string, copy: string): string[] {
  const wanted = filesOf(out);
  const differences: string[] = [];
  for (const file of [OPEN_VIEWS, ...wanted]) {
    if (!existsSync(join(copy, file))) differences.push(`${file}: not in the copy`);
    else if (sumOf(join(copy, file)) !== sumOf(join(out, file))) {
      differences.push(`${file}: not the bytes module-kit open wrote`);
    }
  }
  const named = new Set(wanted);
  for (const file of walk(copy, join(copy, MODULES))) {
    if (!named.has(file)) differences.push(`${file}: no task the page takes names it`);
  }
  return differences;
}

if (import.meta.main) {
  const [mode, first, second, ...rest] = process.argv.slice(2);
  if (mode === "packages" && first && !second) {
    for (const { release, digest } of packagesOf(JSON.parse(readFileSync(first, "utf8")))) {
      console.log(`${release} ${digest.replace(":", "-")}`);
    }
  } else if ((mode === "copy" || mode === "check") && first && second && rest.length === 0) {
    if (mode === "copy") writeCopy(first, second);
    const differences = differencesOf(first, second);
    for (const difference of differences) console.error(`${second}/${difference}`);
    if (differences.length > 0) process.exit(1);
    console.log(`${second}: the open views of module-kit open, and ${filesOf(first).length} files`);
  } else {
    console.error(
      "usage: node scripts/modules.ts packages <module-index.json>\n" +
        "       node scripts/modules.ts copy|check <what module-kit open wrote> <copy>",
    );
    process.exit(2);
  }
}
