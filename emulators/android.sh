#!/usr/bin/env bash
# The script android-emulator-runner runs once the emulator is up (T74, T78 in RUN.md; R54 in
# docs/decisions.md): the action runs each line of its script on its own, so the run is this one
# file, for the driver it names and the folder it leaves its findings in:
#
#   bash emulators/android.sh probe/android.ts build/probe-android
#
# It notes what the SDK installed, forwards Chrome's DevTools socket to port 9222 of the runner,
# and runs the driver in the toolchain stage's container, on the runner's network, with the
# runner's adb mounted in: the container's own tools stay those the Dockerfile pins, and the
# emulator's adb is the one the action installed.
set -euo pipefail

driver=${1:?the driver to run}
out=${2:?the folder of the run}
mkdir -p "$out"
adb="$ANDROID_HOME/platform-tools/adb"

# What the run ran on: the packages of the SDK by their revisions, the system image's among them.
sdkmanager --list_installed > "$out/sdk-installed.txt" 2>&1 || true

"$adb" wait-for-device
"$adb" forward tcp:9222 localabstract:chrome_devtools_remote
# The servers' ports on the emulator's own loopback lead to the runner's.
"$adb" reverse tcp:8080 tcp:8080
# The test build's server, on a port of its own (T22).
"$adb" reverse tcp:8081 tcp:8081

docker run --rm --init --network host --user "$(id -u):$(id -g)" \
    --env HOME=/tmp --env CI --env ADB=/adb/adb --env PORT=8080 --env TEST_PORT=8081 --env GITHUB_STEP_SUMMARY \
    --volume "$ANDROID_HOME/platform-tools:/adb:ro" \
    --volume "$GITHUB_STEP_SUMMARY:$GITHUB_STEP_SUMMARY" \
    --volume "$PWD:/work" --workdir /work \
    toolchain node "$driver"
