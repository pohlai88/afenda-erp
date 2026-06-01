# Testing and artifact retention

## Test source files (committed)

Unit and integration tests live in dedicated workspace test folders:

- `packages/*/tests/unit/**/*.test.ts` (and `packages/ui/tests/unit/**/*.test.tsx`)
- `packages/kernel/tests/gallery/**/*.test.ts`
- `apps/erp/tests/unit/**/*.test.ts`
- `apps/erp/tests/routes/**/*.test.ts`
- `apps/erp/tests/e2e/**/*.spec.ts`

These files are **always tracked in git**. Do not add `*.test.ts` or `tests/` to `.gitignore`.

## Generated artifacts (not committed)

All runner output goes under **`.artifacts/`** at the repo root (gitignored).

| Path                                  | Contents                                            |
| ------------------------------------- | --------------------------------------------------- |
| `.artifacts/coverage/<package>/`      | Vitest coverage (HTML/JSON) per workspace package   |
| `.artifacts/vitest-reports/`          | Vitest blob shards (via `.vitest-reports` junction) |
| `.artifacts/playwright/test-results/` | Playwright traces, screenshots, videos              |
| `.artifacts/playwright/junit.xml`     | Playwright JUnit (CI)                               |
| `.artifacts/playwright/html-report/`  | Playwright HTML report                              |
| `.artifacts/reports/`                 | Ad-hoc test reports                                 |
| `.artifacts/logs/`                    | Ad-hoc test logs                                    |

## Setup

After clone or when Playwright/Vitest paths look wrong:

```bash
pnpm artifacts:init   # create .artifacts/ and the Vitest report junction
pnpm artifacts:check  # fail if generated artifacts drift outside .artifacts/
pnpm artifacts:clean  # remove local generated test artifacts
pnpm artifacts:reset  # clean, then initialize the canonical layout
```

`pnpm test` runs `artifacts:init` automatically via `pretest`. Root-level `pnpm test:e2e*` commands initialize artifacts and rebuild `@afenda/erp` before Playwright starts `next start`, so local runs do not reuse stale production output.

## Commands

```bash
pnpm test              # Turbo: unit tests (packages + apps/erp)
pnpm test:integration  # HR Suite Neon/SQL integration project only
pnpm test:all          # unit + integration
pnpm test:e2e          # Playwright functional E2E (excludes @visual)
pnpm test:e2e:ci       # Full suite incl. @visual — one server boot (CI)
pnpm test:e2e:smoke    # Public + authenticated + dev-auth smoke lanes
pnpm test:e2e:public   # Unauthenticated sign-in/routing smoke only
pnpm test:e2e:auth     # Authenticated smoke via storageState
pnpm test:e2e:hr       # HR critical browser flows
pnpm test:e2e:neon     # Neon Auth smoke (env-gated)
pnpm test:e2e:shard    # Pass -- --shard=1/2 for CI matrix sharding
pnpm test:visual       # @visual only (local iteration)
pnpm artifacts:init
pnpm artifacts:check
pnpm artifacts:reset
```

Playwright does not reuse an existing local server by default. Set `PLAYWRIGHT_REUSE_SERVER=1` only when you intentionally want to target a server you started yourself.

## After a local failure

1. **Unit tests** — open `.artifacts/coverage/<package-name>/index.html` if you ran with coverage enabled.
2. **E2E** — inspect `.artifacts/playwright/test-results/` for traces and screenshots.

## CI

On failure, GitHub Actions uploads:

- **vitest-artifacts** — `.artifacts/` from the quality job
- **playwright-e2e** / **playwright-e2e-neon** — `.artifacts/playwright/` from e2e jobs

Download them from the failed workflow run’s **Artifacts** section (retained 14 days).

## Committed audit baselines (not runner output)

Human-written audit snapshots belong under **`docs/testing/`**, not repo root `artifacts/`:

| File                              | Purpose                                    |
| --------------------------------- | ------------------------------------------ |
| `docs/testing/ui-audit-matrix.md` | Governed EUI / design-token audit baseline |

Do **not** create a root `artifacts/` folder — it collides with gitignored `.artifacts/` used by `pnpm artifacts:init`. `pnpm architecture:check` fails if forbidden root paths are tracked.
