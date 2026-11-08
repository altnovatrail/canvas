// The samples page in Safari in the iPad Simulator, on a pull request that changes what goes into
// it (T78 in RUN.md; R54, R55 in docs/decisions.md). emulators/page-ipad.sh runs it on a runner of
// macOS once the simulator is booted, safaridriver answers and emulators/serve.ts serves build/page
// as pages:
//
//   node emulators/page-ipad.ts
//
// A page opened from a file does not run on an iPad: the Files app shows it in Quick Look (T80;
// В64 in RUN.md). So Safari opens it from the runner, the way a hosting would serve it, and the
// question is the element in the WebKit of iPadOS. safaridriver drives Safari and runs the watch of
// emulators/watch.ts in the page; the driver draws a stroke on the sheet by a touch of WebDriver's
// actions, saves the sample, shows the workbook's page, draws and saves again. Each file the page
// hands to a download is read from the watch's copy of its blob into build/page-ipad-<iOS>/saved,
// for the workflow's job of the saved files; where Safari puts the download is T22's to see. Each
// step is the device's or the page's: a failure of the device earns the run one more pass, with a
// new session, a failure of the page fails it. The strokes are the code's. It needs the
// simulator's id (UDID) and the version of its iOS (IOS).

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { Run } from "./run.ts";
import {
  type Box,
  blobAt,
  boxOf,
  outside,
  pageFile,
  READ,
  type Seen,
  served,
  strokeIn,
  TASKS,
  TO_WORKBOOK,
  verdicts,
  WATCH,
  WORKBOOK,
} from "./watch.ts";
import { command } from "./webdriver.ts";

const XCRUN = "/usr/bin/xcrun";
const ios = process.env.IOS ?? "";
const udid = process.env.UDID ?? "booted";
const run = new Run(`build/page-ipad-${ios}`);
const port = "8080";
let session = "";
let shots = 0;

/** A screenshot of the whole simulator, Safari's own sheets on it too. */
function shot(name: string): void {
  shots += 1;
  const file = join(run.folder, `${String(shots).padStart(2, "0")}-${name}.png`);
  try {
    execFileSync(XCRUN, ["simctl", "io", udid, "screenshot", file], { stdio: "ignore" });
  } catch {
    run.log(`no screenshot ${name}`);
  }
}

/** Run a script in the page, its value back. */
async function execute(script: string): Promise<unknown> {
  return command("POST", `/session/${session}/execute/sync`, { script, args: [] });
}

/** The value of READ, or undefined while the page cannot be read. */
async function read(): Promise<Seen | undefined> {
  try {
    return JSON.parse(String(await execute(`return ${READ};`))) as Seen;
  } catch {
    return undefined;
  }
}

async function box(selector: string): Promise<Box | undefined> {
  return (
    (JSON.parse(String(await execute(`return ${boxOf(selector)};`))) as Box | null) ?? undefined
  );
}

/** A session of safaridriver with Safari in the simulator; a session not made yet is tried again
 * a while later, as the simulator may not be ready for it. */
async function open(): Promise<boolean> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const value = (await command("POST", "/session", {
        capabilities: {
          alwaysMatch: {
            browserName: "safari",
            platformName: "iOS",
            "safari:useSimulator": true,
            "safari:deviceUDID": udid,
          },
        },
      })) as { sessionId: string; capabilities?: Record<string, unknown> };
      session = value.sessionId;
      const { platformName, platformVersion, browserVersion } = value.capabilities ?? {};
      writeFileSync(
        join(run.folder, "session.json"),
        `${JSON.stringify({ platformName, platformVersion, browserVersion }, null, 2)}\n`,
      );
      return String(platformName).toLowerCase() === "ios";
    } catch (error) {
      run.log(`session ${attempt} of 3: ${String(error).slice(0, 200)}`);
      await sleep(20_000);
    }
  }
  return false;
}

/** A stroke on the element by a touch of WebDriver's actions, in the page's own coordinates, or
 * by the mouse where the touch is refused; say which drew and how many strokes the element holds. */
async function draw(name: string): Promise<{ strokes: number; by: string }> {
  await execute('document.querySelector("novatrail-canvas").scrollIntoView({ block: "start" });');
  await sleep(1000);
  const sheet = await box("novatrail-canvas");
  if (!sheet) return { strokes: -1, by: "no element" };
  const [[x1, y1], [x2, y2]] = strokeIn(sheet);
  const before = (await read())?.strokes ?? 0;
  for (const pointerType of ["touch", "mouse"]) {
    try {
      await command("POST", `/session/${session}/actions`, {
        actions: [
          {
            type: "pointer",
            id: pointerType,
            parameters: { pointerType },
            actions: [
              { type: "pointerMove", duration: 0, x: x1, y: y1, origin: "viewport" },
              { type: "pointerDown", button: 0 },
              {
                type: "pointerMove",
                duration: 300,
                x: Math.round((x1 + x2) / 2),
                y: y1,
                origin: "viewport",
              },
              { type: "pointerMove", duration: 300, x: x2, y: y2, origin: "viewport" },
              { type: "pointerUp", button: 0 },
            ],
          },
        ],
      });
      await command("DELETE", `/session/${session}/actions`).catch(() => {});
    } catch (error) {
      run.log(`${pointerType} on ${name}: ${String(error).slice(0, 200)}`);
      continue;
    }
    await sleep(1000);
    const strokes = (await read())?.strokes ?? -1;
    if (strokes > before) {
      shot(`${name}-drawn`);
      return { strokes, by: pointerType };
    }
  }
  shot(`${name}-not-drawn`);
  return { strokes: (await read())?.strokes ?? -1, by: "neither touch nor mouse" };
}

