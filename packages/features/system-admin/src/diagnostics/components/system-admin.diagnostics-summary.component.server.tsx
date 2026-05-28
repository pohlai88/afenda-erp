import { Alert, Badge, Card, CardContent, CardHeader, CardTitle } from "@afenda/ui";
import type { SystemAdminDiagnosticsSummary } from "../contracts/system-admin.diagnostic-issue.contract";

export function SystemAdminDiagnosticsSummaryPanel({
  summary,
}: {
  summary: SystemAdminDiagnosticsSummary;
}) {
  return (
    <div className="@container flex flex-col gap-4">
      {summary.isHealthy ? (
        <Alert variant="default" data-testid="system-admin-diagnostics-healthy">
          <p className="font-medium">System configuration is healthy</p>
          <p className="text-muted-foreground text-sm">
            Diagnostics did not detect blocked issues, warnings, or informational
            notices for this organization.
          </p>
        </Alert>
      ) : null}

      <div className="grid gap-4 @md:grid-cols-3">
        <Card data-testid="system-admin-diagnostics-summary-blocked">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <span className="text-2xl font-semibold tabular-nums">
              {summary.blockedCount}
            </span>
            <Badge variant="destructive">Must resolve</Badge>
          </CardContent>
        </Card>

        <Card data-testid="system-admin-diagnostics-summary-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <span className="text-2xl font-semibold tabular-nums">
              {summary.warningCount}
            </span>
            <Badge variant="secondary">Review</Badge>
          </CardContent>
        </Card>

        <Card data-testid="system-admin-diagnostics-summary-info">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Informational</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <span className="text-2xl font-semibold tabular-nums">
              {summary.infoCount}
            </span>
            <Badge variant="outline">Notice</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
