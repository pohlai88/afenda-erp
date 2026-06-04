import { Alert, Badge, Card, CardContent, CardHeader, CardTitle } from "@afenda/ui";
import type { SystemAdminDiagnosticsSummary } from "./sys-diagnostic-issue.contract";
import { formatGovernanceHealthVerdictLabel } from "./sys-diagnostics.verdict.server";
import { systemAdminDiagnosticsUiCopy } from "./sys-diagnostics-ui.copy.shared";

function verdictBadgeVariant(
  verdict: SystemAdminDiagnosticsSummary["verdict"],
): "default" | "secondary" | "outline" {
  if (verdict === "blocked") {
    return "default";
  }

  if (verdict === "warning") {
    return "secondary";
  }

  return "outline";
}

export function SystemAdminDiagnosticsSummaryPanel({
  summary,
}: {
  summary: SystemAdminDiagnosticsSummary;
}) {
  const copy = systemAdminDiagnosticsUiCopy.summary;

  return (
    <div className="@container flex flex-col gap-surface-md">
      {summary.isHealthy ? (
        <Alert variant="default" data-testid="system-admin-diagnostics-healthy">
          <p className="font-medium">{copy.healthyTitle}</p>
          <p className="type-muted">{copy.healthyDescription}</p>
        </Alert>
      ) : (
        <Alert
          variant="default"
          data-testid={`system-admin-diagnostics-verdict-${summary.verdict}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{copy.verdictTitle}</p>
            <Badge variant={verdictBadgeVariant(summary.verdict)}>
              {formatGovernanceHealthVerdictLabel(summary.verdict)}
            </Badge>
          </div>
          <p className="type-muted">
            {summary.blockedCount} blocked · {summary.warningCount} warnings ·{" "}
            {summary.infoCount} informational
          </p>
        </Alert>
      )}

      <div className="grid gap-surface-md @md:grid-cols-3">
        <Card data-testid="system-admin-diagnostics-summary-blocked">
          <CardHeader className="pb-2">
            <CardTitle className="type-body font-medium">
              {copy.blockedCard}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <span className="type-section-title tabular-nums">
              {summary.blockedCount}
            </span>
            <Badge className="bg-critical/10 text-critical border-critical/40">
              {copy.blockedBadge}
            </Badge>
          </CardContent>
        </Card>

        <Card data-testid="system-admin-diagnostics-summary-warning">
          <CardHeader className="pb-2">
            <CardTitle className="type-body font-medium">
              {copy.warningCard}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <span className="type-section-title tabular-nums">
              {summary.warningCount}
            </span>
            <Badge variant="secondary">{copy.warningBadge}</Badge>
          </CardContent>
        </Card>

        <Card data-testid="system-admin-diagnostics-summary-info">
          <CardHeader className="pb-2">
            <CardTitle className="type-body font-medium">{copy.infoCard}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <span className="type-section-title tabular-nums">
              {summary.infoCount}
            </span>
            <Badge variant="outline">{copy.infoBadge}</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
