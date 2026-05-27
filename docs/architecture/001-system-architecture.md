# ARCH-001 · Afenda ERP Architecture

**Doc ID:** `ARCH-001` · **File:** `001-system-architecture.md`

| Field      | Value                                                                          |
| ---------- | ------------------------------------------------------------------------------ |
| Status     | Active — aligned with `afenda-erp` repo as-built (May 2026)                    |
| Authority  | Product-wide runtime, deployment, data, auth, AI, observability                |
| Supersedes | Informal root architecture draft (removed; do not add new copies)              |
| Related    | **ARCH-002** (packages) · **ARCH-006** (metadata UI) · **ARCH-005** (database) |

## Executive Summary

Afenda ERP is a greenfield, Vercel-first SME ERP platform built as a modular
single application inside a TypeScript monorepo. The system uses one primary
Next.js App Router application for the ERP surface, shared internal packages for
domain logic and platform concerns, Neon Postgres as the operational database,
Neon Auth for identity, Drizzle ORM for schema-as-code, and Vercel AI SDK with
AI Gateway for assistant and automation workflows.

The default deployment topology is intentionally simple: one Vercel project for
`apps/erp`, one shared multi-tenant database, and one coherent route tree. The
architecture does not start with microfrontends or separate deployable feature
apps. ERP modules are isolated through package boundaries, route groups,
authorization checks, and domain services instead of separate frontend
applications.

## System Goals

- Deliver a full-stack SME ERP covering finance, sales, purchasing, inventory,
  HR, CRM, reporting, approvals, and administration.
- Keep the product deployable and operable by a small team using managed Vercel
  and Neon services.
- Make tenant isolation a first-class design rule across data access,
  authorization, audit logs, AI tools, and background jobs.
- Prefer server-rendered, low-JavaScript interfaces for data-heavy workflows,
  using Client Components only for interaction-heavy surfaces.
- Provide AI assistance for search, explanation, extraction, forecasting, and
  workflow automation while preserving human approval for sensitive operations.
- Measure performance and reliability continuously through Vercel Analytics,
  Speed Insights, logs, traces, and AI Gateway usage telemetry.

## Technology Baseline

Pinned workspace versions (see root `package.json`, `pnpm-workspace.yaml`
catalog). Upgrade only through intentional catalog bumps and CI verification.

| Layer           | Pinned default (repo)                                                 |
| --------------- | --------------------------------------------------------------------- |
| Runtime         | Node.js 22 for local, CI, and Vercel builds                           |
| Web framework   | Next.js **16.2.x** App Router (`catalog:next`)                        |
| React           | React **19.2.x** (`catalog:react`)                                    |
| Language        | TypeScript **5.9** strict mode                                        |
| Package manager | pnpm **10.33.x** workspaces                                           |
| Styling         | Tailwind CSS v4 with shadcn/ui                                        |
| Monorepo        | Turborepo v2 (`tasks` in root `turbo.json`)                           |
| Database        | Neon Postgres with Drizzle ORM                                        |
| Auth            | Neon Auth (`@neondatabase/auth`) with branchable state                |
| AI              | Vercel AI SDK v6 (`ai@^6`) through Vercel AI Gateway                  |
| Storage         | Vercel Blob for attachments and exports                               |
| Runtime config  | Vercel Edge Config (flags and non-secret runtime toggles)             |
| Observability   | Vercel Analytics, Speed Insights, OTEL, log drains                    |
| Next config     | `cacheComponents: true` via `@afenda/config` `createAfendaNextConfig` |

Framework upgrades are security work, not cosmetic churn. App Router and React
Server Component patches can affect every route.

## Monorepo Structure

**Current on disk:** one app (`apps/erp`) and platform packages under `packages/*`.
`packages/features/*` is workspace-ready but empty until the first module is
extracted. Feature-package authority:
[ERP Domain Package Architecture](002-erp-domain-package-architecture.md).

```txt
apps/
  erp/                  # Next.js App Router ERP application
packages/
  features/             # Target: ERP module packages when domains mature
    finance/
    sales/
    purchasing/
    inventory/
    hr/                   # moduleId: hr
    crm/
    approvals/
    reports/
    admin/
  ui/                   # Shared UI primitives and ERP layout components
  governed-surface/     # Metadata-driven ERP UI contracts and renderers
  db/                   # Drizzle schema, migrations, Neon connection helpers
  auth/                 # Neon Auth integration, roles, permission helpers
  domain/               # Cross-module ERP contracts and compatibility adapters
  ai/                   # Vercel AI SDK agents, tools, prompts, guardrails
  workflows/            # Approval flows, scheduled jobs, event handlers
  observability/        # Analytics, tracing, logging conventions
  config/               # Shared tsconfig, eslint, prettier, env schema
```

