# Neon Auth (Afenda ERP)

Neon Auth is provisioned on the **`afenda`** Neon project (`snowy-dawn-60990429`). Each **database branch** has its own auth endpoint, JWKS URL, and trusted-origin allowlist. The Next.js app proxies browser traffic through **`/api/auth`** while the server uses the **hosted Neon Auth `base_url`** for session verification and upstream `get-session`.

## Branch endpoints (from Neon MCP)

| Branch | `branch_id` | `NEON_AUTH_BASE_URL` (suffix `/neondb/auth`) |
| ------ | ----------- | -------------------------------------------- |
| **production** (default) | `br-young-term-aobkvd38` | `https://ep-snowy-hat-aof9n5iw.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth` |
| **vercel-dev** | `br-purple-fog-aob4j2cf` | `https://ep-purple-cherry-aom2t8km.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth` |

JWKS for each branch: `{base_url}/.well-known/jwks.json`.

**Trusted origins** (CSRF + redirect allowlist) must include every origin users sign in from:

| Branch | Origins (as configured) |
| ------ | ------------------------ |
| production | `https://www.nexuscanon.com`, `http://localhost:3000` |
| vercel-dev | `http://localhost:3000`, `https://www.nexuscanon.com` |

Add Vercel preview origins when you deploy previews (e.g. `https://<project>-<hash>.vercel.app`) via Neon console or MCP `configure_neon_auth` → `add_trusted_origin`. Prefer narrow origins over wildcards.

Email verification differs by branch: **production** requires verification on sign-up; **vercel-dev** does not (faster local/preview iteration).

## Environment variables

Validated in [`packages/config/src/env.ts`](../../packages/config/src/env.ts). Edit [`.env.config`](../../.env.config) (from [`.env.config.example`](../../.env.config.example)), then `pnpm env:sync`.

| Variable | Required when Neon on | Role |
| -------- | --------------------- | ---- |
| `AFENDA_NEON_AUTH_ENABLED` | `1` | Master switch |
| `NEXT_PUBLIC_AFENDA_NEON_AUTH_ENABLED` | `1` | Client UI gate (sign-in flows) |
| `NEON_AUTH_BASE_URL` | Yes | **Hosted** Neon Auth URL for the **same DB branch** as `DATABASE_URL` — not `http://localhost:3000/api/auth` |
| `NEON_AUTH_COOKIE_SECRET` | Yes | ≥32 chars; signs session cookies (`openssl rand -base64 32`) |
| `NEON_AUTH_SESSION_CACHE_TTL` | No (default `300`) | Server cookie cache TTL (seconds) |
| `NEXT_PUBLIC_AUTH_URL` | Recommended | Browser client target; default same-origin `/api/auth` → `http://localhost:3000/api/auth` locally |

**Not read by app runtime** (console/MCP metadata only): `NEON_AUTH_ENDPOINT_ID`, `NEON_AUTH_PROJECT_ID`, `NEON_AUTH_BRANCH_ID`, `JWKS_URL`, `NEON_AUTH_WEBHOOK_URL`.

### Branch alignment rule

`DATABASE_URL` and `NEON_AUTH_BASE_URL` must refer to the **same Neon branch**. Mixing production DB with vercel-dev auth (or vice versa) produces missing users, failed `get-session`, or stale JWT validation.

Local dev against **production** data:

```env
AFENDA_NEON_AUTH_ENABLED=1
NEXT_PUBLIC_AFENDA_NEON_AUTH_ENABLED=1
NEON_AUTH_BASE_URL=https://ep-snowy-hat-aof9n5iw.neonauth.c-2.ap-southeast-1.aws.neon.tech/neondb/auth
NEON_AUTH_COOKIE_SECRET=<your-secret>
NEXT_PUBLIC_AUTH_URL=http://localhost:3000/api/auth
```

Local dev against **vercel-dev** branch: swap `NEON_AUTH_BASE_URL` and `DATABASE_URL` to the vercel-dev pair from Neon console / MCP `get_neon_auth_config`.

## Verify locally

```bash
pnpm env:sync
pnpm env:verify:neon-auth
```

Exits non-zero when Neon is enabled but misconfigured, `NEON_AUTH_BASE_URL` looks like a localhost proxy, or JWKS is unreachable.

## Next.js wiring (already in repo)

| Layer | Location | Pattern |
| ----- | -------- | ------- |
| Route Handler proxy | `apps/erp/src/app/api/auth/[...path]/route.ts` | `getNeonAuthServer().handler()` — browser hits `/api/auth/*` |
| Server SDK | `packages/auth/src/neon-auth-server.ts` | `createNeonAuth({ baseUrl: NEON_AUTH_BASE_URL, cookies: { secret } })` |
| Proxy (session refresh) | `apps/erp/src/proxy.ts` | `getNeonAuthServer().middleware({ loginUrl: "/sign-in" })` when enabled |
| Session read | `packages/auth/src/neon-session.ts` | JWT from signed cookie, else `fetch(\`${NEON_AUTH_BASE_URL}/get-session\`)` with 3s timeout |
| Request dedup | `packages/auth/src/server.ts` | `React.cache()` on `getSession` / `getOrganizationContext` |
| Client | `packages/auth/src/client.ts` | `createAuthClient()` — same-origin `/api/auth` unless `NEXT_PUBLIC_AUTH_URL` overrides |

### Next.js best practices applied here

1. **No auth waterfall in layout** — workspace layout preloads shell nav; dashboard uses `Promise.all` for independent server loads (parallelize independent server work; Suspense only where streaming helps).
2. **Minimize RSC serialization** — session/org resolution stays server-side; client gets auth client only on sign-in surfaces.
3. **Proxy vs middleware** — `apps/erp/src/proxy.ts` refreshes Neon cookies on navigations; API routes skip proxy matcher overhead for `/api/*`.
4. **Security** — tenancy from server session (`getOrganizationContext`); never trust client `organizationId`. Re-check capabilities in Server Actions and handlers.
5. **Fast UI loop** — for layout/metadata work without Neon round-trips, use [`fast-ui-dev.md`](./fast-ui-dev.md) (`AFENDA_DEV_AUTH_BYPASS=1`, Neon off).

## Neon MCP operations

Cursor command `/user-Neon/setup-neon-auth` may 404 on GitHub-hosted templates; use MCP tools directly:

| Tool | Use |
| ---- | --- |
| `get_neon_auth_config` | Read `base_url`, `jwks_url`, `trusted_origins` per branch |
| `provision_neon_auth` | First-time enable on a branch |
| `configure_neon_auth` | `add_trusted_origin`, `set_allow_localhost`, OAuth, email provider |

**Write tools require explicit approval** — do not run `configure_neon_auth` / `provision_neon_auth` without operator intent.

## E2E and production

- E2E Neon smoke: `pnpm test:e2e:neon` (env-gated). See [`docs/testing/README.md`](../testing/README.md).
- Vercel: set Preview/Production env from the matching branch’s `get_neon_auth_config` output; run `vercel env pull` after changes. See [`vercel-link.md`](./vercel-link.md).

## Related

- [Environment sync](./env.md)
- [Fast UI dev (bypass)](./fast-ui-dev.md)
- [ARCH-1001 § Neon Auth](../architecture/1001-afenda-platform-doctrine.md)
