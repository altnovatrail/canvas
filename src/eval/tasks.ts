// The tasks the synthetic samples and the samples page answer (R49, R62): the open views of a file
// of open tasks of a release of tutor, which the tree holds as it came and ci-licenses verifies by
// spec's release-verify (R77 spec). A sample names its task without its key (R05 spec): the
// release's tag, the file's digest, the bank, the bank's digest as the file gives it, the task's
// ID, and the digest of its open view, as the module format takes a digest (contracts/README.md,
// section «The sample file»). The file is of the version of the module format the element reads, or
// of 0.3 before it, or it is refused (T77, T85). A task holds the fields of the open view alone, at
// every depth, or the file is refused (T21; R62): what a sample or the samples page takes of it is
// open. Of a task, the samples take only its ID, its kind of canvas and a workbook's items, which
// have the shape the layout of a page reads (R35).

import type { TaskReferenceSchema } from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import type * as open from "@altnovatrail/spec/formatv0/open";
import type { MessageInitShape } from "@bufbuild/protobuf";
import { FORMAT } from "../core/manifest.js";
import type { WorkbookItem } from "../core/task.js";

/**
 * The file of open tasks the synthetic samples answer: tutor's release, the file's name in it and
 * in tasks/, and the SHA-256 of its bytes, which release-verify accepted. A new release of tutor
 * comes in by raising the three and the file together.
 */
export const TUTOR_FILE = Object.freeze({
  tag: "v0.1.10",
  name: "tutor_v0.1.10_open-tasks.json",
  sha256: "d32d3878002f9248023431b00923316b21ed05cebbbfc66b02910bc5b236f067",
});

/** A task of the file, as a sample takes it. */
export interface OpenTask {
  /** The sample's reference to it. */
  readonly reference: MessageInitShape<typeof TaskReferenceSchema>;
  /** The kind of its canvas: a sheet, or a workbook with its items. */
  readonly canvas: { readonly sheet: true } | { readonly workbook: readonly WorkbookItem[] };
}

/** The tasks of the file, bank by bank, each bank's in the file's order. */
export type OpenTasks = ReadonlyMap<string, readonly OpenTask[]>;

/**
 * The versions of the module format a file of tutor's open tasks may be of: the element's, and 0.3
 * before it. tutor's file is a source for a while (Д4 in RUN.md), and tutor has none of 0.4 yet; a
 * module of 0.3 moved to 0.4 keeps its open view, and 0.4 took no field away (README of the format,
 * §2; T85, R60). The element itself reads 0.4 alone: a manifest of 0.3 it refuses (FORMAT).
 */
export const TUTOR_FORMATS: readonly string[] = Object.freeze([FORMAT, "0.3"]);

/**
 * The tasks of a file of open tasks of tutor, given as its parsed JSON, of the release `tag`, with
 * the SHA-256 of its bytes in hexadecimal. `sha256` gives that of a text's UTF-8 bytes: the caller's,
 * as the DOM-free part has no hash of its own. A file of another format, of tasks of a version of
 * the module format outside TUTOR_FORMATS, or a task with neither a sheet nor a workbook, is a
 * TypeError.
 */
