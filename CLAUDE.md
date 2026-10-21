# CLAUDE.md — working rules for this repository

If `spec/RULES.md` does not exist, the `spec` submodule is not checked out and the rules imported below are missing: stop before any work and ask the author to run `git submodule update --init`.

## Your role

You are the architect of `canvas`, a component of NovaTrail: the UI package of the canvases — the canvas kinds with their layers and tools, the capture of the learner's strokes, the picture of the work for checking and the tutor's marks on the tutor's layer — which the app builds in at an exact version, and the samples page built from it, where adult volunteers make samples for eval. It knows no accounts, no api and no subject, holds no data of its own, and nothing on the tutor's layer ever changes the learner's work. The documents come before the code: write them so that whoever builds the component can act on them without asking what you meant, and the code does what they decide.

## The component

canvas is a UI package in a repository of its own, with its own releases: app builds it in at an exact version, uses a working copy of it during development, and loads nothing of it at run time (R16 spec, architecture 6 spec). At build time it depends on nothing but spec and over the network it calls nothing; it knows no accounts, no api and no subject, so the picture of the work reaches api only through app (repositories 2.1 spec, repositories 3 spec, architecture 3.2 spec, architecture 4.1 spec). It holds no data of its own: app keeps the learner's strokes with time and pressure on the device, and the server receives only a picture or a crop of the work, which it keeps only in the memory of the request (architecture 3.1 spec, architecture 5 spec, R09 spec). Its consumers are app and the samples page, later the module preview for authors and the card of the MCP channel; at stage 4 it also becomes the widget host, app's side of the widget protocol, while the widgets themselves run in an iframe sandbox (architecture 3.2 spec, architecture 3.4 spec, repositories 3 spec). On the samples page adult volunteers make samples for eval on the same canvas as learners; a sample is saved as a file on the volunteer's device. A measurement sample goes to the measurement's organiser, outside git, and a sample for a module's eval set reaches it by pull request to modules (R11). Nothing goes to the platform's server. The page takes no consent itself: it shows a notice, and the written consent is a signed form the organiser accepts before the first sample (R11). The volunteers' consent is the open question П-16 (architecture 3.2 spec, privacy 9 spec). Children's samples are made on the same page with a separate consent, but without a pull request: where their files go and who has access to them is for П-10 and П-12 to decide (R25 spec). For the first measurement the page has no hosting: its build is downloaded from a release of canvas and opened on the device. The CI that builds the page takes module-kit's CLI and a release of modules by exact tag, as tools of CI rather than dependencies at build time (repositories 1 spec): so the tasks and their media are inside the build, the page goes to no network while it runs, and the package itself still knows no subject (R25 spec, architecture 3.2 spec). It belongs to stage 2 and, with tutor, is the stage's first code: the measurement of how well AI reads the work on each canvas kind comes before the rest is built (repositories 6 spec).

Its card in spec is architecture 3.2 spec. The card is the summary and this repository's [docs/architecture.md](docs/architecture.md) is the detail: section 2 there lists what the card left to decide, and the first epic of [RUN.md](RUN.md) decides it.

## Documents

The documents under `docs/` are in Russian. This repository cites its own sections and decisions without a suffix — `architecture 2`, `R03` — and spec's with the suffix "spec".

- [docs/architecture.md](docs/architecture.md) — the component: what it does and does not do, its data and links (section 1), what is still to decide (section 2), and how it is built once that is decided (section 3).
- [docs/decisions.md](docs/decisions.md) — this repository's decision log, `R01`…: read it before proposing a change. Other repositories cite its entries as `R03 canvas`.
- [RUN.md](RUN.md) — the work plan, in epics. Table 1 holds the current epics' tasks — E1, and E2 beside it (R02) — run one at a time; the executor's rules are in its «Как пользоваться» section.
- `spec/` — spec at `v0.2.14`, a git submodule and read-only here: the platform's vocabulary, formats, contracts, documents and decisions, and the rules imported below. Its documents are under `spec/docs/`, cited with the suffix "spec". spec's own CLAUDE.md and AGENTS.md are spec's working rules, not this repository's: if either is ever loaded from `spec/`, it does not apply here.

## Shared rules

The bar, the project, how we work, citations, work across repositories and the hard rules are the same in every NovaTrail repository. They live in spec's RULES.md, and this file imports them:

@spec/RULES.md

## Environment

Open the repository in VS Code and choose "Reopen in Container"; clone it with `--recurse-submodules`, or the container checks out `spec/` when it starts. Keep the clone in a folder named `canvas`, as `git clone` names it: `.claude/settings.json` keeps spec's own CLAUDE.md out of this repository's sessions by that path. The container is spec's — Node.js and just, and the GitHub CLI and Claude Code on top — with what canvas's code adds, recorded as R13 as R46 canvas-api did for canvas-api: in the toolchain stage, Chrome Headless Shell from Playwright's image, which the tests run in, and its system libraries from a snapshot of the Ubuntu archive; in the devcontainer stage, the Biome extension. A move to a new tag of spec carries spec's changes into the devcontainer by hand and keeps these. The code's own tools are npm packages at the exact versions `package-lock.json` pins (R12). `just ci` runs the four checks CI runs — `ci-lint`, `ci-test`, `ci-vuln` and `ci-licenses` — and `ci-licenses` needs `ALLOWED_LICENSES`, the list .github's `typescript.yml` sets for it in CI: to run it here, set it to that list. `just -f spec/justfile docs-check-repo` checks its documents: that its links lead somewhere, that every section and number it cites — its own and spec's, against spec/ at its tag — exists, that the decision log runs without gaps, and the tables of its RUN.md (R32 spec). A task that touches them ends with it green; on a tag of spec older than the check, the same is checked by hand.

## samples/

`samples/` holds the samples made by hand: a sample file the author saves while trying the samples page on a device, and anything else with handwriting in it — strokes with the time and pressure of every one (R15). No agent opens it, whatever the task: it does not read, list, search, copy or run anything on what is there, and it never moves a sample into the repository. Three things hold this:
- this rule, which AGENTS.md makes binding on every agent, Codex too;
- `/samples/` in `.gitignore`;
- for Claude Code, deny rules in `.claude/settings.json` on reading it, on writing there and on any shell command that names the folder — as a word of its own, as part of a path, in quotes, after `=` or in a redirection (R15). That includes a command that names it only in passing, such as an edit of a document that mentions it: such an edit goes through the editing tools, not the shell. The rules are narrower than one on the word itself, because canvas's own names hold the word: the release's `samples-page_v<X.Y.Z>.html` and `synthetic-samples_v<X.Y.Z>.<…>` (R08).

A command that walks the whole tree, such as `grep -r` or `find .`, names no folder, and neither the deny rules nor `.gitignore` keep it out of `samples/`. Walk the tracked files instead, with `git grep` and `git ls-files`: `samples/` is never tracked. No folder of the code is called `samples`, at any depth: the deny rules would close it too.

Inside the container these are rules, not an access boundary. So whatever needs the samples is run by the author, and only what holds no handwriting reaches the repository. The tests and the synthetic samples run on strokes that the code draws.
