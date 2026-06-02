# ARCH-1003 · Frontend

**Doc ID:** `ARCH-1003` · **File:** `1003-frontend.md`

| Field | Value |
| ----- | ----- |
| Status | **Live** (Jun 2026) |
| Layer | Frontend — Next.js App Router, RSC, AppShell, governed UI |
| Defers to | **ARCH-1001** · **ARCH-1002** (backend) · **ARCH-1004** (HTTP boundary) |

Former **ARCH-006**, **ARCH-007**, **ARCH-013**, and **ARCH-015**.

---

## 1. Core rule

Frontend = **`apps/erp`** + **`@afenda/appshell`**, **`@afenda/governed-surface`**, **`@afenda/ui`**. It renders pages — **not** business rules.

```txt
Browser ERP  →  RSC / Server Action (transport)  →  in-process backend
Partner/cron →  HTTP (**ARCH-1004**)               →  same commands / read models
```

**Hard rule:** workspace pages do **not** `fetch('/api/internal/...')` or `fetch('/api/public/...')` for normal reads/writes.

| **1004 plane** | External (HTTP) | Internal (this doc) |
| -------------- | --------------- | ------------------- |
| Resource | `GET/POST/PATCH …/resources` | Server query → read model → repository |
| Command | `POST …/commands/…` | `dispatchCommand` via Server Action |
| Query | `GET …/queries/…` | Same read-model function in-process |
| Event | `GET …/events` | Audit/projections read event store in-process |

HTTP exceptions (Route Handlers — not page self-fetch): `api/internal/v1/ai/*`, `api/internal/v1/lynx/*`, `api/internal/v1/uploads`, `api/documents/*/download`, `api/auth/*`.

Mutation authority is the **command** — Server Actions own transport only (FormData, `ActionResult`, revalidation). Detail: **ARCH-1002** §2.

---

## 2. App layout and routes

```txt
apps/erp/src/
  app/(auth)/           sign-in — no shell
  app/(workspace)/      AppShell layout + thin pages
  app/onboarding/       pre-tenant
  app/api/              HTTP only — ARCH-1004
  app/playground/       governed fixtures — no tenant data
  app/interface-lab/    @afenda/ui lab
  workspace-routes/     *.server.tsx composers
  lib/*-sections/       section ID → feature server entry
  proxy.ts              session refresh — not auth alone
```

| Path | Allowed | Forbidden |
| ---- | ------- | --------- |
| `app/**/page.tsx` | Delegate to `workspace-routes` (few lines) | Domain logic, Drizzle, large JSX |
| `workspace-routes/` | `Promise.all`, Suspense, governed sections | Raw SQL, business rules |
| `lib/*-sections/` | Thin adapters to `@afenda/feature-*` | Cross-module workflows |

Route groups `(auth)` / `(workspace)` do not appear in URLs. Module IDs: **ARCH-1005** §8.

```txt
(auth)/sign-in  →  /sign-in
(workspace)/dashboard, /[moduleId]/…, /lynx/…
```

| Group | Shell | Data |
| ----- | ----- | ---- |
| `(auth)` | Auth layout | Minimal |
| `(workspace)` | `@afenda/appshell` + Suspense | Server queries + capabilities |
| Dev routes | Plain layout | Fixtures only |

---

## 3. Read path

```txt
page.tsx → workspace-routes/<route>.server.tsx
→ session + organizationId (@afenda/auth)
→ read capability
→ server query (feature data/*.queries.ts)
→ read model (page DTO — not raw entity)
→ repository
→ governed builder → GovernedPattern* → RSC (windowed rows)
```

```txt
Server query  →  read model  →  repository     ✓
Server query  →  repository                   ✗ joins leak into routes
RSC           →  fetch('/api/...')           ✗
```

| Concept | Layer |
| ------- | ----- |
| Domain entity | `domain/` + repository |
| Page shape | **Read model** (`read-models/` or `data/`) |
| External query API | Same read-model function as RSC (**1004** §2) |

**Cross-module** (dashboard, Nexus): **`packages/projections`** — not 20 feature imports in one route (**1002** §3).

**Lists:** server window + opaque cursor in URL — never full tables to the client.

