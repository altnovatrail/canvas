// The probe of a page opened from a file in an Android emulator (T74 in RUN.md; R54 in
// docs/decisions.md). probe/android.sh runs it in CI, in the toolchain stage's container on the
// runner's network, once the emulator is up and probe/serve.ts hands the probe's files out:
//
//   node probe/android.ts
//
// It goes the volunteer's way in Chrome: it downloads each file of the probe, opens it from the
// download, writes the storage, draws with the touchscreen and, where the tool has it, the stylus,
// saves the report, opens the other file, and opens the first again after Chrome has stopped. It
// taps what a person would tap, by the bounds uiautomator gives each node on the screen, and it
// reads the page's report through Chrome's DevTools socket, which adb forwards to port 9222. Each
// step leaves a screenshot and, where the page could be read, its report in build/probe-android,
// which the workflow keeps as its artifact; a step that fails fails the run. It needs adb (ADB, or adb on
// the path) and the server's port (PORT, 8080 by default); it installs nothing and asks nothing of
// the network but the emulator.

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
/** Answers that let a download go on or put Chrome's offers away, as a person would give them:
 * Chrome may ask before it downloads a file of some types or over plain HTTP, and on its first run
 * it offers notifications. */
const AWAY = /^(Download|Download anyway|Keep|No thanks|Don.t allow|Not now|Got it)$/i;

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

/** The text of an attribute of XML, its entities read: the five named ones and the numeric ones
 * uiautomator writes for a line break or a quote. */
export function entities(text: string): string {
  const named: Record<string, string> = { lt: "<", gt: ">", quot: '"', apos: "'", amp: "&" };
  return text.replace(/&(#x[0-9a-f]+|#\d+|lt|gt|quot|apos|amp);/gi, (whole, name: string) => {
    if (name[0] !== "#") return named[name.toLowerCase()] ?? whole;
    const code =
      name[1] === "x" || name[1] === "X"
        ? Number.parseInt(name.slice(2), 16)
        : Number(name.slice(1));
    return String.fromCodePoint(code);
  });
}

/** The first node on the screen — not empty there — whose text or description matches: a pattern,
 * or a text that must be whole. */
export function find(all: readonly Node[], match: RegExp | string): Node | undefined {
  const fits = (value: string) => (typeof match === "string" ? value === match : match.test(value));
  return all.find(
    ({ text, description, bounds: [x1, y1, x2, y2] }) =>
      (fits(text) || fits(description)) && x2 > x1 && y2 > y1,
  );
}

/** The middle half of a node, where a swipe stays clear of the screen's edges. */
export function inner({ bounds: [x1, y1, x2, y2] }: Node): [number, number, number, number] {
  const [w, h] = [(x2 - x1) / 4, (y2 - y1) / 4];
  return [Math.round(x1 + w), Math.round(y1 + h), Math.round(x2 - w), Math.round(y2 - h)];
}

/** The middle of a node, where a tap lands. */
export function middle({ bounds: [x1, y1, x2, y2] }: Node): [number, number] {
  return [Math.round((x1 + x2) / 2), Math.round((y1 + y2) / 2)];
}

/** Whether the window that has the focus is Chrome's, as `dumpsys window` names it: a cold start
 * of Chrome leaves the launcher on the screen for a while. */
export function focusedOn(dump: string, app: string): boolean {
  const focus = /mCurrentFocus=Window\{[^}]*\}/.exec(dump)?.[0] ?? "";
  return focus.includes(`${app}/`);
}

/** What the run found, step by step: what it did, and what it could not. */
interface Step {
  readonly step: string;
  readonly ok: boolean;
  readonly note: string;
}

/** A DevTools target of Chrome, as /json lists it. */
interface Target {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly url: string;
  readonly webSocketDebuggerUrl?: string;
}

/** Where the run leaves what it found: the folder the workflow keeps as its artifact. */
const folder = "build/probe-android";
const adbPath = process.env.ADB ?? "adb";
const port = process.env.PORT ?? "8080";
const steps: Step[] = [];
/** The DevTools targets of the probe already found: a later step looks for a new one. */
const seen = new Set<string>();
let shots = 0;

function log(line: string): void {
  console.log(line);
  appendFileSync(join(folder, "log.txt"), `${line}\n`);
}

