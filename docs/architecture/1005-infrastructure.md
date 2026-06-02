# ARCH-1005 · Infrastructure

**Doc ID:** `ARCH-1005` · **File:** `1005-infrastructure.md`

| Field | Value |
| ----- | ----- |
| Status | **Live** (Jun 2026) |
| Layer | Infrastructure — monorepo, deploy, DB, guards, naming, env |
| Defers to | **ARCH-1001** (constitution) |
| Related | **ARCH-1002** (backend) · **ARCH-1003** (frontend) · **ARCH-1004** (API) |

Former **ARCH-001** (deploy/runtime), **ARCH-003**, **ARCH-004**, **ARCH-005**, **ARCH-008**, **ARCH-009** (infra), and **ARCH-016** §5–§6 (monorepo/turbo).

When this doc and `scripts/check-directory-architecture.mts` disagree, **fix both in the same PR** — the guard script is enforcement truth.

---

## 1. What “infrastructure” means here

How the repo is organized, built, deployed, and guarded — not business logic.

| In scope | Out of scope (other books) |
| -------- | --------------------------- |
| Monorepo layout, Turborepo, Vercel | Commands, domain, events — **1002** |
| Package categories, export doors | RSC, AppShell — **1003** |
| `pnpm architecture:check`, root hygiene | REST routes — **1004** |
| Neon Postgres, migrations, schema folders | System Admin UI — **1006** |
| Naming, module IDs | |
| Env vars, auth plumbing, cron secret | |
| Lynx/Knowledge package placement | |

---

## 2. Deploy model

```txt
One Git repo
One Vercel project (repo root vercel.json)
One production app: @afenda/erp
One shared Neon Postgres (multi-tenant)
```

| Setting | Value |
| ------- | ----- |
| Install | `pnpm install` |
| Build | `pnpm turbo build --filter=@afenda/erp --concurrency=2` |
| Runtime | Node.js (default for API + RSC data paths) |
| Vercel link / Remote Cache | Deferred until stabilization gate — naming must not assume multiple projects |

**Rejected** without amending **ARCH-1001**: `apps/api`, per-module Vercel projects, microfrontends for core ERP.

Cron jobs: declared in root `vercel.json` → `apps/erp/src/app/api/internal/v1/cron/*` with `Authorization: Bearer ${CRON_SECRET}` (**ARCH-1004** §5).

### 2.1 Environments and preview deploys

Vercel creates a **preview deployment** for every non-production branch/PR. Production uses the **production** environment variable set.

| Environment | `VERCEL_ENV` | Typical use |
| ----------- | ------------ | ----------- |
| Production | `production` | Customer traffic |
| Preview | `preview` | PR / branch deploys |
| Development | `development` | `vercel dev` locally |

**Branch-scoped preview vars** — point a feature branch at a different Neon branch or API:

```bash
vercel env add DATABASE_URL preview feature-branch
vercel env pull --environment=preview --git-branch=feature-branch
vercel env run -e preview --git-branch feature-x -- pnpm --filter @afenda/erp dev
```

**Promote preview → production** (when not using auto-deploy from `main`):

```bash
vercel promote <deployment-url>
```

