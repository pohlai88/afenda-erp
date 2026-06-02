### 9.14 Billing

## Definition

Billing manages the commercial relationship between the organization and Afenda.

It provides visibility and control over subscriptions, plans, entitlements, usage, invoices, payments, credits, and billing-related governance.

Billing does not enforce ERP permissions directly.

Billing determines what commercial entitlements the organization has purchased.

The Execution Kernel and Module Governance surfaces consume those entitlements when determining feature availability.

## Owns

Billing owns:

* subscription management
* plan visibility
* entitlement visibility
* usage visibility
* invoice visibility
* payment visibility
* billing contacts
* billing history
* credit management
* billing readiness review
* commercial governance

## Stripe (as-built, option B)

Commercial authority: **Stripe** via platform package `@afenda/billing`.

* One Stripe Customer per Afenda **organization** (`organization_billing` in `@afenda/db`).
* Admins with `system-admin.billing.manage` open **Checkout** or **Customer Portal** from System Admin → Billing.
* Webhooks: `POST /api/internal/v1/webhooks/stripe` sync subscription and invoice mirrors.
* Setup: `packages/billing/README.md` and `.env.config.example` (Stripe section).

Billing still does not implement card Element UI in Afenda; payment instruments stay in Stripe.

## Does Not Own

Billing does not own:

* low-level Stripe SDK wiring (see `@afenda/billing`)
* accounting transactions
* ERP permissions
* role assignment
* organization profile
* module governance configuration

Those belong to:

```txt
Finance Infrastructure
Accounting
Execution Kernel
Roles
Organization Settings
Modules
```

## Example Permission

```txt
system-admin.billing.manage
```

Recommended split:

```txt
system-admin.billing.read
system-admin.billing.manage
system-admin.billing.export
```

## Core Principle

Billing answers:

```txt
What commercial rights and obligations exist between this organization and Afenda?
```

## Billing Model

```ts
export type OrganizationSubscription = {
  organizationId: string

  planKey: string

  status:
    | "trial"
    | "active"
    | "past_due"
    | "suspended"
    | "cancelled"

  seatsPurchased: number
  seatsUsed: number

  startsAt: Date
  renewsAt?: Date
}
```

## Billing Categories

### Subscription

Examples:

```txt
Trial
Starter
Professional
Enterprise
Custom Enterprise
```

### Entitlements

Examples:

```txt
Maximum users
Maximum organizations
Advanced workflows
AI features
API access
Audit retention period
```

### Usage

Examples:

```txt
Active users
Storage usage
AI usage
API requests
Document generation
```

### Invoices

Examples:

```txt
Monthly invoice
Annual invoice
Credit note
Adjustment
```

### Payments

Examples:

```txt
Credit card
Bank transfer
Manual invoice
Purchase order
```

## Billing Page

Route:

```txt
/apps/system-admin/billing
```

Purpose:

```txt
Review subscription, entitlements, invoices, and usage.
```

Route adapter: `apps/erp/src/lib/system-admin-sections/billing.server.tsx`

Test IDs:

```txt
system-admin-billing-page
system-admin-billing-access-denied
system-admin-billing-readiness
system-admin-billing-checkout-banner
system-admin-billing-export-button
governed:list-section:system-admin.billing.governance
governed:list-section:system-admin.billing.subscription
```

EUI: section titles use `headingLevel={2}` under the System Admin shell; list surfaces use governed Pattern C metadata.

Next.js MCP verification (dev server `:3000`):

```txt
get_errors → 0 config/session errors after browser session connected
/system-admin/billing → pageRoot visible, 8 governed billing list sections
?checkout=success → checkout banner test id visible
```

E2E: `apps/erp/tests/e2e/system-admin-billing.spec.ts` (project `chromium-system-admin-billing`).

Recommended sections:

```txt
Current Plan
Subscription Status
Entitlements
Usage
Invoices
Payments
Billing Contacts
```

## Entitlement Relationship

```txt
Subscription
  ↓

Entitlements
  ↓

Modules
  ↓

Capabilities
```

Example:

```txt
Enterprise Plan

Includes:
  Advanced Audit
  AI Specialists
  Unlimited Workflow Rules

Execution Kernel:
  recognizes entitlement
```

