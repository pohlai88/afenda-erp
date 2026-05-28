import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"
import { Badge } from "@afenda/ui/badge"

import type { GpgSurfaceAccess } from "../data/gpg-access.server"

export async function GpgPermissionsSection({
  access,
}: {
  access: GpgSurfaceAccess
}) {
  const t = await getTranslations("Erp.Hrm.governmentPayGrades")

  const flags = [
    { key: "canEnter", label: t("permissionCanEnter"), on: access.canEnter },
    { key: "canRead", label: t("permissionCanRead"), on: access.canRead },
    { key: "canManage", label: t("permissionCanManage"), on: access.canManage },
    { key: "canAudit", label: t("permissionCanAudit"), on: access.canAudit },
  ] as const

  return (
    <Card size="sm" data-testid="gpg-permissions-section">
      <CardHeader>
        <CardTitle>{t("permissionsTitle")}</CardTitle>
        <CardDescription>{t("permissionsDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {t("permissionsErpHint")}
        </p>
        <div className="flex flex-wrap gap-2">
          {flags.map((flag) => (
            <Badge key={flag.key} variant={flag.on ? "default" : "outline"}>
              {flag.label}:{" "}
              {flag.on ? t("permissionGranted") : t("permissionDenied")}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