The package manager is `pnpm`. Turborepo owns task orchestration, dependency
ordering, local cache, remote cache, and affected-package CI. Root `turbo.json`
uses the Turborepo v2 **`tasks`** key (not legacy `pipeline`) and defines
`build`, `lint`, `typecheck`, `test`, `test:e2e`, `db:generate`, `db:migrate`,
and `dev`. The `@afenda/erp#build` task must cache `.next/**` and **exclude**
`.next/cache/**` so Vercel Remote Cache stays bounded (Vercel conformance:
`NEXTJS_NO_TURBO_CACHE`). Library packages emit `dist/**` via `dependsOn: ["^build"]`.

Package ownership rules:

- `apps/erp` owns routing, route handlers, page composition, layouts, and
  application shell behavior.
- `packages/features/*` owns mature ERP module implementation: module-specific
  metadata, business commands, query services, page sections, schemas,
  workflow adapters, and tests. Feature packages cannot import from `apps/erp`.
- `packages/domain` owns cross-module ERP contracts, module IDs, workspace
  contracts, permission contract types, and compatibility adapters. It is not
  the long-term home for module-specific finance, HR, sales, purchasing,
  inventory, CRM, approval, report, or admin implementation.
- `packages/governed-surface` owns metadata-driven ERP UI schemas, renderers,
  section shells, list-window contracts, presentation profiles, fixtures, and
  renderer parity automation. It cannot own ERP business rules, tenant queries,
  permission decisions, or mutations.
- `packages/db` owns table definitions, migrations, database connection helpers,
  query primitives, and transaction helpers.
- `packages/auth` owns Neon Auth integration, session loading, org context, role
  mapping, and permission checks.
- `packages/ai` owns model calls, AI tools, prompt contracts, structured output
  schemas, and approval-aware agent behavior.
- `packages/workflows` owns background and scheduled business processes.
- `packages/observability` owns tracking helpers, trace conventions, log
  fields, and metric naming.
- `packages/ui` must stay primitive-focused and cannot access metadata render
  registries, the database, auth session, or AI models directly.

## Application Architecture

`apps/erp` uses the Next.js App Router with Server Components as the default.
Client Components are pushed to the leaves of the tree for controls such as
data grids, command palettes, drawers, upload widgets, charts, and optimistic
forms.

Repeatable ERP surfaces use the metadata-driven UI architecture defined in
[Metadata-Driven UI Architecture](006-metadata-driven-ui-architecture.md).
The default pattern is server-first: routes resolve tenant/session/permission
authority, domain packages return bounded query windows, builders emit
Zod-validated metadata envelopes, and static renderers paint only the current
server window.

Recommended route shape:

```txt
apps/erp/src/app/
  (auth)/
    sign-in/
    sign-up/
    forgot-password/
  (app)/
    layout.tsx
    dashboard/
    solution-console/
    [moduleId]/
      page.tsx
      records/[recordId]/page.tsx
      work-items/[workItemId]/page.tsx
  onboarding/
  api/
    ai/chat/
    ai/extract/
    ai/solution-provider/
    auth/[...path]/
    uploads/
    cron/
    observability/drain/
```

Module workspace pages use one dynamic `[moduleId]` segment for all core ERP
modules (`finance`, `sales`, `hr`, …). Do not create per-module route folders
unless a module needs a genuinely different route tree.

Use Server Actions for internal form mutations and workflow commands. Use Route
Handlers for webhooks, file uploads, AI streaming responses, cron endpoints,
public APIs, and integrations consumed outside the React application.

The runtime default is Node.js on Vercel. Use Edge runtime only for narrow
latency-sensitive handlers that do not require Node-only dependencies,
database transactions, or large SDKs.

## ERP Module Map

Afenda ERP v1 targets SME core ERP modules:

| Module     | Primary capabilities                                  | Mature package ownership                    |
| ---------- | ----------------------------------------------------- | ------------------------------------------- |
| Dashboard  | KPIs, tasks, approvals, alerts                        | `apps/erp`, `features/reports`, `workflows` |
| Finance    | Chart of accounts, journal entries, AR/AP, tax, close | `features/finance`, `db`                    |
| Sales      | Quotes, orders, invoices, customer terms              | `features/sales`, `db`                      |
| Purchasing | Vendors, purchase orders, receipts, bills             | `features/purchasing`, `db`                 |
| Inventory  | Items, stock ledger, locations, adjustments           | `features/inventory`, `db`                  |
| HR         | Employees, leave, time, payroll inputs, workforce ops | `features/hr`, `db` (moduleId: `hr`)        |
| CRM        | Leads, accounts, contacts, activities                 | `features/crm`, `db`                        |
| Approvals  | Approval rules, tasks, escalations, comments          | `features/approvals`, `workflows`, `db`     |
| Reports    | Operational reports, exports, saved views             | `features/reports`, `observability`, `db`   |
| Admin      | Tenant settings, users, roles, audit log              | `features/admin`, `auth`, `db`              |

Business rules live in feature packages once a module becomes real; they do not
live in React route components. `packages/domain` remains the cross-module
contract layer. The current module workspace implementation uses shared
persisted ERP records, saved views, work items, documents, and domain metadata
as a compatibility foundation. Dedicated feature packages, subledger tables,
and module-specific command services such as journal posting, sales order
creation, or stock adjustment should be introduced before app routes depend on
those workflows.

