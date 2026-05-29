"use server";

import {
  completeHrOnboarding,
  completeHrOnboardingChecklistItem,
  HrOnboardingCommandError,
  startHrOnboarding,
} from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import {
  actionFailure,
  actionSuccess,
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { revalidatePath } from "next/cache";
import { hrOnboardingAuditActions } from "../events/hr-onboarding.event";
import { requireHrOnboardingWrite } from "../policies/hr-onboarding.policy.server";
import {
  hrCompleteOnboardingActionSchema,
  hrCompleteOnboardingChecklistItemActionSchema,
  hrStartOnboardingActionSchema,
} from "../schemas/hr-onboarding-mutation.schema";

function revalidateHrOnboarding() {
  revalidatePath("/hr/onboarding");
  revalidatePath("/hr/lifecycle");
  revalidatePath("/hr/employees");
}

function mapCommandError(error: unknown): ActionResult<never> {
  if (error instanceof HrOnboardingCommandError) {
    return actionFailure(error.message, undefined, error.code);
  }
  return actionFailure(
    error instanceof Error ? error.message : "HR onboarding mutation failed.",
    undefined,
    "unknown",
  );
}

export async function startHrOnboardingAction(
  formData: FormData,
): Promise<ActionResult<{ caseId: string }>> {
  const { context } = await requireHrOnboardingWrite();

  const parsed = hrStartOnboardingActionSchema.safeParse({
    employeeId: formData.get("employeeId"),
    targetStatus: formData.get("targetStatus") || undefined,
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await startHrOnboarding({
      organizationId: context.organizationId,
      employeeId: parsed.data.employeeId,
      targetStatus: parsed.data.targetStatus ?? "active",
      reason: parsed.data.reason,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrOnboardingAuditActions.start,
      targetType: "hr_onboarding_case",
      targetId: result.caseId,
      metadata: { employeeId: parsed.data.employeeId },
    });

    revalidateHrOnboarding();
    return actionSuccess({ caseId: result.caseId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function completeHrOnboardingAction(
  formData: FormData,
): Promise<ActionResult<{ caseId: string }>> {
  const { context } = await requireHrOnboardingWrite();

  const parsed = hrCompleteOnboardingActionSchema.safeParse({
    caseId: formData.get("caseId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await completeHrOnboarding({
      organizationId: context.organizationId,
      caseId: parsed.data.caseId,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrOnboardingAuditActions.complete,
      targetType: "hr_onboarding_case",
      targetId: result.caseId,
    });

    revalidateHrOnboarding();
    return actionSuccess({ caseId: result.caseId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function completeHrOnboardingChecklistItemAction(
  formData: FormData,
): Promise<ActionResult<{ itemId: string }>> {
  const { context } = await requireHrOnboardingWrite();

  const parsed = hrCompleteOnboardingChecklistItemActionSchema.safeParse({
    itemId: formData.get("itemId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await completeHrOnboardingChecklistItem({
      organizationId: context.organizationId,
      itemId: parsed.data.itemId,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrOnboardingAuditActions.checklistComplete,
      targetType: "hr_onboarding_checklist_item",
      targetId: result.itemId,
    });

    revalidateHrOnboarding();
    return actionSuccess({ itemId: result.itemId });
  } catch (error) {
    return mapCommandError(error);
  }
}
