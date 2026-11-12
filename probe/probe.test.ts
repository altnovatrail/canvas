// The probe of a page opened from a file (T29 in RUN.md; R52 in docs/decisions.md), in Chrome
// Headless Shell from the toolchain stage, through the playwright package package-lock.json pins
// (R13): both files built into a folder of their own and opened by file://, as a volunteer opens a
// page downloaded from a release. On devices the probe runs by hand (T29) and in emulators (T74);
// here it is checked before it goes out.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { type Browser, type BrowserContext, chromium, type Page } from "playwright";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { hash, policy, styleOf } from "../scripts/csp.ts";
import { budget } from "../src/core/budget.fixture.ts";
import { build, CSP, OPEN, PAGE, pages, SCRIPT } from "./build.ts";

/** What a report may hold, and nothing else: T29 names the fields. */
const FIELDS = [
  "coalescedEvents",
  "file",
  "indexedDB",
  "picture",
  "pointers",
  "probe",
  "protocol",
  "requests",
  "saves",
  "script",
  "secureContext",
  "settled",
  "storage",
  "userAgent",
  "violations",
];

interface Report {
  readonly file: string;
  readonly script: boolean;
  readonly protocol: string;
  readonly secureContext: boolean;
  readonly coalescedEvents: boolean;
  readonly pointers: Record<string, { events: number; coalesced: number }>;
  readonly requests: Record<string, string>;
  readonly violations: Record<string, number>;
  readonly settled: boolean;
  readonly picture: string;
  readonly storage: readonly string[] | "unavailable";
  readonly saves: number;
}

/** A network request of a page: how it ended, and why when it failed. */
interface Request {
  readonly url: string;
  readonly ended: string;
}

let folder: string;
let paths: { csp: string; open: string };
let browser: Browser;

beforeAll(async () => {
  folder = mkdtempSync(join(tmpdir(), "canvas-probe-"));
  paths = build(folder);
  browser = await chromium.launch();
});

afterAll(async () => {
  await browser?.close();
  rmSync(folder, { recursive: true, force: true });
});

/** The contexts a test opened, closed after it whether it passed or not. */
const contexts: BrowserContext[] = [];
afterEach(async () => {
  await Promise.all(contexts.splice(0).map((context) => context.close()));
});

async function report(page: Page): Promise<Report> {
  return JSON.parse((await page.textContent("#report")) ?? "") as Report;
}

/** Open a file of the probe in a context of its own, and wait until its requests are settled. */
async function open(path: string): Promise<{ page: Page; requests: Request[] }> {
  const context = await browser.newContext({ acceptDownloads: true });
  contexts.push(context);
  const page = await context.newPage();
  const requests: Request[] = [];
  page.on("requestfinished", (request) => requests.push({ url: request.url(), ended: "finished" }));
  page.on("requestfailed", (request) =>
    requests.push({ url: request.url(), ended: request.failure()?.errorText ?? "" }),
  );
  await page.goto(pathToFileURL(path).href);
  await page.waitForFunction(
    () => JSON.parse(document.getElementById("report")?.textContent ?? "{}").settled === true,
  );
  return { page, requests };
}

/** The requests of a page that went anywhere but to the file and its own blobs. */
function outside(requests: readonly Request[]): Request[] {
  return requests.filter(({ url }) => !url.startsWith("file:") && !url.startsWith("blob:"));
}

describe("the files", () => {
  test("are ASCII, say their encoding first, and the policy allows the style and the script by their hashes", () => {
    const page = readFileSync(PAGE, "utf8");
    const script = readFileSync(SCRIPT, "utf8");
    const csp = readFileSync(paths.csp, "utf8");
    const open = readFileSync(paths.open, "utf8");
    for (const text of [csp, open]) {
      expect(text).toMatch(/^<!doctype html>\n<meta charset="utf-8">\n/);
      expect(text).toMatch(/^[\t\n\r -~]*$/);
      expect(text).toContain(`<script>${script}</script>`);
    }
    expect(csp).toContain(
      `<meta http-equiv="Content-Security-Policy" content="${policy(styleOf(page), script)}">`,
    );
    expect(csp).toContain(`script-src ${hash(script)}`);
    expect(csp).toContain(`style-src ${hash(styleOf(page))}`);
    expect(open).not.toContain("Content-Security-Policy");
  });

  test("a source that is not ASCII, or has no place for the policy or the script, stops the build", () => {
    const page = readFileSync(PAGE, "utf8");
    expect(() => pages(page, `const a = '${String.fromCodePoint(0xe9)}';`)).toThrow(
      "probe/probe.js is not ASCII with plain line ends",
    );
    expect(() => pages(page.replaceAll("\n", "\r\n"), "")).toThrow(
      "probe/page.html is not ASCII with plain line ends",
    );
    expect(() => pages(page, 'const a = "</SCRIPT>";')).toThrow("holds </script or <!--");
    expect(() => pages(page, "const a = '<!--';")).toThrow("holds </script or <!--");
    expect(() => pages(page.replace("<!-- policy -->", ""), "")).toThrow("has no place");
    expect(() => pages('<!-- policy --><script src="probe.js"></script>', "")).toThrow(
      "has no <style> element",
    );
  });

  test("the policy names no source but the page's own style and script, and blobs for pictures", () => {
    expect(policy("a", "b")).toBe(
      `default-src 'none'; script-src ${hash("b")}; style-src ${hash("a")}; img-src blob:; ` +
        "connect-src 'none'; base-uri 'none'; form-action 'none'",
    );
  });
});

