import {
  __IDENTIFIER_CAMEL__AuditTrailSurfaceKey,
  __IDENTIFIER_CAMEL__WorkbenchSurfaceKey,
  type __IDENTIFIER__ListSurfaceKey,
} from "./__DOMAIN_KEY__-surface-metadata.shared";

export const __IDENTIFIER_CAMEL__UiCopy = {
  title: "__CAPABILITY_TITLE__",
  description:
    "Scaffolded HR Suite workbench for __CAPABILITY_TITLE__. Replace seed records with architecture-approved domain records before shipping.",
  page: {
    title: "__CAPABILITY_TITLE__",
    description:
      "__CAPABILITY_TITLE__ governed workspace with server-window lists, KPI metadata, search contracts, access policy hooks, and audit-ready scaffolding.",
  },
  overview: {
    sectionTitle: "__CAPABILITY_TITLE__ Control",
    records: "Records",
    active: "Active",
    attention: "Needs attention",
  },
  listSections: {
    [__IDENTIFIER_CAMEL__WorkbenchSurfaceKey]: {
      title: "__CAPABILITY_TITLE__ Workbench",
      description:
        "Server-owned workbench rows for __CAPABILITY_TITLE__. Replace with requirement-specific list surfaces as the module moves to shipped.",
      emptyTitle: "No __CAPABILITY_TITLE__ records",
      emptyDescription:
        "Create requirement-specific records from the architecture before shipping this slice.",
    },
    [__IDENTIFIER_CAMEL__AuditTrailSurfaceKey]: {
      title: "Audit Trail",
      description:
        "Scaffold audit events for controlled __CAPABILITY_TITLE__ actions. Replace action names with domain-specific audit events before shipping.",
      emptyTitle: "No audit events",
      emptyDescription:
        "Audit rows appear after controlled actions are implemented.",
    },
  } satisfies Record<
    __IDENTIFIER__ListSurfaceKey,
    {
      readonly title: string;
      readonly description: string;
      readonly emptyTitle: string;
      readonly emptyDescription: string;
    }
  >,
  workbench: {
    title: "__CAPABILITY_TITLE__ Workbench",
    description:
      "Metadata-driven scaffold list with bounded server-window rows.",
  },
  accessDenied: {
    title: "__CAPABILITY_TITLE__ access required",
    description: "You do not have permission to view this HR workspace.",
  },
} as const;
