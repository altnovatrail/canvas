// spec's test vectors of the rules the sheet shares with the eval runner of tutor — the groups of
// strokes, the crop, the snapping of a model's box and the boxes of a workbook (R94 spec;
// contracts/README.md, section 12) — as the npm package @altnovatrail/contracts gives them at the
// tag of spec that canvas stands on, and what turns their messages into the sheet's own types. The
// vectors are spec's, in the protocol's form; the sheet's tests hold its code to them (T16).

import boxes from "@altnovatrail/contracts/vectors/eval/v1/boxes.json" with { type: "json" };
import crops from "@altnovatrail/contracts/vectors/eval/v1/crops.json" with { type: "json" };
import groups from "@altnovatrail/contracts/vectors/eval/v1/groups.json" with { type: "json" };
import snaps from "@altnovatrail/contracts/vectors/eval/v1/snaps.json" with { type: "json" };
import type { Box, Group, HistoryEvent, Stroke } from "@altnovatrail/spec/canvas";
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

/** A stroke of the final geometry, `FinalStroke`: its ID and its points, with no time. */
export interface FinalStroke {
  readonly id: number;
  readonly points: readonly { readonly x: number; readonly y: number }[];
}

/** An event of the history of writing, `HistoryEvent`: its time and the field it sets. */
export interface ProtocolEvent {
  readonly t_ms: number;
  readonly write?: {
    readonly id: number;
    readonly pointer: string;
    readonly points: readonly { readonly x: number; readonly y: number; readonly t_ms: number }[];
  };
  readonly erase?: { readonly ids: readonly number[] };
  readonly clear?: { readonly ids: readonly number[] };
  readonly undo?: { readonly removed: readonly number[]; readonly restored: readonly number[] };
}

/**
 * The pressure a point of a protocol's stroke is given: a sample holds none (R93 spec), and no rule
 * of the vectors reads it.
 */
const PRESSURE = 0.5;

/**
 * A protocol's history as the element keeps it (contracts/README.md, section 12): an event's kind
 * is the field it sets, its `t` is `t_ms`, a stroke's kind is its pointer and a point's `t` its
 * `t_ms`.
 */
export function historyOf(events: readonly ProtocolEvent[]): HistoryEvent[] {
  return events.map((event): HistoryEvent => {
    const t = event.t_ms;
    if (event.write !== undefined) {
      const { id, pointer, points } = event.write;
      const ink = points.map(({ x, y, t_ms }) => ({ x, y, t: t_ms, p: PRESSURE }));
      return { kind: "write", t, stroke: { id, kind: pointer, points: ink } };
    }
    if (event.erase !== undefined) return { kind: "erase", t, ids: event.erase.ids };
    if (event.clear !== undefined) return { kind: "clear", t, ids: event.clear.ids };
    if (event.undo !== undefined) return { kind: "undo", t, ...event.undo };
    throw new Error(`an event at ${t} ms sets no field`);
  });
}

/**
 * The final geometry's strokes as the sheet's: a pen's, each point at time 0 — the crop, the
 * snapping and the boxes read no time.
 */
export function strokesOf(strokes: readonly FinalStroke[]): Stroke[] {
  return strokes.map(({ id, points }) => ({
    id,
    kind: "pen",
    points: points.map(({ x, y }) => ({ x, y, t: 0, p: PRESSURE })),
  }));
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

/** A box in units as the protocol's, in whole tenths, as the rules take a place (section 12). */
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
