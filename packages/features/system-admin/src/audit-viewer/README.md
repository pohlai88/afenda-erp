# Audit viewer vertical

Template buckets: `actions`, `components`, `contracts`, `data`, `events`, `policies`, `schemas`, `surface`.

| Door | Exports |
| ---- | ------- |
| `@afenda/feature-system-admin` | Route paths, nav (via overview) |
| `@afenda/feature-system-admin/server` | page model, guards, export/retention actions, section component |
| `@afenda/feature-system-admin/client` | `SystemAdminAuditExportActions`, `RetentionPolicyForm` |
| `@afenda/feature-system-admin/metadata` | list surface builders, surface keys, UI copy |

Canonical architecture: [`docs/architecture/011-system-admin-audit-viewer-architecture.md`](../../../../docs/architecture/011-system-admin-audit-viewer-architecture.md) (parent **ARCH-011**).

Package supplement: [`audit-viewer.md`](./audit-viewer.md) — update when implementation changes; do not delete.
