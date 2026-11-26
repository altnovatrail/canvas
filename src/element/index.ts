// The package's entry point @altnovatrail/canvas: the canvas as a custom element, one for every
// canvas kind, with its markup in an open shadow root. Importing it registers the element,
// once: a page has one element of this name. The types of its contract with app are spec's, of
// @altnovatrail/spec/canvas: the element implements its CanvasElement, and the package puts the
// element and its events in the DOM's maps.
//
// The handwriting sheet takes its input one pointer at a time, with undo and clearing.
// Its eraser takes strokes off whole, by the path of a press, as the tool or a pen's eraser, and
// the sheet keeps the history of writing. The sheet is a stack of layers, the task's grid on
// its template and the task's statement above it, its look the consumer's to theme. The
// tutor's marks of a submission hold on to the learner's strokes, and a frame shows where each is,
// over the work. The history of writing comes in and goes out, an event tells of every
// action, and the work for checking is the crop with the context of its submission. Over it
// all stand the element's own buttons — the tools the task allows, undo and clearing —, labelled
// in the element's `lang`, on a vertical bar of glass at its left edge. On a tablet a
// pen's touch puts the page in pen mode, where a finger writes nothing, a palm writes nothing, and
// two fingers scroll, one finger too.
// The task comes in the names of the module format 0.4, checked as its schema checks it, and the
// module's manifest gives the height of a digit and the statement's language.
//
// The workbook's lines, laid out on its page, stand on the template in place of the grid —
// numbers, text and boxes, which a screen reader reads in the task's order. Each stroke
// is in one box or in none, by a rule of whole numbers, and `filled` tells which boxes hold one: a
// filled box's frame is thicker, and its name says so. A workbook's work for checking is the
// crop of each filled box, with the table of the boxes' strokes for its context.
//
// A lesson's worked example it shows on a sheet the learner does not write on: its statement above
// the sheet, its grid, and no bar, while a finger or a pen scrolls the sheet as the browser scrolls
// the statement. The parts of its demo the learner opens one at a time
// with Next, into a list above the sheet that a polite region tells a screen reader of, and hides
// and shows with Demo; app keeps how far the learner has gone by `demoState` and `demochange`. The
// pictures of the statement and of the demo come from the consumer's media, one file for each
// reference, all of them as the task or the example comes: a part opened shows its picture at
// once. A picture on an area of the sheet stands on the layer of the author's demo, over its area,
// and the sheet scrolls to the area as the part opens. A worked example on a workbook lays
// its lines out as a task's, and a part of its demo that fills a box writes the box's value in it.
//
// The keyboard goes into the sheet and out: a container that scrolls is a region named by the
// canvas kind, with a stop of Tab of its own and a ring when the keyboard brings the focus there;
// for a `lang` the labels are not in, the container is in theirs and the column in the
// element's. The sheet goes on past the task's page, which stands at its left, right and
// down as far as the ink and one view more, and nothing zooms it: the hand, two fingers, the wheel
// and the keys move it across as well as down.
//
// A task from the learner's paper it shows on a sheet of the learner's grid, which the grid's
// button turns round, dots as the task comes, with the task's crop over it as tracing paper,
// which the learner moves by its grip, hides and shows by the button atop the tools, and writes on
// as on the sheet: a stroke begun on the paper is the paper's and moves with it, and an erasing
// begun on it takes the paper's strokes alone. The work for checking is the crop of the paper and
// of the sheet's strokes, with the task's crop beside it.
//
// The learner's settings of the pen and the eraser, `pens`, come and go with `penchange`: a second
// press of the chosen pen or eraser opens its popover. Each stroke takes the style of the kind of
// pen in use — its colour, width and opacity —, which the screen, the crop for checking and the
// picture of the work draw it in. The eraser takes strokes whole, or in the mode "part" only what
// it passes over, cutting the strokes it crosses into pieces, new strokes, and the tutor's marks
// hold on to the pieces as to the strokes they were cut of. The attribute `unstyled` writes without
// styles, each stroke 3 units wide in the theme's ink: no popover opens, and the eraser takes
// whole strokes.

import type {
  CanvasElement,
  CanvasEventMap,
  DrawingCover,
  ExportedPaper,
  ExportedWork,
  GridChange,
  HistoryChange,
  Media,
  PaintStats,
  PaperGrid,
  PaperTask,
  ToolChange,
  TracingReading,
  TracingState,
} from "@altnovatrail/spec/canvas";
import type { Vec2 } from "perfect-freehand";
import { type Cell, cellOf, cellsOf, type Filled, filledOf, sheetFilledOf } from "../core/boxes.js";
import { Clock } from "../core/clock.js";
import { Cut, cutOf } from "../core/cut.js";
import { ERASER_BUTTON, Eraser, type Erasure } from "../core/eraser.js";
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
import { dotsTiling, GRID_STEP, gridBand, gridPath } from "../core/grid.js";
import { type Contact, Hands } from "../core/hands.js";
import { begins, type HistoryEvent, sameHistory, writtenBy } from "../core/history.js";
import type { InkPoint, Stroke } from "../core/ink.js";
import { type Manifest, NO_MANIFEST, type Settings, settingsOf } from "../core/manifest.js";
import {
  type Marks,
  marksOf,
  type PaperSubmission,
  type Placed,
  placesOf,
  shownOf,
} from "../core/marks.js";
import { outline } from "../core/outline.js";
import {
  isBox,
  LAYOUT,
  type Page,
  type PageBox,
  type PageItem,
  type PageText,
  pieceWidth,
} from "../core/page.js";
import { encodePNG } from "../core/png.js";
import { type PointerSample, Recorder } from "../core/recorder.js";
import { fitScale, K_MAX, type Point, scaleFor, toSheet, type View } from "../core/screen.js";
import {
  keptOffset,
  rectangleOf,
  type Scaling,
  scaledStroke,
  scaleRange,
  takenBy,
} from "../core/select.js";
import { extentOf, pictureOf, REACH, SHEET, type Size } from "../core/sheet.js";
import {
  type EraserMode,
  PALETTE,
  PEN_SETTINGS,
  type PenSettings,
  penSettingsOf,
  reachOf,
} from "../core/style.js";
import {
  cellsForCheck,
  drawingSubmissionOf,
  paperWorkForCheck,
  workForCheck,
} from "../core/submission.js";
import {
  HAND,
  isTool,
  isWorkbook,
  NO_TASK,
  SELECT,
  sameLayer,
  sameStatement,
  type Task,
  type Template,
  type Tool,
  taskOf,
  templateOf,
  wholeSheet,
} from "../core/task.js";
import {
  boxOnSheet,
  isPaperGrid,
  keptOn,
  layOver,
  nextGrid,
  onSheet,
  onTracing,
  PAPER_GRIDS,
  readingOf,
  rulingsOf,
  sameTracing,
  scaled,
  scaleIn,
  TRACING,
  TRACING_START,
  toTracing,
  rectOf as tracingRect,
  scaleOf as tracingScaleOf,
  tracingStateOf,
  whollyOff,
} from "../core/tracing.js";
import {
  type CropStroke,
  cropStrokesOf,
  type DrawingContext,
  drawingContextOf,
  drawingCropOf,
  drawnPart,
  lengthOf,
  type Timing,
  type TutorAct,
  timingsOf,
  tutorPlanOf,
} from "../core/tutor.js";
import { type Cutting, nextIdOf, resumeOf, Work } from "../core/work.js";
import { ZOOM_MIN, ZOOM_STEP } from "../core/zoom.js";
import { placeOver, SVG, write } from "./attributes.js";
import { Flash } from "./flash.js";
import { knows, labelsFor, say, sayAround } from "./labels.js";
import { Parts } from "./parts.js";
import { pensStyle, samePens, screenColourOf } from "./pens.js";
import { Pictures } from "./pictures.js";
import { attachProbe } from "./probe.js";
import { type Corner, Selection } from "./selection.js";
import { PAGE_ZOOM, PEN_MODE } from "./session.js";
import { Statement } from "./statement.js";
import { type DemoControls, type RowKind, Tools } from "./tools.js";
import { TracingPaper } from "./tracing.js";

/**
 * The types of the contract of canvas and app are spec's: the element as
 * CanvasElement has it, what its events tell and the work it gives for checking, here, and the data
 * — the history of writing, the context of a submission, the filled slots and the state of a demo
 * — through the DOM-free part. The entry point gives them under spec's names, the same types, the
 * media and the tutor's marks too. The crop and a task with its temporary tools are the element's
 * own.
 */
