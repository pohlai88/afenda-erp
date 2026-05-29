# @afenda/kernel

Shared **execution law** and **frozen** generic ERP compat for Afenda.

Canonical doctrine: [ARCH-002 · ERP kernel & feature packages](../../docs/architecture/002-erp-kernel-package-architecture.md).

## Where to work

| Zone | Path | Policy |
| ---- | ---- | ------ |
| **Active** | `src/execution-kernel/` | Extend for context, access, policy, audit, guarded execution |
| **Frozen** | `src/index.ts`, `src/modules/*`, `src/shell/*`, `src/shared/workspace-*` | Bugfix-only |
| **Incidental** | `src/shared/erp-formatting.ts` | Prefer feature-local formatting over time |

## Imports (protected server code)

```ts
import {
  requireExecutionContext,
  requireExecutionPermission,
  runGuardedExecution,
  writeExecutionAuditEvent,
} from "@afenda/kernel/server";
```

`@afenda/kernel/execution` is the same surface with a `server-only` boundary. Do **not** import feature packages from kernel code.

## Verification

`pnpm kernel:check` · `pnpm --filter @afenda/kernel test` · included in `pnpm architecture:check` and CI.
