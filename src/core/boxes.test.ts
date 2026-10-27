import { describe, expect, test } from "vitest";
import { BOX_RULE, type BoxRule, type Cell, cellOf, cellsOf, filledOf, tableOf } from "./boxes.js";
import type { Stroke } from "./ink.js";
import { pageOf } from "./page.js";
import { PAGES } from "./pages.fixture.js";
import { crowd, stroke } from "./sheets.fixture.js";
import {
  comparisons,
  DENSITIES,
  edgeDigits,
  edgeSigns,
  fractions,
  seeded,
  WORKBOOKS,
  type Workbook,
} from "./workbooks.fixture.js";

/** A box of a page of its own, at `left`, `top`, `width` by `height` units. */
function cell(
  item: number,
  slot: number,
  left: number,
  top: number,
  width = 100,
  height = 100,
): Cell {
  return { item, slot, box: { left, top, width, height } };
}

/** A dot at (x, y): two points in one place, as the recorder makes one. */
function dot(id: number, x: number, y: number): Stroke {
  return stroke(id, [x, y, 0], [x, y, 30]);
}

/** The cells of the edges: a box 100 × 100, one 120 × 80, and two that overlap. */
const EDGES: readonly Cell[] = [
  cell(1, 1, 100, 100),
  cell(2, 1, 300, 100, 120, 80),
  cell(3, 1, 500, 300),
  cell(3, 2, 560, 300),
];

/** A stroke's place, `[item, slot]`, or null for the draft. */
function placeOf(found: number, cells: readonly Cell[]): readonly [number, number] | null {
  const own = cells[found];
  return own === undefined ? null : [own.item, own.slot];
}

describe("the rule's edges, in whole tenths", () => {
  const at = (s: Stroke, rule?: BoxRule) => placeOf(cellOf(s, EDGES, rule), EDGES);

  test("a dot whose middle is on the widened edge is the box's, and a tenth past it is not, on every side", () => {
    // The box of 100 widens by 12 units on each side: 88 to 212 across and down.
    for (const [x, y] of [
      [88, 150],
      [212, 150],
      [150, 88],
      [150, 212],
    ] as const) {
      expect(at(dot(1, x, y))).toEqual([1, 1]);
    }
    for (const [x, y] of [
      [87.9, 150],
      [212.1, 150],
      [150, 87.9],
      [150, 212.1],
    ] as const) {
      expect(at(dot(1, x, y))).toBeNull();
    }
    // A place rounds half up to its tenth: 87.96 is 880 tenths, on the edge; 87.94 is 879, past it.
    expect(at(dot(1, 87.96, 150))).toEqual([1, 1]);
    expect(at(dot(1, 87.94, 150))).toBeNull();
  });

  test("the margin and the limit are thousandths of the box's own width across and its height down", () => {
    // 120 wide and 80 high: 14.4 units across, 9.6 down.
    expect(at(dot(1, 285.6, 140))).toEqual([2, 1]);
    expect(at(dot(1, 285.5, 140))).toBeNull();
    expect(at(dot(1, 360, 90.4))).toEqual([2, 1]);
    expect(at(dot(1, 360, 90.3))).toBeNull();
    // At most 1.6 of the box: 192 across, 128 down.
    expect(at(stroke(1, [264, 140, 0], [456, 140, 9]))).toEqual([2, 1]);
    expect(at(stroke(1, [264, 140, 0], [456.1, 140, 9]))).toBeNull();
    expect(at(stroke(1, [360, 76, 0], [360, 204, 9]))).toEqual([2, 1]);
    expect(at(stroke(1, [360, 76, 0], [360, 204.1, 9]))).toBeNull();
  });

  test("a line as wide as the limit is the box's, and a tenth wider is not, wherever its middle", () => {
    expect(at(stroke(1, [70, 150, 0], [230, 150, 9]))).toEqual([1, 1]);
    expect(at(stroke(1, [70, 150, 0], [230.1, 150, 9]))).toBeNull();
    // A point of its own, a stroke the recorder ended at once, is a dot.
    expect(at(stroke(1, [150, 150, 0]))).toEqual([1, 1]);
  });

  test("of two boxes a stroke may be in, the one with the more of its points is it, and of two with as many the earlier", () => {
    // The boxes overlap from 560 to 600; the middle of each stroke is at 580.
    expect(at(stroke(1, [530, 350, 0], [580, 350, 9], [590, 350, 18], [630, 350, 27]))).toEqual([
      3, 1,
    ]);
    const more = stroke(
      1,
      [550, 350, 0],
      [600, 350, 9],
      [610, 350, 18],
      [620, 350, 27],
      [640, 350, 36],
    );
    expect(at(more)).toEqual([3, 2]);
    expect(at(stroke(1, [550, 350, 0], [610, 350, 27]))).toEqual([3, 1]);
  });

  test("a stroke without points is a TypeError, a stroke ID twice is one too, and a rule that is no rule a RangeError", () => {
    expect(() => cellOf({ id: 7, kind: "pen", points: [] }, EDGES)).toThrow(TypeError);
    expect(() => tableOf([dot(1, 150, 150), dot(1, 150, 150)], EDGES)).toThrow(TypeError);
    for (const rule of [
      { margin: -1, limit: 1600 },
      { margin: 1001, limit: 1600 },
      { margin: 12.5, limit: 1600 },
      { margin: 120, limit: Number.NaN },
      { margin: 120, limit: -1 },
    ]) {
      expect(() => cellOf(dot(1, 150, 150), EDGES, rule)).toThrow(RangeError);
    }
  });

  test("the table and the filled boxes are frozen, in the order of the boxes, the IDs in ascending order", () => {
    const strokes = [dot(9, 150, 150), dot(3, 160, 160), dot(5, 360, 140), dot(4, 900, 900)];
    const table = tableOf(strokes, EDGES);
    expect(table).toEqual([
      { item: 1, slot: 1, ids: [3, 9] },
      { item: 2, slot: 1, ids: [5] },
    ]);
    expect(Object.isFrozen(table) && table.every(Object.isFrozen)).toBe(true);
    expect(Object.isFrozen(table[0]?.ids)).toBe(true);
    const page = pageOf(PAGES.find(({ name }) => name === "workbook-page")?.items ?? []);
    const filled = filledOf(page, cellsOf(page), [0, -1, 5, 5]);
    expect(filled).toEqual([[true], [false], [false], [false], [false, true]]);
    expect(Object.isFrozen(filled) && filled.every(Object.isFrozen)).toBe(true);
  });
});

