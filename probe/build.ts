// The two files of the probe of a page opened from a file (T29 in RUN.md; R52 in
// docs/decisions.md), from one source, probe/page.html with probe/probe.js inline:
//
//   node probe/build.ts <folder>
//
// t29-probe-csp.html carries the policy the samples page's build would carry, in a <meta> element:
// no network, and the page's own style and script by their hashes. t29-probe-open.html carries
// none, so that a request it makes shows whether the network or the policy stopped it. One source
// keeps the two from drifting apart, and the hashes are worked out rather than typed. Nothing of
// the probe is in the package or in a release's paths: a probe goes out as a pre-release of its own
// (T29). Run from the repository's root, as the recipes run their scripts.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { policy, styleOf } from "../scripts/csp.ts";

/** The names of the two files. */
export const CSP = "t29-probe-csp.html";
export const OPEN = "t29-probe-open.html";

/** Where the source is, from the repository's root. */
export const PAGE = "probe/page.html";
export const SCRIPT = "probe/probe.js";
/** What the source holds in place of the policy and of the script. */
const POLICY_HOLE = "<!-- policy -->";
const SCRIPT_HOLE = '<script src="probe.js"></script>';

/** The two pages from the source: the one with the policy, and the one without. */
export function pages(page: string, script: string): { csp: string; open: string } {
  for (const [name, text] of [
    [PAGE, page],
    [SCRIPT, script],
  ] as const) {
    // No carriage return: the parser drops it before the browser hashes an inline element, so
    // a hash of the text with it would never match.
    if (!/^[\t\n -~]*$/.test(text)) throw new Error(`${name} is not ASCII with plain line ends`);
  }
  // Either would end the inline script before its text does, and the hash would cover text the
  // browser never sees.
  if (/<\/script|<!--/i.test(script)) throw new Error(`${SCRIPT} holds </script or <!--`);
  if (!page.includes(POLICY_HOLE) || !page.includes(SCRIPT_HOLE)) {
    throw new Error(`${PAGE} has no place for the policy or for the script`);
  }
  // A function as the replacement: a string one would read $& and $' in the script as patterns.
  const inline = page.replace(SCRIPT_HOLE, () => `<script>${script}</script>`);
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy(styleOf(page), script)}">`;
  return {
    csp: inline.replace(POLICY_HOLE, () => meta),
    open: inline.replace(`${POLICY_HOLE}\n`, ""),
  };
}

/** Write both files into a folder, and give their paths. */
export function build(folder: string): { csp: string; open: string } {
  const built = pages(readFileSync(PAGE, "utf8"), readFileSync(SCRIPT, "utf8"));
  mkdirSync(folder, { recursive: true });
  const paths = { csp: join(folder, CSP), open: join(folder, OPEN) };
  writeFileSync(paths.csp, built.csp);
  writeFileSync(paths.open, built.open);
  return paths;
}

if (import.meta.main) {
  const [folder, ...rest] = process.argv.slice(2);
  if (!folder || rest.length > 0) {
    console.error("usage: node probe/build.ts <folder>");
    process.exit(2);
  }
  const paths = build(folder);
  console.log(`${paths.csp}\n${paths.open}`);
}
