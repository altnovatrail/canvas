// ci-licenses: the license of every package that package-lock.json pins, the tools of development
// too, against ALLOWED_LICENSES (R19 .github; R12 and R14 in docs/decisions.md).
//
//   ALLOWED_LICENSES=0BSD,Apache-2.0,... node scripts/licenses.ts
//
// The list is the one .github's typescript.yml sets for this check in CI: the ASF's Category A as
// SPDX identifiers, one list for every NovaTrail repository (R12 spec). A package outside it
// passes only as a named exception below, and only while it is a tool of development: one that
// never ships and puts none of its own code into what ships (RULES.md, Licenses). The check reads
// the lock file alone, so nothing is installed first, and imports nothing but Node's own modules.

import { readFileSync } from "node:fs";

/** One package of the lock file, as far as the check reads it. */
export type LockedPackage = {
  name?: string;
  version?: string;
  license?: string;
  dev?: boolean;
  link?: boolean;
  optionalDependencies?: Record<string, string>;
};

/** The part of package-lock.json the check reads. */
export type Lock = { packages?: Record<string, LockedPackage> };

/** A tool of development that may carry a license outside the list, and the decision that says so. */
export type Exception = { name: string; license: string; reason: string; decision: string };

/**
 * The named exceptions. Each covers its tool and the builds for each platform that the tool itself
 * names as optional dependencies, when they carry the same license, and only while the lock file
 * marks them dev. An exception the lock file no longer needs is an error: it is read again, not
 * kept.
 */
export const exceptions: readonly Exception[] = [
  {
    name: "lightningcss",
    license: "MPL-2.0",
    reason:
      "Vite's CSS minifier: it comes with vite, which Vitest requires, and puts nothing of its own into the package",
    decision: "R14",
  },
];

/** An SPDX license expression as a tree. */
export type Expression =
  | { id: string; exception?: string }
  | { and: Expression[] }
  | { or: Expression[] };

// Operators are all upper case or all lower case, as in SPDX 3.0.1, Annex B, and as spec's
// licenses-check reads them. AND binds tighter than OR.
const OPERATORS: Record<string, "AND" | "OR" | "WITH"> = {
  AND: "AND",
  and: "AND",
  OR: "OR",
  or: "OR",
  WITH: "WITH",
  with: "WITH",
};

/** Reads an SPDX license expression, or throws a SyntaxError for what is not one. */
export function parse(expression: string): Expression {
  const tokens = (expression.match(/\(|\)|[^\s()]+/g) ?? []).map(
    (token) => OPERATORS[token] ?? token,
  );
  let at = 0;
  const syntax = new Set(["AND", "OR", "WITH", "(", ")"]);

  const anyOf = (): Expression => {
    const parts = [allOf()];
    while (tokens[at] === "OR") {
      at++;
      parts.push(allOf());
    }
    return parts.length === 1 ? (parts[0] as Expression) : { or: parts };
  };
  const allOf = (): Expression => {
    const parts = [one()];
    while (tokens[at] === "AND") {
      at++;
      parts.push(one());
    }
    return parts.length === 1 ? (parts[0] as Expression) : { and: parts };
  };
  const one = (): Expression => {
    const token = tokens[at++];
    if (token === "(") {
      const inside = anyOf();
      if (tokens[at++] !== ")") throw new SyntaxError("an unclosed parenthesis");
      return inside;
    }
    if (token === undefined || syntax.has(token)) throw new SyntaxError("a license expected");
    if (tokens[at] !== "WITH") return { id: token };
    at++;
    const exception = tokens[at++];
    if (exception === undefined || syntax.has(exception))
      throw new SyntaxError("WITH names no exception");
    return { id: token, exception };
  };

  const tree = anyOf();
  if (at !== tokens.length) throw new SyntaxError("not an SPDX expression");
  return tree;
}

/**
 * Whether the allowed licenses alone meet the expression: one side of an OR, both sides of an AND.
 * A license with an exception clause is a license of its own, and the list names none. Identifiers
 * match whatever their case: "License identifiers ... should be matched in a case-insensitive
 * manner" (SPDX 3.0.1, Annex B).
 */
export function satisfies(tree: Expression, allowed: readonly string[]): boolean {
  if ("or" in tree) return tree.or.some((part) => satisfies(part, allowed));
  if ("and" in tree) return tree.and.every((part) => satisfies(part, allowed));
  const id = tree.id.toLowerCase();
  return tree.exception === undefined && allowed.some((license) => license.toLowerCase() === id);
}

