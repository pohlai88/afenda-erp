### 9.7 Policies

Parent: [ARCH-1006 System Admin control plane](../../../../docs/architecture/1006-control-plane.md).

## Definition

Policies define governed business rules that influence ERP execution.

A policy determines whether an action is:

* allowed
* denied
* locked
* requires approval
* requires warning
* requires exception handling

Policies are configuration.

Policies do not execute business logic.

Policies do not perform approvals.

Policies define the business law that the Execution Kernel evaluates during execution.

## Owns

Policies owns:

* policy configuration
* policy threshold settings
* lock rules
* exception rules
* approval requirements
* policy lifecycle management
* policy applicability review
* policy coverage review
* policy dependency visibility
* policy governance auditability

## Does Not Own

Policies does not own:

* approval routing
* approval execution
* permission enforcement
* role assignment
* workflow execution
* business operations
* audit event writing

Those belong to:

```txt
Approvals
Execution Kernel
Permissions
Roles
Orbit / Workflow
Audit
Feature Modules
```

## Example

```txt
System Admin:
Payroll finalization locks employee compensation changes.

Execution Kernel:
Blocks hrm.compensation.update when payroll is finalized.
```

Another example:

```txt
System Admin:
Salary increase above 15% requires approval.

Execution Kernel:
Returns require_approval verdict.

Approval Engine:
Routes approval request.
```

## Example Permission

```txt
system_admin.policies.manage
```

Recommended split:

```txt
system_admin.policies.read
system_admin.policies.manage
system_admin.policies.review
```

Phase 3 minimum:

```txt
system_admin.policies.read
system_admin.policies.manage
```

## Policy Model

```ts
export type ExecutionPolicyRule = {
  id: string

  organizationId: string

  key: string
  name: string
  description?: string

  moduleKey: string

  action: string
  targetType: string

  effect:
    | "allow"
    | "deny"
    | "lock"
    | "require_approval"
    | "warn"

  condition: Record<string, unknown>

  priority: number

  status:
    | "active"
    | "disabled"
    | "deprecated"

  createdAt: Date
  updatedAt: Date
}
```

## Policy Effects

| Effect           | Meaning                                             |
| ---------------- | --------------------------------------------------- |
| allow            | Explicitly allow execution                          |
| deny             | Prevent execution                                   |
| lock             | Prevent modification because record/state is locked |
| require_approval | Execution requires approval process                 |
| warn             | Execution allowed but warning generated             |

## Policy Relationship

```txt
Module
  ↓

Capability
  ↓

Policy
  ↓

Approval Requirement
  ↓

Execution Kernel
```

Example:

```txt
Capability
  Compensation Update

Policy
  Salary Increase > 15%

Effect
  require_approval
```

## Policy Categories

Recommended categories:

### Lock Policies

```txt
Payroll Finalization Lock
Closed Accounting Period Lock
Inventory Freeze Lock
```

### Threshold Policies

```txt
Purchase Order Threshold
Salary Increase Threshold
Credit Limit Threshold
```

### Compliance Policies

```txt
MFA Required
Sensitive Change Confirmation
Vendor Verification Required
```

### Exception Policies

```txt
Emergency Inventory Adjustment
Executive Override
After-Hours Approval
```

## Policies Page

Route:

```txt
/apps/system-admin/policies
```

Purpose:

```txt
Review and configure business execution law.
```

Recommended columns:

```txt
Policy
Module
Effect
Priority
Status
Capabilities
Coverage
Last Updated
Actions
```

## Policy Detail View

Should show:

```txt
Policy metadata
Affected capabilities
Affected permissions
Policy condition
Policy effect
Related approval rules
Related exceptions
Audit history
Coverage report
```

This becomes the business-law truth page.

## Policy Evaluation Flow

```txt
1. Feature requests execution
2. Execution Kernel resolves context
3. Execution Kernel resolves permissions
4. Execution Kernel evaluates policies
5. Execution Kernel returns verdict
6. Feature proceeds or stops
```

Example:

```txt
Action
  hrm.compensation.update

Policy
  Payroll Finalization Lock

Verdict
  lock

Result
  Execution denied
```

## Threshold Rule Example

