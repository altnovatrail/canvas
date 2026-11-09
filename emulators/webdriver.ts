// A client of W3C WebDriver, for the safaridriver of a runner of macOS (R54 in docs/decisions.md):
// Safari on macOS in the probe (T80 in RUN.md), and Safari in the iPad Simulator for the samples
// page (T78). safaridriver answers on port 4444 of the runner, which the workflow starts it on.

/** safaridriver's address on the runner. */
export const SAFARIDRIVER = "http://127.0.0.1:4444";

/** A path of WebDriver's own words and ids only: an id from an answer can lead nowhere else. */
export function isPath(path: string): boolean {
  return /^\/[\w\-./]*$/.test(path);
}

/** How long a command may take, in milliseconds: a new session connects to Safari, which has
 * taken minutes on a runner; any other command answers within a second or two when the browser
 * does, and one that hung took the whole of a wait of 90 s before the run's second pass (T83). */
export function timeoutOf(method: string, path: string): number {
  if (method === "POST" && path === "/session") return 120_000;
  // A navigation answers once the page has loaded.
  if (method === "POST" && path.endsWith("/url")) return 60_000;
  return 30_000;
}

/** A command slower than this goes into the log, with the time it took. */
const SLOW = 5000;

/** One command of WebDriver, its `value` back; an error names the command and its status. */
export async function command(method: string, path: string, body?: unknown): Promise<unknown> {
  if (!isPath(path)) throw new Error("not a path of WebDriver");
  const start = Date.now();
  const response = await fetch(`${SAFARIDRIVER}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutOf(method, path)),
  }).catch((error: unknown) => {
    // A timeout's own error names no command: this one does, and how long it waited.
    throw new Error(`${method} ${path}: ${String(error)} after ${Date.now() - start} ms`);
  });
  const took = Date.now() - start;
  if (took > SLOW) console.log(`slow: ${method} ${path} ${took} ms`);
  if (!response.ok) {
    // WebDriver's own error and message, which say why: safaridriver's, on the runner.
    const failure = (await response.json().catch(() => ({}))) as {
      value?: { error?: string; message?: string };
    };
    const why = `${failure.value?.error ?? ""} ${failure.value?.message ?? ""}`
      .trim()
      .slice(0, 300);
    throw new Error(`${method} ${path}: ${response.status}${why ? ` ${why}` : ""}`);
  }
  const answer = (await response.json()) as { value?: unknown };
  return answer.value;
}
