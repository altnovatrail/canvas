// The page to try the element on by hand, as tutor's check board would have it (RUN.md, T34; R20
// in docs/decisions.md). The board's buttons call the element's methods; Check takes the picture
// the board would send and stops the writing for a moment, as the board does while the models
// think; Next task puts a new element in place of the old one. The page listens for workchange
// above the element, where the event still comes from the next task's element. Eraser, which the
// board has not, switches the element's tool between the pen and the eraser (T10; R22): a pen's
// eraser erases whichever it is. Each element has a task: its grid, which the page's controls
// change by a new task, and its statement above the sheet, with a picture the page draws and one
// that never comes. Dark theme sets the element's custom properties (T11; R23). Under the sheet
// the page draws the groups of its strokes after every workchange, by the sheet's rule or by the
// pause and the reaches its fields give (T12; R24), and the crop for checking at the height of
// digits its field gives, with the frames of those groups and the crop's size at every height of
// eval (T13; R25): it reads the strokes through the probe of the tests, for the element hands out
// no strokes yet (T15), and it keeps nothing. Check sends the crop as well, as exportWork() is to
// (T15): the page keeps that submission, and a box dragged over its crop, or a group picked, comes
// back to the element as a mark of the tutor's, which holds on to the strokes it takes and follows
// them as they are written over, erased and undone (T14; R26). The page's tasks are its own, made
// up. just demo serves it.

import { CROP, type Crop, cropOf, tokensOf } from "../src/core/crop.js";
import { GROUP_RULE, type Group, type GroupRule, groupsOf, rectOf } from "../src/core/groups.js";
import type { Stroke } from "../src/core/ink.js";
import { pictureOf } from "../src/core/raster.js";
import { SHEET } from "../src/core/sheet.js";
import "../src/element/index.js";
import type { GridKind, Mark, Media, Submission, Task, Tool } from "../src/element/index.js";
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
const picture = part("picture", HTMLImageElement);
const caption = part("caption", HTMLElement);
const eraser = part("eraser", HTMLButtonElement);
const grid = part("grid", HTMLSelectElement);
const step = part("step", HTMLInputElement);
const dark = part("dark", HTMLButtonElement);
const buttons = ["eraser", "undo", "clear", "check", "next"].map((id) =>
  part(id, HTMLButtonElement),
);
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
const unmark = part("unmark", HTMLButtonElement);

/** How long Check holds the writing, standing in for the minutes the models take. */
const THINKING_MS = 1000;

/** A path with posts along it, drawn by the page: the picture its tasks show. */
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
  if (ref === "posts.svg") return posts();
  throw new Error(`the page has no ${ref}`);
};

/** The task of the page's number `n`, with the grid its controls give. */
function taskFor(n: number): Task {
  return {
    canvas: {
      kind: "handwriting-sheet",
      grid: grid.value as GridKind,
      step: Number(step.value),
    },
    statement: [
      {
        text: `Task ${n}. Along a path 20 m long, a post stands every 4 m, from one end to the other.`,
      },
      { picture: "posts.svg", alt: "A path with six posts along it", width: 340, height: 80 },
      { text: "How many posts are there? Write your solution on the sheet." },
      { picture: "missing.svg", alt: "A picture that does not come", width: 200, height: 60 },
    ],
    lang: "en",
  };
}

let sheet = document.createElement("novatrail-canvas");
let taskNumber = 1;
let changes = 0;
sheet.task = taskFor(taskNumber);
sheet.media = media;
place.append(sheet);

function count(): void {
  counter.textContent = `Task ${taskNumber} · workchange × ${changes}`;
}

/** The sheet's tool, and the Eraser button pressed while it is the eraser. */
function use(tool: Tool): void {
  sheet.tool = tool;
  eraser.setAttribute("aria-pressed", String(tool === "eraser"));
}

