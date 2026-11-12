// The reader of the legal texts (T89 in RUN.md; R69 in docs/decisions.md): every vector of reading
// that spec's release file carries gives exactly what it says (section 7 of the legal part's
// README), every text of the file is shown, the file is held to its sum and to the tag spec/ stands
// on, and the sets the build takes — the measurement's and the eval set's in the release of
// v0.15.0, all three in the part for tests (T102).

import { copyFileSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { budget } from "../src/core/budget.fixture.ts";
import { temporary } from "./folders.fixture.ts";
import {
  blocksOf,
  LEGAL_FILE,
  LEGAL_PATH,
  markdownProblem,
  type Part,
  pageSetsOf,
  partIn,
  type Reading,
  readingOf,
  validatorOf,
  withLegalFile,
  yamlOf,
} from "./legal.ts";

/** A case of a vector of reading: a part, perhaps the part before, and what the reader gives. */
interface Case extends Part {
  readonly previous?: Part;
  readonly current?: Extract<Reading, { current: unknown }>["current"];
  readonly refused_by?: string;
  readonly names?: readonly string[];
}

describe("the release file", () => {
  test("is the one ci-licenses verifies, of the tag spec/ and @altnovatrail/spec stand on", () => {
    expect(readFileSync("justfile", "utf8")).toContain(`\nspec_tag := "${LEGAL_FILE.tag}"\n`);
    expect(readFileSync("justfile", "utf8")).toContain(`\nlegal_file := "${LEGAL_FILE.name}"\n`);
    const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
      dependencies: Record<string, string>;
    };
    expect(`v${manifest.dependencies["@altnovatrail/spec"]}`).toBe(LEGAL_FILE.tag);
    expect(LEGAL_PATH).toBe(`tasks/spec-${LEGAL_FILE.tag}/${LEGAL_FILE.name}`);
  });

  test("other than the one release-verify accepted, is refused", () => {
    const dir = temporary("canvas-legal-file");
    const copy = join(dir, LEGAL_FILE.name);
    writeFileSync(copy, Buffer.concat([readFileSync(LEGAL_PATH), Buffer.from(" ")]));
    expect(() => withLegalFile(() => 0, copy)).toThrow("is not the file of its sum");
    const renamed = join(dir, "legal.tar.gz");
    copyFileSync(LEGAL_PATH, renamed);
    expect(() => withLegalFile(() => 0, renamed)).toThrow("named as no file of the legal texts");
  });

  test("gives every vector of reading what the vector says, by the schema and by each rule", {
    timeout: budget(428),
  }, () => {
    const outcomes = new Set<string>();
    let cases = 0;
    withLegalFile((folder, schema) => {
      const validate = validatorOf(schema);
      const vectors = join(folder, "vectors", "reading");
      for (const name of readdirSync(vectors)) {
        const vector = yamlOf(readFileSync(join(vectors, name), "utf8"), name) as {
          cases: Case[];
        };
        for (const each of vector.cases) {
          const got = readingOf(validate, each, each.previous ?? null);
          const want = each.current
            ? { current: each.current }
            : { refused_by: each.refused_by, names: each.names };
          expect(got, `${name}, case ${cases}`).toEqual(want);
          outcomes.add(each.refused_by ?? "accepted");
          cases++;
        }
      }
    });
    expect(cases).toBeGreaterThan(20);
    expect([...outcomes].sort()).toEqual([
      "accepted",
      "legal.files",
      "legal.in-force-unchanged",
      "legal.markdown",
      "legal.set-texts",
      "legal.versions",
      "schema",
    ]);
  });

  test("shows every text it holds, a translation too, and gives the measurement and the eval set their sets in force, the child's session none (T102)", {
    timeout: budget(4_804),
  }, () => {
    withLegalFile((folder, schema) => {
      const part = partIn(folder);
      const reading = readingOf(validatorOf(schema), part);
      if (!("current" in reading)) throw new Error("spec's part is refused");
      // At v0.15.0 the sets of the adults are in force, and the child's is still a draft (R139
      // spec, R141 spec).
      expect(reading.current.sets).toEqual({ measure: 2, "eval-set": 1 });
      expect(Object.keys(part.files)).toContain("texts/privacy-policy/2.ru.md");
      for (const [file, bytes] of Object.entries(part.files)) {
        expect(markdownProblem(bytes), file).toBeNull();
        expect(blocksOf(Buffer.from(bytes).toString("utf8")).length, file).toBeGreaterThan(1);
      }
      const sets = pageSetsOf(folder, schema);
      expect(Object.keys(sets)).toEqual(["measurement", "evalSet"]);
      expect(sets.measurement?.version).toBe("measure-2");
      expect(sets.evalSet?.version).toBe("eval-set-1");
    });
    // It reads all seventeen files twice.
  });
});

