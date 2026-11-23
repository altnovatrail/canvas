# QUESTIONS.md — questions to the author of `canvas`

Table 3 of [RUN.md](../RUN.md): the author's open questions that tasks leave (R153 spec, R160 spec).

- Never read whole: take the rows the task and its sections name — `grep -n '^| В80 ' run/QUESTIONS.md`.
- A row is a question a task leaves open (RUN.md rule 9). Record the author's answer where it belongs — the task, a document or [DEBT.md](DEBT.md) — and delete the row.
- A row whose question opens with the mark «В реестр spec» is for `spec`: its session finds it on `main` by `just inbox` (R81 spec; RULES.md, Across repositories). It leaves once `spec` has recorded it and `canvas` has moved to the tag with the answer: the task that rests on it names its number.

## Table 3. Questions to the author

Numbers are not reused: next — В88.

| ID | Question | From | Options | Recommendation |
|---|---|---|---|---|
| В87 | «Решено исполнителем по рекомендации, до проверки автора». T150 takes the decision numbers out of `.devcontainer/`'s comments too, while R86 took a change of the template only when it was more than a comment, since a change of the Dockerfile misses CI's cache of the image `toolchain` once | T150 | (a) `.devcontainer/`'s comments are the template's, whole, now: R86 takes a comment that breaks the rule of citations, and row Д16 is closed; (b) they wait for the next change of the template beyond its comments, and `"citations": true` in T148 waits for an exception of its own | (a): the author's word is «отовсюду», the key cannot go on without it, and the miss of the cache is one round of CI |
