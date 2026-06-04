import { LYNX_MODULE_ID } from "./lyn-core.contract";
import { lynxConsoleSections } from "./lyn-console-ui.copy.shared";
import {
  buildGovernedListSurface,
  buildGovernedStatGrid,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
  type StatCardConfigurationResolvedInput,
} from "@afenda/governed-surface";

type AiUsageListRow = {
  id: string;
  feature: string;
  model: string;
  status: string;
  totalTokens: string;
  latency: string;
};

type LynxConsoleEvidenceRow = {
  moduleId: string;
  moduleLabel: string;
  recordCount: number;
  workItemCount: number;
  documentCount: number;
  dataSource: string;
};

type RecoveryPlaybookRow = {
  id: string;
  label: string;
  problem: string;
  diagnosis: string;
  action: string;
  risk: string;
};

type OperationalSkillRow = {
  id: string;
  label: string;
  moduleId: string;
  description: string;
  approvalPolicy: string;
};

export type LynxConsoleResolvedMetric = {
  label: string;
  value: string;
  detail: string;
  tone: string;
};

const LYNX_CONSOLE_EVIDENCE_COLUMNS = [
  {
    id: "module",
    header: "Module",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 180,
  },
  { id: "records", header: "Records" },
  { id: "workItems", header: "Work" },
  { id: "documents", header: "Documents" },
  { id: "source", header: "Source", cellKind: { kind: "badge" as const } },
];

const LYNX_CONSOLE_AI_USAGE_COLUMNS = [
  {
    id: "feature",
    header: "Feature",
    priority: "primary" as const,
    pin: "start" as const,
  },
  { id: "model", header: "Model" },
  { id: "status", header: "Status", cellKind: { kind: "badge" as const } },
  { id: "totalTokens", header: "Tokens" },
  { id: "latency", header: "Latency" },
];

const RECOVERY_PLAYBOOK_COLUMNS = [
  {
    id: "label",
    header: "Playbook",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 200,
  },
  { id: "problem", header: "Problem", wrap: true },
  {
    id: "risk",
    header: "Risk",
    cellKind: { kind: "badge" as const, tone: "attention" as const },
  },
  { id: "diagnosis", header: "Diagnosis", wrap: true },
  { id: "action", header: "Recommended action", wrap: true },
];

const OPERATIONAL_SKILL_COLUMNS = [
  {
    id: "label",
    header: "Skill",
    priority: "primary" as const,
    pin: "start" as const,
    wrap: true,
    minWidth: 200,
  },
  { id: "moduleId", header: "Module", cellKind: { kind: "badge" as const } },
  {
    id: "approvalPolicy",
    header: "Approval policy",
    cellKind: { kind: "badge" as const },
  },
  { id: "description", header: "Description", wrap: true },
];

function buildPagination(totalCount: number) {
  return {
    pageSize: Math.max(1, totalCount),
    totalCount,
    hasNextPage: false,
  };
}

function toStatCardTone(tone: string) {
  if (tone === "positive") return "positive" as const;
  if (tone === "warning") return "attention" as const;
  return "default" as const;
}

export const lynxConsoleStatSurfaceKey = "lynx-console-exec-stats";

export function buildLynxConsoleStatGrid(input: {
  metrics: readonly LynxConsoleResolvedMetric[];
}): StatCardConfigurationResolvedInput {
  return buildGovernedStatGrid({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "snapshot-summary",
    presentationProfile: "erp-executive-summary",
    stats: input.metrics.map((metric) => ({
      label: metric.label,
      value: metric.value,
      tone: toStatCardTone(metric.tone),
    })),
  });
}

export function buildLynxConsoleEvidenceListSurface(input: {
  rows: readonly LynxConsoleEvidenceRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.rows;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: LYNX_MODULE_ID,
      object: "evidence",
      function: "read",
    },
    pagination: buildPagination(rows.length),
    surface: {
      header: { title: lynxConsoleSections.evidenceCoverage.title },
      columnsId: "lynx-console-evidence",
      rowKey: "moduleId",
      empty: {
        variant: "muted",
        title: "No recovery modules available",
      },
    },
    columns: LYNX_CONSOLE_EVIDENCE_COLUMNS,
    rows: rows.map((row) => ({
      id: row.moduleId,
      cells: {
        module: row.moduleLabel,
        records: String(row.recordCount),
        workItems: String(row.workItemCount),
        documents: String(row.documentCount),
        source: row.dataSource,
      },
    })),
  });
}

export function buildLynxConsoleAiUsageListSurface(input: {
  events: readonly AiUsageListRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.events;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: LYNX_MODULE_ID,
      object: "ai-usage",
      function: "read",
    },
    pagination: buildPagination(rows.length),
    surface: {
      header: {
        title: lynxConsoleSections.aiUsageLedger.title,
      },
      columnsId: "lynx-console-ai-usage",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: lynxConsoleSections.aiUsageLedger.emptyRow[0],
      },
    },
    columns: LYNX_CONSOLE_AI_USAGE_COLUMNS,
    rows: rows.map((event) => ({
      id: event.id,
      cells: {
        feature: event.feature,
        model: event.model,
        status: event.status,
        totalTokens: event.totalTokens,
        latency: event.latency,
      },
    })),
  });
}

export function getLynxConsoleListSurfaceKeys() {
  return {
    evidence: "lynx.evidence.list",
    aiUsage: "lynx.ai-usage.list",
    playbooks: "lynx.playbooks.list",
    skills: "lynx.skills.list",
  };
}

export function buildLynxRecoveryPlaybookListSurface(input: {
  playbooks: readonly RecoveryPlaybookRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.playbooks;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-exception-table",
    requiresErpPermission: {
      module: LYNX_MODULE_ID,
      object: "recovery-playbooks",
      function: "read",
    },
    pagination: buildPagination(rows.length),
    surface: {
      header: { title: lynxConsoleSections.playbookCatalog.title },
      columnsId: "lynx-console-playbooks",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No recovery playbooks are defined.",
      },
    },
    columns: RECOVERY_PLAYBOOK_COLUMNS,
    rows: rows.map((playbook) => ({
      id: playbook.id,
      cells: {
        label: playbook.label,
        problem: playbook.problem,
        risk: playbook.risk,
        diagnosis: playbook.diagnosis,
        action: playbook.action,
      },
    })),
  });
}

export function buildLynxOperationalSkillsListSurface(input: {
  skills: readonly OperationalSkillRow[];
}): ListSurfaceRendererConfigurationResolvedInput {
  const rows = input.skills;

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: LYNX_MODULE_ID,
      object: "skills",
      function: "read",
    },
    pagination: buildPagination(rows.length),
    surface: {
      header: { title: lynxConsoleSections.operationalSkills.title },
      columnsId: "lynx-console-skills",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No operational skills are available.",
      },
    },
    columns: OPERATIONAL_SKILL_COLUMNS,
    rows: rows.map((skill) => ({
      id: skill.id,
      cells: {
        label: skill.label,
        moduleId: skill.moduleId,
        approvalPolicy: skill.approvalPolicy,
        description: skill.description,
      },
    })),
  });
}
