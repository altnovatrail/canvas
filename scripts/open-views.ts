// What the build of the samples page and the copy of the open views of modules share (T101 in
// RUN.md; R71 in docs/decisions.md): the file module-kit open writes, which tasks the page takes of
// it, and which files of media/ a task may name. Both scripts/page.ts and scripts/modules.ts take
// it, so that the copy holds the media of the very tasks the build carries; a module of its own, so
// that the copy's command loads none of the page's builder.

import type * as open from "@altnovatrail/spec/formatv0/open";
import type { TaskKind } from "../page/texts.ts";

/** The file module-kit open writes the open views in (R43 module-kit). */
export const OPEN_VIEWS = "open-views.json";

/** The version of the module format the element reads — FORMAT of src/core/manifest.ts, which a
 * test holds this to: the packages the copy takes are of it (R44 spec). */
export const MODULE_FORMAT = "0.4";

/** A task of an open view, as its JSON holds it. */
export type ViewTask = Pick<open.Task, "id" | "statement" | "items"> &
  Partial<Pick<open.Task, "canvas">>;

/**
 * The kind a task is on the page, or none for one the page could not mark up: a page of a workbook,
 * and a sheet by its one answer slot — anywhere on it, or the whole sheet, an essay. A task of more
 * slots, or of a zone or a choice the learner taps, has none.
 */
export function kindOf(task: ViewTask): TaskKind | undefined {
  if (task.canvas?.kind === "workbook") return "workbook";
  const slots = task.items.flatMap((item) => item.answer_slots ?? []);
  const binding = task.items.length === 1 && slots.length === 1 ? slots[0]?.binding : undefined;
  if (binding === "anywhere") return "sheet";
  return binding === "sheet" ? "essay" : undefined;
}

/** The types of the pictures a module may carry, by the extension of their files (§21 of the
 * README of the module format). */
export const PICTURE_TYPES: Readonly<Record<string, string>> = Object.freeze({
  png: "image/png",
  webp: "image/webp",
});

/**
 * The type of a picture a statement names, by its path from the module's media/: a path of words
 * between slashes, none of them empty, `.` or `..`, with no backslash, and of a file PNG or WebP. Any
 * other path is an Error, for the copy and the build would read a file outside media/.
 */
export function pictureType(path: string): string {
  const words = path.split("/");
  if (path.includes("\\") || words.some((word) => word === "" || word === "." || word === "..")) {
    throw new Error(`${path} is no path inside a module's media/`);
  }
  const extension = path.split(".").pop() ?? "";
  // Own names alone: `constructor` is no extension of a picture.
  const type = Object.hasOwn(PICTURE_TYPES, extension) ? PICTURE_TYPES[extension] : undefined;
  if (type === undefined) throw new Error(`${path} is no PNG or WebP picture`);
  return type;
}
