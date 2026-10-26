import { describe, expect, test } from "vitest";
import { type Contact, Hands, PAIR_MS, PALM_PX, PenMode, type Role, SLOP_PX } from "./hands.js";

const PEN = 1;
const MOUSE = 2;
const A = 11;
const B = 12;
const C = 13;

/** A pointer's contact: a fingertip 20 px wide unless given a size. */
function contact(
  pointerId: number,
  kind: string,
  time: number,
  { x = 100 * pointerId, y = 100, size = 20 } = {},
): Contact {
  return { pointerId, kind, x, y, width: size, height: size, time };
}

const kindOf = (pointerId: number) =>
  pointerId === PEN ? "pen" : pointerId === MOUSE ? "mouse" : "touch";

/**
 * A sheet as the hands see it, as the element drives them: a pointer the hands let write begins a
 * stroke, which lands when it lifts, and what they drop goes. It keeps what was dropped and how
 * the fingers scrolled.
 */
class Bench {
  writing: number | undefined;
  readonly dropped: number[] = [];
  readonly steps: { readonly dy: number; readonly fresh: boolean }[] = [];
  readonly hands: Hands;
  readonly mode: PenMode;

  constructor(mode = new PenMode()) {
    this.mode = mode;
    this.hands = new Hands(
      {
        writer: () => this.writing,
        drop: (pointerId) => {
          // Only the pointer writing, and only a touch, ever loses its stroke.
          if (pointerId !== this.writing || kindOf(pointerId) !== "touch") {
            throw new Error(`pointer ${pointerId} dropped while ${this.writing} writes`);
          }
          this.dropped.push(pointerId);
          this.writing = undefined;
        },
        scroll: (dy, fresh) => this.steps.push({ dy, fresh }),
      },
      mode,
    );
  }

  down(pointerId: number, time: number, at: { y?: number; size?: number } = {}): boolean {
    const writes = this.hands.down(contact(pointerId, kindOf(pointerId), time, at));
    if (writes) this.writing = pointerId;
    return writes;
  }

  move(pointerId: number, time: number, at: { y?: number; size?: number } = {}): boolean {
    return this.hands.move(contact(pointerId, kindOf(pointerId), time, at));
  }

  up(pointerId: number): void {
    this.hands.lift(pointerId);
    if (this.writing === pointerId) this.writing = undefined;
  }

  role(pointerId: number): Role | undefined {
    return this.hands.roles.get(pointerId);
  }

  get scrolled(): number {
    return this.steps.reduce((sum, step) => sum + step.dy, 0);
  }
}

