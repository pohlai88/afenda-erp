import { getTranslations } from "next-intl/server"

import { GovernedPatternCListSection } from "@afenda/governed-surface/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { logUnexpectedServerError } from "@afenda/platform/logger.server"

import { buildCareerPathingEmbeddedListSurfaceErrorConfiguration } from "../data/career-pathing-embedded-list-surface-error.server"
import { buildReadinessListSurfaceConfiguration } from "../data/career-pathing-list-surface.server"
import { listLatestReadinessForOrg } from "../data/career-pathing.queries.server"
import { CAREER_PATHING_LIST_SURFACE_IDS } from "../data/career-pathing-surface-metadata.shared"
import { CareerPathReadinessExportButton } from "./career-pathing-forms.client"
import type { CareerPathingSectionProps } from "./career-pathing-section-props.shared"

export async function CareerPathingReadinessSection({
  organizationId,
  orgSlug,
  isHrmAdmin,
}: Pick<
  CareerPathingSectionProps,
  "organizationId" | "orgSlug" | "isHrmAdmin"
>) {
  const t = await getTranslations("Erp.Hrm.careerPathing")

  let readiness: Awaited<ReturnType<typeof listLatestReadinessForOrg>>
  try {
    readiness = await listLatestReadinessForOrg(organizationId)
  } catch (err) {
    logUnexpectedServerError("career-pathing-readiness: query failed", err, {
      organizationId,
    })
    return (
      <Card size="sm">
        <CardHeader>
          <CardTitle>{t("readinessTitle")}</CardTitle>
          <CardDescription>{t("readinessDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <GovernedPatternCListSection
            layout="embedded"
            title=""
            listConfiguration={buildCareerPathingEmbeddedListSurfaceErrorConfiguration(
              {
                columnsId: CAREER_PATHING_LIST_SURFACE_IDS.readiness,
                emptyTitle: t("readinessEmpty"),
                firstColumn: { id: "employee", header: t("colEmployee") },
              }
            )}
            surfaceKey="hrm:career-pathing:readiness:error"
            resolveConfiguredPermission={false}
            loadError={{
              variant: "error",
              title: t("readinessLoadFailed"),
            }}
          />
        </CardContent>
      </Card>
    )
  }

  const listConfiguration = buildReadinessListSurfaceConfiguration(
    readiness,
    orgSlug,
    {
      title: t("readinessTitle"),
      description: t("readinessDescription"),
      empty: t("readinessEmpty"),
      colEmployee: t("colEmployee"),
      colTarget: t("fieldTargetRole"),
      colReadiness: t("colReadiness"),
      colProgress: t("colProgress"),
    }
  )

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("readinessTitle")}</CardTitle>
        <CardDescription>{t("readinessDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isHrmAdmin ? (
          <CareerPathReadinessExportButton label={t("exportReadinessCsv")} />
        ) : null}
        <GovernedPatternCListSection
          title={t("readinessTitle")}
          description={t("readinessDescription")}
          listConfiguration={listConfiguration}
          surfaceKey="hrm:career-pathing:readiness"
          layout="embedded"
          resolveConfiguredPermission={false}
        />
      </CardContent>
    </Card>
  )
}
