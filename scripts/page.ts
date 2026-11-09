// The build of the samples page (T19 in RUN.md; R55 in docs/decisions.md): one HTML file that opens
// from a file on the device and goes to no network (R25 spec; R08, R11), of page/index.html and
// page/main.ts with the element and all they take inline:
//
//   node scripts/page.ts <folder> <version> [--texts <set>]
//
// writes <folder>/samples-page_v<version>.html, with the set of texts of page/sets/draft-0.json or
// the one --texts names (T20; R58): a set for tests only into a page of version 0.0.0, which no
// release has. It builds from the tree alone — no spec/, no git, no
// token, no network — in the toolchain stage, as release-files will take it (T75). Vite's API
// bundles page/main.ts into one script; the page's own style stays as it is. The policy of
// scripts/csp.ts goes into a <meta> element with the hashes of both. The tasks are worked out here,
// from tutor's file of open tasks in tasks/, checked against its sum (R49), and put into the
// bundle: a page has no synchronous hash for openTasksOf. Every task of the file goes in, bank by
// bank (T21; R62): openTasksOf refuses a task with a field outside the open view, so no key,
// solution or trap reaches the file a release carries, and a task that names a picture stops the
// build, since tutor's file carries no media for it (Д4 in RUN.md). The license notices of all the
// code the file carries — its own, every package bundled, the icons' set — go into the file
// itself, and a package under a license off the list stops the build (R12).

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type * as open from "@altnovatrail/spec/formatv0/open";
import { build, createServer } from "vite";
import { isTestSet, type TextSet, textSetOf } from "../page/sets.ts";
import type { TaskKind } from "../page/texts.ts";
import type { OpenTask, OpenTasks } from "../src/eval/tasks.ts";
import { policy, styleOf } from "./csp.ts";

/** Where the page's source is, from the repository's root. */
export const TEMPLATE = "page/index.html";
export const ENTRY = "page/main.ts";
/** What the template holds in place of the policy, the script and the notices. */
const POLICY_HOLE = "<!-- policy -->";
const SCRIPT_HOLE = '<script src="main.ts"></script>';
const NOTICES_HOLE = "<!-- notices -->";

/** The set of texts a build carries unless it is given another: the draft (R11). */
export const DRAFT = "page/sets/draft-0.json";

/** The set of texts of a file, checked, for a page of a version: a set for tests goes only into a
 * page of version 0.0.0, which no release of canvas has (contracts/README.md of spec). */
export function textsFor(path: string, version: string): TextSet {
  const set = textSetOf(JSON.parse(readFileSync(path, "utf8")));
  if (isTestSet(set) && version !== "0.0.0") {
    throw new Error(`the set ${set.version} is for tests: it goes into no page but 0.0.0`);
  }
  return set;
}

/** The licenses a package the file carries may have: the list's, as the lock file writes them. */
export const LICENSES: ReadonlySet<string> = new Set([
  "MIT",
  "ISC",
  "Apache-2.0",
  "BSD-3-Clause",
  "(Apache-2.0 AND BSD-3-Clause)",
]);

/** The name of the page's file for a version. */
export function fileName(version: string): string {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`${version} is no version X.Y.Z`);
  return `samples-page_v${version}.html`;
}

/** The text of HTML for a text: its <, > and & escaped. */
function escaped(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

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
  return [...folders].sort((a, b) => a.localeCompare(b));
}

/** Where the text of a package's license is kept when its npm package carries none: by its name and
 * version, so that a new version without its own text stops the build. */
export const NOTICES = "page/notices";

/** The kept text of a package's license, by name and version, as NOTICES names it. */
export function keptName(name: string, version: string): string {
  return `${name.replace(/^@/, "").replaceAll("/", "-")}-${version}.txt`;
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

/** The notices of a file: its own code's license, each package's, and the icons' NOTICE (R46). */
export function notices(own: string, packages: readonly Carried[], icons: string): string {
  const parts = [
    `NovaTrail canvas — Apache-2.0\n\n${own}`,
    ...packages.map(
      ({ name, version, license, text }) => `${name} ${version} — ${license}\n\n${text}`,
    ),
    icons,
  ];
  const body = parts.map((part) => escaped(part.trim())).join("\n\n────────\n\n");
  return `<details id="notices">\n<summary>Лицензии кода в этом файле</summary>\n<pre>${body}</pre>\n</details>`;
}

/** Whether a text holds a control character other than a tab or a line feed. */
function hasControl(text: string): boolean {
  for (const character of text) {
    const code = character.codePointAt(0) ?? 0;
    if ((code < 0x20 && code !== 0x09 && code !== 0x0a) || code === 0x7f) return true;
  }
  return false;
}

/** The page of a template, a bundle and notices: one file, the policy's hashes worked out. */
export function pageOf(template: string, script: string, noticesHtml: string): string {
  for (const [name, text] of [
    [TEMPLATE, template],
    ["the bundle", script],
  ] as const) {
    // The parser changes a control character — drops a carriage return, turns a NUL into U+FFFD —
    // before the browser hashes an inline element; only a tab and a line feed stay as they are.
    if (hasControl(text)) {
      throw new Error(`${name} holds a control character`);
    }
  }
  // Either would end the inline script before its text does.
  if (/<\/script|<!--/i.test(script)) throw new Error("the bundle holds </script or <!--");
  for (const hole of [POLICY_HOLE, SCRIPT_HOLE, NOTICES_HOLE]) {
    if (template.split(hole).length !== 2) throw new Error(`${TEMPLATE} has not one ${hole}`);
  }
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy(styleOf(template), script)}">`;
  return template
    .replace(POLICY_HOLE, () => meta)
    .replace(NOTICES_HOLE, () => noticesHtml)
    .replace(SCRIPT_HOLE, () => `<script>${script}</script>`);
}

