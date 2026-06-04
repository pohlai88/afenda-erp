import { formatApprovalEscalationSummary } from "./system-admin.approval-rules.shared";
import type {
  ApprovalEscalationBehavior,
  SystemAdminApprovalMode,
  SystemAdminApprovalRuleDetail,
  SystemAdminApprovalRuleListRow,
  SystemAdminApprovalRuleStatus,
  ApprovalReadinessVerdict,
} from "../contracts/system-admin.approval-rule.contract";
import type { SystemAdminApprovalQueueListRow } from "../contracts/system-admin.approvals-queue.contract";
import { systemAdminApprovalsUiCopy } from "./system-admin.approvals-ui.copy.shared";

/** Stable approval keys referenced by gallery tests and the metadata renderer page. */
export const systemAdminApprovalsGalleryScenarioKeys = {
  readyActive: "purchasing.po.approval",
  warningActive: "finance.payment.release",
  warningDisabled: "hr.salary.change",
  blockedDeprecated: "hr.legacy.policy",
} as const;

type GalleryApprovalListRowInput = {
  id: string;
  key: string;
  name: string;
  moduleKey: string;
  action: string;
  targetType: string;
  approvalMode: SystemAdminApprovalMode;
  approverRoles: string;
  minApprovals: number;
  escalationAfterHours?: number;
  escalationBehavior?: ApprovalEscalationBehavior;
  escalationRoleKeys?: readonly string[];
  status: SystemAdminApprovalRuleStatus;
  enabled: boolean;
  readinessVerdict: ApprovalReadinessVerdict;
};

function galleryApprovalListRow(
  input: GalleryApprovalListRowInput,
): SystemAdminApprovalRuleListRow {
  const {
    escalationAfterHours,
    escalationBehavior,
    escalationRoleKeys = [],
    ...row
  } = input;

  return {
    ...row,
    escalation: formatApprovalEscalationSummary({
      escalationAfterHours,
      escalationBehavior,
      escalationRoleKeys,
    }),
  };
}

/**
 * Pattern C list visual matrix:
 * - active / ready / enabled with notify escalation
 * - active / warning / enabled with reassign escalation
 * - disabled / warning / disabled without escalation
 * - deprecated / blocked / disabled without escalation
 */
export const systemAdminApprovalsGalleryRows: readonly SystemAdminApprovalRuleListRow[] =
  [
    galleryApprovalListRow({
      id: "approval-gallery-1",
      key: systemAdminApprovalsGalleryScenarioKeys.readyActive,
      name: "High value purchase order",
      moduleKey: "purchasing",
      action: "purchasing.purchase-order.create",
      targetType: "erp-record",
      approvalMode: "sequential",
      approverRoles: "finance-manager, owner",
      minApprovals: 2,
      escalationAfterHours: 24,
      escalationBehavior: "notify",
      status: "active",
      enabled: true,
      readinessVerdict: "ready",
    }),
    galleryApprovalListRow({
      id: "approval-gallery-2",
      key: systemAdminApprovalsGalleryScenarioKeys.warningActive,
      name: "Payment release",
      moduleKey: "finance",
      action: "finance.documents.write",
      targetType: "erp-record",
      approvalMode: "parallel",
      approverRoles: "finance-manager",
      minApprovals: 1,
      escalationAfterHours: 48,
      escalationBehavior: "reassign",
      escalationRoleKeys: ["owner"],
      status: "active",
      enabled: true,
      readinessVerdict: "warning",
    }),
    galleryApprovalListRow({
      id: "approval-gallery-3",
      key: systemAdminApprovalsGalleryScenarioKeys.warningDisabled,
      name: "Salary change",
      moduleKey: "hr",
      action: "hr.documents.write",
      targetType: "erp-record",
      approvalMode: "parallel",
      approverRoles: "admin",
      minApprovals: 1,
      status: "disabled",
      enabled: false,
      readinessVerdict: "warning",
    }),
    galleryApprovalListRow({
      id: "approval-gallery-4",
      key: systemAdminApprovalsGalleryScenarioKeys.blockedDeprecated,
      name: "Legacy leave approval",
      moduleKey: "hr",
      action: "hr.leave.request",
      targetType: "erp-record",
      approvalMode: "sequential",
      approverRoles: "hr-manager",
      minApprovals: 1,
      status: "deprecated",
      enabled: false,
      readinessVerdict: "blocked",
    }),
  ] as const;

