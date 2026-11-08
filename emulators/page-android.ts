// The samples page in an Android emulator, on a pull request that changes what goes into it (T78
// in RUN.md; R54, R55 in docs/decisions.md). emulators/android.sh runs it in CI, in the toolchain
// stage's container on the runner's network, once the emulator is up and emulators/serve.ts hands
// out build/page, which the workflow's build job wrote with scripts/page.ts:
//
//   node emulators/page-android.ts
//
// It goes the volunteer's way, as the probe did (T74): Chrome downloads the page's file and opens
// it from the download, by content://. Then DevTools puts the watch of emulators/watch.ts into the
// page and loads it again under it, with the requests it makes recorded. The driver draws a stroke
// on the sheet through the emulator's own touchscreen, saves the sample, shows the workbook's page,
// draws and saves again; the two files come off the device into build/page-android/saved, for the
// workflow's job of the saved files to read. Each step is the device's or the page's: a failure of
// the device earns the run one more pass, a failure of the page fails it. The strokes are the
// code's: no handwriting goes into a run. It needs adb (ADB) and the server's port (PORT).

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { Android, AWAY, calibrate, DevTools, find, HOST, newPage } from "./android.ts";
import { Run } from "./run.ts";
import {
  type Box,
  boxOf,
  outside,
  pageFile,
  READ,
  SAVE,
  type Seen,
  served,
  strokeIn,
  TASKS,
  TITLE,
  TO_WORKBOOK,
  verdicts,
  WATCH,
  WORKBOOK,
} from "./watch.ts";

const run = new Run("build/page-android");
const android = new Android(run);
const port = process.env.PORT ?? "8080";
const seen = new Set<string>();
/** Where Chrome saves a download, and the files of the samples page's saving in it. */
const DOWNLOADS = "/sdcard/Download";
const SAVED = /^sample-[a-z2-7]+(?: \(\d+\))?\.json$/;

/** The value of READ, or undefined while the page cannot be read. */
async function read(tools: DevTools): Promise<Seen | undefined> {
  try {
    return JSON.parse(String(await tools.evaluate(READ))) as Seen;
  } catch {
    return undefined;
  }
}

/** Wait until the page has its element, and give what it shows. */
async function ready(tools: DevTools, seconds: number): Promise<Seen | undefined> {
  for (let i = 0; i < seconds; i++) {
    const shown = await read(tools);
    if (shown?.defined && shown.tasks > 0) return shown;
    await sleep(1000);
  }
  return read(tools);
}

/** A box of the page, by a selector. */
async function box(tools: DevTools, selector: string): Promise<Box | undefined> {
  return (JSON.parse(String(await tools.evaluate(boxOf(selector)))) as Box | null) ?? undefined;
}

/** Draw a stroke on the element through the touchscreen, where the page's save button, seen in
 * the page and on the screen, says a point of the page lies; say how many strokes it holds then. */
async function draw(tools: DevTools, name: string): Promise<number> {
  await tools.evaluate('document.getElementById("save").scrollIntoView({ block: "end" })');
  await sleep(1000);
  const button = await box(tools, "#save");
  const node = find(android.screen(), SAVE);
  const sheet = await box(tools, "novatrail-canvas");
  if (!button || !node || !sheet) {
    run.log(
      `draw ${name}: the button ${button ? "seen" : "unseen"} in the page, ${node ? "seen" : "unseen"} on the screen`,
    );
    return -1;
  }
  const toScreen = calibrate(button, node);
  const [from, to] = strokeIn(sheet);
  const [x1, y1] = toScreen(...from);
  const [x2, y2] = toScreen(...to);
  android.shell(`input touchscreen swipe ${x1} ${y1} ${x2} ${y2} 600`);
  await sleep(1500);
  android.screenshot(`${name}-drawn`);
  return (await read(tools))?.strokes ?? -1;
}

/** Press the save button as a person would, and wait for the page to hand a file over. */
async function save(tools: DevTools, before: number, name: string): Promise<boolean> {
  const pressed = await android.tapWhen(SAVE, 5);
  await android.tapWhen(AWAY, 3);
  for (let i = 0; pressed && i < 10; i++) {
    if (((await read(tools))?.blobs ?? 0) > before) {
      android.screenshot(`${name}-saved`);
      return true;
    }
    await sleep(1000);
  }
  return false;
}

