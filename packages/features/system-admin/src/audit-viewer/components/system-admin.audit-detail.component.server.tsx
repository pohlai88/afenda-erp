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
  const hasValue = (value: unknown) =>
    value !== undefined && value !== null && value !== "";

  const renderField = (label: string, value: string | number | undefined) => {
    if (!hasValue(value)) {
      return null;
    }

    return (
      <div>
        <dt className="type-muted">{label}</dt>
        <dd className="break-words">{value}</dd>
      </div>
    );
  };

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
            <dt className="type-muted">{fields.actorType}</dt>
            <dd>{detail.actorType ?? "not recorded"}</dd>
          </div>
          {renderField(fields.actorRole, detail.actorRole)}
          <div>
            <dt className="type-muted">{fields.action}</dt>
            <dd>{detail.action}</dd>
          </div>
          <div>
            <dt className="type-muted">{fields.module}</dt>
            <dd>{detail.moduleKey}</dd>
          </div>
          <div>
            <dt className="type-muted">{fields.outcome}</dt>
            <dd>{detail.outcome ?? "not recorded"}</dd>
          </div>
          <div className="@sm:col-span-2">
            <dt className="type-muted">{fields.target}</dt>
            <dd>
              {detail.targetDisplayName ??
                `${detail.targetType ?? detail.entityType}:${detail.targetId ?? detail.entityId}`}
            </dd>
          </div>
          <div>
            <dt className="type-muted">{fields.targetType}</dt>
            <dd>{detail.targetType ?? detail.entityType}</dd>
          </div>
          <div>
            <dt className="type-muted">{fields.targetId}</dt>
            <dd className="type-mono-cell">{detail.targetId ?? detail.entityId}</dd>
          </div>
          {detail.subjectType || detail.subjectId ? (
            <div className="@sm:col-span-2">
              <dt className="type-muted">{fields.subject}</dt>
              <dd className="type-mono-cell">
                {detail.subjectType ?? "subject"}
                {detail.subjectId ? `:${detail.subjectId}` : ""}
              </dd>
            </div>
          ) : null}
          {detail.targetDisplayName ? (
            <div className="@sm:col-span-2">
              <dt className="type-muted">{fields.targetDisplayName}</dt>
              <dd>{detail.targetDisplayName}</dd>
            </div>
          ) : null}
          {detail.surface ? (
            <div>
              <dt className="type-muted">{fields.surface}</dt>
              <dd>{detail.surface}</dd>
            </div>
          ) : null}
          {detail.route ? (
            <div>
              <dt className="type-muted">{fields.route}</dt>
              <dd className="type-mono-cell">{detail.route}</dd>
            </div>
          ) : null}
          {detail.channel ? (
            <div>
              <dt className="type-muted">{fields.channel}</dt>
              <dd>{detail.channel}</dd>
            </div>
          ) : null}
          {detail.reason ? (
            <div className="@sm:col-span-2">
              <dt className="type-muted">{fields.reason}</dt>
              <dd>{detail.reason}</dd>
            </div>
          ) : null}
          {detail.policyReference ? (
            <div>
              <dt className="type-muted">{fields.policyReference}</dt>
              <dd className="type-mono-cell">{detail.policyReference}</dd>
            </div>
          ) : null}
          {detail.approvalId ? (
            <div>
              <dt className="type-muted">{fields.approvalId}</dt>
              <dd className="type-mono-cell">{detail.approvalId}</dd>
            </div>
          ) : null}
          {detail.requestId ? (
            <div>
              <dt className="type-muted">{fields.requestId}</dt>
              <dd className="type-mono-cell">{detail.requestId}</dd>
            </div>
          ) : null}
          {detail.operationId ? (
            <div>
              <dt className="type-muted">{fields.operationId}</dt>
              <dd className="type-mono-cell">{detail.operationId}</dd>
            </div>
          ) : null}
          {detail.beforeJson ? (
            <div className="@sm:col-span-2">
              <dt className="type-muted">{fields.before}</dt>
              <pre className="mt-1 max-h-64 overflow-auto rounded-control border border-border bg-muted/20 p-3 type-mono-cell">
                {JSON.stringify(detail.beforeJson, null, 2)}
              </pre>
            </div>
          ) : null}
          {detail.afterJson ? (
            <div className="@sm:col-span-2">
              <dt className="type-muted">{fields.after}</dt>
              <pre className="mt-1 max-h-64 overflow-auto rounded-control border border-border bg-muted/20 p-3 type-mono-cell">
                {JSON.stringify(detail.afterJson, null, 2)}
              </pre>
            </div>
          ) : null}
          {detail.diffJson && detail.diffJson.length > 0 ? (
            <div className="@sm:col-span-2">
              <dt className="type-muted">{fields.diff}</dt>
              <pre className="mt-1 max-h-64 overflow-auto rounded-control border border-border bg-muted/20 p-3 type-mono-cell">
                {JSON.stringify(detail.diffJson, null, 2)}
              </pre>
            </div>
          ) : null}
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
