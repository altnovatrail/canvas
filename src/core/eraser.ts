import type { Stroke } from "./ink.js";
import { type PointerSample, PRIMARY, PRIMARY_HELD } from "./recorder.js";
import type { Point } from "./screen.js";

/** `button` of a pen's eraser, its other end (Pointer Events Level 3). */
export const ERASER_BUTTON = 5;
/** The eraser's bit in `buttons`. */
const ERASER_HELD = 32;

/** The press under way. */
interface Press {
  readonly pointerId: number;
  /** The bit of `buttons` that holds the press: the primary button's, or a pen eraser's. */
  readonly held: number;
  /** How near a stroke's points the eraser takes it, in sheet units. */
  readonly reach: number;
  /** The eraser's latest place, and the page's time of it. */
  last: Point;
  time: number;
  /** The strokes the press has come near, by ID. */
  readonly hits: Set<number>;
}

const NONE: ReadonlySet<number> = new Set();

/**
 * The eraser (R22): one press of a pointer takes off the sheet, whole, every stroke its path comes
 * near — a tap is a path of one point. The strokes it comes near are pending while it is down, and
 * when it lifts they go to the handler the eraser is made with, in one action, with the page's
 * time of the lift: one undo brings them all back. `pointercancel` drops the press and erases
 * nothing. One pointer erases at a time, with the primary button or a pen's eraser.
 */
export class Eraser {
  readonly #near: (from: Point, to: Point, reach: number) => readonly Stroke[];
  readonly #finished: (ids: readonly number[], time: number) => void;
  #press: Press | undefined;

  constructor(
    near: (from: Point, to: Point, reach: number) => readonly Stroke[],
    finished: (ids: readonly number[], time: number) => void,
  ) {
    this.#near = near;
    this.#finished = finished;
  }

  /** The `pointerId` of the pointer erasing, or nothing between presses. */
  get pointer(): number | undefined {
    return this.#press?.pointerId;
  }

  /** The IDs of the strokes the press under way has come near: they go when it lifts. */
  get pending(): ReadonlySet<number> {
    return this.#press?.hits ?? NONE;
  }

  /**
   * `pointerdown`: a press begins here, `reach` sheet units wide on either side, if none is under
   * way and the primary button or a pen's eraser went down. It takes what lies under it at once.
   */
  down(sample: PointerSample, reach: number): boolean {
    if (this.#press !== undefined) return false;
    let held: number;
    if (sample.button === PRIMARY) held = PRIMARY_HELD;
    else if (sample.button === ERASER_BUTTON && sample.kind === "pen") held = ERASER_HELD;
    else return false;
    const point = { x: sample.x, y: sample.y };
    const press: Press = {
      pointerId: sample.pointerId,
      held,
      reach,
      last: point,
      time: sample.time,
      hits: new Set(),
    };
    this.#press = press;
    this.#take(press, point);
    return true;
  }

  /**
   * `pointermove`, once for each coalesced event: the eraser goes on to here, and says whether it
   * came near a stroke it had not. A move without its button held ends the press where it was.
   * A pointer out of sight of the sheet — beyond the part on the screen, where a captured pointer
   * goes on — takes nothing, and the way goes on from the last place in sight when it comes back:
   * the eraser takes only what the learner sees it pass.
   */
  move(sample: PointerSample, inSight = true): boolean {
    const press = this.#press;
    if (press === undefined || sample.pointerId !== press.pointerId) return false;
    if ((sample.buttons & press.held) === 0) return this.#finish(press.time);
    press.time = sample.time;
    if (!inSight) return false;
    const point = { x: sample.x, y: sample.y };
    const took = this.#take(press, point);
    press.last = point;
    return took;
  }

  /** `pointerup`: the eraser goes on to where the pointer left, if in sight, and the press lands. */
  up(sample: PointerSample, inSight = true): boolean {
    const press = this.#press;
    if (press === undefined || sample.pointerId !== press.pointerId) return false;
    if (inSight) this.#take(press, { x: sample.x, y: sample.y });
    return this.#finish(sample.time);
  }

  /** `pointercancel`: the device took the touch for an accident, and nothing is erased (R05). */
  cancel(pointerId: number): boolean {
    if (this.#press?.pointerId !== pointerId) return false;
    this.#press = undefined;
    return true;
  }

  /**
   * The press ends where the pointer last was, its `pointerup` never to come: the pointer's capture
   * was lost, or the sheet left the page. Any pointer's press, unless one is named.
   */
  end(pointerId?: number): boolean {
    const press = this.#press;
    if (press === undefined) return false;
    if (pointerId !== undefined && press.pointerId !== pointerId) return false;
    return this.#finish(press.time);
  }

  /** The strokes near the eraser's way from its last place to `to`: whether any was new. */
  #take(press: Press, to: Point): boolean {
    let took = false;
    for (const stroke of this.#near(press.last, to, press.reach)) {
      if (press.hits.has(stroke.id)) continue;
      press.hits.add(stroke.id);
      took = true;
    }
    return took;
  }

  #finish(time: number): boolean {
    const press = this.#press;
    if (press === undefined) return false;
    // The press is no longer under way by the time the handler has its strokes.
    this.#press = undefined;
    if (press.hits.size > 0) this.#finished([...press.hits], time);
    return true;
  }
}
