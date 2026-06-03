# ARCH-1002 · Backend

**Doc ID:** `ARCH-1002` · **File:** `1002-backend.md`

| Field | Value |
| ----- | ----- |
| Status | **Live** (Jun 2026) |
| Layer | Backend — business logic, DB, commands, events, kernel |
| Defers to | **ARCH-1001** (constitution) |
| Related | **ARCH-1003** (frontend) · **ARCH-1004** (API) · **ARCH-1005** (monorepo, guards) |

Former **ARCH-002**, **ARCH-016**, and **ARCH-010** (backend sections).

---

## 1. Core rule

Backend is **TypeScript in `packages/`** — same Next.js process as the frontend. **Not** `apps/backend`, **not** a separate Vercel project.

```txt
Modular monolith: one @afenda/erp deploy · feature packages own business truth · platform packages own pipes (§6 norm — closed allowlist)
```

Frontend calls backend with a **function import** — not HTTP to yourself (**1003**).

**Do not adopt** without amending **1001**:

| Pattern | Why |
| ------- | --- |
| `apps/api` or split web/api repos | Duplicates auth, tenancy, deploy |
| Microservice per module | One Postgres, shared transactions, one execution kernel |
| BFF that `fetch`es internal REST for pages | Double validation, latency |
| Nested feature `package.json` per category | Breaks guards (**1005** §6) |
| Business logic in `apps/erp/src/lib` | App composes only |

Monorepo layout, Turbo, guards: **ARCH-1005**.

---

## 2. Execution stack

External (**1004**) and internal (**1003**) share layers 2–7:

```txt
Transport     Server Action · REST · Webhook · Cron · Agent
    ↓
Command       typed payload + handler (feature/*/commands/)
    ↓
Kernel        @afenda/kernel — permission · audit · policy · idempotency
    ↓
Domain        @afenda/feature-* — invariants ONLY here
    ↓
Repository    feature/*/data/ + @afenda/db
    ↓
Event         domain event → append-only store
    ↓
Projection    read models · packages/projections (cross-module)
    ↓
Presentation  server queries · governed UI · RSC (**1003**)
```

**Two doors, one brain:** REST and Server Action dispatch the **same commands** (**1004** §1).

| Layer | Location |
| ----- | -------- |
| Ingress | `apps/erp` — pages, `app/api/**`, `workspace-routes/` — no business rules |
| Business truth | `packages/features/*` |
| HTTP kit | `@afenda/api` — envelopes, handler helpers only (**ARCH-1004**) |
| Registry | `packages/registry` — aggregates command/API/event catalogs |
| Events | `packages/events` — publish, store, subscriptions |
| Projections | `packages/projections` — Nexus, org health — not query fan-out |
| Platform | `kernel`, `db`, `auth`, `workflows`, `governed-surface`, … |

---

## 3. Write path

```txt
transport → command → kernel → domain → repository → domain event
```

| Step | Owns | Does not own |
| ---- | ---- | ------------ |
| Transport | Parse, `dispatchCommand`, revalidate | Business rules |
| Command | Type, validation shape, registration | HTTP status codes |
| Kernel | Context, permission, policy, audit contract | Module posting rules |
| Domain | Invariants, orchestration | Session resolution |
| Repository | Tenant-scoped SQL | Capability names in UI |
| Event | Type + payload | Notification UI |

```txt
approvePOAction → ApprovePOCommand → kernel → purchasingDomain.approve → db + event
POST /api/.../commands/approve-purchase-order  →  same command chain
```

---

## 4. Read path

```txt
server query → read model → repository → db
```

Not `server query → repository` (joins leak). Not `fetch('/api/...')`.

- **Lists:** server windows — never full tables to client (**1003**).
- **Cross-module (Nexus, dashboard):** `packages/projections` — not N feature imports in one route.
- **Org ID:** server session via `@afenda/auth` only.

Query API handlers (**1004**) call the **same read-model functions** as RSC.

---

## 5. Event store

```txt
domain service  →  domain event  →  event store (append-only, tenant-scoped)

Consumers (read-only): audit · workflow · notifications · activity · Lynx · diagnostics
```

