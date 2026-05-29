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

export type ComplianceTrailingFieldConfig =
  | ComplianceTrailingSelectFieldConfig
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

/** Shared Pattern C trailing fields for certification-tracked employee requirements. */
export function buildExceptionTrailingActions(
  copy: {
    trailingAssignLabel: string;
    trailingProgressLabel: string;
    trailingResolveLabel: string;
    trailingWaiveLabel: string;
    colDue: string;
    trailingCorrectiveDescriptionPlaceholder: string;
    trailingCorrectiveDuePlaceholder: string;
    trailingProgressPlaceholder: string;
    trailingResolutionPlaceholder: string;
    trailingWaiverReasonPlaceholder: string;
    trailingApprovalReferencePlaceholder: string;
  },
): ComplianceTrailingActionConfig[] {
  return [
    {
      submitLabel: copy.trailingAssignLabel,
      buttonVariant: "default",
      hiddenFieldName: "exceptionId",
      fields: [
        {
          kind: "text",
          name: "correctiveActionDescription",
          label: copy.trailingAssignLabel,
          required: true,
          placeholder: copy.trailingCorrectiveDescriptionPlaceholder,
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
      submitLabel: copy.trailingProgressLabel,
      hiddenFieldName: "exceptionId",
      fields: [
        {
          kind: "text",
          name: "progressNote",
          label: copy.trailingProgressLabel,
          required: true,
          placeholder: copy.trailingProgressPlaceholder,
        },
      ],
    },
    {
      submitLabel: copy.trailingResolveLabel,
      hiddenFieldName: "exceptionId",
      fields: [
        {
          kind: "text",
          name: "resolutionNote",
          label: copy.trailingResolveLabel,
          placeholder: copy.trailingResolutionPlaceholder,
        },
      ],
    },
    {
      submitLabel: copy.trailingWaiveLabel,
      buttonVariant: "outline",
      hiddenFieldName: "exceptionId",
      fields: [
        {
          kind: "text",
          name: "waiverReason",
          label: copy.trailingWaiverReasonPlaceholder,
          required: true,
          placeholder: copy.trailingWaiverReasonPlaceholder,
        },
        {
          kind: "text",
          name: "approvalReference",
          label: copy.trailingApprovalReferencePlaceholder,
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
