import { z } from "zod";

import {
  HR_MSC_CERTIFICATION_STATUSES,
  HR_MSC_COMPLIANCE_REFERENCE_TYPES,
  HR_MSC_CORRECTIVE_ACTION_PRIORITIES,
  HR_MSC_CORRECTIVE_ACTION_SOURCE_TYPES,
  HR_MSC_CORRECTIVE_ACTION_STATUSES,
  HR_MSC_ELIGIBILITY_STATUSES,
  HR_MSC_EVIDENCE_TYPES,
  HR_MSC_HAZARD_ASSESSMENT_STATUSES,
  HR_MSC_HAZARD_ASSESSMENT_TYPES,
  HR_MSC_INCIDENT_STATUSES,
  HR_MSC_INCIDENT_TYPES,
  HR_MSC_INTEGRATION_TARGETS,
  HR_MSC_NOTIFICATION_STATUSES,
  HR_MSC_NOTIFICATION_TYPES,
  HR_MSC_OSHA_RECORDKEEPING_FORMS,
  HR_MSC_RESTRICTION_SCOPES,
  HR_MSC_RISK_LEVELS,
  HR_MSC_TRAINING_REQUIREMENT_STATUSES,
  HR_MSC_TRAINING_STATUSES,
  HR_MSC_TRAINING_TYPES,
  HR_MSC_WORK_RESTRICTION_REASONS,
  HR_MSC_WORK_RESTRICTION_STATUSES,
} from "./hr.industry.msc-constants.shared";

const idSchema = z.string().trim().min(1);
const optionalIdSchema = z.string().trim().min(1).optional();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}/);
const dateTimeSchema = z.string().datetime().or(dateSchema);

export const hrMscSafetyTrainingRequirementSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  legalEntity: idSchema,
  country: idSchema,
  siteId: idSchema,
  siteName: idSchema,
  departmentName: idSchema,
  roleName: idSchema,
  machineId: optionalIdSchema,
  machineName: optionalIdSchema,
  workArea: idSchema,
  riskCategory: z.enum(HR_MSC_RISK_LEVELS),
  trainingType: z.enum(HR_MSC_TRAINING_TYPES),
  complianceReferenceType: z.enum(HR_MSC_COMPLIANCE_REFERENCE_TYPES),
  complianceReference: idSchema,
  ppeRequired: z.array(idSchema),
  renewalIntervalMonths: z.number().int().min(0).max(120),
  status: z.enum(HR_MSC_TRAINING_REQUIREMENT_STATUSES),
  effectiveFrom: dateSchema,
});

export const hrMscEmployeeSafetyProfileSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  legalEntity: idSchema,
  country: idSchema,
  siteId: idSchema,
  siteName: idSchema,
  departmentName: idSchema,
  roleName: idSchema,
  managerEmployeeId: idSchema,
  managerDisplayName: idSchema,
  machineId: optionalIdSchema,
  machineName: optionalIdSchema,
  workArea: idSchema,
  hazardExposure: z.array(idSchema),
  riskLevel: z.enum(HR_MSC_RISK_LEVELS),
  matchedRequirementIds: z.array(idSchema),
  requiredTrainingTypes: z.array(z.enum(HR_MSC_TRAINING_TYPES)),
});

export const hrMscTrainingAssignmentSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  requirementRef: idSchema,
  trainingType: z.enum(HR_MSC_TRAINING_TYPES),
  assignedAt: dateSchema,
  dueDate: dateSchema,
  completedAt: dateSchema.optional(),
  status: z.enum(HR_MSC_TRAINING_STATUSES),
  evidenceDocumentRef: optionalIdSchema,
  ppeAcknowledgmentRef: optionalIdSchema,
});

export const hrMscSafetyCertificationSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  certificationType: idSchema,
  machineId: optionalIdSchema,
  workArea: optionalIdSchema,
  issuingAuthority: idSchema,
  issueDate: dateSchema,
  expiryDate: dateSchema,
  renewalDate: dateSchema.optional(),
  status: z.enum(HR_MSC_CERTIFICATION_STATUSES),
  documentRef: optionalIdSchema,
});

export const hrMscHazardAssessmentSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  assessmentType: z.enum(HR_MSC_HAZARD_ASSESSMENT_TYPES),
  siteId: idSchema,
  siteName: idSchema,
  departmentName: idSchema,
  workArea: idSchema,
  machineId: optionalIdSchema,
  machineName: optionalIdSchema,
  roleName: optionalIdSchema,
  taskName: optionalIdSchema,
  riskLevel: z.enum(HR_MSC_RISK_LEVELS),
  status: z.enum(HR_MSC_HAZARD_ASSESSMENT_STATUSES),
  reviewedBy: optionalIdSchema,
  reviewedAt: dateSchema.optional(),
  documentRef: optionalIdSchema,
  requiredControls: z.array(idSchema),
});

export const hrMscWorkplaceIncidentSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  incidentDate: dateSchema,
  siteId: idSchema,
  siteName: idSchema,
  departmentName: idSchema,
  employeeId: optionalIdSchema,
  employeeDisplayName: z.string().trim().min(1).optional(),
  incidentType: z.enum(HR_MSC_INCIDENT_TYPES),
  severity: z.enum(HR_MSC_RISK_LEVELS),
  description: idSchema,
  evidenceDocumentRef: optionalIdSchema,
  status: z.enum(HR_MSC_INCIDENT_STATUSES),
  oshaRecordable: z.boolean(),
  oshaFormRefs: z.array(z.enum(HR_MSC_OSHA_RECORDKEEPING_FORMS)),
  correctiveActionRef: optionalIdSchema,
});

export const hrMscCorrectiveActionSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  sourceType: z.enum(HR_MSC_CORRECTIVE_ACTION_SOURCE_TYPES),
  sourceRef: idSchema,
  ownerEmployeeId: idSchema,
  ownerDisplayName: idSchema,
  dueDate: dateSchema,
  priority: z.enum(HR_MSC_CORRECTIVE_ACTION_PRIORITIES),
  status: z.enum(HR_MSC_CORRECTIVE_ACTION_STATUSES),
  evidenceDocumentRef: optionalIdSchema,
  completedAt: dateSchema.optional(),
});

export const hrMscWorkRestrictionSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  restrictionScope: z.enum(HR_MSC_RESTRICTION_SCOPES),
  restrictionTarget: idSchema,
  reason: z.enum(HR_MSC_WORK_RESTRICTION_REASONS),
  effectiveFrom: dateSchema,
  effectiveTo: dateSchema.optional(),
  status: z.enum(HR_MSC_WORK_RESTRICTION_STATUSES),
  reviewerEmployeeId: optionalIdSchema,
  shiftSchedulingRef: optionalIdSchema,
});

export const hrMscNotificationSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: optionalIdSchema,
  employeeDisplayName: z.string().trim().min(1).optional(),
  notificationType: z.enum(HR_MSC_NOTIFICATION_TYPES),
  recipients: z.array(idSchema),
  targetRef: idSchema,
  dueDate: dateSchema,
  generatedAt: dateTimeSchema,
  status: z.enum(HR_MSC_NOTIFICATION_STATUSES),
});

export const hrMscEvidenceLinkSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: optionalIdSchema,
  employeeDisplayName: z.string().trim().min(1).optional(),
  evidenceType: z.enum(HR_MSC_EVIDENCE_TYPES),
  targetRef: idSchema,
  documentRef: idSchema,
  documentManagementRef: idSchema,
  linkedAt: dateTimeSchema,
  linkedBy: idSchema,
});

export const hrMscIntegrationExposureSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  integrationTarget: z.enum(HR_MSC_INTEGRATION_TARGETS),
  employeeId: optionalIdSchema,
  employeeDisplayName: z.string().trim().min(1).optional(),
  sourceRef: idSchema,
  status: idSchema,
  exposedAt: dateTimeSchema,
  summary: idSchema,
});

export const hrMscSafetyEligibilityRecordSchema = z.object({
  id: idSchema,
  organizationId: idSchema,
  employeeId: idSchema,
  employeeDisplayName: idSchema,
  siteName: idSchema,
  departmentName: idSchema,
  roleName: idSchema,
  managerDisplayName: idSchema,
  eligibilityStatus: z.enum(HR_MSC_ELIGIBILITY_STATUSES),
  flags: z.array(idSchema),
  restrictionRefs: z.array(idSchema),
});

export type HrMscSafetyTrainingRequirementInput = z.infer<
  typeof hrMscSafetyTrainingRequirementSchema
>;
export type HrMscEmployeeSafetyProfileInput = z.infer<
  typeof hrMscEmployeeSafetyProfileSchema
>;
export type HrMscTrainingAssignmentInput = z.infer<
  typeof hrMscTrainingAssignmentSchema
>;
export type HrMscSafetyCertificationInput = z.infer<
  typeof hrMscSafetyCertificationSchema
>;
export type HrMscHazardAssessmentInput = z.infer<
  typeof hrMscHazardAssessmentSchema
>;
export type HrMscWorkplaceIncidentInput = z.infer<
  typeof hrMscWorkplaceIncidentSchema
>;
export type HrMscCorrectiveActionInput = z.infer<
  typeof hrMscCorrectiveActionSchema
>;
export type HrMscWorkRestrictionInput = z.infer<
  typeof hrMscWorkRestrictionSchema
>;
export type HrMscNotificationInput = z.infer<typeof hrMscNotificationSchema>;
export type HrMscEvidenceLinkInput = z.infer<typeof hrMscEvidenceLinkSchema>;
export type HrMscIntegrationExposureInput = z.infer<
  typeof hrMscIntegrationExposureSchema
>;
export type HrMscSafetyEligibilityRecordInput = z.infer<
  typeof hrMscSafetyEligibilityRecordSchema
>;

export const hrIndustryMscListRowSchema = z.object({
  id: z.string().min(1),
  cells: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null()]),
  ),
  rowHref: z.string().optional(),
  rowTone: z.enum(["attention", "critical"]).optional(),
});

export type HrIndustryMscListRowInput = z.infer<
  typeof hrIndustryMscListRowSchema
>;
