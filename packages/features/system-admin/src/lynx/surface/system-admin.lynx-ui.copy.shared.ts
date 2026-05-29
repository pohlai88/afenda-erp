export const systemAdminLynxUiCopy = {
  page: {
    title: "Lynx operations",
    description: "Org-scoped Lynx governance for the active tenant.",
    metadataDescription:
      "Lynx usage, approvals, sandboxes, and gateway spend for this tenant.",
    knowledgeAdminLinkLabel: "Knowledge admin",
  },
  usage: {
    title: "Lynx usage ledger",
    description:
      "Recent model calls, token totals, and latency for this tenant.",
    searchPlaceholder: "Search usage by feature, model, or status",
    emptyTitle: "No machine usage events recorded yet.",
    emptyDescription:
      "Usage rows appear after Lynx resolves a model call for this tenant.",
  },
  gatewaySpend: {
    title: "Gateway spend",
    searchPlaceholder: "Search gateway spend by model or feature",
    emptyTitleAvailable: "No gateway spend entries for this period.",
    emptyTitleAuthFailed:
      "Gateway API key was rejected. Update AI_GATEWAY_API_KEY from the Vercel AI Gateway console.",
    emptyTitleUnconfigured:
      "Gateway billing credentials are not configured for this environment.",
    emptyDescriptionAvailable:
      "Spend rows appear when AI Gateway reports usage for this tenant.",
    emptyDescriptionAuthFailed:
      "Refresh AI_GATEWAY_API_KEY from the Vercel AI Gateway console, then reload.",
    emptyDescriptionUnconfigured:
      "Configure AI_GATEWAY_API_KEY to surface month-to-date gateway spend.",
    descriptionAuthFailed:
      "Gateway API key was rejected. Refresh AI_GATEWAY_API_KEY from the Vercel AI Gateway console.",
    descriptionAvailable:
      "Month-to-date AI Gateway spend when billing credentials are configured.",
    descriptionFallback:
      "Tenant-scoped usage totals derived from the Lynx usage ledger.",
  },
  entitlements: {
    title: "Lynx feature entitlements",
    description: "Per-tenant enable/disable controls for Lynx features.",
    searchPlaceholder: "Search entitlements by feature or status",
    emptyTitle: "No machine feature entitlement rows found.",
    emptyDescription:
      "Entitlement rows are created when Lynx features are registered for this tenant.",
  },
  approvals: {
    title: "Approval proposals",
    description: "Human-approved Lynx proposals recorded for audit and replay.",
    searchPlaceholder: "Search proposals by action, module, or risk",
    emptyTitle: "No machine approval proposals recorded yet.",
    emptyDescription:
      "Proposals appear when Lynx routes a high-risk action for human approval.",
  },
  sandboxes: {
    title: "Lynx action sandboxes",
    description: "Approve, reject, or discard pending Lynx proposals.",
    searchPlaceholder: "Search sandboxes by title, module, or status",
    emptyTitle: "No Lynx action sandboxes recorded yet.",
    emptyDescription:
      "Sandboxes stage proposed Lynx actions until an operator approves or discards them.",
  },
  evalRuns: {
    title: "Lynx eval runs",
    description:
      "Recall@K, MRR, and evidence overlap from the knowledge substrate.",
  },
  productSurfaces: {
    title: "Lynx product surfaces",
    description: "Outcome monitors and workflow sessions are available in Lynx.",
    runsLinkLabel: "Open Lynx runs",
  },
  accessDenied: {
    title: "Access denied",
    description:
      "You need the system-admin.lynx.read capability to view Lynx operations for this organization.",
  },
} as const;
