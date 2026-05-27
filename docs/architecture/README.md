# Architecture

This directory is the canonical home for stable Afenda architecture doctrine.
Roadmaps, implementation drafts, and milestone plans belong in `docs/roadmap/`.

## Canonical Documents

| Document                                                              | Ownership                                                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [System Architecture](system-architecture.md)                         | Product-wide runtime, deployment, data, auth, AI, observability, and testing architecture. |
| [Directory Architecture Audit](directory-architecture-audit.md)       | Monorepo ownership, output rules, package categories, and architecture guards.             |
| [Metadata-Driven UI Architecture](metadata-driven-ui-architecture.md) | Governed ERP UI intent, runtime authority boundaries, and metadata contracts.              |
| [Governed Metadata Architecture](governed-metadata-architecture.md)   | Governed-surface renderer, schema, profile, resolver, builder, and runtime layering.       |
| [Naming Conventions](naming-conventions.md)                           | Scalable naming rules for directories, files, docs, tests, route files, and components.    |

## Placement Rules

- Stable architecture doctrine lives here.
- Roadmaps and draft implementation plans live in `docs/roadmap/`.
- Package-local docs may explain local implementation details, but should link back to canonical architecture documents here.
- Architecture naming and placement are enforced by `pnpm architecture:check`.
