// The server of the probe's files (T74 in RUN.md; R54 in docs/decisions.md): the headers of a
// release asset of GitHub, and nothing but the files directly in its folder.

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, expect, test } from "vitest";
import { headers, server } from "./serve.ts";

let folder: string;
let base: string;
let running: ReturnType<typeof server>;

beforeAll(async () => {
  folder = mkdtempSync(join(tmpdir(), "canvas-serve-"));
  writeFileSync(join(folder, "a.html"), "<p>a</p>");
  mkdirSync(join(folder, "inner"));
  writeFileSync(join(folder, "inner", "b.html"), "<p>b</p>");
  running = server(folder);
  await new Promise<void>((done) => running.listen(0, "127.0.0.1", done));
  base = `http://127.0.0.1:${(running.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise((done) => running.close(done));
  rmSync(folder, { recursive: true, force: true });
});

test("a file goes out as an attachment of octet-stream, as from a release of GitHub", async () => {
  const response = await fetch(`${base}/a.html`);
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe("application/octet-stream");
  expect(response.headers.get("content-disposition")).toBe("attachment; filename=a.html");
  expect(await response.text()).toBe("<p>a</p>");
  expect(headers("x.html", 3)).toMatchObject({ "Content-Length": "3" });
});

test("nothing else is served: no listing, no subfolder, no path out of the folder, no other method", async () => {
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
