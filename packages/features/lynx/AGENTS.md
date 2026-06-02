# @afenda/feature-lynx

**Parent:** [ARCH-1005 §11](../../../../docs/architecture/1005-infrastructure.md) · [ARCH-1004 §5](../../../../docs/architecture/1004-api.md) (Lynx HTTP) · **TRACK-005** · rule `afenda-lynx-knowledge`.

HTTP routes are **internal/v1** only (**ARCH-1004**). Flat `/api/lynx/*` is non-compliant.

Lynx is the **machine-layer product** package. It composes `@afenda/ai` and `@afenda/feature-knowledge` through public doors only — it does not absorb them.

Scaffold baseline: `packages/_scaffold/feature` + Lynx extensions below.

## Public doors

| Door | Exports |
| ---- | ------- |
| `index.ts` | Neutral contracts (`lynx.core.contract`, …) |
| `client.ts` | Client components, client-safe contracts |
| `server.ts` | `api/`, `commands/`, `read-models/`, `data/`, `tools/`, `workflows/` |
| `metadata.ts` | `surface/` governed builders + console UI copy |

`src/server.ts` is the **only** `import "@afenda/kernel/server"` in this package.

## Layout (ARCH-1002 aligned)

### Standard buckets

| Bucket | Lynx owns |
| ------ | --------- |
| `actions/` | Server Actions → commands *(stub — wire as routes migrate)* |
| `commands/` | Typed mutations — `executeLynxRecordRunFeedbackCommand` |
| `api/` | Stream/query handlers — truth-search, operator, runs export |
| `contracts/` | `lynx.*.contract.ts`, canonical constants |
| `schemas/` | Zod parsers — **source of truth** for runtime validation |
| `components/` | Lynx UI (truth panel, operator panel, chat elements) |
| `data/` | Tenant-scoped queries (`*.query.server.ts`) |
| `read-models/` | Page/list composition (`*.page-model.server.ts`) |
| `domain/` | Invariants + orchestration behind commands |
| `events/` | Audit action strings + domain event metadata |
| `policies/` | Capability guards for routes and tools |
| `tests/` | Package unit tests live in `/tests` at package root |

### Lynx extensions (allowed at `src/` root)

| Folder | Role |
| ------ | ---- |
| `surface/` | Governed metadata builders + `*.surface.ts` + UI copy (`lynx.console-ui.copy.shared.ts`) |
| `tools/` | Governed operator tools (`GovernedToolMeta` in `lynx.tool-meta.ts`) |
| `workflows/` | Cron-safe outcome monitors and durable sweeps |

Do not add `surfaces/` (renamed → `surface/`) or `shell/` (merged into `surface/`).

## Required HTTP mapping (**ARCH-1004** §5)

| Required path | Handler / command |
| ------------- | ----------------- |
| `POST …/internal/v1/lynx/queries/truth-search` | `handleLynxTruthSearchPost` |
| `POST …/internal/v1/lynx/queries/operator` | `handleLynxOperatorPost` |
| `POST …/internal/v1/lynx/commands/record-run-feedback` | `executeLynxRecordRunFeedbackCommand` |
| `GET …/internal/v1/lynx/queries/run-ledger-export` | read-model export (not raw `data/` from route) |

App `route.ts` files: re-export handler only; use `@afenda/api` `withApiHandler` when the package exists.

## Constraints

- Banned folders: `_shared`, `common`, `lib`, `utils`, `helpers`, `misc`.
- User-facing copy: **Lynx** vocabulary only — see `afenda-lynx-knowledge` rule.
- `./client` must not import `@afenda/db`, `@afenda/auth/server`, or `node:*`.
- Tools with `access: "write"` use approval/sandbox — no direct table writes.

## Verify

```bash
pnpm --filter @afenda/feature-lynx test
pnpm --filter @afenda/feature-lynx typecheck
pnpm validate:feature-entry --feature lynx
pnpm architecture:check
```
