import { z } from "zod";

import {
  HR_FHC_ALERT_TYPES,
  HR_FHC_COMPLIANCE_STATUSES,
  HR_FHC_DUTY_RESTRICTION_REASONS,
  HR_FHC_DUTY_RESTRICTION_STATUSES,
  HR_FHC_ELIGIBILITY_STATUSES,
  HR_FHC_EVIDENCE_STATUSES,
  HR_FHC_EVIDENCE_TYPES,
  HR_FHC_MEDICAL_FITNESS_STATUSES,
  HR_FHC_RENEWAL_STATUSES,
  HR_FHC_TRAINING_STATUSES,
  HR_FHC_TRAINING_TYPES,
} from "./hr.industry.fhc-constants.shared";

const idSchema = z.string().trim().min(1);
const optionalIdSchema = z.string().trim().min(1).optional();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}/);
const dateTimeSchema = z.string().datetime().or(dateSchema);

export const hrFhcRequirementRuleSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  country: idSchema,
  legalEntity: idSchema,
  outletId: idSchema,
  outletName: idSchema,
  roleName: idSchema,
  departmentName: idSchema,
  employeeCategory: idSchema,
  employmentType: idSchema,
  requiresFoodHandlerPermit: z.boolean(),
  requiresHealthCertificate: z.boolean(),
  requiresFoodHygieneTraining: z.boolean(),
  requiresAllergenTraining: z.boolean(),
  renewalLeadDays: z.number().int().min(1).max(180),
  status: z.enum(["active", "waived", "retired"]),
  effectiveFrom: dateSchema,
});

export const hrFhcEmployeeRequirementSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  outletId: idSchema,
  outletName: idSchema,
  roleName: idSchema,
  departmentName: idSchema,
  managerEmployeeId: idSchema,
  managerDisplayName: idSchema,
  legalEntity: idSchema,
  employeeCategory: idSchema,
  employmentType: idSchema,
  matchedRuleId: optionalIdSchema,
  assignedFoodHandlingRole: z.boolean(),
  requiresCertification: z.boolean(),
  requiresHealthCertificate: z.boolean(),
  requiresFoodHygieneTraining: z.boolean(),
  requiresAllergenTraining: z.boolean(),
});

export const hrFhcPermitSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  permitNumber: idSchema,
  issuingAuthority: idSchema,
  issueDate: dateSchema,
  expiryDate: dateSchema,
  status: z.enum(HR_FHC_COMPLIANCE_STATUSES),
  documentRef: optionalIdSchema,
  renewalCaseId: optionalIdSchema,
});

export const hrFhcHealthCertificationSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  providerName: idSchema,
  screeningRef: idSchema,
  medicalFitnessStatus: z.enum(HR_FHC_MEDICAL_FITNESS_STATUSES),
  issueDate: dateSchema,
  expiryDate: dateSchema,
  status: z.enum(HR_FHC_COMPLIANCE_STATUSES),
  documentRef: optionalIdSchema,
});

export const hrFhcTrainingCompletionSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  trainingType: z.enum(HR_FHC_TRAINING_TYPES),
  requirementRef: idSchema,
  assignedAt: dateSchema,
  dueDate: dateSchema,
  completedAt: dateSchema.optional(),
  status: z.enum(HR_FHC_TRAINING_STATUSES),
  evidenceDocumentRef: optionalIdSchema,
});

export const hrFhcEvidenceSubmissionSchema = z
  .object({
    id: idSchema,
    organizationId: idSchema,
    employeeId: idSchema,
    employeeDisplayName: idSchema,
    evidenceType: z.enum(HR_FHC_EVIDENCE_TYPES),
    targetRef: idSchema,
    documentRef: idSchema,
    submittedAt: dateTimeSchema,
    submittedBy: idSchema,
    status: z.enum(HR_FHC_EVIDENCE_STATUSES),
    verifiedBy: optionalIdSchema,
    verifiedAt: dateTimeSchema.optional(),
    rejectionReason: z.string().trim().optional(),
  })
  .superRefine((value, context) => {
    if (
      value.status === "rejected" &&
      (!value.rejectionReason || value.rejectionReason.trim().length === 0)
    ) {
      context.addIssue({
        code: "custom",
        message: "Rejected evidence requires a rejection reason.",
        path: ["rejectionReason"],
      });
    }
  });

export const hrFhcRenewalCaseSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  certificateType: z.enum(["food_handler_permit", "health_certificate"]),
  targetRef: idSchema,
  status: z.enum(HR_FHC_RENEWAL_STATUSES),
  dueDate: dateSchema,
  submittedAt: dateTimeSchema.optional(),
  verifiedAt: dateTimeSchema.optional(),
});

export const hrFhcAlertSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  alertType: z.enum(HR_FHC_ALERT_TYPES),
  severity: z.enum(["info", "warning", "critical"]),
  status: z.enum(["open", "queued", "sent", "acknowledged"]),
  targetRef: idSchema,
  dueDate: dateSchema,
  generatedAt: dateTimeSchema,
});

export const hrFhcDutyRestrictionSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  reason: z.enum(HR_FHC_DUTY_RESTRICTION_REASONS),
  effectiveFrom: dateSchema,
  effectiveTo: dateSchema.optional(),
  status: z.enum(HR_FHC_DUTY_RESTRICTION_STATUSES),
  reviewerEmployeeId: optionalIdSchema,
  shiftSchedulingRef: optionalIdSchema,
});

export const hrFhcIntegrationExposureSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  integrationTarget: z.enum([
    "shift_scheduling",
    "compliance_regulatory_tracking",
    "learning_management_system",
    "training_development",
  ]),
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  sourceRef: idSchema,
  status: idSchema,
  exposedAt: dateTimeSchema,
});

export const hrFhcEligibilityRecordSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  complianceStatus: z.enum(HR_FHC_COMPLIANCE_STATUSES),
  eligibilityStatus: z.enum(HR_FHC_ELIGIBILITY_STATUSES),
  restrictionReason: z.enum(HR_FHC_DUTY_RESTRICTION_REASONS).optional(),
  dutyRestrictionRef: optionalIdSchema,
  flags: z.array(idSchema),
});

export type HrFhcRequirementRuleInput = z.infer<
  typeof hrFhcRequirementRuleSchema
>;
export type HrFhcEmployeeRequirementInput = z.infer<
  typeof hrFhcEmployeeRequirementSchema
>;
export type HrFhcPermitInput = z.infer<typeof hrFhcPermitSchema>;
export type HrFhcHealthCertificationInput = z.infer<
  typeof hrFhcHealthCertificationSchema
>;
export type HrFhcTrainingCompletionInput = z.infer<
  typeof hrFhcTrainingCompletionSchema
>;
export type HrFhcEvidenceSubmissionInput = z.infer<
  typeof hrFhcEvidenceSubmissionSchema
>;
export type HrFhcRenewalCaseInput = z.infer<typeof hrFhcRenewalCaseSchema>;
export type HrFhcAlertInput = z.infer<typeof hrFhcAlertSchema>;
export type HrFhcDutyRestrictionInput = z.infer<
  typeof hrFhcDutyRestrictionSchema
>;
export type HrFhcIntegrationExposureInput = z.infer<
  typeof hrFhcIntegrationExposureSchema
>;
export type HrFhcEligibilityRecordInput = z.infer<
  typeof hrFhcEligibilityRecordSchema
>;
