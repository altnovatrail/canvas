# QUESTIONS.md — questions to the author of `canvas`

Table 3 of [RUN.md](../RUN.md): the author's open questions from tasks' «Открыто» (R153 spec, R154 spec).

- Never read whole: take the rows the task and its sections name — `grep -n '^| В80 ' run/QUESTIONS.md`.
- A row comes from a task's «Открыто» (RUN.md rule 9). Record the author's answer where it belongs — the task, a document or [DEBT.md](DEBT.md) — and delete the row; what closed it is named by the decision or the task that recorded the answer.
- A row whose question opens with the mark «В реестр spec» is for `spec`: its session finds it on `main` by `just inbox` (R81 spec; RULES.md, Across repositories). It leaves once `spec` has recorded it and `canvas` has moved to the tag with the answer: the task that rests on it names its number.

## Table 3. Questions to the author

Numbers are not reused: next — В83.

| ID | Question | From | Options | Recommendation |
|---|---|---|---|---|
| В82 | «В реестр spec». The picture of a work, row 5.14 spec, is the element's method `exportPicture(): Promise<Blob>` since T120 (R83): always a PNG, 1000 × 1400, grey, of the strokes the sheet or the workbook's whole page shows, for `StoredWork.picture` of `PutWork`. `CanvasElement` of `@altnovatrail/spec/canvas` at v0.18.6 names no such method, and the card architecture 3.2 spec names none either: `app` reaches it through `NovatrailCanvas` of `@altnovatrail/canvas`, not through spec's agreement (R36 spec, R74 spec) | T120 | (a) spec's `CanvasElement` gets `exportPicture(): Promise<Blob>` with its comment, R36 spec an amendment and the card the name, and `canvas` drops the `@ts-expect-error` of `interface.check.ts` with its move to that tag; (b) the method stays the package's own, as `undo()` and `clear()` are | (a): `app` calls it for every stored work, as it calls `exportWork()`, and the agreement's types are where `app` reads what the element gives |
