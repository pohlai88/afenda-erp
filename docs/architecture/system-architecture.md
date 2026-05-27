# Afenda ERP Architecture

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

Use current stable releases at implementation time, with these architectural
defaults:

| Layer          | Default                                                    |
| -------------- | ---------------------------------------------------------- |
| Runtime        | Node.js 22 for local, CI, and Vercel builds                |
| Web framework  | Next.js App Router on the latest patched stable release    |
| React          | React 19.2 or newer patched release                        |
| Language       | TypeScript strict mode                                     |
| Styling        | Tailwind CSS with shadcn/ui and Geist typography           |
| Monorepo       | pnpm workspaces with Turborepo v2                          |
| Database       | Neon Postgres with Drizzle ORM                             |
| Auth           | Neon Auth with branchable auth state                       |
| AI             | Vercel AI SDK v6 through Vercel AI Gateway                 |
| Storage        | Vercel Blob for attachments and exports                    |
| Runtime config | Vercel Edge Config                                         |
| Observability  | Vercel Analytics, Speed Insights, logs, traces, and drains |

Framework upgrades must be treated as security work, not cosmetic dependency
churn. Keep Next.js and React on patched releases because App Router and React
Server Component security fixes can affect all routes.

## Monorepo Structure

```txt
apps/
  erp/                  # Next.js App Router ERP application
packages/
  ui/                   # Shared UI primitives and ERP layout components
  governed-surface/     # Metadata-driven ERP UI contracts and renderers
  db/                   # Drizzle schema, migrations, Neon connection helpers
  auth/                 # Neon Auth integration, roles, permission helpers
  domain/               # ERP domain services and business rules
  ai/                   # Vercel AI SDK agents, tools, prompts, guardrails
  workflows/            # Approval flows, scheduled jobs, event handlers
  observability/        # Analytics, tracing, logging conventions
  config/               # Shared tsconfig, eslint, prettier, env schema
```

The package manager is `pnpm`. Turborepo owns task orchestration, dependency
ordering, local cache, remote cache, and affected-package CI. The root
`turbo.json` should use the Turborepo v2 `tasks` key and define `build`,
`lint`, `typecheck`, `test`, `test:e2e`, `db:generate`, `db:migrate`, and
`dev` tasks. Next.js build outputs must cache `.next/**` while excluding
`.next/cache/**`.

Package ownership rules:

- `apps/erp` owns routing, route handlers, page composition, layouts, and
  application shell behavior.
- `packages/domain` owns ERP business operations and cannot import from
  `apps/erp`.
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
[Metadata-Driven UI Architecture](metadata-driven-ui-architecture.md).
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
  (app)/
    layout.tsx
    dashboard/
    finance/
    sales/
    purchasing/
    inventory/
    hr/
    crm/
    approvals/
    reports/
    admin/
  api/
    ai/chat/
    ai/extract/
    webhooks/
    uploads/
    cron/
