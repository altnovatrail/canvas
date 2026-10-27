import type { Cell, Filling } from "./boxes.js";
import { CROP, type Crop, sheetBoxOf } from "./crop.js";
import { record, shown, whole } from "./fields.js";
import { around, type Box, boxOf, tenths } from "./geometry.js";
import type { Group } from "./groups.js";
import type { Stroke } from "./ink.js";
import { adler32, crc32 } from "./png.js";
import type { Point } from "./screen.js";
import { SHEET } from "./sheet.js";

/**
 * The rule that snaps a model's box to the learner's strokes (R26): the box widens on every side by
 * `margin` thousandths of the height its crop draws digits at, D′, and a stroke is taken if its
 * share of points in it, its edges too, is `share` at least, and one point at least. Both are
 * parameters of eval (C2). The rule counts in whole numbers, places on the crop as the crop's
 * raster has them (R25), so that whoever snaps by it takes the same strokes.
 */
export interface SnapRule {
  /** How far the box widens on every side, in thousandths of D′: 0 to 1000. */
  readonly margin: number;
  /**
   * The least share of a stroke's points in the widened box, a fraction of whole numbers
   * [above, below]: 0 ≤ above ≤ below, and below from 1 to 1000.
   */
  readonly share: readonly [above: number, below: number];
}

/**
 * The rule the sheet snaps by (R26): a quarter of a digit — 8 px at 32, a quarter of H on the
 * sheet, H the height the crop scales by — and two thirds of the points. A sweep over the
 * synthetic sheets chose two thirds over the half R43 canvas-api took: as many strokes taken
 * whole, and fewer of their neighbours.
 */
export const SNAP_RULE: SnapRule = Object.freeze({
  margin: 250,
  share: Object.freeze([2, 3] as const),
});

/** The numbers of a crop that the marks are placed by: all of its `Crop` but its heights and line. */
export type CropNumbers = Pick<
  Crop,
  "drawn" | "width" | "height" | "margins" | "sheetBox" | "frames" | "exact"
>;

/**
 * The context of one submission of a sheet, which the element gives with its crop and takes back
 * with the tutor's marks (R07; R36 spec): the crop's numbers — its `sheet_box`, the frames of the
 * groups and the whole numbers they come from — the groups of the strokes, the table «label →
 * stroke IDs», and the digest of it all (R27). It goes back to a sheet whose history holds its
 * strokes: the same sheet, or one given the same history later. Each sheet numbers its strokes from
 * 1, so a sheet of other strokes with the same IDs tells it by the digest. The type is the
 * element's own until spec's contract gives one (epic E3 in spec's RUN.md).
 */
export interface SheetSubmission {
  readonly crop: CropNumbers;
  readonly groups: readonly Group[];
  /** What the submission was made of, `digestOf` it: 16 hex digits. */
  readonly digest: string;
}

/**
 * The context of one submission of a workbook (R34, R38): the table «box → stroke IDs», each filled
 * box by its item and its slot, from 1, in the task's order, and the digest of its strokes and of
 * every box of the page. It holds no numbers of the crops: no mark on a workbook is snapped. The
 * type is the element's own until spec's contract gives one (epic E3 in spec's RUN.md).
 */
export interface WorkbookSubmission {
  readonly boxes: readonly Filling[];
  /** What the submission was made of, `workbookDigestOf` it: 16 hex digits. */
  readonly digest: string;
}

/** The context of one submission, of a sheet or of a workbook: its keys tell which (R38). */
export type Submission = SheetSubmission | WorkbookSubmission;

/**
 * An answer cell by its place (R51 spec), which has no ID: its item, and its place among the item's
 * cells, each from 1. On a workbook a cell is a box.
 */
export interface CellPlace {
  readonly item: number;
  readonly slot: number;
}

/**
 * Where a mark is: a group of strokes by its label, an answer cell by its place, or a box on the
 * crop the model saw, [ymin, xmin, ymax, xmax] in whole thousandths of its height and width, min <
 * max (R53 spec). On a workbook a mark stands on a cell alone (R34).
 */
