import {
  DEFAULT_GRID,
  GRID_KINDS,
  GRID_STEP,
  GRID_STEP_MAX,
  GRID_STEP_MIN,
  type Grid,
  type GridKind,
} from "./grid.js";

/** The canvas kind of the handwriting sheet, as concepts 16.1 spec's illustration names it. */
export const SHEET_KIND = "handwriting-sheet";

/** A paragraph of a task's statement. */
export interface TextPart {
  readonly text: string;
}

/** A picture of a task's statement. */
export interface PicturePart {
  /** What the consumer's `media` takes to give the picture's file. */
  readonly picture: string;
  /**
   * What the picture shows, in words: a screen reader reads it, and it stands in the picture's
   * place until the picture comes, or if it never does. Empty for a picture that only decorates.
   */
  readonly alt: string;
  /** The picture's size in CSS pixels, which it keeps narrower when the statement is. */
  readonly width: number;
  readonly height: number;
}

/** A part of a task's statement: a paragraph, or a picture. */
export type StatementPart = TextPart | PicturePart;

/**
 * The open view of a task, as much of it as the sheet reads: its canvas — the kind and the
 * kind's settings — and its statement, in its language (R23). The type is the sheet's own, for
 * now, of the composition spec's format v0 is to give (T28 and T35 in spec's RUN.md; R36 spec).
 * Fields the sheet does not read are passed over: the open view has more, its items, its answer
 * cells and its tools among them.
 */
export interface Task {
  readonly canvas: {
    readonly kind: typeof SHEET_KIND;
    readonly grid?: GridKind;
    readonly step?: number;
  };
  readonly statement?: readonly StatementPart[];
  /** The language of the statement, a BCP 47 tag; the element's own `lang` if none is given. */
  readonly lang?: string;
}

/** What the sheet shows of a task: the grid on the sheet and the statement above it. */
export interface Template {
  readonly grid: Grid;
  readonly statement: readonly StatementPart[];
  readonly lang: string | undefined;
}

/** The template of a sheet without a task: squares of 50 units, and no statement. */
export const NO_TASK: Template = Object.freeze({
  grid: DEFAULT_GRID,
  statement: Object.freeze([]),
  lang: undefined,
});

/**
 * The template of a task, or of no task for `undefined`. A value that is not a task the sheet can
 * show is a TypeError, which names the field. A field is left out by `undefined` alone: `null` is
 * a value, and a wrong one.
 */
export function templateOf(task: unknown): Template {
  if (task === undefined) return NO_TASK;
  const fields = record(task, "task");
  const canvas = record(fields.canvas, "task.canvas");
  if (canvas.kind !== SHEET_KIND) {
    throw new TypeError(
      `task.canvas.kind: the element is the handwriting sheet, "${SHEET_KIND}", not ${shown(canvas.kind)}`,
    );
  }
  const kind = canvas.grid === undefined ? DEFAULT_GRID.kind : canvas.grid;
  if (!GRID_KINDS.includes(kind as GridKind)) {
    throw new TypeError(`task.canvas.grid: "squares", "lines" or "dots", not ${shown(kind)}`);
  }
  const step = canvas.step === undefined ? GRID_STEP : canvas.step;
  if (typeof step !== "number" || !(step >= GRID_STEP_MIN && step <= GRID_STEP_MAX)) {
    throw new TypeError(
      `task.canvas.step: a number of units from ${GRID_STEP_MIN} to ${GRID_STEP_MAX}, not ${shown(step)}`,
    );
  }
  const lang = fields.lang;
  if (lang !== undefined && (typeof lang !== "string" || lang === "")) {
    throw new TypeError(`task.lang: a language tag, not ${shown(lang)}`);
  }
  return {
    grid: { kind: kind as GridKind, step },
    statement: statementOf(fields.statement),
    lang,
  };
}

/** Whether two templates show the same: the same grid, the same statement, the same language. */
export function sameTemplate(a: Template, b: Template): boolean {
  return sameGrid(a, b) && sameStatement(a, b);
}

/** Whether two templates rule the sheet alike. */
export function sameGrid(a: Template, b: Template): boolean {
  return a.grid.kind === b.grid.kind && a.grid.step === b.grid.step;
}

/** Whether two templates show the same statement, in the same language. */
export function sameStatement(a: Template, b: Template): boolean {
  if (a.lang !== b.lang || a.statement.length !== b.statement.length) return false;
  return a.statement.every((part, i) => samePart(part, b.statement[i]));
}

function statementOf(value: unknown): readonly StatementPart[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new TypeError(`task.statement: a list of parts, not ${shown(value)}`);
  }
  return value.map((part: unknown, i) => partOf(part, `task.statement[${i}]`));
}

function partOf(value: unknown, path: string): StatementPart {
  const part = record(value, path);
  const hasText = part.text !== undefined;
  const hasPicture = part.picture !== undefined;
  if (hasText === hasPicture) throw new TypeError(`${path}: a part is a text or a picture`);
  if (hasText) {
    if (typeof part.text !== "string") {
      throw new TypeError(`${path}.text: a string, not ${shown(part.text)}`);
    }
    return { text: part.text };
  }
  if (typeof part.picture !== "string" || part.picture === "") {
    throw new TypeError(`${path}.picture: a reference to the picture, not ${shown(part.picture)}`);
  }
  if (typeof part.alt !== "string") {
    throw new TypeError(`${path}.alt: what the picture shows, in words, not ${shown(part.alt)}`);
  }
  return {
    picture: part.picture,
    alt: part.alt,
    width: size(part.width, `${path}.width`),
    height: size(part.height, `${path}.height`),
  };
}

function size(value: unknown, path: string): number {
  if (typeof value !== "number" || !(value > 0 && Number.isFinite(value))) {
    throw new TypeError(`${path}: a size in CSS pixels, more than 0, not ${shown(value)}`);
  }
  return value;
}

function samePart(a: StatementPart, b: StatementPart | undefined): boolean {
  if (b === undefined) return false;
  if ("text" in a) return "text" in b && a.text === b.text;
  return (
    "picture" in b &&
    a.picture === b.picture &&
    a.alt === b.alt &&
    a.width === b.width &&
    a.height === b.height
  );
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${path}: an object, not ${shown(value)}`);
  }
  return value as Record<string, unknown>;
}

/** A value as an error message shows it. */
function shown(value: unknown): string {
  if (typeof value === "number") return String(value);
  if (value === undefined) return "undefined";
  if (typeof value === "function") return "a function";
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}
