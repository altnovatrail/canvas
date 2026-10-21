// Type-checked by ci-lint and never built: the DOM-free part sees neither the DOM nor Node, so that
// it runs the same in both (R05, R07). Each type below must be an error. Were the program of this
// part to see the DOM or Node, the directive over it would go unused, and that would be the error
// instead.

// @ts-expect-error The DOM-free part has no DOM.
export type NoDocument = typeof document;
// @ts-expect-error The DOM-free part has no Node either.
export type NoProcess = typeof process;
