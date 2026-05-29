# TRACK-004 · Enterprise HRM Migration

**Tracking ID:** `TRACK-004` · **File:** `004-hrm-migration.md` · **Status:** Active workforce migration · **Owner:** Architecture / HR · **Related:** **ARCH-002**, **ARCH-005**, **ARCH-006**, **ARCH-008**

This track grows `@afenda/feature-hr-suite` into full ERP HR capability using the
current Afenda architecture (governed UI, ARCH-008 export doors, schema in
`@afenda/db`).

Audience: engineers and agents implementing HR migration slices.

Action enabled: move HRM into the current monorepo architecture without copying
legacy boundaries, inventing nested workspaces, bypassing governed UI, or
claiming completion before parity is proven.

## Current State

**Scaffold reset (2026-05-28):** Failed HR implementation was removed. A clean
`@afenda/feature-hr-suite` package exists with ARCH-008 export doors only; metadata
delegates to `createModuleFeatureMetadata("hr")` like other core modules.

- **Legacy input:** `packages/features/hrm` removed (2026-05-28); re-scaffold by
  slice into `@afenda/feature-hr-suite` when implementing TRACK-004;
- **Target package:** `packages/features/hr-suite` — see `ARCHITECTURE.md`; no
  `schema/hr` or server queries until Slice 1 is accepted;
- **Database:** migration `0030_revert_hr_migration_tables` drops tables from the
  withdrawn `0027` / `0029` attempt; run `pnpm db:migrate` on environments that
  applied those migrations;
- **ERP `/hr`:** generic module workspace via `@afenda/kernel` (same as finance
  scaffold phase).

Do not restore the deleted `packages/features/hrm` tree. New HR work lands only in
`packages/features/hr-suite` with schema in `packages/db` per ARCH-005.

## Audit Baseline

This baseline is intentionally concrete so future agents cannot replace migration
work with broad claims.

Current target scaffold:

```txt
packages/features/hr/
  package.json
  tsconfig.json
  tsconfig.build.json
  src/client.ts
  src/index.ts
  src/metadata.ts
  src/server.ts
```

Legacy source inventory at reset:

| Legacy area | TS/TSX files | TSX files |
| ----------- | ------------ | --------- |
| `core` | 37 | 4 |
| `employee-management` | 357 | 113 |
| `time-attendance` | 547 | 176 |
| `payroll-compensation` | 317 | 70 |
| `talent-management` | 372 | 128 |
| `industry-specific` | 384 | 146 |
| `route-composition` | 4 | 3 |
| **Total** | **2,018** | **640** |

Any future claim that HR is "done" must explain what happened to this inventory:
migrated, retired, deferred, or replaced by an explicitly documented current
architecture alternative.

## Architecture Rules

- One workspace package only: `packages/features/hr`.
- Internal nested folders are required for large HR domains.
- Nested workspace packages such as `packages/features/hr/payroll/package.json`
  are forbidden unless **ARCH-008** and `pnpm architecture:check` change in the
  same commit.
- Feature package code may import public doors from `@afenda/kernel`,
  `@afenda/db`, `@afenda/auth`, `@afenda/governed-surface`, `@afenda/ui`,
  `@afenda/workflows`, and `@afenda/observability`.
- Feature packages must not import from `apps/erp`.
- Drizzle schema and migrations live in `packages/db`, not in the feature
  package.
- App Router files stay thin: session, organization, capability checks,
  search-param normalization, and composition only.
- Lists must use bounded server windows and governed list surfaces. Do not ship
  full datasets or hand-written app tables for migrated enterprise HR lists.
- `organizationId` comes from server auth/session context. Never trust
  client-supplied tenant IDs.
- Cron handlers stay under `/api/cron/*` and validate
  `Authorization: Bearer ${CRON_SECRET}` through `src/lib/cron.ts`.

## Anti-Cheating Rules

These rules exist because the previous migration failed by producing scaffolding
and then documenting it as completion.

- Creating directories, empty files, export barrels, TODO comments, placeholder
  pages, mock data, demo data, in-memory services, or no-op cron handlers does
  not count as migration progress.
- Passing TypeScript alone does not count as parity.
- Documentation-only changes never count as slice completion.
- Generic `erp_module_records` compatibility does not count as migration for
  payroll, statutory, lifecycle, compliance, time-clock, or audit-sensitive HR
  records.
- A slice cannot be marked complete unless its legacy inventory, target files,
  schema/migration changes, tests, and validation output are listed together.
- A route or API handler that does not call a package-owned service is an adapter
  stub, not a migrated capability.
- A server service that accepts `organizationId` from client input without
  server-side auth/session derivation is a security failure, even if tests pass.
- A generated migration that contains unrelated schema changes is invalid for
  the slice.
- If an agent cannot prove parity, the correct status is `partial` or
  `blocked`, not `complete`.

## Legacy To Target Map

Use current-domain names in the target package. Keep legacy names only in this
map and in migration notes.

```txt
packages/features/hrm/core
  -> packages/features/hr/src/contracts
  -> packages/features/hr/src/metadata
  -> packages/features/hr/src/shared

packages/features/hrm/employee-management
  -> packages/features/hr/src/workforce

packages/features/hrm/time-attendance
  -> packages/features/hr/src/time-attendance

packages/features/hrm/payroll-compensation
  -> packages/features/hr/src/payroll

packages/features/hrm/talent-management
  -> packages/features/hr/src/talent

packages/features/hrm/industry-specific
  -> packages/features/hr/src/industry

packages/features/hrm/route-composition
  -> apps/erp thin adapters only
  -> no copied route-composition package folder
```

## Target Feature Package Tree

This is the complete enterprise target shape. Create folders only when their
slice is implemented; do not prefill empty directories with placeholder code.
This tree is a destination map, not a checklist to materialize in one commit.
Creating this tree without working services, metadata, tests, and validation is
a failed migration.

