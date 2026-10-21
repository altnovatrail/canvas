// Type-checked by ci-lint and never built: the element runs in a page and sees the DOM, but not
// Node. The type below must be an error. Were the program of the element to see Node, the
// directive over it would go unused, and that would be the error instead.

// @ts-expect-error The element has no Node.
export type NoProcess = typeof process;
