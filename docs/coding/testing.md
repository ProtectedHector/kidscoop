# Testing and tooling

`npm test` runs two Vitest projects: `convex` (edge runtime, `convex/**/*.test.ts`, `convex-test`)
and `app` (Node, `src/**/*.test.ts`).

- Convex tests use `modules` and `WRITE_TOKEN` from `convex/test.setup.ts`; register components
  (e.g. `rateLimiterTest.register(t)`) before calling functions that use them.
- App tests cover pure `model/` code, `src/lib` helpers and repo-wide checks in `src/test/`.

## Before you finish, check

- [ ] `npm test`, `npm run lint`, `npm run typecheck` and `npm run build` pass.
- [ ] New pure logic has a unit test; new Convex functions have tests including unauthorized cases.
