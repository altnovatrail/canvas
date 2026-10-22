// The server of the page to try the element on by hand, just demo (RUN.md, T34; R20 in
// docs/decisions.md): Vite's dev server, on the loopback of this machine alone. It serves the page,
// the element's sources and the packages they import, and nothing else of the repository: without
// a list of its own Vite serves the whole workspace (R15). It builds nothing.

import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

/** A folder of the repository, by its path from this file's. */
const folder = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  root: folder("."),
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    fs: { strict: true, allow: [folder("."), folder("../src"), folder("../node_modules")] },
  },
});
