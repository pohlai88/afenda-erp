# Afenda architecture & rules routing (injected once per agent session)

Canonical index: `docs/architecture/README.md` (`ARCH-001`–`ARCH-011`; **ARCH-012** reserved).

**When docs conflict:** ARCH-002 (features-first; execution §5) → ARCH-001 (runtime) → update the other doc in the same PR. **ARCH-011** + **ARCH-002** §§4–5 move together for System Admin vs execution enforcement.

**Architecture docs:** never delete paths containing `architecture` — edit and link (rule `afenda-architecture-docs`; hook `guard-architecture-docs.mjs`).

**Drift enforcement (automatic — do not ask the user to run pnpm):**

- `preToolUse` → `guard-kernel-boundary-imports.mjs` blocks `@afenda/feature-*` imports in `packages/kernel/`.
- `postToolUse` → `enforce-architecture-drift.mjs` runs `scripts/enforce-architecture-drift.mts` for the edited path (kernel tests, `architecture:check`, schema journal).
- CI runs the same guards on push/PR.

## Path → rule → doctrine (read only what matches the task)

| If you are editing…                                                 | Cursor rule               | Read first                             |
| ------------------------------------------------------------------- | ------------------------- | -------------------------------------- |
| `apps/erp/**` (routes, handlers)                                    | `afenda-erp-app`          | **ARCH-001**, `AGENTS.md` (root)       |
| `apps/erp/src/workspace-routes/**`                                  | `afenda-erp-app`          | **ARCH-001** §route composition        |
| `apps/erp/src/lib/system-admin-sections/**`                         | `afenda-system-admin`     | **ARCH-011**, **ARCH-002** §§4–5       |
| `packages/features/system-admin/**`                                 | `afenda-system-admin`     | **ARCH-011** (+ domain supplement)     |
| `packages/features/knowledge/**`, `lynx/**`, `api/lynx/**`        | `afenda-lynx-knowledge`   | **ARCH-009**                           |
| `packages/db/**`                                                    | `afenda-database`         | **ARCH-005**, **ARCH-002** (ownership) |
| `packages/governed-surface/**` or domain `*surface*` / `*metadata*` | `afenda-governed-ui`      | **ARCH-006**, **ARCH-007**             |
| `packages/features/**` (other modules)                            | `afenda-feature-packages` | **ARCH-008**, **ARCH-002**, **ARCH-004** |
| `packages/features/hr-suite/src/**/employee-management/**`      | `afenda-hr-reference-slice` | **ARCH-010**, compliance golden slice + `docs/hr-reference-slice-checklist.md` |
| `apps/erp/src/lib/hr-sections/**`                                 | `afenda-hr-reference-slice` | **ARCH-001** thin adapters only |
| `packages/kernel/src/execution-kernel/**`                           | `afenda-core`             | **ARCH-002** §5, **ARCH-011** (boundary) |
| `packages/config/src/next.ts` (transpile list)                      | `afenda-core`             | **ARCH-008** (app ↔ transpile sync)    |
| `scripts/check-directory-architecture.mts`                          | —                         | **ARCH-003**, **ARCH-008**             |
| Monorepo layout, imports, exports, `packages/*` generally           | `afenda-core` (always on) | **ARCH-008**, **ARCH-002**, **ARCH-003** |
| `docs/architecture/**` or `*architecture*.md`                       | `afenda-architecture-docs`| This README + authority table          |

## Verification (run before finishing when touching…)

| Area                               | Command                                              |
| ---------------------------------- | ---------------------------------------------------- |
| Layout, exports, architecture docs | `pnpm architecture:check`                            |
| Governed renderers / list metadata | `pnpm lint:governed-renderers`                       |
| Drizzle schema                     | `pnpm db:generate` → review SQL → `pnpm db:migrate` (no hand-written `drizzle/*.sql`) |
| System Admin surfaces / actions    | `pnpm test --filter=@afenda/feature-system-admin`    |
| App routes / flows                 | `pnpm typecheck`, `pnpm test`, often `pnpm test:e2e` |
| Any substantive change             | `pnpm typecheck`                                     |

## External docs (framework only)

- Versions + Context7 library IDs: `.agents/stack-context.md`
- Prompt with `use context7` for third-party APIs; rule `afenda-external-context`
- MCP: global `context7` + `Neon`; project `shadcn` + **next-devtools** (`init` at session start for Next.js — see `afenda-erp-app`)

## Non-negotiables (do not re-litigate)

- Tenancy: `organizationId` from server session only.
- One deployable app: `apps/erp` (`@afenda/erp`).
- Module routes: `(workspace)/[moduleId]/…` only — composition in `workspace-routes/`; System Admin sections via `[...section]` + `system-admin-sections/`; no per-module route folders unless URL tree differs.
- Governed lists: server windows / `GovernedPatternCListSection` — never ship full datasets for client pagination.
- Feature packages: flat `packages/features/<moduleId>`; public doors `.` / `./client` / `./server` / `./metadata` only; never import `apps/erp`; `./client` stays server-graph-free.
- App workspace deps ↔ `afendaTranspilePackages` must stay in sync (`pnpm architecture:check`).
- Database schema: `packages/db/src/schema` → `pnpm db:generate` → `pnpm db:migrate` — no agent-authored DDL in `drizzle/*.sql` or live SQL unless the user explicitly requires it (rule `afenda-database-migrations`).
- Architecture docs: preserve all `*architecture*` paths — update in place; do not delete without explicit user authorization.