export type Anchor =
  | { readonly group: string }
  | { readonly cell: CellPlace }
  | { readonly box: readonly [number, number, number, number] };

/** A mark of the tutor's layer: a frame, so far, with where it is and its name. */
export interface Mark {
  readonly kind: "frame";
  readonly at: Anchor;
  /** What a screen reader names it, in the consumer's words: the element words nothing. */
  readonly name: string;
}

/**
 * The tutor's marks of one submission, with the submission's context (R07): a sheet's or a
 * workbook's.
 */
export interface Marks {
  readonly submission: Submission;
  readonly marks: readonly Mark[];
}

/**
 * A mark on the sheet, `{stroke_ids, snapped_box}` (C2): the strokes it holds on to, by ID in
 * ascending order, and the rectangle of their points, in units, as the model saw them. A mark of a
 * workbook's cell has the box of its cell too, which its frame stands round with the ink (R39).
 */
export interface Placed {
  readonly ids: readonly number[];
  readonly box: Box;
  readonly cell?: Box;
}

/**
 * How far a given `sheet_box` may be from the one the crop's whole numbers give, in units: what a
 * store that keeps numbers to fewer digits than JSON may lose of it. The rule counts by the whole
 * numbers, never by `sheet_box`.
 */
const SHEET_BOX_SLACK = 1e-6;

/** A digest as `digestOf` writes it. */
const DIGEST = /^[0-9a-f]{16}$/;

/**
 * The tutor's marks a value gives, checked (R26). A value that is not the marks of a submission is
 * a TypeError that names the field; fields the sheet does not read are passed over. The context's
 * keys tell its kind (R38): a sheet's crop and groups, or a workbook's boxes. The crop's
 * `sheet_box` must be the one its whole numbers give, to a millionth of a unit, its frames the
 * groups', in their order, a group's label must be one of the submission's, and the digest 16 hex
 * digits. A workbook's rows name each box once and each stroke in one box, and its marks stand on
 * cells alone (R39). Whether the submission is this sheet's, its strokes tell (`placesOf`).
 */
export function marksOf(value: unknown): Marks {
  const fields = record(value, "marks");
  const submission = submissionOf(fields.submission, "marks.submission");
  if (!Array.isArray(fields.marks)) {
    throw new TypeError(`marks.marks: a list of marks, not ${shown(fields.marks)}`);
  }
  // What a mark may stand on: a group of a sheet's, or on a workbook a cell alone.
  const labels =
    "groups" in submission ? new Set(submission.groups.map(({ label }) => label)) : null;
  return {
    submission,
    marks: fields.marks.map((mark: unknown, n) => markOf(mark, `marks.marks[${n}]`, labels)),
  };
}

/**
 * The strokes a model's box takes (R26), by ID in ascending order: of the strokes given, those with
 * the rule's share of their points, and one at least, in the box widened by the rule's margin. The
 * box is in thousandths of the crop the model saw, and a point counts where it lies on that crop:
 * the same as the box laid on the sheet by the crop's `sheet_box` and widened there by H × margin /
 * 1000. The box widens first: clipped to the sheet after, it takes the same, for the points lie on
 * the sheet.
 */
export function snapOf(
  box: readonly [number, number, number, number],
  crop: CropNumbers,
  strokes: readonly Stroke[],
  rule: SnapRule = SNAP_RULE,
): number[] {
  checkRule(rule);
  const within = withinOf(box, crop, rule.margin);
  return strokes
    .filter(({ points }) => {
      let inside = 0;
      for (const point of points) if (within(point)) inside += 1;
      const [above, below] = rule.share;
      return inside > 0 && below * inside >= above * points.length;
    })
    .map(({ id }) => id)
    .sort(byNumber);
}