/** Press the save button, and keep the text of the file the page hands to a download. */
async function save(index: number, name: string): Promise<boolean> {
  try {
    const found = (await command("POST", `/session/${session}/element`, {
      using: "css selector",
      value: "#save",
    })) as Record<string, string>;
    await command("POST", `/session/${session}/element/${Object.values(found)[0]}/click`, {});
  } catch (error) {
    run.log(`save ${name}: ${String(error).slice(0, 200)}`);
    return false;
  }
  for (let i = 0; i < 10; i++) {
    const text = await execute(`return ${blobAt(index)};`).catch(() => null);
    if (typeof text === "string") {
      const into = join(run.folder, "saved");
      mkdirSync(into, { recursive: true });
      writeFileSync(join(into, `${name}.json`), text);
      shot(`${name}-saved`);
      return true;
    }
    await sleep(1000);
  }
  return false;
}

/** Answer the page's confirm, if it asks, as a person would: yes. */
async function confirm(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    try {
      await command("POST", `/session/${session}/alert/accept`, {});
      run.log("the page asked, and the driver said yes");
      return;
    } catch {
      await sleep(500);
    }
  }
}

/** One pass: Safari opens the page from the runner, and the sheet and the workbook are saved. */
async function pass(file: string): Promise<void> {
  const opened = await open();
  run.record("a session of safaridriver with Safari in the simulator", opened);
  if (!opened) return;
  try {
    await command("POST", `/session/${session}/url`, { url: `http://localhost:${port}/${file}` });
    run.record("Safari opens the page from the runner", true);
    let shown: Seen | undefined;
    for (let i = 0; i < 30 && !shown?.defined; i++) {
      shown = await read();
      if (!shown?.defined) await sleep(1000);
    }
    await execute(WATCH);
    shown = await read();
    shot("opened");
    run.record(
      "the element stands and offers the build's tasks",
      Boolean(shown?.defined && shown.tasks === TASKS),
      `${shown?.tasks ?? 0} task(s)`,
      "page",
    );
    if (!shown?.defined) return;

    const sheet = await draw("sheet");
    run.record(
      "the sheet holds the stroke drawn",
      sheet.strokes > 0,
      `${sheet.strokes}, by ${sheet.by}`,
      "page",
    );
    run.record("the sheet's sample is handed to a download", await save(0, "sheet"), "", "page");

    await execute(`${TO_WORKBOOK};`);
    await confirm();
    await sleep(1500);
    run.record(
      "the picker shows the workbook's page",
      (await read())?.task === WORKBOOK,
      "",
      "page",
    );
    const page = await draw("workbook");
    run.record(
      "the workbook holds the stroke drawn",
      page.strokes > 0,
      `${page.strokes}, by ${page.by}`,
      "page",
    );
    run.record(
      "the workbook's sample is handed to a download",
      await save(1, "workbook"),
      "",
      "page",
    );

    const last = await read();
    const out = outside(last?.resources ?? []);
    writeFileSync(
      join(run.folder, "watch.json"),
      `${JSON.stringify({ seen: last, requests: out }, null, 2)}\n`,
    );
    if (last)
      for (const { step, ok, note } of verdicts(last, out)) run.record(step, ok, note, "page");
    else run.record("read the page at the end", false);
  } finally {
    await command("DELETE", `/session/${session}`).catch(() => {});
    session = "";
  }
}

async function main(): Promise<void> {
  const file = pageFile();
  for (; run.pass <= 2; run.pass++) {
    try {
      await pass(file);
    } catch (error) {
      run.record("the pass went to its end", false, String(error).slice(0, 200));
    }
    if (run.verdict() !== "device") break;
    run.log("the device failed: Safari launched anew, and one more pass");
    execFileSync(XCRUN, ["simctl", "terminate", udid, "com.apple.mobilesafari"], {
      stdio: "ignore",
    });
    await sleep(2000);
    execFileSync(XCRUN, ["simctl", "launch", udid, "com.apple.mobilesafari"], { stdio: "ignore" });
    await sleep(10_000);
  }
  run.pass = Math.min(run.pass, 2);
  if (run.verdict() === "ok") {
    const { step, ok, note } = served(run.folder, file);
    run.record(step, ok, note, "page");
  }
  run.check();
}

if (import.meta.main) {
  main()
    .catch((error) => {
      run.log(`error: ${String(error)}`);
      process.exitCode = 1;
    })
    .finally(() => {
      run.close(`Samples page on iPad ${ios}`);
      writeFileSync(join(run.folder, "verdict.txt"), `${run.verdict()}\n`);
    });
}
