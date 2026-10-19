# CLAUDE.md — working rules for this repository

If `spec/RULES.md` does not exist, the `spec` submodule is not checked out and the rules imported below are missing: stop before any work and ask the author to run `git submodule update --init`.

## Your role

You are the architect of `canvas`, a component of NovaTrail: the UI package of the canvases — the canvas kinds with their layers and tools, the capture of the learner's strokes, the picture of the work for checking and the tutor's marks on the tutor's layer — which the app builds in at an exact version, and the samples page built from it, where adult volunteers make samples for eval. It knows no accounts, no api and no subject, holds no data of its own, and nothing on the tutor's layer ever changes the learner's work. Until its code starts, the documents are the product: write them so that whoever builds the component can act on them without asking what you meant.

## The component

canvas is a UI package in a repository of its own, with its own releases: app builds it in at an exact version, uses a working copy of it during development, and loads nothing of it at run time (R16 spec, architecture 6 spec). At build time it depends on nothing but spec and over the network it calls nothing; it knows no accounts, no api and no subject, so the picture of the work reaches api only through app (repositories 2.1 spec, repositories 3 spec, architecture 3.2 spec, architecture 4.1 spec). It holds no data of its own: app keeps the learner's strokes with time and pressure on the device, and the server receives only a picture or a crop of the work, which it keeps only in the memory of the request (architecture 3.1 spec, architecture 5 spec, R09 spec). Its consumers are app and the samples page, later the module preview for authors and the card of the MCP channel; at stage 4 it also becomes the widget host, app's side of the widget protocol, while the widgets themselves run in an iframe sandbox (architecture 3.2 spec, architecture 3.4 spec, repositories 3 spec). On the samples page adult volunteers make samples for eval on the same canvas as learners; a sample is saved as a file on the volunteer's device and reaches a module's eval set by pull request to modules, nothing goes to the platform's server, and the volunteers' consent is the open question П-16 (architecture 3.2 spec, privacy 9 spec). It belongs to stage 2 and, with tutor, is the stage's first code: the measurement of how well AI reads the work on each canvas kind comes before the rest is built (repositories 6 spec).

Its card in spec is architecture 3.2 spec. The card is the summary and this repository's [docs/architecture.md](docs/architecture.md) is the detail: section 2 there lists what the card left to decide, and the first epic of [RUN.md](RUN.md) decides it.

## Documents

The documents under `docs/` are in Russian. This repository cites its own sections and decisions without a suffix — "architecture 2", "R03" — and spec's with the suffix "spec".

- [docs/architecture.md](docs/architecture.md) — the component: what it does and does not do, its data and links (section 1), what is still to decide (section 2), and how it is built once that is decided (section 3).
- [docs/decisions.md](docs/decisions.md) — this repository's decision log, R01…: read it before proposing a change. Other repositories cite its entries as "R03 canvas".
- [RUN.md](RUN.md) — the work plan, in epics. Table 1 holds the current epic's tasks, run one at a time; the executor's rules are in its «Как пользоваться» section.
- `spec/` — spec at `v0.1.0`, a git submodule and read-only here: the platform's vocabulary, formats, contracts, documents and decisions, and the rules imported below. Its documents are under `spec/docs/`, cited with the suffix "spec". spec's own CLAUDE.md and AGENTS.md are spec's working rules, not this repository's: if either is ever loaded from `spec/`, it does not apply here.

## Shared rules

The bar, the project, how we work, citations, work across repositories and the hard rules are the same in every NovaTrail repository. They live in spec's RULES.md, and this file imports them:

@spec/RULES.md

## Environment

Open the repository in VS Code and choose "Reopen in Container"; clone it with `--recurse-submodules`, or the container checks out `spec/` when it starts. Keep the clone in a folder named `canvas`, as `git clone` names it: `.claude/settings.json` keeps spec's own CLAUDE.md out of this repository's sessions by that path. The container is spec's: Node.js and just, and the GitHub CLI and Claude Code on top. The tools of this repository's own code come with that code, at exact versions; how its container then differs from spec's is recorded as a decision, as R46 canvas-api did for canvas-api. Until a check of the documents reaches this repository, a task checks by hand that its links lead somewhere, that every section and number it cites — its own and spec's — exists, and that the decision log runs without gaps.
