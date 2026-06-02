# System Admin File Audit

## Local architecture

- `src/overview/architecture.md` is the package-local development pipeline and
  implementation boundary for `@afenda/feature-system-admin`.
- `src/data-management/data-management-architecture.md` is the local vertical
  guide for the enterprise import/export workbench.
- Canonical doctrine remains ARCH-1006 and its supplements under
  `docs/architecture/`.

## Export doors (ARCH-1005)

| Door | Owns |
| ---- | ---- |
| `./metadata` | List surface builders, `surfaceKey` constants, `getSystemAdminSurfaceKeys` |
| `./server` | Page models, policies, actions, queries, server components |
| `./client` | Client forms, trailing cells, nav, serializable catalogs |

Pattern C routes: list config from **`/metadata`**, authority from **`/server`**.

## Domain verticals

Each vertical owns `actions/`, `policies/`, `events/` (where applicable),
`data/` (repositories and read models), `surface/` (governed list surface
builders), `contracts/`, and `schemas/` (Zod action and filter schemas).
Cross-vertical list toolbar helpers live in `overview/surfaces/`.

- `overview/`, `users/`, `memberships/`, `roles/`, `permissions/`, `modules/`, `capabilities/`
- `policies/` (policy-rules vertical; module-wide capability gates live in `overview/policies/`)
- `approvals/`, `audit-viewer/`, `security/`, `organization/`, `diagnostics/`
- `integrations/`, `data-management/` (target enterprise import/export
  workbench), `lynx/`, `billing/`, `reliability/`, `tenant-execution/`
  (cross-cutting bridge — `contracts/`, `data/`, `policies/` only; no route)

## Data access

Persistence adapters live in each vertical’s `data/` folder (e.g. `users/data/system-admin.identity.repository.server.ts`, `tenant-execution/data/system-admin.execution-settings.repository.server.ts` for org execution settings shared across policies/approvals/modules). There is no shared `src/data/` barrel.

`tenant-execution/policies/` registers kernel evaluators and loads org execution rules; see `tenant-execution/tenant-execution-architecture.md`.

CSV parsers, import adapters, staged job queries, and import workflow adapters
belong in `data-management/`. Do not place them in root `utils/`, `tools/`,
`helpers/`, or `data/` buckets.

## Components

Client and server UI live in each vertical’s `components/` folder. `./client` re-exports governed forms, trailing cells, and nav from those buckets. There is no shared `src/components/` barrel.

## Contracts

Types, catalogs, route paths, and action envelopes live in each vertical’s `contracts/` folder (for example `tenant-execution/contracts` for `SystemAdminActionResult`, `overview/contracts` for nav paths, `integrations/contracts` for API scopes and webhooks). There is no shared `src/contracts/` barrel.

## Schemas

Zod parsers for form actions and list filters live in each vertical’s `schemas/` folder (for example `modules/schemas` for module settings, `integrations/schemas` for API credentials and webhooks). There is no shared `src/schemas/` barrel.

## Surfaces

Governed list surface builders and `surfaceKey` constants live in each
vertical’s `surface/` folder (for example
`modules/surface/system-admin.modules-list.surface.ts`). Shared
toolbar/pagination helpers and the surface-key registry are in
`overview/surfaces/`. There is no shared `src/surface/` or `src/surfaces/`
barrel.

## Cross-cutting (`overview/`)

- `overview/policies/system-admin.capability.policy.server.ts` — module-wide execution capability gates
- `overview/contracts/system-admin.{control-links,list-search,list-filter}.shared.ts` — list navigation and search helpers
- `integrations/events/system-admin.webhook-dispatch.event.ts` — tenant webhook dispatch (exported from `integrations/`)

## Removed

- `src/events/` root bucket (webhook dispatch → `integrations/events/`; vertical events stay in each vertical)
- `src/surfaces/` root bucket (relocated into domain verticals and `overview/surfaces/`)
- `src/surface/` root bucket (vertical surface ownership only)
- `src/schemas/` root bucket (relocated into domain verticals)
- `src/contracts/` root bucket (relocated into domain verticals)
- `src/components/` root bucket (UI relocated into domain verticals)
- `src/data/` root bucket (repositories and queries relocated into domain verticals)
- `src/actions/` root shim bucket
- `src/utils/`, `src/tools/`, `src/helpers/`, `src/common/`, `src/shared/`
  catch-all buckets
- `data/system-admin.data-access.repository.server.ts`
- `data/system-admin.hub-governance.query.server.ts` (unused; overview owns hub snapshot)
