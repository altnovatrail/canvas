import type { InkPoint, Stroke } from "./ink.js";

/**
 * What the recorder takes of a pointer event, and of each event coalesced into it. The DOM-free
 * part sees no DOM (R12), so the element hands it this much, the place already in sheet units.
 */
export interface PointerSample {
  /** The event's `pointerId`. */
  readonly pointerId: number;
  /** The event's `pointerType`, as it came. */
  readonly kind: string;
  /** The event's `button`, the button whose state changed: 0 is the primary, -1 none. */
  readonly button: number;
  /** The event's `buttons`, the buttons held: bit 1 is the primary. */
  readonly buttons: number;
  /** Where, in sheet units, clamped to the sheet. */
  readonly x: number;
  readonly y: number;
  /** When: the event's `timeStamp`, in milliseconds. */
  readonly time: number;
  /** The event's `pressure`, 0 to 1. */
  readonly pressure: number;
}

/**
 * How close two recorded points of a stroke may come, in sheet units: 0.1, the precision of a
 * sample file (R09). A point nearer than that to the last one recorded adds nothing the file would
 * keep (R18).
 */
export const MIN_STEP = 0.1;

/** `button` of the primary button: a pen's tip, a finger, a mouse's left button. */
const PRIMARY = 0;
/** The primary button's bit in `buttons`. */
const PRIMARY_HELD = 1;

/** The stroke being written, with what the recorder needs to go on with it. */
interface Live {
  readonly id: number;
  readonly kind: string;
  readonly points: InkPoint[];
  readonly pointerId: number;
  /** The pointer's latest place, recorded or not: the stroke ends there. */
  latest: InkPoint;
}

/**
 * The strokes of one sheet, from the pointer's samples (R18; architecture 3.1 in
 * docs/architecture.md). One pointer writes at a time, with its primary button: a second pointer,
 * and any other button, write nothing while a stroke is under way. A finished stroke goes to the
 * handler the recorder is made with — onto the work on the sheet (R19).
 */
export class Recorder {
  readonly #finished: (stroke: Stroke) => void;
  #live: Live | undefined;
  #nextId = 1;
  #origin: number | undefined;
  #lastT = 0;

  constructor(finished: (stroke: Stroke) => void) {
    this.#finished = finished;
  }

  /** The stroke being written, or nothing between strokes. */
  get live(): Stroke | undefined {
    return this.#live;
  }

  /** The `pointerId` of the pointer writing, or nothing between strokes. */
  get pointer(): number | undefined {
    return this.#live?.pointerId;
  }

  /** `pointerdown`: a stroke begins here, if none is under way and the primary button went down. */
  down(sample: PointerSample): boolean {
    if (this.#live !== undefined || sample.button !== PRIMARY) return false;
    const point = this.#point(sample, sample.pressure);
    this.#live = {
      id: this.#nextId++,
      kind: sample.kind,
      points: [point],
      pointerId: sample.pointerId,
      latest: point,
    };
    return true;
  }

  /**
   * `pointermove`, once for each coalesced event: the stroke goes on here. A move without the
   * primary button held ends the stroke where it was, its `pointerup` lost.
   */
  move(sample: PointerSample): boolean {
    const live = this.#live;
    if (live === undefined || sample.pointerId !== live.pointerId) return false;
    if ((sample.buttons & PRIMARY_HELD) === 0) return this.#finish();
    const point = this.#point(sample, sample.pressure);
    live.latest = point;
    const last = live.points[live.points.length - 1];
    if (last !== undefined && Math.hypot(point.x - last.x, point.y - last.y) < MIN_STEP) {
      return false;
    }
    live.points.push(point);
    return true;
  }

  /**
   * `pointerup`: the stroke ends where and when the pointer left, however near the last point,
   * so that the stroke keeps a pause before it. Its pressure is the last move's: `pointerup`'s
   * is 0 by definition, the buttons no longer pressed, rather than measured.
   */
  up(sample: PointerSample): boolean {
    const live = this.#live;
    if (live === undefined || sample.pointerId !== live.pointerId) return false;
    live.latest = this.#point(sample, live.latest.p);
    return this.#finish();
  }

  /** `pointercancel`: the device took the touch for an accident, and the stroke goes (R05). */
  cancel(pointerId: number): boolean {
    if (this.#live?.pointerId !== pointerId) return false;
    this.#live = undefined;
    return true;
  }

  /**
   * The stroke ends where the pointer last was, its `pointerup` never to come: the pointer's
   * capture was lost, or the sheet left the page. Any pointer's stroke, unless one is named.
   */
  end(pointerId?: number): boolean {
    if (this.#live === undefined) return false;
    if (pointerId !== undefined && this.#live.pointerId !== pointerId) return false;
    return this.#finish();
  }

  #finish(): boolean {
    const live = this.#live;
    if (live === undefined) return false;
    if (live.latest !== live.points[live.points.length - 1]) live.points.push(live.latest);
    // The stroke is no longer under way by the time the handler has it.
    this.#live = undefined;
    this.#finished({ id: live.id, kind: live.kind, points: live.points });
    return true;
  }

  /** A point of the sample, its time counted from the sheet's first event and never going back. */
  #point(sample: PointerSample, pressure: number): InkPoint {
    this.#origin ??= sample.time;
    const t = Math.max(sample.time - this.#origin, this.#lastT);
    this.#lastT = t;
    return { x: sample.x, y: sample.y, t, p: pressure };
  }
}
