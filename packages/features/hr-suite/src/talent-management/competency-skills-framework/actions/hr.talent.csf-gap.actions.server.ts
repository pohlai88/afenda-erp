"use server";

import { runWithOrganizationContext } from "@afenda/db";
import {
  actionSuccess,
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";

import { requireHrRead } from "../../../policies/hr-module-access.policy.server";
import { analyzeEmployeeSkillAndCompetencyGaps } from "../data/hr.talent.csf-gap.server";
import {
  classifyGap,
  computeCompetencyGap,
  computeSkillGap,
} from "../data/hr.talent.csf-gap-calculations.shared";
import {
  hrCsfAnalyzeEmployeeGapsSchema,
  hrCsfClassifyGapSchema,
  hrCsfComputeCompetencyGapSchema,
  hrCsfComputeSkillGapSchema,
  hrCsfListEmployeeGapsSchema,
} from "../schemas/hr.talent.csf-gap.schema";

export async function analyzeEmployeeGapsAction(
  input: unknown,
): Promise<ActionResult<Awaited<ReturnType<typeof analyzeEmployeeSkillAndCompetencyGaps>>>> {
  const guard = await requireHrRead();
  const parsed = hrCsfAnalyzeEmployeeGapsSchema.safeParse(input);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await runWithOrganizationContext(
      guard.organization.id,
      async (db) =>
        analyzeEmployeeSkillAndCompetencyGaps(db, {
          organizationId: guard.organization.id,
          actorUserId: guard.session.id,
          ...parsed.data,
        }),
    );

    return actionSuccess(result);
  } catch (error) {
    return zodActionFailure(error);
  }
}

export async function listEmployeeGapsAction(input: unknown) {
  const guard = await requireHrRead();
  const parsed = hrCsfListEmployeeGapsSchema.safeParse(input);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const { listHrCsfEmployeeGapsWindow } = await import("@afenda/db");
  const window = await listHrCsfEmployeeGapsWindow({
    organizationId: guard.organization.id,
    ...parsed.data,
  });

  return actionSuccess(window);
}

export async function computeSkillGapAction(input: unknown) {
  await requireHrRead();
  const parsed = hrCsfComputeSkillGapSchema.safeParse(input);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return actionSuccess(computeSkillGap(parsed.data));
}

export async function computeCompetencyGapAction(input: unknown) {
  await requireHrRead();
  const parsed = hrCsfComputeCompetencyGapSchema.safeParse(input);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return actionSuccess(computeCompetencyGap(parsed.data));
}

export async function classifyGapAction(input: unknown) {
  await requireHrRead();
  const parsed = hrCsfClassifyGapSchema.safeParse(input);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return actionSuccess(classifyGap(parsed.data));
}
