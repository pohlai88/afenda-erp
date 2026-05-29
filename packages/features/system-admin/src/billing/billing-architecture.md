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
* Webhooks: `POST /api/webhooks/stripe` sync subscription and invoice mirrors.
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
system_admin.billing.manage
```

Recommended split:

```txt
system_admin.billing.read
system_admin.billing.manage
system_admin.billing.export
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
system_admin.billing.contact.update
system_admin.billing.export
system_admin.billing.subscription.review
```

Commercial events from payment providers should also be auditable.

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
