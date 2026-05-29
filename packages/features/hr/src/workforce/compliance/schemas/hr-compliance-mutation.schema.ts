import { z } from "zod";

export const hrUpsertComplianceObligationActionSchema = z.object({
  code: z.string().trim().min(1).max(64),
  title: z.string().trim().min(1).max(500),
  complianceArea: z.string().trim().min(1).max(200),
  requirementKind: z.string().trim().min(1).max(200),
  description: z.string().trim().max(4000).optional(),
  dueDate: z.coerce.date().optional(),
});

export const hrArchiveComplianceObligationActionSchema = z.object({
  obligationId: z.string().trim().min(1),
});

export const hrCreateComplianceExceptionActionSchema = z.object({
  title: z.string().trim().min(1).max(500),
  complianceArea: z.string().trim().min(1).max(200),
  itemType: z.string().trim().min(1).max(200),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  employeeId: z.string().trim().min(1).optional(),
  correctiveActionDescription: z.string().trim().max(4000).optional(),
  correctiveActionDueDate: z.coerce.date().optional(),
});

export const hrResolveComplianceExceptionActionSchema = z.object({
  exceptionId: z.string().trim().min(1),
  resolutionNote: z.string().trim().max(4000).optional(),
});

export const hrAssignComplianceCorrectiveActionActionSchema = z.object({
  exceptionId: z.string().trim().min(1),
  correctiveActionDescription: z.string().trim().min(1).max(4000),
  correctiveActionDueDate: z.coerce.date(),
});

export const hrUpdateComplianceCorrectiveActionProgressActionSchema = z.object({
  exceptionId: z.string().trim().min(1),
  progressNote: z.string().trim().min(1).max(4000),
});

export const hrWaiveComplianceExceptionActionSchema = z.object({
  exceptionId: z.string().trim().min(1),
  waiverReason: z.string().trim().min(1).max(4000),
  approvalReference: z.string().trim().min(1).max(500),
});
