// A client of W3C WebDriver, for the safaridriver of a runner of macOS (R54 in docs/decisions.md):
// Safari on macOS in the probe (T80 in RUN.md), and Safari in the iPad Simulator for the samples
// page (T78). safaridriver answers on port 4444 of the runner, which the workflow starts it on.

/** safaridriver's address on the runner. */
export const SAFARIDRIVER = "http://127.0.0.1:4444";

/** A path of WebDriver's own words and ids only: an id from an answer can lead nowhere else. */
export function isPath(path: string): boolean {
  return /^\/[\w\-./]*$/.test(path);
}

/** One command of WebDriver, its `value` back; an error names the command and its status. */
export async function command(method: string, path: string, body?: unknown): Promise<unknown> {
  if (!isPath(path)) throw new Error("not a path of WebDriver");
  const response = await fetch(`${SAFARIDRIVER}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(90_000),
  });
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status}`);
  const answer = (await response.json()) as { value?: unknown };
  return answer.value;
}
