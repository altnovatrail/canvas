#!/usr/bin/env bash
# The script android-emulator-runner runs once the emulator is up (T74 in RUN.md; R54 in
# docs/decisions.md): the action runs each line of its script on its own, so the run is this one
# file. It notes what the SDK installed, forwards Chrome's DevTools socket to port 9222 of the
# runner, and runs probe/android.ts in the toolchain stage's container, on the runner's network,
# with the runner's adb mounted in: the container's own tools stay those the Dockerfile pins, and
# the emulator's adb is the one the action installed.
set -euo pipefail

out=build/probe-android
mkdir -p "$out"
adb="$ANDROID_HOME/platform-tools/adb"

# What the run ran on: the packages of the SDK by their revisions, the system image's among them.
sdkmanager --list_installed > "$out/sdk-installed.txt" 2>&1 || true

"$adb" wait-for-device
"$adb" forward tcp:9222 localabstract:chrome_devtools_remote

docker run --rm --init --network host --user "$(id -u):$(id -g)" \
    --env HOME=/tmp --env CI --env ADB=/adb/adb --env PORT=8080 \
    --volume "$ANDROID_HOME/platform-tools:/adb:ro" \
    --volume "$PWD:/work" --workdir /work \
    toolchain node probe/android.ts
