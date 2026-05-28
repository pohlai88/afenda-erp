# ARCH-002 · ERP Kernel Package Architecture

**Doc ID:** `ARCH-002` · **File:** `002-erp-kernel-package-architecture.md`

| Field      | Value                                                                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Status     | Active — target boundaries with as-built compatibility layer (May 2026)                                                            |
| Authority  | Feature-package extraction, import rules, Vercel single-app build model                                                            |
| Supersedes | Per-module route folders and microfrontend deployment assumptions                                                                  |
| Related    | **ARCH-001** (runtime/deploy) · **ARCH-005** (schema promotion) · **ARCH-006** (metadata UI) · **ARCH-008** (workspace discipline) · **ARCH-012** (execution authority) |

Afenda ERP domains are package-scale product capabilities. The deployable app
owns routing and composition; feature packages own ERP-specific implementation.
`packages/kernel` is the shared ERP kernel: the cross-module contract and
compatibility layer that every app route and feature package can depend on. It
is not the long-term home for finance, HR, sales, inventory, CRM, or other
module-specific business logic.

## Current vs target

| Area                     | Current (as-built)                                                                                                                                                                                 | Target                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Deployable surface       | `apps/erp` only                                                                                                                                                                                    | Same — one Vercel project, no per-module deployables      |
| Module implementation    | `packages/kernel`, `apps/erp` route adapters                                                                                                                                                       | `packages/features/<moduleId>` per mature module          |
| List/metadata builders   | `packages/kernel/src/modules/list-surfaces.ts`                                                                                                                                                     | Move to `@afenda/feature-*` when threshold met            |
| Database schema          | Flat `packages/db/src/schema/*.ts` + shared `erp.ts`                                                                                                                                               | `schema/<moduleId>/` for ledger-grade tables              |
| Vercel project link      | **Deferred** until repo stable (see **ARCH-001**)                                                                                                                                                  | Root-linked monorepo; `vercel.json` already defines build |
| Feature packages on disk | **Nine scaffold packages** (`@afenda/feature-*`)                                                                                                                                                   | Module logic moves in as extraction threshold is met      |
| HR module                | Scaffold only — `@afenda/feature-hr` exposes public doors and metadata compatibility. Deferred legacy HRM tree removed (2026-05-28); implement slices through **TRACK-004** with validation gates. | Grow `@afenda/feature-hr` by slice                        |

## Decision

Use `apps/*` for deployable applications and `packages/*` for reusable or
package-owned product capabilities. ERP features live under
`packages/features/*` once they have independent domain behavior, tests,
metadata, components, or data access. The shared cross-module package is
`packages/kernel` (`@afenda/kernel`), not `packages/domain`.

The rename is intentional. `kernel` is narrower and more enforceable than
`domain`:

- `kernel` means shared ERP contracts, execution authority, compatibility
  shaping, registry facts, list-query normalization, and cross-module
  formatting primitives.
- `kernel` does **not** mean module business logic, workflow rules, or a
  dumping ground for feature code.
- `domain` still describes business domains such as finance, HR, or inventory,
  but those implementations belong in feature packages.

This follows the Vercel/Turborepo monorepo model (single project, internal
libraries):

- one deployable Next.js app (`@afenda/erp`) — **not** one Vercel project per module;
- internal workspace packages compiled to `dist/**` and consumed by the app;
- Turborepo builds the affected graph with `dependsOn: ["^build"]`;
- when deployed, Vercel runs the root `vercel.json` build:
  `pnpm install` then `pnpm turbo build --filter=@afenda/erp`.

This is **not** microfrontends or multi-project deployment. ERP modules stay in
one application boundary so tenancy, auth, posting, audit, and workflow state
remain coherent.

Workspace package discipline is defined in
[Workspace Package Discipline](008-workspace-package-discipline.md). In short:
keep one workspace package per canonical module and use internal grouped folders
for large module categories until independent ownership, reuse, or dependency
pressure justifies a new package class.

## Why this fits ERP

ERP modules are long-lived bounded contexts with different data integrity rules,
not generic UI slices. Package boundaries match how ERP systems are operated:

