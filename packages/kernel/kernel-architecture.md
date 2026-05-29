# ERP Kernel Architecture

> **Frozen supplement — do not extend.** Canonical policy: [**ARCH-002 §3**](../../docs/architecture/002-erp-kernel-package-architecture.md) (maintenance). Active code: **`src/execution-kernel/`** only (**ARCH-002 §5**). Do not add business logic, HITL, or dual-kernel product behavior here.

## 1. Definition

The ERP Kernel is the shared execution foundation of Afenda.

It is not a business module, UI shell, workflow engine, or feature package. It is the common authority layer that every ERP module depends on to resolve:

* organization context
* tenant ownership
* user identity
* permissions
* policy
* audit evidence
* operational state
* module capability contracts
* safe execution boundaries

The kernel exists so that every ERP action is executed with the same truth rules.

## 2. Kernel Purpose

The ERP Kernel answers one question before any module performs work:

> Is this action allowed, owned, traceable, and valid inside the current organization context?

Every module may define its own domain logic, but no module should invent its own version of identity, permission, tenancy, policy, audit, or execution authority.

## 3. Kernel Responsibilities

The ERP Kernel owns:

| Area                 | Kernel Responsibility                                                     |
| -------------------- | ------------------------------------------------------------------------- |
| Organization Context | Resolve active organization, slug, tenant, membership, and session scope. |
| Identity             | Resolve current user and authenticated actor.                             |
| Access Control       | Resolve effective permissions, roles, and module access.                  |
| Policy               | Enforce durable business rules before execution.                          |
| Audit                | Emit structured audit evidence for meaningful actions.                    |
| Module Registry      | Define which ERP modules exist and what capabilities they expose.         |
| Capability Contract  | Map routes, actions, permissions, labels, and metadata.                   |
| Execution Guard      | Prevent unauthorized or contextless server actions.                       |
| Error Semantics      | Normalize access denied, not found, invalid state, and unsafe execution.  |
| Operational State    | Provide common state vocabulary for ERP records and workflows.            |

## 4. What the Kernel Does Not Own

The ERP Kernel does not own:

* HRM employee business logic
* accounting posting rules
* inventory stock movement calculation
* CRM opportunity stages
* contacts-specific data quality rules
* UI page composition
* module-specific forms and tables
* marketing copy
* workflow orchestration detail

Those belong to feature modules.

The kernel only provides the shared laws those modules must obey.

## 5. Recommended Package Boundary

```txt
packages/
  erp-kernel/
    src/
      context/
      identity/
      permissions/
      policy/
      audit/
      capabilities/
      modules/
      execution/
      errors/
      state/
      index.ts
```

For current Afenda structure, this can also exist as:

```txt
src/features/erp-kernel/
```

But long term, `packages/erp-kernel` is cleaner if Afenda is moving toward modular-monolith packages.

## 6. Public API

The kernel should expose a small, stable API.

```ts
export {
  requireErpContext,
  resolveErpContext,
} from "./context"

export {
  resolveEffectiveErpPermissions,
  requireErpPermission,
} from "./permissions"

export {
  assertErpPolicy,
  resolveErpPolicyVerdict,
} from "./policy"

export {
  writeErpAuditEvent,
} from "./audit"

export {
  defineErpModule,
  defineErpCapability,
  getErpCapability,
  listErpModules,
} from "./capabilities"

export {
  ErpAccessDeniedError,
  ErpInvalidStateError,
  ErpContextRequiredError,
} from "./errors"
```

Do not expose internal helpers broadly.

## 7. Core Data Model

### ErpContext

```ts
export type ErpContext = {
  organizationId: string
  organizationSlug: string
  userId: string
  membershipId: string
  locale: string
  actorType: "user" | "system" | "agent"
}
```

### ErpCapability

```ts
export type ErpCapability = {
  key: string
  moduleKey: string
  label: string
  description: string
  route: string
  requiredPermission: string
  auditArea: string
  status: "active" | "preview" | "deprecated"
}
```

### ErpAuditEvent

```ts
export type ErpAuditEvent = {
  organizationId: string
  actorId: string
  action: string
  targetType: string
  targetId?: string
  reason?: string
  metadata?: Record<string, unknown>
}
```

## 8. Execution Flow

Every protected ERP action should follow this order:

```txt
1. Resolve ERP context
2. Resolve permission
3. Resolve policy verdict
4. Validate input
5. Execute domain operation
6. Write audit event
7. Revalidate affected surfaces
8. Return safe result
```

Example:

