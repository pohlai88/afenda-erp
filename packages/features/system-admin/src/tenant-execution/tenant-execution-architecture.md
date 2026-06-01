### 9.16 Tenant execution (execution bridge)

Parent: [ARCH-011 System Admin control plane](../../../../docs/architecture/011-system-admin-enterprise-architecture.md) · [ARCH-002 §5 Execution Kernel](../../../../docs/architecture/002-erp-kernel-package-architecture.md#5-execution-kernel).

## Definition

Tenant execution is the **cross-cutting bridge** between System Admin configuration and the Execution Kernel.

It is not a navigable System Admin section. It has no hub card, no governed list route, and no dedicated capability family for end users.

It answers:

```txt
How does organization-scoped execution law reach the kernel at runtime?
```

Scope is always **`organizationId`** (Afenda tenancy boundary). The `tenant_*` table and API names are persistence vocabulary; product tenancy is the organization.

## Owns

Tenant execution owns:

* registration of organization policy/approval evaluators with `@afenda/kernel/execution`
* loading active policy and approval rules for an organization into kernel records
* thin persistence adapters for org execution settings tables (`tenant_policy_settings`, `tenant_approval_settings`, `tenant_module_settings`, `tenant_capability_settings`, …)
* the shared System Admin Server Action result envelope (`SystemAdminActionResult`)

## Does Not Own

Tenant execution does not own:

* policy or approval **UI** verticals (configure in `policies/`, `approvals/`, `modules/`, `capabilities/`)
* permission checks for admin pages (vertical `policies/` and `overview/policies/`)
* workflow task runtime or approval task execution (Orbit / workflows)
* Drizzle schema or migrations (`@afenda/db`)
* kernel verdict algorithms (`@afenda/kernel/execution-tenant-policy`)
* audit event authoring in vertical actions (callers write audit; bridge does not)

Those belong to:

```txt
Policies vertical
Approvals vertical
Modules / Capabilities verticals
@afenda/db
@afenda/kernel
Workflows / Orbit
```

## Core Principle

System Admin **configures** execution law.

The Execution Kernel **enforces** execution law.

Tenant execution **connects** the two:

```txt
Admin UI mutation → tenant_* settings row → loader → kernel evaluator → allow | deny | require_approval
```

## Responsibilities (three layers)

### 1. Kernel bridge (`policies/`)

| Artifact | Role |
| -------- | ---- |
| `register-tenant-execution-policies.server.ts` | Side effect on package load: registers tenant execution policy evaluator |
| `system-admin.tenant-execution-rules.loader.server.ts` | `loadTenantExecutionRulesForOrganization(organizationId)` — cached per request |

Flow:

```txt
Protected execution in ERP
  → kernel asks registered evaluators
  → loader reads org policy + approval rows from DB
  → maps to TenantPolicyRuleRecord / TenantApprovalRuleRecord
  → resolveTenantExecutionPolicyVerdict(...)
```

Overview and diagnostics may call the same loader for read-only “what law is loaded” snapshots.

### 2. Execution settings adapter (`data/`)

| Artifact | Role |
| -------- | ---- |
| `system-admin.execution-settings.repository.server.ts` | Delegates to `@afenda/db` list/upsert for org execution settings |

Consumed by vertical page models and actions (policies, approvals, modules, capabilities, diagnostics). Writes here are **configuration**, not kernel callbacks.

### 3. Action result contract (`contracts/`)

| Artifact | Role |
| -------- | ---- |
| `system-admin.action-result.contract.ts` | `SystemAdminActionResult`, `systemAdminActionSuccess`, `systemAdminActionFailure`, `zodActionFailure` |
| `system-admin.execution-settings.shared.ts` | Configuration record readers, form optional values, `MINUTES_PER_HOUR` |

Shared execution-settings helpers are environment-neutral and reused by policy/approval mappers and actions.

### 4. Execution capability bridge (`policies/`)

| Artifact | Role |
| -------- | ---- |
| `system-admin.execution-capability.shared.server.ts` | `resolveExecutionCapabilityForAction` — shared by policy/approval detail, readiness, and diagnostics |

## Package layout (as-built)

```txt
tenant-execution/
  README.md
  tenant-execution-architecture.md
  index.ts
  contracts/
    index.ts
    system-admin.action-result.contract.ts
    system-admin.execution-settings.shared.ts
  data/
    index.ts
    system-admin.execution-settings.repository.server.ts
  policies/
    index.ts
    register-tenant-execution-policies.server.ts
    system-admin.execution-capability.shared.server.ts
    system-admin.tenant-execution-rules.loader.server.ts
  tests/
```

No `actions/`, `components/`, `surface/`, or `schemas/` buckets — by design (infrastructure slice, not a UI vertical).

## Public export doors

| Door | What to import |
| ---- | -------------- |
| `@afenda/feature-system-admin/server` | Barrel: loader, registration helper, settings lists, action-result helpers |
| `@afenda/feature-system-admin/client` | `SystemAdminActionResult` type only |

`server.ts` must keep the side import:

```ts
import "./tenant-execution/policies/register-tenant-execution-policies.server";
```

Verticals should prefer their own `data/` for domain queries; use `tenant-execution/data` only for shared `tenant_*` settings access.

## Data model (persistence)

Organization-scoped rows (examples):

| Table | Configured by vertical |
| ----- | -------------------- |
| `tenant_policy_settings` | Policies |
| `tenant_approval_settings` | Approvals |
| `tenant_module_settings` | Modules |
| `tenant_capability_settings` | Capabilities |

Kernel mapper functions live in the owning vertical (`policies/data`, `approvals/data`). The loader composes those mappers; it does not embed domain rules.

## Relationship to ARCH-011 / ARCH-002 §5

| Layer | Question |
| ----- | -------- |
| ARCH-011 (control plane) | Who configures law? |
| Tenant execution (this slice) | How does configured law reach the kernel? |
| ARCH-002 §5 (execution kernel) | What is the verdict at runtime? |

When control vs execution boundaries change, update **ARCH-011**, **ARCH-002** §§4–5, and this supplement together.

## Safety rules

1. Every settings read/write is scoped by `organizationId` from server session — never from client input alone.
2. Registration runs once per process; evaluators must be idempotent.
3. Loader results must exclude disabled/invalid rules per vertical mapper rules before kernel sees them.
4. `SystemAdminActionResult` must remain environment-neutral on `./client` (types only).
5. Do not add UI or metadata surfaces under `tenant-execution/` — use domain verticals.
6. Do not bypass vertical policies when mutating settings; vertical actions own authorization and audit.

## Definition of done

Tenant execution is done when:

* kernel evaluators register when `@afenda/feature-system-admin/server` loads
* active org policy and approval rules load for kernel verdict resolution
* verticals can list/upsert execution settings through the repository adapter
* all System Admin mutations use the shared action result envelope
* overview/diagnostics can inspect loaded rule sets for the current org
* package layout and this document stay aligned with as-built code

## Minimum tests

```txt
evaluator registration is idempotent
loader returns only active mappable policy/approval rules
loader is scoped by organizationId
settings repository delegates to @afenda/db without widening scope
action result helpers match governed-surface ActionResult contract
```

## Final architecture statement

Policies and approvals verticals answer:

```txt
What law should this organization run under?
```

Tenant execution answers:

```txt
How does that law get into the Execution Kernel for every protected action?
```

The Execution Kernel answers:

```txt
What is the runtime verdict for this action right now?
```

Tenant execution is the **wiring layer**, not a fourth admin product surface.