export type {
  Box,
  CanvasElement,
  CanvasEventMap,
  CropStroke,
  DemoChangeEvent,
  DrawingCover,
  EraserMode,
  ExportedCell,
  ExportedPaper,
  ExportedSheet,
  ExportedWork,
  ExportedWorkbook,
  GridChange,
  GridChangeEvent,
  HistoryChange,
  HistoryChangeEvent,
  Media,
  PaintStats,
  PaperGrid,
  PaperTask,
  PenChangeEvent,
  PenKind,
  PenSettings,
  StrokeStyle,
  ToolChange,
  ToolChangeEvent,
  TracingChangeEvent,
  TracingReadEvent,
  TracingReading,
  TracingState,
  TutorAct,
} from "@altnovatrail/spec/canvas";
export type { Filled, Filling } from "../core/boxes.js";
export type { Crop, Frame } from "../core/crop.js";
export type { DemoState, WorkedExample } from "../core/example.js";
export type { GridKind } from "../core/grid.js";
export type { Group } from "../core/groups.js";
export type { HistoryEvent, Piece } from "../core/history.js";
export type { InkPoint, Stroke } from "../core/ink.js";
export type { Manifest } from "../core/manifest.js";
export type {
  Anchor,
  CellPlace,
  CropNumbers,
  Mark,
  Marks,
  PaperSubmission,
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
/**
 * The colour of the tool in use and of the focus on the bar unless the consumer's theme gives one,
 * and the bar's glass: the interface mockup's.
 */
const ACCENT = "#0071E3";
const GLASS = "rgba(255, 255, 255, 0.76)";
/** The event the element sends after every action on the sheet, with the history's new events. */
const HISTORY_CHANGE = "historychange";
/** The event the element sends when the learner chooses another tool with its buttons. */
const TOOL_CHANGE = "toolchange";
/** The event the element sends when the learner opens a part of the demo, or hides or shows it. */
const DEMO_CHANGE = "demochange";
/** The event the element sends when the learner moves the tracing paper, or hides or shows it. */
const TRACING_CHANGE = "tracingchange";
const TRACING_READ = "tracingread";
/** The event the element sends when the learner turns a task from paper's grid with its button. */
const GRID_CHANGE = "gridchange";
/** The event the element sends when the learner changes a setting of the pen or the eraser. */
const PEN_CHANGE = "penchange";
/**
 * A task from paper's template: no statement, the pen and the eraser, and a dotted sheet, as the
 * task comes, whose grid the learner turns.
 */
const PAPER_TEMPLATE: Template = Object.freeze({
  grid: Object.freeze({ kind: "dots", step: TRACING.dots }),
  statement: Object.freeze([]),
  tools: NO_TASK.tools,
});
/** What Next and Demo control, by their IDs in the shadow root: the region, and the list. */
const DEMO_IDS: DemoControls = { status: "demo-status", parts: "demo-parts" };
/**
 * The colour of the tutor's frames unless the consumer's theme gives one: a blue, and not a red,
 * which would read as «wrong».
 */
const MARK = "#2563eb";
/**
 * The colours of a verdict's tick and cross, over its white halo: a green, and an amber rather than
 * a red, for «not yet» is no failure; each holds more than 3:1 on white, and the halo holds them
 * over any sheet or photo of a page.
 */
const RIGHT = "#15803d";
const NOT_YET = "#b45309";
/** The size of a verdict's halo, in CSS pixels: the same on every screen, whatever the scale. */
const VERDICT_PX = 28;
/** How far a verdict stands off the right of its answer's box, in CSS pixels. */
const VERDICT_GAP_PX = 4;
/** A verdict's tick and cross, on the 24 × 24 of the halo's circle. */
const TICK = "M7 12.5l3.5 3.5L17 8.5";
const CROSS = "M8 8l8 8M16 8l-8 8";
/**
 * The colour of the tutor's wavy line of "Show where" unless the consumer's theme gives one: an
 * orange, as the mockup's, 3.58:1 on white, over a white halo that holds it over any sheet or photo
 * of a page.
 */
const WAVY = "#e8590c";
/**
 * The wavy line, in sheet units: half a wave half a square of the sheet long, its crests this high
 * off its middle, this far under its place, and reaching this far past each side of it.
 */
const WAVY_HALF = GRID_STEP / 4;
const WAVY_CREST = 3.5;
const WAVY_BELOW = 12;
const WAVY_REACH = 10;
/** How far a frame stands off the points of its strokes, in sheet units, as canvas-api's. */
const MARK_PADDING = 10;
/** The rounding of a frame's corners, in sheet units. */
const MARK_CORNER = 6;

/**
 * How near a stroke's ink the eraser takes it, in CSS pixels: the same on every screen, whatever
 * the sheet's scale.
 */
const ERASER_RADIUS_PX = 10;

// The statement and the sheet stand in a column of their own, and scroll in a container of their
// own, by the browser's own scrolling: the wheel, the scroll bar and the keyboard work as anywhere
// on a page. The task's page is as wide as the element up to 1000 CSS pixels and stands at the
// sheet's left; the sheet goes on past it as far as `#extent` says, and the container scrolls it
// across too, left to right whatever the page's direction, while the statement and a demo's parts
// stay as wide as the page and stick to its left, in the element's own direction: they scroll down
// alone. The layers of the sheet stand in its visible part, the stage, which sticks to the
// container's top and left, and each shows what lies there, shifted in the frame the ink is drawn
// in. Over the container, in the same cell of the frame's grid, stands the rail of the
// element's own buttons: a band as tall as the part of the element in sight and as wide as nothing,
// sticking to the top of whatever scrolls the element, as far down as the consumer's
// --novatrail-canvas-top says, and up to its bottom less --novatrail-canvas-pad-bottom, and in its
// middle, 16 pixels from the left edge, the bar of buttons: 52 pixels wide, round at its ends, of
// the mockup's glass — the fill the consumer's theme gives, blurred behind, or the paper alone
// where nothing blurs — over the sheet as it scrolls by. A bar taller than the
// band scrolls inside its glass (WCAG 1.4.10). A worked example has no bar, and its Next and Demo
// stand in a row of the same glass at the band's bottom, the consumer's buttons of the slot actions
// after them. The tool in use is filled with the accent at an eighth, its icon in the accent;
// a button in focus shows a ring in the accent; an unavailable one is paler by its colour, not its
// opacity, which would pale the ring too (WCAG 2.4.7, 1.4.11). A button's tooltip stands beside it,
// white on near-black, as the mockup has it. Nothing in the element moves but the scrolling, which
// jumps, and, only to whom motion is no harm, the sign of a wait and a popover as it opens; no
// tooltip fades (WCAG 2.3.3). A pen that hovers over the sheet shows a circle as wide as its line,
// in its colour, or the eraser's circle, white seen through within a dark edge. The element is as tall as the statement and the sheet
// unless it is given a height: then the statement and the sheet scroll in it, under the bar. A
// consumer whose own bars float over the element's top and bottom says how far by
// --novatrail-canvas-pad-top and -bottom: the statement starts below the first, and the sheet
// scrolls up past the second. A worked example's open parts stand between the statement and
// the sheet, and the region that tells of them is out of sight, but not out of the tree a screen
// reader reads, where a hidden region would tell nothing. A picture's frame there stands in
// its item's line, from its top, so that the item's number stands at the top too, as a paragraph's
// does, and not at the picture's bottom. A picture on an area of the sheet stands on the layer of
// the author's demo, and the sheet scrolls to a hidden box of the area in its own flow, which
// neither paints nor takes a pointer. On the canvas the browser neither scrolls nor zooms:
// the pointer writes, or with the hand moves the sheet, and two fingers scroll by the element's own
// code, and in pen mode one finger too. The canvas and the buttons take pointer
// events only as the element does: a consumer's pointer-events: none on the element stops the
// writing and the buttons' pointer, though not their keys. A worked example's canvas
// takes no pointer at all: a finger or a pen on its sheet scrolls, and zooms, as the browser does
// on the statement, and a long press or a right click opens no menu over the sheet all the same.
// No text of the element is selected, nor does a long press open a menu of the system over it: on
// an iPad a pen's double tap or long press, the way a dot or an equals sign is written, would
// select the nearest text, a button's label out of sight among it, and the system's menu of the
// selection would come up over the sheet (measurements 1.8). A screen reader reads what it read
// before.
// The theme is the consumer's, by custom properties that the shadow tree inherits; with
// forced colours the system's colours stand in for them. The element is horizontal whatever writing
// mode the page is in: a sheet has no other.
//
// A workbook's lines are printed in the ink's colour and the consumer's font, and nothing else the
// element inherits — spacing, weight, transforms, the direction — moves them: `all: initial` takes
// it off, and what the print needs comes back. A box's frame is one CSS pixel at any scale,
// on whole device pixels: an antialiased line of one pixel would lose its contrast. A filled box's
// is three, in the same ink, and the system's highlight with forced colours. A dot of the grid
// is three pixels across at the fit and above it, and smaller by the zoom below it, so that a sheet
// zoomed out is no field of dots.
const STYLE = `
:host {
  display: flex; flex-direction: column; isolation: isolate; writing-mode: horizontal-tb;
  user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
}
:host([hidden]) { display: none; }
.frame {
  position: relative; flex: 1 1 auto; min-height: 0; display: grid;
  grid-template: minmax(0, 1fr) / minmax(0, 1fr);
}
.viewport {
  grid-area: 1 / 1; min-height: 0; overflow: auto; overflow-anchor: none; direction: ltr;
  scrollbar-width: none; outline: none; -webkit-tap-highlight-color: transparent;
}
.rail {
  grid-area: 1 / 1; align-self: start; justify-self: left; width: 0; direction: ltr;
  position: sticky; top: var(--rail-top, var(--novatrail-canvas-top, 0px)); z-index: 1;
  box-sizing: border-box; padding: 16px 0;
  height: min(
    100%,
    var(--rail-room, 100dvh) - var(--rail-top, var(--novatrail-canvas-top, 0px)) -
      var(--novatrail-canvas-pad-bottom, 0px)
  );
  display: flex; align-items: center;
}
.rail[hidden] { display: none; }
.rail.example { padding-bottom: 88px; }
.tools, .tracing-scale, .selection-bar {
  box-sizing: border-box; flex: none; width: 52px; max-height: 100%;
  margin: 0 0 0 16px; padding: 4px; border-radius: 26px;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none;
  font-size: 14px; line-height: 1.2; color: var(--novatrail-canvas-ink, ${INK});
  background: var(--novatrail-canvas-glass, ${GLASS});
  -webkit-backdrop-filter: blur(22px) saturate(180%); backdrop-filter: blur(22px) saturate(180%);
  box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.08), 0 8px 28px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.04);
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .tools, .tracing-scale, .selection-bar { background: var(--novatrail-canvas-paper, ${PAPER}); }
}
.tools:dir(rtl) { direction: rtl; }
.tools.row {
  position: absolute; bottom: 16px; left: calc(var(--rail-width, 100vw) / 2);
  transform: translateX(-50%); width: max-content; max-width: calc(var(--rail-width, 100vw) - 32px);
  max-height: none; margin: 0; padding: 6px; border-radius: 28px; flex-direction: row; gap: 4px;
  overflow-x: auto; overflow-y: hidden;
}
.tools .choice { display: flex; flex-direction: column; gap: 2px; flex: none; }
:is(.tools, .tracing-scale, .selection-bar) .line {
  flex: none; width: 24px; height: 1px; margin: 4px 0; background: rgba(0, 0, 0, 0.1);
}
.tools.row .line { width: 1px; height: 24px; margin: 0 4px; }
.tools.row ::slotted(*) { flex: none; }
:is(.tools, .tracing-scale, .selection-bar) button {
  box-sizing: border-box; flex: none; min-width: 44px; min-height: 44px; margin: 0;
  padding: 0 14px 0 10px; display: flex; align-items: center; justify-content: center; gap: 6px;
  font: inherit; font-weight: 500; white-space: nowrap; color: inherit; background: transparent;
  cursor: pointer; border: none; border-radius: 22px;
}
:is(.tools, .tracing-scale, .selection-bar) button.icon { width: 44px; height: 44px; padding: 0; }
:is(.tools, .tracing-scale, .selection-bar) button.icon .label {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; border: 0;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}
.tools [aria-checked="true"] {
  background: color-mix(in srgb, var(--novatrail-canvas-accent, ${ACCENT}) 12%, transparent);
  color: var(--novatrail-canvas-accent, ${ACCENT});
}
:is(.tools, .tracing-scale, .selection-bar) button:focus-visible {
  outline: 2px solid var(--novatrail-canvas-accent, ${ACCENT}); outline-offset: 0;
}
:is(.tools, .tracing-scale, .selection-bar) [aria-disabled="true"] {
  color: color-mix(
    in srgb, var(--novatrail-canvas-ink, ${INK}) 40%, var(--novatrail-canvas-paper, ${PAPER})
  );
  cursor: default;
}
@supports not (color: color-mix(in srgb, red 40%, blue)) {
  :is(.tools, .tracing-scale, .selection-bar) [aria-disabled="true"] { opacity: 0.4; }
  .tools [aria-checked="true"] { background: transparent; }
}
.tools[hidden], :is(.tools, .tracing-scale, .selection-bar) [hidden] { display: none; }
:is(.tools, .tracing-scale, .selection-bar) button svg { display: block; flex: none; width: 20px; height: 20px; fill: currentColor; }
.tools:dir(rtl) svg.mirrored { transform: scaleX(-1); }
.tip {
  position: absolute; left: var(--tip-x, 76px); top: var(--tip-y, 0px); z-index: 2;
  transform: translateY(-50%); white-space: nowrap;
  font-size: 12.5px; font-weight: 500; line-height: 1; padding: 8px 10px; border-radius: 9px;
  background: #1d1d1f; color: #fff; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}
.tip[hidden] { display: none; }
.ring { position: absolute; inset: 0; z-index: 0; pointer-events: none; display: none; }
.viewport:focus-visible + .ring {
  display: block; outline: 2px solid var(--novatrail-canvas-ink, ${INK}); outline-offset: -2px;
}
.column {
  position: relative;
  width: calc(min(100%, ${K_MAX * SHEET.width}px) * var(--zoom, 1) * var(--across, 1));
  padding-block: var(--novatrail-canvas-pad-top, 0px) var(--novatrail-canvas-pad-bottom, 0px);
}
.statement, .parts {
  position: sticky; left: 0; box-sizing: border-box;
  width: calc(100% / (var(--zoom, 1) * var(--across, 1)));
  direction: var(--direction, ltr);
}
.statement { padding: 0 0 12px; overflow-wrap: break-word; }
.statement:empty { display: none; }
.band {
  position: absolute; left: 0; display: none; width: 100%; overflow: visible; pointer-events: none;
  background: var(--novatrail-canvas-paper, ${PAPER});
}
.band.above {
  --pad: var(--novatrail-canvas-pad-top, 0px);
  top: 0; height: var(--pad); clip-path: inset(0 0 calc(-1 * min(2px, var(--pad))) 0);
}
.band.below {
  --pad: var(--novatrail-canvas-pad-bottom, 0px);
  bottom: 0; height: var(--pad); clip-path: inset(calc(-1 * min(2px, var(--pad))) 0 0 0);
}
.statement:empty ~ .band.above, .band.below { display: block; }
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
.stage { position: sticky; top: 0; left: 0; max-height: 100%; overflow: clip; }
.spot { position: absolute; visibility: hidden; }
.stage > * { position: absolute; inset: 0; width: 100%; height: 100%; }
.stage > :not(canvas), .stage > canvas.flash { pointer-events: none; }
.grid {
  fill: none; stroke: var(--novatrail-canvas-grid, #d3dbe5); stroke-width: 1px;
  vector-effect: non-scaling-stroke;
}
.grid.dots { stroke-width: calc(3px * min(1, var(--zoom, 1))); stroke-linecap: round; }
.print {
  all: initial; font-family: inherit; visibility: inherit; pointer-events: none; direction: ltr;
  user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
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
.sheet.hand canvas { cursor: grab; }
.sheet.panning canvas { cursor: grabbing; }
.tracing { mix-blend-mode: multiply; }
.tracing .edge {
  fill: none; stroke: rgba(60, 60, 67, 0.3); stroke-width: 1px; vector-effect: non-scaling-stroke;
}
.stage > .grip {
  pointer-events: auto; inset: auto; left: 0; top: 0; width: 68px; height: 44px; margin: 0;
  padding: 0; border: none; border-radius: 22px; background: transparent; cursor: grab;
  touch-action: none; display: flex; align-items: center; justify-content: center;
}
.stage > .grip[hidden] { display: none; }
.grip .bar {
  width: 40px; height: 5px; border-radius: 3px;
  background: color-mix(in srgb, var(--novatrail-canvas-ink, ${INK}) 30%, transparent);
}
.grip.dragging { cursor: grabbing; }
.grip.dragging .bar { background: var(--novatrail-canvas-accent, ${ACCENT}); }
.grip:focus-visible { outline: 2px solid var(--novatrail-canvas-accent, ${ACCENT}); }
.stage > .tip {
  inset: var(--tip-y, 0px) auto auto var(--tip-x, 0px); width: auto; height: auto;
  pointer-events: none;
}
.stage > .tracing-cover, .stage > .tracing-frame { inset: 0 auto auto 0; box-sizing: border-box; }
.stage > .tracing-cover[hidden], .stage > .tracing-frame[hidden], .stage > .tracing-sign[hidden],
.stage > .tracing-scale[hidden], .tracing-cover [hidden] { display: none; }
.statements {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 0.2em; font-weight: 500; line-height: 1.2;
  letter-spacing: -0.02em; white-space: nowrap; direction: ltr;
  color: var(--novatrail-canvas-ink, ${INK});
}
.statements .slot {
  box-sizing: border-box; border-radius: 0.2em;
  border: max(2px, 0.04em) dashed var(--novatrail-canvas-accent, ${ACCENT});
}
.statements span.slot {
  display: inline-block; width: 1.08em; height: 1.08em; margin: 0 0.18em; vertical-align: -0.22em;
}
.statements mspace.slot { margin: 0 0.1em; }
.statements math { font-family: inherit; font-size: inherit; color: inherit; }
.scan {
  position: absolute; inset: 0; overflow: hidden;
  background: color-mix(in srgb, var(--novatrail-canvas-accent, ${ACCENT}) 4%, transparent);
}
.scan i {
  position: absolute; top: 0; bottom: 0; left: -30%; width: 30%;
  background: linear-gradient(90deg, transparent,
    color-mix(in srgb, var(--novatrail-canvas-accent, ${ACCENT}) 18%, transparent), transparent);
  left: 35%;
}
/* The line runs through the middle of its glow, so the glow is the same on both sides of it. */
.scan i::after {
  content: ""; position: absolute; top: 0; bottom: 0; left: calc(50% - 1px); width: 2px;
  background: color-mix(in srgb, var(--novatrail-canvas-accent, ${ACCENT}) 60%, transparent);
}
@keyframes novatrail-scan { from { left: -30%; } to { left: 100%; } }
@keyframes novatrail-spin { to { transform: rotate(360deg); } }
.tracing-frame {
  border: 1.5px solid var(--novatrail-canvas-accent, ${ACCENT}); border-radius: var(--round, 6px);
}
.tracing-frame .corner, .selection-grips .corner {
  position: absolute; width: 44px; height: 44px; margin: -22px; pointer-events: auto;
  touch-action: none;
}
.tracing-frame .corner::after, .selection-grips .corner::after {
  content: ""; position: absolute; inset: 13px; box-sizing: border-box; border-radius: 50%;
  background: #fff; border: 2px solid var(--novatrail-canvas-accent, ${ACCENT});
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}
.tracing-frame .tl, .selection-grips .tl { left: 0; top: 0; cursor: nwse-resize; }
.tracing-frame .tr, .selection-grips .tr { left: 100%; top: 0; cursor: nesw-resize; }
.tracing-frame .bl, .selection-grips .bl { left: 0; top: 100%; cursor: nesw-resize; }
.tracing-frame .br, .selection-grips .br { left: 100%; top: 100%; cursor: nwse-resize; }
.stage > .tracing-sign {
  inset: 0 auto auto 0; width: auto; height: 24px; box-sizing: border-box; padding: 0 10px;
  display: flex; align-items: center; gap: 6px; border-radius: 999px; white-space: nowrap;
  font-size: 12px; font-weight: 600; background: #f2f2f2; color: #6e6e73;
}
.stage > .tracing-sign[data-shows="busy"], .stage > .tracing-sign[data-shows="text"] {
  background: #e5f0ff; color: #0058b8;
}
.tracing-sign svg { display: block; width: 12px; height: 12px; fill: currentColor; }
.spinner {
  display: block; box-sizing: border-box; width: 12px; height: 12px; border-radius: 50%;
  border: 2px solid color-mix(in srgb, currentColor 25%, transparent); border-top-color: currentColor;
}
.stage > .tracing-scale {
  inset: var(--bar-y, 0px) auto auto var(--bar-x, 0px); transform: translateX(-50%);
  width: max-content; height: auto; max-height: none; margin: 0; padding: 4px;
  flex-direction: row; gap: 2px; pointer-events: auto; overflow: visible;
}
.tracing-scale .line { width: 1px; height: 24px; margin: 0 4px; }
/* Select's marks, dashed in the accent over a light wash of it, as thin at any zoom; and its bar of
   glass over them, which the element places. */
.selection .shape, .selection .box {
  fill: color-mix(in srgb, var(--novatrail-canvas-accent, ${ACCENT}) 6%, transparent);
  stroke: var(--novatrail-canvas-accent, ${ACCENT}); stroke-width: 1.5px; stroke-dasharray: 6 4;
  stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke;
}
.selection .box { stroke-width: 1px; }
.stage > .selection-bar {
  inset: var(--select-y, 0px) auto auto var(--select-x, 0px); transform: translateX(-50%);
  width: max-content; height: auto; max-height: none; margin: 0; padding: 4px;
  flex-direction: row; gap: 2px; pointer-events: auto; overflow: visible;
}
.stage > .selection-bar[hidden], .selection-bar [hidden], .stage > .selection-grips[hidden] {
  display: none;
}
.selection-bar .percent {
  min-width: 64px; padding: 0 12px; line-height: 44px; text-align: center; font-size: 14px;
  font-weight: 600; font-variant-numeric: tabular-nums;
}
.stage > .selection-grips { inset: 0 auto auto 0; box-sizing: border-box; }
.selection-bar .remove { color: #d70015; }
.tracing-scale .percent { min-width: 64px; padding: 0 8px; font-variant-numeric: tabular-nums; }
.tracing-scale .mode {
  background: var(--novatrail-canvas-accent, ${ACCENT}); color: #fff; margin-inline-start: 2px;
}
.tracing-scale .mode.busy { background: #e5f0ff; color: #0058b8; cursor: default; }
.tracing-scale .mode.busy svg { display: none; }
.tracing-scale .mode.busy::before {
  content: ""; display: block; box-sizing: border-box; width: 15px; height: 15px; border-radius: 50%;
  border: 2px solid color-mix(in srgb, currentColor 25%, transparent); border-top-color: currentColor;
}
.tracing-scale .mode.back { background: #f2f2f7; color: var(--novatrail-canvas-ink, ${INK}); }
/* The motions: a wait for the reading the learner asked for, and the pop-in of a popover of the
   pen or the eraser (pens.ts), only to whom they are no harm. */
@media (prefers-reduced-motion: no-preference) {
  .scan i { animation: novatrail-scan 1s ease-in-out infinite; }
  .spinner, .tracing-scale .mode.busy::before { animation: novatrail-spin 0.8s linear infinite; }
}
.marks rect {
  fill: none; stroke: var(--novatrail-canvas-mark, ${MARK}); stroke-width: 2px;
  vector-effect: non-scaling-stroke;
}
.marks rect.under, .marks g.under { opacity: 0.25; }
.marks .halo { fill: #fff; stroke: rgba(0, 0, 0, 0.2); stroke-width: 1px; vector-effect: non-scaling-stroke; }
.marks .sign {
  fill: none; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round;
}
.marks .right .sign { stroke: ${RIGHT}; }
.marks .wavy path {
  fill: none; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke;
}
.marks .wavy .glow { stroke: #fff; stroke-width: 6.4px; }
.marks .wavy .line { stroke: var(--novatrail-canvas-wavy, ${WAVY}); stroke-width: 2.4px; }
.marks .not-yet .sign { stroke: ${NOT_YET}; }
@media (forced-colors: active) {
  .sheet { outline: 1px solid CanvasText; }
  .grid { stroke: GrayText; }
  .print text { fill: CanvasText; }
  .print rect { stroke: CanvasText; }
  .print rect.filled { stroke: Highlight; }
  canvas { color: CanvasText; }
  .marks rect { stroke: Highlight; }
  .marks .halo { fill: Canvas; stroke: CanvasText; }
  .marks .right .sign, .marks .not-yet .sign { stroke: Highlight; }
  .marks .wavy .glow { stroke: Canvas; }
  .marks .wavy .line { stroke: Highlight; }
  .tracing { mix-blend-mode: normal; }
  .tracing .edge { stroke: CanvasText; }
  .grip .bar, .grip.dragging .bar { background: ButtonText; }
  .grip:focus-visible { outline-color: Highlight; }
  .tracing-frame { border-color: Highlight; }
  .tracing-frame .corner::after, .selection-grips .corner::after {
    background: Canvas; border-color: Highlight;
  }
  .statements { color: CanvasText; }
  .statements .slot { border-color: CanvasText; }
  .scan { background: transparent; }
  .scan i { background: transparent; }
  .scan i::after { background: Highlight; }
  .stage > .tracing-sign, .stage > .tracing-sign[data-shows] {
    background: Canvas; color: CanvasText; border: 1px solid CanvasText;
  }
  .tracing-scale .mode, .tracing-scale .mode.busy, .tracing-scale .mode.back {
    background: ButtonFace; color: ButtonText; border: 1px solid ButtonBorder;
  }
  .tools, .tracing-scale, .selection-bar {
    background: Canvas; color: CanvasText; border: 1px solid CanvasText;
  }
  .selection .shape, .selection .box { fill: none; stroke: Highlight; }
  .selection-bar .remove { color: ButtonText; }
  :is(.tools, .tracing-scale, .selection-bar) .line { background: CanvasText; }
  :is(.tools, .tracing-scale, .selection-bar) button {
    background: ButtonFace; color: ButtonText; border: 1px solid ButtonBorder;
  }
  .tools [aria-checked="true"] {
    background: Highlight; color: HighlightText; border-color: Highlight;
  }
  :is(.tools, .tracing-scale, .selection-bar) [aria-disabled="true"] { color: GrayText; border-color: GrayText; }
  .tip { background: Canvas; color: CanvasText; border: 1px solid CanvasText; }
  :is(.tools, .tracing-scale, .selection-bar) button:focus-visible, .viewport:focus-visible + .ring {
    outline-color: Highlight;
  }
  .stage > .hover { background: CanvasText; }
  .stage > .hover.erasing { background: Canvas; border-color: CanvasText; }
}
.stage > .hover {
  inset: auto; left: var(--hover-x, 0px); top: var(--hover-y, 0px);
  width: var(--hover-size, 4px); height: var(--hover-size, 4px);
  margin: calc(var(--hover-size, 4px) / -2) 0 0 calc(var(--hover-size, 4px) / -2);
  box-sizing: border-box; border-radius: 50%; pointer-events: none;
  background: var(--hover-colour, var(--novatrail-canvas-ink, ${INK}));
  opacity: var(--hover-opacity, 1);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.9), 0 0 0 2px rgba(0, 0, 0, 0.25);
}
.stage > .hover.erasing {
  background: rgba(255, 255, 255, 0.4); border: 1px solid rgba(0, 0, 0, 0.45); opacity: 1;
}
.stage > .hover[hidden] { display: none; }
${pensStyle(INK, PAPER, ACCENT)}`;

/** The sheet of STYLE that the elements of a document adopt, made by the first of them there. */
const sheets = new WeakMap<Document, CSSStyleSheet>();

/**
 * Gives the element's shadow root its style, as a sheet the root adopts, and not a `<style>` in
 * its tree: a consumer's content security policy that allows no inline style, as app's
 * `style-src 'self'`, blocks the one and not the other, and the element asks of the policy only
 * `img-src blob:`. A root adopts only a sheet made for its own document, by that
 * document's window, and an element moved into another document comes there without its sheets:
 * it adopts that document's sheet then. A document without a window, which can make no sheet,
 * leaves the element unstyled till it comes into one that can.
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

/** The axes a scroll goes along: across the sheet and down it. */
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
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/**
 * Which finished strokes are painted: all of them, the sheet's alone, under a stroke under way on
 * the sheet that the tracing paper's strokes lie over, or the tracing paper's alone, over it.
 */
type Layers = "all" | "sheet" | "tracing";

/** What a frame draws in: the view, device pixels to a unit across and down, and the ink's colour. */
interface Frame {
  readonly screen: Screen;
  readonly across: number;
  readonly down: number;
  readonly colour: string;
}

/** A part of the sheet, in units: its left, top, right and bottom. */
interface Bounds {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

/** What finished ink a canvas shows: the strokes, the layers and the view they are in. */
interface Painted {
  readonly strokes: readonly Stroke[];
  readonly layers: Layers;
  readonly vx: number;
  readonly vy: number;
  readonly across: number;
  readonly down: number;
  readonly width: number;
  readonly height: number;
  readonly colour: string;
  readonly forced: boolean;
  /** Where the tracing paper lies, its scale and whether it is hidden; empty without one. */
  readonly tracing: string;
}

/** A rectangle of a canvas, in whole device pixels: left, top, width and height. */
type Pixels = readonly [number, number, number, number];

/**
 * The tutor's act being drawn on the canvas, stroke by stroke: when each of its strokes is drawn,
 * by ID, in ms from `start` on the page's clock, all of them by `end`; the part of each the frame
 * draws and the part the last frame painted, none before it starts; whether a frame has painted
 * it yet; whoever waits for its end, and the timer that ends it should no frame come.
 */
interface Drawing {
  readonly timings: ReadonlyMap<number, Timing>;
  readonly start: number;
  readonly end: number;
  readonly parts: Map<number, { readonly share: number; readonly stroke: Stroke | undefined }>;
  readonly painted: Map<number, Stroke | undefined>;
  fresh: boolean;
  readonly done: () => void;
  readonly timer: ReturnType<typeof setTimeout>;
}

/** Select's shape under way: its pointer, its layer, and its points in the layer's units. */
interface Selecting {
  readonly pointerId: number;
  readonly layer: "tracing" | undefined;
  readonly points: Point[];
}

/** The strokes Select took, all of one layer, by their IDs in the sheet's order. */
interface Selected {
  readonly ids: readonly number[];
  readonly layer: "tracing" | undefined;
}

/**
 * The strokes Select took, dragged: its pointer, the strokes by ID, where it came down and how
 * far it has gone, in their layer's units, kept so that every point stays on the sheet; the
 * offset the canvas shows, and each stroke moved as far, made once for each offset.
 */
interface Dragging {
  readonly pointerId: number;
  readonly ids: ReadonlySet<number>;
  readonly from: Point;
  readonly box: Box;
  offset: readonly [number, number];
  painted: readonly [number, number];
  readonly moved: Map<number, Stroke>;
}

/**
 * The strokes Select took, scaled by a grip: its pointer, the strokes by ID; the corner across,
 * `at`, which stays, and the grip's corner, `corner`, of the box of their points in their layer's
 * units; where the pointer came down, and CSS pixels to a unit of the layer; the factors the scale
 * may take; the factor the canvas shows, and the one the last frame painted; and each stroke
 * scaled by it, made once for each factor.
 */
interface Resizing {
  readonly pointerId: number;
  readonly ids: ReadonlySet<number>;
  readonly at: readonly [number, number];
  readonly corner: readonly [number, number];
  readonly x: number;
  readonly y: number;
  readonly k: number;
  readonly range: readonly [number, number];
  factor: number;
  painted: number;
  readonly scaled: Map<number, Stroke>;
}

/** How far the box round the strokes Select took keeps from their points, in CSS pixels. */
const SELECT_PAD_PX = 10;

/**
 * The least change of size a grip's drag makes a scale of, as the mockup's: a hand that only
 * touched the grip scales nothing.
 */
const SCALE_LEAST_CHANGE = 0.02;

/**
 * How far below the strokes Select took their copy lands, past their own height, in their layer's
 * units: clear of them, so that the copy is seen to be one.
 */
const COPY_GAP = 12;

/**
 * How long after its last stroke's end the tutor's act ends by its timer, ms, should no frame of
 * the element's end it: a page in the background paints none.
 */
const DRAWING_SLACK = 250;

/** The query of a learner's wish for less motion, under which the tutor's act appears at once. */
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** How many of the last frames' times `paintStats` keeps. */
const PAINT_MS = 120;

/**
 * A mark the sheet shows: its name and where it is, its frame on the layer of the marks — a
 * verdict's tick or cross on its halo, or a wavy line —, the frame as last drawn, in
 * sheet units, and whether the stroke under way is writing over it.
 */
interface Shown {
  readonly name: string;
  readonly placed: Placed;
  readonly node: SVGRectElement | SVGGElement;
  frame: Box | null;
  under: boolean;
  /** What the frame's attributes say, so that a frame that has not changed writes nothing. */
  drawn: string;
}

/** An `<svg>` layer of the sheet, which counts in sheet units and hides from screen readers. */
function setAttributes(element: Element, values: Readonly<Record<string, number>>): void {
  for (const [name, value] of Object.entries(values)) element.setAttribute(name, String(value));
}

function svgLayer(name: string): SVGSVGElement {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("class", name);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  return svg;
}

/**
 * The layer of the tutor's marks, over the work: a screen reader reads each mark by its name, and
 * the layer itself is no picture of its own.
 */
function marksLayer(): SVGSVGElement {
  const svg = svgLayer("marks");
  svg.removeAttribute("aria-hidden");
  svg.setAttribute("role", "none");
  return svg;
}

/** A frame of a mark, round its place. */
function frameNode(): SVGRectElement {
  const rect = document.createElementNS(SVG, "rect");
  rect.setAttribute("rx", String(MARK_CORNER));
  return rect;
}

/**
 * A verdict of a task from paper: a tick or a cross on a white circle, on the 24 × 24
 * that its place scales.
 */
function verdictNode(correct: boolean): SVGGElement {
  const g = document.createElementNS(SVG, "g");
  g.setAttribute("class", correct ? "right" : "not-yet");
  const halo = document.createElementNS(SVG, "circle");
  halo.setAttribute("class", "halo");
  halo.setAttribute("cx", "12");
  halo.setAttribute("cy", "12");
  halo.setAttribute("r", "11.5");
  const sign = document.createElementNS(SVG, "path");
  sign.setAttribute("class", "sign");
  sign.setAttribute("d", correct ? TICK : CROSS);
  g.append(halo, sign);
  return g;
}

/**
 * The wavy line of "Show where": the line over a wider white one, its halo, both
 * of the path the marks give them.
 */
function wavyNode(): SVGGElement {
  const g = document.createElementNS(SVG, "g");
  g.setAttribute("class", "wavy");
  for (const name of ["glow", "line"]) {
    const path = document.createElementNS(SVG, "path");
    path.setAttribute("class", name);
    g.append(path);
  }
  return g;
}

/**
 * Where a wavy line stands, in sheet units, by its place: under it, past each side, from crest to
 * trough, kept to the sheet by `half` its line.
 */
function wavyAt(box: Box, half: number): Box {
  const y = Math.min(box.maxY + WAVY_BELOW, REACH.height - WAVY_CREST - half);
  return {
    minX: Math.max(box.minX - WAVY_REACH, half),
    minY: y - WAVY_CREST,
    maxX: Math.min(box.maxX + WAVY_REACH, REACH.width - half),
    maxY: y + WAVY_CREST,
  };
}

/** The path of a wavy line across its box, by half waves from its left. */
function wavyPath({ minX, minY, maxX, maxY }: Box): string {
  const y = (minY + maxY) / 2;
  // A quadratic curve's crest is half way to its control point.
  const control = maxY - minY;
  const at = (n: number) => String(Math.round(n * 10) / 10);
  let d = `M${at(minX)} ${at(y)}`;
  for (let x = minX, up = true; x < maxX; x += WAVY_HALF, up = !up) {
    const to = Math.min(x + WAVY_HALF, maxX);
    d += ` Q${at((x + to) / 2)} ${at(up ? y - control : y + control)} ${at(to)} ${at(y)}`;
  }
  return d;
}

/**
 * Where a verdict stands, in sheet units, by its answer's box: off its right edge, at the middle of
 * its height, its size the same on every screen (`k` CSS pixels to the unit), kept to the sheet.
 */
function verdictAt(box: Box, k: number): Box {
  const size = VERDICT_PX / k;
  const minX = Math.min(Math.max(box.maxX + VERDICT_GAP_PX / k, 0), REACH.width - size);
  const minY = Math.min(Math.max((box.minY + box.maxY - size) / 2, 0), REACH.height - size);
  return { minX, minY, maxX: minX + size, maxY: minY + size };
}

/**
 * The margin, in CSS px, the drawing's crop keeps from a control over the sheet, and the least it
 * leaves free across and down before it takes the whole part in sight instead.
 */
const COVER_GAP = 16;
const COVER_LEAST = 160;

/** The sides of a host's cover, checked: each a finite number of CSS px, 0 or more, 0 if absent. */
function coverOf(cover: DrawingCover | undefined): Required<DrawingCover> {
  const sides = { top: 0, right: 0, bottom: 0, left: 0 };
  if (cover === undefined) return sides;
  if (typeof cover !== "object" || cover === null) {
    throw new TypeError(`cover: the sides the host covers, not ${String(cover)}`);
  }
  for (const side of ["top", "right", "bottom", "left"] as const) {
    const value: unknown = cover[side];
    if (value === undefined) continue;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new TypeError(`cover.${side}: CSS pixels, 0 or more, not ${String(value)}`);
    }
    sides[side] = value;
  }
  return sides;
}

/** An HTML layer of the sheet, for the module's widget from stage 4: empty till then. */
function htmlLayer(name: string): HTMLDivElement {
  const div = document.createElement("div");
  div.className = name;
  div.setAttribute("aria-hidden", "true");
  return div;
}

/**
 * The element `<novatrail-canvas>`: the contract's `CanvasElement`, and beyond it the
 * commands undo and clear, which the contract does not name.
 */
export class NovatrailCanvas extends HTMLElement implements CanvasElement {
  /**
   * The wrapper, which does not scroll, of the container that scrolls and of the ring of its focus
   * over it: an outline of the container itself would stand under the sheet's paper and stage,
   * which are positioned in it.
   */
  readonly #wrapper = document.createElement("div");
  readonly #viewport = document.createElement("div");
  readonly #ring = document.createElement("div");
  readonly #column = document.createElement("div");
  readonly #sheet = document.createElement("div");
  /** The sheet's visible part, where its layers stand, bottom to top. */
  readonly #stage = document.createElement("div");
  /** The author's template: a sheet's grid, or a workbook's lines, a list of its items. */
  readonly #template = svgLayer("template");
  readonly #grid = document.createElementNS(SVG, "path");
  /**
   * A grid of dots: one tile of the pattern, its dot — a stroke of no length, as a dot of the
   * bands, as wide in CSS px at any k —, and the rectangle the tiles fill.
   */
  readonly #dotTile = document.createElementNS(SVG, "pattern");
  readonly #dot = document.createElementNS(SVG, "path");
  readonly #dots = document.createElementNS(SVG, "rect");
  /** The grid going on above the sheet and below it, under the consumer's floating bars. */
  readonly #above = document.createElementNS(SVG, "svg");
  readonly #below = document.createElementNS(SVG, "svg");
  readonly #print = document.createElementNS(SVG, "g");
  readonly #lines = document.createElementNS(SVG, "g");
  /** The module's widget, from stage 4: empty till then. */
  readonly #widget = htmlLayer("widget");
  /** The author's demo: a worked example's pictures on areas of the sheet. */
  readonly #show = svgLayer("show");
  /** The tutor's layer, in two: the sketch under the learner's work, the marks over it. */
  readonly #sketch = svgLayer("sketch");
  /** The learner's work: the ink. */
  readonly #canvas = document.createElement("canvas");
  readonly #marksLayer = marksLayer();
  readonly #context = this.#canvas.getContext("2d");
  /**
   * The finished ink the canvas shows, but where the stroke under way was drawn on the last frame,
   * in device pixels; and while a stroke is written, a buffer of the finished ink under it, which
   * each frame takes that place back from. The buffer is the canvas's size while a stroke is
   * written, and holds nothing off the page.
   */
  #painted: Painted | undefined;
  #liveAt: Pixels | undefined;
  readonly #under = document.createElement("canvas");
  #underHolds: Painted | undefined;
  /**
   * The tutor's act being drawn: its strokes by ID, when each is drawn from the act's start on the
   * page's clock, how far each was drawn on the last frame painted, and whoever waits for its end.
   * `fresh` till a frame has painted it.
   */
  #drawing: Drawing | undefined;
  /** Select's shape under way: its pointer, its layer, and its points in the layer's units. */
  #selecting: Selecting | undefined;
  /** The strokes Select took, all of one layer, by their IDs in the sheet's order. */
  #selected: Selected | undefined;
  /** The strokes taken, dragged: see `Dragging`. */
  #dragging: Dragging | undefined;
  /** The strokes taken, scaled by a grip: see `Resizing`. */
  #resizing: Resizing | undefined;
  /** Select's shape, the box round what it took with its grips, and the bar of Copy and Delete. */
  readonly #selection = new Selection({
    copy: () => this.#copySelected(),
    remove: () => this.#removeSelected(),
    scaleDown: (corner, event) => this.#scaleDown(corner, event),
    scaleMove: (event) => this.#scaleMove(event),
    scaleUp: (event) => this.#scaleUp(event),
  });
  /** The page's time of the frame being painted, by which the tutor's strokes are drawn so far. */
  #drawingNow = 0;
  /** How many strokes the element has filled on its buffers and its canvas since it was built. */
  #fills = 0;
  /** What the frame being painted has painted: all in sight, or rectangles of this many device pixels. */
  #frameAll = false;
  #frameArea = 0;
  /** The frames painted since the element was built, and of them those that painted all in sight. */
  #frames = 0;
  #fullRepaints = 0;
  /** The last frame painted: the strokes it filled, the share of the view it painted, its time. */
  #lastFills = 0;
  #lastArea = 0;
  #lastMs = 0;
  /** The time of each of the last frames painted, ms, a ring, and how many were ever written. */
  readonly #paintMs = new Float64Array(PAINT_MS);
  #paintsKept = 0;
  /** The flash of what a frame paints, while `paintFlash` is on. */
  #flash: Flash | undefined;
  /** The canvas's style as it is computed, read live: its colour is the ink's on the screen. */
  readonly #canvasStyle = getComputedStyle(this.#canvas);
  /** The files of the pictures of the statement and of a worked example's demo. */
  readonly #pictures = new Pictures();
  /** The task's statement, above the sheet. */
  readonly #statement = new Statement(this.#pictures);
  /** A worked example's open parts, under its statement, and the region that tells of them. */
  readonly #parts = new Parts(DEMO_IDS, this.#pictures);
  /** The element's own buttons, on a bar over the sheet's left edge. */
  readonly #tools = new Tools(
    {
      choose: (tool) => this.#choose(tool),
      undo: () => this.undo(),
      redo: () => this.redo(),
      clear: () => this.clear(),
      zoom: (larger) => this.#zoomBy(larger),
      turnGrid: () => this.#turnGrid(),
      next: () => this.#openNext(),
      toggle: () => this.#toggleDemo(),
      trace: () => this.#trace(),
      pens: (settings) => this.#choosePens(settings),
    },
    DEMO_IDS,
  );
  /** A task from paper's tracing paper: its layer, its grip and the crop's picture. */
  readonly #tracingPaper = new TracingPaper({
    move: (at) => this.#moveTracing(at),
    resize: (at, scale) => this.#resizeTracing(at, scale),
    fit: () => this.#fitTracing(),
    moved: () => this.#tracingMoved(),
    read: () =>
      this.dispatchEvent(
        new CustomEvent(TRACING_READ, { bubbles: true, composed: true, detail: null }),
      ),
  });
  /** The reading of the statement of the task from paper, as the consumer gave it. */
  #reading: TracingReading | undefined;
  /** The task from paper as the consumer gave it, and where its tracing paper lies. */
  #paper: PaperTask | undefined;
  #tracing: TracingState | undefined;
  /** The tracing paper's state the learner's move began at: the move tells only if it changed it. */
  #moveFrom: TracingState | undefined;
  /** The layer the stroke under way is written on, and the erasing under way erases. */
  #writeOn: "tracing" | undefined;
  #eraseOn: "tracing" | "sheet" | undefined;
  /** Each stroke of the tracing paper where it lies on the sheet, for the place it was moved to. */
  #placed = new WeakMap<
    Stroke,
    { readonly at: readonly [number, number]; readonly scale: number; readonly stroke: Stroke }
  >();
  /** The sheet's clock, for its strokes and its actions alike. */
  readonly #clock = new Clock();
  /**
   * The strokes on the sheet, the actions undo takes back and the history of writing: a
   * new work when the sheet is given another history.
   */
  #work = new Work(this.#clock);
  /** How many events of the history `historychange` has told of, and whether it is telling now. */
  #told = 0;
  #telling = false;
  /** The input: a finished stroke goes onto the work, and the work has changed. */
  readonly #recorder = new Recorder((stroke) => {
    this.#work.write(stroke, this.#writeOn);
    this.#changed();
  }, this.#clock);
  /**
   * The eraser: what a press came near leaves the work when it lifts, if still on the sheet,
   * whole, or in the mode "part" cut into the pieces it leaves.
   */
  readonly #eraser = new Eraser(
    (from, to, reach) => this.#work.near(from, to, reach, this.#eraseOn),
    (ids, time, erasure) => this.#erased(ids, time, erasure),
  );
  /**
   * What the eraser that takes a part, while it is down, leaves of each stroke it crossed, by the
   * stroke's ID: its cut, fed the eraser's path as far as `fed`, and the pieces the screen shows
   * in the stroke's place.
   */
  readonly #cutting = new Map<
    number,
    { readonly cut: Cut; fed: number; pieces: readonly Stroke[] }
  >();
  /** The learner's settings of the pen and the eraser, frozen. */
  #pens: PenSettings = PEN_SETTINGS;
  /** Whether the strokes take a style and the popovers open: not under `unstyled`. */
  #styled = true;
  /** Whether the colours are forced, where every stroke is the ink on the screen. */
  #forced = false;
  /** The circle a pen hovering over the sheet shows. */
  readonly #hover = document.createElement("div");
  /** The strokes on the sheet cut of each stroke, by its ID, kept while the strokes are the same. */
  #piecesById: {
    readonly strokes: readonly Stroke[];
    readonly of: ReadonlyMap<number, readonly Stroke[]>;
  } = { strokes: [], of: new Map() };
  /**
   * The hands on the sheet: which pointer may write, which is a palm, and which two fingers
   * scroll, in the page's pen mode. The recorder and the eraser say which pointer writes.
   */
  readonly #hands = new Hands(
    {
      writer: () => this.#writer(),
      drop: (pointerId) => this.#drop(pointerId),
      end: (pointerId) => {
        this.#recorder.end(pointerId);
        this.#eraser.end(pointerId);
      },
      scroll: (dx, dy, fresh) => this.#scroll(dx, dy, fresh),
      zoom: (ratio, x, y) => this.#pinch(ratio, x, y),
      across: () => overflowOf(this.#viewport, "x") > EDGE,
    },
    PEN_MODE,
  );
  /**
   * What two fingers, or the hand, scroll in the gesture under way, down and across, each chosen at
   * the first step that goes along its axis: undefined till then, and null when nothing
   * scrolls so.
   */
  #latch: Latch | null | undefined;
  #latchAcross: Latch | null | undefined;
  /** The page grown or shrunk, or the window: what scrolls the element may have room now, or none. */
  readonly #resized = (): void => {
    this.#region();
    this.#fit();
    this.#tools.pens.place();
  };
  readonly #page = new ResizeObserver(this.#resized);
  /** A window of another size has another view: the sheet goes as far past the ink by it. */
  readonly #rewindowed = (): void => this.#regrow();
  /** What the bar's rail sticks in, when a scroller of the page's: its height is the rail's room. */
  #port: Element | null = null;
  readonly #ported = new ResizeObserver(() => this.#fit());
  #unwatchPen: (() => void) | undefined;
  #unwatchZoom: (() => void) | undefined;
  /** The zoom the sheet is laid out by: the page's, and a worked example's 1. */
  #zoom = 1;
  /** Where on the screen a pinch zooms about, while it sets the page's zoom. */
  #anchor: { readonly x: number; readonly y: number } | undefined;
  /**
   * The point of the sheet a press zoomed about, where on the screen it stood, and where the press
   * left the container: while nothing has scrolled or moved it since, the next press zooms about
   * the same point, so that a zoom out at the sheet's edge, where the scroll stops short, and back
   * in comes back where it was.
   */
  #held:
    | {
        readonly at: { readonly x: number; readonly y: number };
        readonly x: number;
        readonly y: number;
        readonly box: string;
      }
    | undefined;
  #tool: Tool = "pen";
  /** The pointer the hand moves the sheet by, of its type, and where it was on the screen last. */
  #pan:
    | { readonly pointerId: number; readonly kind: string; readonly x: number; readonly y: number }
    | undefined;
  /** A task from paper's grid, the learner's. */
  #paperGrid: PaperGrid = "dots";
  /** How far the sheet goes, in units, as laid out: the page and past it. */
  #extent: Size = SHEET;
  /** The grid's path as last drawn: its rulings and the extent they cover. */
  #gridDrawn = "";
  #task: Task | undefined;
  /** A lesson's worked example as the consumer gave it, and as the element checked it. */
  #workedExample: WorkedExample | undefined;
  #example: CheckedExample | undefined;
  /** How far the learner has gone through the example's demo, frozen, or undefined without one. */
  #demoState: DemoState | undefined;
  #shownTemplate: Template = NO_TASK;
  /**
   * A workbook's page, its boxes in the task's order and their frames, and the box each stroke is
   * in, worked out once: a stroke never changes, and a new page starts the map anew.
   */
  #laid: Page | undefined;
  #cells: readonly Cell[] = [];
  #rects: readonly SVGRectElement[] = [];
  /**
   * The texts of the values a worked example's demo has written in its boxes, one for each frame
   * that has had one.
   */
  #values: (SVGTextElement | undefined)[] = [];
  #taken = new WeakMap<Stroke, number>();
  /** Which answer slots are filled, the same array until one changes, or null. */
  #filled: Filled | null = null;
  /** Whether the task's one answer is anywhere on the sheet or the whole sheet. */
  #whole = false;
  /** The module's manifest as the consumer gave it, and what the element makes of it. */
  #manifest: Manifest | undefined;
  #settings: Settings = NO_MANIFEST;
  /** The tutor's marks as the consumer gave them, and those of them that have a place. */
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
  /**
   * The strokes on the sheet by ID, the tracing paper's from its corner, kept while the sheet's
   * strokes are the same array.
   */
  #strokesById: {
    readonly strokes: readonly Stroke[];
    readonly byId: ReadonlyMap<number, Stroke>;
  } = { strokes: [], byId: new Map() };
  /** The box of each stroke's points, worked out once: a stroke never changes. */
  readonly #pointBoxes = new WeakMap<Stroke, Box>();
  /** The stroke under way, and how many of its points the marks have been checked against. */
  #writing: { readonly stroke: Stroke; seen: number } | undefined;
  /** The path of each finished stroke, outlined once. */
  readonly #inks = new WeakMap<Stroke, Ink>();
  readonly #resize = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.target !== this.#viewport) continue;
      const box = entry.contentBoxSize[0];
      if (box !== undefined) this.#area = { width: box.inlineSize, height: box.blockSize };
    }
    // The container's new size, the statement's or that of the list of a demo's parts: each moves
    // the sheet, and the first is the room of a worked example's row and of a popover.
    this.#layout();
    this.#fit();
    this.#tools.pens.place();
  });
  /** The size of the container's visible part, in CSS pixels as laid out, before any transform. */
  #area: { readonly width: number; readonly height: number } | undefined;
  /**
   * `k` of the last layout, and where the sheet's top was then in the container's content, in CSS
   * pixels as laid out: under the statement.
   */
  #k = 0;
  #sheetAt = 0;
  /** The sheet's left in the container's content, as laid out then, in CSS pixels. */
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
    // The pattern's ID is the shadow root's own: each element has its own tree.
    this.#dotTile.id = "dot-tile";
    this.#dotTile.setAttribute("patternUnits", "userSpaceOnUse");
    this.#dot.setAttribute("class", "grid dots");
    this.#dotTile.append(this.#dot);
    this.#dots.setAttribute("fill", "url(#dot-tile)");
    this.#dots.setAttribute("display", "none");
    for (const [band, place] of [
      [this.#above, "above"],
      [this.#below, "below"],
    ] as const) {
      band.setAttribute("class", `band ${place}`);
      band.setAttribute("aria-hidden", "true");
      // Units at the sheet's scale: the band's width is the extent's, and its height is the
      // padding's, which the band's units outrun and slice at the sheet's edge.
      band.setAttribute(
        "preserveAspectRatio",
        place === "above" ? "xMinYMax slice" : "xMinYMin slice",
      );
      band.append(document.createElementNS(SVG, "path"));
      band.firstElementChild?.setAttribute("class", "grid");
    }
    this.#print.setAttribute("class", "print");
    this.#hover.className = "hover";
    this.#hover.setAttribute("aria-hidden", "true");
    this.#hover.hidden = true;
    // The constructor reads no attribute: the labels of a demo's boxes are English till `lang`
    // comes.
    this.#nameBoxes(null);
    this.#nameGrip(null);
    this.#lines.setAttribute("role", "list");
    this.#print.append(this.#lines);
    const defs = document.createElementNS(SVG, "defs");
    defs.append(this.#dotTile);
    this.#template.append(this.#grid, defs, this.#dots, this.#print);
    this.#show.append(this.#parts.layer);
    this.#stage.append(
      this.#template,
      this.#widget,
      this.#show,
      this.#tracingPaper.layer,
      this.#tracingPaper.cover,
      this.#sketch,
      this.#canvas,
      this.#hover,
      this.#marksLayer,
      this.#selection.layer,
      this.#tracingPaper.frame,
      this.#tracingPaper.sign,
      this.#tracingPaper.grip,
      this.#tracingPaper.tip,
      this.#tracingPaper.bar,
      this.#selection.grips,
      this.#selection.bar,
    );
    this.#sheet.append(this.#stage, this.#parts.spot);
    // The bands come after the sheet: the ruling on its edge, half past the band, lies over it.
    this.#column.append(
      this.#statement.element,
      this.#parts.list,
      this.#parts.status,
      this.#sheet,
      this.#above,
      this.#below,
    );
    this.#viewport.append(this.#column);
    // The bar comes first, as the row of buttons before it did: Tab reaches it before the sheet.
    this.#wrapper.append(this.#tools.rail, this.#viewport, this.#ring);
    root.append(this.#wrapper);
    // The styles keep every text of the element from a selection; a selection that a script or an
    // engine starts anyway does not start here.
    root.addEventListener("selectstart", (event) => event.preventDefault());
    this.#lay(NO_TASK);
    this.#refresh();

    this.#canvas.addEventListener("pointerdown", (event) => this.#down(event));
    this.#canvas.addEventListener("pointermove", (event) => this.#move(event));
    this.#canvas.addEventListener("pointerup", (event) => this.#up(event));
    for (const type of ["pointerleave", "pointerout"] as const) {
      this.#canvas.addEventListener(type, () => this.#unhover());
    }
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
    // sheet takes the pointer instead.
    this.#stage.addEventListener("contextmenu", (event) => event.preventDefault());
    // A pen's touch on the canvas starts none of the system's gestures: on an iPad a long press or a
    // double tap would select text and open the menu of the selection, and a pen writes by pointer
    // events alone, which come before the touch events. A finger's touch is left as it is.
    for (const type of ["touchstart", "touchmove"] as const) {
      this.#canvas.addEventListener(
        type,
        (event) => {
          if (byStylus(event)) event.preventDefault();
        },
        { passive: false },
      );
    }
    // A new colour of the ink, from the consumer's theme or the page's colour scheme, ends a
    // transition of the canvas's colour a millisecond long: the ink is drawn anew in it.
    this.#canvas.addEventListener("transitionend", () => this.#request());
    this.#canvas.addEventListener("transitioncancel", () => this.#request());
    this.#viewport.addEventListener("scroll", () => this.#scrolled(), { passive: true });
    // Ctrl or ⌘ with the wheel over the tracing paper scales it, not the page.
    this.#viewport.addEventListener("wheel", (event) => this.#wheel(event), { passive: false });
    // A container left with nothing to scroll keeps its stop of Tab while it has the focus.
    this.#viewport.addEventListener("blur", () => this.#region());
    // Delete or Backspace erases what Select took, Escape lets it go: from the sheet, or its bar.
    for (const at of [this.#viewport, this.#selection.bar]) {
      at.addEventListener("keydown", (event) => this.#selectKey(event));
    }

    attachProbe(this, () => ({
      strokes: this.#work.strokes,
      live: this.#recorder.live,
      pending: [...this.#eraser.pending],
      outlines: this.#outlines,
      fills: this.#fills,
      view: this.#view(),
      marks: this.#shown.map(({ name, placed, frame }) => ({ name, ids: placed.ids, frame })),
      roles: this.#hands.roles,
    }));

    this.#adopt("pens");
    this.#adopt("tool");
    this.#adopt("task");
    this.#adopt("workedExample");
    this.#adopt("paper");
    // The demo's state after its example, and the tracing paper's after its task from paper: each
    // is a TypeError without it.
    this.#adopt("demoState");
    this.#adopt("tracing");
    this.#adopt("grid");
    this.#adopt("manifest");
    this.#adopt("media");
    // The history before the marks: they hold on to its strokes.
    this.#adopt("history");
    this.#adopt("marks");
  }

  /**
   * The element follows its own `lang`, its buttons labelled in it, `tools-hidden`, and
   * `unstyled`, under which the strokes take no style.
   */
  static readonly observedAttributes = ["lang", "tools-hidden", "unstyled"];

  /**
   * The settings of the pen and the eraser, frozen: canvas's as the element comes — a pen, black
   * and three units wide, a blue liner, a yellow marker, and an eraser of strokes whole, 16 units
   * across. The learner changes them in the popovers of the pen and the eraser, which a `penchange`
   * tells; the consumer keeps them and gives them back to the next element, which tells nothing.
   * The next stroke takes the style of the kind in use, and the eraser its mode and its size: a
   * stroke written keeps its own. Settings not of `PenSettings` are a TypeError that names the
   * field, and leave the settings as they were; `undefined` changes nothing. Under the attribute
   * `unstyled` they are kept and given all the same, and the strokes take none of them.
   */
  get pens(): PenSettings {
    return this.#pens;
  }

  set pens(settings: PenSettings | undefined) {
    if (settings === undefined) return;
    const checked = penSettingsOf(settings);
    if (samePens(checked, this.#pens)) return;
    this.#pens = checked;
    this.#refresh();
  }

  /**
   * What a press of the primary button does: "pen" writes, as the element starts, "eraser" erases,
   * and "hand" moves the sheet, under any pointer. The learner switches it with the
   * element's own buttons, which say a choice of theirs with a `toolchange`, and the consumer may
   * set it too, which says nothing. A press under way goes on as it began. A pen's eraser
   * erases whatever the tool but the hand. A task without the eraser has none of it: "eraser" is a
   * TypeError then, and a new task without it puts the pen back. Every sheet the learner writes on
   * has the hand. A worked example has the pen alone, which writes nothing on its sheet.
   */
  get tool(): Tool {
    return this.#tool;
  }

  set tool(tool: Tool) {
    if (!isTool(tool)) {
      throw new TypeError(
        `the tool of <${TAG}> is "pen", "eraser", "select" or "hand", not ${JSON.stringify(tool)}`,
      );
    }
    if (!this.#allows(tool)) {
      const shown = this.#example === undefined ? "task" : "worked example";
      throw new TypeError(`the ${shown} of <${TAG}> allows no ${tool}`);
    }
    this.#tool = tool;
    this.#refresh();
    this.#request();
  }

  /**
   * The open view of the task, of the module format 0.4: its ID, its statement, which the
   * element shows above the page, what the statement gives and asks, which app shows, its
   * canvas — the kind, the sheet's grid and the tools the task allows — and its
   * items. A workbook's items are its lines, which the template shows, laid out on the page. The
   * type is spec's, with the element's own tools. A task the schema
   * refuses is a TypeError that names the field, a field the open view has not among it, and so are
   * a workbook whose lines do not fit, at the first item that does not, and an answer slot in
   * a zone; the sheet passes over a choice and an item's text, which app shows. Another task of the
   * same layer, tools and statement changes nothing, and any other changes the template alone, of
   * either kind: the work stays, for the next task is a new element. A task without the
   * eraser puts the pen back, with no event. While a worked example is shown a task is a TypeError,
   * and `undefined` changes nothing: the element shows one or the other.
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
    if (this.#paper !== undefined) {
      throw new TypeError(
        `<${TAG}> shows a task from paper: a task is shown by a new element, or once the paper is undefined`,
      );
    }
    const checked = task === undefined ? undefined : taskOf(task);
    const template = templateOf(checked);
    this.#task = task;
    this.#whole = wholeSheet(checked);
    this.#present(template);
  }

  /**
   * A lesson's worked example: the open view of a segment `worked_example` of the
   * module format 0.4 — its statement, which the element shows above the sheet as a task's,
   * the grid of its sheet or the lines of its workbook, and the parts of the author's demo, which
   * on a workbook fill the lines' boxes with their values. The type is spec's.
   * The element shows a task or a worked example, not both: an example while a task is given, while
   * the sheet has a history of writing, or while a stroke or an erasing is under way, is a
   * TypeError, and so is one the schema refuses, at its field. `undefined` takes the example off,
   * and the sheet is one with no task again. An example equal to the one shown changes nothing, and
   * another replaces it, its grid and its statement apart, as a task does.
   *
   * On a worked example's sheet the learner does not write: the canvas takes no input, and a finger
   * or a pen there scrolls the sheet as the browser scrolls the statement. It has no bar: its row
   * holds Next and Demo, and its region is named a worked example's. `task`, `history` other than
   * the empty one and `marks` are TypeErrors, and so is an eraser: the tool is the pen alone, and
   * `exportWork()` and `filled` give null. The next segment of a lesson is a new element.
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
   * A task from the learner's paper: `statement`, the task's crop as app cut it, a
   * Blob of a JPEG or a PNG. The element shows it in place of a task and of a worked example: a
   * dotted sheet with no statement, the pen and the eraser, and the crop over it as tracing paper,
   * at the element's own place for it, shown, which `tracing` tells. While a task or an example is
   * shown it is a TypeError, and so is what is not such a task. Another task from paper, of
   * another crop, lays its crop at the start again, and the history stays: the next task is a new
   * element; one of the same crop changes nothing. `undefined` takes it off, but not while the
   * history has strokes on the tracing paper, a TypeError. Either drops a stroke or an erasing
   * under way on the tracing paper, as a new history drops the one under the pen. The crop's
   * picture is read as it comes; till then the paper has its largest size.
   */
  get paper(): PaperTask | undefined {
    return this.#paper;
  }

  set paper(paper: PaperTask | undefined) {
    if (paper === this.#paper) return;
    if (paper === undefined) {
      if (this.#work.traced || this.#work.tutored) {
        throw new TypeError(
          `<${TAG}> has strokes on the tracing paper or an act of the tutor: the task from paper goes with a new element, or a history without them`,
        );
      }
      this.#leaveTracing(false);
      this.#paper = undefined;
      this.#tracing = undefined;
      this.#reading = undefined;
      this.#tracingPaper.reading = undefined;
      this.#tracingPaper.show(undefined, () => {});
      this.#whole = false;
      this.#present(NO_TASK);
      return;
    }
    if (this.#example !== undefined) {
      throw new TypeError(
        `<${TAG}> shows a worked example: a task from paper is shown by a new element, or once the example is undefined`,
      );
    }
    if (this.#task !== undefined) {
      throw new TypeError(
        `<${TAG}> shows a task: a task from paper is shown by a new element, or once the task is undefined`,
      );
    }
    const statement: unknown =
      typeof paper === "object" && paper !== null ? paper.statement : undefined;
    if (!(statement instanceof Blob)) {
      throw new TypeError(
        `paper.statement: the task's crop, a Blob of a JPEG or a PNG, not ${typeof statement}`,
      );
    }
    const source: unknown = paper.source ?? "photo";
    if (source !== "photo" && source !== "module") {
      throw new TypeError(`paper.source: "photo" or "module", not ${String(source)}`);
    }
    this.#tracingPaper.source = source;
    // A consumer that renders the same crop anew in a new object keeps the paper where it lies.
    if (this.#paper?.statement === statement) {
      this.#paper = paper;
      return;
    }
    this.#leaveTracing(false);
    // A new task from paper comes on dots; another crop in its place keeps the learner's grid.
    if (this.#paper === undefined) this.#paperGrid = PAPER_GRIDS[0] as PaperGrid;
    this.#paper = paper;
    this.#tracing = TRACING_START;
    this.#reading = undefined;
    this.#tracingPaper.reading = undefined;
    this.#tracingPaper.show(statement, () => this.#sized());
    this.#whole = true;
    this.#present(PAPER_TEMPLATE);
    this.#request();
  }

  /**
   * Where the tracing paper of the task from paper lies on the sheet, its top left corner in sheet
   * units, and whether it is hidden: frozen, and the same object until it changes;
   * `undefined` without a task from paper. The learner moves it by its grip and hides or shows it
   * by the button atop the tools, which a `tracingchange` tells; the consumer keeps it and gives it
   * back, which tells nothing. Given before the task from paper it is a TypeError, and so is a
   * state that is not one, or one that puts the paper wholly off the sheet; `undefined` changes
   * nothing. Till the crop's picture is read the paper has its largest size: a state that puts the
   * paper of its real size wholly off the sheet then moves to the nearest place wholly on it, with
   * no event.
   */
  get tracing(): TracingState | undefined {
    return this.#tracing;
  }

  set tracing(state: TracingState | undefined) {
    if (state === undefined) return;
    if (this.#paper === undefined) {
      throw new TypeError(
        `<${TAG}> shows no task from paper: the tracing paper's state is given after the paper`,
      );
    }
    const checked = tracingStateOf(state, this.#tracingPaper.size);
    const shown = this.#tracing;
    if (shown !== undefined && sameTracing(shown, checked)) return;
    this.#tracing = checked;
    this.#replace();
    this.#regrow();
    this.#refresh();
    this.#request();
  }

  /**
   * The reading of the task from paper's statement in clean print: `undefined` offers no
   * "Recognise"; `"ready"` offers it, and its press sends a `tracingread`; `"busy"` waits; `"done"`
   * holds the statements, which take the crop's place for the learner who asked, till "Original".
   * Frozen; given without a task from paper, or not a reading, it is a TypeError.
   */
  get reading(): TracingReading | undefined {
    return this.#reading;
  }

  set reading(reading: TracingReading | undefined) {
    if (reading !== undefined && this.#paper === undefined) {
      throw new TypeError(
        `<${TAG}> shows no task from paper: the reading is given after the paper`,
      );
    }
    const checked = reading === undefined ? undefined : readingOf(reading);
    this.#reading = checked;
    this.#tracingPaper.reading = checked;
    this.#request();
  }

  /**
   * How far the learner has gone through the worked example's demo: `opened`, how many of
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
   * The open view of the module's manifest, of which the element reads the version of the
   * module format — "0.4", or the manifest is a TypeError — the height of a digit on the
   * crop for checking, `canvas.digit_height`, 24 px unless given, and the explanation language, the
   * statement's and a workbook's lines'. Without a manifest the digits are 24 px, and the statement
   * and the lines are in the element's own `lang`. The rest of it the element passes over, but for
   * the canvas settings, which are its own: one it does not know is a TypeError. A manifest it
   * cannot read is a TypeError that names the field, and the element stays as it was; the same
   * object given again is read again, for the consumer may have changed it. The task and the
   * manifest are each the consumer's to give, in either order: `exportWork()` takes the height
   * when it is called.
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
   * What gives the files of the pictures, by their references, as the contract has it: a
   * task's statement's, and a worked example's — its statement's and every part's of
   * its demo, which it asks for as the example comes, before the learner opens them. A
   * reference is asked for once, whichever pictures show it, and its file stays while the task or
   * the example names it. Until a picture's file comes, or if it never does, its frame shows what
   * it shows in words. A new function serves the references that have no file yet, and stops no
   * load the last one began.
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
   * The grid of the task from paper's sheet: `undefined` without a task from paper, and
   * "dots" as one comes. The learner turns it by the element's button, which a `gridchange`
   * tells; the consumer keeps it and gives it back, which tells nothing. A grid given before the
   * task from paper is a TypeError, and so is one not of `PaperGrid`; `undefined` changes nothing.
   */
  get grid(): PaperGrid | undefined {
    return this.#paper === undefined ? undefined : this.#paperGrid;
  }

  set grid(grid: PaperGrid | undefined) {
    if (grid === undefined) return;
    if (!isPaperGrid(grid)) {
      const grids = PAPER_GRIDS.map((each) => JSON.stringify(each)).join(", ");
      throw new TypeError(`the grid of <${TAG}> is one of ${grids}, not ${JSON.stringify(grid)}`);
    }
    if (this.#paper === undefined) {
      throw new TypeError(`<${TAG}> shows no task from paper: its grid is given after the paper`);
    }
    if (grid === this.#paperGrid) return;
    this.#paperGrid = grid;
    this.#drawGrid();
    this.#refresh();
  }

  /**
   * The history of writing: every stroke, erasing, cut, clearing, undo and act of the tutor on the
   * sheet, in the order they landed, at the sheet's time — frozen, and the same array until the next action. The
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
   * either order. A worked example's sheet has the empty history alone: any other is a TypeError.
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
    // A worked example's sheet is no one's to write on.
    if (this.#example !== undefined) {
      throw new TypeError(`<${TAG}> shows a worked example, whose sheet has no history of writing`);
    }
    // undefined, and undefined alone, is the empty history: null is a value, and a wrong one.
    const work = Work.restore(
      history === undefined ? [] : history,
      this.#clock,
      this.#paper !== undefined,
    );
    const after = work.history;
    // The empty history is a new sheet, which a consumer asks for on purpose.
    if (after.length > 0 && begins(after, before)) {
      console.warn(
        `<${TAG}> takes a history that is where its own began: the ${before.length - after.length} actions after it are gone`,
      );
    }
    this.#endDrawing();
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
    this.#regrow();
    this.#refresh();
    this.#request();
  }

  /**
   * Which answer slots the learner's strokes fill, per item, per slot, in the task's order, by the
   * strokes `exportWork()` would take — not the stroke under way, but those under an eraser not
   * yet lifted. A workbook's boxes, each whether it holds one: a stroke is in one box
   * or in none, by the boxes' rule, and what is in none is the draft. A sheet's one answer anywhere
   * on it or the whole sheet, whether the sheet holds one. `null` for a sheet of choices,
   * whose options app marks, for a sheet with no task, and for a worked example. Frozen, and the
   * same array until a slot changes. An action on the sheet changes it before its
   * `historychange`, and a task or a history given changes it with no event.
   */
  get filled(): Filled | null {
    return this.#filled;
  }

  /**
   * The tutor's marks of one submission, with the context the element gave with its work: each a
   * frame where a group of strokes is, or a box on the crop the model saw, and on a workbook where
   * an answer cell is, by its item and its slot. A mark holds on to the strokes the model saw there
   * and is drawn around those of them the sheet shows, as they are now — a cell's around its box
   * too: new strokes do not move it, and when all of them are erased it is gone, till undo brings
   * them back. A box of a workbook that was empty is framed alone. A box that comes near no stroke,
   * and a cell on a sheet, which takes no zones, have no frame: the question is asked without one.
   * The type is spec's. A submission goes back to a sheet whose history holds its strokes, as its
   * digest tells, and a workbook's to a page of its boxes: one of other strokes or other boxes is a
   * TypeError, and so are marks given before the task and the history they hold on to, and marks
   * that are not marks. A new history, and a new page, put the marks back on their strokes, or take
   * them off. `undefined` takes the marks off. Every value is checked as it comes, and marks equal
   * to those shown write nothing. A worked example's sheet has nothing to mark: marks are a
   * TypeError there.
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

  /** The element moved into another document: its root adopts that document's sheet. */
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
    this.#tracingPaper.connect();
    // The page's pen mode, on every sheet of it. The bar shows a change once the event that
    // made it is over: by then a pen that came down writes. The sheet tells the page whether it is
    // written on, and hears when a stroke ends.
    const unwatch = PEN_MODE.watch(() => queueMicrotask(() => this.#refresh()));
    const unenlist = PEN_MODE.enlist(() => this.#writer() !== undefined);
    this.#unwatchPen = () => {
      unwatch();
      unenlist();
    };
    // The page's zoom, on every sheet of it: it may have changed while the element was away.
    this.#unwatchZoom = PAGE_ZOOM.watch(() => this.#zoomed());
    // A page that grows or shrinks scrolls nothing, and neither does a window of another size.
    this.#page.observe(document.documentElement);
    window.addEventListener("resize", this.#resized);
    window.addEventListener("resize", this.#rewindowed);
    this.#regrow();
    this.#refresh();
    this.#fit();
  }

  /**
   * The element's `lang` came, changed or went: its buttons and a workbook's boxes are labelled in
   * it, or in English for a language their labels are not in, and for none. Or
   * `tools-hidden` did: while the element has it, the bar is out of sight and of the accessibility
   * tree, as `app` hides it on a phone under its tutor's sheet. An attribute the
   * element had before it was defined comes here just after the constructor, which reads no
   * attribute. Or `unstyled` did: while the element has it, a stroke takes no style, 3 units wide
   * in the theme's ink, no popover opens, and the eraser takes whole strokes as near as it
   * always took them — the samples page writes so, while its texts say nothing of a style.
   */
  attributeChangedCallback(name: string): void {
    if (name === "tools-hidden") {
      this.#tools.rail.hidden = this.hasAttribute("tools-hidden");
      this.#tools.pens.close();
      this.#fit();
      return;
    }
    if (name === "unstyled") {
      this.#styled = !this.hasAttribute("unstyled");
      this.#unhover();
      this.#refresh();
      return;
    }
    this.#tools.label(this.getAttribute("lang"));
    this.#selection.label(this.getAttribute("lang"));
    this.#nameGrip();
    this.#nameRegion();
    this.#nameBoxes();
    this.#markBoxes();
  }

  /**
   * The demo's list says a box it fills in the labels' language, around its value, which is a node
   * of its own in the parts' language: "Box 1.2: " and "5"; its open items too, anew.
   * Without `lang` the labels are English, as the element's own.
   */
  #nameBoxes(tag: string | null = this.getAttribute("lang")): void {
    const { lang, labels } = labelsFor(tag);
    this.#parts.fillWords = (part) => {
      const name = say(labels.boxIn, { line: part.fill.line, slot: part.fill.box });
      const value = this.#example === undefined ? "" : fillValue(this.#example, part);
      if (value === "") return { before: name, value, after: "", lang };
      const [before, after] = sayAround(labels.valued, "value", { name });
      return { before, value, after, lang };
    };
  }

  /** The tracing paper's grip is named in the labels' language, and its tooltip says it. */
  #nameGrip(tag: string | null = this.getAttribute("lang")): void {
    const { lang, labels } = labelsFor(tag);
    this.#tracingPaper.label(labels, lang);
  }

  /**
   * Takes back the last action on the sheet — the last stroke written, the last erasing, or the
   * clearing — and says whether there was one, with a `historychange` if there was.
   * The element's Undo button calls it, and so may the consumer. A stroke under way
   * stays: it lands when it ends. So does an erasing: what it came near leaves the sheet when it
   * lifts, if it is on the sheet then.
   */
  undo(): boolean {
    const undone = this.#work.undo(performance.now());
    if (undone) {
      this.#endDrawing();
      this.#changed();
    }
    return undone;
  }

  /**
   * Does again the last action an undo took back, if no other action came since, and says whether
   * there was one, with a `historychange` if there was: the history gets an action of its kind, its
   * new strokes under new IDs. The element's Redo button calls it, and so may the consumer. A
   * stroke under way stays, as for an undo.
   */
  redo(): boolean {
    const redone = this.#work.redo(performance.now(), (count) => this.#recorder.reserve(count));
    if (redone) {
      this.#endDrawing();
      this.#changed();
    }
    return redone;
  }

  /**
   * Takes every stroke off the sheet, an action that undo takes back, and says whether there were
   * any, with a `historychange` if there were. The element's Clear button calls it, and
   * so may the consumer. A stroke under way stays: it lands when it ends.
   */
  clear(): boolean {
    const cleared = this.#work.clear(performance.now());
    if (cleared) {
      this.#endDrawing();
      this.#changed();
    }
    return cleared;
  }

  /**
   * The work for checking, when the consumer asks for it, at Check, at the height of a
   * digit the manifest asks for. On a sheet it is the crop of the strokes the sheet
   * shows, its PNG, and the context of the submission — the crop's numbers, the groups and their
   * digest. On a workbook it is the crop of each filled box, by its strokes alone, with
   * its item and its slot, and the context — the table «box → stroke IDs» and its digest; the
   * draft goes nowhere. The consumer keeps the context, sends only the PNGs and their
   * places to be checked, and gives the context back with the tutor's marks. It is the
   * sheet as it is when this is called: a stroke under way is not on it yet, while the strokes
   * under an eraser not yet lifted still are, as `filled` has them. A sheet without strokes, and a
   * workbook with no box filled, have no work to check, and the promise gives null (H3); so has a
   * worked example, whose sheet the learner does not write on.
   */
  async exportWork(): Promise<ExportedWork | null> {
    if (this.#example !== undefined) return null;
    const { digit } = this.#settings;
    const paper = this.#paper;
    const tracing = this.#tracing;
    if (paper !== undefined && tracing !== undefined) {
      // The sheet as it is now: the crop's picture, read by now or soon, does not change it.
      const strokes = this.#work.strokes.map((stroke) => this.#onSheet(stroke, tracing));
      if (strokes.length === 0) return null;
      const written = this.#work;
      const onTracing = (id: number) => written.onTracing(id);
      const { size, gray } = await this.#tracingPaper.read;
      const scale = scaleIn(tracing);
      const rect = tracingRect(tracing.at, scaled(size, scale));
      const work = paperWorkForCheck(
        strokes,
        { at: tracing.at, scale, onTracing },
        tracing,
        rect,
        gray,
        digit,
      );
      if (work === null) return null;
      return Object.freeze({
        statement: paper.statement,
        png: blobOf(work.png),
        submission: work.submission,
      });
    }
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

  /**
   * The work of a task from paper for the drawing of grown-up mode, as the sheet is when it is
   * called: the crop of the part of the sheet in sight that is free — the element's bar of buttons,
   * while shown, and the host's controls of `cover` left out, each with a margin of `COVER_GAP`
   * CSS px, the whole part in sight should they leave too little —, or the page, should the element
   * not be laid out, with room to write in, its longer edge 1568 px at most and its visual tokens within
   * the crop's bound, RGB, on white with no grid: every stroke there in its style, and the tracing
   * paper where it lies, while it is shown, its picture laid in grey and multiplied and its strokes
   * over it. With the task's crop and the context: the crop's numbers, no groups, where the tracing
   * paper lay and the digest. A sheet with no stroke gives it too. Without a task from paper, or
   * with a side of `cover` that is not a finite number of 0 or more, it is a TypeError, thrown at
   * once.
   */
  exportForDrawing(cover?: DrawingCover): Promise<ExportedPaper> {
    const paper = this.#paper;
    const tracing = this.#tracing;
    if (paper === undefined || tracing === undefined) {
      throw new TypeError(`<${TAG}> shows no task from paper: the drawing's crop is one's alone`);
    }
    const sides = coverOf(cover);
    const screen = this.#view();
    if (screen === undefined || !(screen.width > 0 && screen.height > 0)) {
      const page = { minX: 0, minY: 0, maxX: SHEET.width, maxY: SHEET.height };
      return this.#drawingOf(paper, tracing, this.#work, page);
    }
    const { k, vx, vy, width, height } = screen;
    const inSight = (left: number, top: number, right: number, bottom: number): Box => ({
      minX: Math.max(0, vx + left / k),
      minY: Math.max(0, vy + top / k),
      maxX: Math.min(REACH.width, vx + (width - right) / k),
      maxY: Math.min(REACH.height, vy + (height - bottom) / k),
    });
    const rail = this.#tools.rail;
    // The bar is of no width itself, its panels standing out of it, over the sheet's left edge or
    // beside it: a margin from the rightmost shown, either way. A tooltip is no panel: it comes and
    // goes with the pointer, which may rest over a button as the grown-up asks.
    const right = rail.hidden
      ? undefined
      : Math.max(
          ...Array.from(rail.children)
            .filter((panel) => panel !== this.#tools.tip)
            .map((panel) => panel.getBoundingClientRect())
            .filter((box) => box.width > 0)
            .map((box) => box.right),
        );
    const bar =
      right === undefined || !Number.isFinite(right)
        ? 0
        : Math.max(right - screen.left, 0) + COVER_GAP;
    const margin = (side: number) => (side > 0 ? side + COVER_GAP : 0);
    const free = inSight(
      Math.max(margin(sides.left), bar),
      margin(sides.top),
      margin(sides.right),
      margin(sides.bottom),
    );
    // Too little left free to write in: the whole part in sight, as the grown-up sees it.
    const roomy =
      (free.maxX - free.minX) * k >= COVER_LEAST && (free.maxY - free.minY) * k >= COVER_LEAST;
    const region = roomy ? free : inSight(0, 0, 0, 0);
    return this.#drawingOf(paper, tracing, this.#work, region);
  }

  async #drawingOf(
    paper: PaperTask,
    tracing: TracingState,
    work: Work,
    region: Box,
  ): Promise<ExportedPaper> {
    const crop = drawingCropOf(region);
    const strokes = work.strokes;
    const { size, gray: picture } = await this.#tracingPaper.read;
    const { width, height } = crop;
    const [top, left] = crop.sheetBox;
    // Pixels a unit, across and down alike: the crop's numbers keep one scale.
    const scale = width / (crop.sheetBox[3] - left);
    const by = scaleIn(tracing);
    const shown = !tracing.hidden;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (context === null)
      throw new Error(`<${TAG}> got no 2D context to draw the drawing's crop on`);
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    const fill = (stroke: Stroke) => {
      const { style } = stroke;
      context.fillStyle = style?.color ?? "#000";
      context.globalAlpha = style === undefined ? 1 : style.opacity / 100;
      context.globalCompositeOperation = style?.pen === "marker" ? "multiply" : "source-over";
      context.fill(this.#finished(stroke).path);
    };
    // The sheet's strokes, then the shown paper's crop multiplied over them, then its strokes.
    context.setTransform(scale, 0, 0, scale, -left * scale, -top * scale);
    for (const stroke of strokes) if (!work.onTracing(stroke.id)) fill(stroke);
    const { data } = context.getImageData(0, 0, width, height);
    const pixels = new Uint8Array(3 * width * height);
    for (let at = 0; at < width * height; at++) {
      for (let c = 0; c < 3; c++) pixels[3 * at + c] = data[4 * at + c] as number;
    }
    if (shown && picture !== null) {
      const rect = tracingRect(tracing.at, scaled(size, by));
      const place = {
        left: (rect.minX - left) * scale,
        top: (rect.minY - top) * scale,
        right: (rect.maxX - left) * scale,
        bottom: (rect.maxY - top) * scale,
      };
      layOver(pixels, width, picture, place, 3);
    }
    const traced = strokes.filter((stroke) => work.onTracing(stroke.id));
    if (shown && traced.length > 0) {
      const image = context.createImageData(width, height);
      for (let at = 0; at < width * height; at++) {
        for (let c = 0; c < 3; c++) image.data[4 * at + c] = pixels[3 * at + c] as number;
        image.data[4 * at + 3] = 255;
      }
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
      context.putImageData(image, 0, 0);
      const [x, y] = tracing.at;
      context.setTransform(scale * by, 0, 0, scale * by, (x - left) * scale, (y - top) * scale);
      for (const stroke of traced) fill(stroke);
      const over = context.getImageData(0, 0, width, height).data;
      for (let at = 0; at < width * height; at++) {
        for (let c = 0; c < 3; c++) pixels[3 * at + c] = over[4 * at + c] as number;
      }
    }
    // The canvas's memory goes at once, not at a collection: WebKit caps what all canvases hold.
    canvas.width = 0;
    canvas.height = 0;
    const placed = strokes.map((stroke) => this.#onSheet(stroke, tracing));
    const onPaper = { at: tracing.at, scale: by, onTracing: (id: number) => work.onTracing(id) };
    const submission = drawingSubmissionOf(placed, onPaper, tracing, crop);
    return Object.freeze({
      statement: paper.statement,
      png: blobOf(encodePNG(pixels, width, height, 3)),
      submission,
    });
  }

  /**
   * The strokes the crop of a task from paper shows, for the tutor in grown-up mode, by the context
   * of the submission `exportWork()` or `exportForDrawing()` gave with that crop: of the strokes on the sheet, in its
   * order, those whose ink reaches into the crop, where they lay when it was made — the tracing
   * paper's where the context's paper lay, none of them while it was hidden —, by ID, their points in the crop's pixels to a
   * hundredth, thinned to 128 at most, frozen. A context that is not a task from paper's, and one
   * given to a sheet with no task from paper, is a TypeError.
   */
  cropStrokes(submission: PaperSubmission): readonly CropStroke[] {
    const context = this.#paperContextOf(submission);
    const work = this.#work;
    return Object.freeze(cropStrokesOf(work.strokes, (id) => work.onTracing(id), context));
  }

  /**
   * The tutor's act in grown-up mode put on the sheet, by the context of the submission whose crop
   * the drawing read, in one action that an undo takes back whole: the strokes it takes off, and
   * its strokes after every other, new IDs, liners of its colours, laid from the crop's pixels
   * onto the sheet, or onto the tracing paper from its corner when the context's paper was shown
   * and every point of the act lies on it.
   * It sends `historychange` at once. Its strokes are drawn one after another, each along its
   * length at a hand's speed, all of it within 3 s, and at once with reduced motion or off the
   * page; the promise resolves once the last is drawn. An undo, a clearing, an eraser, a new
   * history, a scroll or another act cut the drawing short — what is left of it is drawn at once,
   * and the promise resolves. An act that writes nothing and takes nothing off is no action, and
   * resolves at once. A context that is not a task from paper's, an act with an ID the sheet does
   * not show, a point off the sheet or a colour that is not `#rrggbb` is a TypeError, thrown
   * before anything changes.
   */
  drawTutor(submission: PaperSubmission, act: TutorAct): Promise<void> {
    const context = this.#paperContextOf(submission);
    const work = this.#work;
    const plan = tutorPlanOf(
      act,
      context,
      new Set(work.strokes.map(({ id }) => id)),
      this.#tracingPaper.ready ? this.#tracingPaper.size : undefined,
    );
    this.#endDrawing();
    const first = this.#recorder.reserve(plan.strokes.length);
    const drafts = plan.strokes.map((stroke, k) => ({ id: first + k, ...stroke }));
    if (!work.tutor(drafts, plan.erase, performance.now(), plan.on)) return Promise.resolve();
    // The drawing is there before any listener hears: one that undoes at once cuts it short.
    const done = this.#startDrawing(drafts, plan.on === undefined ? 1 : scaleIn(context.tracing));
    this.#changed();
    return done;
  }

  /**
   * Select comes down: inside the box of the strokes it took, it drags them; anywhere else, it lets
   * them go and begins its shape on the layer the press is on — the tracing paper's, `layer`, or the
   * sheet's.
   */
  #selectDown(pointerId: number, sample: Point, layer: "tracing" | undefined): void {
    const selected = this.#selectedNow();
    if (selected !== undefined) {
      const point = this.#inLayer(sample, selected.layer);
      const box = this.#selectedBox(selected);
      const screen = this.#view();
      const pad =
        screen === undefined ? 0 : SELECT_PAD_PX / (screen.k * this.#layerScale(selected.layer));
      if (
        box !== undefined &&
        point.x >= box.minX - pad &&
        point.x <= box.maxX + pad &&
        point.y >= box.minY - pad &&
        point.y <= box.maxY + pad
      ) {
        this.#dragging = {
          pointerId,
          ids: new Set(selected.ids),
          from: point,
          box,
          offset: [0, 0],
          painted: [0, 0],
          moved: new Map(),
        };
        this.#request();
        return;
      }
    }
    this.#selected = undefined;
    this.#selecting = { pointerId, layer, points: [this.#inLayer(sample, layer)] };
    this.#request();
  }

  /** Select's pointer moves: its shape gains a point, or the strokes it took go with it. */
  #selectMove(event: PointerEvent): void {
    const screen = this.#view();
    if (screen === undefined) return;
    const sheet = toSheet(screen, event.clientX - screen.left, event.clientY - screen.top);
    const dragging = this.#dragging;
    if (dragging !== undefined) {
      const layer = this.#selected?.layer;
      const { x, y } = this.#inLayer(sheet, layer);
      const offset = keptOffset(
        dragging.box,
        [x - dragging.from.x, y - dragging.from.y],
        REACH.width,
        REACH.height,
      );
      if (offset[0] === dragging.offset[0] && offset[1] === dragging.offset[1]) return;
      dragging.offset = offset;
      dragging.moved.clear();
      this.#request();
      return;
    }
    const selecting = this.#selecting;
    if (selecting === undefined) return;
    const point = this.#inLayer(sheet, selecting.layer);
    const last = selecting.points.at(-1) as Point;
    // A point a pixel or two from the last adds nothing to the shape the eye can see.
    const least = 2 / (screen.k * this.#layerScale(selecting.layer));
    if (Math.hypot(point.x - last.x, point.y - last.y) < least) return;
    selecting.points.push(point);
    this.#request();
  }

  /**
   * Select's pointer lifts: its shape takes the strokes of its layer it holds almost wholly, or the
   * strokes dragged land where they are, moved, in one action that an undo takes back whole.
   */
  #selectUp(event: PointerEvent): void {
    const selecting = this.#selecting;
    if (selecting?.pointerId === event.pointerId) {
      this.#selectMove(event);
      this.#selecting = undefined;
      const shape = this.#shapeOf(selecting.points);
      const work = this.#work;
      const traced = selecting.layer === "tracing";
      const strokes = work.strokes.filter((stroke) => work.onTracing(stroke.id) === traced);
      const ids = takenBy(strokes, shape);
      this.#selected = ids.length === 0 ? undefined : { ids, layer: selecting.layer };
      this.#request();
      return;
    }
    const dragging = this.#dragging;
    if (dragging?.pointerId !== event.pointerId) return;
    this.#selectMove(event);
    this.#dragging = undefined;
    const selected = this.#selected;
    const [dx, dy] = dragging.offset;
    if (selected === undefined || (dx === 0 && dy === 0)) {
      this.#request();
      return;
    }
    this.#act("move", selected, dragging.offset);
  }

  /** The strokes Select took, copied just below themselves, and the copies taken in their place. */
  #copySelected(): void {
    const selected = this.#selectedNow();
    const box = selected === undefined ? undefined : this.#selectedBox(selected);
    if (selected === undefined || box === undefined) return;
    const down = box.maxY - box.minY + COPY_GAP;
    this.#act("copy", selected, keptOffset(box, [0, down], REACH.width, REACH.height));
  }

  /**
   * A grip's press: the strokes Select took scale from the corner across as its pointer goes, kept
   * to the scale's bounds and to the sheet. A press with a drag or another scale under way, or of
   * another button than the first, does nothing.
   */
  #scaleDown(corner: Corner, event: PointerEvent): void {
    const selected = this.#selectedNow();
    const box = selected === undefined ? undefined : this.#selectedBox(selected);
    const screen = this.#view();
    const busy = this.#dragging !== undefined || this.#resizing !== undefined;
    if (event.button !== 0 || busy || selected === undefined || box === undefined) return;
    if (screen === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    try {
      if (event.currentTarget instanceof Element) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    } catch {
      // An event a script made, which no pointer backs: the drag goes on by its moves all the same.
    }
    const right = corner.endsWith("r");
    const bottom = corner.startsWith("b");
    const at: [number, number] = [right ? box.minX : box.maxX, bottom ? box.minY : box.maxY];
    this.#resizing = {
      pointerId: event.pointerId,
      ids: new Set(selected.ids),
      at,
      corner: [right ? box.maxX : box.minX, bottom ? box.maxY : box.minY],
      x: event.clientX,
      y: event.clientY,
      k: screen.k * this.#layerScale(selected.layer),
      range: scaleRange(box, at, REACH.width, REACH.height),
      factor: 1,
      painted: 1,
      scaled: new Map(),
    };
    this.#request();
  }

  /**
   * A grip's drag, as the mockup's: the factor is how far the pointer has taken the grip's corner
   * along the line from the corner across, its shape kept, to a thousandth.
   */
  #scaleMove(event: PointerEvent): void {
    const resizing = this.#resizing;
    if (resizing === undefined || event.pointerId !== resizing.pointerId) return;
    const [ax, ay] = resizing.at;
    const [cx, cy] = resizing.corner;
    const px = cx + (event.clientX - resizing.x) / resizing.k;
    const py = cy + (event.clientY - resizing.y) / resizing.k;
    const [vx, vy] = [cx - ax, cy - ay];
    const along = vx * vx + vy * vy;
    const asked = along === 0 ? 1 : ((px - ax) * vx + (py - ay) * vy) / along;
    const [lo, hi] = resizing.range;
    const factor = Math.round(Math.min(Math.max(asked, lo), hi) * 1000) / 1000;
    if (factor === resizing.factor) return;
    resizing.factor = factor;
    resizing.scaled.clear();
    this.#request();
  }

  /**
   * A grip's drag ends: lifted, the strokes land scaled in one action that an undo takes back
   * whole, unless the size has hardly changed; cancelled or lost, they stay as they were.
   */
  #scaleUp(event: PointerEvent): void {
    const resizing = this.#resizing;
    if (resizing === undefined || event.pointerId !== resizing.pointerId) return;
    if (event.type === "pointerup") this.#scaleMove(event);
    this.#resizing = undefined;
    const selected = this.#selectedNow();
    const { factor, at } = resizing;
    if (
      event.type !== "pointerup" ||
      selected === undefined ||
      Math.abs(factor - 1) < SCALE_LEAST_CHANGE
    ) {
      this.#painted = undefined;
      this.#request();
      return;
    }
    const scaling: Scaling = { factor, at };
    this.#land(selected, (first, time) => this.#work.scale(selected.ids, scaling, first, time));
  }

  /** A key while Select has taken strokes: Delete or Backspace erases them, Escape lets them go. */
  #selectKey(event: KeyboardEvent): void {
    const busy = this.#dragging !== undefined || this.#resizing !== undefined;
    if (busy || this.#selectedNow() === undefined) return;
    if (event.key === "Delete" || event.key === "Backspace") this.#removeSelected();
    else if (event.key === "Escape") {
      this.#selected = undefined;
      this.#viewport.focus();
      this.#request();
    } else return;
    event.preventDefault();
  }

  /** The strokes Select took, erased, in one action. */
  #removeSelected(): void {
    const selected = this.#selectedNow();
    if (selected === undefined) return;
    this.#selected = undefined;
    if (this.#work.erase(selected.ids, performance.now())) this.#changed();
    else this.#request();
  }

  /** A move or a copy of the strokes Select took, whose new strokes it takes then. */
  #act(kind: "move" | "copy", selected: Selected, offset: readonly [number, number]): void {
    this.#land(selected, (first, time) =>
      this.#work.select(kind, selected.ids, offset, first, time),
    );
  }

  /**
   * Select's action on the strokes it took, by `act` with the first of the IDs it reserves for the
   * new strokes: Select takes those then, or, should the action do nothing, lets them go.
   */
  #land(selected: Selected, act: (first: number, time: number) => boolean): void {
    const first = this.#recorder.reserve(selected.ids.length);
    if (act(first, performance.now())) {
      this.#selected = {
        ids: selected.ids.map((_, k) => first + k),
        layer: selected.layer,
      };
      this.#changed();
    } else {
      // The strokes a drag showed moved or scaled go back as they are: the whole sheet is drawn anew.
      this.#selected = undefined;
      this.#painted = undefined;
      this.#request();
    }
  }

  /**
   * The strokes Select took, while it is the tool and they are on the sheet, in sight: those gone
   * since are left out, and with none left, or with another tool, or with their tracing paper
   * hidden, the selection goes.
   */
  #selectedNow(): Selected | undefined {
    const selected = this.#selected;
    if (selected === undefined) return undefined;
    const traced = selected.layer === "tracing";
    const work = this.#work;
    const on = new Set(
      work.strokes.filter((stroke) => work.onTracing(stroke.id) === traced).map(({ id }) => id),
    );
    const ids = selected.ids.filter((id) => on.has(id));
    const hidden = traced && (this.#tracing === undefined || this.#tracing.hidden);
    if (this.#tool !== SELECT || ids.length === 0 || hidden) {
      this.#selected = undefined;
      return undefined;
    }
    if (ids.length !== selected.ids.length) this.#selected = { ids, layer: selected.layer };
    return this.#selected;
  }

  /** The box of the points of the strokes Select took, in their layer's units. */
  #selectedBox(selected: Selected): Box | undefined {
    const ids = new Set(selected.ids);
    const points = this.#work.strokes.filter(({ id }) => ids.has(id)).flatMap((s) => s.points);
    return points.length === 0 ? undefined : boxOf(points);
  }

  /** A point of the sheet in a layer's units: the tracing paper's from its corner, or as it is. */
  #inLayer(point: Point, layer: "tracing" | undefined): Point {
    const tracing = this.#tracing;
    if (layer !== "tracing" || tracing === undefined) return { x: point.x, y: point.y };
    return toTracing(point, tracing.at, this.#tracingPaper.size, scaleIn(tracing));
  }

  /** How large a unit of a layer is on the sheet: the tracing paper's scale, or 1. */
  #layerScale(layer: "tracing" | undefined): number {
    return layer === "tracing" && this.#tracing !== undefined ? scaleIn(this.#tracing) : 1;
  }

  /** Select's shape from the points its pointer went through: the lasso, or the rectangle. */
  #shapeOf(points: readonly Point[]): Point[] {
    if (this.#pens.select === "lasso") return [...points];
    const first = points[0] as Point;
    return rectangleOf(first, points.at(-1) ?? first);
  }

  /**
   * Select's marks as they are now: its shape under way, and the box round what it took — where a
   * drag has it — with the bar, in the sheet's units, over the strokes of either layer.
   */
  #drawSelection(screen: Screen): void {
    const selecting = this.#tool === SELECT ? this.#selecting : undefined;
    const toSheetOf = (layer: "tracing" | undefined) => {
      const tracing = this.#tracing;
      const [ax, ay] = layer === "tracing" && tracing !== undefined ? tracing.at : [0, 0];
      const by = this.#layerScale(layer);
      return ({ x, y }: Point): Point => ({ x: x * by + ax, y: y * by + ay });
    };
    this.#selection.shape(
      selecting === undefined
        ? undefined
        : this.#shapeOf(selecting.points).map(toSheetOf(selecting.layer)),
    );
    const selected = this.#selectedNow();
    const box = selected === undefined ? undefined : this.#selectedBox(selected);
    if (selected === undefined || box === undefined) {
      this.#selection.box(undefined, screen, { top: 0, bottom: screen.height }, false);
      return;
    }
    const [dx, dy] = this.#dragging?.offset ?? [0, 0];
    // While a grip is dragged, the box as the scale will leave it.
    const resizing = this.#resizing;
    const [ax, ay] = resizing?.at ?? [0, 0];
    const f = resizing?.factor ?? 1;
    const at = toSheetOf(selected.layer);
    const corner = at({ x: ax + (box.minX - ax) * f + dx, y: ay + (box.minY - ay) * f + dy });
    const end = at({ x: ax + (box.maxX - ax) * f + dx, y: ay + (box.maxY - ay) * f + dy });
    const pad = SELECT_PAD_PX / screen.k;
    const onSheet = {
      minX: corner.x - pad,
      minY: corner.y - pad,
      maxX: end.x + pad,
      maxY: end.y + pad,
    };
    const moving = this.#dragging !== undefined;
    // The bar keeps to the part of the stage in sight: the container may scroll the stage's top or
    // bottom out of it, under the statement or past the window.
    const seen = { top: screen.shown.top - screen.top, bottom: screen.shown.bottom - screen.top };
    this.#selection.box(onSheet, screen, seen, moving, resizing?.factor);
  }

  /** A stroke moved by the drag's offset, as the drag shows it: made once for each offset. */
  #movedOf(stroke: Stroke, [dx, dy]: readonly [number, number]): Stroke {
    const dragging = this.#dragging;
    const kept = dragging?.moved.get(stroke.id);
    if (kept !== undefined) return kept;
    const moved: Stroke = {
      ...stroke,
      points: stroke.points.map((point) => ({ ...point, x: point.x + dx, y: point.y + dy })),
    };
    dragging?.moved.set(stroke.id, moved);
    return moved;
  }

  /**
   * Where the canvas no longer shows the strokes dragged as they are now: around each where the
   * last frame painted it and where it is now. None without a drag, or where it has not moved.
   */
  #draggedChanged(frame: Frame): Pixels | undefined {
    const dragging = this.#dragging;
    if (dragging === undefined) return undefined;
    const [was, now] = [dragging.painted, dragging.offset];
    if (was[0] === now[0] && was[1] === now[1]) return undefined;
    let at: Pixels | undefined;
    for (const stroke of this.#work.strokes) {
      if (!dragging.ids.has(stroke.id)) continue;
      const traced = this.#work.onTracing(stroke.id);
      // A stroke's outline moves with its points, so its box moves as far.
      const ink = this.#finished(stroke);
      for (const [dx, dy] of [was, now]) {
        const box = {
          minX: ink.left + dx,
          minY: ink.top + dy,
          maxX: ink.right + dx,
          maxY: ink.bottom + dy,
        };
        at = union(at, this.#pixelsOf(frame, traced, box));
      }
    }
    dragging.painted = now;
    return at;
  }

  /** A stroke scaled by the grip's drag, as it shows it: made once for each factor. */
  #scaledOf(stroke: Stroke, resizing: Resizing): Stroke {
    const kept = resizing.scaled.get(stroke.id);
    if (kept !== undefined) return kept;
    const scaled = scaledStroke(stroke, resizing, stroke.id);
    resizing.scaled.set(stroke.id, scaled);
    return scaled;
  }

  /**
   * Where the canvas no longer shows the strokes a grip scales as they are now: around each as the
   * last frame painted it and as it is now. None without a scale, or where it has not changed.
   */
  #resizedChanged(frame: Frame): Pixels | undefined {
    const resizing = this.#resizing;
    if (resizing === undefined || resizing.painted === resizing.factor) return undefined;
    const [ax, ay] = resizing.at;
    let at: Pixels | undefined;
    for (const stroke of this.#work.strokes) {
      if (!resizing.ids.has(stroke.id)) continue;
      const traced = this.#work.onTracing(stroke.id);
      // A stroke's outline scales with its points and its width, which rounds to a tenth: a unit
      // round it holds what the rounding adds.
      const ink = this.#finished(stroke);
      for (const f of [resizing.painted, resizing.factor]) {
        const box = {
          minX: ax + (ink.left - ax) * f - 1,
          minY: ay + (ink.top - ay) * f - 1,
          maxX: ax + (ink.right - ax) * f + 1,
          maxY: ay + (ink.bottom - ay) * f + 1,
        };
        at = union(at, this.#pixelsOf(frame, traced, box));
      }
    }
    resizing.painted = resizing.factor;
    return at;
  }

  /** A context a consumer gives back for the tutor's act, checked: a task from paper's, on one. */
  #paperContextOf(submission: unknown): DrawingContext {
    if (this.#paper === undefined) {
      throw new TypeError(`<${TAG}> shows no task from paper: the tutor acts on one alone`);
    }
    return drawingContextOf(submission, "submission");
  }

  /**
   * The drawing of the tutor's strokes begins, by their lengths on the sheet — `by` the tracing
   * paper's scale, for those on it: none for none, or with reduced motion, or off the page.
   */
  #startDrawing(
    strokes: readonly { readonly id: number; readonly points: readonly Point[] }[],
    by: number,
  ): Promise<void> {
    if (strokes.length === 0 || !this.isConnected || matchMedia(REDUCED_MOTION).matches) {
      return Promise.resolve();
    }
    const timings = timingsOf(strokes.map(({ points }) => lengthOf(points) * by));
    const end = timings.at(-1)?.end ?? 0;
    return new Promise((resolve) => {
      this.#drawing = {
        timings: new Map(strokes.map(({ id }, k) => [id, timings[k] as Timing])),
        start: performance.now(),
        end,
        parts: new Map(),
        painted: new Map(),
        fresh: true,
        done: resolve,
        timer: setTimeout(() => this.#endDrawing(), end + DRAWING_SLACK),
      };
    });
  }

  /**
   * The drawing of the tutor's act ends, and whoever waits hears: what the last frame did not
   * paint whole of it, the next paints at once.
   */
  #endDrawing(): void {
    const drawing = this.#drawing;
    if (drawing === undefined) return;
    this.#drawing = undefined;
    clearTimeout(drawing.timer);
    const byId = this.#byId();
    const whole = [...drawing.timings.keys()].every((id) => {
      const stroke = byId.get(id);
      return stroke === undefined || drawing.painted.get(id) === stroke;
    });
    if (!whole) {
      this.#painted = undefined;
      this.#underHolds = undefined;
      this.#request();
    }
    drawing.done();
  }

  /**
   * The part of a stroke of the tutor's act the frame draws, by the frame's time: none before its
   * start, the stroke whole after its end, the same object for the same share.
   */
  #partOf(stroke: Stroke, drawing: Drawing): Stroke | undefined {
    const timing = drawing.timings.get(stroke.id);
    if (timing === undefined) return stroke;
    const elapsed = this.#drawingNow - drawing.start;
    const span = timing.end - timing.start;
    const share =
      elapsed >= timing.end ? 1 : span <= 0 ? 0 : Math.max(0, (elapsed - timing.start) / span);
    const kept = drawing.parts.get(stroke.id);
    if (kept?.share === share) return kept.stroke;
    const part = share <= 0 ? undefined : drawnPart(stroke, share);
    drawing.parts.set(stroke.id, { share, stroke: part });
    return part;
  }

  /**
   * Where the canvas no longer shows the tutor's act as the frame draws it: around each part the
   * last frame painted and the part this one draws, of the strokes that went on since. None
   * without a drawing, or where nothing went on.
   */
  #drawingChanged(frame: Frame): Pixels | undefined {
    const drawing = this.#drawing;
    if (drawing === undefined) return undefined;
    const byId = this.#byId();
    let at: Pixels | undefined;
    for (const id of drawing.timings.keys()) {
      const stroke = byId.get(id);
      if (stroke === undefined) continue;
      const was = drawing.painted.get(id);
      const now = this.#partOf(stroke, drawing);
      if (was === now) continue;
      const traced = this.#work.onTracing(id);
      for (const part of [was, now]) {
        if (part !== undefined) at = union(at, this.#pixelsOf(frame, traced, this.#finished(part)));
      }
    }
    return at;
  }

  /**
   * The frame has painted the tutor's act as it draws it: so the next one knows, and once every
   * stroke is whole the drawing ends; till then the next frame comes.
   */
  #drawingPainted(): void {
    const drawing = this.#drawing;
    if (drawing === undefined) return;
    drawing.fresh = false;
    const byId = this.#byId();
    for (const id of drawing.timings.keys()) {
      const stroke = byId.get(id);
      drawing.painted.set(id, stroke === undefined ? undefined : this.#partOf(stroke, drawing));
    }
    if (this.#drawingNow - drawing.start >= drawing.end) this.#endDrawing();
    else this.#request();
  }

  /**
   * What the drawing holds and has cost, a new frozen reading each time, for app's debug view: the
   * strokes and their points, the frames painted and those that painted all in sight, the strokes
   * filled, the last frame, the times of the last frames and the canvases held. Counted as the
   * element paints anyway: a frame adds two readings of the clock and a slot of the ring.
   */
  get paintStats(): PaintStats {
    let points = 0;
    for (const stroke of this.#work.strokes) points += stroke.points.length;
    const kept = Math.min(this.#paintsKept, PAINT_MS);
    const paintMs: number[] = [];
    for (let i = this.#paintsKept - kept; i < this.#paintsKept; i++) {
      paintMs.push(this.#paintMs[i % PAINT_MS] ?? 0);
    }
    const buffers = [this.#canvas, this.#under]
      .filter((canvas) => canvas.width > 0 && canvas.height > 0)
      .map(({ width, height }) => Object.freeze({ width, height }));
    return Object.freeze({
      strokes: this.#work.strokes.length,
      points,
      frames: this.#frames,
      fullRepaints: this.#fullRepaints,
      fills: this.#fills,
      last:
        this.#frames === 0
          ? undefined
          : Object.freeze({ fills: this.#lastFills, area: this.#lastArea, ms: this.#lastMs }),
      paintMs: Object.freeze(paintMs),
      buffers: Object.freeze(buffers),
    });
  }

  /**
   * While true, each rectangle a frame paints shows red over the sheet and fades, on a canvas of
   * its own that takes no pointer and no export reads: for app's debug view. Anything but a boolean
   * is a TypeError.
   */
  get paintFlash(): boolean {
    return this.#flash !== undefined;
  }

  set paintFlash(on: boolean) {
    if (typeof on !== "boolean") throw new TypeError(`<${TAG}>.paintFlash is a boolean`);
    if (on === (this.#flash !== undefined)) return;
    if (on) {
      this.#flash = new Flash();
      this.#canvas.after(this.#flash.canvas);
      return;
    }
    this.#flash?.stop();
    this.#flash?.canvas.remove();
    this.#flash = undefined;
  }

  /**
   * The picture of the work, for the `picture` of a stored work that app puts on the server, a
   * method of the agreement with app: the PNG of the strokes the surface shows,
   * with no condition — the sheet's page, or the workbook's whole page with its draft, and the ink
   * past the page, right and down, with the tracing paper where it lies —, whatever is filled and
   * whether the work was sent to be checked or not; an empty surface, and a worked example's, is
   * white. The strokes are those `exportWork()` takes, as the history has them: not the stroke
   * under way, but those under an eraser not yet lifted. Each is the outline the screen fills, on
   * white with no theme and no template, in its style — its own colour, the palette's black too,
   * at its opacity, a marker multiplied —, and a stroke without one black; on a task from paper
   * the strokes of both layers, the tracing paper's where it lies, hidden or not, with the crop's
   * picture laid in grey and multiplied. While every stroke is grey — black, and the palette's
   * black, a hair off grey, among them —, the pixels
   * are grey, a byte each, one pixel a unit, 1000 × 1400 for the page alone, and scaled down past
   * the page to hold no more pixels than it; with a colour among them they are RGB, three bytes
   * each, and scaled down to hold no more bytes. Its size is in its PNG's header. The pixels go
   * through the crop's encoder: so the picture looks as the sheet does, and holds at most
   * 1,576,640 bytes, for the encoder spends at most 9 bits on a byte of a row, under the 4 MiB of a
   * stored work.
   */
  async exportPicture(): Promise<Blob> {
    const tracing = this.#tracing;
    const work = this.#work;
    const strokes = work.strokes;
    const channels = strokes.every(({ style }) => style === undefined || isGrey(style.color))
      ? 1
      : 3;
    // A pixel a unit, the ink as wide as on a screen of a pixel a unit, while the page and the ink
    // past it hold no more bytes than the page in grey; scaled down to hold them past that.
    const reach = this.#inkReach();
    // A stroke of the tracing paper reaches as far as the paper's scale draws it.
    const by = tracing === undefined ? 1 : scaleIn(tracing);
    const past = strokes.reduce(
      (most, stroke) => Math.max(most, reachOf(stroke) * (work.onTracing(stroke.id) ? by : 1)),
      0,
    );
    const { width, height, scale } = pictureOf(
      { maxX: reach.maxX + past, maxY: reach.maxY + past },
      channels,
    );
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (context === null) throw new Error(`<${TAG}> got no 2D context to draw its picture on`);
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    for (const stroke of strokes) {
      const traced = tracing !== undefined && work.onTracing(stroke.id);
      const [x, y] = traced ? tracing.at : [0, 0];
      // A stroke of the tracing paper is as large as the paper's scale draws it.
      const by = traced ? scale * scaleIn(tracing) : scale;
      context.setTransform(by, 0, 0, by, x * scale, y * scale);
      const { style } = stroke;
      context.fillStyle = style?.color ?? "#000";
      context.globalAlpha = style === undefined ? 1 : style.opacity / 100;
      context.globalCompositeOperation = style?.pen === "marker" ? "multiply" : "source-over";
      context.fill(this.#finished(stroke).path);
    }
    const { data } = context.getImageData(0, 0, width, height);
    // The canvas's memory goes at once, not at a collection: WebKit caps what all canvases hold.
    canvas.width = 0;
    canvas.height = 0;
    // On opaque white, grey ink leaves a pixel's red its grey. Every index is within the pixels'
    // four bytes a pixel, so none reads past them.
    const pixels = new Uint8Array(channels * width * height);
    for (let at = 0; at < width * height; at++) {
      for (let c = 0; c < channels; c++) pixels[channels * at + c] = data[4 * at + c] as number;
    }
    // A task from paper's crop lies over it where the tracing paper lies, shown or hidden, at the
    // picture's scale, as the crop of the work has it.
    if (tracing !== undefined) {
      const { size, gray: picture } = await this.#tracingPaper.read;
      if (picture !== null) {
        const rect = tracingRect(tracing.at, scaled(size, scaleIn(tracing)));
        const place = {
          left: rect.minX * scale,
          top: rect.minY * scale,
          right: rect.maxX * scale,
          bottom: rect.maxY * scale,
        };
        layOver(pixels, width, picture, place, channels);
      }
    }
    return blobOf(encodePNG(pixels, width, height, channels));
  }

  disconnectedCallback(): void {
    // A stroke or an erasing under way ends where it is: its pointerup will not reach a sheet off
    // the page. Its historychange reaches only the element's own listeners, for the element is in
    // no tree now.
    this.#recorder.end();
    this.#eraser.end();
    this.#endDrawing();
    this.#hands.reset();
    this.#latch = undefined;
    this.#latchAcross = undefined;
    this.#unwatchPen?.();
    this.#unwatchPen = undefined;
    this.#unwatchZoom?.();
    this.#unwatchZoom = undefined;
    this.#endPan();
    this.#page.disconnect();
    this.#ported.disconnect();
    this.#port = null;
    this.#tools.disconnect();
    window.removeEventListener("resize", this.#resized);
    window.removeEventListener("resize", this.#rewindowed);
    // A stroke that ended here may be the one the other rows of the page waited for.
    PEN_MODE.settle();
    this.#pictures.disconnect();
    this.#tracingPaper.disconnect();
    this.#resize.disconnect();
    this.#unwatchDensity?.();
    this.#unwatchDensity = undefined;
    this.#unwatchColours?.();
    this.#unwatchColours = undefined;
    cancelAnimationFrame(this.#frame);
    this.#frame = 0;
    this.#flash?.stop();
    // WebKit caps what all the page's canvases hold: the buffers go at once, not at a collection.
    this.#under.width = 0;
    this.#under.height = 0;
    this.#underHolds = undefined;
    this.#painted = undefined;
    this.#liveAt = undefined;
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
      | "paper"
      | "demoState"
      | "tracing"
      | "grid"
      | "manifest"
      | "media"
      | "history"
      | "marks"
      | "pens",
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
   * A task's template, or a worked example's, in place of the last. The layer and the
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
    if (!sameLayer(template, shown) || !sameStatement(template, shown)) this.#tools.pens.close();
    if (!sameLayer(template, shown)) {
      this.#lay(template);
      // A page of other boxes, or of the other kind, puts the marks back or takes them off.
      this.#replace();
    } else if (this.#laid === undefined) {
      // The same grid may ask another answer: the sheet's strokes, or choices that app marks.
      this.#fill();
    }
    if (!sameStatement(template, shown)) this.#statement.show(template.statement);
    const parts = [...template.statement, ...(this.#example?.demo ?? [])];
    this.#pictures.name(parts.flatMap((part) => ("picture" in part ? [part.picture] : [])));
    if (!this.#allows(this.#tool)) this.#tool = "pen";
    this.#regrow();
    this.#refresh();
  }

  /** Whether the sheet shown has a tool: the task's, and the hand on every sheet written on. */
  #allows(tool: Tool): boolean {
    if (tool === HAND || tool === SELECT) return this.#example === undefined;
    return this.#shownTemplate.tools.includes(tool);
  }

  /**
   * Whether the element may show a worked example now: not while it shows a task, not on a
   * sheet the learner has written on, and not while a stroke or an erasing is under way, which
   * would land on a sheet that takes none. A TypeError says which.
   */
  #mayShowExample(): void {
    if (this.#paper !== undefined) {
      throw new TypeError(
        `<${TAG}> shows a task from paper: a worked example is shown by a new element, or once the paper is undefined`,
      );
    }
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
   * The template's layer: a sheet's grid, which says nothing to a screen reader, or a
   * workbook's lines, which it reads — a list of the items in the task's order, each its number,
   * its text and its boxes, where the layout puts them.
   */
  #lay(template: Template): void {
    const workbook = isWorkbook(template);
    this.#drawGrid();
    write(this.#template, "aria-hidden", workbook ? null : "true");
    write(this.#template, "role", workbook ? "none" : null);
    this.#lines.replaceChildren(...(workbook ? template.page.items.map(itemOf) : []));
    // A canvas of the other kind fills its answer slots anew: a workbook's are its own arrays, and
    // a sheet's those all sheets share.
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
   * Which answer slots the strokes fill, and whether that changed. A workbook's boxes by the boxes'
   * rule, each stroke's box worked out once: a new array, and the frames marked anew, only if a
   * box changed. A sheet's one answer anywhere on it or the whole sheet by any stroke on it, or
   * nothing for a sheet of choices or with no task.
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
   * Each box of the lines as it now is: its frame, thicker when it is filled, and its
   * name in the labels' language, by the element's `lang` — "Box" alone in its line, numbered by
   * its slot among several, and "filled" when it is. A value a worked example's demo wrote in it is
   * no part of its name: its text after the frame says it, in the lines' language. Only
   * what has changed is written.
   */
  #markBoxes(): void {
    const { lang, labels } = labelsFor(this.getAttribute("lang"));
    for (const [c, rect] of this.#rects.entries()) {
      const cell = this.#cells[c];
      if (cell === undefined) continue;
      const several = (this.#laid?.items[cell.item - 1]?.boxes.length ?? 0) > 1;
      const filled = this.#filled?.[cell.item - 1]?.[cell.slot - 1] === true;
      const name = several ? say(labels.boxAt, { slot: cell.slot }) : labels.box;
      rect.classList.toggle("filled", filled);
      write(rect, "aria-label", filled ? say(labels.filled, { name }) : name);
      write(rect, "lang", lang);
    }
  }

  /**
   * The marks as they were checked when given, back on their strokes after a new history or a new
   * page, if those have their strokes and boxes, or else off, with no event.
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

  /**
   * Every stroke the sheet has known, erased or not, as its history wrote them: the strokes
   * written, the pieces the eraser cut, the tutor's, and those a move or a copy landed.
   */
  #known(): Stroke[] {
    const tracing = this.#tracing;
    return this.#work.history.flatMap((event) => {
      const strokes = writtenBy(event);
      return tracing === undefined
        ? strokes
        : strokes.map((stroke) => this.#onSheet(stroke, tracing));
    });
  }

  /**
   * The marks of a submission, as `marksOf` checked them, that have a place on this sheet, each
   * with its name: a TypeError for a submission that is not this sheet's.
   */
  #places(given: Marks): { readonly name: string; readonly placed: Placed }[] {
    const cells = isWorkbook(this.#shownTemplate) ? this.#cells : null;
    const tracing = this.#tracing;
    const work = this.#work;
    const paper =
      tracing === undefined
        ? undefined
        : {
            at: tracing.at,
            scale: scaleIn(tracing),
            onTracing: (id: number) => work.onTracing(id),
          };
    const places = placesOf(given, this.#known(), cells, undefined, paper);
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
          sameBox(shown.placed.cell ?? null, placed.cell ?? null) &&
          shown.placed.correct === placed.correct &&
          shown.placed.wavy === placed.wavy &&
          (placed.correct === undefined || sameBox(shown.placed.box, placed.box)) &&
          (!placed.wavy || sameBox(shown.placed.box, placed.box))
        );
      });
    if (same) return;
    for (const { node } of this.#shown) node.remove();
    this.#shown = marks.map(({ name, placed }) => {
      const node =
        placed.correct !== undefined
          ? verdictNode(placed.correct)
          : placed.wavy
            ? wavyNode()
            : frameNode();
      node.setAttribute("role", "img");
      node.setAttribute("aria-label", name);
      node.setAttribute("display", "none");
      this.#marksLayer.append(node);
      return { name, placed, node, frame: null, under: false, drawn: "none" };
    });
    this.#request();
  }

  /**
   * One pointer at a time writes or erases, as the hands let it: a pen, a finger out of
   * pen mode, or a mouse. The primary button does what the tool says, and a pen's eraser
   * erases — if the task allows the eraser: without it, the pen's eraser does nothing, for the
   * recorder takes the primary button alone.
   */
  #down(event: PointerEvent): void {
    // A press on the sheet closes a popover of the pen or the eraser, and writes or erases as well.
    this.#tools.pens.close();
    this.#unhover();
    // A worked example's sheet takes no input: the canvas takes no pointer then, and an event
    // that a script sends it does nothing either, nor puts the page in pen mode.
    if (this.#example !== undefined) return;
    // A pointer that comes down again lost its way up: what it was writing or erasing ends where it
    // was, as on a lost capture.
    this.#recorder.end(event.pointerId);
    this.#eraser.end(event.pointerId);
    // The hand moves the sheet under a pen, a finger or a mouse alike, and writes nothing: one
    // pointer at a time, and the others do nothing while it moves.
    if (this.#tool === HAND) {
      // A pen that moves the sheet lost its way up when a pen comes down again: a screen has one.
      if (this.#pan?.kind === "pen" && event.pointerType === "pen") this.#endPan();
      if (this.#pan !== undefined) return;
      this.#pan = {
        pointerId: event.pointerId,
        kind: event.pointerType,
        x: event.clientX,
        y: event.clientY,
      };
      this.#latch = undefined;
      this.#latchAcross = undefined;
      this.#sheet.classList.add("panning");
      this.#capture(event.pointerId);
      return;
    }
    const writes = this.#hands.down(contactOf(event));
    // The canvas holds on to every pointer that comes down on it until it lifts, writing or not:
    // its moves and its lift come here, so that a stroke goes on beyond the canvas, two fingers
    // scroll, a palm stays one, and the hands forget no pointer that lifted elsewhere.
    this.#capture(event.pointerId);
    if (!writes) return;
    const screen = this.#view();
    if (screen === undefined) return;
    const onSheetSample = this.#sample(event, screen);
    const erases =
      this.#shownTemplate.tools.includes("eraser") &&
      (this.#tool === "eraser" || onSheetSample.button === ERASER_BUTTON);
    // On a task from paper a press begun on the tracing paper in sight writes or erases on it, its
    // points from its corner; one begun elsewhere, on the sheet.
    const tracing = this.#tracing;
    const size = this.#tracingPaper.size;
    const scale = tracing === undefined ? 1 : scaleIn(tracing);
    const traced =
      tracing !== undefined &&
      !tracing.hidden &&
      this.#tracingPaper.ready &&
      onTracing(onSheetSample, tracing.at, scaled(size, scale));
    // A press on the sheet lets the tracing paper go: its frame and bar of scale leave.
    this.#tracingPaper.letGo();
    const layer = traced ? "tracing" : undefined;
    if (this.#tool === SELECT && !erases) {
      this.#selectDown(event.pointerId, onSheetSample, layer);
      return;
    }
    if (erases) this.#eraseOn = tracing === undefined ? undefined : (layer ?? "sheet");
    else this.#writeOn = layer;
    const sample =
      traced && tracing !== undefined
        ? { ...onSheetSample, ...toTracing(onSheetSample, tracing.at, size, scale) }
        : onSheetSample;
    // On the tracing paper the eraser is as large on the screen, in the paper's own units, and a
    // stroke there keeps its width in them. The work adds how far each stroke's ink reaches past
    // its points.
    const { radius, mode } = this.#eraserOf(screen.k);
    const reach = traced ? radius / scale : radius;
    if (erases) this.#cutting.clear();
    const style = this.#styled ? this.#pens.styles[this.#pens.pen] : undefined;
    const began = erases
      ? this.#eraser.down(sample, reach, mode)
      : this.#recorder.down(sample, style);
    if (began) this.#request();
  }

  /**
   * The eraser's radius on the sheet, in its units, at a scale of the screen, and its mode. One
   * that takes strokes whole reaches as far as its size, and never less on the screen than it
   * always reached; one that takes a part, its size exactly. Without styles, it takes strokes
   * whole, as near as it always took them, whatever the settings.
   */
  #eraserOf(k: number): { readonly radius: number; readonly mode: EraserMode } {
    const least = ERASER_RADIUS_PX / k;
    if (!this.#styled) return { radius: least, mode: "stroke" };
    const half = this.#pens.eraserSize / 2;
    return this.#pens.eraser === "part"
      ? { radius: half, mode: "part" }
      : { radius: Math.max(half, least), mode: "stroke" };
  }

  /**
   * A press of the eraser lifted, with what it came near: in the mode "stroke" it erases those
   * strokes still on the sheet; in the mode "part" each of them its path crossed goes, and its
   * pieces come in its place, in one cut, numbered in the sheet's order and along each stroke. A
   * stroke it came near but did not cross stays as it is, and with none crossed nothing is done.
   */
  #erased(ids: readonly number[], time: number, erasure: Erasure): void {
    this.#cutting.clear();
    if (erasure.mode === "stroke") {
      if (this.#work.erase(ids, time)) this.#changed();
      return;
    }
    const hit = new Set(ids);
    const crossed: { readonly stroke: Stroke; readonly pieces: InkPoint[][] }[] = [];
    for (const stroke of this.#work.strokes) {
      if (!hit.has(stroke.id)) continue;
      const pieces = cutOf(stroke, erasure.path, erasure.reach + reachOf(stroke));
      if (pieces !== null) crossed.push({ stroke, pieces });
    }
    if (crossed.length === 0) {
      this.#request();
      return;
    }
    let id = this.#recorder.reserve(
      crossed.reduce((count, { pieces }) => count + pieces.length, 0),
    );
    const cuts: Cutting[] = crossed.map(({ stroke, pieces }) => ({
      id: stroke.id,
      pieces: pieces.map((points) => pieceOf(stroke, id++, points)),
    }));
    if (this.#work.cut(cuts, time)) this.#changed();
  }

  /**
   * What the eraser that takes a part, still down, leaves of a stroke it came near, for the
   * screen: its cut fed the path's places it has not had yet, and the pieces anew when they
   * changed — the stroke whole while the path has not crossed it.
   */
  #piecesOf(stroke: Stroke, erasure: Erasure): readonly Stroke[] {
    let entry = this.#cutting.get(stroke.id);
    if (entry === undefined || entry.cut.stroke !== stroke) {
      entry = { cut: new Cut(stroke, erasure.reach + reachOf(stroke)), fed: 0, pieces: [stroke] };
      this.#cutting.set(stroke.id, entry);
    }
    const { path } = erasure;
    let more = false;
    for (; entry.fed < path.length; entry.fed++) {
      const to = path[entry.fed] as Point;
      more = entry.cut.add(path[entry.fed - 1] ?? to, to) || more;
    }
    if (more) {
      const pieces = entry.cut.pieces();
      entry.pieces =
        pieces === null ? [stroke] : pieces.map((points) => pieceOf(stroke, stroke.id, points));
    }
    return entry.pieces;
  }

  /**
   * The learner made a choice in a popover of the pen or the eraser: the settings are those now,
   * and whoever listens hears of them, unless they are the same. A consumer that gives the
   * settings follows them.
   */
  #choosePens(settings: PenSettings): void {
    if (samePens(settings, this.#pens)) return;
    this.#pens = settings;
    this.#refresh();
    this.dispatchEvent(
      new CustomEvent(PEN_CHANGE, { bubbles: true, composed: true, detail: settings }),
    );
  }

  /**
   * A pen hovering over the sheet, its buttons up, as Apple Pencil Pro does, shows a circle at its
   * point: the pen's as wide as the line of the kind in use, in its colour, a little seen through
   * at the least, and the eraser's as large as it erases. None with the hand, without styles, on a
   * worked example, or with any other pointer.
   */
  #hoverAt(event: PointerEvent): void {
    const screen = this.#view();
    const eraser = this.#tool === "eraser";
    if (
      event.buttons !== 0 ||
      !this.#styled ||
      this.#example !== undefined ||
      this.#tool === HAND ||
      screen === undefined
    ) {
      this.#unhover();
      return;
    }
    // CSS pixels of the stage to a client pixel, under whatever transform the page puts on it.
    const by = this.#canvas.offsetWidth > 0 ? screen.width / this.#canvas.offsetWidth : 1;
    const style = this.#pens.styles[this.#pens.pen];
    const size = eraser
      ? 2 * this.#eraserOf(screen.k).radius * screen.k
      : Math.max(4 * by, style.width * screen.k);
    const hover = this.#hover;
    hover.classList.toggle("erasing", eraser);
    hover.style.setProperty("--hover-x", `${(event.clientX - screen.left) / by}px`);
    hover.style.setProperty("--hover-y", `${(event.clientY - screen.top) / by}px`);
    hover.style.setProperty("--hover-size", `${size / by}px`);
    if (eraser) {
      hover.style.removeProperty("--hover-colour");
      hover.style.removeProperty("--hover-opacity");
    } else {
      const colour = screenColourOf(style, this.#canvasStyle.color, this.#forced);
      hover.style.setProperty("--hover-colour", colour);
      hover.style.setProperty("--hover-opacity", String(Math.max(0.35, style.opacity / 100)));
    }
    hover.hidden = false;
  }

  /** The hovering pen's circle goes: the pen came down, or left the sheet. */
  #unhover(): void {
    this.#hover.hidden = true;
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
    if (event.pointerType === "pen") this.#hoverAt(event);
    // The sheet goes with the hand, as with two fingers.
    const pan = this.#pan;
    if (pan !== undefined && pan.pointerId === event.pointerId) {
      this.#scroll(event.clientX - pan.x, event.clientY - pan.y, false);
      this.#pan = { ...pan, x: event.clientX, y: event.clientY };
      this.#flush();
      return;
    }
    // Select's shape, or a drag of what it took, follows its pointer.
    if (
      this.#selecting?.pointerId === event.pointerId ||
      this.#dragging?.pointerId === event.pointerId
    ) {
      for (const each of coalesced(event)) this.#hands.move(contactOf(each));
      this.#selectMove(event);
      return;
    }
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
      const sample = this.#sample(each, screen, this.#layerOf(input));
      const moved =
        input === this.#eraser ? input.move(sample, inSight(each, screen)) : input.move(sample);
      changed = moved || changed;
    }
    this.#flush();
    if (changed) this.#request();
  }

  #up(event: PointerEvent): void {
    this.#selectUp(event);
    const input = this.#inputOf(event.pointerId);
    if (input !== undefined) {
      const screen = this.#view();
      const layer = this.#layerOf(input);
      if (screen === undefined) input.end(event.pointerId);
      else if (input === this.#eraser)
        input.up(this.#sample(event, screen, layer), inSight(event, screen));
      else input.up(this.#sample(event, screen, layer));
    }
    this.#lifted(event.pointerId);
  }

  /**
   * A pointer lifted, or the device or the page took it from the sheet: the hands forget it, and a
   * gesture that ended, or the hand's move, lets go of what it scrolled.
   */
  #lifted(pointerId: number): void {
    if (this.#pan?.pointerId === pointerId) this.#endPan();
    this.#hands.lift(pointerId);
    if (!this.#hands.scrolling) {
      this.#latch = undefined;
      this.#latchAcross = undefined;
    }
    this.#refresh();
    PEN_MODE.settle();
  }

  /** The hand's move ends, and lets go of what it scrolled. */
  #endPan(): void {
    if (this.#pan === undefined) return;
    this.#pan = undefined;
    this.#sheet.classList.remove("panning");
    this.#latch = undefined;
    this.#latchAcross = undefined;
  }

  /** The pointer that writes or erases now, if one does: the recorder's or the eraser's. */
  #writer(): number | undefined {
    return this.#recorder.pointer ?? this.#eraser.pointer;
  }

  /** A pointer's stroke or erasing goes, as on `pointercancel`, and the sheet is drawn anew. */
  #drop(pointerId: number): void {
    if (this.#selecting?.pointerId === pointerId || this.#dragging?.pointerId === pointerId) {
      this.#selecting = undefined;
      this.#dragging = undefined;
      this.#painted = undefined;
      this.#request();
    }
    if (this.#recorder.cancel(pointerId) || this.#eraser.cancel(pointerId)) {
      this.#cutting.clear();
      this.#request();
    }
  }

  /** The input a pointer drives: the recorder while it writes, the eraser while it erases. */
  #inputOf(pointerId: number): Recorder | Eraser | undefined {
    if (this.#recorder.pointer === pointerId) return this.#recorder;
    if (this.#eraser.pointer === pointerId) return this.#eraser;
    return undefined;
  }

  /** The layer a pointer's stroke or erasing is on: the tracing paper's, or the sheet's. */
  #layerOf(input: Recorder | Eraser): "tracing" | undefined {
    const on = input === this.#eraser ? this.#eraseOn : this.#writeOn;
    return on === "tracing" ? "tracing" : undefined;
  }

  /**
   * A pointer's place on the sheet, or on the tracing paper, `layer`, from its corner and kept to
   * it.
   */
  #sample(event: PointerEvent, screen: Screen, layer?: "tracing"): PointerSample {
    const point = toSheet(screen, event.clientX - screen.left, event.clientY - screen.top);
    const tracing = this.#tracing;
    const { x, y } =
      layer === "tracing" && tracing !== undefined
        ? toTracing(point, tracing.at, this.#tracingPaper.size, scaleIn(tracing))
        : point;
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
   * goes on below the container's bottom. The bar of buttons over the sheet takes what is under it
   * itself: a pointer there presses a button, and writes nothing.
   */
  #view(): Screen | undefined {
    const canvas = this.#canvas.getBoundingClientRect();
    const sheet = this.#sheet.getBoundingClientRect();
    if (canvas.width <= 0 || sheet.width <= 0) return undefined;
    const k = scaleFor(sheet.width, this.#extent.width);
    const vx = (canvas.left - sheet.left) / k;
    const vy = (canvas.top - sheet.top) / k;
    const port = clientBoxOf(this.#viewport);
    const shown = {
      left: Math.max(canvas.left, port.left),
      top: Math.max(canvas.top, port.top),
      right: Math.min(canvas.right, port.right),
      bottom: Math.min(canvas.bottom, port.bottom),
    };
    const { left, top, width, height } = canvas;
    return { k, vx, vy, left, top, width, height, shown };
  }

  /**
   * The sheet's top in the container's content, in CSS pixels as laid out: under the statement —
   * or, along `x`, its left.
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
   * it, and to its left so.
   */
  #scrolled(): void {
    if (this.#k > 0) {
      this.#vy = Math.max(0, this.#viewport.scrollTop - this.#sheetAt) / this.#k;
      this.#vx = Math.max(0, this.#viewport.scrollLeft - this.#sheetAtX) / this.#k;
    }
    this.#request();
  }

  /**
   * The statement and a demo's parts keep the element's own direction while the container runs
   * left to right: the direction the element computes, by an attribute or by a style, as the last
   * layout read it.
   */
  #keepDirection(): void {
    if (!this.isConnected) return;
    const direction = getComputedStyle(this).direction;
    if (this.#column.style.getPropertyValue("--direction") !== direction) {
      this.#column.style.setProperty("--direction", direction);
    }
  }

  /**
   * What the rail's CSS cannot know: the height of what it sticks in — the scroller's, which
   * it watches, or the window's —, from whose top it runs down to its bottom, below the consumer's
   * --novatrail-canvas-top; and the element's width, which a worked example's row keeps within, as
   * the rail is as wide as nothing. A band in pixels is taken as it changes; one in percent, of the
   * scroller's height as `top` takes it and not of the element's as `height` would, and `auto`,
   * nothing as `#band` counts it, are taken here, at the next resize.
   */
  #fit(): void {
    const rail = this.#tools.rail;
    if (!this.isConnected || rail.hidden) return;
    const band = getComputedStyle(this).getPropertyValue("--novatrail-canvas-top").trim();
    rail.style.removeProperty("--rail-top");
    if (band === "auto") rail.style.setProperty("--rail-top", "0px");
    // A sticky box's `top` reads as the pixels it is used at.
    else if (band.includes("%")) rail.style.setProperty("--rail-top", getComputedStyle(rail).top);
    const room = roomOf(rail);
    if (room.port !== this.#port) {
      if (this.#port !== null) this.#ported.unobserve(this.#port);
      this.#port = room.port;
      if (room.port !== null) this.#ported.observe(room.port);
    }
    rail.style.setProperty("--rail-room", `${room.height / scaleOf(rail)}px`);
    rail.style.setProperty("--rail-width", `${this.#wrapper.clientWidth}px`);
  }

  /**
   * Where the consumer's band over the top of what the bar's rail sticks in ends, down the screen:
   * its offset, --novatrail-canvas-top, below the top of the scroller or of the window — for a
   * target that is or lies within what the rail sticks in, and above everything for any other.
   */
  #band(target: Element | Window | undefined): number {
    const room = roomOf(this.#tools.rail);
    // The band stands over the top of what the rail sticks in, and so over a scroller within it,
    // but not over the page's when the rail sticks in a scroller of its own.
    const within =
      room.port === null
        ? target !== undefined
        : target instanceof Element && (target === room.port || holds(room.port, target));
    return within ? room.top + room.offset : Number.NEGATIVE_INFINITY;
  }

  /**
   * Two fingers, or the hand, moved right on the screen by `dx` CSS pixels and down it by `dy`,
   * and what they scroll goes with them. The gesture's first step down chooses what it
   * scrolls down, for the whole gesture, and its first step across what it scrolls across: the
   * sheet's own container if it can go that way, or else the nearest ancestor of the element that
   * scrolls and can, or else the page. A container at its end hands the scroll on at the next
   * gesture, not within this one. The steps of an event add up, and its end scrolls them at once.
   */
  #scroll(dx: number, dy: number, fresh: boolean): void {
    if (fresh) {
      this.#latch = undefined;
      this.#latchAcross = undefined;
    }
    // The content goes with the fingers: down the screen, the scroll goes back.
    if (dy !== 0 && this.#latch === undefined) this.#latch = this.#scrollerFor(dy < 0) ?? null;
    if (dx !== 0 && this.#latchAcross === undefined) {
      this.#latchAcross = this.#scrollerFor(dx < 0, "x") ?? null;
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
   * it or back left.
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
    // A page that hides its overflow, as one under a modal does, a finger would not scroll: nor do
    // two.
    if (overflow === "hidden" || overflow === "clip") return undefined;
    const page = document.scrollingElement;
    if (page === null || !scrollsOn(page, onward, axis)) return undefined;
    return { target: window, scale: 1, rest: 0 };
  }

  /**
   * The stage takes the visible part of the sheet, and the canvas a pixel of its buffer for each
   * device pixel: its size on the screen times the density. The layers follow in the same
   * frame. However far the sheet goes, the canvas is no larger than the container.
   */
  #layout(): void {
    // The content of a new size, or the container, may overflow it now, or no more.
    this.#region();
    const area = this.#area;
    if (area === undefined || area.width === 0) return;
    // The page is as wide as the container up to the cap, times the zoom, the column as wide as the
    // sheet goes, by the style, and the stage as tall and as wide as the visible part of the sheet.
    const k = fitScale(area.width) * this.#zoom;
    const extent = this.#extent;
    this.#stage.style.width = `${Math.min(area.width, extent.width * k)}px`;
    this.#stage.style.height = `${Math.min(area.height, extent.height * k)}px`;
    const sheetAt = this.#sheetEdge("y");
    const sheetAtX = this.#sheetEdge("x");
    // A new width scales the sheet, and a statement of a new height moves it: the top left
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
    // The sheet sized anew may overflow the container now, or no more.
    this.#region();
  }

  /**
   * How far the sheet goes: past the page, the ink and the tracing paper where it lies, by
   * one view of the window more across and two down, at the window's own fit times the zoom,
   * within the reach. A worked example's sheet is its page alone. The window's view and not the
   * container's: the sheet is sized by its style, and a size that the container's observer gave
   * would resize the container again while the observer reports it, which the browser tells the
   * window as a loop. A zoom below the fit counts by its quarter below, so that a pinch lays the
   * sheet out anew only as it crosses one, and above the fit as the fit: the view is smaller then.
   */
  #reach(): Size {
    if (this.#example !== undefined) return SHEET;
    const quarter = Math.max(ZOOM_MIN, Math.floor(this.#zoom / ZOOM_STEP + 1e-6) * ZOOM_STEP);
    const k = fitScale(innerWidth) * Math.min(1, quarter);
    return extentOf(this.#inkReach(), { width: innerWidth / k, height: (2 * innerHeight) / k });
  }

  /** The right and the bottom of the sheet's ink and of the tracing paper, which counts whole. */
  #inkReach(): { maxX: number; maxY: number } {
    let maxX = 0;
    let maxY = 0;
    const tracing = this.#tracing;
    for (const stroke of this.#work.strokes) {
      // The tracing paper's strokes stay on it, and it counts whole.
      if (tracing !== undefined && this.#work.onTracing(stroke.id)) continue;
      for (const { x, y } of stroke.points) {
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
    if (tracing !== undefined) {
      const rect = tracingRect(tracing.at, scaled(this.#tracingPaper.size, scaleIn(tracing)));
      maxX = Math.max(maxX, rect.maxX);
      maxY = Math.max(maxY, rect.maxY);
    }
    return { maxX, maxY };
  }

  /**
   * The ink, the tracing paper or the window went past the sheet's extent, or back: the sheet is
   * sized anew by its style — the column as wide as the page's fit times the extent's share of the
   * page, and the sheet in the extent's proportions —, and laid out.
   */
  #regrow(): void {
    const zoom = this.#example === undefined ? PAGE_ZOOM.value : 1;
    const zoomed = zoom !== this.#zoom;
    if (zoomed) {
      this.#zoom = zoom;
      this.#column.style.setProperty("--zoom", String(zoom));
    }
    const extent = this.#reach();
    const grown = extent.width !== this.#extent.width || extent.height !== this.#extent.height;
    if (!zoomed && !grown) return;
    if (grown) {
      this.#extent = extent;
      this.#column.style.setProperty("--across", String(extent.width / SHEET.width));
      this.#sheet.style.aspectRatio = `${extent.width} / ${extent.height}`;
      this.#drawGrid();
    }
    this.#layout();
  }

  /**
   * Zoom in or Zoom out was pressed: the page's zoom goes a quarter larger or smaller, and
   * every sheet of the page is laid out by it — but not while a pointer writes or erases on one of
   * them, for nothing moves under it.
   */
  #zoomBy(larger: boolean): void {
    if (!PEN_MODE.writing) PAGE_ZOOM.step(larger);
  }

  /** Two fingers pinched by `ratio` about `x` and `y` on the screen: the page's zoom goes by it. */
  #pinch(ratio: number, x: number, y: number): void {
    if (this.#example !== undefined) return;
    this.#anchor = { x, y };
    try {
      PAGE_ZOOM.set(PAGE_ZOOM.value * ratio);
    } finally {
      this.#anchor = undefined;
    }
  }

  /**
   * The page's zoom has changed: the sheet is laid out by it at once, the point of the sheet
   * under a pinch's middle, or else the one the last press held, or else under the middle of the
   * part in sight, standing where it was on the screen, and the bar shows what the zoom can do now.
   */
  #zoomed(): void {
    const before = this.isConnected ? this.#view() : undefined;
    const k = this.#k;
    this.#regrow();
    if (before !== undefined && this.#k !== k && this.#k > 0) {
      const { shown } = before;
      const held =
        this.#anchor === undefined && this.#held?.box === this.#heldBox() ? this.#held : undefined;
      const x = this.#anchor?.x ?? held?.x ?? (shown.left + shown.right) / 2;
      const y = this.#anchor?.y ?? held?.y ?? (shown.top + shown.bottom) / 2;
      const at = held?.at ?? {
        x: (x - before.left) / before.k + before.vx,
        y: (y - before.top) / before.k + before.vy,
      };
      const port = clientBoxOf(this.#viewport);
      this.#viewport.scrollLeft = this.#sheetAtX + at.x * this.#k - (x - port.left) / port.across;
      this.#viewport.scrollTop = this.#sheetAt + at.y * this.#k - (y - port.top) / port.down;
      this.#scrolled();
      this.#held = this.#anchor === undefined ? { at, x, y, box: this.#heldBox() } : undefined;
    }
    this.#refresh();
  }

  /** Where the container stands on the screen and how far it is scrolled, as a press leaves it. */
  #heldBox(): string {
    const { left, top, right, bottom } = this.#viewport.getBoundingClientRect();
    const { scrollLeft, scrollTop } = this.#viewport;
    return [left, top, right, bottom, scrollLeft, scrollTop].join(" ");
  }

  /**
   * The template's grid over the whole sheet, as far as it goes: the task's, or a task from
   * paper's that the learner turns, none on a blank one; a workbook has its lines instead.
   */
  #drawGrid(): void {
    const template = this.#shownTemplate;
    const grid = isWorkbook(template)
      ? undefined
      : this.#paper === undefined
        ? template.grid
        : rulingsOf(this.#paperGrid);
    const { width, height } = this.#extent;
    const key = grid === undefined ? "" : `${grid.kind} ${grid.step} ${width} ${height}`;
    if (key === this.#gridDrawn) return;
    this.#gridDrawn = key;
    const dotted = grid?.kind === "dots";
    this.#grid.setAttribute("d", grid === undefined || dotted ? "" : gridPath(grid, this.#extent));
    this.#grid.classList.toggle("dots", dotted);
    if (dotted) {
      const { step } = grid;
      const { x, y, width: across, height: down } = dotsTiling(step, this.#extent);
      setAttributes(this.#dotTile, { x, y, width: step, height: step });
      this.#dot.setAttribute("d", `M${step / 2} ${step / 2}h0`);
      setAttributes(this.#dots, { x, y, width: across, height: down });
      this.#dots.removeAttribute("display");
    } else {
      this.#dots.setAttribute("display", "none");
    }
    // A page of units is more than any padding at the smallest k.
    const band = SHEET.height;
    for (const [svg, top] of [
      [this.#above, -band],
      [this.#below, height],
    ] as const) {
      svg.setAttribute("viewBox", `0 ${top} ${width} ${band}`);
      const path = svg.firstElementChild;
      path?.setAttribute("d", grid === undefined ? "" : gridBand(grid, width, top, top + band));
      path?.classList.toggle("dots", grid?.kind === "dots");
    }
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
    this.#forced = forced.matches;
    const changed = (): void => {
      this.#forced = forced.matches;
      this.#request();
    };
    forced.addEventListener("change", changed);
    this.#unwatchColours = () => forced.removeEventListener("change", changed);
  }

  /**
   * The work has changed — a stroke landed, an erasing, an undo, a clearing, the tutor's act: the
   * sheet is drawn anew, and whoever listens hears of it at once, the history already as it now
   * is, with the events it has gained. The event goes up from the element itself, and out of a consumer's
   * own shadow tree too, should the element be in one. An action a listener takes while it hears is
   * told of next, once every listener has heard of the one before: each hears the history's events
   * in its order. A history given meanwhile is no action, and what it replaced is told of no more.
   */
  #changed(): void {
    this.#regrow();
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
   * The learner chose a tool with the element's own button: it is the tool now, and whoever
   * listens hears of it. A consumer that gives the tool follows it, or its next render would set
   * back what the learner chose.
   */
  #choose(tool: Tool): void {
    if (tool === this.#tool || !this.#allows(tool)) return;
    this.#tool = tool;
    this.#refresh();
    this.#request();
    const detail: ToolChange = Object.freeze({ tool });
    this.dispatchEvent(new CustomEvent(TOOL_CHANGE, { bubbles: true, composed: true, detail }));
  }

  /**
   * The learner turned the task from paper's grid with its button: the next, round, and
   * whoever listens hears of it. A consumer that gives the grid follows it.
   */
  #turnGrid(): void {
    if (this.#paper === undefined) return;
    this.#paperGrid = nextGrid(this.#paperGrid);
    this.#drawGrid();
    this.#refresh();
    const detail: GridChange = Object.freeze({ grid: this.#paperGrid });
    this.dispatchEvent(new CustomEvent(GRID_CHANGE, { bubbles: true, composed: true, detail }));
  }

  /**
   * The learner hid the tracing paper with the button atop the tools, or showed it again: its
   * strokes go out of sight with it and stay in the history and in the work, and whoever listens
   * hears of the new state. A stroke or an erasing under way on the paper ends where it is, as on a
   * lost capture: the pointer goes on over a paper that is not there.
   */
  #trace(): void {
    if (this.#tracing?.hidden === false) this.#leaveTracing(true);
    const state = this.#tracing;
    if (this.#paper === undefined || state === undefined) return;
    this.#tracing = Object.freeze({ ...state, hidden: !state.hidden });
    this.#refresh();
    this.#request();
    this.#tracingChanged();
  }

  /**
   * The learner's grip moves the tracing paper to a place, kept to the sheet whole: its
   * strokes move with it, and the marks on them too. The move tells of itself once it is over.
   */
  #moveTracing(to: readonly [number, number]): readonly [number, number] {
    const state = this.#tracing;
    if (state === undefined) return to;
    this.#moveFrom ??= state;
    const scale = scaleIn(state);
    const at = keptOn(to, scaled(this.#tracingPaper.size, scale));
    if (at[0] === state.at[0] && at[1] === state.at[1]) return state.at;
    this.#tracing = Object.freeze({ at, hidden: state.hidden, scale });
    this.#regrow();
    this.#request();
    return at;
  }

  /** Ctrl or ⌘ with the wheel over the tracing paper in sight: a notch of its scale. */
  #wheel(event: WheelEvent): void {
    if (!(event.ctrlKey || event.metaKey) || event.deltaY === 0) return;
    const tracing = this.#tracing;
    if (tracing === undefined || tracing.hidden || !this.#tracingPaper.ready) return;
    const screen = this.#view();
    if (screen === undefined) return;
    const point = toSheet(screen, event.clientX - screen.left, event.clientY - screen.top);
    const size = scaled(this.#tracingPaper.size, scaleIn(tracing));
    if (!onTracing(point, tracing.at, size)) return;
    event.preventDefault();
    this.#tracingPaper.wheel(event.deltaY < 0);
  }

  /**
   * The learner scales the tracing paper by a corner, the bar of scale or the wheel: to a
   * place and a scale, kept to the rule and to the sheet whole; its strokes scale with it, and the
   * marks on them too. The change tells of itself once it is over.
   */
  #resizeTracing(
    to: readonly [number, number],
    by: number,
  ): { readonly at: readonly [number, number]; readonly scale: number } {
    const state = this.#tracing;
    if (state === undefined) return { at: to, scale: by };
    this.#moveFrom ??= state;
    const scale = tracingScaleOf(by);
    const at = keptOn(to, scaled(this.#tracingPaper.size, scale));
    const next = Object.freeze({ at, hidden: state.hidden, scale });
    if (sameTracing(state, next)) return { at: state.at, scale: scaleIn(state) };
    this.#tracing = next;
    this.#regrow();
    this.#request();
    return { at, scale };
  }

  /**
   * "Fit": the tracing paper as wide as the window shows the sheet right of the bar of tools,
   * at the rule's place there, kept to the rule; down the window, centred, below the rule's top.
   */
  #fitTracing(): void {
    const screen = this.#view();
    if (screen === undefined) return;
    const { width, height } = this.#tracingPaper.size;
    const across = screen.width / screen.k;
    const down = screen.height / screen.k;
    const scale = tracingScaleOf((across - TRACING.at[0] - TRACING.at[1]) / width);
    this.#resizeTracing(
      [screen.vx + TRACING.at[0], screen.vy + Math.max(TRACING.at[1], (down - height * scale) / 2)],
      scale,
    );
  }

  /** The learner's move of the tracing paper is over: whoever listens hears of it, if it moved. */
  #tracingMoved(): void {
    const from = this.#moveFrom;
    this.#moveFrom = undefined;
    const state = this.#tracing;
    if (from === undefined || state === undefined || sameTracing(from, state)) return;
    // The marks were placed by the strokes where they lay: a submission of the paper elsewhere is
    // not this sheet's any more, and they go.
    this.#replace();
    this.#tracingChanged();
  }

  /**
   * A stroke or an erasing under way on the tracing paper ends where it is, `end`, or goes, as on
   * `pointercancel`: the paper it was on goes out of sight or away.
   */
  #leaveTracing(end: boolean): void {
    const writer = this.#writeOn === "tracing" ? this.#recorder.pointer : undefined;
    const eraser = this.#eraseOn === "tracing" ? this.#eraser.pointer : undefined;
    // The recorder's handler writes the stroke on the layer it began on, so the layer goes after.
    if (writer !== undefined && !end && this.#recorder.cancel(writer)) this.#request();
    if (writer !== undefined && end) this.#recorder.end(writer);
    if (eraser !== undefined && !end && this.#eraser.cancel(eraser)) this.#request();
    if (eraser !== undefined && end) this.#eraser.end(eraser);
    if (writer !== undefined) this.#writeOn = undefined;
    if (eraser !== undefined) this.#eraseOn = undefined;
  }

  /**
   * The crop's picture is read, and the tracing paper has its size: a state the consumer gave,
   * checked against the largest paper, that puts the paper of this size wholly off the sheet moves
   * to the nearest place wholly on it, with its strokes and their marks. It tells nothing, as the
   * state given did not.
   */
  #sized(): void {
    const state = this.#tracing;
    const size = this.#tracingPaper.size;
    const scale = state === undefined ? 1 : scaleIn(state);
    if (state !== undefined && whollyOff(state.at, scaled(size, scale))) {
      this.#tracing = Object.freeze({
        at: keptOn(state.at, scaled(size, scale)),
        hidden: state.hidden,
        scale,
      });
      this.#replace();
    }
    this.#request();
  }

  /** Whoever listens hears of the tracing paper's new state, which the learner chose. */
  #tracingChanged(): void {
    const detail = this.#tracing;
    this.dispatchEvent(new CustomEvent(TRACING_CHANGE, { bubbles: true, composed: true, detail }));
  }

  /**
   * A stroke where it lies on the sheet: one of the tracing paper's moved to where the paper lies
   * at its scale, once for each place; the sheet's as it is.
   */
  #onSheet(stroke: Stroke, tracing: TracingState): Stroke {
    if (!this.#work.onTracing(stroke.id)) return stroke;
    const { at } = tracing;
    const scale = scaleIn(tracing);
    const kept = this.#placed.get(stroke);
    if (
      kept !== undefined &&
      kept.at[0] === at[0] &&
      kept.at[1] === at[1] &&
      kept.scale === scale
    ) {
      return kept.stroke;
    }
    const placed = onSheet(stroke, at, scale);
    this.#placed.set(stroke, { at, scale, stroke: placed });
    return placed;
  }

  /**
   * The learner opened the next part of the demo with the row's Next. The list grows above
   * the sheet, and the layout keeps a sheet scrolled into sight where it was at once, before the
   * scroll of the container is heard; then the part comes into sight between the band and the row
   * of glass, the region tells of it, and whoever listens hears of the new state. The focus stays
   * on Next, which opens the part after it. Nothing happens while the demo is hidden, or open
   * whole.
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
   * The learner hid the whole demo with the row's Demo, or showed it again: its open parts
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
   * one before any scroll is heard, and the row.
   */
  #showDemo(example: CheckedExample, state: DemoState): void {
    this.#demoState = state;
    this.#parts.show(example.demo, state);
    this.#showFills(filledBy(example, state));
    this.#layout();
    this.#refresh();
  }

  /**
   * The values a worked example's demo has written in the boxes of its workbook: each in
   * the middle of its box, on the line's baseline, at the width the layout gives its text, as the
   * lines' texts are; none while the demo is hidden. A value is a text of its own just after its
   * box's frame, which a screen reader reads after the box, in the lines' language, as the lines'
   * texts are (WCAG 3.1.2). Only what changed is written.
   */
  #showFills(fills: ReadonlyMap<string, string>): void {
    const page = this.#laid;
    if (page === undefined) return;
    for (const [c, cell] of this.#cells.entries()) {
      const value = fills.get(`${cell.item}.${cell.slot}`);
      let text = this.#values[c];
      if (value === (text?.textContent ?? undefined)) continue;
      if (value === undefined) {
        text?.remove();
        this.#values[c] = undefined;
        continue;
      }
      const item = page.items[cell.item - 1];
      const box = item?.boxes[cell.slot - 1];
      const rect = this.#rects[c];
      if (item === undefined || box === undefined || rect === undefined) continue;
      if (text === undefined) {
        text = document.createElementNS(SVG, "text");
        text.setAttribute("class", "value");
        text.setAttribute("lengthAdjust", "spacingAndGlyphs");
        rect.after(text);
        this.#values[c] = text;
      }
      // In the item's `<svg>`, from its origin, as its box's frame is.
      const width = pieceWidth(value);
      const { x, y } = fromItem(
        item,
        box.left + Math.floor((box.width - width) / 2),
        box.top + Math.floor(box.height / 2) + Math.floor(LAYOUT.size / 3),
      );
      text.setAttribute("x", String(x));
      text.setAttribute("y", String(y));
      text.setAttribute("textLength", String(width));
      text.textContent = value;
    }
  }

  /** Whoever listens hears of the demo's new state, which the learner chose. */
  #demoChanged(): void {
    const detail = this.#demoState;
    this.dispatchEvent(new CustomEvent(DEMO_CHANGE, { bubbles: true, composed: true, detail }));
  }

  /** The part Next opens: the one after those open, while the demo is shown. */
  #nextPart(): ExamplePart | undefined {
    const state = this.#demoState;
    if (state === undefined || state.hidden) return undefined;
    return this.#example?.demo[state.opened];
  }

  /**
   * An item of the list, or an area of the sheet, comes into sight at once, as near as it is,
   * and then out from under the consumer's band, --novatrail-canvas-top, should the band cover
   * where it came to: what scrolls back up goes back as far as the band covers it. A margin of
   * scrolling would hold for every scroller of the chain alike — the sheet's container and the
   * page. An area of the sheet taller than what is in sight comes by its top from below, but by its
   * bottom from above, and then the band's cover brings its top back into sight. The bar of
   * buttons covers nothing at the top: it stands at the left edge, and a worked example's row at
   * the bottom, where a scroll margin keeps what comes from below above it.
   */
  #bringIntoSight(item: HTMLElement): void {
    // A worked example's row of glass stands over the bottom of what is in sight: what comes into
    // sight from below stops 16 pixels above it.
    const { rail, row } = this.#tools;
    const under = rail.hidden || row.hidden ? 0 : row.offsetHeight + 32;
    item.style.setProperty("scroll-margin-bottom", `${under}px`);
    item.scrollIntoView({ block: "nearest", behavior: "instant" });
    // A scroller that comes to its top hands the rest on to the next. A scroller goes again only
    // while each of its scrolls leaves less covered than the last.
    const covered = new Map<Element | Window, number>();
    for (;;) {
      const latch = this.#scrollerFor(false);
      const cover = this.#band(latch?.target) - item.getBoundingClientRect().top;
      if (cover <= EDGE || latch === undefined) return;
      const last = covered.get(latch.target);
      if (last !== undefined && cover >= last - EDGE) return;
      covered.set(latch.target, cover);
      latch.target.scrollBy({ top: -cover / latch.scale, behavior: "instant" });
    }
  }

  /**
   * The row of buttons as the sheet now is: the tools the task allows, the one in use, whether
   * undo and clearing have anything to do, and a worked example's demo.
   */
  #refresh(): void {
    const demo = this.#demoState;
    this.#tools.show({
      kind: this.#rowKind(),
      tools: this.#shownTemplate.tools,
      tool: this.#tool,
      undoable: this.#work.undoable,
      redoable: this.#work.redoable,
      clearable: this.#work.strokes.length > 0,
      larger: PAGE_ZOOM.larger,
      smaller: PAGE_ZOOM.smaller,
      opens: this.#nextPart() !== undefined,
      expanded: demo?.hidden !== true,
      traced: this.#tracing?.hidden !== true,
      grid: this.#paperGrid,
      pens: this.#pens,
      styled: this.#styled,
    });
    this.#sheet.classList.toggle("hand", this.#tool === HAND);
    this.#nameRegion();
  }

  /**
   * The container as a region of its own, a stop of Tab and a name, while its content overflows
   * it, and the keyboard scrolls it: in Safari a container that nothing in it can take the focus in
   * scrolls by no key without (WebKit's bug 277290). Without a height of its own the
   * element scrolls with the page and has no stop of Tab, and neither has one whose task fits. A
   * container that holds the focus keeps all three till the focus leaves it, not the window.
   * Across, it scrolls while the sheet is wider than it, and an element without a height has a
   * region then too.
   */
  #region(): void {
    if (!this.isConnected) return;
    const viewport = this.#viewport;
    const across = overflowOf(viewport, "x") > EDGE;
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
   * in the language it is in, and the statement, the parts and the sheet in the element's.
   * With a `lang` the labels are in, the name is in the element's language already, and both are
   * in it, by an attribute of their own: Firefox gives a shadow tree no language of its host, and
   * WebKit takes no new one into the tree, though HTML has a node whose parent is a shadow root
   * take its host's. Without a `lang` the element's language is the page's, which no
   * attribute could name, and neither has one.
   */
  #nameRegion(): void {
    const tag = this.getAttribute("lang");
    const { lang, labels } = labelsFor(tag);
    const apart = tag !== null && !knows(tag);
    const named = this.#viewport.hasAttribute("role");
    write(this.#viewport, "aria-label", named ? labels[this.#rowKind()] : null);
    write(this.#viewport, "lang", apart ? lang : tag);
    write(this.#column, "lang", tag);
  }

  /** What the row of buttons is of, and is named by: a worked example, or the canvas kind. */
  #rowKind(): RowKind {
    if (this.#example !== undefined) return "example";
    if (this.#paper !== undefined) return "paper";
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
   * units, which the browser scales to the stage. Before any is drawn, so that none goes on
   * showing a part of the sheet the others have left.
   */
  #place(screen: Screen): void {
    const width = screen.width / screen.k;
    const height = screen.height / screen.k;
    if (!(height > 0)) return;
    const viewBox = `${screen.vx} ${screen.vy} ${width} ${height}`;
    // The tracing paper and its grip follow the sheet, and the paper's place and state.
    this.#tracingPaper.place(this.#tracing, screen);
    if (viewBox === this.#viewBox) return;
    this.#viewBox = viewBox;
    for (const layer of [
      this.#template,
      this.#show,
      this.#tracingPaper.layer,
      this.#sketch,
      this.#marksLayer,
      this.#selection.layer,
    ]) {
      layer.setAttribute("viewBox", viewBox);
    }
  }

  /**
   * The frames of the marks, around their strokes as the sheet shows them now: off their
   * points by the padding, in sheet units, and kept to the sheet by half the frame's line, so that
   * a frame at its edge stays whole. A frame the stroke under way comes into fades till the stroke
   * lands, and only what has changed is written.
   */
  #drawMarks(screen: Screen): void {
    const fresh = this.#freshPoints();
    if (this.#shown.length === 0) return;
    const byId = this.#byId();
    const pending = this.#eraser.pending;
    const tracing = this.#tracing;
    const work = this.#work;
    // A stroke of the tracing paper is where the paper lies, and out of sight while it is hidden.
    // Its box moves with the paper, and the stroke is not copied for each place of a drag. An
    // eraser that takes a part, still down, leaves the frames where they are till it lifts.
    const hidden = this.#eraser.erasure?.mode === "part" ? new Set<number>() : pending;
    const boxOn = (stroke: Stroke): Box | undefined => {
      if (hidden.has(stroke.id)) return undefined;
      if (tracing === undefined || !work.onTracing(stroke.id)) return this.#pointBoxOf(stroke);
      return tracing.hidden
        ? undefined
        : boxOnSheet(this.#pointBoxOf(stroke), tracing.at, scaleIn(tracing));
    };
    // A stroke the eraser cut is where its pieces are, however many times they were cut since.
    const cut = this.#cutOf();
    const onScreen = (id: number): Box | undefined => {
      const stroke = byId.get(id);
      if (stroke !== undefined) return boxOn(stroke);
      const boxes = (cut.get(id) ?? []).flatMap((piece) => boxOn(piece) ?? []);
      if (boxes.length === 0) return undefined;
      return {
        minX: Math.min(...boxes.map((box) => box.minX)),
        minY: Math.min(...boxes.map((box) => box.minY)),
        maxX: Math.max(...boxes.map((box) => box.maxX)),
        maxY: Math.max(...boxes.map((box) => box.maxY)),
      };
    };
    const half = 1 / screen.k;
    for (const mark of this.#shown) {
      const shown = shownOf(mark.placed, onScreen);
      const frame =
        shown && mark.placed.correct !== undefined
          ? verdictAt(shown, screen.k)
          : shown && mark.placed.wavy
            ? wavyAt(shown, half)
            : shown && {
                minX: Math.max(shown.minX - MARK_PADDING, half),
                minY: Math.max(shown.minY - MARK_PADDING, half),
                maxX: Math.min(shown.maxX + MARK_PADDING, REACH.width - half),
                maxY: Math.min(shown.maxY + MARK_PADDING, REACH.height - half),
              };
      if (this.#writing === undefined || frame === null) mark.under = false;
      else if (!mark.under) {
        // A frame that came or moved while the stroke was under way is checked against all of it.
        const points = sameBox(frame, mark.frame) ? fresh : this.#writing.stroke.points;
        // A stroke on the tracing paper holds its points from the paper's corner.
        const on = this.#writeOn === "tracing" ? this.#tracing : undefined;
        const [dx, dy] = on?.at ?? [0, 0];
        const by = on === undefined ? 1 : scaleIn(on);
        const reach = reachOf(this.#writing.stroke) * by + half;
        mark.under = points.some((point) =>
          near({ ...point, x: point.x * by + dx, y: point.y * by + dy }, frame, reach),
        );
      }
      mark.frame = frame;
      const drawn =
        frame === null
          ? "none"
          : `${frame.minX} ${frame.minY} ${frame.maxX} ${frame.maxY} ${mark.under}`;
      if (drawn === mark.drawn) continue;
      mark.drawn = drawn;
      const { node } = mark;
      if (frame === null) {
        node.setAttribute("display", "none");
        continue;
      }
      if (node instanceof SVGRectElement) {
        node.setAttribute("x", String(frame.minX));
        node.setAttribute("y", String(frame.minY));
        node.setAttribute("width", String(frame.maxX - frame.minX));
        node.setAttribute("height", String(frame.maxY - frame.minY));
      } else if (mark.placed.wavy) {
        const d = wavyPath(frame);
        for (const path of node.children) path.setAttribute("d", d);
      } else {
        const scale = (frame.maxX - frame.minX) / 24;
        node.setAttribute("transform", `translate(${frame.minX} ${frame.minY}) scale(${scale})`);
      }
      node.classList.toggle("under", mark.under);
      node.removeAttribute("display");
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

  /**
   * The strokes on the sheet cut of each stroke, by its ID: the pieces of a stroke the eraser cut,
   * and the pieces of those pieces. Each action on the work gives a new array of strokes.
   */
  #cutOf(): ReadonlyMap<number, readonly Stroke[]> {
    const strokes = this.#work.strokes;
    if (this.#piecesById.strokes !== strokes) {
      const of = new Map<number, Stroke[]>();
      for (const stroke of strokes) {
        for (const id of this.#work.cutFrom(stroke.id)) {
          const pieces = of.get(id);
          if (pieces === undefined) of.set(id, [stroke]);
          else pieces.push(stroke);
        }
      }
      this.#piecesById = { strokes, of };
    }
    return this.#piecesById.of;
  }

  /** The strokes on the sheet by ID: each action on the work gives a new array of them. */
  #byId(): ReadonlyMap<number, Stroke> {
    const strokes = this.#work.strokes;
    if (this.#strokesById.strokes !== strokes) {
      this.#strokesById = { strokes, byId: new Map(strokes.map((stroke) => [stroke.id, stroke])) };
    }
    return this.#strokesById.byId;
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
   * The layers in the visible part, and the strokes there, in device pixels. The canvas keeps the
   * finished strokes from frame to frame while the view stays: a stroke that lands, or a stroke
   * under way, takes back only its own rectangle. A stroke under way on the sheet lies under the
   * tracing paper's strokes, which are painted over it there. Anything else — a scroll among
   * them — paints the strokes anew, and so does each frame while an eraser is down: what it has come near is out of
   * sight already, though still on the sheet until it lifts — or, for an eraser that takes a part,
   * drawn as the pieces it would leave.
   */
  #draw(): void {
    const start = performance.now();
    const fills = this.#fills;
    this.#frameAll = false;
    this.#frameArea = 0;
    this.#drawNow();
    if (!this.#frameAll && this.#frameArea === 0) return;
    const ms = performance.now() - start;
    const { width, height } = this.#canvas;
    this.#frames++;
    if (this.#frameAll) this.#fullRepaints++;
    this.#lastFills = this.#fills - fills;
    this.#lastArea = this.#frameAll ? 1 : Math.min(1, this.#frameArea / (width * height));
    this.#lastMs = ms;
    this.#paintMs[this.#paintsKept % PAINT_MS] = ms;
    this.#paintsKept++;
  }

  /** What a frame paints on the canvas: all in sight, or a rectangle of it, for `paintStats` and the flash. */
  #painting(at: Pixels | undefined): void {
    const { width, height } = this.#canvas;
    if (at === undefined) this.#frameAll = true;
    else this.#frameArea += at[2] * at[3];
    this.#flash?.add(at ?? [0, 0, width, height], width, height);
  }

  #drawNow(): void {
    this.#drawingNow = performance.now();
    const screen = this.#view();
    if (screen === undefined) return;
    // Read before anything is written: the colour as the style now computes it.
    const colour = this.#canvasStyle.color;
    this.#place(screen);
    this.#drawMarks(screen);
    this.#drawSelection(screen);
    const context = this.#context;
    const { width, height } = this.#canvas;
    if (context === null || width === 0 || height === 0) return;
    // Device pixels to a unit, across and down: the ratio of the canvas's buffer to its rectangle,
    // which holds under any scale the page puts on the element, times `k`.
    const across = (width / screen.width) * screen.k;
    const down = (height / screen.height) * screen.k;
    const frame: Frame = { screen, across, down, colour };
    this.#paintFrame(context, frame);
    this.#drawingPainted();
  }

  /**
   * A frame painted on the canvas: anew, or within the rectangles where the finished ink, the
   * stroke under way and the tutor's act being drawn have changed since the last.
   */
  #paintFrame(context: CanvasRenderingContext2D, frame: Frame): void {
    const { colour } = frame;
    const now = this.#paintedNow(frame, "all");
    if (this.#eraser.pending.size > 0 || this.#eraser.erasure !== undefined) {
      // An eraser cuts the tutor's drawing short: what it comes near is the sheet's as it is.
      this.#endDrawing();
      this.#paintAnew(context, frame, now);
      this.#painted = undefined;
      this.#underHolds = undefined;
      return;
    }
    // Where the canvas no longer shows the finished ink: the stroke under way of the last frame,
    // and a stroke that landed since.
    let was = this.#liveAt;
    this.#liveAt = undefined;
    let drew: Pixels | undefined;
    if (this.#follows(now)) {
      const landed = addedOnTop(this.#painted?.strokes ?? [], now.strokes);
      if (landed !== undefined)
        was = union(
          was,
          this.#pixelsOf(frame, this.#work.onTracing(landed.id), this.#finished(landed)),
        );
      drew = union(
        this.#drawingChanged(frame),
        union(this.#draggedChanged(frame), this.#resizedChanged(frame)),
      );
      was = union(was, drew);
    } else {
      // Anything but the act's own first frame and a stroke landing — a scroll, an undo, a new
      // history — cuts the tutor's drawing short, and the canvas paints it whole.
      if (this.#drawing?.fresh === false) this.#endDrawing();
      this.#paintAnew(context, frame, now);
      was = undefined;
    }
    this.#painted = now;
    const live = this.#recorder.live;
    const tracing = this.#tracing;
    const shown = tracing !== undefined && !tracing.hidden;
    if (live === undefined) {
      if (was !== undefined) this.#paintWithin(context, frame, "all", was);
      this.#underHolds = undefined;
      return;
    }
    const liveTraced = this.#writeOn === "tracing";
    if (liveTraced && !shown) {
      if (was !== undefined) this.#paintWithin(context, frame, "all", was);
      return;
    }
    const work = this.#work;
    const over = !liveTraced && shown && work.strokes.some((stroke) => work.onTracing(stroke.id));
    const layers: Layers = over ? "sheet" : "all";
    // The ink under the stroke has changed where the tutor's drawing went on.
    if (drew !== undefined) this.#underHolds = undefined;
    const under = this.#underFor(frame, layers, was === undefined);
    const polygon = this.#outline(live, false);
    const at = union(was, this.#pixelsOf(frame, liveTraced, boundsOf(polygon)));
    if (at === undefined) return;
    const [x, y, wide, high] = at;
    this.#painting(at);
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.beginPath();
    context.rect(x, y, wide, high);
    context.clip();
    context.clearRect(x, y, wide, high);
    if (under === undefined) this.#paintInk(context, frame, layers, this.#boundsOf(frame, at));
    else context.drawImage(under, x, y, wide, high, x, y, wide, high);
    this.#inkFrame(context, frame, liveTraced ? tracing : undefined);
    this.#fillStroke(context, live, pathOf(polygon), colour);
    if (over) this.#paintInk(context, frame, "tracing", this.#boundsOf(frame, at));
    context.restore();
    this.#liveAt = at;
  }

  /** What the canvas shows of the finished ink in a frame, in its layers. */
  #paintedNow({ screen, across, down, colour }: Frame, layers: Layers): Painted {
    const tracing = this.#tracing;
    return {
      strokes: this.#work.strokes,
      layers,
      vx: screen.vx,
      vy: screen.vy,
      across,
      down,
      width: this.#canvas.width,
      height: this.#canvas.height,
      colour,
      forced: this.#forced,
      tracing:
        tracing === undefined
          ? ""
          : `${tracing.at[0]} ${tracing.at[1]} ${scaleIn(tracing)} ${tracing.hidden}`,
    };
  }

  /**
   * Whether the canvas shows `now` without painting it all: the same finished ink in the same
   * view, or with a stroke that landed on it since — which the caller paints, within its
   * rectangle. False when it has to be painted anew.
   */
  #follows(now: Painted): boolean {
    const was = this.#painted;
    if (was === undefined || !sameView(was, now)) return false;
    return was.strokes === now.strokes || addedOnTop(was.strokes, now.strokes) !== undefined;
  }

  /** The canvas cleared and the finished ink in sight painted on it, all of it. */
  #paintAnew(context: CanvasRenderingContext2D, frame: Frame, now: Painted): void {
    this.#painting(undefined);
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, now.width, now.height);
    this.#paintInk(context, frame, now.layers);
    this.#painted = now;
  }

  /**
   * A rectangle of the canvas cleared and its finished ink painted within it: each of its pixels
   * what a painting of the whole gives it.
   */
  #paintWithin(
    context: CanvasRenderingContext2D,
    frame: Frame,
    layers: Layers,
    [x, y, wide, high]: Pixels,
  ): void {
    this.#painting([x, y, wide, high]);
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.beginPath();
    context.rect(x, y, wide, high);
    context.clip();
    context.clearRect(x, y, wide, high);
    this.#paintInk(context, frame, layers, this.#boundsOf(frame, [x, y, wide, high]));
    context.restore();
  }

  /**
   * The buffer of the finished ink of the layers under a stroke under way, for this frame: as it
   * was, or taken from the canvas when it shows them whole, or else painted. None if the buffer
   * has no context: the caller paints what it needs instead.
   */
  #underFor(frame: Frame, layers: Layers, clean: boolean): HTMLCanvasElement | undefined {
    const want = this.#paintedNow(frame, layers);
    const held = this.#underHolds;
    if (held !== undefined && held.strokes === want.strokes && sameView(held, want)) {
      return this.#under;
    }
    const buffer = this.#under;
    if (buffer.width !== want.width || buffer.height !== want.height) {
      buffer.width = want.width;
      buffer.height = want.height;
    }
    const context = buffer.getContext("2d");
    if (context === null) return undefined;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalCompositeOperation = "copy";
    if (clean && layers === "all") {
      context.drawImage(this.#canvas, 0, 0);
      context.globalCompositeOperation = "source-over";
    } else {
      context.globalCompositeOperation = "source-over";
      context.clearRect(0, 0, want.width, want.height);
      this.#paintInk(context, frame, layers);
    }
    this.#underHolds = want;
    return buffer;
  }

  /**
   * The rectangle of the canvas, in whole device pixels, that holds a stroke's outline, whose
   * bounds are in its own units — the sheet's, or the tracing paper's when it is `traced` —, with
   * two pixels' margin for its smoothed edge, and cut to the canvas. None when it is out of sight.
   */
  #pixelsOf(
    { screen, across, down }: Frame,
    traced: boolean,
    bounds: { minX: number; minY: number; maxX: number; maxY: number } | Ink,
  ): Pixels | undefined {
    const box =
      "path" in bounds
        ? { minX: bounds.left, minY: bounds.top, maxX: bounds.right, maxY: bounds.bottom }
        : bounds;
    const tracing = traced ? this.#tracing : undefined;
    const [dx, dy] = tracing?.at ?? [0, 0];
    const by = tracing === undefined ? 1 : scaleIn(tracing);
    const { width, height } = this.#canvas;
    const left = Math.max(0, Math.floor((box.minX * by + dx - screen.vx) * across) - 2);
    const top = Math.max(0, Math.floor((box.minY * by + dy - screen.vy) * down) - 2);
    const right = Math.min(width, Math.ceil((box.maxX * by + dx - screen.vx) * across) + 2);
    const bottom = Math.min(height, Math.ceil((box.maxY * by + dy - screen.vy) * down) + 2);
    if (!(right > left && bottom > top)) return undefined;
    return [left, top, right - left, bottom - top];
  }

  /** A rectangle of the canvas, in device pixels, as a part of the sheet, in units. */
  #boundsOf({ screen, across, down }: Frame, [x, y, wide, high]: Pixels): Bounds {
    return {
      left: screen.vx + x / across,
      top: screen.vy + y / down,
      right: screen.vx + (x + wide) / across,
      bottom: screen.vy + (y + high) / down,
    };
  }

  /**
   * The finished strokes of the layers, those in sight — within `bounds`, when given — each by
   * the path it was given once: the sheet's, then the shown tracing paper's over them, moved to
   * where it lies. A stroke whose points lie far out of sight is not outlined till it comes into
   * sight: a history given to the sheet may hold thousands. `strokes` paints only those.
   */
  #paintInk(
    context: CanvasRenderingContext2D,
    frame: Frame,
    layers: Layers,
    bounds?: Bounds,
    strokes: readonly Stroke[] = this.#work.strokes,
  ): void {
    const { screen, colour } = frame;
    const left = bounds?.left ?? screen.vx;
    const top = bounds?.top ?? screen.vy;
    const right = bounds?.right ?? screen.vx + screen.width / screen.k;
    const bottom = bounds?.bottom ?? screen.vy + screen.height / screen.k;
    const erasing = this.#eraser.pending;
    const erasure = this.#eraser.erasure;
    // A task from paper's tracing paper: its strokes over the sheet's, moved to where it lies, and
    // none while it is hidden.
    const tracing = this.#tracing;
    const work = this.#work;
    const shown = tracing !== undefined && !tracing.hidden;
    const draw = (stroke: Stroke, dx: number, dy: number, by = 1): void => {
      // The outline keeps within half the widest line of the points: twice that is out of sight.
      const box = this.#pointBoxOf(stroke);
      const reach = 2 * reachOf(stroke) * by;
      if (box.maxY * by + dy + reach < top || box.minY * by + dy - reach > bottom) return;
      if (box.maxX * by + dx + reach < left || box.minX * by + dx - reach > right) return;
      const ink = this.#finished(stroke);
      if (ink.bottom * by + dy >= top && ink.top * by + dy <= bottom) {
        this.#fillStroke(context, stroke, ink.path, colour);
      }
    };
    const drawing = this.#drawing;
    // A stroke of the tutor's act being drawn: the part of it drawn so far. A stroke an eraser has
    // come near: out of sight, or the pieces a cut would leave of it.
    const dragging = this.#dragging;
    const resizing = this.#resizing;
    const drawn = (stroke: Stroke): readonly Stroke[] => {
      if (dragging?.ids.has(stroke.id)) return [this.#movedOf(stroke, dragging.offset)];
      if (resizing?.ids.has(stroke.id)) return [this.#scaledOf(stroke, resizing)];
      if (drawing?.timings.has(stroke.id)) {
        const part = this.#partOf(stroke, drawing);
        return part === undefined ? [] : [part];
      }
      if (!erasing.has(stroke.id)) return [stroke];
      return erasure?.mode === "part" ? this.#piecesOf(stroke, erasure) : [];
    };
    const onPaper = (stroke: Stroke): boolean => tracing !== undefined && work.onTracing(stroke.id);
    if (layers !== "tracing") {
      this.#inkFrame(context, frame);
      for (const stroke of strokes) {
        if (!onPaper(stroke)) for (const each of drawn(stroke)) draw(each, 0, 0);
      }
    }
    if (layers === "sheet" || !shown) return;
    const [dx, dy] = tracing.at;
    this.#inkFrame(context, frame, tracing);
    const by = scaleIn(tracing);
    for (const stroke of strokes) {
      if (onPaper(stroke)) for (const each of drawn(stroke)) draw(each, dx, dy, by);
    }
  }

  /**
   * The context set to draw in units of the sheet, or of the tracing paper — as large as its
   * scale draws it, from its corner — within the device pixels of the frame.
   */
  #inkFrame(
    context: CanvasRenderingContext2D,
    { screen, across, down }: Frame,
    tracing?: TracingState,
  ): void {
    if (tracing === undefined) {
      context.setTransform(across, 0, 0, down, -screen.vx * across, -screen.vy * down);
      return;
    }
    const [dx, dy] = tracing.at;
    const by = scaleIn(tracing);
    context.setTransform(
      across * by,
      0,
      0,
      down * by,
      (dx - screen.vx) * across,
      (dy - screen.vy) * down,
    );
  }

  /**
   * A stroke filled: without a style in the ink's colour, the canvas's, as the theme makes it;
   * with one in its colour, filled once at its opacity, so that it is one layer however it crosses
   * itself, and a marker's multiplied with the ink under it. The palette's black is the theme's
   * ink, and with forced colours every stroke is.
   */
  #fillStroke(
    context: CanvasRenderingContext2D,
    stroke: Stroke,
    path: Path2D,
    colour: string,
  ): void {
    this.#fills++;
    const { style } = stroke;
    if (style === undefined) {
      context.fillStyle = colour;
      context.fill(path);
      return;
    }
    context.fillStyle = screenColourOf(style, colour, this.#forced);
    context.globalAlpha = style.opacity / 100;
    if (style.pen === "marker") context.globalCompositeOperation = "multiply";
    context.fill(path);
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";
  }

  #finished(stroke: Stroke): Ink {
    let ink = this.#inks.get(stroke);
    if (ink === undefined) {
      const polygon = this.#outline(stroke, true);
      const { minX, minY, maxX, maxY } = boundsOf(polygon);
      ink = { path: pathOf(polygon), left: minX, top: minY, right: maxX, bottom: maxY };
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
 * An item of a workbook's lines: its number, then its text and its boxes in the order they
 * are read, each where the layout put it. The item is an `<svg>` of its own place and size, which
 * shows what it holds beyond its edges, and its parts lie from its origin: Firefox brings a group
 * into view as a point at its origin, and only a box with a size whole.
 * A piece of text is fitted to its width by SVG, whatever the font, and its size is never read.
 */
function itemOf(item: PageItem): SVGSVGElement {
  const svg = document.createElementNS(SVG, "svg");
  placeOver(svg, item);
  svg.setAttribute("overflow", "visible");
  svg.setAttribute("role", "listitem");
  svg.append(
    textOf(item.number, item),
    ...item.line.map((part) => (isBox(part) ? rectOf(part, item) : textOf(part, item))),
  );
  return svg;
}

/** Where the layout puts a part of an item, from the item's origin, in page units. */
function fromItem(item: PageItem, left: number, top: number): { x: number; y: number } {
  return { x: left - item.left, y: top - item.top };
}

function textOf({ text, left, baseline, width }: PageText, item: PageItem): SVGTextElement {
  const element = document.createElementNS(SVG, "text");
  const { x, y } = fromItem(item, left, baseline);
  element.setAttribute("x", String(x));
  element.setAttribute("y", String(y));
  element.setAttribute("textLength", String(width));
  element.setAttribute("lengthAdjust", "spacingAndGlyphs");
  element.textContent = text;
  return element;
}

/** A box, a picture to a screen reader, which its name tells of. */
function rectOf(box: PageBox, item: PageItem): SVGRectElement {
  const rect = document.createElementNS(SVG, "rect");
  const { x, y } = fromItem(item, box.left, box.top);
  placeOver(rect, { ...box, left: x, top: y });
  rect.setAttribute("role", "img");
  return rect;
}

/**
 * Whether a stroke's colour `#rrggbb` is a grey for the picture of the work: its three channels
 * alike, or the palette's black, a hair off grey, which a picture of black ink keeps at a pixel a
 * unit: its grey is the red of its pixels.
 */
function isGrey(colour: string): boolean {
  if (colour === PALETTE[0]) return true;
  return colour.slice(1, 3) === colour.slice(3, 5) && colour.slice(3, 5) === colour.slice(5, 7);
}

/** A piece of a stroke the eraser cut: a stroke of its own, of the stroke's pointer and style. */
function pieceOf(stroke: Stroke, id: number, points: readonly InkPoint[]): Stroke {
  const { kind, style } = stroke;
  return style === undefined ? { id, kind, points } : { id, kind, style, points };
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

/** What the hands see of a pointer event: where on the screen, how big, when. */
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

/**
 * Whether a touch event is a pen's: WebKit gives a pen's touch the `touchType` "stylus". A touch
 * without it is taken for a finger's, and is left as it is.
 */
function byStylus(event: TouchEvent): boolean {
  const touches: readonly (Touch & { readonly touchType?: string })[] = [...event.changedTouches];
  return touches.some((touch) => touch.touchType === "stylus");
}

/** The scroll an event's fingers owe a scroller, in whole pixels, if any: the rest waits. */
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
 * transforms it. The sheet's container has one, and so has any ancestor the fingers or
 * the hand scroll.
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
 * How much the page scales an element down the screen, or across it along `x`: 1 unless an
 * ancestor transforms it. `box` is its rectangle on the screen, when the caller has it already.
 */
function scaleOf(element: Element, box?: DOMRect, axis: Axis = "y"): number {
  const laid =
    element instanceof HTMLElement ? element[axis === "y" ? "offsetHeight" : "offsetWidth"] : 0;
  if (laid <= 0) return 1;
  const shown = box ?? element.getBoundingClientRect();
  return (axis === "y" ? shown.height : shown.width) / laid;
}

/** Whether two paintings show their layers the same way: all but which strokes they hold. */
function sameView(a: Painted, b: Painted): boolean {
  return (
    a.layers === b.layers &&
    a.vx === b.vx &&
    a.vy === b.vy &&
    a.across === b.across &&
    a.down === b.down &&
    a.width === b.width &&
    a.height === b.height &&
    a.colour === b.colour &&
    a.forced === b.forced &&
    a.tracing === b.tracing
  );
}

/** The smallest rectangle that holds both, either of which may be none. */
function union(a: Pixels | undefined, b: Pixels | undefined): Pixels | undefined {
  if (a === undefined) return b;
  if (b === undefined) return a;
  const left = Math.min(a[0], b[0]);
  const top = Math.min(a[1], b[1]);
  const right = Math.max(a[0] + a[2], b[0] + b[2]);
  const bottom = Math.max(a[1] + a[3], b[1] + b[3]);
  return [left, top, right - left, bottom - top];
}

/** The bounds of an outline's points. */
function boundsOf(polygon: readonly Vec2[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const [x, y] of polygon) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

/** The one stroke `now` has after all of `was`, the same objects in the same order, or none. */
function addedOnTop(was: readonly Stroke[], now: readonly Stroke[]): Stroke | undefined {
  if (now.length !== was.length + 1) return undefined;
  for (let i = 0; i < was.length; i++) if (now[i] !== was[i]) return undefined;
  return now[was.length];
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
  // puts it in the DOM's.
  interface GlobalEventHandlersEventMap extends CanvasEventMap {}
}
