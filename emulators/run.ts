// The journal of a run in an emulator or a simulator (R54 in docs/decisions.md): the probe's
// drivers (T74, T80 in RUN.md) and the samples page's (T78) write it alike. Each step says what it
// did, whether it did it, and whose failure a failed step is: the device's — the emulator, the
// browser, the download, the driver's way into the page — or the page's own. A failure of the
// device may be the runner's luck and earns one more pass; a failure of the page never does. The
// log goes to the console and to the run's folder, which the workflow keeps as its artifact.

import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** Whose failure a failed step would be. */
export type Kind = "device" | "page";

/** A step of the run. */
export interface Step {
  readonly step: string;
  readonly ok: boolean;
  readonly note: string;
  readonly kind: Kind;
  /** The pass the step belongs to: a run that failed on its device makes one more. */
  readonly pass: number;
}

/** What a run's steps come to: none failed, the page failed, or only the device did. */
export function verdict(steps: readonly Step[]): "ok" | "page" | "device" {
  const failed = steps.filter(({ ok }) => !ok);
  if (failed.some(({ kind }) => kind === "page")) return "page";
  return failed.length > 0 ? "device" : "ok";
}

/** The steps of a run's last pass, which alone say how it ended. */
export function lastPass(steps: readonly Step[]): Step[] {
  const pass = Math.max(1, ...steps.map((step) => step.pass));
  return steps.filter((step) => step.pass === pass);
}

/** The run's summary in Markdown, for the job's page: the verdict of its last pass in words, its
 * failed steps, and how many passes there were. */
export function summary(title: string, all: readonly Step[]): string {
  const steps = lastPass(all);
  const words = {
    ok: "все шаги прошли",
    page: "сбой страницы",
    device: "сбой эмулятора: страница до конца не проверена",
  };
  const failed = steps.filter(({ ok }) => !ok);
  const lines = failed.map(
    ({ step, note, kind }) => `- ${kind}: ${step}${note ? ` — ${note}` : ""}`,
  );
  const passes = steps[0]?.pass ?? 1;
  const again = passes > 1 ? `Проход ${passes}: прежний не прошёл из-за эмулятора.\n\n` : "";
  return `### ${title}: ${words[verdict(steps)]}\n\n${again}${lines.join("\n")}${lines.length ? "\n" : ""}`;
}

/** A line of the log on one line: a break in it would make a line the run never wrote. */
export function oneLine(line: string): string {
  return line.replace(/[\n\r]/g, " ");
}

/** The journal of one run, in its folder. */
export class Run {
  readonly steps: Step[] = [];
  /** The pass under way. */
  pass = 1;

  readonly folder: string;

  constructor(folder: string) {
    this.folder = folder;
    mkdirSync(folder, { recursive: true });
  }

  log(line: string): void {
    const one = oneLine(line);
    console.log(one);
    appendFileSync(join(this.folder, "log.txt"), `${one}\n`);
  }

  record(step: string, ok: boolean, note = "", kind: Kind = "device"): void {
    this.steps.push({ step, ok, note, kind, pass: this.pass });
    this.log(`${ok ? "ok  " : "FAIL"} ${step}${note ? ` — ${note}` : ""}`);
  }

  /** What the pass under way has come to. */
  verdict(): ReturnType<typeof verdict> {
    return verdict(lastPass(this.steps));
  }

  /** Throw if a step of the last pass failed, naming how many. */
  check(): void {
    const failed = lastPass(this.steps).filter(({ ok }) => !ok);
    if (failed.length > 0) {
      throw new Error(
        `${failed.length} step(s) failed: ${failed.map(({ step }) => step).join("; ")}`,
      );
    }
  }

  /** Write the steps, and the summary where the job has a page for one. */
  close(title: string): void {
    writeFileSync(join(this.folder, "steps.json"), `${JSON.stringify(this.steps, null, 2)}\n`);
    const page = process.env.GITHUB_STEP_SUMMARY;
    if (page) appendFileSync(page, summary(title, this.steps));
  }
}
