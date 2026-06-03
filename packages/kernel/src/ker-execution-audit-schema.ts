import { z } from "zod";

const dateSchema = z.date();

export const executionAuditActorTypeSchema = z.enum([
  "user",
  "system",
  "service",
  "integration",
  "agent",
]);

export const executionAuditOutcomeSchema = z.enum([
  "success",
  "failure",
  "denied",
]);

export const executionAuditChannelSchema = z.enum([
  "web",
  "api",
  "server_action",
  "cron",
  "webhook",
  "migration",
]);

export const executionAuditDiffSchema = z.object({
  path: z.string(),
  change: z.enum(["added", "removed", "changed"]),
  before: z.unknown().optional(),
  after: z.unknown().optional(),
});

export const executionAuditEventSchema = z.object({
  organizationId: z.string().min(1),
  module: z.string().min(1).optional(),
  surface: z.string().min(1).optional(),
  route: z.string().min(1).optional(),
  actorId: z.string().min(1),
  actorType: executionAuditActorTypeSchema,
  actorRole: z.string().min(1).optional(),
  subjectType: z.string().min(1).optional(),
  subjectId: z.string().min(1).optional(),
  action: z.string().min(1),
  summary: z.string().min(1).optional(),
  outcome: executionAuditOutcomeSchema.optional(),
  targetType: z.string().min(1),
  targetId: z.string().min(1).optional(),
  targetDisplayName: z.string().min(1).optional(),
  reason: z.string().min(1).optional(),
  policyReference: z.string().min(1).optional(),
  approvalId: z.string().min(1).optional(),
  channel: executionAuditChannelSchema.optional(),
  requestId: z.string().min(1).optional(),
  operationId: z.string().min(1).optional(),
  before: z.record(z.string(), z.unknown()).optional(),
  after: z.record(z.string(), z.unknown()).optional(),
  diff: z.array(executionAuditDiffSchema).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  occurredAt: dateSchema.optional(),
});

export type ExecutionAuditEventSchemaInput = z.infer<
  typeof executionAuditEventSchema
>;

