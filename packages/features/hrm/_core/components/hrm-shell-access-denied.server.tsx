import { getTranslations } from "next-intl/server"

import { GovernedEmpty, GovernedSurface } from "@afenda/governed-surface/server"
import type { HrmNavKey } from "../../_core/shared"

function HrmAccessDeniedSurface({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <GovernedSurface
      header={{
        title,
        description,
      }}
    >
      <GovernedEmpty
        model={{
          variant: "forbidden",
          title: "RBAC access required",
          description,
        }}
      />
    </GovernedSurface>
  )
}

export function HrmAccessDeniedMessage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return <HrmAccessDeniedSurface title={title} description={description} />
}

/** ERP RBAC gate copy — uses `Erp.Hrm.shell` so segment namespaces are not unioned with `cards.*` / `placeholders.*`. */
export async function HrmShellAccessDenied({ surface }: { surface: string }) {
  const t = await getTranslations("Erp.Hrm.shell")

  return (
    <HrmAccessDeniedSurface
      title={t("accessDeniedTitle")}
      description={t("accessDeniedDescription", { surface })}
    />
  )
}

export async function HrmShellAccessDeniedFromNav({
  navKey,
}: {
  navKey: HrmNavKey
}) {
  const [tShell, tNav] = await Promise.all([
    getTranslations("Erp.Hrm.shell"),
    getTranslations("Erp.Hrm.nav"),
  ])

  return (
    <HrmAccessDeniedSurface
      title={tShell("accessDeniedTitle")}
      description={tShell("accessDeniedDescription", { surface: tNav(navKey) })}
    />
  )
}

export async function HrmShellAccessDeniedDetail({
  surface,
}: {
  surface: string
}) {
  const t = await getTranslations("Erp.Hrm.shell")

  return (
    <HrmAccessDeniedSurface
      title={t("accessDeniedDetailTitle")}
      description={t("accessDeniedDetailDescription", { surface })}
    />
  )
}

export async function HrmOverviewAccessDenied() {
  const t = await getTranslations("Erp.Hrm.shell")

  return (
    <HrmAccessDeniedSurface
      title={t("accessDeniedHrmOverviewTitle")}
      description={t("accessDeniedHrmOverviewDescription")}
    />
  )
}

export async function HrmCapabilityAccessDenied() {
  const t = await getTranslations("Erp.Hrm.shell")

  return (
    <HrmAccessDeniedSurface
      title={t("accessDeniedCapabilityTitle")}
      description={t("accessDeniedCapabilityDescription")}
    />
  )
}

export async function HrmComplianceEvidenceAccessDenied() {
  const t = await getTranslations("Erp.Hrm.shell")

  return (
    <HrmAccessDeniedSurface
      title={t("accessDeniedComplianceEvidenceTitle")}
      description={t("accessDeniedComplianceEvidenceDescription")}
    />
  )
}
