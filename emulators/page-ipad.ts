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
// the volunteer's way of emulators/volunteer.ts. A stroke is drawn by the page's own touch events
// (T81), and so are the moves of T22's checklist — a stroke cancelled, two fingers — while the
// buttons are pressed by their own click() (R65). Each file the page hands to a download is kept
// from the watch's copy of its text in the run's folder saved/, for the workflow's job of the saved
// files; where Safari puts the download the probe saw (T80): "On My iPad", in Downloads. The release
// build goes first, then the test build on a port of its own, each a run of its own. The strokes
// are the code's. It needs the simulator's id (UDID) and the version of its iOS (IOS).

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { Run } from "./run.ts";
import { build, checkAll, type Device, volunteer, type Way, type Ways } from "./volunteer.ts";
import { until } from "./wait.ts";
import {
  type Box,
  boxOf,
  chooseFile,
  clickButton,
  fingersIn,
  outside,
  pageFile,
  pointersBy,
  READ,
  type Seen,
  served,
  strokeBy,
  strokeIn,
  TO_WORKBOOK,
} from "./watch.ts";
import { command } from "./webdriver.ts";

const XCRUN = "/usr/bin/xcrun";
const SAFARI = "com.apple.mobilesafari";
const ios = process.env.IOS ?? "";
const udid = process.env.UDID ?? "booted";
/** The builds as Safari is served them, each with the watch written in (emulators/page-ipad.sh). */
const BUILD_WATCHED = "build/page-watched";
const TEST_WATCHED = "build/page-test-watched";
let shots = 0;

/** Safari in the simulator, through one session of safaridriver. */
class Safari implements Device {
  private session = "";
  private readonly run: Run;
  private readonly file: string;
  private readonly port: string;

  constructor(run: Run, file: string, port: string) {
    this.run = run;
    this.file = file;
    this.port = port;
  }

