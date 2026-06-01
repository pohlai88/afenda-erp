# ARCH-011 supplement - System Admin Data Management Architecture

**Doc ID:** `ARCH-011-DATA-MANAGEMENT`  
**File:** `011-system-admin-data-management-architecture.md`

| Field | Value |
| ----- | ----- |
| Status | Active - target enterprise data-management vertical |
| Authority | System Admin import/export workbench, CSV parsing placement, import-job contracts, evidence, and workflow boundaries |
| Defers to | **ARCH-011** control-plane doctrine, **ARCH-002** execution enforcement, **ARCH-005** schema ownership |
| Related | **ARCH-006**/**ARCH-007** governed UI, **ARCH-008** package discipline |

Data Management is the System Admin workbench for governed data movement. It is
where administrators stage, validate, run, review, retry, cancel, and evidence
organization-scoped import/export jobs.

Data Management is not a generic utility folder. CSV parsing, import adapters,
job contracts, job surfaces, and row validation evidence belong in this
vertical because they are authority-bearing administrative behavior.

## Enterprise Baseline

Enterprise ERP systems treat data movement as a governed admin workflow:

- Dynamics 365 exposes Data Management import/export through a framework.
- NetSuite exposes CSV import through an Import Assistant gated by permission.
- Oracle and SAP admin models pair role/data access control with audit evidence.

Afenda should follow the same pattern: import/export jobs are controlled,
scoped, validated, evidenced, and permissioned.

## Owns

Data Management owns:

- import/export job configuration and operator controls;
- import templates and accepted adapter catalogs;
- CSV/spreadsheet parse boundaries;
- staged row validation and row-level outcome evidence;
- job state transitions visible to administrators;
- job history and failure review;
- retry/cancel controls;
- import/export governed surfaces;
- audit actions for data movement;
- integration with diagnostics and reliability exception queues.

## Does Not Own

Data Management does not own:

- physical schema or migrations (`@afenda/db`);
- long-running workflow infrastructure (`@afenda/workflows`);
- runtime permission enforcement outside the execution contract
  (`@afenda/kernel`);
- feature-module business rules for imported domain records;
- direct table writes that bypass domain commands;
- unrestricted browser-side parsing of tenant datasets.

## Package Shape

Target local vertical:

```txt
packages/features/system-admin/src/data-management/
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

Required public exposure is through the existing package doors:

| Door | Exports |
| ---- | ------- |
| `@afenda/feature-system-admin/server` | Page models, policies, actions, server components, query services |
| `@afenda/feature-system-admin/client` | Client forms, trailing cells, browser-safe catalogs |
| `@afenda/feature-system-admin/metadata` | Surface keys, metadata-safe copy, list builders |
| `@afenda/feature-system-admin` | Route paths and environment-neutral contracts only |

No public `./data-management` package subpath should be added without updating
**ARCH-008** and the architecture guard.

## Internal Artifact Placement

| Concern | Path pattern |
| ------- | ------------ |
| CSV parser | `data/system-admin.data-management-csv.parse.shared.ts` |
| Import adapter contract | `contracts/system-admin.import-adapter.contract.ts` |
| Import job DTOs | `contracts/system-admin.import-job.contract.ts` |
| Job action schemas | `schemas/system-admin.import-job.schema.ts` |
| Import policies | `policies/system-admin.data-management.policy.server.ts` |
| Import job queries | `data/system-admin.import-jobs.query.server.ts` |
| Import job mutations | `data/system-admin.import-jobs.command.server.ts` |
| Workflow orchestration adapter | `data/system-admin.import-jobs.workflow.server.ts` |
| Job list surface | `surface/system-admin.import-jobs-list.surface.ts` |
| Row failure surface | `surface/system-admin.import-job-failures.surface.ts` |
| Actions | `actions/system-admin.import-jobs.actions.server.ts` |
| Events | `events/system-admin.data-management.event.ts` |

If a parser becomes useful outside System Admin, extract a stable parser package
only after at least two feature packages need it. Until then, keep it local.

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

Minimum job evidence:

- job id;
- organization id from server context;
- adapter id;
- filename or source label;
- input digest;
- total row count;
- success/failure/skipped counts;
- created by actor;
- timestamps for create/start/complete/cancel;
- redacted failure summaries;
- audit event ids when available.

Do not store raw uploaded files in System Admin tables unless a retention policy
and sensitive-data review are explicitly approved.

## Adapter Contract

Import adapters validate rows and call domain services. They do not write
feature tables directly unless the owning domain service exposes that command.

Conceptual contract:

```ts
export type SystemAdminImportAdapter<TRow> = {
  readonly id: string;
  readonly label: string;
  readonly requiredHeaders: readonly string[];
  parseRow(record: Record<string, string>): ImportRowParseResult<TRow>;
  applyRow(ctx: ImportApplyContext, row: TRow): Promise<ImportApplyResult>;
};
```

`ImportApplyContext` must be derived from server-side authority:

```txt
organizationId
actorId
actorType
membershipId
jobId
```

It must not trust organization, user, or role identifiers from the uploaded
file.

## Permission Model

Recommended permissions:

```txt
system-admin.data-management.read
system-admin.data-management.manage
system-admin.data-management.run
system-admin.data-management.cancel
system-admin.data-management.export
```

`manage` allows template/job creation. `run` allows applying staged rows.
`cancel` allows stopping jobs. `export` allows downloading job evidence and
validated export packages. These are intentionally separate because import
setup and import execution carry different risk.

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

Audit metadata may include adapter id, row counts, digest, and redacted failure
codes. It must not include raw CSV content, secrets, payroll values, statutory
payloads, or full PII rows.

## Execution Flow

```txt
1. Admin uploads or pastes source data.
2. Server resolves execution context and checks data-management manage.
3. Server validates file size, adapter id, headers, and row shape.
4. Server stages rows and validation failures under organization scope.
5. Audit records import.create and import.validate.
6. Admin reviews the staged job.
7. Server checks data-management run.
8. Workflow applies rows in bounded batches through adapter/domain services.
9. Row outcomes and failures are recorded.
10. Audit records complete/fail/cancel.
11. Diagnostics/reliability receive exception signals for failures.
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
to client components for pagination or filtering.

## Failure Modes

| Failure | Required behavior |
| ------- | ----------------- |
| Unknown adapter | Reject before staging and return validation error |
| Missing required header | Reject before staging |
| Row validation failure | Stage failure evidence; do not apply row |
| Permission denial | Reject before staging or execution; write denial evidence only through kernel policy where configured |
| Workflow failure | Mark job failed, preserve row evidence, surface in Reliability/Diagnostics |
| Partial apply | Keep successful rows applied, mark failed rows, record final counts |
| Retry | Retry only pending/failed rows when adapter declares retry safety |
| Cancellation | Stop future batches; do not undo already applied domain commands |

## Development Pipeline

1. Add this vertical and package-local architecture docs.
2. Define permissions and audit actions; seed permissions before exposing UI.
3. Add contracts and schemas.
4. Add `@afenda/db` schema only for durable job state; generate migrations per
   **ARCH-005**.
5. Add server policies and page models.
6. Add import job actions and workflow adapter.
7. Add governed surfaces and client forms.
8. Add route adapter under `apps/erp/src/lib/system-admin-sections/`.
9. Add unit tests for parser, adapter registry, permissions, job state
   transitions, and redaction.
10. Add governed-surface gallery tests for ready, empty, failed, and denied
    states.

## Verification

Minimum gates when implemented:

```bash
pnpm --filter @afenda/feature-system-admin typecheck
pnpm --filter @afenda/feature-system-admin test
pnpm lint:governed-renderers
pnpm architecture:check
pnpm security:review
```

Run `pnpm test:e2e` when route flows, file upload/paste flows, or cancellation
behavior are wired into the app.