describe("opened from a file", () => {
  test("with the policy, the script runs in a secure context and every request is blocked by the policy", {
    timeout: budget(490),
  }, async () => {
    const { page, requests } = await open(paths.csp);
    const seen = await report(page);
    expect(seen).toMatchObject({
      file: CSP,
      script: true,
      protocol: "file:",
      secureContext: true,
      coalescedEvents: true,
      picture: "loaded",
      requests: {
        fetchLoopback: "blocked",
        fetchInvalid: "blocked",
        imageLoopback: "blocked",
        imageInvalid: "blocked",
      },
      violations: { "connect-src": 2, "img-src": 2 },
    });
    // The browser names its two pictures to the page's events before the policy stops them; both
    // end by the policy, and the fetches never get that far.
    expect(outside(requests).map(({ ended }) => ended)).toEqual(["csp", "csp"]);
  });

  test("without the policy, the same requests fail on the network, and no event of the policy comes", {
    timeout: budget(489),
  }, async () => {
    const { page, requests } = await open(paths.open);
    const seen = await report(page);
    expect(seen).toMatchObject({
      file: OPEN,
      script: true,
      picture: "loaded",
      requests: {
        fetchLoopback: "failed",
        fetchInvalid: "failed",
        imageLoopback: "failed",
        imageInvalid: "failed",
      },
      violations: {},
    });
    expect(
      outside(requests)
        .map(({ ended }) => ended)
        .sort(),
    ).toEqual([
      "net::ERR_CONNECTION_REFUSED",
      "net::ERR_CONNECTION_REFUSED",
      "net::ERR_NAME_NOT_RESOLVED",
      "net::ERR_NAME_NOT_RESOLVED",
    ]);
  });

  test("the storage keeps what a file wrote for the file opened again, and the pointer is counted by type", {
    timeout: budget(681),
  }, async () => {
    const { page } = await open(paths.csp);
    expect((await report(page)).storage).toEqual([]);
    await page.click("#store");
    expect((await report(page)).storage).toEqual([CSP]);
    const pad = await page.locator("#pad").boundingBox();
    if (!pad) throw new Error("the pad is not shown");
    await page.mouse.move(pad.x + 20, pad.y + 20);
    await page.mouse.down();
    await page.mouse.move(pad.x + 80, pad.y + 60, { steps: 5 });
    await page.mouse.up();
    // The report is written once a frame while a pointer moves.
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(done)));
    const drawn = await report(page);
    expect(drawn.pointers.mouse?.events).toBeGreaterThanOrEqual(7);
    expect(drawn.pointers.mouse?.coalesced).toBeGreaterThanOrEqual(5);
    // The file opened again in a page of its own, as a volunteer comes back to it, not reloaded: on a
    // loaded machine the first document after a reload of a file in Chrome Headless Shell may read
    // the storage empty, and keep reading it so, while another page of the file reads the write
    // (R75). The page that wrote is closed first, so that nothing of it keeps the write alive. The
    // probe itself reloads on the devices (T29, T74).
    const context = page.context();
    await page.close();
    const again = await context.newPage();
    await again.goto(pathToFileURL(paths.csp).href);
    await again.waitForFunction(() => document.getElementById("report")?.textContent !== "");
    expect((await report(again)).storage).toEqual([CSP]);
  });

  test("the file's name keeps no folder, even one an Android address encodes, and a bad escape stops nothing", {
    timeout: budget(349),
  }, async () => {
    const { page } = await open(paths.csp);
    // fileName is a function of the page's classic script, so the page's global object has it.
    const names = await page.evaluate(() =>
      [
        "/workspaces/probe/t29-probe-csp.html",
        "/document/raw%3A%2Fstorage%2Femulated%2F0%2FDownload%2Ft29-probe-csp.html",
        "/document/msf%3A1234",
        "/folder/bad%E0%A4%A.html",
      ].map((path) => (globalThis as unknown as { fileName(path: string): string }).fileName(path)),
    );
    expect(names).toEqual(["t29-probe-csp.html", "t29-probe-csp.html", "1234", "bad%E0%A4%A.html"]);
  });

  test("the report saves as a file through a link to a blob, and holds only the fields it may", {
    timeout: budget(458),
  }, async () => {
    const { page } = await open(paths.csp);
    const [download] = await Promise.all([page.waitForEvent("download"), page.click("#save")]);
    expect(download.suggestedFilename()).toBe("report-t29-probe-csp.json");
    const saved = JSON.parse(readFileSync(await download.path(), "utf8")) as Report;
    expect(Object.keys(saved).sort()).toEqual(FIELDS);
    expect(saved).toMatchObject({ file: CSP, saves: 1, settled: true });
    expect(JSON.stringify(saved)).not.toContain(folder);
  });
});
