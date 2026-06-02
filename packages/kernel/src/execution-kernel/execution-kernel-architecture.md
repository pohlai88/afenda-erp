# Execution kernel (supplement)

> **Authority:** [ARCH-1002 §7](../../../../docs/architecture/1002-backend.md). Update this doc when execution-kernel contracts change.

## Layout

```txt
context/   actor/   access/   policy/   audit/
capabilities/   execution/   errors/   state/
```

See also: [`audit/execution-audit-architecture.md`](./audit/execution-audit-architecture.md) for the audit sub-area.

## Server entry

```ts
import { runGuardedExecution } from "@afenda/kernel/server";
```

## Protected mutation envelope

1. `requireExecutionContext`
2. Parse / validate input (feature-owned `parse`)
3. `requireExecutionPermission`
4. `assertExecutionPolicy`
5. Feature `execute`
6. `writeExecutionAuditEvent` (unless `audit.skip`)
7. Optional `revalidate`
8. Optional runtime log emission via `@afenda/observability`

Use `runGuardedExecution` to standardize steps 1–4 and 6–7; keep business rules in `@afenda/feature-*`.

## Governance

- No `@afenda/feature-*` imports in `packages/kernel`.
- No admin UI in this tree.
- `membershipId` and `organizationId` come from server session — never from the client.
