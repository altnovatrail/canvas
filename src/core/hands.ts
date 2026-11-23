/**
 * A pointer as the hands on the sheet see it: where it is on the screen, how big its contact
 * is, and when (R29). The DOM-free part sees no DOM, so the element hands it this much of each
 * pointer event. The contact's size decides only what the pointer may do: it goes into no stroke,
 * no history and no sample.
 */
export interface Contact {
  /** The event's `pointerId`. */
  readonly pointerId: number;
  /** The event's `pointerType`, as it came: "pen", "touch", "mouse" or another. */
  readonly kind: string;
  /** Where on the screen, in CSS pixels: the event's `clientX` and `clientY`. */
  readonly x: number;
  readonly y: number;
  /**
   * The contact's size on the screen, in CSS pixels: the event's `width` and `height`, 1 where the
   * hardware does not measure it (Pointer Events Level 3).
   */
  readonly width: number;
  readonly height: number;
  /** When: the event's `timeStamp`, in milliseconds. */
  readonly time: number;
}

/**
 * A touch wider or taller than this, in CSS pixels, is a palm. WebKit on iPadOS gives a touch
 * twice its contact's radius, a fingertip's 40–60 px by one report, so canvas-api's 30 px would
 * take most fingers there for palms. No tablet has measured it.
 */
export const PALM_PX = 100;

/**
 * Two touches that come down at most this many milliseconds apart are two fingers of one gesture:
 * Android's tap timeout, 100 ms, with a margin for children's fingers.
 */
export const PAIR_MS = 150;

/**
 * How far a touch may wander, in CSS pixels, before it is going somewhere: Android's touch
 * slop, 8 dp. A finger that has gone further is writing, and two fingers scroll once their middle
 * has gone further.
 */
export const SLOP_PX = 8;

/**
 * Two fingers that have gone this many times further along one axis than along the other, when
 * they pass the slop, scroll along that axis alone for the rest of the gesture: a scroll
 * down a sheet does not wander sideways, nor one across it up and down. Between, they go
 * both ways.
 */
export const RAIL = 2;

/**
 * The pen mode: on from a pen's touch on a sheet, till the page goes, with no button that
 * turns it off: while it is on, a finger neither writes nor erases, and moves the sheet. One is
 * shared by every sheet of a page, and it lives in memory alone: nothing is stored or sent, and a
 * new page starts without it.
 *
 * It knows, too, whether any sheet of the page is written on, and tells its sheets when the last
 * stroke ends: each bar shows the mode as it is then.
 */
export class PenMode {
  #on = false;
  readonly #watchers = new Set<() => void>();
  readonly #sheets = new Set<() => boolean>();

  get on(): boolean {
    return this.#on;
  }