/**
 * Where each mark of a submission is on the sheet (R26): the strokes it holds on to, or null for a
 * mark that has none — the question is asked without it (R43 canvas-api). `known` is every stroke
 * the sheet has known, erased or not, as its history wrote them: a mark holds on to the strokes the
 * model saw, and shows those of them the sheet shows at the time (C2). A stroke written after the
 * submission is in none of its groups, and no mark takes it. A group's mark holds its strokes, a
 * box's the strokes it snaps to; an answer cell's holds none on a sheet, which takes no zones.
 * `cells` are the boxes of a workbook's page, in the task's order, and null on a sheet: there a
 * cell's mark holds the strokes of its row of the table, with its box, and a cell not in the table
 * holds none (R39).
 *
 * A submission of other strokes is a TypeError: a stroke of its groups the sheet does not know, or
 * a digest the sheet's strokes of those IDs do not give with the submission's numbers (R27). A
 * sheet of other strokes would have those IDs too — each numbers its strokes from 1 — and a
 * context changed since the sheet gave it would place the marks by other numbers. The sheet's own
 * submission always passes, the strokes erased since too, and so does the same history given to
 * another sheet. A workbook's digest holds every box of its page too, so a page of another layout
 * is not its submission's (R38), and a context of the other kind of canvas is a TypeError.
 */
export function placesOf(
  marks: Marks,
  known: readonly Stroke[],
  cells: readonly Cell[] | null = null,
  rule: SnapRule = SNAP_RULE,
): (Placed | null)[] {
  checkRule(rule);
  const { submission } = marks;
  const byId = new Map(known.map((stroke) => [stroke.id, stroke]));
  if ("boxes" in submission) {
    if (cells === null)
      throw new TypeError(`marks.submission: ${otherKind("a workbook's", "a sheet")}`);
    return cellsPlacesOf(marks.marks, submission, byId, cells);
  }
  if (cells !== null)
    throw new TypeError(`marks.submission: ${otherKind("a sheet's", "a workbook")}`);
  const { crop, groups, digest } = submission;
  const sent: Stroke[] = [];
  for (const [n, { label, ids }] of groups.entries()) {
    const frame = crop.frames[n];
    if (frame === undefined || frame.label !== label) {
      throw new TypeError(`marks.submission.crop.frames[${n}]: the frame of the group ${label}`);
    }
    sent.push(...knownOf(ids, byId, `the group ${label}`, "sheet"));
  }
  if (digestOf(sent, crop, groups) !== digest) {
    throw new TypeError(
      "marks.submission.digest: the sheet's strokes of its IDs give another with its numbers: " +
        "the submission is not this sheet's, or it was changed",
    );
  }
  const tables = new Map(groups.map(({ label, ids }) => [label, ids]));
  return marks.marks.map(({ at }) => {
    let ids: number[] = [];
    if ("group" in at) ids = [...(tables.get(at.group) ?? [])].sort(byNumber);
    else if ("box" in at) ids = snapOf(at.box, crop, sent, rule);
    if (ids.length === 0) return null;
    return { ids, box: boxOf(ids.flatMap((id) => byId.get(id)?.points ?? [])) };
  });
}

/**
 * The rectangle a mark shows now (R26): around the points of those of its strokes the sheet shows,
 * in units, or null while it shows none of them. `shown` gives the box of a stroke's points by its
 * ID while the stroke is on the screen — not erased, nor under the eraser under way (R22). New
 * strokes are none of a mark's.
 */
export function shownOf(placed: Placed, shown: (id: number) => Box | undefined): Box | null {
  const boxes = placed.ids.flatMap((id) => shown(id) ?? []);
  if (boxes.length === 0) return null;
  // A cell's frame stands round its box and its ink together, by the author's answer (R39).
  return around(placed.cell === undefined ? boxes : [...boxes, placed.cell]);
}

/** What a context of the other kind of canvas is, and what this one is (R39). */
function otherKind(context: string, here: string): string {
  return `${context} context, and this is ${here}: the task comes before the marks`;
}

/**
 * The strokes of a context's IDs, all of which the sheet or the page, `here`, must know: else it
 * is not its submission.
 */
