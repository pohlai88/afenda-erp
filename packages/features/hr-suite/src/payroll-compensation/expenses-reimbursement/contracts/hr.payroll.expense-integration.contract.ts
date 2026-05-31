import type { HrExpensePaymentChannel } from "../schemas/hr.payroll.expense-constants.shared";

/** HRM-EXP-022 — payroll reimbursement staging request. */
export type HrExpensePayrollIntegrationRequest = {
  organizationId: string;
  claimId: string;
  employeeId: string;
  netPayableAmount: string;
  currencyCode: string;
  categoryCode: string;
  earningsCode?: string;
};

/** HRM-EXP-022 — accounts payable vendor payment staging request. */
export type HrExpenseAccountsPayableIntegrationRequest = {
  organizationId: string;
  claimId: string;
  employeeId: string;
  netPayableAmount: string;
  currencyCode: string;
  vendorReference?: string;
};

export type HrExpensePaymentIntegrationResult = {
  paymentReferenceId: string;
  integrationReference: string;
  paymentChannel: HrExpensePaymentChannel;
};

/** Payroll Processing port — implement in payroll module when linked. */
export interface HrExpensePayrollIntegrationPort {
  stageReimbursement(
    input: HrExpensePayrollIntegrationRequest,
  ): Promise<{ integrationReference: string }>;
}

/** Accounts Payable port — implement in finance/AP module when linked. */
export interface HrExpenseAccountsPayableIntegrationPort {
  stageVendorPayment(
    input: HrExpenseAccountsPayableIntegrationRequest,
  ): Promise<{ integrationReference: string }>;
}

export type HrExpensePaymentIntegrationPorts = {
  payroll: HrExpensePayrollIntegrationPort;
  accountsPayable: HrExpenseAccountsPayableIntegrationPort;
};
