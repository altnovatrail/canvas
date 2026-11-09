// The volunteer's way through the samples page, the same on every device (T78 in RUN.md; R54 in
// docs/decisions.md): the page opened with the watch of emulators/watch.ts in it, a stroke on the
// sheet and its sample saved, the workbook's page, a stroke there and its sample saved, and what
// the page did all along. A device — emulators/page-android.ts, emulators/page-ipad.ts — gives the
// ways of its own: how the page opens, how a stroke is drawn, how the save button is pressed. Its
// own steps are the device's, which earn the run one more pass when they fail; the steps here are
// the page's, which fail it.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import type { Run } from "./run.ts";
import { blobAt, type Seen, TASKS, verdicts, WORKBOOK } from "./watch.ts";

/** What a device does on the volunteer's way. A step it cannot do it records as the device's and
 * says so by its answer. */
export interface Device {
  /** Open the page with the watch in it; whether it opened. */
  open(): Promise<boolean>;
  /** What READ gives, or undefined while the page cannot be read. */
  read(): Promise<Seen | undefined>;
  /** Run an expression in the page, its value back. */
  evaluate(expression: string): Promise<unknown>;
  /** Draw a stroke on the element: how, or undefined when the device could not. */
  draw(name: string): Promise<string | undefined>;
  /** Press the save button; whether the device could. */
  press(name: string): Promise<boolean>;
  /** Show the workbook's page, answering the page's question as a person would: yes. */
  toWorkbook(): Promise<void>;
  /** The requests the page made, beyond the page itself. */
  requests(seen: Seen): string[];
  /** A picture of the screen. */
  shot(name: string): void;
  /** Close what open() opened. */
  close(): Promise<void>;
}

/** The surfaces of the way: the sheet first, then the workbook's page. */
const SURFACES = ["sheet", "workbook"] as const;

/** Wait until the page has its element and the watch has seen it from its start: a reload under
 * way would show the document before it, which the watch never saw. */
async function ready(device: Device, seconds: number): Promise<Seen | undefined> {
  for (let i = 0; i < seconds; i++) {
    const shown = await device.read();
    if (shown?.watched && shown.defined && shown.tasks > 0) return shown;
    await sleep(1000);
  }
  return device.read();
}

/** Wait for the page to hand the file at an index to a download, and keep its text, when asked to,
 * in the run's folder saved/; whether it came. */
async function handed(
  run: Run,
  device: Device,
  index: number,
  name: string,
  keep: boolean,
): Promise<boolean> {
  for (let i = 0; i < 10; i++) {
    const text = await device.evaluate(blobAt(index)).catch(() => null);
    if (typeof text === "string") {
      if (keep) {
        mkdirSync(join(run.folder, "saved"), { recursive: true });
        writeFileSync(join(run.folder, "saved", `${name}.json`), text);
      }
      device.shot(`${name}-saved`);
      return true;
    }
    await sleep(1000);
  }
  return false;
}

/** One pass of the volunteer's way. The files the page saves are kept from the watch's copies
 * when keep is set; a device that takes them off itself leaves it unset. */
export async function volunteer(run: Run, device: Device, keep: boolean): Promise<void> {
  if (!(await device.open())) return;
  try {
    const shown = await ready(device, 30);
    device.shot("opened");
    run.record(
      "the element stands and offers the build's tasks",
      Boolean(shown?.watched && shown.defined && shown.tasks === TASKS),
      `${shown?.tasks ?? 0} task(s)`,
      "page",
    );
    if (!shown?.defined) return;
    for (const [index, name] of SURFACES.entries()) {
      if (name === "workbook") {
        await device.toWorkbook();
        run.record(
          "the picker shows the workbook's page",
          (await device.read())?.task === WORKBOOK,
          "",
          "page",
        );
      }
      const how = await device.draw(name);
      if (how === undefined) return;
      const strokes = (await device.read())?.strokes ?? -1;
      run.record(`the ${name} holds the stroke drawn`, strokes > 0, `${strokes}, ${how}`, "page");
      if (!(await device.press(name))) return;
      run.record(
        `the ${name}'s sample is handed to a download`,
        await handed(run, device, index, name, keep),
        "",
        "page",
      );
    }
    const last = await device.read();
    const requests = last ? device.requests(last) : [];
    writeFileSync(
      join(run.folder, "watch.json"),
      `${JSON.stringify({ seen: last, requests }, null, 2)}\n`,
    );
    if (!last) run.record("read the page at the end", false);
    else
      for (const { step, ok, note } of verdicts(last, requests)) run.record(step, ok, note, "page");
  } finally {
    await device.close();
  }
}

/** Passes of a run: one, and one more when the device failed it, after the device's recovery. A
 * pass that throws is the device's failure: the page's own are steps it records. */
export async function passes(
  run: Run,
  pass: () => Promise<void>,
  recover: () => Promise<void>,
): Promise<void> {
  for (;;) {
    try {
      await pass();
    } catch (error) {
      run.record("the pass went to its end", false, String(error).slice(0, 200));
    }
    if (run.verdict() !== "device" || run.pass >= 2) return;
    run.log("the device failed: one more pass");
    await recover();
    run.pass += 1;
  }
}
