// The build of the samples page (T19 in RUN.md; R55 in docs/decisions.md): what the builder refuses,
// the one file it writes, and that file opened by file:// in Chrome Headless Shell from the
// toolchain stage (R13), as a volunteer opens it from the downloads — no request leaves it, the
// policy is kept, and the sample it saves reads back.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Purpose, Writer } from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import axe from "axe-core";
import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { RELEASE_TEXTS } from "../emulators/saved.ts";
import { TASKS as EMULATED_TASKS, WORKBOOK as EMULATED_WORKBOOK } from "../emulators/watch.ts";
import { viewOf } from "../page/open.ts";
import { TAGS } from "../src/element/wcag.fixture.ts";
import { readSample, type Sample } from "../src/eval/sample.ts";
import { MODULES_FILE, TUTOR_FILE } from "../src/eval/tasks.ts";
import { policy, styleOf } from "./csp.ts";
import type { Carried } from "./notices.ts";
import { kindOf, OPEN_VIEWS } from "./open-views.ts";
import {
  buildPage,
  fileName,
  moduleNotices,
  modulesFolder,
  moduleTasksFor,
  notices,
  pageOf,
  pageTasksOf,
  TEMPLATE,
  textsFor,
} from "./page.ts";

/** The banks of tutor's file in tasks/, which the build offers whole (T21). */
const BANKS = (
  JSON.parse(readFileSync(join("tasks", TUTOR_FILE.name), "utf8")) as {
    banks: { bank: string; tasks: { id: string }[] }[];
  }
).banks;
/** The IDs of its tasks, by their places in the picker. */
const IDS = BANKS.flatMap(({ tasks }) => tasks.map(({ id }) => id));
/** Where the picker holds the first page of a workbook and the first essay, as values. */
const WORKBOOK = String(IDS.indexOf("workbook-01"));
const ESSAY = String(IDS.indexOf("essay-01"));

/** A part of a statement, as the open view holds it. */
type StatementPart = NonNullable<Parameters<typeof kindOf>[0]["statement"]>[number];
/** A task of the copy of the open views of modules, as module-kit open wrote it. */
interface ViewEntry {
  readonly task: Parameters<typeof kindOf>[0];
  readonly seed?: string;
  readonly open_view_digest: string;
}
/** The modules of the copy the build carries for an eval set, each with the tasks the page takes of
 * it, in the build's order, after tutor's (T101). */
const MODULES = (
  JSON.parse(readFileSync(join(modulesFolder(MODULES_FILE.tag), OPEN_VIEWS), "utf8")) as {
    modules: {
      id: string;
      version: string;
      release: string;
      package_digest: string;
      manifest: Record<string, unknown>;
      tasks: ViewEntry[];
    }[];
  }
).modules.map((module) => ({
  ...module,
  tasks: module.tasks.filter(({ task }) => kindOf(task) !== undefined),
}));

/** The part of the legal texts for tests alone, its sets in force (T20, T89; R58, R69). */
const TEST_PART = "page/sets/test";

let folder: string;
let built: { path: string; packages: readonly Carried[] };
/** The page built with the part of the legal texts for tests alone. */
let tested: { path: string };
let browser: Browser;

beforeAll(async () => {
  folder = mkdtempSync(join(tmpdir(), "canvas-page-"));
  built = await buildPage(folder, "0.0.0");
  tested = await buildPage(join(folder, "test"), "0.0.0", TEST_PART);
  browser = await chromium.launch();
}, 120_000);

/** The start gone through on a page (T20, T84): a purpose, for the measurement a new writer's code
 * or one typed, for a child's session the code typed, and every statement ticked; the writer's
 * code it began with, if any. */
async function begin(
  page: Page,
  purpose: "measurement" | "evalSet" | "child",
  typed?: string,
): Promise<string | undefined> {
  await page.check(`input[name="purpose"][value="${purpose}"]`);
  let code: string | undefined;
  if (purpose !== "evalSet") {
    if (typed === undefined) {
      await page.check('input[name="code"][value="new"]');
      code = /[0-9A-Z]{6,16}/.exec((await page.textContent("#new-code")) ?? "")?.[0];
    } else {
      await page.check('input[name="code"][value="own"]');
      await page.fill("#typed", typed);
    }
  }
  expect(await page.isDisabled("#begin")).toBe(true);
  for (const tick of await page.locator("#statements input[data-statement]").all()) {
    await tick.check();
  }
  await page.click("#begin");
  await expect.poll(() => page.locator("novatrail-canvas").count()).toBe(1);
  // The focus moved to the picker of tasks, which may scroll: the tests draw from the top.
  await page.evaluate(() => window.scrollTo(0, 0));
  return code;
}

/** A stroke of the mouse on the element, between two points of its box. */
async function stroke(
  page: Page,
  box: { x: number; y: number },
  [x1, y1]: readonly [number, number],
  [x2, y2]: readonly [number, number],
  steps = 8,
): Promise<void> {
  await page.mouse.move(box.x + x1, box.y + y1);
  await page.mouse.down();
  await page.mouse.move(box.x + x2, box.y + y2, { steps });
  await page.mouse.up();
}

/** The sheet's one stroke marked up as one part, its text the final answer, nothing personal said,
 * and saved: the sample the download holds. */
async function markAndSave(page: Page, text: string): Promise<Sample> {
  await page.click("#markup");
  await page.locator('#form li[data-part="0"] textarea').fill(text);
  await page.check('#form li[data-part="0"] input[data-flag="finalAnswer"]');
  await page.check("#personal");
  const [download] = await Promise.all([page.waitForEvent("download"), page.click("#save")]);
  return readSample(readFileSync(await download.path(), "utf8"));
}

