# Architecture

This directory is the canonical home for stable Afenda architecture doctrine.
Roadmaps, implementation drafts, and milestone plans belong in
[`docs/roadmap/`](../roadmap/).

Search tip: every document has a stable **`ARCH-###`** ID and a matching
**`00N-`** filename prefix (for example `ARCH-006` →
`006-metadata-driven-ui-architecture.md`).

## Document Index

| ID           | File                                                                                       | Topic                                                                          |
| ------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| **ARCH-001** | [001-system-architecture.md](001-system-architecture.md)                                   | Product-wide runtime, deployment, data, auth, AI, observability, testing       |
| **ARCH-002** | [002-erp-kernel-package-architecture.md](002-erp-kernel-package-architecture.md)           | Feature-package boundaries, extraction, Vercel/Turborepo build model           |
| **ARCH-003** | [003-directory-architecture-audit.md](003-directory-architecture-audit.md)                 | Monorepo ownership, package categories, architecture guards                    |
| **ARCH-004** | [004-naming-conventions.md](004-naming-conventions.md)                                     | Directories, files, packages, docs, tests, components                          |
| **ARCH-005** | [005-database-scale-architecture.md](005-database-scale-architecture.md)                   | Schema scale, promotion, migration strategy                                    |
| **ARCH-006** | [006-metadata-driven-ui-architecture.md](006-metadata-driven-ui-architecture.md)           | Governed ERP UI intent, runtime authority, metadata contracts                  |
| **ARCH-007** | [007-governed-metadata-architecture.md](007-governed-metadata-architecture.md)             | Governed-surface renderer kernel, schemas, profiles, resolver                  |
| **ARCH-008** | [008-workspace-package-discipline.md](008-workspace-package-discipline.md)                 | Workspace package classes, export doors, split policy, guard policy            |
| **ARCH-009** | [009-machine-layer-doctrine.md](009-machine-layer-doctrine.md)                             | Lynx machine layer, four product layers, Knowledge substrate, brand contract   |
| **ARCH-010** | [010-hr-feature-package-architecture.md](010-hr-feature-package-architecture.md)           | `@afenda/feature-hr` boundaries, export doors, TRACK-004 migration layout      |
| **ARCH-011** | [011-system-admin-enterprise-architecture.md](011-system-admin-enterprise-architecture.md) | System Admin control module, control domains, package boundary, kernel linkage |
| **ARCH-012** | [012-execution-kernel-architecture.md](012-execution-kernel-architecture.md)               | Execution authority, enforcement contracts, and System Admin co-link           |

## Document Hierarchy

When documents disagree on feature-package boundaries, Vercel/Turborepo
deployment, or schema ownership, follow **ARCH-002** first, then **ARCH-001**,
then update the other document in the same change.

| Authority                              | Doc ID                          |
| -------------------------------------- | ------------------------------- |
| System admin control plane             | **ARCH-011**                    |
| Execution authority                    | **ARCH-012**                    |
| Feature packages and extraction        | **ARCH-002**                    |
| Product runtime, modules, deployment   | **ARCH-001**                    |
| Metadata UI runtime and contracts      | **ARCH-006**                    |
| Governed-surface kernel detail         | **ARCH-007**                    |
| Monorepo guards and package categories | **ARCH-003**                    |
| Workspace package discipline           | **ARCH-008**                    |
| Feature scaffold default               | `packages/_template-definition` |
| Schema scale and promotion             | **ARCH-005**                    |
| Naming                                 | **ARCH-004**                    |

## Current vs Target

| Area                     | Current                                                           | Target                                                         |
| ------------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------- |
| ERP modules              | Shared contracts in `@afenda/kernel`; routes in `apps/erp`        | `@afenda/feature-*` packages under `packages/features/*`       |
| Feature packages on disk | Scaffolded `@afenda/feature-*` packages with public export doors  | One package per mature module with module-owned services       |
| System Admin / kernel split | Separate doctrine now exists in **ARCH-011** and **ARCH-012** | Control-plane configuration and execution enforcement stay separate |
| Module routes            | Dynamic `(app)/[moduleId]/…`                                      | Same route shape; thinner adapters calling feature packages    |
| Database schema          | Flat `packages/db/src/schema/*.ts` with shared ERP tables         | Module subdirs under `schema/<moduleId>/` as modules mature    |
| Vercel deploy            | Single repo-root project; `pnpm turbo build --filter=@afenda/erp` | Same single-app model; link + Remote Cache after stabilization |

## Placement Rules

- Stable architecture doctrine lives here (`ARCH-###`, `00N-*.md`).
- Roadmaps and draft implementation plans live in `docs/roadmap/` (`TRACK-###`).
- Package-local docs may explain local implementation details, but should link
  back to canonical architecture documents here.
- Architecture naming and placement are enforced by `pnpm architecture:check`.

## Vercel review status (May 2026)

| Doc          | Vercel MCP alignment                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| ARCH-001–003 | Reviewed — deploy deferral, Turborepo outputs, conformance                         |
| ARCH-004–008 | Reviewed — naming/deploy, Neon/Fluid Compute, Cache Components, governed RSC rules |
| ARCH-009–012 | Doctrine-specific — defer to ARCH-001/002 for deploy and runtime alignment         |
