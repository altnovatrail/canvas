// The probe of a page opened from a file in Safari on macOS (T80 in RUN.md; R54 in
// docs/decisions.md), on a runner of macOS, through safaridriver, which the system brings and the
// workflow enables. It runs once safaridriver listens and probe/serve.ts hands the probe's files
// out:
//
//   node probe/safari.ts
//
// Safari downloads each file of the probe into the Downloads folder, and the file is opened from
// there by its file:// address, as Finder opens it. The driver reads the page's report by a
// script of WebDriver, clicks the page's buttons, moves the mouse over the pad, and opens the first
// file again in a new session. What it found goes into build/probe-safari, which the workflow keeps
// as its artifact; a step that fails fails the run. It needs safaridriver's address (SAFARIDRIVER)
// and the server's port (PORT); it installs nothing.

import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { pathToFileURL } from "node:url";

/** The probe's files, as probe/build.ts names them. */
const FILES = ["t29-probe-csp.html", "t29-probe-open.html"] as const;

/** The file:// address of a downloaded file, as Finder opens it. */
export function fileAddress(folder: string, name: string): string {
  return pathToFileURL(join(folder, name)).href;
}

/** The names among a folder's files that a saved report of the probe has. */
export function reports(names: readonly string[]): string[] {
  return names.filter((name) => /^report-.*\.json$/.test(name)).sort();
}

/** Where the run leaves what it found: the folder the workflow keeps as its artifact. */
const folder = "build/probe-safari";
const driver = process.env.SAFARIDRIVER ?? "http://127.0.0.1:4444";
const port = process.env.PORT ?? "8080";
const downloads = join(homedir(), "Downloads");
const steps: { step: string; ok: boolean; note: string }[] = [];
let session = "";

function record(step: string, ok: boolean, note = ""): void {
  steps.push({ step, ok, note });
  console.log(`${ok ? "ok  " : "FAIL"} ${step}${note ? ` — ${note}` : ""}`);
}

/** One command of W3C WebDriver, its `value` back. */
async function command(method: string, path: string, body?: unknown): Promise<unknown> {
  const response = await fetch(`${driver}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });
  const answer = (await response.json()) as { value?: { error?: unknown } };
  if (!response.ok) {
    // WebDriver's name of the error, one of the standard's few words, not the message.
    const name = typeof answer.value?.error === "string" ? answer.value.error : "";
    throw new Error(`${method} ${path}: ${response.status} ${/^[a-z ]+$/.test(name) ? name : ""}`);
  }
  return answer.value;
}

async function start(): Promise<void> {
  const value = (await command("POST", "/session", {
    capabilities: { alwaysMatch: { browserName: "safari" } },
  })) as { sessionId: string };
  session = value.sessionId;
}

async function stop(): Promise<void> {
  if (session) await command("DELETE", `/session/${session}`);
  session = "";
}

let shots = 0;

/** Go to an address, and leave a screenshot of what Safari shows and the scheme it shows it by. */
async function go(url: string, name: string): Promise<void> {
  try {
    await command("POST", `/session/${session}/url`, { url });
  } catch (error) {
    record(`go to ${name}`, false, String(error));
  }
  await sleep(3000);
  shots += 1;
  const png = (await command("GET", `/session/${session}/screenshot`)) as string;
  writeFileSync(
    join(folder, `${String(shots).padStart(2, "0")}-${name}.png`),
    Buffer.from(png, "base64"),
  );
  const at = String(await command("GET", `/session/${session}/url`));
  console.log(
    `${name}: Safari shows ${at.startsWith("file:") ? "a file:// page" : at.startsWith("http:") ? "an http:// page" : "another page"}`,
  );
}

async function run(script: string): Promise<unknown> {
  return command("POST", `/session/${session}/execute/sync`, { script, args: [] });
}

async function click(id: string): Promise<boolean> {
  try {
    const element = (await command("POST", `/session/${session}/element`, {
      using: "css selector",
      value: `#${id}`,
    })) as Record<string, string>;
    await command("POST", `/session/${session}/element/${Object.values(element)[0]}/click`, {});
    await sleep(1000);
    return true;
  } catch {
    return false;
  }
}

