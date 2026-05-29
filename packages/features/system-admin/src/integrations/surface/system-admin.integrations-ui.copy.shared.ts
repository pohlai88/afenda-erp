export const systemAdminIntegrationsUiCopy = {
  page: {
    title: "Integrations",
    description:
      "Outbound credentials, webhooks, and SSO metadata. Neon Auth remains the identity authority; secrets are never shown in plain text after issuance.",
  },
  governance: {
    title: "Integration governance",
    searchPlaceholder: "Search governance signals by area or status",
    emptyTitle: "Integration governance is not available.",
    emptyDescription:
      "Governance rows appear when credentials, webhooks, or SSO connections exist for this tenant.",
  },
  credentialPolicy: {
    title: "Credential visibility policy",
    description:
      "Secrets are never shown in lists. Only masked prefixes appear after issuance; full values display once at creation.",
  },
  apiCredentials: {
    title: "API credentials",
    createTitle: "Create API credential",
    emptyTitle: "No API credentials issued.",
    emptyDescription:
      "Issue a credential below when you have system-admin.integrations.manage.",
  },
  webhooks: {
    title: "Webhooks",
    registerTitle: "Register webhook",
    emptyTitle: "No webhooks registered.",
    emptyDescription:
      "Register an endpoint below to receive outbound events for this tenant.",
  },
  deliveries: {
    title: "Webhook deliveries",
    description:
      "Recent delivery attempts. Failed rows indicate connection or endpoint health issues.",
    emptyTitle: "No delivery attempts recorded.",
    emptyDescription:
      "Deliveries appear after webhooks fire; check endpoint health if failures persist.",
  },
  sso: {
    title: "SSO connections",
    formTitle: "SSO connection",
    formDescription:
      "Enabled rows are staged until provider enforcement is activated by auth.",
    emptyTitle:
      "No SSO connections configured (Neon Auth remains authoritative).",
    emptyDescription:
      "Add an SSO connection below; Neon Auth remains the identity authority until enforcement is enabled.",
  },
  recentChanges: {
    title: "Recent integration changes",
    description:
      "Latest audited credential, webhook, and SSO configuration events.",
    searchPlaceholder: "Search integration changes by action or target",
    emptyTitle: "No recent integration configuration changes recorded.",
    emptyDescription:
      "Changes appear here after credentials, webhooks, or SSO settings are updated.",
  },
  accessDenied: {
    title: "Integrations unavailable",
    description:
      "You need system-admin.integrations.read or system-admin.settings.read to review external connectivity.",
  },
} as const;
