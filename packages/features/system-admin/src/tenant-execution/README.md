# Tenant execution (execution bridge)

Cross-cutting infrastructure — not a System Admin route or nav vertical.

| Bucket | Role |
| ------ | ---- |
| `contracts/` | Shared Server Action result envelope (`SystemAdminActionResult`) |
| `data/` | Organization-scoped execution settings persistence (`tenant_*` tables via `@afenda/db`) |
| `policies/` | Execution Kernel registration and org rule loader |
| `tests/` | Package tests for bridge and repository behavior |

| Door | Exports |
| ---- | ------- |
| `@afenda/feature-system-admin/server` | `loadTenantExecutionRulesForOrganization`, settings list/upsert helpers, action-result helpers (via barrel) |
| `@afenda/feature-system-admin/client` | `SystemAdminActionResult` type only |

`server.ts` side-imports `policies/register-tenant-execution-policies.server.ts` so kernel evaluators are registered when the package loads.

Canonical doctrine: [ARCH-011](../../../../docs/architecture/011-system-admin-enterprise-architecture.md) · [ARCH-012](../../../../docs/architecture/012-execution-kernel-architecture.md).

Package as-built supplement: [`tenant-execution-architecture.md`](./tenant-execution-architecture.md) — update when implementation changes; do not delete.
