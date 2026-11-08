// The probe of a page opened from a file in an Android emulator (T74 in RUN.md; R54 in
// docs/decisions.md). probe/android.sh runs it in CI, in the toolchain stage's container on the
// runner's network, once the emulator is up and probe/serve.ts hands the probe's files out:
//
//   node probe/android.ts <folder>
//
// It goes the volunteer's way in Chrome: it downloads each file of the probe, opens it from the
// download, writes the storage, draws with the touchscreen and, where the tool has it, the stylus,
// saves the report, opens the other file, and opens the first again after Chrome has stopped. It
// taps what a person would tap, by the bounds uiautomator gives each node on the screen, and it
// reads the page's report through Chrome's DevTools socket, which adb forwards to port 9222. Each
// step leaves a screenshot and, where the page could be read, its report in the folder, which the
// workflow keeps as its artifact. It needs adb (ADB, or adb on the path) and the server's port
// (PORT, 8080 by default); it installs nothing and asks nothing of the network but the emulator.

import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

/** The probe's files, as probe/build.ts names them. */
const FILES = ["t29-probe-csp.html", "t29-probe-open.html"] as const;
/** The page's title, by which its DevTools target is found. */
const TITLE = "canvas file probe";
/** Chrome's package, and the activity a VIEW intent starts it at. */
const CHROME = "com.android.chrome";
const MAIN = `${CHROME}/com.google.android.apps.chrome.Main`;
/** The flags that keep Chrome's first run from standing in the way, as Chrome reads them on a
 * debuggable image from this file. */
const FLAGS = "_ --disable-fre --no-default-browser-check --no-first-run";

/** A node of uiautomator's dump: its text, its description and its bounds on the screen. */
export interface Node {
  readonly text: string;
  readonly description: string;
  readonly bounds: readonly [number, number, number, number];
}

/** The nodes of a dump of uiautomator, in its order. */
export function nodes(xml: string): Node[] {
  const found: Node[] = [];
  for (const [element] of xml.matchAll(/<node\b[^>]*>/g)) {
    const attribute = (name: string) => new RegExp(`\\b${name}="([^"]*)"`).exec(element)?.[1] ?? "";
    const bounds = /^\[(\d+),(\d+)\]\[(\d+),(\d+)\]$/.exec(attribute("bounds"));
    if (!bounds) continue;
    const [, x1, y1, x2, y2] = bounds.map(Number);
    found.push({
      text: entities(attribute("text")),
      description: entities(attribute("content-desc")),
      bounds: [x1 ?? 0, y1 ?? 0, x2 ?? 0, y2 ?? 0],
    });
  }
  return found;
}

