// A server that hands the probe's files out the way a release of GitHub does (T74 in RUN.md; R54 in
// docs/decisions.md): as application/octet-stream with Content-Disposition: attachment, which T29
// read from GitHub's own answers. So a browser in an emulator downloads the file, as a volunteer
// does, and no pre-release has to go out for a run:
//
//   node probe/serve.ts <folder> <port>
//
// It serves the files directly in the folder and nothing else: no listing, no subfolder, no path
// that leaves it. It listens on every address, for the emulator reaches the runner through its own
// alias of it.

import { readdirSync, readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { join } from "node:path";

/** What a file goes out with: the headers a release asset of GitHub had in T29. */
export function headers(name: string, length: number): Record<string, string> {
  return {
    "Content-Type": "application/octet-stream",
    "Content-Disposition": `attachment; filename=${name}`,
    "Content-Length": String(length),
    "Cache-Control": "no-store",
  };
}

/** The name a request asks for, or "" when its path does not decode. */
function nameOf(url: string | undefined): string {
  try {
    return decodeURIComponent(new URL(url ?? "/", "http://probe").pathname.slice(1));
  } catch {
    return "";
  }
}

/** A server of the files of a folder, as they are when it starts. */
export function server(folder: string): Server {
  const files = new Map(
    readdirSync(folder, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => [entry.name, readFileSync(join(folder, entry.name))] as const),
  );
  return createServer((request, response) => {
    const name = nameOf(request.url);
    const body = request.method === "GET" ? files.get(name) : undefined;
    if (!body) {
      response.writeHead(404, { "Content-Type": "text/plain" }).end("not found\n");
      return;
    }
    response.writeHead(200, headers(name, body.length)).end(body);
  });
}

if (import.meta.main) {
  const [folder, port, ...rest] = process.argv.slice(2);
  if (!folder || !port || rest.length > 0 || !/^\d+$/.test(port)) {
    console.error("usage: node probe/serve.ts <folder> <port>");
    process.exit(2);
  }
  server(folder).listen(Number(port), () => console.log(`serving ${folder} on port ${port}`));
}
