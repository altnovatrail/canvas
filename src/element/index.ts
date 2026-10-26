// The package's entry point @altnovatrail/canvas: the canvas as a custom element, one for every
// canvas kind, with its markup in an open shadow root (R07). Importing it registers the element,
// once: a page has one element of this name. So far it is the handwriting sheet with its input,
// one pointer at a time (RUN.md, T09; R18), its undo and clearing, which the consumer calls from
// buttons of its own (T33; R19). Its eraser takes strokes off whole, by the path of a press, as
// the consumer's tool or a pen's eraser, and the sheet keeps the history of writing (T10; R22).
// The sheet is a stack of layers, the task's grid on its template and the task's statement above
// it, its look the consumer's to theme (T11; R23). The tutor's marks of a submission hold on to
// the learner's strokes, and a frame shows where each is, over the work (T14; R26). The history
// of writing comes in and goes out, an event tells of every action, and the work for checking is
// the crop with the context of its submission (T15; R27). The element's own buttons, with their
// labels in its `lang`, come with T41.

import type { Vec2 } from "perfect-freehand";
import { Clock } from "../core/clock.js";
import { ERASER_BUTTON, Eraser } from "../core/eraser.js";
import { type Box, boxOf } from "../core/geometry.js";
import { gridPath } from "../core/grid.js";
import { begins, type HistoryEvent, sameHistory } from "../core/history.js";
import type { InkPoint, Stroke } from "../core/ink.js";
import {
  type Marks,
  marksOf,
  type Placed,
  placesOf,
  type Submission,
  shownOf,
} from "../core/marks.js";
import { INK_REACH, outline } from "../core/outline.js";
import { type PointerSample, Recorder } from "../core/recorder.js";
import { fitScale, K_MAX, scaleFor, toSheet, type View } from "../core/screen.js";
import { SHEET } from "../core/sheet.js";
import { workForCheck } from "../core/submission.js";
import {
  NO_TASK,
  sameGrid,
  sameStatement,
  type Task,
  type Template,
  templateOf,
} from "../core/task.js";
import { nextIdOf, resumeOf, Work } from "../core/work.js";
import { attachProbe } from "./probe.js";
import { type Media, Statement } from "./statement.js";

export type { Crop, Frame } from "../core/crop.js";
export type { Box } from "../core/geometry.js";
export type { GridKind } from "../core/grid.js";
export type { Group } from "../core/groups.js";
export type { HistoryEvent } from "../core/history.js";
export type { InkPoint, Stroke } from "../core/ink.js";
export type { Anchor, CropNumbers, Mark, Marks, Submission } from "../core/marks.js";
export type { PicturePart, StatementPart, Task, TextPart } from "../core/task.js";
export type { Media } from "./statement.js";

/** The name the element is registered under. */
export const TAG = "novatrail-canvas";

/**
 * What a `historychange` tells (R27): the events the history of writing has gained, in its order,
 * and where the first of them stands in it — `history` is what was there before, and these.
 */
export interface HistoryChange {
  readonly events: readonly HistoryEvent[];
  readonly from: number;
}

/** The event the element sends after every action on the sheet (R27). */
export type HistoryChangeEvent = CustomEvent<HistoryChange>;

/** The work for checking (R27): the PNG of the crop, and the context of the submission. */
export interface ExportedWork {
  readonly png: Blob;
  readonly submission: Submission;
}

/** The colour of the ink unless the consumer's theme gives one. */
const INK = "#111";
/** The colour of the sheet unless the consumer's theme gives one. */
const PAPER = "#fff";
/** The event the element sends after every action on the sheet, with the history's new events. */
const HISTORY_CHANGE = "historychange";
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
 * What a press of the primary button does on the sheet: the pen writes, the eraser erases (R22). A
 * pen's eraser erases whatever the tool.
 */
export type Tool = "pen" | "eraser";
const TOOLS: readonly unknown[] = ["pen", "eraser"] satisfies readonly Tool[];

