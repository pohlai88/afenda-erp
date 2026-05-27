import type { Route } from "next"

import Link from "next/link"

import { Badge } from "@afenda/ui/badge"
import { cn } from "@afenda/ui/utils"

import type { AuditPanelModel } from "../schemas/audit-panel.schema"

export type GovernedAuditPanelProps = {
  model: AuditPanelModel
}

const AUDIT_ROW_TONE_CLASS = {
  default: "",
  attention: "bg-warning/5",
  critical: "bg-critical/5",
} as const

const AUDIT_CHIP_VARIANT = {
  default: "secondary",
  positive: "success",
  attention: "warning",
  critical: "critical",
} as const

/**
 * Read-only audit/evidence table — label resolution stays in the owning module.
 */
export function GovernedAuditPanel({ model }: GovernedAuditPanelProps) {
  if (model.rows.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        {model.headerDescription ?? "No audit rows."}
      </p>
    )
  }

  const cellClass = model.density === "compact" ? "px-2 py-1.5" : "px-3 py-2.5"

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold tracking-tight">
          {model.headerTitle}
        </h3>
        {model.headerDescription ? (
          <p className="text-sm text-muted-foreground">
            {model.headerDescription}
          </p>
        ) : null}
      </div>
      <div className="max-h-[28rem] overflow-auto rounded-md border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="sticky top-0 z-10 border-b bg-card">
            <tr>
              <th className={cn(cellClass, "text-xs font-medium")}>When</th>
              <th className={cn(cellClass, "text-xs font-medium")}>Action</th>
              <th className={cn(cellClass, "text-xs font-medium")}>Actor</th>
              <th className={cn(cellClass, "text-xs font-medium")}>Resource</th>
              <th className={cn(cellClass, "text-xs font-medium")}>Details</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {model.rows.map((row) => {
              const tone = row.tone ?? "default"
              return (
                <tr
                  key={row.id}
                  className={cn(
                    "hover:bg-muted/30",
                    AUDIT_ROW_TONE_CLASS[tone]
                  )}
                >
                  <td
                    className={cn(
                      cellClass,
                      "font-mono text-[11px] whitespace-nowrap text-muted-foreground"
                    )}
                  >
                    <time dateTime={row.occurredAt}>{row.occurredAt}</time>
                    {row.durationLabel ? (
                      <span className="block text-[10px]">
                        {row.durationLabel}
                      </span>
                    ) : null}
                  </td>
                  <td
                    className={cn(
                      cellClass,
                      "font-mono text-[11px] leading-snug"
                    )}
                  >
                    {row.href ? (
                      <Link
                        href={row.href as Route}
                        prefetch={false}
                        className="text-primary hover:underline"
                      >
                        {row.action}
                      </Link>
                    ) : (
                      row.action
                    )}
                  </td>
                  <td
                    className={cn(
                      cellClass,
                      "max-w-[170px] truncate text-xs font-medium"
                    )}
                  >
                    {row.actorLabel}
                    {row.actorDetail ? (
                      <span className="block truncate font-normal text-muted-foreground">
                        {row.actorDetail}
                      </span>
                    ) : null}
                  </td>
                  <td
                    className={cn(
                      cellClass,
                      "max-w-[180px] truncate text-xs text-muted-foreground"
                    )}
                  >
                    {row.resourceLabel ?? "—"}
                  </td>
                  <td className={cn(cellClass, "max-w-[320px] text-xs")}>
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate text-muted-foreground">
                        {row.narrative ?? "—"}
                      </span>
                      {row.metadataChips?.length ? (
                        <span className="flex flex-wrap gap-1">
                          {row.metadataChips.map((chip) => (
                            <Badge
                              key={chip.label}
                              variant={
                                AUDIT_CHIP_VARIANT[chip.tone ?? "default"]
                              }
                            >
                              {chip.label}
                            </Badge>
                          ))}
                        </span>
                      ) : null}
                      {row.evidenceHref ? (
                        <Link
                          href={row.evidenceHref as Route}
                          prefetch={false}
                          className="w-fit text-xs text-primary hover:underline"
                        >
                          Evidence
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
