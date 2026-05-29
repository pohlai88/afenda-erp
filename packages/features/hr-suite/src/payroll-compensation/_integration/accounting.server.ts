/** Payroll ↔ accounting bridge — implement when payroll slice ships. */
export async function createAccountingJournalBatch(): Promise<never> {
  throw new Error("HR Suite payroll accounting integration is not implemented.");
}

export async function getAccountingJournalBatchBySource(): Promise<never> {
  throw new Error("HR Suite payroll accounting integration is not implemented.");
}