describe("what the rule's verdict depends on", () => {
  const book = edgeSigns();
  const strokes = book.work.strokes;
  const verdicts = strokes.map((s) => cellOf(s, book.cells));

  test("a stroke's own points and the boxes alone: not the other strokes, their order, its ID or its points' order", () => {
    for (const [n, s] of strokes.entries()) {
      expect(cellOf({ ...s, id: 1000 + n }, book.cells)).toBe(verdicts[n]);
      expect(cellOf({ ...s, points: [...s.points].reverse() }, book.cells)).toBe(verdicts[n]);
    }
    const reversed = [...strokes].reverse();
    const table = tableOf(strokes, book.cells);
    expect(tableOf(reversed, book.cells)).toEqual(table);
    expect(tableOf(JSON.parse(JSON.stringify(strokes)) as Stroke[], book.cells)).toEqual(table);
  });

  test("a move of the strokes and the boxes by whole units moves nothing", () => {
    const moved = book.cells.map((c) => ({
      ...c,
      box: { ...c.box, left: c.box.left + 37, top: c.box.top - 21 },
    }));
    for (const [n, s] of strokes.entries()) {
      const points = s.points.map((p) => ({ ...p, x: p.x + 37, y: p.y - 21 }));
      expect(cellOf({ ...s, points }, moved)).toBe(verdicts[n]);
    }
  });

  test("a wider margin never leaves a stroke in no box that a narrower one put in one", () => {
    for (const { work, cells } of WORKBOOKS.map((make) => make())) {
      for (const s of work.strokes) {
        let taken = false;
        for (const margin of [0, 40, 80, 120, 160, 250, 500, 1000]) {
          const found = cellOf(s, cells, { margin, limit: BOX_RULE.limit }) >= 0;
          expect(taken && !found).toBe(false);
          taken = found;
        }
      }
    }
  });

  test("on every page of the layout, the task's order of the boxes is their order by top, then left", () => {
    for (const { items, refused } of PAGES) {
      if (refused !== undefined) continue;
      const cells = cellsOf(pageOf(items));
      const placed = [...cells].sort((a, b) => a.box.top - b.box.top || a.box.left - b.box.left);
      expect(placed).toEqual(cells);
    }
  });
});

