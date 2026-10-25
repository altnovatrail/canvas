// The page to try the element on by hand, as tutor's check board would have it (RUN.md, T34; R20
// in docs/decisions.md). The board's buttons call the element's methods; Check takes the picture
// the board would send and stops the writing for a moment, as the board does while the models
// think; Next task puts a new element in place of the old one. The page listens for workchange
// above the element, where the event still comes from the next task's element. Eraser, which the
// board has not, switches the element's tool between the pen and the eraser (T10; R22): a pen's
// eraser erases whichever it is. Each element has a task: its grid, which the page's controls
// change by a new task, and its statement above the sheet, with a picture the page draws and one
// that never comes. Dark theme sets the element's custom properties (T11; R23). The page's tasks
// are its own, made up. just demo serves it.

import "../src/element/index.js";
import type { GridKind, Media, Task, Tool } from "../src/element/index.js";

/** An element of the page, of the type the page has it as. */
function part<T extends HTMLElement>(id: string, type: new () => T): T {
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
  status.textContent = "";
  count();
});
grid.addEventListener("change", regrid);
step.addEventListener("change", regrid);
dark.addEventListener("click", () => {
  const on = document.body.classList.toggle("dark");
  dark.setAttribute("aria-pressed", String(on));
});
count();
