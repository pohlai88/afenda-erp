import type { ReactNode } from "react"

type TimeClockPageSectionGroupProps = {
  sectionId: string
  title: string
  description?: string
  children: ReactNode
}

export function TimeClockPageSectionGroup({
  sectionId,
  title,
  description,
  children,
}: TimeClockPageSectionGroupProps) {
  const headingId = `time-clock-section-${sectionId}`
  return (
    <section
      id={`time-clock-${sectionId}`}
      className="flex scroll-mt-24 flex-col gap-4"
      aria-labelledby={headingId}
    >
      <div className="flex flex-col gap-1">
        <h2 id={headingId} className="text-lg font-semibold tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  )
}