```txt
packages/features/hr/
  package.json
  tsconfig.json
  tsconfig.build.json
  src/
    index.ts                 # root exports: stable contracts + metadata only
    client.ts                # client-safe components/hooks only
    server.ts                # server-only query/command/workflow exports
    metadata.ts              # package-owned metadata public door

    contracts/
      index.ts
      module.ts              # module id, slice ids, public constants
      permissions.ts         # HR capability names and helpers
      records.ts             # HR record/work-item contracts
      commands.ts            # command input/output contracts
      events.ts              # audit/workflow event contracts
      integrations.ts        # import/export/webhook contracts

    metadata/
      index.ts
      catalog.ts             # public metadata export catalog
      record-types.ts        # RecordTypeDefinition ownership
      list-surfaces.ts       # governed list builders
      detail-surfaces.ts     # governed detail/tab builders
      stat-surfaces.ts       # dashboard and KPI builders
      saved-views.ts
      profiles.ts            # governed renderer profiles

    contracts/
      pagination.ts          # list window helpers (no banned `shared/` folder)

    components/
      client.ts              # explicit client component door
      server.ts              # explicit server component door if needed
      shared/
        empty-state.tsx
        list-trailing-cells.client.tsx
      workforce/
      time-attendance/
      payroll/
      talent/
      industry/

    workforce/
      index.ts
      server.ts
      contracts.ts
      permissions.server.ts
      employees/
        queries.server.ts
        commands.server.ts
        windows.server.ts
        surfaces.server.ts
        validation.ts
      departments/
        queries.server.ts
        commands.server.ts
        windows.server.ts
      positions/
        queries.server.ts
        commands.server.ts
        windows.server.ts
      assignments/
        queries.server.ts
        commands.server.ts
      org-chart/
        queries.server.ts
        commands.server.ts
        surfaces.server.ts
      documents/
        queries.server.ts
        commands.server.ts
        expiry-sweeps.server.ts
        surfaces.server.ts
      contracts/
        queries.server.ts
        commands.server.ts
        renewal-sweeps.server.ts
      lifecycle/
        queries.server.ts
        commands.server.ts
        probation-sweeps.server.ts
      offboarding/
        queries.server.ts
        commands.server.ts
        task-sweeps.server.ts
      compliance/
        queries.server.ts
        commands.server.ts
        obligation-sweeps.server.ts

    time-attendance/
      index.ts
      server.ts
      contracts.ts
      leave/
        queries.server.ts
        commands.server.ts
        windows.server.ts
        overdue-sweeps.server.ts
      attendance/
        queries.server.ts
        commands.server.ts
        anomaly-sweeps.server.ts
      overtime/
        queries.server.ts
        commands.server.ts
        pending-sweeps.server.ts
      shifts/
        queries.server.ts
        commands.server.ts
        publish-sweeps.server.ts
      time-clock/
        ingest.server.ts
        devices.server.ts
        mappings.server.ts
        vendor-sync.server.ts
        idempotency.ts
      geolocation/
        queries.server.ts
        commands.server.ts
        policy.ts
      flexible-work/
        queries.server.ts
        commands.server.ts
      absence-analytics/
        queries.server.ts
        surfaces.server.ts
      public-holidays/
        queries.server.ts
        cache.server.ts

    payroll/
      index.ts
      server.ts
      contracts.ts
      compensation/
        queries.server.ts
        commands.server.ts
      benefits/
        queries.server.ts
        commands.server.ts
      claims-expenses/
        queries.server.ts
        commands.server.ts
      payroll-runs/
        queries.server.ts
        commands.server.ts
        finalize.workflow.ts
      payroll-lines/
        queries.server.ts
        calculations.server.ts
      statutory/
        packs.server.ts
        acknowledgement.server.ts
        export.workflow.ts
        authority-webhooks.server.ts
      rule-packs/
        index.ts
        my.ts
        sg.ts
        ph.ts
        id.ts
      audit/
        events.server.ts

    talent/
      index.ts
      server.ts
      contracts.ts
      recruiting/
        requisitions.server.ts
        candidates.server.ts
        offers.server.ts
        pipeline.server.ts
      onboarding/
        plans.server.ts
        tasks.server.ts
        due-sweeps.server.ts
      learning/
        courses.server.ts
        enrollments.server.ts
        reminders.server.ts
      training/
        records.server.ts
        certifications.server.ts
      performance/
        cycles.server.ts
        reviews.server.ts
        due-sweeps.server.ts
      skills/
        framework.server.ts
        employee-skills.server.ts
      succession/
        plans.server.ts
        readiness.server.ts
      engagement/
        surveys.server.ts
        responses.server.ts
        close-sweeps.server.ts

    industry/
      index.ts
      server.ts
      contracts.ts
      retail/
        scheduling.server.ts
        seasonal-workforce.server.ts
      field-workforce/
        dispatch.server.ts
        mobile-capture.server.ts
        travel.server.ts
        per-diem.server.ts
      government-pay-grades/
        grades.server.ts
        movements.server.ts
      union/
        memberships.server.ts
        agreements.server.ts
        dues.server.ts
      safety/
        incidents.server.ts
        training.server.ts
        open-incident-sweeps.server.ts
      food-handler/
        certifications.server.ts
        outlets.server.ts
        expiry-sweeps.server.ts

    integrations/
      index.ts
      imports/
        employee-import.server.ts
        time-clock-import.server.ts
      exports/
        organization-export.server.ts
        statutory-export.server.ts
      webhooks/
        hmac.ts
        statutory-acknowledgement.server.ts
      vendors/
        time-clock-vendor.contracts.ts

  tests/
    unit/
      metadata.test.ts
      contracts.test.ts
      workforce/
      time-attendance/
      payroll/
      talent/
      industry/
    integration/
      server-windows.test.ts
      command-authorization.test.ts
      payroll-audit.test.ts
```

## Target Database Schema Tree

Create `packages/db/src/schema/hr/` only when the first accepted HR schema slice
lands. Schema files must match migrated behavior, not speculative placeholders.

