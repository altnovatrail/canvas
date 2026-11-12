import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { line } from "../core/pages.fixture.js";
import { sheetTask, workbookTask, workedExample } from "../core/tasks.fixture.js";
import { arrive, file, level, placed, settle, sheetWork } from "./pointer.fixture.js";

// The element under app's content security policy, in Chromium (R51; the second amendment of
// 2026-11-02 to R36 spec): no inline style, and images only from blob: addresses. The policy goes
// into this frame's head once the file's modules have loaded, so that from then on the frame loads
// nothing else but the runner's scripts, as app's page; the runner keeps working. Each test file has a
// frame of its own, so no other file runs under it. Whatever the policy blocks, the page hears of
// by a securitypolicyviolation event, and the tests ask that there be none: the row, the
// statement and its pictures, the grid, the ink, the marks, the workbook's print and a worked
// example's pictures beside the sheet and on it all come under it, styled by the adopted sheet.

/**
 * app's policy (R09 app), as the amendment to R36 spec names it, with the runner's scripts from
 * this origin: after the tests the runner imports the module that takes the file's coverage again,
 * and Chrome Headless Shell 158 holds that import to the policy, where 156 did not. Sources with a
 * path, the runner's own, do not admit it; the origin does. The element imports no script once
 * loaded, so it is the styles and images that the tests hold to the policy.
 */
const POLICY = "default-src 'none'; style-src 'self'; img-src blob:; script-src 'self'";

/** What the policy blocked, as its events tell it: the directive and the address. */
const blocked: string[] = [];
document.addEventListener("securitypolicyviolation", (event) => {
  blocked.push(`${event.effectiveDirective} ${event.blockedURI}`);
});
const policy = document.createElement("meta");
policy.httpEquiv = "Content-Security-Policy";
policy.content = POLICY;
document.head.append(policy);

const made: HTMLElement[] = [];
beforeEach(() => {
  vi.spyOn(HTMLImageElement.prototype, "decode");
});
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
  vi.restoreAllMocks();
  blocked.length = 0;
});

/**
 * What the policy blocked by now: the frames after the last change come, and then the task the
 * events of a load come in.
 */
async function heard(): Promise<string[]> {
  await settle();
  await new Promise((resolve) => setTimeout(resolve));
  return [...blocked];
}

/** A picture of 40 × 20 CSS pixels in a statement. */
const PICTURE = { picture: "pictures/lamp.png", alt: "A lamp.", width: 40, height: 20 };

test("the policy holds in this frame: a <style> in a shadow root is blocked, and the page hears of it", async () => {
  const host = document.createElement("div");
  const style = document.createElement("style");
  style.textContent = ":host { display: flex; }";
  host.attachShadow({ mode: "open" }).append(style);
  document.body.append(host);
  made.push(host);
  expect(getComputedStyle(host).display).toBe("block");
  expect(await heard()).toEqual(["style-src-elem inline"]);
});

test("a sheet shows its row, its statement with a picture, its grid, the ink and a mark under the policy, styled, with nothing blocked", async () => {
  const task = sheetTask({ statement: [{ text: "How many?" }, PICTURE], grid: "squares" });
  const { element, root, canvas, row, view } = await placed(made, 400, undefined, { task });
  element.media = async () => file();
  await arrive();
  // The adopted sheet styles the host, the row, its buttons and the grid.
  expect(getComputedStyle(element).display).toBe("flex");
  expect(getComputedStyle(row).display).toBe("flex");
  for (const button of row.querySelectorAll("button:not([hidden])")) {
    expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  }
  const grid = root.querySelector(".grid");
  if (grid === null) throw new Error("the sheet has no grid");
  expect(getComputedStyle(grid).stroke).toBe("rgb(211, 219, 229)");
  // The statement's picture comes by its blob: address, decoded.
  const image = root.querySelector<HTMLImageElement>(".statement img");
  expect(image?.src.startsWith("blob:")).toBe(true);
  expect(image?.naturalWidth).toBe(40);
  // What the element sets through the CSSOM, as its picture's frame's width, holds too.
  expect(root.querySelector(".statement .picture")?.getBoundingClientRect().width).toBe(40);
  // Strokes, and the tutor's frame round the first group's, in the mark's colour.
  level(canvas, view(), 300, 100, 300);
  level(canvas, view(), 340, 100, 300);
  const { submission } = await sheetWork(element);
  element.marks = { submission, marks: [{ kind: "frame", at: { group: "A" }, name: "This" }] };
  const frame = root.querySelector(".marks rect");
  if (frame === null) throw new Error("the mark has no frame");
  expect(getComputedStyle(frame).stroke).toBe("rgb(37, 99, 235)");
  expect(await heard()).toEqual([]);
});

test("a workbook prints its lines and boxes under the policy, in the ink's colour, with nothing blocked", async () => {
  const task = workbookTask([line("3 + 4 = []")]);
  const { root } = await placed(made, 400, undefined, { task });
  const text = root.querySelector(".print text");
  const box = root.querySelector(".print rect");
  if (text === null || box === null) throw new Error("the workbook has no print");
  expect(getComputedStyle(text).fill).toBe("rgb(17, 17, 17)");
  expect(getComputedStyle(box).stroke).toBe("rgb(17, 17, 17)");
  expect(await heard()).toEqual([]);
});

test("a worked example shows its pictures beside the sheet and on it under the policy, by blob: addresses, with nothing blocked", async () => {
  const { element, root } = await placed(made, 400);
  element.workedExample = workedExample();
  element.media = async () => file();
  element.demoState = { opened: 4, hidden: false };
  await new Promise((resolve) => setTimeout(resolve));
  await arrive();
  const beside = root.querySelector<HTMLImageElement>(".parts img");
  expect(beside?.src.startsWith("blob:")).toBe(true);
  expect(beside?.naturalWidth).toBe(40);
  // The picture on the sheet takes the address only once an image has decoded it (T61).
  const onTheSheet = root.querySelector(".show image");
  expect(onTheSheet?.getAttribute("href")?.startsWith("blob:")).toBe(true);
  expect(await heard()).toEqual([]);
});
