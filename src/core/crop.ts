import RBush from "rbush";
import { around, type Box, tenths } from "./geometry.js";
import type { Group } from "./groups.js";
import type { Stroke } from "./ink.js";
import { Sets } from "./sets.js";
import { SHEET } from "./sheet.js";

/**
 * The crop's rule in its numbers (R25): sizes on the crop in pixels, heights on the sheet in units.
 * The rule counts in whole numbers — places in tenths of a unit, as the groups do (R24) — and each
 * number it hands out that is not whole is one division of two whole numbers, so that tutor's
 * runner, which crops by the same rule, gets the same numbers to the bit.
 */
export const CROP = Object.freeze({
  /** The margin around the work, px (R06). */
  margin: 12,
  /**
   * A stroke lower than this, in units, is a line, not writing — a dot, a minus, a bar, an
   * underline — and is in no bundle, nor joins any.
   */
  flat: 15,
  /** The scale takes the median no higher than this, in units: a drawing alone stays a drawing. */
  ceiling: 100,
  /** The least width and height of a crop, px: Claude may err on images under 200 pixels. */
  side: 200,
  /**
   * The longest side, px, and the most visual tokens, ⌈w / 28⌉ × ⌈h / 28⌉: what every model of
   * Claude takes without scaling the image down, its standard tier.
   */
  edge: 1568,
  tokens: 1568,
  patch: 28,
  /** The height of a digit a crop is drawn at unless the module's manifest says another, px. */
  digit: 32,
  /**
   * The heights of digits a sample's crops are drawn at, px, until the eval protocol names its own
   * (R09; R08 tutor).
   */
  heights: Object.freeze([16, 24, 32, 48] as const),
  /** The tallest digit a crop takes, px: its ink then still stays within the margin. */
  tallest: 256,
});

/**
 * A group's frame on a crop: its label, and its ink in fractions 0–1000 of the crop — every pixel
 * the ink of its strokes touches lies within it.
 */
export interface Frame {
  readonly label: string;
  /** [ymin, xmin, ymax, xmax] in whole thousandths of the crop's height and width; min < max. */
  readonly box: readonly [number, number, number, number];
}

/** The crop of a sheet for checking (R25), all but its pixels: what lies where, at what scale. */
export interface Crop {
  /** D, the height of a digit asked for, px. */
  readonly digit: number;
  /** D′, the height digits are drawn at: D, or less if the crop at D would be too large. */
  readonly drawn: number;
  /** h_med, the median height of the bundles, in units: the floor if there are none. */
  readonly median: number;
  /** s, the crop's px to a sheet unit: D′ over h_med, or over the ceiling if h_med is above it. */
  readonly scale: number;
  /** The width of the line, px: D′ / 12, and 1 at least. */
  readonly line: number;
  readonly width: number;
  readonly height: number;
  /** The margins above and to the left of the work, px; below and to the right is what is left. */
  readonly margins: readonly [top: number, left: number];
  /** Where the crop with its margins lies on the sheet: [ymin, xmin, ymax, xmax], in units. */
  readonly sheetBox: readonly [number, number, number, number];
  /** The frames of the groups, in the order of their labels. */
  readonly frames: readonly Frame[];
  /**
   * The whole numbers all of it comes from, in tenths of a unit: the box of the points, and the
   * median the scale takes.
   */
  readonly exact: { readonly box: Box; readonly median: number };
}

/** A stroke as the crop sees it: the box of its points in tenths. */
interface Extent extends Box {
  readonly id: number;
}

/**
 * The bundles of the strokes on a sheet (R25): strokes no lower than `CROP.flat`, joined by a chain
 * of boxes that touch or overlap, whenever each was written. Each bundle by its IDs ascending, the
 * bundles by their smallest ID.
 */
export function bundlesOf(strokes: readonly Stroke[]): number[][] {
  return bundled(extentsOf(strokes))
    .map((bundle) => bundle.map(({ id }) => id).sort(byNumber))
    .sort((a, b) => (a[0] ?? 0) - (b[0] ?? 0));
}

/** h_med (R25): the lower median of the heights of the bundles, in units; `CROP.flat` if none. */
export function medianOf(strokes: readonly Stroke[]): number {
  return medianTenths(extentsOf(strokes)) / 10;
}

