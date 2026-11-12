---
paths:
  - "src/eval/**"
  - "scripts/synthetic*.ts"
  - "scripts/generator*.ts"
  - "scripts/archive*.ts"
  - "examples/**"
---

# The sample file and the synthetic samples

The sample file is built, written and read by `src/eval/`, outside the package, by the code of `@altnovatrail/contracts`: the message `Sample` of `novatrail.eval.v1`, of each composition — a measurement by an adult with the history of writing, an eval set's, and a child's with the final geometry, on a sheet and on a workbook (R48; R09). The eval protocol forbids a check of canvas's own: spec's `sample-check` holds the files, and only `ci-licenses` has `spec/` to run it (R93 spec; `.claude/rules/ci.md`). `src/eval/sample.test.ts` writes the example files of `examples/`, one of each composition, and `ci-test` holds them to the code: a change to the file's code writes them anew in the same change.

- **Synthetic samples** are drawn by `src/eval/synthetic.ts` from fixed seeds, on the tasks of tutor's file in `tasks/` (R49). No tree holds the set: `just synthetic <folder>` writes it, in `ci-licenses`, where `sample-check` reads each file, and in `release-files`, where `scripts/archive.ts` packs it into `synthetic-samples_v<X.Y.Z>.tar.gz`, the same bytes for the same files, and a list `.tsv` beside it (R50).
- **A module's eval set**: `just synthetic-module <package> <tag> <folder> <task>:<seed>...` writes samples on a module's package, which module-kit built (R63). Every release carries the generator as one file, `synthetic-module_v<X.Y.Z>.mjs`, built by `scripts/generator.ts`, which writes the same, byte for byte, and which modules takes by its tag and digest (R68). `ci-licenses` runs the file of version 0.0.0 on the package of grade-3-math in `tasks/modules-<tag>/` and has `sample-check --eval-set` read the samples (`.claude/rules/tasks.md`).
- **No handwriting.** The tests and the synthetic samples run on strokes the code draws (`src/eval/hand.ts`). A sample a person wrote never enters the repository, and nothing here reads the folder of the samples made by hand (CLAUDE.md; R15).