export function openTasksOf(
  file: unknown,
  tag: string,
  fileSha256: string,
  sha256: (text: string) => string,
): OpenTasks {
  const { format, version, module_format_version, banks } = file as {
    readonly format?: unknown;
    readonly version?: unknown;
    readonly module_format_version?: unknown;
    readonly banks?: unknown;
  };
  if (format !== "tutor-open-tasks" || version !== 0 || !Array.isArray(banks)) {
    throw new TypeError("a file of open tasks is tutor-open-tasks of the version 0, with banks");
  }
  if (typeof module_format_version !== "string" || !TUTOR_FORMATS.includes(module_format_version)) {
    throw new TypeError(
      `a file of open tasks is of the module format ${TUTOR_FORMATS.join(" or ")}: the element's, or the one before`,
    );
  }
  const tasks = new Map<string, readonly OpenTask[]>();
  for (const { bank, digest, tasks: given } of banks) {
    if (typeof bank !== "string" || typeof digest !== "string" || !Array.isArray(given)) {
      throw new TypeError("a bank has its path, its digest and its tasks");
    }
    // A sample names its bank by its path: two of one path would give one's tasks the other's.
    if (tasks.has(bank)) throw new TypeError(`the bank ${bank} is in the file twice`);
    const source = { tag, fileDigest: `sha256:${fileSha256}`, bank, bankDigest: digest };
    tasks.set(
      bank,
      given.map(
        (task: { readonly id?: unknown; readonly canvas?: { readonly kind?: unknown } }) => {
          if (typeof task.id !== "string") throw new TypeError(`a task of ${bank} has no ID`);
          openOf(task, TASK, `${bank} ${task.id}:`, "refuse");
          return {
            reference: {
              source: { case: "tutor", value: source },
              task: task.id,
              openViewDigest: `sha256:${sha256(canonicalText(task))}`,
            },
            canvas: canvasOf(task, `${bank} ${task.id}`),
          };
        },
      ),
    );
  }
  return tasks;
}

