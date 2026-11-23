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

The NovaTrail canvases: the UI package `@altnovatrail/canvas`, which the app builds in at an exact version. It holds the canvas kinds with their layers and tools, captures the learner's strokes with time and pressure, draws the picture of the work that goes to be checked and shows the tutor's marks tied to the learner's strokes. A separate build of it is the samples page, where adult volunteers make samples for eval on the same canvas that learners use; a sample is saved as a file on the device, and nothing goes to the platform's server.

canvas knows no accounts, no api and no subject, and holds no data of its own: nothing on the tutor's layer ever changes the learner's work.

canvas is a component of [NovaTrail](https://github.com/altnovatrail/spec), a universal open platform for adaptive learning, interactive lessons and AI tutoring. Its card is in [spec's architecture](https://github.com/altnovatrail/spec/blob/main/docs/architecture.md#32-canvas--canvases).

- **app** builds the package in and gives it the task and the tutor's marks; app keeps the learner's strokes on the device and sends the picture of the work to api, since canvas itself calls no network.
- **spec** gives it the module format, the element's contract with app and the eval protocol of the sample file.
- **tutor** and **modules** take the samples: tutor's eval runner reads them by the rules it shares with the canvas, and a module's eval set gets them by pull request, with synthetic ones from canvas's generator.

How canvas is built, why, and its plan are in [docs/](docs/README.md).