test("on the page, the boxes follow the strokes the work shows: written, erased, undone, cleared", () => {
  const book = edgeDigits();
  const page = pageOf(PAGES.find(({ name }) => name === "times-ten")?.items ?? []);
  const filled = () =>
    filledOf(
      page,
      book.cells,
      book.work.strokes.map((s) => cellOf(s, book.cells)),
    );
  const all = filled();
  expect(all.flat().every(Boolean)).toBe(true);
  const first = tableOf(book.work.strokes, book.cells)[0];
  if (first === undefined) throw new Error("no box filled");
  book.work.erase(first.ids, 90_000);
  expect(filled()[0]).toEqual([false]);
  book.work.undo(90_100);
  expect(filled()).toEqual(all);
  book.work.clear(90_200);
  expect(filled().flat().some(Boolean)).toBe(false);
  book.work.undo(90_300);
  expect(filled()).toEqual(all);
});

/** What a rule does on the corpus at a density: answers it loses, and draft it takes into a box. */
function judge(books: readonly Workbook[], rule: BoxRule) {
  const lost: string[] = [];
  const taken: string[] = [];
  let split = 0;
  for (const book of books) {
    const verdicts = new Map(book.work.strokes.map((s) => [s.id, cellOf(s, book.cells, rule)]));
    for (const [id, found] of verdicts) {
      const place = book.places.get(id);
      const own = placeOf(found, book.cells);
      if (place === "draft" && own !== null) taken.push(`${book.name}#${id}`);
      if (Array.isArray(place) && (own === null || own[0] !== place[0] || own[1] !== place[1])) {
        lost.push(`${book.name}#${id}`);
      }
    }
    for (const character of book.characters) {
      const shown = character.filter((id) => verdicts.has(id));
      if (new Set(shown.map((id) => verdicts.get(id))).size > 1) split += 1;
    }
  }
  return { lost, taken, split };
}

/** The corpus of the sweep at a density: the hand-made workbooks and a hundred seeded ones. */
function corpus(density: (typeof DENSITIES)[number]): Workbook[] {
  return [
    ...WORKBOOKS.map((make) => make(density)),
    ...Array.from({ length: 100 }, (_, n) => seeded(n + 1, density)),
  ];
}

describe("the rule on the corpus of the sweep (R37)", () => {
  const books = DENSITIES.map(corpus);

  test("at every density of points it loses no answer, cuts no character and takes two strokes of draft, the same two", () => {
    for (const set of books) {
      expect(judge(set, BOX_RULE)).toEqual({
        lost: [],
        taken: ["draft#14", "seeded-66#38"],
        split: 0,
      });
    }
    // 3478 strokes of answers and 896 of draft at each density, the either aside.
    const places = books[0]?.flatMap((book) =>
      book.work.strokes.map(({ id }) => book.places.get(id)),
    );
    expect(places?.filter(Array.isArray)).toHaveLength(3478);
    expect(places?.filter((place) => place === "draft")).toHaveLength(896);
  });

  test("the rules beside it each break something, at points every 2 units", () => {
    const set = books[2] ?? [];
    // A narrower margin loses the «=» pushed past a box's top.
    expect(judge(set, { margin: 80, limit: 1600 }).lost).toHaveLength(1);
    // A wider one takes more draft.
    expect(judge(set, { margin: 160, limit: 1600 }).taken).toHaveLength(6);
    // A lower limit loses the fraction's bar of 140.
    expect(judge(set, { margin: 120, limit: 1200 }).lost).toEqual(["fractions#21"]);
    // A higher one takes one more stroke of draft.
    expect(judge(set, { margin: 120, limit: 2000 }).taken).toHaveLength(3);
  });
});

/**
 * The rule again, from its words in R37, in BigInt and by brute force: the middle of the box of a
 * stroke's points, doubled, against the widened box, doubled too, in a common unit of a
 * ten-thousandth; every cell scored, then the most points, then the earliest.
 */
