// The build of the samples page (T19 in RUN.md; R55 in docs/decisions.md): one HTML file that opens
// from a file on the device and goes to no network (R25 spec; R08, R11), of page/index.html and
// page/main.ts with the element and all they take inline:
//
//   node scripts/page.ts <folder> <version> [--texts <part>]
//
// writes <folder>/samples-page_v<version>.html, with the current sets of texts of spec's release
// file of the legal texts in tasks/, held to its sum (T89, T102; R69; scripts/legal.ts): a purpose
// with no current set is closed. --texts names a part of
// the legal texts for tests instead, whose sets begin with test-, and only into a page of version
// 0.0.0, which no release has (T20; R58). It builds from the tree alone — no spec/, no git, no
// token, no network — in the toolchain stage, as release-files will take it (T75). Vite's API
// bundles page/main.ts into one script; the page's own style stays as it is. The policy of
// scripts/csp.ts goes into a <meta> element with the hashes of both. The tasks are worked out here,
// from tutor's file of open tasks in tasks/, checked against its sum (R49), and put into the
// bundle: a page has no synchronous hash for openTasksOf. Every task of the file goes in, bank by
// bank (T21; R62): openTasksOf refuses a task with a field outside the open view, so no key,
// solution or trap reaches the file a release carries, and a task that names a picture stops the
// build, since tutor's file carries no media for it (Д4 in RUN.md). So do the tasks of modules, for
// an eval set, of the copy of what module-kit open wrote in tasks/modules-<tag>/, held to its sum
// (T101; R71; scripts/modules.ts): each module's sheets of one answer slot anywhere or on the whole
// sheet and its pages of a workbook, with the files of media/ their statements name, inline, and its
// manifest; a choice the learner taps, which app shows, the page leaves out. The license notices of
// all the code the file carries — its own, every package bundled, the icons' set — go into the file
// itself, and the notices of the modules whose tasks it carries; a package under a license off the
// list stops the build (R12; scripts/notices.ts).

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { build, createServer } from "vite";
import type { PageTexts } from "../page/sets.ts";
import type { TaskKind } from "../page/texts.ts";
import type { ModuleViews, OpenTask, OpenTasks } from "../src/eval/tasks.ts";
import { policy, styleOf } from "./csp.ts";
import { pageSetsOf, withLegalFile } from "./legal.ts";
import { bundleOf, type Carried, NOTICE_SEPARATOR, noticeParts } from "./notices.ts";
import { kindOf, OPEN_VIEWS, pictureType, type ViewTask } from "./open-views.ts";

/** Where the page's source is, from the repository's root. */
export const TEMPLATE = "page/index.html";
export const ENTRY = "page/main.ts";
/** What the template holds in place of the policy, the script and the notices. */
const POLICY_HOLE = "<!-- policy -->";
const SCRIPT_HOLE = '<script src="main.ts"></script>';
const NOTICES_HOLE = "<!-- notices -->";

/** The prefix of the IDs of the sets of a part for tests: test-measure, test-eval-set and
 * test-child-sample. */
const TEST_PREFIX = "test-";

/** The texts of a page of a version: each purpose's current set in the release file of spec's legal
 * texts — or, given a part for tests, in that part, for a page of version 0.0.0 alone, which no
 * release of canvas has (contracts/README.md of spec), read against the schema the release file
 * carries. */
export function textsFor(version: string, part?: string): PageTexts {
  if (part !== undefined && version !== "0.0.0") {
    throw new Error(`the texts of ${part} are for tests: they go into no page but 0.0.0`);
  }
  const { measurement, evalSet, child } = withLegalFile((folder, schema) =>
    part === undefined ? pageSetsOf(folder, schema) : pageSetsOf(part, schema, TEST_PREFIX),
  );
  return {
    ...(measurement ? { measurement } : {}),
    ...(evalSet ? { evalSet } : {}),
    ...(child ? { child } : {}),
  };
}

