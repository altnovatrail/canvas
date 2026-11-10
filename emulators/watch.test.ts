// The watch the drivers of the samples page put into it (T78 in RUN.md; R54 in
// docs/decisions.md): its pure parts, and the watch itself in the page's build opened by file:// in
// Chrome Headless Shell from the toolchain stage (R13), as the drivers use it in the emulators — a
// stroke, a save, the workbook's page, and a page that asks for the network, which it must see;
// and the scripts of T22's moves (R65): a stroke cancelled, the eraser and undo, two fingers, the
// page opened anew with a file opened in it, and the test build's child's session.

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
  type Box,
  blobAt,
  boxOf,
  buttonBox,
  CHILD_CODE,
  CHILD_FLAG,
  CHILD_START,
  chooseFile,
  clickButton,
  ERASER,
  fingersIn,
  MARK,
  MARKING,
  MARKUP,
  noNetwork,
  OPEN_SHOWN,
  outside,
  PAINT,
  PAINTED,
  PEN,
  pageIn,
  pointersBy,
  READ,
  REOPEN,
  type Seen,
  SHEET,
  SHOW_HIDDEN,
  type SheetNow,
  START,
  served,
  strokeBy,
  strokeIn,
  TASKS,
  TEST_START,
  TO_WORKBOOK,
  UNDO,
  VIEWED,
  verdicts,
  WATCH,
  WORKBOOK,
  watched,
} from "./watch.ts";

