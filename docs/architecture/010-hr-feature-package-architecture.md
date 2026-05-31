# ARCH-010 - HR feature package architecture

**Doc ID:** `ARCH-010`

**File:** `010-hr-feature-package-architecture.md`

| Field | Value |
| ----- | ----- |
| Status | Active HR Suite foundation architecture |
| Package | `@afenda/feature-hr-suite` (`packages/features/hr-suite`, moduleId `hr`) |
| Track | TRACK-004 (`docs/roadmap/004-hrm-migration.md`) |
| Related | **ARCH-002**, **ARCH-005**, **ARCH-006**, **ARCH-007**, **ARCH-008** |

This document is the canonical architecture contract for HR Suite package
shape, integration glue, slice lifecycle, scaffold expectations, and validation
gates. When package-local docs, agent rules, or implementation plans disagree
with this file, update the conflicting document in the same change and follow
ARCH-010.

## Purpose

`@afenda/feature-hr-suite` is the single HR feature package. It may contain many
internal HR categories and capability slices, but it remains one workspace
package and one public package API. The deployable Next.js app composes HR
routes through thin adapters; durable HR behavior belongs in this package or in
platform packages such as `@afenda/db`, `@afenda/auth`, and `@afenda/kernel`.

This architecture exists to prevent recurring HR migration drift:

- root-level dumping into generic folders such as `components/` or `policies/`;
- deep imports into suite integration internals;
- repeated list, permission, action-result, and search-param helper patterns;
- scaffold-only folders being counted as shipped functionality;
- new HR modules inheriting unclear typecheck and export failures.

## Boundaries

| Layer | Owner | Rule |
| ----- | ----- | ---- |
| ERP `/hr` routes | `apps/erp` | Thin App Router adapters only: session, organization, capability checks, search params, composition. |
| HR product package | `packages/features/hr-suite` | HR commands, queries, policies, schemas, metadata, governed surfaces, server/client slice doors. |
| HR suite integration | `packages/features/hr-suite/src/hr-suite-integration` | Package-internal shared glue used by multiple HR slices. It is not a public package subpath. |
| Shared ERP contracts | `@afenda/kernel` | Module registry, execution context, capability enforcement, generic compatibility contracts. |
| Auth and permissions | `@afenda/auth`, `@afenda/kernel`, `@afenda/db` seed scripts | Capability names, execution permission checks, seed catalog. |
| Physical schema | `@afenda/db` | Drizzle tables, migrations, durable command/query primitives. Feature slices do not own SQL migrations. |
| Governed UI runtime | `@afenda/governed-surface`, `@afenda/ui` | Metadata schema, renderer contracts, UI primitives. Feature slices declare intent and server windows. |

Legacy HRM trees must not be restored. New HR work lands only in
`@afenda/feature-hr-suite` with database ownership in `@afenda/db` per
ARCH-005.

## Public Package Doors

The package exposes only these public subpaths:

| Export | Purpose |
| ------ | ------- |
| `@afenda/feature-hr-suite` | Environment-neutral package barrel. No server-only graph. |
| `@afenda/feature-hr-suite/client` | Client components and browser-safe catalogs only. |
| `@afenda/feature-hr-suite/server` | Server components, actions, guards, queries, and Node-only code. |
| `@afenda/feature-hr-suite/metadata` | Metadata-safe surface keys, UI copy, search-param parsing, registry facts. |

Do not add `@afenda/feature-hr-suite/hr-suite-integration` or other public
subpaths. `hr-suite-integration` is source organization inside the package, not
an external API.

Client doors must not import `@afenda/db`, `@afenda/ai`, `@afenda/workflows`,
`@afenda/auth/server`, `@afenda/kernel/server`, `server-only`, or Node built-ins.
The package-level `src/server.ts` remains the server-only marker and imports
`@afenda/kernel/server`.

## Allowed Source Root Shape

`packages/features/hr-suite/src/` may contain only package public doors,
approved HR category folders, and suite integration glue.

```txt
packages/features/hr-suite/src/
  index.ts
  client.ts
  server.ts
  metadata.ts
  hr-suite-integration/
  employee-management/
  payroll-compensation/
  talent-management/
  time-attendance/
  industry-specific/
```

The following root buckets are forbidden under `src/`:

```txt
actions/
components/
contracts/
data/
events/
navigation/
policies/
schemas/
surface/
tests/
```

Capability code belongs under `src/<category>/<capability-slug>/`. Shared
suite-level glue belongs under `src/hr-suite-integration/`. Tests belong either
inside a shipped slice test bucket when the slice owns them or under the package
test tree configured by Vitest.

## HR Suite Integration Contract

`src/hr-suite-integration/` centralizes package-internal glue that is reused by
multiple HR slices. It must expose exactly four TypeScript root door files:

| Door | May export |
| ---- | ---------- |
| `index.ts` | Environment-neutral constants, types, helper functions, permission descriptors, and contracts. |
| `client.ts` | Client components only. |
| `server.ts` | Server-only guards, server actions, and server helpers only. |
| `metadata.ts` | Metadata-safe navigation, surface registries, search-param helpers, and UI copy only. |

Allowed implementation folders inside `hr-suite-integration/`:

```txt
actions/
components/
contracts/
navigation/
policies/
surface/
```

The only non-door root file allowed in this directory is the local architecture
document `hr-suite-integration-architecture.md`.

No other implementation folder is allowed unless this document and the guard
script change together. Consumers outside `hr-suite-integration/` must import
through one of the four doors and must not deep-import implementation folders.

## Shared Helper Policy

