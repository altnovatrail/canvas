// The package's entry point @altnovatrail/canvas: the canvas as a custom element, one for every
// canvas kind, with its markup in an open shadow root (R07). Importing it registers the element,
// once: a page has one element of this name. So far it is the handwriting sheet with its input,
// one pointer at a time (RUN.md, T09; R18), its undo and clearing (T33; R19). Its eraser takes
// strokes off whole, by the path of a press, as the tool or a pen's eraser, and the sheet keeps the
// history of writing (T10; R22). The sheet is a stack of layers, the task's grid on its template
// and the task's statement above it, its look the consumer's to theme (T11; R23). The tutor's
// marks of a submission hold on to the learner's strokes, and a frame shows where each is, over
// the work (T14; R26). The history of writing comes in and goes out, an event tells of every
// action, and the work for checking is the crop with the context of its submission (T15; R27).
// Above it all stands the element's own row of buttons — the tools the task allows, undo and
// clearing — labelled in the element's `lang` (T41; R28). On a tablet a pen's touch puts the page
// in pen mode, where a finger writes nothing and a button lets it write again, a palm writes
// nothing, and two fingers scroll (T35; R29). The task comes in the names of the module format
// 0.4, checked as its schema checks it, and the module's manifest gives the height of a digit and
// the statement's language (T44; R32). Up and Down in the row scroll what two fingers would, with
// a single pointer (T45; R33). The workbook's lines, laid out on its page, stand on the template in
// place of the grid — numbers, text and boxes, which a screen reader reads in the task's order (T51;
// R35, R36). Each stroke is in one box or in none, by a rule of whole numbers, and `filled` tells
// which boxes hold one: a filled box's frame is thicker, and its name says so (T48; R37). A
// workbook's work for checking is the crop of each filled box, with the table of the boxes' strokes
// for its context (T49; R38). A lesson's worked example it shows on a sheet the learner does not
// write on: its statement above the sheet, its grid, and a row without the tools of writing, while
// a finger or a pen scrolls the sheet as the browser scrolls the statement (T59; R42). The parts of
// its demo the learner opens one at a time with the row's Next, into a list above the sheet that a
// polite region tells a screen reader of, and hides and shows with Demo; app keeps how far the
// learner has gone by `demoState` and `demochange` (T60; R42). The pictures of the statement and of
// the demo come from the consumer's media, one file for each reference, all of them as the task or
// the example comes: a part opened shows its picture at once (T64; R42). A picture on an area of
// the sheet stands on the layer of the author's demo, over its area, and the sheet scrolls to the
// area as the part opens (T61; R42). A worked example on a workbook lays its lines out as a task's,
// and a part of its demo that fills a box writes the box's value in it (T85; R61). The types of
// its contract with app are spec's, of @altnovatrail/spec/canvas: the element implements its CanvasElement, and the package puts the
// element and its events in the DOM's maps (T69; R07). The keyboard goes into the sheet and out:
// a container that scrolls is a region named by the canvas kind, with a stop of Tab of its own and
// a ring when the keyboard brings the focus there (T93; R33); for a `lang` the labels are not in,
// the container is in theirs and the column in the element's (T106; R74). The row's Zoom in and Zoom out step
// the page's zoom of the sheet from its fit to twice it, and a zoomed sheet scrolls across as well
// as down, with Left and Right in the row, two fingers and the keys (T94).

import type {
  CanvasElement,
  CanvasEventMap,
  ExportedWork,
  HistoryChange,
  Media,
  ToolChange,
} from "@altnovatrail/spec/canvas";
import type { Vec2 } from "perfect-freehand";
import { type Cell, cellOf, cellsOf, type Filled, filledOf, sheetFilledOf } from "../core/boxes.js";
import { Clock } from "../core/clock.js";
import { ERASER_BUTTON, Eraser } from "../core/eraser.js";
import {
  type CheckedExample,
  DEMO_START,
  type DemoState,
  demoStateOf,
  type ExamplePart,
  exampleOf,
  exampleTemplate,
  filledBy,
  fillValue,
  sameExample,
  type WorkedExample,
} from "../core/example.js";
import { sameItems } from "../core/fields.js";
import { type Box, boxOf } from "../core/geometry.js";
import { gridPath } from "../core/grid.js";
import { type Contact, Hands } from "../core/hands.js";
import { begins, type HistoryEvent, sameHistory } from "../core/history.js";
import type { InkPoint, Stroke } from "../core/ink.js";
import { type Manifest, NO_MANIFEST, type Settings, settingsOf } from "../core/manifest.js";
import { type Marks, marksOf, type Placed, placesOf, shownOf } from "../core/marks.js";
import { INK_REACH, outline } from "../core/outline.js";
import {
  isBox,
  LAYOUT,
  type Page,
  type PageBox,
  type PageItem,
  type PageText,
  pieceWidth,
} from "../core/page.js";
import { type PointerSample, Recorder } from "../core/recorder.js";
import { fitScale, K_MAX, scaleFor, toSheet, type View } from "../core/screen.js";
import { SHEET } from "../core/sheet.js";
import { cellsForCheck, workForCheck } from "../core/submission.js";
import {
  isTool,
  isWorkbook,
  NO_TASK,
  sameLayer,
  sameStatement,
  type Task,
  type Template,
  type Tool,
  taskOf,
  templateOf,
  wholeSheet,
} from "../core/task.js";
import { nextIdOf, resumeOf, Work } from "../core/work.js";
import { placeOver, SVG, write } from "./attributes.js";
import { knows, labelsFor, say } from "./labels.js";
import { Parts } from "./parts.js";
import { Pictures } from "./pictures.js";
import { attachProbe } from "./probe.js";
import { PAGE_ZOOM, PEN_MODE } from "./session.js";
import { Statement } from "./statement.js";
import { type DemoControls, type RowKind, Tools } from "./tools.js";

/**
 * The types of the contract of canvas and app are spec's (R74 spec; R07): the element as
 * CanvasElement has it, what its events tell and the work it gives for checking, here, and the data
 * — the history of writing, the context of a submission, the filled slots and the state of a demo
 * — through the DOM-free part. The entry point gives them under spec's names, the same types, the
 * media (T73) and the tutor's marks (T16) too. The crop and a task with its temporary tools are
 * the element's own (R26, R41).
 */
export type {
  Box,
  CanvasElement,
  CanvasEventMap,
  DemoChangeEvent,
  ExportedCell,
  ExportedSheet,
  ExportedWork,
  ExportedWorkbook,
  HistoryChange,
  HistoryChangeEvent,
  Media,
  ToolChange,
  ToolChangeEvent,
} from "@altnovatrail/spec/canvas";
export type { Filled, Filling } from "../core/boxes.js";
export type { Crop, Frame } from "../core/crop.js";
export type { DemoState, WorkedExample } from "../core/example.js";
export type { GridKind } from "../core/grid.js";
export type { Group } from "../core/groups.js";
export type { HistoryEvent } from "../core/history.js";
export type { InkPoint, Stroke } from "../core/ink.js";
export type { Manifest } from "../core/manifest.js";
export type {
  Anchor,
  CellPlace,
  CropNumbers,
  Mark,
  Marks,
  SheetSubmission,
  Submission,
  WorkbookSubmission,
} from "../core/marks.js";
export type { Canvas, Task, Tool } from "../core/task.js";

/** The name the element is registered under. */
export const TAG = "novatrail-canvas";

/** The colour of the ink unless the consumer's theme gives one. */
const INK = "#111";
/** The colour of the sheet unless the consumer's theme gives one. */
const PAPER = "#fff";
/** The event the element sends after every action on the sheet, with the history's new events. */
const HISTORY_CHANGE = "historychange";
/** The event the element sends when the learner chooses another tool with its buttons. */
const TOOL_CHANGE = "toolchange";
/** The event the element sends when the learner opens a part of the demo, or hides or shows it. */
const DEMO_CHANGE = "demochange";
/** What Next and Demo control, by their IDs in the shadow root: the region, and the list (R42). */
const DEMO_IDS: DemoControls = { status: "demo-status", parts: "demo-parts" };
/**
 * The colour of the tutor's frames unless the consumer's theme gives one: a blue, for now, and not
 * a red, which would read as «wrong» (E4 in RUN.md, «Не входит»).
 */
const MARK = "#2563eb";
/** How far a frame stands off the points of its strokes, in sheet units, as canvas-api's (R26). */
const MARK_PADDING = 10;
/** The rounding of a frame's corners, in sheet units. */
const MARK_CORNER = 6;

/**
 * How near a stroke's ink the eraser takes it, in CSS pixels: the same on every screen, whatever
 * the sheet's scale (R22). T22 tries it on devices.
 */
const ERASER_RADIUS_PX = 10;

/**
 * How much of what it shows a press of Up or Down scrolls (R33): four fifths, as WebKit pages on
 * an iPad, so that the last lines stay in sight. T22 tries it on devices.
 */
const UP_DOWN = 4 / 5;

// The statement and the sheet stand in a column of their own, as wide as the element up to
// 1000 CSS pixels and in its middle beyond, and scroll in a container of their own, by the
// browser's own scrolling: the wheel, the scroll bar and the keyboard work as anywhere on a page.
// The page's zoom widens the column with the sheet, to twice its fit, and the container scrolls
// it across too, left to right whatever the page's direction, while the statement and a demo's
// parts stay as wide as the fit and stick to its left, in the element's own direction: they wrap
// as before, and scroll down alone (T94). Left and Right stand in that order in a row that runs
// right to left too: they point to the sides of the screen. The layers of the sheet stand in its visible part, the stage, which sticks to the
// container's top and left, and each shows what lies there, shifted in the frame the ink is drawn
// in (R18, R23; architecture 3.2 in docs/architecture.md).
// Above the column, as wide, stands the row of the element's own buttons, outside the container's
// scrolling: it sticks to the top of whatever scrolls the element, as far down as the consumer's
// --novatrail-canvas-top says, while the element is in sight, over the sheet as it scrolls by
// (R28). In a low window, where the row would cover more than a quarter of what it sticks in, it
// stands in its place instead, `loose`, and goes with the scrolling (1.4.10, 2.4.11). A button in
// focus shows a ring in the ink's colour, two pixels out, that the row's side margins keep on its
// paper; an unavailable one is paler by its colour, not its opacity, which would pale the ring too
// (2.4.7, 1.4.11). Nothing in the element moves but the scrolling, which jumps (2.3.3). The
// element is as tall as the row, the statement and the sheet unless it is given a height: then
// the statement and the sheet scroll in it, under the row. A worked example's open
// parts stand between the statement and the sheet, and the region that tells of them is out of
// sight, but not out of the tree a screen reader reads, where a hidden region would tell nothing
// (R42). A picture's frame there stands in its item's line, from its top, so that the item's
// number stands at the top too, as a paragraph's does, and not at the picture's bottom (T64). A
// picture on an area of the sheet stands on the layer of the author's demo, and the sheet scrolls
// to a hidden box of the area in its own flow, which neither paints nor takes a pointer (T61). On
// the canvas the browser neither scrolls nor zooms: the pointer writes, and two fingers scroll by
// the element's own code (R29), as Up and Down of the row do with a single pointer, a pair the
// row wraps together (R33).
// The canvas and the buttons take pointer events only as the element does: a consumer's
// pointer-events: none on the element stops the writing and the buttons' pointer, though not
// their keys (R20, R28). A worked example's canvas takes no pointer at all: a finger or a pen on
// its sheet scrolls, and zooms, as the browser does on the statement, and a long press or a right
// click opens no menu over the sheet all the same (R42). The theme is the consumer's, by custom
// properties that the shadow tree inherits; with forced colours the system's colours stand in for
// them. The element is horizontal whatever writing mode the page is in: a sheet has no other (R36).
//
// A workbook's lines are printed in the ink's colour and the consumer's font, and nothing else the
// element inherits — spacing, weight, transforms, the direction — moves them: `all: initial` takes
// it off, and what the print needs comes back (R36). A box's frame is one CSS pixel at any scale,
// on whole device pixels: an antialiased line of one pixel would lose its contrast. A filled box's
// is three, in the same ink, and the system's highlight with forced colours (R37).
const STYLE = `
:host { display: flex; flex-direction: column; isolation: isolate; writing-mode: horizontal-tb; }
:host([hidden]) { display: none; }
.tools {
  position: sticky; top: var(--novatrail-canvas-top, 0px); z-index: 1; flex: none;
  box-sizing: border-box; width: min(100%, ${K_MAX * SHEET.width}px); margin: 0 auto;
  padding: 8px 4px; display: flex; flex-wrap: wrap; gap: 8px;
  background: var(--novatrail-canvas-paper, ${PAPER}); color: var(--novatrail-canvas-ink, ${INK});
}
.tools.loose { position: static; }
.tools .demo, .tools .choice, .tools .updown, .tools .zoom, .tools .across {
  display: flex; gap: 8px; margin-inline-end: 16px;
}
.tools:dir(rtl) .across { flex-direction: row-reverse; }
.tools button {
  box-sizing: border-box; min-width: 44px; min-height: 44px; padding: 0 8px; margin: 0;
  font: inherit; color: inherit; background: transparent; cursor: pointer;
  border: 1px solid currentColor; border-radius: 6px;
}
.tools [aria-checked="true"] {
  background: var(--novatrail-canvas-ink, ${INK}); color: var(--novatrail-canvas-paper, ${PAPER});
  border-color: var(--novatrail-canvas-ink, ${INK});
}
.tools button:focus-visible {
  outline: 2px solid var(--novatrail-canvas-ink, ${INK}); outline-offset: 2px;
}
.tools [aria-disabled="true"] {
  color: color-mix(
    in srgb, var(--novatrail-canvas-ink, ${INK}) 40%, var(--novatrail-canvas-paper, ${PAPER})
  );
  cursor: default;
}
@supports not (color: color-mix(in srgb, red 40%, blue)) {
  .tools [aria-disabled="true"] { opacity: 0.4; }
}
.tools [hidden] { display: none; }
.tools button svg {
  display: inline-block; width: 1.125em; height: 1.125em; margin-inline-end: 4px;
  vertical-align: -0.25em; fill: currentColor;
}
.tools:dir(rtl) svg.mirrored { transform: scaleX(-1); }
.frame {
  position: relative; flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column;
}
.viewport {
  flex: 1 1 auto; min-height: 0; overflow-x: hidden; overflow-y: auto; overflow-anchor: none;
  outline: none; -webkit-tap-highlight-color: transparent;
}
.viewport.zoomed { overflow-x: auto; direction: ltr; }
.ring { position: absolute; inset: 0; z-index: 0; pointer-events: none; display: none; }
.viewport:focus-visible + .ring {
  display: block; outline: 2px solid var(--novatrail-canvas-ink, ${INK}); outline-offset: -2px;
}
.column {
  position: relative; width: calc(min(100%, ${K_MAX * SHEET.width}px) * var(--zoom));
  margin: 0 auto;
}
.zoomed .statement, .zoomed .parts {
  position: sticky; left: 0; box-sizing: border-box; width: calc(100% / var(--zoom));
  direction: var(--direction, ltr);
}
.statement { padding: 0 0 12px; overflow-wrap: break-word; }
.statement:empty { display: none; }
.statement p { margin: 0 0 8px; }
.picture {
  box-sizing: border-box; max-width: 100%; margin: 0 0 8px; padding: 8px;
  display: flex; align-items: center; justify-content: center; text-align: center;
  border: 1px dashed currentColor; font-size: 0.875em;
}
.picture.decorative, .picture.shown { border: none; padding: 0; }
.picture img { display: block; width: 100%; height: 100%; object-fit: contain; }
.parts { margin: 0 0 12px; padding-block: 0; padding-inline: 2em 0; overflow-wrap: break-word; }
.parts:empty, .parts[hidden] { display: none; }
.parts li { margin: 0 0 8px; }
.parts .picture { display: inline-flex; vertical-align: top; margin: 0; }
.status {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; border: 0;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}
.sheet {
  position: relative; aspect-ratio: ${SHEET.width} / ${SHEET.height};
  background: var(--novatrail-canvas-paper, ${PAPER});
}
.stage {
  position: sticky; top: 0; left: 0; max-height: 100%; overflow: clip;
  user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
}
.spot { position: absolute; visibility: hidden; }
.stage > * { position: absolute; inset: 0; width: 100%; height: 100%; }
.stage > :not(canvas) { pointer-events: none; }
.grid {
  fill: none; stroke: var(--novatrail-canvas-grid, #d3dbe5); stroke-width: 1px;
  vector-effect: non-scaling-stroke;
}
.grid.dots { stroke-width: 3px; stroke-linecap: round; }
.print {
  all: initial; font-family: inherit; visibility: inherit; pointer-events: none; direction: ltr;
  font-variant-numeric: tabular-nums; font-size: ${LAYOUT.size}px;
  color: var(--novatrail-canvas-ink, ${INK});
}
.print text { fill: currentColor; }
.print rect {
  fill: none; stroke: currentColor; stroke-width: 1px; vector-effect: non-scaling-stroke;
  shape-rendering: crispEdges;
}
.print rect.filled { stroke-width: 3px; }
canvas {
  display: block; color: var(--novatrail-canvas-ink, ${INK}); transition: color 1ms step-end;
  touch-action: none;
}
.sheet.example canvas { pointer-events: none; touch-action: auto; }
.marks rect {
  fill: none; stroke: var(--novatrail-canvas-mark, ${MARK}); stroke-width: 2px;
  vector-effect: non-scaling-stroke;
}
.marks rect.under { opacity: 0.25; }
@media (forced-colors: active) {
  .sheet { outline: 1px solid CanvasText; }
  .grid { stroke: GrayText; }
  .print text { fill: CanvasText; }
  .print rect { stroke: CanvasText; }
  .print rect.filled { stroke: Highlight; }
  canvas { color: CanvasText; }
  .marks rect { stroke: Highlight; }
  .tools { background: Canvas; color: CanvasText; }
  .tools button { background: ButtonFace; color: ButtonText; border-color: ButtonBorder; }
  .tools [aria-checked="true"] {
    background: Highlight; color: HighlightText; border-color: Highlight;
  }
  .tools [aria-disabled="true"] { color: GrayText; border-color: GrayText; }
  .tools button:focus-visible, .viewport:focus-visible + .ring { outline-color: Highlight; }
}
`;

