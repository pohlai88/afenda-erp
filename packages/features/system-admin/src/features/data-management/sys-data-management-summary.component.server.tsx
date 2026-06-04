import { Alert, Badge, Card, CardContent, CardHeader, CardTitle } from "@afenda/ui";
import type { SystemAdminDataManagementSummary } from "./sys-import-job.contract";
import { systemAdminDataManagementUiCopy } from "../surface/system-admin.data-management-ui.copy.shared";

export function SystemAdminDataManagementSummaryPanel({
  summary,
}: {
  summary: SystemAdminDataManagementSummary;
}) {
  const copy = systemAdminDataManagementUiCopy.summary;
  const attentionCount =
    summary.failedJobs + summary.cancelledJobs + summary.runningJobs;

  return (
    <div className="@container flex flex-col gap-surface-md">
      <Alert>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{copy.title}</p>
          <Badge variant={attentionCount > 0 ? "secondary" : "outline"}>
            {attentionCount} attention
          </Badge>
        </div>
        <p className="type-muted">{copy.description}</p>
      </Alert>

      <div className="grid gap-surface-md @md:grid-cols-3 @xl:grid-cols-6">
        <SummaryCard label={copy.totalJobs} value={summary.totalJobs} />
        <SummaryCard label={copy.readyJobs} value={summary.readyJobs} />
        <SummaryCard label="Running" value={summary.runningJobs} />
        <SummaryCard label={copy.completedJobs} value={summary.completedJobs} />
        <SummaryCard label={copy.failedJobs} value={summary.failedJobs} critical />
        <SummaryCard label={copy.failedRows} value={summary.failedRows} critical />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  critical = false,
}: {
  label: string;
  value: number;
  critical?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="type-body font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <span className="type-section-title tabular-nums">{value}</span>
        {critical && value > 0 ? (
          <Badge className="border-critical/40 bg-critical/10 text-critical">
            Review
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  );
}
