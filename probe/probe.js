// The probe of a page opened from a file (T29 in RUN.md; R52 in docs/decisions.md): what the
// samples page's build would meet once a volunteer has downloaded it from a release and opened it
// on a device. probe/build.ts puts this script inline into both files of the probe, one with the
// policy the build would carry and one without it. The report holds only what it may: numbers,
// flags, the browser's string, the file's name without its folders and the probe's version. No
// path, no message of an error, no point of a stroke.

/** The probe's version, in the report and in the keys it stores. */
const PROBE = "1";
/** The addresses the probe asks for: nothing answers on either, and neither leaves the device's own
 * resolver for the internet but the lookup of a name that cannot exist. */
const LOOPBACK = "http://127.0.0.1:4/probe";
const INVALID = "https://probe.invalid/probe";
/** The prefix of the keys the probe stores, one per file name. */
const KEY = "canvas-probe:";
/** How long the probe waits for its requests to end before it calls them settled. */
const SETTLE_MS = 3000;

const file = fileName(location.pathname);

/** The file's name without its folders. A content:// address of Android holds the whole path
 * encoded in its last segment, so the name is cut after decoding, at a slash or a colon; an
 * address that does not decode keeps its last segment as it is. */
function fileName(path) {
  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    // The raw path, cut below.
  }
  return decoded.split(/[/:]/).pop() || "";
}

const report = {
  probe: PROBE,
  file,
  userAgent: navigator.userAgent,
  script: true,
  protocol: location.protocol,
  secureContext: window.isSecureContext,
  coalescedEvents:
    typeof PointerEvent === "function" && "getCoalescedEvents" in PointerEvent.prototype,
  pointers: {},
  requests: {
    fetchLoopback: "pending",
    fetchInvalid: "pending",
    imageLoopback: "pending",
    imageInvalid: "pending",
  },
  violations: {},
  settled: false,
  picture: "pending",
  storage: storageEntries(),
  indexedDB: "pending",
  saves: 0,
};

const shown = document.getElementById("report");
function show() {
  shown.textContent = JSON.stringify(report, null, 2);
}

// A pen or a finger sends a move up to 240 times a second: the report is written once a frame, so
// that writing it does not take the time the moves are counted in.
let drawing = false;
function showSoon() {
  if (drawing) return;
  drawing = true;
  requestAnimationFrame(() => {
    drawing = false;
    show();
  });
}

/** The file names the storage holds a key of, or "unavailable" when the page may not read it. */
function storageEntries() {
  try {
    const names = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(KEY)) names.push(key.slice(KEY.length));
    }
    return names.sort((a, b) => a.localeCompare(b));
  } catch {
    return "unavailable";
  }
}

// A request is blocked when the policy says so in an event of its own; one that fails without it
// failed on the network. The event names the address, so it tells which request it was.
// An event that comes after the requests were settled changes its request's outcome too.
const blocked = new Set();
let results = [];
document.addEventListener("securitypolicyviolation", (event) => {
  const directive = event.effectiveDirective;
  report.violations[directive] = (report.violations[directive] || 0) + 1;
  blocked.add(`${directive} ${event.blockedURI}`);
  settle();
  show();
});

function outcome(directive, address, failed) {
  const host = new URL(address).host;
  for (const entry of blocked) {
    if (entry.startsWith(`${directive} `) && entry.includes(host)) return "blocked";
  }
  return failed ? "failed" : "answered";
}

function ask(name, address) {
  return fetch(address, { cache: "no-store" })
    .then(
      () => false,
      () => true,
    )
    .then((failed) => ["connect-src", name, address, failed]);
}

function load(name, address) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(["img-src", name, address, false]);
    image.onerror = () => resolve(["img-src", name, address, true]);
    image.src = address;
  });
}

const asked = [
  ask("fetchLoopback", LOOPBACK),
  ask("fetchInvalid", INVALID),
  load("imageLoopback", `${LOOPBACK}.png`),
  load("imageInvalid", `${INVALID}.png`),
];
const timeout = new Promise((resolve) => setTimeout(resolve, SETTLE_MS));
/** The outcome of each request that ended; one still pending after the wait has timed out. */
function settle() {
  for (const result of results) {
    if (!result) continue;
    const [directive, name, address, failed] = result;
    report.requests[name] = outcome(directive, address, failed);
  }
  for (const name of Object.keys(report.requests)) {
    if (report.requests[name] === "pending") report.requests[name] = "timeout";
  }
}
// No request rejects: each turns its failure into an outcome, so nothing is left to catch.
void Promise.all(asked.map((request) => Promise.race([request, timeout]))).then((ended) => {
  // The policy's events come after the request has failed: give them a frame or two, and the
  // listener above corrects an outcome whose event comes later still.
  setTimeout(() => {
    results = ended;
    settle();
    report.settled = true;
    show();
  }, 200);
});

// A picture from a blob of the page's own, as the element gets the media of a task (R23).
const picture = document.getElementById("picture");
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="teal"/></svg>';
picture.onload = () => {
  URL.revokeObjectURL(picture.src);
  report.picture = "loaded";
  show();
};
picture.onerror = () => {
  report.picture = "failed";
  show();
};
picture.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));

// IndexedDB, where a page could keep more than the storage takes: only whether it opens.
try {
  const opened = indexedDB.open(`${KEY}${PROBE}`);
  opened.onsuccess = () => {
    opened.result.close();
    report.indexedDB = "opened";
    show();
  };
  opened.onerror = () => {
    report.indexedDB = "failed";
    show();
  };
} catch {
  report.indexedDB = "unavailable";
}

// The pointers, by type: how many events came, the highest pressure and contact size, and how many
// coalesced events the moves carried.
const pad = document.getElementById("pad");
function pointer(event) {
  const type = event.pointerType || "unknown";
  const seen = report.pointers[type] || { events: 0, maxPressure: 0, maxWidth: 0, coalesced: 0 };
  seen.events += 1;
  seen.maxPressure = Math.max(seen.maxPressure, event.pressure);
  seen.maxWidth = Math.max(seen.maxWidth, event.width);
  if (event.type === "pointermove" && report.coalescedEvents) {
    seen.coalesced += event.getCoalescedEvents().length;
  }
  report.pointers[type] = seen;
  showSoon();
}
for (const type of ["pointerdown", "pointermove", "pointerup", "pointercancel"]) {
  pad.addEventListener(type, pointer);
}

document.getElementById("store").addEventListener("click", () => {
  try {
    localStorage.setItem(`${KEY}${file}`, PROBE);
  } catch {
    // The report says "unavailable" below.
  }
  report.storage = storageEntries();
  show();
});

// The report saved as a file, as the samples page saves a sample: a link to a blob of its own.
document.getElementById("save").addEventListener("click", () => {
  report.saves += 1;
  show();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
  );
  link.download = `report-${file.replace(/\.html$/, "")}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  // The download has its own copy once it has begun: a minute is long enough on every browser.
  setTimeout(() => URL.revokeObjectURL(link.href), 60000);
});

document.getElementById("state").textContent = `The page's script ran: probe ${PROBE}, ${file}.`;
show();