/** A module's ID, as the format writes it: `<publisher>/<name>` (schemas/common.schema.json). */
const MODULE_ID = /^[a-z][a-z0-9]*(-[a-z0-9]+)*\/[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
/** A version, MAJOR.MINOR.PATCH, and a tag of a release, v and a version. */
const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const TAG = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

/** The tasks of a module's package, as the synthetic samples of its eval set take them (T86). */
export interface ModuleTasks {
  /** The module's ID, its version and the digest of its package. */
  readonly module: string;
  readonly version: string;
  readonly packageDigest: string;
  /** Every task of the package by its ID: the open task, or why the generator draws none. */
  readonly tasks: ReadonlyMap<string, OpenTask | RefusedTask>;
}

/** A task of a package the generator draws no sample of: why, and the digest of its open view,
 * which a person's sample of it names (T97), unless it is a template, which has no open view. */
export interface RefusedTask {
  readonly refused: string;
  readonly openViewDigest?: string;
}

/**
 * The tasks of a module's package as `module-kit build` writes it, given the texts of its
 * inventory.json and server.json, for samples that name the release of modules `tag` (R110 spec;
 * section 25 of the module format). The inventory is of the module format the element reads, and
 * names server.json by its digest and size; the package's digest is that of the inventory's text.
 * Of the canonical view the samples take each task's open view alone, which the walk of the open
 * view projects from it, as the server does (section 6). The generator draws a sheet whose one
 * answer slot is anywhere on it and a page of a workbook: a template, whose instance by a seed is
 * module-kit's, and a choice, an essay or a zone are refused, each with why. `sha256` gives the
 * SHA-256 of a text's UTF-8 bytes in hexadecimal. A package out of shape is a TypeError.
 */
export function moduleTasksOf(
  inventoryText: string,
  serverText: string,
  tag: string,
  sha256: (text: string) => string,
): ModuleTasks {
  if (!TAG.test(tag)) throw new TypeError(`${tag} is no tag of a release, vX.Y.Z`);
  const inventory = JSON.parse(inventoryText) as {
    readonly module_format_version?: unknown;
    readonly id?: unknown;
    readonly version?: unknown;
    readonly server_part?: { readonly digest?: unknown; readonly size?: unknown };
  };
  const { id: module, version } = inventory;
  if (inventory.module_format_version !== FORMAT) {
    throw new TypeError(`a package is of the module format ${FORMAT}, the element's`);
  }
  if (typeof module !== "string" || !MODULE_ID.test(module)) {
    throw new TypeError("a package's inventory names a module's ID, <publisher>/<name>");
  }
  if (typeof version !== "string" || !VERSION.test(version)) {
    throw new TypeError("a package's inventory names the module's version, MAJOR.MINOR.PATCH");
  }
  const size = utf8Size(serverText);
  if (
    inventory.server_part?.digest !== `sha256:${sha256(serverText)}` ||
    inventory.server_part.size !== size
  ) {
    throw new TypeError("server.json is not the server part its inventory names");
  }
  const { tasks: given } = JSON.parse(serverText) as { readonly tasks?: unknown };
  if (given === null || typeof given !== "object" || Array.isArray(given)) {
    throw new TypeError("the package's canonical view has no tasks");
  }
  const packageDigest = `sha256:${sha256(inventoryText)}`;
  const source = { tag, module, version, packageDigest };
  const tasks = new Map<string, OpenTask | RefusedTask>();
  for (const [id, task] of Object.entries(given)) {
    if (task === null || typeof task !== "object" || Array.isArray(task)) {
      throw new TypeError(`the task ${id} of ${module} is no object`);
    }
    if ((task as { readonly id?: unknown }).id !== id) {
      throw new TypeError(`the task ${id} of ${module} is not under its own ID`);
    }
    if (Object.hasOwn(task, "template")) {
      tasks.set(id, { refused: "a template: its instance by a seed is module-kit's" });
      continue;
    }
    const view = openOf(task, TASK, `${module} ${id}:`, "drop");
    const openViewDigest = `sha256:${sha256(canonicalText(view))}`;
    const refused = undrawn(view);
    tasks.set(
      id,
      refused === undefined
        ? {
            reference: { source: { case: "modules", value: source }, task: id, openViewDigest },
            canvas: canvasOf(view, `${module} ${id}`),
          }
        : { refused, openViewDigest },
    );
  }
  return { module, version, packageDigest, tasks };
}

/** The number of bytes a text takes in UTF-8: the DOM-free part has no encoder of its own. */
function utf8Size(text: string): number {
  let size = 0;
  for (const character of text) {
    const code = character.codePointAt(0) ?? 0;
    size += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
  }
  return size;
}

/** Why the generator draws no sample of a task's open view, if it draws none: it draws a sheet of
 * one answer slot anywhere on it, and a page of a workbook. */
function undrawn(view: Record<string, unknown>): string | undefined {
  const { canvas, items } = view as {
    readonly canvas?: { readonly kind?: unknown };
    readonly items?: readonly {
      readonly answer_slots?: readonly { readonly binding?: unknown }[];
      readonly line?: unknown;
    }[];
  };
  if (canvas?.kind === "workbook") {
    // A page's answers are its boxes: an item of an answer slot beside them the page does not draw.
    const boxed = (items ?? []).every((item) => Array.isArray(item.line) && !item.answer_slots);
    return boxed ? undefined : "a workbook with an answer slot outside its boxes";
  }
  if (canvas?.kind !== "handwriting_sheet") {
    return `a canvas of the kind ${String(canvas?.kind)}, neither a sheet nor a workbook`;
  }
  const slots = (items ?? []).flatMap((item) => item.answer_slots ?? []);
  const binding = items?.length === 1 && slots.length === 1 ? slots[0]?.binding : undefined;
  if (binding === "anywhere") return undefined;
  if (binding === "choice") return "a choice";
  if (binding === "sheet") return "an essay";
  if (binding === "zone") return "an answer slot in a zone";
  return "not one answer slot anywhere on the sheet";
}

/**
 * What a field of the open view holds: a text, a number or a truth value ("leaf"), a list of texts
 * ("leaves"), one object of a shape, or a list of such objects.
 */
type Field = "leaf" | "leaves" | { readonly one: Shape } | { readonly each: Shape };

/** The fields of an object of the open view, by name. */
interface Shape {
  readonly [name: string]: Field;
}

// The open view of a task, by the types spec generates from the marks x-open of its schemas: each
// table names every field of its type and no other, so that a field spec opens fails tsc until it
// is named here, and a closed field is never named.
const RECTANGLE = {
  left: "leaf",
  top: "leaf",
  width: "leaf",
  height: "leaf",
} as const satisfies Record<keyof open.SheetRectangle, Field>;
const SLOT = {
  binding: "leaf",
  zone: { one: RECTANGLE },
  options: "leaves",
} as const satisfies Record<keyof open.AnswerSlot, Field>;
const LINE_PART = { text: "leaf", binding: "leaf" } as const satisfies Record<
  keyof open.LinePart,
  Field
>;
const ITEM = {
  text: "leaf",
  answer_slots: { each: SLOT },
  line: { each: LINE_PART },
} as const satisfies Record<keyof open.Item, Field>;
const STATEMENT_PART = {
  text: "leaf",
  picture: "leaf",
  alt: "leaf",
  width: "leaf",
  height: "leaf",
} as const satisfies Record<keyof open.StatementPart, Field>;
const CANVAS = { kind: "leaf", grid: "leaf", grid_step: "leaf" } as const satisfies Record<
  keyof open.Canvas,
  Field
>;
const TASK = {
  id: "leaf",
  statement: { each: STATEMENT_PART },
  canvas: { one: CANVAS },
  items: { each: ITEM },
  givens: "leaves",
  unknown: "leaf",
} as const satisfies Record<keyof open.Task, Field>;

/** Whether a value is a text, a number or a truth value: what a leaf of the open view holds. */
function isLeaf(value: unknown): boolean {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

/** What the walk of the open view does with a field outside it: refuses it, or leaves it out. */
type Closed = "refuse" | "drop";

/**
 * The open view of an object, by its shape, at every depth. A field of another name is closed, or no
 * field of the format: a walk that refuses names where it is in a TypeError, and one that drops
 * leaves it out, as the open view does (section 6 of the module format). A field of the shape that
 * holds what the shape does not say — an object for a leaf — is a TypeError either way, since a
 * closed field could hide in it.
 */
function openOf(
  value: unknown,
  shape: Shape,
  path: string,
  closed: Closed,
): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${path} is no object of the open view`);
  }
  const view: Record<string, unknown> = {};
  for (const [name, given] of Object.entries(value)) {
    const at = `${path} ${name}`;
    // Own names alone: `constructor` of an object is no field.
    const field = Object.hasOwn(shape, name) ? shape[name] : undefined;
    if (field === undefined) {
      if (closed === "refuse") throw new TypeError(`${at} is no field of the open view`);
    } else if (field === "leaf") {
      if (!isLeaf(given)) throw new TypeError(`${at} is no text, number or truth value`);
      view[name] = given;
    } else if (field === "leaves") {
      if (!Array.isArray(given) || !given.every((one) => typeof one === "string")) {
        throw new TypeError(`${at} is no list of texts`);
      }
      view[name] = [...given];
    } else if ("one" in field) {
      view[name] = openOf(given, field.one, at, closed);
    } else {
      if (!Array.isArray(given)) throw new TypeError(`${at} is no list`);
      view[name] = given.map((each, index) => openOf(each, field.each, `${at}[${index}]`, closed));
    }
  }
  return view;
}

/** The kind of canvas of a task, and a workbook's items. */
function canvasOf(task: object, name: string): OpenTask["canvas"] {
  const { canvas, items } = task as { canvas?: { kind?: unknown }; items?: unknown };
  if (canvas?.kind === "handwriting_sheet") return { sheet: true };
  if (canvas?.kind === "workbook" && Array.isArray(items)) {
    return { workbook: items as WorkbookItem[] };
  }
  throw new TypeError(`the task ${name} is neither on a handwriting sheet nor in a workbook`);
}

/**
 * The canonical text of a JSON value, which a digest is taken of: as RFC 8785 writes it, which for
 * the data of the module format is its members in the order of their names' UTF-16 code units, no
 * white space, integers in decimal digits, and strings escaping only `"`, `\` and the control
 * characters (section 25 of the module format). JSON.stringify writes strings and integers so.
 * A number that is no integer is a RangeError: the format has none.
 */
export function canonicalText(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalText).join(",")}]`;
  if (value !== null && typeof value === "object") {
    // `<` compares strings by their UTF-16 code units, as RFC 8785 orders the names.
    const names = Object.keys(value).sort((a, b) => (a < b ? -1 : Number(a > b)));
    const members = names.map(
      (name) =>
        `${JSON.stringify(name)}:${canonicalText((value as Record<string, unknown>)[name])}`,
    );
    return `{${members.join(",")}}`;
  }
  if (typeof value === "number" && !Number.isSafeInteger(value)) {
    throw new RangeError(`the module format has integers only, not ${value}`);
  }
  return JSON.stringify(value);
}
