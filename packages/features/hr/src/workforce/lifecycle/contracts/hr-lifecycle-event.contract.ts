import type { HrEmploymentStatus } from "../../employees/contracts/hr-employee.contract";

export type HrLifecycleEventRow = {
  id: string;
  kind: string;
  previousStatus: HrEmploymentStatus | null;
  newStatus: HrEmploymentStatus | null;
  effectiveDate: Date;
  reason: string | null;
  approvalReference: string | null;
  createdAt: Date;
};
