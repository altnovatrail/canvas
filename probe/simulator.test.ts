// The choice of the iPad simulator for the probe (T80 in RUN.md; R54 in docs/decisions.md).

import { expect, test } from "vitest";
import { deviceOf, IPAD, runtimeOf } from "./simulator.ts";

const RUNTIMES = {
  runtimes: [
    { platform: "iOS", version: "26.2", identifier: "ios-26-2", isAvailable: true },
    { platform: "iOS", version: "26.5", identifier: "ios-26-5", isAvailable: true },
    { platform: "iOS", version: "26.5.1", identifier: "ios-26-5-1", isAvailable: true },
    { platform: "iOS", version: "27.0", identifier: "ios-27-0", isAvailable: true },
    { platform: "iOS", version: "27.10", identifier: "ios-27-10", isAvailable: true },
    { platform: "iOS", version: "27.2", identifier: "ios-27-2", isAvailable: true },
    { platform: "iOS", version: "27.3", identifier: "ios-27-3", isAvailable: false },
    { platform: "watchOS", version: "27.4", identifier: "watch-27-4", isAvailable: true },
  ],
};

test("a version picks its newest available iOS runtime, by the numbers of the version", () => {
  expect(runtimeOf(RUNTIMES, "26.5")).toBe("ios-26-5-1");
  expect(runtimeOf(RUNTIMES, "27")).toBe("ios-27-10");
  expect(runtimeOf(RUNTIMES, "26.2")).toBe("ios-26-2");
  expect(() => runtimeOf(RUNTIMES, "28")).toThrow("no available iOS runtime 28");
  expect(() => runtimeOf({}, "26")).toThrow("no available iOS runtime 26");
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
