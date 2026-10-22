import { afterEach, expect, test } from "vitest";
import { SHEET } from "../core/index.js";
import "./index.js";

// The trial consumer (RUN.md, T34; R20): a page that takes the element as tutor's check board
// would take it in place of its own sheet. It writes, undoes, clears, takes the picture of the
// work and goes on to the next task through the element's interface alone — its methods and its
// event, never the probe the other tests read. It writes as a script does: pointer events on the
// canvas in the element's open shadow root, at the points the canvas's rectangle gives.

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/** A sheet as the board would have it: the element at the size the board gives it. */
async function board() {
  const sheet = document.createElement("novatrail-canvas");
  sheet.style.width = "500px";
  sheet.style.height = "300px";
  document.body.append(sheet);
  made.push(sheet);
  await frame();
  await frame();
  return sheet;
}

/**
 * A pointer on a sheet, at points of the sheet: a mouse's unless told otherwise. The sheet is not
 * scrolled, so a unit is the canvas's width over the sheet's in CSS pixels, from its top left.
 */
function pointer(sheet: HTMLElement, init: PointerEventInit = {}) {
  const canvas = sheet.shadowRoot?.querySelector("canvas");
  if (!canvas) throw new Error("the element has no canvas");
  const send = (type: string, x: number, y: number, state: PointerEventInit) => {
    const rect = canvas.getBoundingClientRect();
    const k = rect.width / SHEET.width;
    const at = { clientX: rect.left + x * k, clientY: rect.top + y * k };
    const pointer = { pointerId: 1, pointerType: "mouse", isPrimary: true, bubbles: true };
    canvas.dispatchEvent(new PointerEvent(type, { ...pointer, ...init, ...at, ...state }));
  };
  const pressure = init.pressure ?? 0.5;
  return {
    down: (x: number, y: number) => send("pointerdown", x, y, { button: 0, buttons: 1, pressure }),
    move: (x: number, y: number) => send("pointermove", x, y, { button: -1, buttons: 1, pressure }),
    up: (x: number, y: number) => send("pointerup", x, y, { button: 0, buttons: 0, pressure: 0 }),
    cancel: (x: number, y: number) =>
      send("pointercancel", x, y, { button: 0, buttons: 0, pressure: 0 }),
  };
}

/** A level stroke at `y`, from `from` to `to`. */
function write(sheet: HTMLElement, y: number, from: number, to: number, init?: PointerEventInit) {
  const hand = pointer(sheet, init);
  hand.down(from, y);
  hand.move(to, y);
  hand.up(to, y);
}

/** The PNG signature, the first eight bytes of every PNG file. */
const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

/** A picture of the work, read as its consumer reads it: its bytes, and its pixels decoded. */
async function read(png: Blob | null) {
  if (png === null) throw new Error("the sheet gave no picture");
  const bytes = new Uint8Array(await png.arrayBuffer());
  // IHDR is the first chunk: its width and its height, big-endian, at bytes 16 and 20.
  const header = new DataView(bytes.buffer);
  const bitmap = await createImageBitmap(png);
  const { width, height } = bitmap;
  const context = new OffscreenCanvas(width, height).getContext("2d");
  if (context === null) throw new Error("no context to read the picture with");
  context.drawImage(bitmap, 0, 0);
  const pixels = context.getImageData(0, 0, width, height).data;
  /** The red, green, blue and alpha of the pixel under a point of the sheet: a pixel to a unit. */
  const rgba = (x: number, y: number) => [
    ...pixels.subarray((y * width + x) * 4, (y * width + x) * 4 + 4),
  ];
  return {
    type: png.type,
    signature: [...bytes.subarray(0, 8)],
    size: [header.getUint32(16), header.getUint32(20)],
    decoded: [width, height],
    /** Whether there is ink at a point: darker than halfway from the ink to white. */
    ink: (x: number, y: number) => (rgba(x, y)[0] ?? 255) < 128,
    rgba,
    /** How many pixels of a column, from `top` to `bottom`, have ink: the width of a level line. */
    across: (x: number, top: number, bottom: number) => {
      let count = 0;
      for (let y = top; y <= bottom; y++) if ((rgba(x, y)[0] ?? 255) < 128) count++;
      return count;
    },
  };
}

const WHITE = [255, 255, 255, 255];

