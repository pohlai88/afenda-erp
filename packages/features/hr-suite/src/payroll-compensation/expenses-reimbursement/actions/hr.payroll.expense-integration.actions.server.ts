"use server";

import {
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

import {
  assignExpenseClaimAccountingAllocation,
  recordPaymentReference,
  sendToPayrollOrAP,
} from "../data/hr.payroll.expense-integration.server";
import { generateExpenseReport } from "../data/hr.payroll.expense-reports.server";
import { toExpenseActionFailure } from "../data/hr.payroll.expense-action-result.shared";
import {
  requireHrExpenseFinanceAccess,
  requireHrExpenseRead,
} from "../policies/hr.payroll.expense-access.policy.server";
import { hrExpenseAccountingAllocationSchema } from "../schemas/hr.payroll.expense-accounting.schema";
import {
  hrExpenseRecordPaymentReferenceSchema,
  hrExpenseSendToPayrollOrApSchema,
} from "../schemas/hr.payroll.expense-payment.schema";
import { hrExpenseReportFilterSchema } from "../schemas/hr.payroll.expense-report.schema";

export async function sendExpenseClaimToPayrollOrApAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireHrExpenseFinanceAccess();
  const parsed = hrExpenseSendToPayrollOrApSchema.safeParse({
    claimId: formData.get("claimId"),
    paymentChannel: formData.get("paymentChannel"),
  });

  if (!parsed.success) {
    return toExpenseActionFailure(parsed.error);
  }

  try {
    const result = await sendToPayrollOrAP({
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      ...parsed.data,
    });
    return actionSuccess(result);
  } catch (error) {
    return toExpenseActionFailure(error);
  }
}

export async function recordExpensePaymentReferenceAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireHrExpenseFinanceAccess();
  const parsed = hrExpenseRecordPaymentReferenceSchema.safeParse({
    claimId: formData.get("claimId"),
    paymentReference: formData.get("paymentReference"),
    paidAt: formData.get("paidAt") || undefined,
  });

  if (!parsed.success) {
    return toExpenseActionFailure(parsed.error);
  }

  try {
    const result = await recordPaymentReference({
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      ...parsed.data,
    });
    return actionSuccess(result);
  } catch (error) {
    return toExpenseActionFailure(error);
  }
}

export async function assignExpenseAccountingAllocationAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireHrExpenseFinanceAccess();
  const parsed = hrExpenseAccountingAllocationSchema.safeParse({
    claimId: formData.get("claimId"),
    legalEntityCode: formData.get("legalEntityCode") || undefined,
    departmentId: formData.get("departmentId") || undefined,
    costCenterCode: formData.get("costCenterCode") || undefined,
    projectCode: formData.get("projectCode") || undefined,
    glReference: formData.get("glReference") || undefined,
  });

  if (!parsed.success) {
    return toExpenseActionFailure(parsed.error);
  }

  try {
    const result = await assignExpenseClaimAccountingAllocation({
      organizationId: guard.organization.id,
      claimId: parsed.data.claimId,
      allocation: parsed.data,
      actorUserId: guard.session.id,
    });
    return actionSuccess(result);
  } catch (error) {
    return toExpenseActionFailure(error);
  }
}

export async function generateExpenseReportAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ content: string; rowCount: number; groupBy: string }>> {
  const guard = await requireHrExpenseRead();
  const parsed = hrExpenseReportFilterSchema.safeParse({
    employeeId: formData.get("employeeId") || undefined,
    departmentId: formData.get("departmentId") || undefined,
    categoryCode: formData.get("categoryCode") || undefined,
    costCenterCode: formData.get("costCenterCode") || undefined,
    projectCode: formData.get("projectCode") || undefined,
    claimStatus: formData.get("claimStatus") || undefined,
    periodStart: formData.get("periodStart") || undefined,
    periodEnd: formData.get("periodEnd") || undefined,
    groupBy: formData.get("groupBy") || undefined,
  });

  if (!parsed.success) {
    return toExpenseActionFailure(parsed.error) as ActionResult<{
      content: string;
      rowCount: number;
      groupBy: string;
    }>;
  }

  try {
    const result = await generateExpenseReport({
      organizationId: guard.organization.id,
      filter: parsed.data,
      canViewSensitive: guard.canViewSensitive || guard.canViewFinance,
    });
    return actionSuccess({
      content: result.content,
      rowCount: result.rowCount,
      groupBy: result.groupBy,
    });
  } catch (error) {
    return toExpenseActionFailure(error) as ActionResult<{
      content: string;
      rowCount: number;
      groupBy: string;
    }>;
  }
}