The package threshold is defined in
[ERP Domain Package Architecture](002-erp-domain-package-architecture.md). The
database scale and promotion path from shared records to module-owned tables is
defined in [Database Scale Architecture](005-database-scale-architecture.md).

## Data Architecture

Neon Postgres is the system of record. Drizzle ORM defines the schema and
migrations in `packages/db`. SQL remains the conceptual model: tables,
relations, indexes, constraints, and transactions should be explicit.

Afenda should be planned as a large ERP database from the beginning. A mature
SME ERP can reasonably grow into hundreds of tables once finance, inventory,
HR, workflow, reporting, documents, AI usage, audit, and integrations are
fully modeled. The current shared ERP record tables are an early workspace and
metadata foundation, not the final source of truth for ledger-grade,
inventory-grade, payroll-sensitive, or statutory records. See
[Database Scale Architecture](005-database-scale-architecture.md) for table-count
planning, schema ownership, and promotion rules.

Core data rules:

- Every tenant-owned table includes `organizationId`.
- Every mutable business record includes `createdAt`, `updatedAt`, `createdBy`,
  and `updatedBy` where applicable.
- Financial and inventory posting tables are append-first. Corrections are
  reversal or adjustment records, not destructive rewrites.
- All cross-module writes that must commit together run inside a database
  transaction.
- All list views use indexed filters and stable pagination.
- Queries select only the columns required by the calling view or service.
- Large list surfaces use the governed server-window contract described in
  [Metadata-Driven UI Architecture](006-metadata-driven-ui-architecture.md).
  Metadata must not carry the complete dataset; it carries the current server
  window, column/action contract, pagination state, and telemetry only.

Recommended database package shape:

**Current:** flat schema files under `packages/db/src/schema/` (`erp.ts`,
`identity.ts`, `organizations.ts`, `permissions.ts`, `audit.ts`, `ai.ts`).
Module subdirectories below are the **target** layout as modules mature.

```txt
packages/db/
  drizzle/
  scripts/
    migrate.mts
    seed-permissions.mts
  src/
    client.ts           # Lazy Neon/Drizzle connection helpers
    ids.ts              # Entity identifier helpers
    onboarding.ts       # Initial tenant bootstrap helpers
    session.ts          # User profile and organization membership reads
    permissions.ts      # Permission catalog and role mapping reads/seeds
    tenancy.ts          # Tenant-scoped query helpers
    schema/
      common.ts
      identity.ts
      organizations.ts
      permissions.ts
      audit.ts
      documents.ts
      workflow.ts
      ai.ts
      erp.ts            # Current shared ERP record tables
      finance/          # Target module-owned tables
      sales/
      purchasing/
      inventory/
      hr/
      crm/
      approvals/
```

Database connections must be initialized lazily inside getter functions so
build-time evaluation does not require runtime environment variables. Serverless
and Vercel workloads should use Neon pooled connection strings for normal query
traffic. Long transactions and migration jobs should use the appropriate direct
connection mode.

Neon branching is the default preview strategy. Preview deployments should be
paired with isolated Neon branches where possible so schema and auth flows can
be tested safely before production migration.

## Tenancy Model

The default tenancy model is shared multi-tenant storage with organization
scoping. A user can belong to one or more organizations. Every request that
touches tenant data resolves:

1. Authenticated user.
2. Active organization.
3. Role and permissions within that organization.
4. Tenant-scoped database access.

Application code must never accept `organizationId` from untrusted form input as
the source of truth. It must derive the active organization from the authenticated
session and server-side organization context.

Postgres Row Level Security should be evaluated during implementation for
defense in depth. Even if RLS is enabled, application-level authorization checks
remain required at Server Action, Route Handler, workflow, and AI tool
boundaries.

Tenant-isolated databases are out of scope for v1. The architecture should not
create separate Vercel projects or Neon databases per customer unless a later
enterprise isolation requirement justifies the added operational complexity.

## Authentication and Authorization

Neon Auth is the default authentication system. It is treated as branchable
identity stored in the Neon-backed application environment, with users,
sessions, organizations, configuration, and auth metadata available through the
`neon_auth` schema and branch-specific auth endpoints. The architecture avoids
older external-auth-plus-sync-table patterns as the primary design.

`packages/auth` provides:

- Server session helpers.
- Active organization resolution.
- Neon Auth organization and team integration.
- Application capability definitions for ERP-specific permissions.
- Permission predicates for Server Components, Server Actions, Route Handlers,
  workflows, and AI tools.
- Utilities for audit attribution.

Neon Auth can provide organization membership and auth-side team concepts, but
ERP permissions remain application capabilities mapped in `packages/auth` and
enforced by domain services. This keeps financial, inventory, HR, and admin
authorization reviewable in source control instead of scattering business rules
inside route components.

Authorization must be enforced close to the operation being performed. Route
protection in `apps/erp/src/proxy.ts` (Next.js 16 traffic helper; not
`middleware.ts`) improves navigation and Neon Auth session refresh, but it is
not a sufficient security boundary. Server Components must check read access,
and mutations must check write permissions inside the Server Action or Route
Handler before calling domain services.

