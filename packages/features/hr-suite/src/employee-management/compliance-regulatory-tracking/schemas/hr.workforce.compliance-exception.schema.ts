import { z } from "zod";

import {
  HRM_COMPLIANCE_AREAS,
  HRM_COMPLIANCE_EXCEPTION_SEVERITIES,
} from "../data/hr.workforce.compliance-status.shared";
import { hrComplianceFormDateTimeInput, hrComplianceEntityIdSchema } from "./hr.workforce.compliance-form.shared";

export const createHrComplianceExceptionFormSchema = z
  .object({
    title: z.string().trim().min(1).max(500),
    complianceArea: z.enum(HRM_COMPLIANCE_AREAS),
    itemType: z.string().trim().min(1).max(100),
    severity: z.enum(HRM_COMPLIANCE_EXCEPTION_SEVERITIES).optional(),
    employeeId: hrComplianceEntityIdSchema.optional(),
    correctiveActionDescription: z.string().trim().max(2000).optional(),
    correctiveActionOwnerEmployeeId: hrComplianceEntityIdSchema.optional(),
    correctiveActionDueDate: hrComplianceFormDateTimeInput.optional(),
  })
  .superRefine((data, ctx) => {
    const hasOwner = data.correctiveActionOwnerEmployeeId != null;
    const hasDue = data.correctiveActionDueDate != null;
    if (hasOwner !== hasDue) {
      ctx.addIssue({
        code: "custom",
        message: "Corrective action owner and due date must be assigned together.",
        path: ["correctiveActionOwnerEmployeeId"],
      });
    }
  });

export const hrComplianceExceptionIdFormSchema = z.object({
  exceptionId: hrComplianceEntityIdSchema,
});

export const assignHrComplianceCorrectiveActionFormSchema =
  hrComplianceExceptionIdFormSchema.extend({
    correctiveActionDescription: z.string().trim().min(1).max(2000),
    correctiveActionOwnerEmployeeId: hrComplianceEntityIdSchema,
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
