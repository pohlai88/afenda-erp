"use server";

import { revalidatePath } from "next/cache";

import {
  actionSuccess,
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";

import { toHrTimeSftActionFailure } from "./hr.time.sft-action-result.shared";
import {
  assignHrTimeSftShift,
  bulkAssignHrTimeSftShifts,
} from "../data/hr.time.sft-assignment.server";
import {
  applyHrTimeSftRecurrenceRule,
  createHrTimeSftRecurrenceRule,
} from "../data/hr.time.sft-recurrence.server";
import {
  addHrTimeSftRotationCycleStep,
  applyHrTimeSftRotationCycle,
  createHrTimeSftRotationCycle,
} from "../data/hr.time.sft-rotation.server";
import { hrTimeSftRoutePaths } from "./hr.time.sft-route.contract";
import { requireHrTimeSftManage } from "./hr.time.sft-access.policy.server";
import {
  hrSftAssignShiftSchema,
  hrSftBulkAssignShiftSchema,
} from "./hr.time.sft-assignment.schema";
import {
  hrSftApplyRecurrenceRuleSchema,
  hrSftCreateRecurrenceRuleSchema,
} from "./hr.time.sft-recurrence.schema";
import {
  hrSftAddRotationCycleStepSchema,
  hrSftApplyRotationCycleSchema,
  hrSftCreateRotationCycleSchema,
} from "./hr.time.sft-rotation.schema";

async function runSftManageMutation(
  mutate: () => Promise<void>,
): Promise<ActionResult> {
  try {
    await mutate();
    revalidatePath(hrTimeSftRoutePaths.hub);
    return actionSuccess(undefined);
  } catch (error) {
    return toHrTimeSftActionFailure(error);
  }
}

/** HRM-SFT-005 — assign employee to shift. */
export async function assignHrTimeSftShiftAction(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = hrSftAssignShiftSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeSftManage();

  return runSftManageMutation(async () => {
    await assignHrTimeSftShift({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      payload: parsed.data,
    });
  });
}

/** HRM-SFT-006 — bulk assign shifts (JSON `entries` field). */
export async function bulkAssignHrTimeSftShiftsAction(
  formData: FormData,
): Promise<ActionResult> {
  const templateId = formData.get("templateId");
  const entriesRaw = formData.get("entries");
  const parsed = hrSftBulkAssignShiftSchema.safeParse({
    templateId,
    entries:
      typeof entriesRaw === "string"
        ? JSON.parse(entriesRaw)
        : entriesRaw,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeSftManage();

  return runSftManageMutation(async () => {
    await bulkAssignHrTimeSftShifts({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      payload: parsed.data,
    });
  });
}

/** HRM-SFT-007 — create recurrence rule. */
export async function createHrTimeSftRecurrenceRuleAction(
  formData: FormData,
): Promise<ActionResult> {
  const daysRaw = formData.get("daysOfWeek");
  const parsed = hrSftCreateRecurrenceRuleSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    daysOfWeek:
      typeof daysRaw === "string" ? JSON.parse(daysRaw) : daysRaw,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeSftManage();

  return runSftManageMutation(async () => {
    await createHrTimeSftRecurrenceRule({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      payload: parsed.data,
    });
  });
}

/** HRM-SFT-007 — apply recurrence rule. */
export async function applyHrTimeSftRecurrenceRuleAction(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = hrSftApplyRecurrenceRuleSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeSftManage();

  return runSftManageMutation(async () => {
    await applyHrTimeSftRecurrenceRule({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      payload: parsed.data,
    });
  });
}

/** HRM-SFT-008 — create rotation cycle. */
export async function createHrTimeSftRotationCycleAction(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = hrSftCreateRotationCycleSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeSftManage();

  return runSftManageMutation(async () => {
    await createHrTimeSftRotationCycle({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      payload: parsed.data,
    });
  });
}

/** HRM-SFT-008 — add rotation step. */
export async function addHrTimeSftRotationCycleStepAction(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = hrSftAddRotationCycleStepSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeSftManage();

  return runSftManageMutation(async () => {
    await addHrTimeSftRotationCycleStep({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      payload: parsed.data,
    });
  });
}

/** HRM-SFT-008 — apply rotation cycle. */
export async function applyHrTimeSftRotationCycleAction(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = hrSftApplyRotationCycleSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeSftManage();

  return runSftManageMutation(async () => {
    await applyHrTimeSftRotationCycle({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      payload: parsed.data,
    });
  });
}

/** HRM-SFT-006 — JSON bulk assign for integration tests and APIs. */
export async function bulkAssignHrTimeSftShiftsJsonAction(
  payload: unknown,
): Promise<
  ActionResult<{
    createdAssignmentIds: readonly string[];
    skippedDates: readonly string[];
  }>
> {
  const parsed = hrSftBulkAssignShiftSchema.safeParse(payload);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeSftManage();

  try {
    const result = await bulkAssignHrTimeSftShifts({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      payload: parsed.data,
    });
    revalidatePath(hrTimeSftRoutePaths.hub);
    return actionSuccess(result);
  } catch (error) {
    return toHrTimeSftActionFailure(error) as ActionResult<{
      createdAssignmentIds: readonly string[];
      skippedDates: readonly string[];
    }>;
  }
}
