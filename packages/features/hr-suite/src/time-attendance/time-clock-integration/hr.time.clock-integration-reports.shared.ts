/** HRM-TCI-028 — exportable time clock report kinds. */
export const HR_TIME_CLOCK_REPORT_KINDS = [
  "punches",
  "exceptions",
  "sync",
  "devices",
] as const;

export type HrTimeClockReportKind =
  (typeof HR_TIME_CLOCK_REPORT_KINDS)[number];

export type HrTimeClockReportCsvResult = {
  reportKind: HrTimeClockReportKind;
  rowCount: number;
  mimeType: "text/csv;charset=utf-8";
  fileExtension: "csv";
  content: string;
};

export function buildTimeClockReportCsv(input: {
  reportKind: HrTimeClockReportKind;
  headers: readonly string[];
  rows: readonly (readonly string[])[];
}): HrTimeClockReportCsvResult {
  const lines = [
    input.headers.join(","),
    ...input.rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
    ),
  ];

  return {
    reportKind: input.reportKind,
    rowCount: input.rows.length,
    mimeType: "text/csv;charset=utf-8",
    fileExtension: "csv",
    content: lines.join("\n"),
  };
}