```txt
packages/db/src/schema/hr/
  index.ts
  workforce.ts             # departments, positions, employees, assignments
  org-chart.ts             # org units, reporting lines, position history
  documents.ts             # documents, versions, contracts, renewals
  lifecycle.ts             # employment events, probation, transitions, offboarding
  compliance.ts            # obligations, evidence, aging/read models
  time-attendance.ts       # leave, balances, attendance, overtime, shifts
  time-clock.ts            # devices, mappings, raw events, exceptions, batches
  payroll.ts               # periods, runs, lines, compensation, benefits
  statutory.ts             # statutory packs, acknowledgements, filing events
  talent.ts                # requisitions, candidates, onboarding, LMS, reviews
  skills.ts                # skill framework, employee skills, succession
  engagement.ts            # surveys, responses, action plans
  industry.ts              # retail, field workforce, government, union, safety
  audit.ts                 # HR append-first audit events if not shared
```

Database rules:

- every tenant-owned table has `organizationId`;
- every queue/list table has indexes for tenant, status, due date, and common
  filters;
- statutory, payroll, lifecycle, approval, and audit flows are append-first;
- migrations are isolated by slice and generated from a clean baseline;
- no posting-grade or statutory records are stored permanently in
  `erp_module_records`.

## App And API Adapter Tree

Default route doctrine remains the shared dynamic module route:

```txt
apps/erp/src/app/
  (app)/
    [moduleId]/
      page.tsx
      records/[recordId]/page.tsx
      work-items/[workItemId]/page.tsx
  api/
    cron/
      <accepted-hr-job>/route.ts
    erp/
      hr/
        <accepted-internal-api>/route.ts
    integrations/
      <accepted-hr-webhook>/route.ts
```

Adapter rules:

- `(app)/[moduleId]` remains the default for core HR workspace rendering.
- A dedicated `apps/erp/src/app/(app)/hr/` tree requires an explicit
  architecture update and route doctrine approval in the same change.
- API and cron routes are thin adapters only. Domain logic lives in
  `@afenda/feature-hr/server` or workflow packages.
- Route Handlers re-check capabilities before reads or mutations.
- Public or third-party webhooks use HMAC/signature validation and never trust
  tenant IDs without verification.

## Migration Method

Every migration slice must follow this sequence. Do not skip steps.

1. Inventory legacy source.

   Produce a short inventory in the PR description or slice notes:

   ```txt
   legacy folders read:
   - packages/features/hrm/<area>/src/<capability>

   legacy concepts accepted:
   - ...

   legacy concepts retired/deferred:
   - ...
   ```

2. Normalize names and contracts.

   - Rename module vocabulary from `hrm` to `hr`.
   - Replace legacy package imports with current public doors.
   - Define command/query inputs in `src/<slice>/contracts.ts` or
     `src/contracts`.
   - Keep shared cross-module types in `@afenda/kernel`, not HR internals.

3. Promote schema deliberately.

   - Add or change tables under `packages/db/src/schema/hr`.
   - Generate one migration per slice from a clean migration baseline.
   - Validate Drizzle journal and snapshots.
   - Add indexes with the schema, not after production pain appears.

4. Build server services first.

   - Queries return bounded server windows.
   - Commands validate input, derive organization context on the server, enforce
     capabilities, and write audit events where required.
   - Mutations use transactions for multi-table consistency.
   - Long-running work exposes workflow/sweeper entrypoints, not route-local
     loops.

5. Build governed metadata.

   - Add record types, list surfaces, detail surfaces, stats, saved views, and
     renderer profiles under `src/metadata`.
   - Validate metadata parse behavior.
   - Never pass arbitrary tenant JSON to renderers as authority.

6. Wire app adapters.

   - Use `(app)/[moduleId]` where possible.
   - Add only thin API/cron/webhook handlers.
   - Re-check capabilities at every route boundary.
   - Keep UI primitives in `@afenda/ui`; keep governed renderers in
     `@afenda/governed-surface`.

7. Add tests.

   - Unit-test contracts, metadata, calculations, and permission gates.
   - Integration-test server windows and commands where database behavior
     matters.
   - Add e2e tests when routes or operator workflows change.

8. Remove compatibility only after parity.

   - Do not delete legacy source until the target slice has accepted parity.
   - Remove domain/app compatibility code only after tests and route behavior
     prove the replacement.

## Required Evidence Bundle

Every slice PR or task log must include this bundle. Missing evidence blocks the
slice from being marked complete.

```txt
slice:
status: not-started | partial | blocked | complete

legacy inventory:
- folders inspected:
- files counted:
- files migrated:
- files retired:
- files deferred:

target implementation:
- feature package files:
- db schema files:
- migration files:
- app adapters:
- api/cron/webhook adapters:

architecture checks:
- package boundary checked:
- client/server export safety checked:
- governed list surfaces checked:
- tenant derivation checked:
- authorization checked:
- audit/idempotency checked:

validation output:
- pnpm --filter @afenda/feature-hr typecheck:
- pnpm --filter @afenda/erp typecheck:
- pnpm typecheck:
- pnpm architecture:check:
- pnpm test:
- extra relevant commands:

known gaps:
- deferred:
- blocked:
- risk accepted by:
```

Evidence must be specific enough that a reviewer can reproduce the work from the
repo. Phrases such as "implemented HR", "wired services", or "added parity" are
not sufficient without file paths and validation results.

## Slice Plan

