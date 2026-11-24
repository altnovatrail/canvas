// spec's test vectors of the rules the sheet shares with the eval runner of tutor — the groups of
// strokes, the crop, the snapping of a model's box and the boxes of a workbook — as the
// npm package @altnovatrail/contracts gives them at the tag of spec that canvas stands on, and what
// turns their messages into the sheet's own types. The vectors are spec's, in the protocol's form;
// the sheet's tests hold its code to them.

import boxes from "@altnovatrail/contracts/vectors/eval/v1/boxes.json" with { type: "json" };
import crops from "@altnovatrail/contracts/vectors/eval/v1/crops.json" with { type: "json" };
import groups from "@altnovatrail/contracts/vectors/eval/v1/groups.json" with { type: "json" };
import snaps from "@altnovatrail/contracts/vectors/eval/v1/snaps.json" with { type: "json" };
import type {
  Box,
  Group,
  HistoryEvent,
  PenKind,
  Stroke,
  StrokeStyle,
} from "@altnovatrail/spec/canvas";
import type { Crop } from "./crop.js";
import { tenths } from "./geometry.js";

/** A file of vectors: what it holds, the numbers of its rule and its cases. */
export interface Vectors<Case> {
  readonly description: string;
  readonly rule: unknown;
  readonly cases: readonly Case[];
}

/** The four files of the vectors, `vectors/eval/v1/<name>.json`, by name. */
const FILES = { groups, crops, snaps, boxes };

/** One file of spec's vectors, its cases of the type its test reads them by. */
export function vectorsOf<Case>(name: keyof typeof FILES): Vectors<Case> {
  return FILES[name] as unknown as Vectors<Case>;
}

/** A rectangle in whole tenths of a unit, `TenthsBox`. */
export interface TenthsBox {
  readonly ymin: number;
  readonly xmin: number;
  readonly ymax: number;
  readonly xmax: number;
}

/** A group of strokes, `Group`: its label and its strokes' IDs, ascending. */
export interface ProtocolGroup {
  readonly label: string;
  readonly stroke_ids: readonly number[];
}

/** A stroke's style, `StrokeStyle`: its kind of pen by the enum's name, its colour, width, opacity. */
export interface ProtocolStyle {
  readonly pen: "PEN_KIND_PEN" | "PEN_KIND_LINER" | "PEN_KIND_MARKER";
  readonly color: string;
  readonly width: number;
  readonly opacity: number;
}

/** A stroke of the final geometry, `FinalStroke`: its ID, its points, with no time, and its style. */
export interface FinalStroke {
  readonly id: number;
  readonly points: readonly { readonly x: number; readonly y: number }[];
  readonly style?: ProtocolStyle;
}

/** A stroke of a history, `Stroke`: its ID, its pointer, its points and its style. */
export interface ProtocolStroke {
  readonly id: number;
  readonly pointer: string;
  readonly points: readonly { readonly x: number; readonly y: number; readonly t_ms: number }[];
  readonly style?: ProtocolStyle;
}

/** An event of the history of writing, `HistoryEvent`: its time and the field it sets. */
export interface ProtocolEvent {
  readonly t_ms: number;
  readonly write?: ProtocolStroke;
  readonly erase?: { readonly ids: readonly number[] };
  readonly cut?: {
    readonly ids: readonly number[];
    readonly pieces: readonly { readonly of: number; readonly stroke: ProtocolStroke }[];
  };
  readonly clear?: { readonly ids: readonly number[] };
  readonly undo?: { readonly removed: readonly number[]; readonly restored: readonly number[] };
}

/**
 * The pressure a point of a protocol's stroke is given: a sample holds none, and no rule
 * of the vectors reads it.
 */
const PRESSURE = 0.5;

/** A protocol's kinds of pen as the sheet's. */
const PEN_KINDS: Readonly<Record<ProtocolStyle["pen"], PenKind>> = {
  PEN_KIND_PEN: "pen",
  PEN_KIND_LINER: "liner",
  PEN_KIND_MARKER: "marker",
};

/** A protocol's style as the sheet's: its `pen` is `PEN_KIND_` and its kind in capitals. */
export function styleFrom({ pen, color, width, opacity }: ProtocolStyle): StrokeStyle {
  return { pen: PEN_KINDS[pen], color, width, opacity };
}

