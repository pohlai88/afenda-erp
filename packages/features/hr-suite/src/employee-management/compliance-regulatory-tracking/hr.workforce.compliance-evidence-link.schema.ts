import { z } from "zod";

import {
  HR_COMPLIANCE_EVIDENCE_RECORD_KINDS,
  HRM_COMPLIANCE_EVIDENCE_STORED_SUBMISSION_STATES,
} from "./hr.workforce.compliance-evidence-links.shared";
import { readOptionalComplianceFormField } from "./hr.workforce.compliance-form.shared";

const linkHrComplianceEvidenceFormSchema = z.object({
  recordKind: z.enum(HR_COMPLIANCE_EVIDENCE_RECORD_KINDS),
  recordId: z.string().trim().min(1),
  employeeDocumentId: z.string().trim().min(1),
  notes: z.string().trim().optional(),
});

export function parseLinkHrComplianceEvidenceForm(formData: FormData) {
  return linkHrComplianceEvidenceFormSchema.safeParse({
    recordKind: readOptionalComplianceFormField(formData, "recordKind"),
    recordId: readOptionalComplianceFormField(formData, "recordId"),
    employeeDocumentId: readOptionalComplianceFormField(
      formData,
      "employeeDocumentId",
    ),
    notes: readOptionalComplianceFormField(formData, "notes"),
  });
}

const unlinkHrComplianceEvidenceFormSchema = z.object({
  evidenceLinkId: z.string().trim().min(1),
});

export function parseUnlinkHrComplianceEvidenceForm(formData: FormData) {
  return unlinkHrComplianceEvidenceFormSchema.safeParse({
    evidenceLinkId: readOptionalComplianceFormField(formData, "evidenceLinkId"),
  });
}

const updateHrComplianceEvidenceSubmissionStateFormSchema = z.object({
  evidenceLinkId: z.string().trim().min(1),
  submissionState: z.enum(HRM_COMPLIANCE_EVIDENCE_STORED_SUBMISSION_STATES),
  notes: z.string().trim().optional(),
});

export function parseUpdateHrComplianceEvidenceSubmissionStateForm(
  formData: FormData,
) {
  return updateHrComplianceEvidenceSubmissionStateFormSchema.safeParse({
    evidenceLinkId: readOptionalComplianceFormField(formData, "evidenceLinkId"),
    submissionState: readOptionalComplianceFormField(formData, "submissionState"),
    notes: readOptionalComplianceFormField(formData, "notes"),
  });
}
