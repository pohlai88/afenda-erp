# `@afenda/auth` Neon Auth tree

Flat `src/` layout with compatibility subpaths for Neon Auth.

## Public doors

| Import | Purpose |
| ------ | ------- |
| `@afenda/auth/neon-auth/server` | Server SDK + route handlers |
| `@afenda/auth/neon-auth/client` | Browser auth client |
| `@afenda/auth/neon-auth/ui` | Neon Auth UI provider/layout/components |
| `@afenda/auth/neon-auth/pages` | Auth and account page scaffolds |
| `@afenda/auth/neon-auth/paths` | Shared auth routes and redirects |
| `@afenda/auth/neon-auth/neon-cookies` | Shared session cookie helpers |
| `@afenda/auth/neon-auth/neon-session` | Session payload helpers |

## Flat implementation files

```txt
src/
├── aut-*.ts / aut-*.tsx        # implementation files
├── client.ts                   # root client door
├── server.ts                   # root server door
├── neon-auth-*.ts              # compatibility subpath re-exports
└── tree.md
```

## ERP wiring

1. `(auth)/layout.tsx` and `onboarding/layout.tsx` wrap with `NeonAuthUiLayout`
2. `globals.css` imports `@neondatabase/auth-ui/tailwind`
3. `(auth)/*/page.tsx` files render from `@afenda/auth/neon-auth/pages`
4. `app/api/auth/[...path]/route.ts` stays thin and delegates to `@afenda/auth/neon-auth/server`
5. `proxy.ts` continues to use `auth.middleware()` from `@afenda/auth/neon-auth/server`
