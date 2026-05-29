import type { SystemAdminAuditSearchParams } from "../schemas/system-admin.audit-filter.schema";
import { buildSystemAdminAuditPageHref } from "./system-admin.audit-pagination.shared";

export type SystemAdminAuditInvestigationKind =
  | "actor"
  | "target"
  | "capability"
  | "action";

export type SystemAdminAuditInvestigationLink = {
  kind: SystemAdminAuditInvestigationKind;
  label: string;
  href: string;
};

const INVESTIGATION_BASE: SystemAdminAuditSearchParams = {
  auditPage: 1,
  auditPageSize: 25,
};

export function buildSystemAdminActorInvestigationHref(actorId: string) {
  return buildSystemAdminAuditPageHref(
    { ...INVESTIGATION_BASE, auditActor: actorId },
    1,
  );
}

export function buildSystemAdminTargetInvestigationHref(input: {
  entityType: string;
  entityId: string;
}) {
  return buildSystemAdminAuditPageHref(
    {
      ...INVESTIGATION_BASE,
      auditTargetType: input.entityType as SystemAdminAuditSearchParams["auditTargetType"],
      auditTargetId: input.entityId,
    },
    1,
  );
}

export function buildSystemAdminCapabilityInvestigationHref(moduleKey: string) {
  return buildSystemAdminAuditPageHref(
    { ...INVESTIGATION_BASE, auditModule: moduleKey },
    1,
  );
}

export function buildSystemAdminActionInvestigationHref(action: string) {
  return buildSystemAdminAuditPageHref(
    { ...INVESTIGATION_BASE, auditAction: action },
    1,
  );
}

export function buildSystemAdminAuditInvestigationLinks(
  detail: {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    moduleKey: string;
  },
): readonly SystemAdminAuditInvestigationLink[] {
  return [
    {
      kind: "actor",
      label: "Actor activity",
      href: buildSystemAdminActorInvestigationHref(detail.actorId),
    },
    {
      kind: "target",
      label: "Target history",
      href: buildSystemAdminTargetInvestigationHref({
        entityType: detail.entityType,
        entityId: detail.entityId,
      }),
    },
    {
      kind: "capability",
      label: "Module evidence",
      href: buildSystemAdminCapabilityInvestigationHref(detail.moduleKey),
    },
    {
      kind: "action",
      label: "Matching actions",
      href: buildSystemAdminActionInvestigationHref(detail.action),
    },
  ];
}
