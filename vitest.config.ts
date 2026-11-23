// The tests, in three projects. The DOM-free part, the sample file of src/eval/, the
// scripts, the probe of a page opened from a file and the drivers of the emulators run
// in Node: the probe's test drives Chrome Headless Shell itself, by file:// addresses, which a
// browser project never opens. The element runs in the three engines CI checks — Chrome Headless
// Shell, WebKit and Firefox from the toolchain stage of .devcontainer/Dockerfile, through
// Playwright — and once more with forced colours, a mode of the browser's context
// that only its own file runs in, in Chromium and Firefox: WebKit has none to emulate. Each
// instance's name ends in its engine, which ci-test and ci-engines pick the runs by: Vitest's v8
// coverage works in Chromium alone, so WebKit and Firefox run apart, without it. Each project
// names its own files: the spec submodule beside them has tests of its own, which are not canvas's.
import { playwright } from "@vitest/browser-playwright";
import { defaultExclude, defineConfig } from "vitest/config";

const FORCED_COLOURS = "src/element/forced-colors.test.ts";

export default defineConfig({
  test: {
    // The coverage of the tests, which ci-test asks for by --coverage and .github's TypeScript
    // wrapper sends to Codecov: one lcov report of all three projects, coverage/lcov.info,
    // as the wrapper takes it. V8 counts it, in Node and in Chromium alike. What it covers is
    // the code of src/: the package's, every module of it, those no test loads too, at zero, and
    // the sample file of src/eval/, which is no part of the package. The scripts check the package
    // after the tests, and the demo page is tried by hand. WebKit and Firefox run without coverage,
    // in a run of their own.
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["**/*.test.ts", "**/*.fixture.ts", "**/*.check.ts"],
      reporter: ["lcovonly", "text-summary"],
    },
    projects: [
      {
        test: {
          name: "node",
          include: [
            "src/core/**/*.test.ts",
            "src/eval/**/*.test.ts",
            "scripts/**/*.test.ts",
            "probe/**/*.test.ts",
            "emulators/**/*.test.ts",
            "page/**/*.test.ts",
          ],
          environment: "node",
        },
      },
      {
        test: {
          name: "browser",
          include: ["src/element/**/*.test.ts"],
          exclude: [...defaultExclude, FORCED_COLOURS],
          browser: {
            enabled: true,
            provider: playwright(),
            // Headless whatever CI says: there is no display in the container or on the runner.
            // CI still keeps test.only out of CI, as Vitest's allowOnly does by default.
            headless: true,
            // Twice: at the density of a plain screen, and at the double density of most laptops
            // and tablets, which the canvas's buffer follows. The second browser has that
            // density from the start: one that the DevTools protocol sets in the middle of a test
            // tells the test's frame nothing, no media query's change. WebKit and Firefox run at
            // the plain density: the buffer's rule is the engine's own arithmetic, which Chromium's
            // two runs check.
            instances: [
              { browser: "chromium", name: "browser chromium" },
              {
                browser: "chromium",
                name: "browser 2x chromium",
                provider: playwright({ contextOptions: { deviceScaleFactor: 2 } }),
              },
              { browser: "webkit", name: "browser webkit" },
              { browser: "firefox", name: "browser firefox" },
            ],
          },
        },
      },
      {
        test: {
          name: "forced colors",
          include: [FORCED_COLOURS],
          browser: {
            enabled: true,
            // The mode from the start, as the density above: the page is in it before any test.
            provider: playwright({ contextOptions: { forcedColors: "active" } }),
            headless: true,
            instances: [
              { browser: "chromium", name: "forced colors chromium" },
              { browser: "firefox", name: "forced colors firefox" },
            ],
          },
        },
      },
    ],
  },
});
