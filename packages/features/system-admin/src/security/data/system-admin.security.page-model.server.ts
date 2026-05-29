import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { getSystemAdminOrganizationSecuritySettings } from "./system-admin.security.query.server";
import { evaluateSecurityReadiness } from "./system-admin.security.readiness.server";
import { listSystemAdminSecurityRecentChanges } from "./system-admin.security.recent-changes.server";
import { systemAdminSecurityAuditActions } from "../events/system-admin.security.event";

export async function buildSystemAdminSecurityPageModel(input: {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
}) {
  const [security, recentChanges] = await Promise.all([
    getSystemAdminOrganizationSecuritySettings({
      organizationId: input.organizationId,
    }),
    listSystemAdminSecurityRecentChanges({
      organizationId: input.organizationId,
    }),
  ]);

  const readiness = evaluateSecurityReadiness(security);

  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: systemAdminSecurityAuditActions.view,
    targetType: "organization_security_settings",
    targetId: input.organizationId,
    metadata: {
      readinessVerdict: readiness.verdict,
      issueCount: readiness.issues.length,
      recentChangeCount: recentChanges.length,
    },
  });

  return {
    security,
    readiness,
    recentChanges,
  };
}
