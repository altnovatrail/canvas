// The choice of the iPad simulator for the probe (T80 in RUN.md; R54 in docs/decisions.md): the
// newest available iOS runtime of a version, and the iPad the run is on, from the lists
// `xcrun simctl list --json` gives. probe/ipad.sh asks it:
//
//   xcrun simctl list devicetypes --json | node probe/simulator.ts device
//   xcrun simctl list runtimes --json | node probe/simulator.ts runtime <version> <device>
//
// and it prints the identifier, or fails when the image has none.

/** The iPad the run is on: the newest iPad Pro of both images of the runners. */
export const IPAD = "iPad Pro 13-inch (M5)";

interface Runtime {
  readonly platform?: string;
  readonly version?: string;
  readonly identifier?: string;
  readonly isAvailable?: boolean;
  readonly supportedDeviceTypes?: readonly { identifier?: string }[];
}

/** The identifier of the newest available iOS runtime of a version that runs the device: 26.5
 * picks 26.5 and 26.5.1, 27 picks the newest 27. A runtime that does not list the device is passed
 * over: simctl would refuse it as an incompatible device. */
export function runtimeOf(
  list: { runtimes?: readonly Runtime[] },
  version: string,
  device: string,
): string {
  const found = (list.runtimes ?? [])
    .filter(
      ({ platform, isAvailable, version: v = "", supportedDeviceTypes = [] }) =>
        platform === "iOS" &&
        isAvailable &&
        (v === version || v.startsWith(`${version}.`)) &&
        supportedDeviceTypes.some(({ identifier }) => identifier === device),
    )
    .sort((a, b) => (a.version ?? "").localeCompare(b.version ?? "", "en", { numeric: true }));
  const identifier = found.at(-1)?.identifier;
  if (!identifier) throw new Error(`no available iOS runtime ${version} for ${device}`);
  return identifier;
}

/** The identifier of a device type by its name. */
export function deviceOf(
  list: { devicetypes?: readonly { name?: string; identifier?: string }[] },
  name: string,
): string {
  const identifier = (list.devicetypes ?? []).find((type) => type.name === name)?.identifier;
  if (!identifier) throw new Error(`no device type ${name}`);
  return identifier;
}

async function stdin(): Promise<string> {
  let text = "";
  for await (const chunk of process.stdin) text += chunk;
  return text;
}

if (import.meta.main) {
  const [what, version, device, ...rest] = process.argv.slice(2);
  const list = JSON.parse(await stdin());
  if (what === "runtime" && version && device && rest.length === 0) {
    console.log(runtimeOf(list, version, device));
  } else if (what === "device" && !version) {
    console.log(deviceOf(list, IPAD));
  } else {
    console.error("usage: node probe/simulator.ts device | runtime <version> <device>");
    process.exit(2);
  }
}
