import { icons } from "@iconify-json/material-symbols";
import { expect, test } from "vitest";
import { differences, drawn, type IconSet, module, notice, TABLE } from "./icons.ts";

/** A set of its own: two icons, one of them two paths, an alias, and an icon of a circle. */
const SET: IconSet = {
  prefix: "test",
  width: 24,
  height: 24,
  icons: {
    "a-rounded": { body: '<path fill="currentColor" d="M0 0h1"/>' },
    "a-outline-rounded": {
      body: '<path fill="currentColor" d="M1 1h1"/><path fill="currentColor" d="M2 2h1"/>',
    },
    "b-outline-rounded": { body: '<circle cx="12" cy="12" r="1"/>' },
  },
  aliases: { "c-outline-rounded": { parent: "a-rounded" } },
};

test("an icon is its view box and its filled paths, and an alias's those of the icon it names", () => {
  expect(drawn(SET, "a-outline-rounded")).toEqual({
    viewBox: "0 0 24 24",
    paths: ["M1 1h1", "M2 2h1"],
  });
  expect(drawn(SET, "c-outline-rounded")).toEqual({ viewBox: "0 0 24 24", paths: ["M0 0h1"] });
});

test("a name the set does not have, or an icon of anything but filled paths, stops the script", () => {
  expect(() => drawn(SET, "z-outline-rounded")).toThrow("has no icon z-outline-rounded");
  expect(() => drawn(SET, "b-outline-rounded")).toThrow("is not filled paths alone");
});

test("the module holds each icon a value needs, once: its outline, and its fill where the button shows one", () => {
  const text = module(SET, "9.9.9", {
    a: { base: "a", filled: true, mirrored: true },
    c: { base: "c", filled: false, mirrored: false },
    again: { base: "a", filled: false, mirrored: false },
  });
  expect(text).toContain("from @iconify-json/material-symbols 9.9.9:");
  expect(text).toContain(
    '"a-outline-rounded": {"viewBox":"0 0 24 24","paths":["M1 1h1","M2 2h1"]},',
  );
  expect(text).toContain('"a-rounded": {"viewBox":"0 0 24 24","paths":["M0 0h1"]},');
  expect(text).toContain('"c-outline-rounded": {"viewBox":"0 0 24 24","paths":["M0 0h1"]},');
  expect(text.match(/"a-outline-rounded": \{/g)).toHaveLength(1);
  expect(text).toContain(
    'a: {"outline":"a-outline-rounded","filled":"a-rounded","mirrored":true},',
  );
  expect(text).toContain(
    'c: {"outline":"c-outline-rounded","filled":"c-outline-rounded","mirrored":false},',
  );
});

test("the set package-lock.json pins has every icon of the table, as filled paths", () => {
  for (const [key, value] of Object.entries(TABLE)) {
    expect(() => module(icons, "pinned", { [key]: value }), key).not.toThrow();
  }
});

test("the check names each file that is not what the script writes, a missing one too", () => {
  const there: Record<string, string> = { "src/element/icons.ts": "same" };
  expect(
    differences({ "src/element/icons.ts": "same", NOTICE: "notice" }, (path) => there[path]),
  ).toEqual(["icons: NOTICE is not what scripts/icons.ts writes; run just icons"]);
  there.NOTICE = "edited by hand";
  expect(differences({ NOTICE: "notice" }, (path) => there[path])).toHaveLength(1);
});

test("NOTICE names the set, its author, its license and where it is, and the version embedded", () => {
  const text = notice("1.2.3");
  for (const part of [
    "Material Symbols",
    "Google",
    "Apache License, Version 2.0",
    "https://github.com/google/material-design-icons",
    "@iconify-json/material-symbols 1.2.3",
  ]) {
    expect(text).toContain(part);
  }
});
