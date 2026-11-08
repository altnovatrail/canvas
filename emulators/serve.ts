// A server of a folder's files on the runner, for a browser in an emulator or a simulator (T74,
// T78 in RUN.md; R54 in docs/decisions.md). By default it hands them out the way a release of
// GitHub does: as application/octet-stream with Content-Disposition: attachment, which T29 read
// from GitHub's own answers, so the browser downloads the file, as a volunteer does, and no
// pre-release has to go out for a run. With --inline it serves them as pages, the way a hosting of
// the samples page would: the iPad opens no page from a file (В64 in RUN.md), so the simulator's
// Safari opens it from here.
//
//   node emulators/serve.ts <folder> <port> [--inline]
//
// It serves the files directly in the folder and nothing else: no listing, no subfolder, no path
// that leaves it. Each request it is asked goes to the console, a line each — its method, its path
// and the status — for the driver to see what the page asked for. It listens on every address, for
// the emulator reaches the runner through its own alias of it.

import { readdirSync, readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { join } from "node:path";

/** What a file goes out with: the headers a release asset of GitHub had in T29, or a page's. */
export function headers(name: string, length: number, inline = false): Record<string, string> {
  const type: Record<string, string> = inline
    ? { "Content-Type": "text/html; charset=utf-8" }
    : {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename=${name}`,
      };
  return { ...type, "Content-Length": String(length), "Cache-Control": "no-store" };
}

/** The name a request asks for, or "" when its path does not decode. */
function nameOf(url: string | undefined): string {
  try {
    // The path alone, without its query: the name is looked up among the folder's files, so a path
    // that tries to leave the folder names none of them.
    return decodeURIComponent((url ?? "/").split("?")[0]?.slice(1) ?? "");
  } catch {
    return "";
  }
}

/** A line of the server's log: the method, the path as asked — its query cut and anything but
 * the printable ASCII of a path replaced — and the status. */
export function logLine(
  method: string | undefined,
  url: string | undefined,
  status: number,
): string {
  const path = (url ?? "").split("?")[0] ?? "";
  const shown = path.replace(/[^!-~]/g, "?").slice(0, 200) || "/";
  return `${method ?? "?"} ${shown} ${status}`;
}

/** A server of the files of a folder, as they are when it starts; each request it answers goes to
 * the log. */
export function server(
  folder: string,
  { inline = false, log = (_line: string) => {} } = {},
): Server {
  const files = new Map(
    readdirSync(folder, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => [entry.name, readFileSync(join(folder, entry.name))] as const),
  );
  return createServer((request, response) => {
    const name = nameOf(request.url);
    const body = request.method === "GET" ? files.get(name) : undefined;
    log(logLine(request.method, request.url, body ? 200 : 404));
    if (!body) {
      response.writeHead(404, { "Content-Type": "text/plain" }).end("not found\n");
      return;
    }
    response.writeHead(200, headers(name, body.length, inline)).end(body);
  });
}

if (import.meta.main) {
  const [folder, port, ...rest] = process.argv.slice(2);
  const inline = rest.length === 1 && rest[0] === "--inline";
  if (!folder || !port || (rest.length > 0 && !inline) || !/^\d+$/.test(port)) {
    console.error("usage: node emulators/serve.ts <folder> <port> [--inline]");
    process.exit(2);
  }
  server(folder, { inline, log: (line) => console.log(line) }).listen(Number(port), () =>
    console.log(`serving ${folder} on port ${port}${inline ? " as pages" : ""}`),
  );
}
