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
/** The tasks the build offers — every task of tutor's file (T21) — and the first of the workbook
 * among them, after the banks of sheets (scripts/page.ts). */
export const TASKS = 56;
export const WORKBOOK = "16";

/** The build the workflow's build job wrote with scripts/page.ts. */
export const BUILD = "build/page";
/** The test build, with the legal texts' part for tests alone (T84, T89; R59, R69), as the workflow
 * serves it: its file named apart, for Chrome keeps both downloads in one list (T22). */
export const TEST_BUILD = "build/page-test-served";

/** The page's one file among a build's. */
export function pageIn(names: readonly string[]): string {
  const [file, ...more] = names.filter((name) => /^samples-page_v.+\.html$/.test(name));
  if (!file || more.length > 0) throw new Error("the build holds not one page");
  return file;
}

/** The page's one file in a build: the release's, unless another is named. */
export function pageFile(build = BUILD): string {
  return pageIn(readdirSync(build));
}

/** The watch, as a script of its own: it runs once in a page, before the page's own. */
export const WATCH = `(() => {
  if (window.__canvasWatch) return;
  const watch = { violations: [], errors: [], blobs: [], pointers: [] };
  // Where each pointer came down, and on what: a driver's tap that misses its place shows here.
  document.addEventListener("pointerdown", (event) => {
    const on = event.composedPath()[0];
    watch.pointers.push({
      type: event.pointerType,
      x: Math.round(event.clientX),
      y: Math.round(event.clientY),
      on: on instanceof Element ? on.tagName.toLowerCase() + (on.id ? "#" + on.id : "") : "",
    });
    if (watch.pointers.length > 10) watch.pointers.shift();
  }, true);
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
    pointers: watch?.pointers ?? [],
  };
})())`;

/** The box of an element of the page, by a selector, in the page's CSS pixels, as JSON. */
export function boxOf(selector: string): string {
  return `JSON.stringify((() => {
  const box = document.querySelector(${JSON.stringify(selector)})?.getBoundingClientRect();
  return box ? { x: box.x, y: box.y, width: box.width, height: box.height, view: innerHeight } : null;
})())`;
}

/** A script that asks the page for two frames of its rendering and marks when the second has come,
 * and one that says whether it has: the element the picker gave lays itself out only in a frame,
 * and Safari of the iPad Simulator has drawn none for seconds after the picker changed, so that a
 * stroke drawn then found no element laid out to take it (run 42704340066, T21). */
export const PAINT =
  "(window.__canvasPainted = false, requestAnimationFrame(() => requestAnimationFrame(() => { window.__canvasPainted = true; })), 0)";
export const PAINTED = "window.__canvasPainted === true";

/** The text of the blob the page handed out at an index; null when there is none. */
export function blobAt(index: number): string {
  return `window.__canvasWatch?.blobs[${index}] ?? null`;
}

/** A script that draws a stroke on the element by pointer events of the page's own, from one point
 * of the window to another, of a pointer's type: what the iPad's driver draws with, for WebDriver's
 * actions in Safari of the simulator reached a window other than the session's, or hung (T81). The
 * element takes them as it takes a finger's; what a real pen or palm does is the hardware's to
 * show (Д7 in RUN.md). It gives the strokes the sheet holds then. */
export function strokeBy(
  from: readonly [number, number],
  to: readonly [number, number],
  type: "touch" | "pen" | "mouse",
  end: "pointerup" | "pointercancel" = "pointerup",
): string {
  return pointersBy([[from, to]], type, end);
}

/** A script that moves pointers of the page's own over the element together, each from its point
 * to its own, and ends them all with one kind of event: one pointer is a stroke, ended by
 * pointerup or, as a browser that takes the touch back ends it, by pointercancel; two of a touch
 * are the fingers that scroll the sheet (R29; T22). It gives the strokes the sheet holds then. */