function knownOf(
  ids: readonly number[],
  byId: ReadonlyMap<number, Stroke>,
  of: string,
  here: "sheet" | "page",
): Stroke[] {
  return ids.map((id) => {
    const stroke = byId.get(id);
    if (stroke === undefined) {
      throw new TypeError(
        `marks.submission: the ${here} has no stroke ${id}, of ${of}: the submission is not ` +
          `this ${here}'s`,
      );
    }
    return stroke;
  });
}

/** Whether a field of a context is not there: left out, or null as some stores write it. */
function absent(value: unknown): boolean {
  return value === undefined || value === null;
}

/**
 * Where each mark of a workbook's submission is (R39): a cell's, on the strokes of its row of the
 * table and its box of the page; one of a cell not in the table, on none.
 */
function cellsPlacesOf(
  marks: readonly Mark[],
  { boxes, digest }: WorkbookSubmission,
  byId: ReadonlyMap<number, Stroke>,
  cells: readonly Cell[],
): (Placed | null)[] {
  const sent = boxes.flatMap(({ item, slot, ids }) =>
    knownOf(ids, byId, `the box ${item}.${slot}`, "page"),
  );
  if (workbookDigestOf(sent, boxes, cells) !== digest) {
    throw new TypeError(
      "marks.submission.digest: the page's strokes of its IDs and its boxes give another: the " +
        "submission is not this page's, or it was changed",
    );
  }
  return marks.map(({ at }) => {
    const place = "cell" in at ? at.cell : undefined;
    const same = ({ item, slot }: CellPlace) => item === place?.item && slot === place.slot;
    const row = boxes.find(same);
    const cell = cells.find(same);
    if (row === undefined || cell === undefined) return null;
    const { left, top, width, height } = cell.box;
    return {
      ids: [...row.ids].sort(byNumber),
      box: boxOf(row.ids.flatMap((id) => byId.get(id)?.points ?? [])),
      cell: { minX: left, minY: top, maxX: left + width, maxY: top + height },
    };
  });
}

/**
 * The digest of a submission (R27): what it was made of, in 16 hex digits — the CRC-32 and then the
 * Adler-32 of PNG and zlib (png.ts) of a text that holds its strokes, by ID ascending, each with its
 * points in tenths of a unit and whole milliseconds, as the rules see them (R24, R25), and its whole
 * numbers: D′, the crop's size and margins, the box and the median it comes from, the groups and
 * their frames. `sheet_box` is not in it: it comes from those numbers, and is checked against them
 * within its slack. The same strokes and numbers give the same digest in every engine, through any
 * store that keeps them as JSON does. The digest tells an accidental difference, not a forged one:
 * CRC-32 tells every change within 32 bits running, and any other change keeps both sums with a
 * chance of about one in 2^32 at most.
 */
export function digestOf(
  strokes: readonly Stroke[],
  crop: Pick<CropNumbers, "drawn" | "width" | "height" | "margins" | "frames" | "exact">,
  groups: readonly Group[],
): string {
  const lines = strokeLines(strokes);
  const {
    drawn,
    width,
    height,
    margins: [top, left],
    exact: { box, median },
  } = crop;
  lines.push(
    `crop ${drawn} ${width} ${height} ${top} ${left} ${box.minX} ${box.minY} ${box.maxX} ${box.maxY} ${median}`,
  );
  for (const { label, ids } of groups) lines.push(`group ${label} ${ids.join(",")}`);
  for (const { label, box: frame } of crop.frames) lines.push(`frame ${label} ${frame.join(",")}`);
  return sumOf(lines);
}

/**
 * The digest of a workbook's submission (R38), as `digestOf` makes a sheet's: of a text that holds
 * the strokes of its table, by ID ascending, as a sheet's digest has them, then every box of the
 * page, `cells` in the task's order, with its item, its slot and its rectangle in whole page units,
 * and then the table's rows. A context of another layout gives another digest even where its
 * filled boxes stand where they stood (R34).
 */
export function workbookDigestOf(
  strokes: readonly Stroke[],
  boxes: readonly Filling[],
  cells: readonly Cell[],
): string {
  const lines = strokeLines(strokes);
  for (const { item, slot, box } of cells) {
    lines.push(`cell ${item} ${slot} ${box.left} ${box.top} ${box.width} ${box.height}`);
  }
  for (const { item, slot, ids } of boxes) lines.push(`box ${item} ${slot} ${ids.join(",")}`);
  return sumOf(lines);
}

