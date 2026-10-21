import { describe, expect, test } from "vitest";
import {
  check,
  type Exception,
  exceptions,
  type Lock,
  type LockedPackage,
  main,
  parse,
  satisfies,
} from "./licenses.ts";

// Made-up lock files: the check reads only what these name.
const allowed = ["Apache-2.0", "BSD-3-Clause", "ISC", "MIT"];
const lock = (packages: Record<string, LockedPackage>): Lock => ({
  packages: { "": { name: "made-up", license: "Apache-2.0" }, ...packages },
});
const tool: Exception = { name: "tool", license: "MPL-2.0", reason: "a test", decision: "R0" };
const meets = (expression: string) => satisfies(parse(expression), allowed);

describe("SPDX expressions", () => {
  test("one side of OR is enough, AND needs both, parentheses group", () => {
    expect(meets("MIT")).toBe(true);
    expect(meets("GPL-3.0-only OR MIT")).toBe(true);
    expect(meets("MIT AND ISC")).toBe(true);
    expect(meets("MIT AND GPL-3.0-only")).toBe(false);
    expect(meets("(MIT OR GPL-3.0-only) AND ISC")).toBe(true);
    expect(meets("GPL-3.0-only OR MIT AND MPL-2.0")).toBe(false);
  });

  test("a license with an exception clause is not on the list", () => {
    expect(meets("Apache-2.0 WITH LLVM-exception")).toBe(false);
  });

  test("identifiers match whatever their case, and operators in either case", () => {
    expect(meets("mit")).toBe(true);
    expect(meets("gpl-3.0-only or mit")).toBe(true);
  });

  test("what is not an expression does not parse", () => {
    for (const text of ["SEE LICENSE IN LICENSE", "(MIT", "MIT OR", "MIT WITH", ""]) {
      expect(() => parse(text)).toThrow(SyntaxError);
    }
  });
});

describe("the check", () => {
  test("passes what the list allows, nested packages by their own name", () => {
    const result = check(
      lock({
        "node_modules/a": { version: "1.0.0", license: "MIT" },
        "node_modules/a/node_modules/@s/b": { version: "2.0.0", license: "ISC OR GPL-3.0-only" },
      }),
      allowed,
      [],
    );
    expect(result).toEqual({ problems: [], packages: 2 });
  });

  test("refuses a license outside the list, a missing one and one that does not parse", () => {
    const { problems } = check(
      lock({
        "node_modules/gpl": { version: "1.0.0", license: "GPL-3.0-only" },
        "node_modules/none": { version: "1.0.0" },
        "node_modules/text": { version: "1.0.0", license: "SEE LICENSE IN LICENSE" },
      }),
      allowed,
      [],
    );
    expect(problems).toEqual([
      "gpl@1.0.0: GPL-3.0-only is not on the allowed list",
      "none@1.0.0: no license in the lock file",
      "text@1.0.0: SEE LICENSE IN LICENSE: not an SPDX expression",
    ]);
  });

  test("refuses a lock file that lists no packages", () => {
    const { problems } = check({}, allowed, []);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/lists no packages/);
  });
});

