### 9.13 Diagnostics

## Definition

Diagnostics is the governance health surface for the ERP.

It continuously evaluates the integrity, coverage, readiness, and consistency of organizational configuration.

Diagnostics exists to identify:

* configuration drift
* missing governance coverage
* permission gaps
* inactive business functions
* policy inconsistencies
* approval inconsistencies
* audit coverage failures
* readiness risks

Diagnostics does not enforce runtime execution.

Diagnostics does not modify configuration.

Diagnostics observes and reports.

The Execution Kernel remains the enforcement authority.

## Owns

Diagnostics owns:

* admin health checks
* configuration drift indicators
* permission coverage warnings
* inactive module warnings
* missing audit coverage warnings
* capability coverage warnings
* policy drift detection
* approval drift detection
* readiness reporting
* governance health reporting

## Does Not Own

Diagnostics does not own:

* policy enforcement
* permission enforcement
* security enforcement
* workflow execution
* configuration updates
* infrastructure monitoring

Those belong to:

```txt
Execution Kernel
Policies
Permissions
Security
Integrations
Platform Infrastructure
```

## Example Permission

```txt
system_admin.diagnostics.read
```

Recommended split:

```txt
system_admin.diagnostics.read
system_admin.diagnostics.export
system_admin.diagnostics.review
```

Phase 5 minimum:

```txt
system_admin.diagnostics.read
```

## Core Principle

Diagnostics answers:

```txt
Can this ERP operate safely and correctly?
```

Not:

```txt
Can this ERP technically run?
```

## Governance Health Model

```ts
export type GovernanceHealthVerdict =
  | "healthy"
  | "warning"
  | "blocked"
```

Organization-level summary:

```ts
export type GovernanceHealthReport = {
  verdict: GovernanceHealthVerdict

  blockedCount: number
  warningCount: number

  generatedAt: Date
}
```

## Diagnostic Categories

### Permission Coverage

Purpose:

```txt
Detect access-control inconsistencies.
```

Examples:

```txt
Capability references missing permission

Role references deprecated permission

Permission not assigned anywhere
```

Severity:

```txt
warning
blocked
```

---

### Module Health

Purpose:

```txt
Detect ERP domain readiness issues.
```

Examples:

```txt
Module enabled
No active capabilities

Module disabled
Referenced by active policy
```

Severity:

```txt
warning
blocked
```

---

### Capability Coverage

Purpose:

```txt
Detect business-function governance gaps.
```

Examples:

```txt
Capability missing permission

Capability missing route

Capability missing audit mapping

Capability missing policy coverage
```

Severity:

```txt
warning
blocked
```

---

### Policy Drift

Purpose:

```txt
Detect invalid business-law references.
```

Examples:

```txt
Policy references removed capability

Policy references removed action

Policy references missing module
```

Severity:

```txt
blocked
```

---

### Approval Drift

Purpose:

```txt
Detect broken approval configurations.
```

Examples:

```txt
Approval rule references deprecated role

Approval rule references missing role

Approval rule impossible to satisfy
```

Severity:

```txt
warning
blocked
```

---

### Audit Coverage

Purpose:

```txt
Detect evidence-generation gaps.
```

Examples:

```txt
Sensitive capability lacks audit mapping

Critical action lacks audit coverage

Approval action not audited
```

Severity:

```txt
blocked
```

---

### Security Posture

Purpose:

```txt
Detect weak governance configuration.
```

Examples:

```txt
Admin MFA disabled

No trusted domains

Admin lockout protection disabled
```

Severity:

```txt
warning
blocked
```

---

### Integration Health

Purpose:

```txt
Detect governance issues around trusted external systems.
```

Examples:

```txt
Enabled integration disconnected

Webhook unhealthy

Expired credential
```

Severity:

```txt
warning
blocked
```

## Diagnostic Issue Model

