// The entry of the generator's file, synthetic-module_v<X.Y.Z>.mjs (T96 in RUN.md; R68 in
// docs/decisions.md): scripts/generator.ts bundles it, and Node runs it as the main module, so it
// runs the call at once: --module writes a module's synthetic samples, and --digest prints the
// digests of its tasks' open views (scripts/synthetic-module.ts; T97).

import { digestMain, moduleMain, usage } from "./synthetic-module.ts";

const [mode, ...args] = process.argv.slice(2);
if (mode === "--module") {
  process.exitCode = moduleMain(args);
} else if (mode === "--digest") {
  process.exitCode = digestMain(args);
} else {
  console.error(usage());
  process.exitCode = 2;
}
