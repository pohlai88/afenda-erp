# ARCH-008 · Workspace Package Discipline

**Doc ID:** `ARCH-008` · **File:** `008-workspace-package-discipline.md`

| Field     | Value                                                                                       |
| --------- | ------------------------------------------------------------------------------------------- |
| Status    | Active — implementation discipline for large-module development (May 2026)                  |
| Authority | Workspace package classes, export doors, dependency direction, split criteria, guard policy |
| Defers to | **ARCH-002** for feature ownership · **ARCH-001** for Vercel deployment topology            |
| Related   | **ARCH-003** (guards) · **ARCH-004** (naming) · **ARCH-005** (schema ownership)             |

Afenda ERP uses one deployable Next.js application and many disciplined
workspace packages. Package boundaries are the maintainability unit; Vercel
projects are not the module boundary.

This document is the living rulebook for workspace package hygiene. The
decision history is recorded in
[ADR-001 Workspace Package Discipline](../adr/001-workspace-package-discipline.md).

## Doctrine

Afenda stays a **single-app Vercel/Turborepo monorepo**:

- one Vercel project from the repository root;
- one deployable app, `@afenda/erp`;
- internal packages built by Turborepo and consumed by the app;
- feature packages under `packages/features/<moduleId>`;
- no per-module Vercel projects, app folders, or microfrontends for core ERP
  modules.

Use workspace packages to isolate ownership, tests, public APIs, and build graph
edges. Do not use packages to create deployment fragmentation.

## Package Classes

| Class              | Location                          | Responsibility                                                                  |
| ------------------ | --------------------------------- | ------------------------------------------------------------------------------- |
| Deployable app     | `apps/erp`                        | App Router routes, layouts, handlers, shell composition                         |
| Feature package    | `packages/features/<moduleId>`    | Module-specific commands, queries, metadata, components, schemas, tests         |
| Domain contracts   | `packages/kernel`                 | Module IDs, shared contracts, registry contracts, compatibility adapters        |
| Platform packages  | `packages/db`, `auth`, `ai`, ...  | Database, auth, AI, workflows, observability, config                            |
| UI/runtime package | `packages/ui`, `governed-surface` | Reusable primitives and governed renderer kernel; no durable ERP business rules |

All package classes are enforced by `pnpm architecture:check`
(`scripts/check-directory-architecture.mts`). New package classes require a doc
update and guard update in the same change.

## Feature Package Shape

Every feature package must be named and placed predictably:

```txt
packages/features/hr-suite
  package.json      # name: @afenda/feature-hr-suite
  src/
    index.ts
    client.ts
    server.ts
    metadata.ts
    actions/
    components/
    ...
```

Scaffold default: copy [`packages/_template-definition`](../../packages/_template-definition).
Template-local scaffold and validation scripts live under
`packages/_template-definition/scripts`; bucket folders live under
`packages/_template-definition/src`.

Required public export doors:

| Export       | Use                                                          |
| ------------ | ------------------------------------------------------------ |
| `.`          | Shared package entry; keep server-only graphs out of clients |
| `./client`   | Client Components and browser-only behavior                  |
| `./server`   | Server Components, command/query services, Node-only code    |
| `./metadata` | Governed metadata builders and metadata-only module facts    |

`src/server.ts` is the server-only package marker and imports
`@afenda/kernel/server`. Deep feature implementation files must not import
`server-only` or `@afenda/kernel/server` directly; they inherit the boundary by
being exported through the public `./server` door. This keeps local Vitest
package tests from depending on Next's `server-only` package resolution while
preserving an explicit server door.

Feature packages compile to `dist/**` with
`"build": "tsc -p tsconfig.build.json"`. Their `default` export targets must
point at compiled `./dist/*.js`; `types` and `development` may point at `./src`
for local development.

Internal folder grammar comes from
[`packages/_template-definition/src`](../../packages/_template-definition/src).
Scaffold with `pnpm scaffold:feature <moduleId>`, then remove starter buckets
that remain empty after the package audit. Do not use catch-all folder names
(`_shared`, `common`, `lib`, `utils`, etc.).