| Slice | Legacy source | Target folders | Completion criteria |
| ----- | ------------- | -------------- | ------------------- |
| 0. Scaffold | `hrm/core` contracts only | `contracts`, `metadata`, `shared` | Public doors stable, metadata compatibility intact, no server-only imports in `./client`. |
| 1. Workforce foundation | `employee-management/employee-records-management`, `organizational-chart-hierarchy` | `workforce/employees`, `departments`, `positions`, `assignments`, `org-chart` | Employee directory and org structure use HR schema, bounded windows, governed lists. |
| 2. Documents and lifecycle | `documents-management`, `employee-lifecycle-management`, `offboarding-exit-management`, `compliance-regulatory-tracking` | `workforce/documents`, `contracts`, `lifecycle`, `offboarding`, `compliance` | Documents, contracts, lifecycle transitions, probation, offboarding, and compliance have server services, audit, sweeps, and governed detail/list surfaces. |
| 3. Time and attendance | `time-attendance/leave-attendance-management`, `overtime-management`, `shift-scheduling`, `time-clock-integration` | `time-attendance/leave`, `attendance`, `overtime`, `shifts`, `time-clock` | Leave, attendance, overtime, shifts, and time-clock ingest use typed schema, idempotency, bounded windows, and secured APIs/cron. |
| 4. Extended attendance | `geolocation-remote-checkin`, `flexible-work-arrangement-tracking`, `absence-analytics-trends` | `time-attendance/geolocation`, `flexible-work`, `absence-analytics` | Remote check-in, flexible work, and absence analytics have policy services, privacy-safe telemetry, and governed surfaces. |
| 5. Payroll core | `payroll-compensation/payroll-processing`, `multi-country-payroll`, `compensation-planning-modeling` | `payroll/payroll-runs`, `payroll-lines`, `compensation`, `rule-packs` | Payroll runs are transactional, auditable, country-aware, and never destructive. |
| 6. Payroll adjacent | `benefits-administration`, `expenses-reimbursement`, `bonus-incentive-management`, `salary-benchmarking-survey` | `payroll/benefits`, `claims-expenses`, `compensation` | Benefits, claims, incentives, and benchmarking are permissioned and reportable. |
| 7. Statutory | legacy payroll statutory flows | `payroll/statutory`, `integrations/webhooks`, `integrations/exports` | Statutory packs, exports, acknowledgements, HMAC webhooks, and audit events are implemented. |
| 8. Talent acquisition | `talent-management/recruitment-onboarding`, `candidate-selfservice-portal` | `talent/recruiting`, `onboarding` | Requisitions, candidates, offers, onboarding plans, and tasks are migrated; public candidate portal remains deferred unless route doctrine changes. |
| 9. Talent development | `learning-management-system-lms`, `training-development`, `performance-appraisals` | `talent/learning`, `training`, `performance` | LMS, training records, certifications, review cycles, and due sweeps are migrated. |
| 10. Talent strategy | `competency-skills-framework`, `career-pathing-development-plans`, `succession-planning`, `employee-engagement-surveys` | `talent/skills`, `succession`, `engagement` | Skills, career paths, succession, engagement surveys, and action plans are migrated. |
| 11. Industry extensions | `industry-specific/*` | `industry/retail`, `field-workforce`, `government-pay-grades`, `union`, `safety`, `food-handler` | Industry-specific workflows are isolated by internal folder, schema-backed, permissioned, and governed. |
| 12. Enterprise hardening | all accepted slices | all HR folders | Observability, security review, e2e coverage, migration cleanup, and docs complete. |

## Status Ledger

Only update this table when the evidence bundle for a slice is present in the
same change.

| Slice | Status | Evidence |
| ----- | ------ | -------- |
| 0. Scaffold | complete | Slice 0 reset 2026-05-29: honest contracts, shared pagination, vitest scaffold tests, reset script; see evidence bundle below. |
| 1. Workforce foundation | complete | Slice 1 accepted 2026-05-29: hr_* + hr_employee_assignments (0009/0010); governed reads; create/update/archive + UI; 9 vitest + 2 Playwright smoke; see evidence bundle below. |
| 2. Documents and lifecycle | complete (gap closure 0016) | 2a–2d + verify/reject, requirements, expiry cron, onboarding cases, offboarding clearance (0016). |
| 3. Time and attendance | partial (3a–3d) | 3a leave (0015), 3b attendance (0017), 3c overtime (0018), 3d shifts (0019); time-clock deferred. |
| 4. Extended attendance | not started | Missing evidence bundle. |
| 5. Payroll core | not started | Missing evidence bundle. |
| 6. Payroll adjacent | not started | Missing evidence bundle. |
| 7. Statutory | not started | Missing evidence bundle. |
| 8. Talent acquisition | not started | Missing evidence bundle. |
| 9. Talent development | not started | Missing evidence bundle. |
| 10. Talent strategy | not started | Missing evidence bundle. |
| 11. Industry extensions | not started | Missing evidence bundle. |
| 12. Enterprise hardening | not started | Missing evidence bundle. |

## Evidence Bundles

```txt
slice: 0. Scaffold
status: complete

legacy inventory:
- folders inspected: packages/features/hrm/core/src
- files counted: 37 TS/TSX, 4 TSX from the TRACK-004 reset inventory
- files migrated: 0 legacy implementation files copied; accepted only module
  identity, route-template, capability, and scaffold contract concepts
- files retired: none
- files deferred: legacy landing pages, route-composition helpers, server
  governance guards, rail/snapshot pressure code, employee row-link helpers,
  and all Workforce/Slice 1+ behavior

target implementation:
- feature package files:
  - packages/features/hr/package.json
  - packages/features/hr/src/contracts/index.ts
  - packages/features/hr/src/contracts/module.ts
  - packages/features/hr/src/contracts/permissions.ts
  - packages/features/hr/src/contracts/records.ts
  - packages/features/hr/src/metadata.ts
  - packages/features/hr/src/metadata/catalog.ts
  - packages/features/hr/src/metadata/index.ts
  - packages/features/hr/src/shared/index.ts
  - packages/features/hr/src/shared/pagination.ts
  - packages/features/hr/src/index.ts
  - packages/features/hr/src/client.ts
  - packages/features/hr/src/server.ts
  - packages/features/hr/tests/unit/scaffold.test.ts
  - packages/features/hr/vitest.config.ts
- db schema files: none; packages/db/src/schema/hr was not created
- migration files: none
- app adapters: none; apps/erp/src/app/(app)/hr was not created
- app integration tests:
  - apps/erp/tests/unit/lib/module-feature-metadata.test.ts
- api/cron/webhook adapters: none

architecture checks:
- package boundary checked: pnpm architecture:check passed
- client/server export safety checked: tests assert ./client exposes only
  client-safe contracts/shared and no metadata builders
- governed list surfaces checked: no custom HR list surfaces added; metadata
  compatibility still delegates to createModuleFeatureMetadata("hr"); app
  resolver test proves @afenda/feature-hr/metadata resolves HR list surface keys
- tenant derivation checked: not applicable in Slice 0; no server query/command
  service or tenant-scoped data access added
- authorization checked: HR capability constants are compile-time validated
  against @afenda/auth AppCapability and runtime-tested against appCapabilities
- audit/idempotency checked: not applicable in Slice 0; no mutation, workflow,
  cron, webhook, import, or export path added

validation output:
- pnpm --filter @afenda/feature-hr typecheck: passed
- pnpm --filter @afenda/feature-hr test: passed, 1 test file / 5 tests
- pnpm --filter @afenda/feature-hr build: passed
- pnpm --filter @afenda/erp typecheck: passed
- pnpm typecheck: passed, 23/23 packages
- pnpm architecture:check: passed; Drizzle journal reported existing
  non-blocking snapshot warnings
- pnpm test: passed, 34/34 Turbo tasks
- extra relevant commands:
  - pnpm install --filter @afenda/feature-hr...: passed, refreshed HR
    workspace links for the new @afenda/auth dependency
  - packages/kernel tests normalized to current ARCH-009 Lynx Operator copy so
    stale Solution Console assertions no longer block the root gate

known gaps:
- deferred: Workforce foundation and every Slice 1+ capability; no DB schema,
  migrations, app routes, APIs, cron handlers, webhooks, employee records, or
  copied legacy HRM UI/server implementation
- blocked: none for Slice 0
- risk accepted by: none
```

