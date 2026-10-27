// The page to try the element on by hand, as app is to have it (RUN.md, T15; R27 in
// docs/decisions.md). The element's own buttons switch its tool and undo and clear (T41; R28): the
// page gives the element its language and the task the tools it allows, and counts the learner's
// choices of tool that toolchange tells; a pen's eraser erases whichever the tool is, if the task
// allows the eraser (T10; R22). The page keeps the history of writing as historychange tells it,
// listening on the element itself, as app is to; Reopen puts a new element in place of the old
// one with that history and the marks given, as a page opened again would, and Next task a new,
// empty one. Each element has a task in the names of the module format's draft — its grid and its
// tools, which the page's controls change by a new task, and its statement above the sheet, with a
// picture the page draws and one that never comes — and the module's manifest, whose height of
// digits the page's control changes (T44; R32). Dark theme sets the element's custom properties
// (T11; R23). A workbook's task takes the lines of a page of the layout's corpus, those that do not
// fit among them, in the font and the explanation language the page's controls give (T51; R35,
// R36). The counter tells how many of its boxes are filled (T48; R37), and Check sends the crop of
// each filled box, which the page shows with its place and its size (T49; R38).
// Under the sheet the page draws the groups of the strokes the history leaves, after every
// historychange, by the sheet's rule or by the pause and the reaches its fields give (T12; R24),
// and their crop for checking at the height of digits the manifest gives, with the frames of those
// groups and the crop's size at every height of eval (T13; R25). Check takes the work for checking
// from exportWork() and stops the writing for a moment, as while the models think: the page keeps
// the submission, and a box dragged over its crop, or a group picked, comes back to the element as
// a mark of the tutor's, which holds on to the strokes it takes and follows them as they are
// written over, erased and undone (T14; R26). The page reads what the element made of the marks
// through the probe of the tests. Its tasks are its own, made up, and it keeps nothing once it is
// closed. just demo serves it.

import { CROP, type Crop, cropOf, tokensOf } from "../src/core/crop.js";
import { GROUP_RULE, type Group, type GroupRule, groupsOf, rectOf } from "../src/core/groups.js";
import { type HistoryEvent, replay, SHEET, type Stroke } from "../src/core/index.js";
import { PAGES } from "../src/core/pages.fixture.js";
import { pictureOf } from "../src/core/raster.js";
import { moduleManifest, sheetTask, workbookTask } from "../src/core/tasks.fixture.js";
import "../src/element/index.js";
import type {
  ExportedCell,
  GridKind,
  HistoryChangeEvent,
  Manifest,
  Mark,
  Marks,
  Media,
  NovatrailCanvas,
  SheetSubmission,
  Task,
} from "../src/element/index.js";
import { probe } from "../src/element/probe.js";

/** An element of the page, of the type the page has it as. */
function part<T extends Element>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) throw new Error(`the page has no #${id}`);
  return element;
}

const place = part("place", HTMLDivElement);
const counter = part("counter", HTMLParagraphElement);
const status = part("status", HTMLSpanElement);
const kind = part("kind", HTMLSelectElement);
const pageOfCorpus = part("page", HTMLSelectElement);
const font = part("font", HTMLSelectElement);
const explanation = part("explanation", HTMLSelectElement);
const grid = part("grid", HTMLSelectElement);
const step = part("step", HTMLInputElement);
const dark = part("dark", HTMLButtonElement);
const language = part("lang", HTMLSelectElement);
const tools = part("tools", HTMLSelectElement);
const buttons = ["check", "reopen", "next"].map((id) => part(id, HTMLButtonElement));
const preview = part("groups", SVGSVGElement);
const table = part("table", HTMLTableSectionElement);
const pause = part("pause", HTMLInputElement);
const across = part("across", HTMLInputElement);
const down = part("down", HTMLInputElement);
const crop = part("crop", HTMLImageElement);
const frames = part("frames", SVGSVGElement);
const cropCaption = part("crop-caption", HTMLElement);
const heights = part("heights", HTMLTableSectionElement);
const digit = part("digit", HTMLSelectElement);
const sent = part("sent", HTMLImageElement);
const sentBoxes = part("sent-boxes", SVGSVGElement);
const sentGroups = part("sent-groups", HTMLDivElement);
const sentCaption = part("sent-caption", HTMLElement);
const sentCells = part("sent-cells", HTMLDivElement);
const unmark = part("unmark", HTMLButtonElement);

