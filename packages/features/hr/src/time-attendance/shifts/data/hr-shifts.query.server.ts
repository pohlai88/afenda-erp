import {
  listHrShiftAssignmentsWindow,
  listHrShiftTemplatesWindow,
} from "@afenda/db";
import type {
  HrShiftAssignmentRow,
  HrShiftAssignmentWindow,
  HrShiftTemplateWindow,
} from "../contracts/hr-shifts.contract";

export async function listHrShiftAssignments(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: HrShiftAssignmentRow["status"];
  employeeId?: string;
  scheduledOnly?: boolean;
  cancellableOnly?: boolean;
}): Promise<HrShiftAssignmentWindow> {
  return listHrShiftAssignmentsWindow(input);
}

export async function listHrShiftTemplates(input: {
  organizationId: string;
  limit?: number;
  search?: string;
  activeOnly?: boolean;
}): Promise<HrShiftTemplateWindow> {
  return listHrShiftTemplatesWindow(input);
}
