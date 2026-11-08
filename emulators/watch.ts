// What the drivers of the samples page watch in it (T78 in RUN.md; R54 in docs/decisions.md), in
// Chrome on Android and in Safari in the iPad Simulator alike: the policy's violations, the page's
// errors, the requests it made and the files it handed to a download. The watch is a script the
// driver puts into the page — before its own on Android, through DevTools, and once it has loaded
// in Safari, through WebDriver — and a driver's script runs outside the page's policy. Violations
// from before it came are the buffered reports of a ReportingObserver, which Chrome and WebKit keep
// for a page from its start. Nothing of the page's own changes: the spy on URL.createObjectURL
// only keeps a copy of the text of each blob it is given.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

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

/** The watch, as a script of its own: it runs once in a page. */
export const WATCH = `(() => {
  if (window.__canvasWatch) return;
  const watch = { reports: [], events: [], blocked: [], errors: 0, blobs: [], reporting: true };
  const blocked = (address) => watch.blocked.push(String(address ?? "").slice(0, 60));
  window.__canvasWatch = watch;
  try {
    new ReportingObserver((list) => {
      for (const report of list) {
        watch.reports.push(String(report.body?.effectiveDirective ?? report.type));
        blocked(report.body?.blockedURL);
      }
    }, { types: ["csp-violation"], buffered: true }).observe();
  } catch {
    watch.reporting = false;
  }
  document.addEventListener("securitypolicyviolation", (event) => {
    watch.events.push(event.effectiveDirective);
    blocked(event.blockedURI);
  }, true);
  addEventListener("error", () => { watch.errors += 1; });
  addEventListener("unhandledrejection", () => { watch.errors += 1; });
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
    reports: watch?.reports ?? [],
    events: watch?.events ?? [],
    blocked: watch?.blocked ?? [],
    errors: watch?.errors ?? 0,
    reporting: watch?.reporting ?? false,
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
  readonly reports: readonly string[];
  readonly events: readonly string[];
  /** The start of each address the policy stopped, for the run's artifact. */
  readonly blocked: readonly string[];
  readonly errors: number;
  readonly reporting: boolean;
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

/** The checks of what the page did over the whole run, each a step of the page's own: no
 * violation of its policy, no error, no request, and a watch that saw it all. */
export function verdicts(
  seen: Seen,
  requests: readonly string[],
): { step: string; ok: boolean; note: string }[] {
  const violations = [...seen.reports, ...seen.events];
  return [
    {
      step: "the watch saw the page, its policy's reports included",
      ok: seen.watched && seen.reporting,
      note: seen.reporting ? "" : "no ReportingObserver",
    },
    {
      step: "the policy saw no violation",
      ok: violations.length === 0,
      // A directive's name, in its own letters only: what the page reported goes to the log.
      note: violations.length
        ? `${violations.length}: ${[...new Set(violations.map((name) => name.replace(/[^a-z-]/g, "")))].join(", ")}`
        : "",
    },
    {
      step: "the page threw no error",
      ok: seen.errors === 0,
      note: seen.errors ? `${seen.errors}` : "",
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