| ERP concern                                 | Package placement                       |
| ------------------------------------------- | --------------------------------------- |
| Ledger posting, reversals, period close     | `features/finance` command services     |
| Stock movements, reservations, valuation    | `features/inventory` command services   |
| Order-to-cash and procure-to-pay flows      | `features/sales`, `features/purchasing` |
| Payroll-sensitive and statutory HR data     | `features/hr`                           |
| Cross-module approval and scheduled jobs    | `features/approvals`, `workflows`       |
| Physical tables, migrations, tenancy guards | `packages/db`                           |
| Module IDs, permissions, record contracts   | `packages/kernel`                       |
| Metadata renderers and list-window UI       | `packages/governed-surface`             |

Feature packages own **business behavior**. `packages/db` owns **physical
schema**. Cross-module writes that must commit together run in one database
transaction via command services or workflow handlers — not in route components
or metadata renderers.

## Target shape

```txt
apps/
  erp/
    src/app/                  # route entrypoints, layouts, handlers

packages/
  features/
    finance/                  # @afenda/feature-finance
    sales/                    # @afenda/feature-sales
    purchasing/               # @afenda/feature-purchasing
    inventory/                # @afenda/feature-inventory
    hr/                       # @afenda/feature-hr (moduleId: hr)
    crm/                      # @afenda/feature-crm
    approvals/                # @afenda/feature-approvals
    reports/                  # @afenda/feature-reports
    system-admin/             # @afenda/feature-system-admin
  kernel/                     # shared ERP contracts and module registry
  db/                         # schema, migrations, tenancy, query primitives
  governed-surface/           # metadata schemas and renderers
  ui/                         # shared UI primitives
  workflows/                  # scheduled jobs and durable process handlers
  auth/                       # session, org context, permission checks
```

Dashboard shell behavior stays in `apps/erp`; KPI and report logic moves to
`features/reports` and `workflows` as those surfaces mature. Module map and
runtime context: [System Architecture](001-system-architecture.md).

## As-built compatibility layer

Feature packages exist as module-bound metadata wrappers; kernel builders and
route adapters remain the active wiring path until extraction moves logic into
`@afenda/feature-*`:

| Concern                            | Current owner                                                                                                          |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Module workspace routes            | `apps/erp/src/app/(app)/[moduleId]/` → `module-screen.tsx`                                                             |
| Dashboard / solution-console lists | `dashboard-route.tsx`, `solution-console-route.tsx`                                                                    |
| Governed list configuration        | `packages/kernel/src/modules/list-surfaces.ts` (`buildModule*ListSurface`, `buildDashboard*`, `buildSolutionConsole*`) |
| Governed rendering                 | `@afenda/governed-surface/server` (`GovernedPatternCListSection`)                                                      |
| Shared ERP records / work items    | `packages/db` (`erp_module_records`, `erp_work_items`, …) via `@afenda/kernel`                                         |
| Module registry and capabilities   | `packages/kernel`, `@afenda/config/module-ids`                                                                         |

Do not treat the compatibility layer as the final home for posting-grade,
inventory-grade, or statutory workflows. Promote to feature packages and module
schema per [Database Scale Architecture](005-database-scale-architecture.md).

## App boundary

`apps/erp` owns:

- Next.js route files: `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`,
  `error.tsx`.
- Route groups, protected layout composition, search-param threading, and route
  handler wiring.
- Server-side session and organization resolution at page entry.
- Thin route adapters that call package APIs and render package-owned
  components or governed metadata.

`apps/erp` must not own durable ERP business rules, reusable primitive UI, table
schema, cross-module workflow state, or module-specific query logic.

**As-built routes (representative):**

```txt
apps/erp/src/app/(app)/
  [moduleId]/page.tsx          # → module-screen.tsx
  dashboard/                   # → dashboard-route.tsx
  solution-console/            # → solution-console-route.tsx
  api/                         # AI, uploads, cron, observability drain
```

## Feature package boundary

A feature package owns module-specific implementation:

- business commands and query services;
- module metadata and record type definitions;
- server-window list builders and detail page data shaping;
- module-specific Server Components and Client Components;
- Zod schemas, action contracts, workflow adapters, and tests;
- module-specific integration adapters that do not belong in shared platform
  packages.

Feature packages do **not** own Drizzle migrations or raw schema files. Add or
change module tables under `packages/db/src/schema/<moduleId>/` and consume them
through typed query/command services in the feature package.

Every tenant-scoped read and write must go through `@afenda/db` tenancy helpers
and `@afenda/auth` permission checks.

