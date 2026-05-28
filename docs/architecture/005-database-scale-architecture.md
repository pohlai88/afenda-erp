# ARCH-005 · Database Scale Architecture

**Doc ID:** `ARCH-005` · **File:** `005-database-scale-architecture.md`

| Field     | Value                                                                           |
| --------- | ------------------------------------------------------------------------------- |
| Status    | Active — scale plan with as-built schema inventory (May 2026)                   |
| Authority | Schema growth, ownership, promotion, performance on Neon + Vercel               |
| Related   | **ARCH-002** (packages) · **ARCH-006** (query windows) · **ARCH-001** (runtime) · **ARCH-008** (package discipline) |

Afenda ERP must be designed as a large transactional system before full module
coding begins. The current shared ERP record tables are a useful foundation for
early metadata-driven workspaces, but they are not the final data model for a
mature ERP.

Schema ownership and feature-package boundaries are defined in
[ERP Kernel Package Architecture](002-erp-kernel-package-architecture.md).
Product-wide runtime context is in [System Architecture](001-system-architecture.md).

## Expected Size

A mature SME ERP database should be expected to grow into dozens of schemas or
logical schema areas and hundreds of tables over time. The size is driven by
auditability, posting history, workflow state, attachments, reporting
snapshots, permissions, and module-specific operational records.

Planning estimate:

| Area                        | Expected table count |
| --------------------------- | -------------------- |
| Identity, tenancy, auth     | 10-20                |
| Permissions and audit       | 10-25                |
| Finance and accounting      | 30-70                |
| Sales and receivables       | 20-45                |
| Purchasing and payables     | 20-45                |
| Inventory and warehousing   | 30-70                |
| HR and workforce operations | 40-100               |
| CRM and activities          | 15-35                |
| Approvals and workflows     | 15-40                |
| Documents and uploads       | 10-25                |
| Reporting and snapshots     | 15-50                |
| AI operations and evals     | 15-40                |

The architecture should therefore assume a long-term database in the range of
230-565 tables as modules mature. v1 does not need all of these tables, but the
folder, package, migration, and ownership model must not block that growth.

## Current State

**On disk today** (`packages/db/src/schema/` — flat files, no module subdirs yet):

| File               | Primary tables / enums                                                     |
| ------------------ | -------------------------------------------------------------------------- |
| `common.ts`        | Shared enums (`erp_module_id`, record/work-item status, AI enums)          |
| `identity.ts`      | `user_profiles`                                                            |
| `organizations.ts` | `organizations`, `organization_memberships`                                |
| `permissions.ts`   | `permissions`, `role_permissions`                                          |
| `audit.ts`         | `audit_logs`                                                               |
| `erp.ts`           | `erp_module_records`, `erp_saved_views`, `erp_work_items`, `erp_documents` |
| `ai.ts`            | `ai_usage_events`, `ai_document_extractions`, `ai_approval_proposals`      |

Connection and tenancy (**as-built** in `packages/db/src/tenant-context.ts`):

- Neon serverless `Pool` + Drizzle (`drizzle-orm/neon-serverless`), lazy singleton via `getDb()`.
- Tenant scope uses Postgres GUCs (`afenda.current_organization_id`, `afenda.auth_user_id`) inside transactions — not ad-hoc `organizationId` from client input.
- Migrations use `DATABASE_MIGRATION_URL`; runtime queries use `DATABASE_URL` (listed in `turbo.json` `globalEnv`).

This is appropriate for early metadata-driven workspaces and seeded module
readiness. It is not sufficient for accounting ledgers, inventory movements,
payroll, AR/AP, bank reconciliation, procurement matching, or regulatory HR data.

## Vercel and Neon runtime (validated May 2026)

| Topic                | Guidance                                                                                                                                                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hosting              | Neon Postgres via Vercel Marketplace / env sync; single shared multi-tenant database per **ARCH-001**                                                                                                                                                                         |
| Serverless functions | Prefer short transactions; avoid module-scope pool creation in new route code — use `@afenda/db` helpers                                                                                                                                                                      |
| Fluid Compute        | When wiring pools directly in Functions, call `attachDatabasePool(pool)` from `@vercel/functions` after creating the pool so idle clients release before suspend ([Vercel Functions API](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package)) |
| Env vars             | `DATABASE_URL`, `DATABASE_MIGRATION_URL` must stay in Turborepo `globalEnv` so Remote Cache hashes stay correct after `vercel link`                                                                                                                                           |
| Blob / documents     | ERP document uploads use Vercel Blob patterns centralized in app/config — not inline schema growth                                                                                                                                                                            |
| Observability        | Log slow queries and posting paths via `@afenda/observability`; never log tenant field values                                                                                                                                                                                 |