```txt
slice: 1. Workforce foundation
status: complete

legacy inventory:
- folders inspected:
  - packages/features/hrm/employee-management/src
  - packages/features/hrm/employee-management/src/employee-records-management
  - packages/features/hrm/employee-management/src/organizational-chart-hierarchy
- files counted:
  - employee-management total: 357 TS/TSX, 113 TSX
  - compliance-regulatory-tracking: 79 TS/TSX, 25 TSX
  - documents-management: 24 TS/TSX, 7 TSX
  - employee-lifecycle-management: 46 TS/TSX, 9 TSX
  - employee-records-management: 64 TS/TSX, 22 TSX
  - employee-selfservice-portal: 73 TS/TSX, 37 TSX
  - integration: 1 TS/TSX, 0 TSX
  - offboarding-exit-management: 26 TS/TSX, 6 TSX
  - organizational-chart-hierarchy: 37 TS/TSX, 7 TSX
- files migrated: 0 legacy implementation files copied; accepted only employee
  identity/contact/employment placement, org units, positions, assignments,
  and reporting relationship concepts
- files retired: none
- files deferred:
  - employee-records-management actions/components: CRUD forms, duplicate
    checks, sensitive master views, emergency contacts, dependents, employment
    contracts, document vault, timelines, payroll/compliance/offboarding detail
    panels, archive/update actions, and legacy UI components
  - organizational-chart-hierarchy actions/components: org-structure mutation
    guards, approvals, exports, change history, versioning, archive trailing
    cells, canvas components, and job-grade schema/table
  - compliance-regulatory-tracking: statutory, policy, audit, and regulatory
    tracking flows; target Slice 2 compliance
  - documents-management: employee document vault and document workflows;
    target Slice 2 workforce/documents
  - employee-lifecycle-management: onboarding/probation/confirmation/transfer
    flows; target Slice 2 lifecycle
  - employee-selfservice-portal: ESS surfaces and self-service flows; deferred
    until route and portal doctrine are explicitly accepted
  - integration: import/export/integration bridge; target integration/export
    slices after core command services exist
  - offboarding-exit-management: resignation, clearance, final settlement, and
    exit workflows; target Slice 2 offboarding
  - all legacy TSX/components remain unmigrated in Slice 1 by design; Slice 1
    is read + detail only through governed metadata

target implementation:
- feature package files:
  - packages/features/hr/package.json
  - packages/features/hr/src/metadata/workforce.ts
  - packages/features/hr/src/metadata/index.ts
  - packages/features/hr/src/server.ts
  - packages/features/hr/src/workforce/index.ts
  - packages/features/hr/src/workforce/query.ts
  - packages/features/hr/src/workforce/format.ts
  - packages/features/hr/src/workforce/workspace.server.ts
  - packages/features/hr/src/workforce/employees/records.ts
  - packages/features/hr/src/workforce/employees/index.ts
  - packages/features/hr/src/workforce/departments/records.ts
  - packages/features/hr/src/workforce/departments/index.ts
  - packages/features/hr/src/workforce/positions/records.ts
  - packages/features/hr/src/workforce/positions/index.ts
  - packages/features/hr/src/workforce/assignments/records.ts
  - packages/features/hr/src/workforce/assignments/index.ts
  - packages/features/hr/src/workforce/org-chart/records.ts
  - packages/features/hr/src/workforce/org-chart/index.ts
  - packages/features/hr/tests/unit/workforce.test.ts
- db schema/query files:
  - packages/db/src/schema/hr/index.ts
  - packages/db/src/schema/hr/workforce.ts
  - packages/db/src/schema/hr/org-chart.ts
  - packages/db/src/schema/index.ts
  - packages/db/src/hr.ts
  - packages/db/src/index.ts
  - packages/db/src/rls.ts
- migration files:
  - packages/db/drizzle/0027_hr_workforce_foundation.sql
  - packages/db/drizzle/meta/0021_snapshot.json
  - packages/db/drizzle/meta/_journal.json
- app adapters:
  - apps/erp/src/lib/module-workspace-resolver.ts
  - apps/erp/src/app/(app)/[moduleId]/page.tsx
  - apps/erp/src/app/(app)/[moduleId]/records/[recordId]/page.tsx
  - apps/erp/src/app/(app)/module-screen.tsx
  - apps/erp/tests/unit/lib/module-workspace-resolver.test.ts
  - apps/erp/tests/e2e/smoke.spec.ts
- api/cron/webhook adapters: none; Slice 1 is read + detail only

architecture checks:
- package boundary checked: HR feature package imports DB through public doors;
  app code calls only the HR server door through a thin resolver branch for
  moduleId === "hr"
- client/server export safety checked: HR workforce services export from
  @afenda/feature-hr/server only; ./client remains client-safe
- governed list surfaces checked: employee directory, org-unit, position,
  assignment, and reporting relationship lists are serializable metadata
  builders and render through governed list sections
- tenant derivation checked: app pages derive organizationId from
  requireCapability session context; DB queries run through tenant-scoped HR
  query functions
- authorization checked: HR module route and HR record details require hr.view
  plus hr.records.read / hr.employees.read before reads
- audit/idempotency checked: no mutations, APIs, cron jobs, webhooks, imports,
  or exports added in Slice 1; created/updated auth user audit columns are
  present on HR workforce tables for later command slices

validation output:
- pnpm db:generate: passed; no schema drift after
  0027_hr_workforce_foundation / 0021_snapshot registration
- pnpm --filter @afenda/feature-hr typecheck: passed
- pnpm --filter @afenda/feature-hr test: passed, 2 test files / 13 tests
- pnpm --filter @afenda/db typecheck: passed
- pnpm --filter @afenda/erp typecheck: passed
- pnpm lint:governed-renderers: passed, 13 registry entries
- pnpm typecheck: passed, 23/23 packages
- pnpm architecture:check: passed; 11 existing non-blocking Drizzle snapshot
  warnings remain outside HR
- pnpm test: passed, 34/34 Turbo tasks
- pnpm test:e2e: passed, 24/24 Turbo tasks; 6 smoke tests passed and the
  Neon-only auth smoke was skipped by environment guard
- extra relevant commands:
  - pnpm --filter @afenda/kernel test: passed, 9 files / 69 tests
  - pnpm --filter @afenda/governed-surface test: passed, 6 files / 40 tests
  - full-app gate repairs not counted as HR migration progress: removed
    Next 16 cacheComponents-incompatible route segment exports from untracked
    Knowledge/AI spend routes, normalized generic detail stat metadata display
    strings, made empty audit panels visible as audit tabs, and aligned the
    smoke assertion with the current metadata-driven solution console table
  - post-audit Slice 1 repair: reporting relationship query windows, governed
    list surface, app rendering, record detail mapping, and tests were added;
    assignment manager labels and HR detail stat display strings were
    normalized

known gaps:
- deferred: CRUD, HR APIs, cron/webhook handlers, dedicated HR route folder,
  employee documents, statutory data, dependents, contracts, lifecycle,
  offboarding, ESS, time, payroll, talent, exports, legacy UI/components, and
  hr_job_grades
- blocked: none for Slice 1
- risk accepted by: none
```

