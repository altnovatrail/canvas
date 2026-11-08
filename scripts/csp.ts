// The policy of a page opened from a file (R52 and R55 in docs/decisions.md): no network, and the
// page's own style and script by their hashes, in a <meta> element, for a page from a file gets no
// headers. The probe of T29 tried it on every device a volunteer opens the page on (T29, T74, T80),
// and the samples page carries it (T19). A hash covers the text of an inline element as the
// browser reads it, its UTF-8 bytes: a carriage return the parser drops would make it miss.

import { createHash } from "node:crypto";

/** The hash a policy allows an inline element's text by. */
export function hash(text: string): string {
  return `'sha256-${createHash("sha256").update(text, "utf8").digest("base64")}'`;
}

/** The policy of a page with this style and this script: nothing else, and no network. Pictures
 * come from blobs of the page's own, as the element shows a task's media (R23). */
export function policy(style: string, script: string): string {
  return [
    "default-src 'none'",
    `script-src ${hash(script)}`,
    `style-src ${hash(style)}`,
    "img-src blob:",
    "connect-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");
}

/** The text of the one <style> element of a page. */
export function styleOf(page: string): string {
  const match = /<style>([\s\S]*?)<\/style>/.exec(page);
  if (!match || match[1] === undefined) throw new Error("the page has no <style> element");
  return match[1];
}
