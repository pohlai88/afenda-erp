# TRACK-010 · Lynx Proactive Outcome Agents

## Summary

Add deterministic, read-only Lynx outcome monitors that run on a secured cron
sweep. The sweep detects finance control pressure, approval throughput issues,
and audit readiness gaps, then records replayable Lynx run events and creates or
updates durable workflow sessions for operator review.

This track does not add autonomous ERP mutation, model-driven execution, Vercel
Workflow, or Vercel Sandbox runtime dependencies.

## Scope

- Add server-only outcome monitor contracts and monitor results.
- Add `/api/cron/lynx-outcomes` using `CRON_SECRET`.
- Record one completed Lynx run per organization sweep.
- Record one run event per monitor result.
- Create or update proactive workflow sessions only for `watch` or `blocked`
  monitor results.
- Surface proactive origin, monitor status, severity, latest run, quality, and
  next step in the Agent Management Console workflow-session views.

## Verification

- `pnpm --filter @afenda/db test`
- `pnpm --filter @afenda/feature-lynx test`
- `pnpm --filter @afenda/erp test`
- `pnpm lint:governed-renderers`
- `pnpm architecture:check`
- `pnpm lint:lynx-brand`
- `pnpm typecheck`
