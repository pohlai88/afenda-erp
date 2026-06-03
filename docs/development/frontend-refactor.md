# Vercel-Aligned Afenda Frontend Layout

## Summary

`apps/erp` **must** follow a scalable App Router layout that satisfies **ARCH-1003** first, then Vercel/Next.js 16 best practices. The app is a thin route and composition layer only; feature packages own business logic, page models, actions, metadata, and governed surfaces.

Deviations from the directory layout below are **non-compliant**, not deferred legacy. This doc is the required shape for `apps/erp/src/`; canonical frontend doctrine remains **ARCH-1003**. Neon Auth wiring detail: [`neon-auth.md`](./neon-auth.md).

The installed app uses Next.js `16.2.6`. Implementation uses App Router conventions, Server Components by default, low client boundaries, thin Route Handlers, `proxy.ts`, Cache Components only where tenant-safe, and lazy server client initialization.

## Required directory layout (MUST BE)

```txt
apps/erp/src/
  app/
    layout.tsx              # root metadata/viewport; theme + analytics
    page.tsx                  # session redirect only
    error.tsx
    global-error.tsx
    not-found.tsx
    app-root.config.ts        # Metadata + viewport exports
    app-root.copy.ts          # Root error/not-found copy
    app-root-error.ts         # Shared error digest formatter

    (auth)/
      layout.tsx              # noindex segment layout
      sign-in/page.tsx
      sign-up/page.tsx
      verify-email/page.tsx
      forgot-password/page.tsx
      reset-password/page.tsx
      not-found.tsx
      loading.tsx
      error.tsx

    (workspace)/
      layout.tsx
      loading.tsx
      error.tsx
      not-found.tsx
      dashboard/page.tsx
      knowledge/page.tsx
      lynx/...
      [moduleId]/...
      playground/metadata-renderer-gallery/page.tsx

    onboarding/
      page.tsx
      loading.tsx
      error.tsx

    interface-lab/
      layout.tsx
      primitives/page.tsx

    api/
      auth/[...path]/route.ts
      internal/v1/.../route.ts
      public/v1/.../route.ts

  routes/
    onboarding/
    workspace/
      shell/
      dashboard/
      modules/
      lynx/
      knowledge/
      shared/

  section-adapters/
    hr/
    system-admin/

  app-route-state/
  app-env/
  app-cron/
  contracts/
  proxy.ts
```

| Path | MUST BE | Wrong |
| ---- | ------- | ----- |
| `app/**/page.tsx` | Thin delegate to `routes/**` or `@/auth/pages/*` | Domain logic, Drizzle, large JSX |
| `routes/**` | RSC composers: `Promise.all`, Suspense, governed sections | Raw SQL, business rules, `@afenda/db` |
| `apps/erp/src/auth/` | ERP auth ingress, forms, dev panel, webhook bridge | Business rules, tenant provisioning |
| `packages/neon-auth/` | Neon Auth SDK module (`@afenda/neon-auth`) | ERP UI, tenant session |
| `section-adapters/**` | Thin section ID → feature server entry | Cross-module workflows, domain rules |
| `app/**` (non-route) | Next.js convention files only | Auth forms, shell panels, upload UI |
| `lib/` | Shrink toward zero — shared transport helpers only | Module logic, section registries, fat adapters |
| `workspace-routes/` | **Must not exist** — use `routes/**` | Legacy composer folder |

HR-specific nested pages under `[moduleId]/` (e.g. `compensation-planning/`, `lms/`) remain until a separate route consolidation pass; they do not change the required top-level layout above.

## Neon Auth surfaces (complete ERP coverage)

Catalog source of truth: `packages/auth/src/contracts/auth.flows.ts` (`@afenda/auth/auth-flows`). Detail: [`neon-auth.md`](./neon-auth.md).

| ERP route | Composer | Neon SDK flow | Status |
| --------- | -------- | ------------- | ------ |
| `/sign-in` | `@/auth/pages/auth.sign-in-page.server` | `signIn.email`, `signIn.social`, `signIn.magicLink`, `signIn.emailOtp` | Done |
| `/sign-up` | `@/auth/pages/auth.sign-up-page.server` | `signUp.email` → `/verify-email` | Done |
| `/verify-email` | `@/auth/pages/auth.verify-email-page.server` | `emailOtp.sendVerificationOtp`, `emailOtp.verifyEmail` | Done |
| `/forgot-password` | `@/auth/pages/auth.forgot-password-page.server` | `forgetPassword.email`, `forgetPassword.emailOtp` | Done |
| `/reset-password` | `@/auth/pages/auth.reset-password-page.server` | `resetPassword` (email link token) | Done |
| `/account` | `@/auth/pages/auth.account-page.server` | `updateUser`, `changePassword` | Done |
| `/onboarding` | `routes/onboarding/*` | Session + `@afenda/db` tenant org | Done |
| `/api/auth/*` | `app/api/auth/[...path]/route.ts` | `getNeonAuthServer().handler()` | Done |
| Webhooks | `api/internal/v1/webhooks/neon-auth` | `user.before_create`, `user.created` | Done |
| Sign out | `@afenda/auth/server` | `signOut` + dev cookie clear | Done |