// "1 package", "2 packages".
function count(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}

// A package's name from its place in the lock file: node_modules/a/node_modules/@s/b is @s/b.
function nameAt(where: string): string {
  const nested = where.lastIndexOf("node_modules/");
  return nested < 0 ? where : where.slice(nested + "node_modules/".length);
}

/** Every problem with the lock file's licenses, and how many packages it pins. */
export function check(
  lock: Lock,
  allowed: readonly string[],
  named: readonly Exception[] = exceptions,
): { problems: string[]; packages: number } {
  if (lock.packages === undefined) {
    return {
      problems: [
        "package-lock.json lists no packages: lockfileVersion 2 or later lists them, and an older one would pass with nothing checked",
      ],
      packages: 0,
    };
  }
  const packages = Object.entries(lock.packages)
    .filter(([where, entry]) => where !== "" && entry.link !== true)
    .map(([where, entry]) => ({
      name: entry.name ?? nameAt(where),
      id: `${entry.name ?? nameAt(where)}@${entry.version ?? "?"}`,
      license: entry.license,
      dev: entry.dev === true,
      optional: Object.keys(entry.optionalDependencies ?? {}),
    }));

  const problems: string[] = [];
  const tools = new Map<string, Exception>();
  const builds = new Map<string, Exception>();
  for (const exception of named) {
    const found = packages.filter((p) => p.name === exception.name);
    if (found.length === 0) {
      problems.push(
        `${exception.name}: an exception for a package the lock file no longer has (${exception.decision})`,
      );
    }
    for (const tool of found) {
      tools.set(tool.name, exception);
      for (const name of tool.optional) builds.set(name, exception);
    }
  }

  for (const p of packages) {
    // The tool itself is held to its exception: a tool of development, with the license named.
    const exception = tools.get(p.name);
    if (exception !== undefined) {
      if (!p.dev) {
        problems.push(
          `${p.id}: the exception of ${exception.decision} is for a tool of development, and the lock file does not mark this package dev`,
        );
      } else if (p.license !== exception.license) {
        problems.push(
          `${p.id}: the exception of ${exception.decision} expects ${exception.license}, the lock file says ${p.license ?? "nothing"}`,
        );
      }
      continue;
    }
    // A build the tool names is covered when it is the tool's own: dev, with the tool's license.
    // Any other package it names is checked as every package is.
    const tool = builds.get(p.name);
    if (tool !== undefined && p.dev && p.license === tool.license) continue;
    if (p.license === undefined) {
      problems.push(`${p.id}: no license in the lock file`);
      continue;
    }
    let tree: Expression;
    try {
      tree = parse(p.license);
    } catch (error) {
      problems.push(
        `${p.id}: ${p.license}: ${error instanceof Error ? error.message : String(error)}`,
      );
      continue;
    }
    if (!satisfies(tree, allowed))
      problems.push(`${p.id}: ${p.license} is not on the allowed list`);
  }
  return { problems, packages: packages.length };
}

/** Runs the check as ci-licenses does, writing lines to out, and returns the exit status. */
export function main(
  env: Readonly<Record<string, string | undefined>>,
  lockText: string,
  out: (line: string) => void,
  named: readonly Exception[] = exceptions,
): number {
  const allowed = (env.ALLOWED_LICENSES ?? "")
    .split(",")
    .map((license) => license.trim())
    .filter((license) => license !== "");
  if (allowed.length === 0) {
    out(
      "licenses: ALLOWED_LICENSES is not set. CI takes it from .github's typescript.yml; to run the check here, set it to the list there (CLAUDE.md, Environment).",
    );
    return 2;
  }
  const { problems, packages } = check(JSON.parse(lockText) as Lock, allowed, named);
  for (const problem of problems) out(`licenses: ${problem}`);
  if (problems.length > 0) {
    out(`licenses: ${count(packages, "package")}, ${count(problems.length, "problem")}`);
    return 1;
  }
  out(`licenses: ok — ${count(packages, "package")}, ${count(named.length, "exception")}`);
  return 0;
}

if (import.meta.main) {
  const lockText = readFileSync(new URL("../package-lock.json", import.meta.url), "utf8");
  process.exitCode = main(process.env, lockText, (line) => console.log(line));
}
