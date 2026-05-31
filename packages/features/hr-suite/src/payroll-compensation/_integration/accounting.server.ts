export type AccountingJournalBatchInput = {
  organizationId: string;
  sourceModule: string;
  sourceReference: string;
  totalDebit: number;
  totalCredit: number;
  costCenterAllocations?: Array<{ code: string; amount: number }>;
};

/** Payroll ↔ accounting bridge — implement when finance integration ships. */
export async function createAccountingJournalBatch(
  _input?: AccountingJournalBatchInput,
): Promise<never> {
  throw new Error("HR Suite payroll accounting integration is not implemented.");
}

export async function getAccountingJournalBatchBySource(): Promise<never> {
  throw new Error("HR Suite payroll accounting integration is not implemented.");
}
