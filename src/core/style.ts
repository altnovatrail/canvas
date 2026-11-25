import type {
  EraserMode,
  PenKind,
  PenSettings,
  SelectShape,
  StrokeStyle,
} from "@altnovatrail/spec/canvas";
import { record, shown } from "./fields.js";
import type { Stroke } from "./ink.js";
import { INK_REACH, PEN_WIDEST } from "./outline.js";

/**
 * How a stroke looks, the learner's settings of the pen and the eraser, the kinds of pen and the
 * modes of the eraser: spec's types, of the contract of canvas and app.
 */
export type { EraserMode, PenKind, PenSettings, SelectShape, StrokeStyle };

/** The kinds of pen, in the order the pen's popover offers them. */
export const PEN_KINDS: readonly PenKind[] = Object.freeze(["pen", "liner", "marker"]);

/** The eraser's modes: a stroke it touches whole, or only what it passes over. */
export const ERASER_MODES: readonly EraserMode[] = Object.freeze(["stroke", "part"]);

/** The shapes Select draws, in the order of its popover: the lasso, then the rectangle. */
export const SELECT_SHAPES: readonly SelectShape[] = Object.freeze(["lasso", "rectangle"]);

/** The five widths of the pen and the liner, in sheet units, the thinnest first. */
export const PEN_WIDTHS: readonly number[] = Object.freeze([1.2, 2, 3, 4.5, 7]);

/**
 * The five widths of the marker, in sheet units: each four times the pen's step, and its style's
 * width is the very width it draws.
 */
export const MARKER_WIDTHS: readonly number[] = Object.freeze([4.8, 8, 12, 18, 28]);

/** The eraser's five sizes, its diameters in sheet units, the smallest first. */
export const ERASER_SIZES: readonly number[] = Object.freeze([8, 16, 28, 44, 64]);

/** The palette: black, blue, green, yellow and red. */
export const PALETTE: readonly string[] = Object.freeze([
  "#1c1c1e",
  "#0a63d6",
  "#1e9e4a",
  "#ffcc00",
  "#e5322d",
]);

/** The other colours, offered past the palette. */
export const OTHER_COLOURS: readonly string[] = Object.freeze([
  "#8e8e93",
  "#7a4fd0",
  "#f08a00",
  "#00a6a6",
  "#ff5fa2",
  "#8b5a2b",
  "#5ac8fa",
  "#34c759",
  "#ff9f0a",
  "#bf5af2",
  "#ff3b30",
  "#ffffff",
]);

/** The bounds of a style, in sheet units and in percent, and of the eraser's size, bounds in. */
export const STYLE_BOUNDS = Object.freeze({
  width: Object.freeze([0.1, 50] as const),
  opacity: Object.freeze([10, 100] as const),
  eraserSize: Object.freeze([1, 200] as const),
});

const COLOUR = /^#[0-9a-f]{6}$/;

/** The settings an element starts with, frozen through. */
export const PEN_SETTINGS: PenSettings = penSettingsOf({
  pen: "pen",
  styles: {
    pen: { pen: "pen", color: "#1c1c1e", width: 3, opacity: 100 },
    liner: { pen: "liner", color: "#0a63d6", width: 2, opacity: 100 },
    marker: { pen: "marker", color: "#ffcc00", width: 18, opacity: 40 },
  },
  eraser: "stroke",
  eraserSize: 16,
  select: "lasso",
});

/**
 * Settings of the pen and the eraser given by a consumer, checked field by field and copied into
 * frozen objects of the element's own, with only the fields they have: others are passed over.
 * Anything not of `PenSettings` is a TypeError that names the field — a style whose `pen` is not
 * its kind's, a colour, a width, an opacity or a size out of its bounds, a shape of Select not its
 * own. Settings without `select` keep the lasso.
 */
