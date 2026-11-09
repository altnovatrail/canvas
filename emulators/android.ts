// An Android emulator and the Chrome on it, as the drivers of the probe (T74 in RUN.md) and of the
// samples page (T78) use them (R54 in docs/decisions.md). They run in the toolchain stage's
// container on the runner's network, once android-emulator-runner has the emulator up, with the
// runner's adb mounted in (emulators/android.sh). A driver taps what a person would tap, by the
// bounds uiautomator gives each node on the screen, and reads the page through Chrome's DevTools
// socket, which adb forwards to port 9222. Screenshots go into the run's folder.

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import type { Run } from "./run.ts";
import { until } from "./wait.ts";

/** Chrome's package, and the activity a VIEW intent starts it at. */
export const CHROME = "com.android.chrome";
const MAIN = `${CHROME}/com.google.android.apps.chrome.Main`;
/** The flags that keep Chrome's first run from standing in the way, as Chrome reads them on a
 * debuggable image from this file; and its bubbles of help over a page opened from a download,
 * enabled by default in Chrome 133 (components/feature_engagement/public/feature_constants.cc,
 * tag 133.0.6943.137): uiautomator reads the bubble's window alone, and the page's button under it
 * was not found for fifty seconds (T83). */
const FLAGS =
  "_ --disable-fre --no-default-browser-check --no-first-run --disable-features=IPH_CCTMinimized,IPH_CCTHistory";
/** Answers that let a download go on or put Chrome's offers away, as a person would give them:
 * Chrome may ask before it downloads a file of some types or over plain HTTP, and on its first run
 * it offers notifications. */
export const AWAY = /^(Download|Download anyway|Keep|No thanks|Don.t allow|Not now|Got it)$/i;
/** Where the emulator reaches the runner's server: its own loopback, whose port emulators/android.sh
 * hands over to the runner's by `adb reverse`. */
export const HOST = "localhost";

/** A node of uiautomator's dump: its text, its description, its bounds on the screen and, where
 * the dump names it, its class. */
export interface Node {
  readonly text: string;
  readonly description: string;
  readonly bounds: readonly [number, number, number, number];
  readonly className?: string;
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
      ...(attribute("class") ? { className: attribute("class") } : {}),
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

/** Whether the window that has the focus is the app's, as `dumpsys window` names it: a cold start
 * of Chrome leaves the launcher on the screen for a while. */
export function focusedOn(dump: string, app: string): boolean {
  const focus = /mCurrentFocus=Window\{[^}]*\}/.exec(dump)?.[0] ?? "";
  return focus.includes(`${app}/`);
}

/** A box of the page in its own CSS pixels, as getBoundingClientRect gives it. */
export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** How the page's CSS pixels lie on the screen, from one element seen both ways: its box in the
 * page, and its node's bounds on the screen. */
export function calibrate(
  box: Box,
  { bounds: [x1, y1, x2] }: Node,
): (x: number, y: number) => [number, number] {
  const scale = (x2 - x1) / box.width;
  return (x, y) => [Math.round(x1 + (x - box.x) * scale), Math.round(y1 + (y - box.y) * scale)];
}

/** The class Chrome gives the node of a page's own view in the tree of accessibility. */
export const PAGE_VIEW = "android.webkit.WebView";

/** The node of the page's own view: a node of Chrome itself, whose bounds hold even while the tree
 * of the page inside it lags behind a scroll — on a first pass it still showed the top of the page
 * when the page had scrolled to its foot (T20). */
export function pageView(all: readonly Node[]): Node | undefined {
  return all.find(
    ({ className, bounds: [x1, y1, x2, y2] }) => className === PAGE_VIEW && x2 > x1 && y2 > y1,
  );
}

/** How the page's CSS pixels lie on the screen, from its view's bounds and the page's ratio of
 * device pixels: a box the page gives is from the corner of its view, as getBoundingClientRect has it. */
export function placed(view: Node, ratio: number): (x: number, y: number) => [number, number] {
  const [x1, y1] = view.bounds;
  return (x, y) => [Math.round(x1 + x * ratio), Math.round(y1 + y * ratio)];
}

/** A DevTools target of Chrome, as /json lists it. */
export interface Target {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly url: string;
  readonly webSocketDebuggerUrl?: string;
}

/** A session of the DevTools protocol with one page: commands, each answered within ten seconds,
 * and the events the page sends meanwhile. A tab that closes or a socket that drops fails what
 * waits rather than leaving it waiting. */
export class DevTools {
  private readonly socket: WebSocket;
  private readonly waiting = new Map<number, (message: Record<string, unknown>) => void>();
  private readonly listeners: ((method: string, params: Record<string, unknown>) => void)[] = [];
  private next = 0;
  private broken = "";

