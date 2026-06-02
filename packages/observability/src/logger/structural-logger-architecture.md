# Structural Logger Architecture

Pino-backed structural logger architecture for `@afenda/observability`.

Canonical doctrine: [ARCH-1005 - Infrastructure](../../docs/architecture/1005-infrastructure.md) and [ARCH-1002 - Backend](../../docs/architecture/1002-backend.md).

## Decision

- The structural logger lives inside `@afenda/observability`.
- This document describes the logger subsystem, not the entire observability package.
- `@afenda/kernel` owns audit evidence and execution-law audit writes.
- Do not merge diagnostic logs and audit evidence into one subsystem.

## North Star

The structural logger exists to answer:

> What happened inside the system, why did it happen, how long did it take, and what should engineers investigate next?

The structural logger is the runtime engineering truth layer of Afenda.

It provides:

- runtime visibility
- request correlation
- operational diagnostics
- performance telemetry
- incident investigation support

It is not a business evidence system and it is not the full observability platform. Business evidence belongs to the execution audit subsystem in `@afenda/kernel`.

## Where to work

| Zone | Path | Policy |
| ---- | ---- | ------ |
| **Active** | `src/logger/` | Logger factory, child loggers, request context, redaction, serializers, transports |
| **Active** | `src/middleware/` | Route / server-action / request wrappers |
| **Active** | `src/diagnostics/` | Logging contract checks and health checks |
| **Active** | `src/testing/` | Log capture and test helpers |
| **Frozen** | `src/index.ts`, `src/module-indicators.ts` | Keep compatibility exports stable unless the package contract changes |

## Ownership

Logger owns:

- Pino setup
- log levels
- redaction policy
- request / correlation IDs
- child logger creation
- runtime error logging
- performance logging
- API latency logging
- job execution logging
- integration debugging

Logger does not own:

- legal evidence
- approval history
- immutable event history
- tamper-evident records
- business audit trail

## Logging Contract

All logs must be structured.

Required fields:

```ts
{
  event: string;
  level: string;
  requestId?: string;
  operationId?: string;
  organizationId?: string;
}
```

Prohibited:

```ts
logger.info("hello");
logger.info(JSON.stringify(data));
console.log(data);
```

Preferred:

```ts
logger.info(
  {
    event: "workflow.execution.completed",
    workflowId,
    durationMs,
  },
  "Workflow execution completed",
);
```

## Correlation Model

Every request should generate or inherit:

```txt
requestId
correlationId
operationId
organizationId
actorId
```

These values travel through:

```txt
Route Handler
  -> Execution Kernel
  -> Feature Service
  -> Database
  -> Integration
```

Use request-context helpers so logs can reconstruct the complete request journey. AsyncLocalStorage-backed context is the target implementation for server-only request propagation.

## Tenant Requirements

All tenant-aware runtime logs should include `organizationId` and `actorId` when available.

Logs must never require database joins to identify the affected tenant during incident investigation.

Cross-tenant log leakage is prohibited. Redaction and request-context helpers must keep tenant identifiers scoped to the active execution context.

## Redaction Policy

Sensitive values must be redacted before transport.

Examples:

```txt
password
token
refreshToken
authorization
cookie
apiKey
secret
privateKey
```

Never log:

```txt
raw request bodies
payment credentials
identity documents
session cookies
authentication tokens
private documents
large payload snapshots
unredacted personal data
```

Redaction belongs to the logger infrastructure and should not be implemented independently per feature.

## Event Naming Convention

Use stable machine-readable event names.

Format:

```txt
domain.resource.action
```

Examples:

```txt
auth.login.succeeded
auth.login.failed
workflow.execution.started
workflow.execution.completed
object_storage.upload.completed
object_storage.upload.failed
integration.webhook.received
tenant.setting.updated
```

Avoid:

```txt
success
done
clicked
updated
submit
```

Event names should remain understandable outside the codebase.

## Proposed Local Structure

