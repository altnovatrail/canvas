// The choice of the iPad simulator for the probe and the samples page (T80, T78 in RUN.md; R54 in
// docs/decisions.md).

import { expect, test } from "vitest";
import { deviceOf, IPAD, runtimeOf } from "./simulator.ts";

/** A runtime of the list simctl gives, available and running the M5 unless said otherwise. */
function runtime(version: string, { platform = "iOS", isAvailable = true, devices = ["m5"] } = {}) {
  const identifier = `${platform}-${version}`;
  const supportedDeviceTypes = devices.map((id) => ({ identifier: id }));
  return { platform, version, identifier, isAvailable, supportedDeviceTypes };
}

const RUNTIMES = {
  runtimes: [
    ...["26.2", "26.5", "26.5.1", "27.0", "27.10"].map((version) => runtime(version)),
    runtime("27.11", { devices: [] }),
    runtime("27.3", { isAvailable: false }),
    runtime("27.4", { platform: "watchOS" }),
  ],
};

test("a version picks its newest available iOS runtime that runs the device, by the numbers of the version", () => {
  expect(runtimeOf(RUNTIMES, "26.5", "m5")).toBe("iOS-26.5.1");
  expect(runtimeOf(RUNTIMES, "27", "m5")).toBe("iOS-27.10");
  expect(runtimeOf(RUNTIMES, "26.2", "m5")).toBe("iOS-26.2");
  expect(() => runtimeOf(RUNTIMES, "28", "m5")).toThrow("no available iOS runtime 28 for m5");
  expect(() => runtimeOf(RUNTIMES, "27", "m4")).toThrow("no available iOS runtime 27 for m4");
  expect(() => runtimeOf({}, "26", "m5")).toThrow("no available iOS runtime 26");
});

test("the iPad is found by its name among the device types", () => {
  const types = {
    devicetypes: [
      { name: "iPad (A16)", identifier: "a16" },
      { name: IPAD, identifier: "m5" },
    ],
  };
  expect(deviceOf(types, IPAD)).toBe("m5");
  expect(() => deviceOf(types, "iPad Pro 11-inch (M4)")).toThrow("no device type");
});