Large modules may organize implementation by internal category folders, for
example `packages/features/hr/src/payroll` or
`packages/features/hr/src/time-attendance`. Do not add nested package.json files
below a feature package unless **ARCH-008** and `pnpm architecture:check` are
changed in the same pull request.

### Public export doors

Feature packages must expose stable subpaths so Client Components never pull
server-only graphs (Vercel/Next.js server-client separation):

```json
{
  "name": "@afenda/feature-hr",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "development": "./src/index.ts",
      "default": "./dist/index.js"
    },
    "./client": {
      "types": "./src/client.ts",
      "development": "./src/client.ts",
      "default": "./dist/client.js"
    },
    "./server": {
      "types": "./src/server.ts",
      "development": "./src/server.ts",
      "default": "./dist/server.js"
    },
    "./metadata": {
      "types": "./src/metadata.ts",
      "development": "./src/metadata.ts",
      "default": "./dist/metadata.js"
    }
  }
}
```

Import explicit subpaths from routes (for example `@afenda/feature-hr/server`),
not barrels that re-export server code. Match patterns in `@afenda/auth` and
`@afenda/governed-surface`.

When a feature package is added, register it in `packages/config/src/next.ts`
`afendaTranspilePackages` so Next.js transpiles workspace TypeScript during
`next build`.

## Shared kernel boundary

`packages/kernel` owns cross-module kernel responsibilities only:

- canonical module IDs and module registry contracts;
- execution context, access, policy, capability, audit, and guarded-execution
  contracts;
- shared workspace, navigation, permission, and metadata types;
- cross-module helpers without feature-specific workflow logic;
- shared ERP formatting and serialization primitives;
- **temporary** list-surface builders and workspace serializers until extraction.

When a module adds module-specific fields, actions, schemas, page sections, data
joins, or policy rules, that implementation belongs in
`packages/features/<moduleId>`.

`packages/kernel` depends on `@afenda/governed-surface` for list-surface builder
types today. After extraction, feature packages should own module builders;
`packages/kernel` should keep only shared contracts, kernel helpers, and
registry contracts.

## Cross-module dependency rules

- Prefer shared contracts in `@afenda/kernel` over feature-to-feature imports.
- Use `@afenda/workflows` for durable approval, reminder, sync, and housekeeping
  flows that span modules.
- Allow direct feature-to-feature imports only for stable, documented seams.
  Avoid cycles; extract shared contracts to `@afenda/kernel` when needed.
- Feature packages must not import from `apps/erp`.
- Multi-module posting exposes one orchestrating command entrypoint.

## Package creation threshold

Create `@afenda/feature-<moduleId>` when one or more are true:

- the module has its own command or query service;
- it needs module-specific TSX components;
- it needs module-specific tables under `packages/db/src/schema/<moduleId>/`;
- it has module-specific metadata builders or record schemas;
- it has independent unit or integration tests;
- another package or route imports the module behavior.

Do not create packages for throwaway prototypes or one-file helpers.

Folder names follow canonical module IDs from `@afenda/config/module-ids`
(`packages/features/hr` → `@afenda/feature-hr`). See
[Naming Conventions](004-naming-conventions.md).

## Extraction path

1. Add module schema under `packages/db/src/schema/<moduleId>/` when data is
   ledger-, inventory-, or compliance-sensitive.
2. Create `packages/features/<moduleId>` with `client`, `server`, and `metadata`
   subpaths.
3. Move command/query services, list builders, components, and tests out of
   `packages/kernel`.
4. Leave registry IDs, navigation contracts, and shared types in `packages/kernel`.
5. Replace fat route logic with thin adapters calling the feature package.
6. Add `@afenda/feature-<moduleId>` to `afendaTranspilePackages` and
   `apps/erp/package.json` `workspace:*` dependency.

Do not extend generic `erp_module_records` for posting-grade or statutory data.
Promotion rules: [Database Scale Architecture](005-database-scale-architecture.md).

## Import rules

