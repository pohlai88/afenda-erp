"use server";

import {
  completeHrOffboarding,
  completeHrOffboardingClearanceItem,
  HrOffboardingCommandError,
  startHrOffboarding,
} from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import {
  actionFailure,
  actionSuccess,
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { revalidatePath } from "next/cache";
import { hrOffboardingAuditActions } from "../events/hr-offboarding.event";
import { requireHrOffboardingWrite } from "../policies/hr-offboarding.policy.server";
import {
  hrCompleteOffboardingActionSchema,
  hrCompleteOffboardingClearanceItemActionSchema,
  hrStartOffboardingActionSchema,
} from "../schemas/hr-offboarding-mutation.schema";

function revalidateHrOffboarding() {
  revalidatePath("/hr/offboarding");
  revalidatePath("/hr/lifecycle");
  revalidatePath("/hr/employees");
}

function mapCommandError(error: unknown): ActionResult<never> {
  if (error instanceof HrOffboardingCommandError) {
    return actionFailure(error.message, undefined, error.code);
  }
  return actionFailure(
    error instanceof Error ? error.message : "HR offboarding mutation failed.",
    undefined,
    "unknown",
  );
}

export async function startHrOffboardingAction(
  formData: FormData,
): Promise<ActionResult<{ caseId: string }>> {
  const { context } = await requireHrOffboardingWrite();

  const parsed = hrStartOffboardingActionSchema.safeParse({
    employeeId: formData.get("employeeId"),
    lastWorkingDate: formData.get("lastWorkingDate") || undefined,
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await startHrOffboarding({
      organizationId: context.organizationId,
      employeeId: parsed.data.employeeId,
      lastWorkingDate: parsed.data.lastWorkingDate,
      reason: parsed.data.reason,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrOffboardingAuditActions.start,
      targetType: "hr_offboarding_case",
      targetId: result.caseId,
      metadata: { employeeId: parsed.data.employeeId },
    });

    revalidateHrOffboarding();
    return actionSuccess({ caseId: result.caseId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function completeHrOffboardingAction(
  formData: FormData,
): Promise<ActionResult<{ caseId: string }>> {
  const { context } = await requireHrOffboardingWrite();

  const parsed = hrCompleteOffboardingActionSchema.safeParse({
    caseId: formData.get("caseId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await completeHrOffboarding({
      organizationId: context.organizationId,
      caseId: parsed.data.caseId,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrOffboardingAuditActions.complete,
      targetType: "hr_offboarding_case",
      targetId: result.caseId,
    });

    revalidateHrOffboarding();
    return actionSuccess({ caseId: result.caseId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function completeHrOffboardingClearanceItemAction(
  formData: FormData,
): Promise<ActionResult<{ itemId: string }>> {
  const { context } = await requireHrOffboardingWrite();

  const parsed = hrCompleteOffboardingClearanceItemActionSchema.safeParse({
    itemId: formData.get("itemId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await completeHrOffboardingClearanceItem({
      organizationId: context.organizationId,
      itemId: parsed.data.itemId,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrOffboardingAuditActions.clearanceComplete,
      targetType: "hr_offboarding_clearance_item",
      targetId: result.itemId,
    });

    revalidateHrOffboarding();
    return actionSuccess({ itemId: result.itemId });
  } catch (error) {
    return mapCommandError(error);
  }
}
