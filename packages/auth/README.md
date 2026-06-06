# @afenda/auth

Neon Auth SDK module (`@neondatabase/auth@0.4.1-beta`) + **Neon Auth UI** (`@neondatabase/auth-ui@0.2.0-beta`). Default surfaces use `@neondatabase/auth-ui` (`AuthView`, `NeonAuthUIProvider`) — not custom Afenda forms.

Sources: [Neon Next.js quickstart](https://neon.com/docs/auth/quick-start/nextjs-api-only), [UI components](https://neon.com/docs/auth/reference/ui-components), [Server SDK reference](https://neon.com/docs/auth/reference/nextjs-server).

## Public doors

| Import | Neon equivalent |
| ------ | --------------- |
| `@afenda/auth/server` | `createNeonAuth` / `auth` |
| `@afenda/auth/client` | `createAuthClient` / `authClient` |
| `@afenda/auth/neon-auth/ui` | `NeonAuthUIProvider`, `AuthView`, `NeonAuthUiLayout` |
| `@afenda/auth/neon-auth/pages` | `NeonAuthSignInPage`, route maps, page gate |
| `@afenda/auth/neon-auth/server` | explicit server subpath |
| `@afenda/auth/neon-auth/client` | explicit client subpath |

ERP wiring (`auth.handler()`, `auth.middleware()`, App Router pages) stays in **apps/erp** until explicitly requested. See [`src/tree.md`](src/tree.md) for the end-to-end checklist.

## Verify

```bash
pnpm --filter @afenda/auth typecheck
pnpm --filter @afenda/auth test
```
