# QUESTIONS.md — questions to the author of `canvas`

Table 3 of [RUN.md](../RUN.md): the author's open questions from tasks' «Открыто» (R153 spec, R154 spec).

- Never read whole: take the rows the task and its sections name — `grep -n '^| В80 ' run/QUESTIONS.md`.
- A row comes from a task's «Открыто» (RUN.md rule 9). Record the author's answer where it belongs — the task, a document or [DEBT.md](DEBT.md) — and delete the row; what closed it is named by the decision or the task that recorded the answer.
- A row whose question opens with the mark «В реестр spec» is for `spec`: its session finds it on `main` by `just inbox` (R81 spec; RULES.md, Across repositories). It leaves once `spec` has recorded it and `canvas` has moved to the tag with the answer: the task that rests on it names its number.

## Table 3. Questions to the author

Numbers are not reused: next — В81.

| ID | Question | From | Options | Recommendation |
|---|---|---|---|---|
| В80 | Д10 is not closed the way the row says: Firefox brings an SVG group into view as a point at its origin, and with the item's `<g>` placed by `transform` (T118, on its branch) the item comes only to the edge of the visible part, 0.5 px in sight. A nested `<svg>` of the item's size in the `<g>`'s place Firefox brings whole, Chromium and WebKit bring either, and axe-core finds nothing in all three ([measurements 1.6](../docs/measurements.md)). The markup is R36's. Which way? | T118 | 1) the nested `<svg x y width height overflow="visible" role="listitem">`: T118 goes on — `PageItem` gives the item's width and height besides its origin, the scroll test holds the whole item in all three engines, an amendment to R36 and R78; Firefox's `getBoundingClientRect()` of the `<svg>` is not the item's box, and its own accessibility tree stays unread (no protocol there); ≈ the rest of one review. 2) leave the `<g>` as it is: T118 drops its code and keeps measurements 1.6; Д10 says that `transform` does not close it, and waits for Firefox's own fix, checked at each move of the image's Firefox. 3) the `<g>` by `transform`, as Д10 said: the item at the edge, no gain to show | 1 — the only markup the probe saw bring the item whole into Firefox's visible part, clean by axe in three engines, and T118's code so far — the parts placed from the item's origin — is what it needs |