/** The name of the page's file for a version. */
export function fileName(version: string): string {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`${version} is no version X.Y.Z`);
  return `samples-page_v${version}.html`;
}

/** The text of HTML for a text: its <, > and & escaped. */
function escaped(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/** The notices of a file: its own code's license, each package's, the icons' NOTICE (R46), and
 * those of the modules whose tasks it carries (R71). */
export function notices(
  own: string,
  packages: readonly Carried[],
  icons: string,
  modules: readonly string[] = [],
): string {
  const parts = [
    ...noticeParts(own, packages),
    icons.trim(),
    ...modules.map((part) => part.trim()),
  ];
  const body = parts.map(escaped).join(NOTICE_SEPARATOR);
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
type FileTask = ViewTask;

/** A task the page offers: its kind, its bank, its open view and the sample's view of it. */
export interface PageTask {
  readonly kind: TaskKind;
  /** Its bank of tutor's file, or its module and the module's version, as "<ID> <version>". */
  readonly bank: string;
  readonly task: FileTask;
  readonly open: OpenTask;
  /** The module and version whose manifest and media the task takes: "<ID> <version>". */
  readonly module?: string;
}

/** What the page has of a module: its manifest's open view, and its media by path, each its type
 * and its bytes in base64. */
export interface PageModule {
  readonly manifest: Readonly<Record<string, unknown>>;
  readonly media: Readonly<Record<string, { readonly type: string; readonly data: string }>>;
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
      const kind = kindOf(task);
      if (kind === undefined) {
        throw new Error(
          `${bank} ${task.id} has not one answer slot anywhere or on the whole sheet`,
        );
      }
      return { kind, bank, task, open: view };
    }),
  );
}

/**
 * The tasks of modules the page offers, of the open views of the copy, module by module in its
 * order, each task and template's instance that kindOf gives a kind: a choice the learner taps, which
 * app shows (R42), stays out. Beside them, of each module that has one, its manifest and the files of
 * media/ the statements of its tasks name, with their types, in base64, which `file` gives by the
 * module, the version and the path. A picture of another type, or a path outside media/, is an Error.
 */
export function moduleTasksFor(
  modules: readonly ModuleViews[],
  file: (module: string, version: string, path: string) => Buffer,
): { tasks: PageTask[]; modules: Record<string, PageModule> } {
  const tasks: PageTask[] = [];
  const carried: Record<string, PageModule> = {};
  for (const { module, version, manifest, tasks: views } of modules) {
    const key = `${module} ${version}`;
    const media: Record<string, { type: string; data: string }> = {};
    for (const { view, open } of views) {
      const task = view as unknown as FileTask;
      const kind = kindOf(task);
      if (kind === undefined) continue;
      for (const { picture } of task.statement ?? []) {
        if (picture === undefined || Object.hasOwn(media, picture)) continue;
        let type: string;
        try {
          type = pictureType(picture);
        } catch (error) {
          throw new Error(`${key} ${task.id}: ${(error as Error).message}`);
        }
        media[picture] = { type, data: file(module, version, picture).toString("base64") };
      }
      tasks.push({ kind, bank: key, task, open, module: key });
    }
    if (tasks.some((task) => task.module === key)) carried[key] = { manifest, media };
  }
  return { tasks, modules: carried };
}

/** Where the copy of the open views of modules lies: a folder of its release of modules. */
export function modulesFolder(tag: string): string {
  return join("tasks", `modules-${tag}`);
}

/**
 * The tasks the page offers, with their open views and references: from tutor's file in tasks/, for
 * the measurement and a child's session, and from the copy of the open views of modules, for an eval
 * set, each held to its sum; and the modules' manifests and media.
 */