  private constructor(socket: WebSocket) {
    this.socket = socket;
    socket.onmessage = (event) => {
      const message = JSON.parse(String(event.data)) as Record<string, unknown>;
      if (typeof message.id === "number") {
        // The command it answers, matched among those waiting: an id from the socket picks
        // nothing to call by itself.
        for (const [id, answer] of this.waiting) if (id === message.id) answer(message);
      } else {
        for (const listen of this.listeners)
          listen(String(message.method), message.params as Record<string, unknown>);
      }
    };
    const fail = (why: string) => () => {
      this.broken = why;
      for (const answer of this.waiting.values()) answer({ error: why });
    };
    socket.onerror = fail("the socket failed");
    socket.onclose = fail("the socket closed");
  }

  /** A session with a page, once its socket is open. */
  static async open(page: Target): Promise<DevTools> {
    const socket = new WebSocket(page.webSocketDebuggerUrl ?? "");
    await new Promise<void>((done, fail) => {
      const timer = setTimeout(() => fail(new Error("no socket in 10 s")), 10_000);
      socket.onopen = () => {
        clearTimeout(timer);
        done();
      };
      socket.onerror = () => {
        clearTimeout(timer);
        fail(new Error("the socket failed"));
      };
    });
    return new DevTools(socket);
  }

  /** Listen to the page's events. */
  on(listen: (method: string, params: Record<string, unknown>) => void): void {
    this.listeners.push(listen);
  }

  /** One command, its result back. What the page answered stays out of any error's message. */
  async send(
    method: string,
    params: Record<string, unknown> = {},
  ): Promise<Record<string, unknown>> {
    if (this.broken) throw new Error(this.broken);
    this.next += 1;
    const id = this.next;
    let timer: NodeJS.Timeout | undefined;
    try {
      const message = await new Promise<Record<string, unknown>>((done) => {
        timer = setTimeout(() => done({ error: "no answer in 10 s" }), 10_000);
        this.waiting.set(id, done);
        this.socket.send(JSON.stringify({ id, method, params }));
      });
      if (message.error) {
        throw new Error(typeof message.error === "string" ? message.error : `${method} failed`);
      }
      return (message.result ?? {}) as Record<string, unknown>;
    } finally {
      clearTimeout(timer);
      this.waiting.delete(id);
    }
  }

  /** The value of an expression in the page; an exception it throws fails it. */
  async evaluate(expression: string): Promise<unknown> {
    const result = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) throw new Error("the page threw");
    return (result.result as { value?: unknown } | undefined)?.value;
  }

  close(): void {
    this.socket.onclose = null;
    this.socket.close();
  }
}

/** The emulator, through the runner's adb, and the run that journals what is done on it. */
export class Android {
  readonly run: Run;
  private readonly adb: string;
  private shots = 0;

  constructor(run: Run, adb = process.env.ADB ?? "adb") {
    this.run = run;
    this.adb = adb;
  }

  shell(command: string): string {
    return execFileSync(this.adb, ["shell", command], { encoding: "utf8", maxBuffer: 1 << 26 });
  }

  /** Copy a file off the device. */
  pull(from: string, to: string): void {
    execFileSync(this.adb, ["pull", from, to], { stdio: "ignore" });
  }

  /** The last dump of the screen, kept in the run's folder: what uiautomator read when a step
   * failed, for the next look at why. */
  keepDump(name: string): void {
    try {
      writeFileSync(
        join(this.run.folder, `${name}-ui.xml`),
        this.shell("cat /sdcard/ui.xml 2>/dev/null"),
      );
    } catch {
      this.run.log(`no dump ${name}`);
    }
  }

  screenshot(name: string): void {
    this.shots += 1;
    const png = execFileSync(this.adb, ["exec-out", "screencap", "-p"], { maxBuffer: 1 << 28 });
    writeFileSync(join(this.run.folder, `${String(this.shots).padStart(2, "0")}-${name}.png`), png);
  }

  /** The nodes on the screen, or none while uiautomator cannot read it: it gives no root node
   * while an app changes its window, and then writes no file. */
  screen(): Node[] {
    try {
      this.shell("rm -f /sdcard/ui.xml; uiautomator dump /sdcard/ui.xml > /dev/null 2>&1");
      return nodes(this.shell("cat /sdcard/ui.xml 2>/dev/null"));
    } catch {
      return [];
    }
  }

  /** What the screen shows in words, for the log: the texts and descriptions of its nodes. */
  static words(all: readonly Node[]): string {
    return JSON.stringify(
      all.map(({ text, description }) => text || description).filter((word) => word !== ""),
    );
  }

  private chromeFocused(): boolean {
    try {
      return focusedOn(this.shell("dumpsys window"), CHROME);
    } catch {
      return false;
    }
  }

  /** Wait until Chrome has the focus, and say whether it came. */
  async focused(seconds: number): Promise<boolean> {
    if (await until(seconds, () => this.chromeFocused())) return true;
    this.run.log("Chrome without the focus");
    return false;
  }

