// The watch the drivers of the samples page put into it (T78 in RUN.md; R54 in
// docs/decisions.md): its pure parts, and the watch itself in the page's build opened by file:// in
// Chrome Headless Shell from the toolchain stage (R13), as the drivers use it in the emulators — a
// stroke, a save, the workbook's page, and a page that asks for the network, which it must see.

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { type Browser, chromium, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { hash, policy, styleOf } from "../scripts/csp.ts";
import { buildPage } from "../scripts/page.ts";
import {
  asked,
  blobAt,
  boxOf,
  MARK,
  MARKING,
  MARKUP,
  noNetwork,
  outside,
  pageIn,
  READ,
  type Seen,
  served,
  strokeIn,
  TASKS,
  TO_WORKBOOK,
  verdicts,
  WATCH,
  WORKBOOK,
  watched,
} from "./watch.ts";

const QUIET: Seen = {
  watched: true,
  defined: true,
  tasks: 3,
  task: "0",
  strokes: 1,
  policy: "default-src 'none'; script-src 'sha256-A'; connect-src 'none'",
  resources: [],
  violations: [],
  errors: [],
  blobs: 1,
  pointers: [],
};

describe("the pure parts", () => {
  test("the build's one page is found, and a build of none or of two is refused", () => {
    expect(pageIn(["x.txt", "samples-page_v0.0.0.html"])).toBe("samples-page_v0.0.0.html");
    expect(() => pageIn([])).toThrow("not one page");
    expect(() => pageIn(["samples-page_v1.html", "samples-page_v2.html"])).toThrow("not one page");
  });

  test("a stroke lies in the part of the element the window shows", () => {
    expect(strokeIn({ x: 10, y: 100, width: 500, height: 400, view: 1000 })).toEqual([
      [110, 220],
      [210, 300],
    ]);
    // Cut by the window's bottom, and by its top when the element is scrolled up.
    expect(strokeIn({ x: 0, y: 800, width: 100, height: 900, view: 1000 })).toEqual([
      [20, 860],
      [40, 900],
    ]);
    expect(strokeIn({ x: 0, y: -500, width: 100, height: 1000, view: 1000 })?.[0]).toEqual([
      20, 150,
    ]);
    // Wholly above the window, or a strip of it too thin to draw in: no stroke.
    expect(strokeIn({ x: 0, y: -900, width: 100, height: 800, view: 1000 })).toBeUndefined();
    expect(strokeIn({ x: 0, y: 980, width: 100, height: 800, view: 1000 })).toBeUndefined();
  });

  test("a request is any address but the page's own blobs, data and file", () => {
    expect(
      outside(
        [
          "blob:x",
          "data:,a",
          "content://1",
          "https://a.invalid/",
          "http://localhost:8080/favicon.ico",
          "http://localhost:8080/apple-touch-icon-precomposed.png",
          "https://tracker.example/favicon.ico",
        ],
        ["content://1"],
      ),
    ).toEqual(["https://a.invalid/", "https://tracker.example/favicon.ico"]);
    expect(noNetwork(QUIET.policy)).toBe(true);
    expect(noNetwork("default-src 'none'")).toBe(false);
    expect(noNetwork("")).toBe(false);
  });

  test("the server's log names the requests beyond the page's download, the browser's icon apart", () => {
    const log = [
      "serving build/page on port 8080 as pages",
      "GET /samples-page_v0.0.0.html 200",
      "GET /favicon.ico 404",
      "GET /apple-touch-icon-precomposed.png 404",
      "GET /leak 404",
      "",
    ];
    expect(asked(log, "samples-page_v0.0.0.html")).toEqual({
      others: ["GET /leak 404"],
      icons: ["GET /favicon.ico 404", "GET /apple-touch-icon-precomposed.png 404"],
    });
    const folder = mkdtempSync(join(tmpdir(), "canvas-served-"));
    try {
      writeFileSync(join(folder, "server.txt"), log.join("\n"));
      expect(served(folder, "samples-page_v0.0.0.html")).toEqual({
        step: "the server was asked for nothing but the page",
        ok: false,
        note: "1 other request(s); the browser's icon",
      });
    } finally {
      rmSync(folder, { recursive: true, force: true });
    }
  });

  test("the watch goes in before the page's script, and its hash beside the script's", () => {
    const page =
      "<meta content=\"script-src 'sha256-A'; style-src 'sha256-B'\"><script>own()</script>";
    const copy = watched(page);
    expect(copy.indexOf(WATCH)).toBeLessThan(copy.indexOf("own()"));
    expect(copy).toContain(`script-src ${hash(WATCH)} 'sha256-A';`);
    expect(() => watched("<script>a</script><script>b</script>")).toThrow("not one script");
    expect(() => watched("<p>no script</p>")).toThrow("not one script");
    // A build without its policy still takes the watch, for the run to see what goes out.
    expect(watched("<script>own()</script>")).toBe(
      `<script>${WATCH}</script><script>own()</script>`,
    );
  });

  test("a quiet page passes each check, and a violation, an error or a request fails its own", () => {
    expect(verdicts(QUIET, []).every(({ ok }) => ok)).toBe(true);
    const loud = verdicts(
      {
        ...QUIET,
        violations: [
          { directive: "connect-src", blocked: "https://a.invalid/" },
          { directive: "img-src\n", blocked: "data:x" },
        ],
        errors: ["TypeError: x"],
      },
      ["https://a.invalid/"],
    );
    expect(loud.map(({ ok }) => ok)).toEqual([true, true, false, false, false]);
    expect(loud[2]?.note).toBe("2: connect-src, img-src");
    expect(verdicts({ ...QUIET, policy: "" }, [])[1]).toMatchObject({ ok: false });
    expect(verdicts({ ...QUIET, watched: false }, [])[0]).toMatchObject({ ok: false });
  });

  test("the browser's own icon, which the policy stops, is no violation of the page's", () => {
    const icon = { directive: "img-src", blocked: "http://localhost:8080/favicon.ico" };
    expect(verdicts({ ...QUIET, violations: [icon] }, [])[2]).toEqual({
      step: "the policy saw no violation",
      ok: true,
      note: "the browser's icon stopped",
    });
    // The same path anywhere but the runner's own server is the page's own request.
    const elsewhere = { directive: "img-src", blocked: "https://tracker.example/favicon.ico" };
    expect(verdicts({ ...QUIET, violations: [elsewhere] }, [])[2]).toMatchObject({ ok: false });
  });
});

describe("in the page's build", () => {
  let folder: string;
  let file: string;
  let browser: Browser;

  beforeAll(async () => {
    folder = mkdtempSync(join(tmpdir(), "canvas-watch-"));
    file = (await buildPage(folder, "0.0.0")).path;
    browser = await chromium.launch();
  }, 120_000);

  afterAll(async () => {
    await browser?.close();
    rmSync(folder, { recursive: true, force: true });
  });

  /** The page of a file, with the watch put in before its own script, as on Android. */
  async function opened(path: string): Promise<Page> {
    const page = await browser.newPage();
    await page.addInitScript(WATCH);
    await page.goto(pathToFileURL(path).href);
    await page.waitForFunction(() => customElements.get("novatrail-canvas") !== undefined);
    return page;
  }

  const read = async (page: Page) => JSON.parse(String(await page.evaluate(READ))) as Seen;

  /** Wait until an expression is true in the page, asked as the drivers ask it: the page's policy
   * keeps waitForFunction's own way, an eval in the page, out. */
  async function until(page: Page, expression: string): Promise<void> {
    for (let i = 0; i < 50; i++) {
      if (await page.evaluate(expression)) return;
      await page.waitForTimeout(100);
    }
    throw new Error(`never true: ${expression}`);
  }

  test("sees the tasks, a stroke, each saved file's text and the workbook's page, and nothing else", async () => {
    const page = await opened(file);
    try {
      expect(await read(page)).toMatchObject({ watched: true, defined: true, tasks: TASKS });
      // The spy on Blob keeps a blob the browser makes a Blob to the page, as the element asks.
      expect(
        await page.evaluate("(async () => (await new Response('a').blob()) instanceof Blob)()"),
      ).toBe(true);
      const draw = async () => {
        // As the drivers do: the element in the window first, for the save scrolled the page.
        await page.evaluate(
          'document.querySelector("novatrail-canvas").scrollIntoView({ block: "start" })',
        );
        const box = JSON.parse(String(await page.evaluate(boxOf("novatrail-canvas"))));
        const stroke = strokeIn(box);
        if (!stroke) throw new Error("the element is not in the window");
        const [[x1, y1], [x2, y2]] = stroke;
        await page.mouse.move(x1, y1);
        await page.mouse.down();
        await page.mouse.move(x2, y2, { steps: 8 });
        await page.mouse.up();
      };
      // The markup the drivers make, through the page's form: then the page saves (T81).
      const markUp = async () => {
        await page.evaluate(MARKUP);
        await until(page, MARKING);
        expect(await page.evaluate(MARK)).toBe(true);
      };
      await draw();
      expect((await read(page)).strokes).toBeGreaterThan(0);
      await markUp();
      await page.click("#save");
      await until(page, blobAt(0));
      expect(JSON.parse(String(await page.evaluate(blobAt(0)))).purpose).toBe(
        "PURPOSE_MEASUREMENT",
      );
      // A stroke not saved: the page asks before the workbook's page, and a yes shows it.
      await draw();
      page.once("dialog", (dialog) => dialog.accept());
      await page.evaluate(TO_WORKBOOK);
      await until(page, `document.getElementById("task").value === "${WORKBOOK}"`);
      await draw();
      await markUp();
      await page.click("#save");
      await until(page, blobAt(1));
      const seen = await read(page);
      expect(seen.blobs).toBe(2);
      expect(verdicts(seen, outside(seen.resources)).filter(({ ok }) => !ok)).toEqual([]);
    } finally {
      await page.close();
    }
  }, 60_000);

  test("written into a copy of the page, sees a request its own script makes first thing", async () => {
    // The page's own script asks for the network first thing: the failure T78 must catch. Its
    // policy is worked out again, as the builder does, so that the script still runs.
    const built = readFileSync(file, "utf8");
    const start = built.indexOf("<script>") + "<script>".length;
    const script = built.slice(start, built.lastIndexOf("</script>"));
    const leaking = `fetch("https://probe.invalid/leak").catch(() => {});${script}`;
    const broken = built
      .replace(policy(styleOf(built), script), () => policy(styleOf(built), leaking))
      .replace(script, () => leaking);
    // Opened as Safari opens it: the copy with the watch, and no script put in by the driver.
    const path = join(folder, "watched.html");
    writeFileSync(path, watched(broken));
    const page = await browser.newPage();
    try {
      await page.goto(pathToFileURL(path).href);
      await until(page, `${READ}.includes("connect-src")`);
      const seen = await read(page);
      expect(seen).toMatchObject({ watched: true, defined: true, errors: [] });
      expect(seen.violations).toContainEqual({
        directive: "connect-src",
        blocked: "https://probe.invalid/leak",
      });
      expect(verdicts(seen, outside(seen.resources))[2]).toMatchObject({ ok: false });
    } finally {
      await page.close();
    }
  }, 60_000);
});
