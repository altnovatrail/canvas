// A temporary folder for a test of the scripts, removed when the test finishes.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { onTestFinished } from "vitest";

/** A new empty folder under the system's temporary one, gone after the test that asked for it. */
export function temporary(prefix: string): string {
  const folder = mkdtempSync(join(tmpdir(), `${prefix}-`));
  onTestFinished(() => rmSync(folder, { recursive: true, force: true }));
  return folder;
}
