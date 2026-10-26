import RBush from "rbush";
import { type Box, boxOf, tenths } from "./geometry.js";
import type { Stroke } from "./ink.js";
import { Sets } from "./sets.js";

/**
 * The rule of the groups of strokes (R24): two strokes are neighbours if no more than `pause`
 * milliseconds lie between them and their boxes come within `across` sheet units of each other
 * across the sheet and within `down` units down it. A group is the strokes a chain of neighbours
 * joins. The rule counts in whole numbers — tenths of a unit and milliseconds, the precision of a
 * sample file (R09), rounded half up as `Math.round` rounds: 1000.5 tenths are 1001 — and only
 * subtracts and compares them, so that tutor's runner, which groups by the same rule, gets the same
 * groups to the bit.
 */
export interface GroupRule {
  /** The longest pause between two neighbours, in milliseconds. */
  readonly pause: number;
  /** How far apart across the sheet the boxes of two neighbours may be, in sheet units. */
  readonly across: number;
  /** How far apart down the sheet, in sheet units. */
  readonly down: number;
}

/**
 * The rule the sheet groups by (R24): 2 seconds, the threshold by which studies of writing tell a
 * pause of writing from one of thinking, and a cell of the default grid, across and down.
 */
export const GROUP_RULE: GroupRule = Object.freeze({ pause: 2000, across: 50, down: 50 });

/**
 * A group of the strokes on a sheet: its label, by place, and the IDs of its strokes, in ascending
 * order. The labels and the IDs are the table «label → stroke IDs» of one submission (R06).
 */
export interface Group {
  readonly label: string;
  readonly ids: readonly number[];
}

/** A stroke as the rule sees it: its box in tenths of a unit, and its time in whole milliseconds. */
interface Piece extends Box {
  readonly id: number;
  /** Its place in the strokes, for the sets of the groups. */
  readonly at: number;
  readonly start: number;
  readonly end: number;
}

/**
 * The groups of the strokes on a sheet (R24): the strokes it shows, with the times of their points
 * as they were written, in any order. Erased strokes are none of it: whoever groups a history
 * replays it first, and the groups come from what the sheet shows. Labelled by place, from the top
 * down (R09): A, B, … Z, then AA, AB, … — by the top of a group's rectangle, then its left edge.
 */
export function groupsOf(strokes: readonly Stroke[], rule: GroupRule = GROUP_RULE): Group[] {
  const pieces = piecesOf(strokes);
  const sets = new Sets(pieces.length);
  for (const [a, b] of pairsOf(pieces, rule)) sets.join(a.at, b.at);
  const members = new Map<number, Piece[]>();
  for (const piece of pieces) {
    const root = sets.root(piece.at);
    const group = members.get(root);
    if (group === undefined) members.set(root, [piece]);
    else group.push(piece);
  }
  return [...members.values()]
    .map((group) => ({ place: placeOf(group), ids: group.map(({ id }) => id).sort(byNumber) }))
    .sort((a, b) => byPlace(a.place, b.place) || (a.ids[0] ?? 0) - (b.ids[0] ?? 0))
    .map(({ ids }, n) => ({ label: labelOf(n), ids }));
}

/**
 * The pairs of neighbours among the strokes on a sheet, by ID (R24): each pair once, the smaller
 * ID first, in ascending order. Its groups join these pairs; the test vectors give them too, for a
 * runner to see where its grouping parts from the sheet's.
 */
export function neighboursOf(
  strokes: readonly Stroke[],
  rule: GroupRule = GROUP_RULE,
): [number, number][] {
  return pairsOf(piecesOf(strokes), rule)
    .map(([a, b]): [number, number] => (a.id < b.id ? [a.id, b.id] : [b.id, a.id]))
    .sort(([a1, a2], [b1, b2]) => a1 - b1 || a2 - b2);
}

/**
 * The rectangle of a group on the sheet: the box around the points of its strokes, in sheet units,
 * of the geometry it is given — the raw strokes on the device, the recorded ones in a sample (R09).
 * Its box in the fractions of a cut-out is the cut-out's (T13).
 */
export function rectOf(ids: readonly number[], strokes: readonly Stroke[]): Box {
  const wanted = new Set(ids);
  const points = strokes.filter(({ id }) => wanted.has(id)).flatMap(({ points }) => points);
  if (points.length === 0) throw new RangeError("no stroke of the group is on the sheet");
  return boxOf(points);
}

