# QUESTIONS.md — questions to the author of `canvas`

Table 3 of [RUN.md](../RUN.md): the author's open questions from tasks' «Открыто» (R153 spec, R154 spec).

- Never read whole: take the rows the task and its sections name — `grep -n '^| В80 ' run/QUESTIONS.md`.
- A row comes from a task's «Открыто» (RUN.md rule 9). Record the author's answer where it belongs — the task, a document or [DEBT.md](DEBT.md) — and delete the row; what closed it is named by the decision or the task that recorded the answer.
- A row whose question opens with the mark «В реестр spec» is for `spec`: its session finds it on `main` by `just inbox` (R81 spec; RULES.md, Across repositories). It leaves once `spec` has recorded it and `canvas` has moved to the tag with the answer: the task that rests on it names its number.

## Table 3. Questions to the author

Numbers are not reused: next — В82.

| ID | Question | From | Options | Recommendation |
|---|---|---|---|---|
| В81 | «В реестр spec»: the hard rule «Exact versions only» of RULES.md spec, at v0.18.4 and on `main` (2026-11-16), still reads «`apt-get update --snapshot` and `apt-get install --snapshot` with its ID», while the 2026-11-16 amendment to R40 spec and the template's `typescript.Dockerfile` of the same tag give apt a source of the snapshot's own and no `--snapshot`. A session that holds a copy's Dockerfile to RULES.md flags the template's `RUN`, or puts the flags back | T117; `.devcontainer/Dockerfile`; R81 | (a) RULES.md words the rule by the amendment — apt reads the snapshot alone, by its ID, an `ARG` beside the list; (b) the amendment to R40 spec names RULES.md as not yet changed, and the rule is reworded with its next edit; (c) leave it: the amendment is the decision, and RULES.md cites R40 spec | (a): RULES.md is loaded into every session of every repository, and a hard rule that its own template breaks invites a wrong fix |
