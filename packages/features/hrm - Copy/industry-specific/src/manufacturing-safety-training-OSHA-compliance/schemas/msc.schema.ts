import { z } from "zod"

import {
  hrmMscCorrectiveActionSourceKindSchema,
  hrmMscCorrectivePrioritySchema,
  hrmMscHazardAssessmentTypeSchema,
  hrmMscIncidentTypeSchema,
  hrmMscRegulatoryFrameworkSchema,
  hrmMscRestrictionScopeSchema,
  hrmMscTrainingCategorySchema,
} from "./msc-workflow-state.shared"

export const createMscRequirementRuleFormSchema = z.object({
  siteId: z.string().uuid().nullable().optional(),
  countryCode: z.string().max(8).nullable().optional(),
  legalEntityRef: z.string().max(120).nullable().optional(),
  roleRef: z.string().max(120).nullable().optional(),
  departmentRef: z.string().max(120).nullable().optional(),
  riskCategory: z.string().max(120).nullable().optional(),
  requiresMachineSafety: z.boolean().optional(),
  requiresPpeTraining: z.boolean().optional(),
  requiresPpeAcknowledgment: z.boolean().optional(),
  requiresChemicalHandling: z.boolean().optional(),
  requiresFireSafety: z.boolean().optional(),
  requiresErgonomics: z.boolean().optional(),
  requiresWorkplaceHazard: z.boolean().optional(),
  requiresSafetyCertification: z.boolean().optional(),
})

export const createMscSiteFormSchema = z.object({
  code: z.string().min(1).max(32),
  name: z.string().min(1).max(200),
  countryCode: z.string().max(8).nullable().optional(),
  oshaRecordkeepingEnabled: z.boolean().optional(),
})

export const createMscMachineFormSchema = z.object({
  siteId: z.string().uuid().nullable().optional(),
  code: z.string().min(1).max(32),
  name: z.string().min(1).max(200),
})

export const recordMscTrainingFormSchema = z.object({
  obligationId: z.string().uuid(),
  trainingCategory: hrmMscTrainingCategorySchema,
  completedAt: z.string().min(1),
  ppeAcknowledged: z.boolean().optional(),
})

export const recordMscCertificationFormSchema = z.object({
  obligationId: z.string().uuid(),
  certificationType: z.string().max(120).optional(),
  certificateRef: z.string().max(200).nullable().optional(),
  issueDate: z.string().nullable().optional(),
  expiryDate: z.string().nullable().optional(),
})

export const createMscHazardFormSchema = z.object({
  siteId: z.string().uuid().nullable().optional(),
  assessmentType: hrmMscHazardAssessmentTypeSchema,
  title: z.string().min(1).max(200),
  taskDescription: z.string().max(2000).nullable().optional(),
})

export const createMscIncidentFormSchema = z.object({
  siteId: z.string().uuid().nullable().optional(),
  employeeId: z.string().uuid().nullable().optional(),
  incidentDate: z.string().min(1),
  incidentType: hrmMscIncidentTypeSchema,
  severity: z.string().max(64).nullable().optional(),
  description: z.string().max(4000).nullable().optional(),
})

export const createMscCorrectiveFormSchema = z.object({
  sourceKind: hrmMscCorrectiveActionSourceKindSchema,
  sourceId: z.string().uuid(),
  title: z.string().min(1).max(200),
  priority: hrmMscCorrectivePrioritySchema,
  dueDate: z.string().nullable().optional(),
})

export const linkMscEvidenceFormSchema = z.object({
  employeeId: z.string().uuid().nullable().optional(),
  subjectKind: z.string().min(1).max(64),
  subjectId: z.string().uuid(),
  documentId: z.string().min(1).max(200),
})

export const createMscRegulatoryReferenceFormSchema = z.object({
  framework: hrmMscRegulatoryFrameworkSchema,
  referenceCode: z.string().max(120).nullable().optional(),
  referenceLabel: z.string().max(200).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  siteId: z.string().uuid().nullable().optional(),
  requirementRuleId: z.string().uuid().nullable().optional(),
})

export const createMscWorkRestrictionFormSchema = z.object({
  employeeId: z.string().uuid(),
  obligationId: z.string().uuid().nullable().optional(),
  machineId: z.string().uuid().nullable().optional(),
  restrictionScope: hrmMscRestrictionScopeSchema,
  effectiveFrom: z.string().min(1),
  effectiveTo: z.string().nullable().optional(),
  reason: z.string().max(2000).nullable().optional(),
})
