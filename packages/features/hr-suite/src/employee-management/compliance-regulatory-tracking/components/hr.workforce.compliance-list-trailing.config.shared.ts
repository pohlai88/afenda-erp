import type { HrComplianceDocumentPickerOption } from "../data/hr.workforce.compliance-evidence-links.shared";

export type ComplianceTrailingSelectFieldConfig = {
  kind: "select";
  name: string;
  label: string;
  options: readonly string[];
  defaultValue?: string;
  defaultFromCell?: string;
};

export type ComplianceTrailingTextFieldConfig = {
  kind: "text";
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  defaultFromCell?: string;
};

export type ComplianceTrailingDateTimeFieldConfig = {
  kind: "datetime-local";
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  defaultFromCell?: string;
};

export type ComplianceTrailingLabeledSelectFieldConfig = {
  kind: "labeled-select";
  name: string;
  label: string;
  options: readonly { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  defaultFromCell?: string;
};

export type ComplianceTrailingFieldConfig =
  | ComplianceTrailingSelectFieldConfig
  | ComplianceTrailingLabeledSelectFieldConfig
  | ComplianceTrailingTextFieldConfig
  | ComplianceTrailingDateTimeFieldConfig;

export type ComplianceTrailingActionConfig = {
  submitLabel: string;
  buttonVariant?: "default" | "secondary" | "outline";
  hiddenFieldName: string;
  fields: ComplianceTrailingFieldConfig[];
};

type CertificationRequirementTrailingCopy = {
  trailingUpdateStatusLabel: string;
  trailingCertificationExpiryLabel: string;
  trailingCertificationExpiryPlaceholder: string;
  trailingReviewNotesPlaceholder: string;
};

export type ComplianceExceptionTrailingActionKey =
  | "assign"
  | "progress"
  | "resolve"
  | "waive";

export type ComplianceExceptionTrailingActionConfig =
  ComplianceTrailingActionConfig & {
    actionKey: ComplianceExceptionTrailingActionKey;
    showWhen?: (status: string) => boolean;
  };

type ComplianceEmployeePickerOption = {
  value: string;
  label: string;
};

/** Shared Pattern C trailing fields for compliance exception corrective actions. */
export function buildExceptionTrailingActions(
  copy: {
    trailingAssignLabel: string;
    trailingProgressLabel: string;
    trailingResolveLabel: string;
    trailingWaiveLabel: string;
    colDue: string;
    trailingCorrectiveOwnerLabel: string;
    trailingCorrectiveOwnerPlaceholder: string;
    trailingCorrectiveDescriptionLabel: string;
    trailingCorrectiveDescriptionPlaceholder: string;
    trailingCorrectiveDuePlaceholder: string;
    trailingProgressNoteLabel: string;
    trailingProgressPlaceholder: string;
    trailingResolutionNoteLabel: string;
    trailingResolutionPlaceholder: string;
    trailingWaiverReasonLabel: string;
    trailingWaiverReasonPlaceholder: string;
    trailingApprovalReferenceLabel: string;
    trailingApprovalReferencePlaceholder: string;
  },
  employeeOptions: readonly ComplianceEmployeePickerOption[],
): ComplianceExceptionTrailingActionConfig[] {
  return [
    {
      actionKey: "assign",
      submitLabel: copy.trailingAssignLabel,
      buttonVariant: "default",
      hiddenFieldName: "exceptionId",
      fields: [
        {
          kind: "text",
          name: "correctiveActionDescription",
          label: copy.trailingCorrectiveDescriptionLabel,
          required: true,
          placeholder: copy.trailingCorrectiveDescriptionPlaceholder,
          defaultFromCell: "correctiveActionDescriptionValue",
        },
        {
          kind: "labeled-select",
          name: "correctiveActionOwnerEmployeeId",
          label: copy.trailingCorrectiveOwnerLabel,
          required: true,
          placeholder: copy.trailingCorrectiveOwnerPlaceholder,
          options: employeeOptions,
          defaultFromCell: "correctiveActionOwnerEmployeeIdValue",
        },
        {
          kind: "datetime-local",
          name: "correctiveActionDueDate",
          label: copy.colDue,
          required: true,
          placeholder: copy.trailingCorrectiveDuePlaceholder,
          defaultFromCell: "correctiveActionDueDateInput",
        },
      ],
    },
    {
      actionKey: "progress",
      submitLabel: copy.trailingProgressLabel,
      hiddenFieldName: "exceptionId",
      showWhen: (status) => status === "in_progress",
      fields: [
        {
          kind: "text",
          name: "progressNote",
          label: copy.trailingProgressNoteLabel,
          required: true,
          placeholder: copy.trailingProgressPlaceholder,
        },
      ],
    },
    {
      actionKey: "resolve",
      submitLabel: copy.trailingResolveLabel,
      hiddenFieldName: "exceptionId",
      fields: [
        {
          kind: "text",
          name: "resolutionNote",
          label: copy.trailingResolutionNoteLabel,
          placeholder: copy.trailingResolutionPlaceholder,
        },
      ],
    },
    {
      actionKey: "waive",
      submitLabel: copy.trailingWaiveLabel,
      buttonVariant: "outline",
      hiddenFieldName: "exceptionId",
      fields: [
        {
          kind: "text",
          name: "waiverReason",
          label: copy.trailingWaiverReasonLabel,
          required: true,
          placeholder: copy.trailingWaiverReasonPlaceholder,
        },
        {
          kind: "text",
          name: "approvalReference",
          label: copy.trailingApprovalReferenceLabel,
          required: true,
          placeholder: copy.trailingApprovalReferencePlaceholder,
        },
      ],
    },
  ];
}

export function buildCertificationRequirementTrailingFields(
  copy: CertificationRequirementTrailingCopy,
  statusOptions: readonly string[],
): ComplianceTrailingFieldConfig[] {
  return [
    {
      kind: "select",
      name: "status",
      label: copy.trailingUpdateStatusLabel,
      options: statusOptions,
      defaultFromCell: "trailingStatusValue",
      defaultValue: "pending",
    },
    {
      kind: "datetime-local",
      name: "certificationExpiresAt",
      label: copy.trailingCertificationExpiryLabel,
      defaultFromCell: "dueDateInput",
      placeholder: copy.trailingCertificationExpiryPlaceholder,
    },
    {
      kind: "text",
      name: "reviewNotes",
      label: copy.trailingReviewNotesPlaceholder,
      placeholder: copy.trailingReviewNotesPlaceholder,
      defaultFromCell: "reviewNotesValue",
    },
  ];
}

type EvidenceLinksTrailingCopy = {
  trailingUpdateStateLabel: string;
  trailingUnlinkLabel: string;
  trailingSubmissionStateLabel: string;
  trailingNotesPlaceholder: string;
};

/** Pattern C trailing fields for the evidence link register (HRM-CMP-020). */
export function buildEvidenceLinksTrailingActions(
  copy: EvidenceLinksTrailingCopy,
  submissionStateOptions: readonly string[],
): ComplianceTrailingActionConfig[] {
  return [
    {
      submitLabel: copy.trailingUpdateStateLabel,
      buttonVariant: "default",
      hiddenFieldName: "evidenceLinkId",
      fields: [
        {
          kind: "select",
          name: "submissionState",
          label: copy.trailingSubmissionStateLabel,
          options: submissionStateOptions,
          defaultFromCell: "trailingSubmissionStateValue",
          defaultValue: "draft",
        },
        {
          kind: "text",
          name: "notes",
          label: copy.trailingNotesPlaceholder,
          placeholder: copy.trailingNotesPlaceholder,
          defaultFromCell: "notesValue",
        },
      ],
    },
    {
      submitLabel: copy.trailingUnlinkLabel,
      buttonVariant: "outline",
      hiddenFieldName: "evidenceLinkId",
      fields: [],
    },
  ];
}

type LinkEvidenceTrailingCopy = {
  trailingLinkLabel: string;
  trailingDocumentLabel: string;
  trailingDocumentPlaceholder: string;
  trailingLinkNotesPlaceholder: string;
};

export function buildLinkEvidenceTrailingFields(
  copy: LinkEvidenceTrailingCopy,
  documentOptions: readonly HrComplianceDocumentPickerOption[],
): ComplianceTrailingFieldConfig[] {
  const pickerOptions = documentOptions.map(({ value, label }) => ({
    value,
    label,
  }));

  return [
    {
      kind: "labeled-select",
      name: "employeeDocumentId",
      label: copy.trailingDocumentLabel,
      required: true,
      placeholder: copy.trailingDocumentPlaceholder,
      options: pickerOptions,
    },
    {
      kind: "text",
      name: "notes",
      label: copy.trailingLinkNotesPlaceholder,
      placeholder: copy.trailingLinkNotesPlaceholder,
    },
  ];
}
