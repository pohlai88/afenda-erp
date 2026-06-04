import type { AppCapability } from "./ker-app-capabilities";
import type { ModuleId } from "@afenda/config/module-ids";

export type ModuleTone = "neutral" | "positive" | "warning";

export type ModuleMetric = {
  label: string;
  value: string;
  detail: string;
  tone: ModuleTone;
};

export type ModuleFocusArea = {
  title: string;
  summary: string;
  bullets: readonly string[];
};

export type ModuleAction = {
  label: string;
  href: string;
};

export type ErpModuleDefinition = {
  id: ModuleId;
  href: `/${string}`;
  label: string;
  navigationLabel: string;
  description: string;
  summary: string;
  ownerTeam: string;
  requiredCapability: AppCapability;
  status: {
    label: string;
    tone: ModuleTone;
  };
  metrics: readonly ModuleMetric[];
  defaultViews: readonly string[];
  actions: readonly ModuleAction[];
  focusAreas: readonly ModuleFocusArea[];
  milestones: readonly string[];
};

export type NavigationExtension = {
  id: string;
  href: `/${string}`;
  label: string;
  description: string;
  requiredCapability: AppCapability;
  status: {
    label: string;
    tone: ModuleTone;
  };
};

export type WorkflowAutomationDefinition = {
  id: string;
  name: string;
  schedule: string;
  status: "healthy" | "watch" | "delayed";
  detail: string;
};

export type RecoveryPlaybookIconKey =
  | "trending-down"
  | "banknote"
  | "boxes"
  | "clipboard-check"
  | "chart-line"
  | "scale"
  | "shield";

export type BusinessProblemType =
  | "negative_pnl"
  | "cash_flow"
  | "revenue_leakage"
  | "cost_drivers"
  | "inventory_risk"
  | "approval_bottleneck"
  | "audit_readiness";

export type SolutionWorkflowId =
  | "negative_pnl_recovery"
  | "cash_flow_recovery"
  | "revenue_recovery"
  | "cost_control"
  | "inventory_rebalance"
  | "approval_throughput"
  | "audit_readiness";

export type RecoveryPlaybook = {
  id: string;
  label: string;
  problem: string;
  diagnosis: string;
  action: string;
  starterPrompt: string;
  iconKey: RecoveryPlaybookIconKey;
  moduleIds: readonly ModuleId[];
  problemType: BusinessProblemType;
  workflowId: SolutionWorkflowId;
  risk: "high" | "medium" | "low";
};