/** The page's report once its requests are settled, written to the folder, or undefined. */
async function report(name: string): Promise<Record<string, unknown> | undefined> {
  for (let i = 0; i < 20; i++) {
    try {
      const text = await run('return document.getElementById("report").textContent');
      const parsed = JSON.parse(String(text)) as Record<string, unknown>;
      if (parsed.settled === true) {
        writeFileSync(join(folder, `report-${name}.json`), `${JSON.stringify(parsed, null, 2)}\n`);
        return parsed;
      }
    } catch {
      // Not yet a report.
    }
    await sleep(1000);
  }
  return undefined;
}

/** Safari downloads a file of the probe; say whether it came into the Downloads folder. */
async function download(file: string): Promise<boolean> {
  await go(`http://localhost:${port}/${file}`, `download-${file}`);
  for (let i = 0; i < 20; i++) {
    if (existsSync(join(downloads, file))) return true;
    await sleep(1000);
  }
  return false;
}

/** Move the mouse across the pad, by WebDriver's actions. */
async function move(): Promise<void> {
  const pad = (await command("POST", `/session/${session}/element`, {
    using: "css selector",
    value: "#pad",
  })) as Record<string, string>;
  const origin = {
    [Object.keys(pad)[0] ?? "element-6066-11e4-a52e-4f735466cecf"]: Object.values(pad)[0],
  };
  await command("POST", `/session/${session}/actions`, {
    actions: [
      {
        type: "pointer",
        id: "mouse",
        parameters: { pointerType: "mouse" },
        actions: [
          { type: "pointerMove", duration: 0, origin, x: -100, y: -40 },
          { type: "pointerDown", button: 0 },
          { type: "pointerMove", duration: 600, origin, x: 100, y: 40 },
          { type: "pointerUp", button: 0 },
        ],
      },
    ],
  });
}

async function main(): Promise<void> {
  mkdirSync(folder, { recursive: true });
  await start();
  for (const file of FILES) record(`Safari downloads ${file} into Downloads`, await download(file));

  await go(fileAddress(downloads, FILES[0]), "csp-opened");
  record("read the report of the file with the policy", Boolean(await report("csp-opened")));
  record("click Write storage", await click("store"));
  try {
    await move();
  } catch (error) {
    record("move the mouse over the pad", false, String(error));
  }
  const drawn = await report("csp-drawn");
  const mouse = (drawn?.pointers as Record<string, { events?: number }> | undefined)?.mouse;
  record("the page counted the mouse", (mouse?.events ?? 0) > 0);
  record("click Save report", await click("save"));
  await sleep(3000);

  await go(fileAddress(downloads, FILES[1]), "open-opened");
  record("read the report of the file without the policy", Boolean(await report("open-opened")));

  await stop();
  await start();
  await go(fileAddress(downloads, FILES[0]), "csp-new-session");
  record("read the report in a new session", Boolean(await report("csp-new-session")));
  await stop();

  const saved = reports(readdirSync(downloads));
  writeFileSync(
    join(folder, "downloads.json"),
    `${JSON.stringify(readdirSync(downloads).sort(), null, 1)}\n`,
  );
  record("the saved report is in Downloads", saved.length > 0, saved.join(", "));
  const failed = steps.filter(({ ok }) => !ok);
  if (failed.length > 0) throw new Error(`${failed.length} step(s) failed`);
}

if (import.meta.main) {
  main()
    .catch((error) => {
      console.log(`error: ${String(error)}`);
      process.exitCode = 1;
    })
    .finally(() => {
      mkdirSync(folder, { recursive: true });
      writeFileSync(join(folder, "steps.json"), `${JSON.stringify(steps, null, 2)}\n`);
    });
}
