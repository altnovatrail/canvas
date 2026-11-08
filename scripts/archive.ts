// The archive of the synthetic samples in a release, synthetic-samples_v<X.Y.Z>.tar.gz (R50): a
// flat tar of one JSON file to a sample, gzipped, the same bytes for the same files whenever it is
// built in the toolchain stage, since tutor's CI pins its sum (T32 tutor). Written here rather than
// by GNU tar and gzip, whose bytes follow their versions and flags: each file a ustar header with
// the name, size and checksum and nothing of the machine — mode 0644, owner 0, no owner's name,
// time 0 — the names in ascending order, no folder, and gzip with no name and no time. The deflate
// is Node's zlib, which .devcontainer/Dockerfile pins with Node: archive.test.ts pins the bytes of
// a small archive, so a Node whose zlib deflates otherwise fails there before a release.
//
//   node scripts/archive.ts <folder> <archive>
//
// It takes every file of the folder, each a .json file, and refuses a folder that holds anything
// else, or nothing, so that the archive is the set and only the set. Run from the repository's root.

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

/** A file of the archive: its name, with no folder, and its bytes. */
export interface ArchiveFile {
  readonly name: string;
  readonly bytes: Uint8Array;
}

const BLOCK = 512;

/** The ustar archive of the files, by their names ascending, and its two empty blocks at the end. */
export function tarOf(files: readonly ArchiveFile[]): Buffer {
  const sorted = [...files].sort((a, b) => (a.name < b.name ? -1 : Number(a.name > b.name)));
  const parts: Buffer[] = [];
  for (const [n, { name, bytes }] of sorted.entries()) {
    if (n > 0 && sorted[n - 1]?.name === name) throw new Error(`the archive holds ${name} twice`);
    parts.push(headerOf(name, bytes.length), Buffer.from(bytes));
    const rest = bytes.length % BLOCK;
    if (rest > 0) parts.push(Buffer.alloc(BLOCK - rest));
  }
  parts.push(Buffer.alloc(2 * BLOCK));
  return Buffer.concat(parts);
}

/** The ustar header of a file: its name and size, and nothing of where or when it was built. */
function headerOf(name: string, size: number): Buffer {
  const bytes = Buffer.from(name, "utf8");
  if (bytes.length === 0 || bytes.length > 100 || name.includes("/") || name.includes("\0")) {
    throw new Error(`a file of the archive is named by 1 to 100 bytes, with no folder: ${name}`);
  }
  const header = Buffer.alloc(BLOCK);
  bytes.copy(header, 0);
  const octal = (value: number, at: number, width: number) =>
    header.write(`${value.toString(8).padStart(width - 1, "0")}\0`, at, "ascii");
  octal(0o644, 100, 8); // mode
  octal(0, 108, 8); // uid
  octal(0, 116, 8); // gid
  octal(size, 124, 12); // size
  octal(0, 136, 12); // mtime
  header.write("0", 156, "ascii"); // a regular file
  header.write("ustar\0", 257, "ascii");
  header.write("00", 263, "ascii");
  // The checksum: the sum of the header's bytes, its own eight counted as spaces.
  header.fill(" ", 148, 156);
  const sum = header.reduce((total, byte) => total + byte, 0);
  header.write(`${sum.toString(8).padStart(6, "0")}\0 `, 148, "ascii");
  return header;
}

/** The archive gzipped: deflate at level 9, and a header with no name and no time. */
export function gzipOf(tar: Uint8Array): Buffer {
  return gzipSync(tar, { level: 9 });
}

/** The archive of a folder's files, each a .json file: anything else in it, or none, is an error. */
export function archiveOf(folder: string): Buffer {
  const names = readdirSync(folder);
  if (names.length === 0) throw new Error(`${folder} is empty: the archive holds the set`);
  const files = names.map((name) => {
    const path = join(folder, name);
    if (!name.endsWith(".json") || !statSync(path).isFile()) {
      throw new Error(`${path} is no .json file: the archive holds the set alone`);
    }
    return { name, bytes: readFileSync(path) };
  });
  return gzipOf(tarOf(files));
}

if (import.meta.main) {
  const [folder, archive, ...rest] = process.argv.slice(2);
  if (folder === undefined || archive === undefined || rest.length > 0) {
    console.error("usage: node scripts/archive.ts <folder> <archive>");
    process.exit(2);
  }
  writeFileSync(archive, archiveOf(folder));
}
