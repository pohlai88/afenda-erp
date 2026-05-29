import { Button } from "@afenda/ui";
import Link from "next/link";
import type { SystemAdminAuditCoverageGapRow } from "../contracts/system-admin.audit-coverage.contract";
import { systemAdminAuditCoverageDiagnosticsHref } from "../../diagnostics/contracts/system-admin.diagnostics-links.shared";
import { systemAdminControlLinks } from "../../overview/contracts/system-admin.control-links.contract";
import { systemAdminAuditUiCopy } from "../surface/system-admin.audit-ui.copy.shared";

export function SystemAdminAuditCoveragePanel({
  gaps,
}: {
  gaps: readonly SystemAdminAuditCoverageGapRow[];
}) {
  const copy = systemAdminAuditUiCopy.coverage;

  return (
    <section
      className="@container flex flex-col gap-surface-md rounded-section border border-border bg-card p-surface-lg"
      data-testid="system-admin-audit-coverage"
    >
      <div className="flex flex-col gap-surface-sm @md:flex-row @md:items-start @md:justify-between">
        <div>
          <h2 className="type-subtitle">{copy.title}</h2>
          <p className="type-muted">{copy.description}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={systemAdminAuditCoverageDiagnosticsHref}>
            {copy.diagnosticsLink}
          </Link>
        </Button>
      </div>

      {gaps.length === 0 ? (
        <p className="type-muted">{copy.empty}</p>
      ) : (
        <ul className="flex flex-col gap-surface-sm">
          {gaps.slice(0, 8).map((gap) => (
            <li
              key={gap.capabilityKey}
              className="flex flex-col gap-1 rounded-control border border-border p-surface-md @sm:flex-row @sm:items-center @sm:justify-between"
            >
              <div>
                <p className="type-body font-medium">{gap.capabilityKey}</p>
                <p className="type-muted">{gap.summary}</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={systemAdminControlLinks.capabilities(gap.moduleKey)}>
                  {copy.capabilityLink}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}

      {gaps.length > 8 ? (
        <p className="type-caption">
          {gaps.length - 8} {copy.truncatedSuffix}
        </p>
      ) : null}
    </section>
  );
}
