import {
  applyHrShiftRecurrenceRule,
  createHrShiftRecurrenceRule,
  listHrShiftRecurrenceRulesWindow,
  type HrShiftBulkScheduleResult,
  type HrShiftRecurrenceRuleWindow,
} from "@afenda/db";

import type {
  HrSftApplyRecurrenceRuleInput,
  HrSftCreateRecurrenceRuleInput,
} from "./hr.time.sft-recurrence.schema";
import { emitHrSftAuditEvent } from "./hr.time.sft-audit.server";
import { hrTimeSftAuditActions } from "./hr.time.sft.event";

export type { HrShiftRecurrenceRuleWindow, HrShiftBulkScheduleResult };

/** HRM-SFT-007 — list recurrence rules. */
export async function listHrTimeSftRecurrenceRules(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrShiftRecurrenceRuleWindow> {
  return listHrShiftRecurrenceRulesWindow(input);
}

/** HRM-SFT-007 — create recurrence rule. */
export async function createHrTimeSftRecurrenceRule(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrSftCreateRecurrenceRuleInput;
}): Promise<{ recurrenceRuleId: string }> {
  const result = await createHrShiftRecurrenceRule({
    organizationId: input.organizationId,
    code: input.payload.code,
    name: input.payload.name,
    templateId: input.payload.templateId,
    employeeId: input.payload.employeeId,
    daysOfWeek: input.payload.daysOfWeek,
    effectiveFrom: input.payload.effectiveFrom,
    effectiveTo: input.payload.effectiveTo,
  });

  await emitHrSftAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    action: hrTimeSftAuditActions.recurrence.created,
    targetType: "hr_shift_recurrence_rule",
    targetId: result.recurrenceRuleId,
    summary: `Recurrence rule ${input.payload.code} created.`,
    metadata: {
      templateId: input.payload.templateId,
      employeeId: input.payload.employeeId,
      daysOfWeek: input.payload.daysOfWeek,
    },
  });

  return result;
}

/** HRM-SFT-007 — apply recurrence rule to generate assignments. */
export async function applyHrTimeSftRecurrenceRule(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrSftApplyRecurrenceRuleInput;
}): Promise<HrShiftBulkScheduleResult> {
  const result = await applyHrShiftRecurrenceRule({
    organizationId: input.organizationId,
    recurrenceRuleId: input.payload.recurrenceRuleId,
    applyThrough: input.payload.applyThrough,
    assignedByAuthUserId: input.actorAuthUserId,
  });

  await emitHrSftAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    action: hrTimeSftAuditActions.recurrence.applied,
    targetType: "hr_shift_recurrence_rule",
    targetId: input.payload.recurrenceRuleId,
    summary: `Recurrence rule applied (${result.createdAssignmentIds.length} assignment(s)).`,
    metadata: {
      createdCount: result.createdAssignmentIds.length,
      skippedDates: result.skippedDates,
    },
  });

  return result;
}
