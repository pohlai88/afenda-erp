# Approvals vertical

Template buckets: `actions`, `components`, `contracts`, `data`, `events`, `policies`, `schemas`, `surface`.

| Door | Exports |
| ---- | ------- |
| `@afenda/feature-system-admin/server` | page model, guards, mutations, section + access-denied |
| `@afenda/feature-system-admin/client` | `SystemAdminApprovalRuleEditor`, `SystemAdminApprovalTrailingCell` |
| `@afenda/feature-system-admin/metadata` | `buildApprovalsListSurface`, trailing resolver, UI copy, surface key (via overview keys) |

Canonical architecture: [`docs/architecture/1006-control-plane.md`](../../../../docs/architecture/1006-control-plane.md) (parent **ARCH-1006**).

Package as-built supplement: [`approvals-architecture.md`](./approvals-architecture.md) — update when implementation changes; do not delete.
