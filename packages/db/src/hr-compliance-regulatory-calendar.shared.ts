export const HR_COMPLIANCE_REGULATORY_CALENDAR_ENTRY_KINDS = [
  "filing",
  "employee_requirement",
  "work_eligibility_renewal",
  "work_auth_renewal",
  "corrective_action",
] as const;

export type HrComplianceRegulatoryCalendarEntryKind =
  (typeof HR_COMPLIANCE_REGULATORY_CALENDAR_ENTRY_KINDS)[number];

/** In-memory merge cap — org-scoped calendar entries stay bounded in practice. */
export const HR_COMPLIANCE_REGULATORY_CALENDAR_MERGE_CAP = 1000;
