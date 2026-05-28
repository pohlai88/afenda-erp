import { getTranslations } from "next-intl/server"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { GovernedPatternCListSection } from "@afenda/governed-surface/server"

import { buildSkillMatrixListSurfaceConfiguration } from "../data/skill-matrix-list-surface.server"
import { listSkillMatrixForOrg } from "../data/skill.queries.server"

type SkillMatrixPanelProps = {
  readonly organizationId: string
  readonly orgSlug: string
}

export async function SkillMatrixPanel({
  organizationId,
  orgSlug,
}: SkillMatrixPanelProps) {
  const [t, matrix] = await Promise.all([
    getTranslations("Erp.Hrm.skills"),
    listSkillMatrixForOrg(organizationId),
  ])

  if (matrix.skills.length === 0) {
    return null
  }

  const listConfiguration = buildSkillMatrixListSurfaceConfiguration(
    matrix,
    orgSlug,
    {
      empty: t("matrixEmpty"),
      colEmployee: t("matrixEmployee"),
      formatProficiency: (value) => (value != null ? String(value) : "—"),
    }
  )

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{t("matrixTitle")}</CardTitle>
        <CardDescription>{t("matrixDescription")}</CardDescription>
      </CardHeader>
      <GovernedPatternCListSection
        layout="embedded"
        title={t("matrixTitle")}
        description={t("matrixDescription")}
        listConfiguration={listConfiguration}
        surfaceKey="hrm:skill-matrix"
      />
    </Card>
  )
}
