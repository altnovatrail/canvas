// The icons of the row's buttons (R46 in docs/decisions.md; R78 spec): Material Symbols, in the
// style Rounded, from the npm package of the set at the version package-lock.json pins, and of it
// only the icons the row shows. It writes the module the element draws them from and NOTICE, which
// names the set the package embeds:
//
//   node scripts/icons.ts           write src/element/icons.ts and NOTICE
//   node scripts/icons.ts --check   write nothing, and fail unless both are what it would write
//
// ci-lint runs the check, as spec's types-check holds its generated types: a module edited by hand,
// or a new version of the set without the icons written again, fails it. Nothing goes to the
// network, now or when the element runs: the paths are in the build. The module comes out as Biome
// formats it, by the Biome package-lock.json pins, so ci-lint's format check passes it as it is.
// Run from the repository's root, as the recipes run it: the paths it writes are the root's.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { getIconData, iconToSVG } from "@iconify/utils";

/** The npm package of the set. */
const SET = "@iconify-json/material-symbols";
/** What the script writes, from the repository's root. */
export const MODULE = "src/element/icons.ts";
export const NOTICE = "NOTICE";

/** A value of the row: the base of its icon's name, and how its button shows it. */
export interface Value {
  /** The base of the name: the outline is `<base>-outline-rounded`, the fill `<base>-rounded`. */
  readonly base: string;
  /** Whether the button shows the fill while it is chosen. */
  readonly filled: boolean;
  /** Whether the icon is mirrored in a row that runs right to left. */
  readonly mirrored: boolean;
}

/**
 * The values of the row, as the table of architecture 6 of spec names them, each by its button's
 * key in labels.ts: the four of the page's zoom and of the scroll across wait for the table by
 * В76 in RUN.md (T94). Demo has two, as the demo is shown or hidden. One thing is left out: the table
 * fills the finger's icon while its mode is on, but the mode hides the button (R29), so the fill
 * would never show and is not embedded (R46).
 */
export const TABLE: Readonly<Record<string, Value>> = {
  next: { base: "arrow-forward", filled: false, mirrored: true },
  demoShown: { base: "keyboard-arrow-down", filled: false, mirrored: false },
  demoHidden: { base: "keyboard-arrow-right", filled: false, mirrored: true },
  pen: { base: "ink-pen", filled: true, mirrored: false },
  eraser: { base: "ink-eraser", filled: true, mirrored: false },
  undo: { base: "undo", filled: false, mirrored: true },
  clear: { base: "delete-sweep", filled: false, mirrored: false },
  up: { base: "arrow-upward", filled: false, mirrored: false },
  down: { base: "arrow-downward", filled: false, mirrored: false },
  zoomIn: { base: "zoom-in", filled: false, mirrored: false },
  zoomOut: { base: "zoom-out", filled: false, mirrored: false },
  left: { base: "arrow-left-alt", filled: false, mirrored: false },
  right: { base: "arrow-right-alt", filled: false, mirrored: false },
  finger: { base: "touch-app", filled: false, mirrored: false },
};

/** An icon as the element draws it: its view box, and the paths it fills in the button's colour. */
export interface Drawn {
  readonly viewBox: string;
  readonly paths: readonly string[];
}

/** The set as the script reads it: its icons and aliases, as Iconify's utilities take them. */
export type IconSet = Parameters<typeof getIconData>[0];

/** A path of the set, as Material Symbols draws every icon: filled with the colour of the text. */
const PATH = /<path fill="currentColor" d="([^"]+)"\/>/y;

/**
 * An icon of the set, by its name, an alias too, as the element draws it. A name the set does not
 * have stops the script, and so does an icon made of anything but filled paths: the element would
 * draw it otherwise than the set does.
 */
export function drawn(set: IconSet, name: string): Drawn {
  const data = getIconData(set, name);
  if (data === null) throw new Error(`icons: ${SET} has no icon ${name}`);
  const { attributes, body } = iconToSVG(data);
  const paths: string[] = [];
  PATH.lastIndex = 0;
  for (let match = PATH.exec(body); match !== null; match = PATH.exec(body)) {
    paths.push(match[1] as string);
    if (PATH.lastIndex === body.length) return { viewBox: attributes.viewBox, paths };
  }
  throw new Error(`icons: ${name} is not filled paths alone: ${body.slice(0, 80)}`);
}

