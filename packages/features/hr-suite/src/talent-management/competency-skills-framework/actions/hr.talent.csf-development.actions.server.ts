"use server";

import { runWithOrganizationContext } from "@afenda/db";
import {
  actionSuccess,
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";

import { requireHrRead } from "../../../policies/hr-module-access.policy.server";
import { linkGapDevelopmentResource } from "../data/hr.talent.csf-development.server";
import {
  hrCsfLinkDevelopmentResourceSchema,
  hrCsfListDevelopmentForGapSchema,
} from "../schemas/hr.talent.csf-development.schema";

export async function linkDevelopmentResourceAction(
  input: unknown,
): Promise<ActionResult<{ linkId: string }>> {
  const guard = await requireHrRead();
  const parsed = hrCsfLinkDevelopmentResourceSchema.safeParse(input);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await runWithOrganizationContext(
      guard.organization.id,
      async (db) =>
        linkGapDevelopmentResource(db, {
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

export async function listGapDevelopmentRecommendationsAction(input: unknown) {
  const guard = await requireHrRead();
  const parsed = hrCsfListDevelopmentForGapSchema.safeParse(input);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const { listHrCsfDevelopmentRecommendationsForGap } = await import("@afenda/db");
  const rows = await listHrCsfDevelopmentRecommendationsForGap({
    organizationId: guard.organization.id,
    gapId: parsed.data.gapId,
  });

  return actionSuccess(rows);
}

export async function listDevelopmentLinksAction(input: unknown) {
  const guard = await requireHrRead();
  const parsed = hrCsfLinkDevelopmentResourceSchema
    .pick({ recommendationId: true })
    .safeParse(input);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const { listHrCsfDevelopmentLinksForRecommendation } = await import("@afenda/db");
  const rows = await listHrCsfDevelopmentLinksForRecommendation({
    organizationId: guard.organization.id,
    recommendationId: parsed.data.recommendationId,
  });

  return actionSuccess(rows);
}
