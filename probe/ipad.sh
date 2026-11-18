#!/usr/bin/env bash
# The iPad's run of the probe on a runner of macOS (R54): an iPad simulator of the iOS runtime IOS
# names, WebDriverAgent started on it — its build for testing from the workflow's cache, or built
# from its tag by the runner's Xcode on a miss (R80) —, then probe/ipad.ts. What the run ran on goes
# into build/probe-ipad beside what it found.
set -euo pipefail

: "${IOS:?IOS names the version of the iOS runtime, such as 26.5 or 27}"
out=build/probe-ipad
mkdir -p "$out"

# WebDriverAgent at its tag, and the tag's commit checked: a moved tag stops the run. The workflow
# keys the cache of its build by this file's sha256 and by the commit, read from this line.
wda_tag=v16.15.3
wda_commit=02cb92f0e93c8b021443bcbb8eeb80932c113220
# The build for testing, which the workflow's cache holds (R80): the .xctestrun file and the apps
# it names, all test-without-building needs, and the commit it was built from.
products=build/wda/Build/Products
runner=com.facebook.WebDriverAgentRunner.xctrunner

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
      echo "$wda_commit" > "$products/commit.txt"
      return 0
    fi
    [[ "$try" -lt 3 ]]
    sleep 30
  done
}

# WebDriverAgent started from a build for testing of the pinned commit, in the background, its log
# into the file named, and whether it answered within ten minutes, by the clock (R54, R80): on a
# loaded runner xcodebuild itself has taken 8 minutes to its first line. One that did not answer
# is stopped, its runner on the simulator too, so that no stale agent holds the port.
start() {
  local log=$1 xctestrun
  [[ "$(cat "$products/commit.txt" 2> /dev/null)" == "$wda_commit" ]] || return 1
  xctestrun=$(find "$products" -maxdepth 1 -name '*.xctestrun' | head -n 1)
  [[ -n "$xctestrun" ]] || return 1
  xcodebuild -xctestrun "$xctestrun" -destination "id=$udid" test-without-building > "$log" 2>&1 &
  local agent=$! until=$((SECONDS + 600))
  while ((SECONDS < until)); do
    curl --silent --fail --max-time 5 http://127.0.0.1:8100/status > /dev/null && return 0
    kill -0 "$agent" 2> /dev/null || break
    sleep 2
  done
  kill "$agent" 2> /dev/null || true
  xcrun simctl terminate "$udid" "$runner" 2> /dev/null || true
  return 1
}

# A build from the cache that does not start is built anew, and its log kept apart. The entry keeps
# its key, and actions/cache saves no other under it: every run reads it again and pays the wait,
# so the warning asks for it to be deleted. build/wda-started tells the workflow that a build of
# this run started, which it then saves.
if [[ -d "$products" ]] && start "$out/wda-cache.txt"; then
  echo "WebDriverAgent's build from the cache" >> "$out/versions.txt"
else
  if [[ -d "$products" ]]; then
    echo "WebDriverAgent's build from the cache did not start: built anew" >> "$out/versions.txt"
    echo "::warning::WebDriverAgent's build from the cache did not start (wda-cache.txt of the artifact); delete its entry, gh cache list --key wda-"
  fi
  build
  start "$out/wda.txt"
  touch build/wda-started
fi

UDID="$udid" node probe/ipad.ts
