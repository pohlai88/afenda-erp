import {
  HR_COMPLIANCE_EVIDENCE_SUBMISSION_STATES,
  type HrComplianceEvidenceSubmissionState,
} from "@afenda/db";

export {
  HR_COMPLIANCE_EVIDENCE_RECORD_KINDS,
  HR_COMPLIANCE_EVIDENCE_SUBMISSION_STATES,
  type HrComplianceEvidenceRecordKind,
  type HrComplianceEvidenceSubmissionState,
} from "@afenda/db";

/** Serializable document picker row for evidence link forms and trailing actions. */
export type HrComplianceDocumentPickerOption = {
  value: string;
  label: string;
  employeeId: string;
};

/** Stored submission states accepted by trailing update forms (HRM-CMP-020). */
export const HRM_COMPLIANCE_EVIDENCE_STORED_SUBMISSION_STATES =
  HR_COMPLIANCE_EVIDENCE_SUBMISSION_STATES satisfies readonly HrComplianceEvidenceSubmissionState[];
