// What the drivers of the samples page watch in it (T78 in RUN.md; R54 in docs/decisions.md), in
// Chrome on Android and in Safari in the iPad Simulator alike: the policy's violations, the page's
// errors, the requests it made and the files it handed to a download. The watch is a script that
// runs before the page's own: on Android DevTools puts it into the page, and for Safari, which no
// WebDriver lets a script into before the page's own, it is written into a copy of the page,
// its hash beside the script's in the policy (watched()). A driver's own scripts run outside the
// page's policy. Nothing of the page's own changes: the spy on URL.createObjectURL only keeps a
// copy of the text of each blob it is given.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { hash } from "../scripts/csp.ts";

/** The page's title, by which its DevTools target is found. */
export const TITLE = "NovaTrail — страница образцов";
/** The save button's text, as the screen shows it. */
export const SAVE = "Сохранить образец (без разметки)";
/** The tasks the build offers, and the one of the workbook among them (scripts/page.ts). */
export const TASKS = 3;
export const WORKBOOK = "2";

/** The build the workflow's build job wrote with scripts/page.ts. */
export const BUILD = "build/page";

/** The page's one file among a build's. */
export function pageIn(names: readonly string[]): string {
  const [file, ...more] = names.filter((name) => /^samples-page_v.+\.html$/.test(name));
  if (!file || more.length > 0) throw new Error("the build holds not one page");
  return file;
}

/** The page's one file in the build. */
export function pageFile(): string {
  return pageIn(readdirSync(BUILD));
}

/** The watch, as a script of its own: it runs once in a page, before the page's own. */
export const WATCH = `(() => {
  if (window.__canvasWatch) return;
  const watch = { violations: [], errors: [], blobs: [] };
  window.__canvasWatch = watch;
  document.addEventListener("securitypolicyviolation", (event) => {
    watch.violations.push({ directive: event.effectiveDirective, blocked: String(event.blockedURI).slice(0, 80) });
  }, true);
  addEventListener("error", (event) => { watch.errors.push(String(event.message).slice(0, 200)); });
  addEventListener("unhandledrejection", (event) => { watch.errors.push(String(event.reason).slice(0, 200)); });
  const create = URL.createObjectURL.bind(URL);
  URL.createObjectURL = (blob) => {
    if (blob instanceof Blob) {
      const at = watch.blobs.push(null) - 1;
      blob.text().then((text) => { watch.blobs[at] = text; });
    }
    return create(blob);
  };
})();`;

/** What the page shows and what the watch has seen, as one expression's JSON. */
export const READ = `JSON.stringify((() => {
  const watch = window.__canvasWatch;
  const sheet = document.querySelector("novatrail-canvas");
  return {
    watched: Boolean(watch),
    defined: customElements.get("novatrail-canvas") !== undefined,
    tasks: document.querySelectorAll("#task option").length,
    task: document.getElementById("task")?.value ?? "",
    strokes: sheet && Array.isArray(sheet.history) ? sheet.history.length : -1,
    resources: performance.getEntriesByType("resource").map((entry) => entry.name),
    violations: watch?.violations ?? [],
    errors: watch?.errors ?? [],
    blobs: watch?.blobs.length ?? 0,
  };
})())`;

/** The box of an element of the page, by a selector, in the page's CSS pixels, as JSON. */
export function boxOf(selector: string): string {
  return `JSON.stringify((() => {
  const box = document.querySelector(${JSON.stringify(selector)})?.getBoundingClientRect();
  return box ? { x: box.x, y: box.y, width: box.width, height: box.height, view: innerHeight } : null;
})())`;
}

/** The text of the blob the page handed out at an index, once it is read; null before. */
export function blobAt(index: number): string {
  return `window.__canvasWatch?.blobs[${index}] ?? null`;
}

/** A script that shows the workbook's page: the picker's choice, as a person makes it. It waits
 * a moment, for the page's confirm stops the script that calls it until it is answered. */
export const TO_WORKBOOK = `setTimeout(() => {
  const picker = document.getElementById("task");
  picker.value = ${JSON.stringify(WORKBOOK)};
  picker.dispatchEvent(new Event("change"));
}, 0)`;

/** What READ gives. */
export interface Seen {
  readonly watched: boolean;
  readonly defined: boolean;
  readonly tasks: number;
  readonly task: string;
  readonly strokes: number;
  readonly resources: readonly string[];
  /** Each violation of the policy: its directive, and the start of the address it stopped. */
  readonly violations: readonly { readonly directive: string; readonly blocked: string }[];
  /** The message of each error, for the run's artifact. */
  readonly errors: readonly string[];
  readonly blobs: number;
}

/** A box in CSS pixels, and the height of the window it is seen in. */
export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly view: number;
}

/** A stroke inside the part of an element the window shows: from a point a fifth into it to one
 * a little lower and to the right, as in the build's own test. */