```ts
export type DiagnosticIssue = {
  id: string

  category:
    | "permission"
    | "module"
    | "capability"
    | "policy"
    | "approval"
    | "audit"
    | "security"
    | "integration"

  severity:
    | "warning"
    | "blocked"

  title: string

  description: string

  targetType: string

  targetId?: string

  recommendedAction: string
}
```

## Diagnostics Page

Route:

```txt
/apps/system-admin/diagnostics
```

Purpose:

```txt
Review ERP governance health.
```

Recommended sections:

```txt
Health Summary
Blocked Issues
Warnings
Coverage Review
Readiness Review
Recent Governance Changes
```

## Health Summary

Display:

```txt
Overall Verdict
Blocked Issues
Warnings
Healthy Modules
Healthy Capabilities
```

Example:

```txt
Governance Health

Verdict:
  Warning

Blocked:
  2

Warnings:
  7
```

## Readiness Review

Diagnostics should aggregate:

```txt
Module Readiness
Capability Readiness
Policy Readiness
Approval Readiness
Security Readiness
Integration Readiness
```

Example:

```txt
Accounting
  Ready

Inventory
  Warning

HRM
  Ready

Payroll
  Blocked
```

## Configuration Drift Detection

Purpose:

```txt
Detect divergence between declared truth and configured truth.
```

Examples:

```txt
Capability removed
Role still references permission

Policy removed
Approval rule still references policy

Module disabled
Capabilities remain enabled
```

This is one of the most important diagnostics.

## Dependency Analysis

Examples:

```txt
Accounting enabled
Contacts disabled

Result:
Blocked
```

```txt
Payroll enabled
HRM disabled

Result:
Blocked
```

Dependencies should be visible.

## Export

Recommended formats:

```txt
CSV
XLSX
PDF
JSON
```

Permission:

```txt
system_admin.diagnostics.export
```

Exports must be organization-scoped.

## Server Data Loader

```ts
export async function getDiagnosticsReport() {
  const context =
    await requireExecutionContext()

  await requireExecutionPermission(
    context,
    "system_admin.diagnostics.read",
  )

  return generateDiagnosticsReport({
    organizationId: context.organizationId,
  })
}
```

## Diagnostic Engine Sources

Diagnostics should consume:

```txt
Execution Kernel capabilities
Execution Kernel permissions
Modules
Roles
Policies
Approvals
Security Settings
Integrations
Audit Coverage Catalog
```

Diagnostics should never invent truth.

## Safety Rules

Diagnostics must enforce:

1. Diagnostics is read-only.
2. Diagnostics does not modify configuration.
3. Diagnostics is organization-scoped.
4. All findings must be explainable.
5. Blocked findings must include remediation guidance.
6. Drift detection must be visible.
7. Coverage gaps must be visible.
8. Readiness verdicts must be visible.
9. Exports must be audited.
10. Execution Kernel remains enforcement authority.

## Definition of Done

Diagnostics is done when:

* administrators can review governance health
* administrators can review blocked findings
* administrators can review warnings
* configuration drift is detected
* permission coverage gaps are detected
* module readiness issues are detected
* capability coverage gaps are detected
* policy drift is detected
* approval drift is detected
* audit coverage gaps are detected
* security posture issues are detected
* integration health issues are detected
* readiness verdicts are visible
* exports are supported
* diagnostics remains read-only

## Minimum Tests

```txt
non-admin cannot view diagnostics
missing permission creates finding
missing audit coverage creates finding
disabled module dependency creates finding
policy drift detected
approval drift detected
security posture issue detected
integration issue detected
diagnostics export audited
organization scope enforced
```

## Final Architecture Statement

Modules answer:

```txt
What ERP domains exist?
```

Capabilities answer:

```txt
What business functions exist?
```

Policies answer:

```txt
What business law exists?
```

Approvals answer:

```txt
Who must authorize actions?
```

Audit Viewer answers:

```txt
Can we prove what happened?
```

Diagnostics answers:

```txt
Is the entire governance system healthy, complete, and safe to operate?
```

Diagnostics becomes Afenda's governance health center, not a server monitoring dashboard.