**Neon alignment (recommended):** install the [Neon Vercel integration](https://vercel.com/docs/integrations) (`vercel install neon` from repo root after link). With **preview branching** enabled, each preview deployment gets an isolated Neon branch — schema and data do not touch production.

| Step | Action |
| ---- | ------ |
| 1 | Connect Neon project in Vercel Marketplace — billing stays in Neon or Vercel per integration type |
| 2 | Enable **automatic preview branches** in integration settings |
| 3 | Vercel injects `DATABASE_URL` (and pooled URL) per preview deployment |
| 4 | Run `pnpm db:migrate` in the Vercel **build** command or a `postbuild` script so each preview branch applies pending migrations |
| 5 | Match `NEON_AUTH_*` to the preview branch — Neon Auth endpoints are branch-scoped |
| 6 | Branches auto-delete when preview deployments are removed |

Never point production `DATABASE_URL` at a preview branch. For manual branch env without the integration:

```bash
vercel env add DATABASE_URL preview feature-branch
```

**Promote preview → production** — use when a preview build is validated but not auto-deployed from `main`:

```bash
vercel list --status READY
vercel inspect <deployment-url>
vercel curl /api/health --deployment <deployment-url>
vercel promote <deployment-url> --yes
vercel logs --environment production --level error --since 5m
```

**Deferred (stabilization gate):** `vercel link`, team Remote Cache, and multi-project assumptions stay off until **ARCH-1001** gate passes — then run `vercel link` at repo root and enable Turborepo Remote Cache (§4.1).

### 2.2 Fluid Compute and function limits

[Vercel Fluid Compute](https://vercel.com/docs/fluid-compute) keeps function instances warm longer and coordinates background work — default for new projects. Enable explicitly when needed:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "fluid": true
}
```

**`maxDuration`** — set per route or via `vercel.json` `functions` globs for long cron, exports, and Lynx streams (**ARCH-1004** §5):

```json
{
  "functions": {
    "apps/erp/src/app/api/internal/v1/cron/**/*.ts": { "maxDuration": 300 },
    "apps/erp/src/app/api/internal/v1/ai/**/*.ts": { "maxDuration": 60 },
    "apps/erp/src/app/api/internal/v1/lynx/**/*.ts": { "maxDuration": 60 }
  }
}
```

Or in a Route Handler: `export const maxDuration = 60;`

When Fluid Compute is enabled, **memory** for functions is configured in the Vercel project dashboard — not `memory` in `vercel.json` (per Vercel config docs).

---

## 3. Repo layout

```txt
afenda-erp/
  apps/erp/              deployable Next.js app
  packages/
    features/<moduleId>/ @afenda/feature-*
    kernel/ db/ auth/ ui/ appshell/ governed-surface/ …
    api/ events/ projections/ registry/   # target packages
  packages/_scaffold/              feature + platform scaffolds
  scripts/               architecture:check, guards, env sync
  docs/architecture/     ARCH-1001 – 1006 (canonical)
  docs/roadmap/          TRACK-* plans
  .artifacts/            test output only (gitignored)
  docs/testing/          committed audit baselines
```

### Forbidden at repo root

| Forbidden | Use instead |
| --------- | ----------- |
| `artifacts/` (no dot) | `.artifacts/` |
| `build-log.txt`, `page-*.yml` | `.artifacts/logs/` or delete |
| Root `*-architecture.md` | `docs/architecture/` |

Enforced: `pnpm architecture:check`, Cursor `guard-root-hygiene.mjs`.

---

## 4. Monorepo / Turborepo

Root `turbo.json` uses v2 **`tasks`** (not legacy `pipeline`).

| Task | Policy |
| ---- | ------ |
| `build` | `dependsOn: ["^build"]`, `outputs: ["dist/**"]` for libraries |
| `@afenda/erp#build` | `outputs: [".next/**", "!.next/cache/**"]` (Vercel NEXTJS_NO_TURBO_CACHE) |
| `test` / `test:e2e` | `cache: false` |
| `globalEnv` | `DATABASE_*`, `NEON_AUTH_*`, `CRON_SECRET`, AI keys, etc. — affects cache hashes |

Rules:

- Every `@afenda/*` import must appear in consumer `package.json` as `workspace:*`.
- Library packages build before app (`^build`).
- Do not cache `.next/cache/**` in Turborepo outputs.

### Output locations

| Output | Path |
| ------ | ---- |
| Next build | `apps/erp/.next/**` |
| Package compile | `packages/*/dist/**` |
| Tests / coverage | `.artifacts/**` only |
| TS build info | `.next/cache/` or ignored — not beside `src/` |

Forbidden in `src/`: emitted `*.js`, `*.d.ts`, `*.tsbuildinfo`.

### 4.1 Turborepo Remote Cache (after link)

Local Turbo cache is always on. **Vercel Remote Cache** shares build artifacts across CI and developers after the project is linked:

```bash
vercel link          # repo root — once stabilization gate passes
turbo run build      # uploads/downloads cache via Vercel when linked
```

Rules unchanged: `@afenda/erp#build` outputs `.next/**` excluding `.next/cache/**`; library `dist/**` is cacheable. `test` / `test:e2e` stay `cache: false`. New env vars that affect build output must be listed in `turbo.json` `globalEnv` or cache keys will be wrong.

---

## 5. Package categories

Enforced in `scripts/check-directory-architecture.mts`.

| Category | Packages | Backend / deploy role |
| -------- | -------- | --------------------- |
| `next-app` | `@afenda/erp` | Ingress only — `app/`, `workspace-routes/`, `app/api/**` |
| `feature-package` | `@afenda/feature-*` | **Only** ERP module / product business truth (**1002** §6 norm, §8) |
| `runtime-library` | kernel, auth, appshell, governed-surface, ai, object-storage, workflows, … | Platform pipes — **no module rules** (**1002** §6 allowlist) |
| `ui-primitives` | `@afenda/ui` | Presentation only |
| `database` | `@afenda/db` | Schema, migrations, tenancy |
| `config` | `@afenda/config` | Shared Next/Turbo/Vitest config |

Target runtime libraries (not on disk): `@afenda/api`, `@afenda/events`, `@afenda/projections`, `@afenda/registry`, `@afenda/machine` — roles in **ARCH-1002** §6.

New package class → update guard script + this doc in the same PR.

---

## 6. Export doors (feature packages)

Required public subpaths — only supported import surfaces:

| Export | Use |
| ------ | --- |
| `@afenda/feature-<id>` | Environment-neutral barrel — keep small |
| `@afenda/feature-<id>/client` | Client Components — no db, no auth server |
| `@afenda/feature-<id>/server` | Server queries, actions, domain |
| `@afenda/feature-<id>/metadata` | Governed metadata — no tenant reads |

`src/server.ts` imports `@afenda/kernel/server` — not bare `server-only` in deep files.

Compiled libraries:

```json
"build": "tsc -p tsconfig.build.json"
```

`exports.*.default` → `./dist/*.js`; `types` / `development` may point at `./src`.

Scaffold: `pnpm scaffold:feature <moduleId>` from `packages/_scaffold/feature` · `pnpm scaffold:platform <slug>` from `packages/_scaffold/platform`.

**Flat workspace:** one `package.json` per module under `packages/features/<moduleId>/`. No nested workspaces (`packages/features/hr/payroll/package.json`) unless doctrine + guards updated together.

Forbidden folder names in features: `_shared`, `common`, `lib`, `utils`, catch-all dumps.

---

## 7. App ↔ UI boundary

- **`apps/erp/src/components/ui/` must not exist** — primitives live in `@afenda/ui`.
- `apps/erp/components.json` → UI aliases point at `packages/ui`.
- App-specific composition: `apps/erp/src/app`, `apps/erp/src/components` (non-`ui`).

---

## 8. Naming

### Packages

| Kind | Pattern | Example |
| ---- | ------- | ------- |
| App | `@afenda/<app>` | `@afenda/erp` → `apps/erp` |
| Platform | `@afenda/<name>` | `@afenda/kernel` |
| Feature | `@afenda/feature-<moduleId>` | `@afenda/feature-hr-suite` → `packages/features/hr-suite` |

Lowercase kebab-case folders. Folder slug must match package name.

### Module IDs

Canonical list: `packages/config/src/module-ids.ts`.

| moduleId | Route | Feature package |
| -------- | ----- | --------------- |
| `dashboard` | `/dashboard` | app shell |
| `finance`, `sales`, `purchasing`, `inventory`, `crm`, `reports` | `/[moduleId]` | `@afenda/feature-<id>` |
| `hr` | `/hr` | `@afenda/feature-hr-suite` |
| `system-admin` | `/system-admin` | `@afenda/feature-system-admin` |

Do not invent alternate slugs (`hrm`, `human-resources`) without changing `module-ids.ts`.

Routes: `(workspace)/[moduleId]/…` — not per-module App Router trees unless URL genuinely differs.

Target schema folders: `packages/db/src/schema/<moduleId>/`.

### Architecture docs

```txt
docs/architecture/100N-*.md     ARCH-1001 – ARCH-1006 only (6 doc ceiling)
docs/roadmap/TRACK-*.md         plans and tracks
```

Legacy `00N-*.md` → delete as books ship (**README** migration table).

### Files (feature buckets)

Horizontal: `actions/`, `commands/`, `data/`, `domain/`, `events/`, `schemas/`, `read-models/`, …  
Vertical slice: `packages/features/<id>/src/<capability>/` with full bucket set — `pnpm scaffold:vertical`.

---

## 9. Database (Neon + Drizzle)

**Owner:** `@afenda/db` — schema, migrations, tenancy, `getDb()`.

| Concern | Rule |
| ------- | ---- |
| Schema source | `packages/db/src/schema/**/*.ts` |
| Migrations | `pnpm db:generate` → review SQL → `pnpm db:migrate` |
| Hand-written SQL | Agents do not edit `packages/db/drizzle/*.sql` unless user explicitly requires |
| Runtime URL | `DATABASE_URL` |
| Migration URL | `DATABASE_MIGRATION_URL` |
| Tenancy | Postgres GUCs in transactions (`afenda.current_organization_id`) — not client `organizationId` |
| Pools | Lazy `getDb()` — no new module-scope Neon pools in app code |
| Vector | pgvector `vector(1536)` HNSW for knowledge embeddings |
| Fluid Compute | When introducing a dedicated `pg` pool in a Function, call `attachDatabasePool(pool)` from `@vercel/functions` immediately after pool creation so idle clients release before suspend |

**Target hardening:** wire `attachDatabasePool` on the shared Neon pool inside `@afenda/db` once deploy runtime is confirmed on Fluid Compute. Until then, lazy singleton + transaction-scoped GUCs match current serverless usage.

```ts
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
attachDatabasePool(pool);
```

Use `waitUntil` from `@vercel/functions` for fire-and-forget work after the response (audit fan-out, non-blocking webhook side effects) — do not block the HTTP response on it:

```ts
import { waitUntil } from "@vercel/functions";

export async function POST(request: Request) {
  const result = await processWebhook(request);
  waitUntil(fanOutAuditEvent(result)); // completes after response sent
  return Response.json({ ok: true });
}
```

In Next.js 15.1+, `waitUntil` may also be available on the request context — prefer `@vercel/functions` for consistency across Route Handlers.

### Schema layout

**Non-compliant:** flat files at `packages/db/src/schema/*.ts` root (`common.ts`, `identity.ts`, …) without `schema/<moduleId>/` folders.

**Required:** `packages/db/src/schema/<moduleId>/` per mature module (finance/, hr/, inventory/, …).

### Growth rules

- Every tenant table scoped by `organizationId`.
- Append-first for posting, stock movement, approvals, audit events.
- Promote JSONB to typed columns when searchable, reportable, or workflow-critical.
- Index FKs, tenant filters, status queues, list filters.
- Do not extend generic `erp_module_records` for ledger-grade, inventory-grade, or statutory workflows.
- Event store tables: append-only, tenant-scoped (**ARCH-1002** §4).

Feature packages own query/command **services**; app routes do not assemble SQL.

---

## 10. Auth and env

| Piece | Location |
| ----- | -------- |
| Identity | Neon Auth (`@afenda/auth`) |
| Session refresh | `apps/erp/src/proxy.ts` |
| Org resolution | Server session — never client-supplied org as source of truth |
| Env schema | `@afenda/config`, `.env.config` / sync scripts |
| Public env | `NEXT_PUBLIC_*` in turbo `@afenda/erp#build.env` |

Key env vars (also in `turbo.json` `globalEnv`):

```txt
DATABASE_URL · DATABASE_MIGRATION_URL
NEON_AUTH_BASE_URL · NEON_AUTH_COOKIE_SECRET
CRON_SECRET · VERCEL_DRAIN_SECRET
AI_GATEWAY_API_KEY · VERCEL_OIDC_TOKEN
BLOB_READ_WRITE_TOKEN
OBJECT_STORAGE_PROVIDER · OBJECT_STORAGE_ENDPOINT · OBJECT_STORAGE_BUCKET
OBJECT_STORAGE_ACCESS_KEY_ID · OBJECT_STORAGE_SECRET_ACCESS_KEY · OBJECT_STORAGE_PUBLIC_URL_BASE
EDGE_CONFIG                    # optional — global kill-switches (§10.3)
```

Sync locally: project env scripts (see `docs/development/env.md` if present).

### 10.1 AI Gateway authentication

Lynx and `api/ai/*` use the Vercel AI SDK against [AI Gateway](https://vercel.com/docs/ai-gateway). Auth pattern:

```ts
// Production on Vercel: VERCEL_OIDC_TOKEN is injected automatically
// Local / CI: set AI_GATEWAY_API_KEY (or pull via vercel env pull after vercel link)
const apiKey = process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_OIDC_TOKEN;
```

| Context | Credential |
| ------- | ---------- |
| Local dev | `AI_GATEWAY_API_KEY` from project settings, or `vercel link && vercel env pull` |
| Vercel deploy | `VERCEL_OIDC_TOKEN` (automatic when OIDC enabled) — prefer over long-lived keys in production |
| Shared client | `AI_GATEWAY_API_KEY \|\| VERCEL_OIDC_TOKEN` in `@afenda/ai` |

**Explicit OIDC** (calling external APIs with Vercel identity):

```ts
import { getVercelOidcToken } from "@vercel/oidc";

const token = await getVercelOidcToken();
await fetch("https://api.example.com", {
  headers: { Authorization: `Bearer ${token}` },
});
```

On Vercel deployments, AI SDK `generateText` / `streamText` can omit explicit keys when Gateway OIDC is enabled — the platform injects credentials. Local dev always needs `AI_GATEWAY_API_KEY` unless OIDC token is pulled into `.env.local`.

Mutating AI tools: `needsApproval: true` + domain services — never direct table writes (**ARCH-1002**, **ARCH-1004** §5). BYOK and provider routing: AI Gateway dashboard.

### 10.2 Object storage (`@afenda/object-storage`)

Tenant attachments and exports route through **`@afenda/object-storage`** — not direct `@vercel/blob` or AWS SDK imports in `apps/erp` or feature packages.

| Provider | Env | Upload flow |
| -------- | --- | ----------- |
| `vercel-blob` (default on Vercel) | `BLOB_READ_WRITE_TOKEN`, optional `VERCEL_BLOB_CALLBACK_URL` | Client `@vercel/blob/client` → `POST /api/internal/v1/uploads` with `handleUpload` body |
| `r2` (Cloudflare) | `OBJECT_STORAGE_PROVIDER=r2`, `OBJECT_STORAGE_ENDPOINT`, `OBJECT_STORAGE_BUCKET`, `OBJECT_STORAGE_ACCESS_KEY_ID`, `OBJECT_STORAGE_SECRET_ACCESS_KEY`, optional `OBJECT_STORAGE_PUBLIC_URL_BASE` | `POST /api/internal/v1/uploads` with `intent: "presign"` → client PUT → `intent: "complete"` |

**Authenticate before issuing upload tokens** — without server-side pathname and capability checks, anyone can upload to the store.

```ts
import { handleObjectStorageUploadPost } from "@afenda/object-storage/server";

export async function POST(request: Request) {
  const result = await handleObjectStorageUploadPost(request);
  return NextResponse.json(result.body, { status: result.status });
}
```

| Rule | Detail |
| ---- | ------ |
| Compliant upload ingress | `app/api/internal/v1/uploads/` (**ARCH-1004** §5) |
| Auth | Same tenancy as Server Actions — **ARCH-1003** §4 |
| Vercel `onUploadCompleted` | **Does not fire on localhost** — use ngrok or similar to test the full webhook path |
| R2 registration | `intent: "complete"` heads object, verifies size, then `registerUploadedTenantDocumentCommand` (wired from ERP upload route) |
| Persistence | `@afenda/feature-system-admin` command wraps `registerTenantDocument`; download read still in object-storage handler (inject port when splitting `@afenda/db`) |
| Access | Prefer `access: 'private'` for tenant attachments; signed download routes for reads |
| Import law | Features use `@afenda/object-storage/client` or `/server` — never provider SDKs |

### 10.3 Edge Config (optional)

Use [Edge Config](https://vercel.com/docs/edge-config) for **global, non-tenant** flags: maintenance mode, feature kill-switches, integration endpoint allowlists. Not for per-org settings (those stay in Postgres + System Admin).

```ts
import { get } from "@vercel/edge-config";

const maintenance = await get<boolean>("maintenanceMode");
```

Provision `EDGE_CONFIG` connection string in Vercel project env. Reads are edge-fast; writes go through Vercel API/dashboard — not hot paths.

### 10.4 Observability and drains

| Surface | Role |
| ------- | ---- |
| Vercel Analytics | Product traffic (RUM) — enable in project |
| Speed Insights | Core Web Vitals — **ARCH-1003** §13 |
| Runtime logs | `vercel logs --environment production --since 5m --level error` |
| `@afenda/observability` | App structured logging + correlation IDs |
| `/api/observability/drain` | Custom ingest — validate `VERCEL_DRAIN_SECRET` (same pattern as cron) |

[Vercel Drains](https://vercel.com/docs/drains) forward platform telemetry to external SIEMs. Configure in project **Settings → Drains**:

| Drain type | Forwards |
| ---------- | -------- |
| `logs` | Function stdout/stderr |
| `traces` | OpenTelemetry-style traces |
| `speed-insights` | Web Vitals events |
| `analytics` | RUM page views |

Test a destination with `POST /v1/drains/test` before enabling production drains. Do not log secrets, raw tokens, or full PII in function stdout — use `requestId` and hashed `organizationId`.

---

## 11. Machine layer (Lynx / Knowledge)

Automation packages today — target consolidation in `packages/machine` (**ARCH-1001**, **ARCH-1002** §6).

| Package | Role |
| ------- | ---- |
| `@afenda/feature-knowledge` | pgvector, chunks, embeddings substrate |
| `@afenda/feature-lynx` | Truth retrieval, operator UI — composes knowledge |
| `@afenda/ai` | Substrate-blind tools — transitional |

HTTP: `app/api/internal/v1/lynx/*`, `app/api/internal/v1/ai/*` only — flat `/api/lynx/*` is **non-compliant** (**ARCH-1004** §5, §7).

User-facing brand: **Lynx** — not "AI assistant", "copilot", "chatbot".

Lynx mutating tools use same command path as humans after approval (**ARCH-1002**).

Detail: package AGENTS + `.cursor/rules/afenda-lynx-knowledge.mdc` until folded into **1006** or a Lynx supplement.

---

## 12. Verification commands

| Command | Guards |
| ------- | ------ |
| `pnpm architecture:check` | Layout, exports, turbo, UI boundary, doc placement, kernel boundary |
| `pnpm kernel:check` | Kernel must not import features |
| `pnpm lint:governed-renderers` | Renderer registry parity |
| `pnpm artifacts:check` | Output under `.artifacts/` only |
| `pnpm db:generate` / `pnpm db:migrate` | Schema workflow |
| `pnpm security:review` | Auth, cron, uploads, tenancy |

CI (typical): install → artifacts:init → typecheck → **architecture:check** → lint:governed-renderers → test → build.

---

## 13. Adding a new package (checklist)

| Step | Action |
| ---- | ------ |
| 1 | Choose category (§5) |
| 2 | Add to `pnpm-workspace.yaml` path |
| 3 | `package.json` name + `workspace:*` deps |
| 4 | If library: `tsconfig.build.json`, `build` script, `dist` exports |
| 5 | If feature: four doors + `pnpm scaffold:feature` |
| 6 | Add to `afendaTranspilePackages` in `@afenda/config` if app imports it |
| 7 | Update `check-directory-architecture.mts` if new category |
| 8 | Update this doc if policy changes |

Do not add `apps/backend`, `services/`, or nested feature `package.json` without ADR.

---

## 14. Legacy → this doc

| Legacy | Topic |
| ------ | ----- |
| **001** | Deploy, preview, Fluid Compute, Remote Cache, auth/AI/Blob/Edge → §2, §4.1, §9–§10 |
| **003** | Guards, categories, turbo, outputs → §4–§7, §12 |
| **004** | Naming, module IDs → §8 |
| **005** | Schema, migrations, growth → §9 |
| **008** | Package discipline, export doors → §5–§6 |
| **009** | Lynx/Knowledge placement → §11 |
| **016** §5–§6 | Monorepo tree, turbo, package roles → §3–§5 · **1002** §1–§2, §6 |

---

## 15. Summary

```txt
One Vercel project · preview envs + Neon integration (vercel install neon) · turbo + Remote Cache (after link)
Fluid Compute + attachDatabasePool + waitUntil · maxDuration on cron/AI/Lynx
AI Gateway: AI_GATEWAY_API_KEY locally, VERCEL_OIDC_TOKEN on Vercel · getVercelOidcToken for external APIs
Blob: @afenda/object-storage (vercel-blob | R2) · onBeforeGenerateToken auth · onUploadCompleted webhook (ngrok locally)
Guards: pnpm architecture:check · DB: db:generate → db:migrate
```

Business logic: **ARCH-1002**. Pages: **ARCH-1003**. HTTP: **ARCH-1004**.
