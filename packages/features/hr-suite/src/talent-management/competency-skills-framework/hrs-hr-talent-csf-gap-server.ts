import {
  analyzeHrCsfEmployeeGapsInTx,
  getHrCsfGapDetail,
  listHrCsfEmployeeGapsWindow,
} from "@afenda/db";
import type {
  AfendaTransaction,
  HrCsfEmployeeGapAnalysisResult,
  HrCsfGapListRow,
} from "@afenda/db";

export type {
  HrCsfEmployeeGapAnalysisResult,
  HrCsfGapListRow,
};

export {
  analyzeHrCsfEmployeeGapsInTx,
  getHrCsfGapDetail,
  listHrCsfEmployeeGapsWindow,
};

export async function analyzeEmployeeSkillAndCompetencyGaps(
  db: AfendaTransaction,
  input: Parameters<typeof analyzeHrCsfEmployeeGapsInTx>[1],
): Promise<HrCsfEmployeeGapAnalysisResult> {
  return analyzeHrCsfEmployeeGapsInTx(db, input);
}
