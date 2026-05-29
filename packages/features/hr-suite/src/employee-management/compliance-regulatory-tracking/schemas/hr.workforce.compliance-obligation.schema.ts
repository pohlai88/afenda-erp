import { z } from "zod";

import { HRM_COMPLIANCE_AREAS } from "../data/hr.workforce.compliance-status.shared";
import {
  HRM_COMPLIANCE_OBLIGATION_KINDS,
  HRM_COMPLIANCE_OBLIGATION_STATUSES,
} from "../data/hr.workforce.compliance-obligation.shared";
import { hrComplianceFormDateTimeInput, hrComplianceEntityIdSchema } from "./hr.workforce.compliance-form.shared";

const nullableText = z.string().trim().min(1).max(200).optional();

export const upsertHrComplianceObligationFormSchema = z.object({
  code: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(500),
  description: z.string().trim().max(2000).optional(),
  complianceArea: z.enum(HRM_COMPLIANCE_AREAS),
  requirementKind: z.enum(HRM_COMPLIANCE_OBLIGATION_KINDS),
  countryCode: z.string().trim().length(2).toUpperCase().optional(),
  legalEntityCode: nullableText,
  departmentId: hrComplianceEntityIdSchema.optional(),
  workLocationCode: nullableText,
  employmentType: nullableText,
  workerCategory: nullableText,
  dueDate: hrComplianceFormDateTimeInput.optional(),
});

export type UpsertHrComplianceObligationFormInput = z.infer<
  typeof upsertHrComplianceObligationFormSchema
>;

export const archiveHrComplianceObligationFormSchema = z.object({
  obligationId: hrComplianceEntityIdSchema,
  status: z.enum(HRM_COMPLIANCE_OBLIGATION_STATUSES).default("archived"),
});

export type ArchiveHrComplianceObligationFormInput = z.infer<
  typeof archiveHrComplianceObligationFormSchema
>;
