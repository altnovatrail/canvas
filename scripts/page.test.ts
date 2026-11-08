// The build of the samples page (T19 in RUN.md; R55 in docs/decisions.md): what the builder refuses,
// the one file it writes, and that file opened by file:// in Chrome Headless Shell from the
// toolchain stage (R13), as a volunteer opens it from the downloads — no request leaves it, the
// policy is kept, and the sample it saves reads back.

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Purpose, Writer } from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import { type Browser, chromium } from "playwright";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { readSample } from "../src/eval/sample.ts";
import { policy, styleOf } from "./csp.ts";
import {
  buildPage,
  type Carried,
  carried,
  fileName,
  keptName,
  notices,
  packagesOf,
  pageOf,
  TEMPLATE,
} from "./page.ts";

let folder: string;
let built: { path: string; packages: readonly Carried[] };
let browser: Browser;

beforeAll(async () => {
  folder = mkdtempSync(join(tmpdir(), "canvas-page-"));
  built = await buildPage(folder, "0.0.0");
  browser = await chromium.launch();
}, 120_000);

afterAll(async () => {
  await browser?.close();
  rmSync(folder, { recursive: true, force: true });
});

describe("the builder", () => {
  test("names the file by a version X.Y.Z, and refuses another", () => {
    expect(fileName("1.2.3")).toBe("samples-page_v1.2.3.html");
    expect(() => fileName("v1.2.3")).toThrow("no version X.Y.Z");
  });

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
    const root = mkdtempSync(join(tmpdir(), "canvas-carried-"));
    try {
      const pkg = (name: string, license: string, file?: string) => {
        const at = join(root, name);
        mkdirSync(at, { recursive: true });
        writeFileSync(
          join(at, "package.json"),
          JSON.stringify({ name, version: "1.0.0", license }),
        );
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
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
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
});

describe("the file", () => {
  test("is one file whose policy allows its own style and script by their hashes, with nothing outside it", () => {
    const page = readFileSync(built.path, "utf8");
    expect(built.path.endsWith("samples-page_v0.0.0.html")).toBe(true);
    expect(page).toMatch(/^<!doctype html>\n<html lang="ru">\n<meta charset="utf-8">\n/);
    const script = /<script>([\s\S]*)<\/script>/.exec(page)?.[1] ?? "";
    expect(script.length).toBeGreaterThan(1000);
    expect(page).toContain(
      `<meta http-equiv="Content-Security-Policy" content="${policy(styleOf(page), script)}">`,
    );
    // No resource is asked for by an address: everything is inline.
    expect(page).not.toMatch(/\s(src|href)=/);
    expect(page.match(/<script/g)).toHaveLength(1);
  });

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
  });
});

describe("opened from a file", () => {
  test("shows the element and its tasks, asks for nothing outside the file, keeps the policy, and saves a sample that reads back", async () => {
    const context = await browser.newContext({ acceptDownloads: true });
    try {
      const page = await context.newPage();
      const outside: string[] = [];
      page.on("request", (request) => {
        const url = request.url();
        if (!url.startsWith("file:") && !url.startsWith("blob:")) outside.push(url);
      });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.addInitScript(() => {
        const seen: string[] = [];
        Object.assign(window, { violations: seen });
        document.addEventListener("securitypolicyviolation", (event) =>
          seen.push(event.effectiveDirective),
        );
      });
      await page.goto(pathToFileURL(built.path).href);
      await page.waitForFunction(() => customElements.get("novatrail-canvas") !== undefined);
      expect(await page.locator("#task option").allTextContents()).toEqual([
        "Лист: equation-1",
        "Лист: grasshopper",
        "Тетрадь: workbook-01",
      ]);
      expect(await page.textContent("#version")).toBe("Версия страницы: 0.0.0.");
      const box = await page.locator("novatrail-canvas").boundingBox();
      if (!box) throw new Error("the element is not shown");
      await page.mouse.move(box.x + 120, box.y + 220);
      await page.mouse.down();
      await page.mouse.move(box.x + 220, box.y + 280, { steps: 8 });
      await page.mouse.up();
      // The code of this opening is shown, for the adult to write down.
      const code = (await page.textContent("#code")) ?? "";
      expect(code).toMatch(/^[0-9A-Z]{8}$/);
      const [download] = await Promise.all([page.waitForEvent("download"), page.click("#save")]);
      expect(download.suggestedFilename()).toMatch(/^sample-[a-z2-7]{12}\.json$/);
      const sample = readSample(readFileSync(await download.path(), "utf8"));
      expect(sample.purpose).toBe(Purpose.MEASUREMENT);
      expect(sample.writer).toBe(Writer.ADULT);
      expect(sample.canvasVersion).toBe("0.0.0");
      expect(sample.task?.task).toBe("equation-1");
      expect(sample.textSetVersion).toBe("draft-0");
      expect(sample.writerCode).toBe(code);
      // A stroke not saved is lost only when the person says so: a refusal keeps the task.
      await page.mouse.move(box.x + 300, box.y + 220);
      await page.mouse.down();
      await page.mouse.move(box.x + 360, box.y + 260, { steps: 4 });
      await page.mouse.up();
      page.once("dialog", (dialog) => dialog.dismiss());
      await page.selectOption("#task", "2");
      expect(await page.inputValue("#task")).toBe("0");
      page.once("dialog", (dialog) => dialog.accept());
      await page.selectOption("#task", "2");
      expect(await page.inputValue("#task")).toBe("2");
      // The page of the workbook: a stroke in its first box, and a sample of its surface.
      const workbook = await page.locator("novatrail-canvas").boundingBox();
      if (!workbook) throw new Error("the workbook is not shown");
      await page.mouse.move(workbook.x + 200, workbook.y + 200);
      await page.mouse.down();
      await page.mouse.move(workbook.x + 230, workbook.y + 230, { steps: 4 });
      await page.mouse.up();
      const [again] = await Promise.all([page.waitForEvent("download"), page.click("#save")]);
      const page2 = readSample(readFileSync(await again.path(), "utf8"));
      expect(page2.task?.task).toBe("workbook-01");
      expect(page2.writerCode).toBe(code);
      expect(outside).toEqual([]);
      expect(errors).toEqual([]);
      expect(
        await page.evaluate(() => (window as unknown as { violations: string[] }).violations),
      ).toEqual([]);
    } finally {
      await context.close();
    }
  }, 60_000);
});
