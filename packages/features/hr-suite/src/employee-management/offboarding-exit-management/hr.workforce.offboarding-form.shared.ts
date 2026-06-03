import { z } from "zod";

import { hrOffboardingExitTypeSchema } from "./hr.workforce.offboarding-exit-type.schema";

export const hrOffboardingAssetStatusSchema = z.enum([
  "outstanding",
  "returned",
  "damaged",
  "missing",
  "waived",
  "deducted",
]);

export const hrOffboardingRehireEligibilitySchema = z.enum([
  "eligible",
  "conditional",
  "not_eligible",
  "undecided",
]);

export const hrOffboardingStartCaseFormSchema = z.object({
  employeeId: z.string().min(1),
  exitType: hrOffboardingExitTypeSchema,
  reason: z.string().trim().min(1).max(2000),
  effectiveDate: z.coerce.date().optional(),
  noticeStartDate: z.coerce.date().optional(),
  noticeEndDate: z.coerce.date().optional(),
  requiredNoticeDays: z.coerce.number().int().min(0).max(365).optional(),
  lastWorkingDate: z.coerce.date().optional(),
  sensitiveDetails: z.string().trim().max(4000).optional(),
});

export const hrOffboardingClearanceActionFormSchema = z.object({
  itemId: z.string().min(1),
  evidenceNote: z.string().trim().max(2000).optional(),
});

export const hrOffboardingApprovalDecisionFormSchema = z.object({
  stepId: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
});

export const hrOffboardingAssetStatusFormSchema = z.object({
  assetId: z.string().min(1),
  status: hrOffboardingAssetStatusSchema,
  notes: z.string().trim().max(2000).optional(),
});

export const hrOffboardingCaseActionFormSchema = z.object({
  caseId: z.string().min(1),
  reason: z.string().trim().max(2000).optional(),
});

export const hrOffboardingExitInterviewScheduleFormSchema = z.object({
  caseId: z.string().min(1),
  scheduledAt: z.coerce.date(),
});

export const hrOffboardingExitInterviewFeedbackFormSchema = z.object({
  caseId: z.string().min(1),
  feedback: z.string().trim().min(1).max(8000),
});

export const hrOffboardingRehireFormSchema = z.object({
  caseId: z.string().min(1),
  rehireEligibility: hrOffboardingRehireEligibilitySchema,
});

export const hrOffboardingDocumentLinkFormSchema = z.object({
  caseId: z.string().min(1),
  documentKind: z.string().trim().min(1).max(200),
  employeeDocumentId: z.string().trim().optional(),
  externalReference: z.string().trim().max(500).optional(),
});

export const hrOffboardingSettlementBlockerFormSchema = z.object({
  caseId: z.string().min(1),
  blockerCode: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(500),
});

export const hrOffboardingSettlementBlockerResolveFormSchema = z.object({
  blockerId: z.string().min(1),
});

function readOffboardingFormField(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readOptionalDate(formData: FormData, key: string) {
  const raw = readOffboardingFormField(formData, key);
  return raw ? new Date(raw) : undefined;
}

export function parseHrOffboardingStartCaseForm(formData: FormData) {
  return hrOffboardingStartCaseFormSchema.safeParse({
    employeeId: readOffboardingFormField(formData, "employeeId"),
    exitType: readOffboardingFormField(formData, "exitType"),
    reason: readOffboardingFormField(formData, "reason"),
    effectiveDate: readOptionalDate(formData, "effectiveDate"),
    noticeStartDate: readOptionalDate(formData, "noticeStartDate"),
    noticeEndDate: readOptionalDate(formData, "noticeEndDate"),
    requiredNoticeDays: readOffboardingFormField(formData, "requiredNoticeDays"),
    lastWorkingDate: readOptionalDate(formData, "lastWorkingDate"),
    sensitiveDetails: readOffboardingFormField(formData, "sensitiveDetails"),
  });
}

export function parseHrOffboardingClearanceActionForm(formData: FormData) {
  return hrOffboardingClearanceActionFormSchema.safeParse({
    itemId: readOffboardingFormField(formData, "itemId"),
    evidenceNote: readOffboardingFormField(formData, "evidenceNote"),
  });
}

export function parseHrOffboardingApprovalDecisionForm(formData: FormData) {
  return hrOffboardingApprovalDecisionFormSchema.safeParse({
    stepId: readOffboardingFormField(formData, "stepId"),
    decision: readOffboardingFormField(formData, "decision"),
  });
}

export function parseHrOffboardingAssetStatusForm(formData: FormData) {
  return hrOffboardingAssetStatusFormSchema.safeParse({
    assetId: readOffboardingFormField(formData, "assetId"),
    status: readOffboardingFormField(formData, "status"),
    notes: readOffboardingFormField(formData, "notes"),
  });
}

export function parseHrOffboardingCaseActionForm(formData: FormData) {
  return hrOffboardingCaseActionFormSchema.safeParse({
    caseId: readOffboardingFormField(formData, "caseId"),
    reason: readOffboardingFormField(formData, "reason"),
  });
}

export function parseHrOffboardingExitInterviewScheduleForm(formData: FormData) {
  const scheduledAtRaw = readOffboardingFormField(formData, "scheduledAt");
  return hrOffboardingExitInterviewScheduleFormSchema.safeParse({
    caseId: readOffboardingFormField(formData, "caseId"),
    scheduledAt: scheduledAtRaw ? new Date(scheduledAtRaw) : undefined,
  });
}

export function parseHrOffboardingExitInterviewFeedbackForm(formData: FormData) {
  return hrOffboardingExitInterviewFeedbackFormSchema.safeParse({
    caseId: readOffboardingFormField(formData, "caseId"),
    feedback: readOffboardingFormField(formData, "feedback"),
  });
}

export function parseHrOffboardingRehireForm(formData: FormData) {
  return hrOffboardingRehireFormSchema.safeParse({
    caseId: readOffboardingFormField(formData, "caseId"),
    rehireEligibility: readOffboardingFormField(formData, "rehireEligibility"),
  });
}

export function parseHrOffboardingDocumentLinkForm(formData: FormData) {
  return hrOffboardingDocumentLinkFormSchema.safeParse({
    caseId: readOffboardingFormField(formData, "caseId"),
    documentKind: readOffboardingFormField(formData, "documentKind"),
    employeeDocumentId: readOffboardingFormField(formData, "employeeDocumentId"),
    externalReference: readOffboardingFormField(formData, "externalReference"),
  });
}

export function parseHrOffboardingSettlementBlockerForm(formData: FormData) {
  return hrOffboardingSettlementBlockerFormSchema.safeParse({
    caseId: readOffboardingFormField(formData, "caseId"),
    blockerCode: readOffboardingFormField(formData, "blockerCode"),
    title: readOffboardingFormField(formData, "title"),
  });
}

export function parseHrOffboardingSettlementBlockerResolveForm(formData: FormData) {
  return hrOffboardingSettlementBlockerResolveFormSchema.safeParse({
    blockerId: readOffboardingFormField(formData, "blockerId"),
  });
}

export function formatOffboardingEnumLabel(value: string): string {
  return value.replaceAll("_", " ");
}
