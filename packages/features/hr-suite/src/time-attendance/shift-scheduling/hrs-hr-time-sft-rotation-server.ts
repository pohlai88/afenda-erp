import {
  addHrShiftRotationCycleStep,
  applyHrShiftRotationCycle,
  createHrShiftRotationCycle,
  listHrShiftRotationCyclesWindow,
  type HrShiftBulkScheduleResult,
  type HrShiftRotationCycleWindow,
} from "@afenda/db";

import type {
  HrSftAddRotationCycleStepInput,
  HrSftApplyRotationCycleInput,
  HrSftCreateRotationCycleInput,
} from "./hr.time.sft-rotation.schema";
import { emitHrSftAuditEvent } from "./hr.time.sft-audit.server";
import { hrTimeSftAuditActions } from "./hr.time.sft.event";

export type { HrShiftRotationCycleWindow, HrShiftBulkScheduleResult };

/** HRM-SFT-008 — list rotation cycles. */
export async function listHrTimeSftRotationCycles(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrShiftRotationCycleWindow> {
  return listHrShiftRotationCyclesWindow(input);
}

/** HRM-SFT-008 — create rotation cycle. */
export async function createHrTimeSftRotationCycle(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrSftCreateRotationCycleInput;
}): Promise<{ rotationCycleId: string }> {
  const result = await createHrShiftRotationCycle({
    organizationId: input.organizationId,
    code: input.payload.code,
    name: input.payload.name,
    description: input.payload.description,
    cycleLengthDays: input.payload.cycleLengthDays,
  });

  await emitHrSftAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    action: hrTimeSftAuditActions.rotation.created,
    targetType: "hr_shift_rotation_cycle",
    targetId: result.rotationCycleId,
    summary: `Rotation cycle ${input.payload.code} created.`,
    metadata: {
      cycleLengthDays: input.payload.cycleLengthDays,
    },
  });

  return result;
}

/** HRM-SFT-008 — add step to rotation cycle. */
export async function addHrTimeSftRotationCycleStep(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrSftAddRotationCycleStepInput;
}): Promise<{ stepId: string }> {
  const result = await addHrShiftRotationCycleStep({
    organizationId: input.organizationId,
    cycleId: input.payload.cycleId,
    stepIndex: input.payload.stepIndex,
    templateId: input.payload.templateId,
    isRestDay: input.payload.isRestDay,
    label: input.payload.label,
  });

  await emitHrSftAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    action: hrTimeSftAuditActions.rotation.stepAdded,
    targetType: "hr_shift_rotation_cycle",
    targetId: input.payload.cycleId,
    summary: `Rotation step ${input.payload.stepIndex} added.`,
    metadata: {
      stepId: result.stepId,
      templateId: input.payload.templateId,
      isRestDay: input.payload.isRestDay ?? false,
    },
  });

  return result;
}

/** HRM-SFT-008 — apply rotation cycle for an employee across a period. */
export async function applyHrTimeSftRotationCycle(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrSftApplyRotationCycleInput;
}): Promise<HrShiftBulkScheduleResult> {
  const result = await applyHrShiftRotationCycle({
    organizationId: input.organizationId,
    rotationCycleId: input.payload.rotationCycleId,
    employeeId: input.payload.employeeId,
    periodStart: input.payload.periodStart,
    periodEnd: input.payload.periodEnd,
    assignedByAuthUserId: input.actorAuthUserId,
  });

  await emitHrSftAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    action: hrTimeSftAuditActions.rotation.applied,
    targetType: "hr_shift_rotation_cycle",
    targetId: input.payload.rotationCycleId,
    summary: `Rotation applied for employee ${input.payload.employeeId}.`,
    metadata: {
      createdCount: result.createdAssignmentIds.length,
      skippedDates: result.skippedDates,
      periodStart: input.payload.periodStart.toISOString(),
      periodEnd: input.payload.periodEnd.toISOString(),
    },
  });

  return result;
}
