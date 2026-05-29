import { listHrOvertimeRequestsWindow } from "@afenda/db";
import type {
  HrOvertimeRequestRow,
  HrOvertimeRequestWindow,
} from "../contracts/hr-overtime.contract";

export async function listHrOvertimeRequests(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: HrOvertimeRequestRow["status"];
  employeeId?: string;
  pendingOnly?: boolean;
}): Promise<HrOvertimeRequestWindow> {
  return listHrOvertimeRequestsWindow(input);
}
