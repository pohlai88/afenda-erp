export type HrComplianceObligationStatus = "active" | "archived";

export type HrComplianceObligationRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  complianceArea: string;
  requirementKind: string;
  status: HrComplianceObligationStatus;
  departmentName: string | null;
  dueDate: Date | null;
};

export type HrComplianceObligationWindow = {
  rows: readonly HrComplianceObligationRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrComplianceExceptionSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type HrComplianceExceptionStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "waived";

export type HrComplianceExceptionRow = {
  id: string;
  employeeId: string | null;
  employeeNumber: string | null;
  employeeDisplayName: string | null;
  complianceArea: string;
  itemType: string;
  title: string;
  severity: HrComplianceExceptionSeverity;
  status: HrComplianceExceptionStatus;
  correctiveActionDueDate: Date | null;
  createdAt: Date;
};

export type HrComplianceExceptionWindow = {
  rows: readonly HrComplianceExceptionRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};
