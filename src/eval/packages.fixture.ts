// A module's package for the tests (T86; R63): grade-3-math 0.2.0, a copy from the release of modules
// v0.2.0, whose index ci-licenses verifies by release-verify; and the same package with its
// canonical view changed, its inventory naming the view anew, as module-kit build would write it.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { canonicalText } from "./tasks.js";

/** The release of modules the tree holds, and its package of grade-3-math. */
export const RELEASE = new URL("../../tasks/modules-v0.2.0/", import.meta.url);
export const PACKAGE = new URL("novatrail-grade-3-math-0.2.0/", RELEASE);
export const INVENTORY = readFileSync(new URL("inventory.json", PACKAGE), "utf8");
export const SERVER = readFileSync(new URL("server.json", PACKAGE), "utf8");

/** The SHA-256 of a text's UTF-8 bytes, in hexadecimal. */
export const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");

/** A JSON object to change. */
export type Json = Record<string, unknown>;

/** A task of a canonical view, by its ID: times-tables-d1 unless another is named. */
export const taskIn = (view: Json, id = "times-tables-d1") =>
  (view.tasks as Record<string, Json>)[id] as Json;

/** The texts of inventory.json and server.json of the package with its canonical view changed, and
 * its module's ID too when one is given. */
export function repackaged(change: (view: Json) => void, module?: string): [string, string] {
  const view = JSON.parse(SERVER);
  change(view);
  const server = canonicalText(view);
  const inventory = JSON.parse(INVENTORY);
  inventory.server_part = { digest: `sha256:${sha256(server)}`, size: Buffer.byteLength(server) };
  if (module) inventory.id = module;
  return [canonicalText(inventory), server];
}
