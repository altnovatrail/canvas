// The probe of a page opened from a file in an Android emulator (T74 in RUN.md; R54 in
// docs/decisions.md). emulators/android.sh runs it in CI, in the toolchain stage's container on
// the runner's network, once the emulator is up and emulators/serve.ts hands the probe's files out:
//
//   node probe/android.ts
//
// It goes the volunteer's way in Chrome: it downloads each file of the probe, opens it from the
// download, writes the storage, draws with the touchscreen and, where the tool has it, the stylus,
// saves the report, opens the other file, and opens the first again after Chrome has stopped. The
// emulator's side — taps by uiautomator's bounds, the page read through Chrome's DevTools — is
// emulators/android.ts. Each step leaves a screenshot and, where the page could be read, its report
// in build/probe-android, which the workflow keeps as its artifact; a step that fails fails the
// run. It needs adb (ADB, or adb on the path) and the server's port (PORT, 8080 by default); it
// installs nothing and asks nothing of the network but the emulator.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import {
  Android,
  AWAY,
  DevTools,
  find,
  HOST,
  inner,
  newPage,
  type Target,
} from "../emulators/android.ts";
import { Run } from "../emulators/run.ts";
import { CSP, OPEN } from "./build.ts";

/** The probe's files, by probe/build.ts's own names. */
const FILES = [CSP, OPEN] as const;
/** The page's title, by which its DevTools target is found. */
const TITLE = "canvas file probe";

/** Where the run leaves what it found: the folder the workflow keeps as its artifact. */
const run = new Run("build/probe-android");
const android = new Android(run);
const port = process.env.PORT ?? "8080";
/** The DevTools targets of the probe already found: a later step looks for a new one. */
const seen = new Set<string>();

/** The page's report once its requests are settled, or undefined if it cannot be read. */
async function report(page: Target, name: string): Promise<Record<string, unknown> | undefined> {
  for (let i = 0; i < 20; i++) {
    let tools: DevTools | undefined;
    try {
      tools = await DevTools.open(page);
      const text = await tools.evaluate('document.getElementById("report").textContent');
      const parsed = JSON.parse(String(text)) as Record<string, unknown>;
      if (parsed.settled === true) {
        writeFileSync(
          join(run.folder, `report-${name}.json`),
          `${JSON.stringify(parsed, null, 2)}\n`,
        );
        return parsed;
      }
    } catch (error) {
      run.log(
        `report ${name}: ${error instanceof SyntaxError ? "not yet a report" : String(error)}`.slice(
          0,
          200,
        ),
      );
    } finally {
      tools?.close();
    }
    await sleep(1000);
  }
  return undefined;
}

/** Download a file of the probe in Chrome and open it from the download, as a volunteer would. */
async function download(file: string): Promise<Target | undefined> {
  android.view(`http://${HOST}:${port}/${file}`);
  await android.settle(60);
  android.screenshot(`download-${file}`);
  const how = await android.openDownload(file);
  run.record(`open ${file} from Chrome's downloads`, how !== "", how);
  await android.settle(30);
  android.screenshot(`opened-${file}`);
  const page = await newPage(TITLE, seen, 40);
  // The note names the scheme the page came by, and not its address, which DevTools gave.
  const scheme = page?.url.startsWith("content://") ? "content://" : "another scheme";
  run.record(`find ${file} among Chrome's pages`, Boolean(page), page ? `opened by ${scheme}` : "");
  return page;
}

/** How many events of a pointer's type a report counted. */
function events(seen: Record<string, unknown> | undefined, type: string): number {
  const pointers = (seen?.pointers ?? {}) as Record<string, { events?: number }>;
  return pointers[type]?.events ?? 0;
}

/** The file with the policy: its report, the storage, the pointers and the saved report. */
async function withPolicy(page: Target): Promise<void> {
  run.record(
    "read the report of the file with the policy",
    Boolean(await report(page, "csp-opened")),
  );
  run.record("tap Write storage", await android.tapWhen("Write storage", 5));
  const pad = find(android.screen(), /^Move a pen/);
  if (!pad) {
    run.record("find the pad on the screen", false);
    return;
  }
  // Within the middle of the pad: a swipe that starts near the screen's edge is Android's gesture
  // of going back, which closes the tab.
  const [left, top, right, bottom] = inner(pad);
  android.shell(`input touchscreen swipe ${left} ${top} ${right} ${bottom} 600`);
  let stylus = true;
  try {
    android.shell(`input stylus swipe ${left} ${bottom} ${right} ${top} 600`);
  } catch {
    stylus = false;
  }
  await sleep(1000);
  android.screenshot("csp-drawn");
  const drawn = await report(page, "csp-drawn");
  run.record("the page counted the touchscreen", events(drawn, "touch") > 0);
  run.record(
    "the page counted the stylus as a pen",
    !stylus || events(drawn, "pen") > 0,
    stylus ? "" : "the input tool has no stylus source",
  );
  const saved = await android.tapWhen("Save report", 5);
  await android.tapWhen(AWAY, 5);
  run.record("tap Save report", saved);
  await sleep(2000);
  android.screenshot("csp-saved");
}

async function main(): Promise<void> {
  if (!(await android.prepare())) {
    run.record("Chrome is on the image", false);
    throw new Error("the image has no Chrome");
  }

  const csp = await download(FILES[0]);
  if (csp) await withPolicy(csp);

  const open = await download(FILES[1]);
  if (open) {
    run.record(
      "read the report of the file without the policy",
      Boolean(await report(open, "open-opened")),
    );
  }

  android.stopChrome();
  await sleep(2000);
  if (csp) {
    android.view(csp.url, "text/html");
    await android.settle(60);
    android.screenshot("csp-after-restart");
    const again = await newPage(TITLE, seen, 40);
    run.record(
      "read the report after Chrome stopped",
      Boolean(again && (await report(again, "csp-after-restart"))),
    );
  }

  writeFileSync(join(run.folder, "downloads.txt"), android.shell("ls -l /sdcard/Download"));
  run.log("downloads: in downloads.txt");
  run.check();
}

if (import.meta.main) {
  main()
    .catch((error) => {
      run.log(`error: ${String(error)}`);
      try {
        android.screenshot("error");
      } catch {
        // No screen to take: the error above says why.
      }
      process.exitCode = 1;
    })
    .finally(() => run.close("Probe on Android"));
}