Audit is an event **consumer** — not a parallel write path that bypasses the event layer. No per-feature `*_audit_log` if the event already describes the action.

| Piece | Location |
| ----- | -------- |
| Event types | `feature/*/events/` |
| Publish API *(target)* | `packages/events` |
| Tables | `@afenda/db` — `pnpm db:generate` → `pnpm db:migrate` (**1005** §9) |

---

## 6. Features vs platform packages

### Norm

```txt
ERP module truth  →  packages/features/* only (@afenda/feature-*)
Everything else   →  platform packages — shared pipes, no module exceptions
```

**Only `@afenda/feature-*` may own module-specific behavior** — finance posting rules, HR compliance, purchasing approvals, System Admin config domains, Lynx operator product logic, etc.

Platform packages are **not special cases**. They do not get module business rules “because they’re central.” If code knows *what a PO approval means* or *how HR compliance is calculated*, it belongs in the owning feature — not in `kernel`, `db`, `auth`, or a new `@afenda/*` package.

Adding a platform package: **`pnpm scaffold:platform <slug>`** ([`packages/_scaffold/platform`](../../packages/_scaffold/platform)), then register in **1005** §5 and `scripts/check-directory-architecture.mts`. Default for new ERP capability: **`pnpm scaffold:feature <moduleId>`** — not a sibling under `packages/`.

### Platform allowlist

Enforced categories: **1005** §5. Import law: §9 below.

| Package | Category | Allowed | Forbidden |
| ------- | -------- | ------- | --------- |
| `@afenda/kernel` | runtime-library | Execution law — context, permission, policy, audit, idempotency; **frozen** list compat (bugfix only, §7) | Module domain rules; importing `@afenda/feature-*` |
| `@afenda/db` | database | Schema, migrations, tenancy helpers, `getDb()` | Business invariants; module posting logic |
| `@afenda/auth` | runtime-library | Session, org resolution, capability **primitives** | Module permission matrices; System Admin config (→ feature); Neon SDK |
| `@afenda/auth/neon-auth` | runtime-library | Neon Auth SDK runtime, JWT/webhook verify, browser client | ERP UI; tenant org hydration (`@afenda/auth`) |
| `@afenda/workflows` | runtime-library | Cron plumbing, durable job helpers, outbound webhook **delivery** | Domain commands; module orchestration |
| `@afenda/ai` | runtime-library | Substrate-blind tools, gateway clients, shared AI utilities | Lynx product surfaces, retrieval policy (→ `feature-lynx`, `feature-knowledge`) |
| `@afenda/governed-surface` | runtime-library | Metadata renderer kernel, governed list/section chrome | Tenant authority; module queries |
| `@afenda/appshell` | runtime-library | Workspace shell chrome, command palette, nav | Module business rules |
| `@afenda/observability` | runtime-library | Logging, telemetry drains, structured diagnostics | Domain events; module audit semantics |
| `@afenda/object-storage` | runtime-library | Tenant object uploads/downloads — Vercel Blob, Cloudflare R2 (S3-compatible) | Module document rules; direct provider SDK imports in features |
| `@afenda/billing` | runtime-library | Platform billing integration hooks | Module AR/AP/invoicing (→ `@afenda/feature-finance`) |
| `@afenda/ui` | ui-primitives | shadcn primitives, design tokens | `db`, auth server, features, governed metadata |
| `@afenda/config` | config | Shared Next/Turbo/Vitest/TS config | Runtime business logic |

**Not backend domain owners:** `@afenda/appshell`, `@afenda/governed-surface`, `@afenda/ui` — presentation/shell only (**1003**).

### Required platform packages (cross-cutting)

Create **once** when the capability is cross-cutting infrastructure — not per module. Missing package = gap in **ARCH-1001** §7 build order, not permission to put logic elsewhere.

| Package | Role | Forbidden |
| ------- | ---- | --------- |
| `@afenda/api` | HTTP envelopes, handler helpers, `dispatchCommand` wiring (**ARCH-1004**) | Domain services |
| `@afenda/events` | Publish, store, subscriptions | Feature event **types** (stay in `feature/*/events/`) |
| `@afenda/projections` | Cross-module read surfaces (Nexus, org health) | Replacing feature read-models for single-module lists |
| `@afenda/registry` | Command/API/event catalog aggregation | Business rules |
| `@afenda/machine` | Consolidated machine-layer runtime (from `ai` + Lynx features) | Substrate vs product split stays in features until P5 merge |

