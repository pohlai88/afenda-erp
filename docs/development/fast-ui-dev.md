# Fast UI development loop

Use this when you only need to **see layout, governed renderers, or appshell chrome** locally — not real Neon tenants or persisted lists.

## 1. Turn on dev auth bypass

In `.env.config` (then sync):

```bash
AFENDA_NEON_AUTH_ENABLED=0
NEXT_PUBLIC_AFENDA_NEON_AUTH_ENABLED=0

For real Neon Auth testing (slower, full session hydration), re-enable per [neon-auth.md](./neon-auth.md) and run `pnpm env:verify:neon-auth`.

The dashboard streams in sections (header/KPIs/queue first; automation, assistant, and governance lists in later Suspense boundaries). Shell + Neon auth still dominate cold loads.
AFENDA_DEV_AUTH_BYPASS=1
```

```bash
pnpm env:sync
```

Restart the dev server (`pnpm dev`).

## 2. Open the right URL

| Goal | URL |
| ---- | --- |
| Full shell + dashboard (fixture data) | http://localhost:3000/dashboard |
| Governed renderers only (no AppShell, no DB) | http://localhost:3000/playground/metadata-renderer-gallery |

No sign-in required when bypass is on.

## 3. While checking UI

- Use **one browser tab**; wait for compile to finish before refreshing.
- Prefer **gallery** or a single module page over hammering `/dashboard` if you only need components.
- Turn bypass **off** (`AFENDA_DEV_AUTH_BYPASS=0`, Neon back on) before testing auth, tenancy, or real data.

## What bypass changes

- Session is an in-memory demo user (`source: "dev"`).
- Workspace lists use **module metadata** fixtures, not tenant tables.
- Shell skips module/capability settings DB reads (navigation from role capabilities only).

## Still slow?

- Cold Turbopack compile after restart is normal; second load should be much faster.
- If you need real Neon data, bypass must stay off — use the performance fixes on the main dev path instead.
