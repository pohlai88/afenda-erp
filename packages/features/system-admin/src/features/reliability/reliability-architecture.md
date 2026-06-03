### 9.15 Reliability

## Definition

Reliability manages operational health and service continuity.

It provides visibility into background execution, scheduled jobs, integrations, infrastructure dependencies, repository governance health, and operational failures.

Reliability helps administrators answer:

```txt
Is the ERP operating correctly?
```

Reliability does not enforce permissions.

Reliability does not enforce policies.

Reliability observes operational execution and reports failures, degradation, and risk.

## Owns

Reliability owns:

* cron health
* queue health
* scheduled task health
* workflow execution health
* webhook delivery health
* integration health
* repository governance health
* migration health
* cache health
* storage health
* operational incident visibility
* service readiness review

## Does Not Own

Reliability does not own:

* governance configuration
* permission enforcement
* policy enforcement
* business workflows
* user management
* module configuration

Those belong to:

```txt
Execution Kernel
Diagnostics
Policies
Modules
Users
Security
```

## Example Permission

```txt
system_admin.reliability.read
```

Recommended split:

```txt
system_admin.reliability.read
system_admin.reliability.review
system_admin.reliability.export
```

## Core Principle

Reliability answers:

```txt
Can the ERP continue operating safely?
```

Not:

```txt
Is the governance model valid?
```

## Reliability Categories

### Cron Health

Examples:

```txt
Daily cleanup job
Reminder generation
Audit retention cleanup
Usage aggregation
```

Checks:

```txt
Last successful run
Next scheduled run
Failure count
Duration
```

---

### Queue Health

Examples:

```txt
Email queue
Notification queue
Workflow queue
Import queue
```

Checks:

```txt
Backlog size
Oldest pending job
Failed jobs
Dead letter count
```

---

### Workflow Health

Examples:

```txt
Approval workflow
Escalation workflow
Reminder workflow
```

Checks:

```txt
Running
Blocked
Failed
Delayed
```

---

### Webhook Health

Examples:

```txt
Shopify
Stripe
Bank Feed
HRIS Connector
```

Checks:

```txt
Success rate
Retry count
Last delivery
Failure trend
```

---

### Repository Health

This is where Afenda becomes unique.

Checks:

```txt
ADR coverage
ATC coverage
Repo guard status
Architecture violations
i18n readiness
Metadata completeness
```

Example:

```txt
Repository Health

Warning:
  Missing ATC for Contacts

Blocked:
  Architecture boundary violation
```

---

### Migration Health

Checks:

```txt
Drizzle journal consistency
Snapshot consistency
Pending migrations
Migration failures
```

Example:

```txt
Blocked

Schema drift detected
```

---

### Storage Health

Checks:

```txt
Blob storage
R2
Object storage
Document storage
```

Examples:

```txt
Storage utilization
Failure rate
Latency
```

---

### Cache Health

Checks:

```txt
Redis
Cache hit rate
Cache failures
```

---

### Integration Health

Checks:

```txt
Connected
Disconnected
Degraded
```

This should consume data from Integrations.

## Reliability Page

Route:

```txt
/apps/system-admin/reliability
```

Purpose:

```txt
Review operational continuity and execution health.
```

Recommended sections:

```txt
Reliability Summary
Blocked Issues
Warnings
Cron Health
Queue Health
Workflow Health
Webhook Health
Repository Health
Migration Health
Storage Health
```

## Reliability Verdict

```ts
export type ReliabilityVerdict =
  | "healthy"
  | "warning"
  | "blocked"
```

Example:

```txt
Reliability

Verdict:
  Warning

Blocked:
  1

Warnings:
  4
```

## Repository Health

Recommended checks:

```txt
ADR coverage
ATC coverage
Repo guard status
Architecture compliance
Metadata coverage
i18n readiness
Documentation coverage
```

This is especially valuable for Afenda.

## Incident Visibility

Examples:

```txt
Failed cron
Failed queue
Webhook outage
Storage outage
Migration failure
```

Show:

```txt
First detected
Current status
Affected modules
Resolution state
```

## Export

Formats:

```txt
CSV
XLSX
PDF
JSON
```

Audit action:

```txt
system_admin.reliability.export
```

## Safety Rules

Reliability must enforce:

1. Reliability is read-only.
2. Reliability does not modify execution state.
3. Reliability findings are organization-scoped where applicable.
4. Repository findings must be explainable.
5. Reliability exports are audited.
6. Health checks must be deterministic.
7. Operational failures must remain visible until resolved.
8. Reliability does not bypass diagnostics.

## Definition of Done

Reliability is done when:

* administrators can review cron health
* administrators can review queue health
* administrators can review workflow health
* administrators can review webhook health
* administrators can review repository health
* administrators can review migration health
* administrators can review storage health
* blocked issues are visible
* warnings are visible
* readiness verdict is visible
* exports are supported

## Final Architecture Statement

Diagnostics answers:

```txt
Is governance healthy?
```

Security answers:

```txt
Is the organization protected?
```

Reliability answers:

```txt
Is the platform operating correctly?
```

Audit Viewer answers:

```txt
Can failures and actions be proven later?
```

Reliability becomes Afenda's operational health command center, while Diagnostics remains the governance health command center.