async function tasksOf(): Promise<{
  tasks: PageTask[];
  modules: Record<string, PageModule>;
  notices: string[];
}> {
  const server = await createServer({
    configFile: false,
    logLevel: "silent",
    appType: "custom",
    server: { middlewareMode: true, hmr: false, ws: false },
  });
  try {
    const { MODULES_FILE, openTasksOf, openViewsOf, TUTOR_FILE } = (await server.ssrLoadModule(
      "/src/eval/tasks.ts",
    )) as typeof import("../src/eval/tasks.ts");
    const bytes = readFileSync(join("tasks", TUTOR_FILE.name));
    const sum = createHash("sha256").update(bytes).digest("hex");
    if (sum !== TUTOR_FILE.sha256) throw new Error(`${TUTOR_FILE.name} is not the file of its sum`);
    const file = JSON.parse(bytes.toString("utf8")) as Parameters<typeof pageTasksOf>[0];
    const sha256 = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");
    const tutor = pageTasksOf(file, openTasksOf(file, TUTOR_FILE.tag, sum, sha256));
    const folder = modulesFolder(MODULES_FILE.tag);
    const views = readFileSync(join(folder, OPEN_VIEWS));
    if (createHash("sha256").update(views).digest("hex") !== MODULES_FILE.sha256) {
      throw new Error(`${join(folder, OPEN_VIEWS)} is not the file of its sum`);
    }
    const media = (module: string, version: string, path: string) =>
      readFileSync(join(folder, "modules", module, version, "media", path));
    const modules = moduleTasksFor(openViewsOf(views.toString("utf8"), sha256), media);
    const own = readFileSync("LICENSE", "utf8");
    return {
      tasks: [...tutor, ...modules.tasks],
      modules: modules.modules,
      notices: moduleNotices(modules.modules, own, folder),
    };
  } finally {
    await server.close();
  }
}

/**
 * The notices of the modules whose tasks a page carries, by "<ID> <version>", from the copy of the
 * open views in `copy` (R71): the license its manifest names, with the text of its LICENSE — or,
 * when that is canvas's own, `own`, the first part's — and its NOTICE, which holds the notices of
 * what the module took from others, when it has one. A manifest that names no license is an Error.
 */
export function moduleNotices(
  modules: Readonly<Record<string, Pick<PageModule, "manifest">>>,
  own: string,
  copy: string,
): string[] {
  return Object.entries(modules).map(([key, { manifest }]) => {
    const { license: name } = manifest;
    if (typeof name !== "string" || name === "") throw new Error(`${key} names no license`);
    const [module = "", version = ""] = key.split(" ");
    const folder = join(copy, "modules", module, version);
    const license = readFileSync(join(folder, "LICENSE"), "utf8");
    const notice = join(folder, "NOTICE");
    const head =
      license === own
        ? `${key}, the tasks and pictures of the module — ${name}, the text of the first part`
        : `${key}, the tasks and pictures of the module — ${name}\n\n${license.trim()}`;
    return existsSync(notice) ? `${head}\n\n${readFileSync(notice, "utf8").trim()}` : head;
  });
}

/** Build the page of a version into a folder, and give the file's path and the packages it carries. */
export async function buildPage(
  folder: string,
  version: string,
  part?: string,
): Promise<{ path: string; packages: readonly Carried[] }> {
  const name = fileName(version);
  const { tasks, modules, notices: carried } = await tasksOf();
  const data = { version, texts: textsFor(version, part), tasks, modules };
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
  const { code, packages } = bundleOf(outputs, "the page");
  const page = pageOf(
    readFileSync(TEMPLATE, "utf8"),
    code.trimEnd(),
    notices(readFileSync("LICENSE", "utf8"), packages, readFileSync("NOTICE", "utf8"), carried),
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
    console.error("usage: node scripts/page.ts <folder> <version> [--texts <part>]");
    process.exit(2);
  }
  const { path, packages } = await buildPage(folder, version, texts);
  console.log(path);
  for (const { name, version: v, license } of packages) console.log(`  ${name} ${v} ${license}`);
}
