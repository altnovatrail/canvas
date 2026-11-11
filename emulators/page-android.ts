// The samples page in an Android emulator, on a pull request that changes what goes into it (T78
// in RUN.md; R54, R55 in docs/decisions.md). emulators/android.sh runs it in CI, in the toolchain
// stage's container on the runner's network, once the emulator is up and emulators/serve.ts hands
// out build/page, which the workflow's build job wrote with scripts/page.ts, and the test build
// beside it on a port of its own:
//
//   node emulators/page-android.ts
//
// It goes the volunteer's way of emulators/volunteer.ts, as the probe did (T74): Chrome downloads
// the page's file and opens it from the download, by content://. Then DevTools puts the watch of
// emulators/watch.ts into the page and loads it again under it, with the requests it makes
// recorded. A stroke is drawn through the emulator's own touchscreen, and the save button pressed
// by a tap. The moves of T22's checklist — a stroke Chrome cancels, the buttons of the element's
// row, two fingers — are Chrome's own touches, sent through DevTools (R65). The files the page
// saved come off the device into the run's folder saved/, for the workflow's job of the saved
// files to read. The release build goes first, then the test build, each a run of its own. The
// strokes are the code's: no handwriting goes into a run. It needs adb (ADB) and the servers'
// ports (PORT, TEST_PORT).

import { mkdirSync } from "node:fs";
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
import { build, checkAll, type Device, volunteer, type Way, type Ways } from "./volunteer.ts";
import { until } from "./wait.ts";
import {
  type Box,
  BUILD,
  boxOf,
  buttonBox,
  chooseFile,
  fingersIn,
  outside,
  pageFile,
  READ,
  SAVE,
  type Seen,
  served,
  strokeIn,
  TEST_BUILD,
  TITLE,
  TO_WORKBOOK,
  VIEWED,
  WATCH,
} from "./watch.ts";

const seen = new Set<string>();
/** Where Chrome saves a download, and the files of the page's saving in it. */
const DOWNLOADS = "/sdcard/Download";
const SAVED = /^[a-z2-7]{12}(?: \(\d+\))?\.json$/;

/** A point of the page's window, in its CSS pixels. */
type Point = readonly [number, number];

/** Chrome on the emulator, with the page of a file opened from its download. */
class Chrome implements Device {
  private tools: DevTools | undefined;
  private page: Target | undefined;
  private readonly asked: string[] = [];
  private readonly run: Run;
  private readonly android: Android;
  private readonly file: string;
  private readonly port: string;

  constructor(run: Run, android: Android, file: string, port: string) {
    this.run = run;
    this.android = android;
    this.file = file;
    this.port = port;
  }

