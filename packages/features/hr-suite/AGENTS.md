# @afenda/feature-hr-suite

Canonical architecture: `docs/architecture/010-hr-feature-package-architecture.md`.
Scaffold default: `pnpm scaffold:hr-slice <category> <capability-slug> <domain-key>`.

If this guide conflicts with ARCH-010, follow ARCH-010 and update this file in
the same change.

## Public doors

- `src/index.ts`
- `src/client.ts`
- `src/server.ts`
- `src/metadata.ts`

## Vertical slices (shipped capabilities)

**Golden path:** run `pnpm scaffold:hr-slice <category> <capability-slug> <domain-key>`
for new scaffold-only slices, then follow ARCH-010 and the reference slice before
moving the slice to `shipped`. Do not restore legacy `@afenda/feature-hr` layouts.

- Cursor rules: `afenda-hr-reference-slice` (pattern), `afenda-hr-feature-vertical` (naming/buckets)
- Checklist: `docs/hr-reference-slice-checklist.md`
- CI guard: `scripts/check-hr-feature-vertical-naming.mts` (`SHIPPED_CAPABILITIES` + reference-slice pattern)
- Scaffold command: `scripts/scaffold-hr-slice.mts`; use `--repair` to fill missing scaffold files without overwriting implementation
- File prefix: `hr.<domain>.*` (e.g. `hr.workforce.compliance.actions.server.ts`); list surfaces in `surface/`, not `data/`
- Lifecycle states: `scaffold-only`, `repair`, `shipped`, `deprecated` (defined in ARCH-010)

## Buckets

Standard buckets live inside each shipped capability slice:

- `src/<category>/<capability>/actions/`
- `src/<category>/<capability>/components/`
- `src/<category>/<capability>/contracts/`
- `src/<category>/<capability>/data/`
- `src/<category>/<capability>/events/`
- `src/<category>/<capability>/policies/`
- `src/<category>/<capability>/schemas/`
- `src/<category>/<capability>/surface/` (governed list surfaces + UI copy)

Do not create root buckets under `src/`. The following are forbidden at HR Suite root: `actions`, `components`, `contracts`, `data`, `events`, `navigation`, `policies`, `schemas`, `surface`, `tests`.

Suite-level integration glue belongs in `src/hr-suite-integration/` and exposes exactly four TypeScript root doors:

- `index.ts` — environment-neutral constants/types only
- `client.ts` — client components only
- `server.ts` — server-only guards/actions only
- `metadata.ts` — metadata-safe navigation/surface exports only

Consumers must import `hr-suite-integration`, `hr-suite-integration/client`, `hr-suite-integration/server`, or `hr-suite-integration/metadata`; do not deep-import its implementation folders.

Allowed integration implementation folders are defined by ARCH-010:
`actions`, `components`, `contracts`, `navigation`, `policies`, and `surface`.
The only non-door integration root file allowed is
`hr-suite-integration-architecture.md`.

## Constraints

- Module components live in the owning capability `components/` bucket, not `apps/erp` or HR Suite root.
- TypeScript schemas live in the owning capability `schemas/` bucket; `@afenda/db` owns SQL and migrations.
- Import public doors only (., ./client, ./server, ./metadata).
- New shared helpers belong in `hr-suite-integration` only when reused by multiple HR slices; one-off slice logic stays inside the owning slice.
