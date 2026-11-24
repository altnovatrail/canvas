import { type Crop, inkOf, widthOf } from "./crop.js";
import { tenths } from "./geometry.js";
import type { Stroke } from "./ink.js";
import { encodePNG } from "./png.js";

/** A place on the crop, px from its top left corner. */
interface Spot {
  readonly x: number;
  readonly y: number;
}

/**
 * How many bytes a pixel of a crop of these strokes takes: 1, grey, when none of them has a
 * style, and 3, RGB, when one has.
 */
export function channelsOf(strokes: readonly Stroke[]): 1 | 3 {
  return strokes.some((stroke) => stroke.style !== undefined) ? 3 : 1;
}

/**
 * The pixels of a crop, row by row from the top, of the strokes the crop was made of: grey, a
 * byte each, white 255 and the ink 0, when no stroke has a style, and RGB, three bytes each, when
 * one has (`channelsOf`). Every segment of a stroke is a line as wide all along, with round ends,
 * and a stroke of one point a dot as wide as the line: a pixel takes the share of it that the line
 * covers, along a ramp a pixel wide at the line's edge. In grey a pixel is the darkest of what
 * covers it. In RGB the strokes are laid on white by their IDs ascending, each as one layer — what
 * its segments cover of a pixel is the most any of them does, so where it crosses itself it is no
 * darker —, its line its width at the crop's scale and 1 px at least: a stroke without a style
 * black and opaque; of the kind pen or liner its colour at its opacity over what lies under it;
 * of the kind marker what lies under it multiplied by its colour, at its opacity. The places are
 * the crop's own whole numbers, from the points in tenths of a unit, as a sample keeps them. Only
 * adding, subtracting, multiplying, dividing, Math.sqrt and Math.round go into a pixel, which
 * ECMAScript rounds alike in every engine, so the bytes are the same in each.
 */
export function rasterOf(strokes: readonly Stroke[], crop: Crop): Uint8Array<ArrayBuffer> {
  return channelsOf(strokes) === 1 ? grayOf(strokes, crop) : colourOf(strokes, crop);
}

/** The PNG of a crop: its pixels, encoded, grey or RGB as they are. */
export function pictureOf(strokes: readonly Stroke[], crop: Crop): Uint8Array<ArrayBuffer> {
  return encodePNG(rasterOf(strokes, crop), crop.width, crop.height, channelsOf(strokes));
}

/** A point's place on the crop: a whole number over the median, one division, as the crop's own. */
function spotsOf(stroke: Stroke, crop: Crop): Spot[] {
  const [top, left] = crop.margins;
  const { box, median: unit } = crop.exact;
  const { drawn } = crop;
  return stroke.points.map(({ x, y }) => ({
    x: ((tenths(x) - box.minX) * drawn + left * unit) / unit,
    y: ((tenths(y) - box.minY) * drawn + top * unit) / unit,
  }));
}

/** Each segment of a stroke on the crop, by its ends: a stroke of one point is one of no length. */
function eachSegment(spots: readonly Spot[], each: (from: Spot, to: Spot) => void): void {
  const [first] = spots;
  if (spots.length === 1 && first !== undefined) each(first, first);
  for (let k = 1; k < spots.length; k++) {
    const [a, b] = [spots[k - 1], spots[k]];
    if (a !== undefined && b !== undefined) each(a, b);
  }
}

function grayOf(strokes: readonly Stroke[], crop: Crop): Uint8Array<ArrayBuffer> {
  const { width, height, drawn } = crop;
  const gray = new Uint8Array(width * height).fill(255);
  const reach = Math.max(drawn, 12) / 24;
  const darken = (at: number, cover: number) => {
    const value = Math.round(255 * (1 - Math.min(1, cover)));
    if (value < (gray[at] ?? 255)) gray[at] = value;
  };
  for (const stroke of strokes) {
    eachSegment(spotsOf(stroke, crop), (a, b) => paint(width, height, a, b, reach, darken));
  }
  return gray;
}

