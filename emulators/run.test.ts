// The journal of a run in an emulator (R54 in docs/decisions.md): whose failure a run's end is,
// and the summary its job shows.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { lastPass, oneLine, Run, type Step, summary, verdict } from "./run.ts";

const step = (ok: boolean, kind: Step["kind"], pass = 1): Step => ({
  step: `${kind} ${ok}`,
  ok,
  note: "",
  kind,
  pass,
});

test("a failed step of the page makes it the page's failure, whatever the device did", () => {
  expect(verdict([step(true, "device"), step(true, "page")])).toBe("ok");
  expect(verdict([step(false, "device"), step(true, "page")])).toBe("device");
  expect(verdict([step(false, "device"), step(false, "page")])).toBe("page");
  expect(verdict([])).toBe("ok");
});

test("only the last pass says how the run ended, and the summary says there was another", () => {
  const steps = [step(false, "device", 1), step(true, "device", 2), step(true, "page", 2)];
  expect(lastPass(steps)).toHaveLength(2);
  expect(summary("Android", steps)).toBe(
    "### Android: все шаги прошли\n\nПроход 2: прежний не прошёл из-за эмулятора.\n\n",
  );
  expect(summary("iPad", [step(false, "page")])).toBe(
    "### iPad: сбой страницы\n\n- page: page false\n",
  );
});

test("the log keeps a line on one line, and the run fails on a failed step of its last pass", () => {
  expect(oneLine("a\nb\rc")).toBe("a b c");
  const folder = mkdtempSync(join(tmpdir(), "canvas-run-"));
  try {
    const run = new Run(folder);
    run.record("boot", false);
    expect(run.verdict()).toBe("device");
    run.pass = 2;
    run.record("boot", true);
    run.record("draw", true, "a note", "page");
    expect(() => run.check()).not.toThrow();
    run.record("save", false, "", "page");
    expect(() => run.check()).toThrow("1 step(s) failed: save");
    run.close("Test");
    expect(JSON.parse(readFileSync(join(folder, "steps.json"), "utf8"))).toHaveLength(4);
    expect(readFileSync(join(folder, "log.txt"), "utf8")).toContain("ok   draw — a note\n");
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});