  /** The page's saved files in the downloads, by the names it gives them, each quoted for the
   * shell: nothing else of the folder is touched (T101). */
  private saved(): string[] {
    return this.android
      .shell(`ls ${DOWNLOADS}`)
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => SAVED.test(name))
      .map((name) => `'${DOWNLOADS}/${name}'`);
  }

  async open(): Promise<boolean> {
    const { run, android } = this;
    // The files of an earlier pass, which would be another opening's, with another writer's code.
    const old = this.saved();
    if (old.length > 0) android.shell(`rm -f ${old.join(" ")}`);
    android.view(`http://${HOST}:${this.port}/${this.file}`);
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
    const { run, android } = this;
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

  /** The element brought into the window, and its box there. */
  private async element(): Promise<Box | undefined> {
    await this.evaluate(
      'document.querySelector("novatrail-canvas").scrollIntoView({ block: "start" })',
    );
    await sleep(500);
    return this.box("novatrail-canvas");
  }

  /** A stroke through the touchscreen, on the element brought into the window. */
  async draw(name: string, second = false): Promise<string | undefined> {
    const { run, android } = this;
    const sheet = await this.element();
    const placing = await this.placing(name);
    const stroke = sheet && strokeIn(sheet, second);
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

  /** Chrome's own touches, sent through DevTools in the page's CSS pixels (R65): the fingers of
   * the paths come down together, move along them in steps, and end as the end says — lifted, or
   * taken back by the browser, which the page hears as a pointercancel. */
  private async touches(
    paths: readonly (readonly [Point, Point])[],
    end: "touchEnd" | "touchCancel",
    steps = 10,
  ): Promise<void> {
    if (!this.tools) throw new Error("no page");
    const tools = this.tools;
    const at = (step: number) =>
      paths.map(([[x1, y1], [x2, y2]], id) => ({
        x: x1 + (x2 - x1) * (steps > 0 ? step / steps : 0),
        y: y1 + (y2 - y1) * (steps > 0 ? step / steps : 0),
        id,
      }));
    await tools.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: at(0) });
    for (let step = 1; step <= steps; step++) {
      await sleep(30);
      await tools.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: at(step) });
    }
    await tools.send("Input.dispatchTouchEvent", { type: end, touchPoints: [] });
    await sleep(800);
  }

  async cancel(name: string): Promise<string | undefined> {
    const sheet = await this.element();
    const stroke = sheet && strokeIn(sheet, true);
    this.run.record(`find the ${name} for a stroke Chrome cancels`, Boolean(stroke));
    if (!stroke) return undefined;
    await this.touches([stroke], "touchCancel");
    return "by Chrome's touches through DevTools, cancelled";
  }

  /** Two fingers on the element where it stands: brought into the window, it would scroll before
   * they move, and the scroll they make would not show. */
  async scroll(name: string): Promise<string | undefined> {
    const sheet = await this.box("novatrail-canvas");
    const fingers = sheet && fingersIn(sheet);
    this.run.record(`find the ${name} for two fingers`, Boolean(fingers));
    if (!fingers) return undefined;
    await this.touches(fingers, "touchEnd");
    return "by two of Chrome's touches through DevTools";
  }

  /** A button of the element's row, tapped in its middle by Chrome's own touch. */
  async button(label: string, name: string): Promise<boolean> {
    await this.element();
    const box =
      (JSON.parse(String(await this.evaluate(buttonBox(label)))) as Box | null) ?? undefined;
    this.run.record(`find the row's button ${label} on the ${name}`, Boolean(box));
    if (!box) return false;
    const middle: Point = [box.x + box.width / 2, box.y + box.height / 2];
    // A tap, lifted at once: a touch held a while is a long press to Chrome, which clicks nothing.
    await this.touches([[middle, middle]], "touchEnd", 0);
    return true;
  }

  /** The sheet's file the page saved, as Chrome took it into its downloads, given to the section
   * that opens a file through DevTools, as a picker would give it (T87). Should Chrome not read it
   * there, the page is given its text as a file of its own. */
  async openFile(text: string): Promise<string | undefined> {
    if (!this.tools) throw new Error("no page");
    let path = "";
    try {
      const files = this.saved();
      if (files.length > 0) {
        path =
          this.android
            .shell(`grep -l '"sheet"' ${files.join(" ")}`)
            .split("\n")[0]
            ?.trim() ?? "";
      }
    } catch {
      // No file of the sheet in the downloads: the page is given the text below.
    }
    if (path) {
      try {
        // The field by its object in the page as it is now: the IDs of DOM's nodes hold only for the
        // document DevTools last walked, and the page was opened anew since (run 42733192609).
        const found = (await this.tools.send("Runtime.evaluate", {
          expression: 'document.getElementById("open-file")',
        })) as { result?: { objectId?: string } };
        await this.tools.send("DOM.setFileInputFiles", {
          objectId: found.result?.objectId,
          files: [path],
        });
        const shown = await until(10, async () => {
          const view = JSON.parse(String(await this.evaluate(VIEWED))) as { shown: boolean };
          return view.shown ? true : undefined;
        });
        if (shown) return `the downloaded file ${path}, through DevTools`;
        this.run.log(`the page showed nothing of ${path}: its text is given instead`);
      } catch (error) {
        this.run.log(`DevTools gave no file ${path}: ${String(error).slice(0, 200)}`);
      }
    }
    await this.evaluate(chooseFile(text));
    return "the saved text, as a file of the page's own";
  }

  /** The save button tapped through the touchscreen, in its middle, where the page places it. */
  async press(name: string): Promise<boolean> {
    const { run, android } = this;
    // The form of the markup stands above the button: it comes into view first.
    await this.evaluate('document.getElementById("save").scrollIntoView({ block: "center" })');
    await sleep(1000);
    const before = saved(android).length;
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
      if (saved(android).length > before) return true;
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
    this.android.screenshot(name);
  }

  async close(): Promise<void> {
    this.tools?.close();
  }
}

/** The files of the page's saving in Chrome's downloads, by name. */
function saved(android: Android): string[] {
  return android
    .shell(`ls ${DOWNLOADS}`)
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => SAVED.test(name));
}

/** The server asked for nothing but the page, and the files the page saved, off the device. */
function after(run: Run, android: Android, file: string): void {
  const { step, ok, note } = served(run.folder, file);
  run.record(step, ok, note, "page");
  const names = saved(android);
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

/** A build's run on the emulator: its passes of the volunteer's way, Chrome stopped between
 * them, and the server's log and the files saved after a pass that went right. */
function ways(run: Run, android: Android, build: string, port: string, way: Way): Ways {
  const file = pageFile(build);
  return {
    pass: () => volunteer(run, new Chrome(run, android, file, port), { keep: false, way }),
    recover: async () => {
      android.stopChrome();
      await sleep(3000);
    },
    after: () => after(run, android, file),
    broken: () => {
      try {
        android.screenshot("error");
      } catch {
        // No screen to take: the error the run records says why.
      }
    },
  };
}

async function main(): Promise<void> {
  const release = new Run("build/page-android");
  const tested = new Run("build/page-android-test");
  const android = new Android(release);
  if (!(await android.prepare())) {
    release.record("Chrome is on the image", false);
    release.close("Samples page on Android");
    throw new Error("the image has no Chrome");
  }
  await build(release, "Samples page on Android", () =>
    ways(release, android, BUILD, process.env.PORT ?? "8080", "release"),
  );
  // Chrome begins the test build afresh: nothing of the release's page, its dialogs or the
  // message of its download stands over the next one.
  // An emulator gone by then fails the test build's run as the device's, in its own journal.
  try {
    android.stopChrome();
    await sleep(3000);
  } catch (error) {
    tested.log(`Chrome not stopped before the test build: ${String(error).slice(0, 200)}`);
  }
  const again = new Android(tested);
  await build(tested, "Test build on Android", () =>
    ways(tested, again, TEST_BUILD, process.env.TEST_PORT ?? "8081", "test"),
  );
  // Both builds' runs go to their end, and either that failed fails the job.
  checkAll([release, tested]);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(String(error));
    process.exitCode = 1;
  });
}
