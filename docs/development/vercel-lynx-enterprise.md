# Vercel Enterprise Controls For Lynx

This checklist governs Lynx enterprise operation on Vercel.

## Required

- Enable Vercel AI Gateway for the project.
- Ensure deployments receive `VERCEL_OIDC_TOKEN`; local and CI flows may use
  `AI_GATEWAY_API_KEY`.
- Keep Gateway feature/module/workflow/organization tags on every Lynx route.
- Keep `/api/lynx/truth-search`, `/api/lynx/operator`, and Knowledge sync routes
  covered by logs and OTel spans.
- Enable Vercel Agent Code Review in the project AI settings for PRs that touch
  `apps/erp/src/app/api/lynx/**`, `packages/features/lynx/**`,
  `packages/features/knowledge/**`, or `packages/ai/src/tools/**`.
- Preview gate before production:
  `pnpm typecheck`, `pnpm architecture:check`, `pnpm lint:lynx-brand`, focused
  package tests, and authenticated Lynx route smoke checks.
- Treat the Solution Console run detail route as the Vercel-ready agent
  management console: every run must expose status, model, route, workflow,
  replayable events, tool calls, evidence references, validation, approval or
  sandbox links, and operator feedback.
- Use `/lynx/runs` as the run management console for cross-run
  analytics, route/status/workflow/model/tool/date filters, and CSV audit
  export. The export route must derive tenant context from auth/session and
  return `Cache-Control: no-store` because it contains tenant-scoped audit data.

## Optional

- Enable Vercel Agent Investigations only when Observability Plus is available.
- Use investigations for anomaly alerts covering Lynx route latency, 5xx rate,
  Gateway budget/rate-limit events, Knowledge sync failures, and eval gate
  regressions.

## Not In This Track

- Do not add `@vercel/workflow` as a Lynx runtime dependency.
- Do not add Vercel Sandbox as a product execution dependency.
- Do not create a second Vercel project for Lynx; Afenda ERP remains one root
  project.