**Deferred:** extra OAuth providers, Neon Organization plugin, Neon admin APIs, phone/SMS (`send.otp` webhook), custom `send.magic_link` delivery.

**UI gate:** `isNeonAuthUiReady()` = server `AFENDA_NEON_AUTH_ENABLED` + `NEXT_PUBLIC_AFENDA_NEON_AUTH_ENABLED` (unset public flag follows server).

**`packages/auth` exports:** `.`, `./client`, `./server`, `./neon-auth-server`, `./neon-session`, `./neon-cookies`, `./auth-flows` — session + shim re-exports of `@afenda/neon-auth`. ERP auth UI: `@/auth/*` in `apps/erp`.

## Key patterns

- `app/**` contains only Next.js route convention files. Pages delegate to `routes/**` composers or `@afenda/auth/ingress/*` for auth.
- `(auth)/layout.tsx` is an app segment layout (`connection()`, `robots: noindex`, `unstable_instant = false`); auth pages delegate to `@/auth/pages/*`.
- Server Components are default. Client Components stay at leaf files ending in `.client.tsx` or under `packages/auth/src/client/components/`.
- Server Actions live in dedicated `.server.ts` action files, authenticate/authorize first, parse input, dispatch commands, then use narrow `updateTag`, `revalidateTag(tag, "max")`, or `revalidatePath`.
- Route Handlers are only for ARCH-1004 HTTP surfaces: external APIs, webhooks, cron, uploads, streaming. They stay thin and import feature `./server` doors only.
- Workspace pages never self-fetch `/api/...`; reads go RSC → read model → repository in-process.
- `proxy.ts` remains lightweight session/traffic handling only. Authorization must be repeated in RSC, Server Actions, and Route Handlers.
- Server SDKs and DB clients must use lazy getters. Preserve `@afenda/db` `getDb()` and audit Stripe, AI, storage, email, and notification clients during moves.
- Cache Components are allowed only for shared reference/static data. Tenant-scoped dashboards, list windows, capabilities, and per-org KPIs stay dynamic.
- Root `layout.tsx` exports `metadata: Metadata` and `viewport: Viewport` explicitly (Next.js TS plugin). Config lives in `app-root.config.ts`.

## Compliance checklist

| Item | Status |
| ---- | ------ |
| `routes/**` grouped by `onboarding`, `workspace/{shell,dashboard,modules,lynx,knowledge,shared}` | Done |
| Auth in `@afenda/auth/{ingress,client}`; `(auth)/**/page.tsx` thin re-exports to `./ingress/*` | Done |
| Neon Auth: sign-in (passwordless), sign-up, verify-email, forgot-password, account, API proxy, webhooks, sign-out | Done |
| `(auth)/layout.tsx` with `robots: noindex` | Done |
| App root: `app-root.config.ts`, typed metadata/viewport, global-error with `globals.css` | Done |
| `[moduleId]/[...section]/page.tsx` delegates to `routes/workspace/modules/*` | Done |
| `lib/*-sections` moved to `section-adapters/{hr,system-admin}` | Done |
| Shrink `apps/erp/src/lib` — module logic to features, transport helpers to `routes/**/shared` or `app-env` | In progress |
| Imports: feature public doors only; no deep `src` imports; client files on `./client` exports | Ongoing |
| New feature deps in both `apps/erp/package.json` and `afendaTranspilePackages` | Ongoing |
| Sync **ARCH-1003** §2, `AGENTS.md`, `afenda-erp-app` rule: `workspace-routes/` → `routes/**` | Pending |

## Validation

- `pnpm --filter @afenda/erp typecheck`
- `pnpm --filter @afenda/auth test`
- `pnpm --filter @afenda/feature-hr-suite typecheck`
- `pnpm --filter @afenda/feature-system-admin typecheck`
- `pnpm env:verify:neon-auth` when Neon is enabled
- `pnpm architecture:check`
- `pnpm lint:governed-renderers` if governed metadata/renderers change
- Targeted Playwright: `pnpm test:e2e:neon` (Neon smoke), plus dashboard + one HR + one system-admin section

## Assumptions

- No URL changes beyond adding `/verify-email` for email verification completion.
- No REST API shape changes are intended.
- Existing HR-specific nested pages under `[moduleId]` remain until a separate route consolidation pass.
- Neon MCP (`get_neon_auth_config`, `configure_neon_auth`) is operator-driven for branch OAuth/trusted origins — not invoked by CI.
