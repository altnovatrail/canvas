// The server of files for the emulators (T74, T78 in RUN.md; R54 in docs/decisions.md): the
// headers of a release asset of GitHub or of a page, nothing but the files directly in its folder,
// and a line of its log for each request.

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, expect, test } from "vitest";
import { headers, logLine, server } from "./serve.ts";

let folder: string;
const lines: string[] = [];
const running: { base: string; server: ReturnType<typeof server> }[] = [];

async function start(inline: boolean): Promise<string> {
  const own = server(folder, { inline, log: (line) => lines.push(line) });
  await new Promise<void>((done) => own.listen(0, "127.0.0.1", done));
  const base = `http://127.0.0.1:${(own.address() as AddressInfo).port}`;
  running.push({ base, server: own });
  return base;
}

beforeAll(() => {
  folder = mkdtempSync(join(tmpdir(), "canvas-serve-"));
  writeFileSync(join(folder, "a.html"), "<p>a</p>");
  mkdirSync(join(folder, "inner"));
  writeFileSync(join(folder, "inner", "b.html"), "<p>b</p>");
});

afterAll(async () => {
  for (const { server: own } of running) await new Promise((done) => own.close(done));
  rmSync(folder, { recursive: true, force: true });
});

test("a file goes out as an attachment of octet-stream, as from a release of GitHub", async () => {
  const response = await fetch(`${await start(false)}/a.html`);
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe("application/octet-stream");
  expect(response.headers.get("content-disposition")).toBe("attachment; filename=a.html");
  expect(await response.text()).toBe("<p>a</p>");
  expect(headers("x.html", 3)).toMatchObject({ "Content-Length": "3" });
});

test("inline, a file goes out as a page, as a hosting would serve it", async () => {
  const response = await fetch(`${await start(true)}/a.html`);
  expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
  expect(response.headers.get("content-disposition")).toBeNull();
  expect(await response.text()).toBe("<p>a</p>");
});

test("nothing else is served: no listing, no subfolder, no path out of the folder, no other method", async () => {
  const base = await start(false);
  for (const path of [
    "/",
    "/inner",
    "/inner/b.html",
    "/..%2Fa.html",
    "/missing.html",
    "/%E0%A4%A",
  ]) {
    expect((await fetch(`${base}${path}`)).status, path).toBe(404);
  }
  expect((await fetch(`${base}/a.html`, { method: "POST" })).status).toBe(404);
});

test("each request is a line of the log, its query cut and no break or byte of its own kept", async () => {
  lines.length = 0;
  await fetch(`${await start(false)}/a.html?x=1`);
  expect(lines).toEqual(["GET /a.html 200"]);
  expect(logLine("GET", "/a\nbé?q", 404)).toBe("GET /a?b? 404");
  expect(logLine(undefined, undefined, 404)).toBe("? / 404");
});
