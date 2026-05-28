# ARCH-012 · Execution Kernel Architecture

**Doc ID:** `ARCH-012` · **File:** `012-execution-kernel-architecture.md`

| Field     | Value                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------ |
| Status    | Active — execution authority doctrine with as-built kernel package implementation (May 2026)          |
| Authority | Shared ERP execution context, access, policy, capability, audit, and guarded mutation contracts       |
| Defers to | **ARCH-002** for package boundaries · **ARCH-001** for runtime/auth/deployment · **ARCH-011** for System Admin control plane |
| Related   | **ARCH-006**/**ARCH-007** (governed UI) · **ARCH-009** (Lynx) · **ARCH-005** (tenant schema ownership) |

The Execution Kernel is Afenda's shared ERP execution authority. It is not a
System Admin feature, not a UI shell, and not a business module. It is the
internal infrastructure layer that determines whether a protected ERP action is
valid, allowed, tenant-scoped, policy-compliant, and auditable.

## Core Principle

> System Admin configures the law.  
> Execution Kernel enforces the law.  
> Feature modules execute business behavior.

This separation prevents System Admin from becoming a hidden dependency inside
finance, inventory, HR, CRM, approvals, Lynx, or future module packages.

## Relationship to System Admin

`ARCH-012` is the enforcement companion to **ARCH-011**.

| Concern | System Admin owns | Execution Kernel owns |
| ------- | ----------------- | --------------------- |
| User and membership administration | invites, deactivation, membership changes, role assignment workflows | actor and membership context resolution at execution time |
| Capability administration | visibility, review, and configuration posture | canonical capability contract and access verdicts |
| Policy administration | policy settings, lock rules, thresholds, approval law | policy evaluator contract and runtime verdict |
| Audit review | search, filters, export, evidence review | audit event contract and audit writes |

The control rule is stable:

> System Admin writes configuration.  
> Execution Kernel reads shared contracts and enforces them.

## Repo Boundary

The canonical implementation lives in `@afenda/kernel` under:

```txt
packages/kernel/src/execution-kernel/
  context/
  actor/
  access/
  policy/
  audit/
  capabilities/
  execution/
  errors/
  state/
```

Server-only execution APIs are imported through:

```ts
import { requireExecutionContext } from "@afenda/kernel/server";
```

Do not import System Admin feature code into the kernel. The kernel may depend
on `@afenda/auth` and `@afenda/db`, but not on
`@afenda/feature-system-admin`.

## Configuration Inputs

The Execution Kernel may enforce configuration that System Admin manages, but
it must do so through shared contracts and storage layers rather than feature
package imports.

Allowed configuration inputs:

- capability catalogs and effective permissions from `@afenda/auth`;
- tenant and membership context from `@afenda/auth` and `@afenda/db`;
- policy, override, or control-plane data from shared tables or platform
  services;
- audit persistence through `@afenda/db`.

Not allowed:

- importing `@afenda/feature-system-admin/server`;
- reaching into System Admin UI models or page helpers;
- coupling kernel verdicts to admin route components.

## Ownership

| Layer | Owns | Does not own |
| ----- | ---- | ------------ |
| Execution Kernel | execution context, actor resolution, permission verdicts, policy verdict contracts, guarded execution wrapper, capability registry, audit contract, typed execution errors, shared state vocabulary | admin pages, role editor UI, module settings screens, feature business rules |
| System Admin | users, memberships, roles, permissions, modules, capability visibility, policy configuration, approvals, audit viewer, security, organization settings, integrations, diagnostics | low-level execution primitives |
| Feature modules | business commands, query services, module workflows, module schemas, module-specific policy evaluators | identity, tenancy, permission engine, shared audit contract |
| App routes | page composition, route handlers, revalidation wiring, presentation | enforcement authority |

## Execution Context

The execution context is the minimum protected authority contract:

```ts
export type ExecutionContext = {
  organizationId: string;
  organizationSlug: string;
  userId: string;
  membershipId: string;
  locale: string;
  actorType: "user" | "system" | "agent";
};
```

As-built implementation details:

- `organizationId`, `organizationSlug`, role, and capabilities resolve from the
  active authenticated organization in `@afenda/auth`.
- `membershipId` comes from `organization_memberships`, not from the client.
- `locale` comes from tenant settings when available and otherwise falls back to
  the tenant default.
- Current runtime resolves `actorType` as `"user"` for session-driven requests;
  the contract already allows future `"system"` and `"agent"` execution paths.

Primary APIs:

```ts
resolveExecutionContext()
requireExecutionContext()
```

These functions are server-only and presentation-neutral. They throw typed
execution errors instead of redirecting or rendering UI.

## Access Contract

Permission checks remain server authority. System Admin manages the source
configuration; the Execution Kernel evaluates the effective verdict.

Primary APIs:

```ts
resolveExecutionAccessVerdict(context, "hr.view")
requireExecutionPermission(context, "hr.view")
```

Verdict shape:

```ts
export type ExecutionAccessVerdict = {
  allowed: boolean;
  permission: AppCapability;
  reason?: string;
};
```

Routes and actions may present denied state differently, but the denial verdict
must come from the server.

## Policy Contract

Permission is necessary but not sufficient. A user may have access to a record
and still be blocked by operational state, posting locks, approval freezes, or
other feature-owned business policy.

Primary APIs:

```ts
defineExecutionPolicy("finance.period.close", evaluator)
assertExecutionPolicy(context, {
  action: "finance.period.close",
  targetType: "erp-record",
  targetId: recordId,
})
```

Verdict shape:

```ts
export type ExecutionPolicyVerdict = {
  allowed: boolean;
  action: string;
  targetType: string;
  targetId?: string;
  reason?: string;
};
```

The kernel owns the policy verdict contract and evaluation flow. Feature modules
own the business evaluators that register against module actions.

## Capability Contract

Execution capabilities describe what the ERP can do and which permission gates
each capability requires. The capability registry is shared metadata for:

- App shell navigation
- System Admin control surfaces
- Command routing
- Documentation and audit coverage
- Access review and simulation

Capability shape:

```ts
export type ExecutionCapability = {
  key: string;
  moduleKey: string;
  label: string;
  description?: string;
  route?: string;
  requiredPermission: AppCapability;
  auditArea: string;
  status: "active" | "preview" | "deprecated";
};
```

As-built behavior:

- Built-in capabilities are seeded from the current app capability catalog and
  kernel module registry.
- System Admin child routes have explicit route mappings.
- Custom capability entries may be declared through
  `defineExecutionCapability(...)`.

## Audit Contract

The kernel defines the audit event envelope used by protected mutations:

```ts
export type ExecutionAuditEvent = {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  action: string;
  targetType: string;
  targetId?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
};
```

Current implementation writes through `@afenda/db` tenant audit logs. Where the
current physical audit schema uses a narrower entity-type enum, the execution
kernel normalizes target types and preserves the original target type in audit
metadata.

Primary API:

```ts
writeExecutionAuditEvent(...)
```

## Guarded Execution Flow

Every sensitive server-side mutation should follow this sequence:

1. Resolve execution context.
2. Validate and normalize input.
3. Check permission.
4. Check policy.
5. Execute feature operation.
6. Write audit evidence.
7. Revalidate affected surfaces.
8. Return a safe result.

The shared wrapper is:

```ts
runGuardedExecution({
  action: "hrm.employee.update",
  permission: "hr.view",
  input,
  parse,
  resolveTarget,
  execute,
  revalidate,
})
```

This wrapper is not a substitute for module business logic. It standardizes the
protection envelope around that logic.

## Error Model

The kernel owns typed execution failures:

- `ExecutionContextRequiredError`
- `ExecutionAccessDeniedError`
- `ExecutionPolicyDeniedError`
- `ExecutionInvalidStateError`
- `ExecutionCapabilityNotFoundError`

Routes and packages decide presentation. The kernel decides classification.

## Operational State Vocabulary

Shared execution state words are bounded:

```txt
detected
owned
blocked
resolving
ready_to_release
released
resolved
deprecated
```

Feature modules may extend local state, but shared execution vocabulary should
not drift by ad hoc synonyms.

## Dependency Rules

Allowed:

```ts
import { requireExecutionContext } from "@afenda/kernel/server";
import { listExecutionCapabilities } from "@afenda/kernel/server";
```

Not allowed:

```ts
import { getRoleSettings } from "@afenda/feature-system-admin/server";
```

The kernel may read shared auth and database contracts. It must not import
System Admin feature code.

## Governance Rules

1. The execution kernel must not import System Admin.
2. The execution kernel must not contain admin screens.
3. Feature modules must use kernel contracts for protected execution.
4. Access and policy checks happen on the server.
5. Capability metadata is declared, not scattered across routes.
6. Sensitive mutations produce audit evidence.
7. Kernel contract changes require architecture-doc updates and test coverage.

## Current Implementation Scope

The current repository now includes:

- execution context resolution with membership and locale support;
- structured access verdicts and permission requirement helpers;
- policy evaluator registry and denial contract;
- capability registry seeded from the current capability catalog;
- execution audit contract backed by tenant audit logs;
- guarded execution wrapper for protected server mutations;
- typed execution errors and shared execution state vocabulary.

Broad route migration is intentionally deferred. Existing route-level
`requireCapability(...)` usage remains valid until feature packages and app
routes adopt the execution-kernel wrapper where it adds protection and reuse.
