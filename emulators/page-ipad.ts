// The samples page in Safari in the iPad Simulator, on a pull request that changes what goes into
// it (T78 in RUN.md; R54, R55 in docs/decisions.md). emulators/page-ipad.sh runs it on a runner of
// macOS once the simulator is booted, safaridriver answers and emulators/serve.ts serves the page
// as pages:
//
//   node emulators/page-ipad.ts
//
// A page opened from a file does not run on an iPad: the Files app shows it in Quick Look (T80;
// В64 in RUN.md). So Safari opens it from the runner, the way a hosting would serve it, and the
// question is the element in the WebKit of iPadOS. The page served is the build with the watch of
// emulators/watch.ts written in before its own script; safaridriver drives Safari and reads it on
// the volunteer's way of emulators/volunteer.ts. A stroke is drawn by WebDriver's actions; each
// file the page hands to a download is kept from the watch's copy of its text in
// build/page-ipad-<iOS>/saved, for the workflow's job of the saved files, and where Safari puts the
// download is T22's to see. The strokes are the code's. It needs the simulator's id (UDID) and the
// version of its iOS (IOS).

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { Run } from "./run.ts";
import { type Device, passes, volunteer } from "./volunteer.ts";
import {
  type Box,
  boxOf,
  outside,
  pageFile,
  READ,
  type Seen,
  served,
  strokeIn,
  TO_WORKBOOK,
} from "./watch.ts";
import { command } from "./webdriver.ts";

const XCRUN = "/usr/bin/xcrun";
const SAFARI = "com.apple.mobilesafari";
const ios = process.env.IOS ?? "";
const udid = process.env.UDID ?? "booted";
const run = new Run(`build/page-ipad-${ios}`);
const port = "8080";
let shots = 0;

/** Safari in the simulator, through one session of safaridriver. */
class Safari implements Device {
  private session = "";
  private readonly file: string;

  constructor(file: string) {
    this.file = file;
  }

  /** A session of safaridriver with Safari in the simulator, tried again a while later while the
   * simulator is not ready for it; a session not of iOS is closed and no session. */
  private async connect(): Promise<boolean> {
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
        this.session = value.sessionId;
        const { platformName, platformVersion, browserVersion } = value.capabilities ?? {};
        writeFileSync(
          join(run.folder, "session.json"),
          `${JSON.stringify({ platformName, platformVersion, browserVersion }, null, 2)}\n`,
        );
        if (String(platformName).toLowerCase() === "ios") return true;
        await this.close();
        return false;
      } catch (error) {
        run.log(`session ${attempt} of 3: ${String(error).slice(0, 200)}`);
        if (attempt < 3) await sleep(20_000);
      }
    }
    return false;
  }

  async open(): Promise<boolean> {
    const connected = await this.connect();
    run.record("a session of safaridriver with Safari in the simulator", connected);
    if (!connected) return false;
    await command("POST", `/session/${this.session}/url`, {
      url: `http://localhost:${port}/${this.file}`,
    });
    run.record("Safari opens the page from the runner", true);
    return true;
  }

  async evaluate(expression: string): Promise<unknown> {
    return command("POST", `/session/${this.session}/execute/sync`, {
      script: `return ${expression};`,
      args: [],
    });
  }

  async read(): Promise<Seen | undefined> {
    try {
      return JSON.parse(String(await this.evaluate(READ))) as Seen;
    } catch {
      return undefined;
    }
  }

  /** A stroke by a touch of WebDriver's actions, in the page's own coordinates, or by the mouse
   * where the touch came down and drew none: on the workbook's page the touch has given none at
   * times. A touch that never reaches the page is the device's failure, and no mouse follows it:
   * a window of Safari's own beside the session's took the touch once, and the mouse after it
   * hung (T81). */
  async draw(name: string): Promise<string | undefined> {
    await this.evaluate(
      '(document.querySelector("novatrail-canvas").scrollIntoView({ block: "start" }), 0)',
    );
    await sleep(500);
    const sheet = (JSON.parse(String(await this.evaluate(boxOf("novatrail-canvas")))) ??
      undefined) as Box | undefined;
    const stroke = sheet && strokeIn(sheet);
    run.record(`find the ${name} in Safari's window`, Boolean(stroke));
    if (!stroke) return undefined;
    const [[x1, y1], [x2, y2]] = stroke;
    const seen = await this.read();
    const before = seen?.strokes ?? 0;
    const downs = seen?.pointers.length ?? 0;
    for (const pointerType of ["touch", "mouse"]) {
      await command("POST", `/session/${this.session}/actions`, {
        actions: [
          {
            type: "pointer",
            id: pointerType,
            parameters: { pointerType },
            actions: [
              { type: "pointerMove", duration: 0, x: x1, y: y1, origin: "viewport" },
              { type: "pointerDown", button: 0 },
              { type: "pointerMove", duration: 300, x: x2, y: y1, origin: "viewport" },
              { type: "pointerMove", duration: 300, x: x2, y: y2, origin: "viewport" },
              { type: "pointerUp", button: 0 },
            ],
          },
        ],
      });
      await command("DELETE", `/session/${this.session}/actions`).catch(() => {});
      await sleep(500);
      const after = await this.read();
      if ((after?.strokes ?? 0) > before) {
        this.shot(`${name}-drawn`);
        return `by ${pointerType}`;
      }
      const came = (after?.pointers.length ?? 0) > downs;
      if (!came) {
        this.shot(`${name}-not-reached`);
        run.record(`the ${pointerType} of WebDriver's actions reaches the page`, false);
        return undefined;
      }
    }
    this.shot(`${name}-not-drawn`);
    return "by neither touch nor mouse";
  }

  /** The save button pressed by its own click(): WebDriver's click of the element, in Safari on
   * the iPad Simulator, scrolled the button into view and tapped the sheet below it, a dot of a
   * stroke the run never meant (run 42537461456). What is checked is the page's way of saving,
   * not where a tap lands. */
  async press(name: string): Promise<boolean> {
    try {
      await this.evaluate('(document.getElementById("save").click(), 0)');
      return true;
    } catch (error) {
      run.record(`press the save button, for the ${name}`, false, String(error).slice(0, 200));
      return false;
    }
  }

  async toWorkbook(): Promise<void> {
    await this.evaluate(`(${TO_WORKBOOK}, 0)`);
    // The page asks before strokes not saved are lost; the driver says yes, as a person would.
    for (let i = 0; i < 5; i++) {
      try {
        await command("POST", `/session/${this.session}/alert/accept`, {});
        break;
      } catch {
        await sleep(500);
      }
    }
    await sleep(1500);
  }

  requests(seen: Seen): string[] {
    return outside(seen.resources);
  }

  shot(name: string): void {
    shots += 1;
    const file = join(run.folder, `${String(shots).padStart(2, "0")}-${name}.png`);
    try {
      execFileSync(XCRUN, ["simctl", "io", udid, "screenshot", file], { stdio: "ignore" });
    } catch {
      run.log(`no screenshot ${name}`);
    }
  }

  async close(): Promise<void> {
    if (this.session) await command("DELETE", `/session/${this.session}`).catch(() => {});
    this.session = "";
  }
}

async function main(): Promise<void> {
  const file = pageFile();
  await passes(
    run,
    () => volunteer(run, new Safari(file), true),
    // Safari closed, and opened again by the next session alone, in its one window.
    async () => {
      execFileSync(XCRUN, ["simctl", "terminate", udid, SAFARI], { stdio: "ignore" });
      await sleep(2000);
    },
  );
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
