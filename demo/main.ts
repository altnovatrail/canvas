// The page to try the element on by hand, as tutor's check board would have it (RUN.md, T34; R20
// in docs/decisions.md). The board's buttons call the element's methods; Check takes the picture
// the board would send and stops the writing for a moment, as the board does while the models
// think; Next task puts a new element in place of the old one. The page listens for workchange
// above the element, where the event still comes from the next task's element. Eraser, which the
// board has not, switches the element's tool between the pen and the eraser (T10; R22): a pen's
// eraser erases whichever it is. just demo serves it.

import "../src/element/index.js";
import type { Tool } from "../src/element/index.js";

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
const buttons = ["eraser", "undo", "clear", "check", "next"].map((id) =>
  part(id, HTMLButtonElement),
);

/** How long Check holds the writing, standing in for the minutes the models take. */
const THINKING_MS = 1000;

let sheet = document.createElement("novatrail-canvas");
let task = 1;
let changes = 0;
place.append(sheet);

function count(): void {
  counter.textContent = `Task ${task} · workchange × ${changes}`;
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
  sheet.replaceWith(next);
  sheet = next;
  // A new sheet starts with the pen.
  use("pen");
  task++;
  changes = 0;
  showPicture(null);
  status.textContent = "";
  count();
});
count();