```txt
Policy
  Purchase Order Above RM100,000

Condition
  amount > 100000

Effect
  require_approval
```

Execution Kernel:

```txt
Verdict:
  require_approval
```

Approval engine handles next steps.

## Exception Rule Example

```txt
Policy
  Emergency Inventory Adjustment

Condition
  emergency = true

Effect
  allow
```

Priority:

```txt
Exception policy overrides normal lock policy.
```

## Policy Priority

Policies should evaluate in priority order.

```txt
Higher priority wins.
```

Example:

```txt
Payroll Lock
Priority 100

Emergency Executive Override
Priority 1000
```

Result:

```txt
Executive Override wins.
```

## Readiness Review

Policies should expose readiness.

```ts
export type PolicyReadinessVerdict =
  | "ready"
  | "warning"
  | "blocked"
```

Checks:

```txt
Referenced module exists
Referenced capability exists
Referenced action exists
Condition valid
Approval references valid
No dependency conflict
```

## Policy Coverage Review

Policies should show:

```txt
What capabilities are governed?
What approvals are triggered?
What exceptions exist?
```

Example:

```txt
Policy
  Salary Increase Threshold

Capabilities
  Compensation Update

Approval Rules
  HR Director Approval

Exceptions
  Executive Override
```

## Server Data Loader

```ts
export async function listSystemAdminPolicies() {
  const context =
    await requireExecutionContext()

  await requireExecutionPermission(
    context,
    "system_admin.policies.read",
  )

  return listOrganizationPolicies({
    organizationId: context.organizationId,
  })
}
```

## Server Action Pattern

```ts
export async function updatePolicyRule(
  input: UpdatePolicyRuleInput,
) {
  const context =
    await requireExecutionContext()

  await requireExecutionPermission(
    context,
    "system_admin.policies.manage",
  )

  const parsed =
    updatePolicyRuleInputSchema.parse(
      input,
    )

  const result =
    await updatePolicyRuleInDb({
      organizationId: context.organizationId,
      actorId: context.userId,
      input: parsed,
    })

  await writeExecutionAuditEvent({
    organizationId: context.organizationId,
    actorId: context.userId,
    actorType: context.actorType,

    action:
      "system_admin.policy.update",

    targetType: "policy",
    targetId: parsed.policyId,
  })

  return result
}
```

## Zod Schemas

```ts
export const updatePolicyRuleInputSchema =
  z.object({
    policyId: z.string().min(1),

    effect: z.enum([
      "allow",
      "deny",
      "lock",
      "require_approval",
      "warn",
    ]),

    priority: z.number().int(),

    status: z.enum([
      "active",
      "disabled",
      "deprecated",
    ]),
  })
```

## Safety Rules

Policies must enforce:

1. Policies are organization-scoped.
2. Policy changes are audited.
3. Policy definitions must be valid before activation.
4. Disabled policies are ignored by Execution Kernel.
5. Deprecated policies cannot be newly activated casually.
6. Priority conflicts are visible.
7. Missing capability references are flagged.
8. Missing approval references are flagged.
9. Policy readiness verdicts are visible.
10. Execution Kernel remains the only runtime evaluator.

## Definition of Done

Policies is done when:

* administrators can view policy catalog
* administrators can create policies
* administrators can update policies
* administrators can disable policies
* administrators can review thresholds
* administrators can review lock rules
* administrators can review exception rules
* policy readiness verdicts are visible
* policy coverage is visible
* policy priority is visible
* policy changes write audit events
* Execution Kernel consumes active policies

## Minimum Tests

```txt
non-admin cannot view policies
non-admin cannot update policies
policy update writes audit event
disabled policy ignored by Execution Kernel
invalid policy blocked
missing capability reference flagged
missing approval reference flagged
priority conflict detected
require_approval verdict generated correctly
lock verdict generated correctly
```

## Final Architecture Statement

Policies answer:

```txt
What business law governs this action?
```

Approvals answer:

```txt
Who must authorize the action?
```

Permissions answer:

```txt
Who may attempt the action?
```

Capabilities answer:

```txt
What business function is being performed?
```

Execution Kernel answers:

```txt
Can this action execute right now, and under what conditions?
```

Policies become Afenda's configurable business-law layer, while the Execution Kernel remains the sole runtime authority.
