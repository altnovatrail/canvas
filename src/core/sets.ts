/**
 * The sets that strokes join into, pair by pair: union-find, each set known by its root, which is
 * its smallest member. The groups grow in them (R24), and the crop's bundles (R25).
 */
export class Sets {
  readonly #parent: number[];

  constructor(size: number) {
    this.#parent = Array.from({ length: size }, (_, at) => at);
  }

  root(at: number): number {
    let root = at;
    while (this.#parent[root] !== root) root = this.#parent[root] ?? root;
    // Each piece on the way points at the root itself from now on.
    for (let next = at; this.#parent[next] !== root; ) {
      const parent = this.#parent[next] ?? root;
      this.#parent[next] = root;
      next = parent;
    }
    return root;
  }

  join(a: number, b: number): void {
    const rootA = this.root(a);
    const rootB = this.root(b);
    // The smaller root stays: which pair comes first changes no root.
    if (rootA < rootB) this.#parent[rootB] = rootA;
    else if (rootB < rootA) this.#parent[rootA] = rootB;
  }
}
