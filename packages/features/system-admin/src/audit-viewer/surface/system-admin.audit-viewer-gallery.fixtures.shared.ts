import type {
  SystemAdminAuditCoverageGapRow,
  SystemAdminAuditEventDetail,
  SystemAdminAuditEventRow,
} from "../contracts";

export const systemAdminAuditViewerGalleryRows: readonly SystemAdminAuditEventRow[] =
  [
    {
      id: "audit-gallery-1",
      occurredAt: "1 Jun 2026, 09:00",
      actorId: "user_demo_owner",
      action: "system-admin.approval_rule.update",
      target: "organization:org_demo",
      moduleKey: "system-admin",
      result: "recorded",
      summary: "Updated approval rule purchasing.po.approval",
    },
    {
      id: "audit-gallery-2",
      occurredAt: "1 Jun 2026, 10:15",
      actorId: "user_demo_owner",
      action: "finance.invoice.create",
      target: "erp-record:inv_1001",
      moduleKey: "finance",
      result: "recorded",
      summary: "Created invoice INV-1001",
    },
    {
      id: "audit-gallery-3",
      occurredAt: "1 Jun 2026, 11:30",
      actorId: "user_demo_finance",
      action: "system-admin.audit.export",
      target: "organization:org_demo",
      moduleKey: "system-admin",
      result: "recorded",
      summary: "Exported audit evidence (csv)",
    },
  ] as const;

export const systemAdminAuditDetailGalleryFixture: SystemAdminAuditEventDetail = {
  id: "audit-gallery-1",
  occurredAt: "1 Jun 2026, 09:00",
  actorId: "user_demo_owner",
  action: "system-admin.approval_rule.update",
  entityType: "organization",
  entityId: "org_demo",
  moduleKey: "system-admin",
  summary: "Updated approval rule purchasing.po.approval",
  policyKeys: ["purchasing.po.require-approval"],
  approvalKeys: ["purchasing.po.approval"],
  metadata: {
    approvalKey: "purchasing.po.approval",
    policyKey: "purchasing.po.require-approval",
    note: "Gallery fixture metadata",
  },
  timeline: [
    {
      id: "audit-gallery-t0",
      occurredAt: "1 Jun 2026, 08:45",
      actorId: "user_demo_owner",
      action: "system-admin.policy_rule.update",
      target: "organization:org_demo",
      moduleKey: "system-admin",
      result: "recorded",
      summary: "Updated policy purchasing.po.require-approval",
    },
    {
      id: "audit-gallery-1",
      occurredAt: "1 Jun 2026, 09:00",
      actorId: "user_demo_owner",
      action: "system-admin.approval_rule.update",
      target: "organization:org_demo",
      moduleKey: "system-admin",
      result: "recorded",
      summary: "Updated approval rule purchasing.po.approval",
    },
  ],
};

export const systemAdminAuditCoverageGalleryGaps: readonly SystemAdminAuditCoverageGapRow[] =
  [
    {
      capabilityKey: "finance.payment.release",
      moduleKey: "finance",
      requiredPermission: "finance.documents.write",
      summary: "Sensitive capability has no declared audit area.",
    },
  ];
