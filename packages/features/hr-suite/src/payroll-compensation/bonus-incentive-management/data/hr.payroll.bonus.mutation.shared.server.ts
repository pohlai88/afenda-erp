import {
  buildHrBonusReportCsv,
  lockHrBonusPayoutAfterFinalApprovalInTx,
  runWithOrganizationContext,
  updateHrBonusPayoutAccountingAllocationInTx,
} from "@afenda/db";
import type { HrBonusReportKind } from "@afenda/db";

import { hrPayrollBonusAuditActions } from "../events/hr.payroll.bonus.event";
import type { HrBonusAccountingAllocationInput } from "../schemas/hr.payroll.bonus-accounting.schema";

export async function lockHrBonusPayoutAfterFinalApproval(input: {
  organizationId: string;
  payoutId: string;
  actorUserId?: string | null;
}) {
  return runWithOrganizationContext(input.organizationId, (db) =>
    lockHrBonusPayoutAfterFinalApprovalInTx(db, input),
  );
}

export async function assignHrBonusPayoutAccountingAllocation(input: {
  organizationId: string;
  payoutId: string;
  allocation: HrBonusAccountingAllocationInput;
  actorUserId?: string | null;
  allowLockedOverride?: boolean;
}) {
  const {
    payoutId: _formPayoutId,
    ...allocation
  } = input.allocation;
  void _formPayoutId;
  return runWithOrganizationContext(input.organizationId, (db) =>
    updateHrBonusPayoutAccountingAllocationInTx(db, {
      organizationId: input.organizationId,
      payoutId: input.payoutId,
      allocation,
      actorUserId: input.actorUserId,
      allowLockedOverride: input.allowLockedOverride,
    }),
  );
}

export async function exportHrBonusReport(input: {
  organizationId: string;
  reportKind: HrBonusReportKind;
  canViewSensitive: boolean;
}) {
  const result = await buildHrBonusReportCsv(input);
  return {
    ...result,
    auditAction: hrPayrollBonusAuditActions.report.exported,
  };
}
