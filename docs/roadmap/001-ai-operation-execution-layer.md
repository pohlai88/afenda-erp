# TRACK-001 · AI Operation Execution Layer

**Doc ID:** `TRACK-001` · **File:** `001-ai-operation-execution-layer.md`

## Summary

Build a **generic, module-agnostic AI operation execution layer**: persist every mutation-capable AI proposal as an `ai_action_sandbox`, enforce human approval before any domain write, and link each created domain row back to the sandbox that produced it.

This track owns the **execution layer only**. Module domains (finance, sales, inventory, LMS) consume it; they do not redefine it. The first proof consumer is **the existing recovery skills** running on real module data, **not** a new LMS module. LMS is appended as a later candidate consumer once the executor is boring.

Runtime stays on Vercel AI SDK v6 + AI Gateway. No Cloudflare runtime, no embeddings, no Workflow DevKit in this track.

## Scope (KISS / YAGNI)

| In scope                                                                     | Out of scope                              |
| ---------------------------------------------------------------------------- | ----------------------------------------- |
| One generic `ai_action_sandboxes` table                                      | Module-specific sandbox variants          |
| One state machine matching existing Zod schema                               | New status values without a real consumer |
| Persistence + repo helpers in `@afenda/db`                                   | Vercel Workflow DevKit orchestration      |
| Wiring `proposeHumanApprovedAction` and `proposeApprovalDecision` to persist | New AI tools or skills                    |
| Admin/audit list of sandboxes                                                | New module domain (LMS, etc.)             |
| Domain executor contract (one proof skill)                                   | Full domain executors for every module    |

## State machine

Aligns with [`packages/ai/src/schemas/ai.operations.schema.ts`](../../packages/ai/src/schemas/ai.operations.schema.ts) `sandboxStatusSchema` and current [`ai.sandbox.actions.server.ts`](../../packages/ai/src/actions/ai.sandbox.actions.server.ts) helpers.

```
pending  --human_approve--> approved
pending  --human_reject---> rejected
pending  --supersede------> discarded
approved --executor_writes_domain_row_with_sandbox_id--> (terminal)
```

Notes:

- `executed` is **not** a sandbox status. The domain row stores the sandbox id; that link is "executed".
- Rollback = a new sandbox with `actionType: "rollback-<original>"` and `affectedRecords` pointing at the rows to reverse. Same lifecycle, no special status.
- This avoids dual-write drift between sandbox status and domain row state.

## Data

### `ai_action_sandboxes` (new table in `@afenda/db`)

Tenant-scoped, generic.

- `id` (text, pk) — `aisbx_<uuid>`
- `organization_id` (fk → `organizations.id`, cascade)
- `module_id` (`erp_module_id_enum`)
- `action_type` (text, max 120)
- `title` (text)
- `proposed_by` (text: `ai | user`)
- `status` (new enum `ai_sandbox_status`: `pending | approved | rejected | discarded`)
- `diff` (jsonb — matches `actionDiffSchema`)
- `risk_assessment` (jsonb — matches `riskAssessmentSchema`)
- `source_evidence` (jsonb array — `groundedEvidenceSchema[]`)
- `rollback_metadata` (jsonb, nullable)
- `approval_proposal_id` (fk → `ai_approval_proposals.id`, nullable) — link, do not duplicate
- `rejection_reason` (text, nullable)
- timestamps: `created_at`, `updated_at`, `approved_at`, `rejected_at`

Indexes: `(organization_id, status, created_at)`, `(organization_id, module_id)`, `(approval_proposal_id)`.

No new schema is invented for sandbox content — Zod schemas already exist in [`packages/ai/src/schemas/ai.operations.schema.ts`](../../packages/ai/src/schemas/ai.operations.schema.ts).

### Repo helpers (in `@afenda/db`)

- `createAiActionSandbox(input)` — accepts the Zod-parsed sandbox; inserts row.
- `getAiActionSandboxById(id, organizationId)`
- `listAiActionSandboxes({ organizationId, moduleId?, status?, limit?, cursor? })`
- `transitionAiActionSandbox({ id, organizationId, to: 'approved' | 'rejected' | 'discarded', reason?, actorAuthUserId })`
- `linkAiActionSandboxToApproval({ sandboxId, approvalProposalId, organizationId })`

All helpers are tenant-scoped via `organizationId` and use existing GUC-based tenancy ([ARCH-1005](../architecture/1005-infrastructure.md)).

## AI tool wiring (no new tools)

Fix the existing tools — do not add new ones (YAGNI).

| Tool                                                                                                                                                 | Today                                                                         | Change                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `proposeHumanApprovedAction` in [`lynx.solution-provider-tools.tool.server.ts`](../../packages/features/lynx/src/tools/lynx.solution-provider-tools.tool.server.ts) | Builds `createActionSandbox(...)` in memory, never persists, never returns id | Persist via `createAiActionSandbox`, link to existing `ai_approval_proposals` row, return `sandboxId` in tool output |
| `proposeApprovalDecision` in [`ai.erp-tools.tool.server.ts`](../../packages/ai/src/tools/ai.erp-tools.tool.server.ts)                                | Persists approval proposal only                                               | Also create a `pending` sandbox and link it; status transitions follow the human decision                            |

`needsApproval: true` stays where it is. Domain writes never happen inside `execute`; they happen in a **separate domain executor** invoked after approval.

