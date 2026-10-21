# canvas

The NovaTrail canvases. A canvas is the workplace of a task, where the learner writes, draws and types; this UI package holds the canvas kinds — at the first slice the handwriting sheet and the text canvas — with their layers and tools, captures the learner's strokes with time and pressure, draws the picture of the work that goes to be checked and shows the tutor's marks tied to the learner's strokes, and the app builds it in at an exact version. A separate build of it is the samples page, where adult volunteers make samples for eval on the same canvas that learners use: a sample is saved as a file on the volunteer's device and reaches a module's eval set by pull request, and nothing goes to the platform's server.

A component of [NovaTrail](https://github.com/altnovatrail/spec/tree/v0.2.12), a universal open platform for adaptive learning, interactive lessons and AI tutoring. It belongs to stage 2, First slice with learners, with tutor, api, app, skill-map and infra; with tutor it is the stage's first code, for the measurement of how well AI reads the learner's work on each canvas kind.

## Status

Detailing. The documents come first: the first epic of [RUN.md](RUN.md) decides what the component's card left open, and the code follows in the order RUN.md sets. There is no package and no samples page here yet: the first epic decides what they are built on, and epic E2, beside it, builds them task by task as those decisions come (R02).

## Documents

The documents are in Russian.

- [docs/architecture.md](docs/architecture.md) — the component: what it does and does not do, its data and links, and what is still to decide.
- [docs/decisions.md](docs/decisions.md) — the decision log: what was decided, why, and what was rejected.
- [RUN.md](RUN.md) — the work plan, in epics.

The working rules, for people and coding agents alike, are in [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md). The platform's shared vocabulary, formats, contracts and decisions are in [spec](https://github.com/altnovatrail/spec/tree/v0.2.12), checked out here as a git submodule at `v0.2.12`: clone this repository with `git clone --recurse-submodules`.

## License

[Apache-2.0](LICENSE).
