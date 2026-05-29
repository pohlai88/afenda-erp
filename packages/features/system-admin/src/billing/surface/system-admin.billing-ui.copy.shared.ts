export const systemAdminBillingUiCopy = {
  page: {
    title: "Billing",
    description:
      "Commercial subscription, entitlements, usage, invoices, and billing contacts for this organization. Marketplace settlement remains in Vercel; Afenda surfaces governance and audit.",
  },
  governance: {
    title: "Billing readiness",
    searchPlaceholder: "Search readiness signals by area or status",
    emptyTitle: "Billing readiness is not available.",
    emptyDescription:
      "Configure Stripe keys and plan price IDs, then sync webhooks to surface billing readiness.",
  },
  subscription: {
    title: "Current plan",
    searchPlaceholder: "Search subscription fields",
    emptyTitle: "Subscription details are not available.",
    emptyDescription:
      "Start a Stripe checkout below or open the customer portal when billing is configured.",
  },
  usage: {
    title: "Usage",
    searchPlaceholder: "Search usage signals by metric or period",
    emptyTitle: "No usage signals recorded for this tenant.",
    emptyDescription:
      "Usage appears after subscription activity or AI Gateway reporting is enabled.",
  },
  entitlements: {
    title: "Entitlements",
    description:
      "Commercial rights sourced from billing contracts and AI feature entitlements. Module governance consumes these signals.",
    searchPlaceholder: "Search entitlements by key or source",
    emptyTitle: "No entitlements are visible for this tenant.",
    emptyDescription:
      "Entitlements sync from billing contracts and Lynx feature registration for this organization.",
  },
  invoices: {
    title: "Invoices",
    description:
      "Invoice history appears when a commercial billing provider is connected. Until then, review Vercel Marketplace billing.",
    searchPlaceholder: "Search invoices by number or status",
    emptyTitle: "No invoices synced to Afenda yet.",
    emptyDescription:
      "Invoices appear after Stripe webhooks sync commercial billing for this tenant.",
  },
  payments: {
    title: "Payments",
    description:
      "Payment method visibility without exposing credentials. Full payment instruments stay with the billing provider.",
    searchPlaceholder: "Search payment methods by type or status",
    emptyTitle: "No payment methods are visible in Afenda.",
    emptyDescription:
      "Open the Stripe customer portal to add or update payment instruments.",
  },
  contacts: {
    title: "Billing contacts",
    formTitle: "Update billing contacts",
    formDescription:
      "Primary, invoice, and procurement contacts may differ from system administrators.",
    searchPlaceholder: "Search contacts by role or email",
    emptyTitle: "No billing contacts configured.",
    emptyDescription:
      "Add primary, invoice, or procurement contacts below when you have system-admin.billing.manage.",
  },
  plans: {
    title: "Subscription plans",
    checkoutTitle: "Subscribe or change plan",
    searchPlaceholder: "Search plans by name or tier",
    emptyTitle: "No Stripe plans are configured for this environment.",
    emptyDescription:
      "Set STRIPE_PRICE_* variables in .env.config and restart the app to list checkout plans.",
    selectLabel: "Plan",
    checkoutHint:
      "Checkout provisions a Stripe subscription for this organization. Seat quantity follows active members.",
  },
  checkout: {
    successTitle: "Subscription checkout completed",
    successDescription:
      "Stripe is processing your subscription. This page updates when webhooks sync billing state.",
    cancelledTitle: "Checkout cancelled",
    cancelledDescription:
      "No subscription was created. Choose a plan and try again when ready.",
  },
  stripe: {
    checkout: "Subscribe with Stripe",
    checkoutPending: "Opening checkout…",
    portal: "Manage billing in Stripe",
    portalPending: "Opening portal…",
    configurationTitle: "Stripe configuration",
    configurationBody:
      "Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .secret.config, plan price IDs (STRIPE_PRICE_HOBBY, TEAM, PRO, BUSINESS) in .env.config, and NEXT_PUBLIC_SITE_URL. Forward webhooks to /api/webhooks/stripe (pnpm stripe:listen).",
  },
  marketplace: {
    title: "AI Gateway usage",
    description:
      "Machine-layer usage signals remain available when AI Gateway credentials are configured.",
    body: "Gateway spend is separate from Stripe subscription billing. Configure AI_GATEWAY_API_KEY for usage reporting.",
  },
  accessDenied: {
    title: "Billing unavailable",
    description:
      "You need system-admin.billing.read to review commercial posture for this organization.",
  },
  export: {
    label: "Export billing summary",
  },
} as const;