function shell(command: string): string {
  return execFileSync(adbPath, ["shell", command], { encoding: "utf8", maxBuffer: 1 << 26 });
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

function chromeFocused(): boolean {
  try {
    return focusedOn(shell("dumpsys window"), CHROME);
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
  log("screen: Chrome without the focus, or without words");
}

/** Tap a node in its middle, and say so in the log. */
function tap(node: Node): void {
  const [x, y] = middle(node);
  log(`tap ${JSON.stringify(node.text || node.description)}`);
  shell(`input tap ${x} ${y}`);
}

/** Tap the first node that matches within the time, and say whether there was one. */
async function tapWhen(match: RegExp | string, seconds: number): Promise<boolean> {
  for (let i = 0; i < seconds; i++) {
    const node = find(screen(), match);
    if (node) {
      tap(node);
      await sleep(1000);
      return true;
    }
    await sleep(1000);
  }
  return false;
}

async function targets(): Promise<Target[]> {
  try {
    const response = await fetch("http://127.0.0.1:9222/json");
    return (await response.json()) as Target[];
  } catch {
    return [];
  }
}

/** A page of the probe that no step has found before: the one the step just opened. */
async function probePage(seconds: number): Promise<Target | undefined> {
  for (let i = 0; i < seconds; i++) {
    const page = (await targets()).find(
      ({ id, type, title, webSocketDebuggerUrl }) =>
        type === "page" && title === TITLE && webSocketDebuggerUrl && !seen.has(id),
    );
    if (page) {
      seen.add(page.id);
      return page;
    }
    await sleep(1000);
  }
  return undefined;
}

/** Evaluate an expression in a page, by one message of the DevTools protocol, within ten seconds:
 * a tab that closes or a socket that drops fails it rather than leaving it waiting. */
async function evaluate(page: Target, expression: string): Promise<unknown> {
  const socket = new WebSocket(page.webSocketDebuggerUrl ?? "");
  let timer: NodeJS.Timeout | undefined;
  try {
    return await new Promise<unknown>((done, fail) => {
      timer = setTimeout(() => fail(new Error("no answer in 10 s")), 10_000);
      socket.onerror = () => fail(new Error("the socket failed"));
      socket.onclose = () => fail(new Error("the socket closed"));
      socket.onopen = () =>
        socket.send(
          JSON.stringify({
            id: 1,
            method: "Runtime.evaluate",
            params: { expression, returnByValue: true },
          }),
        );
      socket.onmessage = (event) => {
        const message = JSON.parse(String(event.data));
        if (message.id !== 1) return;
        if (message.error || message.result?.exceptionDetails) fail(new Error(String(event.data)));
        else done(message.result?.result?.value);
      };
    });
  } finally {
    clearTimeout(timer);
    socket.onclose = null;
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
      log(
        `report ${name}: ${error instanceof Error ? error.message : String(error)}`.slice(0, 200),
      );
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

/** Open a downloaded file the way a person would: by its name in Chrome's list of downloads, or
 * else by Open in Chrome's message of the download, which names no file and so is the second
 * choice; Chrome's menu opens the list when Chrome shows neither. Say which, or "" when none came. */
async function openDownload(file: string): Promise<string> {
  for (let i = 0; i < 60; i++) {
    const all = screen();
    const named = find(all, file);
    if (named) {
      tap(named);
      return "its name in Chrome's list of downloads";
    }
    const away = find(all, AWAY);
    const open = find(all, /^Open$/);
    if (away) {
      tap(away);
    } else if (open) {
      tap(open);
      return "Open in the message of the download";
    } else if (i === 15 || i === 35) {
      const menu = find(all, "Customize and control Google Chrome");
      if (menu) {
        log("no message and no list of the download: Chrome's menu, then Downloads");
        tap(menu);
        await tapWhen("Downloads", 5);
        continue;
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
      tap(away);
      quiet = 0;
    } else {
      quiet += 1;
    }
    await sleep(1000);
  }
  screenshot("warm");
}

/** How many events of a pointer's type a report counted. */
function events(seen: Record<string, unknown> | undefined, type: string): number {
  const pointers = (seen?.pointers ?? {}) as Record<string, { events?: number }>;
  return pointers[type]?.events ?? 0;
}

/** The file with the policy: its report, the storage, the pointers and the saved report. */
async function withPolicy(page: Target): Promise<void> {
  record("read the report of the file with the policy", Boolean(await report(page, "csp-opened")));
  record("tap Write storage", await tapWhen("Write storage", 5));
  const pad = find(screen(), /^Move a pen/);
  if (!pad) {
    record("find the pad on the screen", false);
    return;
  }
  // Within the middle of the pad: a swipe that starts near the screen's edge is Android's gesture
  // of going back, which closes the tab.
  const [left, top, right, bottom] = inner(pad);
  shell(`input touchscreen swipe ${left} ${top} ${right} ${bottom} 600`);
  let stylus = true;
  try {
    shell(`input stylus swipe ${left} ${bottom} ${right} ${top} 600`);
  } catch {
    stylus = false;
  }
  await sleep(1000);
  screenshot("csp-drawn");
  const drawn = await report(page, "csp-drawn");
  record("the page counted the touchscreen", events(drawn, "touch") > 0);
  record(
    "the page counted the stylus as a pen",
    !stylus || events(drawn, "pen") > 0,
    stylus ? "" : "the input tool has no stylus source",
  );
  const saved = await tapWhen("Save report", 5);
  await tapWhen(AWAY, 5);
  record("tap Save report", saved);
  await sleep(2000);
  screenshot("csp-saved");
}

async function main(): Promise<void> {
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
  if (csp) await withPolicy(csp);

  const open = await download(FILES[1]);
  if (open) {
    record(
      "read the report of the file without the policy",
      Boolean(await report(open, "open-opened")),
    );
  }

  shell(`am force-stop ${CHROME}`);
  await sleep(2000);
  if (csp) {
    shell(`am start -a android.intent.action.VIEW -d '${csp.url}' -t text/html -n ${MAIN}`);
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
  const failed = steps.filter(({ ok }) => !ok);
  if (failed.length > 0) {
    throw new Error(
      `${failed.length} step(s) failed: ${failed.map(({ step }) => step).join("; ")}`,
    );
  }
}

if (import.meta.main) {
  main()
    .catch((error) => {
      log(`error: ${String(error)}`);
      try {
        screenshot("error");
      } catch {
        // No screen to take: the error above says why.
      }
      process.exitCode = 1;
    })
    .finally(() => {
      writeFileSync(join(folder, "steps.json"), `${JSON.stringify(steps, null, 2)}\n`);
    });
}
