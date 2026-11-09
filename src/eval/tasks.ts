// The tasks the synthetic samples answer (R49): the open views of a file of open tasks of a release
// of tutor, which the tree holds as it came and ci-licenses verifies by spec's release-verify (R77
// spec). A sample names its task without its key (R05 spec): the release's tag, the file's digest,
// the bank, the bank's digest as the file gives it, the task's ID, and the digest of its open view,
// as the module format takes a digest (contracts/README.md, section «The sample file»). The file is
// of the version of the module format the element reads, or of 0.3 before it, or it is refused
// (T77, T85): of a task, the
// samples take only its ID, its kind of canvas and a workbook's items, which have the shape the
// layout of a page reads (R35).

import type { TaskReferenceSchema } from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
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
    const source = { tag, fileDigest: `sha256:${fileSha256}`, bank, bankDigest: digest };
    tasks.set(
      bank,
      given.map(
        (task: { readonly id?: unknown; readonly canvas?: { readonly kind?: unknown } }) => {
          if (typeof task.id !== "string") throw new TypeError(`a task of ${bank} has no ID`);
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
