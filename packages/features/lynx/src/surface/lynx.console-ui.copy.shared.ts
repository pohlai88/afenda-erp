import type { NavigationExtension } from "@afenda/kernel";

export const lynxConsoleAgentCopy = {
  title: "Lynx Operator",
  description:
    "Diagnose business problems, cite ERP evidence, and draft human-approved recovery actions.",
  inputPlaceholder: "Describe the business problem you need Afenda to solve...",
  toolRejectReason: "Rejected by Lynx operator.",
} as const;

export const lynxConsoleUxCards = [
  {
    id: "root-causes",
    title: "Root causes",
    description:
      "Lynx identifies drivers, missing data, source modules, and confidence before recommending action.",
    iconKey: "alert-triangle" as const,
  },
  {
    id: "recovery-actions",
    title: "Recovery actions",
    description:
      "Actions are ranked by business impact, owner team, risk, and source records.",
    iconKey: "badge-check" as const,
  },
  {
    id: "approval-boundary",
    title: "Approval boundary",
    description:
      "Sensitive ERP work is drafted only. Tool execution requires an explicit approval response.",
    iconKey: "send" as const,
  },
] as const;

export function getLynxConsoleUxCards() {
  return lynxConsoleUxCards;
}

export const lynxConsoleHeroFallback = {
  title: "Recover business problems with evidence-backed actions",
  description:
    "Afenda connects ERP module signals to recovery playbooks so operators can diagnose root causes, inspect source records, and approve sensitive next actions.",
  statusLabel: "Human approved",
} as const;

export const lynxConsoleMetrics = [
  {
    id: "evidence-records",
    label: "Evidence records",
    detail: "Records available across recovery-focused modules.",
  },
  {
    id: "workflow-items",
    label: "Workflow items",
    detail: "Active work that can influence recovery timing.",
  },
  {
    id: "high-priority",
    label: "High priority",
    detail: "Urgent items that should shape recovery priority.",
  },
  {
    id: "documents",
    label: "Documents",
    detail: "Documents available for review and extraction context.",
  },
] as const;

export const lynxConsoleSections = {
  hero: {
    eyebrow: "Lynx Console",
  },
  playbookCatalog: {
    title: "Recovery playbook catalog",
    description:
      "Curated workflows keep the console focused on solving SME operating problems instead of becoming a generic workflow builder.",
  },
  operationalSkills: {
    title: "Operational skill layer",
    description:
      "Reusable module skills turn context, grounding, confidence, and action sandboxes into repeatable ERP operations.",
  },
  agentWorkspace: {
    title: "Lynx workspace",
    description:
      "Ask Lynx to run a recovery workflow, inspect ERP signals, draft tasks, or prepare a human-approved action proposal.",
  },
  evidenceCoverage: {
    title: "Evidence coverage",
    description:
      "Recovery recommendations are constrained by modules and records available under the current role.",
  },
  aiUsageLedger: {
    title: "Lynx usage ledger",
    description:
      "Lynx runs are tagged by feature, tenant, user, workflow, risk, and model through AI Gateway.",
    emptyRow: ["No usage", "-", "-", "0", "-"] as const,
  },
  connectedModules: {
    title: "Connected ERP modules",
    description:
      "Open the owning workspace before approving a proposed recovery action.",
  },
} as const;

export function getLynxConsoleSection<
  TSection extends keyof typeof lynxConsoleSections,
>(sectionId: TSection) {
  return lynxConsoleSections[sectionId];
}

export const lynxConsolePageMetadata = {
  title: "Lynx Console",
  description:
    "Lynx-native ERP problem solving for evidence-backed recovery plans and human-approved execution.",
} as const;

export function getLynxNavigationExtensionHeroCopy(
  extension: NavigationExtension | null | undefined,
) {
  return {
    title: extension?.label ?? lynxConsoleHeroFallback.title,
    description:
      extension?.description ?? lynxConsoleHeroFallback.description,
    statusLabel:
      extension?.status.label ?? lynxConsoleHeroFallback.statusLabel,
    statusTone: extension?.status.tone ?? ("positive" as const),
  };
}