```ts
export async function updateEmployeeRecord(input: UpdateEmployeeInput) {
  const context = await requireErpContext()

  await requireErpPermission(context, "hrm.employee.update")

  await assertErpPolicy(context, {
    action: "hrm.employee.update",
    targetType: "employee",
    targetId: input.employeeId,
  })

  const result = await updateEmployeeRecordInDb({
    context,
    input,
  })

  await writeErpAuditEvent({
    organizationId: context.organizationId,
    actorId: context.userId,
    action: "hrm.employee.update",
    targetType: "employee",
    targetId: input.employeeId,
  })

  return result
}
```

## 9. Module Relationship

ERP modules depend on the kernel.

The kernel must not depend on ERP modules.

```txt
HRM ─────────────┐
Inventory ──────┤
Accounting ─────┤
Contacts ───────┤
Orbit ──────────┤
                 ▼
              ERP Kernel
```

Allowed:

```ts
import { requireErpContext } from "#features/erp-kernel"
```

Not allowed:

```ts
// inside erp-kernel
import { getEmployee } from "#features/hrm"
```

## 10. Capability Registry

Each module should register capabilities through a governed contract.

```ts
export const hrmModule = defineErpModule({
  key: "hrm",
  label: "Human Resources",
  capabilities: [
    defineErpCapability({
      key: "hrm.employee.records",
      moduleKey: "hrm",
      label: "Employee records",
      route: "/apps/hrm/employees",
      requiredPermission: "hrm.employee.read",
      auditArea: "hrm",
      status: "active",
    }),
  ],
})
```

This registry can later power:

* navigation
* command palette
* access checks
* docs
* onboarding demo pages
* audit coverage
* module readiness reports

## 11. Error Model

The kernel should provide typed errors:

```ts
ErpContextRequiredError
ErpAccessDeniedError
ErpPolicyDeniedError
ErpInvalidStateError
ErpCapabilityNotFoundError
```

UI routes can translate these into:

* access denied page
* not found
* inline section failure
* audit-safe error message

## 12. Governance Rules

The ERP Kernel must follow these rules:

1. No UI components inside the kernel.
2. No module-specific business logic inside the kernel.
3. No direct dependency on HRM, Inventory, Accounting, Contacts, or Orbit.
4. Every server mutation must resolve context before execution.
5. Every sensitive mutation must produce audit evidence.
6. Permissions must be declared, not hardcoded randomly in pages.
7. Capabilities must be discoverable from metadata.
8. Kernel APIs must remain small and stable.
9. Internal helpers stay internal.
10. Kernel changes require ADR or ATC coverage when they affect execution law.

## 13. Suggested File Structure

```txt
erp-kernel/
  context/
    erp-context.server.ts
    erp-context.schema.ts

  identity/
    erp-actor.server.ts
    erp-actor.schema.ts

  permissions/
    erp-permission.server.ts
    erp-permission.schema.ts
    erp-permission-verdict.ts

  policy/
    erp-policy.server.ts
    erp-policy-verdict.ts

  audit/
    erp-audit-event.server.ts
    erp-audit-action.ts

  capabilities/
    erp-capability.schema.ts
    erp-capability.registry.ts
    define-erp-capability.ts

  modules/
    erp-module.schema.ts
    erp-module.registry.ts
    define-erp-module.ts

  execution/
    erp-action-guard.server.ts
    erp-mutation-result.ts

  errors/
    erp-errors.ts

  state/
    erp-operational-state.ts

  index.ts
```

## 14. Recommended Upgrade Roadmap

### Phase 1 — Extract Context and Permissions

Create:

```txt
context/
permissions/
errors/
```

Goal:

* one way to resolve ERP context
* one way to check permission
* one shared access denied model

### Phase 2 — Add Capability Registry

Create:

```txt
capabilities/
modules/
```

Goal:

* navigation, command palette, and route access use the same capability metadata

### Phase 3 — Add Audit Contract

Create:

```txt
audit/
```

Goal:

* all meaningful mutations emit structured audit evidence

### Phase 4 — Add Policy Verdicts

Create:

```txt
policy/
```

Goal:

* separate “permission allowed” from “business policy allowed”

Example:

```txt
Permission says: user can update employee records.
Policy says: this employee record is locked due to payroll finalization.
```

### Phase 5 — Add Execution Guard

Create:

```txt
execution/
```

Goal:

* standard wrapper for guarded ERP server actions and mutations

## 15. Final Architecture Statement

The ERP Kernel is Afenda’s execution law.

Feature modules own business behavior.
The AppShell owns navigation and operating surfaces.
The Kernel owns whether an action is valid, allowed, owned, governed, and auditable.

A module without the kernel is only a feature.
A module with the kernel becomes part of the ERP truth engine.
