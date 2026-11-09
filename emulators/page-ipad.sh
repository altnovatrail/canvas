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

# The keys of the settings Safari's Develop pane writes, remote inspection and remote automation,
# set before the simulator's one boot. Safari is not launched before safaridriver: the session
# opens Safari itself, in its one window — a window of Safari's own beside it took the taps of
# WebDriver's actions while the session's page stayed hidden (T81).
udid=$(SETTINGS="com.apple.webinspectord:RemoteInspectorEnabled \
    com.apple.webinspectord:RemoteAutomationEnabled \
    com.apple.mobilesafari:WebKitDeveloperExtrasEnabledPreferenceKey \
    com.apple.mobilesafari:RemoteAutomationEnabled" \
  bash emulators/simulator.sh page-ipad "$IOS" "$out")

page=$(basename build/page/samples-page_v*.html)
# The page with the watch in it before its own script (emulators/watch.ts), served as pages.
node emulators/watch.ts build/page build/page-watched > /dev/null
nohup node emulators/serve.ts build/page-watched 8080 --inline > "$out/server.txt" 2>&1 &
sudo safaridriver --enable
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

UDID="$udid" node emulators/page-ipad.ts