/** The lines of a digest's text that hold strokes, by ID ascending, their points as rules see them. */
function strokeLines(strokes: readonly Stroke[]): string[] {
  return [...strokes]
    .sort((a, b) => a.id - b.id)
    .map(
      ({ id, points }) =>
        `${id}${points.map(({ x, y, t }) => `;${tenths(x)},${tenths(y)},${Math.round(t)}`).join("")}`,
    );
}

/** A digest of a text's lines: the CRC-32 and then the Adler-32 of its bytes, 16 hex digits. */
function sumOf(lines: readonly string[]): string {
  const bytes = utf8(lines.join("\n"));
  return hex(crc32(bytes)) + hex(adler32(bytes));
}

/**
 * Whether a point lies in a box of the crop widened by `margin` thousandths of D′, its edges too:
 * in whole numbers, a place on the crop times 1000 × H (R25). For a stroke of the submission every
 * number stays below 2^31; the place X of a point is ((x − B.minX) × D′ + mx × H) / H px, in
 * tenths.
 */
function withinOf(
  box: readonly [number, number, number, number],
  crop: CropNumbers,
  margin: number,
): (point: Point) => boolean {
  const {
    drawn,
    width,
    height,
    margins: [top, left],
    exact: { box: points, median: unit },
  } = crop;
  const [ymin, xmin, ymax, xmax] = box;
  const reach = margin * drawn;
  const west = (xmin * width - reach) * unit;
  const east = (xmax * width + reach) * unit;
  const north = (ymin * height - reach) * unit;
  const south = (ymax * height + reach) * unit;
  return ({ x, y }) => {
    const across = 1000 * ((tenths(x) - points.minX) * drawn + left * unit);
    const down = 1000 * ((tenths(y) - points.minY) * drawn + top * unit);
    return across >= west && across <= east && down >= north && down <= south;
  };
}

function checkRule({ margin, share }: SnapRule): void {
  if (!Number.isInteger(margin) || margin < 0 || margin > 1000) {
    throw new RangeError(`the snapping rule's margin: whole thousandths, 0 to 1000, not ${margin}`);
  }
  const [above, below] = share;
  if (
    !Number.isInteger(above) ||
    !Number.isInteger(below) ||
    above < 0 ||
    below < 1 ||
    below > 1000 ||
    above > below
  ) {
    throw new RangeError(
      `the snapping rule's share: a fraction of whole numbers no more than 1, below from 1 to 1000, not ${shown(share)}`,
    );
  }
}

/** A submission's context, a sheet's or a workbook's by its keys (R38). */
function submissionOf(value: unknown, path: string): Submission {
  const fields = record(value, path);
  let parts: Omit<SheetSubmission, "digest"> | Omit<WorkbookSubmission, "digest">;
  if (absent(fields.boxes)) {
    const groups = groupTableOf(fields.groups, `${path}.groups`);
    parts = { crop: numbersOf(fields.crop, `${path}.crop`, groups), groups };
  } else if (absent(fields.crop) && absent(fields.groups)) {
    parts = { boxes: rowsOf(fields.boxes, `${path}.boxes`) };
  } else {
    throw new TypeError(
      `${path}: a sheet's context, its crop and groups, or a workbook's, its boxes, not both`,
    );
  }
  const { digest } = fields;
  if (typeof digest !== "string" || !DIGEST.test(digest)) {
    throw new TypeError(
      `${path}.digest: what the submission was made of, 16 hex digits, not ${shown(digest)}`,
    );
  }
  return { ...parts, digest };
}