describe("who writes", () => {
  test("a mouse writes when nothing does, in pen mode too, and another pointer of its kind then does not", () => {
    const bench = new Bench();
    bench.mode.on = true;
    expect(bench.down(MOUSE, 0)).toBe(true);
    expect(bench.move(MOUSE, 10, { y: 120 })).toBe(true);
    expect(bench.down(3, 20)).toBe(false);
    expect(bench.role(3)).toBe("idle");
    // A pointer of no type is a mouse.
    bench.up(MOUSE);
    expect(bench.hands.down({ ...contact(4, "", 30) })).toBe(true);
  });

  test("a pen's touch puts the page in pen mode, with any button, even when it writes nothing", () => {
    const bench = new Bench();
    expect(bench.down(MOUSE, 0)).toBe(true);
    expect(bench.down(PEN, 10)).toBe(false);
    expect(bench.mode.on).toBe(true);
    expect(bench.role(PEN)).toBe("idle");
    bench.up(MOUSE);
    bench.up(PEN);
    expect(bench.down(PEN, 20)).toBe(true);
  });

  test("without pen mode a finger writes, and in pen mode it waits, writing nothing", () => {
    const bench = new Bench();
    expect(bench.down(A, 0)).toBe(true);
    expect(bench.move(A, 10, { y: 140 })).toBe(true);
    bench.up(A);
    bench.mode.on = true;
    expect(bench.down(A, 20)).toBe(false);
    expect(bench.role(A)).toBe("waits");
    expect(bench.move(A, 30, { y: 140 })).toBe(false);
    // Asked for the finger again, the next finger writes.
    bench.mode.on = false;
    expect(bench.down(B, 40)).toBe(true);
  });

  test("a palm writes nothing, and a finger that grows into one loses its stroke, whatever it moves next", () => {
    const bench = new Bench();
    expect(bench.down(A, 0, { size: PALM_PX + 1 })).toBe(false);
    expect(bench.role(A)).toBe("palm");
    expect(bench.move(A, 10, { size: 20 })).toBe(false);
    // A contact of the threshold itself is a finger.
    expect(bench.down(B, 20, { size: PALM_PX })).toBe(true);
    expect(bench.move(B, 30, { y: 130, size: PALM_PX + 30 })).toBe(false);
    expect(bench.dropped).toEqual([B]);
    expect(bench.role(B)).toBe("palm");
    expect(bench.move(B, 40, { y: 140, size: 20 })).toBe(false);
    // A palm is no finger of a pair.
    expect(bench.down(C, 50)).toBe(true);
  });

  test("a pen takes a finger's stroke away, ends a gesture, and leaves every touch down idle until it lifts", () => {
    const bench = new Bench();
    expect(bench.down(A, 0)).toBe(true);
    expect(bench.down(PEN, 10)).toBe(true);
    expect(bench.dropped).toEqual([A]);
    expect(bench.writing).toBe(PEN);
    expect(bench.role(A)).toBe("idle");
    expect(bench.move(A, 20, { y: 150 })).toBe(false);
    // A touch that comes while the pen writes, and stays after it lifts, does nothing.
    expect(bench.down(B, 30)).toBe(false);
    bench.up(PEN);
    expect(bench.role(B)).toBe("idle");
    expect(bench.down(C, 40)).toBe(false);
    expect(bench.role(C)).toBe("waits");

    // Two fingers scrolling in pen mode stop at a pen.
    const other = new Bench();
    other.mode.on = true;
    other.down(A, 0);
    other.down(B, 50);
    expect(other.role(A)).toBe("scrolls");
    expect(other.down(PEN, 60)).toBe(true);
    expect([other.role(A), other.role(B)]).toEqual(["idle", "idle"]);
    other.move(A, 70, { y: 200 });
    other.move(B, 70, { y: 200 });
    expect(other.steps).toEqual([]);
  });
});