| From                     | May import                                                                                                                             |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/erp`               | `@afenda/feature-*`, `@afenda/kernel`, platform packages                                                                               |
| `@afenda/feature-*`      | `@afenda/kernel`, `@afenda/db`, `@afenda/auth`, `@afenda/governed-surface`, `@afenda/ui`, `@afenda/workflows`, `@afenda/observability` |
| Shared platform packages | Each other per **ARCH-003**; **not** `apps/erp` or `@afenda/feature-*`                                                                 |
| `@afenda/ui`             | Primitives only — no db, auth server, AI, or governed metadata registries                                                              |

Client subpaths must not import database helpers, auth server modules, or
Node-only SDKs.

## Vercel and Turborepo integration

Deployment stays **single-app**. Feature packages are never separate Vercel
projects; they are libraries in the ERP build graph.

Root `vercel.json` (committed; Vercel link **deferred** until stable per
**ARCH-001**):

```json
{
  "installCommand": "pnpm install",
  "buildCommand": "pnpm turbo build --filter=@afenda/erp",
  "crons": [
    { "path": "/api/cron/reminders", "schedule": "0 0 * * *" },
    { "path": "/api/cron/syncs", "schedule": "0 1 * * *" },
    { "path": "/api/cron/housekeeping", "schedule": "0 2 * * *" }
  ]
}
```

### Build ordering (Turborepo v2 `tasks`)

1. Platform and (future) feature packages emit `dist/**` via package `build` tasks.
2. `@afenda/erp#build` runs after `dependsOn: ["^build"]`.
3. App outputs: `.next/**` with `!.next/cache/**` (Vercel conformance:
   `NEXTJS_NO_TURBO_CACHE`).

`turbo.json` lists `globalEnv` / per-task `env` so Remote Cache hashes stay
correct across preview and production.

### Next.js workspace transpilation

`packages/config/src/next.ts` sets `transpilePackages` for all current workspace
dependencies consumed by the app:

`@afenda/ai`, `@afenda/auth`, `@afenda/config`, `@afenda/db`, `@afenda/kernel`,
`@afenda/governed-surface`, `@afenda/observability`, `@afenda/ui`,
`@afenda/workflows`.

When adding a feature package, append `@afenda/feature-<moduleId>` to this list.

### Checklist: adding a feature package

1. `packages/features/<moduleId>/` with `package.json` name `@afenda/feature-<moduleId>`.
2. `pnpm-workspace.yaml` already includes `packages/features/*`.
3. `build` script → `dist/**`; `pnpm architecture:check` validates export shape.
4. `turbo.json` inherits `build` with `dependsOn: ["^build"]`, `outputs: ["dist/**"]`.
5. `apps/erp/package.json` → `"@afenda/feature-<moduleId>": "workspace:*"`.
6. `afendaTranspilePackages` in `@afenda/config`.
7. Thin route in `apps/erp` calling `./server` or `./metadata` subpaths only.

### Vercel link policy

**Do not** `vercel link` or promote preview/production until **ARCH-001**
stabilization gate passes. The monorepo build contract is ready in git; platform
wiring is a later milestone.

## Enforcement

- `pnpm-workspace.yaml` includes `packages/features/*`.
- `pnpm architecture:check` registers `@afenda/feature-*` under
  `packages/features/*`, requires public export doors, rejects nested feature
  workspaces by default, requires compiled `dist` runtime exports, validates
  import boundaries, syncs app transpilation, and validates Turborepo outputs.
- `pnpm lint:governed-renderers` guards metadata renderer parity when feature
  packages add governed surfaces.

## Related documents

- **ARCH-001** [System Architecture](001-system-architecture.md) — runtime, deploy deferral, module map
- **ARCH-005** [Database Scale Architecture](005-database-scale-architecture.md) — schema ownership and promotion
- **ARCH-006** [Metadata-Driven UI Architecture](006-metadata-driven-ui-architecture.md) — builders and renderers
- **ARCH-003** [Directory Architecture Audit](003-directory-architecture-audit.md) — package categories
- **ARCH-004** [Naming Conventions](004-naming-conventions.md) — `@afenda/feature-*` naming
- **ARCH-008** [Workspace Package Discipline](008-workspace-package-discipline.md) — package classes and split policy

### External (Vercel monorepo)

- [Monorepos with Turborepo](https://vercel.com/docs/monorepos/turborepo)
- [Turborepo environment variables and cache](https://vercel.com/docs/monorepos/turborepo) — `globalEnv`, task `env`
- [NEXTJS_NO_TURBO_CACHE](https://vercel.com/docs/conformance/rules/NEXTJS_NO_TURBO_CACHE) — exclude `.next/cache/**`
