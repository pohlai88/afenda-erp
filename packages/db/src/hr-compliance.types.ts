import type { HrComplianceObligationScope } from "./hr-compliance-scope.shared";
import {
  hrComplianceEmployeeRequirements,
  hrComplianceExceptions,
  hrComplianceObligations,
  hrComplianceWorkEligibility,
} from "./schema/hr";

export type HrComplianceObligationScopeFields = Omit<
  HrComplianceObligationScope,
  "departmentId"
>;

export type HrComplianceObligationRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  complianceArea: string;
  requirementKind: string;
  status: (typeof hrComplianceObligations.$inferSelect)["status"];
  departmentName: string | null;
  dueDate: Date | null;
} & HrComplianceObligationScopeFields;

export type HrComplianceObligationWindow = {
  rows: readonly HrComplianceObligationRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrComplianceExceptionRow = {
  id: string;
  employeeId: string | null;
  employeeNumber: string | null;
  employeeDisplayName: string | null;
  complianceArea: string;
  itemType: string;
  title: string;
  severity: (typeof hrComplianceExceptions.$inferSelect)["severity"];
  status: (typeof hrComplianceExceptions.$inferSelect)["status"];
  correctiveActionDueDate: Date | null;
  createdAt: Date;
};

export type HrComplianceExceptionWindow = {
  rows: readonly HrComplianceExceptionRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrEmployeeLaborLawRequirementRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  obligationId: string;
  obligationCode: string;
  obligationTitle: string;
  complianceArea: string;
  status: (typeof hrComplianceEmployeeRequirements.$inferSelect)["status"];
  dueDate: Date | null;
  completedAt: Date | null;
  reviewNotes: string | null;
};

export type HrEmployeeLaborLawRequirementWindow = {
  rows: readonly HrEmployeeLaborLawRequirementRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrWorkEligibilityRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  status: (typeof hrComplianceWorkEligibility.$inferSelect)["status"];
  verifiedAt: Date | null;
  expiresAt: Date | null;
  reviewNotes: string | null;
};

export type HrWorkEligibilityWindow = {
  rows: readonly HrWorkEligibilityRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export class HrComplianceCommandError extends Error {
  readonly code:
    | "obligation_not_found"
    | "exception_not_found"
    | "exception_not_open"
    | "requirement_not_found"
    | "work_eligibility_not_found";

  constructor(code: HrComplianceCommandError["code"], message?: string) {
    super(message ?? code);
    this.code = code;
  }
}
