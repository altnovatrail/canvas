import type { Crop } from "./crop.js";
import { tenths } from "./geometry.js";
import type { Stroke } from "./ink.js";
import { encodePNG } from "./png.js";

/** A place on the crop, px from its top left corner. */
interface Spot {
  readonly x: number;
  readonly y: number;
}

/**
 * The pixels of a crop (R25): grey, a byte each, row by row from the top, white 255 and the ink 0,
 * of the strokes the crop was made of. Every segment of a stroke is a line as wide all along, with
 * round ends, and a stroke of one point a dot as wide as the line: a pixel takes the share of it
 * that the line covers, along a ramp a pixel wide at the line's edge, and the darkest of what
 * covers it. The places are the crop's own whole numbers, from the points in tenths of a unit, as
 * a sample keeps them (R09). Only adding, subtracting, multiplying, dividing and Math.sqrt go into
 * a pixel, which ECMAScript rounds alike in every engine, so the bytes are the same in each.
 */
export function rasterOf(strokes: readonly Stroke[], crop: Crop): Uint8Array<ArrayBuffer> {
  const { width, height, drawn } = crop;
  const [top, left] = crop.margins;
  const { box, median: unit } = crop.exact;
  const gray = new Uint8Array(width * height).fill(255);
  const reach = Math.max(drawn, 12) / 24;
  // A whole number over the median: one division, as the crop's own numbers are.
  const spot = ({ x, y }: { x: number; y: number }): Spot => ({
    x: ((tenths(x) - box.minX) * drawn + left * unit) / unit,
    y: ((tenths(y) - box.minY) * drawn + top * unit) / unit,
  });
  for (const { points } of strokes) {
    const spots = points.map(spot);
    const [first] = spots;
    if (spots.length === 1 && first !== undefined) paint(gray, width, height, first, first, reach);
    for (let k = 1; k < spots.length; k++) {
      const [a, b] = [spots[k - 1], spots[k]];
      if (a !== undefined && b !== undefined) paint(gray, width, height, a, b, reach);
    }
  }
  return gray;
}

/** The PNG of a crop: its pixels, encoded (R25). */
export function pictureOf(strokes: readonly Stroke[], crop: Crop): Uint8Array<ArrayBuffer> {
  return encodePNG(rasterOf(strokes, crop), crop.width, crop.height);
}

/**
 * One segment's ink on the pixels near it. Its ends go in one order whichever way it was written,
 * so a stroke drawn back to front gives the same bytes.
 */
function paint(
  gray: Uint8Array,
  width: number,
  height: number,
  from: Spot,
  to: Spot,
  reach: number,
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
      if (cover <= 0) continue;
      const value = Math.round(255 * (1 - Math.min(1, cover)));
      const at = row * width + column;
      if (value < (gray[at] ?? 255)) gray[at] = value;
    }
  }
}