/** What axe finds against WCAG 2.2 level AA on a page as it now stands (T90; R70): each rule
 * violated, with its nodes, and each it leaves incomplete. Its script goes in by evaluate, for the
 * page's policy admits no script the page did not bring. */
async function axeFinds(page: Page): Promise<string[]> {
  if (!(await page.evaluate(() => "axe" in window))) await page.evaluate(axe.source);
  return page.evaluate(
    async (tags) => {
      type Found = { id: string; nodes: { target: unknown }[] };
      type Run = (...a: unknown[]) => Promise<{ violations: Found[]; incomplete: Found[] }>;
      const run = (window as unknown as { axe: { run: Run } }).axe.run;
      const { violations, incomplete } = await run(document, {
        runOnly: { type: "tag", values: tags },
      });
      return [
        ...violations.map(
          ({ id, nodes }) => `${id}: ${nodes.map(({ target }) => String(target)).join("; ")}`,
        ),
        ...incomplete.map(({ id }) => `incomplete: ${id}`),
      ];
    },
    [...TAGS],
  );
}

/** What a page asks for outside its file, and the errors it throws, gathered while it runs. */
function watched(page: Page): { outside: string[]; errors: string[] } {
  const outside: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (!url.startsWith("file:") && !url.startsWith("blob:")) outside.push(url);
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return { outside, errors };
}

afterAll(async () => {
  await browser?.close();
  rmSync(folder, { recursive: true, force: true });
});

describe("the builder", () => {
  test("names the file by a version X.Y.Z, and refuses another", () => {
    expect(fileName("1.2.3")).toBe("samples-page_v1.2.3.html");
    expect(() => fileName("v1.2.3")).toThrow("no version X.Y.Z");
  });

  test("refuses a carriage return, an inline script it would end early, and a template without its places", () => {
    const template = readFileSync(TEMPLATE, "utf8");
    expect(() => pageOf(template, "a\r\nb", "")).toThrow("the bundle holds a control character");
    expect(() => pageOf(template, `a${String.fromCodePoint(0)}b`, "")).toThrow(
      "the bundle holds a control character",
    );
    expect(() => pageOf(template, 'x="</SCRIPT>"', "")).toThrow("holds </script or <!--");
    expect(() => pageOf(template.replace("<!-- notices -->", ""), "x", "")).toThrow(
      "has not one <!-- notices -->",
    );
    expect(notices("own", [], "icons")).toContain("NovaTrail canvas — Apache-2.0");
  });

  test("offers every task of the file, an essay by its one slot, and refuses a picture (T21)", () => {
    const view = (canvas: object) => ({ reference: {}, canvas }) as never;
    const file = (
      statement: { text?: string; picture?: string }[],
    ): Parameters<typeof pageTasksOf>[0] => ({
      banks: [
        {
          bank: "b.json",
          tasks: [
            { id: "s", statement, items: [{ answer_slots: [{ binding: "anywhere" }] }] },
            { id: "e", statement: [], items: [{ answer_slots: [{ binding: "sheet" }] }] },
            { id: "w", statement: [], items: [{ line: [{ binding: "box" }] }] },
          ],
        },
      ],
    });
    const open = new Map([
      ["b.json", [view({ sheet: true }), view({ sheet: true }), view({ workbook: [] })]],
    ]);
    expect(
      pageTasksOf(file([{ text: "t" }]), open).map(({ kind, task }) => [kind, task.id]),
    ).toEqual([
      ["sheet", "s"],
      ["essay", "e"],
      ["workbook", "w"],
    ]);
    expect(() => pageTasksOf(file([{ picture: "p.png" }]), open)).toThrow(
      "b.json s names a picture, and the build carries no media",
    );
    expect(() => pageTasksOf(file([]), new Map())).toThrow("no task 0 in b.json");
    const shaped = (items: Parameters<typeof pageTasksOf>[0]["banks"][0]["tasks"][0]["items"]) =>
      pageTasksOf(
        { banks: [{ bank: "b.json", tasks: [{ id: "c", statement: [], items }] }] },
        open,
      );
    for (const items of [
      [{ answer_slots: [{ binding: "choice", options: ["1", "2"] }] }],
      [{ answer_slots: [{ binding: "anywhere" }] }, { answer_slots: [{ binding: "anywhere" }] }],
      [{ answer_slots: [{ binding: "anywhere" }, { binding: "sheet" }] }],
      [],
    ] as const) {
      expect(() => shaped(items)).toThrow("b.json c has not one answer slot");
    }
  });

  test("offers a module's sheets, essays and pages of a workbook with the media they name, and leaves a tapped choice out (T101)", () => {
    const reference = { reference: {}, canvas: { sheet: true } } as never;
    const task = (id: string, binding: string, picture?: string) => ({
      view: {
        id,
        statement: picture === undefined ? [] : [{ picture, alt: "", width: 1, height: 1 }],
        canvas: { kind: "handwriting_sheet" },
        items: [
          { answer_slots: [{ binding, ...(binding === "choice" ? { options: ["a", "b"] } : {}) }] },
        ],
      },
      open: reference,
    });
    const asked: string[] = [];
    const file = (module: string, version: string, path: string) => {
      asked.push(`${module} ${version} ${path}`);
      return Buffer.from(path);
    };
    const { tasks, modules } = moduleTasksFor(
      [
        {
          module: "a/m",
          version: "1.0.0",
          manifest: { module_format_version: "0.4" },
          tasks: [
            task("s", "anywhere", "p.png"),
            task("c", "choice", "q.png"),
            task("e", "sheet"),
            task("t", "anywhere", "p.png"),
          ],
        },
        { module: "a/n", version: "2.0.0", manifest: {}, tasks: [task("c", "choice")] },
      ],
      file,
    );
    expect(tasks.map(({ kind, bank, task, module }) => [kind, bank, task.id, module])).toEqual([
      ["sheet", "a/m 1.0.0", "s", "a/m 1.0.0"],
      ["essay", "a/m 1.0.0", "e", "a/m 1.0.0"],
      ["sheet", "a/m 1.0.0", "t", "a/m 1.0.0"],
    ]);
    // A picture once, and none of a task the page leaves out; a module with no task it takes is not
    // carried at all.
    expect(asked).toEqual(["a/m 1.0.0 p.png"]);
    expect(modules).toEqual({
      "a/m 1.0.0": {
        manifest: { module_format_version: "0.4" },
        media: { "p.png": { type: "image/png", data: Buffer.from("p.png").toString("base64") } },
      },
    });
    expect(() =>
      moduleTasksFor(
        [
          {
            module: "a/m",
            version: "1.0.0",
            manifest: {},
            tasks: [task("g", "anywhere", "p.gif")],
          },
        ],
        file,
      ),
    ).toThrow("a/m 1.0.0 g: p.gif is no PNG or WebP picture");
    for (const path of ["../../LICENSE", "/etc/passwd", "a//b.png", "a\\b.png", "./b.png"]) {
      expect(() =>
        moduleTasksFor(
          [{ module: "a/m", version: "1.0.0", manifest: {}, tasks: [task("g", "anywhere", path)] }],
          file,
        ),
      ).toThrow(`a/m 1.0.0 g: ${path} is no path inside a module's media/`);
    }
    expect(
      kindOf({ id: "w", statement: [], canvas: { kind: "workbook" } as never, items: [] }),
    ).toBe("workbook");
  });

  test("names the modules whose tasks it carries by the license their manifests name, with their notices, and a license text once (T101)", () => {
    const own = readFileSync("LICENSE", "utf8");
    const copy = modulesFolder(MODULES_FILE.tag);
    const carried = Object.fromEntries(
      MODULES.map(({ id, version, manifest }) => [`${id} ${version}`, { manifest }]),
    );
    const parts = moduleNotices(carried, own, copy);
    expect(parts.map((part) => part.split("\n")[0])).toEqual(
      MODULES.map(
        ({ id, version }) =>
          `${id} ${version}, the tasks and pictures of the module — Apache-2.0, the text of the first part`,
      ),
    );
    // What olympiad-math took from MathTrail, under the MIT License, is in its NOTICE.
    expect(parts.find((part) => part.startsWith("novatrail/olympiad-math"))).toContain(
      "mathtrail-standalone",
    );
    // A LICENSE other than canvas's goes in whole, under the name its manifest gives.
    const grade3 = { "novatrail/grade-3-math 0.3.0": { manifest: { license: "CC-BY-4.0" } } };
    const [other] = moduleNotices(grade3, "another license", copy);
    expect(other?.split("\n")[0]).toBe(
      "novatrail/grade-3-math 0.3.0, the tasks and pictures of the module — CC-BY-4.0",
    );
    expect(other).toContain("Apache License");
    expect(() =>
      moduleNotices({ "novatrail/grade-3-math 0.3.0": { manifest: {} } }, own, copy),
    ).toThrow("novatrail/grade-3-math 0.3.0 names no license");
  });

  test("takes the release file's sets in force, and the part for tests into no version but 0.0.0 (T89, T102)", () => {
    // At v0.15.0 the measurement's and the eval set's sets are in force, and a child's is a draft.
    expect(textsFor("1.0.0")).toEqual({
      measurement: expect.objectContaining({ version: RELEASE_TEXTS }),
      evalSet: expect.objectContaining({ version: "eval-set-1" }),
    });
    const tests = textsFor("0.0.0", TEST_PART);
    expect([tests.measurement?.version, tests.evalSet?.version, tests.child?.version]).toEqual([
      "test-measure-1",
      "test-eval-set-1",
      "test-child-sample-1",
    ]);
    expect(() => textsFor("1.0.0", TEST_PART)).toThrow("go into no page but 0.0.0");
  });
});