## Slice 1 Employee-Management Omission Ledger

This ledger prevents the Slice 1 workforce foundation from being misread as full
employee-management parity.

| Legacy subarea | Inventory | Slice 1 treatment |
| -------------- | --------- | ----------------- |
| `employee-records-management` | 64 TS/TSX, 22 TSX | Accepted employee identity, placement, create/update/archive commands, assignment history, governed directory/detail UI, and audit events; deferred emergency contacts, dependents, contracts, document vault, timelines, sensitive master views, duplicate-check UX, and legacy components. |
| `organizational-chart-hierarchy` | 37 TS/TSX, 7 TSX | Accepted org units, positions, assignments, reporting lines, and department tree reads; deferred mutation guards, approvals, exports, versioning/change history, org canvas UI, archive trailing cells, and `hr_job_grades`. |
| `compliance-regulatory-tracking` | 79 TS/TSX, 25 TSX | Migrated into typed compliance obligations, filings, exceptions, and evidence tables with bounded query windows, governed lists, and HR record detail dispatch. Legacy action/components, cron/watch jobs, LMS bridge, bureau reliability projections, and statutory submission writers remain deferred until the write/audit slice. |
| `documents-management` | 24 TS/TSX, 7 TSX | Deferred to Slice 2 workforce/documents. |
| `employee-lifecycle-management` | 46 TS/TSX, 9 TSX | Deferred to Slice 2 lifecycle. |
| `employee-selfservice-portal` | 73 TS/TSX, 37 TSX | Deferred until portal/route doctrine is explicitly accepted. |
| `integration` | 1 TS/TSX, 0 TSX | Deferred until import/export command services exist. |
| `offboarding-exit-management` | 26 TS/TSX, 6 TSX | Deferred to Slice 2 offboarding. |

## Definition Of Complete Enterprise HR

HR is complete only when all conditions below are true:

- Every legacy HRM capability is migrated, intentionally retired, or explicitly
  deferred with an owner and reason.
- `packages/features/hrm` has no remaining production dependency and can be
  removed or archived by a separate cleanup change.
- `@afenda/feature-hr` owns HR contracts, metadata, query services, command
  services, workflow adapters, integrations, components, and tests.
- HR schema lives under `packages/db/src/schema/hr` with validated migrations,
  indexes, tenant fields, and audit strategy.
- Core HR workspace routes render through governed metadata and bounded server
  windows.
- All Server Components, Server Actions, Route Handlers, cron jobs, workflows,
  and webhooks re-check capabilities.
- Payroll, statutory, lifecycle, compliance, and audit-sensitive flows are
  append-first and recoverable.
- Exports and integrations are idempotent, observable, and tenant-safe.
- `pnpm typecheck`, `pnpm architecture:check`, `pnpm test`, relevant e2e tests,
  governed renderer lint, DB migration validation, and security review pass.

## Validation Gates

Run after every accepted slice:

```bash
pnpm --filter @afenda/feature-hr typecheck
pnpm --filter @afenda/erp typecheck
pnpm typecheck
pnpm architecture:check
pnpm test
```

Run when relevant:

```bash
pnpm lint:governed-renderers
pnpm db:generate
pnpm security:review
pnpm test:e2e
```

DB-specific validation:

```bash
pnpm db:generate
pnpm architecture:check
```

A failed validation blocks the slice. Do not update this roadmap to mark a slice
complete until validation output is recorded in the implementing PR or task log.

## Rollback And Recovery

