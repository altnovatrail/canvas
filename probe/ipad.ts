// The probe of a page opened from a file in the iPad Simulator (T80 in RUN.md; R54 in
// docs/decisions.md). probe/ipad.sh runs it on a runner of macOS, once the simulator is booted,
// WebDriverAgent answers on its port and probe/serve.ts hands the probe's files out:
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
// simulator's id (UDID, the booted one by default), WebDriverAgent's address (WDA) and the
// server's port (PORT); it installs nothing.

import { execFileSync } from "node:child_process";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

/** The probe's files, as probe/build.ts names them. */
const FILES = ["t29-probe-csp.html", "t29-probe-open.html"] as const;
const SAFARI = "com.apple.mobilesafari";
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

/** The probe's report, where the tree shows it: the words of its block of JSON, parsed. */
export function reportOf(all: readonly Element[]): Record<string, unknown> | undefined {
  for (const word of all.flatMap((element) => element.words)) {
    if (!word.trimStart().startsWith("{") || !word.includes('"probe"')) continue;
    try {
      return JSON.parse(word) as Record<string, unknown>;
    } catch {
      // Not the whole block: another element may hold it.
    }
  }
  return undefined;
}

/** Where the run leaves what it found: the folder the workflow keeps as its artifact. */
const folder = "build/probe-ipad";
const agent = process.env.WDA ?? "http://127.0.0.1:8100";
const udid = process.env.UDID ?? "booted";
const port = process.env.PORT ?? "8080";
const steps: { step: string; ok: boolean; note: string }[] = [];
const findings: Record<string, string> = {};
let session = "";
let shots = 0;

/** A line of the log, on one line: a break in it would make a line the run never wrote. */
function log(line: string): void {
  const one = line.replace(/[\n\r]/g, " ");
  console.log(one);
  appendFileSync(join(folder, "log.txt"), `${one}\n`);
}

function record(step: string, ok: boolean, note = ""): void {
  steps.push({ step, ok, note });
  log(`${ok ? "ok  " : "FAIL"} ${step}${note ? ` — ${note}` : ""}`);
}

/** One call of WebDriverAgent's HTTP, its `value` back. */
async function call(method: string, path: string, body?: unknown): Promise<unknown> {
  const response = await fetch(`${agent}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });
  const answer = (await response.json()) as { value?: unknown; sessionId?: string };
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status}`);
  if (answer.sessionId) session = answer.sessionId;
  return answer.value;
}