export function pointersBy(
  paths: readonly (readonly [readonly [number, number], readonly [number, number]])[],
  type: "touch" | "pen" | "mouse",
  end: "pointerup" | "pointercancel" = "pointerup",
): string {
  return `(() => {
  const host = document.querySelector("novatrail-canvas");
  const paths = ${JSON.stringify(paths)};
  const targets = paths.map(([[x, y]]) => host.shadowRoot.elementFromPoint(x, y) ?? host);
  const at = (n, kind, x, y) => targets[n].dispatchEvent(new PointerEvent(kind, {
    pointerId: 7 + n, pointerType: ${JSON.stringify(type)}, isPrimary: n === 0, bubbles: true,
    composed: true, cancelable: true, clientX: x, clientY: y, buttons: kind === "pointermove" || kind === "pointerdown" ? 1 : 0,
    pressure: kind === "pointermove" || kind === "pointerdown" ? 0.5 : 0,
  }));
  paths.forEach(([[x, y]], n) => at(n, "pointerdown", x, y));
  for (let i = 1; i <= 12; i++) {
    paths.forEach(([[x1, y1], [x2, y2]], n) => at(n, "pointermove", x1 + ((x2 - x1) * i) / 12, y1 + ((y2 - y1) * i) / 12));
  }
  paths.forEach(([, [x, y]], n) => at(n, ${JSON.stringify(end)}, x, y));
  return host.history.length;
})()`;
}

/** The box of a button of the element's own row, by its label as the screen shows it (R46): the
 * label is the button's text, after its icon. As JSON, null when the row has none such. */
export function buttonBox(label: string): string {
  return `JSON.stringify((() => {
  const box = ${rowButton(label)}?.getBoundingClientRect();
  // A button wholly outside the window is none to tap: the row has not come into view.
  const shown = box && box.width > 0 && box.y + box.height > 0 && box.y < innerHeight;
  return shown ? { x: box.x, y: box.y, width: box.width, height: box.height, view: innerHeight } : null;
})())`;
}

/** An expression of the button of the element's row with a label, or undefined: the row's buttons
 * are in the element's shadow tree, each named by its text after its icon. */
function rowButton(label: string): string {
  return `[...(document.querySelector("novatrail-canvas")?.shadowRoot?.querySelectorAll(".tools button") ?? [])]
    .find((one) => one.textContent.trim() === ${JSON.stringify(label)} && !one.hidden)`;
}

/** A script that presses a button of the element's row by its own click(), as the iPad's driver
 * presses the page's buttons (T81); whether there was one. */
export function clickButton(label: string): string {
  return `(() => {
  const button = ${rowButton(label)};
  if (!button) return false;
  button.click();
  return true;
})()`;
}

/** The labels of the row's buttons in Russian, the page's language (src/element/labels.ts). */
export const PEN = "Перо";
export const ERASER = "Ластик";
export const UNDO = "Отменить";

/** What the sheet holds now, as JSON: how many events its history has, the kind of the last, the
 * tool in use and how far the sheet and the page are scrolled — the viewport of the element and
 * the window together, for two fingers scroll whichever can go (R29). */
export const SHEET = `JSON.stringify((() => {
  const host = document.querySelector("novatrail-canvas");
  const history = host && Array.isArray(host.history) ? host.history : [];
  const viewport = host?.shadowRoot?.querySelector(".viewport");
  return {
    events: history.length,
    last: history.at(-1)?.kind ?? "",
    tool: host?.tool ?? "",
    scrolled: Math.round((viewport?.scrollTop ?? 0) + scrollY),
  };
})())`;

/** What SHEET gives. */
export interface SheetNow {
  readonly events: number;
  readonly last: string;
  readonly tool: string;
  readonly scrolled: number;
}

/** A script that has the writer say they imitate a child's hand: the page writes the sample as
 * an adult's imitating a child's (R09). */