Baseline roles:

| Role               | Intent                                               |
| ------------------ | ---------------------------------------------------- |
| Owner              | Full organization administration and billing control |
| Admin              | User, settings, and module administration            |
| Finance Manager    | Finance records, close, reports, approvals           |
| Operations Manager | Sales, purchasing, inventory, approvals              |
| Staff              | Assigned operational workflows                       |
| Viewer             | Read-only access to permitted modules                |

Permissions should be capability-based rather than hard-coded to role names in
domain logic. Example capabilities: `invoice.create`, `invoice.post`,
`journal.approve`, `inventory.adjust`, `user.invite`, `report.export`.

## API and Workflow Patterns

Use Zod to validate data at every boundary: form submissions, query parameters,
webhook payloads, uploaded document metadata, AI structured outputs, and
integration responses.

Server Actions:

- Internal ERP mutations.
- Form submissions.
- Optimistic UI flows.
- Permission-checked business commands.
- `revalidatePath`, `revalidateTag(tag, "max")`, or `updateTag` after writes.

Route Handlers:

- AI chat and extraction streams.
- External webhooks.
- File upload token generation and upload completion callbacks.
- Cron endpoints.
- Public or partner APIs.
- Long-running export kickoff endpoints.

Workflows:

- Approval routing.
- Scheduled reminders and escalations.
- Period close checks.
- Inventory reorder alerts.
- Integration sync jobs.
- Document extraction post-processing.

Vercel Cron Jobs invoke Route Handlers under `app/api/cron/*` (declared in root
`vercel.json`). Each handler must reject requests unless
`Authorization: Bearer ${CRON_SECRET}` matches the environment variable (Vercel
cron contract). Shared helper: `apps/erp/src/lib/cron.ts` (`authorizeCronRequest`,
`runCronJob`).

## AI Architecture

AI features are built with Vercel AI SDK v6 and Vercel AI Gateway. The ERP app
already includes `ai@^6` and `@ai-sdk/react@^3`, and exposes active AI routes
for assistant chat, document extraction, and the Solution Provider Console. The
default model access pattern is through provider/model strings routed by AI
Gateway so usage, failover, and cost tracking are centralized.

**Gateway authentication (Vercel AI Gateway):**

| Environment       | Credential                                                            |
| ----------------- | --------------------------------------------------------------------- |
| Vercel deployment | `VERCEL_OIDC_TOKEN` (issued automatically when AI Gateway is enabled) |
| Local / CI        | `AI_GATEWAY_API_KEY` from the Vercel dashboard, or `vercel env pull`  |

Application code should resolve credentials in this order:
`process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_OIDC_TOKEN`.
Never commit either value.

Primary AI capabilities:

- ERP assistant for natural-language navigation, explanations, and summaries.
- Solution Provider Console for business-problem diagnosis, recovery playbooks,
  and human-approved remediation actions.
- Document extraction for invoices, purchase orders, receipts, and employee
  documents.
- Workflow assistance for drafting approvals, identifying missing information,
  and summarizing record history.
- Forecasting and anomaly explanation for sales, cash flow, and inventory.
- Admin assistance for permission explanations and audit summaries.

`packages/ai` provides:

```txt
packages/ai/src/
  gateway.ts            # Model policy, Gateway tags, user attribution, cache rules
  agents/
    erp-assistant.ts
    solution-provider-agent.ts
  tools/
    contracts.ts        # Zod input/output contracts for AI tools
    erp-tools.ts        # Tenant-scoped assistant tools with injected domain hooks
    solution-provider-tools.ts
  schemas/
    extraction.ts
    recommendations.ts
    solution-provider.ts
  guardrails.ts
  prompts.ts
```

AI tools must use the same authorization helpers as normal application code.
Tools that read tenant data derive `organizationId` from server context. Tools
that mutate data require explicit user approval through AI SDK approval flows
and must call domain services rather than writing directly to tables.

Browser AI responses must render with AI Elements message components such as
`<Message>` or `<MessageResponse>` rather than raw strings. Chat routes intended
for browser UIs should return UI message streams with
`toUIMessageStreamResponse()` or `createAgentUIStreamResponse()`; plain text
streams are reserved for CLI or server-to-server consumers. AI outputs intended
for structured writes must use Zod-backed structured output validation before
persistence.

Embeddings are not routed through AI Gateway. If semantic search or vector
features are added, use a direct provider package such as `@ai-sdk/openai` for
embedding calls and track that usage separately from Gateway chat/generation
usage.

AI logging must capture model, feature, tenant, user, token usage, latency,
tool calls, approval decisions, and error class. Logs must not store secrets,
raw credentials, or sensitive document content unless an explicit retention
policy allows it.

## Files and Documents

Vercel Blob stores attachments and generated exports:

- Supplier invoices.
- Customer purchase orders.
- Receipts and delivery orders.
- Employee documents.
- Report exports.
- AI extraction source files and derived artifacts where retention allows.