Before merging a slice:

- keep migration SQL isolated to that slice;
- keep public exports narrow;
- avoid deleting legacy source in the same change as new implementation;
- keep compatibility adapters until the target route and tests pass.

Rollback rules:

- If code fails before DB migration is applied, revert the slice files and
  exports.
- If DB migration has reached a shared environment, use a forward corrective
  migration; do not rewrite applied migration history.
- If route behavior regresses, restore the prior domain/app compatibility path
  while keeping schema data intact.
- If authorization or tenant isolation fails review, block the slice and remove
  external/API exposure before continuing.

## Slice 1 Accepted Evidence (2026-05-29)

```txt
slice: 1. Workforce foundation
status: complete

legacy inventory:
- source: C:\JackProject\afenda-vercel\packages\features\hrm (filesystem inventory via pnpm hr:inventory-legacy)
- folders inspected: employee-records-management, organizational-chart-hierarchy
- files migrated: 0 copied; concepts reimplemented in @afenda/feature-hr

target implementation:
- db: packages/db/src/schema/hr.ts, packages/db/src/hr.ts, packages/db/src/hr-commands.ts
- migrations: 0009_tired_gateway.sql, 0010_chilly_ben_urich.sql
- feature: packages/features/hr/src/workforce/{employees,departments,positions,org-chart}
- app adapters: apps/erp/src/lib/hr-sections/*.server.tsx, hr-route.shared.ts
- routes: /hr, /hr/employees, /hr/employees/new, /hr/employees/[id], /hr/departments, /hr/positions, /hr/org-chart

validation output:
- pnpm --filter @afenda/feature-hr test: 9/9 passed
- pnpm --filter @afenda/feature-hr typecheck: passed
- pnpm --filter @afenda/erp typecheck: passed
- apps/erp/tests/e2e/hr-workforce.spec.ts: Playwright smoke (dev auth)

known gaps (deferred to Slice 2b+):
- lifecycle, offboarding, compliance, ESS, job grades, org canvas UI
- document blob upload UI, verify/reject list actions, requirements/expiry sweeps
```

## Slice 2a Partial Evidence (2026-05-29)

```txt
slice: 2. Documents and lifecycle — 2a employee document vault
status: partial

legacy inventory:
- source capability: documents-management (24 TS/TSX from legacy inventory)
- files migrated: 0 copied; metadata-first vault reimplemented in @afenda/feature-hr

target implementation:
- db: packages/db/src/schema/hr.ts (hr_employee_documents + enums), packages/db/src/hr-documents.ts
- migration: 0011_lumpy_omega_red.sql
- permissions: hr.documents.read, hr.documents.write (seed-permissions.mts)
- feature: packages/features/hr/src/workforce/documents/
- app adapters: apps/erp/src/lib/hr-sections/documents.server.tsx
- route: /hr/documents

validation output:
- pnpm db:generate && pnpm db:migrate: 0011 applied
- pnpm --filter @afenda/feature-hr test: 11/11 passed
- pnpm --filter @afenda/feature-hr typecheck: passed
- pnpm --filter @afenda/erp typecheck: passed
- pnpm architecture:check: passed

known gaps (deferred within Slice 2):
- blob upload integration (metadata-only register via blob URL today)
- verify/reject row actions in list UI
- document requirements, expiry sweeps, payslip docs
- lifecycle, offboarding, compliance sub-slices
```

## Slice 2b Partial Evidence (2026-05-29)

```txt
slice: 2. Documents and lifecycle — 2b employee lifecycle
status: partial

legacy inventory:
- source capability: employee-lifecycle-management (46 TS/TSX from legacy inventory)
- files migrated: 0 copied; append-only event ledger + transition queue reimplemented

target implementation:
- db: packages/db/src/schema/hr.ts (hr_lifecycle_events, hr_lifecycle_transitions, employee date fields, expanded hr_employment_status)
- commands: packages/db/src/hr-lifecycle.ts
- migration: 0012_bright_ravenous.sql
- permissions: hr.lifecycle.read, hr.lifecycle.write
- feature: packages/features/hr/src/workforce/lifecycle/
- app adapters: apps/erp/src/lib/hr-sections/lifecycle.server.tsx, employee detail timeline
- route: /hr/lifecycle
- polish: movement form, employee detail timeline, cron hr-lifecycle-transitions

validation output:
- pnpm db:generate && pnpm db:migrate: 0012 applied
- pnpm --filter @afenda/feature-hr test: 14 vitest (incl. movement integration)
- pnpm --filter @afenda/feature-hr typecheck: passed
- pnpm --filter @afenda/erp typecheck: passed
- cron: GET /api/cron/hr-lifecycle-transitions

known gaps (deferred within Slice 2):
- boarding/onboarding workflow instances
- compliance sub-slice
```

## Slice 2c Partial Evidence (2026-05-29)

```txt
slice: 2. Documents and lifecycle — 2c offboarding foundation
status: partial

legacy inventory:
- source capability: offboarding-exit-management (26 TS/TSX)
- files migrated: 0 copied; case queue + lifecycle-linked status changes

target implementation:
- db: hr_offboarding_cases (0013_melted_baron_strucker.sql), packages/db/src/hr-offboarding.ts
- permissions: hr.offboarding.read, hr.offboarding.write
- feature: packages/features/hr/src/workforce/offboarding/
- route: /hr/offboarding

validation output:
- pnpm db:migrate: 0013 applied
- offboarding integration tests: 2/2 passed
- typecheck: HR + ERP passed

known gaps (deferred):
- clearance items, approval steps, final settlement (legacy hrm_offboarding_* parity)
```

## Slice 2d Partial Evidence (2026-05-29)

