import { getTranslations } from "next-intl/server"

import { SftAvailabilitySection } from "../../../time-attendance/server"

type RwsAvailabilitySectionProps = {
  organizationId: string
  orgSlug: string
  rangeStart: string
  rangeEnd: string
  canManage: boolean
}

export async function RwsAvailabilitySection({
  organizationId,
  orgSlug,
  rangeStart,
  rangeEnd,
  canManage,
}: RwsAvailabilitySectionProps) {
  const t = await getTranslations("Erp.Hrm.retailScheduling")

  return (
    <div
      id="rws-availability-section"
      data-testid="rws-availability-section"
      className="flex flex-col gap-2"
    >
      <p className="text-sm text-muted-foreground">{t("availabilityIntro")}</p>
      <SftAvailabilitySection
        organizationId={organizationId}
        orgSlug={orgSlug}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        canManage={canManage}
      />
    </div>
  )
}
