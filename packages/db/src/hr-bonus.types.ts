export type HrBonusPayrollPayoutRefRow = {
  id: string;
  payoutId: string;
  payrollPayoutReference: string;
  earningsCode: string;
  amount: string;
  currencyCode: string;
  employeeId: string;
  employeeLabel: string;
  planCode: string;
  planName: string;
  planType: string;
  cycleCode: string;
  payoutDueAt: Date | null;
  syncedAt: Date | null;
};

export type HrBonusAuditTrailWindowRow = {
  id: string;
  action: string;
  summary: string;
  occurredAt: Date;
};

export type HrBonusAuditTrailWindow = {
  rows: readonly HrBonusAuditTrailWindowRow[];
  total: number;
  limit: number;
  offset: number;
};

export type HrBonusReportCsvResult = {
  filename: string;
  contentType: "text/csv";
  content: string;
  rowCount: number;
};
