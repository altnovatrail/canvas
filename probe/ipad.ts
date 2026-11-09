// The probe of a page opened from a file in the iPad Simulator (T80 in RUN.md; R54 in
// docs/decisions.md). probe/ipad.sh runs it on a runner of macOS, once the simulator is booted,
// WebDriverAgent answers on its port and emulators/serve.ts hands the probe's files out:
//
//   node probe/ipad.ts
//
// It goes the volunteer's way: Safari downloads each file of the probe, and the file is opened from
// Safari's list of downloads and from the Files app, the two ways an iPad offers. The question is
// whether the page's script runs at all: the page says so in its first line, and the run records
// it as a finding, not as a failure. Where it runs, the run goes on as on Android: the storage, the
// pointer, the saved report, the other file and Safari once more after it stopped. It taps by the
// frames WebDriverAgent gives each element of the accessibility tree, and reads the page's report
// from that tree. Each step leaves a screenshot and its tree's words in build/probe-ipad, which the
// workflow keeps as its artifact; a step the driver cannot do fails the run. It needs the
// simulator's id (UDID, the booted one by default); WebDriverAgent answers on port 8100 and the
// server on 8080 of the runner. It installs nothing.

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { Run } from "../emulators/run.ts";
import { CSP, OPEN } from "./build.ts";

/** The probe's files, by probe/build.ts's own names. */
const FILES = [CSP, OPEN] as const;
/** The system's xcrun, by its path: no other on the PATH stands in for it. */
const XCRUN = "/usr/bin/xcrun";
const SAFARI = "com.apple.mobilesafari";
const BUTTON = "XCUIElementTypeButton";
const CELL = "XCUIElementTypeCell";
const FILES_APP = "com.apple.DocumentsApp";
/** The words of the page's first line, which say whether its script ran. */
const RAN = "The page's script ran";
const DID_NOT_RUN = "The page's script did not run.";

/** An element of WebDriverAgent's tree: its words and its frame, in points. */
export interface Element {
  readonly type: string;
  readonly words: readonly string[];
  readonly frame: readonly [number, number, number, number];
}

interface Raw {
  type?: string;
  label?: string | null;
  name?: string | null;
  value?: string | null;
  rect?: { x?: number; y?: number; width?: number; height?: number };
  children?: Raw[];
}

/** The elements of a tree of `/source?format=json`, depth first. */
export function elements(tree: unknown): Element[] {
  const found: Element[] = [];
  const walk = (raw: Raw) => {
    const { x = 0, y = 0, width = 0, height = 0 } = raw.rect ?? {};
    const words = [raw.label, raw.name, raw.value].filter(
      (word): word is string => typeof word === "string" && word !== "",
    );
    found.push({ type: raw.type ?? "", words, frame: [x, y, width, height] });
    for (const child of raw.children ?? []) walk(child);
  };
  if (tree && typeof tree === "object") walk(tree as Raw);
  return found;
}

/** The first element with an area whose words match: a pattern, or a text that must be whole. */
export function locate(all: readonly Element[], match: RegExp | string): Element | undefined {
  const fits = (word: string) => (typeof match === "string" ? word === match : match.test(word));
  return all.find(({ words, frame: [, , w, h] }) => w > 0 && h > 0 && words.some(fits));
}

/** The middle of an element, where a tap lands. */
export function centre({ frame: [x, y, w, h] }: Element): [number, number] {
  return [Math.round(x + w / 2), Math.round(y + h / 2)];
}

/** What the page's first line says of its script: "ran", "did not run", or "unseen". */
export function scriptState(all: readonly Element[]): "ran" | "did not run" | "unseen" {
  const words = all.flatMap((element) => element.words);
  if (words.some((word) => word.startsWith(RAN))) return "ran";
  if (words.some((word) => word.includes(DID_NOT_RUN))) return "did not run";
  return "unseen";
}

/** The probe's report, where the tree shows it: its block of JSON in one element, or the block's
 * lines in elements one after another, as the tree may split a <pre>. */
export function reportOf(all: readonly Element[]): Record<string, unknown> | undefined {
  const parse = (text: string) => {
    try {
      const parsed = JSON.parse(text) as unknown;
      return parsed && typeof parsed === "object" && "probe" in parsed
        ? (parsed as Record<string, unknown>)
        : undefined;
    } catch {
      return undefined;
    }
  };
  const words = all.map((element) => element.words[0] ?? "");
  for (const [i, word] of words.entries()) {
    if (!word.trimStart().startsWith("{")) continue;
    const whole = parse(word);
    if (whole) return whole;
    for (let end = i + 1; end < words.length; end++) {
      if (words[end]?.trimEnd() !== "}") continue;
      const joined = parse(words.slice(i, end + 1).join("\n"));
      if (joined) return joined;
    }
  }
  return undefined;
}