describe("the file", () => {
  test("is one file whose policy allows its own style and script by their hashes, with nothing outside it", () => {
    const page = readFileSync(built.path, "utf8");
    expect(built.path.endsWith("samples-page_v0.0.0.html")).toBe(true);
    expect(page).toMatch(
      /^<!doctype html>\n<html lang="ru" translate="no">\n<meta charset="utf-8">\n/,
    );
    // The one inline script, by where its tags stand: the builder writes them as they are.
    const open = page.indexOf("<script>") + "<script>".length;
    const script = page.slice(open, page.lastIndexOf("</script>"));
    expect(script.length).toBeGreaterThan(1000);
    expect(page).toContain(
      `<meta http-equiv="Content-Security-Policy" content="${policy(styleOf(page), script)}">`,
    );
    // No resource is asked for by an address: everything is inline.
    expect(page).not.toMatch(/\s(src|href)=/);
    expect(page.match(/<script/g)).toHaveLength(1);
  });

  test("of a release's version is the same bytes on every build, by its name, with the sets in force (T75, T102)", async () => {
    const once = await buildPage(join(folder, "release"), "1.2.3");
    // The other build in a process of its own, as release-files runs the builder.
    const again =
      execFileSync(process.execPath, ["scripts/page.ts", join(folder, "again"), "1.2.3"], {
        encoding: "utf8",
      }).split("\n")[0] ?? "";
    expect(once.path.endsWith("samples-page_v1.2.3.html")).toBe(true);
    expect(again).toBe(join(folder, "again", "samples-page_v1.2.3.html"));
    const page = readFileSync(once.path, "utf8");
    expect(readFileSync(again, "utf8")).toBe(page);
    // The minifier writes the strings of the page's data in any of the quotes.
    expect(page).toMatch(/version:["'`]1\.2\.3["'`]/);
    expect(page).toMatch(/["'`]measure-2["'`]/);
    expect(page).toMatch(/["'`]eval-set-1["'`]/);
    expect(page).not.toMatch(/test-(measure|eval-set|child-sample)/);
    // The notice in force is shown, and no draft of the legal texts, a child's sample's, to anyone
    // (README of spec's legal part, section 2).
    expect(page).toContain("what happens to your samples");
    expect(page).not.toMatch(/child-sample-\d/);
  }, 60_000);

  test("names every package it carries, with its license's text, and the icons' set", () => {
    const page = readFileSync(built.path, "utf8");
    expect(built.packages.map(({ name }) => name)).toEqual([
      "@altnovatrail/contracts",
      "@bufbuild/protobuf",
      "perfect-freehand",
      "quickselect",
      "rbush",
    ]);
    for (const { name, version, license } of built.packages) {
      expect(page).toContain(`${name} ${version} — ${license}`);
    }
    expect(page).toContain("Redistribution and use in source and binary forms");
    expect(page).toContain("Material Symbols");
    expect(page).toContain("NovaTrail canvas — Apache-2.0");
    expect(page).toContain("novatrail/olympiad-math 0.3.0, the tasks and pictures of the module");
    expect(page).toContain("mathtrail-standalone");
  });
});

describe("opened from a file", () => {
  test("shows the element and its tasks, asks for nothing outside the file, keeps the policy, and saves a sample that reads back", async () => {
    const context = await browser.newContext({ acceptDownloads: true });
    try {
      const page = await context.newPage();
      const { outside, errors } = watched(page);
      await page.addInitScript(() => {
        const seen: string[] = [];
        Object.assign(window, { violations: seen });
        document.addEventListener("securitypolicyviolation", (event) =>
          seen.push(event.effectiveDirective),
        );
      });
      await page.goto(pathToFileURL(built.path).href);
      await page.waitForFunction(() => customElements.get("novatrail-canvas") !== undefined);
      // Every task of tutor's file, a group for each bank, in the file's order (T21), then the
      // tasks of each module the page takes, a group for each (T101).
      const groups = () =>
        page
          .locator("#task optgroup")
          .evaluateAll((groups) =>
            groups.map((group) => [group.getAttribute("label"), group.children.length]),
          );
      const ofBanks = BANKS.map(({ bank, tasks }) => [`Банк ${bank}`, tasks.length]);
      expect(await groups()).toEqual([
        ...ofBanks,
        ...MODULES.map(({ id, version, tasks }) => [`Модуль ${id} ${version}`, tasks.length]),
      ]);
      const titles = await page.locator("#task option").allTextContents();
      expect(titles).toHaveLength(56 + 758);
      const at = (id: string) => titles[IDS.indexOf(id)];
      expect([at("equation-1"), at("grasshopper"), at("workbook-01"), at("essay-01")]).toEqual([
        "Лист: equation-1",
        "Лист: grasshopper",
        "Тетрадь: workbook-01",
        "Сочинение: essay-01",
      ]);
      // The emulators' drivers count the tasks and choose the workbook by these (emulators/watch.ts).
      expect([titles.length, WORKBOOK]).toEqual([EMULATED_TASKS, EMULATED_WORKBOOK]);
      expect(await page.textContent("#version")).toBe("Версия страницы: 0.0.0.");
      // The words for a device where the script does not run, an iPad's Files: in the file, and gone
      // once the script runs (T85).
      expect(readFileSync(built.path, "utf8")).toContain("На iPad сборку, открытую из файла");
      expect(await page.locator("#no-script").count()).toBe(0);
      // The start (T20, T89, T102): the measurement and the eval set open by their sets in force,
      // a child's session closed, with why, while its set is a draft; nothing is written before the
      // purpose, a new writer's code shown to be written down, and both statements.
      expect(await page.isDisabled('input[name="purpose"][value="evalSet"]')).toBe(false);
      expect(await page.locator("#purpose-note-evalSet").count()).toBe(0);
      expect(await page.isDisabled('input[name="purpose"][value="child"]')).toBe(true);
      expect(await page.textContent("#purpose-note-child")).toContain("не утверждён");
      expect(await page.locator("#purpose-note-measurement").count()).toBe(0);
      expect(await page.isHidden("#work")).toBe(true);
      const code = (await begin(page, "measurement")) ?? "";
      expect(code).toMatch(/^[0-9A-Z]{6,16}$/);
      // The measurement takes tutor's tasks alone: the modules' leave the picker (T101).
      expect(await groups()).toEqual(ofBanks);
      expect(await page.textContent("#summary-text")).toContain(code);
      const box = await page.locator("novatrail-canvas").boundingBox();
      if (!box) throw new Error("the element is not shown");
      await stroke(page, box, [120, 220], [220, 280]);
      // Nothing is saved before the markup is whole (T81): the stroke is one part, its text the
      // final answer, and the answer as written.
      expect(await page.isDisabled("#save")).toBe(true);
      // A second stroke far off, a group of its own: two parts, which the writer joins after
      // typing the second's text, and the text stays.
      await stroke(page, box, [600, 220], [640, 260], 4);
      await page.click("#markup");
      expect(await page.locator("#form li[data-part]").count()).toBe(2);
      await page.locator('#form li[data-part="1"] textarea').fill("x = 2");
      await page.click('#form li[data-part="0"] [data-act="join"]');
      await expect.poll(() => page.locator("#form li[data-part]").count()).toBe(1);
      expect(await page.inputValue('#form li[data-part="0"] textarea')).toBe("x = 2");
      await page.check('#form li[data-part="0"] input[data-flag="finalAnswer"]');
      expect(await page.inputValue("#answer")).toBe("x = 2");
      await page.fill("#answer", "2");
      expect(await page.isDisabled("#save")).toBe(true);
      await page.check("#personal");
      // The part's frames on the sheet, one for each of its two groups, as the element shows marks.
      await page.click('#form li[data-part="0"] [data-act="show"]');
      expect(
        await page.evaluate(() => document.querySelector("novatrail-canvas")?.marks?.marks.length),
      ).toBe(2);
      const [download] = await Promise.all([page.waitForEvent("download"), page.click("#save")]);
      const sample = readSample(readFileSync(await download.path(), "utf8"));
      // Named by its ID alone, as an eval set lays its files out (T101).
      expect(download.suggestedFilename()).toBe(`${sample.id}.json`);
      expect(sample.id).toMatch(/^[a-z2-7]{12}$/);
      expect(sample.purpose).toBe(Purpose.MEASUREMENT);
      expect(sample.writer).toBe(Writer.ADULT);
      expect(sample.canvasVersion).toBe("0.0.0");
      expect(sample.task?.task).toBe("equation-1");
      expect(sample.textSetVersion).toBe(RELEASE_TEXTS);
      expect(sample.writerCode).toBe(code);
      const read = sample.markup?.truth?.answerSlots[0]?.read;
      expect(read?.case === "value" && read.value).toBe("2");
      const writing = sample.markup?.writing;
      expect(
        writing?.case === "parts" &&
          writing.value.parts.map((part) => [part.text, part.finalAnswer]),
      ).toEqual([["x = 2", true]]);
      // Where the file goes, by the set of texts.
      expect(await page.textContent("#hand-over")).toContain("организатору замера");
      // A stroke not saved is lost only when the person says so: a refusal keeps the task. The
      // form made the page longer and the clicks scrolled it: the element is where it began.
      await page.evaluate(() => window.scrollTo(0, 0));
      await stroke(page, box, [300, 220], [360, 260], 4);
      page.once("dialog", (dialog) => dialog.dismiss());
      await page.selectOption("#task", WORKBOOK);
      expect(await page.inputValue("#task")).toBe("0");
      page.once("dialog", (dialog) => dialog.accept());
      await page.selectOption("#task", WORKBOOK);
      expect(await page.inputValue("#task")).toBe(WORKBOOK);
      // The page of the workbook: a stroke in its first box, and a sample of its surface.
      await page.evaluate(() => window.scrollTo(0, 0));
      const workbook = await page.locator("novatrail-canvas").boundingBox();
      if (!workbook) throw new Error("the workbook is not shown");
      const inBox = async (dx: number) => {
        await page.mouse.move(workbook.x + 200 + dx, workbook.y + 200);
        await page.mouse.down();
        await page.mouse.move(workbook.x + 230 + dx, workbook.y + 230, { steps: 4 });
        await page.mouse.up();
      };
      await inBox(0);
      await page.click("#markup");
      expect(await page.locator("[data-box]").count()).toBeGreaterThan(1);
      // A stroke after the markup was asked for: the form goes, and is asked for again.
      await page.evaluate(() => window.scrollTo(0, 0));
      await inBox(4);
      expect(await page.isHidden("#form")).toBe(true);
      expect(await page.textContent("#changed")).not.toBe("");
      await page.click("#markup");
      const values = page.locator('[data-box] input[data-field="value"]');
      expect(await values.count()).toBe(1);
      await values.fill("5");
      await page.check('input[name="writer"][value="child"]');
      await page.check("#personal");
      const [again] = await Promise.all([page.waitForEvent("download"), page.click("#save")]);
      const page2 = readSample(readFileSync(await again.path(), "utf8"));
      expect(page2.task?.task).toBe("workbook-01");
      expect(page2.writerCode).toBe(code);
      expect(page2.writer).toBe(Writer.ADULT_AS_CHILD);
      const reads = page2.markup?.truth?.answerSlots.map(({ read }) => read.value) ?? [];
      expect(reads.filter((value) => value === "5")).toHaveLength(1);
      expect(reads.length).toBeGreaterThan(1);
      expect(outside).toEqual([]);
      expect(errors).toEqual([]);
      expect(
        await page.evaluate(() => (window as unknown as { violations: string[] }).violations),
      ).toEqual([]);
    } finally {
      await context.close();
    }
  }, 60_000);

  test("marks an essay up by its text as written, and saves it with no mark of a criterion (T21)", async () => {
    const context = await browser.newContext({ acceptDownloads: true });
    try {
      const page = await context.newPage();
      await page.goto(pathToFileURL(built.path).href);
      await begin(page, "measurement");
      await page.selectOption("#task", ESSAY);
      await page.evaluate(() => window.scrollTo(0, 0));
      // The essay's statement, on its lined sheet.
      expect(
        await page.evaluate(() => document.querySelector("novatrail-canvas")?.task?.statement),
      ).toEqual([{ text: expect.stringContaining("robot that bakes bread") }]);
      const box = await page.locator("novatrail-canvas").boundingBox();
      if (!box) throw new Error("the element is not shown");
      await stroke(page, box, [120, 220], [320, 240]);
      await page.click("#markup");
      expect(await page.locator("#form li[data-part]").count()).toBe(0);
      expect(await page.textContent("#form")).toContain("Оценки критериев ставит организатор");
      await page.check("#personal");
      expect(await page.textContent("#lacks")).toContain("текст сочинения");
      await page.fill('#form textarea[data-field="essay"]', " The Bread Robot\nIt bakes bred. ");
      const [download] = await Promise.all([page.waitForEvent("download"), page.click("#save")]);
      const sample = readSample(readFileSync(await download.path(), "utf8"));
      expect(sample.task?.task).toBe("essay-01");
      const read = sample.markup?.truth?.answerSlots[0]?.read;
      expect(read?.case === "value" && read.value).toBe("The Bread Robot\nIt bakes bred.");
      expect(sample.markup?.writing).toEqual({
        case: "marks",
        value: expect.objectContaining({ marks: [] }),
      });
    } finally {
      await context.close();
    }
  }, 60_000);

  test("has no violation that axe finds: the start of both builds, a notice of each, writing and the markup (T90)", async () => {
    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      await page.goto(pathToFileURL(built.path).href);
      expect(await axeFinds(page)).toEqual([]);
      await page.check('input[name="purpose"][value="measurement"]');
      expect(await axeFinds(page)).toEqual([]);
      await page.goto(pathToFileURL(tested.path).href);
      for (const purpose of ["measurement", "child"]) {
        await page.check(`input[name="purpose"][value="${purpose}"]`);
        expect(await axeFinds(page)).toEqual([]);
      }
      await begin(page, "measurement", "ab12cd34");
      expect(await axeFinds(page)).toEqual([]);
      // The form of the markup, once a stroke is written.
      const box = await page.locator("novatrail-canvas").boundingBox();
      if (!box) throw new Error("the element is not shown");
      await stroke(page, box, [120, 220], [220, 280]);
      await page.click("#markup");
      await expect.poll(() => page.locator("#form li[data-part]").count()).toBe(1);
      expect(await axeFinds(page)).toEqual([]);
      // And axe does look: a button of no name, put on the page, is a violation.
      await page.evaluate(() => document.body.append(document.createElement("button")));
      expect(await axeFinds(page)).toEqual([expect.stringMatching(/^button-name: /)]);
    } finally {
      await context.close();
    }
  }, 60_000);

  test("remembers nothing of the start when opened anew: no purpose, no code, no statement, and no storage used (R11)", async () => {
    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      await page.goto(pathToFileURL(built.path).href);
      // A code typed is forgiven its case and spaces; one out of shape is named, and holds.
      await page.check('input[name="purpose"][value="measurement"]');
      await page.check('input[name="code"][value="own"]');
      await page.fill("#typed", "ab1");
      expect(await page.textContent("#start-lacks")).toContain("от 6 до 16");
      await page.fill("#typed", "");
      expect(await begin(page, "measurement", "ab12 cd34")).toBeUndefined();
      // Once writing has begun, no file opens: the sheet half written stays as it is (T87).
      expect(await page.isHidden("#open")).toBe(true);
      expect(await page.textContent("#summary-text")).toContain("AB12CD34");
      const storage = () =>
        page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie]);
      expect(await storage()).toEqual([0, 0, ""]);
      await page.reload();
      expect(await page.isVisible("#start")).toBe(true);
      expect(await page.isVisible("#open")).toBe(true);
      expect(await page.isHidden("#work")).toBe(true);
      expect(await page.locator('input[name="purpose"]:checked').count()).toBe(0);
      expect(await page.locator('input[name="code"]:checked').count()).toBe(0);
      expect(await page.inputValue("#typed")).toBe("");
      expect(await page.locator("#statements input[data-statement]").count()).toBe(0);
      expect(await storage()).toEqual([0, 0, ""]);
    } finally {
      await context.close();
    }
  }, 60_000);

  test("with the part for tests shows the set's gist and English text, and asks the form of its version (T20, T89)", async () => {
    const context = await browser.newContext({ acceptDownloads: true });
    try {
      const page = await context.newPage();
      await page.goto(pathToFileURL(tested.path).href);
      // The build carries the tasks of modules, so the eval set is open by its set (T101).
      expect(await page.isDisabled('input[name="purpose"][value="evalSet"]')).toBe(false);
      expect(await page.locator("#purpose-note-evalSet").count()).toBe(0);
      expect(await page.locator("#purpose-note-measurement").count()).toBe(0);
      await page.check('input[name="purpose"][value="measurement"]');
      expect(await page.textContent("#notice-title")).toContain("test-measure-1");
      // The gist in Russian, then the text in force, in English, block by block.
      const notice = page.locator("#notice-text");
      expect(await notice.locator("p").first().textContent()).toContain("Коротко: Тестовый набор");
      const english = notice.locator('div[lang="en"]');
      expect(await english.locator("h4").first().textContent()).toBe("Test set: the measurement");
      expect(await english.locator("h5").allTextContents()).toEqual([
        "What a sample holds",
        "How it ends",
      ]);
      expect(await english.locator("ul > li").count()).toBe(3);
      expect(await english.locator("strong").first().textContent()).toBe("for tests alone");
      expect(await english.locator("li code").textContent()).toBe("ABCD2345");
      expect(await english.locator("thead th").allTextContents()).toEqual([
        "Who",
        "Sees the sample",
      ]);
      expect(await english.locator("tbody tr").count()).toBe(2);
      // An ordered list keeps the number the text gives its first item.
      expect(
        await english
          .locator("ol")
          .evaluateAll((lists) => lists.map((list) => (list as HTMLOListElement).start)),
      ).toEqual([1, 2]);
      const ticks = page.locator("#statements label");
      expect(await ticks.count()).toBe(2);
      expect(await ticks.nth(1).textContent()).toContain("Форма согласия версии test-measure-1");
      await begin(page, "measurement", "ab12 cd34");
      const box = await page.locator("novatrail-canvas").boundingBox();
      if (!box) throw new Error("the element is not shown");
      await stroke(page, box, [120, 220], [220, 280]);
      const sample = await markAndSave(page, "x = 2");
      expect(sample.purpose).toBe(Purpose.MEASUREMENT);
      expect(sample.writerCode).toBe("AB12CD34");
      expect(sample.textSetVersion).toBe("test-measure-1");
      // Where the file goes is shown for the one saved, and goes with the next stroke.
      expect(await page.textContent("#hand-over")).toContain("по ссылке на загрузку");
      await page.evaluate(() => window.scrollTo(0, 0));
      await stroke(page, box, [300, 220], [360, 260]);
      expect(await page.isHidden("#hand-over")).toBe(true);
    } finally {
      await context.close();
    }
  }, 60_000);

  test("with the part for tests opens the eval set: the modules' tasks alone, a picture of a statement, a template's instance by its seed, and a sample named by its ID (T101)", async () => {
    const context = await browser.newContext({ acceptDownloads: true });
    try {
      const page = await context.newPage();
      const { outside, errors } = watched(page);
      await page.goto(pathToFileURL(tested.path).href);
      await begin(page, "evalSet");
      expect(
        await page
          .locator("#task optgroup")
          .evaluateAll((groups) => groups.map((group) => group.getAttribute("label"))),
      ).toEqual(MODULES.map(({ id, version }) => `Модуль ${id} ${version}`));
      const olympiad = MODULES.find(({ id }) => id === "novatrail/olympiad-math");
      if (!olympiad) throw new Error("no olympiad-math in the copy");
      // The picker's values are the tasks' places in the build: tutor's first, then module by module.
      const before = MODULES.slice(0, MODULES.indexOf(olympiad));
      const base = IDS.length + before.reduce((sum, { tasks }) => sum + tasks.length, 0);
      const pictured = olympiad.tasks.findIndex(({ task }) =>
        (task.statement ?? []).some((part: StatementPart) => part.picture !== undefined),
      );
      await page.selectOption("#task", String(base + pictured));
      // The picture of the statement, from the media the build carries, by a blob: of the page.
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              document
                .querySelector("novatrail-canvas")
                ?.shadowRoot?.querySelector(".statement .picture img")
                ?.getAttribute("src") ?? "",
          ),
        )
        .toMatch(/^blob:/);
      const instance = olympiad.tasks.findIndex(({ seed }) => seed !== undefined);
      const entry = olympiad.tasks[instance];
      if (!entry?.seed) throw new Error("no template's instance in the copy");
      await page.selectOption("#task", String(base + instance));
      expect(await page.locator("#task option:checked").textContent()).toBe(
        `Лист: ${entry.task.id}, зерно ${entry.seed}`,
      );
      await page.evaluate(() => window.scrollTo(0, 0));
      const box = await page.locator("novatrail-canvas").boundingBox();
      if (!box) throw new Error("the element is not shown");
      await stroke(page, box, [120, 260], [220, 320]);
      await page.click("#markup");
      await page.locator('#form li[data-part="0"] textarea').fill("12");
      await page.check('#form li[data-part="0"] input[data-flag="finalAnswer"]');
      await page.check("#personal");
      const [download] = await Promise.all([page.waitForEvent("download"), page.click("#save")]);
      const sample = readSample(readFileSync(await download.path(), "utf8"));
      expect(download.suggestedFilename()).toBe(`${sample.id}.json`);
      expect(sample.id).toMatch(/^[a-z2-7]{12}$/);
      expect(sample.purpose).toBe(Purpose.EVAL_SET);
      expect(sample.textSetVersion).toBe("test-eval-set-1");
      // What modules' eval-match holds the sample to: the release, module and package, the
      // template's ID, the seed, and module-kit's digest of the instance's open view.
      expect(sample.task?.source.case).toBe("modules");
      expect(sample.task?.source.value).toMatchObject({
        tag: olympiad.release,
        module: olympiad.id,
        version: olympiad.version,
        packageDigest: olympiad.package_digest,
      });
      expect([sample.task?.task, sample.task?.seed, sample.task?.openViewDigest]).toEqual([
        entry.task.id,
        entry.seed,
        entry.open_view_digest,
      ]);
      expect(outside).toEqual([]);
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  }, 60_000);

  test("with the part for tests leads a child's session: the code of the form typed, the child writing, a sample of measurement by a child (T84)", async () => {
    const context = await browser.newContext({ acceptDownloads: true });
    try {
      const page = await context.newPage();
      await page.goto(pathToFileURL(tested.path).href);
      // An adult's own code typed does not stay for the child: they are two people's.
      await page.check('input[name="purpose"][value="measurement"]');
      await page.check('input[name="code"][value="own"]');
      await page.fill("#typed", "ab12cd34");
      await page.check('input[name="purpose"][value="child"]');
      expect(await page.textContent("#code-legend")).toBe("Код ребёнка");
      expect(await page.locator('input[name="code"]:checked').count()).toBe(0);
      expect(await page.inputValue("#typed")).toBe("");
      // A new code is for the form, made without the child: no session begins with it.
      await page.check('input[name="code"][value="new"]');
      expect(await page.textContent("#new-code")).toMatch(/[0-9A-Z]{6,16}.*test-child-sample-1/);
      expect(await page.textContent("#start-lacks")).toContain("принятой формы");
      expect(await page.locator("#statements label").nth(1).textContent()).toContain(
        "родителя или опекуна этого ребёнка версии test-child-sample-1",
      );
      await begin(page, "child", "kid 12345");
      expect(await page.textContent("#summary-text")).toContain("код ребёнка KID12345");
      expect(await page.isHidden("#writer")).toBe(true);
      expect(await page.isVisible("#child-writes")).toBe(true);
      expect(await page.textContent("#ipad-note")).toContain("On My iPad");
      const box = await page.locator("novatrail-canvas").boundingBox();
      if (!box) throw new Error("the element is not shown");
      await stroke(page, box, [120, 220], [220, 280]);
      const sample = await markAndSave(page, "7");
      // Illegible on purpose is the writer's to say: the adult marking a child's sheet says it unread.
      expect(
        await page.locator('#form label:has(input[data-flag="illegible"])').textContent(),
      ).toContain("со слов ребёнка");
      expect(sample.purpose).toBe(Purpose.MEASUREMENT);
      expect(sample.writer).toBe(Writer.CHILD);
      expect(sample.ink.case).toBe("geometry");
      expect(sample.writerCode).toBe("KID12345");
      expect(sample.textSetVersion).toBe("test-child-sample-1");
      expect(sample.license).toBeUndefined();
      // By the organiser's upload link, then erased from the device (R125 spec; T88).
      const handOver = await page.textContent("#hand-over");
      expect(handOver).toContain("не pull request");
      expect(handOver).toContain("по ссылке на загрузку");
      expect(handOver).toContain("сотрите его с устройства");
    } finally {
      await context.close();
    }
  }, 60_000);
});

/** How many crops a sample's file holds: the sheet's, or every filled box's. */
function cropsOf({ surface }: Sample): number {
  if (surface.case === "sheet") return surface.value.crops?.crops.length ?? 0;
  if (surface.case !== "workbook") return 0;
  return surface.value.filledBoxes.reduce((sum, box) => sum + (box.crops?.crops.length ?? 0), 0);
}

describe("a sample file opened on the page (T87)", () => {
  test("shows each composition's strokes, crops and markup from the file alone, the erased apart, and keeps and sends nothing", async () => {
    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      const { outside, errors } = watched(page);
      page.on("download", () => errors.push("a download"));
      await page.goto(pathToFileURL(built.path).href);
      expect(await page.isVisible("#open")).toBe(true);
      expect(await page.isHidden("#view")).toBe(true);
      for (const name of [
        "sheet-measurement",
        "sheet-eval-set",
        "module-sheet-eval-set",
        "workbook-child",
        "page-workbook-measurement",
        "page-essay-measurement",
      ]) {
        const path = join("examples", `${name}.json`);
        const sample = readSample(readFileSync(path, "utf8"));
        await page.setInputFiles("#open-file", path);
        await expect.poll(() => page.isVisible("#view")).toBe(true);
        expect(await page.isHidden("#start")).toBe(true);
        // Every stroke the file holds is drawn: what the sheet showed at the end, and apart what the
        // history did not show, which the examples erased.
        const { shown, hidden } = viewOf(sample);
        const erased = (sample.ink.case === "history" ? sample.ink.value.events : []).flatMap(
          ({ event }) => (event.case === "erase" ? event.value.ids : []),
        );
        expect(hidden.map(({ id }) => id).sort()).toEqual([...erased].sort());
        expect(await page.locator("#view svg > polyline").count()).toBe(shown.length);
        expect(await page.locator("#view svg [data-hidden] polyline").count()).toBe(hidden.length);
        // Those the sheet did not show are drawn only once asked for.
        const display = () => page.getAttribute("#view svg [data-hidden]", "display");
        expect(await display()).toBe("none");
        expect(await page.locator("#show-hidden").count()).toBe(hidden.length > 0 ? 1 : 0);
        if (hidden.length > 0) {
          await page.check("#show-hidden");
          expect(await display()).toBe("inline");
        }
        const boxes = sample.surface.case === "workbook" ? sample.surface.value.boxes.length : 0;
        expect(await page.locator("#view svg rect[data-box]").count()).toBe(boxes);
        const images = page.locator("#view img.crop");
        expect(await images.count()).toBe(cropsOf(sample));
        // Each crop is the file's PNG, which the browser decodes and draws at its size.
        expect(
          await images.evaluateAll((all) =>
            Promise.all(
              all.map(async (image) => {
                const picture = image as HTMLImageElement;
                await picture.decode();
                return picture.naturalWidth > 0;
              }),
            ),
          ),
        ).not.toContain(false);
        const text = (await page.textContent("#view")) ?? "";
        expect(text).toContain(sample.id);
        const parts =
          sample.markup?.writing.case === "parts" ? sample.markup.writing.value.parts : [];
        for (const part of parts) expect(text).toContain(part.text);
        // Nothing axe finds in the file shown, either (T90). A workbook's boxes carry their places
        // under the strokes, inside the picture: text that is «part of a picture that contains
        // significant other visual content», which 1.4.3 exempts, and whose background axe cannot
        // tell.
        expect(await axeFinds(page)).toEqual(boxes > 0 ? ["incomplete: color-contrast"] : []);
      }
      // A file of no sample is said so, and the last one shown goes.
      const wrong = join(folder, "not-a-sample.json");
      writeFileSync(wrong, '{"protocol":"novatrail.eval.v1","name":"x"}');
      await page.setInputFiles("#open-file", wrong);
      await expect
        .poll(() => page.textContent("#open-error"))
        .toContain("не может прочесть этот файл");
      expect(await page.isHidden("#view")).toBe(true);
      const storage = () =>
        page.evaluate(async () => [
          localStorage.length,
          sessionStorage.length,
          document.cookie,
          (await indexedDB.databases()).length,
        ]);
      expect(await storage()).toEqual([0, 0, "", 0]);
      // Back to the start is the page opened anew, with nothing of the file.
      await page.click("#open-back");
      await expect.poll(() => page.isVisible("#start")).toBe(true);
      expect(await page.isHidden("#view")).toBe(true);
      expect(await page.isHidden("#open-back")).toBe(true);
      expect(outside).toEqual([]);
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  }, 60_000);
});
