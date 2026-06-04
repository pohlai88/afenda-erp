"use server";

import { runWithOrganizationContext } from "@afenda/db";
import {
  actionFailure,
  actionSuccess,
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";

import { requireHrRead } from "../../employee-management/compliance-regulatory-tracking/server";
import { linkGapDevelopmentResource } from "./hr.talent.csf-development.server";
import {
  hrCsfLinkDevelopmentResourceSchema,
  hrCsfListDevelopmentForGapSchema,
} from "./hr.talent.csf-development.schema";

function toCsfActionFailure<T = void>(error: unknown): ActionResult<T> {
  return actionFailure<T>(
    error instanceof Error ? error.message : "Competency development action failed.",
  );
}

export async function linkDevelopmentResourceAction(
  input: unknown,
): Promise<ActionResult<{ linkId: string }>> {
  const guard = await requireHrRead();
  const parsed = hrCsfLinkDevelopmentResourceSchema.safeParse(input);

  if (!parsed.success) {
    return zodActionFailure<{ linkId: string }>(parsed.error);
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
    return toCsfActionFailure<{ linkId: string }>(error);
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
