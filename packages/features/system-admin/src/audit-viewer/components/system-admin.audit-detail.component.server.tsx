import { Button, Card, CardContent, CardHeader, CardTitle } from "@afenda/ui";
import Link from "next/link";
import type { SystemAdminAuditEventDetail } from "../contracts";
import { systemAdminAuditUiCopy } from "../surface/system-admin.audit-ui.copy.shared";
import { SystemAdminAuditCorrelationBadges } from "./system-admin.audit-correlation-badges.component.server";
import { SystemAdminAuditInvestigationPanel } from "./system-admin.audit-investigation-panel.component.server";

export function SystemAdminAuditDetailPanel({
  detail,
  backHref,
}: {
  detail: SystemAdminAuditEventDetail;
  backHref?: string;
}) {
  const copy = systemAdminAuditUiCopy.detail;
  const fields = copy.fields;
  const hasCorrelation =
    detail.policyKeys.length > 0 || detail.approvalKeys.length > 0;

  return (
    <Card data-testid={`system-admin-audit-detail:${detail.id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-surface-md">
        <CardTitle>{copy.title}</CardTitle>
        {backHref ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={backHref}>{copy.backLabel}</Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="@container flex flex-col gap-surface-lg type-body">
        <dl className="grid gap-2 @sm:grid-cols-2">
          <div>
            <dt className="type-muted">{fields.time}</dt>
            <dd>{detail.occurredAt}</dd>
          </div>
          <div>
            <dt className="type-muted">{fields.actor}</dt>
            <dd className="type-mono-cell">{detail.actorId}</dd>
          </div>
          <div>
            <dt className="type-muted">{fields.action}</dt>
            <dd>{detail.action}</dd>
          </div>
          <div>
            <dt className="type-muted">{fields.module}</dt>
            <dd>{detail.moduleKey}</dd>
          </div>
          <div className="@sm:col-span-2">
            <dt className="type-muted">{fields.target}</dt>
            <dd>
              {detail.entityType}:{detail.entityId}
            </dd>
          </div>
          <div className="@sm:col-span-2">
            <dt className="type-muted">{fields.summary}</dt>
            <dd>{detail.summary}</dd>
          </div>
        </dl>

        <SystemAdminAuditInvestigationPanel detail={detail} />

        {hasCorrelation ? (
          <div className="flex flex-col gap-surface-sm">
            <p className="type-label">{copy.correlationTitle}</p>
            <SystemAdminAuditCorrelationBadges
              label={copy.policyLabel}
              keys={detail.policyKeys}
            />
            <SystemAdminAuditCorrelationBadges
              label={copy.approvalLabel}
              keys={detail.approvalKeys}
            />
          </div>
        ) : (
          <p className="type-muted">{copy.emptyCorrelation}</p>
        )}

        {detail.timeline.length > 0 ? (
          <div>
            <p className="mb-2 type-label">{copy.timelineTitle}</p>
            <ol className="flex flex-col gap-surface-sm border-l border-border pl-4">
              {detail.timeline.map((event) => (
                <li key={event.id} className="flex flex-col gap-0.5">
                  <span className="type-caption">{event.occurredAt}</span>
                  <span className="type-body">
                    {event.action}
                    {event.id === detail.id ? copy.selectedEventSuffix : ""}
                  </span>
                  <span className="type-muted">{event.summary}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <div>
          <p className="mb-2 type-muted">{copy.metadataLabel}</p>
          <pre className="max-h-96 overflow-auto rounded-control border border-border bg-muted/30 p-3 type-mono-cell">
            {JSON.stringify(detail.metadata, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