function isTool(value: unknown): value is Tool {
  return TOOLS.includes(value);
}

/**
 * How near a stroke's ink the eraser takes it, in CSS pixels: the same on every screen, whatever
 * the sheet's scale (R22). T22 tries it on devices.
 */
const ERASER_RADIUS_PX = 10;

const SVG = "http://www.w3.org/2000/svg";

// The statement and the sheet stand in a column of their own, as wide as the element up to
// 1000 CSS pixels and in its middle beyond, and scroll in a container of their own, by the
// browser's own scrolling: the wheel, the scroll bar and the keyboard work as anywhere on a page.
// The layers of the sheet stand in its visible part, the stage, and each shows what lies there,
// shifted in the frame the ink is drawn in (R18, R23; architecture 3.2 in docs/architecture.md).
// The element is as tall as the statement and the sheet unless it is given a height: then they
// scroll in it. On the canvas the browser neither scrolls nor zooms: the pointer writes. Only the
// canvas takes pointer events, and only as the element does: a consumer's pointer-events: none on
// the element stops the writing (R20). The theme is the consumer's, by custom properties that the
// shadow tree inherits; with forced colours the system's colours stand in for them.
const STYLE = `
:host { display: flex; flex-direction: column; }
:host([hidden]) { display: none; }
.viewport {
  flex: 1 1 auto; min-height: 0; overflow-x: hidden; overflow-y: auto; overflow-anchor: none;
}
.column { width: min(100%, ${K_MAX * SHEET.width}px); margin: 0 auto; }
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
.sheet {
  aspect-ratio: ${SHEET.width} / ${SHEET.height};
  background: var(--novatrail-canvas-paper, ${PAPER});
}
.stage { position: sticky; top: 0; max-height: 100%; overflow: clip; }
.stage > * { position: absolute; inset: 0; width: 100%; height: 100%; }
.stage > :not(canvas) { pointer-events: none; }
.grid {
  fill: none; stroke: var(--novatrail-canvas-grid, #d3dbe5); stroke-width: 1px;
  vector-effect: non-scaling-stroke;
}
.grid.dots { stroke-width: 3px; stroke-linecap: round; }
canvas {
  display: block; color: var(--novatrail-canvas-ink, ${INK}); transition: color 1ms step-end;
  touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
}
.marks rect {
  fill: none; stroke: var(--novatrail-canvas-mark, ${MARK}); stroke-width: 2px;
  vector-effect: non-scaling-stroke;
}
.marks rect.under { opacity: 0.25; }
@media (forced-colors: active) {
  .sheet { outline: 1px solid CanvasText; }
  .grid { stroke: GrayText; }
  canvas { color: CanvasText; }
  .marks rect { stroke: Highlight; }
}
`;