export function strokeIn(box: Box): [[number, number], [number, number]] {
  const top = Math.max(box.y, 0);
  const bottom = Math.min(box.y + box.height, box.view);
  const from: [number, number] = [box.x + box.width * 0.2, top + (bottom - top) * 0.3];
  const to: [number, number] = [box.x + box.width * 0.4, top + (bottom - top) * 0.5];
  const round = ([x, y]: [number, number]): [number, number] => [Math.round(x), Math.round(y)];
  return [round(from), round(to)];
}

/** A request the page made, among the addresses it asked for: anything but its own blobs and
 * data, and the file it came from. */
export function outside(addresses: readonly string[], own: readonly string[] = []): string[] {
  return addresses.filter(
    (address) =>
      !address.startsWith("blob:") && !address.startsWith("data:") && !own.includes(address),
  );
}

/** Of the server's log, the requests other than the download of the page itself: the page's, or
 * the browser's own icon of a site, which says nothing of the page and is named apart. */
export function asked(
  lines: readonly string[],
  file: string,
): { readonly others: string[]; readonly icons: string[] } {
  const requests = lines.filter((line) => /^[A-Z?]+ \S+ \d{3}$/.test(line));
  const others = requests.filter((line) => !line.startsWith(`GET /${file} `));
  const icon = (line: string) => / \/(favicon\.ico|apple-touch-icon[\w-]*\.png) \d{3}$/.test(line);
  return { others: others.filter((line) => !icon(line)), icons: others.filter(icon) };
}

/** A site's icon, which a browser asks for of itself: Safari asks for it of a page from a server,
 * and the page's policy stops it as any picture not of a blob. It says nothing of the page. */
const ICON = /\/(favicon\.ico|apple-touch-icon[\w-]*\.png)$/;

/** The checks of what the page did over the whole run, each a step of the page's own: no
 * violation of its policy but the browser's own icon, no error, no request, and a watch that saw
 * it all. */
export function verdicts(
  seen: Seen,
  requests: readonly string[],
): { step: string; ok: boolean; note: string }[] {
  const own = seen.violations.filter(({ blocked }) => !ICON.test(blocked));
  const icons = seen.violations.length - own.length;
  // A directive's name, in its own letters only: what the page reported goes to the log.
  const names = [...new Set(own.map(({ directive }) => directive.replace(/[^a-z-]/g, "")))];
  const notes = [
    own.length ? `${own.length}: ${names.join(", ")}` : "",
    icons ? "the browser's icon stopped" : "",
  ];
  return [
    { step: "the watch saw the page from its start", ok: seen.watched, note: "" },
    {
      step: "the policy saw no violation",
      ok: own.length === 0,
      note: notes.filter(Boolean).join("; "),
    },
    {
      step: "the page threw no error",
      ok: seen.errors.length === 0,
      note: seen.errors.length ? `${seen.errors.length}, in watch.json` : "",
    },
    {
      step: "the page asked for nothing outside its file",
      ok: requests.length === 0,
      note: requests.length ? `${requests.length} request(s), in watch.json` : "",
    },
  ];
}

/** The step of the server's log, in the run's folder: it was asked for nothing but the page. */
export function served(folder: string, file: string): { step: string; ok: boolean; note: string } {
  const { others, icons } = asked(
    readFileSync(join(folder, "server.txt"), "utf8").split("\n"),
    file,
  );
  const notes = [
    others.length ? `${others.length} other request(s)` : "",
    icons.length ? "the browser's icon" : "",
  ];
  return {
    step: "the server was asked for nothing but the page",
    ok: others.length === 0,
    note: notes.filter(Boolean).join("; "),
  };
}

/** The page with the watch in it before the page's own script, and the watch's hash beside the
 * script's in its policy: nothing else of it changes. Safari in the simulator opens this copy,
 * since no WebDriver of it can put a script into a page before the page's own runs, and a
 * violation of the page's first moment would go unseen: Safari's ReportingObserver gives no
 * report from before it came (T78). */
export function watched(page: string): string {
  const at = page.indexOf("<script>");
  if (at < 0 || page.indexOf("<script>", at + 1) >= 0)
    throw new Error("the page has not one script");
  // A page without a policy of scripts — a build gone wrong — takes the watch as it is.
  const policy = page.indexOf("script-src ");
  const allowed = policy + "script-src ".length;
  const withHash =
    policy < 0 ? page : `${page.slice(0, allowed)}${hash(WATCH)} ${page.slice(allowed)}`;
  const shifted = withHash.indexOf("<script>");
  return `${withHash.slice(0, shifted)}<script>${WATCH}</script>${withHash.slice(shifted)}`;
}

if (import.meta.main) {
  const [from, to, ...rest] = process.argv.slice(2);
  if (!from || !to || rest.length > 0) {
    console.error("usage: node emulators/watch.ts <build> <folder>");
    process.exit(2);
  }
  const file = pageIn(readdirSync(from));
  mkdirSync(to, { recursive: true });
  writeFileSync(join(to, file), watched(readFileSync(join(from, file), "utf8")));
  console.log(join(to, file));
}
