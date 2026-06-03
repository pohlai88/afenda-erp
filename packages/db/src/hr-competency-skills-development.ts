import { and, desc, eq, inArray } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { appendHrCsfAuditEventInTx } from "./hr-competency-skills-audit";
import {
  buildDefaultDevelopmentLinks,
  recommendDevelopmentActions,
  type GapClassificationResult,
  type HrCsfGapKind,
} from "./hr-competency-skills-gap-calculations.shared";
import {
  hrCsfDevelopmentLinks,
  hrCsfDevelopmentRecommendations,
} from "./hr-competency-skills";

export async function createHrCsfDevelopmentRecommendationsInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    gapId: string;
    gapKind: HrCsfGapKind;
    gapSize: number;
    targetLabel: string;
    targetCode: string;
    classification: GapClassificationResult;
    recommendedAt: Date;
    linkageRefs?: {
      readonly courseRef?: string | null;
      readonly learningPathRef?: string | null;
      readonly certificationRef?: string | null;
      readonly coachingRef?: string | null;
      readonly developmentPlanRef?: string | null;
    };
  },
): Promise<{ recommendationIds: readonly string[] }> {
  const drafts = recommendDevelopmentActions({
    gapKind: input.gapKind,
    gapSize: input.gapSize,
    targetLabel: input.targetLabel,
    classification: input.classification,
  });

  const recommendationIds: string[] = [];

  for (const draft of drafts) {
    const recommendationId = createEntityId("hr_csf_dev_rec");
    await db.insert(hrCsfDevelopmentRecommendations).values({
      id: recommendationId,
      organizationId: input.organizationId,
      gapId: input.gapId,
      actionType: draft.actionType,
      title: draft.title,
      description: draft.description,
      priority: draft.priority,
      recommendationStatus: "recommended",
      recommendedAt: input.recommendedAt,
    });
    recommendationIds.push(recommendationId);

    const linkDrafts = buildDefaultDevelopmentLinks({
      actionType: draft.actionType,
      targetCode: input.targetCode,
      courseRef: input.linkageRefs?.courseRef,
      learningPathRef: input.linkageRefs?.learningPathRef,
      certificationRef: input.linkageRefs?.certificationRef,
      coachingRef: input.linkageRefs?.coachingRef,
      developmentPlanRef: input.linkageRefs?.developmentPlanRef,
    });

    for (const link of linkDrafts) {
      await db.insert(hrCsfDevelopmentLinks).values({
        id: createEntityId("hr_csf_dev_link"),
        organizationId: input.organizationId,
        recommendationId,
        linkType: link.linkType,
        externalRef: link.externalRef,
        title: link.title ?? null,
        url: link.url ?? null,
        metadata: link.metadata ?? null,
      });
    }
  }

  return { recommendationIds };
}

export async function linkHrCsfDevelopmentResourceInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    recommendationId: string;
    linkType: (typeof hrCsfDevelopmentLinks.$inferInsert)["linkType"];
    externalRef: string;
    title?: string | null;
    url?: string | null;
    metadata?: Record<string, unknown> | null;
  },
): Promise<{ linkId: string }> {
  const linkId = createEntityId("hr_csf_dev_link");

  await db.insert(hrCsfDevelopmentLinks).values({
    id: linkId,
    organizationId: input.organizationId,
    recommendationId: input.recommendationId,
    linkType: input.linkType,
    externalRef: input.externalRef.trim(),
    title: input.title ?? null,
    url: input.url ?? null,
    metadata: input.metadata ?? null,
  });

  await appendHrCsfAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.csf.development.link.created",
    summary: `Linked ${input.linkType} ${input.externalRef} to recommendation`,
    metadata: {
      recommendationId: input.recommendationId,
      linkId,
      linkType: input.linkType,
      externalRef: input.externalRef,
    },
  });

  return { linkId };
}

export async function listHrCsfDevelopmentRecommendationsForGap(input: {
  organizationId: string;
  gapId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const recommendations = await db
      .select()
      .from(hrCsfDevelopmentRecommendations)
      .where(
        and(
          eq(hrCsfDevelopmentRecommendations.organizationId, input.organizationId),
          eq(hrCsfDevelopmentRecommendations.gapId, input.gapId),
        ),
      )
      .orderBy(desc(hrCsfDevelopmentRecommendations.recommendedAt));

    if (recommendations.length === 0) {
      return [];
    }

    const recommendationIds = recommendations.map((row) => row.id);
    const allLinks =
      recommendationIds.length > 0
        ? await db
            .select()
            .from(hrCsfDevelopmentLinks)
            .where(
              and(
                eq(hrCsfDevelopmentLinks.organizationId, input.organizationId),
                inArray(
                  hrCsfDevelopmentLinks.recommendationId,
                  recommendationIds,
                ),
              ),
            )
        : [];

    const linksByRecommendation = new Map<string, typeof allLinks>();
    for (const link of allLinks) {
      if (!recommendationIds.includes(link.recommendationId)) continue;
      const bucket = linksByRecommendation.get(link.recommendationId) ?? [];
      bucket.push(link);
      linksByRecommendation.set(link.recommendationId, bucket);
    }

    return recommendations.map((recommendation) => ({
      ...recommendation,
      links: linksByRecommendation.get(recommendation.id) ?? [],
    }));
  });
}

export async function listHrCsfDevelopmentLinksForRecommendation(input: {
  organizationId: string;
  recommendationId: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select()
      .from(hrCsfDevelopmentLinks)
      .where(
        and(
          eq(hrCsfDevelopmentLinks.organizationId, input.organizationId),
          eq(hrCsfDevelopmentLinks.recommendationId, input.recommendationId),
        ),
      )
      .orderBy(desc(hrCsfDevelopmentLinks.createdAt)),
  );
}
