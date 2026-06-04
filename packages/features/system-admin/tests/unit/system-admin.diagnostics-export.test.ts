import { describe, expect, it, vi } from "vitest";

const mockDiagnosticsModel = vi.fn();
const mockRequireDiagnosticsRead = vi.fn();
const mockWriteAudit = vi.fn();

vi.mock(
  "../../src/diagnostics/data/system-admin.diagnostics.page-model.server",
  () => ({
    getSystemAdminDiagnosticsPageModel: (...args: unknown[]) =>
      mockDiagnosticsModel(...args),
  }),
);

vi.mock(
  "../../src/overview/policies/system-admin.capability.policy.server",
  () => ({
    requireSystemAdminDiagnosticsRead: () => mockRequireDiagnosticsRead(),
  }),
);

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: (...args: unknown[]) => mockWriteAudit(...args),
}));

describe("system admin diagnostics export", () => {
  it("exports CSV and writes audit event", async () => {
    mockRequireDiagnosticsRead.mockResolvedValue({
      context: { userId: "actor_1", actorType: "user" },
      organization: { id: "org_1" },
    });
    mockDiagnosticsModel.mockResolvedValue({
      issues: [
        {
          id: "permission:missing",
          category: "permission_coverage",
          severity: "warning",
          title: "Missing permission",
          description: "Role lacks permission",
          targetType: "permission",
          targetId: "finance.read",
          recommendedAction: "Assign permission",
        },
      ],
    });

    const { exportSystemAdminDiagnosticsAction } = await import(
      "../../src/features/diagnostics/sys-diagnostics.actions.server"
    );

    const result = await exportSystemAdminDiagnosticsAction();

    expect(result.ok).toBe(true);
    if (result.ok && result.data) {
      expect(result.data.csv).toContain("permission:missing");
      expect(result.data.rowCount).toBe(1);
    }
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.diagnostics.export",
      }),
    );
  });
});