function reference(s: Stroke, cells: readonly Cell[], { margin, limit }: BoxRule): number {
  const xs = s.points.map((p) => BigInt(Math.round(p.x * 10)));
  const ys = s.points.map((p) => BigInt(Math.round(p.y * 10)));
  const least = (v: bigint[]) => v.reduce((a, b) => (b < a ? b : a));
  const most = (v: bigint[]) => v.reduce((a, b) => (b > a ? b : a));
  const [x0, x1, y0, y1] = [least(xs), most(xs), least(ys), most(ys)];
  const m = BigInt(margin);
  const l = BigInt(limit);
  const scored = cells.map(({ box }, c) => {
    const [left, top, width, height] = [box.left, box.top, box.width, box.height].map((v) =>
      BigInt(v * 10),
    ) as [bigint, bigint, bigint, bigint];
    const within = (v: bigint, from: bigint, span: bigint) =>
      v * 1000n >= from * 1000n - m * span && v * 1000n <= (from + span) * 1000n + m * span;
    const sized = (x1 - x0) * 1000n <= l * width && (y1 - y0) * 1000n <= l * height;
    const middle =
      (x0 + x1) * 1000n >= 2n * (left * 1000n - m * width) &&
      (x0 + x1) * 1000n <= 2n * ((left + width) * 1000n + m * width) &&
      (y0 + y1) * 1000n >= 2n * (top * 1000n - m * height) &&
      (y0 + y1) * 1000n <= 2n * ((top + height) * 1000n + m * height);
    const held = xs.filter((x, k) => within(x, left, width) && within(ys[k] ?? 0n, top, height));
    return { c, ok: sized && middle, held: held.length };
  });
  const ranked = scored.filter(({ ok }) => ok).sort((a, b) => b.held - a.held || a.c - b.c);
  return ranked[0]?.c ?? -1;
}

test("the rule is its words: a second writing of it, in BigInt, agrees on the corpus, on crowds and on boxes that overlap", () => {
  const rules: BoxRule[] = [
    BOX_RULE,
    { margin: 0, limit: 1000 },
    { margin: 500, limit: 3000 },
    { margin: 1000, limit: 100_000 },
  ];
  const overlapping = Array.from({ length: 12 }, (_, n) =>
    cell(1 + Math.floor(n / 3), 1 + (n % 3), 60 * n, 40 * (n % 5), 90 + 7 * n, 60 + 11 * (n % 4)),
  );
  const sets = [corpus(undefined), corpus(DENSITIES[2])];
  for (const rule of rules) {
    for (const set of sets) {
      for (const { work, cells } of set) {
        for (const s of work.strokes) {
          expect(cellOf(s, cells, rule)).toBe(reference(s, cells, rule));
        }
      }
    }
    for (let seed = 1; seed <= 200; seed++) {
      for (const s of crowd(seed)) {
        expect(cellOf(s, overlapping, rule)).toBe(reference(s, overlapping, rule));
      }
    }
  }
});

/** What the test vectors say of themselves (R37). */
const ABOUT =
  "Test vectors of canvas's rule of boxes, R37 in docs/decisions.md: from the strokes a workbook's page shows and its boxes to the box each stroke is in, or none — the draft — and the table of the filled boxes. A proposal for the eval protocol, epic E3 in spec's RUN.md (В47 in canvas's RUN.md): the protocol's own vectors come in spec's releases, and canvas will test against those.";

/** A case of the vectors: its boxes and the strokes its page shows. */
interface Case {
  readonly name: string;
  readonly about: string;
  readonly density: string;
  readonly cells: readonly Cell[];
  readonly strokes: readonly Stroke[];
}

/** A workbook as a case, its points as dense as they were written. */
function caseOf({ name, about, cells, work }: Workbook, density: string): Case {
  return { name, about, density, cells, strokes: work.strokes };
}

/** The strokes of the edges' case. */
const EDGE_STROKES: readonly Stroke[] = [
  dot(1, 88, 150),
  dot(2, 87.9, 150),
  dot(3, 212, 150),
  dot(4, 212.1, 150),
  dot(5, 150, 88),
  dot(6, 150, 87.9),
  dot(7, 150, 212),
  dot(8, 150, 212.1),
  dot(9, 87.96, 150),
  dot(10, 87.94, 150),
  dot(11, 285.6, 140),
  dot(12, 285.5, 140),
  dot(13, 360, 90.4),
  dot(14, 360, 90.3),
  stroke(15, [70, 150, 0], [230, 150, 9]),
  stroke(16, [70, 150, 0], [230.1, 150, 9]),
  stroke(17, [264, 140, 0], [456, 140, 9]),
  stroke(18, [264, 140, 0], [456.1, 140, 9]),
  stroke(19, [150, 150, 0]),
  stroke(20, [530, 350, 0], [580, 350, 9], [590, 350, 18], [630, 350, 27]),
  stroke(21, [550, 350, 0], [600, 350, 9], [610, 350, 18], [620, 350, 27], [640, 350, 36]),
  stroke(22, [550, 350, 0], [610, 350, 27]),
];

