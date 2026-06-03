# ERP auth

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
| `client.ts` | Browser door for forms + re-export `@afenda/neon-auth/client` |
| `neon-webhook-bridge.server.ts` | Registers `onUserCreated` → `upsertUserProfile` |

## App wiring

```tsx
// apps/erp/src/app/(auth)/sign-in/page.tsx
export { default, metadata } from "@/auth/pages/auth.sign-in-page.server";
```

Neon runtime: `@afenda/neon-auth/server` and `@afenda/neon-auth/client`. Tenant session and capabilities: `@afenda/auth/server`.

## Verify

```bash
pnpm --filter @afenda/erp typecheck
pnpm --filter @afenda/neon-auth test
pnpm --filter @afenda/auth test
```
