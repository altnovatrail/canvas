# canvas

[![CI](https://github.com/altnovatrail/canvas/actions/workflows/ci.yml/badge.svg)](https://github.com/altnovatrail/canvas/actions/workflows/ci.yml)
[![Release](https://github.com/altnovatrail/canvas/actions/workflows/release.yml/badge.svg)](https://github.com/altnovatrail/canvas/actions/workflows/release.yml)
[![CodeQL](https://github.com/altnovatrail/canvas/actions/workflows/codeql.yml/badge.svg)](https://github.com/altnovatrail/canvas/actions/workflows/codeql.yml)
[![Latest release](https://img.shields.io/github/v/release/altnovatrail/canvas)](https://github.com/altnovatrail/canvas/releases/latest)
[![TypeScript version](https://img.shields.io/github/package-json/dependency-version/altnovatrail/canvas/dev/typescript)](package.json)
[![Coverage](https://codecov.io/gh/altnovatrail/canvas/branch/main/graph/badge.svg)](https://codecov.io/gh/altnovatrail/canvas)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/altnovatrail/canvas/badge)](https://scorecard.dev/viewer/?uri=github.com/altnovatrail/canvas)
[![License](https://img.shields.io/github/license/altnovatrail/canvas)](LICENSE)

[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=altnovatrail_canvas&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=altnovatrail_canvas)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=altnovatrail_canvas&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=altnovatrail_canvas)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=altnovatrail_canvas&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=altnovatrail_canvas)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=altnovatrail_canvas&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=altnovatrail_canvas)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=altnovatrail_canvas&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=altnovatrail_canvas)

The NovaTrail canvases. A canvas is the workplace of a task, where the learner writes, draws and types; this UI package holds the canvas kinds — for now two, the handwriting sheet and the workbook — with their layers and tools, captures the learner's strokes with time and pressure, draws the picture of the work that goes to be checked and shows the tutor's marks tied to the learner's strokes, and the app builds it in at an exact version. A separate build of it is the samples page, where adult volunteers make samples for eval on the same canvas that learners use: a sample is saved as a file on the volunteer's device and reaches a module's eval set by pull request, and nothing goes to the platform's server. The same page opens a sample file to be looked at — its strokes, what a history erased too, its crops and its markup — so that a person, not an AI, looks in it for a name or a contact before it goes on.

A component of [NovaTrail](https://github.com/altnovatrail/spec), a universal open platform for adaptive learning, interactive lessons and AI tutoring. It belongs to stage 2, First slice with learners, with tutor, api, app, skill-map and infra; with tutor it is the stage's first code: first the handwriting sheet, while the samples page waits until a measurement needs volunteers' or children's samples.

## Install

The app takes the package from npm at an exact version, and spec's npm package, whose types the element's contract is in, at the version of the tag its own `spec` submodule stands on, not the one in canvas's `dependencies`: the types of the contract are structural, so `tsc` finds a difference of shape where the two meet (R73 spec):

```sh
npm install --save-exact @altnovatrail/canvas@<version>
npm install --save-exact --save-dev @altnovatrail/spec@<the version of your spec tag>
```

A pull request that changes the lock file has spec's recipe check it, as NovaTrail's rules ask of every package of `@altnovatrail`: `just -f spec/justfile release-verify-npm package-lock.json`, from a checkout of spec at a tag. It takes the archive from the registry only if it is the same bytes as the file of canvas's release, signed by .github's shared release at the call of canvas's `release.yml` on `main`.

## The samples page

Every release since 2026-11-10 carries the samples page as one file, `samples-page_v<version>.html`: download it from the release's page and open it from the file, on a computer or on Android. It goes to no network while it runs and remembers nothing between openings; the sample it saves is a file on the device. On an iPad, Files shows the file without its script, and the page does not work there. GitHub sees the IP address of whoever downloads a file of a release, the page too, and each release's notes say so first. The page's own file is checked as any file of a NovaTrail release, from a checkout of spec at a tag:

```sh
just -f spec/justfile release-verify canvas v<version> samples-page_v<version>.html
```

with its bundle, `samples-page_v<version>.html.sigstore.json`, beside it.

## The generator of a module's eval set

Each release carries the generator of a module's synthetic samples as one file, `synthetic-module_v<version>.mjs`: one ES module that Node 24 runs with no package of npm beside it, which writes what `just synthetic-module` writes, byte for byte. A module's CI takes it from a release by its exact tag and digest, checked as any file of a NovaTrail release, and runs it with the arguments of `just synthetic-module` (below):

```sh
just -f spec/justfile release-verify canvas v<version> synthetic-module_v<version>.mjs
node synthetic-module_v<version>.mjs --module <package> <tag> <folder> <task>:<seed>...
node synthetic-module_v<version>.mjs --digest <package> <task>...
```

`--digest` prints a line for each task named, its ID and the digest of its open view, `sha256:` and 64 hexadecimal digits, by the same projection the samples name a task by: a module's CI holds people's samples to the package of its commit with it. A task the generator draws no sample of — a choice, an essay, a zone — has its digest too. A template has no open view, and a task the package does not have no digest: the call prints the other tasks' lines all the same, names each of those after them, and exits 1.

The file opens with a comment that says what it is and holds the license notices of all the code it carries, and its code is not minified, so that whoever runs it can read it.

## Code

- `src/core/` — the DOM-free part, `@altnovatrail/canvas/core`: it runs the same in a browser and in Node, and its entry point gives the sheet's size, the types of the data and the fold of a history into its strokes.
- `src/element/` — the element `<novatrail-canvas>`, `@altnovatrail/canvas`: importing it registers the element. The types of its contract with the app — the element as `CanvasElement` has it, its events, the media, the tutor's marks, the writing history, the work for checking and its context — are spec's, from `@altnovatrail/spec/canvas`, and this entry point gives them under spec's names, the same types; the DOM-free part gives the data's among them, the writing history and the context of a submission. The app takes them from spec's package, `import type { CanvasElement } from "@altnovatrail/spec/canvas"`, at the version canvas has in its `dependencies`; canvas's own are only what the contract does not name: the commands `undo()` and `clear()`, and the task's temporary tools.
- `src/eval/` — the sample file of spec's eval protocol, which the samples page and the synthetic samples write: a sample of each composition, on a sheet or a workbook, its final geometry and its crops, written and read by the code of `@altnovatrail/contracts`; and the synthetic samples themselves, which code draws from a seed, with a hand of its own, on tasks of tutor's file of open tasks or, for a module's eval set, of the module's package. It runs the same in a browser and in Node, and is no part of the package.
- `scripts/` — the check of the package as a consumer takes it, and of the archive a release puts out, the script that writes the synthetic samples into a folder and the one that packs them for a release, the generator of a module's eval set and the builder of its file, and the script that writes the row's icons, `src/element/icons.ts`, and `NOTICE` from the set of icons the lock file pins: `just icons` runs it, and `just ci` fails if they are not what it writes.
- `demo/` — a page to try the element on by hand, as the app is to have it: it gives the element a language and its task the tools allowed, keeps the writing history as the element tells it and opens the sheet again from it, draws the groups of the strokes and the crop for checking under the sheet, gives the tutor's marks back over the crop Check sent, and shows a workbook's pages in the font and the language it gives, how many boxes are filled, the crop of each filled box Check sent and a mark given back on a box, and a lesson's worked example on a new element, on which nothing is written, whose demo opens part by part — a picture on an area of the sheet on the sheet itself — the page keeping how far it has gone and giving it back to the next element. `just demo` serves it on this machine.
- `vectors/` — the test vectors of the workbook's page layout, which its test writes and keeps current. The vectors of the rules the sheet shares with tutor's eval runner — the groups of strokes, the crop for checking, the snapping of a model's box to the strokes and the rule of boxes — are spec's, from its npm package `@altnovatrail/contracts`, and the tests hold the sheet's code to them.
- `examples/` — synthetic sample files, one of each composition, which the test of `src/eval/` writes and keeps current, and which spec's `sample-check` checks in CI.
- `tasks/` — the file of open tasks of a release of tutor that the synthetic samples answer, as the release has it, with its signature, which spec's `release-verify` checks in CI; and the index of a release of modules, signed too, with the inventory and canonical view of two packages it names: grade-3-math, on which CI writes the samples of a module's eval set, and english-essays, whose essays and choices the tests hold to the digests of their open views that module-kit gives.
- `licenses.json` — the packages the license check accepts by name, each with why.

`just build` builds the package into `lib/`, and `just release-files v0.1.0` writes the files of that release into `dist/` — the package's archive, with NOTICE in it, the synthetic samples' archive and the list of what each shows, the samples page, the generator of a module's eval set, LICENSE and SHA256SUMS — and prints the sums, which a build of the same commit gives again. `just synthetic <folder>` writes the synthetic samples into a folder, one file each, and prints what each shows: no tree holds them. `just synthetic-module <package> <tag> <folder> <task>:<seed>...` writes synthetic samples of a module's eval set, by the same file a release carries, built from the tree: to write what a release's file writes in a module's CI, run that file, or the recipe in a clone of canvas at its tag, with the package that `module-kit build` wrote of the module at the commit the samples go into, the tag of the newest release of modules, and the module's `eval/` folder; it writes `synthetic-<seed>.json` for each task and seed named, writes a seed's file anew only when it is a sample of the same task, and refuses a template, a choice, an essay or a zone, writing nothing then. `just ci` runs the checks CI runs: format, lint and types; the tests in Node and in Chromium; the tests in WebKit and Firefox; advisories; licenses. They run in the devcontainer, whose toolchain stage holds the browsers the tests run in. The license check is spec's recipe, run from the `spec/` submodule with the exceptions in `licenses.json`, so it needs `spec/` checked out: see [CLAUDE.md](CLAUDE.md), Environment.

## Documents

- [docs/architecture.md](docs/architecture.md) — the component: what it does and does not do, its data and links, and what is still to decide.
- [docs/decisions.md](docs/decisions.md) — the decision log: what was decided, why, and what was rejected.
- [docs/sources.md](docs/sources.md) — the records of external facts, each with its source, its date and its quote; [docs/measurements.md](docs/measurements.md) — the results of measurements.
- [RUN.md](RUN.md) — the work plan, in epics; its other tables are in `run/`: the technical debt is [run/DEBT.md](run/DEBT.md), the questions to the author [run/QUESTIONS.md](run/QUESTIONS.md).

The working rules, for people and coding agents alike, are in [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md). The platform's shared vocabulary, formats, contracts and decisions are in [spec](https://github.com/altnovatrail/spec), checked out here as a git submodule: clone this repository with `git clone --recurse-submodules`.
