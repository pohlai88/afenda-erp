import { getTranslations } from "next-intl/server"

import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert"

export async function TimeClockSetupAccessBanner() {
  const t = await getTranslations("Erp.Hrm.timeClock.setupAccessBanner")

  return (
    <Alert data-testid="time-clock-setup-access-banner">
      <AlertTitle>{t("title")}</AlertTitle>
      <AlertDescription>{t("description")}</AlertDescription>
    </Alert>
  )
}
