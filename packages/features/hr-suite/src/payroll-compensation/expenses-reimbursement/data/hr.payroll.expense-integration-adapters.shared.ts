import { createEntityId } from "@afenda/db";

import type {
  HrExpenseAccountsPayableIntegrationPort,
  HrExpenseAccountsPayableIntegrationRequest,
  HrExpensePayrollIntegrationPort,
  HrExpensePayrollIntegrationRequest,
} from "../contracts/hr.payroll.expense-integration.contract";

function buildEarningsCode(categoryCode: string) {
  const normalized = categoryCode.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();
  return `EXP_REIMB_${normalized.slice(0, 24)}`;
}

/** Default Payroll port until Payroll Processing module is linked. */
export const defaultHrExpensePayrollIntegrationPort: HrExpensePayrollIntegrationPort =
  {
    async stageReimbursement(input: HrExpensePayrollIntegrationRequest) {
      void buildEarningsCode(input.categoryCode);
      return {
        integrationReference: createEntityId("pay_exp"),
      };
    },
  };

/** Default AP port until Accounts Payable module is linked. */
export const defaultHrExpenseAccountsPayableIntegrationPort: HrExpenseAccountsPayableIntegrationPort =
  {
    async stageVendorPayment(input: HrExpenseAccountsPayableIntegrationRequest) {
      void input.vendorReference;
      return {
        integrationReference: createEntityId("ap_exp"),
      };
    },
  };
