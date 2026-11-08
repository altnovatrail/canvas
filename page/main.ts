// The samples page (T19 in RUN.md; R55 in docs/decisions.md): a build of its own of the element
// <novatrail-canvas>, one HTML file that opens from a file on the device and goes to no network
// (R25 spec; R07, R11). scripts/page.ts builds it and puts the tasks in: their open views and the
// sample's reference to each, worked out at the build from tutor's file of open tasks in tasks/,
// as the synthetic samples take theirs (R49). The page takes the element as a consumer does,
// through its properties and events (the 2026-11-02 amendment to R07), and saves a sample of the
// author's own measurement, the one purpose open while the texts are a draft (R11), as a file on
// the device. The steps of the page — purpose, codes, notice, markup — are T20's; its texts here
// are for now.

import { Purpose, Writer } from "@altnovatrail/contracts/novatrail/eval/v1/sample_pb.js";
import { cellsOf } from "../src/core/boxes.js";
import { NO_MANIFEST } from "../src/core/manifest.js";
import { pageOf } from "../src/core/page.js";
import { type NovatrailCanvas, TAG, type Task } from "../src/element/index.js";
import { personId, type Surface, sampleOf, sampleText, writerCode } from "../src/eval/sample.js";
import type { OpenTask } from "../src/eval/tasks.js";

/** A task the build put in: what the picker calls it, its open view, and the sample's view of it. */
interface PageTask {
  readonly title: string;
  readonly task: Task;
  readonly open: OpenTask;
}

/** What scripts/page.ts puts into the build. */
declare const SAMPLES_PAGE: { readonly version: string; readonly tasks: readonly PageTask[] };

const data = SAMPLES_PAGE;
const picker = document.getElementById("task") as HTMLSelectElement;
const holder = document.getElementById("holder") as HTMLElement;
const status = document.getElementById("saved") as HTMLElement;
let sheet: NovatrailCanvas | undefined;
let shown = 0;
/** How much of the sheet's history the last saved sample held. */
let savedAt = 0;

/** The version of the page's texts: a draft until the lawyer has read them (R11), and never
 * `none`, which spec keeps for files no samples page wrote. T20 brings the set of texts. */
const TEXT_SET = "draft-0";
/** The writer's code of this opening: one for every sample saved until the page is closed, shown
 * so that the adult writes it down (R09, R11). The page remembers it nowhere. T20 asks for it. */
const CODE = writerCode(crypto.getRandomValues(new Uint8Array(8)));

(document.getElementById("version") as HTMLElement).textContent =
  `Версия страницы: ${data.version}.`;
(document.getElementById("code") as HTMLElement).textContent = CODE;

for (const [index, { title }] of data.tasks.entries()) {
  picker.append(new Option(title, String(index)));
}

/** The task the picker shows. */
function chosen(): PageTask {
  const task = data.tasks[Number(picker.value)];
  if (task === undefined) throw new RangeError("no task is chosen");
  return task;
}

/** A new element for the chosen task: no stroke of another task stays on it. Strokes not saved
 * are lost only after the person says so; else the picker goes back. */
function mount(): void {
  if (
    sheet &&
    sheet.history.length > savedAt &&
    !confirm("Написанное не сохранено. Перейти к другой задаче?")
  ) {
    picker.value = String(shown);
    return;
  }
  shown = Number(picker.value);
  savedAt = 0;
  sheet?.remove();
  const element = document.createElement(TAG) as NovatrailCanvas;
  element.lang = "ru";
  element.task = chosen().task;
  // The tasks of this build have no media; a task that names one is a page's mistake to see.
  element.media = async (ref: string) => {
    throw new TypeError(`this build has no media ${ref}`);
  };
  holder.append(element);
  sheet = element;
  status.textContent = "";
}

/** Random bytes for a sample's ID and its writer's code, from the browser's own source. */
function random(count: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(count));
}

/** The sample of what is on the sheet: the author's own measurement, with its history (R09). */
function current(): { id: string; text: string } {
  const { open } = chosen();
  const history = sheet?.history ?? [];
  const digit = NO_MANIFEST.digit;
  const surface: Surface =
    "workbook" in open.canvas
      ? { workbook: { history, cells: cellsOf(pageOf(open.canvas.workbook)), digit } }
      : { sheet: { history, digit } };
  const sample = sampleOf({
    id: personId(random(12)),
    purpose: Purpose.MEASUREMENT,
    writer: Writer.ADULT,
    origin: { person: { textSetVersion: TEXT_SET, canvasVersion: data.version } },
    writerCode: CODE,
    task: open.reference,
    surface,
    markup: {},
  });
  return { id: sample.id, text: sampleText(sample) };
}

/** Save the sample as a file on the device: a link to a blob of the page's own (T29, T74). */
function save(): void {
  const { id, text } = current();
  savedAt = sheet?.history.length ?? 0;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  link.download = `sample-${id}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  // The download has its own copy once it has begun.
  setTimeout(() => URL.revokeObjectURL(link.href), 60_000);
  status.textContent = `Образец ${id} сохранён в загрузки.`;
}

picker.addEventListener("change", mount);
(document.getElementById("save") as HTMLButtonElement).addEventListener("click", save);
mount();
