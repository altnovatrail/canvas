// The boxes of a workbook's page and the strokes in them (R34, R37). Each visible stroke is in one
// box or in none: the rule takes it alone, in whole numbers, with no DOM and no time, and what is in
// no box is the draft. A stroke is a box's if the middle of the box of its points lies in the box
// widened by 120 thousandths of its size — 12 units of a box of 100, short of the 16 to halfway to
// the next box — and it is no wider and no taller than the box and 30 units on each side: a
// fraction's bar wider than the box is its own, and a line through the whole line is not. The
// core's entry point does not give the rule, and vectors/boxes.json pins it: the eval protocol
// takes it as it is (В47 in RUN.md).

import { extentOf, tenths } from "./geometry.js";
import type { Stroke } from "./ink.js";
import type { Page, PageBox } from "./page.js";

/** A box of a page: its item and its slot in the item's line, each from 1, and where it stands. */
export interface Cell {
  readonly item: number;
  readonly slot: number;
  readonly box: PageBox;
}

/**
 * The rule of boxes (R37), in thousandths of a box's width across and of its height down: how far
 * the box is widened for the middle of a stroke's points, and how wide and how tall the box of its
 * points may be.
 */
export interface BoxRule {
  readonly margin: number;
  readonly limit: number;
}

/** The rule the workbook has (R37): the sweep of T48 chose it. */
export const BOX_RULE: BoxRule = Object.freeze({ margin: 120, limit: 1600 });

/**
 * Which boxes of a workbook are filled (R34, R37): per item, per box, in the task's order, whether
 * the box holds a stroke.
 */
export type Filled = readonly (readonly boolean[])[];

/** The boxes of a page in the task's order: by item, then by slot. */
export function cellsOf(page: Page): readonly Cell[] {
  return Object.freeze(
    page.items.flatMap((item, i) =>
      item.boxes.map((box, j) => Object.freeze({ item: i + 1, slot: j + 1, box })),
    ),
  );
}

/**
 * The cell a stroke is in, by its place in `cells`, or −1 for the draft. Of the boxes it may be in,
 * the one that holds the more of its points, within the widened box, and of those the earlier, in
 * the order of `cells`: the task's order on a page. A stroke with no points is a TypeError, and
 * one with a point off the sheet a RangeError, as the crop has them.
 */
export function cellOf(stroke: Stroke, cells: readonly Cell[], rule: BoxRule = BOX_RULE): number {
  if (rule !== BOX_RULE) checkRule(rule);
  const { margin, limit } = rule;
  const { minX, minY, maxX, maxY } = extentOf(stroke);
  const points = stroke.points.map(({ x, y }) => [tenths(x), tenths(y)] as const);
  let chosen = -1;
  let most = 0;
  for (const [c, { box }] of cells.entries()) {
    const left = 10 * box.left;
    const top = 10 * box.top;
    const width = 10 * box.width;
    const height = 10 * box.height;
    if (1000 * (maxX - minX) > limit * width || 1000 * (maxY - minY) > limit * height) continue;
    // The middle, doubled to stay whole: 2·left − 2·margin·width ≤ minX + maxX, and so on.
    const middle =
      1000 * (minX + maxX - 2 * left) >= -2 * margin * width &&
      1000 * (minX + maxX - 2 * left - 2 * width) <= 2 * margin * width &&
      1000 * (minY + maxY - 2 * top) >= -2 * margin * height &&
      1000 * (minY + maxY - 2 * top - 2 * height) <= 2 * margin * height;
    if (!middle) continue;
    let held = 0;
    for (const [x, y] of points) {
      if (
        1000 * (x - left) >= -margin * width &&
        1000 * (x - left - width) <= margin * width &&
        1000 * (y - top) >= -margin * height &&
        1000 * (y - top - height) <= margin * height
      ) {
        held += 1;
      }
    }
    if (chosen < 0 || held > most) {
      chosen = c;
      most = held;
    }
  }
  return chosen;
}

/** A filled box and the IDs of its strokes, in ascending order. */
export interface Filling {
  readonly item: number;
  readonly slot: number;
  readonly ids: readonly number[];
}

/**
 * The table of the boxes the strokes fill (R34): each box that holds a stroke, in the order of
 * `cells`, with the IDs of its strokes. A stroke ID twice is a TypeError.
 */
export function tableOf(
  strokes: readonly Stroke[],
  cells: readonly Cell[],
  rule: BoxRule = BOX_RULE,
): readonly Filling[] {
  const ids = new Set<number>();
  const held: number[][] = cells.map(() => []);
  for (const stroke of strokes) {
    if (ids.has(stroke.id)) throw new TypeError(`stroke ${stroke.id} is given twice`);
    ids.add(stroke.id);
    const c = cellOf(stroke, cells, rule);
    if (c >= 0) held[c]?.push(stroke.id);
  }
  return Object.freeze(
    cells.flatMap(({ item, slot }, c) => {
      const own = held[c] ?? [];
      return own.length === 0
        ? []
        : [Object.freeze({ item, slot, ids: Object.freeze(own.sort((a, b) => a - b)) })];
    }),
  );
}

/**
 * Which boxes of a page are filled, per item, per slot, in the task's order: the cells `taken`
 * names by their place in `cells` — the page's, from `cellsOf` — each from `cellOf`; −1, the
 * draft, fills none.
 */
export function filledOf(page: Page, cells: readonly Cell[], taken: Iterable<number>): Filled {
  const rows = page.items.map(({ boxes }) => boxes.map(() => false));
  for (const c of taken) {
    const cell = cells[c];
    const row = cell === undefined ? undefined : rows[cell.item - 1];
    if (cell !== undefined && row !== undefined) row[cell.slot - 1] = true;
  }
  return Object.freeze(rows.map((row) => Object.freeze(row)));
}

/** A rule of whole thousandths, the margin up to the box itself and the limit at least nothing. */
function checkRule({ margin, limit }: BoxRule): void {
  if (!Number.isInteger(margin) || margin < 0 || margin > 1000) {
    throw new RangeError(`the margin of the rule of boxes is a whole 0 to 1000, not ${margin}`);
  }
  if (!Number.isInteger(limit) || limit < 0 || limit > 100_000) {
    throw new RangeError(`the limit of the rule of boxes is a whole 0 to 100000, not ${limit}`);
  }
}