const QUIET: Seen = {
  watched: true,
  defined: true,
  tasks: TASKS,
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
    // The sheet's second stroke, to the right of the first and apart from it (T22).
    expect(strokeIn({ x: 10, y: 100, width: 500, height: 400, view: 1000 }, true)).toEqual([
      [310, 220],
      [410, 300],
    ]);
  });

  test("two fingers stand side by side in the part the window shows, and move up together (T22)", () => {
    expect(fingersIn({ x: 0, y: 0, width: 1000, height: 2000, view: 800 })).toEqual([
      [
        [400, 600],
        [400, 320],
      ],
      [
        [600, 600],
        [600, 320],
      ],
    ]);
    expect(fingersIn({ x: 0, y: 700, width: 1000, height: 2000, view: 800 })).toBeUndefined();
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
  /** The test build, with the legal texts' part for tests alone (T84, T89; R59, R69). */
  let tested: string;
  let browser: Browser;

  beforeAll(async () => {
    folder = mkdtempSync(join(tmpdir(), "canvas-watch-"));
    file = (await buildPage(folder, "0.0.0")).path;
    tested = (await buildPage(join(folder, "test"), "0.0.0", "page/sets/test")).path;
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
      // The start, as the drivers go through it (T20): then the sheet is there.
      expect(await page.evaluate(START)).toBe(true);
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
      expect((await read(page)).strokes).toBe(1);
      // The iPad's way: a stroke of the page's own touch events, which the element takes too.
      const sheet = strokeIn(JSON.parse(String(await page.evaluate(boxOf("novatrail-canvas")))));
      if (!sheet) throw new Error("the element is not in the window");
      expect(await page.evaluate(strokeBy(sheet[0], sheet[1], "touch"))).toBe(2);
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
      // A frame rendered after the picker changed: the driver waits for one before the stroke.
      expect(await page.evaluate(PAINT)).toBe(0);
      await until(page, PAINTED);
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

  test("goes T22's moves on the sheet, the page opened anew and the file opened in it (R65)", async () => {
    const page = await opened(file);
    try {
      expect(await page.evaluate(START)).toBe(true);
      const sheet = async () => JSON.parse(String(await page.evaluate(SHEET))) as SheetNow;
      const box = async (): Promise<Box> => {
        await page.evaluate(
          'document.querySelector("novatrail-canvas").scrollIntoView({ block: "start" })',
        );
        return JSON.parse(String(await page.evaluate(boxOf("novatrail-canvas"))));
      };
      const stroke = async (second = false, end: "pointerup" | "pointercancel" = "pointerup") => {
        const at = strokeIn(await box(), second);
        if (!at) throw new Error("the element is not in the window");
        return page.evaluate(strokeBy(at[0], at[1], "touch", end));
      };
      expect(await stroke()).toBe(1);
      // A stroke the browser cancels leaves nothing.
      expect(await stroke(true, "pointercancel")).toBe(1);
      // The row's eraser takes the stroke off, and undo puts it back.
      expect(JSON.parse(String(await page.evaluate(buttonBox(ERASER))))).toMatchObject({
        width: expect.any(Number),
      });
      expect(await page.evaluate(clickButton(ERASER))).toBe(true);
      expect((await sheet()).tool).toBe("eraser");
      await stroke();
      expect((await sheet()).last).toBe("erase");
      expect(await page.evaluate(clickButton(UNDO))).toBe(true);
      expect((await sheet()).last).toBe("undo");
      // A second stroke, erased: the file keeps it apart.
      expect(await page.evaluate(clickButton(PEN))).toBe(true);
      await stroke(true);
      await page.evaluate(clickButton(ERASER));
      await stroke(true);
      expect(await sheet()).toMatchObject({ events: 5, last: "erase", tool: "eraser" });
      await page.evaluate(clickButton(PEN));
      // Two fingers scroll the page, and write nothing.
      const before = await sheet();
      const fingers = fingersIn(JSON.parse(String(await page.evaluate(boxOf("novatrail-canvas")))));
      if (!fingers) throw new Error("the element is not in the window");
      await page.evaluate(pointersBy(fingers, "touch"));
      const after = await sheet();
      expect(after.events).toBe(before.events);
      expect(after.scrolled).toBeGreaterThan(before.scrolled);
      expect(await page.evaluate(clickButton("Нет такой"))).toBe(false);
      // The sheet saved, then the page opened anew and its file opened in it (T87).
      await page.evaluate(MARKUP);
      await until(page, MARKING);
      expect(await page.evaluate(MARK)).toBe(true);
      await page.click("#save");
      await until(page, blobAt(0));
      const text = String(await page.evaluate(blobAt(0)));
      await page.evaluate(REOPEN);
      await page.waitForEvent("load");
      await until(page, OPEN_SHOWN);
      expect(await page.evaluate(chooseFile(text))).toBe(1);
      await until(page, `${VIEWED}.includes('"shown":true')`);
      await until(
        page,
        `(() => { const v = JSON.parse(${VIEWED}); return v.decoded === v.crops; })()`,
      );
      expect(JSON.parse(String(await page.evaluate(VIEWED)))).toEqual({
        shown: true,
        lines: 1,
        hidden: 1,
        toggle: true,
        crops: 4,
        decoded: 4,
      });
      expect(await page.evaluate(SHOW_HIDDEN)).toBe(true);
      const seen = await read(page);
      expect(verdicts(seen, outside(seen.resources)).filter(({ ok }) => !ok)).toEqual([]);
    } finally {
      await page.close();
    }
  }, 60_000);

  test("in the test build: the eval set closed, and a child's session begun with the form's code (T22)", async () => {
    const page = await opened(tested);
    try {
      expect(JSON.parse(String(await page.evaluate(TEST_START)))).toEqual({
        evalSetClosed: true,
        measurementOpen: true,
        childOpen: true,
      });
      expect(JSON.parse(String(await page.evaluate(CHILD_START)))).toEqual({
        newShown: true,
        newBlocks: true,
        begun: true,
        childWrites: true,
        ipadNote: true,
        writerAsked: false,
      });
      // As the drivers do: a frame of the element first, then the stroke in the window.
      await page.evaluate(PAINT);
      await until(page, PAINTED);
      await page.evaluate(
        'document.querySelector("novatrail-canvas").scrollIntoView({ block: "start" })',
      );
      const at = strokeIn(JSON.parse(String(await page.evaluate(boxOf("novatrail-canvas")))));
      if (!at) throw new Error("the element is not in the window");
      expect(await page.evaluate(strokeBy(at[0], at[1], "touch"))).toBe(1);
      await page.evaluate(MARKUP);
      await until(page, MARKING);
      expect(await page.evaluate(CHILD_FLAG)).toBe(true);
      expect(await page.evaluate(MARK)).toBe(true);
      await page.click("#save");
      await until(page, blobAt(0));
      const sample = JSON.parse(String(await page.evaluate(blobAt(0))));
      expect(sample).toMatchObject({
        writer: "WRITER_CHILD",
        writer_code: CHILD_CODE,
        text_set_version: "test-child-sample-1",
      });
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
