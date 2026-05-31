"use server";

import { revalidatePath } from "next/cache";

import {
  actionFailure,
  actionSuccess,
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";

import { submitHrTimeClockCorrectionCommand } from "../data/hr.time.clock-integration-correction.shared.server";
import { promoteHrTimeClockPunchToLamCommand } from "../data/hr.time.clock-integration-promotion.shared.server";
import { validateHrTimeClockRawPunchAfterIngest } from "../data/hr.time.clock-integration-validation.shared.server";
import { hrTimeClockRoutePaths } from "../contracts/hr.time.clock-integration.contract";
import { hrTimeClockAuditActions } from "../events/hr.time.clock-integration.event";
import { requireHrTimeClockWrite } from "../policies/hr.time.clock-integration-access.policy.server";
import {
  promoteHrTimeClockPunchSchema,
  runHrTimeClockValidationSchema,
  submitHrTimeClockCorrectionSchema,
} from "../schemas/hr.time.clock-integration-correction.schema";
import type { HrTimeClockValidationPipelineResult } from "@afenda/db";

import { HrTimeClockCommandError } from "../data/hr.time.clock-integration-correction.shared.server";

function mapHrTimeClockMutationError<T = void>(error: unknown): ActionResult<T> {
  if (error instanceof HrTimeClockCommandError) {
    return actionFailure(error.code);
  }
  if (error instanceof Error) {
    return actionFailure(error.message);
  }
  return actionFailure("hr_time_clock_mutation_failed");
}

/** HRM-TCI-024/025 — correction punch for exception raw records. */
export async function submitHrTimeClockCorrectionAction(
  input: unknown,
): Promise<
  ActionResult<{
    correctionRawPunchId: string;
    validation: HrTimeClockValidationPipelineResult;
  }>
> {
  const parsed = submitHrTimeClockCorrectionSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeClockWrite();

  try {
    const data = await submitHrTimeClockCorrectionCommand({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      payload: parsed.data,
    });

    await writeExecutionAuditEvent({
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      actorType: "user",
      action: hrTimeClockAuditActions.punch.captured,
      targetType: "hr_time_clock_raw_punch",
      targetId: data.correctionRawPunchId,
      metadata: {
        kind: "correction",
        correctionRawPunchId: data.correctionRawPunchId,
        originalRawPunchId: parsed.data.originalRawPunchId,
      },
    });

    revalidatePath(hrTimeClockRoutePaths.hub);
    return actionSuccess(data);
  } catch (error) {
    return mapHrTimeClockMutationError(error);
  }
}

/** Re-run validation pipeline for a pending or corrected raw punch. */
export async function runHrTimeClockValidationAction(
  input: unknown,
): Promise<ActionResult<HrTimeClockValidationPipelineResult>> {
  const parsed = runHrTimeClockValidationSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeClockWrite();

  try {
    const data = await validateHrTimeClockRawPunchAfterIngest({
      organizationId: guard.organization.id,
      rawPunchId: parsed.data.rawPunchId,
      policyGroupCode: parsed.data.policyGroupCode,
      actorAuthUserId: guard.session.id,
    });

    if (data.exceptionCodes.length > 0) {
      await writeExecutionAuditEvent({
        organizationId: guard.organization.id,
        actorId: guard.session.id,
        actorType: "user",
        action: hrTimeClockAuditActions.punch.exceptionRecorded,
        targetType: "hr_time_clock_raw_punch",
        targetId: parsed.data.rawPunchId,
        metadata: { exceptionCodes: data.exceptionCodes },
      });
    }

    revalidatePath(hrTimeClockRoutePaths.hub);
    return actionSuccess(data);
  } catch (error) {
    return mapHrTimeClockMutationError(error);
  }
}

/** HRM-TCI-029 — promote validated punch to LAM attendance record. */
export async function promoteHrTimeClockPunchAction(
  input: unknown,
): Promise<
  ActionResult<{ lamAttendanceRecordId: string; created: boolean }>
> {
  const parsed = promoteHrTimeClockPunchSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeClockWrite();

  try {
    const data = await promoteHrTimeClockPunchToLamCommand({
      organizationId: guard.organization.id,
      rawPunchId: parsed.data.rawPunchId,
      actorAuthUserId: guard.session.id,
    });

    revalidatePath(hrTimeClockRoutePaths.hub);
    return actionSuccess(data);
  } catch (error) {
    return mapHrTimeClockMutationError(error);
  }
}
