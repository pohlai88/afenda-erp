### 9.8 Approvals

Parent: [ARCH-1006 System Admin control plane](../../../../docs/architecture/1006-control-plane.md).

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
system-admin.approvals.manage
```

Recommended split:

```txt
system-admin.approvals.read
system-admin.approvals.manage
system-admin.approvals.review
```

Phase 3 minimum (as-built):

```txt
system-admin.approvals.read
system-admin.approvals.manage
```

Phase 4 capability plumbing (shipped):

```txt
system-admin.approvals.review
```

`system-admin.approvals.review` grants read-path access to catalog and detail surfaces without `manage`. Deprecated rules reactivate only through `reactivateDeprecatedSystemAdminApprovalRuleAction`, which requires strict `system-admin.approvals.review` (mirrors `system-admin.audit.review`).

## Operator queue (same page)

The unified route `/system-admin/approvals` also hosts the **operator approval queue** for tenant work items (`approvals.view` / `approvals.decide`). Rule configuration requires `system-admin.approvals.read` or stronger; operators with only `approvals.view` see the queue without the rules catalog or editor.

Legacy `/approvals` redirects to `/system-admin/approvals`. Work-item detail routes remain at `/approvals/work-items/[workItemId]`.

Surface key: `system-admin.approvals.queue.list`. Decision actions: `decideSystemAdminApprovalWorkItemAction`.

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
/system-admin/approvals
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

Shows:

```txt
Approval rule metadata
Affected policies
Affected capabilities
Approver roles
Delegation roles and valid days
Escalation hours, behavior, and escalation roles
Recent approval activity (audit-backed configuration events)
Readiness verdict
Audit history link
```

Runtime workflow task execution remains in Orbit/workflow; configuration activity is sourced from tenant audit logs for the approval rule key.

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
    "system-admin.approvals.read",
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
    "system-admin.approvals.manage",
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
    action: "system-admin.approval_rule.update",
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

---

## Functional Requirements (SUC-001..030)

| Code | Requirement |
| ---- | ----------- |
| **SUC-001** | System shall allow authorized administrators to view the organization approval rule catalog. |
| **SUC-002** | System shall allow authorized administrators to create approval rules. |
| **SUC-003** | System shall allow authorized administrators to update approval rules. |
| **SUC-004** | System shall allow authorized administrators to disable approval rules without deleting history. |
| **SUC-005** | System shall allow approver roles to be configured on each approval rule. |
| **SUC-006** | System shall support sequential approval mode configuration. |
| **SUC-007** | System shall support parallel approval mode configuration. |
| **SUC-008** | System shall support minimum approval count configuration. |
| **SUC-009** | System shall support escalation timing configuration in hours. |
| **SUC-010** | System shall support delegation role configuration. |
| **SUC-011** | System shall reject invalid approver roles at validation time. |
| **SUC-012** | System shall prevent casual reactivation of deprecated approval rules. |
| **SUC-013** | System shall reject minimum approvals greater than configured approver roles. |
| **SUC-014** | System shall exclude disabled approval rules from Execution Kernel resolution. |
| **SUC-015** | System shall prevent enabling deprecated approval rules for new assignments. |
| **SUC-016** | System shall serialize sequential approval rules for kernel runtime resolution. |
| **SUC-017** | System shall serialize parallel approval rules for kernel runtime resolution. |
| **SUC-018** | System shall validate escalation timing between 1 and 720 hours. |
| **SUC-019** | System shall validate delegation role keys against organization roles. |
| **SUC-020** | System shall resolve active approval rules when policies or targets require approval. |
| **SUC-021** | System shall display approval readiness verdicts on the catalog surface. |
| **SUC-022** | System shall write audit evidence for approval rule mutations. |
| **SUC-023** | System shall scope approval rules to the server-derived organization context. |
| **SUC-024** | System shall provide an approval rule detail view with governed metadata. |
| **SUC-025** | System shall show related policies on the approval detail view. |
| **SUC-026** | System shall show affected capability context on the approval detail view. |
| **SUC-027** | System shall enforce `system-admin.approvals.read`, `system-admin.approvals.review`, and `system-admin.approvals.manage` server-side. |
| **SUC-028** | System shall render the approval catalog through governed Pattern C list metadata. |
| **SUC-029** | System shall load active approval rules into tenant execution rule bundles. |
| **SUC-030** | System shall maintain audit evidence for catalog views and approval mutations. |

Coverage registry: `data/system-admin.approval-rules.coverage.shared.ts`  
Acceptance tests: `tests/unit/system-admin.approvals.acceptance.test.ts`

---

## Enterprise Acceptance Criteria

| No. | Acceptance Criteria |
| --: | ------------------- |
| 1 | Authorized administrators can search and review approval rules through a governed list surface. |
| 2 | Administrators with manage capability can create approval rules with validated approver roles and audited outcomes. |
| 3 | Administrators can update approval rule metadata, modes, and thresholds with before/after audit evidence. |
| 4 | Disabled and deprecated approval rules do not silently affect runtime execution or new assignments. |
| 5 | Approver roles are validated against organization role vocabulary before persistence. |
| 6 | Sequential approval chains preserve ordered approver configuration in kernel records. |
| 7 | Parallel approval chains preserve concurrent approver configuration in kernel records. |
| 8 | Minimum approval counts cannot exceed configured approver role coverage. |
| 9 | Escalation timing is bounded, validated, and visible in catalog and detail views. |
| 10 | Delegation roles validate against organization roles and appear in detail evidence. |
| 11 | Invalid approver roles, deprecated reactivation, and count mismatches fail closed before write. |
| 12 | Readiness verdicts expose blocked, warning, and ready states on the catalog surface. |
| 13 | Approval detail shows related policies and capability linkage for operational review. |
| 14 | Policy `require_approval` outcomes and direct approval rule matches resolve through the Execution Kernel. |
| 15 | All approval reads and mutations derive organization context from server session, not client input. |
| 16 | Approval catalog views and mutations emit audit events with actor and target metadata. |
| 17 | Approval list surfaces declare ERP permission metadata and trailing actions through governed Pattern C. |
| 18 | Tenant execution rule loaders expose only active, kernel-ready approval records. |