describe("the part for tests", () => {
  test("gives every purpose its set, its notice as blocks and its gist in Russian", () => {
    const sets = withLegalFile((_, schema) => pageSetsOf("page/sets/test", schema, "test-"));
    expect(Object.keys(sets)).toEqual(["measurement", "evalSet", "child"]);
    expect(sets.measurement?.version).toBe("test-measure-1");
    expect(sets.evalSet?.version).toBe("test-eval-set-1");
    expect(sets.child?.version).toBe("test-child-sample-1");
    expect(sets.child?.gist).toContain("Тестовый набор, не для образцов");
    expect(sets.measurement?.notice[0]).toEqual({
      heading: 1,
      inline: [{ text: "Test set: the measurement" }],
    });
    // Without its prefix, the part names no set of the page.
    expect(withLegalFile((_, schema) => pageSetsOf("page/sets/test", schema))).toEqual({});
  });

  test("refused by a rule, stops the build", () => {
    const dir = temporary("canvas-legal-part");
    for (const file of ["VERSION", "legal.yaml"]) {
      copyFileSync(join("page/sets/test", file), join(dir, file));
    }
    // No texts/: every version lacks its file.
    expect(() => withLegalFile((_, schema) => pageSetsOf(dir, schema, "test-"))).toThrow(
      /is refused by legal\.files: texts\/test-child-sample-form\/1\.md/,
    );
    writeFileSync(join(dir, "VERSION"), "01\n");
    expect(() => partIn(dir)).toThrow("is no integer from 1 and a newline");
    // A part of another version than its passport's format.
    writeFileSync(join(dir, "VERSION"), "3\n");
    expect(() => partIn(dir)).toThrow("is of format 2, and VERSION says 3");
  });
});

describe("the blocks of a notice", () => {
  test("are of every kind a legal text may hold", () => {
    const markdown = [
      "# Title",
      "",
      "Text **strong** *emphasis* `code`  ",
      "after a break.",
      "",
      "1. one",
      "2. two",
      "",
      "3. three, after a blank line: the same list",
      "",
      "| a | b |",
      "|---|---|",
      "| c | d |",
      "",
      "> quoted",
      "",
      "```",
      "kept as written",
      "```",
      "",
      "---",
    ].join("\n");
    expect(blocksOf(markdown)).toEqual([
      { heading: 1, inline: [{ text: "Title" }] },
      {
        paragraph: [
          { text: "Text " },
          { strong: [{ text: "strong" }] },
          { text: " " },
          { emphasis: [{ text: "emphasis" }] },
          { text: " " },
          { code: "code" },
          { lineBreak: true },
          { text: "after a break." },
        ],
      },
      {
        ordered: true,
        start: 1,
        list: [
          [{ paragraph: [{ text: "one" }] }],
          [{ paragraph: [{ text: "two" }] }],
          [
            {
              paragraph: [{ text: "three, after a blank line: the same list" }],
            },
          ],
        ],
      },
      {
        table: [
          [[{ text: "a" }], [{ text: "b" }]],
          [[{ text: "c" }], [{ text: "d" }]],
        ],
      },
      { quote: [{ paragraph: [{ text: "quoted" }] }] },
      { code: "kept as written" },
      { rule: true },
    ]);
  });

  test("keep an ordered list's first number, as the text writes it", () => {
    expect(blocksOf("Before.\n\n3. three\n4. four")[1]).toMatchObject({ ordered: true, start: 3 });
  });

  test("read the text as CommonMark with GitHub's tables alone: a ~word~ or a [ ] is text", () => {
    expect(blocksOf("about ~30 days, at most ~90 days")).toEqual([
      { paragraph: [{ text: "about ~30 days, at most ~90 days" }] },
    ]);
    expect(blocksOf("- [ ] item")).toEqual([
      { ordered: false, start: 1, list: [[{ paragraph: [{ text: "[ ] item" }] }]] },
    ]);
  });

  test("refuse what the page does not show: a link, HTML", () => {
    expect(() => blocksOf("# T\n\n[a](https://example.org)")).toThrow("link at line 3");
    expect(() => blocksOf("# T\n\n<b>x</b>")).toThrow("html at line 3");
  });
});

describe("YAML", () => {
  test("is read as one document of the Core schema, with no repeated key and no alias", () => {
    expect(yamlOf("a: yes\nb: 0777\n", "x")).toEqual({ a: "yes", b: 777 });
    expect(() => yamlOf("a: 1\na: 2\n", "x")).toThrow("x is not YAML");
    expect(() => yamlOf("a: 1\n---\nb: 2\n", "x")).toThrow("x is not YAML");
    expect(() => yamlOf("a: &x 1\nb: *x\n", "x")).toThrow();
  });
});
