// The time a test may take before Vitest fails it (R75 in docs/decisions.md). A test or hook gets a
// timeout of its own, twenty times its time on a free CI runner rounded up to whole tens of
// seconds, once that is longer than its project's default: 5 s for a test and 10 s for a hook in
// Node, 15 s and 30 s in the browser. The test names only its time, so that the rule stays in one
// place. A test's time is its own line in the log of a green run of "TypeScript / test", where the
// coverage is on and the browsers of the other projects run beside the node project: Vitest gives
// a test a line once it takes 300 ms. A hook has no line there, and its time is its file's line
// less the lines of the file's tests. Twenty times is what a loaded host takes of it: in the
// container at a load average of 42 to 85 on 20 cores, app's path in consumer.test.ts went past
// 15 s, eighteen times its runner's time. The timeout is the test's own, not the project's, so that
// a test slowed by mistake twentyfold still fails (T62 in docs/plan/E7.md). A module of the tests
// alone: the build leaves it out (tsconfig.build.json).

/** The timeout of a test that takes `runner` milliseconds on a free CI runner: twenty times that,
 * in whole tens of seconds. */
export function budget(runner: number): number {
  return Math.ceil((runner * 20) / 10_000) * 10_000;
}
