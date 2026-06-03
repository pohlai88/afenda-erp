# ERP auth (Phase 4)

Product auth UI, ingress chrome, forms, recovery flows, and Neon webhook side effects live in the ERP app — not in `@afenda/auth`.

| Path | Role |
| ---- | ---- |
| `ingress/` | Auth shell, page frame, guest guard, flow rail |
| `pages/` | RSC page composers for `(auth)` and `/account` |
| `forms/` | Client Neon SDK forms |
| `ui/` | Auth UI primitives |
| `dev/` | Dev cookie sign-in panel and server actions |
| `policy/` | Method readiness gates |
| `copy/` | Auth copy helpers |
| `recovery/` | Password reset client services |
| `contracts/` | ERP auth routes, action schemas, capability policy |
| `client.ts` | Browser door for forms + re-export `neonAuthClient` |
| `neon-webhook-bridge.server.ts` | Registers `onUserCreated` → `upsertUserProfile` |

## App wiring

```tsx
// apps/erp/src/app/(auth)/sign-in/page.tsx
export { default, metadata } from "@/auth/pages/auth.sign-in-page.server";
```

Session and tenant APIs remain on `@afenda/auth/server` until session extraction to a shared package.

## Verify

```bash
pnpm --filter @afenda/erp typecheck
pnpm --filter @afenda/auth test
```