/** Where the run leaves what it found: the folder the workflow keeps as its artifact. */
const run = new Run("build/probe-ipad");
const { folder } = run;
const log = (line: string) => run.log(line);
const record = (step: string, ok: boolean, note = "") => run.record(step, ok, note);
/** WebDriverAgent's port on the runner, and the server's: probe/ipad.sh starts both there. */
const agent = "http://127.0.0.1:8100";
const udid = process.env.UDID ?? "booted";
const port = "8080";
const findings: Record<string, string> = {};
let session = "";
let shots = 0;

/** One call of WebDriverAgent's HTTP, its `value` back. A session and an app's launch wait for the
 * app, which a cold simulator takes long to start; the rest answer within seconds. */
async function call(method: string, path: string, body?: unknown): Promise<unknown> {
  // A path of the API's own words and ids only: an id from an answer can lead nowhere else.
  if (!/^\/[\w\-./?=]*$/.test(path)) throw new Error("not a path of WebDriverAgent");
  const slow = path === "/session" || path.includes("/wda/apps/");
  const response = await fetch(`${agent}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(slow ? 90_000 : 20_000),
  });
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status}`);
  const answer = (await response.json()) as { value?: unknown; sessionId?: string };
  if (answer.sessionId) session = answer.sessionId;
  return answer.value;
}

/** Bring an app to the front. The first call opens WebDriverAgent's one session; a later one
 * activates the app in it. A new session would launch the app again, and a launch of Safari stops
 * the download under way. */
async function open(bundleId: string): Promise<void> {
  if (session) {
    // WebDriverAgent has refused an activation once, 400, while Safari had a download under way
    // (T78): it gets three tries, a while apart.
    for (let attempt = 1; ; attempt++) {
      try {
        await call("POST", `/session/${session}/wda/apps/activate`, { bundleId });
        break;
      } catch (error) {
        if (attempt === 3) throw error;
        log(`activate ${bundleId}, try ${attempt}: ${String(error).slice(0, 120)}`);
        await sleep(5000);
      }
    }
  } else {
    await call("POST", "/session", {
      capabilities: {
        alwaysMatch: { bundleId, shouldWaitForQuiescence: false, forceAppLaunch: false },
      },
    });
  }
  await sleep(3000);
}

/** A text in a predicate of NSPredicate, in single quotes. */
export function quoted(text: string): string {
  return `'${text.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

/** The predicate of an element by its label, whole or by its start, and, if named, its type. */
export function labelled(label: string, how: "==" | "BEGINSWITH" = "==", type = ""): string {
  const own = `label ${how} ${quoted(label)}`;
  return type ? `type == ${quoted(type)} AND ${own}` : own;
}

async function screen(): Promise<Element[]> {
  try {
    return elements(await call("GET", "/source?format=json"));
  } catch {
    return [];
  }
}

function shot(name: string): void {
  shots += 1;
  const file = join(folder, `${String(shots).padStart(2, "0")}-${name}.png`);
  execFileSync(XCRUN, ["simctl", "io", udid, "screenshot", file], { stdio: "ignore" });
}

/** Leave a screenshot and the words the screen shows, and give the screen's elements. */
async function look(name: string): Promise<Element[]> {
  shot(name);
  const all = await screen();
  const words = all.flatMap((element) => element.words);
  writeFileSync(
    join(folder, `${String(shots).padStart(2, "0")}-${name}.json`),
    `${JSON.stringify(words, null, 1)}\n`,
  );
  return all;
}

/** Click the first element a predicate of NSPredicate finds, within the time, and say whether
 * one was clicked. WebDriverAgent clicks an element where it can be hit and waits for it to be
 * hittable, which a tap at a frame's middle does not: a dialog in the tree may not yet be on the
 * screen, and the tap lands on what is under it. */
async function press(predicate: string, seconds: number): Promise<boolean> {
  const until = Date.now() + seconds * 1000;
  while (Date.now() < until) {
    let found: Record<string, string>[] = [];
    try {
      found = (await call("POST", `/session/${session}/elements`, {
        using: "predicate string",
        value: predicate,
      })) as Record<string, string>[];
    } catch {
      found = [];
    }
    for (const element of found) {
      try {
        await call("POST", `/session/${session}/element/${Object.values(element)[0]}/click`, {});
        log(`click ${predicate}`);
        await sleep(1500);
        return true;
      } catch {
        // Not hittable: the next one, or the next second.
      }
    }
    await sleep(1000);
  }
  log(`nothing to click: ${predicate}`);
  return false;
}

/** Wait until the page's first line can be read, and say what it says. */
async function pageState(seconds: number): Promise<ReturnType<typeof scriptState>> {
  const until = Date.now() + seconds * 1000;
  while (Date.now() < until) {
    const state = scriptState(await screen());
    if (state !== "unseen") return state;
    await sleep(1000);
  }
  return "unseen";
}

/** Safari downloads a file of the probe: the page's address, then Safari's question, answered. */
async function download(file: string): Promise<void> {
  await open(SAFARI);
  await call("POST", `/session/${session}/url`, { url: `http://localhost:${port}/${file}` });
  // The question is in the tree before it is on the screen: let it come.
  await sleep(6000);
  const asked = await look(`download-${file}`);
  findings[`question of ${file}`] =
    locate(asked, /^Download$/) && locate(asked, /^View$/)
      ? "Download or View"
      : locate(asked, /^Download$/)
        ? "Download"
        : "none";
  // A finding, not a step: the files reach the Files app either way (placed()), and the question
  // is what opens them there.
  findings[`Download of ${file} pressed`] = String(
    await press(labelled("Download", "==", BUTTON), 15),
  );
  // Nine kilobytes from the runner take a moment, and Safari must not leave the page meanwhile.
  await sleep(8000);
  await look(`downloaded-${file}`);
}

