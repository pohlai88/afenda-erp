# System Admin File Audit

## Export doors (ARCH-008)

| Door | Owns |
| ---- | ---- |
| `./metadata` | List surface builders, `surfaceKey` constants, `getSystemAdminSurfaceKeys`, module metadata helpers |
| `./server` | Page models, policies, actions, queries, server components, Lynx monitor surface builder |
| `./client` | Client forms, trailing cells, nav, serializable catalogs |

Pattern C ERP routes import list configuration from **`/metadata`** and authority from **`/server`**.

## Domain verticals

- `overview/`, `users/`, `memberships/`, `roles/`, `permissions/`, `modules/`, `capabilities/`
- `policies/` (policy-rules vertical + root capability gates in `system-admin.capability.policy.server.ts`)
- `approvals/`, `audit-viewer/`, `security/`, `organization/`, `diagnostics/`, `execution/`

Vertical `index.ts` files export page models, actions, and policies — not list builders (those live on `/metadata`).

## Data access

Domain repositories under `data/repositories/`:

- `tenant-settings`, `tenant-security`, `identity`, `integrations`, `execution-settings`, `audit`, `machine-layer`

`data/system-admin.data-access.repository.server.ts` remains a compat re-export barrel for `data/index.ts` only.

## Compatibility buckets

- `actions/`, `data/`, `schemas/`, `surfaces/`, `components/`, `contracts/`, `events/` — implementation homes; routes use export doors.
- `/system-admin/identity` and `/system-admin/settings` — compatibility routes.
- Hub route: `apps/erp/.../system-admin/(index)/page.tsx` with route-level `loading.tsx`.

## Removed shims (cleanup pass)

- `surfaces/system-admin.audit.surface.ts` — retention/audit keys import from `audit-viewer/data/` directly.
- `systemAdminAuditLogSurfaceKey` / `getSystemAdminSurfaceKeys().auditLog`.
- Duplicate list-builder exports on `/server` and vertical indexes.
- `SystemAdminAuditExportButton` on `audit-viewer` server index (client door only).
- `buildDiagnosticsListSurface` alias on control surface.

## Follow-up

- Point remaining callers at domain repos; delete compat data-access barrel.
- Full `integrations/` and `audit-viewer/` policy/event vertical parity.
- Collapse root `actions/` shims into vertical action modules.