### Feature packages (`@afenda/feature-*`)

The **only** place for ERP module truth: commands, domain, repositories, read-models, module events, module API contracts, module-specific UI behind four export doors (§8).

Includes control plane (`feature-system-admin`) and machine **product** packages (`feature-lynx`, `feature-knowledge`) — they follow feature rules even when they configure or operate cross-cutting concerns.

### Where new code goes

| Question | Location |
| -------- | -------- |
| Specific to one ERP module or product area? | `packages/features/<moduleId>/` |
| Shared execution law for every mutation? | `@afenda/kernel` |
| Schema / migration / tenant boundary? | `@afenda/db` |
| Session / org / capability resolution? | `@afenda/auth` |
| Combines **multiple modules** for one read surface? | `@afenda/projections` |
| Event bus infrastructure? | `@afenda/events` |
| HTTP transport kit? | `@afenda/api` |
| Cron/webhook **plumbing**? | `@afenda/workflows` — feature still owns the command |
| UI primitive or shell chrome? | `@afenda/ui`, `@afenda/appshell`, `@afenda/governed-surface` (**1003**) |
| “We need a new `@afenda/foo` for this module” | **No** — use the owning feature unless §6 platform row fits and guards are updated |

---

## 7. `@afenda/kernel`

**Narrow:** execution law + frozen list compat — not module business rules.

Path: `packages/kernel/src/execution-kernel/` — `context/`, `access/`, `policy/`, `audit/`, `execution/`.

```ts
import {
  requireExecutionContext,
  requireExecutionPermission,
  runGuardedExecution,
} from "@afenda/kernel/server";
```

**Guarded mutation:** `requireExecutionContext()` → Zod in feature → `requireExecutionPermission` → `assertExecutionPolicy` → feature `execute()` → audit/event → revalidate (transport).

**Context** (minimum):

```ts
type ExecutionAuthorityContext = {
  organizationId: string;
  userId: string;
  membershipId: string;
  actorType: "user" | "system" | "agent";
  locale: string;
};
```

**Frozen compat** (bugfix only): `modules/*-surfaces.ts`, `shell/*` — new modules use feature builders, not kernel list surfaces.

**Rule:** kernel **never** imports `@afenda/feature-*` — `pnpm kernel:check`.

Admin **configures** law; kernel **enforces** at runtime (**1006**).

---

## 8. Feature packages

Four export doors only: `.`, `/client`, `/server`, `/metadata`.

Scaffold: `pnpm scaffold:feature <moduleId>` · vertical: `pnpm scaffold:vertical <feature> <capability>` · templates: [`packages/_scaffold/feature`](../../packages/_scaffold/feature).

### Horizontal buckets

```txt
packages/features/<moduleId>/src/
  actions/     thin transports → commands
  commands/    command types + handlers
  api/         *.contract.ts (registry metadata) · *.presenter.ts
  data/        repositories · *.queries.ts
  read-models/ page/list shapes — required at maturity
  domain/      services · policies
  events/      event types
  schemas/     Zod
  components/  module UI → ./client
  tests/
```

### Vertical slice (mature capabilities)

```txt
packages/features/hr-suite/src/employee-management/
  actions/ commands/ api/ data/ read-models/ domain/ events/ schemas/ tests/
```

`pnpm scaffold:vertical <feature> <slice>`. Module-local projections only — cross-module → `packages/projections`.

| Bucket | REST (**1004**) | UI (**1003**) |
| ------ | --------------- | ------------- |
| `commands/` + `domain/` | `dispatchCommand` in handler | Server Action → same command |
| `read-models/` | Query API | Server query → read model |
| `events/` | — | Publish via `packages/events` after domain |
| `api/*.presenter.ts` | JSON envelope | Optional client DTO |

HR vertical rules: `packages/features/hr-suite/AGENTS.md`.

### Command bus (required)