function colourOf(strokes: readonly Stroke[], crop: Crop): Uint8Array<ArrayBuffer> {
  const { width, height, drawn } = crop;
  const unit = crop.exact.median;
  const rgb = new Uint8Array(3 * width * height).fill(255);
  // What the stroke being laid covers of each pixel, cleared after it within its own box.
  const covered = new Float64Array(width * height);
  const cover = (at: number, share: number) => {
    const own = Math.min(1, share);
    if (own > (covered[at] ?? 0)) covered[at] = own;
  };
  for (const stroke of [...strokes].sort((a, b) => a.id - b.id)) {
    const reach = inkOf(widthOf(stroke), drawn, unit) / (24 * unit);
    const spots = spotsOf(stroke, crop);
    eachSegment(spots, (a, b) => paint(width, height, a, b, reach, cover));
    const { style } = stroke;
    const opacity = style === undefined ? 1 : style.opacity / 100;
    const [red, green, blue] = style === undefined ? [0, 0, 0] : coloursOf(style.color);
    const multiply = style?.pen === "marker";
    const lay = (under: number, colour: number, share: number) =>
      Math.round(under * (1 - share) + (multiply ? (under * colour) / 255 : colour) * share);
    const box = boxOf(spots, reach, width, height);
    for (let row = box.top; row <= box.bottom; row++) {
      for (let column = box.left; column <= box.right; column++) {
        const at = row * width + column;
        const share = covered[at] ?? 0;
        if (share === 0) continue;
        covered[at] = 0;
        const a = opacity * share;
        rgb[3 * at] = lay(rgb[3 * at] ?? 255, red, a);
        rgb[3 * at + 1] = lay(rgb[3 * at + 1] ?? 255, green, a);
        rgb[3 * at + 2] = lay(rgb[3 * at + 2] ?? 255, blue, a);
      }
    }
  }
  return rgb;
}

/** A colour `#rrggbb` as its three channels. */
function coloursOf(colour: string): [number, number, number] {
  const channel = (at: number) => Number.parseInt(colour.slice(at, at + 2), 16);
  return [channel(1), channel(3), channel(5)];
}

/** The pixels a stroke's line may shade, within the crop: as far as `paint` looks. */
function boxOf(
  spots: readonly Spot[],
  reach: number,
  width: number,
  height: number,
): { left: number; top: number; right: number; bottom: number } {
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  for (const { x, y } of spots) {
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x);
    bottom = Math.max(bottom, y);
  }
  return {
    left: Math.max(0, Math.floor(left - reach - 1)),
    top: Math.max(0, Math.floor(top - reach - 1)),
    right: Math.min(width - 1, Math.ceil(right + reach + 1)),
    bottom: Math.min(height - 1, Math.ceil(bottom + reach + 1)),
  };
}

/**
 * One segment's ink on the pixels near it: `take` gets each pixel it covers, by its place, with
 * how much of it the line covers, above 0 and 1 or more within the line. Its ends go in one order
 * whichever way it was written, so a stroke drawn back to front gives the same bytes.
 */
function paint(
  width: number,
  height: number,
  from: Spot,
  to: Spot,
  reach: number,
  take: (at: number, cover: number) => void,
): void {
  const forward = from.x < to.x || (from.x === to.x && from.y <= to.y);
  const a = forward ? from : to;
  const b = forward ? to : from;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = dx * dx + dy * dy;
  const firstColumn = Math.max(0, Math.floor(Math.min(a.x, b.x) - reach - 1));
  const lastColumn = Math.min(width - 1, Math.ceil(Math.max(a.x, b.x) + reach + 1));
  const firstRow = Math.max(0, Math.floor(Math.min(a.y, b.y) - reach - 1));
  const lastRow = Math.min(height - 1, Math.ceil(Math.max(a.y, b.y) + reach + 1));
  for (let row = firstRow; row <= lastRow; row++) {
    const cy = row + 0.5;
    for (let column = firstColumn; column <= lastColumn; column++) {
      const cx = column + 0.5;
      // The point of the segment nearest the pixel's centre, as a share of the way from a to b.
      const along =
        length === 0 ? 0 : Math.min(1, Math.max(0, ((cx - a.x) * dx + (cy - a.y) * dy) / length));
      const ex = cx - (a.x + along * dx);
      const ey = cy - (a.y + along * dy);
      const cover = reach + 0.5 - Math.sqrt(ex * ex + ey * ey);
      if (cover > 0) take(row * width + column, cover);
    }
  }
}
