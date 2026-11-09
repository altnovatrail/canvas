// The samples page in an Android emulator, on a pull request that changes what goes into it (T78
// in RUN.md; R54, R55 in docs/decisions.md). emulators/android.sh runs it in CI, in the toolchain
// stage's container on the runner's network, once the emulator is up and emulators/serve.ts hands
// out build/page, which the workflow's build job wrote with scripts/page.ts:
//
//   node emulators/page-android.ts
//
// It goes the volunteer's way of emulators/volunteer.ts, as the probe did (T74): Chrome downloads
// the page's file and opens it from the download, by content://. Then DevTools puts the watch of
// emulators/watch.ts into the page and loads it again under it, with the requests it makes
// recorded. A stroke is drawn through the emulator's own touchscreen, and the save button pressed
// by a tap; the files the page saved come off the device into build/page-android/saved, for the
// workflow's job of the saved files to read. The strokes are the code's: no handwriting goes into
// a run. It needs adb (ADB) and the server's port (PORT).

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import {
  Android,
  AWAY,
  calibrate,
  DevTools,
  find,
  HOST,
  type Node,
  newPage,
  pageView,
  placed,
  type Target,
} from "./android.ts";
import { Run } from "./run.ts";
import { type Device, passes, volunteer } from "./volunteer.ts";
import { until } from "./wait.ts";
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
  TITLE,
  TO_WORKBOOK,
  WATCH,
} from "./watch.ts";

const run = new Run("build/page-android");
const android = new Android(run);
const port = process.env.PORT ?? "8080";
const seen = new Set<string>();
/** Where Chrome saves a download, and the files of the page's saving in it. */
const DOWNLOADS = "/sdcard/Download";
const SAVED = /^sample-[a-z2-7]+(?: \(\d+\))?\.json$/;

/** Chrome on the emulator, with the page of a file opened from its download. */
class Chrome implements Device {
  private tools: DevTools | undefined;
  private page: Target | undefined;
  private readonly asked: string[] = [];
  private readonly file: string;

  constructor(file: string) {
    this.file = file;
  }

  async open(): Promise<boolean> {
    // The files of an earlier pass, which would be another opening's, with another writer's code.
    android.shell(`rm -f ${DOWNLOADS}/sample-*.json`);
    android.view(`http://${HOST}:${port}/${this.file}`);
    await android.settle(60);
    android.screenshot("download");
    const how = await android.openDownload(this.file);
    run.record("open the page from Chrome's downloads", how !== "", how);
    await android.settle(30);
    this.page = await newPage(TITLE, seen, 40);
    run.record(
      "find the page among Chrome's pages, opened by content://",
      Boolean(this.page?.url.startsWith("content://")),
    );
    if (!this.page) return false;
    const tools = await DevTools.open(this.page);
    this.tools = tools;
    tools.on((method, params) => {
      if (method === "Network.requestWillBeSent") {
        this.asked.push(String((params.request as { url?: string } | undefined)?.url ?? ""));
      } else if (method === "Page.javascriptDialogOpening") {
        // The page asks before strokes not saved are lost; the driver says yes, as a person would.
        void tools.send("Page.handleJavaScriptDialog", { accept: true }).catch(() => {});
      }
    });
    await tools.send("Page.enable");
    await tools.send("Network.enable");
    await tools.send("Page.addScriptToEvaluateOnNewDocument", { source: WATCH });
    await tools.send("Page.reload");
    return true;
  }

  async read(): Promise<Seen | undefined> {
    try {
      return JSON.parse(String(await this.evaluate(READ))) as Seen;
    } catch {
      return undefined;
    }
  }

  async evaluate(expression: string): Promise<unknown> {
    if (!this.tools) throw new Error("no page");
    return this.tools.evaluate(expression);
  }

  private async box(selector: string): Promise<Box | undefined> {
    return (JSON.parse(String(await this.evaluate(boxOf(selector)))) as Box | null) ?? undefined;
  }

