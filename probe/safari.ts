// The probe of a page opened from a file in Safari on macOS (T80 in RUN.md; R54 in
// docs/decisions.md), on a runner of macOS. It runs once safaridriver, which the system brings and
// the workflow enables, listens and probe/serve.ts hands the probe's files out:
//
//   node probe/safari.ts
//
// Safari, driven by safaridriver, downloads each file of the probe into the Downloads folder, the
// way a volunteer gets it. A page of file:// is no page safaridriver opens — it stays blank — so the
// file is then opened the way Finder opens it, by `open -a Safari`, and a screenshot of the screen
// shows what Safari makes of it. Where Safari lets AppleScript run JavaScript in its page, the
// driver also reads the page's report and presses its buttons; where it does not, that is a
// finding, and the screenshots stand. What it found goes into build/probe-safari, which the
// workflow keeps as its artifact. It needs safaridriver's address (SAFARIDRIVER) and the server's
// port (PORT); it installs nothing.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

/** The probe's files, as probe/build.ts names them. */
const FILES = ["t29-probe-csp.html", "t29-probe-open.html"] as const;

/** The names among a folder's files that a saved report of the probe has. */
export function reports(names: readonly string[]): string[] {
  return names.filter((name) => /^report-.*\.json$/.test(name)).sort();
}

/** The AppleScript that runs a line of JavaScript in Safari's front tab and gives its value. */
export function inFrontTab(javascript: string): string {
  const text = javascript.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `tell application "Safari" to do JavaScript "${text}" in current tab of front window`;
}

/** Where the run leaves what it found: the folder the workflow keeps as its artifact. */
const folder = "build/probe-safari";
const driver = process.env.SAFARIDRIVER ?? "http://127.0.0.1:4444";
const port = process.env.PORT ?? "8080";
const downloads = join(homedir(), "Downloads");
const steps: { step: string; ok: boolean; note: string }[] = [];
const findings: Record<string, string> = {};
let session = "";
let shots = 0;

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
  const answer = (await response.json()) as { value?: unknown };
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status}`);
  return answer.value;
}

/** Safari downloads a file of the probe; say whether it came into the Downloads folder. */
async function download(file: string): Promise<boolean> {
  await command("POST", `/session/${session}/url`, { url: `http://localhost:${port}/${file}` });
  for (let i = 0; i < 20; i++) {
    if (existsSync(join(downloads, file))) return true;
    await sleep(1000);
  }
  return false;
}

/** A screenshot of the runner's screen. */
function shot(name: string): void {
  shots += 1;
  const file = join(folder, `${String(shots).padStart(2, "0")}-${name}.png`);
  execFileSync("screencapture", ["-x", file], { stdio: "ignore" });
}

/** Run a line of JavaScript in Safari's front tab by AppleScript, or undefined if Safari refuses. */
function javascript(line: string): string | undefined {
  try {
    return execFileSync("osascript", ["-e", inFrontTab(line)], {
      encoding: "utf8",
      timeout: 20_000,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined;
  }
}

/** The page's report, read by AppleScript and written to the folder, or undefined. */
async function report(name: string): Promise<Record<string, unknown> | undefined> {
  for (let i = 0; i < 10; i++) {
    const text = javascript('document.getElementById("report").textContent');
    if (text === undefined) return undefined;
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
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

/** Open a downloaded file as Finder opens it, and leave what Safari shows. */
async function finder(file: string, name: string): Promise<Record<string, unknown> | undefined> {
  execFileSync("open", ["-a", "Safari", join(downloads, file)]);
  await sleep(6000);
  shot(name);
  const seen = await report(name);
  findings[`${file} by AppleScript`] = seen ? "read" : "not read";
  return seen;
}

async function main(): Promise<void> {
  mkdirSync(folder, { recursive: true });
  const value = (await command("POST", "/session", {
    capabilities: { alwaysMatch: { browserName: "safari" } },
  })) as { sessionId: string };
  session = value.sessionId;
  for (const file of FILES) record(`Safari downloads ${file} into Downloads`, await download(file));
  await command("DELETE", `/session/${session}`);
  session = "";

  const csp = await finder(FILES[0], "csp-opened");
  if (csp) {
    javascript('document.getElementById("store").click()');
    javascript('document.getElementById("save").click()');
    await sleep(3000);
    await report("csp-stored");
  }
  await finder(FILES[1], "open-opened");
  // Safari stopped as a person quits it, by a signal: telling it by AppleScript needs a consent.
  execFileSync("killall", ["Safari"], { stdio: "ignore" });
  await sleep(3000);
  await finder(FILES[0], "csp-after-restart");

  const names = readdirSync(downloads).sort();
  writeFileSync(join(folder, "downloads.json"), `${JSON.stringify(names, null, 1)}\n`);
  findings["saved reports in Downloads"] = reports(names).join(", ") || "none";
  record("screenshots of each file opened", shots === 3);
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
      writeFileSync(join(folder, "findings.json"), `${JSON.stringify(findings, null, 2)}\n`);
    });
}
