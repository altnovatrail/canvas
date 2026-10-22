// The tests, in two projects (R12 in docs/decisions.md). The DOM-free part and the scripts run in
// Node; the element runs in Chromium — Chrome Headless Shell from the toolchain stage of
// .devcontainer/Dockerfile, through Playwright (R13). Each project names its own files: the spec
// submodule beside them has tests of its own, which are not canvas's.
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node",
          include: ["src/core/**/*.test.ts", "scripts/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "browser",
          include: ["src/element/**/*.test.ts"],
          browser: {
            enabled: true,
            provider: playwright(),
            // Headless whatever CI says: there is no display in the container or on the runner.
            // CI still keeps test.only out of CI, as Vitest's allowOnly does by default.
            headless: true,
            // Twice: at the density of a plain screen, and at the double density of most laptops
            // and tablets, which the canvas's buffer follows (R18). The second browser has that
            // density from the start: one that the DevTools protocol sets in the middle of a test
            // tells the test's frame nothing, no media query's change.
            instances: [
              { browser: "chromium" },
              {
                browser: "chromium",
                name: "chromium 2x",
                provider: playwright({ contextOptions: { deviceScaleFactor: 2 } }),
              },
            ],
          },
        },
      },
    ],
  },
});