  /** Every watcher hears of a change. */
  set on(on: boolean) {
    if (on === this.#on) return;
    this.#on = on;
    this.#tell();
  }

  /** Whether a pointer writes or erases now on a sheet of the page. */
  get writing(): boolean {
    for (const writes of this.#sheets) if (writes()) return true;
    return false;
  }

  /**
   * `watcher` hears of every change from now on, and of every stroke that ends, until the function
   * this gives is called.
   */
  watch(watcher: () => void): () => void {
    this.#watchers.add(watcher);
    return () => {
      this.#watchers.delete(watcher);
    };
  }

  /** A sheet tells whether it is written on, until the function this gives is called. */
  enlist(writes: () => boolean): () => void {
    this.#sheets.add(writes);
    return () => {
      this.#sheets.delete(writes);
    };
  }

  /** A pointer lifted off a sheet: once no sheet is written on, every watcher hears of it. */
  settle(): void {
    if (!this.writing) this.#tell();
  }

  #tell(): void {
    for (const watcher of [...this.#watchers]) watcher();
  }
}

/** What the hands ask of the sheet they serve. */
export interface HandsSheet {
  /** The pointer that writes or erases now, if one does: the recorder's or the eraser's. */
  writer(): number | undefined;
  /** The stroke or the erasing of a pointer goes, as on `pointercancel`. */
  drop(pointerId: number): void;
  /**
   * Two fingers moved right on the screen by `dx` CSS pixels and down it by `dy`, or left and up
   * for negative ones: the sheet goes with them. `fresh` marks a gesture's first step.
   */
  scroll(dx: number, dy: number, fresh: boolean): void;
  /**
   * Two fingers drew apart, or together, by `ratio` of the span between them: the sheet's zoom
   * goes by it, the point of the sheet at `x` and `y` on the screen, their middle, standing.
   */
  zoom(ratio: number, x: number, y: number): void;
  /**
   * Whether the sheet scrolls across at all now: one wider than its container does. A
   * gesture on a sheet that does not goes by its travel down alone.
   */
  across(): boolean;
}

/**
 * What a pointer down on the sheet does:
 * - "writes": it may write or erase, and does while the sheet says it is the writer;
 * - "waits": a finger in pen mode, waiting for a second to scroll with, or to go past the slop
 *   and drag the sheet alone;
 * - "scrolls": the finger that drags the sheet, or one of the two fingers of a gesture;
 * - "palm": too big for a finger, it does nothing until it lifts;
 * - "idle": it does nothing until it lifts.
 */
export type Role = "writes" | "waits" | "scrolls" | "palm" | "idle";

interface Hand {
  readonly kind: string;
  role: Role;
  /** Where and when it came down. */
  readonly x0: number;
  readonly y0: number;
  readonly t0: number;
  /** Where it is now on the screen. */
  x: number;
  y: number;
  /** How far it has been from where it came down, at most. */
  travel: number;
}

/** A point on the screen, in CSS pixels. */
interface At {
  readonly x: number;
  readonly y: number;
}

/** One finger dragging the sheet, in pen mode, or two fingers scrolling. */
interface Gesture {
  readonly fingers: readonly [number] | readonly [number, number];
  /** Their middle when the gesture began: where one finger came down. */
  readonly from: At;
  /** Their middle at the last step, once it has gone past the slop. */
  last: At | undefined;
  /** The axes the gesture scrolls along, chosen as it passes the slop (`RAIL`). */
  across: boolean;
  down: boolean;
  /**
   * Two fingers' span on the screen when the gesture began, and at the last step of their pinch,
   * once it has gone past the slop.
   */
  readonly span0: number;
  span: number | undefined;
  /**
   * The finger whose move waits for its partner's before the span is read: a browser tells the
   * fingers' moves one by one, and the span between one moved and one not yet is no pinch.
   */
  unpaired: number | undefined;
}

/**
 * The hands on a sheet: which pointer may write, which is a palm, and which two fingers
 * scroll, for a pen, fingers and a mouse on one screen.
 * - One pointer writes at a time, and the sheet's recorder and eraser say which.
 * - A pen's touch puts the page in pen mode and takes away the stroke of a touch under way: it was
 *   a palm. While a pen or a mouse writes, a touch does nothing until it lifts.
 * - A touch wider or taller than `PALM_PX`, at its `pointerdown` or at any move, is a palm: it does
 *   nothing until it lifts, and what it was writing goes.
 * - Without pen mode the first finger writes. A second that comes down within `PAIR_MS`, before the
 *   first has gone `SLOP_PX`, takes the first one's stroke away, and the two scroll. A second that
 *   comes later does nothing.
 * - In pen mode a finger writes nothing, and two that come down within `PAIR_MS` scroll. One that
 *   goes further than `SLOP_PX` alone, before a second comes, drags the sheet: the second does
 *   nothing then.
 * - A third finger does nothing. When one of the two lifts, the other does nothing until it lifts.
 * - Two fingers scroll by the travel of their middle on the screen, and one by its own, past its
 *   first `SLOP_PX`: along one axis alone if it went `RAIL` times further along it than along the
 *   other, or else both.
 * - Two fingers whose span has changed by more than `SLOP_PX` pinch too: the zoom goes by the
 *   span's ratio from there, about their middle.
 * - Any other pointer, a mouse or one of no type, writes when nothing does, whatever the mode.
 */
export class Hands {
  readonly #sheet: HandsSheet;
  readonly #mode: PenMode;
  readonly #hands = new Map<number, Hand>();
  #gesture: Gesture | undefined;

  constructor(sheet: HandsSheet, mode: PenMode) {
    this.#sheet = sheet;
    this.#mode = mode;
  }

  /** What each pointer down on the sheet does now. */
  get roles(): ReadonlyMap<number, Role> {
    return new Map([...this.#hands].map(([id, hand]) => [id, hand.role]));
  }

  /** Whether a pointer is down on the sheet: the hands saw it come down, and not yet lift. */
  knows(pointerId: number): boolean {
    return this.#hands.has(pointerId);
  }

  /** Whether fingers make a gesture now: two wait for their slop, or they scroll. */
  get scrolling(): boolean {
    return this.#gesture !== undefined;
  }

  /** `pointerdown`: whether this pointer may write or erase. */
  down(contact: Contact): boolean {
    // A pointer that comes down again was lost on its way up.
    this.lift(contact.pointerId);
    if (contact.kind === "pen") return this.#pen(contact);
    if (contact.kind === "touch") return this.#touch(contact);
    return this.#add(contact, this.#sheet.writer() === undefined ? "writes" : "idle");
  }

  /** `pointermove`, once for each coalesced event: whether this pointer writes on. */
  move(contact: Contact): boolean {
    const hand = this.#hands.get(contact.pointerId);
    if (hand === undefined) return false;
    if (hand.kind === "touch" && hand.role !== "palm" && isPalm(contact)) {
      // A palm that has grown: what it was doing goes.
      if (this.#sheet.writer() === contact.pointerId) this.#sheet.drop(contact.pointerId);
      if (hand.role === "scrolls") this.#end();
      hand.role = "palm";
      return false;
    }
    hand.x = contact.x;
    hand.y = contact.y;
    hand.travel = Math.max(hand.travel, Math.hypot(contact.x - hand.x0, contact.y - hand.y0));
    // A finger of pen mode that has gone past the slop with no second drags the sheet alone,
    // but not while a sheet of the page is written on: nothing moves under the pen. Another finger
    // that waits then does nothing until it lifts, and takes no drag over from where it came down.
    if (
      hand.role === "waits" &&
      this.#gesture === undefined &&
      hand.travel > SLOP_PX &&
      !this.#mode.writing
    ) {
      for (const other of this.#hands.values()) if (other.role === "waits") other.role = "idle";
      hand.role = "scrolls";
      this.#gesture = {
        fingers: [contact.pointerId],
        from: { x: hand.x0, y: hand.y0 },
        last: undefined,
        across: true,
        down: true,
        span0: 0,
        span: undefined,
        unpaired: undefined,
      };
    }
    if (hand.role === "scrolls") this.#step(contact.pointerId);
    return hand.role === "writes" && this.#sheet.writer() === contact.pointerId;
  }

  /** `pointerup`, `pointercancel` or a lost capture: the pointer has gone, and its gesture too. */
  lift(pointerId: number): void {
    const hand = this.#hands.get(pointerId);
    if (hand === undefined) return;
    if (hand.role === "scrolls") this.#end();
    this.#hands.delete(pointerId);
  }

  /** The sheet has left the page, and no pointer is down on it now. */
  reset(): void {
    this.#hands.clear();
    this.#gesture = undefined;
  }

  #pen(contact: Contact): boolean {
    this.#mode.on = true;
    // A touch writing when a pen comes was a palm, and its stroke goes. A gesture under way ends,
    // and every touch down now does nothing until it lifts.
    const writer = this.#sheet.writer();
    if (writer !== undefined && this.#hands.get(writer)?.kind === "touch") this.#sheet.drop(writer);
    this.#gesture = undefined;
    for (const hand of this.#hands.values()) {
      if (hand.kind === "touch" && hand.role !== "palm") hand.role = "idle";
    }
    return this.#add(contact, this.#sheet.writer() === undefined ? "writes" : "idle");
  }

  #touch(contact: Contact): boolean {
    if (isPalm(contact)) return this.#add(contact, "palm");
    const writer = this.#sheet.writer();
    // While a pen or a mouse writes, or two fingers scroll, a touch does nothing.
    const writing = writer === undefined ? undefined : this.#hands.get(writer);
    if ((writer !== undefined && writing?.kind !== "touch") || this.#gesture !== undefined) {
      return this.#add(contact, "idle");
    }
    if (this.#mode.on) {
      // In pen mode a finger writes nothing: it waits for a second one to scroll with.
      const partner = this.#latest("waits", contact);
      this.#add(contact, partner === undefined ? "waits" : "scrolls");
      if (partner !== undefined) this.#pair(partner, contact.pointerId);
      return false;
    }
    // Without it the first finger writes, and a second soon after makes the two a scroll.
    const first = this.#latest("writes", contact);
    if (first !== undefined && (this.#hands.get(first)?.travel ?? 0) <= SLOP_PX) {
      if (writer === first) this.#sheet.drop(first);
      this.#add(contact, "scrolls");
      this.#pair(first, contact.pointerId);
      return false;
    }
    return this.#add(contact, writer === undefined ? "writes" : "idle");
  }

  #add(contact: Contact, role: Role): boolean {
    this.#hands.set(contact.pointerId, {
      kind: contact.kind,
      role,
      x0: contact.x,
      y0: contact.y,
      t0: contact.time,
      x: contact.x,
      y: contact.y,
      travel: 0,
    });
    return role === "writes";
  }

  /** The touch in `role` that came down last, at most `PAIR_MS` before this one, if any. */
  #latest(role: Role, contact: Contact): number | undefined {
    let found: number | undefined;
    let at = -Infinity;
    for (const [id, hand] of this.#hands) {
      if (hand.kind !== "touch" || hand.role !== role || id === contact.pointerId) continue;
      if (contact.time - hand.t0 > PAIR_MS || hand.t0 < at) continue;
      found = id;
      at = hand.t0;
    }
    return found;
  }

  #pair(first: number, second: number): void {
    const one = this.#hands.get(first);
    const two = this.#hands.get(second);
    if (one === undefined || two === undefined) return;
    one.role = "scrolls";
    two.role = "scrolls";
    this.#gesture = {
      fingers: [first, second],
      from: middleOf(one, two),
      last: undefined,
      across: true,
      down: true,
      span0: spanOf(one, two),
      span: undefined,
      unpaired: undefined,
    };
  }

