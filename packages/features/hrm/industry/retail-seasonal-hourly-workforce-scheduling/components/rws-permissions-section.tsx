import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Badge } from "@afenda/ui/badge"

import type { RwsSurfaceAccess } from "../data/rws-access.server"

export async function RwsPermissionsSection({
  access,
}: {
  access: RwsSurfaceAccess
}) {
  const t = await getTranslations("Erp.Hrm.retailScheduling")

  const flags = [
    { key: "canEnter", label: t("permissionCanEnter"), on: access.canEnter },
    { key: "canRead", label: t("permissionCanRead"), on: access.canRead },
    { key: "canManage", label: t("permissionCanManage"), on: access.canManage },
    { key: "canAudit", label: t("permissionCanAudit"), on: access.canAudit },
    {
      key: "canViewLaborCost",
      label: t("permissionCanViewLaborCost"),
      on: access.canViewLaborCost,
    },
  ] as const

  return (
    <Card size="sm" data-testid="rws-permissions-section">
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