/** Open a downloaded file from Safari's list of downloads, and say what its page shows. */
async function fromSafari(file: string, name: string): Promise<string> {
  await open(SAFARI);
  // Safari hides its buttons while the address field has the keyboard.
  await press(labelled("Hide keyboard"), 2);
  const listed = await press(`name == ${quoted("DownloadsButton")}`, 10);
  const item = (await look(`${name}-list`)).find(({ words }) =>
    words.some((word) => word.startsWith(`${file}, `)),
  );
  if (item?.words.some((word) => word.includes("Progress"))) {
    findings[`${file} in Safari's downloads`] = "not finished";
  }
  const opened = listed && (await press(labelled(`${file}, `, "BEGINSWITH"), 10));
  record(`open ${file} from Safari's downloads`, opened);
  const state = opened ? await pageState(20) : "unseen";
  await look(name);
  findings[`${name}: ${file} from Safari's downloads`] = state;
  return state;
}

/** Open a downloaded file from the Files app: Browse, On My iPad, Downloads, the file. */
async function fromFiles(file: string, name: string): Promise<string> {
  await open(FILES_APP);
  await press(labelled("Browse"), 10);
  // The folder and the file by their cells: a tap on a name in the icons starts renaming it.
  // The Files app may open where it was left, On My iPad already: then there is no place to press.
  await press(labelled("On My iPad"), 3);
  const place = await press(labelled("Downloads", "BEGINSWITH", CELL), 10);
  await look(`${name}-folder`);
  const base = file.replace(/\.html$/, "");
  let opened = place && (await press(labelled(base, "BEGINSWITH", CELL), 10));
  if (place && !opened) {
    // WebDriverAgent has once found no hittable cell while the folder showed the file (T78): then
    // a tap on the file's icon, the upper part of its cell — no dialog stands over the folder,
    // and a tap on the name below would start renaming it.
    const cell = (await screen()).find(
      ({ words, frame: [, , w, h] }) =>
        w > 0 && h > 0 && words.some((word) => word.startsWith(`${base}, `)),
    );
    if (cell) {
      const [x, y, w, h] = cell.frame;
      await call("POST", `/session/${session}/wda/tap`, { x: x + w / 2, y: y + h * 0.3 });
      log(`tap the icon of ${file}`);
      opened = true;
    }
  }
  record(`open ${file} from the Files app`, opened);
  const state = opened ? await pageState(20) : "unseen";
  await look(name);
  findings[`${name}: ${file} from the Files app`] = state;
  return state;
}