Blob metadata should include `organizationId`, owning entity type, owning entity
ID, upload user, content type, checksum where available, and retention class.
Database records remain the source of truth for ownership and permissions.

Uploads use Route Handlers for token generation, metadata validation, and
post-upload persistence. Large files should upload directly from the browser to
Blob when possible rather than proxying through the Next.js server.

## Caching and Performance

**Cache Components** are enabled in production config (`cacheComponents: true` in
`packages/config/src/next.ts`). Use them only for shared, non-tenant data.

| Pattern                                          | When to use                                                    |
| ------------------------------------------------ | -------------------------------------------------------------- |
| `"use cache"` + `cacheLife` / `cacheTag`         | Shared reference data inside Server Components                 |
| `"use cache: remote"` + `cacheLife`              | Route handlers or fetches that should use Vercel Runtime Cache |
| No cache / `cache: 'no-store'`                   | Tenant dashboards, org-scoped lists, auth/session-bound reads  |
| `revalidatePath` / `revalidateTag` / `updateTag` | After mutations — prefer narrow invalidation                   |

Performance defaults:

- Server Components fetch on the server; stream slow sections behind Suspense.
- Personalized and tenant-sensitive data must use tenant-aware cache keys or
  stay uncached — never cache another organization's rows.
- Static assets use the Vercel CDN; images use `next/image`; fonts use
  `next/font`.
- Client bundle size is tracked with `pnpm analyze:erp` and
  `pnpm performance:budget`.

Core Web Vitals targets:

| Metric | Target                                     |
| ------ | ------------------------------------------ |
| LCP    | <= 2.5s on key dashboards and list pages   |
| CLS    | <= 0.1                                     |
| INP    | <= 200ms for common interactions           |
| TTFB   | Track by route and investigate regressions |

Database performance rules:

- Index every foreign key and common list filter.
- Avoid N+1 query patterns by using joins, relational queries, or batched
  domain reads.
- Keep dashboard queries bounded and pre-aggregated where needed.
- Use read replicas later for reporting workloads if production reads begin to
  compete with transactional traffic.
- Governed list renderers may use TanStack Table and virtualization for the
  current server window, but virtualization is not a substitute for indexed
  server-side pagination. Exports, aggregate counts, and bulk "all matching
  filter" actions run through server-owned query tokens or background work, not
  browser-side full-dataset arrays.

## Vercel Deployment Model

Afenda deploys as **one Vercel project linked to this repository root** (not
one project per package). Root `vercel.json` is the source of truth:

```json
{
  "installCommand": "pnpm install",
  "buildCommand": "pnpm turbo build --filter=@afenda/erp",
  "crons": [
    { "path": "/api/cron/reminders", "schedule": "0 0 * * *" },
    { "path": "/api/cron/syncs", "schedule": "0 1 * * *" },
    { "path": "/api/cron/housekeeping", "schedule": "0 2 * * *" }
  ]
}
```

Turborepo builds workspace libraries (`dist/**` via `dependsOn: ["^build"]`), then
`@afenda/erp` (`.next/**`, excluding `.next/cache/**`). Feature packages are
compile-time dependencies, not separate Vercel projects. See
[ERP Domain Package Architecture](002-erp-domain-package-architecture.md).

### Platform linkage (verified via Vercel MCP, May 2026)

| Item                                      | As-built                                                                                      |
| ----------------------------------------- | --------------------------------------------------------------------------------------------- |
| Vercel team                               | `Jack's projects` (`team_Ymg16AtjGxrKyjaZk5Z52IYc`)                                           |
| Linked project in team                    | `afenda-vercel` (`prj_f4xLKgSiQsOEXnk24ZKlwlKrwqui`) — **legacy GitHub repo `afenda-vercel`** |
| This repo (`afenda-erp`)                  | **Not linked** — no `.vercel/project.json`; **deferred until stabilization gate passes**      |
| Latest `afenda-vercel` production deploys | **ERROR** (`readyState: ERROR`; repo `pohlai88/afenda-vercel`, not this monorepo)            |
| Intended build when linked                | Root `vercel.json`: `pnpm install` + `pnpm turbo build --filter=@afenda/erp`                  |

**Vercel link is deferred.** Do not run `vercel link` or wire preview/production deploys until the
local stabilization gate passes. The linked `afenda-vercel` project still uses Vercel default Next.js
settings until retargeted to this repository. Operator guide: [`docs/development/vercel-link.md`](../development/vercel-link.md).

**Local stabilization gate (before `vercel link`):**

| Gate | Command / check | Status (May 2026) |
| ---- | --------------- | ----------------- |
| Build | `pnpm turbo build --filter=@afenda/erp` | Passed locally (May 2026) |
| Types | `pnpm typecheck` | Passed; `strict`, `noUncheckedIndexedAccess`, unused checks |
| Architecture | `pnpm architecture:check` | Pass after `.cursor/` excluded and `components.json` UI paths aligned |
| Tests | `pnpm test` | Passed locally (May 2026) |
| Env | `pnpm env:sync` (+ `env:sync:cursor` on Windows) | See `docs/development/env.md` |
| E2E / governed UI | Manual or `pnpm test:e2e` | Required before production link |

