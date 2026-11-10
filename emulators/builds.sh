#!/usr/bin/env bash
# The two builds the emulators open (T22 in RUN.md; R65 in docs/decisions.md), from the tree and
# the packages the lock file pins: the release's, as the release builds it, in build/page, and the
# test build, with the part of the legal texts for tests alone (T84, T89; R59, R69), in
# build/page-test, which the workflow keeps as an artifact. Both pages are named by version 0.0.0, which no release
# has; the test build is served from build/page-test-served under a name of its own, for Chrome
# keeps both downloads in one list and opens one by its name.
set -euo pipefail

node scripts/page.ts build/page 0.0.0
node scripts/page.ts build/page-test 0.0.0 --texts page/sets/test
mkdir -p build/page-test-served
cp build/page-test/samples-page_v0.0.0.html build/page-test-served/samples-page_v0.0.0-test.html