describe("two fingers", () => {
  test(`a second finger within ${PAIR_MS} ms, before the first has gone ${SLOP_PX} px, takes the first's stroke away, and the two scroll`, () => {
    const bench = new Bench();
    expect(bench.down(A, 0)).toBe(true);
    expect(bench.move(A, 50, { y: 100 + SLOP_PX })).toBe(true);
    expect(bench.down(B, PAIR_MS)).toBe(false);
    expect(bench.dropped).toEqual([A]);
    expect([bench.role(A), bench.role(B)]).toEqual(["scrolls", "scrolls"]);
    expect(bench.move(A, 160, { y: 200 })).toBe(false);
  });

  test(`a second finger after ${PAIR_MS} ms, or after the first has gone past ${SLOP_PX} px, does nothing, and the stroke goes on`, () => {
    const late = new Bench();
    late.down(A, 0);
    expect(late.down(B, PAIR_MS + 1)).toBe(false);
    expect(late.role(B)).toBe("idle");
    expect(late.move(A, 200, { y: 150 })).toBe(true);
    expect(late.dropped).toEqual([]);

    const far = new Bench();
    far.down(A, 0);
    far.move(A, 20, { y: 100 + SLOP_PX + 1 });
    far.move(A, 30, { y: 100 });
    expect(far.down(B, 40)).toBe(false);
    expect(far.writing).toBe(A);
  });

  test(`in pen mode two fingers that come down within ${PAIR_MS} ms of each other scroll, and two further apart do not`, () => {
    const bench = new Bench();
    bench.mode.on = true;
    bench.down(A, 0);
    expect(bench.down(B, PAIR_MS + 50)).toBe(false);
    // A thumb that holds the tablet waits on: the two later fingers pair.
    expect([bench.role(A), bench.role(B)]).toEqual(["waits", "waits"]);
    bench.down(C, PAIR_MS + 100);
    expect([bench.role(A), bench.role(B), bench.role(C)]).toEqual(["waits", "scrolls", "scrolls"]);
  });

  test("a third finger does nothing, and when one of the two lifts the other does nothing until it lifts", () => {
    const bench = new Bench();
    bench.mode.on = true;
    bench.down(A, 0);
    bench.down(B, 10);
    expect(bench.down(C, 20)).toBe(false);
    expect(bench.role(C)).toBe("idle");
    bench.up(A);
    expect(bench.role(B)).toBe("idle");
    // Nor does a new finger pair with it.
    bench.down(A, 30);
    expect([bench.role(A), bench.role(B)]).toEqual(["waits", "idle"]);
  });

  test(`two fingers scroll by their middle's travel past the first ${SLOP_PX} px, without a jump, either way`, () => {
    const bench = new Bench();
    bench.mode.on = true;
    bench.down(A, 0);
    bench.down(B, 10);
    // The middle at 105: within the slop.
    bench.move(A, 20, { y: 110 });
    expect(bench.steps).toEqual([]);
    // At 110, 2 past it, and from there on in step with the fingers.
    bench.move(B, 20, { y: 110 });
    expect(bench.steps).toEqual([{ dy: 2, fresh: true }]);
    bench.move(A, 30, { y: 120 });
    bench.move(B, 30, { y: 123 });
    expect(bench.steps.slice(1)).toEqual([
      { dy: 5, fresh: false },
      { dy: 6.5, fresh: false },
    ]);
    expect(bench.scrolled).toBe((120 + 123) / 2 - 100 - SLOP_PX);
    // A move that leaves the middle where it was is no step.
    bench.move(A, 40, { y: 120 });
    expect(bench.steps).toHaveLength(3);

    const up = new Bench();
    up.mode.on = true;
    up.down(A, 0);
    up.down(B, 10);
    // The middle goes to 80 and then to 60: 32 up past the slop.
    up.move(A, 20, { y: 60 });
    up.move(B, 20, { y: 60 });
    expect(up.steps).toEqual([
      { dy: -20 + SLOP_PX, fresh: true },
      { dy: -20, fresh: false },
    ]);
  });

  test("a palm in the pair ends the gesture, and so do a lift, a cancel and a reset", () => {
    const bench = new Bench();
    bench.mode.on = true;
    bench.down(A, 0);
    bench.down(B, 10);
    bench.move(A, 20, { size: PALM_PX + 1 });
    expect([bench.role(A), bench.role(B)]).toEqual(["palm", "idle"]);

    const reset = new Bench();
    reset.down(A, 0);
    reset.down(B, 10);
    reset.hands.reset();
    expect(reset.hands.roles.size).toBe(0);
    expect(reset.hands.knows(A)).toBe(false);
    // A new pair after the reset scrolls from where it came down.
    reset.writing = undefined;
    reset.mode.on = true;
    reset.down(A, 20);
    reset.down(B, 30);
    reset.move(A, 40, { y: 120 });
    reset.move(B, 40, { y: 120 });
    expect(reset.scrolled).toBe(20 - SLOP_PX);
  });

  test("two sheets share one pen mode, and a pointer that comes down again under its ID starts afresh", () => {
    const mode = new PenMode();
    const one = new Bench(mode);
    const two = new Bench(mode);
    const heard: boolean[] = [];
    const unwatch = mode.watch(() => heard.push(mode.on));
    one.down(PEN, 0);
    expect(two.down(A, 10)).toBe(false);
    mode.on = true;
    mode.on = false;
    unwatch();
    mode.on = true;
    expect(heard).toEqual([true, false]);
    // The lost pointer is forgotten with its gesture.
    two.down(B, 20);
    expect(two.role(A)).toBe("scrolls");
    two.down(A, 30);
    expect([two.role(A), two.role(B)]).toEqual(["waits", "idle"]);
  });

  test("pen mode knows whether any sheet of the page is written on, and tells its watchers once none is", () => {
    const mode = new PenMode();
    const heard: boolean[] = [];
    mode.watch(() => heard.push(mode.on));
    let one = false;
    let two = false;
    const unenlist = mode.enlist(() => one);
    mode.enlist(() => two);
    expect(mode.writing).toBe(false);
    one = true;
    expect(mode.writing).toBe(true);
    mode.on = true;
    // A stroke ends on one sheet while another goes on: nothing to tell yet.
    two = true;
    one = false;
    mode.settle();
    expect(heard).toEqual([true]);
    two = false;
    mode.settle();
    expect(heard).toEqual([true, true]);
    // A sheet that left the page is not asked.
    one = true;
    unenlist();
    expect(mode.writing).toBe(false);
  });

  test("the hands tell whether two fingers make a gesture, from their pairing to the lift of one", () => {
    const bench = new Bench();
    bench.down(A, 0);
    expect(bench.hands.scrolling).toBe(false);
    bench.down(B, 50);
    expect(bench.hands.scrolling).toBe(true);
    bench.move(A, 60, { y: 140 });
    bench.move(B, 60, { y: 140 });
    expect(bench.hands.scrolling).toBe(true);
    bench.up(A);
    expect(bench.hands.scrolling).toBe(false);
  });
});