```txt
feature/*/commands/     types + register
kernel/execution-kernel law
@afenda/api             dispatchCommand + withApiHandler
app/api/**/route.ts     HTTP → dispatchCommand only
feature/actions/        Server Action → dispatchCommand
workflows/              cron → dispatchCommand
```

Every governed mutation **must** use this chain. Direct `@afenda/db` from routes, actions, or fat `api/*.handler.server.ts` is **non-compliant** (**ARCH-1004** §7).

---

## 9. Import law

```txt
apps/erp
  →  feature-* (., /client, /server, /metadata), kernel, auth, db, platform
  ✗  feature /src deep paths · business logic in apps/erp/src/lib

feature-*
  →  db, auth, kernel, governed-surface, ui, workflows,
     events, projections, registry (target)
  ✗  apps/erp · other features (except shared kernel contracts)

kernel     →  auth, db          ✗  features
events     →  db, observability ✗  feature domain (features call events API)
projections → db, feature read-models, events  ✗  command dispatch
registry   →  contract metadata only           ✗  domain services
api        →  auth, kernel, zod                ✗  features (one-way)
ui         →  primitives only                 ✗  db, auth server, features
```

`pnpm architecture:check` · `pnpm kernel:check`.

---

## 10. Database and workflows

| Concern | Owner |
| ------- | ----- |
| Schema, migrations | `@afenda/db` — no hand-written SQL unless user requires |
| Module transactions | Feature domain — one `getDb()` boundary |
| Tenant scope | Server-resolved `organizationId` on every query/mutation |
| Domain events | Feature `events/` + store in db |
| Cron | `vercel.json` → route → workflows or command — `CRON_SECRET` (**1004** §5) |
| Inbound webhooks | `app/api/.../webhooks/*` → verify → ingest command |
| Outbound webhooks | `@afenda/workflows` — domain emits event first |

No second database per module.

---

## 11. When to add what

| Need | Action |
| ---- | ------ |
| New ERP module | `pnpm scaffold:feature <moduleId>` |
| Capability inside module | Vertical slice |
| Shared HTTP envelope | `@afenda/api` once (**1004**) |
| Event store | `@afenda/events` once (P3) |
| Nexus / cross-module dashboard | `@afenda/projections` — not new feature |
| Registry catalogs | `@afenda/registry` once (P4) |
| New execution law | `execution-kernel/` + tests |
| Separate API server | **No** — optimize read models + windows |
| UI primitive | `@afenda/ui` |

Splitting a feature into its own Vercel project requires amending **1001** — default **no**.

---

## 12. Reference flows

```txt
UI write:     form → action → command → kernel → domain → db + event → revalidate
REST write:   POST …/commands/… → packages/api → same command chain → envelope
UI read:      workspace-routes → query/read-model or projection → governed section
```

---

## 13. Non-compliance (wrong patterns)

| Pattern | Why it is wrong |
| ------- | ---------------- |
| Module business rules in `apps/erp/src/lib` or `@afenda/kernel` | **§6** — features only |
| Mutation without `commands/` + `runGuardedExecution` (when governed) | **§3**, **§7** |
| `read-models/` skipped for module list/page composition | **§4** |
| Cross-module Nexus built from N feature imports in one route | **§4** — `packages/projections` |
| Flat `app/api/*` HTTP tree | **ARCH-1004** §2, §7 |
| Lynx/API handler calls `@afenda/db` directly | **commands/** / **data/** only |
| “Temporary” duplicate logic in app until platform package exists | **ARCH-1001** §7 — no shims |

Phased delivery (**ARCH-1001** §7) orders **when** packages land; it does **not** bless non-compliant shortcuts.

---

## 14. Verification

```bash
pnpm --filter @afenda/kernel test
pnpm kernel:check
pnpm architecture:check
```

Kernel contract changes: update this doc + kernel tests in the same PR.

---

## 15. Summary

```txt
Backend = packages/features + kernel + db (+ events, projections, registry, api)

Pattern:  modular monolith — not microservices · not apps/backend
Writes:   transport → command → kernel → domain → db → event
Reads:    server query → read model → db · projections for cross-module
Rules:    module truth in features only · platform = closed allowlist (§6) · kernel never imports features · one db

Frontend: ARCH-1003 · API: ARCH-1004 · Monorepo: ARCH-1005
```