/** One pass of the volunteer's way, from the download to the files saved. */
async function pass(file: string): Promise<void> {
  android.view(`http://${HOST}:${port}/${file}`);
  await android.settle(60);
  android.screenshot("download");
  const how = await android.openDownload(file);
  run.record("open the page from Chrome's downloads", how !== "", how);
  await android.settle(30);
  const page = await newPage(TITLE, seen, 40);
  run.record(
    "find the page among Chrome's pages, opened by content://",
    Boolean(page?.url.startsWith("content://")),
  );
  if (!page) return;

  const tools = await DevTools.open(page);
  try {
    const requests: string[] = [];
    tools.on((method, params) => {
      if (method === "Network.requestWillBeSent") {
        requests.push(String((params.request as { url?: string } | undefined)?.url ?? ""));
      } else if (method === "Page.javascriptDialogOpening") {
        // The page asks before strokes not saved are lost; the driver says yes, as a person would.
        void tools.send("Page.handleJavaScriptDialog", { accept: true }).catch(() => {});
      }
    });
    await tools.send("Page.enable");
    await tools.send("Network.enable");
    await tools.send("Page.addScriptToEvaluateOnNewDocument", { source: WATCH });
    await tools.send("Page.reload");
    const shown = await ready(tools, 30);
    android.screenshot("opened");
    run.record(
      "the element stands and offers the build's tasks",
      Boolean(shown?.defined && shown.tasks === TASKS),
      `${shown?.tasks ?? 0} task(s)`,
      "page",
    );
    if (!shown?.defined) return;

    const strokes = await draw(tools, "sheet");
    run.record(
      "the sheet holds the stroke drawn",
      strokes > 0,
      `${strokes} in its history`,
      "page",
    );
    run.record(
      "the sheet's sample is handed to a download",
      await save(tools, 0, "sheet"),
      "",
      "page",
    );

    await tools.evaluate(TO_WORKBOOK);
    await sleep(2000);
    run.record(
      "the picker shows the workbook's page",
      (await read(tools))?.task === WORKBOOK,
      "",
      "page",
    );
    const cells = await draw(tools, "workbook");
    run.record("the workbook holds the stroke drawn", cells > 0, `${cells} in its history`, "page");
    run.record(
      "the workbook's sample is handed to a download",
      await save(tools, 1, "workbook"),
      "",
      "page",
    );

    const last = await read(tools);
    const out = outside(requests, [page.url]);
    writeFileSync(
      join(run.folder, "watch.json"),
      `${JSON.stringify({ seen: last, requests: out }, null, 2)}\n`,
    );
    if (last)
      for (const { step, ok, note } of verdicts(last, out)) run.record(step, ok, note, "page");
    else run.record("read the page at the end", false);
  } finally {
    tools.close();
  }
}

/** The requests the server answered beyond the page's own download, and the saved files pulled
 * off the device. */
function after(file: string): void {
  const { step, ok, note } = served(run.folder, file);
  run.record(step, ok, note, "page");
  const names = android
    .shell(`ls ${DOWNLOADS}`)
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => SAVED.test(name));
  const into = join(run.folder, "saved");
  mkdirSync(into, { recursive: true });
  for (const name of names) android.pull(`${DOWNLOADS}/${name}`, join(into, name));
  run.record(
    "the samples saved are in Chrome's downloads",
    names.length >= 2,
    `${names.length}`,
    "page",
  );
}

async function main(): Promise<void> {
  const file = pageFile();
  if (!(await android.prepare())) {
    run.record("Chrome is on the image", false);
    throw new Error("the image has no Chrome");
  }
  for (; run.pass <= 2; run.pass++) {
    try {
      await pass(file);
    } catch (error) {
      run.record("the pass went to its end", false, String(error).slice(0, 200));
    }
    if (run.verdict() !== "device") break;
    run.log("the device failed: Chrome stopped, and one more pass");
    android.stopChrome();
    await sleep(3000);
  }
  run.pass = Math.min(run.pass, 2);
  if (run.verdict() === "ok") after(file);
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
    .finally(() => {
      run.close("Samples page on Android");
      writeFileSync(join(run.folder, "verdict.txt"), `${run.verdict()}\n`);
    });
}