  /** A session of safaridriver with Safari in the simulator, tried again a while later while the
   * simulator is not ready for it; a session not of iOS is closed and no session. */
  private async connect(): Promise<boolean> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      this.run.log(`session ${attempt} of 3: asked`);
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
          join(this.run.folder, "session.json"),
          `${JSON.stringify({ platformName, platformVersion, browserVersion }, null, 2)}\n`,
        );
        if (String(platformName).toLowerCase() === "ios") return true;
        await this.close();
        return false;
      } catch (error) {
        this.run.log(`session ${attempt} of 3: ${String(error).slice(0, 200)}`);
        if (attempt < 3) await sleep(20_000);
      }
    }
    return false;
  }

  async open(): Promise<boolean> {
    const connected = await this.connect();
    this.run.record("a session of safaridriver with Safari in the simulator", connected);
    if (!connected) return false;
    await command("POST", `/session/${this.session}/url`, {
      url: `http://localhost:${this.port}/${this.file}`,
    });
    this.run.record("Safari opens the page from the runner", true);
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

  /** A stroke on the element by the page's own pointer events of a touch (strokeBy): WebDriver's
   * actions in Safari of the simulator took a window other than the session's, and the mouse after
   * them hung (T81). */
  async draw(name: string, second = false): Promise<string | undefined> {
    const sheet = await this.element();
    const stroke = sheet && strokeIn(sheet, second);
    this.run.record(`find the ${name} in Safari's window`, Boolean(stroke));
    if (!stroke) return undefined;
    await this.evaluate(strokeBy(stroke[0], stroke[1], "touch"));
    this.shot(`${name}-drawn`);
    return "by the page's own touch events";
  }

  /** The element brought into Safari's window, and its box there. */
  private async element(): Promise<Box | undefined> {
    await this.evaluate(
      '(document.querySelector("novatrail-canvas").scrollIntoView({ block: "start" }), 0)',
    );
    return this.box();
  }

  private async box(): Promise<Box | undefined> {
    return (JSON.parse(String(await this.evaluate(boxOf("novatrail-canvas")))) ?? undefined) as
      | Box
      | undefined;
  }

  /** A stroke of the page's own touch events that ends in a pointercancel, as a browser that takes
   * the touch back ends it (R65). */
  async cancel(name: string): Promise<string | undefined> {
    const sheet = await this.element();
    const stroke = sheet && strokeIn(sheet, true);
    this.run.record(`find the ${name} in Safari's window for a stroke cancelled`, Boolean(stroke));
    if (!stroke) return undefined;
    await this.evaluate(strokeBy(stroke[0], stroke[1], "touch", "pointercancel"));
    return "by the page's own touch events, cancelled";
  }

  /** Two fingers of the page's own touch events on the element where it stands: brought into the
   * window, it would scroll before they move. */
  async scroll(name: string): Promise<string | undefined> {
    const sheet = await this.box();
    const fingers = sheet && fingersIn(sheet);
    this.run.record(`find the ${name} in Safari's window for two fingers`, Boolean(fingers));
    if (!fingers) return undefined;
    await this.evaluate(pointersBy(fingers, "touch"));
    await sleep(500);
    return "by two of the page's own touch events";
  }

  /** A button of the element's row pressed by its own click(), as the save button is. */
  async button(label: string, name: string): Promise<boolean> {
    const found = (await this.evaluate(clickButton(label))) === true;
    this.run.record(`press the row's button ${label} on the ${name}`, found);
    return found;
  }

  /** The text of the sheet's file given to the section that opens a file, as a file of the page's
   * own: the picker of iPadOS is the hardware's to show (T87; Д7). */
  async openFile(text: string): Promise<string | undefined> {
    await command("POST", `/session/${this.session}/execute/sync`, {
      script: `return ${chooseFile()};`,
      args: [text],
    });
    return "the saved text, as a file of the page's own";
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
      this.run.record(`press the save button, for the ${name}`, false, String(error).slice(0, 200));
      return false;
    }
  }

  async toWorkbook(): Promise<void> {
    await this.evaluate(`(${TO_WORKBOOK}, 0)`);
    // The page asks before strokes not saved are lost; the driver says yes, as a person would.
    await until(
      3,
      () =>
        command("POST", `/session/${this.session}/alert/accept`, {}).then(
          () => true,
          () => false,
        ),
      500,
    );
    await sleep(1500);
  }

  requests(seen: Seen): string[] {
    return outside(seen.resources);
  }

  shot(name: string): void {
    shots += 1;
    const file = join(this.run.folder, `${String(shots).padStart(2, "0")}-${name}.png`);
    try {
      execFileSync(XCRUN, ["simctl", "io", udid, "screenshot", file], { stdio: "ignore" });
    } catch {
      this.run.log(`no screenshot ${name}`);
    }
  }

  async close(): Promise<void> {
    if (this.session) await command("DELETE", `/session/${this.session}`).catch(() => {});
    this.session = "";
  }
}

/** A build's run in the simulator: its passes of the volunteer's way, Safari launched anew
 * between them, and the server's log after a pass that went right. */
function ways(run: Run, build: string, port: string, way: Way): Ways {
  const file = pageFile(build);
  return {
    pass: () => volunteer(run, new Safari(run, file, port), { keep: true, way }),
    // Safari closed and launched anew, for the next session to connect to.
    recover: async () => {
      execFileSync(XCRUN, ["simctl", "terminate", udid, SAFARI], { stdio: "ignore" });
      run.log("Safari terminated");
      await sleep(2000);
      execFileSync(XCRUN, ["simctl", "launch", udid, SAFARI], { stdio: "ignore" });
      run.log("Safari launched");
      await sleep(5000);
    },
    after: () => {
      const { step, ok, note } = served(run.folder, file);
      run.record(step, ok, note, "page");
    },
  };
}

/** The release build, then the test build, each served on a port of its own: either that failed
 * fails the job. */
async function main(): Promise<void> {
  const release = new Run(`build/page-ipad-${ios}`);
  const tested = new Run(`build/page-ipad-${ios}-test`);
  await build(release, `Samples page on iPad ${ios}`, () =>
    ways(release, BUILD_WATCHED, "8080", "release"),
  );
  await build(tested, `Test build on iPad ${ios}`, () =>
    ways(tested, TEST_WATCHED, "8081", "test"),
  );
  checkAll([release, tested]);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(String(error));
    process.exitCode = 1;
  });
}