```

Use Server Actions for internal form mutations and workflow commands. Use Route
Handlers for webhooks, file uploads, AI streaming responses, cron endpoints,
public APIs, and integrations consumed outside the React application.

The runtime default is Node.js on Vercel. Use Edge runtime only for narrow
latency-sensitive handlers that do not require Node-only dependencies,
database transactions, or large SDKs.

## ERP Module Map

Afenda ERP v1 targets SME core ERP modules:

| Module     | Primary capabilities                                  | Package ownership         |
| ---------- | ----------------------------------------------------- | ------------------------- |
| Dashboard  | KPIs, tasks, approvals, alerts                        | `apps/erp`, `domain`      |
| Finance    | Chart of accounts, journal entries, AR/AP, tax, close | `domain`, `db`            |
| Sales      | Quotes, orders, invoices, customer terms              | `domain`, `db`            |
| Purchasing | Vendors, purchase orders, receipts, bills             | `domain`, `db`            |
| Inventory  | Items, stock ledger, locations, adjustments           | `domain`, `db`            |
| HR         | Employees, leave, basic payroll inputs                | `domain`, `db`            |
| CRM        | Leads, accounts, contacts, activities                 | `domain`, `db`            |
| Approvals  | Approval rules, tasks, escalations, comments          | `workflows`, `domain`     |
| Reports    | Operational reports, exports, saved views             | `domain`, `observability` |
| Admin      | Tenant settings, users, roles, audit log              | `auth`, `domain`, `db`    |

Business rules live in `packages/domain`, not in React components. The current
module workspace implementation uses shared persisted ERP records, saved views,
work items, documents, and domain metadata. Dedicated subledger tables and
module-specific command services such as journal posting, sales order creation,
or stock adjustment remain roadmap work and should be added behind domain
operations before app routes call them.

## Data Architecture

Neon Postgres is the system of record. Drizzle ORM defines the schema and
migrations in `packages/db`. SQL remains the conceptual model: tables,
relations, indexes, constraints, and transactions should be explicit.

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
  [Metadata-Driven UI Architecture](metadata-driven-ui-architecture.md).
  Metadata must not carry the complete dataset; it carries the current server
  window, column/action contract, pagination state, and telemetry only.

Recommended database package shape:

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
      finance.ts
      sales.ts
      purchasing.ts
      inventory.ts
      hr.ts
      crm.ts
      approvals.ts
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
protection in Next.js `proxy.ts` can improve navigation and redirects, but it is
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

Vercel Cron Jobs call secured Route Handlers under `app/api/cron/*`. Each cron
handler must verify `CRON_SECRET` or the platform-provided equivalent before
running work.

## AI Architecture

AI features are built with Vercel AI SDK v6 and Vercel AI Gateway. The ERP app
already includes `ai@^6` and `@ai-sdk/react@^3`, and exposes active AI routes
for assistant chat, document extraction, and the Solution Provider Console. The
default model access pattern is through provider/model strings routed by AI
Gateway so usage, failover, and cost tracking are centralized. Production on
Vercel should use OIDC-backed Gateway authentication where available; local
development may use `AI_GATEWAY_API_KEY` or a pulled Vercel environment.

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

Performance defaults:

- Server Components fetch data on the server and stream slow sections behind
  Suspense boundaries.
- Shared, non-sensitive reference data can use Cache Components with
  `"use cache"`, `cacheLife`, `cacheTag`, and tagged revalidation.
- Personalized and tenant-sensitive data must use tenant-aware cache keys or
  remain uncached.
- Mutations invalidate specific paths or tags instead of broad application
  refreshes.
- Static assets use Vercel's CDN and immutable hashed filenames.
- Images use `next/image`; fonts use `next/font`.
- Client bundle size is monitored with Next.js bundle analysis.

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

`apps/erp` is deployed as one Vercel project. The Vercel project root points to
`apps/erp`, while Turborepo resolves and builds required packages from the
workspace graph.

Deployment environments:

| Environment | Purpose                 | Data                                |
| ----------- | ----------------------- | ----------------------------------- |
| Local       | Developer iteration     | Local env plus Neon dev branch      |
| Preview     | Pull request validation | Neon preview branch where available |
| Production  | Customer traffic        | Production Neon branch/database     |

Required platform services:

- Vercel project for `apps/erp`.
- Vercel Remote Cache for Turborepo.
- Neon Postgres integration.
- Neon Auth configuration.
- Vercel Blob store.
- Vercel Edge Config for flags and runtime configuration.
- Vercel Analytics and Speed Insights.
- Vercel Observability/log drains where required.
- Vercel AI Gateway enabled for the project.

Environment variables are managed through Vercel environments and pulled locally
with the Vercel CLI. Secrets must not be committed. Shared environment schemas
belong in `packages/config`.

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
routes are implemented locally. Vercel project linking, remote cache, and
production environment pulls remain platform setup tasks rather than source-code
changes.

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
  reports, and admin route groups.
- Build domain services for each module before adding advanced UI.
- Add audit logging for all critical mutations.
- Add Blob-backed attachment flows for business documents.

Current status: all module route groups exist in `apps/erp` and share a single
metadata-driven Server Component renderer. `packages/domain` now resolves
serialized module workspaces from tenant-scoped database records, saved views,
workflow items, and document registry rows, with metadata fallback for local dev
mode. `packages/db` includes Phase 3 persistence for `erp_module_records`,
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
by tenant. Local development requires `AI_GATEWAY_API_KEY` or a
`VERCEL_OIDC_TOKEN` from `vercel env pull` before model calls execute.
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
- Tenant context, authorization, audit logging, and validation are mandatory
  patterns, not optional conventions.
- The data and auth design uses Neon Postgres and Neon Auth as first-class
  platform choices.
- AI capabilities use Vercel AI SDK and AI Gateway with authorization,
  validation, cost tracking, and approval boundaries.
- Vercel deployment, performance measurement, observability, and remote caching
  are included in the baseline platform design.
- Metadata-driven ERP surfaces follow
  [Metadata-Driven UI Architecture](metadata-driven-ui-architecture.md):
  server-window-first lists, static renderer dispatch, Zod contracts, public
  package doors, and automation gates for renderer/schema/fixture parity.

## References

- Vercel documentation: https://vercel.com/docs
- Next.js documentation: https://nextjs.org/docs
- Turborepo documentation: https://turborepo.com/docs
- Vercel AI SDK documentation: https://ai-sdk.dev/docs
- Neon documentation: https://neon.com/docs
- Drizzle ORM documentation: https://orm.drizzle.team/docs
