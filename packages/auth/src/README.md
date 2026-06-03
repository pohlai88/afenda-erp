# `@afenda/auth` source layout

Public doors at `src/` root (`index.ts`, `server.ts`, `client.ts`).

| Folder | Role |
| ------ | ---- |
| `neon-auth/` | **Canonical Neon Auth module** — SDK runtime, security, webhooks, plugin catalogs |
| `session/` | Afenda tenant session + capability hydration |
| `contracts/` | ERP auth-flow catalog, capability policy, session contracts |
| `policy/` | Method readiness + password policy |
| `errors/`, `copy/` | Shared auth error normalization and copy |

ERP product UI (ingress, forms, pages) lives in **`apps/erp/src/auth/`** (Phase 4).

## Import paths

- **Neon server:** `@afenda/auth/server` or `@afenda/auth/neon-auth-server`
- **Neon client:** `@afenda/auth/client`
- **Session / capabilities:** `@afenda/auth/server`, `@afenda/auth`
- **ERP auth pages:** `@/auth/pages/*` in `apps/erp`
