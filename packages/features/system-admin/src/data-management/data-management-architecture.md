# Data Management

Parent doctrine:
[ARCH-011 Data Management](../../../../../docs/architecture/011-system-admin-data-management-architecture.md)
and [System Admin local architecture](../overview/architecture.md).

## Definition

**Data Management is the System Admin function that governs organization-scoped
data movement, including import/export templates, CSV and spreadsheet parsing,
adapter selection, staged row validation, import job execution, row-level
failure evidence, retry and cancellation controls, export evidence, and
operator-visible job history.**

Data Management is a first-class enterprise control domain. It is not a generic
utility folder, not a browser-only upload form, and not a shortcut around
feature-module business services.

---

# Data Management Includes

| Area | What It Covers |
| ---- | -------------- |
| **Import Template Catalog** | Approved templates, required headers, target domain, adapter id, version, and operator guidance |
| **Adapter Registry** | Import adapter contract, supported targets, retry safety, required capabilities, and domain command boundary |
| **CSV / Spreadsheet Intake** | Upload or paste intake, file metadata, source label, file size checks, input digest, and parser boundary |
| **Header Validation** | Required header checks, unknown column policy, duplicate header handling, and template compatibility |
| **Row Validation** | Per-row parsing, schema validation, redacted validation failures, and staged row outcomes |
| **Import Job Lifecycle** | Job creation, validation, ready state, run state, completion, failure, cancellation, and retry |
| **Row-Level Failure Evidence** | Failed row reference, failure code, redacted message, adapter id, and remediation status |
| **Execution Controls** | Permissioned run, retry, cancel, and export actions with server-side authorization checks |
| **Export Governance** | Export job request, validated export package metadata, permission checks, and audit-backed download evidence |
| **Job History** | Actor, organization, timestamps, state transitions, row counts, digest, and final outcome |
| **Audit Evidence** | Data-movement audit actions, target ids, row counts, redacted failure summaries, and export events |
| **Diagnostics Signals** | Failed imports, stuck jobs, adapter errors, missing templates, and exception-center inputs |
| **Reliability Signals** | Workflow failure, retry exhaustion, partial apply, cancellation, and bounded batch progress |
| **Retention and Redaction** | Raw-file retention policy, sensitive field redaction, digest storage, and audit metadata limits |

---

# Data Management Does Not Include

| Excluded Area | Owned By |
| ------------- | -------- |
| Physical schema ownership and migration execution | `@afenda/db` under ARCH-005 |
| Long-running workflow runtime implementation | `@afenda/workflows` or future workflow runtime |
| Runtime permission verdicts | Execution Kernel in `@afenda/kernel` |
| Feature-module business rules for imported records | Owning `@afenda/feature-*` package |
| Direct table writes that bypass domain services | Owning domain command/service layer |
| Browser-side parsing of full tenant datasets | Server-side Data Management parser/actions |
| Raw uploaded-file retention without explicit policy | Storage/retention architecture and security review |
| Payroll/statutory/PII value interpretation | Owning business module and compliance domain |
| Generic shared CSV utilities | A future shared parser package only after repeated cross-package need |

---

# Data Management Requirement Statement

| Requirement | Description |
| ----------- | ----------- |
| **Data Management** | Provides the governed System Admin workbench for importing and exporting tenant data through permissioned templates, server-side parsing, staged validation, adapter-backed domain commands, row-level failure evidence, job history, retry/cancel controls, diagnostics signals, and audit-backed export evidence. |

---

# Enterprise Functional Requirements

