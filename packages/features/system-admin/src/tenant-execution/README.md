# Tenant execution (execution bridge)

Cross-cutting infrastructure — not a System Admin route or nav vertical.

| Bucket | Role |
| ------ | ---- |
| `contracts/` | Shared Server Action result envelope (`SystemAdminActionResult`) and execution-settings configuration helpers |
| `data/` | Organization-scoped execution settings persistence (`tenant_*` tables via `@afenda/db`) |
| `policies/` | Execution Kernel registration, org rule loader, and shared capability resolution |
| `tests/` | Package tests for bridge, repository, and shared helper behavior |

| Door | Exports |
| ---- | ------- |
| `@afenda/feature-system-admin/server` | `loadTenantExecutionRulesForOrganization`, settings list/upsert helpers, action-result helpers (via barrel) |
| `@afenda/feature-system-admin/client` | `SystemAdminActionResult` type only |

`server.ts` side-imports `policies/register-tenant-execution-policies.server.ts` so kernel evaluators are registered when the package loads.

Canonical doctrine: [ARCH-011](../../../../docs/architecture/011-system-admin-enterprise-architecture.md) · [ARCH-002 §5](../../../../docs/architecture/002-erp-kernel-package-architecture.md#5-execution-kernel).

Package as-built supplement: [`tenant-execution-architecture.md`](./tenant-execution-architecture.md) — update when implementation changes; do not delete.