## Billing Contacts

Owns:

```txt
Primary Billing Contact
Invoice Contact
Procurement Contact
```

These contacts may differ from system administrators.

## Billing Readiness

```ts
export type BillingReadinessVerdict =
  | "ready"
  | "warning"
  | "blocked"
```

Checks:

```txt
Subscription active
Payment method valid
Invoice issues resolved
No entitlement conflicts
```

## Audit Actions

```txt
system-admin.billing.contact.update
system-admin.billing.export
system-admin.billing.subscription.review
```

Commercial events from payment providers should also be auditable.

Audit action keys use hyphenated `system-admin.*` convention (not underscore).

## Package Layout (as-built)

```txt
packages/features/system-admin/src/billing/
  actions/          # Server actions (contacts, export, Stripe checkout/portal)
  components/       # Section, forms, checkout banner, export button
  contracts/        # Posture, subscription, readiness, limits constants
  data/             # Page model, posture query, repositories, shared parsers/builders
  events/           # Audit action key registry
  policies/         # requireSystemAdminBillingRead | Manage | Export
  schemas/          # Zod contact validation
  surface/          # Pattern C list metadata + UI copy
```

Shared helpers (DRY, testable without server context):

```txt
data/system-admin.billing-export.build.server.ts     → buildSystemAdminBillingSummaryCsv
data/system-admin.billing-contacts-form.shared.ts    → parseSystemAdminBillingContactsFormData
data/system-admin.billing-default-plan.shared.ts     → resolveSystemAdminBillingDefaultPlanKey
data/system-admin.billing-checkout-status.shared.ts  → parseSystemAdminBillingCheckoutStatus
contracts/system-admin.billing.limits.shared.ts      → export row limits, default plan key
```

## Export Action Pattern

```ts
export async function exportSystemAdminBillingSummaryAction() {
  const { context, organization } = await requireSystemAdminBillingExport()

  const snapshot = await getBillingPostureSnapshot({
    organizationId: organization.id,
    organizationSlug: organization.slug,
  })

  const { csv, rowCount } = buildSystemAdminBillingSummaryCsv(snapshot)

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminBillingAuditActions.export,
    targetType: "organization_billing",
    targetId: organization.id,
    metadata: { rowCount },
  })

  return systemAdminActionSuccess({ csv, rowCount })
}
```

Contact updates parse `FormData` through `parseSystemAdminBillingContactsFormData` (trimmed optional pairs, Zod-backed) before repository upsert and audit write.

## Safety Rules

Billing must enforce:

1. Billing data is organization-scoped.
2. Payment credentials are never exposed.
3. Subscription status is read-only unless supported by billing provider workflow.
4. Invoice exports are audited.
5. Billing contacts changes are audited.
6. Entitlements originate from billing contracts, not manual admin edits.
7. Billing does not bypass module governance.
8. Billing readiness is visible.

## Definition of Done

Billing is done when:

* administrators can view subscription status
* administrators can view entitlements
* administrators can review usage
* administrators can review invoices
* administrators can review payments
* administrators can manage billing contacts
* billing readiness verdict is visible
* exports are available
* billing changes are audited
* entitlements are visible to module governance

## Minimum Tests

```txt
non-admin cannot view billing
billing contacts update writes audit event
invoice export writes audit event
subscription status visible
usage visible
entitlements visible
billing readiness generated
organization scope enforced
```

Unit coverage:

```txt
tests/unit/system-admin.billing.shared.test.ts   — CSV builder, form parser, plan resolver, checkout status, audit keys
tests/unit/system-admin.billing.test.ts          — readiness posture
tests/unit/billing-stripe-plans.test.ts          — Stripe plan mapping
```

## Final Architecture Statement

Organization Settings answers:

```txt
How does the organization operate?
```

Modules answer:

```txt
What ERP domains are available?
```

Billing answers:

```txt
What commercial rights and entitlements has the organization purchased?
```

Execution Kernel answers:

```txt
How should those entitlements affect execution and availability?
```

Billing becomes Afenda's commercial governance surface, separate from operational governance.