| Code | Requirement |
| ---- | ----------- |
| **SYS-DM-001** | System shall provide an import/export workbench under System Admin as a dedicated `data-management/` vertical. |
| **SYS-DM-002** | System shall maintain an import template catalog with adapter id, required headers, supported target, version, and operator copy. |
| **SYS-DM-003** | System shall validate import file size, source label, adapter id, template compatibility, and input digest before staging. |
| **SYS-DM-004** | System shall parse CSV and spreadsheet input on the server boundary, not in a shared root utility bucket. |
| **SYS-DM-005** | System shall reject imports with unknown adapters, missing required headers, or invalid template versions before row application. |
| **SYS-DM-006** | System shall stage rows under organization scope before applying them to domain services. |
| **SYS-DM-007** | System shall validate each staged row and record row-level validation status, failure code, and redacted failure message. |
| **SYS-DM-008** | System shall expose import job states for upload, validation, ready, run, completion, failure, and cancellation. |
| **SYS-DM-009** | System shall expose row states for pending, validated, applied, failed, and skipped rows. |
| **SYS-DM-010** | System shall require `system-admin.data-management.manage` for template selection, upload intake, validation, and job creation. |
| **SYS-DM-011** | System shall require `system-admin.data-management.run` before applying staged rows through adapters. |
| **SYS-DM-012** | System shall require `system-admin.data-management.cancel` before cancelling running or queued import jobs. |
| **SYS-DM-013** | System shall require `system-admin.data-management.export` before downloading job evidence or validated export packages. |
| **SYS-DM-014** | System shall call adapter/domain services for row application and shall not bypass owning feature-module commands. |
| **SYS-DM-015** | System shall record job evidence including actor, actor type, organization id, adapter id, source label, input digest, row counts, timestamps, and final state. |
| **SYS-DM-016** | System shall write audit actions for import creation, validation, run, cancellation, completion, failure, row rejection, and export. |
| **SYS-DM-017** | System shall redact raw CSV content, secrets, payroll values, statutory payloads, and full PII rows from audit metadata. |
| **SYS-DM-018** | System shall surface failed, stuck, cancelled, and partially applied jobs to Diagnostics and Reliability. |
| **SYS-DM-019** | System shall support retry only for rows or jobs whose adapter declares retry safety. |
| **SYS-DM-020** | System shall preserve already applied domain commands when cancellation or partial failure occurs unless the owning domain explicitly supports reversal. |
| **SYS-DM-021** | System shall render job lists, job detail, row failures, templates, and export history through governed server-window surfaces. |
| **SYS-DM-022** | System shall derive `organizationId`, `actorId`, `actorType`, and membership context from server-side execution context. |
| **SYS-DM-023** | System shall not trust organization, user, role, or membership identifiers from uploaded files. |
| **SYS-DM-024** | System shall require a retention policy and security review before storing raw uploaded files. |
| **SYS-DM-025** | System shall expose import/export development artifacts through existing System Admin package doors only. |

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria |
| --: | ------------------- |
| 1 | Administrators can select an approved import template and adapter before uploading or pasting source data. |
| 2 | Import creation fails before staging when the adapter is unknown, required headers are missing, or the template version is invalid. |
| 3 | CSV and spreadsheet parsing runs through server-side Data Management code under `data-management/`. |
| 4 | Staged rows show validated, failed, skipped, pending, and applied outcomes without exposing full sensitive row payloads. |
| 5 | Import job detail shows actor, organization, adapter, source label, input digest, state, timestamps, and row counts. |
| 6 | Import execution requires the run permission and applies rows through adapter/domain services. |
| 7 | Row failures preserve redacted code/message evidence that an operator can use for remediation. |
| 8 | Retry is available only for retry-safe adapters and only for eligible pending or failed rows. |
| 9 | Cancellation stops future batches and records cancellation evidence without silently undoing applied domain commands. |
| 10 | Export downloads require export permission and write audit-backed evidence. |
| 11 | Failed or stuck jobs appear in Diagnostics or Reliability attention surfaces. |
| 12 | Raw CSV bodies, secrets, full payroll values, statutory payloads, and full PII rows are not written to audit metadata. |
| 13 | Data Management surfaces use governed server-window pagination, filtering, sorting, and redaction. |
| 14 | Data Management does not introduce root `utils/`, `tools/`, `helpers/`, or shared parser buckets. |
| 15 | App routes remain thin adapters that call System Admin server/metadata export doors. |

---

## Target Folder Shape

```txt
data-management/
  actions/
  components/
  contracts/
  data/
  events/
  policies/
  schemas/
  surface/
  tests/
  data-management-architecture.md
```

## Package Doors

Data Management uses existing System Admin package doors:

| Door | Data Management exposure |
| ---- | ------------------------ |
| `@afenda/feature-system-admin/server` | Policies, actions, page models, server components, query/command services |
| `@afenda/feature-system-admin/client` | Client forms, trailing cells, browser-safe catalogs |
| `@afenda/feature-system-admin/metadata` | Surface keys, metadata-safe copy, governed list/stat builders |
| `@afenda/feature-system-admin` | Route paths and environment-neutral contracts only |

