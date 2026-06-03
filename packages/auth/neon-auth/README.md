# neon-auth (scaffold)

**Status:** Git review scaffold — placeholder `.ts` files materialized. No runtime implementation yet.

See also: [TREE.md](./TREE.md) (full tree + migration map).

Staging path: `packages/auth/neon-auth/`  
Promotion target: `packages/auth/src/neon-auth/` (sole child of `packages/auth/src/` after migration)

Plan: [neon-auth_module_layout_28c930ef.plan.md](file:///c:/Users/dlbja/.cursor/plans/neon-auth_module_layout_28c930ef.plan.md)

## Layout

```
neon-auth/
├── server.ts              @afenda/auth/server
├── client.ts              @afenda/auth/client
├── index.ts               @afenda/auth (catalogs)
├── runtime/               SDK singleton, session, cookies
├── security/              JWT + webhook signature verification
├── contracts/             Shared catalogs and env contract
├── plugins/               One folder per Neon Auth plugin or flow
├── webhooks/              Platform webhook handler + hooks registry
└── tests/
```

## Plugin folders

| Folder | Neon surface | Migrate from |
| ------ | ------------ | ------------ |
| `email-password/` | `signIn.email`, `signUp.email` | core auth methods (not a plugin toggle) |
| `email-otp/` | `emailOtp.*`, `signIn.emailOtp` | `src/contracts/auth.neon-email-otp.ts` |
| `magic-link/` | `signIn.magicLink` | `src/contracts/auth.neon-magic-link.ts` |
| `oauth/` | `signIn.social` | OAuth guides |
| `recovery/` | `forgetPassword.*`, `emailOtp.resetPassword` | `src/recovery/auth-recovery-adapter.client.ts` |
| `account/` | `updateUser`, `changePassword`, `resetPassword` | user management guide |
| `jwt/` | access JWT / Bearer (deferred in UI) | `src/contracts/auth.neon-jwt.ts` |
| `admin/` | `admin.*` (deferred) | `src/contracts/auth.neon-admin.ts` |
| `organization/` | unused — Afenda tenancy in `@afenda/db` | `src/contracts/auth.neon-organization.ts` |
| `phone-number/` | deferred until SMS webhook | `src/contracts/auth.neon-phone-number.ts` |

## Stays outside this module

- `apps/erp/src/app/api/auth/[...path]/route.ts` — `auth.handler()` proxy
- `apps/erp/src/proxy.ts` — `auth.middleware()`
- `apps/erp/src/auth/` — ingress, forms, session/tenant, dev bypass (Phase 4)

## Next steps

1. Migrate implementation from `packages/auth/src/neon/` and contracts
2. Promote tree to `packages/auth/src/neon-auth/`
3. Delete legacy `packages/auth/src/*`
4. Rewire `@afenda/auth` package exports