## Domain executor contract

Define one TypeScript type in `@afenda/ai` (or `@afenda/db` if it lives next to the helpers — pick one place):

```ts
type SandboxExecutor<TInput, TOutput> = (input: {
  sandbox: ActionSandbox;
  organizationId: string;
  actorAuthUserId: string;
  payload: TInput;
}) => Promise<{ result: TOutput; createdRowIds: readonly string[] }>;
```

- Executors live in feature/kernel packages, not in `@afenda/ai`.
- Executors only run for `status === 'approved'`.
- Executors write the domain row with a `sandbox_id` column referencing the source sandbox.

**First proof consumer:** pick **one** existing recovery skill (recommendation: `revenue-leakage-recovery`) and wire its approved sandbox to a real domain side-effect on `erp_work_items` (e.g., create a follow-up work item). This validates the contract without a new module.

## UI surfaces

Reuse existing components — no new renderer infrastructure required.

- **Lynx Console** ([`(app)/lynx`](<../../apps/erp/src/app/(app)/lynx>)) — show sandbox id and link to the admin list on each approval-required card.
- **Admin/reports** — governed list of `ai_action_sandboxes` per tenant with status filter. Reuse `GovernedPatternCListSection` ([ARCH-1003](../architecture/1003-frontend.md)).
- **Module workspace** ([`module-screen.tsx`](<../../apps/erp/src/app/(app)/module-screen.tsx>)) — small "AI actions" affordance linking to sandboxes for the current `moduleId`.

## Test plan

- Unit:
  - Sandbox status transitions reject invalid moves (already covered for in-memory; extend to repo helpers).
  - Repo helpers enforce `organizationId` filter on every query.
- Integration:
  - `proposeHumanApprovedAction` persists a sandbox and returns its id.
  - Cross-tenant sandbox reads return empty.
  - Domain executor refuses to run on non-approved sandbox.
  - Domain row created by executor carries the originating `sandbox_id`.
- Route/UI:
  - Admin governed list renders sandbox rows with correct status badges.
  - Solution Console card surfaces sandbox id.
- Gates:
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm architecture:check`
  - `pnpm db:generate` (review migration)
  - `pnpm lint:governed-renderers` (if admin list metadata touches governed-surface)

## Assumptions

- Sandboxes are infrastructure. They must work end-to-end **before** any new ERP module is added.
- The Zod schemas already in [`packages/ai/src/schemas/ai.operations.schema.ts`](../../packages/ai/src/schemas/ai.operations.schema.ts) are canonical; the DB shape mirrors them.
- Approval persistence (`ai_approval_proposals`) is not duplicated by sandboxes; sandboxes **link** to approval rows via `approval_proposal_id`.
- Vercel AI SDK / Gateway remains the runtime layer.
- Durable workflows (Vercel WDK) are out of scope for this track.

## Out of scope (explicit YAGNI)

**Final disposition:** **TRACK-003** (no further “defer” — implement or cancel).

- New `lms` module, `lms_*` tables, LMS capabilities, `/lms` route — **cancelled** until Appendix A track.
- New AI schemas for training plans, schedules, learners, assessments, certifications.
- New AI tools (`analyzeTrainingNeeds`, `designTrainingPlan`, etc.).
- Vercel Workflow DevKit (`'use workflow'`, `defineHook`) — **cancelled**; use cron routes.
- Embeddings or semantic search — **cancelled** for v1.
- Per-module sandbox tables or per-module state machines.

---

## Appendix A — Candidate next consumer (LMS, deferred)

Once the executor pattern above ships and proves stable on an existing recovery skill, LMS becomes a viable next consumer. **Minimum LMS for that step:**

- Tables: `lms_courses`, `lms_enrollments` only. Each carries `sandbox_id` and `organization_id`.
- Capabilities: `lms.view`, `lms.manage`, `lms.approve`.
- Domain executor: create course and enroll learners from an approved sandbox produced by the existing solution-provider agent. **No new AI tools required initially** — reuse `proposeHumanApprovedAction` with a new `actionType`.
- Defer `lms_training_sessions`, `lms_assessments`, `lms_certifications` until operators ask for them.

Anything beyond this minimum is a separate roadmap item.

## Appendix B — Reconciliation notes (from earlier draft)

This document supersedes the earlier draft that mixed LMS provisioning with execution-layer infrastructure and proposed a five-state machine (`pending|approved|rejected|executed|rolled_back`). The earlier shape conflicted with shipping code:

- Code state machine was `pending|approved|rejected|discarded` ([`schemas/ai.operations.schema.ts`](../../packages/ai/src/schemas/ai.operations.schema.ts)).
- In-memory sandboxes were created by `proposeHumanApprovedAction` and discarded with no persistence ([`lynx.solution-provider-tools.tool.server.ts`](../../packages/features/lynx/src/tools/lynx.solution-provider-tools.tool.server.ts)).

Decisions:

- **State machine:** keep code as-is; remove `executed` / `rolled_back` from the doc. Execution is recorded by a foreign key from the domain row to the sandbox id; rollback is a new sandbox with a `rollback-` action type.
- **First consumer:** an existing recovery skill, not LMS.
- **Sandbox table:** generic, in `@afenda/db`, with `approval_proposal_id` link instead of duplicating approval fields.
