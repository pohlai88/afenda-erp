# @afenda/billing

Stripe commercial gateway for Afenda ERP (platform package).

- One **Stripe Customer** per Afenda **organization**.
- Checkout and Customer Portal sessions; webhook sync to `@afenda/db`.
- Feature UI: `@afenda/feature-system-admin` → Billing section.

## Environment

| Variable | Purpose |
| -------- | ------- |
| `STRIPE_SECRET_KEY` | Server API key (`.secret.config`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature (`.secret.config`) |
| `STRIPE_PRICE_HOBBY` / `TEAM` / `PRO` / `BUSINESS` | Plan price IDs (`.env.config`) |
| `STRIPE_DEFAULT_PLAN_KEY` | Default plan for checkout (`pro`) |
| `STRIPE_PRICE_ID` | Legacy fallback when a single price is enough |
| `NEXT_PUBLIC_SITE_URL` | Checkout/portal return URLs |

## Stripe CLI setup (local)

1. Log in (browser pairing):

```bash
stripe login
```

2. Plan price IDs live in `.env.config` (`STRIPE_PRICE_HOBBY`, `TEAM`, `PRO`, `BUSINESS`). To recreate via CLI:

```bash
pnpm stripe:configure
```

3. Wire secrets (validates prices + writes webhook secret from CLI):

```bash
# PowerShell — paste sk_test from Dashboard
$env:STRIPE_SECRET_KEY="sk_test_…"
pnpm stripe:setup
```

Or add **Secret key** manually to `.secret.config` then run `pnpm stripe:setup`:

```env
STRIPE_SECRET_KEY=sk_test_...
```

Legacy `mk_` keys are not valid for the Node SDK or CLI.

4. Sync env and run webhook forwarder (keep this terminal open):

```bash
pnpm env:sync
pnpm stripe:listen
```

5. Start the app: `pnpm dev` → `/system-admin/billing` → **Subscribe with Stripe**.

Check readiness anytime: `pnpm stripe:status`.

Smoke test (API + Checkout session): `pnpm stripe:test` (requires full configuration).

## Vercel (Preview / Production)

Project: `afenda-erp` on team `jacks-projects-7b3cfe94`. As of setup, **no Stripe env vars** are on Vercel — add them in [Project Settings → Environment Variables](https://vercel.com/jacks-projects-7b3cfe94/afenda-erp/settings/environment-variables) for Production and Preview:

| Variable | Notes |
| -------- | ----- |
| `STRIPE_SECRET_KEY` | Use `sk_live_…` in Production; `sk_test_…` in Preview if you want test mode |
| `STRIPE_WEBHOOK_SECRET` | From a **Dashboard** webhook endpoint (not the CLI `whsec_` used locally) |
| `STRIPE_PRICE_ID` | Live price ID for Production; can match test price in Preview |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-production-host>` (no trailing slash) |

**Production webhook** (Stripe Dashboard → Developers → Webhooks → Add endpoint):

- URL: `https://<production-host>/api/internal/v1/webhooks/stripe`
- Events (minimum): `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`, `invoice.finalized`
- Copy the signing secret into Vercel as `STRIPE_WEBHOOK_SECRET`.

CLI to add secrets (paste value when prompted):

```bash
vercel env add STRIPE_SECRET_KEY production preview
vercel env add STRIPE_WEBHOOK_SECRET production preview
vercel env add STRIPE_PRICE_ID production preview
```

Redeploy after env changes. Billing UI reads `getStripeConfigurationStatus()` — checkout/portal buttons stay hidden until all four variables are set in that deployment’s runtime.