**Platform milestone (after stabilization):**

1. `vercel link` at repo root → create `afenda-erp` or retarget `afenda-vercel` to this repository.
2. Enable Vercel Remote Cache; confirm `installCommand` / `buildCommand` match `vercel.json`.
3. `vercel env pull`; provision Neon, Neon Auth, Blob, Edge Config, AI Gateway, Analytics, Speed Insights.
4. Set `CRON_SECRET`, `VERCEL_DRAIN_SECRET`, database URLs, and gateway credentials.
5. First preview deployment; fix builder-only issues before production promotion.

### Compute and database on Vercel

- Default route handlers and Server Actions run on the **Node.js** runtime
  (Fluid Compute enabled at the project level on modern Vercel accounts).
- Use **Neon pooled** `DATABASE_URL` for serverless query traffic; reserve direct
  URLs for migrations (`DATABASE_MIGRATION_URL`).
- When using a server-side `pg` pool, call `attachDatabasePool` from
  `@vercel/functions` after pool creation so idle clients release before function
  suspension (Fluid Compute guidance).
- Reserve **Edge** runtime only for handlers that do not need Drizzle
  transactions or Node-only SDKs.
- Configure `maxDuration` in `vercel.json` `functions` globs for long-running AI
  streams or export kickoffs when defaults are insufficient.

### Deployment environments

| Environment | Purpose                 | Data                                |
| ----------- | ----------------------- | ----------------------------------- |
| Local       | Developer iteration     | `.env.local` + Neon dev branch      |
| Preview     | Pull request validation | Neon preview branch where available |
| Production  | Customer traffic        | Production Neon branch/database     |

### Required platform services (per environment)

- One Vercel project (root-linked monorepo).
- Vercel Remote Cache for Turborepo.
- Neon Postgres (+ branch per preview where possible).
- Neon Auth (Preview/Production URLs and cookie secret).
- Vercel Blob store (upload tokens for `/api/uploads`).
- Vercel Edge Config (feature flags).
- Vercel Analytics and Speed Insights (wired in `apps/erp` layout).
- Log drain to `/api/observability/drain` when centralized logging is required.
- Vercel AI Gateway enabled on the project.

Environment variables are managed in Vercel and synced locally via
`pnpm env:sync` / `vercel env pull`. Secrets never commit. Shared schemas live in
`packages/config` (see `.env.example` for required keys).

## Developer Tooling and MCP

MCP is part of the engineering workflow, not the production ERP runtime by
default. The implementation team should use:

- Vercel MCP for Vercel documentation lookup, project/deployment inspection,
  protected deployment fetches, and deployment diagnostics.
- Next.js DevTools MCP for App Router debugging, framework behavior inspection,
  and upgrade or migration assistance.
- Neon MCP for database project, branch, and connection discovery during
  environment setup.

Production AI tools may connect to explicitly approved internal MCP servers
later, but v1 ERP automations should start with statically defined AI SDK tools
in `packages/ai/tools`. This keeps tool permissions, schemas, tests, and audit
behavior reviewable in source control.

## Observability

`packages/observability` standardizes logs, traces, metrics, analytics events,
and AI usage events.

Baseline telemetry:

- Vercel Analytics for product usage and route-level behavior.
- Speed Insights for Core Web Vitals.
- Function logs for Route Handlers, Server Actions, cron jobs, and webhooks.
- OpenTelemetry-compatible traces for critical workflows.
- AI Gateway usage and latency for model calls.
- Custom audit events for business-sensitive actions.

Every server-side log should include:

- `requestId`
- `organizationId` when available
- `userId` when available
- `module`
- `operation`
- `result`
- `durationMs`
- `errorCode` when applicable

Business audit logs are distinct from application logs. Audit logs are
tenant-visible records for actions such as posting invoices, changing roles,
approving documents, exporting reports, and running AI-assisted mutations.

## Security and Compliance Baseline

Security requirements:

- Derive tenant context on the server.
- Validate all boundary inputs with Zod.
- Check permissions inside every data operation, not only at navigation time.
- Require human approval for AI tools that mutate ERP records.
- Store secrets only in Vercel/Neon managed environment configuration.
- Protect cron endpoints with a shared secret.
- Use rate limits and bot protection for public auth, upload, and contact
  surfaces.
- Record audit events for financial, inventory, permission, export, and AI
  mutation workflows.
- Keep uploaded documents private unless explicitly published.
- Avoid logging sensitive document content, access tokens, passwords, or
  personally sensitive HR fields.

Compliance posture for v1 is a strong baseline rather than a certified control
framework. SOC 2, ISO 27001, HIPAA, or country-specific payroll compliance
requirements should be handled as later work with explicit control mapping.

## Testing Strategy

Testing layers:

- Unit tests for domain rules, permission helpers, validation schemas, and AI
  tool adapters.
- Integration tests for Drizzle queries, transactions, migrations, Server
  Actions, Route Handlers, and workflow jobs.