  /** Wait until Chrome has the focus and shows more than its splash: a screen with words on it. */
  async settle(seconds: number): Promise<void> {
    const all = await until(seconds, () => {
      const shown = this.chromeFocused() ? this.screen() : [];
      return shown.some(({ text, description }) => text || description) && shown;
    });
    this.run.log(
      all
        ? `screen ${Android.words(all).slice(0, 600)}`
        : "screen: Chrome without the focus, or without words",
    );
  }

  /** Tap a node in its middle, and say so in the log. */
  tap(node: Node): void {
    const [x, y] = middle(node);
    this.run.log(`tap ${JSON.stringify(node.text || node.description)}`);
    this.shell(`input tap ${x} ${y}`);
  }

  /** Tap the first node that matches within the time, and say whether there was one. */
  async tapWhen(match: RegExp | string, seconds: number): Promise<boolean> {
    const node = await until(seconds, () => find(this.screen(), match));
    if (!node) return false;
    this.tap(node);
    await sleep(1000);
    return true;
  }

  /** Open an address in Chrome, by a VIEW intent. */
  view(address: string, type = ""): void {
    this.shell(
      `am start -a android.intent.action.VIEW -d '${address}'${type ? ` -t ${type}` : ""} -n ${MAIN}`,
    );
  }

  stopChrome(): void {
    this.shell(`am force-stop ${CHROME}`);
  }

  /** What the run ran on, into device.json; and Chrome made ready: its first run's flags, then
   * one start on an empty page with its offers put away, so that the driver's steps meet the
   * browser a volunteer has used before. */
  async prepare(): Promise<boolean> {
    const facts = {
      android: this.shell("getprop ro.build.version.release").trim(),
      sdk: this.shell("getprop ro.build.version.sdk").trim(),
      debuggable: this.shell("getprop ro.debuggable").trim(),
      chrome: /versionName=(\S+)/.exec(this.shell(`dumpsys package ${CHROME}`))?.[1] ?? "absent",
      size: this.shell("wm size").trim(),
    };
    writeFileSync(join(this.run.folder, "device.json"), `${JSON.stringify(facts, null, 2)}\n`);
    this.run.log(`device ${JSON.stringify(facts)}`);
    if (facts.chrome === "absent") return false;
    this.shell(`echo "${FLAGS}" > /data/local/tmp/chrome-command-line`);
    this.shell(`am set-debug-app --persistent ${CHROME}`);
    this.stopChrome();
    this.view("about:blank");
    // Chrome in front is enough: an empty page shows no words to wait for, and a wait for words
    // took the whole two minutes of every run (T81).
    await this.focused(120);
    // Its offers put away until three looks in a row find none.
    let quiet = 0;
    await until(30, () => {
      const away = find(this.screen(), AWAY);
      if (away) {
        this.tap(away);
        quiet = 0;
      } else {
        quiet += 1;
      }
      return quiet >= 3;
    });
    this.screenshot("warm");
    return true;
  }

  /** Open a downloaded file the way a person would: by its name in Chrome's list of downloads,
   * or else by Open in Chrome's message of the download, which names no file and so is the second
   * choice; Chrome's menu opens the list when Chrome shows neither. Say which, or "" when none
   * came. */
  async openDownload(file: string): Promise<string> {
    const start = Date.now();
    // The seconds after which Chrome's menu is tried, each once, while neither has come: as late
    // as the fifteenth and thirty-fifth tries of uiautomator came before (T83).
    const menuAt = [45, 90];
    const how = await until(120, async () => {
      const all = this.screen();
      const named = find(all, file);
      if (named) {
        this.tap(named);
        return "its name in Chrome's list of downloads";
      }
      const away = find(all, AWAY);
      const open = find(all, /^Open$/);
      if (away) {
        this.tap(away);
      } else if (open) {
        this.tap(open);
        return "Open in the message of the download";
      } else if (menuAt.length > 0 && Date.now() - start >= (menuAt[0] ?? 0) * 1000) {
        menuAt.shift();
        const menu = find(all, "Customize and control Google Chrome");
        if (menu) {
          this.run.log("no message and no list of the download: Chrome's menu, then Downloads");
          this.tap(menu);
          await this.tapWhen("Downloads", 5);
        }
      }
      return undefined;
    });
    if (how) return how;
    this.run.log(`screen ${Android.words(this.screen()).slice(0, 600)}`);
    return "";
  }
}

/** Chrome's DevTools targets, or none while the socket does not answer. */
export async function targets(): Promise<Target[]> {
  try {
    const response = await fetch("http://127.0.0.1:9222/json");
    return (await response.json()) as Target[];
  } catch {
    return [];
  }
}

/** A page of a title that is not among those already seen — the one a step just opened — within
 * the time; it joins those seen. */
export async function newPage(
  title: string,
  seen: Set<string>,
  seconds: number,
): Promise<Target | undefined> {
  const page = await until(seconds, async () =>
    (await targets()).find(
      ({ id, type, title: own, webSocketDebuggerUrl }) =>
        type === "page" && own === title && webSocketDebuggerUrl && !seen.has(id),
    ),
  );
  if (page) seen.add(page.id);
  return page;
}