export function penSettingsOf(value: unknown, path = "pens"): PenSettings {
  const fields = record(value, path);
  const pen = kindOf(fields.pen, `${path}.pen`);
  const given = record(fields.styles, `${path}.styles`);
  const style = (kind: PenKind): StrokeStyle => {
    const at = `${path}.styles.${kind}`;
    const one = styleOf(given[kind], at);
    if (one.pen !== kind) throw new TypeError(`${at}.pen: "${kind}", its kind's, not "${one.pen}"`);
    return one;
  };
  const styles = Object.freeze({
    pen: style("pen"),
    liner: style("liner"),
    marker: style("marker"),
  });
  if (!ERASER_MODES.includes(fields.eraser as EraserMode)) {
    throw new TypeError(`${path}.eraser: "stroke" or "part", not ${shown(fields.eraser)}`);
  }
  const eraser = fields.eraser as EraserMode;
  const [least, most] = STYLE_BOUNDS.eraserSize;
  const eraserSize = fields.eraserSize;
  if (typeof eraserSize !== "number" || !(eraserSize >= least && eraserSize <= most)) {
    throw new TypeError(
      `${path}.eraserSize: the eraser's diameter in sheet units, from ${least} to ${most}, not ${shown(eraserSize)}`,
    );
  }
  const select = fields.select ?? "lasso";
  if (!SELECT_SHAPES.includes(select as SelectShape)) {
    throw new TypeError(`${path}.select: "lasso" or "rectangle", not ${shown(select)}`);
  }
  return Object.freeze({ pen, styles, eraser, eraserSize, select: select as SelectShape });
}

/**
 * A stroke's style, checked field by field and copied, frozen: a kind of pen, a colour of sRGB as
 * `#rrggbb` in lowercase digits, a width in sheet units to a tenth from 0.1 to 50 and an opacity
 * in whole percent from 10 to 100. Anything else is a TypeError at `path`.
 */
export function styleOf(value: unknown, path: string): StrokeStyle {
  const fields = record(value, path);
  const pen = kindOf(fields.pen, `${path}.pen`);
  const color = fields.color;
  if (typeof color !== "string" || !COLOUR.test(color)) {
    throw new TypeError(
      `${path}.color: a colour, # and six lowercase hexadecimal digits, not ${shown(color)}`,
    );
  }
  const width = fields.width;
  const [thinnest, widest] = STYLE_BOUNDS.width;
  if (
    typeof width !== "number" ||
    !Number.isFinite(width) ||
    Math.round(width * 10) / 10 !== width ||
    width < thinnest ||
    width > widest
  ) {
    throw new TypeError(
      `${path}.width: sheet units to a tenth, from ${thinnest} to ${widest}, not ${shown(width)}`,
    );
  }
  const opacity = fields.opacity;
  const [faintest, fullest] = STYLE_BOUNDS.opacity;
  if (
    typeof opacity !== "number" ||
    !Number.isInteger(opacity) ||
    opacity < faintest ||
    opacity > fullest
  ) {
    throw new TypeError(
      `${path}.opacity: whole percent from ${faintest} to ${fullest}, not ${shown(opacity)}`,
    );
  }
  return Object.freeze({ pen, color, width, opacity });
}

/** Whether two styles say the same, field by field; none is the same as none alone. */
export function sameStyle(a: StrokeStyle | undefined, b: StrokeStyle | undefined): boolean {
  if (a === b) return true;
  if (a === undefined || b === undefined) return false;
  return a.pen === b.pen && a.color === b.color && a.width === b.width && a.opacity === b.opacity;
}

/**
 * How far a stroke's ink reaches from its points on the screen at most, in its own units: a stroke
 * without a style as the pen without styles drew it, `INK_REACH`; one of the kind "pen" half its
 * width at the widest a pen's pressure or its speed makes it; a liner's and a marker's half their
 * width.
 */
export function reachOf(stroke: Stroke): number {
  const { style } = stroke;
  if (style === undefined) return INK_REACH;
  return style.pen === "pen" ? (style.width * PEN_WIDEST) / 2 : style.width / 2;
}

function kindOf(value: unknown, path: string): PenKind {
  if (!PEN_KINDS.includes(value as PenKind)) {
    throw new TypeError(`${path}: "pen", "liner" or "marker", not ${shown(value)}`);
  }
  return value as PenKind;
}
