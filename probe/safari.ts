// The probe of a page opened from a file in Safari on macOS (T80 in RUN.md; R54 in
// docs/decisions.md), on a runner of macOS. It runs once safaridriver, which the system brings and
// the workflow enables, listens and emulators/serve.ts hands the probe's files out:
//
//   node probe/safari.ts
//
// Safari, driven by safaridriver, downloads each file of the probe into the Downloads folder, the
// way a volunteer gets it. A page of file:// is no page safaridriver opens — it stays blank — so the
// file is then opened the way Finder opens it, by `open -a Safari`, and a screenshot of the screen
// shows what Safari makes of it; the same file opens once more from a folder of its own. The
// page cannot be read or pressed: AppleScript, the one way into a Safari no WebDriver drives, asks
// the runner's user for a consent nobody gives. What it found goes into build/probe-safari, which
// the workflow keeps as its artifact. safaridriver answers on port 4444 and the server on 8080 of
// the runner; it installs nothing.

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { command } from "../emulators/webdriver.ts";
import { CSP, OPEN } from "./build.ts";

/** The probe's files, by probe/build.ts's own names. */
const FILES = [CSP, OPEN] as const;

/** The names among a folder's files that a saved report of the probe has. */
export function reports(names: readonly string[]): string[] {
  return names.filter((name) => /^report-.*\.json$/.test(name)).sort((a, b) => a.localeCompare(b));
}

/** Where the run leaves what it found: the folder the workflow keeps as its artifact. */
const folder = "build/probe-safari";
/** The server's port on the runner, where the workflow starts it beside safaridriver. */
const port = "8080";
const downloads = join(homedir(), "Downloads");
const steps: { step: string; ok: boolean; note: string }[] = [];
const findings: Record<string, string> = {};
let session = "";
let shots = 0;

function record(step: string, ok: boolean, note = ""): void {
  steps.push({ step, ok, note });
  console.log(`${ok ? "ok  " : "FAIL"} ${step}${note ? ` — ${note}` : ""}`);
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
  execFileSync("/usr/sbin/screencapture", ["-x", file], { stdio: "ignore" });
}

/** Open a file as Finder opens it, and leave what Safari shows; say whether there was a file. */
async function finder(path: string, name: string): Promise<boolean> {
  if (!existsSync(path)) return false;
  execFileSync("/usr/bin/open", ["-a", "Safari", path]);
  await sleep(8000);
  shot(name);
  return true;
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

  record(
    "open the file with the policy from Downloads",
    await finder(join(downloads, FILES[0]), "csp-from-downloads"),
  );
  record(
    "open the file without the policy from Downloads",
    await finder(join(downloads, FILES[1]), "open-from-downloads"),
  );
  // The same file in a folder of the run's own, out of Downloads: whether a blank page is
  // Safari's reading of Downloads or of any file.
  const elsewhere = join(homedir(), "probe-copy");
  mkdirSync(elsewhere, { recursive: true });
  if (existsSync(join(downloads, FILES[0]))) {
    copyFileSync(join(downloads, FILES[0]), join(elsewhere, FILES[0]));
  }
  record(
    "open the file with the policy from another folder",
    await finder(join(elsewhere, FILES[0]), "csp-from-another-folder"),
  );

  const names = readdirSync(downloads).sort((a, b) => a.localeCompare(b));
  writeFileSync(join(folder, "downloads.json"), `${JSON.stringify(names, null, 1)}\n`);
  findings["saved reports in Downloads"] = reports(names).join(", ") || "none";
  const empty = readdirSync(folder).filter(
    (name) => name.endsWith(".png") && statSync(join(folder, name)).size === 0,
  );
  record("every screenshot holds a picture", shots > 0 && empty.length === 0, empty.join(", "));
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
