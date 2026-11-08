import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { expect, test } from "vitest";
import { archiveOf, gzipOf, tarOf } from "./archive.ts";
import { temporary } from "./folders.fixture.ts";

const file = (name: string, text: string) => ({ name, bytes: Buffer.from(text) });

/** The entries of a ustar archive as its headers give them, read back field by field. */
function entriesOf(tar: Buffer) {
  const entries = [];
  let at = 0;
  for (;;) {
    const header = tar.subarray(at, at + 512);
    if (header.every((byte) => byte === 0)) break;
    const text = (from: number, width: number) =>
      header.toString("ascii", from, from + width).replace(/\0.*$/s, "");
    const number = (from: number, width: number) => Number.parseInt(text(from, width), 8);
    const counted = header.reduce((total, byte, k) => total + (k >= 148 && k < 156 ? 32 : byte), 0);
    const size = number(124, 12);
    entries.push({
      name: header.toString("utf8", 0, 100).replace(/\0.*$/s, ""),
      mode: number(100, 8),
      uid: number(108, 8),
      gid: number(116, 8),
      size,
      mtime: number(136, 12),
      type: text(156, 1),
      magic: header.toString("ascii", 257, 265),
      owners: text(265, 64),
      checksum: number(148, 8) === counted,
      bytes: tar.subarray(at + 512, at + 512 + size),
    });
    at += 512 + Math.ceil(size / 512) * 512;
  }
  // What is left is the two empty blocks of the end, and no more.
  expect(tar.length - at).toBe(1024);
  expect(tar.subarray(at).every((byte) => byte === 0)).toBe(true);
  return entries;
}

test("an archive of the same files is the same bytes, whatever order they came in", () => {
  const files = [file("b.json", "{}\n"), file("a.json", "x".repeat(600)), file("c.json", "")];
  const archive = gzipOf(tarOf(files));
  expect(gzipOf(tarOf([...files].reverse()))).toEqual(archive);
  const entries = entriesOf(gunzipSync(archive));
  expect(entries.map(({ name }) => name)).toEqual(["a.json", "b.json", "c.json"]);
  for (const entry of entries) {
    expect(entry).toMatchObject({ mode: 0o644, uid: 0, gid: 0, mtime: 0, type: "0", owners: "" });
    expect(entry.magic).toBe("ustar\u000000");
    expect(entry.checksum).toBe(true);
    expect(entry.bytes).toEqual(files.find(({ name }) => name === entry.name)?.bytes);
  }
  // The bytes themselves: a Node whose zlib deflates otherwise changes the sum tutor's CI pins of
  // the release's archive, and fails here first.
  expect(createHash("sha256").update(archive).digest("hex")).toBe(
    "f589552f16f8ae5fef41ca1da5ae9034d5862bb98a84327a0d7275f111cc7081",
  );
});

test("its gzip names no file and no time", () => {
  const archive = gzipOf(tarOf([file("a.json", "{}")]));
  // ID1, ID2, deflate; no flags (no FNAME); a time of 0; the best compression; Unix.
  expect([...archive.subarray(0, 10)]).toEqual([0x1f, 0x8b, 8, 0, 0, 0, 0, 0, 2, 3]);
});

test("a name with a folder, too long, empty or given twice is refused", () => {
  expect(() => tarOf([file("set/a.json", "")])).toThrow("no folder");
  expect(() => tarOf([file(`${"a".repeat(96)}.json`, "")])).toThrow("1 to 100 bytes");
  expect(() => tarOf([file("", "")])).toThrow("1 to 100 bytes");
  expect(() => tarOf([file("a.json", ""), file("a.json", "")])).toThrow("twice");
});

test("a folder that holds nothing, or anything but .json files, is refused", () => {
  const folder = temporary("archive");
  expect(() => archiveOf(folder)).toThrow("is empty");
  writeFileSync(join(folder, "a.json"), "{}");
  writeFileSync(join(folder, "notes.txt"), "");
  expect(() => archiveOf(folder)).toThrow("no .json file");
  rmSync(join(folder, "notes.txt"));
  mkdirSync(join(folder, "b.json"));
  expect(() => archiveOf(folder)).toThrow("no .json file");
});

test("an archive of sample files holds each as written, and GNU tar reads it", () => {
  // The examples of src/eval/, one of each composition: the set's files are of the same kind.
  const folder = join(temporary("archive"), "set");
  cpSync("examples", folder, { recursive: true });
  const archive = archiveOf(folder);
  const names = readdirSync(folder).sort();
  const entries = entriesOf(gunzipSync(archive));
  expect(entries.map(({ name }) => name)).toEqual(names);
  for (const entry of entries) {
    expect(entry.bytes.equals(readFileSync(join(folder, entry.name)))).toBe(true);
  }
  const path = join(folder, "..", "set.tar.gz");
  writeFileSync(path, archive);
  const listed = execFileSync("tar", ["-tzf", path], { encoding: "utf8" });
  expect(listed.trim().split("\n")).toEqual(names);
});
