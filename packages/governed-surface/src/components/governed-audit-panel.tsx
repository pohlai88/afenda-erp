import type { Route } from "next";

import Link from "next/link";

import { Badge } from "@afenda/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@afenda/ui/table";
import { cn } from "@afenda/ui/utils";

import type { AuditPanelModel } from "../schemas/audit-panel.schema";
import { governedRendererCopy } from "../i18n/governed-renderer-copy.shared";
import { GovernedEmpty } from "./governed-empty";

export type GovernedAuditPanelProps = {
  model: AuditPanelModel;
};

const AUDIT_ROW_TONE_CLASS = {
  default: "",
  attention: "bg-warning/5",
  critical: "bg-critical/5",
} as const;

const AUDIT_CHIP_VARIANT = {
  default: "secondary",
  positive: "success",
  attention: "warning",
  critical: "critical",
} as const;

/**
 * Read-only audit/evidence table — label resolution stays in the owning module.
 */
export function GovernedAuditPanel({ model }: GovernedAuditPanelProps) {
  if (model.rows.length === 0) {
    return (
      <GovernedEmpty
        model={{
          variant: "muted",
          title: governedRendererCopy.empty.auditPanel.title,
          description:
            model.headerDescription ??
            governedRendererCopy.empty.auditPanel.description,
        }}
      />
    );
  }

  const tableDensity = model.density === "compact" ? "compact" : "comfortable";
  const headerCellClass = "type-table-header";

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="type-subtitle">{model.headerTitle}</h3>
        {model.headerDescription ? (
          <p className="type-muted">{model.headerDescription}</p>
        ) : null}
      </div>
      {/* audit-ds: ignore no-arbitrary-value — scroll viewport height contract */}
      <div className="max-h-[28rem] overflow-auto rounded-section border">
        {/* audit-ds: ignore no-arbitrary-value — table minimum scroll width */}
        <Table
          density={tableDensity}
          aria-label={model.headerTitle}
          className="min-w-[720px] text-left type-control" // audit-ds: ignore no-arbitrary-value — table minimum scroll width
        >
          <TableHeader className="sticky top-0 z-raised bg-card shadow-elevation-1">
            <TableRow>
              <TableHead className={headerCellClass}>When</TableHead>
              <TableHead className={headerCellClass}>Action</TableHead>
              <TableHead className={headerCellClass}>Actor</TableHead>
              <TableHead className={headerCellClass}>Resource</TableHead>
              <TableHead className={headerCellClass}>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {model.rows.map((row) => {
              const tone = row.tone ?? "default";
              return (
                <TableRow
                  key={row.id}
                  className={cn("hover:bg-muted/30", AUDIT_ROW_TONE_CLASS[tone])}
                >
                  <TableCell className="type-mono-muted whitespace-nowrap">
                    <time dateTime={row.occurredAt}>{row.occurredAt}</time>
                    {row.durationLabel ? (
                      <span className="block type-mono-cell">
                        {row.durationLabel}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="type-mono-cell">
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
                  </TableCell>
                  {/* audit-ds: ignore no-arbitrary-value — actor column max-width contract */}
                  <TableCell className="max-w-[170px] truncate font-medium">
                    {row.actorLabel}
                    {row.actorDetail ? (
                      <span className="block truncate font-normal text-muted-foreground">
                        {row.actorDetail}
                      </span>
                    ) : null}
                  </TableCell>
                  {/* audit-ds: ignore no-arbitrary-value — resource column max-width contract */}
                  <TableCell className="max-w-[180px] truncate type-caption">
                    {row.resourceLabel ?? "—"}
                  </TableCell>
                  {/* audit-ds: ignore no-arbitrary-value — details column max-width contract */}
                  <TableCell className="max-w-[320px] type-caption">
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
                          className="w-fit type-caption text-primary hover:underline"
                        >
                          Evidence
                        </Link>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