/**
 * The label of the group in the place `n`, from 0: A to Z, then AA to AZ, BA to ZZ, AAA… — letters
 * in base 26 without a zero, as the columns of a spreadsheet.
 */
export function labelOf(n: number): string {
  let label = "";
  for (let rest = n + 1; rest > 0; rest = Math.floor((rest - 1) / 26)) {
    label = String.fromCharCode(65 + ((rest - 1) % 26)) + label;
  }
  return label;
}

/**
 * The strokes as the rule sees them, each from one pass over its points. Rounding keeps the order
 * of numbers, so the rounded least and greatest are the least and greatest rounded. A stroke
 * without points, or an ID twice, is no sheet's.
 */
function piecesOf(strokes: readonly Stroke[]): Piece[] {
  const seen = new Set<number>();
  return strokes.map((stroke, at) => {
    if (seen.has(stroke.id)) throw new TypeError(`the stroke ${stroke.id} is on the sheet twice`);
    seen.add(stroke.id);
    const [first] = stroke.points;
    if (first === undefined) throw new TypeError(`the stroke ${stroke.id} has no points`);
    let { x: minX, y: minY, t: start } = first;
    let { x: maxX, y: maxY, t: end } = first;
    for (const { x, y, t } of stroke.points) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      start = Math.min(start, t);
      end = Math.max(end, t);
    }
    return {
      id: stroke.id,
      at,
      minX: tenths(minX),
      minY: tenths(minY),
      maxX: tenths(maxX),
      maxY: tenths(maxY),
      start: Math.round(start),
      end: Math.round(end),
    };
  });
}

/**
 * Every pair of neighbours, each once. The index finds the pieces whose boxes come near enough —
 * in whole tenths that is the rule's own test — and the time decides.
 */
function pairsOf(pieces: readonly Piece[], rule: GroupRule): [Piece, Piece][] {
  const { pause, across, down } = limitsOf(rule);
  const index = new RBush<Piece>().load(pieces);
  const pairs: [Piece, Piece][] = [];
  for (const piece of pieces) {
    const near = index.search({
      minX: piece.minX - across,
      minY: piece.minY - down,
      maxX: piece.maxX + across,
      maxY: piece.maxY + down,
    });
    for (const other of near) {
      if (other.at <= piece.at) continue;
      if (
        gap(piece.minX, piece.maxX, other.minX, other.maxX) <= across &&
        gap(piece.minY, piece.maxY, other.minY, other.maxY) <= down &&
        gap(piece.start, piece.end, other.start, other.end) <= pause
      ) {
        pairs.push([piece, other]);
      }
    }
  }
  return pairs;
}

/**
 * A rule's limits in the whole numbers the rule counts in. A limit that is not a finite number of
 * 0 or more is no rule's: it would group nothing, or every pair, without a word.
 */
function limitsOf(rule: GroupRule): GroupRule {
  for (const name of ["pause", "across", "down"] as const) {
    const value = rule[name];
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`the rule's ${name} is ${value}, not a finite number of 0 or more`);
    }
  }
  return { pause: Math.round(rule.pause), across: tenths(rule.across), down: tenths(rule.down) };
}

/** How far apart two spans are: 0 if they overlap or touch. */
function gap(low: number, high: number, otherLow: number, otherHigh: number): number {
  return Math.max(0, low - otherHigh, otherLow - high);
}

/** Where a group is, as its label takes it: its rectangle in tenths, then when it was begun. */
interface Place extends Box {
  readonly start: number;
}

function placeOf(group: readonly Piece[]): Place {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let start = Number.POSITIVE_INFINITY;
  for (const piece of group) {
    minX = Math.min(minX, piece.minX);
    minY = Math.min(minY, piece.minY);
    maxX = Math.max(maxX, piece.maxX);
    maxY = Math.max(maxY, piece.maxY);
    start = Math.min(start, piece.start);
  }
  return { minX, minY, maxX, maxY, start };
}

/**
 * From the top down, then from the left; rectangles alike in both go by their bottom, their right
 * and then by which was begun first. The IDs, which say the order of writing, settle nothing short
 * of two groups alike in all of that.
 */
function byPlace(a: Place, b: Place): number {
  return (
    a.minY - b.minY || a.minX - b.minX || a.maxY - b.maxY || a.maxX - b.maxX || a.start - b.start
  );
}

function byNumber(a: number, b: number): number {
  return a - b;
}
