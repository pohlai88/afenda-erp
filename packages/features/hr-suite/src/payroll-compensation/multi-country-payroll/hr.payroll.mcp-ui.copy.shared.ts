export const hrMcpUiCopy = {
  page: {
    title: "Multi-Country Payroll",
    description:
      "Country payroll configuration, statutory rules, rule versioning, cross-country reporting, and audit trail.",
  },
  accessDenied: {
    title: "Multi-country payroll access restricted",
    description: "You need hr.mcp.read to view country payroll configuration.",
  },
  statutoryAccessDenied: {
    title: "Statutory rule modification restricted",
    description:
      "Only payroll administrators with hr.mcp.statutory.admin may modify country statutory rules.",
  },
  countryConfigs: {
    surfaceHeaderTitle: "Country payroll configurations",
    searchLabel: "Search countries",
    searchPlaceholder: "Country code, name…",
    emptyTitle: "No country payroll configurations",
    emptyDescription:
      "Configure payroll rules, currencies, and statutory settings by country.",
    colCountry: "Country",
    colName: "Name",
    colCurrency: "Currency",
    colActive: "Status",
  },
  ruleVersions: {
    surfaceHeaderTitle: "Country rule versions",
    searchLabel: "Search rule versions",
    searchPlaceholder: "Version, status…",
    emptyTitle: "No rule versions",
    emptyDescription:
      "Create draft rule versions and publish when ready for payroll processing.",
    colVersion: "Version",
    colStatus: "Status",
    colEffectiveFrom: "Effective from",
    colEffectiveTo: "Effective to",
    colPublishedAt: "Published",
  },
  crossCountryCost: {
    surfaceHeaderTitle: "Cross-country employer cost",
    searchLabel: "Search cost lines",
    searchPlaceholder: "Country, entity, currency…",
    emptyTitle: "No cross-country cost lines",
    emptyDescription:
      "Consolidated employer payroll cost by country, legal entity, currency, pay group, and period.",
    colCountry: "Country",
    colEntity: "Legal entity",
    colPayGroup: "Pay group",
    colCurrency: "Currency",
    colEmployerCost: "Employer cost",
    colHeadcount: "Headcount",
  },
  auditTrail: {
    surfaceHeaderTitle: "Country payroll audit trail",
    searchLabel: "Search audit events",
    searchPlaceholder: "Action, summary, payroll run…",
    emptyTitle: "No audit events",
    emptyDescription:
      "Setup changes, rule updates, statutory calculations, filing exports, and localization changes.",
    colAction: "Action",
    colSummary: "Summary",
    colActor: "Actor",
    colOccurredAt: "Occurred",
    colPayrollRun: "Payroll run",
  },
} as const;
