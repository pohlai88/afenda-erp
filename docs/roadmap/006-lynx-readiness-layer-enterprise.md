# TRACK-006 · Lynx Readiness Layer Enterprise Upgrade

**Tracking ID:** `TRACK-006` · **Status:** Active  
**Related:** **ARCH-1005**, **TRACK-005**, **TRACK-001**

## Purpose

Build the enterprise readiness layer before deep ERP-native Lynx tools. Lynx
must report what it can safely inspect, what is partial, and what is unavailable
while ERP modules are still maturing.

## Deliverables

- Readiness contract in `@afenda/feature-lynx` for snapshots, module readiness,
  tool availability, and readiness signals.
- Tenant-scoped server registry that evaluates Knowledge coverage, module
  substrate, eval freshness, open approvals, open sandboxes, and Vercel operating
  controls.
- Governed `inspectLynxReadiness` read tool exposed to Lynx Operator.
- Explicit Lynx run ledger tables for replay-oriented run and event audit.
- Admin readiness panel in Solution Console and richer eval gate visibility in
  Knowledge admin.
- Vercel operating checklist for AI Gateway, Observability, Agent Code Review,
  optional Agent Investigations, and preview gates.

## Non-Negotiables

- No model input may carry or override `organizationId`.
- Readiness inspection is read-only.
- Write/proposal tools remain sandboxed and human-approved.
- Vercel Workflow and Vercel Sandbox are not product runtime dependencies in
  this track.

## Verification

- `pnpm typecheck`
- `pnpm architecture:check`
- `pnpm lint:lynx-brand`
- `pnpm --filter @afenda/feature-lynx test`
- `pnpm --filter @afenda/feature-knowledge test`
- `pnpm --filter @afenda/db typecheck`
