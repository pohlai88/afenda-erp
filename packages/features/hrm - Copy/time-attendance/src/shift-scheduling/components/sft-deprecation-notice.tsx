import { getTranslations } from "next-intl/server"

import { SftAttendanceShiftLink } from "./sft-attendance-shift-link"

type SftDeprecationNoticeProps = {
  orgSlug: string
}

/** Shown on attendance — shift authoring moved to shift-scheduling. */
export async function SftDeprecationNotice({
  orgSlug,
}: SftDeprecationNoticeProps) {
  const t = await getTranslations("Erp.Hrm.shiftScheduling")

  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {t("attendanceDeprecationBody")}
      </p>
      <SftAttendanceShiftLink orgSlug={orgSlug} />
    </section>
  )
}
