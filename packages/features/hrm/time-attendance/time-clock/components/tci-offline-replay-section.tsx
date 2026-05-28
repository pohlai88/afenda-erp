import { getTranslations } from "next-intl/server"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/ui/card"

import { TimeClockOfflineReplayForm } from "./tci-offline-replay-form.client"

export async function TimeClockOfflineReplaySection() {
  const t = await getTranslations("Erp.Hrm.timeClock.offlineReplay")

  return (
    <Card size="sm" data-testid="time-clock-offline-replay-section">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <TimeClockOfflineReplayForm />
      </CardContent>
    </Card>
  )
}
