import { Button } from "@afenda/ui";
import Link from "next/link";
import type { SystemAdminAuditEventDetail } from "./sys-audit-event.contract";
import { buildSystemAdminAuditInvestigationLinks } from "./sys-audit-investigation.shared";
import { systemAdminAuditUiCopy } from "./sys-audit-ui.copy.shared";

export function SystemAdminAuditInvestigationPanel({
  detail,
}: {
  detail: SystemAdminAuditEventDetail;
}) {
  const links = buildSystemAdminAuditInvestigationLinks(detail);
  const copy = systemAdminAuditUiCopy.investigation;

  return (
    <section
      className="@container flex flex-col gap-surface-md rounded-section border border-border bg-card p-surface-lg"
      data-testid="system-admin-audit-investigation"
    >
      <div>
        <h2 className="type-subtitle">{copy.title}</h2>
        <p className="type-muted">{copy.description}</p>
      </div>
      <div className="flex flex-wrap gap-surface-sm">
        {links.map((link) => (
          <Button key={link.kind} variant="outline" size="sm" asChild>
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </section>
  );
}
