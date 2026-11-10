// The license notices of a file a release carries (R55, R68 in docs/decisions.md): the samples page
// of scripts/page.ts and the generator of scripts/generator.ts each bundle code of npm packages,
// and each carries the text of every package's license in itself. A package under a license off
// the list, or with no text of its license, stops the build (R12).

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** The licenses a package the file carries may have: the list's, as the lock file writes them. */
export const LICENSES: ReadonlySet<string> = new Set([
  "MIT",
  "ISC",
  "Apache-2.0",
  "BSD-3-Clause",
  "(Apache-2.0 AND BSD-3-Clause)",
]);

/** A package the bundle carries: its name, version, license and the text of its license. */
export interface Carried {
  readonly name: string;
  readonly version: string;
  readonly license: string;
  readonly text: string;
}

/** The folders of the packages among a bundle's modules, each once, in order: a package nested
 * in another's node_modules is a package of its own, with its own license. */
export function packagesOf(moduleIds: readonly string[]): string[] {
  const folders = new Set<string>();
  for (const id of moduleIds) {
    const match = /^(.*node_modules\/(?:@[^/]+\/)?[^/]+)\//.exec(id.replaceAll("\\", "/"));
    if (match?.[1]) folders.add(match[1]);
  }
  // In the order of code units, not of a locale: a file's notices come in the same order on any
  // machine that builds it.
  return [...folders].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/** Where the text of a package's license is kept when its npm package carries none: by its name and
 * version, so that a new version without its own text stops the build. */
export const NOTICES = "page/notices";

/** The kept text of a package's license, by name and version, as NOTICES names it. */
export function keptName(name: string, version: string): string {
  return `${name.replace(/^@/, "").replaceAll("/", "-")}-${version}.txt`;
}

/** What divides one notice from the next in a file. */
export const NOTICE_SEPARATOR = "\n\n────────\n\n";

/** The notices of the code a file carries, each trimmed: canvas's own license, then each package's
 * by name, version and license. */
export function noticeParts(own: string, packages: readonly Carried[]): string[] {
  return [
    `NovaTrail canvas — Apache-2.0\n\n${own}`,
    ...packages.map(
      ({ name, version, license, text }) => `${name} ${version} — ${license}\n\n${text}`,
    ),
  ].map((part) => part.trim());
}

/** The code of a build of Vite that is one chunk, and the packages it carries, each refused unless
 * `carried` takes it; an Error names `what` was built when the build is not one chunk. */
export function bundleOf(outputs: unknown, what: string): { code: string; packages: Carried[] } {
  const output = (Array.isArray(outputs) ? outputs : [outputs])[0] as
    | { output: { type: string; code?: string; moduleIds?: string[] }[] }
    | undefined;
  const chunks = output?.output.filter(({ type }) => type === "chunk") ?? [];
  const chunk = chunks[0];
  if (chunks.length !== 1 || !chunk?.code) throw new Error(`${what} is not one chunk`);
  const { code, moduleIds = [] } = chunk;
  return { code, packages: packagesOf(moduleIds).map((folder) => carried(folder)) };
}

/** A package as the file carries it, from its folder: refused unless its license is on the list,
 * and unless the text of its license is in its folder or kept in NOTICES. */
export function carried(folder: string, kept = NOTICES): Carried {
  const manifest = JSON.parse(readFileSync(join(folder, "package.json"), "utf8")) as {
    name: string;
    version: string;
    license?: string;
  };
  const license = manifest.license ?? "";
  if (!LICENSES.has(license)) {
    throw new Error(`${manifest.name} carries ${license || "no license"}, which is off the list`);
  }
  const own = readdirSync(folder).find((name) => /^(licen[cs]e|copying)(\.|$)/i.test(name));
  const copy = join(kept, keptName(manifest.name, manifest.version));
  const path = own ? join(folder, own) : existsSync(copy) ? copy : undefined;
  if (!path) throw new Error(`${manifest.name} ${manifest.version} has no text of its license`);
  return {
    name: manifest.name,
    version: manifest.version,
    license,
    text: readFileSync(path, "utf8"),
  };
}
