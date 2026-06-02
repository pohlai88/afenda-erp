# TRACK-003 · AI Enterprise Uplift — Deferred scope decisions

**Tracking ID:** `TRACK-003` · **File:** `003-ai-enterprise-uplift-scope-decisions.md` · **Status:** Closed · **Related:** AI Enterprise Uplift ≥4.5, **TRACK-001**, **ARCH-1001**

This document records **final** disposition of items previously listed as "deferred" in the AI Enterprise Uplift plan. Nothing below remains open as "defer"; each row is either **implemented** in this repo or **cancelled** with an explicit replacement path.

## Disposition table

| Item | Decision | Rationale | Replacement / owner |
| ---- | -------- | --------- | ------------------- |
| **Vercel Workflow DevKit** (7-day re-runs, `'use workflow'`) | **Cancelled** | No operator workflow requires durable multi-day orchestration today. Reminder/sync/housekeeping are covered by `/api/internal/v1/cron/*` + `CRON_SECRET` (**ARCH-1001**). **TRACK-001** explicitly excludes WDK. | Reopen only if product requires cross-day human wait states that cron cannot model. New **TRACK-###** required. |
| **LMS module** (`lms_*` tables, `/lms`, LMS capabilities) | **Cancelled** (this uplift) | **TRACK-001** Appendix A: LMS is a *candidate consumer* after sandbox executor is boring—not part of execution-layer or ≥4.5 uplift. Blueprint skill may exist in `@afenda/ai`; no ERP module enum or DB tables. | **TRACK-001** Appendix A when executor is stable on recovery skills. |
| **Embeddings / RAG** | **Superseded by TRACK-005** | User retrieval requirement ("answer why, policy, guidance") confirmed after this uplift closed. pgvector via Neon is the right fit — no new infra, single tenant boundary, ARCH-1001 compliant. WDK and Public Lynx surface remain cancelled. | **TRACK-005** `docs/roadmap/005-lynx-knowledge-substrate.md` + **ARCH-1005** `docs/architecture/1005-infrastructure.md` |
| **Vercel Sandbox microVMs** | **Cancelled** | ERP does not execute untrusted operator or model-generated code. Sandboxes are **approval records** (`ai_action_sandboxes`), not compute sandboxes. | N/A unless a future "run user script" feature is scoped. |
| **Postgres RLS hard enforcement** (AI tables) | **Implemented** | Core tenant tables already had RLS (`0006_tenant_rls.sql`, `0007_audit_logs_rls.sql`). `ai_action_sandboxes` and `ai_approval_proposals` were added without policies—**gap closed** in `0013_ai_tenant_rls.sql`. App-level capability checks remain mandatory (**ARCH-1001**). | Broader RLS audit → **ARCH-1001** Phase 5 + `pnpm --filter @afenda/db test` (`evaluate-rls.mts`). |

## Implemented in this closure (not deferred)

| Deliverable | Location |
| ----------- | -------- |
| Pending sandbox persist + admin approve → executor | `packages/ai/src/tools/*`, `apps/erp/.../sandbox-actions.ts` |
| `linkAiActionSandboxToApproval` | `packages/db/src/ai.ts` |
| RLS on `ai_action_sandboxes`, `ai_approval_proposals` | `packages/db/drizzle/0013_ai_tenant_rls.sql` |
| Module-scoped chat capability | `apps/erp/src/app/api/ai/chat/route.ts` |
| JSON auth on extract/spend | `apps/erp/src/app/api/ai/extract/route.ts`, `spend/route.ts` |
| Admin AI ledger (usage, approvals, sandboxes, spend) | `module-screen.tsx`, `list-surfaces.ts`, `stat-surfaces.ts` |

## Policy

- **Do not** reintroduce "deferred" language for the rows above in uplift PRs; link to this **TRACK-003** instead.
- The "Embeddings / RAG" row is **superseded** (not cancelled); its delivery path is **TRACK-005**.
- New platform capabilities (WDK, LMS module) require a **new TRACK** doc and architecture touch (**ARCH-1001** / **ARCH-1002**) before implementation.