/** How long Check holds the writing, standing in for the minutes the models take. */
const THINKING_MS = 1000;

/**
 * A path with posts along it, drawn by the page: the picture its tasks show. The page draws it in
 * SVG under the PNG path the format names, and the element shows it as it would a PNG: a picture
 * is whatever image the consumer's media gives.
 */
function posts(): Blob {
  const marks = Array.from({ length: 6 }, (_, i) => {
    const x = 20 + i * 56;
    return `<rect x="${x - 3}" y="18" width="6" height="34" rx="2" fill="#7a5230"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="80" viewBox="0 0 340 80"><rect width="340" height="80" fill="#eef3e8"/><rect x="10" y="50" width="320" height="10" rx="5" fill="#c9b48a"/>${marks}</svg>`;
  return new Blob([svg], { type: "image/svg+xml" });
}

/** The page's media: its own picture, and nothing for any other, as a file that never came. */
const media: Media = async (ref) => {
  if (ref === "pictures/posts.png") return posts();
  throw new Error(`the page has no ${ref}`);
};

/** The pages of the layout's corpus, by name, for a workbook's task. */
for (const { name, about } of PAGES) {
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  option.title = about;
  pageOfCorpus.append(option);
}

/**
 * The task of the page's number `n`, of the kind its controls give: a workbook of the lines of the
 * page chosen, or a sheet of the grid chosen, with the tools chosen.
 */
function taskFor(n: number): Task {
  if (kind.value === "workbook") {
    const lines = PAGES.find(({ name }) => name === pageOfCorpus.value);
    if (lines === undefined) throw new Error(`the corpus has no page "${pageOfCorpus.value}"`);
    return {
      ...workbookTask(lines.items, tools.value.split(" ")),
      id: `${lines.name}-${n}`,
      statement: [{ text: `Task ${n}. ${lines.about}` }],
    };
  }
  return sheetTask({
    id: `posts-${n}`,
    grid: grid.value as GridKind,
    grid_step: Number(step.value),
    tools: tools.value.split(" "),
    statement: [
      {
        text: `Task ${n}. Along a path 20 m long, a post stands every 4 m, from one end to the other.`,
      },
      {
        picture: "pictures/posts.png",
        alt: "A path with six posts along it",
        width: 340,
        height: 80,
      },
      { text: "How many posts are there? Write your solution on the sheet." },
      {
        picture: "pictures/missing.png",
        alt: "A picture that does not come",
        width: 200,
        height: 60,
      },
    ],
  });
}

/** The module's manifest: the explanation language and the height of digits the controls give. */
function manifestFor(): Manifest {
  return moduleManifest({ digit_height: Number(digit.value), explanation: explanation.value });
}

/**
 * The history of writing as the page keeps it, as app is to keep it on the device: what
 * historychange has told, added on, and given back to an element that opens the sheet again.
 */
let kept: HistoryEvent[] = [];
let taskNumber = 1;
let changes = 0;
let choices = 0;

/** A new element for the page's task, with the history and the marks given, if any. */
function mount(history?: readonly HistoryEvent[], marks?: Marks): NovatrailCanvas {
  const element = document.createElement("novatrail-canvas");
  speak(element);
  element.style.fontFamily = font.value;
  try {
    element.task = taskFor(taskNumber);
  } catch (error) {
    // A step the page's field gives that is no task's — out of bounds, or not whole — and a page
    // whose lines do not fit leave the new element without the page's task, and the page says why.
    status.textContent = error instanceof Error ? error.message : String(error);
  }
  element.manifest = manifestFor();
  element.media = media;
  // The history first, then the marks: they hold on to its strokes.
  if (history !== undefined) element.history = history;
  if (marks !== undefined) element.marks = marks;
  // On the element itself: an ancestor would miss a stroke that lands as the element leaves.
  element.addEventListener("historychange", told);
  element.addEventListener("toolchange", chose);
  return element;
}

/** The language the page gives an element, which its buttons are labelled in: none for "". */
function speak(element: NovatrailCanvas): void {
  if (language.value === "") element.removeAttribute("lang");
  else element.lang = language.value;
}

/** What toolchange tells: the learner chose another tool with the element's own buttons. */
function chose(): void {
  choices++;
  count();
}

let sheet = mount();
place.append(sheet);

function count(): void {
  const told = `historychange × ${changes} · ${kept.length} events kept`;
  // A workbook's boxes: how many are filled, as the element tells (R37).
  const boxes = sheet.filled?.flat() ?? [];
  const filled =
    sheet.filled === null ? "" : ` · filled ${boxes.filter(Boolean).length} of ${boxes.length}`;
  counter.textContent = `Task ${taskNumber} · ${told} · toolchange × ${choices}, ${sheet.tool}${filled}`;
}

const SVG = "http://www.w3.org/2000/svg";
/** The height of a group's label in the preview, in sheet units: the font size of `#groups .label`. */
const LABEL = 40;

/** The rule the fields give: the sheet's own for a field left empty or below 0. */
function rule(): GroupRule {
  const read = (field: HTMLInputElement, fallback: number) => {
    const value = field.valueAsNumber;
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  };
  return {
    pause: read(pause, GROUP_RULE.pause),
    across: read(across, GROUP_RULE.across),
    down: read(down, GROUP_RULE.down),
  };
}

/** A shape of the preview, with its attributes. */
function shape(name: string, attributes: Record<string, string | number>): SVGElement {
  const element = document.createElementNS(SVG, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  return element;
}

/**
 * The groups of the strokes the sheet's history leaves, drawn under it in sheet units: each stroke a
 * line through its points, each group a box with its label, and the table of labels and stroke IDs
 * (R24). Then the crop of the strokes, with the frames of these groups (R25).
 */
function showGroups(): void {
  const strokes = replay(sheet.history);
  const groups = groupsOf(strokes, rule());
  const shapes = strokes.map(({ points }) => {
    // A dot is a line of no length, which round caps draw.
    const spots = points.length === 1 ? [...points, ...points] : points;
    return shape("polyline", {
      class: "ink",
      points: spots.map(({ x, y }) => `${x},${y}`).join(" "),
    });
  });
  const rows = groups.map(({ label, ids }) => {
    const { minX, minY, maxX, maxY } = rectOf(ids, strokes);
    const box = { x: minX - 6, y: minY - 6, width: maxX - minX + 12, height: maxY - minY + 12 };
    // The label stands over the box's top left corner, or under the box at the sheet's top edge,
    // and within the sheet across.
    const text = shape("text", {
      class: "label",
      x: Math.min(Math.max(minX - 6, 0), SHEET.width - LABEL * label.length),
      y: minY - 12 >= LABEL ? minY - 12 : maxY + 6 + LABEL,
    });
    text.textContent = label;
    shapes.push(shape("rect", { class: "group", ...box }), text);
    const row = document.createElement("tr");
    for (const cell of [label, ids.join(", ")]) row.insertCell().textContent = cell;
    return row;
  });
  preview.replaceChildren(...shapes);
  table.replaceChildren(...rows);
  // The groups stand whatever becomes of the crop.
  try {
    showCrop(strokes, groups);
  } catch (error) {
    cropCaption.textContent = `The crop failed: ${error instanceof Error ? error.message : error}`;
  }
}

/**
 * The PNGs drawn for the strokes on the sheet, by height of digits. A crop's pixels come from the
 * strokes and the height alone, not from the groups, so the fields of the rule redraw only its
 * frames; a new history draws the pictures again.
 */
const pictures = new Map<number, Uint8Array<ArrayBuffer>>();
let picturesOf: readonly HistoryEvent[] | undefined;

function pictureFor(strokes: readonly Stroke[], shown: Crop): Uint8Array<ArrayBuffer> {
  if (picturesOf !== sheet.history) {
    pictures.clear();
    picturesOf = sheet.history;
  }
  let png = pictures.get(shown.digit);
  if (png === undefined) {
    png = pictureOf(strokes, shown);
    pictures.set(shown.digit, png);
  }
  return png;
}

/**
 * The crop for checking of the strokes, at the height of digits the manifest gives, with the
 * frames of the groups over it, and the crop's size at every height of eval (R25).
 */
function showCrop(strokes: readonly Stroke[], groups: readonly Group[]): void {
  if (crop.src !== "") URL.revokeObjectURL(crop.src);
  const shown = cropOf(strokes, groups, Number(digit.value));
  if (shown === null) {
    crop.removeAttribute("src");
    frames.replaceChildren();
    cropCaption.textContent = "";
    heights.replaceChildren();
    return;
  }
  const png = pictureFor(strokes, shown);
  crop.width = shown.width;
  crop.height = shown.height;
  crop.src = URL.createObjectURL(new Blob([png], { type: "image/png" }));
  frames.setAttribute("viewBox", `0 0 ${shown.width} ${shown.height}`);
  frames.replaceChildren(
    ...shown.frames.flatMap(({ label, box: [y0, x0, y1, x1] }) => {
      const [top, left] = [(y0 * shown.height) / 1000, (x0 * shown.width) / 1000];
      const frame = shape("rect", {
        class: "frame",
        x: left,
        y: top,
        width: ((x1 - x0) * shown.width) / 1000,
        height: ((y1 - y0) * shown.height) / 1000,
      });
      const text = shape("text", { class: "label", x: left + 2, y: Math.max(top - 2, 11) });
      text.textContent = label;
      return [frame, text];
    }),
  );
  cropCaption.textContent = [
    `${shown.width} × ${shown.height} px`,
    `digits ${shown.drawn} px of ${shown.digit}`,
    `s ${shown.scale.toFixed(3)} px a unit`,
    `h_med ${shown.median} units`,
    `${tokensOf(shown)} tokens`,
    `${(png.length / 1024).toFixed(1)} KB`,
  ].join(" · ");
  heights.replaceChildren(
    ...CROP.heights.map((height) => {
      const each = cropOf(strokes, groups, height);
      const row = document.createElement("tr");
      const cells =
        each === null
          ? [String(height)]
          : [
              String(height),
              String(each.drawn),
              `${each.width} × ${each.height}`,
              String(tokensOf(each)),
              `${(pictureFor(strokes, each).length / 1024).toFixed(1)} KB`,
            ];
      for (const cell of cells) row.insertCell().textContent = cell;
      return row;
    }),
  );
}

/** The submission of the last Check of a sheet, from exportWork(), and the marks given so far. */
let submission: SheetSubmission | undefined;
let given: readonly Mark[] = [];
/** What the page says of the crops of a workbook's boxes the last Check sent, or nothing. */
let cellsSent = "";

/**
 * What Check sends: the crop of exportWork() (R27), whose submission the page keeps, or on a
 * workbook the crop of each filled box (R38). Marks given before go: they were of the last
 * submission. The work is null on an empty sheet, and on a workbook with no box filled.
 */
async function send(): Promise<boolean> {
  const work = await sheet.exportWork();
  given = [];
  sheet.marks = undefined;
  submission = work !== null && "png" in work ? work.submission : undefined;
  if (sent.src !== "") URL.revokeObjectURL(sent.src);
  sentGroups.replaceChildren();
  await showCells(work !== null && "cells" in work ? work.cells : []);
  if (work === null || "cells" in work) {
    sent.removeAttribute("src");
    showMarks();
    return work !== null;
  }
  const { width, height } = work.submission.crop;
  sent.width = width;
  sent.height = height;
  sent.src = URL.createObjectURL(work.png);
  sentBoxes.setAttribute("viewBox", `0 0 ${width} ${height}`);
  for (const { label } of work.submission.groups) {
    const button = document.createElement("button");
    button.textContent = label;
    button.addEventListener("click", () =>
      mark({ kind: "frame", at: { group: label }, name: `Group ${label}` }),
    );
    sentGroups.append(button);
  }
  showMarks();
  return true;
}

/** The crops of a workbook's filled boxes Check sent, each with its place and its size (R38). */
async function showCells(cells: readonly ExportedCell[]): Promise<void> {
  for (const image of sentCells.querySelectorAll("img")) URL.revokeObjectURL(image.src);
  sentCells.replaceChildren();
  cellsSent = "";
  const shown = await Promise.all(
    cells.map(async ({ item, slot, png }) => {
      // The size is the PNG's own, in its header: the width and the height after the signature.
      const header = new DataView(await png.slice(16, 24).arrayBuffer());
      const size = { width: header.getUint32(0), height: header.getUint32(4) };
      const tokens = tokensOf(size);
      const image = document.createElement("img");
      image.src = URL.createObjectURL(png);
      image.alt = `The crop of box ${slot} of item ${item}`;
      const caption = document.createElement("figcaption");
      caption.textContent = `${item}.${slot} · ${size.width} × ${size.height} · ${tokens} tokens · ${(png.size / 1024).toFixed(1)} KB`;
      const figure = document.createElement("figure");
      figure.append(image, caption);
      return { figure, tokens, bytes: png.size };
    }),
  );
  sentCells.replaceChildren(...shown.map(({ figure }) => figure));
  const sum = (of: (each: (typeof shown)[number]) => number) =>
    shown.reduce((total, each) => total + of(each), 0);
  cellsSent =
    shown.length === 0
      ? ""
      : `${shown.length} ${shown.length === 1 ? "box" : "boxes"} sent: ${sum(({ tokens }) => tokens)} tokens, ${(sum(({ bytes }) => bytes) / 1024).toFixed(1)} KB in all. Marks on a workbook's boxes come in a later version.`;
}

/** One more mark of the submission, back to the element with the others. */
function mark(each: Mark): void {
  if (submission === undefined) return;
  try {
    sheet.marks = { submission, marks: [...given, each] };
    given = [...given, each];
    showMarks();
  } catch (error) {
    sentCaption.textContent = `The marks failed: ${error instanceof Error ? error.message : error}`;
  }
}

/** The boxes given, over the crop sent, and what the element made of the marks. */
function showMarks(): void {
  if (submission === undefined) {
    sentBoxes.replaceChildren();
    sentCaption.textContent = cellsSent || "Check sends the crop of the work; it comes here.";
    return;
  }
  const { width, height } = submission.crop;
  sentBoxes.replaceChildren(
    ...given.flatMap(({ at }) =>
      "box" in at
        ? [
            shape("rect", {
              class: "given",
              x: (at.box[1] * width) / 1000,
              y: (at.box[0] * height) / 1000,
              width: ((at.box[3] - at.box[1]) * width) / 1000,
              height: ((at.box[2] - at.box[0]) * height) / 1000,
            }),
          ]
        : [],
    ),
  );
  const placed = probe(sheet).marks;
  sentCaption.textContent =
    given.length === 0
      ? "Drag a box over the crop, or pick a group, to mark the place on the sheet."
      : [
          `${given.length} given, ${placed.length} with a place`,
          ...placed.map(({ name, ids }) => `${name}: strokes ${ids.join(", ")}`),
        ].join(" · ");
}

/** A place on the crop sent, in its px, from a pointer over it. */
function onSent(event: PointerEvent): { readonly x: number; readonly y: number } {
  const rect = sentBoxes.getBoundingClientRect();
  const { width, height } = submission?.crop ?? { width: 0, height: 0 };
  const along = (at: number, from: number, size: number) =>
    Math.min(Math.max((at - from) / size, 0), 1);
  return {
    x: along(event.clientX, rect.left, rect.width) * width,
    y: along(event.clientY, rect.top, rect.height) * height,
  };
}

/** The box between two places on the crop, in whole thousandths, min < max (R53 spec). */
function fractions(
  a: { readonly x: number; readonly y: number },
  b: { readonly x: number; readonly y: number },
): [number, number, number, number] | null {
  if (submission === undefined) return null;
  const { width, height } = submission.crop;
  const span = (p: number, q: number, size: number): [number, number] => {
    const low = Math.floor((1000 * Math.min(p, q)) / size);
    const high = Math.ceil((1000 * Math.max(p, q)) / size);
    return high > low ? [low, high] : low < 1000 ? [low, low + 1] : [999, 1000];
  };
  const [ymin, ymax] = span(a.y, b.y, height);
  const [xmin, xmax] = span(a.x, b.x, width);
  return [ymin, xmin, ymax, xmax];
}

let dragFrom: { readonly x: number; readonly y: number } | undefined;
const dragged = shape("rect", { class: "dragged" });

sentBoxes.addEventListener("pointerdown", (event) => {
  if (submission === undefined || event.button !== 0) return;
  dragFrom = onSent(event);
  sentBoxes.setPointerCapture(event.pointerId);
  for (const [key, value] of Object.entries({
    x: dragFrom.x,
    y: dragFrom.y,
    width: 0,
    height: 0,
  })) {
    dragged.setAttribute(key, String(value));
  }
  sentBoxes.append(dragged);
});
sentBoxes.addEventListener("pointermove", (event) => {
  if (dragFrom === undefined) return;
  const to = onSent(event);
  dragged.setAttribute("x", String(Math.min(dragFrom.x, to.x)));
  dragged.setAttribute("y", String(Math.min(dragFrom.y, to.y)));
  dragged.setAttribute("width", String(Math.abs(to.x - dragFrom.x)));
  dragged.setAttribute("height", String(Math.abs(to.y - dragFrom.y)));
});
sentBoxes.addEventListener("pointerup", (event) => {
  if (dragFrom === undefined) return;
  const box = fractions(dragFrom, onSent(event));
  dragFrom = undefined;
  dragged.remove();
  if (box !== null) mark({ kind: "frame", at: { box }, name: "The place the model named" });
});
// A drag the browser cancels, or whose pointer goes, makes no mark and leaves no box behind.
for (const type of ["pointercancel", "lostpointercapture"] as const) {
  sentBoxes.addEventListener(type, () => {
    dragFrom = undefined;
    dragged.remove();
  });
}
unmark.addEventListener("click", () => {
  given = [];
  sheet.marks = undefined;
  showMarks();
});

let checking = false;

/**
 * Check: the writing and the buttons stop at once, then the work for checking comes, and both stay
 * stopped while the models would think. A stroke already under way goes on: the element holds its
 * pointer (R20).
 */
async function check(): Promise<void> {
  if (checking) return;
  checking = true;
  const checked = sheet;
  checked.style.pointerEvents = "none";
  for (const button of buttons) button.disabled = true;
  // The pointer writes nothing meanwhile; the keys of the element's buttons still work (R28).
  status.textContent = "Checking: no writing with the pointer until it ends…";
  try {
    if (!(await send())) {
      status.textContent = "Write a solution first.";
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, THINKING_MS));
    status.textContent = "";
  } catch (error) {
    status.textContent = `The work failed: ${error instanceof Error ? error.message : error}`;
  } finally {
    checked.style.pointerEvents = "";
    for (const button of buttons) button.disabled = false;
    checking = false;
  }
}

/**
 * The canvas kind, the page, the grid and the tools the controls give, by a new task: the work
 * stays. A step out of bounds, and a page whose lines do not fit, are left.
 */
function regrid(): void {
  try {
    sheet.task = taskFor(taskNumber);
    status.textContent = "";
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : String(error);
  }
  showGroups();
  count();
}

/** What historychange tells, added to the history the page keeps, as app is to add it. */
function told({ detail }: HistoryChangeEvent): void {
  // The events begin where the page's history ends, unless it missed some: then it reads them all.
  kept = detail.from === kept.length ? [...kept, ...detail.events] : [...sheet.history];
  // A clearing starts the sheet over: what the page said of the last one is no longer so.
  if (detail.events.some((event) => event.kind === "clear")) status.textContent = "";
  changes++;
  count();
  showGroups();
}

/** The page's state for a sheet just put in place. */
function mounted(next: NovatrailCanvas): void {
  // The old sheet is no longer heard: a stroke that lands as it leaves the page is of its task.
  const old = sheet;
  old.removeEventListener("historychange", told);
  old.removeEventListener("toolchange", chose);
  sheet = next;
  old.replaceWith(next);
  // A new sheet starts with the pen.
  changes = 0;
  choices = 0;
  showGroups();
  showMarks();
  count();
}
part("check", HTMLButtonElement).addEventListener("click", () => void check());
// Reopen: the sheet as a page opened again has it, from the history the page keeps, through JSON as
// a store keeps it, and with the marks given, which go back on their strokes.
part("reopen", HTMLButtonElement).addEventListener("click", () => {
  const history = JSON.parse(JSON.stringify(kept)) as HistoryEvent[];
  const marks =
    submission !== undefined && given.length > 0 ? { submission, marks: given } : undefined;
  try {
    mounted(mount(history, marks));
    status.textContent = `Opened again from the ${history.length} events the page keeps.`;
  } catch (error) {
    status.textContent = `Reopen failed: ${error instanceof Error ? error.message : error}`;
  }
});
part("next", HTMLButtonElement).addEventListener("click", () => {
  taskNumber++;
  kept = [];
  submission = undefined;
  given = [];
  if (sent.src !== "") URL.revokeObjectURL(sent.src);
  sent.removeAttribute("src");
  sentGroups.replaceChildren();
  void showCells([]);
  status.textContent = "";
  mounted(mount());
});
for (const control of [kind, pageOfCorpus, grid]) control.addEventListener("change", regrid);
font.addEventListener("change", () => {
  sheet.style.fontFamily = font.value;
});
// The tools allowed are the task's, and a task without the eraser puts the pen back.
tools.addEventListener("change", () => {
  regrid();
  count();
});
language.addEventListener("change", () => speak(sheet));
step.addEventListener("change", regrid);
dark.addEventListener("click", () => {
  const on = document.body.classList.toggle("dark");
  dark.setAttribute("aria-pressed", String(on));
});
preview.setAttribute("viewBox", `0 0 ${SHEET.width} ${SHEET.height}`);
pause.value = String(GROUP_RULE.pause);
across.value = String(GROUP_RULE.across);
down.value = String(GROUP_RULE.down);
for (const field of [pause, across, down]) field.addEventListener("input", showGroups);
// The height of digits and the explanation language are the module's: a new manifest, and the
// task stays.
for (const control of [digit, explanation]) {
  control.addEventListener("change", () => {
    sheet.manifest = manifestFor();
    showGroups();
  });
}
count();
showGroups();
showMarks();
