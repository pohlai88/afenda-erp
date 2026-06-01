# ARCH-011 (supplement) · System Admin — Approvals

**Parent:** [011-system-admin-enterprise-architecture.md](011-system-admin-enterprise-architecture.md)

**Package as-built supplement:** [`packages/features/system-admin/src/approvals/approvals-architecture.md`](../../packages/features/system-admin/src/approvals/approvals-architecture.md)

### 9.8 Approvals

## Definition

Approvals define the human authorization path for governed ERP actions.

An approval rule answers:

```txt
Who must approve this action before it can continue?
```

Approvals do not decide whether approval is required.
Policies decide that.

Approvals define the route, sequence, approver roles, escalation timing, delegation rules, and completion requirements.

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

Implementation coverage registry: `packages/features/system-admin/src/approvals/data/system-admin.approval-rules.coverage.shared.ts`

Acceptance tests: `packages/features/system-admin/tests/unit/system-admin.approvals.acceptance.test.ts`

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

For full vertical doctrine (models, runtime flow, safety rules, and definition of done), see the package supplement linked above.