/** The sheet of STYLE that the elements of a document adopt, made by the first of them there. */
const sheets = new WeakMap<Document, CSSStyleSheet>();

/**
 * Gives the element's shadow root its style, as a sheet the root adopts, and not a `<style>` in
 * its tree: a consumer's content security policy that allows no inline style, as app's
 * `style-src 'self'`, blocks the one and not the other, and the element asks of the policy only
 * `img-src blob:` (R51; the second amendment of 2026-11-02 to R36 spec). A root adopts only a sheet
 * made for its own document, by that document's window, and an element moved into another document
 * comes there without its sheets: it adopts that document's sheet then. A document without a
 * window, which can make no sheet, leaves the element unstyled till it comes into one that can.
 */
function adoptStyle(root: ShadowRoot): void {
  const owner = root.ownerDocument;
  const view = owner.defaultView;
  if (view === null) return;
  let sheet = sheets.get(owner);
  if (sheet === undefined) {
    sheet = new view.CSSStyleSheet();
    sheet.replaceSync(STYLE);
    sheets.set(owner, sheet);
  }
  root.adoptedStyleSheets = [sheet];
}

/** What two fingers scroll in a gesture, how much the page scales it, and the part of a pixel owed. */
interface Latch {
  readonly target: Element | Window;
  readonly scale: number;
  rest: number;
}

/**
 * An element's client box on the screen, and how much the page scales it across the screen and
 * down it.
 */
interface ClientBox {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly across: number;
  readonly down: number;
}

/** The axes a scroll goes along: across the sheet, for Left and Right, and down it (T94). */
type Axis = "x" | "y";

/** The view of the sheet, with the visible part's top left corner and size on the screen. */
interface Screen extends View {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  /** The part of the canvas the container shows, in client coordinates. */
  readonly shown: {
    readonly left: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
  };
}

/** A finished stroke's path, with the top and the bottom of its outline on the sheet. */
interface Ink {
  readonly path: Path2D;
  readonly top: number;
  readonly bottom: number;
}

/**
 * A mark the sheet shows (R26): its name and where it is, its frame on the layer of the marks, the
 * frame as last drawn, in sheet units, and whether the stroke under way is writing over it.
 */
interface Shown {
  readonly name: string;
  readonly placed: Placed;
  readonly rect: SVGRectElement;
  frame: Box | null;
  under: boolean;
  /** What the frame's attributes say, so that a frame that has not changed writes nothing. */
  drawn: string;
}

/** An `<svg>` layer of the sheet, which counts in sheet units and hides from screen readers. */
function svgLayer(name: string): SVGSVGElement {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("class", name);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  return svg;
}

/**
 * The layer of the tutor's marks, over the work: a screen reader reads each mark by its name, and
 * the layer itself is no picture of its own (R26).
 */
function marksLayer(): SVGSVGElement {
  const svg = svgLayer("marks");
  svg.removeAttribute("aria-hidden");
  svg.setAttribute("role", "none");
  return svg;
}

/** An HTML layer of the sheet, empty in the first code: the module's widget, from stage 4. */
function htmlLayer(name: string): HTMLDivElement {
  const div = document.createElement("div");
  div.className = name;
  div.setAttribute("aria-hidden", "true");
  return div;
}

/**
 * The element `<novatrail-canvas>`: the contract's `CanvasElement` (R74 spec), and beyond it the
 * commands undo and clear, which the contract does not name.
 */
