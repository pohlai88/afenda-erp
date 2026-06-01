import { defineHrSuiteReadPermission } from "../../../hr-suite-integration";
import type {
  HrUcbDownstreamTarget,
  HrUcbDuesStatus,
  HrUcbGrievanceStatus,
  HrUcbRuleType,
} from "../schemas/hr.industry.ucb-constants.shared";

export const hrIndustryUcbReadPermission =
  defineHrSuiteReadPermission("industry.ucb");

export type HrIndustryUcbListCellValue = string | number | boolean | null;

export type HrIndustryUcbListRow = {
  readonly id: string;
  readonly cells: Record<string, HrIndustryUcbListCellValue>;
  readonly rowHref?: string;
  readonly rowTone?: "attention" | "critical";
};

export type HrUcbPayrollDeductionReferenceExport = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly unionId: string;
  readonly bargainingUnitId: string;
  readonly deductionRef: string;
  readonly amountRef: string;
  readonly status: HrUcbDuesStatus;
};

export type HrUcbRuleReferenceExport = {
  readonly id: string;
  readonly agreementId: string;
  readonly ruleType: HrUcbRuleType;
  readonly sourceRef: string;
  readonly downstreamTargets: readonly HrUcbDownstreamTarget[];
  readonly status: "ready" | "exposed" | "blocked";
};

export type HrUcbGrievanceWorkflowReference = {
  readonly id: string;
  readonly employeeId: string;
  readonly bargainingUnitId: string;
  readonly agreementId: string;
  readonly agreementClause: string;
  readonly stepLevel: number;
  readonly deadlineDate: string;
  readonly escalationLevel: number;
  readonly status: HrUcbGrievanceStatus;
};

export type HrUcbSeniorityDecisionReference = {
  readonly id: string;
  readonly employeeId: string;
  readonly employeeDisplayName: string;
  readonly bargainingUnitId: string;
  readonly agreementId: string;
  readonly rank: number;
  readonly seniorityDate: string;
  readonly decisionTypes: readonly string[];
};

export type HrUcbIntegrationExposureReference = {
  readonly id: string;
  readonly integrationTarget: HrUcbDownstreamTarget;
  readonly sourceRef: string;
  readonly summary: string;
  readonly employeeId?: string;
  readonly status: "ready" | "exposed" | "blocked";
};
