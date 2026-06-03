# TRACK-009 · Lynx Durable Workflow State

## Summary

Add durable Lynx workflow session state so operator workflows can survive reloads, resume across days, and remain auditable without adding autonomous ERP mutation or a Vercel Workflow runtime dependency.

Workflow sessions are current-state pointers. The Lynx Run Ledger remains the immutable replay and audit layer.

## Scope

- Persist tenant-scoped Lynx workflow sessions with status, stage, prompt summary, latest run, evidence summary, quality gate summary, next recommended step, and timestamps.
- Link operator runs to workflow sessions.
- Allow `/api/internal/v1/lynx/queries/operator` to create a session when one is not supplied and resume an existing tenant session when `workflowSessionId` is supplied.
- Add Agent Management Console workflow-session list and detail views.
- Add Vercel AI Gateway and OTel metadata for `workflowSession:<id>` correlation.

## Non-Goals

- No autonomous ERP mutation.
- No posting-grade ERP module logic.
- No Vercel Workflow or Vercel Sandbox runtime dependency.
- No replacement of the immutable run ledger.

## Verification

- `pnpm --filter @afenda/db test`
- `pnpm --filter @afenda/feature-lynx test`
- `pnpm --filter @afenda/erp test`
- `pnpm architecture:check`
- `pnpm lint:lynx-brand`
- `pnpm typecheck`