export class NovatrailCanvas extends HTMLElement implements CanvasElement {
  /**
   * The wrapper, which does not scroll, of the container that scrolls and of the ring of its focus
   * over it: an outline of the container itself would stand under the sheet's paper and stage,
   * which are positioned in it (T93).
   */
  readonly #wrapper = document.createElement("div");
  readonly #viewport = document.createElement("div");
  readonly #ring = document.createElement("div");
  readonly #column = document.createElement("div");
  readonly #sheet = document.createElement("div");
  /** The sheet's visible part, where its layers stand, bottom to top (concepts 8 spec; R23). */
  readonly #stage = document.createElement("div");
  /** The author's template: a sheet's grid, or a workbook's lines, a list of its items (R36). */
  readonly #template = svgLayer("template");
  readonly #grid = document.createElementNS(SVG, "path");
  readonly #print = document.createElementNS(SVG, "g");
  readonly #lines = document.createElementNS(SVG, "g");
  /** The module's widget, from stage 4 (R16 spec): empty for now. */
  readonly #widget = htmlLayer("widget");
  /** The author's demo: a worked example's pictures on areas of the sheet (T61; R42). */
  readonly #show = svgLayer("show");
  /** The tutor's layer, in two: the sketch under the learner's work, the marks over it (T14). */
  readonly #sketch = svgLayer("sketch");
  /** The learner's work: the ink. */
  readonly #canvas = document.createElement("canvas");
  readonly #marksLayer = marksLayer();
  readonly #context = this.#canvas.getContext("2d");
  /** The canvas's style as it is computed, read live: its colour is the ink's on the screen. */
  readonly #canvasStyle = getComputedStyle(this.#canvas);
  /** The files of the pictures of the statement and of a worked example's demo (R23, R42). */
  readonly #pictures = new Pictures();
  /** The task's statement, above the sheet (R23). */
  readonly #statement = new Statement(this.#pictures);
  /** A worked example's open parts, under its statement, and the region that tells of them (R42). */
  readonly #parts = new Parts(DEMO_IDS, this.#pictures);
  /** The element's own buttons, above the statement and the sheet (R28). */
  readonly #tools = new Tools(
    {
      choose: (tool) => this.#choose(tool),
      undo: () => this.undo(),
      clear: () => this.clear(),
      upOrDown: (onward) => this.#step(onward, "y"),
      zoom: (larger) => this.#zoomBy(larger),
      leftOrRight: (onward) => this.#step(onward, "x"),
      // The finger writes again on every sheet of the page, with no event: the next pen's touch
      // puts the page back in pen mode (R29).
      fingers: () => {
        PEN_MODE.on = false;
      },
      next: () => this.#openNext(),
      toggle: () => this.#toggleDemo(),
    },
    DEMO_IDS,
  );
  /** The sheet's clock, for its strokes and its actions alike (R22). */
  readonly #clock = new Clock();
  /**
   * The strokes on the sheet, the actions undo takes back and the history of writing (R19, R22): a
   * new work when the sheet is given another history (R27).
   */
  #work = new Work(this.#clock);
  /** How many events of the history `historychange` has told of, and whether it is telling now. */
  #told = 0;
  #telling = false;
  /** The input: a finished stroke goes onto the work, and the work has changed. */
  readonly #recorder = new Recorder((stroke) => {
    this.#work.write(stroke);
    this.#changed();
  }, this.#clock);
  /** The eraser: what a press came near leaves the work when it lifts, if still on the sheet. */
  readonly #eraser = new Eraser(
    (from, to, reach) => this.#work.near(from, to, reach),
    (ids, time) => {
      if (this.#work.erase(ids, time)) this.#changed();
    },
  );
  /**
   * The hands on the sheet (R29): which pointer may write, which is a palm, and which two fingers
   * scroll, in the page's pen mode. The recorder and the eraser say which pointer writes.
   */
  readonly #hands = new Hands(
    {
      writer: () => this.#writer(),
      drop: (pointerId) => this.#drop(pointerId),
      scroll: (dx, dy, fresh) => this.#scroll(dx, dy, fresh),
      across: () => this.#zoom > 1,
    },
    PEN_MODE,
  );
  /** Whether the row shows the finger's button: it comes and goes between strokes alone. */
  #finger = false;
  /**
   * What two fingers scroll in the gesture under way, down and across, each chosen at the first
   * step that goes along its axis (T94): undefined till then, and null when nothing scrolls so.
   */
  #latch: Latch | null | undefined;
  #latchAcross: Latch | null | undefined;
  /**
   * A scroll of the page, or of an ancestor of the element in the page's own tree, heard on its way
   * down: Up or Down may have come to an end, or left one (R33). Other scrollers are none of theirs.
   */
  readonly #heard = (event: Event): void => {
    const target = event.target;
    if (target === document || (target instanceof Element && holds(target, this))) {
      // A new --novatrail-canvas-top changes no size: the next scroll is the first to hear of it,
      // by one read of the row's style, and only a new offset asks anew whether the row sticks.
      if (getComputedStyle(this.#tools.element).top !== this.#topSeen) this.#stick();
      this.#edges();
    }
  };
  /**
   * The page grown or shrunk, or the window, the scroller the row sticks in or the row itself: what
   * scrolls the element may have room now, or none, and the row may cover too much of it to stick.
   */
  readonly #resized = (): void => {
    this.#stick();
    this.#region();
    this.#edges();
  };
  readonly #page = new ResizeObserver(this.#resized);
  /** The scroll container the row sticks in, which `#page` watches, or null for the page's viewport. */
  #port: Element | null = null;
  /** The row's `top` as the last check of whether it sticks read it: the consumer's offset. */
  #topSeen = "";
  #unwatchPen: (() => void) | undefined;
  #unwatchZoom: (() => void) | undefined;
  /** The page's zoom as the sheet is laid out by it (T94). */
  #zoom = 0;
  #tool: Tool = "pen";
  #task: Task | undefined;
  /** A lesson's worked example as the consumer gave it, and as the element checked it (R42). */
  #workedExample: WorkedExample | undefined;
  #example: CheckedExample | undefined;
  /** How far the learner has gone through the example's demo, frozen, or undefined without one. */
  #demoState: DemoState | undefined;
  #shownTemplate: Template = NO_TASK;
  /**
   * A workbook's page, its boxes in the task's order and their frames, and the box each stroke is
   * in, worked out once: a stroke never changes (R22), and a new page starts the map anew.
   */
  #laid: Page | undefined;
  #cells: readonly Cell[] = [];
  #rects: readonly SVGRectElement[] = [];
  /**
   * The values a worked example's demo has written in its boxes, by line and box from 1, and their
   * texts on the page, one for each frame that has had one (T85; R60).
   */
  #fills: ReadonlyMap<string, string> = new Map();
  #values: (SVGTextElement | undefined)[] = [];
  #taken = new WeakMap<Stroke, number>();
  /** Which answer slots are filled, the same array until one changes, or null (R37, R42). */
  #filled: Filled | null = null;
  /** Whether the task's one answer is anywhere on the sheet or the whole sheet (R42). */
  #whole = false;
  /** The module's manifest as the consumer gave it, and what the element makes of it (R32). */
  #manifest: Manifest | undefined;
  #settings: Settings = NO_MANIFEST;
  /** The tutor's marks as the consumer gave them, and those of them that have a place (R26). */
  #marks: Marks | undefined;
  /** The marks as they were checked when given: a new history places these, whatever became of those. */
  #given: Marks | undefined;
  /**
   * The last history given that was the sheet's, how long it was then and the sheet's history it
   * was: given again, as long, while the sheet's is still that one, it is not walked through again.
   */
  #equal:
    | { readonly given: unknown; readonly length: number; readonly history: unknown }
    | undefined;
  #shown: readonly Shown[] = [];
  /** The strokes on the sheet by ID, kept while the sheet's strokes are the same array. */
  #onSheet: { readonly strokes: readonly Stroke[]; readonly byId: ReadonlyMap<number, Stroke> } = {
    strokes: [],
    byId: new Map(),
  };
  /** The box of each stroke's points, worked out once: a stroke never changes (R22). */
  readonly #pointBoxes = new WeakMap<Stroke, Box>();
  /** The stroke under way, and how many of its points the marks have been checked against. */
  #writing: { readonly stroke: Stroke; seen: number } | undefined;
  /** The path of each finished stroke, outlined once (R18). */
  readonly #inks = new WeakMap<Stroke, Ink>();
  readonly #resize = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.target !== this.#viewport) continue;
      const box = entry.contentBoxSize[0];
      if (box !== undefined) this.#area = { width: box.inlineSize, height: box.blockSize };
    }
    // The container's new size, the statement's or that of the list of a demo's parts: each moves
    // the sheet.
    this.#layout();
  });
  /** The size of the container's visible part, in CSS pixels as laid out, before any transform. */
  #area: { readonly width: number; readonly height: number } | undefined;
  /**
   * `k` of the last layout, and where the sheet's top was then in the container's content, in CSS
   * pixels as laid out: under the statement.
   */
  #k = 0;
  #sheetAt = 0;
  /** The sheet's left in the container's content, as laid out then, in CSS pixels (T94). */
  #sheetAtX = 0;
  /** The top and the left of the visible part, in sheet units, kept from the last scroll. */
  #vy = 0;
  #vx = 0;
  /** The view box the layers were last given, so that a frame without a scroll writes none. */
  #viewBox = "";
  #frame = 0;
  #outlines = 0;
  #unwatchDensity: (() => void) | undefined;
  #unwatchColours: (() => void) | undefined;

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    adoptStyle(root);
    this.#wrapper.className = "frame";
    this.#viewport.className = "viewport";
    this.#ring.className = "ring";
    this.#column.className = "column";
    this.#sheet.className = "sheet";
    this.#stage.className = "stage";
    this.#grid.setAttribute("class", "grid");
    this.#print.setAttribute("class", "print");
    // The constructor reads no attribute: the labels of a demo's boxes are English till `lang` comes.
    this.#nameBoxes(null);
    this.#lines.setAttribute("role", "list");
    this.#print.append(this.#lines);
    this.#template.append(this.#grid, this.#print);
    this.#show.append(this.#parts.layer);
    this.#stage.append(
      this.#template,
      this.#widget,
      this.#show,
      this.#sketch,
      this.#canvas,
      this.#marksLayer,
    );
    this.#sheet.append(this.#stage, this.#parts.spot);
    this.#column.append(this.#statement.element, this.#parts.list, this.#parts.status, this.#sheet);
    this.#viewport.append(this.#column);
    this.#wrapper.append(this.#viewport, this.#ring);
    root.append(this.#tools.element, this.#wrapper);
    this.#zoomTo(PAGE_ZOOM.value);
    this.#lay(NO_TASK);
    this.#refresh();

    this.#canvas.addEventListener("pointerdown", (event) => this.#down(event));
    this.#canvas.addEventListener("pointermove", (event) => this.#move(event));
    this.#canvas.addEventListener("pointerup", (event) => this.#up(event));
    this.#canvas.addEventListener("pointercancel", (event) => {
      this.#drop(event.pointerId);
      this.#lifted(event.pointerId);
    });
    // A stroke or an erasing that ends here, or on its pointerup, lands through its handler, which
    // draws the sheet anew. A captured pointer comes here after its pointerup too, and finds the
    // hands done with it; one that a script made, which no capture holds, has its pointerup alone.
    this.#canvas.addEventListener("lostpointercapture", (event) => {
      this.#recorder.end(event.pointerId);
      this.#eraser.end(event.pointerId);
      this.#lifted(event.pointerId);
    });
    // A long press of a pen or a finger, or a right click, opens no menu over the sheet: the
    // canvas's event comes up to the stage, and so does the stage's own, where a worked example's
    // sheet takes the pointer instead (R42).
    this.#stage.addEventListener("contextmenu", (event) => event.preventDefault());
    // A new colour of the ink, from the consumer's theme or the page's colour scheme, ends a
    // transition of the canvas's colour a millisecond long: the ink is drawn anew in it.
    this.#canvas.addEventListener("transitionend", () => this.#request());
    this.#canvas.addEventListener("transitioncancel", () => this.#request());
    this.#viewport.addEventListener("scroll", () => this.#scrolled(), { passive: true });
    // A container that has nothing to scroll any more keeps its stop of Tab while it has the focus.
    this.#viewport.addEventListener("blur", () => this.#region());

    attachProbe(this, () => ({
      strokes: this.#work.strokes,
      live: this.#recorder.live,
      pending: [...this.#eraser.pending],
      outlines: this.#outlines,
      view: this.#view(),
      marks: this.#shown.map(({ name, placed, frame }) => ({ name, ids: placed.ids, frame })),
      roles: this.#hands.roles,
    }));

    this.#adopt("tool");
    this.#adopt("task");
    this.#adopt("workedExample");
    // The demo's state after its example: it is a TypeError without one.
    this.#adopt("demoState");
    this.#adopt("manifest");
    this.#adopt("media");
    // The history before the marks: they hold on to its strokes.
    this.#adopt("history");
    this.#adopt("marks");
  }

  /** The element follows its own `lang`: its buttons are labelled in it (R07, R28). */
  static readonly observedAttributes = ["lang"];

  /**
   * What a press of the primary button does: "pen" writes, as the element starts, and "eraser"
   * erases (R22). The learner switches it with the element's own buttons, which say a choice of
   * theirs with a `toolchange`, and the consumer may set it too, which says nothing (R28). A press
   * under way goes on as it began. A pen's eraser erases whatever the tool. A task without the
   * eraser has none of it: "eraser" is a TypeError then, and a new task without it puts the pen
   * back. A worked example has the pen alone, which writes nothing on its sheet (R42).
   */
  get tool(): Tool {
    return this.#tool;
  }

  set tool(tool: Tool) {
    if (!isTool(tool)) {
      throw new TypeError(`the tool of <${TAG}> is "pen" or "eraser", not ${JSON.stringify(tool)}`);
    }
    if (!this.#shownTemplate.tools.includes(tool)) {
      const shown = this.#example === undefined ? "task" : "worked example";
      throw new TypeError(`the ${shown} of <${TAG}> allows no ${tool}`);
    }
    this.#tool = tool;
    this.#refresh();
  }

  /**
   * The open view of the task, of the module format 0.4 (R32): its ID, its statement, which the
   * element shows above the page (R23), what the statement gives and asks, which app shows (R57
   * spec), its canvas — the kind, the sheet's grid and the tools the task allows (R28) — and its
   * items. A workbook's items are its lines, which the template shows, laid out on the page (R35,
   * R36). The type is spec's, with the element's own tools (R73 spec; R41). A task the schema
   * refuses is a TypeError that names the field, a field the open view has not among it, and so are
   * a workbook whose lines do not fit, at the first item that does not (R35), and an answer slot in
   * a zone; the sheet passes over a choice and an item's text, which app shows. Another task of the
   * same layer, tools and statement changes nothing, and any other changes the template alone, of
   * either kind: the work stays, for the next task is a new element (R20). A task without the
   * eraser puts the pen back, with no event. While a worked example is shown a task is a TypeError,
   * and `undefined` changes nothing: the element shows one or the other (R42).
   */
  get task(): Task | undefined {
    return this.#task;
  }

  set task(task: Task | undefined) {
    if (task === this.#task) return;
    if (this.#example !== undefined) {
      throw new TypeError(
        `<${TAG}> shows a worked example: a task is shown by a new element, or once the example is undefined`,
      );
    }
    const checked = task === undefined ? undefined : taskOf(task);
    const template = templateOf(checked);
    this.#task = task;
    this.#whole = wholeSheet(checked);
    this.#present(template);
  }

  /**
   * A lesson's worked example (R42; R58 spec): the open view of a segment `worked_example` of the
   * module format 0.4 — its statement, which the element shows above the sheet as a task's (R23),
   * the grid of its sheet or the lines of its workbook, and the parts of the author's demo, which
   * on a workbook fill the lines' boxes with their values (T85). The type is spec's (R73 spec; R41).
   * The element shows a task or a worked example, not both: an example while a task is given, while
   * the sheet has a history of writing, or while a stroke or an erasing is under way, is a
   * TypeError, and so is one the schema refuses, at its field. `undefined` takes the example off,
   * and the sheet is one with no task again. An example equal to the one shown changes nothing, and
   * another replaces it, its grid and its statement apart, as a task does.
   *
   * On a worked example's sheet the learner does not write: the canvas takes no input, and a finger
   * or a pen there scrolls the sheet as the browser scrolls the statement. Its row has no tools of
   * writing and is named a worked example's. `task`, `history` other than the empty one and
   * `marks` are TypeErrors, and so is an eraser: the tool is the pen alone, and `exportWork()` and
   * `filled` give null. The next segment of a lesson is a new element (R20).
   *
   * The parts of the demo the learner opens one at a time with the row's Next, into a list between
   * the statement and the sheet, and hides and shows whole with Demo; `demoState` tells how far
   * they have gone. Another example starts its demo at the beginning.
   */
  get workedExample(): WorkedExample | undefined {
    return this.#workedExample;
  }

  set workedExample(example: WorkedExample | undefined) {
    if (example === this.#workedExample) return;
    if (example !== undefined) this.#mayShowExample();
    const checked = example === undefined ? undefined : exampleOf(example);
    const shown = this.#example;
    this.#workedExample = example;
    this.#example = checked;
    // The demo's state before the template, whose row shows it: another example starts at the
    // beginning, with no event, and no example has none.
    if (checked === undefined) {
      this.#sheet.classList.remove("example");
      this.#demoState = undefined;
      this.#parts.clear();
      this.#showFills(new Map());
      this.#present(NO_TASK);
    } else if (shown === undefined || !sameExample(checked, shown)) {
      // No mark stands on its sheet: its history is empty, and every submission has strokes. What
      // the hands hold — a palm, two fingers scrolling — goes: the sheet takes no input now.
      this.#hands.reset();
      this.#latch = undefined;
      this.#sheet.classList.add("example");
      this.#demoState = DEMO_START;
      this.#parts.clear();
      // The last example's values leave its boxes: another may keep the same page.
      this.#showFills(new Map());
      this.#present(exampleTemplate(checked));
    }
  }

  /**
   * How far the learner has gone through the worked example's demo (R42): `opened`, how many of
   * its parts are open, from the first, and `hidden`, whether the whole demo is hidden — frozen,
   * and the same object until it changes. A new example starts at `{ opened: 0, hidden: false }`,
   * and without one it is `undefined`. The learner changes it with the row's Next and Demo, which
   * say so with a `demochange`; the consumer may give it back, which says nothing, tells a screen
   * reader nothing, and scrolls nothing. It is given after the example, for it is checked against
   * the example's parts: before one, a state is a TypeError, and `undefined` changes nothing. A
   * state is an object of `opened`, a whole number from 0 to the number of parts, and `hidden`,
   * true or false, or it is a TypeError that names the field. One that says the same changes
   * nothing. Parts do not close one by one for the learner, but a consumer may give fewer.
   */
  get demoState(): DemoState | undefined {
    return this.#demoState;
  }

  set demoState(state: DemoState | undefined) {
    if (state === undefined) return;
    const example = this.#example;
    if (example === undefined) {
      throw new TypeError(
        `<${TAG}> shows no worked example: the state of its demo is given after the example`,
      );
    }
    const checked = demoStateOf(state, example.demo.length);
    const shown = this.#demoState;
    if (shown?.opened === checked.opened && shown.hidden === checked.hidden) return;
    this.#parts.quiet();
    this.#showDemo(example, checked);
  }

  /**
   * The open view of the module's manifest (R32), of which the element reads the version of the
   * module format — "0.4", or the manifest is a TypeError (R44 spec) — the height of a digit on the
   * crop for checking, `canvas.digit_height`, 24 px unless given, and the explanation language, the
   * statement's and a workbook's lines'. Without a manifest the digits are 24 px, and the statement
   * and the lines are in the element's own `lang`. The rest of it the element passes over, but for
   * the canvas settings, which are its own: one it does not know is a TypeError. A manifest it
   * cannot read is a TypeError that names the field, and the element stays as it was; the same
   * object given again is read again, for the consumer may have changed it. The task and the
   * manifest are each the consumer's to give, in either order: `exportWork()` takes the height
   * when it is called (R27).
   */
  get manifest(): Manifest | undefined {
    return this.#manifest;
  }

  set manifest(manifest: Manifest | undefined) {
    // The same object is read again: a consumer may have changed it in place.
    const settings = settingsOf(manifest);
    this.#manifest = manifest;
    if (settings.lang !== this.#settings.lang) {
      this.#statement.lang = settings.lang;
      this.#parts.lang = settings.lang;
      write(this.#lines, "lang", settings.lang ?? null);
    }
    this.#settings = settings;
  }

  /**
   * What gives the files of the pictures, by their references, as the contract has it (the
   * 2026-11-02 amendment to R36 spec; R07): a task's statement's, and a
   * worked example's — its statement's and every part's of its demo, which it asks for as the
   * example comes, before the learner opens them (R42). A reference is asked for once, whichever
   * pictures show it, and its file stays while the task or the example names it. Until a picture's
   * file comes, or if it never does, its frame shows what it shows in words. A new function serves
   * the references that have no file yet, and stops no load the last one began.
   */
  get media(): Media | undefined {
    return this.#pictures.media;
  }

  set media(media: Media | undefined) {
    if (media !== undefined && typeof media !== "function") {
      throw new TypeError(
        `the media of <${TAG}> is a function that gives a Blob, not ${typeof media}`,
      );
    }
    this.#pictures.media = media;
  }

  /**
   * The history of writing (R22, R27): every stroke, erasing, clearing and undo on the sheet, in the
   * order they landed, at the sheet's time — frozen, and the same array until the next action. The
   * consumer keeps it, adding what `historychange` tells, and gives it back to open the sheet as it
   * was: the strokes, and the actions undo takes back.
   *
   * The history the sheet has changes nothing: the very array, or one whose every event says the
   * same — fields the sheet does not keep are passed over, and `undefined` is the empty one. A
   * stroke under way goes on, and the marks stay. Any other history replaces the sheet, with no
   * event: it must be one the sheet could have written, or it is a TypeError that names the field,
   * and the sheet stays as it was. A stroke or an erasing under way goes: its IDs and its times are
   * the last sheet's. The clock goes on more than the pause of the groups after the history's last
   * event, the next stroke takes the next ID, and the tutor's marks go back on the strokes, or off,
   * if the history has not their strokes. A history that is where the sheet's began loses what came
   * after, and says so in the console. The task and the history are each the consumer's to give, in
   * either order. A worked example's sheet has the empty history alone: any other is a TypeError
   * (R42).
   */
  get history(): readonly HistoryEvent[] {
    return this.#work.history;
  }

  set history(history: readonly HistoryEvent[] | undefined) {
    const before = this.#work.history;
    const equal = this.#equal;
    // A consumer that gives back the same array of its own on every render, as long as it was, is
    // not walked through point by point each time. One it has added to is compared again.
    if (
      equal !== undefined &&
      equal.given === history &&
      equal.history === before &&
      Array.isArray(history) &&
      history.length === equal.length
    ) {
      return;
    }
    if (sameHistory(history, before)) {
      this.#equal = {
        given: history,
        length: Array.isArray(history) ? history.length : 0,
        history: before,
      };
      return;
    }
    // A worked example's sheet is no one's to write on (R42).
    if (this.#example !== undefined) {
      throw new TypeError(`<${TAG}> shows a worked example, whose sheet has no history of writing`);
    }
    // undefined, and undefined alone, is the empty history: null is a value, and a wrong one.
    const work = Work.restore(history === undefined ? [] : history, this.#clock);
    const after = work.history;
    // The empty history is a new sheet, which a consumer asks for on purpose.
    if (after.length > 0 && begins(after, before)) {
      console.warn(
        `<${TAG}> takes a history that is where its own began: the ${before.length - after.length} actions after it are gone`,
      );
    }
    this.#recorder.restart(nextIdOf(after));
    const erasing = this.#eraser.pointer;
    if (erasing !== undefined) this.#eraser.cancel(erasing);
    this.#clock.resume(resumeOf(after));
    this.#work = work;
    this.#fill();
    this.#told = after.length;
    this.#writing = undefined;
    this.#equal = undefined;
    this.#replace();
    this.#refresh();
    this.#request();
  }

  /**
   * Which answer slots the learner's strokes fill, per item, per slot, in the task's order, by the
   * strokes `exportWork()` would take — not the stroke under way, but those under an eraser not
   * yet lifted. A workbook's boxes, each whether it holds one (R34, R37): a stroke is in one box
   * or in none, by the rule of R37, and what is in none is the draft. A sheet's one answer anywhere
   * on it or the whole sheet, whether the sheet holds one (R42). `null` for a sheet of choices,
   * whose options app marks, for a sheet with no task, and for a worked example. Frozen, and the
   * same array until a slot changes. An action on the sheet changes it before its
   * `historychange`, and a task or a history given changes it with no event.
   */
  get filled(): Filled | null {
    return this.#filled;
  }

  /**
   * The tutor's marks of one submission, with the context the element gave with its work (R07,
   * R26): each a frame where a group of strokes is, or a box on the crop the model saw, and on a
   * workbook where an answer cell is, by its item and its slot (R39). A mark holds on to the
   * strokes the model saw there and is drawn around those of them the sheet shows, as they are now
   * — a cell's around its box too: new strokes do not move it, and when all of them are erased it
   * is gone, till undo brings them back. A box of a workbook that was empty is framed alone (the
   * second 2026-11-03 amendment to R74 spec). A box that comes near no stroke, and a cell on a
   * sheet, which takes no zones, have no frame: the question is asked without one. The type is
   * spec's (R83 spec; T16). A submission goes
   * back to a sheet whose history holds its strokes, as its digest tells (R27), and a workbook's
   * to a page of its boxes: one of other strokes or other boxes is a TypeError, and so are marks
   * given before the task and the history they hold on to, and marks that are not marks. A new
   * history, and a new page, put the marks back on their strokes, or take them off. `undefined`
   * takes the marks off. Every value is checked as it comes, and marks equal to those shown write
   * nothing. A worked example's sheet has nothing to mark: marks are a TypeError there (R42).
   */
  get marks(): Marks | undefined {
    return this.#marks;
  }

  set marks(marks: Marks | undefined) {
    if (marks !== undefined && this.#example !== undefined) {
      throw new TypeError(`<${TAG}> shows a worked example, whose sheet has nothing to mark`);
    }
    const given = marks === undefined ? undefined : marksOf(marks);
    const shown = given === undefined ? [] : this.#places(given);
    this.#marks = marks;
    this.#given = given;
    this.#showMarks(shown);
  }

  /** The element moved into another document: its root adopts that document's sheet (R51). */
  adoptedCallback(): void {
    if (this.shadowRoot !== null) adoptStyle(this.shadowRoot);
  }

  connectedCallback(): void {
    this.#resize.observe(this.#viewport);
    this.#resize.observe(this.#statement.element);
    this.#resize.observe(this.#parts.list);
    this.#watchDensity();
    this.#watchColours();
    this.#pictures.connect();
    // The page's pen mode, on every sheet of it (R29). The row shows a change once the event that
    // made it is over: by then a pen that came down writes, and every row of the page waits for its
    // stroke. The sheet tells the page whether it is written on, and hears when a stroke ends.
    const unwatch = PEN_MODE.watch(() => queueMicrotask(() => this.#refresh()));
    const unenlist = PEN_MODE.enlist(() => this.#writer() !== undefined);
    this.#unwatchPen = () => {
      unwatch();
      unenlist();
    };
    // The page's zoom, on every sheet of it (T94): it may have changed while the element was away.
    this.#zoomTo(PAGE_ZOOM.value);
    this.#unwatchZoom = PAGE_ZOOM.watch(() => this.#zoomed());
    // A scroll does not bubble, but the document hears every one of its tree on the way down. A
    // page that grows or shrinks scrolls nothing, and neither does a window of another size.
    document.addEventListener("scroll", this.#heard, { capture: true, passive: true });
    this.#page.observe(document.documentElement);
    // The row wraps anew with the element's width, its language, the canvas kind and the finger's
    // button, and grows or shrinks.
    this.#page.observe(this.#tools.element);
    window.addEventListener("resize", this.#resized);
    this.#refresh();
  }

  /**
   * The element's `lang` came, changed or went: its buttons and a workbook's boxes are labelled in
   * it, or in English for a language their labels are not in, and for none (R28, R36). An attribute
   * the element had before it was defined comes here just after the constructor, which reads no
   * attribute.
   */
  attributeChangedCallback(): void {
    this.#tools.label(this.getAttribute("lang"));
    this.#nameRegion();
    this.#nameBoxes();
    this.#markBoxes();
  }

  /**
   * The demo's list says a box it fills in the labels' language, and its value: «Окошко 1.2: 5»;
   * its open items too, anew. Without `lang` the labels are English, as the element's own.
   */
  #nameBoxes(tag: string | null = this.getAttribute("lang")): void {
    const { lang, labels } = labelsFor(tag);
    this.#parts.fillWords = (part) => {
      const name = say(labels.boxIn, { line: part.fill.line, slot: part.fill.box });
      const value = this.#example === undefined ? "" : fillValue(this.#example, part);
      return { number: value === "" ? name : say(labels.valued, { name, value }), lang };
    };
  }

  /**
   * Takes back the last action on the sheet — the last stroke written, the last erasing, or the
   * clearing — and says whether there was one (R19, R22), with a `historychange` if there was
   * (R27). The element's Undo button calls it, and so may the consumer (R28). A stroke under way
   * stays: it lands when it ends. So does an erasing: what it came near leaves the sheet when it
   * lifts, if it is on the sheet then.
   */
  undo(): boolean {
    const undone = this.#work.undo(performance.now());
    if (undone) this.#changed();
    return undone;
  }

  /**
   * Takes every stroke off the sheet, an action that undo takes back, and says whether there were
   * any (R19), with a `historychange` if there were (R27). The element's Clear button calls it, and
   * so may the consumer (R28). A stroke under way stays: it lands when it ends.
   */
  clear(): boolean {
    const cleared = this.#work.clear(performance.now());
    if (cleared) this.#changed();
    return cleared;
  }

  /**
   * The work for checking (R07, R27), when the consumer asks for it, at Check, at the height of a
   * digit the manifest asks for (R25, R32). On a sheet it is the crop of the strokes the sheet
   * shows, its PNG, and the context of the submission — the crop's numbers, the groups and their
   * digest (R26, R27). On a workbook it is the crop of each filled box, by its strokes alone, with
   * its item and its slot, and the context — the table «box → stroke IDs» and its digest (R34,
   * R38); the draft goes nowhere. The consumer keeps the context, sends only the PNGs and their
   * places to be checked (R09 spec), and gives the context back with the tutor's marks. It is the
   * sheet as it is when this is called: a stroke under way is not on it yet, while the strokes
   * under an eraser not yet lifted still are, as `filled` has them. A sheet without strokes, and a
   * workbook with no box filled, have no work to check, and the promise gives null (H3); so has a
   * worked example, whose sheet the learner does not write on (R42).
   */
  async exportWork(): Promise<ExportedWork | null> {
    if (this.#example !== undefined) return null;
    const { digit } = this.#settings;
    if (isWorkbook(this.#shownTemplate)) {
      const work = cellsForCheck(this.#work.strokes, this.#cells, digit);
      if (work === null) return null;
      const cells = work.cells.map(({ item, slot, png }) =>
        Object.freeze({ item, slot, png: blobOf(png) }),
      );
      return Object.freeze({ cells: Object.freeze(cells), submission: work.submission });
    }
    const work = workForCheck(this.#work.strokes, digit);
    if (work === null) return null;
    return Object.freeze({ png: blobOf(work.png), submission: work.submission });
  }

  disconnectedCallback(): void {
    // A stroke or an erasing under way ends where it is: its pointerup will not reach a sheet off
    // the page. Its historychange reaches only the element's own listeners, for the element is in
    // no tree now.
    this.#recorder.end();
    this.#eraser.end();
    this.#hands.reset();
    this.#latch = undefined;
    this.#latchAcross = undefined;
    this.#unwatchPen?.();
    this.#unwatchPen = undefined;
    this.#unwatchZoom?.();
    this.#unwatchZoom = undefined;
    document.removeEventListener("scroll", this.#heard, { capture: true });
    this.#page.disconnect();
    this.#port = null;
    window.removeEventListener("resize", this.#resized);
    // A stroke that ended here may be the one the other rows of the page waited for.
    PEN_MODE.settle();
    this.#pictures.disconnect();
    this.#resize.disconnect();
    this.#unwatchDensity?.();
    this.#unwatchDensity = undefined;
    this.#unwatchColours?.();
    this.#unwatchColours = undefined;
    cancelAnimationFrame(this.#frame);
    this.#frame = 0;
  }

  /**
   * A property given before the element was defined is the instance's own, which hides the class's
   * accessor: it goes to the element instead, through the accessor. A value the element does not
   * take leaves the property as the element starts it, with a warning, rather than fail the
   * element's upgrade, which would leave it dead.
   */
  #adopt(
    name:
      | "tool"
      | "task"
      | "workedExample"
      | "demoState"
      | "manifest"
      | "media"
      | "history"
      | "marks",
  ): void {
    if (!Object.hasOwn(this, name)) return;
    const value: unknown = Reflect.get(this, name);
    Reflect.deleteProperty(this, name);
    try {
      Reflect.set(this, name, value);
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
      console.warn(`${error.message}: <${TAG}> goes on as it starts`);
    }
  }

  /**
   * A task's template, or a worked example's, in place of the last (R23, R42). The layer and the
   * statement apart: a new grid or new lines leave the statement and its pictures as they are, and
   * the other way round. A tool not allowed puts the pen back, with no event, and the row shows
   * what it is of, by its name, and the tools allowed: only what has changed is written. Then the
   * element names the pictures of the task or the example, its statement's and its demo's: a file
   * both the last and the new name stays, and shows at once in the new statement, while those no
   * longer named go, their frames already gone with the last statement.
   */
  #present(template: Template): void {
    const shown = this.#shownTemplate;
    this.#shownTemplate = template;
    if (!sameLayer(template, shown)) {
      this.#lay(template);
      // A page of other boxes, or of the other kind, puts the marks back or takes them off (R39).
      this.#replace();
    } else if (this.#laid === undefined) {
      // The same grid may ask another answer: the sheet's strokes, or choices that app marks (R42).
      this.#fill();
    }
    if (!sameStatement(template, shown)) this.#statement.show(template.statement);
    const parts = [...template.statement, ...(this.#example?.demo ?? [])];
    this.#pictures.name(parts.flatMap((part) => ("picture" in part ? [part.picture] : [])));
    if (!template.tools.includes(this.#tool)) this.#tool = "pen";
    this.#refresh();
  }

  /**
   * Whether the element may show a worked example now (R42): not while it shows a task, not on a
   * sheet the learner has written on, and not while a stroke or an erasing is under way, which
   * would land on a sheet that takes none. A TypeError says which.
   */
  #mayShowExample(): void {
    if (this.#task !== undefined) {
      throw new TypeError(
        `<${TAG}> shows a task: a worked example is shown by a new element, or once the task is undefined`,
      );
    }
    if (this.#work.history.length > 0) {
      throw new TypeError(
        `<${TAG}> has a history of writing: a worked example is shown by a new element`,
      );
    }
    if (this.#writer() !== undefined) {
      throw new TypeError(
        `<${TAG}> is being written on: a worked example comes once the stroke or the erasing ends`,
      );
    }
  }

  /**
   * The template's layer (R23, R36): a sheet's grid, which says nothing to a screen reader, or a
   * workbook's lines, which it reads — a list of the items in the task's order, each its number,
   * its text and its boxes, where the layout puts them.
   */
  #lay(template: Template): void {
    const workbook = isWorkbook(template);
    this.#grid.setAttribute("d", workbook ? "" : gridPath(template.grid));
    this.#grid.classList.toggle("dots", !workbook && template.grid.kind === "dots");
    write(this.#template, "aria-hidden", workbook ? null : "true");
    write(this.#template, "role", workbook ? "none" : null);
    this.#lines.replaceChildren(...(workbook ? template.page.items.map(itemOf) : []));
    // A canvas of the other kind fills its answer slots anew: a workbook's are its own arrays, and a
    // sheet's those all sheets share (R42).
    if (workbook !== (this.#laid !== undefined)) this.#filled = null;
    this.#laid = workbook ? template.page : undefined;
    this.#cells = workbook ? cellsOf(template.page) : [];
    // The frames in the order of the lines, the task's: item by item, slot by slot.
    this.#rects = [...this.#lines.querySelectorAll("rect")];
    this.#values = [];
    this.#taken = new WeakMap();
    // New frames: marked by the filling if it changed, or else here.
    if (!this.#fill()) this.#markBoxes();
  }

  /**
   * Which answer slots the strokes fill, and whether that changed. A workbook's boxes by the rule
   * of R37, each stroke's box worked out once: a new array, and the frames marked anew, only if a
   * box changed. A sheet's one answer anywhere on it or the whole sheet by any stroke on it, or
   * nothing for a sheet of choices or with no task (R42).
   */
  #fill(): boolean {
    const page = this.#laid;
    if (page === undefined) {
      // A sheet: its one answer anywhere on it or the whole sheet is filled by any stroke the work
      // for checking would take; a sheet of choices, whose options app marks, has nothing to say.
      const filled = this.#whole ? sheetFilledOf(this.#work.strokes.length > 0) : null;
      const changed = filled !== this.#filled;
      this.#filled = filled;
      return changed;
    }
    const taken = this.#work.strokes.map((stroke) => {
      let found = this.#taken.get(stroke);
      if (found === undefined) {
        found = cellOf(stroke, this.#cells);
        this.#taken.set(stroke, found);
      }
      return found;
    });
    const filled = filledOf(page, this.#cells, taken);
    const shown = this.#filled;
    if (shown !== null && sameItems(filled, shown, (a, b) => sameItems(a, b))) return false;
    this.#filled = filled;
    this.#markBoxes();
    return true;
  }

  /**
   * Each box of the lines as it now is (R36, R37): its frame, thicker when it is filled, and its
   * name in the labels' language, by the element's `lang` — "Box" alone in its line, numbered by
   * its slot among several, and "filled" when it is. Only what has changed is written.
   */
  #markBoxes(): void {
    const { lang, labels } = labelsFor(this.getAttribute("lang"));
    for (const [c, rect] of this.#rects.entries()) {
      const cell = this.#cells[c];
      if (cell === undefined) continue;
      const several = (this.#laid?.items[cell.item - 1]?.boxes.length ?? 0) > 1;
      const filled = this.#filled?.[cell.item - 1]?.[cell.slot - 1] === true;
      const name = several ? say(labels.boxAt, { slot: cell.slot }) : labels.box;
      // A worked example's box says what its demo wrote in it: the text itself says nothing.
      const value = this.#fills.get(`${cell.item}.${cell.slot}`);
      rect.classList.toggle("filled", filled);
      let label = filled ? say(labels.filled, { name }) : name;
      if (value !== undefined) label = say(labels.valued, { name, value });
      write(rect, "aria-label", label);
      write(rect, "lang", lang);
    }
  }

  /**
   * The marks as they were checked when given, back on their strokes after a new history or a new
   * page, if those have their strokes and boxes, or else off, with no event (R27, R39).
   */
  #replace(): void {
    if (this.#given === undefined) return;
    try {
      this.#showMarks(this.#places(this.#given));
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
      this.#marks = undefined;
      this.#given = undefined;
      this.#showMarks([]);
    }
  }

  /** Every stroke the sheet has known, erased or not, as its history wrote them. */
  #known(): Stroke[] {
    return this.#work.history.flatMap((event) => (event.kind === "write" ? [event.stroke] : []));
  }

  /**
   * The marks of a submission, as `marksOf` checked them, that have a place on this sheet, each
   * with its name: a TypeError for a submission that is not this sheet's (R26, R27).
   */
  #places(given: Marks): { readonly name: string; readonly placed: Placed }[] {
    const cells = isWorkbook(this.#shownTemplate) ? this.#cells : null;
    const places = placesOf(given, this.#known(), cells);
    return given.marks.flatMap(({ name }, n) => {
      const placed = places[n];
      return placed ? [{ name, placed }] : [];
    });
  }

  /**
   * The marks to show, each a frame of its own on the layer of the marks, hidden till it is drawn.
   * Marks of the names and the strokes of those shown keep their frames, and nothing is written.
   */
  #showMarks(marks: readonly { readonly name: string; readonly placed: Placed }[]): void {
    const same =
      marks.length === this.#shown.length &&
      marks.every(({ name, placed }, n) => {
        const shown = this.#shown[n];
        return (
          shown !== undefined &&
          shown.name === name &&
          sameItems(shown.placed.ids, placed.ids) &&
          sameBox(shown.placed.cell ?? null, placed.cell ?? null)
        );
      });
    if (same) return;
    for (const { rect } of this.#shown) rect.remove();
    this.#shown = marks.map(({ name, placed }) => {
      const rect = document.createElementNS(SVG, "rect");
      rect.setAttribute("role", "img");
      rect.setAttribute("aria-label", name);
      rect.setAttribute("rx", String(MARK_CORNER));
      rect.setAttribute("display", "none");
      this.#marksLayer.append(rect);
      return { name, placed, rect, frame: null, under: false, drawn: "none" };
    });
    this.#request();
  }

  /**
   * One pointer at a time writes or erases (R18, R22), as the hands let it: a pen, a finger out of
   * pen mode, or a mouse (R29). The primary button does what the tool says, and a pen's eraser
   * erases — if the task allows the eraser: without it, the pen's eraser does nothing, for the
   * recorder takes the primary button alone (R28).
   */
  #down(event: PointerEvent): void {
    // A worked example's sheet takes no input (R42): the canvas takes no pointer then, and an event
    // that a script sends it does nothing either, nor puts the page in pen mode.
    if (this.#example !== undefined) return;
    // A pointer that comes down again lost its way up: what it was writing or erasing ends where it
    // was, as on a lost capture.
    this.#recorder.end(event.pointerId);
    this.#eraser.end(event.pointerId);
    const writes = this.#hands.down(contactOf(event));
    // The canvas holds on to every pointer that comes down on it until it lifts, writing or not: its
    // moves and its lift come here, so that a stroke goes on beyond the canvas, two fingers scroll,
    // a palm stays one, and the hands forget no pointer that lifted elsewhere.
    this.#capture(event.pointerId);
    if (!writes) return;
    const screen = this.#view();
    if (screen === undefined) return;
    const sample = this.#sample(event, screen);
    const erases =
      this.#shownTemplate.tools.includes("eraser") &&
      (this.#tool === "eraser" || sample.button === ERASER_BUTTON);
    const began = erases
      ? this.#eraser.down(sample, ERASER_RADIUS_PX / screen.k + INK_REACH)
      : this.#recorder.down(sample);
    if (began) this.#request();
  }

  /** The canvas holds on to a pointer until it lifts. */
  #capture(pointerId: number): void {
    try {
      this.#canvas.setPointerCapture(pointerId);
    } catch {
      // The pointer is no longer active, or never was: an event that a script made.
    }
  }

  #move(event: PointerEvent): void {
    // A pointer the hands did not see come down, such as a mouse or a pen hovering, does nothing,
    // and reads no layout.
    if (!this.#hands.knows(event.pointerId)) return;
    // The layout is read once an event, and only when a move writes or erases.
    let screen: Screen | undefined;
    let looked = false;
    let changed = false;
    for (const each of coalesced(event)) {
      // The hands see every move: a finger may grow into a palm, and two of them scroll.
      if (!this.#hands.move(contactOf(each))) continue;
      const input = this.#inputOf(each.pointerId);
      if (input === undefined) continue;
      if (!looked) {
        screen = this.#view();
        looked = true;
      }
      if (screen === undefined) continue;
      const sample = this.#sample(each, screen);
      const moved =
        input === this.#eraser ? input.move(sample, inSight(each, screen)) : input.move(sample);
      changed = moved || changed;
    }
    this.#flush();
    if (changed) this.#request();
  }

  #up(event: PointerEvent): void {
    const input = this.#inputOf(event.pointerId);
    if (input !== undefined) {
      const screen = this.#view();
      if (screen === undefined) input.end(event.pointerId);
      else if (input === this.#eraser)
        input.up(this.#sample(event, screen), inSight(event, screen));
      else input.up(this.#sample(event, screen));
    }
    this.#lifted(event.pointerId);
  }

  /**
   * A pointer lifted, or the device or the page took it from the sheet: the hands forget it, a
   * gesture that ended lets go of what it scrolled, and the finger's button may come or go now, on
   * this row and on the others of the page (R29).
   */
  #lifted(pointerId: number): void {
    this.#hands.lift(pointerId);
    if (!this.#hands.scrolling) {
      this.#latch = undefined;
      this.#latchAcross = undefined;
    }
    this.#refresh();
    PEN_MODE.settle();
  }

  /** The pointer that writes or erases now, if one does: the recorder's or the eraser's. */
  #writer(): number | undefined {
    return this.#recorder.pointer ?? this.#eraser.pointer;
  }

  /** A pointer's stroke or erasing goes, as on `pointercancel`, and the sheet is drawn anew. */
  #drop(pointerId: number): void {
    if (this.#recorder.cancel(pointerId) || this.#eraser.cancel(pointerId)) this.#request();
  }

  /** The input a pointer drives: the recorder while it writes, the eraser while it erases. */
  #inputOf(pointerId: number): Recorder | Eraser | undefined {
    if (this.#recorder.pointer === pointerId) return this.#recorder;
    if (this.#eraser.pointer === pointerId) return this.#eraser;
    return undefined;
  }

  #sample(event: PointerEvent, screen: Screen): PointerSample {
    const { x, y } = toSheet(screen, event.clientX - screen.left, event.clientY - screen.top);
    return {
      pointerId: event.pointerId,
      kind: event.pointerType,
      button: event.button,
      buttons: event.buttons,
      x,
      y,
      time: event.timeStamp,
      pressure: event.pressure,
    };
  }

  /**
   * Where the sheet is on the screen now. The rectangles of the canvas and of the sheet give it:
   * the canvas's top left corner is that of the visible part, and the sheet's width gives `k`, the
   * one on the screen, after whatever transform the page puts on the element. The container's
   * rectangle gives the part of the canvas it shows: with the statement in sight, the canvas
   * goes on below the container's bottom. The row of buttons above the container hides what it
   * covers, once it sticks over the sheet as the page scrolls the element by (R28); in its place,
   * in a low window, it stands above the container and hides nothing of it.
   */
  #view(): Screen | undefined {
    const canvas = this.#canvas.getBoundingClientRect();
    const sheet = this.#sheet.getBoundingClientRect();
    if (canvas.width <= 0 || sheet.width <= 0) return undefined;
    const k = scaleFor(sheet.width);
    const vx = (canvas.left - sheet.left) / k;
    const vy = (canvas.top - sheet.top) / k;
    const port = clientBoxOf(this.#viewport);
    // The row ends where the container begins, unless it sticks over it.
    const row = this.#tools.element.getBoundingClientRect();
    const shown = {
      left: Math.max(canvas.left, port.left),
      top: Math.max(canvas.top, port.top, row.bottom),
      right: Math.min(canvas.right, port.right),
      bottom: Math.min(canvas.bottom, port.bottom),
    };
    const { left, top, width, height } = canvas;
    return { k, vx, vy, left, top, width, height, shown };
  }

  /**
   * The sheet's top in the container's content, in CSS pixels as laid out: under the statement —
   * or, along `x`, its left: its margin in the middle of a wide container, and none once it is
   * wider (T94).
   */
  #sheetEdge(axis: Axis): number {
    const port = clientBoxOf(this.#viewport);
    const sheet = this.#sheet.getBoundingClientRect();
    return axis === "y"
      ? (sheet.top - port.top) / port.down + this.#viewport.scrollTop
      : (sheet.left - port.left) / port.across + this.#viewport.scrollLeft;
  }

  /**
   * The top and the left of the visible part from the scroll and the last layout, without reading
   * the layout again: the stage sticks to the container's top once the sheet's top has gone past
   * it, and to its left so. Up or Down, Left or Right may have come to an end of the container, or
   * left one.
   */
  #scrolled(): void {
    if (this.#k > 0) {
      this.#vy = Math.max(0, this.#viewport.scrollTop - this.#sheetAt) / this.#k;
      this.#vx = Math.max(0, this.#viewport.scrollLeft - this.#sheetAtX) / this.#k;
    }
    this.#request();
    this.#edges();
  }

  /**
   * Up or Down was pressed (R33), or along `x` Left or Right (T94): what two fingers would scroll
   * that way goes by four fifths of what it shows in sight. It is chosen anew at every press, so
   * that a container at its end hands the scroll on at the next. While a pointer writes or erases
   * on a sheet of the page, nothing moves under it.
   */
  #step(onward: boolean, axis: Axis): void {
    const latch = PEN_MODE.writing ? undefined : this.#scrollerFor(onward, axis);
    if (latch !== undefined) {
      const seen = this.#seen(latch.target, axis);
      const step = Math.max(1, Math.round((UP_DOWN * seen) / latch.scale));
      const by = onward ? step : -step;
      latch.target.scrollBy({ [axis === "y" ? "top" : "left"]: by, behavior: "instant" });
    }
    this.#edges();
  }

  /**
   * Zoom in or Zoom out was pressed (T94): the page's zoom goes a step larger or smaller, and every
   * sheet of the page is laid out by it — but not while a pointer writes or erases on one of them,
   * for nothing moves under it.
   */
  #zoomBy(larger: boolean): void {
    if (!PEN_MODE.writing) PAGE_ZOOM.step(larger);
  }

  /**
   * The page's zoom has changed (T94): the sheet is laid out by it at once, its top left corner in
   * sight staying where it was on the sheet, and the row shows what the zoom can do now.
   */
  #zoomed(): void {
    if (!this.#zoomTo(PAGE_ZOOM.value)) return;
    this.#layout();
    this.#refresh();
  }

  /**
   * The column and the container as wide as a zoom asks, and whether that is another than the
   * last: the column widens with the sheet, and the container scrolls it across while the zoom is
   * beyond the fit (T94).
   */
  #zoomTo(zoom: number): boolean {
    if (zoom === this.#zoom) return false;
    this.#zoom = zoom;
    this.#column.style.setProperty("--zoom", String(zoom));
    this.#viewport.classList.toggle("zoomed", zoom > 1);
    this.#keepDirection();
    return true;
  }

  /**
   * The statement and a demo's parts keep the element's own direction while the zoomed container
   * runs left to right: the direction the element computes, by an attribute or by a style, as the
   * last layout read it (T94).
   */
  #keepDirection(): void {
    if (this.#zoom <= 1 || !this.isConnected) return;
    const direction = getComputedStyle(this).direction;
    if (this.#column.style.getPropertyValue("--direction") !== direction) {
      this.#column.style.setProperty("--direction", direction);
    }
  }

  /**
   * How much of what a scroller shows is in sight, down the screen: within the ancestors that clip
   * it and the visual viewport, and below the row of buttons while the row sticks over its top, or
   * below the consumer's band, --novatrail-canvas-top, while the row stands in its place in a low
   * window. A scroller out of sight counts whole. Across the screen, the row covers nothing (T94).
   */
  #seen(target: Element | Window, axis: Axis = "y"): number {
    const { start, end, whole } = sightOf(target, axis);
    if (axis === "x") return end > start ? end - start : whole;
    const bottom = end;
    let top = start;
    // The row hides the top while it sticks there, as far down as the consumer's offset puts it. A
    // row that stands in its place, in a low window, leaves the consumer's band over it alone.
    const row = this.#tools.element;
    if (this.#tools.sticks) {
      const box = row.getBoundingClientRect();
      if (box.top <= top + offsetOf(row, 0) * scaleOf(row, box) + 0.5) {
        top = Math.max(top, box.bottom);
      }
    } else {
      top = Math.max(top, this.#band(target));
    }
    return bottom > top ? bottom - top : whole;
  }

  /**
   * Whether the row sticks (R28): while it is no taller than a quarter of what it sticks in, below
   * the consumer's offset. In a lower window, or once it wraps over more of it, it stands in its
   * place, above the statement, and goes with the scrolling, as WCAG's technique C34 un-fixes a
   * sticky header (1.4.10, 2.4.11). Its place and its size are the same either way, so the choice
   * changes nothing it is made from. The scroller it sticks in is watched for its size. Only an
   * element on the page asks: what calls this goes when the element leaves it.
   */
  #stick(): void {
    const room = roomOf(this.#tools.element);
    if (room.port !== this.#port) {
      if (this.#port !== null) this.#page.unobserve(this.#port);
      if (room.port !== null) this.#page.observe(room.port);
      this.#port = room.port;
    }
    const row = this.#tools.element;
    const tall = row.getBoundingClientRect().height;
    if (tall > 0 && room.height > 0) this.#tools.stick(4 * tall <= room.height - room.offset);
    this.#topSeen = getComputedStyle(row).top;
  }

  /**
   * Where the consumer's band over the top of what the row sticks in ends, down the screen: its
   * offset, --novatrail-canvas-top, below the top of the scroller or of the window — for a target
   * that is or lies within what the row sticks in, and above everything for any other.
   */
  #band(target: Element | Window | undefined): number {
    const room = roomOf(this.#tools.element);
    // The band stands over the top of what the row sticks in, and so over a scroller within it,
    // but not over the page's when the row sticks in a scroller of its own.
    const within =
      room.port === null
        ? target !== undefined
        : target instanceof Element && (target === room.port || holds(room.port, target));
    return within ? room.top + room.offset : Number.NEGATIVE_INFINITY;
  }

  /**
   * Up and Down as the scrolling now is (R33), and Left and Right while the sheet is zoomed (T94):
   * each stands unavailable while what two fingers would scroll its way can go no further. The
   * element hears its container, the page and the ancestors in the page's own tree scroll, and the
   * page and the window change size, but not the scrolling in another shadow tree: a press asks
   * anew.
   */
  #edges(): void {
    if (!this.isConnected) return;
    const above = this.#scrollerFor(false) !== undefined;
    const below = this.#scrollerFor(true) !== undefined;
    const zoomed = this.#zoom > 1;
    const before = zoomed && this.#scrollerFor(false, "x") !== undefined;
    const after = zoomed && this.#scrollerFor(true, "x") !== undefined;
    this.#tools.edges(above, below, before, after);
  }

  /**
   * Two fingers moved right on the screen by `dx` CSS pixels and down it by `dy` (R29), and what
   * they scroll goes with them. The gesture's first step down chooses what it scrolls down, for the
   * whole gesture, and its first step across, while the sheet is zoomed, what it scrolls across
   * (T94): the sheet's own container if it can go that way, or else the nearest ancestor of the
   * element that scrolls and can, or else the page. A container at its end hands the scroll on at
   * the next gesture, not within this one. The steps of an event add up, and its end scrolls them
   * at once.
   */
  #scroll(dx: number, dy: number, fresh: boolean): void {
    if (fresh) {
      this.#latch = undefined;
      this.#latchAcross = undefined;
    }
    // The content goes with the fingers: down the screen, the scroll goes back.
    if (dy !== 0 && this.#latch === undefined) this.#latch = this.#scrollerFor(dy < 0) ?? null;
    if (dx !== 0 && this.#latchAcross === undefined) {
      this.#latchAcross = this.#zoom > 1 ? (this.#scrollerFor(dx < 0, "x") ?? null) : null;
    }
    if (this.#latch) this.#latch.rest -= dy / this.#latch.scale;
    if (this.#latchAcross) this.#latchAcross.rest -= dx / this.#latchAcross.scale;
  }

  /**
   * The scroll the fingers' moves of an event owe, in whole pixels: the rest waits for the next.
   * One scroller that goes both ways goes both at once.
   */
  #flush(): void {
    const down = owed(this.#latch);
    const across = owed(this.#latchAcross);
    if (down !== undefined && across !== undefined && down.target === across.target) {
      down.target.scrollBy({ left: across.step, top: down.step, behavior: "instant" });
      return;
    }
    if (down !== undefined) down.target.scrollBy({ top: down.step, behavior: "instant" });
    if (across !== undefined) across.target.scrollBy({ left: across.step, behavior: "instant" });
  }

  /**
   * What scrolls on down the content, for `onward`, or back up it — or, along `x`, on right across
   * it or back left (T94).
   */
  #scrollerFor(onward: boolean, axis: Axis = "y"): Latch | undefined {
    if (scrollsOn(this.#viewport, onward, axis)) {
      return { target: this.#viewport, scale: scaleOf(this.#viewport, undefined, axis), rest: 0 };
    }
    const { overflow, fromBody } = pageOverflow(axis);
    for (let node = parentOf(this); node !== null; node = parentOf(node)) {
      if (isPage(node, fromBody)) break;
      const style = getComputedStyle(node);
      if (!SCROLLING.test(axis === "y" ? style.overflowY : style.overflowX)) continue;
      if (scrollsOn(node, onward, axis)) {
        return { target: node, scale: scaleOf(node, undefined, axis), rest: 0 };
      }
      // A container that keeps its scrolling to itself hands none on.
      const keeps = axis === "y" ? style.overscrollBehaviorY : style.overscrollBehaviorX;
      if (keeps === "contain" || keeps === "none") return undefined;
    }
    // A page that hides its overflow, as one under a modal does, a finger would not scroll: nor do two.
    if (overflow === "hidden" || overflow === "clip") return undefined;
    const page = document.scrollingElement;
    if (page === null || !scrollsOn(page, onward, axis)) return undefined;
    return { target: window, scale: 1, rest: 0 };
  }

  /**
   * The stage takes the visible part of the sheet, and the canvas a pixel of its buffer for each
   * device pixel: its size on the screen times the density (R18). The layers follow in the same
   * frame. However large the zoom, the canvas is no larger than the container (T94).
   */
  #layout(): void {
    // The content of a new size, or the container, may overflow it now, or no more.
    this.#region();
    const area = this.#area;
    if (area === undefined || area.width === 0) return;
    // The column is as wide as the container up to the cap, times the page's zoom, and the stage
    // as tall and as wide as the visible part of the sheet.
    const k = fitScale(area.width, this.#zoom);
    const sheetAt = this.#sheetEdge("y");
    const sheetAtX = this.#sheetEdge("x");
    // A new width or zoom scales the sheet, and a statement of a new height moves it: the top left
    // corner of the visible part stays where it was on the sheet, unless the sheet's top, or its
    // left, is in sight. A new height of the container alone moves neither, and a scroll under way
    // goes on.
    if (this.#vy > 0 && (k !== this.#k || Math.abs(sheetAt - this.#sheetAt) > 0.5)) {
      this.#viewport.scrollTop = sheetAt + this.#vy * k;
    }
    if (this.#vx > 0 && k !== this.#k) this.#viewport.scrollLeft = sheetAtX + this.#vx * k;
    this.#k = k;
    this.#sheetAt = sheetAt;
    this.#sheetAtX = sheetAtX;
    this.#keepDirection();
    this.#stage.style.width = `${Math.min(area.width, SHEET.width * k)}px`;
    this.#stage.style.height = `${Math.min(area.height, SHEET.height * k)}px`;
    const onScreen = this.#canvas.getBoundingClientRect();
    const width = Math.round(onScreen.width * devicePixelRatio);
    const height = Math.round(onScreen.height * devicePixelRatio);
    // A new size clears the canvas. The ink goes back at once, and the layers move with it, in
    // this frame: a ResizeObserver reports after the frame's animation callbacks, but before the
    // frame is painted.
    if (this.#canvas.width !== width || this.#canvas.height !== height) {
      this.#canvas.width = width;
      this.#canvas.height = height;
    }
    this.#draw();
    // A container of another height, or a statement, may give Up or Down somewhere to go, or none.
    this.#edges();
  }

  /** A new density — the window on another screen, the page zoomed — lays the canvas out anew. */
  #watchDensity(): void {
    const density = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
    const changed = (): void => {
      this.#layout();
      this.#watchDensity();
    };
    density.addEventListener("change", changed, { once: true });
    this.#unwatchDensity = () => density.removeEventListener("change", changed);
  }

  /**
   * Forced colours coming or going draw the ink anew: they need not run the canvas's transition of
   * its colour.
   */
  #watchColours(): void {
    const forced = matchMedia("(forced-colors: active)");
    const changed = (): void => this.#request();
    forced.addEventListener("change", changed);
    this.#unwatchColours = () => forced.removeEventListener("change", changed);
  }

  /**
   * The work has changed — a stroke landed, an erasing, an undo, a clearing: the sheet is drawn
   * anew, and whoever listens hears of it at once, the history already as it now is, with the
   * events it has gained (R27). The event goes up from the element itself, and out of a consumer's
   * own shadow tree too, should the element be in one. An action a listener takes while it hears is
   * told of next, once every listener has heard of the one before: each hears the history's events
   * in its order. A history given meanwhile is no action, and what it replaced is told of no more.
   */
  #changed(): void {
    this.#request();
    // The boxes and the row before the event, and for an action a listener takes as well.
    this.#fill();
    this.#refresh();
    if (this.#telling) return;
    this.#telling = true;
    try {
      let history = this.#work.history;
      while (this.#told < history.length) {
        const from = this.#told;
        const events = Object.freeze(history.slice(from));
        this.#told = history.length;
        const detail: HistoryChange = Object.freeze({ events, from });
        this.dispatchEvent(
          new CustomEvent(HISTORY_CHANGE, { bubbles: true, composed: true, detail }),
        );
        history = this.#work.history;
      }
    } finally {
      this.#telling = false;
    }
  }

  /**
   * The learner chose a tool with the element's own button (R28): it is the tool now, and whoever
   * listens hears of it. A consumer that gives the tool follows it, or its next render would set
   * back what the learner chose.
   */
  #choose(tool: Tool): void {
    if (tool === this.#tool || !this.#shownTemplate.tools.includes(tool)) return;
    this.#tool = tool;
    this.#refresh();
    const detail: ToolChange = Object.freeze({ tool });
    this.dispatchEvent(new CustomEvent(TOOL_CHANGE, { bubbles: true, composed: true, detail }));
  }

  /**
   * The learner opened the next part of the demo with the row's Next (R42). The list grows above
   * the sheet, and the layout keeps a sheet scrolled into sight where it was at once, before the
   * scroll of the container is heard; then the part comes into sight below the row of buttons, the
   * region tells of it, and whoever listens hears of the new state. The focus stays on Next, which
   * opens the part after it. Nothing happens while the demo is hidden, or open whole.
   */
  #openNext(): void {
    const example = this.#example;
    const part = this.#nextPart();
    if (example === undefined || part === undefined) return;
    const opened = (this.#demoState?.opened ?? 0) + 1;
    this.#showDemo(example, Object.freeze({ opened, hidden: false }));
    const target = this.#parts.target(opened);
    if (target !== undefined) this.#bringIntoSight(target);
    const { lang, labels } = labelsFor(this.getAttribute("lang"));
    const number = say(labels.part, { n: opened, total: example.demo.length });
    this.#parts.tell(part, { number, lang });
    this.#demoChanged();
  }

  /**
   * The learner hid the whole demo with the row's Demo, or showed it again (R42): its open parts
   * stay open, out of sight, and the region tells of none. A sheet scrolled into sight stays where
   * it was, and nothing else scrolls.
   */
  #toggleDemo(): void {
    const example = this.#example;
    const state = this.#demoState;
    if (example === undefined || state === undefined) return;
    this.#parts.quiet();
    this.#showDemo(example, Object.freeze({ opened: state.opened, hidden: !state.hidden }));
    this.#demoChanged();
  }

  /**
   * The demo as a state has it: the list, laid out at once, so that the sheet's place is the new
   * one before any scroll is heard (R42), and the row.
   */
  #showDemo(example: CheckedExample, state: DemoState): void {
    this.#demoState = state;
    this.#parts.show(example.demo, state);
    this.#showFills(filledBy(example, state));
    this.#layout();
    this.#refresh();
  }

  /**
   * The values a worked example's demo has written in the boxes of its workbook (T85; R60): each in
   * the middle of its box, on the line's baseline, at the width the layout gives its text, as the
   * lines' texts are; none while the demo is hidden. Only what changed is written.
   */
  #showFills(fills: ReadonlyMap<string, string>): void {
    this.#fills = fills;
    const page = this.#laid;
    if (page === undefined) return;
    let changed = false;
    for (const [c, cell] of this.#cells.entries()) {
      const value = fills.get(`${cell.item}.${cell.slot}`);
      let text = this.#values[c];
      if (value === (text?.textContent ?? undefined)) continue;
      changed = true;
      if (value === undefined) {
        text?.remove();
        this.#values[c] = undefined;
        continue;
      }
      const box = page.items[cell.item - 1]?.boxes[cell.slot - 1];
      const rect = this.#rects[c];
      if (box === undefined || rect === undefined) continue;
      if (text === undefined) {
        text = document.createElementNS(SVG, "text");
        text.setAttribute("aria-hidden", "true");
        text.setAttribute("lengthAdjust", "spacingAndGlyphs");
        rect.after(text);
        this.#values[c] = text;
      }
      const width = pieceWidth(value);
      text.setAttribute("x", String(box.left + Math.floor((box.width - width) / 2)));
      text.setAttribute(
        "y",
        String(box.top + Math.floor(box.height / 2) + Math.floor(LAYOUT.size / 3)),
      );
      text.setAttribute("textLength", String(width));
      text.textContent = value;
    }
    if (changed) this.#markBoxes();
  }

  /** Whoever listens hears of the demo's new state, which the learner chose (R42). */
  #demoChanged(): void {
    const detail = this.#demoState;
    this.dispatchEvent(new CustomEvent(DEMO_CHANGE, { bubbles: true, composed: true, detail }));
  }

  /** The part Next opens: the one after those open, while the demo is shown (R42). */
  #nextPart(): ExamplePart | undefined {
    const state = this.#demoState;
    if (state === undefined || state.hidden) return undefined;
    return this.#example?.demo[state.opened];
  }

  /**
   * An item of the list, or an area of the sheet, comes into sight at once, as near as it is (R42),
   * and then out from under the row of buttons, should the row stick over where it came to: what
   * scrolls back up goes back as far as the row covers it. A row in its place, in a low window,
   * covers nothing, and the consumer's band, --novatrail-canvas-top, is what it comes out from
   * under then. A margin of scrolling would hold for
   * every scroller of the chain alike — the sheet's container, which the row stands above, and the
   * page, which it sticks over. An area of the sheet taller than what is in sight comes by its top
   * from below, but by its bottom from above, and then the row's cover brings its top back into
   * sight, under the row (T61).
   */
  #bringIntoSight(item: HTMLElement): void {
    item.scrollIntoView({ block: "nearest", behavior: "instant" });
    // A scroller that comes to its top hands the rest on to the next, as Up does (R33). A scroller
    // goes again only while each of its scrolls leaves less covered than the last: a row that the
    // element's bottom pushed up from where it sticks comes back down as the page scrolls, over
    // what the scroll brought out, and the next brings it out again (T94).
    const covered = new Map<Element | Window, number>();
    for (;;) {
      const latch = this.#scrollerFor(false);
      // A row in its place, in a low window, covers nothing of it: the consumer's band may, over
      // what the row sticks in.
      const over = this.#tools.sticks
        ? this.#tools.element.getBoundingClientRect().bottom
        : this.#band(latch?.target);
      const cover = over - item.getBoundingClientRect().top;
      if (cover <= EDGE || latch === undefined) return;
      const last = covered.get(latch.target);
      if (last !== undefined && cover >= last - EDGE) return;
      covered.set(latch.target, cover);
      latch.target.scrollBy({ top: -cover / latch.scale, behavior: "instant" });
    }
  }

  /**
   * The row of buttons as the sheet now is: the tools the task allows, the one in use, whether
   * undo and clearing have anything to do (R28), and a worked example's demo (R42).
   */
  #refresh(): void {
    // The finger's button comes and goes between the strokes of the whole page alone: a row that
    // wraps would move this sheet, and the sheets below it, under the pen. It is there in pen mode,
    // on a device that has touch (R29).
    if (this.#writer() === undefined && !PEN_MODE.writing) {
      this.#finger = PEN_MODE.on && navigator.maxTouchPoints > 0;
    }
    const demo = this.#demoState;
    this.#tools.show({
      kind: this.#rowKind(),
      tools: this.#shownTemplate.tools,
      tool: this.#tool,
      undoable: this.#work.undoable,
      clearable: this.#work.strokes.length > 0,
      larger: PAGE_ZOOM.larger,
      smaller: PAGE_ZOOM.smaller,
      finger: this.#finger,
      opens: this.#nextPart() !== undefined,
      expanded: demo?.hidden !== true,
    });
    this.#nameRegion();
  }

  /**
   * The container as a region of its own, a stop of Tab and a name, while its content overflows
   * it, and the keyboard scrolls it: in Safari a container that nothing in it can take the focus in
   * scrolls by no key without (R90 spec; WebKit's bug 277290). Without a height of its own the
   * element scrolls with the page and has no stop of Tab, and neither has one whose task fits. A
   * container that holds the focus keeps all three till the focus leaves it, not the window (T93).
   * Across, it scrolls while the sheet is zoomed, and an element without a height has a region
   * then too, if its sheet is wider than it (T94); unzoomed, it hides what overflows across.
   */
  #region(): void {
    if (!this.isConnected) return;
    const viewport = this.#viewport;
    const across = this.#zoom > 1 && overflowOf(viewport, "x") > EDGE;
    const focused = this.shadowRoot?.activeElement === viewport;
    const scrolls = overflowOf(viewport) > EDGE || across || focused;
    write(viewport, "tabindex", scrolls ? "0" : null);
    write(viewport, "role", scrolls ? "region" : null);
    this.#nameRegion();
  }

  /**
   * The region's name: the canvas kind's, or a worked example's, in the labels' language, which
   * the row's buttons are named in. For a `lang` the labels are not in, the container is in
   * theirs, English, and the column, all the container holds, in the element's: the name is said
   * in the language it is in, and the statement, the parts and the sheet as before (T106; R74).
   * With a `lang` the labels are in, the name is in the element's language already; without one,
   * the element's language is the page's, which no attribute of the column could name. Neither
   * then has a `lang` of its own.
   */
  #nameRegion(): void {
    const tag = this.getAttribute("lang");
    const { lang, labels } = labelsFor(tag);
    const apart = tag !== null && !knows(tag);
    const named = this.#viewport.hasAttribute("role");
    write(this.#viewport, "aria-label", named ? labels[this.#rowKind()] : null);
    write(this.#viewport, "lang", apart ? lang : null);
    write(this.#column, "lang", apart ? tag : null);
  }

  /** What the row of buttons is of, and is named by: a worked example, or the canvas kind (R42). */
  #rowKind(): RowKind {
    if (this.#example !== undefined) return "example";
    return isWorkbook(this.#shownTemplate) ? "workbook" : "sheet";
  }

  #request(): void {
    if (this.#frame !== 0 || !this.isConnected) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0;
      this.#draw();
    });
  }

  /**
   * The layers show the visible part of the sheet: each `<svg>` layer by its view box, in sheet
   * units, which the browser scales to the stage (R23). Before any is drawn, so that none goes on
   * showing a part of the sheet the others have left.
   */
  #place(screen: Screen): void {
    const width = screen.width / screen.k;
    const height = screen.height / screen.k;
    if (!(height > 0)) return;
    const viewBox = `${screen.vx} ${screen.vy} ${width} ${height}`;
    if (viewBox === this.#viewBox) return;
    this.#viewBox = viewBox;
    for (const layer of [this.#template, this.#show, this.#sketch, this.#marksLayer]) {
      layer.setAttribute("viewBox", viewBox);
    }
  }

  /**
   * The frames of the marks, around their strokes as the sheet shows them now (R26): off their
   * points by the padding, in sheet units, and kept to the sheet by half the frame's line, so that
   * a frame at its edge stays whole. A frame the stroke under way comes into fades till the stroke
   * lands, and only what has changed is written.
   */
  #drawMarks(screen: Screen): void {
    const fresh = this.#freshPoints();
    if (this.#shown.length === 0) return;
    const byId = this.#byId();
    const pending = this.#eraser.pending;
    const onScreen = (id: number): Box | undefined => {
      const stroke = pending.has(id) ? undefined : byId.get(id);
      return stroke && this.#pointBoxOf(stroke);
    };
    const half = 1 / screen.k;
    for (const mark of this.#shown) {
      const shown = shownOf(mark.placed, onScreen);
      const frame = shown && {
        minX: Math.max(shown.minX - MARK_PADDING, half),
        minY: Math.max(shown.minY - MARK_PADDING, half),
        maxX: Math.min(shown.maxX + MARK_PADDING, SHEET.width - half),
        maxY: Math.min(shown.maxY + MARK_PADDING, SHEET.height - half),
      };
      if (this.#writing === undefined || frame === null) mark.under = false;
      else if (!mark.under) {
        // A frame that came or moved while the stroke was under way is checked against all of it.
        const points = sameBox(frame, mark.frame) ? fresh : this.#writing.stroke.points;
        mark.under = points.some((point) => near(point, frame, INK_REACH + half));
      }
      mark.frame = frame;
      const drawn =
        frame === null
          ? "none"
          : `${frame.minX} ${frame.minY} ${frame.maxX} ${frame.maxY} ${mark.under}`;
      if (drawn === mark.drawn) continue;
      mark.drawn = drawn;
      const { rect } = mark;
      if (frame === null) {
        rect.setAttribute("display", "none");
        continue;
      }
      rect.setAttribute("x", String(frame.minX));
      rect.setAttribute("y", String(frame.minY));
      rect.setAttribute("width", String(frame.maxX - frame.minX));
      rect.setAttribute("height", String(frame.maxY - frame.minY));
      rect.classList.toggle("under", mark.under);
      rect.removeAttribute("display");
    }
  }

  /**
   * The points the stroke under way has gained since the marks last looked at it. A new stroke
   * starts with every mark as it is, unfaded.
   */
  #freshPoints(): readonly InkPoint[] {
    const live = this.#recorder.live;
    if (live === undefined) {
      this.#writing = undefined;
      return [];
    }
    if (this.#writing?.stroke !== live) {
      this.#writing = { stroke: live, seen: 0 };
      for (const mark of this.#shown) mark.under = false;
    }
    const fresh = live.points.slice(this.#writing.seen);
    this.#writing.seen = live.points.length;
    return fresh;
  }

  /** The strokes on the sheet by ID: each action on the work gives a new array of them (R19). */
  #byId(): ReadonlyMap<number, Stroke> {
    const strokes = this.#work.strokes;
    if (this.#onSheet.strokes !== strokes) {
      this.#onSheet = { strokes, byId: new Map(strokes.map((stroke) => [stroke.id, stroke])) };
    }
    return this.#onSheet.byId;
  }

  #pointBoxOf(stroke: Stroke): Box {
    let box = this.#pointBoxes.get(stroke);
    if (box === undefined) {
      box = boxOf(stroke.points);
      this.#pointBoxes.set(stroke, box);
    }
    return box;
  }

  /**
   * The layers in the visible part, and the strokes there, in device pixels: each finished stroke
   * by the path it was given once, the stroke under way outlined anew. A stroke whose points lie
   * far out of sight is not outlined till it comes into sight: a history given to the sheet may
   * hold thousands (R27). What the eraser under way has come near is out of sight already, though
   * still on the sheet until it lifts. The ink's colour is the canvas's, as the theme makes it.
   */
  #draw(): void {
    const screen = this.#view();
    if (screen === undefined) return;
    // Read before anything is written: the colour as the style now computes it.
    const colour = this.#canvasStyle.color;
    this.#place(screen);
    this.#drawMarks(screen);
    const context = this.#context;
    const { width, height } = this.#canvas;
    if (context === null || width === 0 || height === 0) return;
    // Device pixels to a unit, across and down: the ratio of the canvas's buffer to its rectangle,
    // which holds under any scale the page puts on the element, times `k`.
    const across = (width / screen.width) * screen.k;
    const down = (height / screen.height) * screen.k;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, width, height);
    context.setTransform(across, 0, 0, down, -screen.vx * across, -screen.vy * down);
    context.fillStyle = colour;
    const right = screen.vx + screen.width / screen.k;
    const bottom = screen.vy + screen.height / screen.k;
    const erasing = this.#eraser.pending;
    for (const stroke of this.#work.strokes) {
      if (erasing.has(stroke.id)) continue;
      // The outline keeps within half the widest line of the points: twice that is out of sight.
      const box = this.#pointBoxOf(stroke);
      if (box.maxY + 2 * INK_REACH < screen.vy || box.minY - 2 * INK_REACH > bottom) continue;
      if (box.maxX + 2 * INK_REACH < screen.vx || box.minX - 2 * INK_REACH > right) continue;
      const ink = this.#finished(stroke);
      if (ink.bottom >= screen.vy && ink.top <= bottom) context.fill(ink.path);
    }
    const live = this.#recorder.live;
    if (live !== undefined) context.fill(pathOf(this.#outline(live, false)));
  }

  #finished(stroke: Stroke): Ink {
    let ink = this.#inks.get(stroke);
    if (ink === undefined) {
      const polygon = this.#outline(stroke, true);
      const ys = polygon.map(([, y]) => y);
      ink = { path: pathOf(polygon), top: Math.min(...ys), bottom: Math.max(...ys) };
      this.#inks.set(stroke, ink);
    }
    return ink;
  }

  #outline(stroke: Stroke, complete: boolean): Vec2[] {
    this.#outlines++;
    return outline(stroke, complete);
  }
}

/**
 * Whether a pointer event is over the part of the sheet the container shows — the canvas, cut by
 * the container — rather than beyond it, where a captured pointer goes on and its place is clamped
 * to the sheet's edge.
 */
function inSight(event: PointerEvent, screen: Screen): boolean {
  const { shown } = screen;
  return (
    event.clientX >= shown.left &&
    event.clientX <= shown.right &&
    event.clientY >= shown.top &&
    event.clientY <= shown.bottom
  );
}

/** Whether a point lies within a box widened by `reach`, in sheet units. */
function near({ x, y }: InkPoint, box: Box, reach: number): boolean {
  return (
    x >= box.minX - reach && x <= box.maxX + reach && y >= box.minY - reach && y <= box.maxY + reach
  );
}

/**
 * An item of a workbook's lines (R36): its number, then its text and its boxes in the order they
 * are read, each where the layout put it. A piece of text is fitted to its width by SVG, whatever
 * the font, and its size is never read.
 */
function itemOf(item: PageItem): SVGGElement {
  const g = document.createElementNS(SVG, "g");
  g.setAttribute("role", "listitem");
  g.append(
    textOf(item.number),
    ...item.line.map((part) => (isBox(part) ? rectOf(part) : textOf(part))),
  );
  return g;
}

function textOf({ text, left, baseline, width }: PageText): SVGTextElement {
  const element = document.createElementNS(SVG, "text");
  element.setAttribute("x", String(left));
  element.setAttribute("y", String(baseline));
  element.setAttribute("textLength", String(width));
  element.setAttribute("lengthAdjust", "spacingAndGlyphs");
  element.textContent = text;
  return element;
}

/** A box, a picture to a screen reader, which its name tells of (R34). */
function rectOf(box: PageBox): SVGRectElement {
  const rect = document.createElementNS(SVG, "rect");
  placeOver(rect, box);
  rect.setAttribute("role", "img");
  return rect;
}

/** The bytes of a PNG as a Blob, for the consumer to send or show. */
function blobOf(png: Uint8Array<ArrayBuffer>): Blob {
  return new Blob([png], { type: "image/png" });
}

function sameBox(a: Box | null, b: Box | null): boolean {
  if (a === null || b === null) return a === b;
  return a.minX === b.minX && a.minY === b.minY && a.maxX === b.maxX && a.maxY === b.maxY;
}

/**
 * The events coalesced into a pointer event, in order, or the event alone. `getCoalescedEvents`
 * is there only in a secure context, and not in every browser; pointerup's list is empty.
 */
function coalesced(event: PointerEvent): readonly PointerEvent[] {
  const events = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : [];
  return events.length > 0 ? events : [event];
}

/** What the hands see of a pointer event (R29): where on the screen, how big, when. */
function contactOf(event: PointerEvent): Contact {
  return {
    pointerId: event.pointerId,
    kind: event.pointerType,
    x: event.clientX,
    y: event.clientY,
    width: event.width,
    height: event.height,
    time: event.timeStamp,
  };
}

/** The scroll an event's fingers owe a scroller, in whole pixels, if any: the rest waits (R29). */
function owed(
  latch: Latch | null | undefined,
): { target: Element | Window; step: number } | undefined {
  if (!latch) return undefined;
  const step = Math.round(latch.rest);
  if (step === 0) return undefined;
  latch.rest -= step;
  return { target: latch.target, step };
}

/** The values of `overflow-y`, or of `overflow-x`, that make an element scroll its content. */
const SCROLLING = /^(auto|scroll|overlay)$/;

/**
 * The values of `overflow-y` that make an element a scroll container, which a sticky box sticks in:
 * a hidden overflow too, which a script may scroll though no hand does (CSS Overflow 3).
 */
const CONTAINING = /^(auto|scroll|overlay|hidden)$/;

/**
 * The overflow of the page's viewport: the root's, or the body's when the root's is visible (CSS
 * Overflow 3), and then the body scrolls nothing of its own.
 */
function pageOverflow(axis: Axis = "y"): {
  readonly overflow: string;
  readonly fromBody: boolean;
} {
  const along = (style: CSSStyleDeclaration) => (axis === "y" ? style.overflowY : style.overflowX);
  const root = along(getComputedStyle(document.documentElement));
  const body = document.body === null ? "visible" : along(getComputedStyle(document.body));
  const fromBody = root === "visible" && body !== "visible";
  return { overflow: fromBody ? body : root, fromBody };
}

/** Whether an ancestor on the way up is where the page's viewport takes over. */
function isPage(node: Element, fromBody: boolean): boolean {
  return node === document.documentElement || (fromBody && node === document.body);
}

/**
 * The scroll container a sticky box sticks in: its nearest ancestor in the flat tree that is one,
 * or null for the page's viewport.
 */
function stickyPortOf(element: Element): Element | null {
  const { fromBody } = pageOverflow();
  let node = parentOf(element);
  while (node !== null && !isPage(node, fromBody)) {
    if (CONTAINING.test(getComputedStyle(node).overflowY)) return node;
    node = parentOf(node);
  }
  return null;
}

/**
 * What a sticky box sticks in, on the screen: the scroll container, or null for the page's
 * viewport, its top and its height — the viewport's without its scroll bar, which does not change
 * as a phone's toolbar of the browser comes and goes — and the box's offset below that top.
 */
function roomOf(element: Element): {
  readonly port: Element | null;
  readonly top: number;
  readonly height: number;
  readonly offset: number;
} {
  const port = stickyPortOf(element);
  const laid = port === null ? (document.scrollingElement?.clientHeight ?? 0) : port.clientHeight;
  const own = port === null ? undefined : clientBoxOf(port);
  return {
    port,
    top: own?.top ?? 0,
    height: own === undefined ? laid : own.bottom - own.top,
    offset: offsetOf(element, laid) * scaleOf(element),
  };
}

/**
 * How far below the top of what it sticks in a sticky box stands, by its `top`, in CSS pixels as
 * laid out: a percentage of the scroller's `height`, and nothing for `auto`. A sticky box's `top`
 * reads as the pixels it is used at, a static one's as it was given.
 */
function offsetOf(element: Element, height: number): number {
  const top = getComputedStyle(element).top;
  const value = Number.parseFloat(top);
  if (!Number.isFinite(value)) return 0;
  return top.endsWith("%") ? (value / 100) * height : value;
}

/** How far a scroll short of its end, or past it, still counts as at it: half a CSS pixel. */
const EDGE = 0.5;

/**
 * How far an element's content overflows it down, or across along `x`, in CSS pixels: where its
 * scroll ends.
 */
function overflowOf(element: Element, axis: Axis = "y"): number {
  return axis === "y"
    ? element.scrollHeight - element.clientHeight
    : element.scrollWidth - element.clientWidth;
}

/**
 * How far an element is scrolled from the top of its content, or from its left along `x`: in a
 * scroller that runs right to left, `scrollLeft` goes from 0 at the right down to minus its
 * overflow at the left (CSSOM View).
 */
function scrolledOf(element: Element, axis: Axis): number {
  if (axis === "y") return element.scrollTop;
  // Only one that overflows across reads its direction: it is asked at every scroll.
  const over = overflowOf(element, "x");
  if (over <= EDGE) return 0;
  return getComputedStyle(element).direction === "rtl"
    ? over + element.scrollLeft
    : element.scrollLeft;
}

/**
 * Whether an element can scroll on down its content, for `onward`, or back up it — or, along `x`,
 * on right across it or back left.
 */
function scrollsOn(element: Element, onward: boolean, axis: Axis = "y"): boolean {
  const at = scrolledOf(element, axis);
  return onward ? at < overflowOf(element, axis) - EDGE : at > EDGE;
}

/**
 * Where what a scroller shows is in sight down the screen, or across it along `x` (T94): within
 * the ancestors that clip it and the visual viewport, from `start` to `end` — and how much it
 * shows whole, for a scroller out of sight.
 */
function sightOf(
  target: Element | Window,
  axis: Axis,
): { readonly start: number; readonly end: number; readonly whole: number } {
  const down = axis === "y";
  const sight = window.visualViewport;
  let start = (down ? sight?.offsetTop : sight?.offsetLeft) ?? 0;
  let end = start + ((down ? sight?.height : sight?.width) ?? (down ? innerHeight : innerWidth));
  let whole = end - start;
  if (target instanceof Element) {
    const own = clientBoxOf(target);
    whole = down ? own.bottom - own.top : own.right - own.left;
    // The scroller, and every ancestor that clips it, up to the page, whose part is the sight.
    for (let node: Element | null = target; node !== null; node = parentOf(node)) {
      if (node === document.documentElement) break;
      const style = node === target ? undefined : getComputedStyle(node);
      if (style !== undefined && (down ? style.overflowY : style.overflowX) === "visible") continue;
      const clip = node === target ? own : clientBoxOf(node);
      start = Math.max(start, down ? clip.top : clip.left);
      end = Math.min(end, down ? clip.bottom : clip.right);
    }
  }
  return { start, end, whole };
}

/** Whether an element holds another in the flat tree, across the borders of shadow trees. */
function holds(ancestor: Element, element: Element): boolean {
  for (let node = parentOf(element); node !== null; node = parentOf(node)) {
    if (node === ancestor) return true;
  }
  return false;
}

/** A node's parent in the flat tree: the slot it is in, its parent, or its shadow root's host. */
function parentOf(element: Element): Element | null {
  if (element.assignedSlot !== null) return element.assignedSlot;
  if (element.parentElement !== null) return element.parentElement;
  const root = element.parentNode;
  return root instanceof ShadowRoot ? root.host : null;
}

/**
 * An element's client box on the screen — what it shows of its content, within its borders and
 * without its scroll bar — and how much the page scales it down the screen: 1 unless an ancestor
 * transforms it. The sheet's container has one, and so has any ancestor Up and Down scroll (R33).
 */
function clientBoxOf(element: Element): ClientBox {
  const box = element.getBoundingClientRect();
  const across = scaleOf(element, box, "x");
  const down = scaleOf(element, box);
  const left = box.left + element.clientLeft * across;
  const top = box.top + element.clientTop * down;
  const right = left + element.clientWidth * across;
  const bottom = top + element.clientHeight * down;
  return { left, top, right, bottom, across, down };
}

/**
 * How much the page scales an element down the screen, or across it along `x` (T94): 1 unless an
 * ancestor transforms it. `box` is its rectangle on the screen, when the caller has it already.
 */
function scaleOf(element: Element, box?: DOMRect, axis: Axis = "y"): number {
  const laid =
    element instanceof HTMLElement ? element[axis === "y" ? "offsetHeight" : "offsetWidth"] : 0;
  if (laid <= 0) return 1;
  const shown = box ?? element.getBoundingClientRect();
  return (axis === "y" ? shown.height : shown.width) / laid;
}

/**
 * A path around an outline: a closed curve through the midpoints of its edges, each point of the
 * outline the control point between two of them.
 */
function pathOf(polygon: readonly Vec2[]): Path2D {
  const path = new Path2D();
  const first = polygon[0];
  if (first === undefined) return path;
  const last = polygon[polygon.length - 1] ?? first;
  path.moveTo((last[0] + first[0]) / 2, (last[1] + first[1]) / 2);
  for (const [i, [x, y]] of polygon.entries()) {
    const [nextX, nextY] = polygon[i + 1] ?? first;
    path.quadraticCurveTo(x, y, (x + nextX) / 2, (y + nextY) / 2);
  }
  path.closePath();
  return path;
}

// A second copy of this module, from a second copy of the package, finds the name taken and
// leaves the first registration in place, rather than throwing when the page imports it. It says
// so, though: elements of the page are then built by the other copy, of whatever version it is.
const registered = customElements.get(TAG);
if (registered === undefined) {
  customElements.define(TAG, NovatrailCanvas);
} else if (registered !== NovatrailCanvas) {
  console.warn(
    `<${TAG}> is already registered by another copy of @altnovatrail/canvas; this copy's element is not used`,
  );
}

declare global {
  interface HTMLElementTagNameMap {
    "novatrail-canvas": NovatrailCanvas;
  }
  // The events bubble and leave shadow trees: their types hold on the element, on its ancestors and
  // on the document alike. Their map is the contract's, and the package that registers the element
  // puts it in the DOM's (R74 spec).
  interface GlobalEventHandlersEventMap extends CanvasEventMap {}
}
