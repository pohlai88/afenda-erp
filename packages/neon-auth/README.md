# @afenda/neon-auth

Canonical Neon Auth module for Afenda.

**Production:** `packages/neon-auth/`

## Status

- Phase 5: extracted as standalone workspace package `@afenda/neon-auth`

## Public doors

| Export | Module |
| ------ | ------ |
| `@afenda/neon-auth/server` | SDK runtime, JWT/webhook verify, session helpers |
| `@afenda/neon-auth/client` | Browser SDK + plugin clients |
| `@afenda/neon-auth` | Plugin catalogs + webhook contracts |
| `@afenda/neon-auth/paths` | Shared HTTP paths (webhook route) |

## Server surface

| Export | Role |
| ------ | ---- |
| `getNeonAuthServer()` / `auth` | Neon Next.js server SDK singleton |
| `signOutNeonSession()` | Server-side sign-out wrapper |
| `readNeonAuthSessionPayload()` | Typed session via SDK `getSession()` |
| `verifyNeonAuthAccessToken()` | Bearer JWT verification (JWKS) |
| `handleNeonAuthWebhookPost()` | Verified webhook ingress (injectable hooks) |
| `registerNeonAuthWebhookHooks()` | ERP registers `onUserCreated`, etc. |

## ERP wiring (unchanged until promotion)

- `apps/erp/src/app/api/auth/[...path]/route.ts` — `getNeonAuthServer().handler()`
- `apps/erp/src/proxy.ts` — `auth.middleware({ loginUrl: "/sign-in" })`
- Webhook side effects: register via `registerNeonAuthWebhookHooks()` in ERP

```typescript
registerNeonAuthWebhookHooks({
  onUserCreated: async (payload) => {
    // upsertUserProfile from @afenda/db
  },
});
```

## Environment

Documented in [`contracts/env.contract.ts`](./contracts/env.contract.ts). Optional webhook policy:

- `NEON_AUTH_WEBHOOK_BLOCKED_EMAIL_DOMAINS` — comma-separated signup blocklist for `user.before_create`

## Verify locally

```bash
pnpm --filter @afenda/auth typecheck
pnpm --filter @afenda/auth test
```

See [tree.md](./tree.md) for full layout and [`docs/development/neon-auth.md`](../../docs/development/neon-auth.md) for Afenda-wide Neon Auth operations.