Do not add a public `./data-management` subpath without updating ARCH-008 and
the architecture guard.

## Internal Artifact Placement

| Concern | Path pattern |
| ------- | ------------ |
| CSV parser | `data/system-admin.data-management-csv.parse.shared.ts` |
| Import adapter contract | `contracts/system-admin.import-adapter.contract.ts` |
| Import job DTOs | `contracts/system-admin.import-job.contract.ts` |
| Job action schemas | `schemas/system-admin.import-job.schema.ts` |
| Import policies | `policies/system-admin.data-management.policy.server.ts` |
| Import job queries | `data/system-admin.import-jobs.query.server.ts` |
| Import job commands | `data/system-admin.import-jobs.command.server.ts` |
| Workflow adapter | `data/system-admin.import-jobs.workflow.server.ts` |
| Job list surface | `surface/system-admin.import-jobs-list.surface.ts` |
| Row failure surface | `surface/system-admin.import-job-failures.surface.ts` |
| Actions | `actions/system-admin.import-jobs.actions.server.ts` |
| Events | `events/system-admin.data-management.event.ts` |

## Job Model

Minimum import job states:

```txt
uploaded
validating
ready
running
completed
failed
cancelled
```

Minimum row states:

```txt
pending
validated
applied
failed
skipped
```

## Adapter Contract

Import adapters validate rows and call owning domain services. They do not
write feature tables directly unless the owning domain service exposes that
command.

Conceptual contract:

```ts
export type SystemAdminImportAdapter<TRow> = {
  readonly id: string;
  readonly label: string;
  readonly requiredHeaders: readonly string[];
  readonly retrySafe: boolean;
  parseRow(record: Record<string, string>): ImportRowParseResult<TRow>;
  applyRow(ctx: ImportApplyContext, row: TRow): Promise<ImportApplyResult>;
};
```

`ImportApplyContext` must come from server-side authority:

```txt
organizationId
actorId
actorType
membershipId
jobId
```

Uploaded files may contain domain identifiers, but they must not supply trusted
tenant, actor, role, or membership authority.

## Permission Model

Recommended permissions:

```txt
system-admin.data-management.read
system-admin.data-management.manage
system-admin.data-management.run
system-admin.data-management.cancel
system-admin.data-management.export
```

`manage` allows template selection, upload intake, validation, and job
creation. `run` allows applying staged rows. `cancel` allows stopping future
batches. `export` allows downloading job evidence and validated export
packages.

## Audit Actions

Recommended audit actions:

```txt
system-admin.data-management.import.create
system-admin.data-management.import.validate
system-admin.data-management.import.run
system-admin.data-management.import.cancel
system-admin.data-management.import.complete
system-admin.data-management.import.fail
system-admin.data-management.import.row.reject
system-admin.data-management.export
```

Audit metadata may include adapter id, row counts, digest, state transition,
and redacted failure codes. It must not include raw CSV content, secrets,
payroll values, statutory payloads, or full PII rows.

## Execution Flow

```txt
1. Admin uploads or pastes source data.
2. Server resolves execution context and checks data-management manage.
3. Server validates file size, adapter id, template version, headers, and row shape.
4. Server stages rows and redacted validation failures under organization scope.
5. Audit records import.create and import.validate.
6. Admin reviews the staged job.
7. Server checks data-management run.
8. Workflow applies rows in bounded batches through adapter/domain services.
9. Row outcomes and failures are recorded.
10. Audit records complete, fail, cancel, or export.
11. Diagnostics and Reliability receive exception signals for failed or stuck jobs.
```

## Governed UI

Data Management surfaces use governed server-window lists:

- import jobs list;
- import job detail;
- staged row validation summary;
- failure evidence list;
- templates/catalog list;
- export history list.

Clients receive bounded, redacted rows only. Full uploaded datasets never move
to client components for pagination, filtering, or sorting.

## Failure Modes

| Failure | Required behavior |
| ------- | ----------------- |
| Unknown adapter | Reject before staging and return validation error |
| Missing required header | Reject before staging |
| Row validation failure | Stage failure evidence; do not apply row |
| Permission denial | Reject before staging or execution |
| Workflow failure | Mark job failed, preserve row evidence, surface in Reliability/Diagnostics |
| Partial apply | Keep successful rows applied, mark failed rows, record final counts |
| Retry | Retry only pending/failed rows when adapter declares retry safety |
| Cancellation | Stop future batches; do not undo already applied domain commands |

