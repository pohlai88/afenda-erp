import { z } from "zod";

import {
  HRM_COMPLIANCE_AREAS,
  HRM_COMPLIANCE_EXCEPTION_SEVERITIES,
} from "../data/hr.workforce.compliance-status.shared";
import { hrComplianceFormDateTimeInput } from "./hr.workforce.compliance-form.shared";

const uuid = z.string().uuid();

export const createHrComplianceExceptionFormSchema = z.object({
  title: z.string().trim().min(1).max(500),
  complianceArea: z.enum(HRM_COMPLIANCE_AREAS),
  itemType: z.string().trim().min(1).max(100),
  severity: z.enum(HRM_COMPLIANCE_EXCEPTION_SEVERITIES).optional(),
  employeeId: uuid.optional(),
  correctiveActionDescription: z.string().trim().max(2000).optional(),
  correctiveActionDueDate: hrComplianceFormDateTimeInput.optional(),
});

export const hrComplianceExceptionIdFormSchema = z.object({
  exceptionId: uuid,
});

export const assignHrComplianceCorrectiveActionFormSchema =
  hrComplianceExceptionIdFormSchema.extend({
    correctiveActionDescription: z.string().trim().min(1).max(2000),
    correctiveActionDueDate: hrComplianceFormDateTimeInput,
  });

export const updateHrComplianceCorrectiveActionProgressFormSchema =
  hrComplianceExceptionIdFormSchema.extend({
    progressNote: z.string().trim().min(1).max(2000),
  });

export const resolveHrComplianceExceptionFormSchema =
  hrComplianceExceptionIdFormSchema.extend({
    resolutionNote: z.string().trim().max(2000).optional(),
  });

export const waiveHrComplianceExceptionFormSchema =
  hrComplianceExceptionIdFormSchema.extend({
    waiverReason: z.string().trim().min(1).max(2000),
    approvalReference: z.string().trim().min(1).max(200),
  });
