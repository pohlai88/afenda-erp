# Architecture

This directory is the canonical home for stable Afenda architecture doctrine.
Roadmaps, implementation drafts, and milestone plans belong in
[`docs/roadmap/`](../roadmap/).

Search tip: every document has a stable **`ARCH-###`** ID and a matching
**`00N-`** filename prefix (for example `ARCH-006` →
`006-metadata-driven-ui-architecture.md`).

## Document Index

| ID | File | Topic |
| -- | ---- | ----- |
| **ARCH-001** | [001-system-architecture.md](001-system-architecture.md) | Product-wide runtime, deployment, data, auth, AI, observability, testing |
| **ARCH-002** | [002-erp-domain-package-architecture.md](002-erp-domain-package-architecture.md) | Feature-package boundaries, extraction, Vercel/Turborepo build model |
| **ARCH-003** | [003-directory-architecture-audit.md](003-directory-architecture-audit.md) | Monorepo ownership, package categories, architecture guards |
| **ARCH-004** | [004-naming-conventions.md](004-naming-conventions.md) | Directories, files, packages, docs, tests, components |
| **ARCH-005** | [005-database-scale-architecture.md](005-database-scale-architecture.md) | Schema scale, promotion, migration strategy |
| **ARCH-006** | [006-metadata-driven-ui-architecture.md](006-metadata-driven-ui-architecture.md) | Governed ERP UI intent, runtime authority, metadata contracts |
| **ARCH-007** | [007-governed-metadata-architecture.md](007-governed-metadata-architecture.md) | Governed-surface renderer kernel, schemas, profiles, resolver |

## Document Hierarchy

When documents disagree on feature-package boundaries, Vercel/Turborepo
deployment, or schema ownership, follow **ARCH-002** first, then **ARCH-001**,
then update the other document in the same change.

| Authority | Doc ID |
| --------- | ------ |
| Feature packages and extraction | **ARCH-002** |
| Product runtime, modules, deployment | **ARCH-001** |
| Metadata UI runtime and contracts | **ARCH-006** |
| Governed-surface kernel detail | **ARCH-007** |
| Monorepo guards and package categories | **ARCH-003** |
| Schema scale and promotion | **ARCH-005** |
| Naming | **ARCH-004** |

## Current vs Target

| Area | Current | Target |
| ---- | ------- | ------ |
| ERP modules | Shared contracts in `@afenda/domain`; routes in `apps/erp` | `@afenda/feature-*` packages under `packages/features/*` |
| Feature packages on disk | None yet; workspace glob and guards are ready | One package per mature module |
| Module routes | Dynamic `(app)/[moduleId]/…` | Same route shape; thinner adapters calling feature packages |
| Database schema | Flat `packages/db/src/schema/*.ts` with shared ERP tables | Module subdirs under `schema/<moduleId>/` as modules mature |
| Vercel deploy | Single repo-root project; `pnpm turbo build --filter=@afenda/erp` | Same single-app model; link + Remote Cache after stabilization |

## Placement Rules

- Stable architecture doctrine lives here (`ARCH-###`, `00N-*.md`).
- Roadmaps and draft implementation plans live in `docs/roadmap/` (`TRACK-###`).
- Package-local docs may explain local implementation details, but should link
  back to canonical architecture documents here.
- Architecture naming and placement are enforced by `pnpm architecture:check`.

## Vercel review status (May 2026)

| Doc | Vercel MCP alignment |
| --- | -------------------- |
| ARCH-001–003 | Reviewed — deploy deferral, Turborepo outputs, conformance |
| ARCH-004–007 | Reviewed — naming/deploy, Neon/Fluid Compute, Cache Components, governed RSC rules |
