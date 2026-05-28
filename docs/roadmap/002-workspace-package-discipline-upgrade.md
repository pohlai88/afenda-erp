# TRACK-002 · Workspace Package Discipline Upgrade

**Tracking ID:** `TRACK-002` · **File:** `002-workspace-package-discipline-upgrade.md` · **Status:** Active · **Owner:** Architecture · **Related:** **TRACK-004**, **ARCH-008**

This track implements the package discipline required before large module
migrations such as HRM. Stable rules live in
[ARCH-008](../architecture/008-workspace-package-discipline.md); this file
tracks rollout.

## Milestones

| Milestone | Target outcome                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------- |
| Doctrine  | ARCH-008, ADR-001, architecture index, and agent guide reference the package discipline         |
| Guards    | `pnpm architecture:check` enforces feature export doors, no nested feature workspaces, imports |
| Inventory | Current workspace packages are classified and synced with `apps/erp` transpilation             |
| Migration | HRM uses `@afenda/feature-hr` with internal category folders before considering more packages   |

## Acceptance Criteria

- `pnpm architecture:check` fails on nested feature workspaces unless doctrine
  changes first.
- App workspace dependencies consumed by `apps/erp` are present in
  `afendaTranspilePackages`.
- Feature package clients cannot import server-only packages.
- Architecture docs explain why package boundaries are not Vercel deployment
  boundaries.
- HRM migration work has a clear first target: `@afenda/feature-hr`.

## Open Follow-up

Evaluate Turborepo `boundaries` once the repo is ready to add `turbo boundaries`
to CI. The current guard script remains the canonical enforcement path until
that adoption is explicit.
