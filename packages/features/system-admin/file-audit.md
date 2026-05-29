# System Admin File Audit

## Export doors (ARCH-008)

| Door | Owns |
| ---- | ---- |
| `./metadata` | List surface builders, `surfaceKey` constants, `getSystemAdminSurfaceKeys` |
| `./server` | Page models, policies, actions, queries, server components |
| `./client` | Client forms, trailing cells, nav, serializable catalogs |

Pattern C routes: list config from **`/metadata`**, authority from **`/server`**.

## Domain verticals

Each vertical owns `actions/`, `policies/`, `events/` (where applicable), `data/` (including governed list surface builders), `contracts/`, `schemas/` (Zod action and filter schemas). Cross-vertical list toolbar helpers live in `overview/surfaces/`.

- `overview/`, `users/`, `memberships/`, `roles/`, `permissions/`, `modules/`, `capabilities/`
- `policies/` (policy-rules vertical; module-wide capability gates live in `overview/policies/`)
- `approvals/`, `audit-viewer/`, `security/`, `organization/`, `diagnostics/`
- `integrations/`, `lynx/`, `billing/`, `reliability/`, `tenant-execution/`

## Data access

Persistence adapters live in each vertical’s `data/` folder (e.g. `users/data/system-admin.identity.repository.server.ts`, `tenant-execution/data/system-admin.execution-settings.repository.server.ts`). There is no shared `src/data/` barrel.

## Components

Client and server UI live in each vertical’s `components/` folder. `./client` re-exports governed forms, trailing cells, and nav from those buckets. There is no shared `src/components/` barrel.

## Contracts

Types, catalogs, route paths, and action envelopes live in each vertical’s `contracts/` folder (for example `tenant-execution/contracts` for `SystemAdminActionResult`, `overview/contracts` for nav paths, `integrations/contracts` for API scopes and webhooks). There is no shared `src/contracts/` barrel.

## Schemas

Zod parsers for form actions and list filters live in each vertical’s `schemas/` folder (for example `modules/schemas` for module settings, `integrations/schemas` for API credentials and webhooks). There is no shared `src/schemas/` barrel.

## Surfaces

Governed list surface builders and `surfaceKey` constants live in each vertical’s `data/*` surface modules (for example `modules/data/system-admin.modules-list.surface.ts`). Shared toolbar/pagination helpers and the surface-key registry are in `overview/surfaces/`. There is no shared `src/surfaces/` barrel.

## Cross-cutting (`overview/`)

- `overview/policies/system-admin.capability.policy.server.ts` — module-wide execution capability gates
- `overview/contracts/system-admin.{control-links,list-search,list-filter}.shared.ts` — list navigation and search helpers
- `integrations/events/system-admin.webhook-dispatch.event.ts` — tenant webhook dispatch (exported from `integrations/`)

## Removed

- `src/events/` root bucket (webhook dispatch → `integrations/events/`; vertical events stay in each vertical)
- `src/surfaces/` root bucket (relocated into domain verticals and `overview/surfaces/`)
- `src/schemas/` root bucket (relocated into domain verticals)
- `src/contracts/` root bucket (relocated into domain verticals)
- `src/components/` root bucket (UI relocated into domain verticals)
- `src/data/` root bucket (repositories and queries relocated into domain verticals)
- `src/actions/` root shim bucket
- `data/system-admin.data-access.repository.server.ts`
- `data/system-admin.hub-governance.query.server.ts` (unused; overview owns hub snapshot)
