---
paths:
  - "src/element/**"
  - "scripts/icons*.ts"
  - "NOTICE"
---

# The element: its words, icons, accessibility and interface

`<novatrail-canvas>` is one web component for every canvas kind, with an open Shadow DOM and no framework, and its types are spec's: the element is `CanvasElement` of `@altnovatrail/spec`. `src/element/interface.check.ts` and `src/element/boundary.check.ts` are type-checked by `ci-lint` and never built: the first holds the interface as a consumer's types see it, the second that the element sees the DOM but not Node. A change to what the element takes or gives changes `interface.check.ts` with it.

- **Words.** The labels are `src/element/labels.ts`, in English and Russian, by the element's own `lang`: a label with a number in it is one string with named places, none counts a thing or tells the learner's gender, and the buttons' words are those of the table of words of the interface in spec's `docs/architecture.md`, the two of the zoom among them. A new button of the bar takes its words from that table, or waits for spec with a row «в реестр spec» in table 3, `run/QUESTIONS.md`; the words only canvas shows — its regions, its popovers' choices — are its own, in the table of such phrases of `docs/architecture.md`; `labels.test.ts` holds every button's words.
- **Icons.** Each button of the row shows an icon of the set Material Symbols by the table of values of the interface in spec's `docs/architecture.md`. `just icons` writes `src/element/icons.ts` and `NOTICE` from the set `package-lock.json` pins, and `ci-lint` fails when either is not what it would write: never edit them by hand, and run `just icons` after a change of the table in `scripts/icons.ts` or a new version of the set, which only a row of spec's COORDINATION.md brings, never Dependabot.
- **Accessibility.** axe-core checks the shadow tree by the rules of WCAG 2.2 level AA, on every canvas kind and in forced colours: `a11y.test.ts` and `forced-colors.test.ts` fail on every violation and on an «incomplete» outside the kind's named list. What the element does not yet meet of the standard of UI packages is listed in `docs/architecture.md`, a criterion with what stands instead and when it goes: a change that meets one, or breaks one, changes that list and its entry of the decision log.
- **Styles.** The shadow tree takes its styles by `adoptedStyleSheets`, one sheet to a document, never a `<style>` element: the element shows every kind under a policy with no inline style, and `csp.test.ts` holds it.
- **Tests.** The element's tests run in Chromium, WebKit and Firefox; one that needs the DevTools protocol — real input, Chromium's own accessibility tree, emulated media — is `test.runIf(devtools)`, and runs in Chromium alone. Those that drive a pointer share `pointer.fixture.ts`. The timeout of a test is its own (`.claude/rules/ci.md`).
