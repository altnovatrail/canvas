// The build of the generator's file (T96 in RUN.md; R68 in docs/decisions.md): the synthetic samples
// of a module's eval set, scripts/synthetic-module.ts, as one ES module for Node with no package of
// npm beside it, which every release carries and modules checks by spec's release-verify (R77 spec):
//
//   node scripts/generator.ts <folder> <version>
//
// writes <folder>/synthetic-module_v<version>.mjs and prints its path. Vite's API bundles
// scripts/synthetic-module.main.ts for Node, as the page's builder bundles the page (R55): every
// package inside, Node's own modules outside, the code as it is written and not minified, so that
// a reader of modules sees what runs in its CI. The file opens with a comment that names it, the
// Node it wants and how to check it, and the license notices of all the code it carries — its own
// and every package's —; a package under a license off the list stops the build (R12).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { build } from "vite";
import { bundleOf, type Carried, NOTICE_SEPARATOR, noticeParts } from "./notices.ts";

/** The entry the file is bundled from, from the repository's root. */
export const ENTRY = "scripts/synthetic-module.main.ts";

/** The Node the file is built for and tried on: the one of spec's devcontainer (R79 spec). */
export const NODE = "24";

/** The name of the generator's file for a version. */
export function fileName(version: string): string {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`${version} is no version X.Y.Z`);
  return `synthetic-module_v${version}.mjs`;
}

/** The comment the file opens with: what it is, how it is checked, and the license notices of all
 * the code it carries — canvas's own and each package's; canvas's NOTICE names the icons of the
 * row's buttons, which the file does not carry. A notice's own end of a comment is broken, so that
 * the comment holds. */
export function header(version: string, own: string, packages: readonly Carried[]): string {
  const parts = [
    [
      `synthetic-module_v${version}.mjs — the synthetic samples of a module's eval set, from NovaTrail canvas v${version}.`,
      "",
      `Run by Node ${NODE} or newer, with no package of npm beside it:`,
      "",
      `  node synthetic-module_v${version}.mjs --module <package> <tag> <folder> <task>:<seed>...`,
      "",
      "Its source is https://github.com/altnovatrail/canvas at the tag of its release, and a checkout",
      "of spec at a tag checks the file against the release's signature:",
      "",
      `  just -f spec/justfile release-verify canvas v${version} synthetic-module_v${version}.mjs`,
    ].join("\n"),
    ...noticeParts(own, packages),
  ];
  const body = parts.join(NOTICE_SEPARATOR).replaceAll("*/", "* /");
  // A checkout with CRLF ends, say, would change the file's bytes without a word.
  if (body.includes("\r")) throw new Error("a notice of the generator holds a carriage return");
  return `/*!\n${body}\n*/\n`;
}

/** Build the generator of a version into a folder, and give the file's path and the packages it
 * carries. */
export async function buildGenerator(
  folder: string,
  version: string,
): Promise<{ path: string; packages: readonly Carried[] }> {
  const name = fileName(version);
  const outputs = await build({
    configFile: false,
    logLevel: "silent",
    ssr: { noExternal: true, target: "node" },
    build: {
      write: false,
      ssr: resolve(ENTRY),
      target: `node${NODE}`,
      minify: false,
      rollupOptions: { output: { format: "es" } },
    },
  });
  const { code, packages } = bundleOf(outputs, "the generator");
  const file = header(version, readFileSync("LICENSE", "utf8"), packages) + code;
  mkdirSync(folder, { recursive: true });
  const path = join(folder, name);
  writeFileSync(path, file);
  return { path, packages };
}

if (import.meta.main) {
  const [folder, version, ...rest] = process.argv.slice(2);
  if (!folder || !version || rest.length > 0) {
    console.error("usage: node scripts/generator.ts <folder> <version>");
    process.exit(2);
  }
  const { path, packages } = await buildGenerator(folder, version);
  console.log(path);
  for (const { name, version: v, license } of packages) console.log(`  ${name} ${v} ${license}`);
}
