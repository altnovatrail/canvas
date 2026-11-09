// What the drivers of the samples page watch in it (T78 in RUN.md; R54 in docs/decisions.md), in
// Chrome on Android and in Safari in the iPad Simulator alike: the policy's violations, the page's
// errors, the requests it made and the files it handed to a download. The watch is a script that
// runs before the page's own: on Android DevTools puts it into the page, and for Safari, which no
// WebDriver lets a script into before the page's own, it is written into a copy of the page,
// its hash beside the script's in the policy (watched()). A driver's own scripts run outside the
// page's policy. Nothing of the page's own changes: the spies on Blob and URL.createObjectURL only
// keep a copy of the text of each blob the page hands to a link.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { hash } from "../scripts/csp.ts";

/** The page's title, by which its DevTools target is found. */
export const TITLE = "NovaTrail — страница образцов";
/** The save button's text, as the screen shows it. */
export const SAVE = "Сохранить образец";
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
  // The text of a blob made of strings, kept as it is made: reading the blob back races Safari's
  // download of it, which fails the read (T78).
  const texts = new WeakMap();
  const Native = Blob;
  window.Blob = class extends Native {
    // A blob the browser makes — of a fetch, a canvas, a file — is still a Blob to the page.
    static [Symbol.hasInstance](value) {
      return value instanceof Native;
    }
    constructor(parts, options) {
      super(parts, options);
      if (Array.isArray(parts) && parts.every((part) => typeof part === "string")) texts.set(this, parts.join(""));
    }
  };
  const create = URL.createObjectURL.bind(URL);
  // Only a blob of text is a file the page saves: a crop it shows is a picture, made by a canvas.
  URL.createObjectURL = (blob) => {
    const text = blob instanceof Native ? texts.get(blob) : undefined;
    if (text !== undefined) watch.blobs.push(text);
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
    policy: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content ?? "",
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

/** The text of the blob the page handed out at an index; null when there is none. */
export function blobAt(index: number): string {
  return `window.__canvasWatch?.blobs[${index}] ?? null`;
}

/** A script that shows the workbook's page: the picker's choice, as a person makes it. It waits
 * a moment, for the page's confirm stops the script that calls it until it is answered. */
/** A script that asks the page for the markup, as the writer presses its button: the form comes
 * once the element has given its work. */
export const MARKUP = `(document.getElementById("markup").click(), 0)`;

/** Whether the form of the markup is shown. */
export const MARKING = `document.getElementById("form").hidden === false`;

/** A script that marks the writing up as a writer would, through the page's own form, and says
 * whether the page will save it then. On a sheet the parts join into one, the final answer, «2»;
 * on a workbook each filled box is «5». The nothing personal on the sheet is said too. */
export const MARK = `(() => {
  const input = (field, value) => {
    field.value = value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
  };
  const join = () => document.querySelector('[data-part="0"] [data-act="join"]');
  for (let button = join(); button && !button.disabled; button = join()) button.click();
  const text = document.querySelector('[data-part="0"] textarea');
  if (text) {
    input(text, "x = 2");
    const final = document.querySelector('[data-part="0"] input[data-flag="finalAnswer"]');
    if (!final.checked) final.click();
    input(document.getElementById("answer"), "2");
  }
  for (const value of document.querySelectorAll('[data-box] input[data-field="value"]')) input(value, "5");
  const personal = document.getElementById("personal");
  if (!personal.checked) personal.click();
  return !document.getElementById("save").disabled;
})()`;

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
  /** The policy the page's <meta> gives, or "" when it has none. */
  readonly policy: string;
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
 * a little lower and to the right, as in the build's own test; none when the window shows less
 * than a strip of it. */
export function strokeIn(box: Box): [[number, number], [number, number]] | undefined {
  const top = Math.max(box.y, 0);
  const bottom = Math.min(box.y + box.height, box.view);
  if (bottom - top < 40) return undefined;
  const round = (x: number, y: number): [number, number] => [Math.round(x), Math.round(y)];
  return [
    round(box.x + box.width * 0.2, top + (bottom - top) * 0.3),
    round(box.x + box.width * 0.4, top + (bottom - top) * 0.5),
  ];
}

/** A site's icon, which a browser asks for of itself: Safari asks for it of a page from a server,
 * and the page's policy stops it as any picture not of a blob. It says nothing of the page. */
const ICON = String.raw`/(favicon\.ico|apple-touch-icon[\w-]*\.png)`;
/** The icon at the address of the runner's own server, as the emulator or the simulator reaches
 * it: the same path anywhere else is a request like any other. */
const OWN_ICON = new RegExp(String.raw`^http://localhost:\d+${ICON}$`);
/** A line of the server's log for the icon. */
const ICON_LINE = new RegExp(String.raw` ${ICON} \d{3}$`);

/** A request the page made, among the addresses asked for: anything but its own blobs and data,
 * the file it came from and the browser's own icon of the site. */
export function outside(addresses: readonly string[], own: readonly string[] = []): string[] {
  return addresses.filter(
    (address) =>
      !address.startsWith("blob:") &&
      !address.startsWith("data:") &&
      !own.includes(address) &&
      !OWN_ICON.test(address),
  );
}

/** Whether a policy lets the page ask for nothing: none by default, and no connection. A request
 * the page makes under it is a violation; without it, the request may go out where no watch of
 * Safari sees it, for a request that fails is no resource it lists. */
export function noNetwork(policy: string): boolean {
  const directives = policy.split(";").map((directive) => directive.trim());
  return directives.includes("default-src 'none'") && directives.includes("connect-src 'none'");
}

/** Of the server's log, the requests other than the download of the page itself: the page's, or
 * the browser's own icon of a site, which says nothing of the page and is named apart. */
export function asked(
  lines: readonly string[],
  file: string,
): { readonly others: string[]; readonly icons: string[] } {
  const requests = lines.filter((line) => /^[A-Z?]+ \S+ \d{3}$/.test(line));
  const others = requests.filter((line) => !line.startsWith(`GET /${file} `));
  const icon = (line: string) => ICON_LINE.test(line);
  return { others: others.filter((line) => !icon(line)), icons: others.filter(icon) };
}

/** The checks of what the page did over the whole run, each a step of the page's own: no
 * violation of its policy but the browser's own icon, no error, no request, and a watch that saw
 * it all. */
export function verdicts(
  seen: Seen,
  requests: readonly string[],
): { step: string; ok: boolean; note: string }[] {
  const own = seen.violations.filter(({ blocked }) => !OWN_ICON.test(blocked));
  const icons = seen.violations.length - own.length;
  // A directive's name, in its own letters only: what the page reported goes to the log.
  const names = [...new Set(own.map(({ directive }) => directive.replace(/[^a-z-]/g, "")))];
  const notes = [
    own.length ? `${own.length}: ${names.join(", ")}` : "",
    icons ? "the browser's icon stopped" : "",
  ];
  return [
    { step: "the watch saw the page from its start", ok: seen.watched, note: "" },
    { step: "the page carries its policy of no network", ok: noNetwork(seen.policy), note: "" },
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