describe("the exceptions", () => {
  const builds = { "tool-linux-x64": "1.0.0", "tool-darwin-arm64": "1.0.0" };

  test("cover the tool and the builds it names, while they are dev and carry its license", () => {
    const { problems } = check(
      lock({
        "node_modules/tool": {
          version: "1.0.0",
          license: "MPL-2.0",
          dev: true,
          optionalDependencies: builds,
        },
        "node_modules/tool-linux-x64": { version: "1.0.0", license: "MPL-2.0", dev: true },
        "node_modules/tool-darwin-arm64": { version: "1.0.0", license: "MPL-2.0", dev: true },
      }),
      allowed,
      [tool],
    );
    expect(problems).toEqual([]);
  });

  test("do not cover a package of a like name that the tool does not name", () => {
    const { problems } = check(
      lock({
        "node_modules/tool": {
          version: "1.0.0",
          license: "MPL-2.0",
          dev: true,
          optionalDependencies: builds,
        },
        "node_modules/tool-plugin": { version: "1.0.0", license: "MPL-2.0", dev: true },
      }),
      allowed,
      [tool],
    );
    expect(problems).toEqual(["tool-plugin@1.0.0: MPL-2.0 is not on the allowed list"]);
  });

  test("do not cover a package that ships, devOptional included", () => {
    const { problems } = check(
      lock({
        "node_modules/tool": { version: "1.0.0", license: "MPL-2.0", optionalDependencies: builds },
        "node_modules/tool-linux-x64": { version: "1.0.0", license: "MPL-2.0", dev: false },
      }),
      allowed,
      [tool],
    );
    expect(problems).toEqual([
      "tool@1.0.0: the exception of R0 is for a tool of development, and the lock file does not mark this package dev",
      "tool-linux-x64@1.0.0: MPL-2.0 is not on the allowed list",
    ]);
  });

  test("leave a package the tool names under another license to the list", () => {
    const { problems } = check(
      lock({
        "node_modules/tool": {
          version: "1.0.0",
          license: "MPL-2.0",
          dev: true,
          optionalDependencies: { "tool-helper": "1.0.0", "tool-gpl": "1.0.0" },
        },
        "node_modules/tool-helper": { version: "1.0.0", license: "MIT", dev: true },
        "node_modules/tool-gpl": { version: "1.0.0", license: "GPL-3.0-only", dev: true },
      }),
      allowed,
      [tool],
    );
    expect(problems).toEqual(["tool-gpl@1.0.0: GPL-3.0-only is not on the allowed list"]);
  });

  test("hold their license: a tool that changed it is read again", () => {
    const { problems } = check(
      lock({ "node_modules/tool": { version: "2.0.0", license: "MIT", dev: true } }),
      allowed,
      [tool],
    );
    expect(problems).toEqual([
      "tool@2.0.0: the exception of R0 expects MPL-2.0, the lock file says MIT",
    ]);
  });

  test("are an error once the lock file no longer has their tool", () => {
    const { problems } = check(lock({}), allowed, [tool]);
    expect(problems).toEqual(["tool: an exception for a package the lock file no longer has (R0)"]);
  });

  test("each names its license, reason and decision", () => {
    for (const exception of exceptions) {
      expect(exception.license).not.toBe("");
      expect(exception.reason).not.toBe("");
      expect(exception.decision).toMatch(/^R\d+$/);
    }
  });
});

describe("main", () => {
  const ok = JSON.stringify(lock({ "node_modules/a": { version: "1.0.0", license: "MIT" } }));

  test("refuses to run without ALLOWED_LICENSES, and says where the list is", () => {
    const lines: string[] = [];
    expect(main({}, ok, (line) => lines.push(line))).toBe(2);
    expect(main({ ALLOWED_LICENSES: " , " }, ok, (line) => lines.push(line))).toBe(2);
    expect(lines[0]).toMatch(/typescript\.yml/);
  });

  test("fails on a problem and passes without one", () => {
    const lines: string[] = [];
    const gpl = JSON.stringify(
      lock({ "node_modules/gpl": { version: "1.0.0", license: "GPL-3.0-only" } }),
    );
    expect(main({ ALLOWED_LICENSES: "MIT" }, gpl, (line) => lines.push(line), [])).toBe(1);
    expect(lines).toEqual([
      "licenses: gpl@1.0.0: GPL-3.0-only is not on the allowed list",
      "licenses: 1 package, 1 problem",
    ]);
    lines.length = 0;
    expect(main({ ALLOWED_LICENSES: "MIT, ISC" }, ok, (line) => lines.push(line), [])).toBe(0);
    expect(lines).toEqual(["licenses: ok — 1 package, 0 exceptions"]);
  });

  test("holds the repository's own exceptions to the lock file", () => {
    const lines: string[] = [];
    expect(main({ ALLOWED_LICENSES: "MIT" }, ok, (line) => lines.push(line))).toBe(1);
    expect(lines[0]).toMatch(
      /^licenses: lightningcss: an exception for a package the lock file no longer has/,
    );
  });
});
