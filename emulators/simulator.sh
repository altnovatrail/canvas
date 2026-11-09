#!/usr/bin/env bash
# An iPad simulator booted on a runner of macOS, for the probe (T80 in RUN.md) and the samples
# page (T78; R54 in docs/decisions.md): the newest runtime of the iOS version it is given and the
# iPad on it, as emulators/simulator.ts picks them, with the settings SETTINGS names set first. What it booted goes into versions.txt in the
# run's folder, and its id is all it prints:
#
#   udid=$(bash emulators/simulator.sh <name> <iOS version> <folder>)
set -euo pipefail

name=${1:?the name of the simulator}
ios=${2:?the version of the iOS runtime, such as 26.5 or 27}
out=${3:?the folder of the run}
mkdir -p "$out"

device=$(xcrun simctl list devicetypes --json | node emulators/simulator.ts device)
runtime=$(xcrun simctl list runtimes --json | node emulators/simulator.ts runtime "$ios" "$device")
udid=$(xcrun simctl create "$name" "$device" "$runtime")
# Settings the caller names in SETTINGS, "domain:key" each, set true before the first boot, in the
# device's own preferences: it reads them as it starts, and needs no second boot for them.
prefs="$HOME/Library/Developer/CoreSimulator/Devices/$udid/data/Library/Preferences"
for setting in ${SETTINGS:-}; do
  mkdir -p "$prefs"
  defaults write "$prefs/${setting%%:*}" "${setting#*:}" -bool true
done
xcrun simctl boot "$udid"
xcrun simctl bootstatus "$udid" -b > /dev/null
{
  xcodebuild -version
  echo "runtime $runtime"
  echo "device $device"
} > "$out/versions.txt"
echo "$udid"
