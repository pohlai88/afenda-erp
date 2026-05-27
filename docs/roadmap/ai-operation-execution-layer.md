# Afenda AI Next Development Plan: LMS Operational Execution Layer

## Summary

Build the next Afenda AI milestone by turning the staged `lms-training-designer` skill into the first fully operational AI module. The goal is to prove Afenda can move from evidence-backed diagnosis to real operating coordination: training need analysis, training plan design, scheduling, learner assignment, human approval, persisted action sandboxing, and audit-ready execution.

This plan keeps the Vercel-first Next.js architecture, uses the existing AI SDK/Gateway agent pattern, and does not introduce Cloudflare runtime or embeddings.

## Key Changes

### Data and Permissions

- Add `lms` as a first-class ERP module in shared module IDs, DB enum, domain metadata, navigation, seed data, and protected route access.
- Add LMS capabilities:
  - `lms.view`
  - `lms.manage`
  - `lms.approve`
- Add Drizzle tables:
  - `lms_courses`: course definition, objectives, audience, status, owner, metadata.
  - `lms_training_sessions`: scheduled session, trainer, location/link, start/end time, status.
  - `lms_enrollments`: learner assignment, status, due date, completion timestamp.
  - `lms_assessments`: quiz/rubric/practical assessment draft and release state.
  - `lms_certifications`: certification name, learner, expiry, renewal status.
  - `ai_action_sandboxes`: persisted sandbox proposals with `pending | approved | rejected | executed | rolled_back`.
- Keep all tables tenant-scoped by `organizationId`, with audit fields and indexes on organization, status, due/expiry dates, and sandbox status.

### AI Interfaces

- Promote `lms-training-designer` from staged to active operational skill.
- Add LMS schemas in `packages/ai`:
  - `TrainingNeedAnalysisInput`
  - `TrainingNeedAnalysis`
  - `TrainingPlan`
  - `TrainingScheduleProposal`
  - `LearnerAssignmentProposal`
  - `TrainingApprovalRequest`
- Add LMS tools:
  - `analyzeTrainingNeeds`: read-only, no approval.
  - `designTrainingPlan`: draft-only, returns structured plan.
  - `draftTrainingSchedule`: creates sandbox only.
  - `draftLearnerAssignments`: creates sandbox only.
  - `proposeTrainingApproval`: `needsApproval: true`, persists approved sandbox proposal.
- Extend AI Gateway feature tags with `lms-training` and keep tags for app, tenant, user, module, workflow, risk, and environment.
- Persist every mutation-capable AI proposal through `ai_action_sandboxes` before any LMS record is created.

### App and UI

- Add `/lms` using the existing metadata-driven module route pattern.
- Add an LMS workspace with cards for:
  - training needs,
  - courses,
  - sessions,
  - learner assignments,
  - certifications,
  - AI action history.
- Extend `/solution-console` so LMS appears as an operational skill and can launch the starter prompt:
  - “Prepare safety training for warehouse staff next month.”
- Add structured AI cards for LMS outputs:
  - skill gap evidence,
  - training plan,
  - schedule proposal,
  - learner assignment diff,
  - approval-required state,
  - execution result.

### Execution Lifecycle

- Add server-side helpers:
  - `createPersistedActionSandbox`
  - `approvePersistedActionSandbox`
  - `rejectPersistedActionSandbox`
  - `executeApprovedActionSandbox`
  - `rollbackExecutedActionSandbox`
- Execution rules:
  - read-only analysis never mutates.
  - plan/schedule/assignment tools create sandbox proposals only.
  - approval is required before creating LMS courses, sessions, enrollments, or assessments.
  - execution writes audit logs and links generated LMS records back to the sandbox.
  - rejected proposals remain visible in action history.

## Test Plan

- Unit tests:
  - LMS schemas validate valid/invalid training plans, schedules, assignments, and certification expiry.
  - sandbox state transitions reject invalid transitions.
  - LMS tools enforce tenant ID, session user, and capability requirements.
- Integration tests:
  - `proposeTrainingApproval` persists a pending/approved sandbox before execution.
  - approved sandbox execution creates course/session/enrollment records.
  - rejected sandbox cannot execute.
  - cross-tenant LMS records are not visible.
- Route/UI tests:
  - `/lms` requires `lms.view`.
  - Solution Console renders active LMS skill.
  - LMS AI cards render evidence, confidence, sandbox diff, and approval state.
- Final gates:
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test`
  - `pnpm build`
  - `pnpm security:review`
  - `pnpm performance:budget`

## Assumptions

- LMS is the next proof module because it demonstrates operational execution with lower financial risk than finance mutation.
- Existing generic module records remain available, but LMS gets dedicated tables for real workflows.
- AI does not directly mutate LMS records; it drafts sandboxed proposals first.
- Vercel AI SDK/Gateway remains the runtime layer.
- Durable long-running workflows are deferred until after LMS approval/execution works end to end.