test("the board's path: write, undo, clear and check, then a new sheet for the next task", async () => {
  const sheet = await board();
  // The board listens on the page above the sheet: the event bubbles from the element itself.
  const heard: Event[] = [];
  const listen = (event: Event) => heard.push(event);
  document.addEventListener("workchange", listen);
  try {
    // Check on an empty sheet: there is no picture, and the board asks for a solution first.
    expect(await sheet.exportPNG()).toBeNull();

    write(sheet, 100, 100, 300);
    write(sheet, 200, 100, 300);
    expect(heard).toHaveLength(2);
    expect(heard.every((event) => event.target === sheet && event.bubbles)).toBe(true);

    // Check: a PNG of the whole sheet, a pixel to a unit, with ink where the strokes are.
    const both = await read(await sheet.exportPNG());
    expect(both.type).toBe("image/png");
    expect(both.signature).toEqual(SIGNATURE);
    expect(both.size).toEqual([SHEET.width, SHEET.height]);
    expect(both.decoded).toEqual([SHEET.width, SHEET.height]);
    expect([both.ink(200, 100), both.ink(200, 200)]).toEqual([true, true]);
    // White and opaque between the strokes, below them and in every corner.
    for (const [x, y] of [
      [200, 150],
      [500, 1000],
      [0, 0],
      [SHEET.width - 1, 0],
      [0, SHEET.height - 1],
      [SHEET.width - 1, SHEET.height - 1],
    ] as const) {
      expect(both.rgba(x, y)).toEqual(WHITE);
    }

    // Undo stroke.
    expect(sheet.undo()).toBe(true);
    expect(heard).toHaveLength(3);
    const first = await read(await sheet.exportPNG());
    expect([first.ink(200, 100), first.ink(200, 200)]).toEqual([true, false]);

    // Clear: no picture, and a second clearing is nothing to hear of.
    expect(sheet.clear()).toBe(true);
    expect(heard).toHaveLength(4);
    expect(await sheet.exportPNG()).toBeNull();
    expect(sheet.clear()).toBe(false);
    expect(heard).toHaveLength(4);

    // Undo takes the clearing back, with the one stroke it took.
    expect(sheet.undo()).toBe(true);
    expect(heard).toHaveLength(5);
    const back = await read(await sheet.exportPNG());
    expect([back.ink(200, 100), back.ink(200, 200)]).toEqual([true, false]);

    // The next task: a new element in place of the old one, and nothing of the old work on it,
    // not even by undo, which clear() would have let back (R19).
    const next = document.createElement("novatrail-canvas");
    next.style.width = "500px";
    next.style.height = "300px";
    made.push(next);
    sheet.replaceWith(next);
    await frame();
    expect(await next.exportPNG()).toBeNull();
    expect(next.undo()).toBe(false);
    expect(heard).toHaveLength(5);
  } finally {
    document.removeEventListener("workchange", listen);
  }
});

test("the picture is the sheet as it was when asked for: a stroke under way is not in it", async () => {
  const sheet = await board();
  write(sheet, 100, 100, 300);
  const hand = pointer(sheet, { pointerId: 2 });
  hand.down(100, 200);
  hand.move(300, 200);
  const asked = sheet.exportPNG();
  // The stroke lands before the promise settles, and the picture asked for before stays without it.
  hand.up(300, 200);
  const before = await read(await asked);
  const after = await read(await sheet.exportPNG());
  expect([before.ink(200, 100), before.ink(200, 200)]).toEqual([true, false]);
  expect([after.ink(200, 100), after.ink(200, 200)]).toEqual([true, true]);
});

test("the picture is the whole sheet, the part out of sight too", async () => {
  // 500 px wide, the sheet is 0.5 px to a unit, and 300 px show its top 600 units. An event a
  // script makes reaches the canvas wherever its point is: the stroke lies below the visible part,
  // where a pointer the canvas holds would write too.
  const sheet = await board();
  write(sheet, 1200, 100, 300);
  const picture = await read(await sheet.exportPNG());
  expect(picture.ink(200, 1200)).toBe(true);
});

test("a pen's line on the picture is as wide as a mouse's, however hard the pen pressed", async () => {
  const sheet = await board();
  write(sheet, 100, 100, 300, { pointerType: "pen", pressure: 1 });
  write(sheet, 200, 100, 300, { pointerType: "mouse" });
  const picture = await read(await sheet.exportPNG());
  const pen = picture.across(200, 90, 110);
  expect(pen).toBeGreaterThan(0);
  expect(pen).toBe(picture.across(200, 190, 210));
});

test("workchange comes as a stroke lands: not while it is under way, nor for one the device cancels", async () => {
  const sheet = await board();
  let heard = 0;
  sheet.addEventListener("workchange", () => heard++);
  const hand = pointer(sheet);
  hand.down(100, 100);
  hand.move(300, 100);
  expect(heard).toBe(0);
  hand.cancel(300, 100);
  expect(heard).toBe(0);
  expect(await sheet.exportPNG()).toBeNull();

  write(sheet, 100, 100, 300);
  expect(heard).toBe(1);
});

test("workchange goes out of a consumer's own shadow tree too, from the host it is in", async () => {
  // A consumer that is a custom element itself, with the sheet in its own shadow tree.
  const host = document.createElement("div");
  const root = host.attachShadow({ mode: "open" });
  const sheet = document.createElement("novatrail-canvas");
  sheet.style.width = "500px";
  sheet.style.height = "300px";
  root.append(sheet);
  document.body.append(host);
  made.push(host);
  await frame();
  await frame();
  const heard: (EventTarget | null)[] = [];
  const listen = (event: Event) => heard.push(event.target);
  document.addEventListener("workchange", listen);
  try {
    write(sheet, 100, 100, 300);
    expect(heard).toHaveLength(1);
    expect(heard[0]).toBe(host);
  } finally {
    document.removeEventListener("workchange", listen);
  }
});

test("a sheet taken off the page in the middle of a stroke tells its own listeners and no one above", async () => {
  const sheet = await board();
  let own = 0;
  let page = 0;
  const onPage = () => page++;
  sheet.addEventListener("workchange", () => own++);
  document.addEventListener("workchange", onPage);
  try {
    const hand = pointer(sheet);
    hand.down(100, 100);
    hand.move(300, 100);
    sheet.remove();
    expect([own, page]).toEqual([1, 0]);
    // The stroke landed where it was, and a sheet off the page still gives its picture.
    expect((await read(await sheet.exportPNG())).ink(200, 100)).toBe(true);
  } finally {
    document.removeEventListener("workchange", onPage);
  }
});