/** A stroke of a protocol's history as the sheet's: its kind is its pointer, a point's `t` its `t_ms`. */
function strokeFrom({ id, pointer, points, style }: ProtocolStroke): Stroke {
  const ink = points.map(({ x, y, t_ms }) => ({ x, y, t: t_ms, p: PRESSURE }));
  return style === undefined
    ? { id, kind: pointer, points: ink }
    : { id, kind: pointer, style: styleFrom(style), points: ink };
}

/**
 * A protocol's history as the element keeps it: an event's kind is the field it sets, its `t` is
 * `t_ms`, a stroke's kind is its pointer, a style's `pen` its kind, a piece's `of` and `stroke` its
 * own and a point's `t` its `t_ms`.
 */
export function historyOf(events: readonly ProtocolEvent[]): HistoryEvent[] {
  return events.map((event): HistoryEvent => {
    const t = event.t_ms;
    if (event.write !== undefined) return { kind: "write", t, stroke: strokeFrom(event.write) };
    if (event.erase !== undefined) return { kind: "erase", t, ids: event.erase.ids };
    if (event.cut !== undefined) {
      const pieces = event.cut.pieces.map(({ of, stroke }) => ({ of, stroke: strokeFrom(stroke) }));
      return { kind: "cut", t, ids: event.cut.ids, pieces };
    }
    if (event.clear !== undefined) return { kind: "clear", t, ids: event.clear.ids };
    if (event.undo !== undefined) return { kind: "undo", t, ...event.undo };
    throw new Error(`an event at ${t} ms sets no field`);
  });
}

/**
 * The final geometry's strokes as the sheet's, each in its style if it has one: a pen's, each point
 * at time 0 — the crop, the
 * snapping and the boxes read no time.
 */
export function strokesOf(strokes: readonly FinalStroke[]): Stroke[] {
  return strokes.map(({ id, points, style }) => {
    const ink = points.map(({ x, y }) => ({ x, y, t: 0, p: PRESSURE }));
    return style === undefined
      ? { id, kind: "pen", points: ink }
      : { id, kind: "pen", style: styleFrom(style), points: ink };
  });
}

/** A protocol's groups as the sheet's. */
export function groupsFrom(groups: readonly ProtocolGroup[]): Group[] {
  return groups.map(({ label, stroke_ids }) => ({ label, ids: stroke_ids }));
}

/** The sheet's groups as the protocol's. */
export function groupsTo(groups: readonly Group[]): ProtocolGroup[] {
  return groups.map(({ label, ids }) => ({ label, stroke_ids: ids }));
}

/** A box in whole tenths, the sheet's, as the protocol's. */
export function tenthsTo({ minX, minY, maxX, maxY }: Box): TenthsBox {
  return { ymin: minY, xmin: minX, ymax: maxY, xmax: maxX };
}

/** A box in units as the protocol's, in whole tenths, as the rules take a place. */
export function tenthsOf({ minX, minY, maxX, maxY }: Box): TenthsBox {
  return tenthsTo({
    minX: tenths(minX),
    minY: tenths(minY),
    maxX: tenths(maxX),
    maxY: tenths(maxY),
  });
}

/** [ymin, xmin, ymax, xmax] as the protocol's box. */
function boxTo([ymin, xmin, ymax, xmax]: readonly [number, number, number, number]) {
  return { ymin, xmin, ymax, xmax };
}

/** A crop of a `CropSet`, its PNG empty: the vectors hold no pixels. */
export interface ProtocolCrop {
  readonly digit_height: number;
  readonly drawn_height: number;
  readonly width: number;
  readonly height: number;
  readonly margin_top: number;
  readonly margin_left: number;
  readonly scale: number;
  readonly line_width: number;
  readonly sheet_box: TenthsBox;
  readonly frames: readonly { readonly label: string; readonly box: TenthsBox }[];
  readonly png: "";
}

/** The sets of crops of a case, `CropSet`, without their PNG. */
export interface ProtocolCropSet {
  readonly ink_box: TenthsBox;
  readonly bundle_median: number;
  readonly crops: readonly ProtocolCrop[];
}

/** The sheet's crop as the protocol's, with no pixels. */
export function cropTo(crop: Crop): ProtocolCrop {
  const { digit, drawn, width, height, margins, scale, line, sheetBox, frames } = crop;
  return {
    digit_height: digit,
    drawn_height: drawn,
    width,
    height,
    margin_top: margins[0],
    margin_left: margins[1],
    scale,
    line_width: line,
    sheet_box: boxTo(sheetBox),
    frames: frames.map(({ label, box }) => ({ label, box: boxTo(box) })),
    png: "",
  };
}
