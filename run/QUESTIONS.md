# QUESTIONS.md — questions to the author of `canvas`

Table 3 of [RUN.md](../RUN.md): the author's open questions that tasks leave (R153 spec, R160 spec).

- Never read whole: take the rows the task and its sections name — `grep -n '^| В80 ' run/QUESTIONS.md`.
- A row is a question a task leaves open (RUN.md rule 9). Record the author's answer where it belongs — the task, a document or [DEBT.md](DEBT.md) — and delete the row.
- A row whose question opens with the mark «В реестр spec» is for `spec`: its session finds it on `main` by `just inbox` (R81 spec; RULES.md, Across repositories). It leaves once `spec` has recorded it and `canvas` has moved to the tag with the answer: the task that rests on it names its number.

## Table 3. Questions to the author

Numbers are not reused: next — В91.

| ID | Question | From | Options | Recommendation |
|---|---|---|---|---|
| В87 | «Решено исполнителем по рекомендации, до проверки автора». T150 takes the decision numbers out of `.devcontainer/`'s comments too, while R86 took a change of the template only when it was more than a comment, since a change of the Dockerfile misses CI's cache of the image `toolchain` once | T150 | (a) `.devcontainer/`'s comments are the template's, whole, now: R86 takes a comment that breaks the rule of citations, and row Д16 is closed; (b) they wait for the next change of the template beyond its comments, and `"citations": true` in T148 waits for an exception of its own | (a): the author's word is «отовсюду», the key cannot go on without it, and the miss of the cache is one round of CI |
| В89 | «В реестр spec». `canvas` raised `playwright` to 1.65.1 ahead of spec's template for the kind `typescript`: its `.devcontainer/Dockerfile` copies the browsers from `mcr.microsoft.com/playwright:v1.65.1-noble@sha256:1507cbfc550a63a6b7396791ca4f00df17beb56342d2447b3f106c306f525579` with Chrome Headless Shell 1255, which 1.65.1's `browsers.json` names — WebKit 2388 and Firefox 1572 stay, and `nativeDeps.ts` is 1.65.0's —, while `repo-template/kinds/typescript.Dockerfile` still has v1.65.0 and 1254, so `new-repo-draft` at the next tag would take `canvas` back to a browser its package does not find | Dependabot #148 | (a) spec raises the template's image, digest and revision to these; (b) `canvas` keeps its lines by hand over each move to a tag | (a): the package and the browsers move together only where the template moves them |
| В90 | «В реестр spec». A new declared nonconformance of `canvas` for `app`'s page «Доступность»: 2.5.5 of spec's standard of UI packages, and 2.5.8 at small sizes — a task of a module's options on the tracing paper scale with it, as the statement's print, by the interface mockup: 44 CSS px high where the paper is 427 px wide, less on a phone and as the learner scales the paper down or zooms out; the paper's Larger and Fit, Zoom in and the keyboard stand instead (`docs/architecture.md`, accessibility) | T361 | (a) `app`'s page names it as `canvas` declares it; (b) spec's mockup gives the options a least size on the screen, and the paper's band changes with the zoom | (a): their size is the statement's, and a band that changed with the zoom would move the strokes written beside them |