export const systemAdminApprovalDetailGalleryFixture = {
  approvalKey: systemAdminApprovalsGalleryScenarioKeys.readyActive,
  name: "High value purchase order",
  moduleKey: "purchasing",
  action: "purchasing.purchase-order.create",
  targetType: "erp-record",
  approvalMode: "sequential",
  approverRoleKeys: ["finance-manager", "owner"],
  delegateToRoleKeys: ["operations-manager"],
  delegationValidDays: 30,
  minApprovals: 2,
  escalationAfterHours: 24,
  escalationBehavior: "notify",
  escalationRoleKeys: [],
  status: "active",
  enabled: true,
  readinessVerdict: "ready",
  capabilityKey: "purchasing.purchase-order.create",
  capabilityLabel: "Create purchase order",
  requiredPermission: "purchasing.purchase-order.create",
  relatedPolicyKeys: ["purchasing.po.require-approval"],
  recentActivity: [
    {
      id: "audit-gallery-1",
      occurredAt: "1 Jun 2026, 09:00",
      actorId: "user-gallery-admin",
      action: "system-admin.approval_rule.update",
      summary: "Updated approval rule purchasing.po.approval",
    },
    {
      id: "audit-gallery-2",
      occurredAt: "28 May 2026, 16:30",
      actorId: "user-gallery-finance",
      action: "system-admin.approval_rule.review",
      summary: "Reviewed readiness for purchasing.po.approval",
    },
  ],
  auditHref: "/system-admin/audit?auditQ=purchasing.po.approval",
} satisfies SystemAdminApprovalRuleDetail;

export const systemAdminApprovalDetailDeprecatedGalleryFixture = {
  approvalKey: systemAdminApprovalsGalleryScenarioKeys.blockedDeprecated,
  name: "Legacy leave approval",
  moduleKey: "hr",
  action: "hr.leave.request",
  targetType: "erp-record",
  approvalMode: "sequential",
  approverRoleKeys: ["hr-manager"],
  delegateToRoleKeys: [],
  minApprovals: 1,
  escalationRoleKeys: [],
  status: "deprecated",
  enabled: false,
  readinessVerdict: "blocked",
  capabilityKey: null,
  capabilityLabel: null,
  requiredPermission: null,
  relatedPolicyKeys: [],
  recentActivity: [
    {
      id: "audit-gallery-deprecated-1",
      occurredAt: "15 May 2026, 14:00",
      actorId: "user-gallery-admin",
      action: "system-admin.approval_rule.deprecate",
      summary: "Deprecated approval rule hr.legacy.policy",
    },
  ],
  auditHref: "/system-admin/audit?auditQ=hr.legacy.policy",
} satisfies SystemAdminApprovalRuleDetail;

/** Stable queue keys referenced by gallery tests and the metadata renderer page. */
export const systemAdminApprovalsQueueGalleryScenarioKeys = {
  pendingDecide: "queue-gallery-pending",
  escalated: "queue-gallery-escalated",
  inReview: "queue-gallery-in-review",
  completed: "queue-gallery-completed",
} as const;

/**
 * Pattern C queue visual matrix:
 * - pending / medium / decide-ready
 * - escalated / high / critical tone
 * - in-review / medium / attention tone
 * - completed / hidden trailing
 */
export const systemAdminApprovalsQueueGalleryRows: readonly SystemAdminApprovalQueueListRow[] =
  [
    {
      id: systemAdminApprovalsQueueGalleryScenarioKeys.pendingDecide,
      subject: "Capex approval — Q2 equipment",
      owner: "Finance Controller",
      status: "pending",
      priority: "medium",
      due: "3 Jun 2026",
      dueAt: "2026-06-03T00:00:00.000Z",
      route: "capex",
      escalated: false,
      sourceRecordHref: "/purchasing/records/rec-capex-1",
      decisionComplete: false,
    },
    {
      id: systemAdminApprovalsQueueGalleryScenarioKeys.escalated,
      subject: "Payment release — vendor INV-4421",
      owner: "Accounts Payable",
      status: "escalated",
      priority: "high",
      due: "2 Jun 2026",
      dueAt: "2026-06-02T00:00:00.000Z",
      route: "finance.payment",
      escalated: true,
      sourceRecordHref: "/finance/records/rec-pay-1",
      decisionComplete: false,
    },
    {
      id: systemAdminApprovalsQueueGalleryScenarioKeys.inReview,
      subject: "Salary change — engineering band",
      owner: "HR Operations",
      status: "in-review",
      priority: "medium",
      due: "5 Jun 2026",
      dueAt: "2026-06-05T00:00:00.000Z",
      route: "hr.compensation",
      escalated: false,
      sourceRecordHref: null,
      decisionComplete: false,
    },
    {
      id: systemAdminApprovalsQueueGalleryScenarioKeys.completed,
      subject: "Vendor onboarding — Acme Supplies",
      owner: "Procurement Lead",
      status: "completed",
      priority: "low",
      due: "28 May 2026",
      dueAt: "2026-05-28T00:00:00.000Z",
      route: "purchasing.vendor",
      escalated: false,
      sourceRecordHref: "/purchasing/records/rec-vendor-1",
      decisionComplete: true,
    },
  ] as const;

export const systemAdminApprovalsGalleryCopy = {
  listReadOnlyDescription:
    systemAdminApprovalsUiCopy.list.emptyDescriptionReadOnly,
  queueReadOnlyDescription:
    systemAdminApprovalsUiCopy.queue.emptyDescriptionReadOnly,
  detailNotConfigured: systemAdminApprovalsUiCopy.detail.notConfigured,
} as const;
