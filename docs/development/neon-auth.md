# Neon Auth (Afenda ERP)

Neon Auth is provisioned on the **`afenda`** Neon project (`snowy-dawn-60990429`). Each **database branch** has its own auth endpoint, JWKS URL, and trusted-origin allowlist. The Next.js app proxies browser traffic through **`/api/auth`** while the server uses the **hosted Neon Auth `base_url`** for session verification and upstream `get-session`.

Official quickstart: [Use Neon Auth with Next.js (API methods)](https://neon.com/docs/auth/quick-start/nextjs-api-methods). Afenda maps that guide to **`@afenda/neon-auth`** (runtime) + **`apps/erp/src/auth`** (UI) — not `lib/auth/*`.

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
| `NEXT_PUBLIC_AFENDA_NEON_AUTH_ENABLED` | `1` (unset → follow server) | Ingress UI gate via `isNeonAuthUiReady()` in `@afenda/neon-auth/server` |
| `NEON_AUTH_BASE_URL` | Yes | **Hosted** Neon Auth URL for the **same DB branch** as `DATABASE_URL` — not `http://localhost:3000/api/auth` |
| `NEON_AUTH_COOKIE_SECRET` | Yes | ≥32 chars; signs session cookies (`openssl rand -base64 32`) |
| `NEON_AUTH_SESSION_CACHE_TTL` | No (default `300`) | Server `session_data` cookie cache TTL (seconds) |
| `NEON_AUTH_LOG_LEVEL` | No (default `warn`) | Server SDK: `silent` \| `warn` \| `debug` |
| `NEXT_PUBLIC_AUTH_URL` | **Yes** when Neon on | Browser client → same-origin `/api/auth` proxy (e.g. `http://localhost:3000/api/auth`) |
| `AFENDA_AUTH_GOOGLE_ENABLED` | No (default `0`) | Shows Google OAuth only after the branch provider is configured |
| `AFENDA_AUTH_EMAIL_DELIVERY_READY` | No (default `0`) | Allows email-delivered optional methods after provider/delivery validation |
| `AFENDA_AUTH_EMAIL_OTP_ENABLED` | No (default `0`) | Shows passwordless email OTP only when email delivery is ready |
| `AFENDA_AUTH_MAGIC_LINK_ENABLED` | No (default `0`) | Shows magic link sign-in only when email delivery is ready |
| `AFENDA_AUTH_FORGOT_PASSWORD_ENABLED` | No (default ready) | Hides forgot-password if branch reset delivery is intentionally unavailable |
| `AFENDA_AUTH_EMAIL_VERIFICATION_ENABLED` | No (default ready) | Marks verification as unavailable if branch verification delivery is broken |

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

## SDK install

`@neondatabase/auth@0.4.1-beta` (workspace catalog; matches [npm latest](https://www.npmjs.com/package/@neondatabase/auth)). Declared on `@afenda/neon-auth`.

## Verify locally

```bash
pnpm env:sync
pnpm env:verify:neon-auth
```

Exits non-zero when Neon is enabled but misconfigured, `NEON_AUTH_BASE_URL` looks like a localhost proxy, JWKS is unreachable, or `NEXT_PUBLIC_AUTH_URL` is missing.

## Neon quickstart → Afenda mapping

| Neon quickstart step | Afenda implementation |
| -------------------- | --------------------- |
| `npm install @neondatabase/auth` | Catalog `0.4.1-beta` on `@afenda/neon-auth` |
| `.env.local`: `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` | Same + `AFENDA_NEON_AUTH_ENABLED`, `NEXT_PUBLIC_AUTH_URL` via `pnpm env:sync` |
| `lib/auth/server.ts` → `createNeonAuth()` | [`packages/neon-auth/src/runtime/neon-auth.server.ts`](../../packages/neon-auth/src/runtime/neon-auth.server.ts) — `getNeonAuthServer()` / export alias `auth` |
| `app/api/auth/[...path]/route.ts` → `auth.handler()` | [`apps/erp/src/app/api/auth/[...path]/route.ts`](../../apps/erp/src/app/api/auth/[...path]/route.ts) — all HTTP methods + 503 when disabled + observability |
| `proxy.ts` → `auth.middleware({ loginUrl })` | [`apps/erp/src/proxy.ts`](../../apps/erp/src/proxy.ts) — `loginUrl: "/sign-in"`; skips `/api/*` and dev cookie |
| `lib/auth/client.ts` → `createAuthClient()` | [`packages/neon-auth/src/runtime/neon-auth.client.ts`](../../packages/neon-auth/src/runtime/neon-auth.client.ts) — `neonAuthClient` / `authClient`; `baseURL` from `NEXT_PUBLIC_AUTH_URL` env |
| Sign-in/up via **Server Actions** + `auth.signIn.email` | **Client forms** call `neonAuthClient.signIn.email` / `signUp.email` (valid per Neon: client SDK on auth pages) |
| Home `auth.getSession()` | `getSession()` from `@afenda/auth/server` — uses SDK `getSession()` then **hydrates tenant org** from `@afenda/db` |
| Routes `/auth/sign-in` | ERP routes `/sign-in`, `/sign-up`, `/verify-email`, `/forgot-password` (ARCH URLs) |
| `export const dynamic = 'force-dynamic'` on home | `(auth)/layout.tsx` uses `connection()`; workspace uses cached `getSession` |

**Afenda-only (not in Neon minimal quickstart):** email verification UI, forgot-password OTP, Google OAuth, dev cookie sign-in, tenant capabilities, [`auth-flows.ts`](../../packages/auth/src/contracts/auth.flows.ts) catalog.

## Next.js wiring (repo)

| Layer | Location | Pattern |
| ----- | -------- | ------- |
| Route Handler proxy | `apps/erp/src/app/api/auth/[...path]/route.ts` | `getNeonAuthServer().handler()` |
| Server SDK | `packages/neon-auth/src/runtime/neon-auth.server.ts` | `createNeonAuth({ baseUrl, cookies, logLevel })` |
| Proxy (session refresh) | `apps/erp/src/proxy.ts` | `getNeonAuthServer().middleware({ loginUrl: "/sign-in" })` |
| Session read | `packages/neon-auth/src/runtime/neon-session.server.ts` | SDK `getSession()` → JWT cookie → upstream `get-session` |
| Tenant session | `packages/auth/src/session/auth.session.server.ts` | `React.cache(getSession)` + org hydration |
| Client | `packages/neon-auth/src/runtime/neon-auth.client.ts` | `createAuthClient()` + `NEXT_PUBLIC_AUTH_URL` |
| Flow catalog | `packages/auth/src/contracts/auth.flows.ts` | Implemented vs deferred flows |

### Next.js Server SDK (`@neondatabase/auth/next/server`)

Official reference: [Next.js Server SDK](https://neon.com/docs/auth/reference/nextjs-server). Afenda catalog: [`packages/neon-auth/src/contracts/server-sdk.catalog.ts`](../../packages/neon-auth/src/contracts/server-sdk.catalog.ts).

| Neon SDK surface | Afenda implementation |
| ---------------- | --------------------- |
| `createNeonAuth({ baseUrl, cookies, logLevel })` | [`getNeonAuthServer()`](../../packages/neon-auth/src/runtime/neon-auth.server.ts) — `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `NEON_AUTH_SESSION_CACHE_TTL`, `NEON_AUTH_LOG_LEVEL`; **`cookies.sameSite: "lax"`** (not Neon default `strict`) |
| `auth.handler()` | [`apps/erp/src/app/api/auth/[...path]/route.ts`](../../apps/erp/src/app/api/auth/[...path]/route.ts) — **GET, POST, PUT, PATCH, DELETE**; 503 when Neon disabled; `@afenda/observability` logging |
| `auth.middleware({ loginUrl })` | [`apps/erp/src/proxy.ts`](../../apps/erp/src/proxy.ts) — `loginUrl: "/sign-in"` (not `/auth/sign-in`); skips `/api/*`, dev cookie, guest-only auth pages without session token |
| `auth.getSession()` | [`readNeonAuthSessionPayload`](../../packages/neon-auth/src/runtime/neon-session.server.ts) inside [`getSession()`](../../packages/auth/src/session/auth.session.server.ts) — **`React.cache`** + **`@afenda/db` org hydration**; workspace/pages call **`getSession` from `@afenda/auth/server`**, not raw `auth.getSession()` |
| `signOutAction` | [`signOut()`](../../packages/auth/src/session/auth.session.server.ts) + [`signOutAction`](../../apps/erp/src/auth/dev/auth.dev-actions.server.ts) for appshell |
| `auth.signIn.email` / `signUp.email` (Server Actions) | **Not used** — [`neonAuthClient`](../../packages/neon-auth/src/runtime/neon-auth.client.ts) on auth forms in `apps/erp/src/auth/forms/` |
| `auth.organization.*`, `auth.admin.*`, `deleteUser`, session revoke APIs | **Deferred** — proxied via handler if called; ERP uses tenant DB + system-admin |
| Session cache (`session_data` cookie, HMAC) | Enabled via `sessionDataTtl` (default 300s); HS256 verify in `readNeonAuthSessionPayload` |
| Upstream `NETWORK_*` error codes | Surface on client/server SDK `error.code`; use `logLevel: 'debug'` locally |

**Env (server):** `NEON_AUTH_BASE_URL` must be the **hosted** Neon Auth URL (same branch as `DATABASE_URL`), not `NEXT_PUBLIC_AUTH_URL` (browser proxy). See `pnpm env:verify:neon-auth`.

**Project shape (Afenda vs Neon doc):**

| Neon recommends | Afenda |
| --------------- | ------ |
| `lib/auth/server.ts` | `packages/neon-auth/src/runtime/neon-auth.server.ts` |
| `app/auth/[path]/page.tsx` | `app/(auth)/*/page.tsx` → `@/auth/pages/*` |
| `app/dashboard` + `force-dynamic` | `(workspace)/*` + `(auth)/layout` `connection()` |
| `proxy.ts` / `middleware.ts` | `apps/erp/src/proxy.ts` |

### ERP auth pages (`app/(auth)` → `apps/erp/src/auth/pages`)

| URL | Neon client APIs used |
| --- | --------------------- |
| `/sign-in` | `signIn.email`, `signIn.social` (Google) |
| `/sign-up` | `signUp.email`; redirects to `/verify-email` when verification required |
| `/verify-email` | `emailOtp.sendVerificationOtp` (`type: email-verification`), `emailOtp.verifyEmail` |
| `/forgot-password` | `forgetPassword.email` (link, when SDK exposes it), `forgetPassword.emailOtp`, `emailOtp.resetPassword` |

**Not used in UI:** Neon Organization plugin (tenant orgs in `@afenda/db` — see § Organization plugin), `@neondatabase/auth-ui` prebuilt forms, `resetPasswordForEmail`, extra OAuth providers until enabled in Neon console/MCP.

### Flow readiness matrix

Local code can render a flow before the matching Neon branch configuration exists. Treat these as separate gates:

| Flow | Local UI | Local SDK call | Required Neon branch configuration | Afenda custom delivery status | Ready when |
| ---- | -------- | -------------- | ---------------------------------- | ----------------------------- | ---------- |
| Email + password sign-in | `/sign-in` → `NeonAuthForm` | `signIn.email` | Email/password provider enabled; trusted origin for the current host | Not needed | Env verifier passes and email/password is enabled |
| Email sign-up | `/sign-up` → `NeonAuthForm` | `signUp.email` | Email/password provider enabled; optional sign-up verification policy | Not needed unless custom OTP webhook is subscribed | Same as above; if verification required, OTP/link delivery must work |
| Google OAuth | `/sign-in` → Google button | `signIn.social({ provider: "google" })` | Google OAuth provider configured for the same branch; redirect origin trusted | Not needed | Provider exists in Neon and Google console redirect URI matches `/api/auth/callback/google` |
| Verify email by OTP | `/verify-email` | `emailOtp.sendVerificationOtp({ type: "email-verification" })`, `emailOtp.verifyEmail` | Email OTP / verification-code mode enabled for the branch | **Do not subscribe `send.otp` unless custom email delivery is implemented** | Neon built-in email sends codes, or Afenda implements `send.otp` email |
| Forgot/reset password by link | `/forgot-password`, `/reset-password` | `forgetPassword.email`, `resetPassword` | Password reset email/link support from Neon email provider | Not needed unless custom magic-link delivery is subscribed | Reset link email arrives and callback origin is trusted |
| Forgot/reset password by OTP | `/forgot-password` reset step | `forgetPassword.emailOtp`, `emailOtp.resetPassword` | Email OTP reset support on the branch | **Do not subscribe `send.otp` unless custom email delivery is implemented** | Neon built-in email sends codes, or Afenda implements `send.otp` email |
| Passwordless email OTP sign-in | `/sign-in` → `NeonPasswordlessSignIn` | `emailOtp.sendVerificationOtp({ type: "sign-in" })`, `signIn.emailOtp` | Email OTP sign-in enabled; decide whether automatic sign-up is allowed | **Do not subscribe `send.otp` unless custom email delivery is implemented** | Code arrives and `signIn.emailOtp` succeeds |
| Passwordless magic link sign-in | `/sign-in` → `NeonPasswordlessSignIn` | `signIn.magicLink` | Magic Link plugin enabled; trusted callback origin | **Do not subscribe `send.magic_link` unless Afenda implements custom email delivery** | Link email arrives and `/api/auth/magic-link/verify` proxies successfully |
| Phone OTP sign-in | No UI | None | Phone Number plugin enabled | **Missing**: `send.otp` SMS delivery is required | Not ready; implement SMS webhook first |
| Neon Organization plugin | No UI | None | Organization plugin enabled if adopted | Not relevant | Not used by Afenda; ERP tenancy stays in `@afenda/db` |

Current local verifier scope: `pnpm env:verify:neon-auth` checks env, hosted `NEON_AUTH_BASE_URL`, `NEXT_PUBLIC_AUTH_URL`, cookie secret, and JWKS reachability. It does **not** check provider/plugin toggles, OAuth provider credentials, email provider health, trusted origin completeness for deployed previews, or webhook subscriptions.

Auth UI readiness gates are intentionally stricter than env verification: optional methods are hidden unless their `AFENDA_AUTH_*` readiness flag is set after the corresponding Neon branch provider/plugin and delivery path have been verified.

### Email OTP plugin (Neon guide mapping)

Neon enables the Better Auth Email OTP plugin automatically. Afenda does **not** use `NeonAuthUIProvider` `emailOTP` or `@neondatabase/auth-ui`; custom forms call `neonAuthClient` directly. Catalog: [`auth.neon-email-otp.ts`](../../packages/neon-auth/src/plugins/email-otp/catalog.ts).

**Console:** Auth → enable **Sign-up and Sign-in with Email**. For sign-up verification codes: **Verify at Sign-up** + **Verification method: Verification code** (production branch). Delivery is Neon-managed unless you subscribe to webhook `send.otp` (see § Webhooks).

| Neon OTP flow | `type` / API | Afenda |
| ------------- | ------------ | ------ |
| Verify email after sign-up | `emailOtp.sendVerificationOtp({ type: 'email-verification' })` → `emailOtp.verifyEmail` | [`/verify-email`](../../apps/erp/src/auth/forms/auth.verify-email-form.client.tsx); resend tries `sendVerificationEmail` (link) first, then OTP |
| Password reset | `forgetPassword.emailOtp` → `emailOtp.resetPassword` | [`/forgot-password`](../../apps/erp/src/auth/forms/auth.forgot-password-form.client.tsx); prefers `forgetPassword.email` (link) when SDK exposes it |
| Passwordless sign-in | `sendVerificationOtp({ type: 'sign-in' })` → `signIn.emailOtp` | [`NeonPasswordlessSignIn`](../../apps/erp/src/auth/forms/auth.neon-passwordless-sign-in.client.tsx) on `/sign-in` |
| Magic link sign-in | `signIn.magicLink` | Same component — enable **Magic Link** plugin in Neon Console |
| Optional OTP check | `emailOtp.checkVerificationOtp` | **Deferred** — forms submit directly to `verifyEmail` / `resetPassword` |
| Rate limits | `TOO_MANY_ATTEMPTS` etc. | Surfaced as SDK `error.message` in form notices; user must request a new code |

**Production:** configure a dedicated email provider in Neon (not shared dev SMTP) per [production checklist — email provider](https://neon.com/docs/auth/production-checklist#email-provider).

### Magic Link plugin (Neon guide mapping)

Passwordless sign-in via email link (`signIn.magicLink`). Afenda does **not** use `NeonAuthUIProvider` `magicLink`; it renders a custom passwordless form on `/sign-in` beside email+password and Google OAuth. Catalog: [`auth.neon-magic-link.ts`](../../packages/neon-auth/src/plugins/magic-link/catalog.ts).

| Neon guide step | Afenda |
| --------------- | ------ |
| Enable plugin | Neon Console → **Auth** → **Plugins** → **Magic Link**, or `PATCH …/auth/plugins/magic-link` (`enabled`, `expires_in`, `disable_sign_up`) — **operator**; off by default until enabled per branch |
| `signIn.magicLink({ email, callbackURL })` | `/sign-in` → `NeonPasswordlessSignIn`; `callbackURL` is site origin `/` |
| Link verify / session | Proxied upstream path `magic-link/verify` on `/api/auth` when plugin is on; ERP does not host a dedicated verify page |
| Custom delivery | Webhook `send.magic_link` → **400** from [`handleNeonAuthWebhookPost`](../../packages/neon-auth/src/webhooks/handler.server.ts) until implemented (see § Webhooks) |
| Production email | Same as Email OTP — dedicated Neon email provider, not shared dev SMTP |

**If enabling later:** add optional “Email me a sign-in link” on `/sign-in`, set `callbackURL` to `getPostSignInDestination`, and ensure trusted origins include your deployment host.

### Organization plugin (Neon guide mapping)

Neon Auth can host **Better Auth organizations** on the auth branch (owner/admin/member, invitations, `organization.setActive`). **Afenda does not use this for ERP tenancy.** Tenant workspaces, memberships, roles, and capabilities are owned by **`@afenda/db`** and **`@afenda/feature-system-admin`** (ARCH-1002 / ARCH-1006). Catalog: [`auth.neon-organization.ts`](../../packages/neon-auth/src/plugins/organization/catalog.ts).

| Neon Organization API | Afenda equivalent |
| --------------------- | ----------------- |
| `organization.create` | [`bootstrapOrganizationForUser`](../../packages/auth/src/session/auth.session.server.ts) + `/onboarding` ([`OnboardingForm`](../../apps/erp/src/routes/onboarding/onboarding-form.tsx)) — first org in Postgres |
| `organization.list` / `setActive` | `getSession().organizations` + [`switchActiveOrganization`](../../packages/auth/src/session/auth.session.server.ts) (appshell org switcher) |
| `organization.inviteMember` / accept invitation | **system-admin** `/system-admin/users`, `/system-admin/memberships` — `system-admin.users.*` capabilities, not Neon invites |
| `organization.getFullOrganization`, RBAC roles | `getOrganizationContext` + execution kernel capabilities (`owner`, `admin`, `finance-manager`, …) |
| Console plugin toggle / limits | Operator-only (Neon Console **Auth → Plugins → Organizations** or `PATCH …/auth/plugins/organization`); disabling Neon org plugin does **not** affect Afenda tenant tables |
| `/auth/accept-invitation` | **Not implemented** — no Neon invitation route in ERP |

**Do not** call `neonAuthClient.organization.*` from feature code; `neonAuthUpstreamPaths` includes `organization/*` only because `/api/auth` proxies the full Better Auth surface.

Neon limitations (Teams, custom permissions, hooks) apply only if you adopt Neon orgs elsewhere — not relevant to Afenda’s tenant model.

### Phone Number plugin (Neon guide mapping)

Sign-in **only** for **existing** users with a linked E.164 phone (`+15551234567`). No phone-first sign-up. Neon does not send SMS — you must handle webhook `send.otp` with `delivery_preference: "sms"` (Twilio, etc.). Catalog: [`auth.neon-phone-number.ts`](../../packages/neon-auth/src/plugins/phone-number/catalog.ts).

| Neon guide capability | Afenda |
| --------------------- | ------ |
| Console / API enable (`PATCH …/auth/plugins/phone-number`) | **Operator** — `enabled`, `otp_expires_in` (60–600s) |
| `phoneNumber.sendOtp` → `phoneNumber.verify` (sign-in) | **Deferred** — no phone form on `/sign-in` (email+password + Google) |
| Link phone (`verify` + `updatePhoneNumber: true`) | **Deferred** — not on `/account` |
| `send.otp` + `delivery_preference: "sms"` | **400** from webhook handler until SMS integration — **required** if plugin is enabled |
| `phone_number.verified` | **200** ack ([`handleNeonAuthWebhookPost`](../../packages/neon-auth/src/webhooks/handler.server.ts)); no side effects yet |
| `@neondatabase/auth-ui` phone UI | **Not available** — custom form beside sign-in per Neon docs |

**Before enabling in Neon:** implement `send.otp` SMS branch on `POST /api/internal/v1/webhooks/neon-auth` (signature verify already in place). Reference: [nextjs-phone-login](https://github.com/neondatabase/neon-js/tree/main/examples/nextjs-phone-login).

**Limits (Neon):** 6-digit OTP; 10 req/min per IP on `/phone-number/*`; 3 wrong codes invalidates OTP (`TOO_MANY_ATTEMPTS`).

### JWT plugin (Neon guide mapping)

Neon exposes short-lived **access JWTs** (EdDSA / Ed25519, ~15 minutes) for non-browser callers. **Afenda ERP pages use HTTP-only session cookies** via `neonAuthClient.signIn.*` and `getNeonAuthServer().getSession()` — not `authClient.token()`. Catalog: [`auth.neon-jwt.ts`](../../packages/neon-auth/src/plugins/jwt/catalog.ts).

| Neon guide capability | Afenda |
| --------------------- | ------ |
| Browser sessions (recommended) | [`readNeonAuthSessionPayload`](../../packages/neon-auth/src/runtime/neon-session.server.ts) → SDK `getSession()` → signed `session_data` cookie (HS256 + `NEON_AUTH_COOKIE_SECRET`) → upstream `{NEON_AUTH_BASE_URL}/get-session` |
| `authClient.token()` | **Deferred** in UI — no client code fetches Bearer tokens for workspace pages |
| `set-auth-jwt` response header on `getSession` | **Deferred** — not read in forms |
| Verify access JWT (JWKS) | [`verifyNeonAuthAccessToken`](../../packages/neon-auth/src/security/jwt-verify.server.ts) — `jose` + `{NEON_AUTH_BASE_URL}/.well-known/jwks.json`, `issuer`/`audience` = auth URL **origin**; export from `@afenda/neon-auth/server` for future `Authorization: Bearer` routes (**ARCH-1004**), not used on `(workspace)` reads today |
| Webhook signatures | Separate Ed25519 path in [`webhook-verify.server.ts`](../../packages/neon-auth/src/security/webhook-verify.server.ts) |

**When to add Bearer JWT routes:** partner APIs, CLI, or a frontend on another origin that cannot send ERP cookies. Refresh tokens by calling `token()` again before expiry. Custom JWT claims are not supported by Neon.

**Troubleshooting (Neon):** issuer must match `new URL(NEON_AUTH_BASE_URL).origin`; library must support **EdDSA**; re-fetch JWKS if `kid` rotates.

### Password reset (Neon guide mapping)

Neon documents link-based reset via `@neondatabase/auth-ui` (`<ForgotPasswordForm>` / `<ResetPasswordForm>`). Afenda uses **custom** [`auth.forgot-password-form.client.tsx`](../../apps/erp/src/auth/forms/auth.forgot-password-form.client.tsx) on `/forgot-password` (ARCH-1003 / no `auth-ui` in ERP):

| Neon guide step | Afenda behavior |
| --------------- | --------------- |
| Enable email sign-up in Console | Required; reset available when email auth is on |
| User requests reset | `forgetPassword.email` with `redirectTo` → `/forgot-password?email=…`, else `forgetPassword.emailOtp` |
| User completes reset | `emailOtp.resetPassword` (code path); link return runs `getSession()` and redirects if auto-sign-in |
| 15-minute expiry | Copy + “Send a new code” on the reset step |
| Link reset completion | [`/reset-password`](../../apps/erp/src/auth/forms/auth.reset-password-form.client.tsx) — `neonAuthClient.resetPassword({ token, newPassword })`; `forgetPassword.email` `redirectTo` → `/reset-password` |
| OTP reset completion | `/forgot-password` reset step — `emailOtp.resetPassword` |

### User management (Neon guide mapping)

Post-sign-in account settings live on **`/account`** (workspace route), not `(auth)` ingress. Shell **Profile** links here.

| Neon guide API | Afenda implementation |
| -------------- | --------------------- |
| `updateUser({ name })` | [`UpdateProfileForm`](../../apps/erp/src/auth/forms/auth.update-profile-form.client.tsx) → `neonAuthClient.updateUser` → `getSession()` + `router.refresh()` (re-hydrates `@afenda/db` `user_profiles`) |
| `changePassword({ currentPassword, newPassword, revokeOtherSessions? })` | [`ChangePasswordForm`](../../apps/erp/src/auth/forms/auth.change-password-form.client.tsx) |
| Refresh session after profile update | `getSession()` after successful `updateUser` |
| Forgot password while signed in | Link to `/forgot-password` on password section |
| Email / image / phone on `updateUser` | **Name only** in UI; Neon notes email change is not supported — copy explains email is read-only |
| `deleteUser` / change email | **Deferred** — not in Neon snippet; listed in `auth.flows.ts` `deferredNeonClientFlows` |

Dev cookie sessions (`session.source === "dev"`) see an informational notice instead of Neon forms.

### Webhooks (Neon guide mapping)

Neon Auth sends signed HTTPS POSTs to your app when subscribed per branch (Neon API `PUT /projects/{id}/branches/{id}/auth/webhooks`). Afenda exposes:

| Item | Value |
| ---- | ----- |
| ERP endpoint | `POST /api/internal/v1/webhooks/neon-auth` (**ARCH-1004** `internal/v1/webhooks`) |
| Handler | [`handleNeonAuthWebhookPost`](../../packages/neon-auth/src/webhooks/handler.server.ts) via [`apps/erp/.../neon-auth/route.ts`](../../apps/erp/src/app/api/internal/v1/webhooks/neon-auth/route.ts) |
| Signature | Ed25519 detached JWS — [`verifyNeonAuthWebhookPayload`](../../packages/neon-auth/src/security/webhook-verify.server.ts) using `NEON_AUTH_BASE_URL/.well-known/jwks.json` |
| Catalog | [`auth.flows.ts`](../../packages/auth/src/contracts/auth.flows.ts) `implementedNeonWebhookEventHandlers` / `deferredNeonWebhookEventHandlers` |

| Neon event | Afenda behavior |
| ---------- | --------------- |
| `user.before_create` (blocking) | Optional domain block via `NEON_AUTH_WEBHOOK_BLOCKED_EMAIL_DOMAINS` (comma-separated, e.g. `mailinator.com,tempmail.com`) → `{ allowed: false, error_code: "DOMAIN_BLOCKED" }` |
| `user.created` (non-blocking) | `upsertUserProfile` to `@afenda/db` (same as session hydration); returns 200 immediately |
| `phone_number.verified` | 200 ack (no side effects yet) |
| `send.otp`, `send.magic_link` | **Not implemented** — returns **400** (non-retryable). Do **not** enable in Neon console until you add custom delivery (Resend, SMS, etc.). Afenda uses Neon built-in email for OTP today. |

**Configure in Neon (operator):** set `webhook_url` to `https://<production-host>/api/internal/v1/webhooks/neon-auth` (HTTPS hostname only — no localhost/raw IPs). Local dev: ngrok HTTPS tunnel. `NEON_AUTH_WEBHOOK_URL` in `.env.config` is console metadata only.

**Idempotency:** retries reuse `X-Neon-Event-Id`; extend handlers with a durable event ledger before production CRM/analytics side effects.

Reference walkthrough: [Customizing Neon Auth with Webhooks](https://neon.com/guides/neon-auth-webhooks-nextjs).

### Admin plugin (Neon guide mapping)

Neon ships the [Better Auth Admin plugin](https://neon.com/docs/auth/guides/plugins/admin) on `neonAuthClient.admin.*` (no separate install). Calls require an **authenticated Neon session** whose user has the Neon **`admin` role** — assign in Neon Console → **Auth** → **Users** → **Make admin**.

| Concern | Afenda owner |
| ------- | ------------ |
| Invite / suspend / remove **tenant** members | `@afenda/feature-system-admin` → `/system-admin/users` (`system-admin.users.*` capabilities, `@afenda/db` memberships) |
| Create / ban / impersonate **Neon Auth** users | **Deferred** — [`deferredNeonAdminClientMethods`](../../packages/neon-auth/src/plugins/admin/catalog.ts) |
| Operator updates own name/password | `/account` → `updateUser` / `changePassword` (self-service, not `admin.*`) |

| Neon `admin` API | Status in Afenda |
| ---------------- | ---------------- |
| `createUser`, `listUsers`, `setRole`, `setUserPassword`, `updateUser` | Deferred — use Console or future platform tooling; tenant onboarding stays system-admin invites |
| `banUser`, `unbanUser` | Deferred |
| `listUserSessions`, `revokeUserSession`, `revokeUserSessions` | Deferred |
| `impersonateUser`, `stopImpersonating` | Deferred — same-origin cookies only; impersonation ≤ 1 browser session / 1 hour per Neon |

**Why deferred:** Admin APIs must run in a browser context that sends Neon session cookies to `/api/auth` (same site as ERP). Afenda does not expose a Neon-admin console in the app yet; mixing them into system-admin would blur **tenant control plane** (ARCH-1006) vs **Neon identity plane**.

**When implementing:** add a gated internal surface (e.g. platform ops) that calls `neonAuthClient.admin.*` from `@afenda/neon-auth/client` only after verifying a Neon `admin` role on `getSession()`, audit every mutation, and never use `admin.updateUser` for tenant capability changes.

### Next.js best practices applied here

1. **No auth waterfall in layout** — workspace layout preloads shell nav; dashboard uses `Promise.all` for independent server loads.
2. **Minimize RSC serialization** — session/org resolution stays server-side; client gets auth client only on sign-in surfaces.
3. **Proxy vs middleware** — `apps/erp/src/proxy.ts` refreshes Neon cookies on navigations; API routes skip proxy matcher for `/api/*`.
4. **Security** — tenancy from server session (`getOrganizationContext`); never trust client `organizationId`. Re-check capabilities in Server Actions and handlers.
5. **Fast UI loop** — [`fast-ui-dev.md`](./fast-ui-dev.md) (`AFENDA_DEV_AUTH_BYPASS=1`, Neon off).

## Neon MCP operations

| Tool | Use |
| ---- | --- |
| `get_neon_auth_config` | Read `base_url`, `jwks_url`, `trusted_origins` per branch |
| `provision_neon_auth` | First-time enable on a branch |
| `configure_neon_auth` | `add_trusted_origin`, `set_allow_localhost`, OAuth, email provider |

**Write tools require explicit approval** — do not run `configure_neon_auth` / `provision_neon_auth` without operator intent.

## E2E and production

- E2E Neon smoke: `pnpm test:e2e:neon` (env-gated). See [`docs/testing/README.md`](../testing/README.md).
- Vercel: set Preview/Production env from the matching branch’s `get_neon_auth_config` output; run `vercel env pull` after changes. See [`vercel-link.md`](./vercel-link.md).
- Safari local HTTP: use `pnpm dev -- --experimental-https` and `https://localhost:3000` (third-party cookie limits).

## Related

- [Environment sync](./env.md)
- [Fast UI dev (bypass)](./fast-ui-dev.md)
- [`packages/auth/src/README.md`](../../packages/auth/src/README.md)
- [`packages/neon-auth/README.md`](../../packages/neon-auth/README.md)
- [ARCH-1001 § Neon Auth](../architecture/1001-afenda-platform-doctrine.md)
