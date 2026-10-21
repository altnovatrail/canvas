import { expect, test, vi } from "vitest";
import { NovatrailCanvas, TAG } from "./index.js";

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