/** A session on an app, which WebDriverAgent starts or brings to the front. */
async function open(bundleId: string): Promise<void> {
  await call("POST", "/session", {
    capabilities: { alwaysMatch: { bundleId, shouldWaitForQuiescence: false } },
  });
  await sleep(3000);
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
  execFileSync("xcrun", ["simctl", "io", udid, "screenshot", file], { stdio: "ignore" });
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

async function tap(element: Element): Promise<void> {
  const [x, y] = centre(element);
  log(`tap ${JSON.stringify(element.words[0] ?? element.type)} at ${x},${y}`);
  await call("POST", `/session/${session}/wda/tap`, { x, y });
  await sleep(1500);
}

/** Tap the first element that matches within the time, and say whether there was one. */
async function tapWhen(match: RegExp | string, seconds: number): Promise<boolean> {
  for (let i = 0; i < seconds; i++) {
    const element = locate(await screen(), match);
    if (element) {
      await tap(element);
      return true;
    }
    await sleep(1000);
  }
  return false;
}

/** Wait until the page's first line can be read, and say what it says. */
async function pageState(seconds: number): Promise<ReturnType<typeof scriptState>> {
  for (let i = 0; i < seconds; i++) {
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
  await sleep(3000);
  const asked = await look(`download-${file}`);
  findings[`question of ${file}`] =
    locate(asked, /^Download$/) && locate(asked, /^View$/)
      ? "Download or View"
      : locate(asked, /^Download$/)
        ? "Download"
        : "none";
  record(`download ${file} in Safari`, await tapWhen(/^Download$/, 10));
  await look(`downloaded-${file}`);
}

/** Open a downloaded file from Safari's list of downloads, and say what its page shows. */
async function fromSafari(file: string, name: string): Promise<string> {
  await open(SAFARI);
  const opened =
    (await tapWhen(/^Downloads$/, 10)) &&
    (await tapWhen(new RegExp(`^${file.replace(/\./g, "\\.")}`), 10));
  record(`open ${file} from Safari's downloads`, opened);
  const state = opened ? await pageState(20) : "unseen";
  await look(name);
  findings[`${file} from Safari's downloads`] = state;
  return state;
}

/** Open a downloaded file from the Files app: Browse, On My iPad, Downloads, the file. */
async function fromFiles(file: string, name: string): Promise<string> {
  await open(FILES_APP);
  await tapWhen(/^Browse$/, 10);
  const place = (await tapWhen(/^On My iPad$/, 10)) && (await tapWhen(/^Downloads$/, 10));
  const base = file.replace(/\.html$/, "");
  const opened = place && (await tapWhen(new RegExp(`^${base.replace(/\./g, "\\.")}`), 10));
  record(`open ${file} from the Files app`, opened);
  const state = opened ? await pageState(20) : "unseen";
  await look(name);
  findings[`${file} from the Files app`] = state;
  return state;
}

/** Where the page ran: the storage, the pointer and the saved report, as on Android. */
async function onPage(file: string): Promise<void> {
  const first = reportOf(await look(`${file}-report`));
  record(`read the report of ${file}`, Boolean(first));
  if (first)
    writeFileSync(join(folder, `report-${file}.json`), `${JSON.stringify(first, null, 2)}\n`);
  record(`tap Write storage in ${file}`, await tapWhen("Write storage", 5));
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
  record(`tap Save report in ${file}`, await tapWhen("Save report", 5));
  await tapWhen(/^Download$/, 5);
  await look(`${file}-saved`);
}

async function main(): Promise<void> {
  mkdirSync(folder, { recursive: true });
  const status = await call("GET", "/status");
  writeFileSync(join(folder, "agent.json"), `${JSON.stringify(status, null, 2)}\n`);

  for (const file of FILES) await download(file);
  const viaSafari = await fromSafari(FILES[0], "csp-from-safari");
  if (viaSafari === "ran") await onPage(FILES[0]);
  const viaFiles = await fromFiles(FILES[0], "csp-from-files");
  if (viaFiles === "ran" && viaSafari !== "ran") await onPage(FILES[0]);
  if (viaSafari === "ran" || viaFiles === "ran") {
    const open = await fromSafari(FILES[1], "open-from-safari");
    if (open === "ran") {
      const other = reportOf(await look("open-report"));
      if (other)
        writeFileSync(
          join(folder, `report-${FILES[1]}.json`),
          `${JSON.stringify(other, null, 2)}\n`,
        );
      record(`read the report of ${FILES[1]}`, Boolean(other));
    }
    await call("POST", `/session/${session}/wda/apps/terminate`, { bundleId: SAFARI });
    if ((await fromSafari(FILES[0], "csp-after-restart")) === "ran") {
      const again = reportOf(await look("csp-after-restart-report"));
      if (again)
        writeFileSync(
          join(folder, "report-after-restart.json"),
          `${JSON.stringify(again, null, 2)}\n`,
        );
      record("read the report after Safari stopped", Boolean(again));
    }
  }
  const failed = steps.filter(({ ok }) => !ok);
  if (failed.length > 0) throw new Error(`${failed.length} step(s) failed`);
}

if (import.meta.main) {
  main()
    .catch((error) => {
      log(`error: ${String(error)}`);
      process.exitCode = 1;
    })
    .finally(() => {
      writeFileSync(join(folder, "steps.json"), `${JSON.stringify(steps, null, 2)}\n`);
      writeFileSync(join(folder, "findings.json"), `${JSON.stringify(findings, null, 2)}\n`);
    });
}