## Development Order

1. Define permissions and audit actions.
2. Add contracts for import jobs, import rows, failures, templates, and adapter
   registry.
3. Add schemas for job creation, validation, run, cancel, retry, and export.
4. Add parser and adapter contracts under this vertical.
5. Add durable persistence in `@afenda/db` only when job history must survive
   requests.
6. Add server policies and page models.
7. Add actions and workflow adapter.
8. Add governed list/detail surfaces.
9. Add route adapter in `apps/erp/src/lib/system-admin-sections/`.
10. Add parser, adapter, state-machine, redaction, and surface tests.

## Naming

Use `system-admin.data-management-*` for files that describe the vertical. Use
`system-admin.import-*` only for import-job-specific contracts.

Examples:

```txt
contracts/system-admin.import-adapter.contract.ts
contracts/system-admin.import-job.contract.ts
data/system-admin.data-management-csv.parse.shared.ts
data/system-admin.import-jobs.query.server.ts
actions/system-admin.import-jobs.actions.server.ts
surface/system-admin.import-jobs-list.surface.ts
```

## Verification

Minimum gates when implemented:

```bash
pnpm --filter @afenda/feature-system-admin typecheck
pnpm --filter @afenda/feature-system-admin test
pnpm lint:governed-renderers
pnpm architecture:check
pnpm security:review
```

Run `pnpm test:e2e` when route flows, file upload/paste flows, export flows, or
cancellation behavior are wired into the app.

---

## Package Layout (as-built)

```txt
packages/features/system-admin/src/data-management/
  actions/          # Import job create/run/cancel/retry and CSV export
  components/       # Section, summary, create form, export button, trailing cells
  contracts/        # Job DTOs, adapter contract, limits constants
  data/             # Page model, CSV parser, export builder, form parser, audit helper
  events/           # Audit action key registry
  policies/         # requireSystemAdminDataManagementRead | Manage | Run | Cancel | Export
  schemas/          # Zod job creation, command, and export validation
  surface/          # Pattern C list metadata + UI copy
```

Shared helpers (DRY, testable without server context):

```txt
contracts/system-admin.data-management.limits.shared.ts   — query limit, field max sizes, audit target type
data/system-admin.import-job-form.shared.ts               — trimmed FormData + Zod safeParse
data/system-admin.data-management-headers.shared.ts       — required header diff
data/system-admin.data-management-export.build.server.ts  — CSV builder with truncated flag
data/system-admin.data-management-audit.shared.ts          — writeExecutionAuditEvent wrapper
```

Route adapter: `apps/erp/src/lib/system-admin-sections/data-management.server.tsx`

Test IDs:

```txt
system-admin-data-management-page
system-admin-data-management-access-denied
system-admin-data-management-summary
system-admin-data-management-templates
system-admin-data-management-import-jobs
system-admin-data-management-create-form
system-admin-data-management-create-submit
system-admin-data-management-export-button
governed:list-section:system-admin.data-management.templates.list
governed:list-section:system-admin.data-management.import-jobs.list
governed:list-section:system-admin.data-management.import-failures.list
governed:list-section:system-admin.data-management.exports.list
```

EUI: section titles use `headingLevel={2}` under the System Admin shell; list surfaces use governed Pattern C metadata.

Mutation correctness:

```txt
Import create — rejects unknown adapter, missing headers, and invalid CSV before staging
Import run    — no-op success when job is already completed (avoids duplicate audit noise)
Export        — records truncated in export job metadata and audit when query limit is reached
Audit         — targetType uses SYSTEM_ADMIN_DATA_MANAGEMENT_AUDIT_TARGET_TYPE constant
```

E2E: `apps/erp/tests/e2e/system-admin-data-management.spec.ts` (project `chromium-system-admin-data-management`).

Unit coverage:

```txt
tests/unit/system-admin.data-management.shared.test.ts — form parser, headers, export truncation, audit keys
tests/unit/system-admin.data-management.test.ts      — CSV parse, adapter redaction, governed surfaces
```