/** The view of the sheet, with the visible part's top left corner and height on the screen. */
interface Screen extends View {
  readonly left: number;
  readonly top: number;
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

/** An HTML layer of the sheet, empty in the first code: the module's widget, the author's show. */
function htmlLayer(name: string): HTMLDivElement {
  const div = document.createElement("div");
  div.className = name;
  div.setAttribute("aria-hidden", "true");
  return div;
}

/** The element `<novatrail-canvas>`. */
export class NovatrailCanvas extends HTMLElement {
  readonly #viewport = document.createElement("div");
  readonly #column = document.createElement("div");
  readonly #sheet = document.createElement("div");
  /** The sheet's visible part, where its layers stand, bottom to top (concepts 8 spec; R23). */
  readonly #stage = document.createElement("div");
  /** The author's template: the task's grid. */
  readonly #template = svgLayer("template");
  readonly #grid = document.createElementNS(SVG, "path");
  /** The module's widget, from stage 4 (R16 spec), and the author's show: empty for now. */
  readonly #widget = htmlLayer("widget");
  readonly #show = htmlLayer("show");
  /** The tutor's layer, in two: the sketch under the learner's work, the marks over it (T14). */
  readonly #sketch = svgLayer("sketch");
  /** The learner's work: the ink. */
  readonly #canvas = document.createElement("canvas");
  readonly #marksLayer = marksLayer();
  readonly #context = this.#canvas.getContext("2d");
  /** The canvas's style as it is computed, read live: its colour is the ink's on the screen. */
  readonly #canvasStyle = getComputedStyle(this.#canvas);
  /** The task's statement, above the sheet (R23). */
  readonly #statement = new Statement();
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
  #tool: Tool = "pen";
  #task: Task | undefined;
  #shownTemplate: Template = NO_TASK;
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
    // The container's new size, or the statement's: either moves the sheet.
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
  /** The top of the visible part, in sheet units, kept from the last scroll. */
  #vy = 0;
  /** The view box the layers were last given, so that a frame without a scroll writes none. */
  #viewBox = "";
  #frame = 0;
  #outlines = 0;
  #unwatchDensity: (() => void) | undefined;
  #unwatchColours: (() => void) | undefined;

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE;
    this.#viewport.className = "viewport";
    this.#column.className = "column";
    this.#sheet.className = "sheet";
    this.#stage.className = "stage";
    this.#grid.setAttribute("class", "grid");
    this.#template.append(this.#grid);
    this.#stage.append(
      this.#template,
      this.#widget,
      this.#show,
      this.#sketch,
      this.#canvas,
      this.#marksLayer,
    );
    this.#sheet.append(this.#stage);
    this.#column.append(this.#statement.element, this.#sheet);
    this.#viewport.append(this.#column);
    root.append(style, this.#viewport);
    this.#rule(NO_TASK);

    this.#canvas.addEventListener("pointerdown", (event) => this.#down(event));
    this.#canvas.addEventListener("pointermove", (event) => this.#move(event));
    this.#canvas.addEventListener("pointerup", (event) => this.#up(event));
    this.#canvas.addEventListener("pointercancel", (event) => {
      const dropped =
        this.#recorder.cancel(event.pointerId) || this.#eraser.cancel(event.pointerId);
      if (dropped) this.#request();
    });
    // A stroke or an erasing that ends here, or on its pointerup, lands through its handler, which
    // draws the sheet anew.
    this.#canvas.addEventListener("lostpointercapture", (event) => {
      this.#recorder.end(event.pointerId);
      this.#eraser.end(event.pointerId);
    });
    // A long press of a pen or a finger, or a right click, opens no menu over the sheet.
    this.#canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    // A new colour of the ink, from the consumer's theme or the page's colour scheme, ends a
    // transition of the canvas's colour a millisecond long: the ink is drawn anew in it.
    this.#canvas.addEventListener("transitionend", () => this.#request());
    this.#canvas.addEventListener("transitioncancel", () => this.#request());
    this.#viewport.addEventListener("scroll", () => this.#scrolled(), { passive: true });

    attachProbe(this, () => ({
      strokes: this.#work.strokes,
      live: this.#recorder.live,
      pending: [...this.#eraser.pending],
      outlines: this.#outlines,
      view: this.#view(),
      marks: this.#shown.map(({ name, placed, frame }) => ({ name, ids: placed.ids, frame })),
    }));

    this.#adopt("tool");
    this.#adopt("task");
    this.#adopt("media");
    // The history before the marks: they hold on to its strokes.
    this.#adopt("history");
    this.#adopt("marks");
  }

  /**
   * What a press of the primary button does: "pen" writes, as the element starts, and "eraser"
   * erases (R22). It is the consumer's to switch, from a button of its own, and a press under way
   * goes on as it began. A pen's eraser erases whatever the tool.
   */
  get tool(): Tool {
    return this.#tool;
  }

  set tool(tool: Tool) {
    if (!isTool(tool)) {
      throw new TypeError(`the tool of <${TAG}> is "pen" or "eraser", not ${JSON.stringify(tool)}`);
    }
    this.#tool = tool;
  }

  /**
   * The open view of the task: its canvas — the grid of the sheet — and its statement, which the
   * element shows above the sheet (R23). The type is the element's own until spec's format v0 gives
   * one; fields the element does not read are passed over. A task it cannot show is a TypeError.
   * Another task of the same grid and statement changes nothing, and any other changes the
   * template alone: the work stays, for the next task is a new element (R20).
   */
  get task(): Task | undefined {
    return this.#task;
  }

  set task(task: Task | undefined) {
    if (task === this.#task) return;
    const template = templateOf(task);
    this.#task = task;
    // The grid and the statement apart: a new grid leaves the statement and its pictures as they
    // are, and the other way round.
    const shown = this.#shownTemplate;
    this.#shownTemplate = template;
    if (!sameGrid(template, shown)) this.#rule(template);
    if (!sameStatement(template, shown)) this.#statement.show(template);
  }

  /**
   * What gives the files of the statement's pictures, by their references (R07). Until a picture's
   * file comes, or if it never does, its frame shows what it shows in words. A new function serves
   * the pictures that have no file yet, and stops no load the last one began.
   */
  get media(): Media | undefined {
    return this.#statement.media;
  }

  set media(media: Media | undefined) {
    if (media !== undefined && typeof media !== "function") {
      throw new TypeError(
        `the media of <${TAG}> is a function that gives a Blob, not ${typeof media}`,
      );
    }
    this.#statement.media = media;
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
   * either order.
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
    this.#told = after.length;
    this.#writing = undefined;
    this.#equal = undefined;
    // The marks as they were checked when given go back on their strokes, if this history has them.
    if (this.#given !== undefined) {
      try {
        this.#showMarks(this.#places(this.#given));
      } catch (error) {
        if (!(error instanceof TypeError)) throw error;
        this.#marks = undefined;
        this.#given = undefined;
        this.#showMarks([]);
      }
    }
    this.#request();
  }

  /**
   * The tutor's marks of one submission, with the context the element gave with its crop (R07,
   * R26): each a frame where a group of strokes is, or a box on the crop the model saw. A mark
   * holds on to the strokes the model saw there and is drawn around those of them the sheet shows,
   * as they are now: new strokes do not move it, and when all of them are erased it is gone, till
   * undo brings them back. A box that comes near no stroke, and an answer cell while the task has
   * none, have no frame: the question is asked without one. The type is the element's own until
   * spec's contract gives one. A submission goes back to a sheet whose history holds its strokes,
   * as its digest tells (R27): one of other strokes is a TypeError, and so are marks given before
   * the history they hold on to, and marks that are not marks. A new history puts the marks back
   * on their strokes, or takes them off. `undefined` takes the marks off. Every value is checked as
   * it comes, and marks equal to those shown write nothing.
   */
  get marks(): Marks | undefined {
    return this.#marks;
  }

  set marks(marks: Marks | undefined) {
    const given = marks === undefined ? undefined : marksOf(marks);
    const shown = given === undefined ? [] : this.#places(given);
    this.#marks = marks;
    this.#given = given;
    this.#showMarks(shown);
  }

  connectedCallback(): void {
    this.#resize.observe(this.#viewport);
    this.#resize.observe(this.#statement.element);
    this.#watchDensity();
    this.#watchColours();
    this.#statement.connect();
  }

  /**
   * Takes back the last action on the sheet — the last stroke written, the last erasing, or the
   * clearing — and says whether there was one (R19, R22), with a `historychange` if there was
   * (R27). A stroke under way stays: it lands when it ends. So does an erasing: what it came near
   * leaves the sheet when it lifts, if it is on the sheet then.
   */
  undo(): boolean {
    const undone = this.#work.undo(performance.now());
    if (undone) this.#changed();
    return undone;
  }

  /**
   * Takes every stroke off the sheet, an action that undo takes back, and says whether there were
   * any (R19), with a `historychange` if there were (R27). A stroke under way stays: it lands when
   * it ends.
   */
  clear(): boolean {
    const cleared = this.#work.clear(performance.now());
    if (cleared) this.#changed();
    return cleared;
  }

  /**
   * The work for checking (R07, R27), when the consumer asks for it, at Check: the crop of the
   * strokes the sheet shows, at the height of a digit the task asks for (R25), its PNG, and the
   * context of the submission — the crop's numbers, the groups and their digest (R26, R27) — which
   * the consumer keeps, sends only the PNG to be checked (R09 spec), and gives back with the tutor's
   * marks. It is the sheet as it is when this is called: a stroke under way is not on it yet, while
   * the strokes under an eraser not yet lifted still are. A sheet without strokes has no work to
   * check, and the promise gives null (H3).
   */
  async exportWork(): Promise<ExportedWork | null> {
    const work = workForCheck(this.#work.strokes, this.#shownTemplate.digit);
    if (work === null) return null;
    const png = new Blob([work.png], { type: "image/png" });
    return Object.freeze({ png, submission: work.submission });
  }

  disconnectedCallback(): void {
    // A stroke or an erasing under way ends where it is: its pointerup will not reach a sheet off
    // the page. Its historychange reaches only the element's own listeners, for the element is in
    // no tree now.
    this.#recorder.end();
    this.#eraser.end();
    this.#statement.disconnect();
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
  #adopt(name: "tool" | "task" | "media" | "history" | "marks"): void {
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

  /** The grid of a template on the sheet. */
  #rule(template: Template): void {
    this.#grid.setAttribute("d", gridPath(template.grid));
    this.#grid.classList.toggle("dots", template.grid.kind === "dots");
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
    const places = placesOf(given, this.#known());
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
        return shown !== undefined && shown.name === name && sameIds(shown.placed.ids, placed.ids);
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
   * One pointer at a time writes or erases (R18, R22): the primary button does what the tool says,
   * and a pen's eraser erases.
   */
  #down(event: PointerEvent): void {
    if (this.#recorder.pointer !== undefined || this.#eraser.pointer !== undefined) return;
    const screen = this.#view();
    if (screen === undefined) return;
    const sample = this.#sample(event, screen);
    const began =
      this.#tool === "eraser" || sample.button === ERASER_BUTTON
        ? this.#eraser.down(sample, ERASER_RADIUS_PX / screen.k + INK_REACH)
        : this.#recorder.down(sample);
    if (!began) return;
    // The stroke or the erasing goes on beyond the canvas, clamped to the sheet's edge, until the
    // pointer comes up.
    try {
      this.#canvas.setPointerCapture(event.pointerId);
    } catch {
      // The pointer is no longer active, or never was: an event that a script made.
    }
    this.#request();
  }

  #move(event: PointerEvent): void {
    const input = this.#inputOf(event.pointerId);
    if (input === undefined) return;
    const screen = this.#view();
    if (screen === undefined) return;
    let changed = false;
    for (const each of coalesced(event)) {
      const sample = this.#sample(each, screen);
      const moved =
        input === this.#eraser ? input.move(sample, inSight(each, screen)) : input.move(sample);
      changed = moved || changed;
    }
    if (changed) this.#request();
  }

  #up(event: PointerEvent): void {
    const input = this.#inputOf(event.pointerId);
    if (input === undefined) return;
    const screen = this.#view();
    if (screen === undefined) input.end(event.pointerId);
    else if (input === this.#eraser) input.up(this.#sample(event, screen), inSight(event, screen));
    else input.up(this.#sample(event, screen));
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
   * the canvas is as wide as the sheet, and its top is the top of the visible part. `k` is the one
   * on the screen, after whatever transform the page puts on the element. The container's
   * rectangle gives the part of the canvas it shows: with the statement in sight, the canvas
   * goes on below the container's bottom.
   */
  #view(): Screen | undefined {
    const canvas = this.#canvas.getBoundingClientRect();
    if (canvas.width <= 0) return undefined;
    const k = scaleFor(canvas.width);
    const sheet = this.#sheet.getBoundingClientRect();
    const vy = (canvas.top - sheet.top) / k;
    const port = this.#port();
    const shown = {
      left: Math.max(canvas.left, port.left),
      top: Math.max(canvas.top, port.top),
      right: Math.min(canvas.right, port.right),
      bottom: Math.min(canvas.bottom, port.bottom),
    };
    return { k, vy, left: canvas.left, top: canvas.top, height: canvas.height, shown };
  }

  /**
   * The container's client box on the screen — what it shows of its content — and how much the
   * page scales it down the screen: 1 unless the element is in a transformed ancestor.
   */
  #port(): {
    readonly left: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly down: number;
  } {
    const port = this.#viewport;
    const box = port.getBoundingClientRect();
    const across = port.offsetWidth > 0 ? box.width / port.offsetWidth : 1;
    const down = port.offsetHeight > 0 ? box.height / port.offsetHeight : 1;
    const left = box.left + port.clientLeft * across;
    const top = box.top + port.clientTop * down;
    const right = left + port.clientWidth * across;
    const bottom = top + port.clientHeight * down;
    return { left, top, right, bottom, down };
  }

  /** The sheet's top in the container's content, in CSS pixels as laid out: under the statement. */
  #sheetTop(): number {
    const port = this.#port();
    const sheet = this.#sheet.getBoundingClientRect();
    return (sheet.top - port.top) / port.down + this.#viewport.scrollTop;
  }

  /**
   * The top of the visible part from the scroll and the last layout, without reading the layout
   * again: the stage sticks to the container's top once the sheet's top has gone past it.
   */
  #scrolled(): void {
    if (this.#k > 0) this.#vy = Math.max(0, this.#viewport.scrollTop - this.#sheetAt) / this.#k;
    this.#request();
  }

  /**
   * The stage takes the visible part of the sheet, and the canvas a pixel of its buffer for each
   * device pixel: its size on the screen times the density (R18). The layers follow in the same
   * frame.
   */
  #layout(): void {
    const area = this.#area;
    if (area === undefined || area.width === 0) return;
    // The column is as wide as the container up to the cap, and the stage as tall as the visible
    // part of the sheet.
    const k = fitScale(area.width);
    const sheetAt = this.#sheetTop();
    // A new width scales the sheet, and a statement of a new height moves it: the top of the
    // visible part stays where it was on the sheet, unless the sheet's top is in sight. A new
    // height of the container alone moves neither, and a scroll under way goes on.
    if (this.#vy > 0 && (k !== this.#k || Math.abs(sheetAt - this.#sheetAt) > 0.5)) {
      this.#viewport.scrollTop = sheetAt + this.#vy * k;
    }
    this.#k = k;
    this.#sheetAt = sheetAt;
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
    const height = screen.height / screen.k;
    if (!(height > 0)) return;
    const viewBox = `0 ${screen.vy} ${SHEET.width} ${height}`;
    if (viewBox === this.#viewBox) return;
    this.#viewBox = viewBox;
    for (const layer of [this.#template, this.#sketch, this.#marksLayer]) {
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
    // Device pixels to a unit, across and down. The canvas is as wide as the sheet, and the ratio
    // of its rectangles holds under any scale the page puts on the element.
    const across = width / SHEET.width;
    const down = (height / screen.height) * screen.k;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, width, height);
    context.setTransform(across, 0, 0, down, 0, -screen.vy * down);
    context.fillStyle = colour;
    const bottom = screen.vy + screen.height / screen.k;
    const erasing = this.#eraser.pending;
    for (const stroke of this.#work.strokes) {
      if (erasing.has(stroke.id)) continue;
      // The outline keeps within half the widest line of the points: twice that is out of sight.
      const box = this.#pointBoxOf(stroke);
      if (box.maxY + 2 * INK_REACH < screen.vy || box.minY - 2 * INK_REACH > bottom) continue;
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

function sameIds(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((id, n) => id === b[n]);
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
  // The event bubbles and leaves shadow trees: its type holds on the element, on its ancestors and
  // on the document alike.
  interface GlobalEventHandlersEventMap {
    historychange: HistoryChangeEvent;
  }
}
