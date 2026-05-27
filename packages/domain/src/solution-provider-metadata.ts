import type { ModuleId } from "@afenda/config/module-ids";
import type { BusinessProblemType, SolutionWorkflowId } from "./module-types";

export const businessProblemTypes = [
  "negative_pnl",
  "cash_flow",
  "revenue_leakage",
  "cost_drivers",
  "inventory_risk",
  "approval_bottleneck",
  "audit_readiness",
] as const satisfies readonly BusinessProblemType[];

export const solutionWorkflowIds = [
  "negative_pnl_recovery",
  "cash_flow_recovery",
  "revenue_recovery",
  "cost_control",
  "inventory_rebalance",
  "approval_throughput",
  "audit_readiness",
] as const satisfies readonly SolutionWorkflowId[];

export const solutionToolModuleBindings = {
  analyzeProfitAndLoss: [
    "finance",
    "sales",
    "purchasing",
    "inventory",
    "approvals",
    "reports",
  ],
  findRevenueLeakage: ["sales", "crm", "finance", "reports"],
  findCostDrivers: ["purchasing", "inventory", "finance", "approvals"],
  reviewCashConversion: ["finance", "sales", "purchasing", "approvals"],
  assessInventoryRisk: ["inventory", "purchasing", "sales"],
  reviewApprovalThroughput: ["approvals", "finance", "purchasing", "hr"],
  reviewAuditReadiness: ["reports", "finance", "approvals", "admin"],
} as const satisfies Record<string, readonly ModuleId[]>;

export function getBusinessProblemTypeLabels() {
  return businessProblemTypes.map((problemType) =>
    problemType.replaceAll("_", " "),
  );
}

export function getSolutionToolModuleBindings() {
  return solutionToolModuleBindings;
}
