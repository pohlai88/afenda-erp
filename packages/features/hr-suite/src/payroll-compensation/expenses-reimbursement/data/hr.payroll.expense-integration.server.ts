import {
  hrExpenseClaims,
  recordHrExpensePaymentReference,
  runWithOrganizationContext,
  sendHrExpenseClaimToPayrollOrAp,
  updateHrExpenseClaimAccountingAllocation,
  type HrExpensePaymentChannel,
} from "@afenda/db";
import { and, eq } from "drizzle-orm";

import type {
  HrExpensePaymentIntegrationPorts,
  HrExpensePaymentIntegrationResult,
} from "../contracts/hr.payroll.expense-integration.contract";
import { hrPayrollExpenseAuditActions } from "../events/hr.payroll.expense.event";
import type { HrExpenseAccountingAllocationInput } from "../schemas/hr.payroll.expense-accounting.schema";
import type {
  HrExpenseRecordPaymentReferenceInput,
  HrExpenseSendToPayrollOrApInput,
} from "../schemas/hr.payroll.expense-payment.schema";
import {
  defaultHrExpenseAccountsPayableIntegrationPort,
  defaultHrExpensePayrollIntegrationPort,
} from "./hr.payroll.expense-integration-adapters.shared";

const defaultPorts: HrExpensePaymentIntegrationPorts = {
  payroll: defaultHrExpensePayrollIntegrationPort,
  accountsPayable: defaultHrExpenseAccountsPayableIntegrationPort,
};

/** HRM-EXP-022 — integrate approved reimbursement with Payroll or AP. */
export async function sendToPayrollOrAP(
  input: HrExpenseSendToPayrollOrApInput & {
    organizationId: string;
    actorUserId?: string | null;
    ports?: Partial<HrExpensePaymentIntegrationPorts>;
  },
): Promise<HrExpensePaymentIntegrationResult> {
  const ports = { ...defaultPorts, ...input.ports };

  const claim = await runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select({
        id: hrExpenseClaims.id,
        employeeId: hrExpenseClaims.employeeId,
        categoryCode: hrExpenseClaims.categoryCode,
        status: hrExpenseClaims.status,
        amountCents: hrExpenseClaims.amountCents,
        currencyCode: hrExpenseClaims.currencyCode,
      })
      .from(hrExpenseClaims)
      .where(
        and(
          eq(hrExpenseClaims.organizationId, input.organizationId),
          eq(hrExpenseClaims.id, input.claimId),
        ),
      )
      .limit(1);
    return row ?? null;
  });

  if (!claim) {
    throw new Error("claim_not_found");
  }

  if (!claim.amountCents || claim.amountCents <= 0) {
    throw new Error("claim_not_approved");
  }

  const netPayableAmount = (claim.amountCents / 100).toFixed(2);
  const paymentChannel = input.paymentChannel as HrExpensePaymentChannel;
  const staged =
    paymentChannel === "payroll"
      ? await ports.payroll.stageReimbursement({
          organizationId: input.organizationId,
          claimId: input.claimId,
          employeeId: claim.employeeId,
          netPayableAmount,
          currencyCode: claim.currencyCode,
          categoryCode: claim.categoryCode,
        })
      : await ports.accountsPayable.stageVendorPayment({
          organizationId: input.organizationId,
          claimId: input.claimId,
          employeeId: claim.employeeId,
          netPayableAmount,
          currencyCode: claim.currencyCode,
        });

  const auditAction =
    paymentChannel === "payroll"
      ? hrPayrollExpenseAuditActions.payment.payrollStaged
      : hrPayrollExpenseAuditActions.payment.apStaged;

  return sendHrExpenseClaimToPayrollOrAp({
    organizationId: input.organizationId,
    claimId: input.claimId,
    paymentChannel,
    integrationReference: staged.integrationReference,
    actorUserId: input.actorUserId,
    auditAction,
  });
}

/** HRM-EXP-023 — record reimbursement payment reference after processing. */
export async function recordPaymentReference(
  input: HrExpenseRecordPaymentReferenceInput & {
    organizationId: string;
    actorUserId?: string | null;
  },
) {
  return recordHrExpensePaymentReference({
    organizationId: input.organizationId,
    claimId: input.claimId,
    paymentReference: input.paymentReference,
    paidAt: input.paidAt,
    actorUserId: input.actorUserId,
    auditAction: hrPayrollExpenseAuditActions.payment.referenceRecorded,
  });
}

/** HRM-EXP-024 — assign accounting allocation dimensions on a claim. */
export async function assignExpenseClaimAccountingAllocation(input: {
  organizationId: string;
  claimId: string;
  allocation: HrExpenseAccountingAllocationInput;
  actorUserId?: string | null;
}) {
  const { claimId: _formClaimId, ...allocation } = input.allocation;
  void _formClaimId;

  return updateHrExpenseClaimAccountingAllocation({
    organizationId: input.organizationId,
    claimId: input.claimId,
    allocation,
    actorUserId: input.actorUserId,
    auditAction: hrPayrollExpenseAuditActions.accounting.allocated,
  });
}