/** Where the page ran: the storage, the pointer and the saved report, as on Android. */
async function onPage(file: string): Promise<void> {
  const first = reportOf(await look(`${file}-report`));
  record(`read the report of ${file}`, Boolean(first));
  if (first)
    writeFileSync(join(folder, `report-${file}.json`), `${JSON.stringify(first, null, 2)}\n`);
  record(`tap Write storage in ${file}`, await press(labelled("Write storage"), 5));
  const pad = locate(await screen(), /^Move a pen/);
  if (pad) {
    const [x, y, w, h] = pad.frame;
    await call("POST", `/session/${session}/wda/dragfromtoforduration`, {
      fromX: x + w / 4,
      fromY: y + h / 4,
      toX: x + (3 * w) / 4,
      toY: y + (3 * h) / 4,
      duration: 0.6,
    });
  }
  const drawn = reportOf(await look(`${file}-drawn`));
  if (drawn)
    writeFileSync(join(folder, `report-${file}-drawn.json`), `${JSON.stringify(drawn, null, 2)}\n`);
  const touch = (drawn?.pointers as Record<string, { events?: number }> | undefined)?.touch;
  record(`the page counted the touch in ${file}`, (touch?.events ?? 0) > 0);
  record(`tap Save report in ${file}`, await press(labelled("Save report"), 5));
  await press(labelled("Download", "==", BUTTON), 5);
  await look(`${file}-saved`);
}

/** Whether the downloads came into On My iPad's Downloads folder; if they did not, put the files
 * there as the folder of the Files app's local storage, so that the question of the Files app is
 * still asked, and say so. */
async function placed(): Promise<readonly string[]> {
  const groups = execFileSync(XCRUN, ["simctl", "get_app_container", udid, FILES_APP, "groups"], {
    encoding: "utf8",
  });
  const local = /group\.com\.apple\.FileProvider\.LocalStorage\s+(\S.*)$/m.exec(groups)?.[1];
  if (!local) {
    findings["Downloads of On My iPad"] = "no local storage found";
    return [];
  }
  const into = join(local, "File Provider Storage", "Downloads");
  const there = FILES.filter((file) => existsSync(join(into, file)));
  findings["Downloads of On My iPad"] =
    there.length === FILES.length
      ? "both downloads landed"
      : `${there.length} of ${FILES.length} downloads landed; the rest placed by simctl's container`;
  mkdirSync(into, { recursive: true });
  for (const file of FILES) {
    if (!there.includes(file)) copyFileSync(join("build/probe", file), join(into, file));
  }
  return there;
}

async function main(): Promise<void> {
  const status = await call("GET", "/status");
  writeFileSync(join(folder, "agent.json"), `${JSON.stringify(status, null, 2)}\n`);

  for (const file of FILES) await download(file);
  const landed = await placed();
  // Safari's list of downloads holds a file only where its download landed; where it did not, the
  // way is a finding, and the Files app, which has the files either way, answers the question.
  const fromList = (file: (typeof FILES)[number], name: string) =>
    landed.includes(file)
      ? fromSafari(file, name)
      : Promise.resolve("not tried: no download landed");
  const viaSafari = await fromList(FILES[0], "csp-from-safari");
  findings[`csp-from-safari: ${FILES[0]} from Safari's downloads`] ??= viaSafari;
  if (viaSafari === "ran") await onPage(FILES[0]);
  const viaFiles = await fromFiles(FILES[0], "csp-from-files");
  if (viaFiles === "ran" && viaSafari !== "ran") await onPage(FILES[0]);
  // Where the page runs, the rest goes the way that ran.
  const way = viaSafari === "ran" ? fromSafari : viaFiles === "ran" ? fromFiles : undefined;
  if (way) {
    if ((await way(FILES[1], "open")) === "ran") {
      const other = reportOf(await look("open-report"));
      if (other) {
        writeFileSync(
          join(folder, `report-${FILES[1]}.json`),
          `${JSON.stringify(other, null, 2)}\n`,
        );
      }
      record(`read the report of ${FILES[1]}`, Boolean(other));
    }
    await call("POST", `/session/${session}/wda/apps/terminate`, {
      bundleId: way === fromSafari ? SAFARI : FILES_APP,
    });
    if ((await way(FILES[0], "csp-after-restart")) === "ran") {
      const again = reportOf(await look("csp-after-restart-report"));
      if (again) {
        writeFileSync(
          join(folder, "report-after-restart.json"),
          `${JSON.stringify(again, null, 2)}\n`,
        );
      }
      record("read the report after the app stopped", Boolean(again));
    }
  }
  run.check();
}

if (import.meta.main) {
  main()
    .catch((error) => {
      log(`error: ${String(error)}`);
      process.exitCode = 1;
    })
    .finally(() => {
      run.close(`Probe on iPad ${process.env.IOS ?? ""}`.trim());
      writeFileSync(join(folder, "findings.json"), `${JSON.stringify(findings, null, 2)}\n`);
    });
}
