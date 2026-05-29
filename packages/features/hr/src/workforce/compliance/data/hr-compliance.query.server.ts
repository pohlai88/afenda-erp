import {
  listHrComplianceExceptionsWindow,
  listHrComplianceObligationsWindow,
} from "@afenda/db";
import type {
  HrComplianceExceptionRow,
  HrComplianceExceptionWindow,
  HrComplianceObligationRow,
  HrComplianceObligationWindow,
} from "../contracts/hr-compliance.contract";

export async function listHrComplianceObligations(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: HrComplianceObligationRow["status"];
  complianceArea?: string;
}): Promise<HrComplianceObligationWindow> {
  const window = await listHrComplianceObligationsWindow(input);

  return {
    rows: window.rows.map((row) => ({
      id: row.id,
      code: row.code,
      title: row.title,
      description: row.description,
      complianceArea: row.complianceArea,
      requirementKind: row.requirementKind,
      status: row.status,
      departmentName: row.departmentName,
      dueDate: row.dueDate,
    })),
    pageSize: window.pageSize,
    totalCount: window.totalCount,
    hasNextPage: window.hasNextPage,
  };
}

export async function listHrComplianceExceptions(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: HrComplianceExceptionRow["status"];
  openOnly?: boolean;
}): Promise<HrComplianceExceptionWindow> {
  const window = await listHrComplianceExceptionsWindow(input);

  return {
    rows: window.rows.map((row) => ({
      id: row.id,
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeDisplayName: row.employeeDisplayName,
      complianceArea: row.complianceArea,
      itemType: row.itemType,
      title: row.title,
      severity: row.severity,
      status: row.status,
      correctiveActionDueDate: row.correctiveActionDueDate,
      createdAt: row.createdAt,
    })),
    pageSize: window.pageSize,
    totalCount: window.totalCount,
    hasNextPage: window.hasNextPage,
  };
}
