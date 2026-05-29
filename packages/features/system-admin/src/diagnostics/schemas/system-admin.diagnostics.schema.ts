import { z } from "zod";

export const diagnosticSeveritySchema = z.enum(["info", "warning", "blocked"]);

export const governanceHealthVerdictSchema = z.enum([
  "healthy",
  "warning",
  "blocked",
]);

export const systemAdminDiagnosticCategorySchema = z.enum([
  "permission_coverage",
  "capability_status",
  "module_health",
  "policy_drift",
  "approval_drift",
  "audit_coverage",
  "security_posture",
  "role_coverage",
  "integration_health",
]);

export const systemAdminDiagnosticTargetTypeSchema = z.enum([
  "permission",
  "capability",
  "module",
  "policy",
  "approval_rule",
  "audit_action",
  "role",
  "security_setting",
  "integration",
]);

export const systemAdminDiagnosticIssueSchema = z.object({
  id: z.string().min(1),
  category: systemAdminDiagnosticCategorySchema,
  severity: diagnosticSeveritySchema,
  title: z.string().min(1),
  description: z.string().min(1),
  targetType: systemAdminDiagnosticTargetTypeSchema,
  targetId: z.string().min(1).optional(),
  targetHref: z.string().min(1).optional(),
  recommendedAction: z.string().min(1),
});

export const systemAdminDiagnosticsSummarySchema = z.object({
  verdict: governanceHealthVerdictSchema,
  blockedCount: z.number().int().nonnegative(),
  warningCount: z.number().int().nonnegative(),
  infoCount: z.number().int().nonnegative(),
  totalCount: z.number().int().nonnegative(),
  isHealthy: z.boolean(),
});
