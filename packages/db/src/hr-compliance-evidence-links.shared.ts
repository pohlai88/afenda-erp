import type { hrComplianceEvidenceLinks } from "./hr";

export const HR_COMPLIANCE_EVIDENCE_RECORD_KINDS = [
  "filing",
  "employee_requirement",
  "work_auth_document",
  "work_eligibility",
  "exception",
] as const satisfies readonly (typeof hrComplianceEvidenceLinks.$inferSelect)["recordKind"][];

export type HrComplianceEvidenceRecordKind =
  (typeof HR_COMPLIANCE_EVIDENCE_RECORD_KINDS)[number];

export const HR_COMPLIANCE_EVIDENCE_SUBMISSION_STATES = [
  "draft",
  "submitted",
  "acknowledged",
] as const satisfies readonly (typeof hrComplianceEvidenceLinks.$inferSelect)["submissionState"][];

export type HrComplianceEvidenceSubmissionState =
  (typeof HR_COMPLIANCE_EVIDENCE_SUBMISSION_STATES)[number];

export function isHrComplianceEvidenceRecordKind(
  value: string,
): value is HrComplianceEvidenceRecordKind {
  return (HR_COMPLIANCE_EVIDENCE_RECORD_KINDS as readonly string[]).includes(
    value,
  );
}

export function isHrComplianceEvidenceSubmissionState(
  value: string,
): value is HrComplianceEvidenceSubmissionState {
  return (
    HR_COMPLIANCE_EVIDENCE_SUBMISSION_STATES as readonly string[]
  ).includes(value);
}
