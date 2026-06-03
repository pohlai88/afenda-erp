# `@afenda/auth` source layout

Public doors at `src/` root (`index.ts`, `server.ts`, `client.ts`).

| Folder | Role |
| ------ | ---- |
| `session/` | Afenda tenant session + capability hydration |
| `contracts/` | ERP auth-flow catalog, capability policy, session contracts |
| `policy/` | Method readiness + password policy |
| `errors/`, `copy/` | Shared auth error normalization and copy |

Neon Auth runtime lives in **`@afenda/neon-auth`** (`packages/neon-auth/`). ERP product UI (ingress, forms, pages) lives in **`apps/erp/src/auth/`**.

## Import paths

- **Neon server / client / cookies:** `@afenda/neon-auth/server`, `@afenda/neon-auth/client`, `@afenda/neon-auth/neon-cookies`
- **Session / capabilities:** `@afenda/auth/server`, `@afenda/auth`
- **Browser-safe contracts:** `@afenda/auth/client`, `@afenda/auth`
- **ERP auth pages:** `@/auth/pages/*` in `apps/erp`
