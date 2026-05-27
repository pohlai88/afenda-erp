# Afenda architecture & rules routing (injected once per agent session)

Canonical index: `docs/architecture/README.md` (`ARCH-001`–`ARCH-007`).

**When docs conflict:** ARCH-002 (feature packages) → ARCH-001 (runtime) → update the other doc in the same PR.

## Path → rule → doctrine (read only what matches the task)

| If you are editing…                                                 | Cursor rule               | Read first                             |
| ------------------------------------------------------------------- | ------------------------- | -------------------------------------- |
| `apps/erp/**`                                                       | `afenda-erp-app`          | **ARCH-001**, `apps/erp/AGENTS.md`     |
| `packages/db/**`                                                    | `afenda-database`         | **ARCH-005**, **ARCH-002** (ownership) |
| `packages/governed-surface/**` or domain `*surface*` / `*metadata*` | `afenda-governed-ui`      | **ARCH-006**, **ARCH-007**             |
| `packages/features/**`                                              | `afenda-feature-packages` | **ARCH-002**, **ARCH-004**             |
| Monorepo layout, imports, exports, `packages/*` generally           | `afenda-core` (always on) | **ARCH-002**, **ARCH-003**             |
| `docs/architecture/**`                                              | —                         | This README + authority table          |

## Verification (run before finishing when touching…)

| Area                               | Command                                              |
| ---------------------------------- | ---------------------------------------------------- |
| Layout, exports, architecture docs | `pnpm architecture:check`                            |
| Governed renderers / list metadata | `pnpm lint:governed-renderers`                       |
| Drizzle schema                     | `pnpm db:generate` (+ migration review)              |
| App routes / flows                 | `pnpm typecheck`, `pnpm test`, often `pnpm test:e2e` |
| Any substantive change             | `pnpm typecheck`                                     |

## External docs (framework only)

- Versions + Context7 library IDs: `.agents/stack-context.md`
- Prompt with `use context7` for third-party APIs; rule `afenda-external-context`
- MCP: global `context7` + `Neon`; project `shadcn` (see `.cursor/README.md`)

## Non-negotiables (do not re-litigate)

- Tenancy: `organizationId` from server session only.
- One deployable app: `apps/erp` (`@afenda/erp`).
- Module routes: `(app)/[moduleId]/…` only — no per-module route folders unless URL tree differs.
- Governed lists: server windows / `GovernedPatternCListSection` — never ship full datasets for client pagination.
- Feature packages import domain/db/auth/ui — never `apps/erp`.