Shared helpers may move into `hr-suite-integration` only when at least two HR
slices use the same pattern or a new scaffold would otherwise copy the same
boilerplate. Keep helpers small, typed, and environment-correct.

Allowed shared helper families:

- governed list-surface builders for standard Pattern C HR lists;
- list-window and pagination contracts for bounded server windows;
- ERP permission descriptor builders such as `{ module, object, function }`;
- list search-toolbar builders and search-param registry helpers;
- trailing-action helpers that return governed renderer-compatible descriptors;
- generic `ActionResult<T>` failure mappers so data-returning actions do not
  collapse to `ActionResult<void>`;
- metadata-safe HR navigation constants and resolvers;
- server-only HR access guards that centralize execution context shape.

Not allowed:

- slice-specific business rules;
- DB command/query implementations;
- durable workflow state;
- one-off UI copy;
- catch-all `utils`, `helpers`, `common`, `shared`, or `internal` folders.

## Slice Layout

Every capability slice uses this shape once it moves beyond architecture-only
planning:

```txt
src/<category>/<capability-slug>/
  <capability-slug>-architecture.md
  index.ts
  client.ts
  server.ts
  metadata.ts
  actions/
  components/
  contracts/
  data/
  events/
  policies/
  schemas/
  surface/
```

Slice doors follow the package-door model:

| Door | May export |
| ---- | ---------- |
| `index.ts` | Neutral contracts, metadata-safe exports, and client-safe exports only. |
| `client.ts` | Browser-safe components and catalogs only. |
| `server.ts` | Actions, policies, data loaders, events, schemas, contracts, and server components. |
| `metadata.ts` | Surface keys, columns registry, UI copy, search-param parsing, and page-model input adapters. |

List surfaces and UI copy live in `surface/`, not `data/`. Tenant reads and
mutations live behind server doors. App routes import public package doors, not
deep implementation files.

## Slice Lifecycle

Every HR slice is in exactly one lifecycle state.

| State | Meaning | Gate |
| ----- | ------- | ---- |
| `scaffold-only` | Folders and placeholders exist, but no requirement is claimed complete. | May be generated; not listed in shipped capability guards. |
| `repair` | Existing slice has implementation but does not meet current architecture/typecheck quality. | Fix in a directory-specific pass before adding new behavior. |
| `shipped` | Requirements have code, governed surfaces, access controls, tests, and as-built docs. | Add to shipped guard list and pass slice validation. |
| `deprecated` | Replaced or intentionally retired behavior remains only for compatibility. | Document replacement path and remove from new scaffold targets. |

Scaffold-only files, TODOs, empty barrels, mock stores, demo data, and
documentation-only changes do not count as shipped HR functionality.

## HR Scaffold Contract

Future scaffold command:

```bash
pnpm scaffold:hr-slice <category> <capability-slug> <domain-key>
```

Example:

```bash
pnpm scaffold:hr-slice talent-management succession-planning hr.talent.succession
```

The command must:

- validate that `<category>` is one of the approved HR root categories;
- validate kebab-case capability slugs and `hr.<domain>.<capability>` domain keys;
- create the standard slice folders and four slice doors;
- create skeleton policy, schema, contract, event, page-model, surface metadata,
  UI copy, section component, server action, and architecture files;
- create focused test skeletons for acceptance coverage, search params, and list
  EUI contract;
- create an architecture file with an `## As-built summary` section that starts
  as `Not shipped`;
- support repair mode that fills missing scaffold files without overwriting
  existing implementation.

The scaffold command must not:

- add a slice to `SHIPPED_CAPABILITIES`;
- wire routes into `apps/erp`;
- create DB schema or migrations;
- seed permissions;
- claim requirement coverage.

## Validation Gates

Use the smallest gate that matches the change.

| Gate | Required checks | Applies when |
| ---- | --------------- | ------------ |
| Foundation gate | `pnpm exec tsx packages/features/hr-suite/scripts/check-hr-feature-vertical-naming.mts`; scaffold/integration guard tests; `pnpm typecheck:scripts` | Root shape, integration doors, scaffold scripts, package-local docs. |
| Shipped-slice gate | Vertical naming guard; focused slice unit tests; metadata/search/list contract tests; `pnpm lint:governed-renderers` when surfaces change | A slice moves to or changes while in `shipped`. |
| Package-clean gate | `pnpm --filter @afenda/feature-hr-suite typecheck`; relevant package tests | Before starting a new HR module or declaring package baseline clean. |
| Repo architecture gate | `pnpm architecture:check` | Cross-package or architecture-enforced changes. |

Current package typecheck failures in individual HR slices do not block the
foundation documentation pass, but they do block new module development until
the package-clean gate passes or the failure set is explicitly scoped as
pre-existing repair work.

## Development Sequence

For HR Suite cleanup and future modules, use this order:

1. Update ARCH-010 first when package shape or validation rules change.
2. Update package-local `AGENTS.md`, Cursor rules, and guard scripts to match.
3. Stabilize `hr-suite-integration` and scaffold tooling.
4. Repair existing noisy slices directory by directory.
5. Require the package-clean gate before starting a new HR module.
6. Scaffold new HR slices, then move them from `scaffold-only` to `shipped`
   only after requirement coverage, tests, and as-built documentation exist.

## Related Documents

- **ARCH-002** - ERP kernel package architecture
- **ARCH-005** - Database scale architecture
- **ARCH-006** - Metadata-driven UI architecture
- **ARCH-007** - Governed metadata architecture
- **ARCH-008** - Workspace package discipline
- **TRACK-004** - Enterprise HRM migration
- `packages/features/hr-suite/AGENTS.md`
- `packages/features/hr-suite/docs/hr-reference-slice-checklist.md`
