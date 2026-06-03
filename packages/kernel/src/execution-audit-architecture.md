# Execution Audit Architecture

Durable audit evidence for Afenda's execution kernel.

Authority:

- [ARCH-1002 - Backend](../../../../../docs/architecture/1002-backend.md)
- [Execution Kernel Architecture](../execution-kernel-architecture.md)

## Decision

Execution audit is a kernel-owned evidence subsystem.

It is part of the governed mutation path and belongs in:

```txt
packages/kernel/src/execution-kernel/audit/
```

It does not belong in:

```txt
packages/observability/
```

Reason:

- audit records are business evidence
- observability logs are runtime diagnostics
- audit must follow execution permission, policy, and transaction rules
- audit must be queryable, durable, tenant-scoped, and reviewable
- audit must remain close to the execution kernel because the kernel owns mutation authority

## North Star

Execution audit answers:

> Who did what, to whom, when, where, why, which record was affected, and how was it performed?

This is the kernel's evidence layer for meaningful system actions.

It does not exist to debug code. It exists to prove governed execution.

## Scope

Execution audit owns durable evidence for governed actions, including:

- permission-sensitive mutations
- approval decisions
- policy-controlled actions
- administrative overrides
- status transitions
- destructive actions
- configuration changes
- exported business data
- delegated or system-executed actions
- failed or denied governed attempts where evidence is required

Execution audit does not own:

- request logs
- debug logs
- latency logs
- retry logs
- cache logs
- integration transport diagnostics
- developer troubleshooting output

Those belong to `@afenda/observability`.

## Current Audited Mutation Flow

```txt
1. requireExecutionContext
2. Parse / validate input
3. requireExecutionPermission
4. assertExecutionPolicy
5. Feature execute
6. writeExecutionAuditEvent
7. Optional revalidate
8. Optional runtime log emission
```

Execution audit sits after successful feature execution and before post-mutation UI invalidation.

For actions that must audit denied or failed attempts, the kernel may emit failure audit events after permission or policy rejection.

## Transaction Rule

Audit must be written in the same transaction boundary as the governed business mutation whenever the action changes durable business state.

Required rule:

```txt
Business mutation succeeds + audit write fails = transaction fails
Business mutation fails = success audit is not written
Permission denied = denial audit may be written when required by policy
```

This prevents un-audited durable mutations.

## 7W1H Audit Contract

Every execution audit event should map to 7W1H.

| Dimension | Kernel Field | Meaning |
| --------- | ------------ | ------- |
| Who | `actorId`, `actorType` | The user, system, service, or integration performing the action |
| Whom | `subjectType`, `subjectId` | The person, entity, or counterparty affected by the action |
| What | `action`, `summary` | The governed action performed |
| When | `occurredAt` | The event timestamp |
| Where | `organizationId`, `module`, `surface`, `route` | The tenant and application context where the action happened |
| Why | `reason`, `policyReference`, `approvalId` | The business reason or policy basis |
| Which | `targetType`, `targetId` | The durable record or resource affected |
| How | `channel`, `requestId`, `operationId` | The execution path used to perform the action |

## Owned Data

Minimum current kernel-owned audit input:

```ts
type WriteExecutionAuditEventInput = {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  action: string;
  targetType: string;
  targetId?: string;
  reason?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
};
```

Recommended enterprise extension:

```ts
type WriteExecutionAuditEventInput = {
  organizationId: string;
  module?: string;
  surface?: string;
  route?: string;

  actorId: string;
  actorType: "user" | "system" | "service" | "integration";
  actorRole?: string;

  subjectType?: string;
  subjectId?: string;

  action: string;
  summary: string;
  outcome: "success" | "failure" | "denied";

  targetType: string;
  targetId: string;
  targetDisplayName?: string;

  reason?: string;
  policyReference?: string;
  approvalId?: string;

  channel?: "web" | "api" | "server_action" | "cron" | "webhook" | "migration";
  requestId?: string;
  operationId?: string;

  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  diff?: AuditDiff[];
  metadata?: Record<string, unknown>;
};
```

## Storage Shape

The kernel maps execution audit input into the stored audit row.

Recommended stored fields:

```txt
id
organization_id
actor_id
actor_type
actor_role
subject_type
subject_id
action
summary
outcome
target_type
target_id
target_display_name
module
surface
route
channel
reason
policy_reference
approval_id
request_id
operation_id
before_json
after_json
diff_json
metadata_json
occurred_at
created_at
```

Optional later hardening:

```txt
previous_hash
event_hash
retention_class
evidence_count
```

Hash chaining should be introduced only when the repository and retention contract are ready.

## Metadata Rules

`metadata` is allowed, but it must not become a dumping ground.

Allowed:

```txt
safe identifiers
state names
status values
non-sensitive counters
policy decision details
workflow step IDs
integration provider names
```

Forbidden:

```txt
passwords
tokens
cookies
raw authorization headers
full request bodies
private documents
payment details
identity numbers
large payload snapshots
unredacted personal data
```

If before/after evidence is needed, prefer explicit `before`, `after`, and `diff` fields instead of hiding change evidence inside `metadata`.

## Relationship to Observability

Execution audit and observability may be emitted from the same mutation, but they answer different questions.

```txt
Execution audit = prove the governed action
Pino runtime log = diagnose system behavior
```

Example:

```txt
Audit:
User A approved Purchase Request PR-00042 for Organization X.

Logger:
Approval mutation completed in 84ms with requestId req_123.
```

Observability may reference the audit event ID:

```ts
logger.info(
  {
    event: "execution.audit.written",
    auditEventId,
    organizationId,
    action,
    targetType,
    targetId,
  },
  "Execution audit event written",
);
```

Audit must not depend on observability to be considered complete.

## Local Structure

```txt
packages/kernel/src/execution-kernel/
  audit/
    execution-audit.ts
    execution-audit.types.ts
    execution-audit.schema.ts
    execution-audit-7w1h.ts
    execution-audit-redaction.ts
    execution-audit-diff.ts
    execution-audit-repository.server.ts
    execution-audit-architecture.md
```

Keep the structure small until real reuse appears.

Do not split into a separate package unless an architecture decision explicitly moves audit out of `@afenda/kernel`.

## Naming Convention

Use stable action names.

Recommended format:

```txt
domain.resource.action
```

Examples:

```txt
hr.employee.updated
hr.employee.terminated
system_admin.role.assigned
system_admin.permission.denied
finance.payment.approved
object_storage.file.deleted
workflow.step.executed
tenant.setting.changed
```

Avoid:

```txt
update
submit
done
success
clicked
changed
```

Audit events must be understandable outside code.

## Failure Policy

| Scenario | Audit Behavior |
| -------- | -------------- |
| Validation fails before actor/target is known | Usually no audit |
| Permission denied | Audit when security policy requires evidence |
| Policy rejected | Audit when action is governed |
| Business mutation fails | Write failure audit only if the attempt itself matters |
| Business mutation succeeds | Success audit is required |
| Audit write fails after mutation | Roll back mutation |
| Revalidate fails | Do not roll back audit or mutation; log via observability |

## Scaffold Advice

Do not use `_scaffold` for this subsystem.

Reason:

- the repo already has `@afenda/kernel`
- execution audit is not a new vertical package
- audit is part of the existing execution kernel authority
- package split requires an architecture decision and guard update

Correct location:

```txt
packages/kernel/src/execution-kernel/audit/
```

Incorrect location:

```txt
packages/observability/audit/
packages/audit-ledger/
packages/features/*/audit/
```

## Verification

Required:

```bash
pnpm --filter @afenda/kernel typecheck
pnpm --filter @afenda/kernel test
pnpm architecture:check
```

Recommended additional checks:

```bash
pnpm kernel:check
pnpm --filter @afenda/kernel test -- execution-audit
```

## Enterprise Quality Bar

Execution audit reaches enterprise quality only when:

- every governed mutation has an explicit audit decision
- success audit is transactionally coupled with durable mutation
- audit is not mixed with Pino logging
- 7W1H is represented in the audit contract
- metadata is redacted and bounded
- action names are stable and searchable
- denied/failure audit behavior is policy-driven
- audit events are tenant-scoped
- audit writes are test-covered
- architecture guards prevent drift into observability or feature-local audit folders