/** The cases: the hand-made workbooks, some at points every 2 units, the edges, two seeded. */
function cases(): Case[] {
  const dense = DENSITIES[2];
  return [
    ...WORKBOOKS.map((make) => caseOf(make(), "corners")),
    ...[edgeDigits, edgeSigns, fractions, comparisons].map((make) =>
      caseOf(make(dense), "every 2 units"),
    ),
    {
      name: "edges",
      about:
        "Boxes of their own — 100 × 100, 120 × 80, and two that overlap — and dots and lines on and a tenth past each widened edge and the limit, rounding onto an edge, and strokes two overlapping boxes may both take: the more points held, then the earlier box.",
      density: "as given",
      cells: EDGES,
      strokes: EDGE_STROKES,
    },
    ...[1, 2].map((seed) => caseOf(seeded(seed), "corners")),
  ];
}

/** The rows of the filled boxes by item, each its slots: as `filled` gives them. */
function filledByCells(cells: readonly Cell[], table: ReturnType<typeof tableOf>): boolean[][] {
  const rows: boolean[][] = [];
  for (const { item, slot } of cells) {
    const row = rows[item - 1] ?? [];
    row[slot - 1] = table.some((f) => f.item === item && f.slot === slot);
    rows[item - 1] = row;
  }
  return rows;
}

/** The test vectors, one line to a stroke, so that a reader can follow them. */
function vectors(): string {
  const lines = [
    "{",
    `  "about": ${JSON.stringify(ABOUT)},`,
    `  "rule": ${JSON.stringify(BOX_RULE)},`,
    `  "formulas": ${JSON.stringify({
      tenths:
        "a stroke's points in whole tenths of a page unit, round(10 × v), half up; a box [top, left, bottom, right] in whole units is 10 × each in tenths, L, T, W = right − left and H = bottom − top",
      bounds: "x0, x1, y0, y1: the least and the most of the stroke's points in tenths",
      size: "1000 × (x1 − x0) ≤ limit × W and 1000 × (y1 − y0) ≤ limit × H",
      middle:
        "1000 × (x0 + x1) ≥ 2 × (1000 × L − margin × W) and 1000 × (x0 + x1) ≤ 2 × (1000 × (L + W) + margin × W), and the same down with y, T and H",
      held: "the points of the stroke with 1000 × x ≥ 1000 × L − margin × W, 1000 × x ≤ 1000 × (L + W) + margin × W, and the same down",
      box: "of the boxes whose size and middle hold, the one with the most points held, and of those the earliest in the order of the boxes — the task's: by item, then by slot, each from 1; none is the draft",
      filled:
        "a box is filled if a stroke's box is it; the table lists the filled boxes in order, the IDs of each ascending",
      numbers:
        "for points on the page, 1000 × 1400, every whole number above stays below 2^31; an int64 holds each",
    })},`,
    '  "cases": [',
  ];
  const all = cases();
  for (const [n, { name, about, density, cells, strokes }] of all.entries()) {
    const table = tableOf(strokes, cells);
    const rows = strokes.map((s) => {
      const points = s.points.map(({ x, y }) => [x, y]);
      return { id: s.id, points };
    });
    const verdicts = strokes.map((s) => ({ id: s.id, box: placeOf(cellOf(s, cells), cells) }));
    const each = (row: unknown, k: number, of: readonly unknown[]) =>
      `        ${JSON.stringify(row)}${k < of.length - 1 ? "," : ""}`;
    lines.push(
      "    {",
      `      "name": ${JSON.stringify(name)},`,
      `      "about": ${JSON.stringify(about)},`,
      `      "density": ${JSON.stringify(density)},`,
      '      "boxes": [',
      ...cells.map(({ item, slot, box }, k, of) =>
        each(
          { item, slot, box: [box.top, box.left, box.top + box.height, box.left + box.width] },
          k,
          of,
        ),
      ),
      "      ],",
      '      "strokes": [',
      ...rows.map(each),
      "      ],",
      '      "verdicts": [',
      ...verdicts.map(each),
      "      ],",
      '      "table": [',
      ...table.map(each),
      "      ],",
      `      "filled": ${JSON.stringify(filledByCells(cells, table))}`,
      n < all.length - 1 ? "    }," : "    }",
    );
  }
  lines.push("  ]", "}", "");
  return lines.join("\n");
}

test("the test vectors are what the rule gives on the workbooks", async () => {
  await expect(vectors()).toMatchFileSnapshot("../../vectors/boxes.json");
});