export const AS_CHILD = `(() => {
  const radio = document.querySelector('input[name="writer"][value="child"]');
  radio?.click();
  return radio?.checked === true;
})()`;

/** A script that reads the test build's start before anything is chosen (T22; R58, R59): the eval
 * set closed with its reason, for the build has no task of a module, and the measurement and a
 * child's session open, as JSON. */
export const TEST_START = `JSON.stringify((() => {
  const radio = (value) => document.querySelector('input[name="purpose"][value="' + value + '"]');
  return {
    evalSetClosed: radio("evalSet")?.disabled === true
      && (document.getElementById("purpose-note-evalSet")?.textContent ?? "").includes("нет задач модулей"),
    measurementOpen: radio("measurement")?.disabled === false,
    childOpen: radio("child")?.disabled === false,
  };
})())`;

/** A child's code as the form of the test would hold it: what the adult types (R59). */
export const CHILD_CODE = "T22CHILD";

/** A script that goes through the start of a child's session as the adult who leads it would
 * (T84; R59): the session chosen, the statements ticked, a new code asked — which the page shows
 * for a form and begins nothing with — and then the form's code typed, and «Начать». What came of
 * each, as JSON. */
export const CHILD_START = `JSON.stringify((() => {
  const input = (field, value) => {
    field.value = value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
  };
  document.querySelector('input[name="purpose"][value="child"]').click();
  for (const tick of document.querySelectorAll("#statements input[data-statement]")) {
    if (!tick.checked) tick.click();
  }
  document.querySelector('input[name="code"][value="new"]').click();
  const newShown = /[0-9A-Z]{6,16}/.test(document.getElementById("new-code").textContent ?? "");
  const begin = document.getElementById("begin");
  const newBlocks = begin.disabled;
  document.querySelector('input[name="code"][value="own"]').click();
  input(document.getElementById("typed"), ${JSON.stringify(CHILD_CODE)});
  const open = !begin.disabled;
  if (open) begin.click();
  return {
    newShown,
    newBlocks,
    begun: open && document.querySelector("novatrail-canvas") !== null,
    childWrites: !document.getElementById("child-writes").hidden,
    ipadNote: !document.getElementById("ipad-note").hidden,
    writerAsked: !document.getElementById("writer").hidden,
  };
})())`;

/** Whether the form of a child's sheet labels the flag of a part illegible as the adult can say
 * it: unread by the child's words too, not on purpose (R59). */
export const CHILD_FLAG = `(document.querySelector('[data-part="0"] input[data-flag="illegible"]')?.parentElement?.textContent ?? "").includes("со слов ребёнка")`;

/** A script that opens the page anew, as a person does to begin again (R11): the start, with the
 * section that opens a file below it (T87). */
export const REOPEN = "(setTimeout(() => location.reload(), 0), 0)";

/** Whether the page shows its start and the section that opens a sample file. */
export const OPEN_SHOWN = `document.getElementById("start")?.hidden === false && document.getElementById("open")?.hidden === false`;

/** A script that gives the section of the page that opens a file a sample's text as a file chosen
 * (T87): the page's own way to read it, not the system's picker, which only hardware shows (Д7).
 * The text is the script's first argument where the driver passes one, or else in it. */
export function chooseFile(text?: string): string {
  const given = text === undefined ? "arguments[0]" : JSON.stringify(text);
  return `(() => {
  const input = document.getElementById("open-file");
  const files = new DataTransfer();
  files.items.add(new File([${given}], "sample.json", { type: "application/json" }));
  input.files = files.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
  return input.files.length;
})()`;
}

/** What the page shows of a sample file it opened (T87), as JSON: whether the view is there, how
 * many strokes it draws as shown and as not shown at the end, whether its checkbox of those is
 * there, and how many crops it shows and how many of them the browser has decoded. */