test("every sequence of five touches, pens, mice and switches keeps the rules of the hands", () => {
  const steps = [
    ["pen down", PEN],
    ["pen up", PEN],
    ["mouse down", MOUSE],
    ["mouse up", MOUSE],
    ["A down", A],
    ["A on", A],
    ["A palm", A],
    ["A up", A],
    ["B down", B],
    ["B on", B],
    ["C down", C],
    ["finger", 0],
  ] as const;
  const length = 5;
  // The rules a sequence broke, by the sequence: a check for each, without an expect for each.
  const broken: string[] = [];
  for (let sequence = 0; sequence < steps.length ** length && broken.length < 10; sequence++) {
    const bench = new Bench();
    const y = new Map<number, number>();
    // The pointers that went idle or palm: so they stay until they lift.
    const spent = new Set<number>();
    const done: string[] = [];
    const breaks = (rule: string) => broken.push(`${done.join(", ")}: ${rule}`);
    let code = sequence;
    for (let i = 0; i < length; i++) {
      const [step, pointerId] = steps[code % steps.length] ?? steps[0];
      code = Math.floor(code / steps.length);
      done.push(step);
      // 60 ms apart: the window of a pair holds the step after and the one after that.
      const time = 60 * i;
      const penMode = bench.mode.on;
      const writing = bench.writing;
      const scrolled = bench.steps.length;
      if (step === "finger") {
        bench.mode.on = false;
      } else if (step.endsWith("down")) {
        y.set(pointerId, 100);
        spent.delete(pointerId);
        const writes = bench.down(pointerId, time);
        const touch = kindOf(pointerId) === "touch";
        if (
          writes &&
          writing !== undefined &&
          !(pointerId === PEN && kindOf(writing) === "touch")
        ) {
          breaks("it writes where another pointer writes");
        }
        if (writes && touch && penMode) breaks("a finger writes in pen mode");
        if (pointerId === PEN && !bench.mode.on) breaks("a pen leaves no pen mode");
      } else if (step.endsWith("up")) {
        bench.up(pointerId);
        y.delete(pointerId);
        spent.delete(pointerId);
      } else if (bench.hands.knows(pointerId)) {
        const at = (y.get(pointerId) ?? 100) + 6;
        y.set(pointerId, at);
        const before = bench.hands.roles.get(pointerId);
        const size = step === "A palm" ? PALM_PX + 1 : 20;
        const writes = bench.move(pointerId, time, { y: at, size });
        if (writes && before !== "writes") breaks("a pointer that was not writing writes");
        if (writes && spent.has(pointerId)) breaks("an idle pointer or a palm writes");
      }
      const roles = bench.hands.roles;
      let scrolling = 0;
      for (const [id, role] of roles) {
        if (spent.has(id) && role !== "idle" && role !== "palm") {
          breaks("an idle pointer or a palm took a role before it lifted");
        }
        if (role === "idle" || role === "palm") spent.add(id);
        if (role === "scrolls") scrolling++;
        // After a pen came down, no touch down does anything.
        if (step === "pen down" && kindOf(id) === "touch" && role !== "idle" && role !== "palm") {
          breaks("a touch goes on after a pen came down");
        }
      }
      if (scrolling !== 0 && scrolling !== 2) breaks("a gesture of other than two fingers");
      if (bench.steps.length > scrolled && (scrolling !== 2 || bench.writing === PEN)) {
        breaks("the sheet scrolls without a gesture, or while a pen writes");
      }
      if (bench.mode.on && bench.writing !== undefined && kindOf(bench.writing) === "touch") {
        breaks("a finger writes in pen mode");
      }
    }
  }
  // All 248,832 sequences take a quarter of a second here: a check for each rule, and one expect.
  expect(broken).toEqual([]);
});
