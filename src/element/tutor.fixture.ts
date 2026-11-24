import { expect } from "vitest";
import { toCrop } from "../core/tutor.js";
import type {
  ExportedPaper,
  HistoryEvent,
  NovatrailCanvas,
  PaperSubmission,
  TutorAct,
} from "./index.js";
import { paperCrop, settle } from "./pointer.fixture.js";
import { probe } from "./probe.js";

// What the tests of the tutor's act share: a task from paper with a stroke of the learner's and
// the context of its work, lines across the sheet as an act in the crop's pixels, and whether the
// canvas shows ink at a point of the sheet.

/** A stroke of the learner's on the sheet, below the tracing paper, in a history. */
export const written: HistoryEvent = {
  kind: "write",
  t: 100,
  stroke: {
    id: 1,
    kind: "pen",
    points: [
      { x: 300, y: 820, t: 0, p: 0.5 },
      { x: 340, y: 880, t: 100, p: 0.5 },
    ],
  },
};

/**
 * A task from paper with the learner's stroke, or the history given, the paper read, and the
 * context of its work for checking — of its drawing, should the sheet have no stroke.
 */
export async function paper(
  made: HTMLElement[],
  history: readonly HistoryEvent[] = [written],
): Promise<{ element: NovatrailCanvas; submission: PaperSubmission }> {
  const element = document.createElement("novatrail-canvas");
  element.style.width = "600px";
  element.style.height = "600px";
  document.body.append(element);
  made.push(element);
  element.paper = { statement: await paperCrop() };
  element.history = history;
  const grip = element.shadowRoot?.querySelector<HTMLButtonElement>("button.grip");
  await expect.poll(() => grip?.hidden).toBe(false);
  await settle();
  const work = ((await element.exportWork()) ??
    (await element.exportForDrawing())) as ExportedPaper;
  return { element, submission: work.submission };
}

/** Lines across the sheet at `y`, `count` of them a step apart down, as the crop's pixels. */
export function lines(submission: PaperSubmission, y: number, count: number, step = 6): TutorAct {
  const pixels = (x: number, at: number) => {
    const { x: px, y: py } = toCrop({ x, y: at }, submission);
    return [px, py];
  };
  return {
    strokes: Array.from({ length: count }, (_, k) => ({
      points: [...pixels(220, y + k * step), ...pixels(480, y + k * step)],
      color: "#ff3b30",
      width: 4,
    })),
    erase: [],
  };
}

/** Whether the canvas shows ink at a point of the sheet. */
export function inkAt(element: NovatrailCanvas, x: number, y: number): boolean {
  const canvas = element.shadowRoot?.querySelector("canvas");
  const view = probe(element).view;
  if (!canvas || view === undefined) throw new Error("the element is not laid out");
  const ratio = canvas.width / canvas.getBoundingClientRect().width;
  const pixel = canvas
    .getContext("2d")
    ?.getImageData(
      Math.floor((x - view.vx) * view.k * ratio),
      Math.floor((y - view.vy) * view.k * ratio),
      1,
      1,
    ).data;
  return (pixel?.[3] ?? 0) > 0;
}

/**
 * How many bytes of the element's canvas are off what a new element given its history shows, drawn
 * at once: more than the 24 levels by which browsers' rasterizers smooth an edge a rectangle cuts.
 */
export async function offFromWhole(made: HTMLElement[], element: NovatrailCanvas): Promise<number> {
  const fresh = document.createElement("novatrail-canvas");
  fresh.style.width = element.style.width;
  fresh.style.height = element.style.height;
  document.body.append(fresh);
  made.push(fresh);
  fresh.paper = element.paper;
  fresh.tracing = element.tracing;
  fresh.history = element.history;
  const grip = fresh.shadowRoot?.querySelector<HTMLButtonElement>("button.grip");
  await expect.poll(() => grip?.hidden).toBe(false);
  await settle();
  const pixels = (of: NovatrailCanvas) => {
    const canvas = of.shadowRoot?.querySelector("canvas");
    return (
      canvas?.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height).data ??
      new Uint8ClampedArray()
    );
  };
  const drawn = pixels(element);
  const whole = pixels(fresh);
  if (drawn.length !== whole.length) return Math.max(drawn.length, whole.length);
  let off = 0;
  for (let i = 0; i < whole.length; i++) {
    if (Math.abs((drawn[i] ?? 0) - (whole[i] ?? 0)) > 24) off++;
  }
  return off;
}