export const VIEWED = `JSON.stringify((() => {
  const view = document.getElementById("view");
  const crops = [...document.querySelectorAll("#view img.crop")];
  return {
    shown: view?.hidden === false,
    lines: document.querySelectorAll("#view svg > polyline").length,
    hidden: document.querySelectorAll("#view svg [data-hidden] polyline").length,
    toggle: document.getElementById("show-hidden") !== null,
    crops: crops.length,
    decoded: crops.filter((crop) => crop.complete && crop.naturalWidth > 0).length,
  };
})())`;

/** What VIEWED gives. */
export interface Viewed {
  readonly shown: boolean;
  readonly lines: number;
  readonly hidden: number;
  readonly toggle: boolean;
  readonly crops: number;
  readonly decoded: number;
}

/** A script that ticks the checkbox of the strokes the history did not show, brings the picture
 * into view, and says whether they are drawn then. */
export const SHOW_HIDDEN = `(() => {
  const toggle = document.getElementById("show-hidden");
  if (toggle && !toggle.checked) toggle.click();
  document.querySelector("#view svg")?.scrollIntoView({ block: "start" });
  return document.querySelector("#view svg [data-hidden]")?.getAttribute("display") === "inline";
})()`;

/** A script that goes through the page's start as the author would under the draft of texts (T20):
 * the measurement, a new writer's code, every statement ticked, and «Начать». Whether the sheet is
 * there then: false while the start lacks something. */
export const START = `(() => {
  document.querySelector('input[name="purpose"][value="measurement"]').click();
  document.querySelector('input[name="code"][value="new"]').click();
  for (const tick of document.querySelectorAll("#statements input[data-statement]")) {
    if (!tick.checked) tick.click();
  }
  const begin = document.getElementById("begin");
  if (begin.disabled) return false;
  begin.click();
  return document.querySelector("novatrail-canvas") !== null;
})()`;

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
  /** The policy the page's <meta> gives, or "" when it has none. */
  readonly policy: string;
  readonly resources: readonly string[];
  /** Each violation of the policy: its directive, and the start of the address it stopped. */
  readonly violations: readonly { readonly directive: string; readonly blocked: string }[];
  /** The message of each error, for the run's artifact. */
  readonly errors: readonly string[];
  readonly blobs: number;
  /** The last pointers that came down, where and on what. */
  readonly pointers: readonly { type: string; x: number; y: number; on: string }[];
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
 * a little lower and to the right, as in the build's own test; the second stroke of a sheet to the
 * right of the first, apart from it (T22). None when the window shows less than a strip of it. */
export function strokeIn(
  box: Box,
  second = false,
): [[number, number], [number, number]] | undefined {
  const at = shownOf(box, 40);
  if (!at) return undefined;
  const left = second ? 0.6 : 0.2;
  return [at(left, 0.3), at(left + 0.2, 0.5)];
}

/** Where a point of the part of an element the window shows lies, by its shares across the
 * element and down that part, in whole pixels; none when the window shows less than a strip of
 * the height given. */
function shownOf(
  box: Box,
  strip: number,
): ((across: number, down: number) => [number, number]) | undefined {
  const top = Math.max(box.y, 0);
  const bottom = Math.min(box.y + box.height, box.view);
  if (bottom - top < strip) return undefined;
  return (across, down) => [
    Math.round(box.x + box.width * across),
    Math.round(top + (bottom - top) * down),
  ];
}

/** Two fingers inside the part of an element the window shows, side by side a fifth of it apart,
 * each moving up a third of what the window shows: the content goes on with them (R29). None when
 * the window shows less than a strip of it. */
export function fingersIn(
  box: Box,
): [[[number, number], [number, number]], [[number, number], [number, number]]] | undefined {
  const at = shownOf(box, 120);
  if (!at) return undefined;
  const finger = (across: number): [[number, number], [number, number]] => [
    at(across, 0.75),
    at(across, 0.4),
  ];
  return [finger(0.4), finger(0.6)];
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
