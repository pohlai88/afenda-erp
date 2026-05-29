import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildPerformanceReviewListSurfaceConfiguration } from "../data/performance-review-list-surface.server"
import type { HrmPerformanceReviewListRow } from "../data/performance.queries.server"

import { PerformanceReviewsTrailingCell } from "./performance-list-trailing-cells.client"

type PerformanceReviewsSectionProps = {
  orgSlug: string
  reviews: readonly HrmPerformanceReviewListRow[]
  viewerUserId: string
  canUpdate: boolean
}

export async function PerformanceReviewsSection({
  orgSlug,
  reviews,
  viewerUserId,
  canUpdate,
}: PerformanceReviewsSectionProps) {
  const t = await getTranslations("Erp.Hrm.performance")

  const listConfiguration = buildPerformanceReviewListSurfaceConfiguration(
    reviews,
    orgSlug,
    {
      eyebrow: t("eyebrow"),
      title: t("reviewsTitle"),
      description: t("reviewsDescription"),
      empty: t("reviewsEmpty"),
      colCycle: t("colCycle"),
      colEmployee: t("colEmployee"),
      colReviewer: t("colReviewer"),
      colStage: t("colStage"),
      unassignedReviewer: t("unassignedReviewer"),
    },
    { canUpdate, viewerUserId }
  )

  return (
    <GovernedPatternCListSection
      title={t("reviewsTitle")}
      description={t("reviewsDescription")}
      listConfiguration={listConfiguration}
      surfaceKey="hrm:performance:reviews"
      cardClassName="mt-0 border-solid border-border"
      forbidden={{
        variant: "forbidden",
        title: t("reviewsForbiddenTitle"),
        description: t("reviewsForbiddenDescription"),
      }}
      invalid={{
        variant: "error",
        title: t("reviewsLoadFailedTitle"),
        description: t("reviewsLoadFailed"),
      }}
      trailingColumn={{
        header: t("colActions"),
        Cell: PerformanceReviewsTrailingCell,
        context: {
          orgSlug,
          viewerUserId,
          canUpdate,
          reviews,
        },
      }}
    />
  )
}
