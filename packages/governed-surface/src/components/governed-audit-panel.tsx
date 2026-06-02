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

import { governedRendererCopy } from "../i18n/governed-renderer-copy.shared";
import {
  auditPanelSchema,
  type AuditPanelModel,
} from "../schemas/audit-panel.schema";
import { diagnosticsDataAttributes } from "../utils/governed-diagnostics.shared";
import { GovernedHeading } from "../utils/governed-heading.shared";
import {
  governedDescriptionId,
  governedHeadingId,
  governedIdentityAttributes,
  governedTestId,
  toGovernedDomId,
} from "../utils/governed-identity.shared";
import { asGovernedRoute } from "../utils/governed-safe-route";
import { GovernedEmpty } from "./governed-empty";

export type GovernedAuditPanelProps = {
  model: AuditPanelModel;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
  className?: string;
};

const AUDIT_COLUMNS = {
  when: "When",
  action: "Action",
  actor: "Actor",
  resource: "Resource",
  details: "Details",
} satisfies Record<
  "when" | "action" | "actor" | "resource" | "details",
  string
>;

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

function summarizeAuditRows(rows: AuditPanelModel["rows"]) {
  return {
    attention: rows.filter((row) => row.tone === "attention").length,
    critical: rows.filter((row) => row.tone === "critical").length,
    evidence: rows.filter((row) => Boolean(row.evidenceHref)).length,
    actors: new Set(rows.map((row) => row.actorLabel)).size,
  };
}

/**
 * Read-only audit/evidence table — label resolution stays in the owning module.
 */
const AUDIT_PANEL_COMPONENT_TYPE = "governed:audit-panel";

export function GovernedAuditPanel({
  model,
  surfaceKey,
  sectionKey,
  componentKey: componentKeyProp,
  className,
}: GovernedAuditPanelProps) {
  const componentKey =
    componentKeyProp ?? sectionKey ?? surfaceKey ?? "audit-panel";
  const baseIdentity = {
    surfaceKey,
    sectionKey,
    componentKey,
  };
  const identityAttrs = governedIdentityAttributes(baseIdentity);
  const baseDiagnostics = {
    testId: governedTestId("audit-panel", componentKey),
    componentType: AUDIT_PANEL_COMPONENT_TYPE,
  };
  const panelId = toGovernedDomId("governed-audit-panel", componentKey);
  const headingId = governedHeadingId("audit-panel", componentKey);
  const descriptionId = governedDescriptionId("audit-panel", componentKey);
  const parsed = auditPanelSchema.safeParse(model);

  if (!parsed.success) {
    return (
      <section
        id={panelId}
        aria-labelledby={headingId}
        className={className}
        {...identityAttrs}
        {...diagnosticsDataAttributes({
          state: "invalid",
          ...baseDiagnostics,
        })}
      >
        <GovernedHeading level={3} variant="card" id={headingId} className="sr-only">
          {governedRendererCopy.empty.auditPanel.title}
        </GovernedHeading>
        <GovernedEmpty
          model={{
            variant: "error",
            title: governedRendererCopy.parseError.auditPanel.userTitle,
            description:
              governedRendererCopy.parseError.auditPanel.userDescription,
            emptyId: "audit-panel-invalid",
          }}
        />
      </section>
    );
  }

  const resolved = parsed.data;
  const isEmpty = resolved.rows.length === 0;
  const contractAttrs = {
    ...identityAttrs,
    ...diagnosticsDataAttributes({
      state: isEmpty ? "empty" : "ready",
      ...baseDiagnostics,
    }),
  };

  if (isEmpty) {
    return (
      <section
        id={panelId}
        aria-labelledby={headingId}
        className={className}
        {...contractAttrs}
      >
        <GovernedHeading level={3} variant="card" id={headingId} className="sr-only">
          {resolved.headerTitle}
        </GovernedHeading>
        <GovernedEmpty
          model={{
            variant: "muted",
            title: governedRendererCopy.empty.auditPanel.title,
            description:
              resolved.headerDescription ??
              governedRendererCopy.empty.auditPanel.description,
            emptyId: "audit-panel-empty",
          }}
        />
      </section>
    );
  }

  const tableDensity = resolved.density === "compact" ? "compact" : "comfortable";
  const headerCellClass = "type-table-header";
  const summary = summarizeAuditRows(resolved.rows);

  return (
    <section
      id={panelId}
      aria-labelledby={headingId}
      aria-describedby={resolved.headerDescription ? descriptionId : undefined}
      className={cn("flex flex-col gap-3", className)}
      {...contractAttrs}
    >
      <div>
        <GovernedHeading level={3} variant="card" id={headingId}>
          {resolved.headerTitle}
        </GovernedHeading>
        {resolved.headerDescription ? (
          <p id={descriptionId} className="type-muted">
            {resolved.headerDescription}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline">{resolved.rows.length} events</Badge>
        <Badge variant="secondary">{summary.actors} actors</Badge>
        {summary.evidence > 0 ? (
          <Badge variant="info">{summary.evidence} evidence links</Badge>
        ) : null}
        {summary.attention > 0 ? (
          <Badge variant="warning">{summary.attention} attention</Badge>
        ) : null}
        {summary.critical > 0 ? (
          <Badge variant="critical">{summary.critical} critical</Badge>
        ) : null}
      </div>

      {/* audit-ds: ignore no-arbitrary-value — scroll viewport height contract */}
      <div className="max-h-[28rem] overflow-auto rounded-section border">
        {/* audit-ds: ignore no-arbitrary-value — table minimum scroll width */}
        <Table
          density={tableDensity}
          aria-labelledby={headingId}
          aria-describedby={resolved.headerDescription ? descriptionId : undefined}
          data-testid={governedTestId("audit-panel-table", componentKey)}
          className="min-w-[720px] text-left type-control" // audit-ds: ignore no-arbitrary-value — table minimum scroll width
        >
          <TableHeader className="sticky top-0 z-raised bg-card shadow-elevation-1">
            <TableRow>
              <TableHead className={headerCellClass}>{AUDIT_COLUMNS.when}</TableHead>
              <TableHead className={headerCellClass}>{AUDIT_COLUMNS.action}</TableHead>
              <TableHead className={headerCellClass}>{AUDIT_COLUMNS.actor}</TableHead>
              <TableHead className={headerCellClass}>{AUDIT_COLUMNS.resource}</TableHead>
              <TableHead className={headerCellClass}>{AUDIT_COLUMNS.details}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resolved.rows.map((row) => {
              const tone = row.tone ?? "default";
              return (
                <TableRow
                  key={row.id}
                  data-audit-row-id={row.id}
                  data-audit-tone={tone}
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
                        href={asGovernedRoute(row.href)}
                        prefetch={false}
                        data-testid={governedTestId("audit-action", row.id)}
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
                          href={asGovernedRoute(row.evidenceHref)}
                          prefetch={false}
                          data-testid={governedTestId("audit-evidence", row.id)}
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
    </section>
  );
}
