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

`pnpm test` and `pnpm test:e2e` run `artifacts:init` automatically via `pretest` / `pretest:e2e`.

## Commands

```bash
pnpm test          # Turbo: all package unit tests
pnpm test:e2e      # Playwright smoke (apps/erp)
pnpm artifacts:init
pnpm artifacts:check
pnpm artifacts:reset
```

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

| File | Purpose |
| ---- | ------- |
| `docs/testing/ui-audit-matrix.md` | Governed EUI / design-token audit baseline |

Do **not** create a root `artifacts/` folder — it collides with gitignored `.artifacts/` used by `pnpm artifacts:init`. `pnpm architecture:check` fails if forbidden root paths are tracked.