```txt
packages/observability/
  src/
    logger/
      index.ts
      create-logger.server.ts
      create-domain-logger.ts
      create-package-logger.ts
      create-child-logger.ts
      logger.types.ts
      logger.schema.ts
      logger.constants.ts
      request-context.server.ts
      request-context.types.ts
      redact-policy.ts
      serializers.ts
      log-level.ts
      transport.ts

    middleware/
      route-handler-logger.server.ts
      server-action-logger.server.ts
      next-request-logger.server.ts

    diagnostics/
      logging-health.ts
      console-ban.ts
      logging-contract-check.ts

    testing/
      test-logger.ts
      log-capture.ts
```

## Event Shape

Use structured events, not free-form console noise.

```ts
logger.info(
  {
    event: "object_storage.upload.completed",
    package: "packages/object-storage",
    domain: "object-storage",
    module: "system-admin",
    requestId,
    correlationId,
    operationId,
    organizationId,
    actorId,
    durationMs,
    outcome: "success",
  },
  "Object upload completed",
);
```

## Runtime Flow

```txt
request / server action / cron / integration
  -> root logger
  -> request-bound child logger
  -> domain/package child logger
  -> redaction + serializer
  -> pino transport
  -> stdout / drain / aggregation
```

## Failure Policy

Logging must never block business execution.

| Scenario | Behavior |
| -------- | -------- |
| Logger transport unavailable | Continue execution |
| Log serialization fails | Continue execution |
| Redaction fails | Fail log write, not business action |
| Business action fails | Log failure event if possible |
| Audit succeeds but logging fails | Mutation remains successful |

Structural logging is best-effort. Execution audit is authoritative.

## Transport Strategy

Development:

```txt
Pino -> pino-pretty -> terminal
```

Production:

```txt
Pino -> JSON -> stdout -> log drain -> aggregation platform
```

The structural logger should not be tightly coupled to a specific vendor.

Supported future destinations:

- Datadog
- OpenSearch
- ELK
- Grafana Loki
- cloud provider log services

## Architectural Rules

Required:

- use package logger factories
- use structured events
- use child loggers
- use request context

Forbidden:

- `console.log`
- `console.error`
- JSON-stringified payload logs
- direct Pino instantiation outside `@afenda/observability`

Use:

```ts
import { createDomainLogger } from "@afenda/observability";
```

Do not use:

```ts
import pino from "pino";
```

## Boundary With Audit

```txt
Business action
  -> domain service
  -> audit ledger write in kernel
  -> logger emits runtime diagnostics
```

The systems are connected but not the same:

- `logger` observes the system
- `audit` proves the action

Runtime logs may include `auditEventId` after a kernel audit write succeeds. Audit must not depend on logging to be considered complete.

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

## Future Logger-Compatible Capabilities

The logger architecture should support future expansion into distributed tracing:

```txt
requestId
correlationId
traceId
spanId
```

Metrics:

```txt
request count
latency
error rate
queue depth
job throughput
```

Runtime health:

```txt
database connectivity
integration health
queue health
storage health
```

Incident diagnostics:

```txt
request reconstruction
correlation search
tenant incident review
performance bottleneck analysis
```

The structural logger contract should not prevent these capabilities from being added later in the wider observability package.

## Scaffold Advice

- Use `_scaffold` only if you are creating a new platform package from scratch.
- Do not use `_scaffold` to retrofit this existing package.
- For the structural logger, extend the current `@afenda/observability` package directly.
- If a future standalone logging package is introduced, scaffold it as a `runtime-library` package and add the logger architecture to its local docs.

## Verification

- `pnpm --filter @afenda/observability typecheck`
- `pnpm --filter @afenda/observability test`
- `pnpm architecture:check`

## Enterprise Quality Bar

Structural logging reaches enterprise quality only when:

- all production logs are structured
- request, correlation, and operation IDs are propagated
- tenant-aware logs include tenant and actor context when available
- redaction is centralized and test-covered
- event names are stable and searchable
- logging never blocks business execution
- logger factories prevent direct Pino sprawl
- transport remains vendor-neutral
- logs can reference audit IDs without replacing audit evidence
- future tracing, metrics, health, and incident diagnostics remain compatible with the logger contract