/** The groups of a submission: each label once, each stroke in one group. */
function groupTableOf(value: unknown, path: string): Group[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError(`${path}: the groups of the strokes sent, not ${shown(value)}`);
  }
  const labels = new Set<string>();
  const strokes = new Set<number>();
  return value.map((group: unknown, n) => {
    const fields = record(group, `${path}[${n}]`);
    const { label } = fields;
    if (typeof label !== "string" || label === "" || labels.has(label)) {
      throw new TypeError(`${path}[${n}].label: a label of its own, not ${shown(label)}`);
    }
    labels.add(label);
    return { label, ids: idsOf(fields.ids, `${path}[${n}].ids`, strokes, "group") };
  });
}

/** The rows of a workbook's table (R38): each box once, by its place, each stroke in one box. */
function rowsOf(value: unknown, path: string): Filling[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError(`${path}: the filled boxes and their strokes, not ${shown(value)}`);
  }
  const places = new Set<string>();
  const strokes = new Set<number>();
  return value.map((row: unknown, n) => {
    const fields = record(row, `${path}[${n}]`);
    const { item, slot } = placeOf(fields, `${path}[${n}]`);
    if (places.has(`${item}.${slot}`)) {
      throw new TypeError(`${path}[${n}]: a box of its own, not ${item}.${slot} again`);
    }
    places.add(`${item}.${slot}`);
    return { item, slot, ids: idsOf(fields.ids, `${path}[${n}].ids`, strokes, "box") };
  });
}

/** The IDs of a group's or a box's strokes: whole, from 1, each in one of them alone. */
function idsOf(value: unknown, path: string, taken: Set<number>, of: string): number[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError(`${path}: the IDs of its strokes, not ${shown(value)}`);
  }
  for (const id of value) {
    if (!Number.isInteger(id) || id < 1 || taken.has(id)) {
      throw new TypeError(`${path}: a stroke's ID in one ${of} alone, not ${shown(id)}`);
    }
    taken.add(id);
  }
  return [...(value as number[])];
}

/** An answer cell's place (R51 spec): its item, and its place among the item's cells, from 1. */
function placeOf(fields: Record<string, unknown>, path: string): CellPlace {
  return {
    item: whole(fields.item, `${path}.item`, 1),
    slot: whole(fields.slot, `${path}.slot`, 1),
  };
}

/** The crop's numbers that place the marks, checked against each other and against the groups. */
function numbersOf(value: unknown, path: string, groups: readonly Group[]): CropNumbers {
  const crop = record(value, path);
  const drawn = whole(crop.drawn, `${path}.drawn`, 1, CROP.tallest);
  const width = whole(crop.width, `${path}.width`, CROP.side, CROP.edge);
  const height = whole(crop.height, `${path}.height`, CROP.side, CROP.edge);
  const margins = crop.margins;
  if (!Array.isArray(margins) || margins.length !== 2) {
    throw new TypeError(`${path}.margins: [top, left] in px, not ${shown(margins)}`);
  }
  const top = whole(margins[0], `${path}.margins[0]`, CROP.margin, height - CROP.margin);
  const left = whole(margins[1], `${path}.margins[1]`, CROP.margin, width - CROP.margin);
  const exact = record(crop.exact, `${path}.exact`);
  const median = whole(exact.median, `${path}.exact.median`, CROP.flat * 10, CROP.ceiling * 10);
  const points = record(exact.box, `${path}.exact.box`);
  const minX = whole(points.minX, `${path}.exact.box.minX`, 0, SHEET.width * 10);
  const minY = whole(points.minY, `${path}.exact.box.minY`, 0, SHEET.height * 10);
  const maxX = whole(points.maxX, `${path}.exact.box.maxX`, minX, SHEET.width * 10);
  const maxY = whole(points.maxY, `${path}.exact.box.maxY`, minY, SHEET.height * 10);
  const numbers = {
    drawn,
    width,
    height,
    margins: [top, left] as const,
    exact: { box: { minX, minY, maxX, maxY }, median },
  };
  const sheetBox = sheetBoxOf(numbers);
  const given = crop.sheetBox;
  if (
    !Array.isArray(given) ||
    given.length !== 4 ||
    !given.every(
      (v, i) => typeof v === "number" && Math.abs(v - (sheetBox[i] ?? 0)) <= SHEET_BOX_SLACK,
    )
  ) {
    throw new TypeError(
      `${path}.sheetBox: ${shown(sheetBox)}, where the crop's numbers put it, not ${shown(given)}`,
    );
  }
  const frames = crop.frames;
  if (!Array.isArray(frames) || frames.length !== groups.length) {
    throw new TypeError(`${path}.frames: a frame for each group, not ${shown(frames)}`);
  }
  return {
    ...numbers,
    sheetBox,
    frames: frames.map((frame: unknown, n) => {
      const fields = record(frame, `${path}.frames[${n}]`);
      const group = groups[n];
      if (group === undefined || fields.label !== group.label) {
        throw new TypeError(
          `${path}.frames[${n}].label: ${shown(group?.label)}, the group's, not ${shown(fields.label)}`,
        );
      }
      return { label: group.label, box: fractionsOf(fields.box, `${path}.frames[${n}].box`) };
    }),
  };
}

