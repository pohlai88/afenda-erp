# ARCH-011 · System Admin Enterprise Architecture

**Doc ID:** `ARCH-011` · **File:** `011-system-admin-enterprise-architecture.md`

| Field     | Value                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| Status    | Active — enterprise target doctrine with as-built compatibility                                                   |
| Authority | System admin tenant control plane, enterprise admin domains, and development rules                                |
| Defers to | **ARCH-002** for package boundaries · **ARCH-001** for auth, runtime, and deployment · **ARCH-005** for schema ownership |
| Related   | **ARCH-006**/**ARCH-007** (governed UI) · **ARCH-008** (package discipline) · **ARCH-009** (Lynx governance)     |

System admin is Afenda's tenant control plane. It governs who can operate the
tenant, which capabilities are active, how tenant-wide settings shape runtime
behavior, how integrations enter or leave the system, how sensitive activity is
observed, and how Lynx-controlled machine actions remain accountable.

This document is doctrine for engineers building `/system-admin/*`,
`@afenda/feature-system-admin`, related auth and database services, background
workflows, and governed admin surfaces. It is not a product roadmap, competitor
comparison, or implementation checklist.

## Prime Directive

System admin is the tenant control plane, not a miscellaneous settings drawer.

Every system-admin capability must be:

- **Tenant-scoped**: `organizationId` comes from server session/context, never
  from client-supplied form fields, route params, headers, or query strings.
- **Capability-checked**: navigation protection is not enough; every Server
  Component read, Server Action, Route Handler, workflow entrypoint, and Lynx
  governance operation must re-check the relevant capability.
- **Observable**: sensitive reads and writes emit structured telemetry with
  operation, result, duration, request id, actor id, and organization id when
  available.
- **Auditable**: sensitive writes create tenant-visible audit records with
  stable action names and redacted metadata.

Admin UI must not imply runtime enforcement that does not exist. If a surface is
configuration-only, it must be presented as configuration-only until the
corresponding auth, workflow, webhook, billing, or enforcement path exists.

## Current As-Built Surface

The current application already exposes a system-admin route family under
`apps/erp/src/app/(app)/system-admin/*` and a feature package at
`packages/features/system-admin` with public root, `./client`, `./server`, and
`./metadata` export doors.

Current implemented surfaces:

| Surface       | Route                              | Current responsibility                                                             |
| ------------- | ---------------------------------- | ---------------------------------------------------------------------------------- |
| Hub           | `/system-admin`                    | Tenant admin summary and navigation                                                |
| Identity      | `/system-admin/identity`           | Members, invitations, role changes, tenant role overrides                          |
| Settings      | `/system-admin/settings`           | Locale, timezone, currency, fiscal-year, branding, data-region, ZDR settings       |
| Audit         | `/system-admin/audit`              | Audit logs, retention policy surfaces, export action boundary                      |
| Integrations  | `/system-admin/integrations`       | API credentials, webhook registration, delivery log viewing, SSO configuration     |
| Machine layer | `/system-admin/machine-layer`      | Usage ledger, approval sandboxes, monitor actions, gateway spend signals           |
| Reliability   | `/system-admin/reliability`        | Cron route visibility                                                              |
| Billing       | `/system-admin/billing`            | Tenant usage and marketplace billing posture                                       |

Current schema support lives in `packages/db/src/schema/system-admin.ts` for
tenant settings, role overrides, organization invitations, retention policies,
API credentials, webhooks, webhook deliveries, and SSO connections. Audit and
machine-layer ledgers are owned by their respective schema files and services.

The as-built implementation is sufficient as a control-plane foundation, but
these enterprise capabilities remain target doctrine until runtime paths land:
invitation acceptance and delivery, API key runtime authentication, webhook
dispatch and retry execution, SSO activation through the auth provider, audit
export enforcement, retention enforcement, cron run history, billing plan state,
seat enforcement, and overage handling.

## Ownership Boundaries

System admin follows **ARCH-002** package boundaries. The deployable app owns
routes and composition; packages own durable behavior.

| Layer | Owner | Rules |
| ----- | ----- | ----- |
| App routes | `apps/erp/src/app/(app)/system-admin/*` | Thin App Router adapters only: resolve session/org, check route capability, call package services, render package-owned surfaces. |
| Feature package | `@afenda/feature-system-admin` | Owns admin queries, command services, governed metadata builders, admin-specific Server Components or client islands, DTOs, schemas, and tests. |
| Authentication and authorization | `@afenda/auth` | Owns session loading, organization context, roles, capabilities, capability catalog, auth-provider integration, and permission predicates. |
| Database | `@afenda/db` | Owns physical schema, migrations, tenant context helpers, RLS support, transactions, and low-level persistence primitives. |
| Workflows | `@afenda/workflows` | Owns durable background sweeps, retries, delivery dispatch, retention enforcement, scheduled reconciliation, and long-running admin jobs. |
| Governed UI | `@afenda/governed-surface` and `@afenda/ui` | Governed renderer contracts, server-window list surfaces, and primitive UI. No tenant queries, auth decisions, or mutations. |
| Machine layer | `@afenda/ai`, `@afenda/feature-lynx`, `@afenda/feature-knowledge` | Own Lynx product behavior, governed tools, retrieval substrate, usage, approvals, and outcome monitoring per **ARCH-009**. |

`apps/erp` must not own admin business rules, raw tenant settings persistence,
role/capability decisions, integration credential hashing, webhook dispatch,
retention sweeps, billing enforcement, or Lynx approval execution.

## Enterprise Control Domains

System admin is organized by enterprise control domain. Each domain must have a
clear authority source, service boundary, audit behavior, and governed UI
surface before it is treated as complete.

| Domain | Target behavior | Development rules |
| ------ | --------------- | ----------------- |
| Identity lifecycle | Manage members, invitations, deactivation, role changes, owner/admin safety, and session refresh behavior. | Member mutations go through `@afenda/auth` or package command services. Protect the last owner/admin. Invitations store token hashes and expose raw tokens only through delivery or a one-time display path. |
| RBAC | Maintain a capability catalog, role mappings, tenant overrides, and permission simulation. | Do not accept raw free-form permission keys unless they validate against the catalog. Business logic checks capabilities, not role labels. Tenant overrides must be auditable and bounded by catalog metadata. |
| Tenant settings | Control locale, timezone, currency, fiscal year, branding, data region, ZDR, and future legal/entity profile. | Settings are tenant scoped and validated through package schemas. Runtime consumers must read normalized settings through package/query doors, not ad hoc database reads. |
| Audit and compliance | Provide append-first audit logs, filtering, exports, retention, legal hold, and tamper-evidence for sensitive trails. | Audit logs are tenant-visible evidence, distinct from application logs. Sensitive audit trails are append-first; correction is another event, not destructive rewrite. |
| Integrations | Manage API keys, scopes, one-time secret display, credential verification, webhooks, signing, retries, delivery logs, and SSO activation. | Store secret hashes, not raw secrets. Scopes and event filters come from catalogs. Webhook delivery and retry belong in workflows/services, not page code. SSO config does not imply provider enforcement until activation is wired through auth. |
| Reliability | Expose cron schedule source of truth, run history, failure state, drain health, and workflow sweep visibility. | Root `vercel.json` is the cron schedule authority. Persist or derive runtime state before showing health claims; static rows may show configuration only. Cron routes must validate `Authorization: Bearer ${CRON_SECRET}`. |
| Billing | Show tenant usage, seats, plan state, Lynx/gateway spend, marketplace linkage, limits, and overage posture. | Billing surfaces distinguish measured usage from enforceable plan state. Plan enforcement belongs in package/platform services and must fail closed for privileged limits. |
| Lynx governance | Govern usage ledgers, approval sandboxes, eval runs, outcome monitors, and human approval for mutating machine actions. | Follow **ARCH-009** vocabulary and tool envelope. Mutating machine actions require human approval, audit records, and domain command services; tools never write tables directly. |

## Non-Negotiable Development Rules

1. Derive `organizationId` from server session/context only. Never trust a
   client-supplied tenant id for admin reads or writes.
2. Re-check capabilities in every Server Component read, Server Action, Route
   Handler, workflow entrypoint, and Lynx governance operation.
3. Do not create admin mutations that bypass package command services. Route
   files may adapt forms and revalidate paths; they do not own durable behavior.
4. Every sensitive write emits an audit log and a structured observability event.
5. Do not expose generated secrets unless the UI can display them exactly once
   and the raw value is excluded from logs, audit metadata, telemetry, and
   persisted state.
6. Do not add static "health" rows when runtime state can be persisted or
   derived. Static reliability rows may only describe configured schedules.
7. Client exports must stay DTO/schema-only and must not import `server-only`,
   `next/headers`, `@afenda/db`, auth server modules, or Node-only SDKs.
8. Lists must use governed server-window surfaces for scalable datasets. Do not
   ship full admin datasets to the client for browser-side pagination.
9. Do not accept raw free-form permission keys, API scopes, webhook event types,
   or Lynx action ids without catalog validation.
10. Owner/admin safety is mandatory for identity changes. A tenant cannot be
    left without a recoverable administrator.
11. Human approval is mandatory before mutating machine-layer actions commit to
    ERP records or external systems.

## Data And Interface Rules

Admin schema follows **ARCH-005**. Physical tables and migrations live in
`@afenda/db`; feature packages consume them through typed query and command
services. `packages/db/src/schema/system-admin.ts` remains the current schema
home until scale or ownership pressure justifies deeper schema folders under
the database package.

Boundary rules:

- Use Zod or equivalent package schemas at form, Server Action, Route Handler,
  workflow, and integration boundaries.
- Feature package `./server` may import database, auth server, observability,
  and workflow services.
- Feature package `./client` exports serializable DTOs, client-safe constants,
  and schemas only.
- App routes import explicit feature-package subpaths instead of deep internal
  files.
- Generated API keys and webhook signing secrets are stored only as hashes.
  The raw value may be returned from the command service only for one-time
  display or secure delivery.
- API credential runtime authentication must verify hash, status, expiry,
  scope, tenant, and last-used telemetry before granting access.
- Webhook dispatch must sign payloads, persist delivery attempts, classify
  failures, and retry through workflow-owned execution.
- SSO activation must be owned by `@afenda/auth`; system admin may stage config
  but cannot become the auth provider authority.

## Governed UI Rules

System-admin lists use **ARCH-006** and **ARCH-007** governed server-window
patterns. Metadata declares intent; runtime services own data, authority, and
mutations.

Rules:

- Use `GovernedPatternCListSection` or equivalent governed list contracts for
  members, invitations, audit logs, credentials, webhooks, deliveries, usage,
  retention policies, billing signals, and runtime history.
- Toolbar search, filters, sort, saved views, export, and bulk actions are
  server-normalized. They do not interpret arbitrary client JSON.
- Row actions use typed action descriptors with confirmation and capability
  hints. Mature surfaces should avoid raw id-entry forms for destructive
  actions.
- Mutating UI requires disabled/loading states, clear confirmation for sensitive
  actions, server revalidation, and server-side capability re-check.
- Audit and reliability evidence panels are read models. They must not query raw
  tables from renderer components.

## Reliability And Operations

Reliability surfaces are operator-facing evidence. They should make it clear
whether a row is configured, currently healthy, degraded, failed, or unknown.

Rules:

- Root `vercel.json` is the source of truth for cron paths and schedules.
- `/api/cron/*` handlers must validate `Authorization: Bearer ${CRON_SECRET}`
  through `apps/erp/src/lib/cron.ts`.
- Run history must be persisted before the UI presents success/failure state.
- Log drain status must be derived from signed drain ingestion or platform
  telemetry, not from static copy.
- Background sweeps, webhook retries, retention enforcement, and reconciliation
  belong in `@afenda/workflows` or service packages.
- Structured logs should include `requestId`, `organizationId`, `userId`,
  `module`, `operation`, `result`, `durationMs`, and `errorCode` where
  available.

## Lynx Governance

System admin governs Lynx; it does not bypass Lynx product boundaries.

Rules:

- Use the Lynx vocabulary and banned-word policy from **ARCH-009** for
  user-facing system-admin machine-layer surfaces.
- `@afenda/ai` remains substrate-blind. Knowledge substrate behavior belongs to
  `@afenda/feature-knowledge`; Lynx product behavior belongs to
  `@afenda/feature-lynx`.
- Every operator tool declares `GovernedToolMeta` with risk, category, access,
  data sensitivity, and audit behavior.
- `access: "write"` tools route through sandbox and human approval. They do not
  perform direct table writes.
- Usage ledger, approval sandbox, eval run, and outcome monitor records are
  tenant scoped and audit ready.
- Admin approval actions must record actor, organization, capability, proposal
  id, decision, and resulting domain command.

## As-Built Vs Target

The table below defines the compatibility line between current implementation
and enterprise target doctrine. Target entries are architectural requirements
for future implementation, not a claim that the runtime path already exists.

| Area | As-built | Target doctrine |
| ---- | -------- | --------------- |
| Hub | `/system-admin` dashboard exists and reads tenant summary signals. | Hub becomes the tenant control-plane index with risk, drift, pending approval, reliability, and billing signals. |
| Identity | Members, invitations, role changes, and role override surfaces exist. Invitation records store token hashes. | Invitation delivery and acceptance are complete; deactivation is explicit; last owner/admin safety is enforced; session refresh behavior is visible. |
| RBAC | Capability catalog exists in `@afenda/auth`; tenant role overrides can be stored. | Permission simulation, catalog-validated overrides, and policy-drift evidence are first-class admin controls. |
| Settings | Tenant settings persist locale, timezone, currency, fiscal year, branding, data region, and ZDR. | Runtime consumers consistently use normalized settings; future legal/entity profile is governed by package services. |
| Audit | Audit logs and retention policy surfaces exist; export has a capability boundary. | Audit export, retention enforcement, legal hold, and tamper-evidence are implemented as enforceable services. |
| Integrations | API credentials, webhooks, delivery rows, and SSO config can be stored. | API key runtime auth, one-time secret display, webhook dispatcher/retries, credential verification, and SSO activation are complete. |
| Reliability | Cron routes are shown as configured rows. | Schedule state is derived from `vercel.json`; run history, failure state, drain health, and workflow sweeps are persisted or derived. |
| Billing | Tenant usage and marketplace posture are visible. | Plan state, seats, limits, Lynx/gateway spend policy, marketplace linkage, and overage handling are enforceable. |
| Lynx governance | Usage, approval sandboxes, spend signals, and monitor actions have admin surfaces. | Eval runs, outcome monitors, human approval controls, and mutating action governance are complete per **ARCH-009**. |

## Verification Gates

Run the narrowest gate that covers the change. Broaden only when code,
schemas, routes, governed metadata, or security-sensitive behavior changes.

| Change area | Required gate |
| ----------- | ------------- |
| Architecture docs only | `pnpm architecture:check` |
| Feature package types | `pnpm --filter @afenda/feature-system-admin typecheck` |
| App routes, exports, or shared type changes | `pnpm typecheck` |
| Governed metadata or renderer changes | `pnpm lint:governed-renderers` |
| Command/query changes | `pnpm test` with focused package tests where available |
| `/system-admin/*` route flows | Route tests or `pnpm test:e2e` when behavior changes |
| Auth, API credential, SSO, webhook, audit, billing enforcement, or machine-layer approval changes | `pnpm security:review` |
| Database schema changes | Edit schema in `@afenda/db`, run `pnpm db:generate`, review SQL, then run the appropriate migration gate |

## Related Documents

| Document | Use |
| -------- | --- |
| [ARCH-001 · System Architecture](001-system-architecture.md) | Auth, runtime, deployment, tenancy, caching, Vercel cron, observability |
| [ARCH-002 · ERP Domain Package Architecture](002-erp-domain-package-architecture.md) | Feature package boundaries, import rules, extraction, single-app deployment |
| [ARCH-005 · Database Scale Architecture](005-database-scale-architecture.md) | Schema ownership, table promotion, migrations, tenant isolation |
| [ARCH-006 · Metadata-Driven UI Architecture](006-metadata-driven-ui-architecture.md) | Metadata authority, server-window lists, runtime contracts |
| [ARCH-007 · Governed Metadata Architecture](007-governed-metadata-architecture.md) | Renderer kernel, profiles, builders, governed-surface parity |
| [ARCH-008 · Workspace Package Discipline](008-workspace-package-discipline.md) | Package classes, export doors, workspace split discipline |
| [ARCH-009 · Machine Layer Doctrine](009-machine-layer-doctrine.md) | Lynx vocabulary, machine-layer package split, governed tool envelope |
