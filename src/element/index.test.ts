import { afterEach, expect, test, vi } from "vitest";
import { NovatrailCanvas, TAG } from "./index.js";

const made: HTMLElement[] = [];
afterEach(() => {
  for (const element of made.splice(0)) element.remove();
});

test("importing the entry point registers <novatrail-canvas> with an open shadow root", () => {
  expect(customElements.get(TAG)).toBe(NovatrailCanvas);
  const element = document.createElement("novatrail-canvas");
  expect(element).toBeInstanceOf(NovatrailCanvas);
  expect(element.shadowRoot?.mode).toBe("open");
});

test("a second copy of the entry point leaves the first registration, throws nothing and says so", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  // A query makes the bundler load the module again, as a second copy of the package would be.
  const secondCopy = "./index.ts?second-copy";
  const second: { NovatrailCanvas: unknown } = await import(/* @vite-ignore */ secondCopy);
  expect(second.NovatrailCanvas).not.toBe(NovatrailCanvas);
  expect(customElements.get(TAG)).toBe(NovatrailCanvas);
  expect(warn).toHaveBeenCalledOnce();
  warn.mockRestore();
});

test("an element moved into another document is styled there, and again back here: its root adopts each document's own sheet, and one without a window leaves it unstyled till it comes back", () => {
  const frame = document.createElement("iframe");
  document.body.append(frame);
  made.push(frame);
  const other = frame.contentDocument;
  // The frame's window, with the constructors of its own realm.
  const otherWindow = frame.contentWindow as typeof window | null;
  if (other === null || otherWindow === null) throw new Error("the frame has no document");
  const element = document.createElement("novatrail-canvas");
  document.body.append(element);
  made.push(element);
  const [here] = element.shadowRoot?.adoptedStyleSheets ?? [];
  expect(getComputedStyle(element).display).toBe("flex");
  other.body.append(element);
  const [there] = element.shadowRoot?.adoptedStyleSheets ?? [];
  expect(there).toBeInstanceOf(otherWindow.CSSStyleSheet);
  expect(otherWindow.getComputedStyle(element).display).toBe("flex");
  document.body.append(element);
  expect(element.shadowRoot?.adoptedStyleSheets).toHaveLength(1);
  expect(element.shadowRoot?.adoptedStyleSheets[0]).toBe(here);
  expect(getComputedStyle(element).display).toBe("flex");
  // Every element of a document adopts the one sheet.
  const second = document.createElement("novatrail-canvas");
  expect(second.shadowRoot?.adoptedStyleSheets[0]).toBe(here);
  // A document without a window can make no sheet: the element has none there, and here again
  // the sheet of this document.
  document.implementation.createHTMLDocument().body.append(element);
  expect(element.shadowRoot?.adoptedStyleSheets).toHaveLength(0);
  document.body.append(element);
  expect(element.shadowRoot?.adoptedStyleSheets[0]).toBe(here);
  expect(getComputedStyle(element).display).toBe("flex");
});
