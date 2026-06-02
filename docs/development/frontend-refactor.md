# Vercel-Aligned Afenda Frontend Refactor Plan

## Summary

Refactor `apps/erp` into a scalable App Router structure that follows Afenda `ARCH-1003` first, then Vercel/Next.js 16 best practices. The app should stay a thin route and composition layer; feature packages own business logic, page models, actions, metadata, and governed surfaces.

The installed app uses Next.js `16.2.6`; implementation should use App Router conventions, Server Components by default, low client boundaries, thin Route Handlers, `proxy.ts`, Cache Components only where tenant-safe, and lazy server client initialization.

## Target Directory Tree

```txt
apps/erp/src/
  app/
    layout.tsx
    page.tsx
    error.tsx
    global-error.tsx
    not-found.tsx

    (auth)/
      layout.tsx
      sign-in/page.tsx
      sign-up/page.tsx
      forgot-password/page.tsx
      loading.tsx
      error.tsx

    (workspace)/
      layout.tsx
      loading.tsx
      error.tsx
      not-found.tsx
      dashboard/page.tsx
      knowledge/page.tsx
      lynx/
        page.tsx
        runs/page.tsx
        runs/[runId]/page.tsx
        workflows/page.tsx
        workflows/[workflowSessionId]/page.tsx
      [moduleId]/
        layout.tsx
        page.tsx
        [...section]/page.tsx
        records/[recordId]/page.tsx
        work-items/[workItemId]/page.tsx

    onboarding/
      page.tsx
      loading.tsx
      error.tsx

    playground/
      metadata-renderer-gallery/page.tsx

    interface-lab/
      layout.tsx
      primitives/page.tsx

    api/
      auth/[...path]/route.ts
      internal/v1/.../route.ts
      public/v1/.../route.ts

  routes/
    auth/
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

## Key Patterns

- `app/**` contains only Next.js route convention files. Pages delegate immediately to `routes/**` composers.
- Server Components are default. Client Components stay at leaf files ending in `.client.tsx`.
- Server Actions live in dedicated `.server.ts` action files, authenticate/authorize first, parse input, dispatch commands, then use narrow `updateTag`, `revalidateTag(tag, "max")`, or `revalidatePath`.
- Route Handlers are only for ARCH-1004 HTTP surfaces: external APIs, webhooks, cron, uploads, streaming. They stay thin and import feature `./server` doors only.
- Workspace pages never self-fetch `/api/...`; reads go RSC -> read model -> repository in-process.
- `proxy.ts` remains lightweight session/traffic handling only. Authorization must be repeated in RSC, Server Actions, and Route Handlers.
- Server SDKs and DB clients must use lazy getters. Preserve `@afenda/db` `getDb()` and audit Stripe, AI, storage, email, and notification clients during moves.
- Cache Components are allowed only for shared reference/static data. Tenant-scoped dashboards, list windows, capabilities, and per-org KPIs stay dynamic.

## Refactor Steps

1. Create `apps/erp/src/routes/**` and move current `workspace-routes` files into grouped route families: `shell`, `dashboard`, `modules`, `lynx`, `knowledge`, `shared`.
2. Move auth and onboarding non-route code out of `app/` into `routes/auth` and `routes/onboarding`.
3. Extract `[moduleId]/[...section]/page.tsx` branching into `routes/workspace/modules/module-section-route.server.tsx`; leave the page as a thin delegate.
4. Move `lib/hr-sections` and `lib/system-admin-sections` to `section-adapters/{hr,system-admin}` as temporary app adapters. Longer term, push registry knowledge into `@afenda/feature-hr-suite/metadata` and `@afenda/feature-system-admin/metadata`.
5. Remove or shrink `apps/erp/src/lib`; module-specific logic moves to feature packages, shared app transport helpers move to `routes/**/shared` or `app-env`.
6. Normalize imports: app code uses feature public doors only, avoids deep `src` imports, and keeps client files on `./client` exports.
7. Keep `packages/config/src/next.ts` as the single Next config factory. Any new feature package dependency must be added to both `apps/erp/package.json` and `afendaTranspilePackages`.

## Validation

- `pnpm --filter @afenda/erp typecheck`
- `pnpm --filter @afenda/feature-hr-suite typecheck`
- `pnpm --filter @afenda/feature-system-admin typecheck`
- `pnpm architecture:check`
- `pnpm lint:governed-renderers` if governed metadata/renderers change
- Targeted Playwright smoke for changed workspace routes: dashboard, one HR section, one system-admin section, Lynx

## Assumptions

- No URL changes are intended.
- No REST API shape changes are intended.
- Existing HR-specific nested pages under `[moduleId]` remain until a separate route consolidation pass.
- `next-devtools init` should be called before implementation if the MCP tool is available; it was not exposed in this planning session.