**Target hardening (not blocking v1):** adopt `attachDatabasePool` on the shared Neon pool when the deploy runtime is confirmed on Fluid Compute; until then the lazy singleton + transaction-scoped GUCs match current serverless usage.

## Target Ownership

`packages/db` owns physical schema, migrations, connection helpers, tenancy
guards, and query primitives. Feature packages own module-specific query
services and command services that use the database package.

**Current:** schema files are flat under `packages/db/src/schema/` (`erp.ts`,
`identity.ts`, `organizations.ts`, `permissions.ts`, `audit.ts`, `ai.ts`).
Module subdirectories below are **target** layout.

Recommended mature shape:

```txt
packages/db/src/schema/
  common.ts
  identity.ts
  organizations.ts
  permissions.ts
  audit.ts
  documents.ts
  workflow.ts
  ai.ts
  finance/
    ledger.ts
    receivables.ts
    payables.ts
    tax.ts
    close.ts
  sales/
    customers.ts
    quotes.ts
    orders.ts
    invoices.ts
  purchasing/
    vendors.ts
    purchase-orders.ts
    receipts.ts
    matching.ts
  inventory/
    items.ts
    locations.ts
    stock-ledger.ts
    adjustments.ts
  hr/
    employees.ts
    employment.ts
    leave.ts
    time-attendance.ts
    payroll-inputs.ts
  crm/
    accounts.ts
    contacts.ts
    activities.ts
    opportunities.ts
```

Feature package services should import the relevant schema and query primitives
from `@afenda/db`. App routes should not assemble SQL or Drizzle queries
directly for module behavior.

## Growth Rules

- Keep every tenant-owned table scoped by `organizationId`.
- Use append-first tables for financial posting, stock movement, approval
  decisions, audit events, and AI-approved mutations.
- Promote JSONB metadata to typed columns or child tables when a field becomes
  searchable, reportable, permission-sensitive, audited, or part of workflow
  logic.
- Add indexes for every foreign key, tenant filter, status queue, due-date
  queue, posting lookup, and common list filter.
- Use transactions for posting flows that touch multiple module tables.
- Keep table names business-specific once a module is real; avoid extending
  generic record tables for ledger-grade or inventory-grade state.
- Use read models, snapshots, or materialized views for repeated reports rather
  than making dashboards scan transactional history.

## Migration Strategy

Start each mature module with explicit tables in
`packages/db/src/schema/<moduleId>` and module-owned services in
`packages/features/<moduleId>`. Feature packages are scaffolded on disk today;
shared ERP tables remain the compatibility layer until extraction per
[ERP Kernel Package Architecture](002-erp-kernel-package-architecture.md) and
[Workspace Package Discipline](008-workspace-package-discipline.md).

Use the current shared ERP tables for:

- module launch placeholders;
- cross-module workspaces;
- saved views and generic operational queues;
- compatibility while a feature package is being extracted.

Do not use the shared record table as the permanent source of truth for:

- general ledger entries;
- subledger documents;
- inventory balances and movement history;
- payroll-sensitive records;
- statutory tax or compliance records;
- approval decisions that require immutable audit history.

## Performance Baseline

Mature modules must be built around server-owned query windows:

- cursor or keyset pagination for high-volume lists;
- stable filters and sort keys;
- bounded dashboard queries;
- pre-aggregated reporting where needed;
- background jobs for exports and bulk changes;
- Vercel logs/traces around slow queries, postings, uploads, and AI actions.

The metadata-driven UI must never receive full large datasets. It receives the
current server window, renderer contract, pagination state, action descriptors,
and telemetry.

## Related Documents

- **ARCH-002** [ERP Kernel Package Architecture](002-erp-kernel-package-architecture.md)
- **ARCH-006** [Metadata-Driven UI Architecture](006-metadata-driven-ui-architecture.md)
- **ARCH-001** [System Architecture](001-system-architecture.md)
- **ARCH-003** [Directory Architecture Audit](003-directory-architecture-audit.md)
- **ARCH-008** [Workspace Package Discipline](008-workspace-package-discipline.md)
