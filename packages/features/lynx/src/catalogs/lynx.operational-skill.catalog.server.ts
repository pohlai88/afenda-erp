import {
  operationalSkillSchema,
  type OperationalModuleId,
  type OperationalSkill,
} from "@afenda/ai/client";

export const operationalSkills = [
  {
    id: "negative-pnl-recovery",
    moduleId: "finance",
    label: "Negative P&L recovery",
    description:
      "Diagnose profitability pressure and draft evidence-backed revenue, cost, cash, and approval actions.",
    problemTypes: ["negative_pnl", "margin_erosion", "cost_overrun"],
    requiredCapabilities: ["finance.view", "dashboard.view"],
    inputSchemaName: "BusinessProblemInput",
    outputSchemaName: "RecoveryPlaybook",
    readToolNames: [
      "analyzeProfitAndLoss",
      "findRevenueLeakage",
      "findCostDrivers",
    ],
    draftToolNames: ["draftRecoveryTasks"],
    approvalToolNames: ["proposeHumanApprovedAction"],
    approvalPolicy: "human-approval-required",
  },
  {
    id: "cash-flow-recovery",
    moduleId: "finance",
    label: "Cash-flow recovery",
    description:
      "Find receivables, purchasing, sales handoff, and approval timing signals that improve cash conversion.",
    problemTypes: ["cash_flow", "receivables_pressure", "payment_delay"],
    requiredCapabilities: ["finance.view", "sales.view", "purchasing.view"],
    inputSchemaName: "BusinessProblemInput",
    outputSchemaName: "RecoveryPlaybook",
    readToolNames: ["reviewCashConversion", "findRevenueLeakage"],
    draftToolNames: ["draftRecoveryTasks"],
    approvalToolNames: ["proposeHumanApprovedAction"],
    approvalPolicy: "human-approval-required",
  },
  {
    id: "revenue-leakage-recovery",
    moduleId: "sales",
    label: "Revenue leakage recovery",
    description:
      "Find blocked orders, stalled accounts, receivables drift, and stale reporting signals before drafting recovery actions.",
    problemTypes: ["revenue_leakage", "order_block", "receivables_drift"],
    requiredCapabilities: ["sales.view", "crm.view", "finance.view"],
    inputSchemaName: "BusinessProblemInput",
    outputSchemaName: "RecoveryPlaybook",
    readToolNames: ["findRevenueLeakage"],
    draftToolNames: ["draftRecoveryTasks"],
    approvalToolNames: ["proposeHumanApprovedAction"],
    approvalPolicy: "human-approval-required",
  },
  {
    id: "cost-driver-control",
    moduleId: "purchasing",
    label: "Cost control",
    description:
      "Review supplier holds, stock exposure, invoice holds, and approval delay before proposing cost controls.",
    problemTypes: ["cost_drivers", "supplier_hold", "invoice_hold"],
    requiredCapabilities: ["purchasing.view", "inventory.view", "finance.view"],
    inputSchemaName: "BusinessProblemInput",
    outputSchemaName: "RecoveryPlaybook",
    readToolNames: ["findCostDrivers"],
    draftToolNames: ["draftRecoveryTasks"],
    approvalToolNames: ["proposeHumanApprovedAction"],
    approvalPolicy: "human-approval-required",
  },
  {
    id: "inventory-risk-rebalance",
    moduleId: "inventory",
    label: "Inventory risk rebalance",
    description:
      "Assess stockout, overstock, purchase dependency, and blocked fulfillment exposure before drafting recovery tasks.",
    problemTypes: ["inventory_risk", "stockout", "overstock"],
    requiredCapabilities: ["inventory.view", "purchasing.view", "sales.view"],
    inputSchemaName: "BusinessProblemInput",
    outputSchemaName: "RecoveryPlaybook",
    readToolNames: ["assessInventoryRisk"],
    draftToolNames: ["draftRecoveryTasks"],
    approvalToolNames: ["proposeHumanApprovedAction"],
    approvalPolicy: "human-approval-required",
  },
  {
    id: "approval-throughput",
    moduleId: "approvals",
    label: "Approval throughput",
    description:
      "Find blocked approvals, draft escalation actions, and preserve the human decision boundary.",
    problemTypes: ["approval_bottleneck", "sla_risk"],
    requiredCapabilities: ["approvals.view"],
    inputSchemaName: "BusinessProblemInput",
    outputSchemaName: "RecoveryPlaybook",
    readToolNames: ["reviewApprovalThroughput"],
    draftToolNames: ["draftRecoveryTasks"],
    approvalToolNames: ["proposeHumanApprovedAction"],
    approvalPolicy: "human-approval-required",
  },
  {
    id: "audit-readiness",
    moduleId: "reports",
    label: "Audit readiness",
    description:
      "Review control evidence, report freshness, unresolved approvals, and system-admin posture before drafting remediation tasks.",
    problemTypes: ["audit_readiness", "control_gap", "report_freshness"],
    requiredCapabilities: ["reports.view", "finance.view", "system-admin.view"],
    inputSchemaName: "BusinessProblemInput",
    outputSchemaName: "RecoveryPlaybook",
    readToolNames: ["reviewAuditReadiness"],
    draftToolNames: ["draftRecoveryTasks"],
    approvalToolNames: ["proposeHumanApprovedAction"],
    approvalPolicy: "human-approval-required",
  },
] as const satisfies readonly OperationalSkill[];

export const stagedOperationalSkills = [
  {
    id: "lms-training-designer",
    moduleId: "lms",
    label: "LMS training designer",
    description:
      "Detect role or compliance skill gaps, design training, draft learner assignments, and prepare schedule proposals.",
    problemTypes: [
      "skill_gap",
      "mandatory_training",
      "certification_expiry",
      "training_schedule",
    ],
    requiredCapabilities: ["lms.view", "hr.view"],
    inputSchemaName: "TrainingNeedAnalysisInput",
    outputSchemaName: "TrainingScheduleProposal",
    readToolNames: ["analyzeTrainingNeeds", "reviewCertificationGaps"],
    draftToolNames: [
      "designTrainingPlan",
      "draftLearnerAssignments",
      "draftTrainingSchedule",
    ],
    approvalToolNames: ["proposeTrainingApproval"],
    approvalPolicy: "human-approval-required",
  },
] as const satisfies readonly OperationalSkill[];

export function getOperationalSkills() {
  return operationalSkills.map((skill) => operationalSkillSchema.parse(skill));
}

export function getStagedOperationalSkills() {
  return stagedOperationalSkills.map((skill) =>
    operationalSkillSchema.parse(skill),
  );
}

export function getOperationalSkillById(skillId: string) {
  return getOperationalSkills().find((skill) => skill.id === skillId);
}

export function getStagedOperationalSkillById(skillId: string) {
  return getStagedOperationalSkills().find((skill) => skill.id === skillId);
}

export function getOperationalSkillsForModule(moduleId: OperationalModuleId) {
  return getOperationalSkills().filter((skill) => skill.moduleId === moduleId);
}

export function getOperationalSkillsForProblem(problemType: string) {
  return getOperationalSkills().filter((skill) =>
    skill.problemTypes.includes(problemType),
  );
}
