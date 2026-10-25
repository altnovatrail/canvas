import { expect, test } from "vitest";
import { DEFAULT_GRID, type GridKind, gridPath } from "./grid.js";

/** The subpaths of a path, each from its moveto. */
function subpaths(path: string): string[] {
  return path.split("M").filter((part) => part !== "");
}

test("squares of 50 units rule 19 lines down and 27 across, strictly inside the sheet", () => {
  const parts = subpaths(gridPath({ kind: "squares", step: 50 }));
  const down = parts.filter((part) => part.includes("V"));
  const across = parts.filter((part) => part.includes("H"));
  expect(down).toHaveLength(19);
  expect(across).toHaveLength(27);
  expect(down[0]).toBe("50 0V1400");
  expect(down.at(-1)).toBe("950 0V1400");
  expect(across[0]).toBe("0 50H1000");
  expect(across.at(-1)).toBe("0 1350H1000");
});

test("lines rule only across, and dots stand where the rulings of squares cross", () => {
  const lines = subpaths(gridPath({ kind: "lines", step: 50 }));
  expect(lines).toHaveLength(27);
  expect(lines.every((part) => part.includes("H"))).toBe(true);

  const dots = subpaths(gridPath({ kind: "dots", step: 50 }));
  expect(dots).toHaveLength(19 * 27);
  expect(dots[0]).toBe("50 50h0");
  expect(dots.at(-1)).toBe("950 1350h0");
});

test("a step that does not divide the sheet stops short of its edges, at exact places", () => {
  const sixty = subpaths(gridPath({ kind: "squares", step: 60 }));
  expect(sixty.filter((part) => part.includes("V"))).toHaveLength(16);
  expect(sixty.filter((part) => part.includes("H"))).toHaveLength(23);

  // 37.5 × 3 is 112.5, not 112.49999… from adding the step up.
  const places = subpaths(gridPath({ kind: "lines", step: 37.5 })).map((part) =>
    Number(part.split(" ")[1]?.split("H")[0]),
  );
  expect(places.slice(0, 4)).toEqual([37.5, 75, 112.5, 150]);
  expect(places.at(-1)).toBe(1387.5);

  // A third of 100 units, rounded to a thousandth: none of its lines falls on the edge.
  const third = subpaths(gridPath({ kind: "squares", step: 100 / 3 }));
  expect(third.filter((part) => part.includes("V")).at(-1)).toBe("966.667 0V1400");
  expect(third.some((part) => part.startsWith("1000 "))).toBe(false);
});

test("a sheet without a task is ruled in squares of 50 units, and each kind draws something", () => {
  expect(DEFAULT_GRID).toEqual({ kind: "squares", step: 50 });
  for (const kind of ["squares", "lines", "dots"] satisfies GridKind[]) {
    expect(gridPath({ kind, step: 50 })).not.toBe("");
  }
});
