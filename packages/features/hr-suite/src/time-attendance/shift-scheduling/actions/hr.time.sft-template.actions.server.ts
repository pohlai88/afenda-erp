"use server";

import { revalidatePath } from "next/cache";

import {
  actionSuccess,
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";

import { toHrTimeSftActionFailure } from "../data/hr.time.sft-action-result.shared";
import {
  archiveHrTimeSftShiftTemplate,
  createHrTimeSftShiftTemplate,
  updateHrTimeSftShiftTemplate,
} from "../data/hr.time.sft-template.server";
import { hrTimeSftRoutePaths } from "../contracts/hr.time.sft-route.contract";
import { requireHrTimeSftManage } from "../policies/hr.time.sft-access.policy.server";
import {
  hrSftArchiveShiftTemplateSchema,
  hrSftCreateShiftTemplateSchema,
  hrSftUpdateShiftTemplateSchema,
} from "../schemas/hr.time.sft-template.schema";

/** HRM-SFT-001 — create shift type. */
export async function createHrTimeSftShiftTemplateAction(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = hrSftCreateShiftTemplateSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeSftManage();

  try {
    await createHrTimeSftShiftTemplate({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      payload: parsed.data,
    });
    revalidatePath(hrTimeSftRoutePaths.hub);
    return actionSuccess(undefined);
  } catch (error) {
    return toHrTimeSftActionFailure(error);
  }
}

/** HRM-SFT-001/002 — update shift type. */
export async function updateHrTimeSftShiftTemplateAction(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = hrSftUpdateShiftTemplateSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeSftManage();

  try {
    await updateHrTimeSftShiftTemplate({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      payload: parsed.data,
    });
    revalidatePath(hrTimeSftRoutePaths.hub);
    return actionSuccess(undefined);
  } catch (error) {
    return toHrTimeSftActionFailure(error);
  }
}

/** HRM-SFT-001 — archive shift type. */
export async function archiveHrTimeSftShiftTemplateAction(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = hrSftArchiveShiftTemplateSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeSftManage();

  try {
    await archiveHrTimeSftShiftTemplate({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      templateId: parsed.data.templateId,
    });
    revalidatePath(hrTimeSftRoutePaths.hub);
    return actionSuccess(undefined);
  } catch (error) {
    return toHrTimeSftActionFailure(error);
  }
}

/** HRM-SFT-001 — JSON-safe create for programmatic callers. */
export async function createHrTimeSftShiftTemplateJsonAction(
  payload: unknown,
): Promise<ActionResult<{ templateId: string }>> {
  const parsed = hrSftCreateShiftTemplateSchema.safeParse(payload);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeSftManage();

  try {
    const result = await createHrTimeSftShiftTemplate({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      payload: parsed.data,
    });
    revalidatePath(hrTimeSftRoutePaths.hub);
    return actionSuccess(result);
  } catch (error) {
    return toHrTimeSftActionFailure(error) as ActionResult<{ templateId: string }>;
  }
}