function showPicture(png: Blob | null): void {
  if (picture.src !== "") URL.revokeObjectURL(picture.src);
  if (png === null) {
    picture.removeAttribute("src");
    caption.textContent = "";
    return;
  }
  picture.src = URL.createObjectURL(png);
  picture.onload = () => {
    caption.textContent = `${picture.naturalWidth} × ${picture.naturalHeight} px, ${Math.ceil(png.size / 1024)} KB`;
  };
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
 * The groups of the sheet's strokes, drawn under it in sheet units: each stroke a line through its
 * points, each group a box with its label, and the table of labels and stroke IDs (R24). Then the
 * crop of the strokes, with the frames of these groups (R25).
 */
function showGroups(): void {
  const { strokes } = probe(sheet);
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
 * frames; new strokes draw the pictures again.
 */
const pictures = new Map<number, Uint8Array<ArrayBuffer>>();
let picturesOf: readonly Stroke[] | undefined;

function pictureFor(strokes: readonly Stroke[], shown: Crop): Uint8Array<ArrayBuffer> {
  if (picturesOf !== strokes) {
    pictures.clear();
    picturesOf = strokes;
  }
  let png = pictures.get(shown.digit);
  if (png === undefined) {
    png = pictureOf(strokes, shown);
    pictures.set(shown.digit, png);
  }
  return png;
}

/**
 * The crop for checking of the strokes, at the height of digits the field gives, with the frames of
 * the groups over it, and the crop's size at every height of eval (R25).
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

/** The submission of the last Check, as exportWork() is to give it (T15), and the marks given so far. */
let submission: Submission | undefined;
let given: readonly Mark[] = [];

/**
 * What Check sends: the crop of the strokes at the height of digits the field gives, and their
 * groups by the sheet's rule. Marks given before go: they were of the last submission.
 */
function send(): void {
  const { strokes } = probe(sheet);
  const groups = groupsOf(strokes);
  const shown = cropOf(strokes, groups, Number(digit.value));
  given = [];
  sheet.marks = undefined;
  submission = shown === null ? undefined : { crop: shown, groups };
  if (sent.src !== "") URL.revokeObjectURL(sent.src);
  sentGroups.replaceChildren();
  if (shown === null) {
    sent.removeAttribute("src");
    showMarks();
    return;
  }
  sent.width = shown.width;
  sent.height = shown.height;
  sent.src = URL.createObjectURL(new Blob([pictureOf(strokes, shown)], { type: "image/png" }));
  sentBoxes.setAttribute("viewBox", `0 0 ${shown.width} ${shown.height}`);
  for (const { label } of groups) {
    const button = document.createElement("button");
    button.textContent = label;
    button.addEventListener("click", () =>
      mark({ kind: "frame", at: { group: label }, name: `Group ${label}` }),
    );
    sentGroups.append(button);
  }
  showMarks();
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
    sentCaption.textContent = "Check sends the crop of the work; it comes here.";
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

/** The box between two places on the crop, in whole thousandths, min < max (Т-32). */
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
 * The board's Check: the writing and the buttons stop at once, as the board's do, then the picture
 * comes, and both stay stopped while the models would think. A stroke already under way goes on:
 * the element holds its pointer (R20).
 */
async function check(): Promise<void> {
  if (checking) return;
  checking = true;
  const checked = sheet;
  checked.style.pointerEvents = "none";
  for (const button of buttons) button.disabled = true;
  status.textContent = "Checking: no writing until it ends…";
  send();
  try {
    const png = await checked.exportPNG();
    if (png === null) {
      status.textContent = "Write a solution first.";
      return;
    }
    showPicture(png);
    await new Promise((resolve) => setTimeout(resolve, THINKING_MS));
    status.textContent = "";
  } catch (error) {
    status.textContent = `The picture failed: ${error instanceof Error ? error.message : error}`;
  } finally {
    checked.style.pointerEvents = "";
    for (const button of buttons) button.disabled = false;
    checking = false;
  }
}

/** The grid the controls give, by a new task: the work stays. A step out of bounds is left. */
function regrid(): void {
  try {
    sheet.task = taskFor(taskNumber);
    status.textContent = "";
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : String(error);
  }
}

place.addEventListener("workchange", () => {
  changes++;
  count();
  // The picture was of the sheet as it was: once the work changes, it is out of date.
  showPicture(null);
  showGroups();
});
eraser.addEventListener("click", () => use(sheet.tool === "eraser" ? "pen" : "eraser"));
part("undo", HTMLButtonElement).addEventListener("click", () => sheet.undo());
part("clear", HTMLButtonElement).addEventListener("click", () => {
  sheet.clear();
  status.textContent = "";
});
part("check", HTMLButtonElement).addEventListener("click", () => void check());
part("next", HTMLButtonElement).addEventListener("click", () => {
  const next = document.createElement("novatrail-canvas");
  taskNumber++;
  next.task = taskFor(taskNumber);
  next.media = media;
  sheet.replaceWith(next);
  sheet = next;
  // A new sheet starts with the pen.
  use("pen");
  changes = 0;
  showPicture(null);
  showGroups();
  submission = undefined;
  given = [];
  if (sent.src !== "") URL.revokeObjectURL(sent.src);
  sent.removeAttribute("src");
  sentGroups.replaceChildren();
  showMarks();
  status.textContent = "";
  count();
});
grid.addEventListener("change", regrid);
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
digit.addEventListener("change", showGroups);
count();
showGroups();
showMarks();
