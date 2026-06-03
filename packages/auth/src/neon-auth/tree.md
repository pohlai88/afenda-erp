# `@afenda/auth/neon-auth` tree

Neon Auth SDK + **Neon Auth UI** (`@neondatabase/auth-ui`) — default auth surfaces.

```
neon-auth/
├── contracts/          # env keys, flows, paths, UI catalog
├── runtime/            # createNeonAuth, createAuthClient, session, cookies
├── security/           # JWT + webhook verify
├── webhooks/           # handler, hooks, policy
├── plugins/            # Better Auth plugin catalogs + thin clients
├── ui/                 # NeonAuthUIProvider, layout, component re-exports, styles
├── pages/              # AuthView / AccountView page scaffolds for ERP wiring
└── tests/
```

## Public doors

| Import | Purpose |
| ------ | ------- |
| `@afenda/auth/neon-auth/server` | Server SDK |
| `@afenda/auth/neon-auth/client` | Browser client |
| `@afenda/auth/neon-auth/ui` | `NeonAuthUiProvider`, `NeonAuthUiLayout`, `AuthView`, … |
| `@afenda/auth/neon-auth/pages` | `NeonAuthSignInPage`, route maps, catch-all helper |

## ERP wiring (next step)

1. `(auth)/layout.tsx` → wrap with `NeonAuthUiLayout` from `@afenda/auth/neon-auth/ui`
2. `globals.css` → `@import '@neondatabase/auth-ui/tailwind';` (Tailwind v4)
3. Replace `(auth)/*/page.tsx` defaults with exports from `@afenda/auth/neon-auth/pages`
4. Keep `app/api/auth/[...path]` + `proxy.ts` unchanged (already Neon SDK)
