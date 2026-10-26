/**
 * A pointer as the hands on the sheet see it (R29): where it is on the screen, how big its contact
 * is, and when. The DOM-free part sees no DOM (R12), so the element hands it this much of each
 * pointer event. The contact's size decides only what the pointer may do: it goes into no stroke,
 * no history and no sample (R09).
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
 * A touch wider or taller than this, in CSS pixels, is a palm (R29). WebKit on iPadOS gives a touch
 * twice its contact's radius, a fingertip's 40–60 px by one report, so canvas-api's 30 px would
 * take most fingers there for palms. T22 measures it on the devices.
 */
export const PALM_PX = 100;

/**
 * Two touches that come down at most this many milliseconds apart are two fingers of one gesture
 * (R29): Android's tap timeout, 100 ms, with a margin for children's fingers.
 */
export const PAIR_MS = 150;

/**
 * How far a touch may wander, in CSS pixels, before it is going somewhere (R29): Android's touch
 * slop, 8 dp. A finger that has gone further is writing, and two fingers scroll once their middle
 * has gone further.
 */
export const SLOP_PX = 8;

/**
 * The pen mode (R29): on from a pen's touch on a sheet, off when the learner asks for the finger.
 * While it is on, a finger neither writes nor erases. One is shared by every sheet of a page, and
 * it lives in memory alone: nothing is stored or sent, and a new page starts without it.
 *
 * It knows, too, whether any sheet of the page is written on: a row of buttons changes between the
 * strokes of the whole page alone, for a row that wraps moves the sheets below it as well.
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
   * Two fingers moved down the screen by `dy` CSS pixels, or up for a negative one: the sheet goes
   * with them. `fresh` marks a gesture's first step.
   */
  scroll(dy: number, fresh: boolean): void;
}

/**
 * What a pointer down on the sheet does:
 * - "writes": it may write or erase, and does while the sheet says it is the writer;
 * - "waits": a finger in pen mode, waiting for a second to scroll with;
 * - "scrolls": one of the two fingers of a gesture;
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
  /** Where it is now, down the screen. */
  y: number;
  /** How far it has been from where it came down, at most. */
  travel: number;
}

/** Two fingers scrolling. */
interface Gesture {
  readonly fingers: readonly [number, number];
  /** Their middle, down the screen, when the gesture began. */
  readonly from: number;
  /** Their middle at the last step, once it has gone past the slop. */
  last: number | undefined;
}

/**
 * The hands on a sheet (R29): which pointer may write, which is a palm, and which two fingers
 * scroll, for a pen, fingers and a mouse on one screen.
 * - One pointer writes at a time, as before (R18), and the sheet's recorder and eraser say which.
 * - A pen's touch puts the page in pen mode and takes away the stroke of a touch under way: it was
 *   a palm. While a pen or a mouse writes, a touch does nothing until it lifts.
 * - A touch wider or taller than `PALM_PX`, at its `pointerdown` or at any move, is a palm: it does
 *   nothing until it lifts, and what it was writing goes.
 * - Without pen mode the first finger writes. A second that comes down within `PAIR_MS`, before the
 *   first has gone `SLOP_PX`, takes the first one's stroke away, and the two scroll. A second that
 *   comes later does nothing.
 * - In pen mode a finger writes nothing, and two that come down within `PAIR_MS` scroll.
 * - A third finger does nothing. When one of the two lifts, the other does nothing until it lifts.
 * - Two fingers scroll by the travel of their middle down the screen, past the first `SLOP_PX`.
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

  /** Whether two fingers make a gesture now: they wait for their slop, or scroll. */
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
    hand.y = contact.y;
    hand.travel = Math.max(hand.travel, Math.hypot(contact.x - hand.x0, contact.y - hand.y0));
    if (hand.role === "scrolls") this.#step();
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
    this.#gesture = { fingers: [first, second], from: (one.y + two.y) / 2, last: undefined };
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

  /** The two fingers' middle has moved: past the slop, the sheet goes with it. */
  #step(): void {
    const gesture = this.#gesture;
    if (gesture === undefined) return;
    const one = this.#hands.get(gesture.fingers[0]);
    const two = this.#hands.get(gesture.fingers[1]);
    if (one === undefined || two === undefined) return;
    const middle = (one.y + two.y) / 2;
    if (gesture.last === undefined) {
      const gone = middle - gesture.from;
      if (Math.abs(gone) <= SLOP_PX) return;
      // The slop is where the gesture starts: the sheet moves from there, without a jump.
      gesture.last = middle;
      this.#sheet.scroll(gone - Math.sign(gone) * SLOP_PX, true);
      return;
    }
    if (middle === gesture.last) return;
    const dy = middle - gesture.last;
    gesture.last = middle;
    this.#sheet.scroll(dy, false);
  }
}

/** Whether a touch is too big for a finger: a palm, or the side of a hand. */
function isPalm(contact: Contact): boolean {
  return contact.width > PALM_PX || contact.height > PALM_PX;
}