  /** The gesture ends: its fingers do nothing until they lift. */
  #end(): void {
    const gesture = this.#gesture;
    if (gesture === undefined) return;
    this.#gesture = undefined;
    for (const id of gesture.fingers) {
      const hand = this.#hands.get(id);
      if (hand?.role === "scrolls") hand.role = "idle";
    }
  }

  /**
   * The two fingers' middle has moved, or the one finger: past the slop, the sheet goes with it,
   * along the axes the gesture chose as it passed it.
   */
  #step(pointerId: number): void {
    const gesture = this.#gesture;
    if (gesture === undefined) return;
    const one = this.#hands.get(gesture.fingers[0]);
    const two = gesture.fingers.length === 2 ? this.#hands.get(gesture.fingers[1]) : one;
    if (one === undefined || two === undefined) return;
    // Two fingers are read once both have moved: between their moves the middle stands half a
    // step aside and the span is off, which would scroll a pinch off the point under it.
    if (one !== two && !paired(gesture, pointerId)) return;
    const middle = middleOf(one, two);
    this.#move(gesture, middle);
    if (one !== two) this.#pinch(gesture, spanOf(one, two), middle);
  }

  /** The sheet goes with the fingers' middle, past the slop, along the axes the gesture chose. */
  #move(gesture: Gesture, middle: At): void {
    if (gesture.last === undefined) {
      // A sheet that does not scroll across counts the travel down alone.
      const dx = this.#sheet.across() ? middle.x - gesture.from.x : 0;
      const dy = middle.y - gesture.from.y;
      const gone = Math.hypot(dx, dy);
      if (gone <= SLOP_PX) return;
      gesture.across = Math.abs(dx) * RAIL > Math.abs(dy);
      gesture.down = Math.abs(dy) * RAIL > Math.abs(dx);
      gesture.last = middle;
      // The slop is where the gesture starts: the sheet moves from there, without a jump, by the
      // share of each axis's travel past it, along the axes the gesture goes.
      const past = (d: number) => (d * (gone - SLOP_PX)) / gone;
      this.#sheet.scroll(gesture.across ? past(dx) : 0, gesture.down ? past(dy) : 0, true);
      return;
    }
    const dx = gesture.across ? middle.x - gesture.last.x : 0;
    const dy = gesture.down ? middle.y - gesture.last.y : 0;
    gesture.last = middle;
    if (dx !== 0 || dy !== 0) this.#sheet.scroll(dx, dy, false);
  }

  /**
   * The two fingers' span has changed: past the slop, the zoom goes by its ratio to the last
   * step's, from the slop on, without a jump, about their middle.
   */
  #pinch(gesture: Gesture, span: number, middle: At): void {
    if (gesture.span === undefined) {
      const change = span - gesture.span0;
      if (Math.abs(change) <= SLOP_PX) return;
      gesture.span = gesture.span0 + Math.sign(change) * SLOP_PX;
    }
    if (span > 0 && gesture.span > 0 && span !== gesture.span) {
      this.#sheet.zoom(span / gesture.span, middle.x, middle.y);
    }
    gesture.span = span;
  }
}

/**
 * Whether two fingers are read at this finger's move — their middle and their span: once both have
 * moved, or this one twice while the other stood still.
 */
function paired(gesture: Gesture, pointerId: number): boolean {
  if (gesture.unpaired === undefined) {
    gesture.unpaired = pointerId;
    return false;
  }
  if (gesture.unpaired !== pointerId) gesture.unpaired = undefined;
  return true;
}

/** The span between two fingers on the screen. */
function spanOf(one: Hand, two: Hand): number {
  return Math.hypot(one.x - two.x, one.y - two.y);
}

/** The middle of two fingers on the screen. */
function middleOf(one: Hand, two: Hand): At {
  return { x: (one.x + two.x) / 2, y: (one.y + two.y) / 2 };
}

/** Whether a touch is too big for a finger: a palm, or the side of a hand. */
function isPalm(contact: Contact): boolean {
  return contact.width > PALM_PX || contact.height > PALM_PX;
}
