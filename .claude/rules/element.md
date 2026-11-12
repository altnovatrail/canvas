---
paths:
  - "src/element/**"
  - "scripts/icons*.ts"
  - "NOTICE"
---

# The element: its words, icons, accessibility and interface

`<novatrail-canvas>` is one web component for every canvas kind, with an open Shadow DOM and no framework, and its types are spec's: the element is `CanvasElement` of `@altnovatrail/spec` (R07; R74 spec). `src/element/interface.check.ts` and `src/element/boundary.check.ts` are type-checked by `ci-lint` and never built: the first holds the interface as a consumer's types see it, the second that the element sees the DOM but not Node. A change to what the element takes or gives changes `interface.check.ts` with it.

- **Words.** The labels are `src/element/labels.ts`, in English and Russian, by the element's own `lang` (R28; R91 spec, R92 spec): a label with a number in it is one string with named places, none counts a thing or tells the learner's gender, and the buttons' words are those of the table of words of architecture 6 spec, the four of the zoom and of the scroll across among them (R73; Д219 spec). A new button or label takes its words from that table, or waits for spec with a row «в реестр spec» in table 3 of RUN.md; `labels.test.ts` holds every button's words.
- **Icons.** Each button of the row shows an icon of the set Material Symbols by the table of values of architecture 6 spec (R46; R78 spec). `just icons` writes `src/element/icons.ts` and `NOTICE` from the set `package-lock.json` pins, and `ci-lint` fails when either is not what it would write: never edit them by hand, and run `just icons` after a change of the table in `scripts/icons.ts` or a new version of the set.
- **Accessibility.** axe-core checks the shadow tree by the rules of WCAG 2.2 level AA, on every canvas kind and in forced colours (R70; R90 spec): `a11y.test.ts` and `forced-colors.test.ts` fail on every violation and on an «incomplete» outside the kind's named list. What the element does not yet meet of the standard of UI packages is architecture 3.10, a criterion with what stands instead and when it goes (R74): a change that meets one, or breaks one, changes that section and its entry.
- **Styles.** The shadow tree takes its styles by `adoptedStyleSheets`, one sheet to a document, never a `<style>` element (R51): the element shows every kind under a policy with no inline style, and `csp.test.ts` holds it.
- **Tests.** The element's tests run in Chromium; those that drive a pointer share `pointer.fixture.ts`. The timeout of a test is its own (R75; `.claude/rules/ci.md`).
