# CLAUDE.md — working rules for this repository

If `spec/RULES.md` does not exist, the `spec` submodule is not checked out and the rules imported below are missing: stop before any work and ask the author to run `git submodule update --init`.

## Your role

You are the architect of `canvas`, a component of NovaTrail: the UI package of the canvases — the canvas kinds with their layers and tools, the capture of the learner's strokes, the picture of the work for checking and the tutor's marks on the tutor's layer — which the app builds in at an exact version, and the samples page built from it, where adult volunteers make samples for eval. It knows no accounts, no api and no subject, holds no data of its own, and nothing on the tutor's layer ever changes the learner's work. The documents come before the code, and the code does what they decide. Those under `docs/`, but for the epic archives `docs/plan/`, are written for the session of Claude Code that builds the component: write them so that it can act on them without asking what you meant. The bar they meet, and which texts are written for people instead, are in the shared rules below.

## The component

canvas is a UI package in a repository of its own, with its own releases: app builds it in at an exact version, uses a working copy of it during development, and loads nothing of it at run time (R16 spec, architecture 6 spec). At build time it depends on nothing but spec, and over the network it calls nothing: the picture of the work reaches api only through app (repositories 2.1 spec, repositories 3 spec, architecture 3.2 spec, architecture 4.1 spec). It holds no data of its own: app keeps the learner's strokes with time and pressure on the device, and the server receives only a picture or a crop of the work, which it keeps only in the memory of the request (architecture 3.1 spec, architecture 5 spec, R09 spec). Its consumers are app and the samples page, later the module preview for authors and the card of the MCP channel; at stage 4 it also becomes the widget host, app's side of the widget protocol, while the widgets run in an iframe sandbox (architecture 3.4 spec). On the samples page adult volunteers, and children with a separate consent, make samples for eval on the same canvas as learners, and each sample is saved as a file on the device: nothing goes to the platform's server. The page takes no consent itself — it shows a notice, and the written consent is a signed form the organiser accepts before the first sample (R11) —, the volunteers' consent is П-16, and where children's files go is for П-10 and П-12 (privacy 9 spec, R25 spec). Its build carries its tasks and its sets of texts inside, from verified release files, and goes to no network while it runs ([tasks](.claude/rules/tasks.md)). It belongs to stage 2 and, with tutor, is the stage's first code; the first slice has two canvas kinds, the handwriting sheet and the workbook (repositories 6 spec, R41 spec).

Its card in spec is architecture 3.2 spec. The card is the summary and this repository's [docs/architecture.md](docs/architecture.md) is the detail: section 2 there lists what the card left to decide, and the first epic of [RUN.md](RUN.md), E1, decided it.

## Documents

The documents under `docs/` are in English, but for the epic archives `docs/plan/`, which stay in Russian with RUN.md and DEBT.md (R143 spec). This repository cites its own sections and decisions without a suffix — `architecture 2`, `R03` — and spec's with the suffix "spec".

- [docs/architecture.md](docs/architecture.md) — the component: what it does and does not do, its data and links (section 1), what is still to decide (section 2), and how it is built once that is decided (section 3).
- [docs/decisions.md](docs/decisions.md) — this repository's decision log, `R01`…: read it before proposing a change. Other repositories cite its entries as `R03 canvas`.
- [docs/sources.md](docs/sources.md) — the records of external facts — a library's documentation, a browser's behaviour, a release of another repository, a license — each with its source, its date and its quote; a claim in another document cites its record, as `sources 1.1` (R143 spec). The results of a measurement — canvas's probes of browsers and devices, and the tokens its sessions spend — go to [docs/measurements.md](docs/measurements.md), cited as `measurements 1.1`; `docs/architecture.md` holds neither.
- [RUN.md](RUN.md) — the work plan, in epics. Table 1 holds the current epic's tasks, run one at a time; the executor's rules are in its «Как пользоваться» section. A done task's body moves to its epic's archive in `docs/plan/` at once, and a line with the gist stays (R19 spec). Each epic has an archive of its own, `docs/plan/<epic>.md` — that of E1, the detailing, is [docs/plan/E1.md](docs/plan/E1.md) —, and RUN.md lists the finished ones under «Сделанные эпики».
- [DEBT.md](DEBT.md) — table 4 of the work plan, the technical debt, in Russian. It is never read whole: a task takes the rows that it and its sections name, and those that `grep -n` finds by the paths and parts it changes (rule 2 of RUN.md).
- `spec/` — spec at `v0.16.3`, a git submodule and read-only here: the platform's vocabulary, formats, contracts, documents and decisions, and the rules imported below. Its documents are under `spec/docs/`, cited with the suffix "spec". spec's own CLAUDE.md and AGENTS.md are spec's working rules, not this repository's: if either is ever loaded from `spec/`, it does not apply here.