/**
 * The crop of the strokes on a sheet with its digits `digit` px high, and the frames of their
 * groups (R25): the strokes the sheet shows, and their groups by the sheet's rule (R24). A sheet
 * without strokes has no crop: it goes to no check (H3).
 */
export function cropOf(
  strokes: readonly Stroke[],
  groups: readonly Group[],
  digit: number = CROP.digit,
): Crop | null {
  if (!Number.isInteger(digit) || digit < 1 || digit > CROP.tallest) {
    throw new RangeError(
      `a digit ${digit} px high: a crop takes whole px from 1 to ${CROP.tallest}`,
    );
  }
  const extents = extentsOf(strokes);
  const members = membersOf(groups, extents);
  if (extents.length === 0) return null;
  const box = around(extents);
  const median = medianTenths(extents);
  const unit = Math.min(median, CROP.ceiling * 10);
  let size = sizeOf(box, unit, digit);
  // At a digit of 1 px every sheet fits: its sides are 200 px, for (14000 / 150 + 24) px is less.
  while (!fits(size) && size.drawn > 1) size = sizeOf(box, unit, size.drawn - 1);
  const { drawn, width, height, top, left } = size;
  // The line's width in twelfths of a px, 12 at least.
  const line = Math.max(drawn, 12);
  // Places on the crop as whole numbers, X × 24 × unit. A frame reaches past the points by half the
  // line and by the pixel at its edge, which the raster still shades: (line / 24 + 1) px.
  const across = (x: number) => 24 * ((x - box.minX) * drawn + left * unit);
  const down = (y: number) => 24 * ((y - box.minY) * drawn + top * unit);
  const reach = (line + 24) * unit;
  const frames = groups.map(({ label }, n): Frame => {
    const frame = around(members[n] ?? []);
    return {
      label,
      box: [
        floorDiv(1000 * (down(frame.minY) - reach), 24 * unit * height),
        floorDiv(1000 * (across(frame.minX) - reach), 24 * unit * width),
        ceilDiv(1000 * (down(frame.maxY) + reach), 24 * unit * height),
        ceilDiv(1000 * (across(frame.maxX) + reach), 24 * unit * width),
      ],
    };
  });
  const margins = [top, left] as const;
  const exact = { box, median: unit };
  return {
    digit,
    drawn,
    median: median / 10,
    scale: (10 * drawn) / unit,
    line: line / 12,
    width,
    height,
    margins,
    sheetBox: sheetBoxOf({ drawn, width, height, margins, exact }),
    frames,
    exact,
  };
}

/**
 * Where a crop with its margins lies on the sheet, its `sheet_box` (R25): [ymin, xmin, ymax, xmax]
 * in units, each one division of two whole numbers, from the whole numbers of the crop. A
 * submission's `sheet_box` is checked by it when the tutor's marks come back with it (R26).
 */
export function sheetBoxOf(
  crop: Pick<Crop, "drawn" | "width" | "height" | "margins" | "exact">,
): readonly [number, number, number, number] {
  const {
    drawn,
    width,
    height,
    margins: [top, left],
    exact: { box, median: unit },
  } = crop;
  return [
    (box.minY * drawn - top * unit) / (10 * drawn),
    (box.minX * drawn - left * unit) / (10 * drawn),
    (box.minY * drawn - top * unit + height * unit) / (10 * drawn),
    (box.minX * drawn - left * unit + width * unit) / (10 * drawn),
  ];
}

/**
 * The strokes as the crop sees them. A stroke without points, or an ID twice, is no sheet's, and a
 * point that is no finite place on the sheet is no point of it.
 */
function extentsOf(strokes: readonly Stroke[]): Extent[] {
  const seen = new Set<number>();
  return strokes.map(({ id, points }) => {
    if (seen.has(id)) throw new TypeError(`the stroke ${id} is on the sheet twice`);
    seen.add(id);
    if (points.length === 0) throw new TypeError(`the stroke ${id} has no points`);
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (const { x, y } of points) {
      if (!onSheet(x, SHEET.width) || !onSheet(y, SHEET.height)) {
        throw new RangeError(`the stroke ${id} has a point (${x}, ${y}) off the sheet`);
      }
      minX = Math.min(minX, tenths(x));
      minY = Math.min(minY, tenths(y));
      maxX = Math.max(maxX, tenths(x));
      maxY = Math.max(maxY, tenths(y));
    }
    return { id, minX, minY, maxX, maxY };
  });
}

