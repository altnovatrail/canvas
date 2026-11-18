#!/usr/bin/env bash
# What a run on a runner of macOS left in the background, stopped as soon as its driver is done and
# before its files are kept (R80): the servers of emulators/serve.ts, safaridriver,
# WebDriverAgent's xcodebuild and the simulators. Left running, they kept the runner's cores busy
# through the upload of the artifact, 73 to 150 s for a few megabytes, and through the runner's
# cleanup of orphan processes, 23 to 37 s more. Nothing here fails the job: what is not running is
# not stopped.
#
#   bash emulators/stop.sh
set -uo pipefail

pkill -f 'emulators/serve[.]ts' || true
pkill -x safaridriver || true
pkill -x xcodebuild || true
xcrun simctl shutdown all || true
