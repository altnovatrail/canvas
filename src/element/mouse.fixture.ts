// The page's mouse for the element's tests in Chromium, WebKit and Firefox, with nothing of the
// element's probe: the trial consumer, which goes through the package's entry points alone, takes
// it from here, and the tests that read the probe take it through pointer.fixture.ts. Like the tests, the build
// leaves this module out (tsconfig.build.json), and the package never has it.

import { userEvent } from "vitest/browser";

/**
 * The mouse moved to the window's bottom right corner, where no element of a test stands: Vitest
 * keeps the page's pointer from test to test and from file to file, and an element laid out under
 * a pointer left over a bar's button would show that button's tooltip (R84).
 */
export async function rest(): Promise<void> {
  const corner = document.createElement("div");
  corner.style.cssText = "position: fixed; right: 0; bottom: 0; width: 4px; height: 4px;";
  document.body.append(corner);
  try {
    await userEvent.hover(corner);
  } finally {
    corner.remove();
  }
}
