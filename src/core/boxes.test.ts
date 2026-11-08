import { describe, expect, test } from "vitest";
import { BOX_RULE, type BoxRule, type Cell, cellOf, cellsOf, filledOf, tableOf } from "./boxes.js";
import { type FinalStroke, strokesOf, vectorsOf } from "./contracts.fixture.js";
import type { Stroke } from "./ink.js";
import type { CellPlace } from "./marks.js";
import { type PageBox, pageOf } from "./page.js";
import { PAGES } from "./pages.fixture.js";
import { crowd, stroke } from "./sheets.fixture.js";
import {
  DENSITIES,
  edgeDigits,
  edgeSigns,
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
  // Every rule on the corpus, 200 crowds and the boxes that overlap, each stroke placed twice, takes
  // about half a second here, and more on a CI runner, with the coverage of the tests on and the
  // browsers of the other projects beside it: past Vitest's default of five seconds.
}, 30_000);

/** A case of spec's vectors of the boxes (contracts/README.md, section 12). */
interface BoxCase {
  readonly name: string;
  readonly boxes: readonly (PageBox & { readonly answer_slot: CellPlace })[];
  readonly strokes: readonly FinalStroke[];
  readonly verdicts: readonly {
    readonly stroke_id: number;
    readonly answer_slot: CellPlace | null;
  }[];
  readonly filled_boxes: readonly {
    readonly answer_slot: CellPlace;
    readonly stroke_ids: number[];
  }[];
}

describe("spec's test vectors of the boxes (R94 spec)", () => {
  const { rule, cases } = vectorsOf<BoxCase>("boxes");

  test("are of the sheet's rule", () => {
    expect(rule).toEqual(BOX_RULE);
  });

  test.each(cases.map((each) => [each.name, each] as const))(
    "%s: each stroke's box and the table of the filled boxes are the vectors'",
    (_, { boxes, strokes, verdicts, filled_boxes }) => {
      const cells: Cell[] = boxes.map(({ answer_slot: { item, slot }, ...box }) => ({
        item,
        slot,
        box,
      }));
      const page = strokesOf(strokes);
      const found = page.map((s) => {
        const own = cells[cellOf(s, cells)];
        return { stroke_id: s.id, answer_slot: own ? { item: own.item, slot: own.slot } : null };
      });
      expect(found).toEqual(verdicts);
      const table = tableOf(page, cells).map(({ item, slot, ids }) => ({
        answer_slot: { item, slot },
        stroke_ids: ids,
      }));
      expect(table).toEqual(filled_boxes);
    },
  );
});
