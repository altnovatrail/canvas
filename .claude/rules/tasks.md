---
paths:
  - "tasks/**"
  - "justfile"
  - "scripts/legal*.ts"
  - "scripts/modules*.ts"
  - "scripts/open-views.ts"
  - "src/eval/tasks*.ts"
  - "page/sets.ts"
  - "page/sets/**"
---

# The release files of `tasks/`

The samples page's build carries its tasks and its text sets inside, so the page goes to no network while it runs and the package itself still knows no subject (R25 spec, architecture 3.2 spec). They come from files of NovaTrail releases, which CI takes by exact tag, as tools of CI rather than dependencies at build time, and only once spec's `release-verify` has accepted each file (repositories 1 spec, R77 spec). `ci-licenses` verifies every one of them on every pull request (`.claude/rules/ci.md`), and a file it has not accepted enters neither the code nor CI. A copy in `tasks/` is never edited by hand.

- **tutor's file of open tasks**, `tasks/tutor_<tag>_open-tasks.json` with its bundle: the tasks of the measurement and of a child's session, until the build moves to modules (the 2026-10-21 amendment to R25 spec; R62; Д4 in DEBT.md). Its tag is `tutor_tag` of the justfile and `TUTOR_FILE` of `src/eval/tasks.ts`, with the file's sum, and the tests hold them to each other (R49). `openTasksOf` refuses a task with a field outside the open view, so no key, solution or trap reaches a release.
- **modules's tasks for a module's eval set**, `tasks/modules-<tag>/`: what module-kit's `open` writes of a release of modules, with the seeds of the templates' instances (R71). `just modules-open copy` writes the copy anew, for a move to another release or other seeds, from the files `release-verify` accepted, and `just modules-open check`, in `ci-licenses`, holds the copy to them byte for byte. `page_modules_tag`, `module_kit_tag` and `open_seeds` of the justfile and `MODULES_FILE` of `src/eval/tasks.ts` name the same, and `scripts/modules.test.ts` holds them together. The release `modules_tag` beside it holds the packages the synthetic samples of a module's eval set are written on, each held to the index's digest (R63, T98).
- **spec's legal part**, `tasks/spec-<tag>/legal-2.tar.gz` with its bundle: the page's text sets, of the tag `spec/` stands on (R69, R72). `spec_tag` and `legal_file` of the justfile and `LEGAL_FILE` of `scripts/legal.ts`, with the archive's sha256, name it, and `scripts/legal.test.ts` holds them together. A move to a new tag of spec downloads the tag's file and its bundle, runs `just -f spec/justfile release-verify spec <tag> <file>` on them, puts them in a new `tasks/spec-<tag>/` and removes the old folder, even when the content has not changed: a new release is a new archive, with another sum.

The build reads the legal part by the part's own rules, `spec/legal/README.md`: each purpose opens only with a set in force, and a purpose with none is closed. At v0.16.3, as at v0.15.0, the measurement's set `measure` and the eval set's `eval-set` are in force, and a child's session waits for its set, `child-sample` (R130 spec, R139 spec, R141 spec). `page/sets/test/` is a part of the tests' own, whose sets begin with `test-`, and goes only into a page of version 0.0.0, which no release has (R58).