### Same-request performance

| Do | Don't |
| -- | ----- |
| Start independent work, then `Promise.all` | Sequential `await` when independent |
| `React.cache()` for actor, org, nav DTOs | `cache()` on tenant list windows |
| Suspense on slow sections | One chain blocking whole page |
| ISO strings / nested DTOs to client leaves | Drizzle graphs, functions across boundary |

```ts
import { cache } from "react";

export const getWorkspaceActor = cache(async () => resolveActorFromSession());
```

---

## 4. Write path

```txt
form / governed action
→ "use server" — parse FormData / Zod only
→ dispatchCommand(same type as REST)
→ kernel → domain → db → event
→ ActionResult + revalidatePath / updateTag / revalidateTag
```

```ts
"use server";

export async function approvePurchaseOrderAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireWorkspaceActor();
  await dispatchCommand(new ApprovePurchaseOrderCommand({
    actor: ctx.actor,
    organizationId: ctx.organizationId,
    input: parseApprovePoForm(formData),
  }));
  revalidatePath("/purchasing");
  revalidateTag("purchasing.purchase-orders.list");
  return { ok: true };
}
```

| Concern | UI (`ActionResult`) | REST (**1004** §4) |
| ------- | ------------------- | ------------------- |
| Success | `ok: true` | `{ data, meta }` |
| Validation | `fieldErrors` | `error.details` |
| Permission | `ok: false`, `code` | `PERMISSION_DENIED` |

