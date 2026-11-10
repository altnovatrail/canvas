#!/usr/bin/env bash
# The samples page's run in the iPad Simulator on a runner of macOS (T78 in RUN.md; R54 in
# docs/decisions.md), with the image's own Xcode: a switch by xcode-select, even to the same
# version, leaves safaridriver without Simulator.app. A fresh iPad simulator of the iOS runtime IOS
# names (emulators/simulator.sh), with Safari's remote automation switched on before its boot;
# then the server of the page, with the watch in it, as pages, safaridriver, and
# emulators/page-ipad.ts. What the run ran on goes into its folder beside what it found.
set -euo pipefail

: "${IOS:?IOS names the version of the iOS runtime, such as 26.5 or 27}"
out=build/page-ipad-$IOS
mkdir -p "$out"

# Each phase of the run with the time it began, in UTC, into the job's log and phases.txt of the
# run's folder: where the minutes before the first session go (T82).
phase() { echo "$(date -u +%H:%M:%S) $*" | tee -a "$out/phases.txt" >&2; }

# The keys of the settings Safari's Develop pane writes, remote inspection and remote automation,
# set before the simulator's one boot; then Safari, launched before safaridriver connects: without
# it, sessions time out "connecting to a Safari instance". Its own window beside the session's
# takes no stroke of the run, which the page's own events draw (emulators/page-ipad.ts; T81).
udid=$(SETTINGS="com.apple.webinspectord:RemoteInspectorEnabled \
    com.apple.webinspectord:RemoteAutomationEnabled \
    com.apple.mobilesafari:WebKitDeveloperExtrasEnabledPreferenceKey \
    com.apple.mobilesafari:RemoteAutomationEnabled" \
  bash emulators/simulator.sh page-ipad "$IOS" "$out")
phase "Safari is launched"
xcrun simctl launch "$udid" com.apple.mobilesafari > /dev/null
sleep 5

phase "the pages' copies with the watch"
page=$(basename build/page/samples-page_v*.html)
# The page with the watch in it before its own script (emulators/watch.ts), served as pages; the
# test build beside it on a port of its own, its server's log in its own run's folder (T22).
node emulators/watch.ts build/page build/page-watched > /dev/null
node emulators/watch.ts build/page-test-served build/page-test-watched > /dev/null
mkdir -p "$out-test"
phase "the servers start"
nohup node emulators/serve.ts build/page-watched 8080 --inline > "$out/server.txt" 2>&1 &
nohup node emulators/serve.ts build/page-test-watched 8081 --inline > "$out-test/server.txt" 2>&1 &
phase "safaridriver is enabled"
sudo safaridriver --enable
phase "safaridriver starts, and the server and it answer"
nohup safaridriver --port 4444 > "$out/safaridriver.txt" 2>&1 &
# Both answer within seconds; the page asked of the server here is the one the driver opens too.
for _ in $(seq 1 30); do
  if curl --silent --fail --max-time 5 http://127.0.0.1:4444/status > /dev/null \
      && curl --silent --fail --max-time 5 --output /dev/null "http://127.0.0.1:8080/$page"; then
    break
  fi
  sleep 1
done
curl --silent --fail --max-time 5 http://127.0.0.1:4444/status > /dev/null

phase "the driver runs"
# Each line of the driver, its session's tries and steps among them, with the time it came.
UDID="$udid" node emulators/page-ipad.ts 2>&1 | while IFS= read -r line; do
  echo "$(date -u +%H:%M:%S) $line" | tee -a "$out/phases.txt"
done