/** A task of the file of open tasks, as its JSON holds it: its open view. */
type FileTask = Pick<open.Task, "id" | "statement" | "items">;

/** A task the page offers: its kind, its bank, its open view and the sample's view of it. */
export interface PageTask {
  readonly kind: TaskKind;
  readonly bank: string;
  readonly task: FileTask;
  readonly open: OpenTask;
}

/**
 * The tasks the page offers: every task of the file, bank by bank in the file's order, beside its
 * open view. A sheet whose one answer slot is the whole sheet is an essay. A task that names a
 * picture is an Error, since the build carries no media, and so is a sheet of another shape than
 * one answer slot anywhere or on the whole sheet, which the page could not mark up.
 */
export function pageTasksOf(
  file: {
    readonly banks: readonly { readonly bank: string; readonly tasks: readonly FileTask[] }[];
  },
  views: OpenTasks,
): PageTask[] {
  return file.banks.flatMap(({ bank, tasks }) =>
    tasks.map((task, index) => {
      const view = views.get(bank)?.[index];
      if (!view) throw new Error(`no task ${index} in ${bank}`);
      if (task.statement?.some((part) => part.picture !== undefined)) {
        throw new Error(`${bank} ${task.id} names a picture, and the build carries no media`);
      }
      if ("workbook" in view.canvas) return { kind: "workbook" as const, bank, task, open: view };
      // The page marks a sheet up by its one answer slot, anywhere on it or the whole sheet: a task
      // of more slots, or of a zone or a choice, it could not mark up.
      const slots = task.items.flatMap((item) => item.answer_slots ?? []);
      const binding = task.items.length === 1 && slots.length === 1 ? slots[0]?.binding : undefined;
      if (binding !== "anywhere" && binding !== "sheet") {
        throw new Error(
          `${bank} ${task.id} has not one answer slot anywhere or on the whole sheet`,
        );
      }
      const kind = binding === "sheet" ? ("essay" as const) : ("sheet" as const);
      return { kind, bank, task, open: view };
    }),
  );
}

/** The tasks the page offers, with their open views and references, from tutor's file in tasks/. */
async function tasksOf(): Promise<PageTask[]> {
  const server = await createServer({
    configFile: false,
    logLevel: "silent",
    appType: "custom",
    server: { middlewareMode: true, hmr: false, ws: false },
  });
  try {
    const { openTasksOf, TUTOR_FILE } = (await server.ssrLoadModule(
      "/src/eval/tasks.ts",
    )) as typeof import("../src/eval/tasks.ts");
    const bytes = readFileSync(join("tasks", TUTOR_FILE.name));
    const sum = createHash("sha256").update(bytes).digest("hex");
    if (sum !== TUTOR_FILE.sha256) throw new Error(`${TUTOR_FILE.name} is not the file of its sum`);
    const file = JSON.parse(bytes.toString("utf8")) as Parameters<typeof pageTasksOf>[0];
    const sha256 = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");
    return pageTasksOf(file, openTasksOf(file, TUTOR_FILE.tag, sum, sha256));
  } finally {
    await server.close();
  }
}

/** Build the page of a version into a folder, and give the file's path and the packages it carries. */
export async function buildPage(
  folder: string,
  version: string,
  texts = DRAFT,
): Promise<{ path: string; packages: readonly Carried[] }> {
  const name = fileName(version);
  const data = { version, texts: textsFor(texts, version), tasks: await tasksOf() };
  const outputs = await build({
    configFile: false,
    logLevel: "silent",
    define: { SAMPLES_PAGE: JSON.stringify(data) },
    build: {
      write: false,
      target: "es2022",
      minify: true,
      lib: { entry: resolve(ENTRY), formats: ["iife"], name: "samplesPage", fileName: "page" },
    },
  });
  const output = (Array.isArray(outputs) ? outputs : [outputs])[0] as
    | { output: { type: string; code?: string; moduleIds?: string[] }[] }
    | undefined;
  const chunks = output?.output.filter(({ type }) => type === "chunk") ?? [];
  const chunk = chunks[0];
  if (chunks.length !== 1 || !chunk?.code) throw new Error("the page is not one script");
  const { code, moduleIds = [] } = chunk;
  const packages = packagesOf(moduleIds).map((folder) => carried(folder));
  const page = pageOf(
    readFileSync(TEMPLATE, "utf8"),
    code.trimEnd(),
    notices(readFileSync("LICENSE", "utf8"), packages, readFileSync("NOTICE", "utf8")),
  );
  mkdirSync(folder, { recursive: true });
  const path = join(folder, name);
  writeFileSync(path, page);
  return { path, packages };
}

if (import.meta.main) {
  const [folder, version, flag, texts, ...rest] = process.argv.slice(2);
  if (
    !folder ||
    !version ||
    (flag !== undefined && (flag !== "--texts" || !texts)) ||
    rest.length > 0
  ) {
    console.error("usage: node scripts/page.ts <folder> <version> [--texts <set>]");
    process.exit(2);
  }
  const { path, packages } = await buildPage(folder, version, texts ?? DRAFT);
  console.log(path);
  for (const { name, version: v, license } of packages) console.log(`  ${name} ${v} ${license}`);
}
