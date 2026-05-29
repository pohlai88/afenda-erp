import { Button } from "@afenda/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@afenda/ui";
import Link from "next/link";
import type { SystemAdminAuditEventDetail } from "../contracts/system-admin.audit-event.contract";

export function SystemAdminAuditDetailPanel({
  detail,
  backHref,
}: {
  detail: SystemAdminAuditEventDetail;
  backHref?: string;
}) {
  return (
    <Card data-testid="system-admin-audit-detail">
      <CardHeader className="flex flex-row items-center justify-between gap-surface-md">
        <CardTitle>Audit event detail</CardTitle>
        {backHref ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={backHref}>Back to results</Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="@container flex flex-col gap-surface-md type-body">
        <dl className="grid gap-2 @sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Time</dt>
            <dd>{detail.occurredAt}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Actor</dt>
            <dd className="type-mono-cell">{detail.actorId}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Action</dt>
            <dd>{detail.action}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Module</dt>
            <dd>{detail.moduleKey}</dd>
          </div>
          <div className="@sm:col-span-2">
            <dt className="text-muted-foreground">Target</dt>
            <dd>
              {detail.entityType}:{detail.entityId}
            </dd>
          </div>
          <div className="@sm:col-span-2">
            <dt className="text-muted-foreground">Summary</dt>
            <dd>{detail.summary}</dd>
          </div>
        </dl>
        <div>
          <p className="mb-2 text-muted-foreground">Metadata (redacted)</p>
          <pre className="max-h-96 overflow-auto rounded-control border border-border bg-muted/30 p-3 type-mono-cell">
            {JSON.stringify(detail.metadata, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