/** The names a value needs: its outline, and its fill when its button shows one. */
function names({ base, filled }: Value): { outline: string; filled: string } {
  const outline = `${base}-outline-rounded`;
  return { outline, filled: filled ? `${base}-rounded` : outline };
}

/** The module the element draws the icons from, as the script writes it before Biome formats it. */
export function module(set: IconSet, version: string, table = TABLE): string {
  const used = new Map<string, Drawn>();
  const row: string[] = [];
  for (const [key, value] of Object.entries(table)) {
    const { outline, filled } = names(value);
    for (const name of [outline, filled]) {
      if (!used.has(name)) used.set(name, drawn(set, name));
    }
    row.push(`${key}: ${JSON.stringify({ outline, filled, mirrored: value.mirrored })},`);
  }
  const drawing = [...used].map(
    ([name, icon]) => `${JSON.stringify(name)}: ${JSON.stringify(icon)},`,
  );
  return `// Written by scripts/icons.ts — \`just icons\` — from ${SET} ${version}:
// Material Symbols by Google, under the Apache License 2.0 (R46 in docs/decisions.md; R78 spec).
// ci-lint fails unless it is what the script writes, so it is never edited by hand. This module is
// no entry point of the package.

/** The icons of the row's buttons, by their names in the set, as the element draws them. */
export const ICONS = {
${drawing.join("\n")}
} as const;

/** The name of an icon of the row. */
export type IconName = keyof typeof ICONS;

/**
 * Each value of the row, by its button's key: the icon in outline, the one the button shows while
 * chosen — the same for a value without a fill — and whether the icon is mirrored in a row that
 * runs right to left (architecture 6 spec).
 */
export const ROW = {
${row.join("\n")}
} as const satisfies Record<string, { outline: IconName; filled: IconName; mirrored: boolean }>;
`;
}

/** NOTICE: what the package embeds of others' work, beside its own license, the same Apache-2.0. */
export function notice(version: string): string {
  return `@altnovatrail/canvas

The package embeds icons of Material Symbols, by Google, under the Apache License, Version 2.0,
the license in LICENSE: https://github.com/google/material-design-icons. They come from the npm
package ${SET} ${version}, and the package holds only the icons of its
own buttons.
`;
}

/** What differs between the files the script would write and the files there are. */
export function differences(
  wanted: Readonly<Record<string, string>>,
  read: (path: string) => string | undefined,
): string[] {
  return Object.entries(wanted)
    .filter(([path, text]) => read(path) !== text)
    .map(([path]) => `icons: ${path} is not what scripts/icons.ts writes; run just icons`);
}

/**
 * Biome's script, as package-lock.json pins it, by its path in node_modules and run by this Node:
 * no program is looked up in PATH, as scripts/package.ts runs npm.
 */
const BIOME = fileURLToPath(new URL("../node_modules/@biomejs/biome/bin/biome", import.meta.url));

/** Biome's format of a module, read from standard input. */
function formatted(text: string, path: string): string {
  return execFileSync(process.execPath, [BIOME, "format", `--stdin-file-path=${path}`], {
    input: text,
    encoding: "utf8",
  });
}

async function main(check: boolean): Promise<string[]> {
  const { version } = createRequire(import.meta.url)(`${SET}/package.json`) as { version: string };
  // The set's thousands of icons are read only here, not by whoever imports the module's helpers.
  const { icons, info } = await import("@iconify-json/material-symbols");
  // The set the table was read from: its name and its license, as the package of the set says them.
  if (info.name !== "Material Symbols" || info.license.spdx !== "Apache-2.0") {
    return [`icons: ${SET} ${version} is ${info.name} under ${info.license.spdx}`];
  }
  const wanted = {
    [MODULE]: formatted(module(icons, version), MODULE),
    [NOTICE]: notice(version),
  };
  if (check) {
    return differences(wanted, (path) => {
      try {
        return readFileSync(path, "utf8");
      } catch {
        return undefined;
      }
    });
  }
  for (const [path, text] of Object.entries(wanted)) writeFileSync(path, text);
  return [];
}

if (import.meta.main) {
  const problems = await main(process.argv.includes("--check"));
  for (const problem of problems) console.log(problem);
  console.log(problems.length === 0 ? "icons: ok" : `icons: ${problems.length} problems`);
  process.exitCode = problems.length === 0 ? 0 : 1;
}
