# GUARD 4 — `routes/` naming

**Run:** `pnpm guard:routes` (included in `pnpm guard:erp`)

On failure:

```text
[guard:routes] GUARD 4 FAILED
YOU DAMN SON OF BITH AI, READ THE RULES!!!!
```

---

## One rule

This folder is **routes**. Every filename must say **route** in the name.

Use either shape:

```text
{topic}-route.{artifact}.{ext}
route-{topic}.{artifact}.{ext}
```

Flat folder only. No subdirectories.

---

## Valid patterns

| Pattern | Example | Purpose |
| ------- | ------- | ------- |
| `{topic}-route.server.tsx` | `lynx-console-route.server.tsx` | RSC page composer |
| `{topic}-route.server.ts` | `execution-context-route.server.ts` | Server-only route helper |
| `{topic}-route-props.ts` | `lynx-route-props.ts` | Page props types |
| `{topic}-route-fallback.tsx` | `auth-route-fallback.tsx` | Loading / suspense fallback |
| `route-{name}.tsx` | `route-state.tsx` | Shared route boundary UI |
| `route-{name}.client.tsx` | `route-state.client.tsx` | Client route boundary UI |

---

## `{topic}`

- Lowercase kebab-case
- Names the page or surface (`lynx-console`, `onboarding`, `execution-context`, `lynx-page-shell`)

---

## `{artifact}` (optional middle segment)

Common values: `server`, `client`, `props`, `fallback`, `state`

---

## Valid examples

```text
lynx-console-route.server.tsx
onboarding-route.server.tsx
execution-context-route.server.ts
lynx-page-shell-route.server.tsx
auth-route-fallback.tsx
route-state.tsx
route-state.client.tsx
lynx-route-props.ts
```

---

## Invalid examples (will BLOCK)

```text
execution-context.server.ts     → execution-context-route.server.ts
lynx-page-shell.server.tsx      → lynx-page-shell-route.server.tsx
lynx-console.server.tsx         → lynx-console-route.server.tsx
state.tsx                       → route-state.tsx
routes/lynx/console-route.tsx   → flat + correct name at routes root
```

---

## Enforcement

| Layer | File |
| ----- | ---- |
| Script | `scripts/guard-routes-naming.mts` |
| Cursor hook | `.cursor/hooks/guard-routes-naming.mjs` |
| Rule | `.cursor/rules/afenda-erp-app.mdc` |
