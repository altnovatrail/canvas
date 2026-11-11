// The tags of axe-core's rules the tests hold the element and the samples page to (T90 in RUN.md;
// R70 in docs/decisions.md): WCAG 2.2 level AA, with what 2.0 and 2.1 give — axe tags only what is
// new in 2.2 as wcag22aa. With no DOM and no import, so that the tests in Chromium and those in
// Node take the same list. Like the tests, the build leaves this module out.

/** The tags of the rules: WCAG 2.0, 2.1 and 2.2 at levels A and AA. */
export const TAGS: readonly string[] = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
