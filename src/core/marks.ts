import { CROP, type Crop, sheetBoxOf } from "./crop.js";
import { record, shown } from "./fields.js";
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
 * The context of one submission, which the element gives with its crop and takes back with the
 * tutor's marks (R07; R36 spec): the crop's numbers — its `sheet_box`, the frames of the groups and
 * the whole numbers they come from — the groups of the strokes, the table «label → stroke IDs», and
 * the digest of it all (R27). It goes back to a sheet whose history holds its strokes: the same
 * sheet, or one given the same history later. Each sheet numbers its strokes from 1, so a sheet of
 * other strokes with the same IDs tells it by the digest. The type is the element's own until
 * spec's contract gives one (epic E3 in spec's RUN.md).
 */
export interface Submission {
  readonly crop: CropNumbers;
  readonly groups: readonly Group[];
  /** What the submission was made of, `digestOf` it: 16 hex digits. */
  readonly digest: string;
}

/**
 * Where a mark is: a group of strokes by its label, an answer cell by its ID, or a box on the crop
 * the model saw, [ymin, xmin, ymax, xmax] in whole thousandths of its height and width, min < max
 * (Т-32).
 */
export type Anchor =
  | { readonly group: string }
  | { readonly cell: string }
  | { readonly box: readonly [number, number, number, number] };

/** A mark of the tutor's layer: a frame, so far, with where it is and its name. */
export interface Mark {
  readonly kind: "frame";
  readonly at: Anchor;
  /** What a screen reader names it, in the consumer's words: the element words nothing. */
  readonly name: string;
}

/** The tutor's marks of one submission, with the submission's context (R07). */
export interface Marks {
  readonly submission: Submission;
  readonly marks: readonly Mark[];
}

/**
 * A mark on the sheet, `{stroke_ids, snapped_box}` (C2): the strokes it holds on to, by ID in
 * ascending order, and the rectangle of their points, in units, as the model saw them.
 */
export interface Placed {
  readonly ids: readonly number[];
  readonly box: Box;
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
 * a TypeError that names the field; fields the sheet does not read are passed over. The crop's
 * `sheet_box` must be the one its whole numbers give, to a millionth of a unit, its frames the
 * groups', in their order, a group's label must be one of the submission's, and the digest 16 hex
 * digits. Whether the submission is this sheet's, its strokes tell (`placesOf`).
 */
export function marksOf(value: unknown): Marks {
  const fields = record(value, "marks");
  const submission = submissionOf(fields.submission, "marks.submission");
  if (!Array.isArray(fields.marks)) {
    throw new TypeError(`marks.marks: a list of marks, not ${shown(fields.marks)}`);
  }
  const labels = new Set(submission.groups.map(({ label }) => label));
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
 * box's the strokes it snaps to; an answer cell's holds none while the task has no cells.
 *
 * A submission of other strokes is a TypeError: a stroke of its groups the sheet does not know, or
 * a digest the sheet's strokes of those IDs do not give with the submission's numbers (R27). A
 * sheet of other strokes would have those IDs too — each numbers its strokes from 1 — and a
 * context changed since the sheet gave it would place the marks by other numbers. The sheet's own
 * submission always passes, the strokes erased since too, and so does the same history given to
 * another sheet.
 */
export function placesOf(
  marks: Marks,
  known: readonly Stroke[],
  rule: SnapRule = SNAP_RULE,
): (Placed | null)[] {
  checkRule(rule);
  const { crop, groups, digest } = marks.submission;
  const byId = new Map(known.map((stroke) => [stroke.id, stroke]));
  const sent: Stroke[] = [];
  for (const [n, { label, ids }] of groups.entries()) {
    const frame = crop.frames[n];
    if (frame === undefined || frame.label !== label) {
      throw new TypeError(`marks.submission.crop.frames[${n}]: the frame of the group ${label}`);
    }
    for (const id of ids) {
      const stroke = byId.get(id);
      if (stroke === undefined) {
        throw new TypeError(
          `marks.submission: the sheet has no stroke ${id}, of the group ${label}: the ` +
            "submission is not this sheet's",
        );
      }
      sent.push(stroke);
    }
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
  return boxes.length > 0 ? around(boxes) : null;
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
  const lines = [...strokes]
    .sort((a, b) => a.id - b.id)
    .map(
      ({ id, points }) =>
        `${id}${points.map(({ x, y, t }) => `;${tenths(x)},${tenths(y)},${Math.round(t)}`).join("")}`,
    );
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

function submissionOf(value: unknown, path: string): Submission {
  const fields = record(value, path);
  const groups = tableOf(fields.groups, `${path}.groups`);
  const crop = numbersOf(fields.crop, `${path}.crop`, groups);
  const { digest } = fields;
  if (typeof digest !== "string" || !DIGEST.test(digest)) {
    throw new TypeError(
      `${path}.digest: what the submission was made of, 16 hex digits, not ${shown(digest)}`,
    );
  }
  return { crop, groups, digest };
}

/** The groups of a submission: each label once, each stroke in one group. */
function tableOf(value: unknown, path: string): Group[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError(`${path}: the groups of the strokes sent, not ${shown(value)}`);
  }
  const labels = new Set<string>();
  const strokes = new Set<number>();
  return value.map((group: unknown, n) => {
    const fields = record(group, `${path}[${n}]`);
    const { label, ids } = fields;
    if (typeof label !== "string" || label === "" || labels.has(label)) {
      throw new TypeError(`${path}[${n}].label: a label of its own, not ${shown(label)}`);
    }
    labels.add(label);
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new TypeError(`${path}[${n}].ids: the IDs of its strokes, not ${shown(ids)}`);
    }
    for (const id of ids) {
      if (!Number.isInteger(id) || id < 1 || strokes.has(id)) {
        throw new TypeError(
          `${path}[${n}].ids: a stroke's ID in one group alone, not ${shown(id)}`,
        );
      }
      strokes.add(id);
    }
    return { label, ids: [...(ids as number[])] };
  });
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

function markOf(value: unknown, path: string, labels: ReadonlySet<string>): Mark {
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

function anchorOf(value: unknown, path: string, labels: ReadonlySet<string>): Anchor {
  const at = record(value, path);
  const given = (["group", "cell", "box"] as const).filter((key) => at[key] !== undefined);
  if (given.length !== 1) {
    throw new TypeError(`${path}: one of a group, a cell and a box, not ${shown(value)}`);
  }
  if (at.group !== undefined) {
    if (typeof at.group !== "string" || !labels.has(at.group)) {
      throw new TypeError(
        `${path}.group: a label of the submission's groups, not ${shown(at.group)}`,
      );
    }
    return { group: at.group };
  }
  if (at.cell !== undefined) {
    if (typeof at.cell !== "string" || at.cell === "") {
      throw new TypeError(`${path}.cell: the ID of an answer cell, not ${shown(at.cell)}`);
    }
    return { cell: at.cell };
  }
  return { box: fractionsOf(at.box, `${path}.box`) };
}

/** A box on a crop, valid as Т-32 has it: whole thousandths from 0 to 1000, min < max. */
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

function whole(value: unknown, path: string, least: number, most: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < least || value > most) {
    throw new TypeError(`${path}: a whole number from ${least} to ${most}, not ${shown(value)}`);
  }
  return value;
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
