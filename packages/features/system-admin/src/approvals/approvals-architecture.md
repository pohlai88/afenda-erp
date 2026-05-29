### 9.8 Approvals

Parent: [ARCH-011 System Admin control plane](../../../../docs/architecture/011-system-admin-enterprise-architecture.md).

## Definition

Approvals define the human authorization path for governed ERP actions.

An approval rule answers:

```txt
Who must approve this action before it can continue?
```

Approvals do not decide whether approval is required.
Policies decide that.

Approvals define the route, sequence, approver roles, escalation timing, delegation rules, and completion requirements.

## Owns

Approvals owns:

* approval chain configuration
* approver role configuration
* escalation timing
* delegation settings
* minimum approval count
* sequential approval rules
* parallel approval rules
* approval timeout behavior
* approval replacement rules
* approval readiness review

## Does Not Own

Approvals does not own:

* permission enforcement
* policy condition evaluation
* business operation execution
* workflow task runtime
* user identity
* role definition
* audit event writing

Those belong to:

```txt
Execution Kernel
Policies
Orbit / Workflow
Users
Roles
Audit
Feature Modules
```

## Example Permission

```txt
system_admin.approvals.manage
```

Recommended split:

```txt
system_admin.approvals.read
system_admin.approvals.manage
system_admin.approvals.review
```

Phase 3 minimum:

```txt
system_admin.approvals.read
system_admin.approvals.manage
```

## Approval Rule Model

```ts
export type ApprovalRule = {
  id: string
  organizationId: string

  key: string
  name: string
  description?: string

  moduleKey: string
  action: string
  targetType: string

  approvalMode: "sequential" | "parallel"
  approverRoleKeys: string[]
  minApprovals: number

  escalationAfterHours?: number
  delegateToRoleKeys?: string[]

  status: "active" | "disabled" | "deprecated"

  createdAt: Date
  updatedAt: Date
}
```

## Approval Modes

| Mode         | Meaning                                          |
| ------------ | ------------------------------------------------ |
| `sequential` | Approvers act in a defined order.                |
| `parallel`   | Any required approvers can act at the same time. |

## Approval Relationship

```txt
Policy
  ↓ requires approval

Approval Rule
  ↓ defines approvers

Orbit / Workflow
  ↓ creates approval task

Execution Kernel
  ↓ blocks final execution until approved
```

## Approvals Page

Route:

```txt
/apps/system-admin/approvals
```

Purpose:

```txt
Configure who authorizes governed ERP actions.
```

Recommended columns:

```txt
Approval Rule
Module
Action
Mode
Approver Roles
Minimum Approvals
Escalation
Status
Readiness
Actions
```

## Approval Detail View

Should show:

```txt
Approval rule metadata
Affected policies
Affected capabilities
Approver roles
Delegation roles
Escalation timing
Recent approval activity
Readiness report
Audit history
```

## Approval Chain Examples

```txt
Purchase Order Above RM100,000
  Mode: sequential
  Step 1: Finance Manager
  Step 2: Director
```

```txt
Salary Change
  Mode: parallel
  Required: HR Manager + Finance Manager
  Minimum approvals: 2
```

```txt
Vendor Bank Account Change
  Mode: sequential
  Step 1: Finance Manager
  Step 2: Owner
  Escalate after: 24 hours
```

## Escalation Settings

Escalation defines what happens when approval is delayed.

Examples:

```txt
Notify backup approver after 24 hours
Escalate to department head after 48 hours
Expire request after 7 days
```

Recommended model extension:

```ts
type ApprovalEscalation = {
  afterHours: number
  escalationRoleKeys: string[]
  behavior: "notify" | "reassign" | "expire"
}
```

## Delegation Settings

Delegation allows temporary approver replacement.

Examples:

```txt
Finance Manager delegates to Senior Accountant
Owner delegates to Admin during leave period
```

Delegation should be:

```txt
time-limited
audited
role-aware
revocable
```

## Approval Runtime Flow

