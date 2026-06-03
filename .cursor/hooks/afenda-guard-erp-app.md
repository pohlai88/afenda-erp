# GUARD 2 — `apps/erp/src/app/` layout

**Run first (with GUARD 1):** `pnpm guard:erp-app` or `pnpm guard:erp`

On failure the script prints:

```text
[guard:erp-app] GUARD 2 FAILED
FUCK, READ the RULES!!
```

---

## Allowed top-level under `apps/erp/src/app/`

### Directories (exactly these four)

| Directory | Purpose |
| --------- | ------- |
| `(auth)/` | Sign-in, sign-up, account, Neon Auth UI |
| `(workspace)/` | Authenticated ERP shell + module URLs |
| `api/` | Route handlers (`internal/v1`, `public/v1`, `auth`) |
| `onboarding/` | Post-auth workspace setup |

No other top-level folders. Not `dashboard/`, not `lynx/` at app root, not `lib/`, not `(marketing)/`.

### Root files (Next.js app shell only)

| File | Purpose |
| ---- | ------- |
| `page.tsx` | `/` landing |
| `layout.tsx` | Root layout |
| `loading.tsx` | Root loading UI |
| `error.tsx` | Root error boundary |
| `global-error.tsx` | Global error boundary |
| `not-found.tsx` | Root 404 |
| `template.tsx` | Root template (if used) |
| `default.tsx` | Parallel route default (if used) |
| `forbidden.tsx` | Root 403 (if used) |
| `unauthorized.tsx` | Root 401 (if used) |
| `globals.css` | Global styles |
| `favicon.ico` | Favicon |

No other top-level files. No `middleware.ts` here (use `src/proxy.ts`). No random components, hooks, or helpers.

---

## Where forbidden stuff goes

| Was going in… | Put it in… |
| ------------- | ---------- |
| Route composers / page models | `apps/erp/src/routes/` (flat) |
| Cron helpers, contracts, dev utils | `apps/erp/src/kitchen-sinks/` (flat) |
| Shared UI | `packages/ui/` |
| Domain logic | `packages/features/*/` |

---

## Check order (ERP app)

```bash
pnpm guard:erp          # GUARD 1 + GUARD 2 — layout, always first
pnpm --filter @afenda/erp lint
pnpm --filter @afenda/erp typecheck
```

Or: `pnpm verify:erp`

---

## Enforcement

| Layer | What |
| ----- | ---- |
| `scripts/guard-erp-app-layout.mts` | CI + local script, exit 1 + **FUCK, READ the RULES!!** |
| `.cursor/hooks/guard-erp-app-layout.mjs` | Blocks agent writes that violate layout |
| `@afenda/erp` `lint` / `typecheck` | Runs `guard:erp` before eslint/tsc |

---

## Related

- **GUARD 1:** `apps/erp/src/` — only `app/`, `routes/`, `kitchen-sinks/`, `instrumentation.ts`, `proxy.ts` → `.cursor/hooks/afenda-architecture-routing.md`
- **Route ownership rule:** `.cursor/rules/afenda-erp-app.mdc`
