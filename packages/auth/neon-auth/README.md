# neon-auth

Canonical Neon Auth module for `@afenda/auth`.

**Staging:** `packages/auth/neon-auth/`  
**Promotion target:** `packages/auth/src/neon-auth/`

## Status

- Phase 1: directory scaffold (committed)
- Phase 2: fresh implementation per [Neon Next.js quickstart](https://neon.com/docs/auth/quick-start/nextjs-api-only.md) — **no legacy file migration**
- Legacy `packages/auth/src/` unchanged until promotion phase

## Public doors

| File | Export |
| ---- | ------ |
| `server.ts` | `@afenda/auth/server` (future) |
| `client.ts` | `@afenda/auth/client` (future) |
| `index.ts` | catalogs |

## ERP wiring (unchanged until promotion)

- `apps/erp/src/app/api/auth/[...path]/route.ts` — `getNeonAuthServer().handler()`
- `apps/erp/src/proxy.ts` — `auth.middleware({ loginUrl: "/sign-in" })`
- Webhook side effects: register via `registerNeonAuthWebhookHooks()` in ERP

See [TREE.md](./TREE.md) for full layout.
