# ADR-001 · Workspace Package Discipline

**Status:** Accepted · **Date:** 2026-05-28

## Context

Afenda ERP is preparing for large module migrations, starting with legacy HRM.
The legacy HRM source is broad enough to tempt a split into many workspaces or
deployable apps. Vercel and Turborepo support monorepos, Remote Cache, and
multiple projects, but the ERP product needs coherent tenancy, authorization,
audit, posting, workflow, and database transactions.

## Decision

Afenda will keep one deployable Vercel project for `@afenda/erp` and use
workspace packages as the ownership boundary.

Feature modules use one package per canonical module under
`packages/features/<moduleId>`. Large modules use nested internal folders for
category organization. Nested feature workspaces and per-module Vercel projects
are not part of the default architecture.

The current source of truth is
[ARCH-008 Workspace Package Discipline](../architecture/008-workspace-package-discipline.md).

## Alternatives Considered

| Alternative                                  | Reason rejected                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| One Vercel project per ERP module            | Fragments tenancy, auth, audit, routing, workflow state, and release operation  |
| Nested workspaces for every HRM subdomain    | Adds package graph overhead before independent ownership or reuse is proven     |
| Keep all module logic in `packages/kernel`   | Makes the shared contract package a dumping ground for durable module behavior  |
| Microfrontends for core ERP modules          | Adds routing and deployment complexity without a current independent app need   |

## Consequences

- App routes stay thin and compose package APIs.
- Feature package public doors become part of the architecture contract.
- Turborepo remains the build graph and cache boundary.
- Large modules can still be internally grouped without multiplying deploy
  units.
- Future additional Vercel projects require explicit architecture and ADR
  updates.
