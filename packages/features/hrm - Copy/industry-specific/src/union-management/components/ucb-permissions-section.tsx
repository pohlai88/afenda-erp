import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Badge } from "@afenda/ui/badge"

import type { UcbSurfaceAccess } from "../data/ucb-access.server"

export async function UcbPermissionsSection({
  access,
}: {
  access: UcbSurfaceAccess
}) {
  const t = await getTranslations("Erp.Hrm.unionManagement")

  const flags = [
    { key: "canEnter", label: t("permissionCanEnter"), on: access.canEnter },
    { key: "canRead", label: t("permissionCanRead"), on: access.canRead },
    { key: "canManage", label: t("permissionCanManage"), on: access.canManage },
    { key: "canAudit", label: t("permissionCanAudit"), on: access.canAudit },
    {
      key: "canViewMembership",
      label: t("permissionCanViewMembership"),
      on: access.canViewMembership,
    },
    {
      key: "canViewGrievance",
      label: t("permissionCanViewGrievance"),
      on: access.canViewGrievance,
    },
    {
      key: "canViewPayrollLane",
      label: t("permissionCanViewPayrollLane"),
      on: access.canViewPayrollLane,
    },
  ] as const

  return (
    <Card size="sm" data-testid="ucb-permissions-section">
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
