import { generateHrPayrollJournalRef } from "@afenda/db";

import { createAccountingJournalBatch } from "../_integration/accounting.server";

/** PAY-028 — generate payroll journal / finance posting reference. */
export async function generatePayrollJournalReference(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId: string;
}) {
  const journalRef = await generateHrPayrollJournalRef(input);

  try {
    await createAccountingJournalBatch({
      organizationId: input.organizationId,
      sourceModule: "hr.payroll",
      sourceReference: journalRef.journalReference,
      totalDebit: journalRef.totalDebit,
      totalCredit: journalRef.totalCredit,
      costCenterAllocations: [{ code: "CC-DEFAULT", amount: journalRef.totalDebit }],
    });
  } catch {
    // Finance bridge optional until accounting integration ships.
  }

  return journalRef;
}