function markOf(value: unknown, path: string, labels: ReadonlySet<string> | null): Mark {
  const mark = record(value, path);
  if (mark.kind !== "frame") {
    throw new TypeError(`${path}.kind: the sheet draws "frame" marks, not ${shown(mark.kind)}`);
  }
  if (typeof mark.name !== "string" || mark.name.trim() === "") {
    throw new TypeError(
      `${path}.name: what a screen reader names the mark, not ${shown(mark.name)}`,
    );
  }
  return { kind: "frame", at: anchorOf(mark.at, `${path}.at`, labels), name: mark.name };
}

/** Where a mark is: on a sheet, `labels` its groups'; on a workbook, null, a cell alone (R39). */
function anchorOf(value: unknown, path: string, labels: ReadonlySet<string> | null): Anchor {
  const at = record(value, path);
  const given = (["group", "cell", "box"] as const).filter((key) => at[key] !== undefined);
  if (given.length !== 1) {
    throw new TypeError(`${path}: one of a group, a cell and a box, not ${shown(value)}`);
  }
  if (labels === null && at.cell === undefined) {
    throw new TypeError(
      `${path}: a mark of a workbook stands on a cell alone, not ${shown(value)}`,
    );
  }
  if (at.group !== undefined) {
    if (typeof at.group !== "string" || !labels?.has(at.group)) {
      throw new TypeError(
        `${path}.group: a label of the submission's groups, not ${shown(at.group)}`,
      );
    }
    return { group: at.group };
  }
  if (at.cell !== undefined)
    return { cell: placeOf(record(at.cell, `${path}.cell`), `${path}.cell`) };
  return { box: fractionsOf(at.box, `${path}.box`) };
}

/** A box on a crop, valid as R53 spec has it: whole thousandths from 0 to 1000, min < max. */
function fractionsOf(value: unknown, path: string): [number, number, number, number] {
  if (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every((n) => Number.isInteger(n) && n >= 0 && n <= 1000) &&
    value[0] < value[2] &&
    value[1] < value[3]
  ) {
    return [value[0], value[1], value[2], value[3]];
  }
  throw new TypeError(
    `${path}: [ymin, xmin, ymax, xmax] in whole thousandths, 0 to 1000, min < max, not ${shown(value)}`,
  );
}

function byNumber(a: number, b: number): number {
  return a - b;
}

/**
 * A text's bytes in UTF-8, its code units one by one — a lone surrogate too, as three bytes: the
 * labels are the consumer's to give. The DOM-free part has no TextEncoder (R05).
 */
function utf8(text: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const unit = text.charCodeAt(i);
    if (unit < 0x80) bytes.push(unit);
    else if (unit < 0x800) bytes.push(0xc0 | (unit >> 6), 0x80 | (unit & 0x3f));
    else bytes.push(0xe0 | (unit >> 12), 0x80 | ((unit >> 6) & 0x3f), 0x80 | (unit & 0x3f));
  }
  return Uint8Array.from(bytes);
}

/** A 32-bit checksum in eight hex digits. */
function hex(sum: number): string {
  return sum.toString(16).padStart(8, "0");
}
