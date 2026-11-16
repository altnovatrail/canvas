#!/usr/bin/env bash
# The iPad's run of the probe on a runner of macOS (T80 in RUN.md; R54 in docs/decisions.md): an
# iPad simulator of the iOS runtime IOS names, WebDriverAgent built from its tag by the runner's
# Xcode and started on it, then probe/ipad.ts. What the run ran on goes into build/probe-ipad
# beside what it found.
set -euo pipefail

: "${IOS:?IOS names the version of the iOS runtime, such as 26.5 or 27}"
out=build/probe-ipad
mkdir -p "$out"

# WebDriverAgent at its tag, and the tag's commit checked: a moved tag stops the run. The workflow
# keys the cache of its build by the commit, read from this line.
wda_tag=v16.15.3
wda_commit=02cb92f0e93c8b021443bcbb8eeb80932c113220
# The build for testing, which the workflow's cache holds by the commit and the Xcode's build
# (R80): the .xctestrun file and the apps it names, all test-without-building needs.
products=build/wda/Build/Products

# The newest runtime of the version, and the iPad on it (emulators/simulator.sh).
udid=$(bash emulators/simulator.sh probe-ipad "$IOS" "$out")
echo "WebDriverAgent $wda_tag $wda_commit" >> "$out/versions.txt"

build() {
  rm -rf build/wda-src build/wda
  git clone --quiet --depth 1 --branch "$wda_tag" https://github.com/appium/WebDriverAgent.git build/wda-src
  [[ "$(git -C build/wda-src rev-parse HEAD)" == "$wda_commit" ]]
  # xcodebuild may not yet see a simulator CoreSimulator has just booted ("Unable to find a device
  # matching the provided destination specifier"): it gets three tries, a while apart.
  for try in 1 2 3; do
    if xcodebuild -quiet -project build/wda-src/WebDriverAgent.xcodeproj -scheme WebDriverAgentRunner \
        -destination "id=$udid" -derivedDataPath build/wda build-for-testing; then
      return 0
    fi
    [[ "$try" -lt 3 ]]
    sleep 30
  done
}

# WebDriverAgent started from the build for testing, in the background, and whether it answered
# within four minutes; one that did not is stopped.
start() {
  local xctestrun
  xctestrun=$(find "$products" -maxdepth 1 -name '*.xctestrun' 2> /dev/null | head -n 1)
  [[ -n "$xctestrun" ]] || return 1
  xcodebuild -xctestrun "$xctestrun" -destination "id=$udid" test-without-building > "$out/wda.txt" 2>&1 &
  local agent=$!
  for _ in $(seq 1 120); do
    curl --silent --fail http://127.0.0.1:8100/status > /dev/null && return 0
    kill -0 "$agent" 2> /dev/null || break
    sleep 2
  done
  kill "$agent" 2> /dev/null || true
  return 1
}

# A build from the cache that does not start is built anew: a spoiled entry costs a run its time,
# not its result. build/wda-started tells the workflow that a build of this run started, which it
# then saves.
if start; then
  echo "WebDriverAgent's build from the cache" >> "$out/versions.txt"
else
  # The entry keeps its key and is read by every run: the warning asks for it to be deleted.
  if [[ -d "$products" ]]; then
    echo "WebDriverAgent's build from the cache did not start: built anew" >> "$out/versions.txt"
    echo "::warning::WebDriverAgent's build from the cache did not start; delete its entry wda-$wda_commit-… (gh cache list)"
  fi
  build
  start
  touch build/wda-started
fi

UDID="$udid" node probe/ipad.ts