/** The text of an attribute of XML, its entities read. */
function entities(text: string): string {
  return text
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

/** The first node whose text or description matches, and is not empty on the screen. */
export function find(all: readonly Node[], pattern: RegExp): Node | undefined {
  return all.find(
    ({ text, description, bounds: [x1, y1, x2, y2] }) =>
      (pattern.test(text) || pattern.test(description)) && x2 > x1 && y2 > y1,
  );
}

/** The middle of a node, where a tap lands. */
export function middle({ bounds: [x1, y1, x2, y2] }: Node): [number, number] {
  return [Math.round((x1 + x2) / 2), Math.round((y1 + y2) / 2)];
}

/** What the run found, step by step: what it did, and what it could not. */
interface Step {
  readonly step: string;
  readonly ok: boolean;
  readonly note: string;
}

const folder = process.argv[2] ?? "";
const adbPath = process.env.ADB ?? "adb";
const port = process.env.PORT ?? "8080";
const steps: Step[] = [];
let shots = 0;

function log(line: string): void {
  console.log(line);
  appendFileSync(join(folder, "log.txt"), `${line}\n`);
}

function adb(...args: string[]): string {
  return execFileSync(adbPath, args, { encoding: "utf8", maxBuffer: 1 << 26 });
}

function shell(command: string): string {
  return adb("shell", command);
}

function screenshot(name: string): void {
  shots += 1;
  const png = execFileSync(adbPath, ["exec-out", "screencap", "-p"], { maxBuffer: 1 << 28 });
  writeFileSync(join(folder, `${String(shots).padStart(2, "0")}-${name}.png`), png);
}

/** The nodes on the screen, or none while uiautomator cannot read it: it gives no root node while
 * an app changes its window, and then writes no file. */
function screen(): Node[] {
  try {
    shell("rm -f /sdcard/ui.xml; uiautomator dump /sdcard/ui.xml > /dev/null 2>&1");
    return nodes(shell("cat /sdcard/ui.xml 2>/dev/null"));
  } catch {
    return [];
  }
}

/** What the screen shows in words, for the log: the texts and descriptions of its nodes. */
function words(all: readonly Node[]): string {
  return JSON.stringify(
    all.map(({ text, description }) => text || description).filter((word) => word !== ""),
  );
}

/** Whether Chrome's window has the focus: a cold start of Chrome leaves the launcher on the screen
 * for a while. */
function chromeFocused(): boolean {
  try {
    return /mCurrentFocus=.*com\.android\.chrome/.test(shell("dumpsys window windows"));
  } catch {
    return false;
  }
}

/** Wait until Chrome has the focus and shows more than its splash: a screen with words on it. */
async function settle(seconds: number): Promise<void> {
  for (let i = 0; i < seconds; i++) {
    const all = chromeFocused() ? screen() : [];
    if (all.some(({ text, description }) => text || description)) {
      log(`screen ${words(all).slice(0, 600)}`);
      return;
    }
    await sleep(1000);
  }
  log("screen still without words");
}

function tap(node: Node): void {
  const [x, y] = middle(node);
  shell(`input tap ${x} ${y}`);
}

/** Tap the first node that matches within the time, and say whether there was one. */
async function tapWhen(pattern: RegExp, seconds: number): Promise<boolean> {
  for (let i = 0; i < seconds; i++) {
    const node = find(screen(), pattern);
    if (node) {
      log(`tap ${JSON.stringify(node.text || node.description)}`);
      tap(node);
      await sleep(1000);
      return true;
    }
    await sleep(1000);
  }
  return false;
}

/** A DevTools target of Chrome, as /json lists it. */
interface Target {
  readonly type: string;
  readonly title: string;
  readonly url: string;
  readonly webSocketDebuggerUrl?: string;
}

async function targets(): Promise<Target[]> {
  try {
    const response = await fetch("http://127.0.0.1:9222/json");
    return (await response.json()) as Target[];
  } catch {
    return [];
  }
}

/** The probe's page among Chrome's targets: the newest one of its title. */
async function probePage(seconds: number): Promise<Target | undefined> {
  for (let i = 0; i < seconds; i++) {
    const page = (await targets()).find(
      ({ type, title, webSocketDebuggerUrl }) =>
        type === "page" && title === TITLE && webSocketDebuggerUrl,
    );
    if (page) return page;
    await sleep(1000);
  }
  return undefined;
}

/** Evaluate an expression in a page, by one message of the DevTools protocol. */
async function evaluate(page: Target, expression: string): Promise<unknown> {
  const socket = new WebSocket(page.webSocketDebuggerUrl ?? "");
  try {
    await new Promise((open, fail) => {
      socket.onopen = open;
      socket.onerror = fail;
    });
    const answer = new Promise<unknown>((done, fail) => {
      socket.onmessage = (event) => {
        const message = JSON.parse(String(event.data));
        if (message.id !== 1) return;
        if (message.error || message.result?.exceptionDetails) fail(new Error(event.data));
        else done(message.result?.result?.value);
      };
    });
    socket.send(
      JSON.stringify({
        id: 1,
        method: "Runtime.evaluate",
        params: { expression, returnByValue: true },
      }),
    );
    return await answer;
  } finally {
    socket.close();
  }
}

/** The page's report once its requests are settled, or undefined if it cannot be read. */
async function report(page: Target, name: string): Promise<Record<string, unknown> | undefined> {
  for (let i = 0; i < 20; i++) {
    try {
      const text = await evaluate(page, 'document.getElementById("report").textContent');
      const parsed = JSON.parse(String(text)) as Record<string, unknown>;
      if (parsed.settled === true) {
        writeFileSync(join(folder, `report-${name}.json`), `${JSON.stringify(parsed, null, 2)}\n`);
        return parsed;
      }
    } catch (error) {
      log(`report ${name}: ${String(error).slice(0, 200)}`);
    }
    await sleep(1000);
  }
  return undefined;
}

function record(step: string, ok: boolean, note = ""): void {
  steps.push({ step, ok, note });
  log(`${ok ? "ok  " : "FAIL"} ${step}${note ? ` — ${note}` : ""}`);
}

/** Download a file of the probe in Chrome and open it from the download, as a volunteer would. */
async function download(file: string): Promise<Target | undefined> {
  shell(`am start -a android.intent.action.VIEW -d http://10.0.2.2:${port}/${file} -n ${MAIN}`);
  await settle(60);
  screenshot(`download-${file}`);
  const how = await openDownload(file);
  record(`open ${file} from Chrome's downloads`, how !== "", how);
  await settle(30);
  screenshot(`opened-${file}`);
  const page = await probePage(40);
  record(`find ${file} among Chrome's pages`, Boolean(page), page?.url ?? "");
  return page;
}

/** Answers that let a download go on or put Chrome's offers away, as a person would give them:
 * Chrome asks before it downloads a file of some types or over plain HTTP, and on its first run
 * it offers notifications. */
const AWAY = /^(Download|Download anyway|Keep|No thanks|Don.t allow|Not now|Got it)$/i;

/** Open a downloaded file the way a person would: by Open in Chrome's message of the download, or
 * else by its name in Chrome's list of downloads, which Chrome's menu opens when Chrome shows
 * neither by itself. Say which, or "" when none came. */
async function openDownload(file: string): Promise<string> {
  for (let i = 0; i < 60; i++) {
    const all = screen();
    if (i === 15 || i === 35) {
      log("no message and no list of the download: Chrome's menu, then Downloads");
      const menu = find(all, /^Customize and control Google Chrome$/);
      if (menu) {
        tap(menu);
        await tapWhen(/^Downloads$/, 5);
        continue;
      }
    }
    const open = find(all, /^Open$/);
    if (open) {
      tap(open);
      return "Open in the message of the download";
    }
    const away = find(all, AWAY);
    if (away) {
      log(`tap ${JSON.stringify(away.text || away.description)}`);
      tap(away);
    } else {
      const named = all.find(
        ({ text, bounds: [x1, y1, x2, y2] }) => text === file && x2 > x1 && y2 > y1,
      );
      if (named) {
        tap(named);
        return "its name in Chrome's list of downloads";
      }
    }
    await sleep(1000);
  }
  log(`screen ${words(screen()).slice(0, 600)}`);
  return "";
}

/** Start Chrome once on an empty page and put its first run's offers away, so that the probe's
 * steps meet the browser a volunteer has used before. */
async function warmUp(): Promise<void> {
  shell(`am start -a android.intent.action.VIEW -d about:blank -n ${MAIN}`);
  await settle(120);
  let quiet = 0;
  for (let i = 0; i < 30 && quiet < 3; i++) {
    const away = find(screen(), AWAY);
    if (away) {
      log(`tap ${JSON.stringify(away.text || away.description)}`);
      tap(away);
      quiet = 0;
    } else {
      quiet += 1;
    }
    await sleep(1000);
  }
  screenshot("warm");
}

async function main(): Promise<void> {
  if (!folder) {
    console.error("usage: node probe/android.ts <folder>");
    process.exit(2);
  }
  mkdirSync(folder, { recursive: true });
  const facts = {
    android: shell("getprop ro.build.version.release").trim(),
    sdk: shell("getprop ro.build.version.sdk").trim(),
    debuggable: shell("getprop ro.debuggable").trim(),
    chrome: /versionName=(\S+)/.exec(shell(`dumpsys package ${CHROME}`))?.[1] ?? "absent",
    size: shell("wm size").trim(),
  };
  writeFileSync(join(folder, "device.json"), `${JSON.stringify(facts, null, 2)}\n`);
  log(`device ${JSON.stringify(facts)}`);
  if (facts.chrome === "absent") {
    record("Chrome is on the image", false);
    throw new Error("the image has no Chrome");
  }
  shell(`echo "${FLAGS}" > /data/local/tmp/chrome-command-line`);
  shell(`am set-debug-app --persistent ${CHROME}`);
  shell(`am force-stop ${CHROME}`);
  await warmUp();

  const csp = await download(FILES[0]);
  let first = "";
  if (csp) {
    first = csp.url;
    record("read the report of the file with the policy", Boolean(await report(csp, "csp-opened")));
    await tapWhen(/^Write storage$/, 5);
    const pad = find(screen(), /^Move a pen/);
    if (pad) {
      const [x1, y1, x2, y2] = pad.bounds;
      shell(`input touchscreen swipe ${x1 + 20} ${y1 + 20} ${x2 - 20} ${y2 - 20} 600`);
      let stylus = true;
      try {
        shell(`input stylus swipe ${x1 + 20} ${y2 - 20} ${x2 - 20} ${y1 + 20} 600`);
      } catch {
        stylus = false;
      }
      record("draw with the touchscreen and the stylus", true, stylus ? "" : "no stylus source");
    } else {
      record("find the pad on the screen", false);
    }
    await sleep(1000);
    screenshot("csp-drawn");
    await report(csp, "csp-drawn");
    const saved = await tapWhen(/^Save report$/, 5);
    await tapWhen(AWAY, 5);
    record("tap Save report", saved);
    await sleep(2000);
    screenshot("csp-saved");
  }

  const open = await download(FILES[1]);
  if (open) {
    record(
      "read the report of the file without the policy",
      Boolean(await report(open, "open-opened")),
    );
  }

  shell(`am force-stop ${CHROME}`);
  await sleep(2000);
  if (first) {
    shell(`am start -a android.intent.action.VIEW -d '${first}' -t text/html -n ${MAIN}`);
    await settle(60);
    screenshot("csp-after-restart");
    const again = await probePage(40);
    record(
      "read the report after Chrome stopped",
      Boolean(again && (await report(again, "csp-after-restart"))),
    );
  }

  const downloads = shell("ls -l /sdcard/Download");
  writeFileSync(join(folder, "downloads.txt"), downloads);
  log(`downloads:\n${downloads}`);
  writeFileSync(join(folder, "steps.json"), `${JSON.stringify(steps, null, 2)}\n`);
  if (!steps.some(({ step, ok }) => ok && step.startsWith("read the report"))) {
    throw new Error("no report of the probe could be read");
  }
}

if (import.meta.main) {
  main().catch((error) => {
    log(`error: ${String(error)}`);
    try {
      screenshot("error");
    } catch {
      // No screen to take: the error above says why.
    }
    writeFileSync(join(folder, "steps.json"), `${JSON.stringify(steps, null, 2)}\n`);
    process.exit(1);
  });
}
