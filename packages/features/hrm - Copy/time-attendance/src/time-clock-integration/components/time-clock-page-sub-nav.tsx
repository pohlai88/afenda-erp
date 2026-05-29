import { getTranslations } from "next-intl/server"

import Link from "next/link"

type TimeClockPageSubNavProps = {
  showCapture: boolean
  showQuality: boolean
  showDownstream: boolean
  showOperations: boolean
  showAdmin: boolean
}

const NAV_ITEMS = [
  { id: "setup", key: "setup" as const, always: true },
  { id: "capture", key: "capture" as const, flag: "showCapture" as const },
  { id: "quality", key: "quality" as const, flag: "showQuality" as const },
  {
    id: "downstream",
    key: "downstream" as const,
    flag: "showDownstream" as const,
  },
  {
    id: "operations",
    key: "operations" as const,
    flag: "showOperations" as const,
  },
  { id: "admin", key: "admin" as const, flag: "showAdmin" as const },
] as const

export async function TimeClockPageSubNav(props: TimeClockPageSubNavProps) {
  const t = await getTranslations("Erp.Hrm.timeClock.pageSubNav")

  const visible = NAV_ITEMS.filter((item) => {
    if ("always" in item && item.always) return true
    if ("flag" in item) return props[item.flag]
    return false
  })

  if (visible.length <= 1) {
    return null
  }

  return (
    <nav
      aria-label={t("ariaLabel")}
      className="flex flex-wrap gap-2 border-b border-border pb-3"
      data-testid="time-clock-page-sub-nav"
    >
      {visible.map((item) => (
        <Link
          key={item.id}
          href={`#time-clock-${item.id}`}
          prefetch={false}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {t(item.key)}
        </Link>
      ))}
    </nav>
  )
}
