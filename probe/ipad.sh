#!/usr/bin/env bash
# The iPad's run of the probe on a runner of macOS (T80 in RUN.md; R54 in docs/decisions.md): an
# iPad simulator of the iOS runtime IOS names, WebDriverAgent built from its tag by the runner's
# Xcode and started on it, then probe/ipad.ts. What the run ran on goes into build/probe-ipad
# beside what it found.
set -euo pipefail

: "${IOS:?IOS names the version of the iOS runtime, such as 26.5 or 27}"
out=build/probe-ipad
mkdir -p "$out"

# WebDriverAgent at its tag, and the tag's commit checked: a moved tag stops the run.
wda_tag=v16.15.3
wda_commit=02cb92f0e93c8b021443bcbb8eeb80932c113220
git clone --quiet --depth 1 --branch "$wda_tag" https://github.com/appium/WebDriverAgent.git build/wda-src
[[ "$(git -C build/wda-src rev-parse HEAD)" == "$wda_commit" ]]

# The newest runtime of the version, and the iPad on it (emulators/simulator.sh).
udid=$(bash emulators/simulator.sh probe-ipad "$IOS" "$out")
echo "WebDriverAgent $wda_tag $wda_commit" >> "$out/versions.txt"

# xcodebuild may not yet see a simulator CoreSimulator has just booted ("Unable to find a device
# matching the provided destination specifier"): it gets three tries, a while apart.
for try in 1 2 3; do
  if xcodebuild -quiet -project build/wda-src/WebDriverAgent.xcodeproj -scheme WebDriverAgentRunner \
      -destination "id=$udid" -derivedDataPath build/wda build-for-testing; then
    break
  fi
  [[ "$try" -lt 3 ]]
  sleep 30
done
xcodebuild -project build/wda-src/WebDriverAgent.xcodeproj -scheme WebDriverAgentRunner \
    -destination "id=$udid" -derivedDataPath build/wda test-without-building > "$out/wda.txt" 2>&1 &
for _ in $(seq 1 120); do
  curl --silent --fail http://127.0.0.1:8100/status > /dev/null && break
  sleep 2
done
curl --silent --fail http://127.0.0.1:8100/status > /dev/null

UDID="$udid" node probe/ipad.ts