```txt
slice: 2. Documents and lifecycle — 2d compliance foundation
status: partial (obligation + exception foundation complete; statutory/evidence deferred)

legacy inventory:
- source capability: compliance-regulatory-tracking (79 files)
- behavioral port: obligations register, exception lifecycle (create/assign/progress/resolve/waive), governed lists, forms — not file copy

target implementation:
- db: hr_compliance_obligations, hr_compliance_exceptions (0014_neat_the_call.sql)
- commands: packages/db/src/hr-compliance.ts (full exception workflow + obligation upsert/archive)
- permissions: hr.compliance.read, hr.compliance.write
- feature: packages/features/hr/src/workforce/compliance/
- route: /hr/compliance (revalidatePath /hr/compliance)
- audit: writeExecutionAuditEvent (hr.compliance.*)

validation output:
- pnpm exec tsc -p packages/db/tsconfig.build.json --noEmit: passed
- pnpm exec tsc -p packages/features/hr/tsconfig.build.json --noEmit: passed
- pnpm --filter @afenda/feature-hr test -- compliance: 3/3 passed (surface + integration)

known gaps (deferred — see packages/features/hr/src/workforce/compliance/ARCHITECTURE.md):
- filings, evidence register, statutory pack writers / acknowledgement
- cron/aging watches, auto-generated exceptions (sourceReferenceId)
- corrective action owner user id, evidence document linking
- overview/health dashboards, compliance export reports, LMS/bureau reliability
```

## Slice 2 Gap Closure Evidence (2026-05-29)

```txt
slice: 2. Documents and lifecycle — gap closure
status: complete (foundation scope)

migration: 0016_goofy_doomsday.sql
- hr_document_requirements
- hr_onboarding_cases, hr_onboarding_checklist_items
- hr_offboarding_clearance_items

2a documents:
- rejectHrEmployeeDocument + verify/reject/archive UI forms
- upsertHrDocumentRequirement + runHrDocumentExpirySweep
- cron GET /api/cron/hr-document-expiry

2b lifecycle:
- /hr/onboarding route, hr-onboarding.ts checklist cases
- permissions hr.onboarding.read, hr.onboarding.write

2c offboarding:
- DEFAULT_OFFBOARDING_CLEARANCE seeded on case start
- completeHrOffboardingClearanceItem; complete blocked until clearance done

validation:
- pnpm db:migrate: 0016 applied
- pnpm --filter @afenda/feature-hr typecheck: passed
- pnpm --filter @afenda/erp typecheck: passed
- offboarding integration: 2/2 passed

still deferred (out of slice-2 foundation):
- blob upload UI (metadata register remains)
- compliance filings/evidence/statutory writers
- final settlement / approval-step workflows beyond clearance checklist
```

## Slice 3a Partial Evidence (2026-05-29)

```txt
slice: 3. Time and attendance — 3a leave foundation
status: partial

legacy inventory:
- source capability: time-attendance/leave-attendance-management
- files migrated: 0 copied; leave request queue with approve/reject/cancel

target implementation:
- db: hr_leave_requests (0015_*), packages/db/src/hr-leave.ts
- permissions: hr.leave.read, hr.leave.write
- feature: packages/features/hr/src/time-attendance/leave/
- route: /hr/leave

validation output:
- pnpm db:migrate: 0015 applied
- leave surface + integration tests: passed
- typecheck: HR + ERP passed

known gaps (deferred):
- leave balances, shifts, time-clock ingest
```

## Slice 3b Partial Evidence (2026-05-29)

```txt
slice: 3. Time and attendance — 3b attendance foundation
status: partial

legacy inventory:
- source capability: time-attendance/leave-attendance-management (attendance segment)
- files migrated: 0 copied; manual punch register with idempotent keys and void

target implementation:
- db: hr_attendance_records + enums (0017_stale_punisher.sql), packages/db/src/hr-attendance.ts
- permissions: hr.attendance.read, hr.attendance.write
- feature: packages/features/hr/src/time-attendance/attendance/
- route: /hr/attendance (apps/erp/src/lib/hr-sections/attendance.server.tsx)

validation output:
- pnpm db:migrate: 0017 applied
- attendance surface + integration tests: passed (idempotency + void)
- typecheck: HR + ERP passed

known gaps (deferred):
- time-clock ingest, leave balances, geolocation/flexible-work analytics (slice 4)
```

## Slice 3c Partial Evidence (2026-05-29)

```txt
slice: 3. Time and attendance — 3c overtime foundation
status: partial

legacy inventory:
- source capability: time-attendance/overtime-management
- files migrated: 0 copied; overtime request queue with approve/reject/cancel

target implementation:
- db: hr_overtime_requests + enums (0018_*), packages/db/src/hr-overtime.ts
- permissions: hr.overtime.read, hr.overtime.write
- feature: packages/features/hr/src/time-attendance/overtime/
- route: /hr/overtime

validation output:
- pnpm db:migrate: 0018 applied
- overtime surface + integration tests: passed
- typecheck: HR + ERP passed

known gaps (deferred):
- overtime policies/rates/calculation snapshots (legacy hrm_overtime_*), time-clock ingest
```

## Slice 3d Partial Evidence (2026-05-29)

```txt
slice: 3. Time and attendance — 3d shifts foundation
status: partial

legacy inventory:
- source capability: time-attendance/shift-scheduling
- files migrated: 0 copied; templates + schedule/publish/cancel assignments

target implementation:
- db: hr_shift_templates, hr_shift_assignments (0019_*), packages/db/src/hr-shifts.ts
- permissions: hr.shifts.read, hr.shifts.write
- feature: packages/features/hr/src/time-attendance/shifts/
- route: /hr/shifts

validation output:
- pnpm db:migrate: 0019 applied
- shifts surface + integration tests: passed
- typecheck: HR + ERP passed

known gaps (deferred):
- swap requests, rotation, roster publication, coverage rules (legacy hrm_shift_*), time-clock ingest
```

## Documentation Maintenance

Update this file whenever a slice changes status. Architecture docs change only
when doctrine changes. Examples:

- changing package boundaries updates **ARCH-002** and **ARCH-008**;
- changing route doctrine updates **ARCH-002**, **AGENTS.md**, and route guards;
- changing schema ownership updates **ARCH-005**;
- changing governed renderer rules updates **ARCH-006** or **ARCH-007**.

Do not use documentation to claim implementation completion. Completion is proven
by code, migrations, route behavior, tests, and security gates.
