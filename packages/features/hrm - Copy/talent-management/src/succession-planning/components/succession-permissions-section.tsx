import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Badge } from "@afenda/ui/badge"

import type { SuccessionSurfaceAccess } from "../data/succession-access.server"

export async function SuccessionPermissionsSection({
  access,
}: {
  access: SuccessionSurfaceAccess
}) {
  const t = await getTranslations("Erp.Hrm.successionPlanning")

  const flags = [
    { key: "canEnter", label: t("permissionCanEnter"), on: access.canEnter },
    { key: "canRead", label: t("permissionCanRead"), on: access.canRead },
    { key: "canManage", label: t("permissionCanManage"), on: access.canManage },
    { key: "canAudit", label: t("permissionCanAudit"), on: access.canAudit },
    {
      key: "canViewAssessments",
      label: t("permissionCanViewAssessments"),
      on: access.canViewAssessments,
    },
  ] as const

  return (
    <Card size="sm" data-testid="succession-permissions-section">
      <CardHeader>
        <CardTitle>{t("permissionsTitle")}</CardTitle>
        <CardDescription>{t("permissionsDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{t("permissionsErpHint")}</p>
        <div className="flex flex-wrap gap-2">
          {flags.map((flag) => (
            <Badge key={flag.key} variant={flag.on ? "default" : "outline"}>
              {flag.label}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