- End-to-end tests for critical user journeys: sign in, invite user, create
  sales order, approve purchase order, post invoice, adjust stock, upload
  document, run report, and use AI assistant.
- Accessibility checks for core layouts, forms, modals, tables, and navigation.
- Performance checks for dashboard, list, detail, report, and AI chat routes.
- AI evaluations for extraction accuracy, tool permission enforcement, refusal
  behavior, and approval flows.
- Metadata-driven UI contract tests for schema strictness, renderer registry
  parity, data-nature compatibility, invalid metadata fallback, feature import
  boundaries, and large-list server-window enforcement.

CI should run affected-package lint, typecheck, tests, and builds through
Turborepo. Pull requests that change `packages/db` must run migration validation.
Pull requests that change `packages/ai` must run AI schema and tool-contract
tests with mocked model responses.

## Implementation Roadmap

### Phase 1: Foundation

- Scaffold pnpm workspace, Turborepo, and `apps/erp`.
- Add shared TypeScript, ESLint, formatting, and environment schema packages.
- Configure Vercel project, remote cache, Neon project, and environment pull.
- Add base app shell, auth routes, organization context, and protected layout.

Current status: the workspace, Turborepo tasks, modular Next.js app shell,
shared configuration, environment schema, protected application layout, and auth
routes are implemented locally. **Vercel project linking is deferred** until the
stabilization gate passes (see
[Platform linkage](#platform-linkage-verified-via-vercel-mcp-may-2026)).

### Phase 2: Data and Auth

- Define Drizzle schema for organizations, users, roles, permissions, audit log,
  and common entity metadata.
- Configure Neon Auth and server-side session helpers.
- Implement tenant-scoped database helpers and authorization primitives.
- Add migration generation and migration validation workflow.

Current status: the Drizzle schema includes organizations, memberships, user
profiles, audit logs, role definitions, application permissions, and
role-permission mappings. Neon Auth session helpers resolve users,
organizations, and DB-backed capabilities at the server boundary with normalized
fallbacks. Migration generation, migration application, and permission catalog
seeding are exposed through `pnpm db:generate`, `pnpm db:migrate`, and
`pnpm db:seed`; `pnpm db:setup` applies migrations and seeds the permission
catalog.

### Phase 3: Core ERP Modules

- Implement dashboard, CRM, sales, purchasing, inventory, finance, HR, approvals,
  reports, and admin module workspaces.
- Build feature-package services for each module before adding advanced UI.
- Add audit logging for all critical mutations.
- Add Blob-backed attachment flows for business documents.

Current status: module workspaces use dynamic `(app)/[moduleId]/` routes and
metadata-driven list surfaces via `GovernedPatternCListSection` in
`module-screen.tsx`, `dashboard-route.tsx`, and `solution-console-route.tsx`
(domain builders in `packages/domain/src/modules/list-surfaces.ts`).
`packages/domain` resolves serialized module workspaces from tenant-scoped
database records, saved views, workflow items, and document registry rows, with
metadata fallback for local dev mode. That is a compatibility foundation; the
nine `@afenda/feature-*` packages under `packages/features/` now exist and own
the module-bound builder wrappers. Future finance, sales, purchasing,
inventory, HR, CRM, approvals, reports, and admin implementation should move
into `@afenda/feature-*` packages with module-owned services, components,
schemas, and tests. `packages/db` includes Phase 3 persistence for `erp_module_records`,
`erp_saved_views`, `erp_work_items`, and `erp_documents`; onboarding and
`pnpm db:seed` seed initial core ERP records for existing organizations. The
ERP app also exposes a secured Vercel Blob client-upload Route Handler at
`/api/uploads`; it validates upload metadata, checks module capability before
issuing upload tokens, and registers completed uploads in the tenant document
registry. Module routes include the client upload surface that posts to this
handler, and route handlers emit structured runtime logs with Vercel request IDs
for upload and Neon Auth diagnostics. The app layout includes Vercel Analytics
and Speed Insights for route-level usage and Core Web Vitals measurement.

### Phase 4: AI and Automations

- Enable Vercel AI Gateway and AI SDK package.
- Add ERP assistant chat route and UI.
- Add document extraction pipeline with schema validation.
- Add approval assistant tools with human-in-the-loop mutation approval.
- Add AI usage logging and evaluation tests.

Current status: `packages/ai` defines the AI Gateway model policy, assistant
agent, reusable tenant-scoped tool contracts, document extraction schema,
recommendation schemas, guardrails, and deterministic guardrail evals. The ERP
app exposes `/api/ai/chat` using AI SDK agent UI streaming through AI Gateway
with tenant/user tags, module workspace tools, and an approval proposal tool
that requires explicit human approval before recording a proposal.
`/api/ai/extract` runs schema-constrained document extraction and stores
reviewable extraction output. `packages/db` persists AI usage events, document
extractions, and approval proposals so the dashboard can show an AI usage ledger
by tenant. Local development requires `AI_GATEWAY_API_KEY` (or
`VERCEL_OIDC_TOKEN` from `vercel env pull` when testing OIDC flows) before model
calls execute; Vercel deployments use OIDC automatically when AI Gateway is
enabled.
The `/solution-console` route and `/api/ai/solution-provider` handler extend the
AI layer into a problem-first Solution Provider Console. The first flagship
workflow is negative P&L recovery: the agent gathers module evidence, diagnoses
likely root causes, drafts recovery playbooks, and requires human approval
before recording audit-sensitive action proposals. Solution Provider usage is
tagged separately in AI Gateway and persisted as a tenant AI usage feature.
The AI layer also exposes a reusable operation skill foundation: context
assembly, source grounding, confidence scoring, action sandboxes, and an
operational skill catalog. This moves Afenda AI toward operation design, where a
module skill can gather evidence, produce confidence-scored cards, preview
before/after action diffs, and require human approval before execution. The
catalog includes current recovery skills and an LMS training-designer blueprint.
LMS is staged only: `packages/ai` contains the blueprint skill, but
`@afenda/config`, `@afenda/domain`, and `@afenda/db` do not yet register `lms`
as a first-class ERP module or database enum. The Solution Console renders the
active operational skill layer as metadata-driven cards and structured AI tool
output cards for diagnosis, evidence, confidence, sandbox diffs, recovery
actions, and approval state, with raw payloads available only as an expandable
audit detail.

### Phase 5: Production Hardening

- Add Speed Insights, Analytics, trace conventions, and log drains.
- Add performance budgets and bundle analysis.
- Add cron jobs for reminders, syncs, and housekeeping.
- Evaluate Postgres RLS for tenant defense in depth.
- Run security review of auth, tenant scoping, uploads, AI tools, and audit
  coverage.

Current status: Vercel Analytics, Speed Insights, OpenTelemetry registration,
and structured JSON route logs are wired into the app. `vercel.json` schedules
daily reminder, sync, and housekeeping cron routes; each route requires
`CRON_SECRET` and emits structured execution telemetry. `/api/observability/drain`
accepts signed Vercel Drain payloads with raw-body HMAC-SHA1 verification through
`VERCEL_DRAIN_SECRET`. Root scripts include `pnpm performance:budget` for
post-build static asset budgets, `pnpm analyze:erp` for Next.js bundle analysis,
and `pnpm security:review` for automated guard checks across auth, tenant
scoping, uploads, AI tools, cron, drains, and persistence. Postgres RLS remains
in evaluation mode: tenant-scoped tables are identified as candidates, but
enforcement should wait until every request sets a database-local organization
context for policy evaluation.

## Acceptance Criteria

- The default architecture is one modular Next.js ERP app, not microfrontends.
- Every major subsystem has an owning app route or package.
- Mature ERP modules have feature-package ownership under `packages/features/*`;
  `packages/domain` remains the shared contract layer.
- Database growth assumes ERP-scale schema expansion and promotes generic
  records to typed module tables before ledger, inventory, payroll, or
  compliance workflows depend on them.
- Tenant context, authorization, audit logging, and validation are mandatory
  patterns, not optional conventions.
- The data and auth design uses Neon Postgres and Neon Auth as first-class
  platform choices.
- AI capabilities use Vercel AI SDK and AI Gateway with authorization,
  validation, cost tracking, and approval boundaries.
- Vercel deployment, performance measurement, observability, and remote caching
  are included in the baseline platform design.
- Metadata-driven ERP surfaces follow
  [Metadata-Driven UI Architecture](006-metadata-driven-ui-architecture.md):
  server-window-first lists, static renderer dispatch, Zod contracts, public
  package doors, and automation gates for renderer/schema/fixture parity.

## References

### Architecture documents

- [ERP Domain Package Architecture](002-erp-domain-package-architecture.md)
- [Metadata-Driven UI Architecture](006-metadata-driven-ui-architecture.md)
- [Governed Metadata Architecture](007-governed-metadata-architecture.md)
- [Directory Architecture Audit](003-directory-architecture-audit.md)
- [Database Scale Architecture](005-database-scale-architecture.md)
- [Naming Conventions](004-naming-conventions.md)

### External (Vercel platform)

- [Vercel docs](https://vercel.com/docs) — deployments, environments, cron, Fluid Compute
- [Monorepo + Turborepo on Vercel](https://vercel.com/docs/monorepos/turborepo) — `tasks`, cache outputs, filters
- [Cron Jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs) — `CRON_SECRET` + `Authorization: Bearer`
- [Runtime Cache / Cache Components](https://vercel.com/docs/caching/runtime-cache) — `cacheComponents`, `use cache: remote`
- [AI Gateway authentication](https://vercel.com/docs/ai-gateway/authentication-and-byok) — OIDC vs API key
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)

### External (frameworks and data)

- [Next.js documentation](https://nextjs.org/docs)
- [Turborepo documentation](https://turborepo.com/docs)
- [Vercel AI SDK documentation](https://ai-sdk.dev/docs)
- [Neon documentation](https://neon.com/docs)
- [Drizzle ORM documentation](https://orm.drizzle.team/docs)