## Flat Workspace, Grouped Internals

ERP modules stay flat at the workspace level:

```txt
packages/features/hr-suite/                 # workspace package
  src/
    employees/
    time-attendance/
    payroll/
    talent/
    industry/
```

Do not create nested workspaces such as
`packages/features/hr-suite/payroll/package.json` unless a later architecture change
explicitly approves a new package class.

Nested internal folders are preferred for maintenance because they keep one
module API, one package dependency edge, one feature test target, and one
Vercel/Turborepo build graph node. Split into another workspace only when the
code has an independent owner, reusable public API, separate test lifecycle, or
a proven dependency-cycle problem that cannot be solved by internal folders.

## Dependency Direction

| From              | Allowed direction                                                                  |
| ----------------- | ---------------------------------------------------------------------------------- |
| `apps/erp`        | Imports public doors from feature/kernel/platform/UI packages                      |
| Feature packages  | Import kernel, db, auth, governed-surface, UI, workflows, observability as needed  |
| Platform packages | Do not import from `apps/erp` or feature implementations unless explicitly allowed |
| `@afenda/ui`      | Primitive UI only; no DB, auth server, AI, governed metadata registry, or routes   |

Feature-to-feature imports are discouraged. Prefer shared contracts in
`@afenda/kernel` or cross-module processes in `@afenda/workflows`. If a direct
feature dependency becomes necessary, expose it through `.` / `./server` /
`./metadata`; never import `src`, `dist`, or `internal` paths.

Client export paths must not import `@afenda/db`, `@afenda/ai`,
`@afenda/workflows`, `@afenda/auth/server`, or Node built-ins.

## Vercel and Turborepo Contract

Root `vercel.json` remains the deploy contract:

```json
{
  "installCommand": "pnpm install",
  "buildCommand": "pnpm turbo build --filter=@afenda/erp"
}
```

Turborepo output rules:

- libraries: `dist/**`;
- `@afenda/erp#build`: `.next/**` and `!.next/cache/**`;
- `globalEnv` and task `env` must include runtime variables that affect build
  output or cache hashing.

Vercel Remote Cache may be enabled after the ARCH-001 stabilization gate. The
repo must keep Vercel conformance for Next.js cache outputs
(`NEXTJS_NO_TURBO_CACHE`).

Additional Vercel projects are allowed only for a genuinely separate surface:
marketing, documentation, public portal, worker service, or independent product
app. Core ERP modules remain package boundaries inside the single app.

## Enforcement

`pnpm architecture:check` validates:

- workspace package placement and package class;
- feature package names and required export doors;
- no nested feature workspaces by default;
- compiled `dist` default exports for library packages;
- Vercel-compatible Turborepo outputs;
- app workspace dependencies are listed in `afendaTranspilePackages`;
- feature imports use public package doors;
- packages do not import from `apps/erp`;
- feature client exports do not pull server-only modules.
- feature server-only markers stay centralized at `src/server.ts` through
  `@afenda/kernel/server`.

The guard is intentionally conservative. If a rule needs an exception, update
this document and the guard script in the same change.

## Large ERP Migration Use

For HRM-scale migrations, start with one feature package per canonical module.
For example, migrate legacy HRM into `@afenda/feature-hr` and organize internal
folders by category (`employees`, `time-attendance`, `payroll`, `talent`,
`industry`) before considering more workspace packages.

Package extraction is complete only when app routes are thin adapters, module
rules live in feature/kernel/platform packages, tenant-scoped data access is
server-owned, and governed lists use bounded server windows.

## Related Documents

- **ARCH-001** [System Architecture](001-system-architecture.md)
- **ARCH-002** [ERP Kernel Package Architecture](002-erp-kernel-package-architecture.md)
- **ARCH-003** [Directory Architecture Audit](003-directory-architecture-audit.md)
- **ARCH-004** [Naming Conventions](004-naming-conventions.md)
- **ARCH-005** [Database Scale Architecture](005-database-scale-architecture.md)
