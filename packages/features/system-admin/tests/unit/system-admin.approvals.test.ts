import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireApprovalsManage = vi.fn();
const mockRequireApprovalsRead = vi.fn();
const mockUpsertApproval = vi.fn();
const mockWriteAudit = vi.fn();
const mockDispatchWebhook = vi.fn();

vi.mock(
  "../../src/approvals/policies/system-admin.approval-rules.policy.server",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../src/approvals/policies/system-admin.approval-rules.policy.server")
      >();
    return {
      ...actual,
      requireSystemAdminApprovalsManage: () => mockRequireApprovalsManage(),
      requireSystemAdminApprovalsRead: () => mockRequireApprovalsRead(),
    };
  },
);

vi.mock(
  "../../src/tenant-execution/data/system-admin.execution-settings.repository.server",
  () => ({
    listTenantApprovalSettings: vi.fn(async () => []),
    upsertTenantApprovalSettings: (...args: unknown[]) =>
      mockUpsertApproval(...args),
  }),
);

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: (...args: unknown[]) => mockWriteAudit(...args),
}));

vi.mock("../../src/integrations/events/system-admin.webhook-dispatch.event", () => ({
  dispatchSystemAdminWebhook: (...args: unknown[]) =>
    mockDispatchWebhook(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const guardContext = {
  context: {
    userId: "actor_1",
    actorType: "user" as const,
    organizationId: "org_1",
    organizationSlug: "acme",
    locale: "en",
    role: "admin" as const,
    capabilities: ["system-admin.approvals.manage"],
  },
  organization: {
    id: "org_1",
    slug: "acme",
    locale: "en",
    role: "admin" as const,
    capabilities: ["system-admin.approvals.manage"],
  },
  session: { id: "actor_1" },
};

describe("system admin approvals", () => {
  let updateSystemAdminApprovalRuleAction: typeof import("../../src/approvals/actions/system-admin.approval-rules.actions.server").updateSystemAdminApprovalRuleAction;

  beforeAll(async () => {
    ({ updateSystemAdminApprovalRuleAction } = await import(
      "../../src/approvals/actions/system-admin.approval-rules.actions.server"
    ));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireApprovalsManage.mockResolvedValue(guardContext);
    mockRequireApprovalsRead.mockResolvedValue(guardContext);
    mockUpsertApproval.mockResolvedValue(undefined);
  });

  it("requires approvals.read to view the catalog", async () => {
    mockRequireApprovalsRead.mockRejectedValue(new Error("Forbidden"));

    const { requireSystemAdminApprovalsRead } = await import(
      "../../src/approvals/policies/system-admin.approval-rules.policy.server"
    );

    await expect(requireSystemAdminApprovalsRead()).rejects.toThrow("Forbidden");
  });

  it("requires approvals.manage to update approval rules", async () => {
    mockRequireApprovalsManage.mockRejectedValue(new Error("Forbidden"));

    const formData = new FormData();
    formData.set("mode", "create");
    formData.set("approvalKey", "purchasing.po.approval");
    formData.set("name", "High value PO");
    formData.set("moduleKey", "purchasing");
    formData.set("action", "purchasing.purchase-order.create");
    formData.set("targetType", "erp-record");
    formData.set("approvalMode", "parallel");
    formData.set("approverRoleKeys", "finance-manager");
    formData.set("minApprovals", "1");
    formData.set("status", "active");
    formData.set("enabled", "true");

    await expect(
      updateSystemAdminApprovalRuleAction(undefined, formData),
    ).rejects.toThrow("Forbidden");
    expect(mockUpsertApproval).not.toHaveBeenCalled();
  });

  it("rejects invalid approver roles", async () => {
    const formData = new FormData();
    formData.set("mode", "create");
    formData.set("approvalKey", "purchasing.po.approval");
    formData.set("name", "High value PO");
    formData.set("moduleKey", "purchasing");
    formData.set("action", "purchasing.purchase-order.create");
    formData.set("targetType", "erp-record");
    formData.set("approvalMode", "parallel");
    formData.set("approverRoleKeys", "not-a-real-role");
    formData.set("minApprovals", "1");
    formData.set("status", "active");
    formData.set("enabled", "true");

    const result = await updateSystemAdminApprovalRuleAction(undefined, formData);

    expect(result.ok).toBe(false);
    expect(mockUpsertApproval).not.toHaveBeenCalled();
  });

  it("rejects duplicate approval keys on create", async () => {
    const { listTenantApprovalSettings } = await import(
      "../../src/tenant-execution/data/system-admin.execution-settings.repository.server"
    );
    vi.mocked(listTenantApprovalSettings).mockResolvedValueOnce([
      {
        id: "approval_existing",
        organizationId: "org_1",
        approvalKey: "purchasing.po.approval",
        label: "Existing rule",
        enabled: true,
        approverRole: "finance-manager",
        escalationMinutes: null,
        configuration: {
          moduleKey: "purchasing",
          action: "purchasing.purchase-order.create",
          targetType: "erp-record",
          approvalMode: "parallel",
          approverRoleKeys: ["finance-manager"],
          minApprovals: 1,
          status: "active",
        },
      },
    ]);

    const formData = new FormData();
    formData.set("mode", "create");
    formData.set("approvalKey", "purchasing.po.approval");
    formData.set("name", "Duplicate PO");
    formData.set("moduleKey", "purchasing");
    formData.set("action", "purchasing.purchase-order.create");
    formData.set("targetType", "erp-record");
    formData.set("approvalMode", "parallel");
    formData.set("approverRoleKeys", "finance-manager");
    formData.set("minApprovals", "1");
    formData.set("status", "active");
    formData.set("enabled", "true");

    const result = await updateSystemAdminApprovalRuleAction(undefined, formData);

    expect(result.ok).toBe(false);
    expect(mockUpsertApproval).not.toHaveBeenCalled();
  });

  it("rejects min approvals greater than approver roles", async () => {
    const formData = new FormData();
    formData.set("mode", "create");
    formData.set("approvalKey", "hr.salary.change");
    formData.set("name", "Salary change");
    formData.set("moduleKey", "hr");
    formData.set("action", "hr.documents.write");
    formData.set("targetType", "erp-record");
    formData.set("approvalMode", "parallel");
    formData.set("approverRoleKeys", "staff");
    formData.set("minApprovals", "2");
    formData.set("status", "active");
    formData.set("enabled", "true");

    const result = await updateSystemAdminApprovalRuleAction(undefined, formData);

    expect(result.ok).toBe(false);
    expect(mockUpsertApproval).not.toHaveBeenCalled();
  });

  it("toggles approval rule enabled state", async () => {
    const { listTenantApprovalSettings } = await import(
      "../../src/tenant-execution/data/system-admin.execution-settings.repository.server"
    );
    vi.mocked(listTenantApprovalSettings).mockResolvedValueOnce([
      {
        id: "approval_1",
        organizationId: "org_1",
        approvalKey: "finance.payment",
        label: "Payment release",
        enabled: true,
        approverRole: "finance-manager",
        escalationMinutes: null,
        configuration: {
          moduleKey: "finance",
          action: "finance.documents.write",
          targetType: "erp-record",
          approvalMode: "parallel",
          approverRoleKeys: ["finance-manager"],
          minApprovals: 1,
          status: "active",
        },
      },
    ]);

    const { setSystemAdminApprovalRuleEnabledAction } = await import(
      "../../src/approvals/actions/system-admin.approval-rules.actions.server"
    );

    const result = await setSystemAdminApprovalRuleEnabledAction({
      approvalKey: "finance.payment",
      enabled: false,
    });

    expect(result.ok).toBe(true);
    expect(mockUpsertApproval).toHaveBeenCalledWith(
      expect.objectContaining({
        approvalKey: "finance.payment",
        enabled: false,
      }),
    );
  });

  it("writes audit events when approval rules change", async () => {
    const formData = new FormData();
    formData.set("mode", "create");
    formData.set("approvalKey", "purchasing.po.approval");
    formData.set("name", "High value PO");
    formData.set("moduleKey", "purchasing");
    formData.set("action", "purchasing.purchase-order.create");
    formData.set("targetType", "erp-record");
    formData.set("approvalMode", "sequential");
    formData.set("approverRoleKeys", "finance-manager,owner");
    formData.set("minApprovals", "2");
    formData.set("escalationAfterHours", "24");
    formData.set("status", "active");
    formData.set("enabled", "true");

    const result = await updateSystemAdminApprovalRuleAction(undefined, formData);

    expect(result.ok).toBe(true);
    expect(mockUpsertApproval).toHaveBeenCalled();
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.approval_rule.create",
        targetType: "approval_rule",
        targetId: "purchasing.po.approval",
      }),
    );
  });

  it("maps disabled approval rules out of kernel resolution", async () => {
    const { mapTenantApprovalSettingToKernelRecord } = await import(
      "../../src/approvals/data/system-admin.approval-rules.mapper"
    );

    expect(
      mapTenantApprovalSettingToKernelRecord({
        id: "approval_disabled",
        organizationId: "org_1",
        approvalKey: "finance.payment",
        label: "Payment release",
        enabled: false,
        approverRole: "finance-manager",
        escalationMinutes: null,
        configuration: {
          moduleKey: "finance",
          action: "finance.documents.write",
          targetType: "erp-record",
          approvalMode: "parallel",
          approverRoleKeys: ["finance-manager"],
          minApprovals: 1,
          status: "disabled",
        },
      }),
    ).toBeNull();
  });

  it("evaluates readiness for active approval rules", async () => {
    const { evaluateApprovalRuleReadiness } = await import(
      "../../src/approvals/data/system-admin.approval-rules.readiness.server"
    );
    const { mapTenantApprovalSettingToRule } = await import(
      "../../src/approvals/data/system-admin.approval-rules.mapper"
    );

    const rule = mapTenantApprovalSettingToRule({
      id: "approval_ready",
      organizationId: "org_1",
      approvalKey: "dashboard.view",
      label: "Dashboard view",
      enabled: true,
      approverRole: "admin",
      escalationMinutes: null,
      configuration: {
        moduleKey: "dashboard",
        action: "dashboard.view",
        targetType: "erp-record",
        approvalMode: "parallel",
        approverRoleKeys: ["admin"],
        minApprovals: 1,
        status: "active",
      },
    });

    expect(evaluateApprovalRuleReadiness(rule)).toBe("ready");
  });

  it("validates escalation timing bounds", async () => {
    const { updateApprovalRuleInputSchema } = await import(
      "../../src/approvals/schemas/system-admin.approval-rule.schema"
    );

    expect(
      updateApprovalRuleInputSchema.safeParse({
        approvalRuleId: "finance.payment",
        name: "Payment",
        moduleKey: "finance",
        action: "finance.documents.write",
        targetType: "erp-record",
        approvalMode: "parallel",
        approverRoleKeys: "finance-manager",
        minApprovals: 1,
        escalationAfterHours: 0,
        status: "active",
        enabled: true,
      }).success,
    ).toBe(false);
  });
});
