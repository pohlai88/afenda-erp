import {
  HrExpenseCommandError,
  getHrExpenseClaimById,
  recordHrExpensePaymentReference,
  sendHrExpenseClaimToPayrollOrAp,
  updateHrExpenseClaimAccountingAllocation,
  type HrExpensePaymentChannel,
} from "@afenda/db";

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

function formatClaimAmount(value: string | null): string {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new HrExpenseCommandError("claim_not_approved");
  }
  return amount.toFixed(2);
}

/** HRM-EXP-022 — integrate approved reimbursement with Payroll or AP. */
export async function sendToPayrollOrAP(
  input: HrExpenseSendToPayrollOrApInput & {
    organizationId: string;
    actorUserId?: string | null;
    ports?: Partial<HrExpensePaymentIntegrationPorts>;
  },
): Promise<HrExpensePaymentIntegrationResult> {
  const ports = { ...defaultPorts, ...input.ports };

  const claim = await getHrExpenseClaimById({
    organizationId: input.organizationId,
    claimId: input.claimId,
  });

  if (!claim) {
    throw new HrExpenseCommandError("claim_not_found");
  }

  if (claim.claimStatus !== "approved") {
    throw new HrExpenseCommandError("claim_not_approved");
  }

  const netPayableAmount = formatClaimAmount(
    claim.approvedAmount ?? claim.claimAmount,
  );
  const paymentChannel = input.paymentChannel as HrExpensePaymentChannel;
  const staged =
    paymentChannel === "payroll"
      ? await ports.payroll.stageReimbursement({
          organizationId: input.organizationId,
          claimId: input.claimId,
          employeeId: claim.employeeId,
          netPayableAmount,
          currencyCode: claim.claimCurrencyCode,
          categoryCode: claim.categoryCode,
        })
      : await ports.accountsPayable.stageVendorPayment({
          organizationId: input.organizationId,
          claimId: input.claimId,
          employeeId: claim.employeeId,
          netPayableAmount,
          currencyCode: claim.claimCurrencyCode,
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