  /** Where the page's CSS pixels lie on the screen, and how that was found: from the page's own
   * view, a node of Chrome whose bounds hold while the tree of the page inside it lags behind a
   * scroll (T20); or, without it, from the save button seen both in the page and on the screen,
   * scrolled to on each look, which brings that tree up to date (T83). Chrome's own offers, such
   * as one to translate the page, may stand over the page a while: then it is the device's
   * failure, not the page's, and the dump is kept. */
  private async placing(
    name: string,
  ): Promise<{ toScreen: (x: number, y: number) => [number, number]; how: string } | undefined> {
    let shown: Node[] = [];
    const ratio = Number(await this.evaluate("devicePixelRatio"));
    const view = await until(10, () => {
      shown = android.screen();
      // An offer of Chrome's over the page is put away first, as a person would: the view under it
      // is there, but a tap there would land on the offer.
      const away = find(shown, AWAY);
      if (away) {
        android.tap(away);
        return undefined;
      }
      return pageView(shown);
    });
    if (view && ratio > 0) return { toScreen: placed(view, ratio), how: "by the page's view" };
    const node = await until(15, async () => {
      // A pixel up first, so that the page does scroll even when the button is in view already.
      await this.evaluate(
        '(window.scrollBy(0, -1), document.getElementById("save").scrollIntoView({ block: "end" }))',
      );
      await sleep(500);
      shown = android.screen();
      return find(shown, SAVE);
    });
    const button = await this.box("#save");
    if (node && button) return { toScreen: calibrate(button, node), how: "by the save button" };
    // What stood on the screen instead: an offer of Chrome's, or a window the dump read alone.
    run.log(`screen ${Android.words(shown).slice(0, 600)}`);
    android.keepDump(`${name}-not-placed`);
    return undefined;
  }

  /** A stroke through the touchscreen, on the element brought into the window. */
  async draw(name: string): Promise<string | undefined> {
    await this.evaluate(
      'document.querySelector("novatrail-canvas").scrollIntoView({ block: "start" })',
    );
    await sleep(500);
    const placing = await this.placing(name);
    const sheet = await this.box("novatrail-canvas");
    const stroke = sheet && strokeIn(sheet);
    run.record(`find the ${name} on the screen`, Boolean(placing && stroke), placing?.how ?? "");
    if (!placing || !stroke) {
      android.screenshot(`${name}-not-found`);
      return undefined;
    }
    const [x1, y1] = placing.toScreen(...stroke[0]);
    const [x2, y2] = placing.toScreen(...stroke[1]);
    android.shell(`input touchscreen swipe ${x1} ${y1} ${x2} ${y2} 600`);
    await sleep(1500);
    android.screenshot(`${name}-drawn`);
    return "by the touchscreen";
  }

  /** The save button tapped through the touchscreen, in its middle, where the page places it. */
  async press(name: string): Promise<boolean> {
    // The form of the markup stands above the button: it comes into view first.
    await this.evaluate('document.getElementById("save").scrollIntoView({ block: "center" })');
    await sleep(1000);
    const before = saved().length;
    const made = await this.blobs();
    const placing = await this.placing(name);
    const button = await this.box("#save");
    if (!placing || !button) {
      run.record(`tap the save button, for the ${name}`, false);
      return false;
    }
    const [x, y] = placing.toScreen(button.x + button.width / 2, button.y + button.height / 2);
    android.shell(`input tap ${x} ${y}`);
    // The file in Chrome's downloads, with Chrome's question answered if it asks one before it
    // downloads: the file comes in a second or two, and a wait on its question alone took ten.
    await until(10, () => {
      if (saved().length > before) return true;
      const away = find(android.screen(), AWAY);
      if (away) android.tap(away);
      return undefined;
    });
    // The tap reached the button when the page made the file's blob: a tap that missed it is the
    // device's failure, not the page's.
    const reached = (await this.blobs()) > made;
    run.record(`tap the save button, for the ${name}`, reached, placing.how);
    if (!reached) android.keepDump(`${name}-tap-missed`);
    return reached;
  }

  /** How many blobs the page has made, as the watch counts them. */
  private async blobs(): Promise<number> {
    return Number(await this.evaluate("window.__canvasWatch?.blobs.length ?? 0"));
  }

  async toWorkbook(): Promise<void> {
    await this.evaluate(TO_WORKBOOK);
    await sleep(2000);
  }

  requests(): string[] {
    return outside(this.asked, this.page ? [this.page.url] : []);
  }

  shot(name: string): void {
    android.screenshot(name);
  }

  async close(): Promise<void> {
    this.tools?.close();
  }
}

/** The files of the page's saving in Chrome's downloads, by name. */
function saved(): string[] {
  return android
    .shell(`ls ${DOWNLOADS}`)
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => SAVED.test(name));
}

/** The server asked for nothing but the page, and the files the page saved, off the device. */
function after(file: string): void {
  const { step, ok, note } = served(run.folder, file);
  run.record(step, ok, note, "page");
  const names = saved();
  const into = join(run.folder, "saved");
  mkdirSync(into, { recursive: true });
  for (const name of names) android.pull(`${DOWNLOADS}/${name}`, join(into, name));
  run.record(
    "the files saved are in Chrome's downloads",
    names.length === 2,
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
  await passes(
    run,
    () => volunteer(run, new Chrome(file), false),
    async () => {
      android.stopChrome();
      await sleep(3000);
    },
  );
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