function onSheet(value: number, size: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= size;
}

/**
 * Each group's strokes. The groups are those of the strokes given: each stroke in one of them, and
 * no stroke of a group missing from the sheet.
 */
function membersOf(groups: readonly Group[], extents: readonly Extent[]): Extent[][] {
  const byId = new Map(extents.map((extent) => [extent.id, extent]));
  const grouped = new Set<number>();
  const members = groups.map(({ label, ids }) => {
    if (ids.length === 0) throw new TypeError(`the group ${label} has no strokes`);
    return ids.map((id) => {
      const extent = byId.get(id);
      if (extent === undefined)
        throw new TypeError(`the group ${label} has a stroke ${id} not on the sheet`);
      if (grouped.has(id)) throw new TypeError(`the stroke ${id} is in two groups`);
      grouped.add(id);
      return extent;
    });
  });
  for (const { id } of extents) {
    if (!grouped.has(id)) throw new TypeError(`the stroke ${id} is in no group`);
  }
  return members;
}

/** The bundles, each the extents of its strokes: the index finds the boxes that touch. */
function bundled(extents: readonly Extent[]): Extent[][] {
  const tall = extents.filter(({ minY, maxY }) => maxY - minY >= CROP.flat * 10);
  const index = new RBush<Extent & { readonly at: number }>().load(
    tall.map((extent, at) => ({ ...extent, at })),
  );
  const sets = new Sets(tall.length);
  for (const [at, extent] of tall.entries()) {
    for (const other of index.search(extent)) sets.join(at, other.at);
  }
  const bundles = new Map<number, Extent[]>();
  for (const [at, extent] of tall.entries()) {
    const root = sets.root(at);
    const bundle = bundles.get(root);
    if (bundle === undefined) bundles.set(root, [extent]);
    else bundle.push(extent);
  }
  return [...bundles.values()];
}

/** h_med in tenths: the height of the bundle in the lower middle, ⌊(n − 1) / 2⌋ from the lowest. */
function medianTenths(extents: readonly Extent[]): number {
  const heights = bundled(extents)
    .map((bundle) => {
      const { minY, maxY } = around(bundle);
      return maxY - minY;
    })
    .sort(byNumber);
  return heights[Math.floor((heights.length - 1) / 2)] ?? CROP.flat * 10;
}

/** The size of the crop with digits `drawn` px high, and the margins that centre the work in it. */
interface Size {
  readonly drawn: number;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly left: number;
}

function sizeOf(box: Box, unit: number, drawn: number): Size {
  const width = ceilDiv((box.maxX - box.minX) * drawn, unit) + 2 * CROP.margin;
  const height = ceilDiv((box.maxY - box.minY) * drawn, unit) + 2 * CROP.margin;
  return {
    drawn,
    width: Math.max(width, CROP.side),
    height: Math.max(height, CROP.side),
    top: CROP.margin + floorDiv(Math.max(CROP.side - height, 0), 2),
    left: CROP.margin + floorDiv(Math.max(CROP.side - width, 0), 2),
  };
}

/** Whether every model of Claude takes the crop as it is: no side too long, no tokens too many. */
function fits(size: Size): boolean {
  return Math.max(size.width, size.height) <= CROP.edge && tokensOf(size) <= CROP.tokens;
}

/** What Claude counts an image as: ⌈w / 28⌉ × ⌈h / 28⌉ visual tokens, each a patch 28 px square. */
export function tokensOf({ width, height }: { width: number; height: number }): number {
  return ceilDiv(width, CROP.patch) * ceilDiv(height, CROP.patch);
}

/**
 * ⌊a / b⌋ of two whole numbers, a ≥ 0 and b > 0: what is left over is taken away first, so the
 * division is exact. The numbers of the rule stay below 2^53, where whole numbers are exact.
 */
function floorDiv(a: number, b: number): number {
  return (a - (a % b)) / b;
}

function ceilDiv(a: number, b: number): number {
  return floorDiv(a + b - 1, b);
}

function byNumber(a: number, b: number): number {
  return a - b;
}
