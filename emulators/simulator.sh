#!/usr/bin/env bash
# An iPad simulator booted on a runner of macOS, for the probe (T80 in RUN.md) and the samples
# page (T78; R54 in docs/decisions.md): the newest runtime of the iOS version it is given and the
# iPad on it, as emulators/simulator.ts picks them, with the settings SETTINGS names set first.
# What it booted goes into versions.txt in the run's folder, the time of each phase into
# phases.txt, and its id is all it prints:
#
#   udid=$(bash emulators/simulator.sh <name> <iOS version> <folder>)
set -euo pipefail

name=${1:?the name of the simulator}
ios=${2:?the version of the iOS runtime, such as 26.5 or 27}
out=${3:?the folder of the run}
mkdir -p "$out"

# Each phase of the run with the time it began, in UTC, into the job's log and phases.txt of the
# run's folder: where the minutes before the first session go (T82).
phase() { echo "$(date -u +%H:%M:%S) $*" | tee -a "$out/phases.txt" >&2; }

phase "the device type and runtime are picked"
device=$(xcrun simctl list devicetypes --json | node emulators/simulator.ts device)
runtime=$(xcrun simctl list runtimes --json | node emulators/simulator.ts runtime "$ios" "$device")
phase "the simulator is created"
udid=$(xcrun simctl create "$name" "$device" "$runtime")
# Settings the caller names in SETTINGS, "domain:key" each, set true before the first boot, in the
# device's own preferences: it reads them as it starts, and needs no second boot for them.
prefs="$HOME/Library/Developer/CoreSimulator/Devices/$udid/data/Library/Preferences"
for setting in ${SETTINGS:-}; do
  mkdir -p "$prefs"
  defaults write "$prefs/${setting%%:*}" "${setting#*:}" -bool true
done
phase "the simulator boots"
xcrun simctl boot "$udid"
phase "the simulator's boot status"
xcrun simctl bootstatus "$udid" -b > /dev/null
phase "the simulator is booted"
# The Xcode's version as `xcodebuild -version` words it, read from the Xcode's own version.plist:
# xcodebuild took 57 s of the job for these two lines (T82).
xcode_plist="$(xcode-select -p)/../version.plist"
xcode_version=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$xcode_plist")
xcode_build=$(/usr/libexec/PlistBuddy -c "Print :ProductBuildVersion" "$xcode_plist")
{
  echo "Xcode $xcode_version"
  echo "Build version $xcode_build"
  echo "runtime $runtime"
  echo "device $device"
} > "$out/versions.txt"
echo "$udid"