```txt
1. Feature requests protected action
2. Execution Kernel checks permission
3. Execution Kernel evaluates policy
4. Policy returns `require_approval`
5. Approval rule is resolved
6. Workflow / Orbit creates approval request
7. Approvers approve or reject
8. Execution Kernel allows final execution only after approval is complete
```

## Server Data Loader

```ts
export async function listSystemAdminApprovals() {
  const context = await requireExecutionContext()

  await requireExecutionPermission(
    context,
    "system_admin.approvals.read",
  )

  return listOrganizationApprovalRules({
    organizationId: context.organizationId,
  })
}
```

## Server Action Pattern

```ts
export async function updateApprovalRule(
  input: UpdateApprovalRuleInput,
) {
  const context = await requireExecutionContext()

  await requireExecutionPermission(
    context,
    "system_admin.approvals.manage",
  )

  const parsed = updateApprovalRuleInputSchema.parse(input)

  const result = await updateApprovalRuleInDb({
    organizationId: context.organizationId,
    actorId: context.userId,
    input: parsed,
  })

  await writeExecutionAuditEvent({
    organizationId: context.organizationId,
    actorId: context.userId,
    actorType: context.actorType,
    action: "system_admin.approval_rule.update",
    targetType: "approval_rule",
    targetId: parsed.approvalRuleId,
    metadata: {
      approvalMode: parsed.approvalMode,
      approverRoleKeys: parsed.approverRoleKeys,
      minApprovals: parsed.minApprovals,
      escalationAfterHours: parsed.escalationAfterHours,
    },
  })

  return result
}
```

## Zod Schemas

```ts
export const approvalModeSchema = z.enum([
  "sequential",
  "parallel",
])

export const updateApprovalRuleInputSchema = z.object({
  approvalRuleId: z.string().min(1),

  approvalMode: approvalModeSchema,

  approverRoleKeys: z.array(z.string().min(1)).min(1),

  minApprovals: z.number().int().min(1).max(10),

  escalationAfterHours: z
    .number()
    .int()
    .min(1)
    .max(720)
    .optional(),

  delegateToRoleKeys: z.array(z.string().min(1)).default([]),

  status: z.enum([
    "active",
    "disabled",
    "deprecated",
  ]),
})
```

## Safety Rules

Approvals must enforce:

1. Approval rules are organization-scoped.
2. Approval rules are audited.
3. Approver roles must exist and be active.
4. Deprecated roles cannot be used in new approval rules.
5. Minimum approvals cannot exceed available approver roles.
6. Disabled approval rules are ignored by Execution Kernel.
7. Deprecated approval rules cannot be newly activated casually.
8. Escalation roles must exist and be active.
9. Delegation must be time-limited and audited.
10. Execution Kernel remains final runtime authority.
11. Workflow / Orbit executes approval tasks, not System Admin.
12. Approval rule readiness must be visible.

## Definition of Done

Approvals is done when:

* administrators can view approval rules
* administrators can create approval rules
* administrators can update approval rules
* administrators can disable approval rules
* administrators can configure approver roles
* administrators can configure sequential or parallel approval mode
* administrators can configure minimum approval count
* administrators can configure escalation timing
* administrators can configure delegation settings
* invalid approver roles are rejected
* approval readiness verdicts are visible
* approval changes write audit events
* Execution Kernel can resolve active approval rules

## Minimum Tests

```txt
non-admin cannot view approvals
non-admin cannot update approval rules
approval update writes audit event
invalid approver role rejected
deprecated role rejected
min approvals greater than approver roles rejected
disabled approval rule ignored
sequential approval rule resolves correctly
parallel approval rule resolves correctly
escalation timing validates correctly
delegation settings validate correctly
require_approval policy resolves approval rule
```

## Final Architecture Statement

Policies answer:

```txt
Does this action require approval?
```

Approvals answer:

```txt
Who must approve it, in what order, and by when?
```

Orbit / Workflow answers:

```txt
How is the approval task executed and followed up?
```

Execution Kernel answers:

```txt
Can the action proceed after approval state is resolved?
```

Approvals is the authorization-routing configuration layer, not the workflow runtime itself.
