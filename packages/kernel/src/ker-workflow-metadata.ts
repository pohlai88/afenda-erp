import type { ModuleId } from "@afenda/config/module-ids";
import type {
  RecoveryPlaybook,
  WorkflowAutomationDefinition,
} from "./ker-module-types";

const recoveryEvidenceModuleIds = [
  "finance",
  "sales",
  "purchasing",
  "inventory",
  "approvals",
  "reports",
] as const satisfies readonly ModuleId[];

export const workflowAutomationDefinitions = [
  {
    id: "approval-sla-sweep",
    name: "Approval SLA sweep",
    schedule: "Daily 00:00 UTC (Vercel cron)",
    status: "healthy",
    detail: "Escalation scan completed without backlog drift.",
  },
  {
    id: "supplier-reminder-dispatch",
    name: "Supplier reminder dispatch",
    schedule: "Daily 01:00 UTC (Vercel cron)",
    status: "watch",
    detail: "One reminder batch exceeded the target send window.",
  },
  {
    id: "report-freshness-sync",
    name: "Report freshness sync",
    schedule: "Daily 02:00 UTC (Vercel cron)",
    status: "healthy",
    detail: "All summary projections refreshed on schedule.",
  },
] as const satisfies readonly WorkflowAutomationDefinition[];

export const recoveryPlaybookDefinitions = [
  {
    id: "negative-pnl",
    label: "Recover negative P&L",
    problem: "Negative P&L",
    diagnosis: "Margin erosion, overdue receivables, cost spikes, stock drag.",
    action:
      "Rank recovery actions with finance, sales, purchasing, and inventory owners.",
    starterPrompt:
      "Run the negative P&L recovery workflow. Diagnose likely root causes, cite finance, sales, purchasing, inventory, approvals, and reports evidence, then propose ranked human-approved recovery actions.",
    iconKey: "trending-down",
    moduleIds: recoveryEvidenceModuleIds,
    problemType: "negative_pnl",
    workflowId: "negative_pnl_recovery",
    risk: "high",
  },
  {
    id: "cash-flow",
    label: "Improve cash flow",
    problem: "Cash-flow pressure",
    diagnosis:
      "Collections, supplier timing, invoice holds, order handoff delay.",
    action:
      "Draft collection, release, and approval follow-ups for human review.",
    starterPrompt:
      "Review cash-flow pressure. Find receivables, order handoff, purchasing, and approval bottlenecks that may improve cash conversion with human-approved actions.",
    iconKey: "banknote",
    moduleIds: ["finance", "sales", "purchasing", "approvals"] as const,
    problemType: "cash_flow",
    workflowId: "cash_flow_recovery",
    risk: "high",
  },
  {
    id: "revenue-leakage",
    label: "Find revenue leakage",
    problem: "Revenue leakage",
    diagnosis:
      "Blocked orders, stalled accounts, receivables drift, and stale reporting signals.",
    action:
      "Prioritize sales, CRM, finance, and reporting follow-ups for human review.",
    starterPrompt:
      "Find revenue leakage across sales, CRM, finance, and reports. Cite tenant evidence and draft ranked recovery actions for approval.",
    iconKey: "chart-line",
    moduleIds: ["sales", "crm", "finance", "reports"] as const,
    problemType: "revenue_leakage",
    workflowId: "revenue_recovery",
    risk: "high",
  },
  {
    id: "cost-drivers",
    label: "Control cost drivers",
    problem: "Cost drivers",
    diagnosis:
      "Supplier holds, stock exposure, invoice holds, and approval delay increasing operating cost.",
    action:
      "Review purchasing, inventory, finance, and approval signals before proposing cost controls.",
    starterPrompt:
      "Identify cost-driver pressure across purchasing, inventory, finance, and approvals. Recommend human-approved cost control actions with evidence.",
    iconKey: "scale",
    moduleIds: ["purchasing", "inventory", "finance", "approvals"] as const,
    problemType: "cost_drivers",
    workflowId: "cost_control",
    risk: "medium",
  },
  {
    id: "inventory",
    label: "Rebalance inventory risk",
    problem: "Inventory risk",
    diagnosis:
      "Overstock, stockout exposure, delayed replenishment, blocked demand.",
    action: "Propose replenishment, liquidation, or transfer reviews.",
    starterPrompt:
      "Assess inventory overstock and stockout risk. Connect inventory, purchasing, and sales signals, then draft a recovery playbook with approval requirements.",
    iconKey: "boxes",
    moduleIds: ["inventory", "purchasing", "sales"] as const,
    problemType: "inventory_risk",
    workflowId: "inventory_rebalance",
    risk: "medium",
  },
  {
    id: "approvals",
    label: "Clear approval bottlenecks",
    problem: "Approval bottleneck",
    diagnosis:
      "Queue depth, escalations, missing owner checks, cycle-time drag.",
    action: "Prepare escalation and request-info proposals with audit context.",
    starterPrompt:
      "Find approval bottlenecks affecting financial recovery, order release, purchasing, HR, or operations. Recommend accountable next actions and human checks.",
    iconKey: "clipboard-check",
    moduleIds: ["approvals", "finance", "purchasing", "hr"] as const,
    problemType: "approval_bottleneck",
    workflowId: "approval_throughput",
    risk: "medium",
  },
  {
    id: "audit-readiness",
    label: "Improve audit readiness",
    problem: "Audit readiness",
    diagnosis:
      "Missing controls evidence, stale reports, unresolved approvals, and incomplete system-admin posture.",
    action:
      "Prepare audit evidence review tasks across reports, finance, approvals, and system admin.",
    starterPrompt:
      "Review audit readiness using reports, finance, approvals, and system-admin evidence. Identify control gaps and propose human-approved remediation steps.",
    iconKey: "shield",
    moduleIds: ["reports", "finance", "approvals", "system-admin"] as const,
    problemType: "audit_readiness",
    workflowId: "audit_readiness",
    risk: "medium",
  },
] as const satisfies readonly RecoveryPlaybook[];

export function getWorkflowAutomationDefinitions() {
  return workflowAutomationDefinitions;
}

export function getRecoveryPlaybookDefinitions() {
  return recoveryPlaybookDefinitions;
}

export function getRecoveryConsoleModuleIds() {
  return recoveryEvidenceModuleIds;
}

export function getRecoveryPlaybookByProblemType(
  problemType: RecoveryPlaybook["problemType"],
) {
  return (
    recoveryPlaybookDefinitions.find(
      (playbook) => playbook.problemType === problemType,
    ) ?? null
  );
}
