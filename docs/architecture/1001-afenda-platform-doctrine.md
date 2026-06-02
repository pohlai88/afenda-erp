# ARCH-1001 · Afenda Constitution

**Doc ID:** `ARCH-1001` · **File:** `1001-afenda-platform-doctrine.md`

| Field | Value |
| ----- | ----- |
| Status | **Constitution** — supreme authority (Jun 2026) |
| Rule | Stop writing new architecture docs. **Ship code** against this. |

---

## 1. What Afenda is (technical)

Afenda ERP is **one Next.js 16 app** (`apps/erp`) on **one Vercel project**, backed by **Neon Postgres** and **Neon Auth**.

Three surfaces. **One deploy.** Not three repos.

| Surface | What it is | Where it lives |
| ------- | ---------- | -------------- |
| **Frontend** | Pages, layouts, RSC, Server Actions, AppShell, governed UI | `apps/erp`, `@afenda/appshell`, `@afenda/governed-surface` |
| **Backend** | Business logic, DB access, commands, events, read models | `packages/features/*`, `@afenda/kernel`, `@afenda/db`, `packages/events`, `packages/projections` |
| **API** | HTTP for partners, webhooks, cron, streams — **not** for ordinary ERP page loads | `apps/erp/app/api/{public,internal}/v1`, `@afenda/api` |

```txt
Same process. Same repo. Same database.

  Browser  →  Frontend (RSC / Server Action)  →  Backend (in-process function call)
  Partner  →  API (Route Handler)               →  Backend (same function call)
```

**Hard rule:** workspace pages do **not** `fetch('/api/internal/...')`. They import backend functions directly. API is for callers **outside** the page runtime.

Build: `pnpm turbo build --filter=@afenda/erp`.

**Rejected:** separate `apps/api`, microservices per module, business logic in `apps/erp/src/lib`.

---

## 2. How writes work

Every mutation — form submit, REST POST, webhook, cron job, Lynx tool — follows the same path:

```txt
1. Transport     Server Action · REST handler · webhook · cron · agent
2. Command       typed payload (ApprovePO, CreateEmployee, …)
3. Kernel        @afenda/kernel — auth check, audit envelope, workflow, idempotency
4. Domain        feature package service — business rules live HERE only
5. Repository    @afenda/db — SQL/Drizzle
6. Domain event  append to event store
```

```txt
Server Action and REST are two entry points. Same backend. Not two backends.
```

---

## 3. How reads work

```txt
Server Component  →  server query (feature package)  →  read model  →  repository  →  db
```

Not:

```txt
Server Component  →  fetch('/api/v1/employees')  →  …
```

Cross-module dashboards (Nexus, org health): **projection** in `packages/projections` — not 20 parallel feature queries from one page.

---

## 4. Event store (not a separate audit table per feature)

When something happens in the backend, write **one domain event**. Other systems **read** events — they do not each get their own write path.

```txt
domain service completes  →  domain event  →  event store (append-only)

Consumers (read-only on events):
  audit log · workflow engine · notifications · activity feed · Lynx context
```

Do not add a new `*_audit_log` table every time a feature needs history. Consume the event stream.

*(Product alias: “organizational truth” = accepted business state — approved PO, posted journal, released payroll. Commands change it. Events record the change. Read models/projections serve it to UI and API.)*

---

## 5. Package map

| Package / path | Layer | Job |
| -------------- | ----- | --- |
| `apps/erp` | Frontend + API entry | Routes, thin adapters, no business rules |
| `packages/features/<module>` | Backend | `commands/`, `domain/`, `data/`, `read-models/`, `events/`, `queries/`, `actions/` (thin) |
| `packages/kernel` | Backend | Auth envelope, audit, workflow gate |
| `packages/db` | Backend | Schema, repositories |
| `packages/api` | API | HTTP envelopes, handler helpers — no domain rules |
| `packages/events` | Backend | Publish + store access |
| `packages/projections` | Backend | Cross-module read surfaces |
| `packages/registry` | Backend | Command/API/event catalog |
| `packages/api` | Backend | HTTP handler kit (**ARCH-1004**) |
| `packages/machine` | Backend | Lynx, agents, tools (P5) — until then: `@afenda/ai`, `@afenda/feature-lynx` |
| `packages/appshell`, `governed-surface` | Frontend | Shell + metadata UI |
| `packages/auth`, `observability`, `object-storage`, `config` | Infrastructure | Pipes — Vercel deploy detail in **ARCH-1005** |

Scaffold new modules: `packages/_scaffold` (**feature** vs **platform** — see README).

Org ID: always from **server session**. Never trust client-supplied `organizationId`.

---

## 6. Architecture docs (6 total)

Details go in books — not in this file. Registered in [`README.md`](README.md).

| ID | File | Covers |
| -- | ---- | ------ |
| **ARCH-1001** | `1001-afenda-platform-doctrine.md` | This constitution |
| **ARCH-1002** | `1002-backend.md` | Commands, domain, events, features, kernel |
| **ARCH-1003** | `1003-frontend.md` | Next.js, RSC, AppShell, governed UI |
| **ARCH-1004** | `1004-api.md` | REST, webhooks, public/internal routes |
| **ARCH-1005** | `1005-infrastructure.md` | Monorepo, Vercel, DB, guards, naming |
| **ARCH-1006** | `1006-control-plane.md` | System Admin |

No ARCH-1007+ without amending this constitution.

---

## 7. Build order

| Phase | Ship |
| ----- | ---- |
| **P0** | Thin `apps/erp` — pages call feature packages, no fat adapters |
| **P1** | `packages/api` + `app/api/{public,internal}/v1` |
| **P2** | All mutations through command + kernel |
| **P3** | Event store, `packages/events`, read models, `packages/projections` |
| **P4** | `packages/registry`, System Admin |
| **P5** | Consolidate Lynx/agents into `packages/machine` |

Verify: `pnpm architecture:check`.

---

## 8. Authority

```txt
ARCH-1001  →  1002 (backend)  →  1003 / 1004  →  1005  →  1006  →  code
```

Backend vs frontend vs API disputes: **1002 / 1003 / 1004** respectively. Deploy and guards: **1005**.

---

## 9. Summary (read this if you read nothing else)

```txt
One Next.js app. Backend in packages. Frontend is RSC + AppShell. API is HTTP for external callers.

Writes:  transport → command → kernel → domain → db → event
Reads:   server query → read model → db   (no self-fetch to /api for pages)

Scaffolds: packages/_scaffold (feature vs platform) · ARCH-1001–1006
```
