# neon-auth

Canonical Neon Auth module for `@afenda/auth`.

**Production:** `packages/auth/src/neon-auth/`

## Status

- Phase 1: directory scaffold (committed)
- Phase 2: fresh implementation per [Neon Next.js quickstart](https://neon.com/docs/auth/quick-start/nextjs-api-only.md)
- Phase 2.5: stabilization (typecheck, tests, catalog parity)
- Phase 3: promoted to `src/neon-auth/`; package exports wired

## Public doors

| File | Export |
| ---- | ------ |
| `server.ts` | `@afenda/auth/server` (future) |
| `client.ts` | `@afenda/auth/client` (future) |
| `index.ts` | catalogs |

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

See [TREE.md](./TREE.md) for full layout and [`docs/development/neon-auth.md`](../../docs/development/neon-auth.md) for Afenda-wide Neon Auth operations.