Rules: `requireWorkspaceActor()` first; Zod → `fieldErrors` (don't throw for expected failures); idempotency in command layer; actions in `feature/*/actions/`. Do not duplicate mutation logic in action **and** route handler.

**After writes:** audit/activity feeds prefer **event store / projections** — not ad hoc re-query of raw tables. Object uploads: `@afenda/object-storage` with auth before token mint (**1005** §10.2).

---

## 5. Server vs client

| Default | Use for |
| ------- | ------- |
| **Server Component** | Pages, layouts, governed sections, data |
| **Client Component** | Palette, dropdowns, grid UX, uploads, charts, form pending, Lynx stream |

`"use client"` at the **leaf** only. No `@afenda/db`, `@afenda/auth/server`, or deep `domain/` in client code — use `@afenda/feature-*/client`.

---

## 6. Governed UI

**Metadata = intent. Server = authority.** Not low-code. Not tenant JSON → JSX.

```txt
Server (session, org, capabilities, windows)  →  authority
Metadata (columns, profiles, actions)          →  intent
@governed-surface                              →  builders + renderers
@afenda/ui                                     →  primitives only
```

```txt
RSC → server query → builder → resolve presentation → renderer → @afenda/ui
```

| Pattern | Use |
| ------- | --- |
| **Pattern C list** | Module lists, queues — `GovernedPatternCListSection` + server window |
| **Pattern B** | KPI / stat grids |
| **Pattern A** | Detail / form sections |

Row actions: `ActionDescriptor` → Server Action or `rowHref` — not client `PATCH` to REST. Section adapters: `lib/hr-sections/`, `lib/system-admin-sections/` → feature packages — not second domain layers.

Renderer file detail: `packages/governed-surface/src/metadata/` + `pnpm lint:governed-renderers`.

---

## 7. AppShell

```txt
(workspace)/layout.tsx
  Suspense → workspace-appshell.server.tsx → @afenda/appshell
  children → page Suspense / loading
```

Shell gets **DTOs** (nav, utility bar, org switcher data) — **no DB, no REST, no tenant list fetch**. ⌘K palette: client UI; mutations via Server Action or navigation. Desktop/tablet default; mobile is a separate pass.

```bash
pnpm --filter @afenda/appshell typecheck && pnpm --filter @afenda/appshell test
```

---

## 8. Loading, auth, BotID

| File | Role |
| ---- | ---- |
| `(workspace)/layout.tsx` | Shell Suspense |
| `(workspace)/loading.tsx` | Page fallback — layout stays mounted |
| `error.tsx` / `not-found.tsx` | Safe messages — no stack traces |

Tenant routes: dynamic per request — no `revalidate = 60` on org dashboards.

```txt
proxy.ts        session refresh
layout / page   resolve actor + organizationId
Server Action   re-check write capability
RSC read        re-check read capability
```

Never trust client `organizationId`. **BotID** on anonymous/high-risk POST only: `withBotId` in `next.config`, `<BotIdClient protect={[…]} />`, `checkBotId()` in action/handler — [Vercel BotID](https://vercel.com/docs/botid). Tenant workspace behind Neon Auth rarely needs it.

---

## 9. Caching

`cacheComponents: true` via `@afenda/config` — [Runtime Cache](https://vercel.com/docs/caching/runtime-cache).

| May cache | Must not cache |
| --------- | -------------- |
| Global reference (`'use cache'` + `cacheTag`) | Tenant list windows |
| External HTTP (`'use cache: remote'`) | Per-org KPIs, capability outcomes |
| | `listEmployeesForPage` or any org-scoped query |

**After mutation:**

| API | Where | Use |
| --- | ----- | --- |
| `updateTag` | Server Actions only | Read-your-own-writes after create → redirect |
| `revalidateTag(tag, "max")` | Actions or handlers | Shared reference data SWR |
| `revalidatePath(path, 'page')` | Server Actions | Narrow module route |

Not `revalidatePath('/')`. Mixed cached + dynamic pages: `<Suspense>` + `connection()` in dynamic child. Public API CDN: **1004** §6.

---

## 10. Special surfaces

| Surface | Pattern |
| ------- | ------- |
| `/lynx` | RSC + client stream; `api/ai/*`; tools → commands after approval |
| System Admin | `[moduleId]` + section adapters |
| Onboarding | Pre-tenant; no shell |
| Playground / interface-lab | No AppShell; no tenant API |

---

## 11. Non-compliance (wrong patterns)

| Pattern | Required |
| ------- | -------- |
| Page reads without `read-models/` | `workspace-routes` → feature `read-models/` |
| Mutations bypassing commands | Server Action → same `commands/` as HTTP |
| Workspace `fetch('/api/…')` for CRUD | In-process server query |
| Cross-module Nexus via N feature imports | `packages/projections` |
| Serial RSC fetches where parallel is safe | `Promise.all` + `React.cache` per §9 |
| Server Action input ≠ REST command | Same command types (**ARCH-1002** §3) |
| `'use cache'` on tenant lists | Dynamic org-scoped reads only |

---

## 12. Anti-patterns

| Don't | Why |
| ----- | --- |
| `fetch('/api/...')` for page data | Server query in-process |
| Server Action as mutation authority | Command is authority |
| Skip read model | Query → read model → repository |
| Nexus imports 20 feature queries | Use projection |
| Business rules in `page.tsx` | Feature domain |
| Server Action `fetch` to own API | `dispatchCommand` |
| Client imports `@afenda/db` | Tenancy leak |
| Full list in RSC props | Server window |
| AppShell fetches tenant data | Chrome only |
| `'use cache: remote'` on tenant lists | Dynamic per org |
| Audit without domain event | Event store (**1002** §4) |

---

## 13. Route review checklist

```txt
[ ] Independent queries via Promise.all
[ ] Actor/org via React.cache once
[ ] Slow sections in Suspense
[ ] No self-fetch to /api for page data
[ ] Actions revalidate minimal path + tags
[ ] Governed lists use server window
[ ] Client islands get small DTOs only
```

Platform detail (images, Web Vitals, Fluid Compute): **ARCH-1005** §2, §10.

---

## 14. Verification

```bash
pnpm --filter @afenda/erp typecheck
pnpm --filter @afenda/governed-surface test
pnpm lint:governed-renderers    # renderers / builders
pnpm architecture:check
```

---

## 15. Summary

```txt
Frontend = apps/erp + appshell + governed-surface + ui

Reads:   RSC → server query → read model → repository
Writes:  form → Server Action (transport) → command → backend
Cross:   projections — not query fan-out
Cache:   updateTag in actions · no tenant list cache
Never:   workspace fetch to /api for ERP data
UI:      metadata intent + server authority + governed renderers

Backend: ARCH-1002 · API: ARCH-1004 · Platform: ARCH-1005
```