## Shared rules

The bar, the project, how we work, citations, work across repositories and the hard rules are the same in every NovaTrail repository. They live in spec's RULES.md, and this file imports them:

@spec/RULES.md

## Environment

Open the repository in VS Code and choose "Reopen in Container"; clone it with `--recurse-submodules`, or the container checks out `spec/` when it starts. Keep the clone in a folder named `canvas`, as `git clone` names it: `.claude/settings.json` keeps spec's own CLAUDE.md and its rules, `spec/.claude/rules/`, out of this repository's sessions by that path. The container is spec's, as its template builds it for a repository of the kind `typescript` (R79 spec) — Node.js, Go, buf and just, the GitHub CLI and Claude Code, and Chrome Headless Shell, which the tests run in —, and the code's own tools are npm packages at exact versions (R12, R13). `just ci` runs the four checks CI runs. `just -f spec/justfile docs-check-repo` checks the documents: that their links lead somewhere, that every section and number they cite — this repository's and spec's, against spec/ at its tag — exists, that the decision log runs without gaps, and the tables of RUN.md (R32 spec), and that files, rules, decision entries, sections and rows keep within their budgets of size: spec's block `repository` of `spec/tools/docs-check/budgets.json`, with what [docs-budgets.json](docs-budgets.json) names in its place — raising one is an edit of that file (R145 spec). A task that touches them ends with it green.

**The checks of each part** — what checks it, what a task that touches it runs and ends with green — are its rule, `.claude/rules/<part>.md`. Claude Code loads a rule when the session reads or edits a file its `paths` match, not when a script edits one, and compaction drops it until such a file is read again (R143 spec; measurements 1.8 spec): before changing a part, read its rule. CI runs every check on every pull request. The rules and their parts:
- [ci](.claude/rules/ci.md) — the four checks, the container, the npm packages and the release: `.github/`, `.devcontainer/`, the justfile, `package.json`, its lock file, `licenses.json` and the configuration of the tools;
- [tasks](.claude/rules/tasks.md) — the release files the samples page's build carries, `tasks/`, their tags in the justfile, and the code that reads them;
- [page](.claude/rules/page.md) — the samples page, its build and policy, the license notices, and the emulators and the probe that check it: `page/`, `emulators/`, `probe/`, their scripts and workflows;
- [element](.claude/rules/element.md) — the element's words, icons, accessibility and interface: `src/element/`, `scripts/icons.ts` and `NOTICE`;
- [eval](.claude/rules/eval.md) — the sample file, its examples and the synthetic samples: `src/eval/`, `examples/` and the scripts of the synthetic sets and the generator.

## samples/

`samples/` holds the samples made by hand: a sample file the author saves while trying the samples page on a device, and anything else with handwriting in it — strokes with the time and pressure of every one (R15). No agent opens it, whatever the task: it does not read, list, search, copy or run anything on what is there, and it never moves a sample into the repository. Three things hold this:
- this rule, which AGENTS.md makes binding on every agent, Codex too;
- `/samples/` in `.gitignore`;
- for Claude Code, deny rules in `.claude/settings.json` on reading it, on writing there and on any shell command that names the folder — as a word of its own, as part of a path, in quotes, after `=` or in a redirection (R15). That includes a command that names it only in passing, such as an edit of a document that mentions it: such an edit goes through the editing tools, not the shell. The rules are narrower than one on the word itself, because canvas's own names hold the word: the release's `samples-page_v<X.Y.Z>.html` and `synthetic-samples_v<X.Y.Z>.<…>` (R08).

A command that walks the whole tree, such as `grep -r` or `find .`, names no folder, and neither the deny rules nor `.gitignore` keep it out of `samples/`. Walk the tracked files instead, with `git grep` and `git ls-files`: `samples/` is never tracked. No folder of the code is called `samples`, at any depth: the deny rules would close it too.

Inside the container these are rules, not an access boundary. So whatever needs the samples is run by the author, and only what holds no handwriting reaches the repository. The tests and the synthetic samples run on strokes that the code draws.
