# canvas

The NovaTrail canvases. A canvas is the workplace of a task, where the learner writes, draws and types; this UI package holds the canvas kinds — at the first slice the handwriting sheet and the text canvas — with their layers and tools, captures the learner's strokes with time and pressure, draws the picture of the work that goes to be checked and shows the tutor's marks tied to the learner's strokes, and the app builds it in at an exact version. A separate build of it is the samples page, where adult volunteers make samples for eval on the same canvas that learners use: a sample is saved as a file on the volunteer's device and reaches a module's eval set by pull request, and nothing goes to the platform's server.

A component of [NovaTrail](https://github.com/altnovatrail/spec/tree/v0.2.18), a universal open platform for adaptive learning, interactive lessons and AI tutoring. It belongs to stage 2, First slice with learners, with tutor, api, app, skill-map and infra; with tutor it is the stage's first code, for the measurement of how well AI reads the learner's work on each canvas kind.

## Status

Code started. The detailing is done — epic E1, archived in [docs/plan/E1.md](docs/plan/E1.md) — and epic E2 of [RUN.md](RUN.md), replanned for the MVP on 2026-10-22, builds the handwriting sheet as the element `<novatrail-canvas>` first: tutor's check board can take it in place of its own sheet. The samples page waits for the author's decision on the big measurement. So far there is the package's skeleton, `@altnovatrail/canvas`, with its tools; no release has come out yet.

## Code

- `src/core/` — the DOM-free part, `@altnovatrail/canvas/core`: it runs the same in a browser and in Node.
- `src/element/` — the element `<novatrail-canvas>`, `@altnovatrail/canvas`: importing it registers the element.
- `scripts/` — the check of every package's license, and the check of the package as a consumer takes it.

`just build` builds the package into `lib/`, and `just ci` runs the checks CI runs: format, lint and types; the tests in Node and in Chromium; advisories; licenses. They run in the devcontainer, whose toolchain stage holds the browser the tests run in. The license check needs `ALLOWED_LICENSES`, the list CI takes from .github's `typescript.yml`: how to set it is in [CLAUDE.md](CLAUDE.md), Environment.

## Documents

The documents are in Russian.

- [docs/architecture.md](docs/architecture.md) — the component: what it does and does not do, its data and links, and what is still to decide.
- [docs/decisions.md](docs/decisions.md) — the decision log: what was decided, why, and what was rejected.
- [RUN.md](RUN.md) — the work plan, in epics.

The working rules, for people and coding agents alike, are in [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md). The platform's shared vocabulary, formats, contracts and decisions are in [spec](https://github.com/altnovatrail/spec/tree/v0.2.18), checked out here as a git submodule at `v0.2.18`: clone this repository with `git clone --recurse-submodules`.

## License

[Apache-2.0](LICENSE).
