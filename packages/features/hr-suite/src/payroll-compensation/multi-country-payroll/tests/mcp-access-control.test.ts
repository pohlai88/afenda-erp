import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@afenda/kernel/execution", () => ({
  requireExecutionContext: vi.fn(),
  requireExecutionPermission: vi.fn(),
  hasExecutionPermission: vi.fn(),
}));

import {
  hasExecutionPermission,
  requireExecutionContext,
  requireExecutionPermission,
} from "@afenda/kernel/execution";

import {
  canHrMcpEditRuleVersion,
  canHrMcpEditStatutoryRules,
  canHrMcpPublishRuleVersion,
  HR_MCP_ADMIN_CAPABILITY,
  HR_MCP_READ_CAPABILITY,
  HR_MCP_WRITE_CAPABILITY,
  requireHrMcpRead,
  requireHrMcpWrite,
} from "../policies/hr.payroll.mcp-access.policy.server";
import {
  assertHrMcpStatutoryRuleModificationAllowed,
  canHrMcpModifyStatutoryRules,
  HR_MCP_STATUTORY_ADMIN_CAPABILITY,
  requireHrMcpStatutoryAdmin,
} from "../policies/hr.payroll.mcp-statutory-admin.policy.server";

function mockContext(capabilities: string[]) {
  vi.mocked(requireExecutionContext).mockResolvedValue({
    userId: "user_1",
    organizationId: "org_1",
    organizationSlug: "demo",
    locale: "en",
    role: "member",
    capabilities,
  } as never);
  vi.mocked(hasExecutionPermission).mockImplementation((_ctx, capability) =>
    capabilities.includes(capability as string),
  );
}

describe("HRM-MCP-025 access control", () => {
  beforeEach(() => {
    vi.mocked(requireExecutionPermission).mockImplementation((() => undefined) as never);
    mockContext([HR_MCP_READ_CAPABILITY]);
  });

  it("requires hr.mcp.read for country payroll views", async () => {
    await requireHrMcpRead();
    expect(requireExecutionPermission).toHaveBeenCalledWith(
      expect.anything(),
      HR_MCP_READ_CAPABILITY,
    );
  });

  it("requires hr.mcp.write for country setup mutations", async () => {
    mockContext([HR_MCP_READ_CAPABILITY]);
    vi.mocked(requireExecutionPermission).mockImplementation(((
      _ctx: unknown,
      permission: string,
    ) => {
      if (permission === HR_MCP_WRITE_CAPABILITY) {
        throw new Error(`missing capability: ${permission}`);
      }
    }) as never);

    await expect(requireHrMcpWrite()).rejects.toThrow("missing capability");
  });

  it("requires hr.mcp.statutory.admin for statutory rule mutations", async () => {
    mockContext([HR_MCP_READ_CAPABILITY, HR_MCP_WRITE_CAPABILITY]);
    vi.mocked(requireExecutionPermission).mockImplementation(((
      _ctx: unknown,
      permission: string,
    ) => {
      if (permission === HR_MCP_STATUTORY_ADMIN_CAPABILITY) {
        throw new Error(`missing capability: ${permission}`);
      }
    }) as never);

    await expect(requireHrMcpStatutoryAdmin()).rejects.toThrow(
      "missing capability",
    );
  });

  it("maps administrator capabilities to rule workflow actions", async () => {
    mockContext([HR_MCP_READ_CAPABILITY, HR_MCP_WRITE_CAPABILITY]);
    const writer = await requireHrMcpRead();

    expect(canHrMcpPublishRuleVersion(writer)).toBe(false);
    expect(canHrMcpEditStatutoryRules(writer)).toBe(false);
    expect(canHrMcpEditRuleVersion(writer, "draft")).toBe(false);

    mockContext([HR_MCP_READ_CAPABILITY, HR_MCP_ADMIN_CAPABILITY]);
    const admin = await requireHrMcpRead();

    expect(canHrMcpPublishRuleVersion(admin)).toBe(true);
    expect(canHrMcpEditStatutoryRules(admin)).toBe(true);
    expect(canHrMcpEditRuleVersion(admin, "draft")).toBe(true);
    expect(canHrMcpEditRuleVersion(admin, "published")).toBe(false);
  });

  it("blocks statutory rule modification without hr.mcp.statutory.admin", async () => {
    mockContext([HR_MCP_READ_CAPABILITY, HR_MCP_WRITE_CAPABILITY]);
    vi.mocked(requireExecutionPermission).mockImplementation(((
      _ctx: unknown,
      permission: string,
    ) => {
      if (permission === HR_MCP_STATUTORY_ADMIN_CAPABILITY) {
        throw new Error(`missing capability: ${permission}`);
      }
    }) as never);

    await expect(requireHrMcpStatutoryAdmin()).rejects.toThrow(
      "missing capability",
    );
  });

  it("allows statutory rule modification with hr.mcp.statutory.admin", async () => {
    mockContext([HR_MCP_READ_CAPABILITY, HR_MCP_STATUTORY_ADMIN_CAPABILITY]);
    const statutoryAdmin = await requireHrMcpStatutoryAdmin();

    expect(canHrMcpModifyStatutoryRules(statutoryAdmin)).toBe(true);
    expect(() =>
      assertHrMcpStatutoryRuleModificationAllowed(statutoryAdmin),
    ).not.toThrow();
  });
});
