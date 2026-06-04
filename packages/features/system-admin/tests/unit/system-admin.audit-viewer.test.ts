import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireAuditRead = vi.fn();
const mockRequireAuditExport = vi.fn();
const mockRequireAuditReview = vi.fn();
const mockSearchAudit = vi.fn();
const mockWriteAudit = vi.fn();
const mockUpsertRetention = vi.fn();

vi.mock(
  "../../src/audit-viewer/policies/system-admin.audit-viewer.policy.server",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../src/features/audit-viewer/sys-audit-viewer.policy.server")
      >();
    return {
      ...actual,
      requireSystemAdminAuditRead: () => mockRequireAuditRead(),
      requireSystemAdminAuditExport: () => mockRequireAuditExport(),
      requireSystemAdminAuditReview: () => mockRequireAuditReview(),
    };
  },
);

vi.mock("@afenda/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/db")>();
  return {
    ...actual,
    searchTenantAuditLogs: (...args: unknown[]) => mockSearchAudit(...args),
    getRetentionPolicy: vi.fn(async () => null),
    listRetentionPolicies: vi.fn(async () => []),
    upsertRetentionPolicy: (...args: unknown[]) => mockUpsertRetention(...args),
  };
});

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: (...args: unknown[]) => mockWriteAudit(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("../../src/integrations/events/system-admin.webhook-dispatch.event", () => ({
  dispatchSystemAdminWebhook: vi.fn(),
}));

const guardContext = {
  context: {
    userId: "actor_1",
    actorType: "user" as const,
    organizationId: "org_1",
    organizationSlug: "acme",
    locale: "en",
    role: "admin" as const,
    capabilities: ["system-admin.audit.export"],
  },
  organization: {
    id: "org_1",
    slug: "acme",
    locale: "en",
    role: "admin" as const,
    capabilities: ["system-admin.audit.export"],
  },
  session: { id: "actor_1" },
};

const sampleAuditRow = {
  id: "audit_1",
  organizationId: "org_1",
  actorAuthUserId: "actor_1",
  actorType: "user",
  entityType: "organization",
  entityId: "org_1",
  targetType: "organization",
  targetId: "org_1",
  targetDisplayName: "Organization One",
  action: "system-admin.policy_rule.update",
  summary: "Policy updated",
  outcome: "success",
  surface: "audit-viewer",
  route: "/system-admin/audit",
  channel: "server_action",
  reason: "Compliance review",
  policyReference: "policy.ref",
  approvalId: "approval.ref",
  requestId: "request.ref",
  operationId: "operation.ref",
  metadata: { note: "visible" },
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const reviewGuardContext = {
  ...guardContext,
  context: {
    ...guardContext.context,
    capabilities: ["system-admin.audit.review"],
  },
  organization: {
    ...guardContext.organization,
    capabilities: ["system-admin.audit.review"],
  },
};

describe("system admin audit viewer", () => {
  let exportSystemAdminAuditLogsAction: typeof import("../../src/features/audit-viewer/sys-audit.actions.server").exportSystemAdminAuditLogsAction;
  let upsertSystemAdminRetentionPolicyAction: typeof import("../../src/features/audit-viewer/sys-audit.actions.server").upsertSystemAdminRetentionPolicyAction;

  beforeAll(async () => {
    ({
      exportSystemAdminAuditLogsAction,
      upsertSystemAdminRetentionPolicyAction,
    } = await import(
      "../../src/features/audit-viewer/sys-audit.actions.server"
    ));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuditRead.mockResolvedValue(guardContext);
    mockRequireAuditExport.mockResolvedValue(guardContext);
    mockRequireAuditReview.mockResolvedValue(reviewGuardContext);
    mockSearchAudit.mockResolvedValue({ rows: [], totalCount: 0 });
    mockUpsertRetention.mockResolvedValue(undefined);
  });

  it("requires audit.read to view the catalog", async () => {
    mockRequireAuditRead.mockRejectedValue(new Error("Forbidden"));

    const { requireSystemAdminAuditRead } = await import(
      "../../src/features/audit-viewer/sys-audit-viewer.policy.server"
    );

    await expect(requireSystemAdminAuditRead()).rejects.toThrow("Forbidden");
  });

  it("requires audit.export to export evidence", async () => {
    mockRequireAuditExport.mockRejectedValue(new Error("Forbidden"));

    const formData = new FormData();
    await expect(exportSystemAdminAuditLogsAction(formData)).rejects.toThrow(
      "Forbidden",
    );
    expect(mockWriteAudit).not.toHaveBeenCalled();
  });

  it("requires audit.review to update retention policies", async () => {
    mockRequireAuditReview.mockRejectedValue(new Error("Forbidden"));

    const formData = new FormData();
    formData.set("entityType", "organization");
    formData.set("retentionDays", "365");
    formData.set("legalHold", "false");

    await expect(
      upsertSystemAdminRetentionPolicyAction(undefined, formData),
    ).rejects.toThrow("Forbidden");
    expect(mockUpsertRetention).not.toHaveBeenCalled();
  });

  it("writes review audit events when updating retention", async () => {
    const formData = new FormData();
    formData.set("entityType", "organization");
    formData.set("retentionDays", "365");
    formData.set("legalHold", "false");

    const result = await upsertSystemAdminRetentionPolicyAction(
      undefined,
      formData,
    );

    expect(result.ok).toBe(true);
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.audit.review",
      }),
    );
  });

  it("writes audit events when exporting evidence", async () => {
    mockSearchAudit.mockResolvedValue({
      rows: [{ ...sampleAuditRow, metadata: { apiKey: "secret" } }],
      totalCount: 1,
    });

    const formData = new FormData();
    const result = await exportSystemAdminAuditLogsAction(formData);

    expect(result.ok).toBe(true);
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "system-admin.audit.export",
        targetType: "organization",
        metadata: expect.objectContaining({
          truncated: false,
          totalCount: 1,
        }),
      }),
    );
  });

  it("records export truncation in audit metadata", async () => {
    mockSearchAudit.mockResolvedValue({
      rows: [sampleAuditRow],
      totalCount: 10_000,
    });

    const formData = new FormData();
    const result = await exportSystemAdminAuditLogsAction(formData);

    expect(result.ok).toBe(true);
    if (result.ok && result.data) {
      expect(result.data.truncated).toBe(true);
      expect(result.data.totalCount).toBe(10_000);
    }
    expect(mockWriteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          truncated: true,
          totalCount: 10_000,
        }),
      }),
    );
  });

  it("skips list-view audit on paginated pages", async () => {
    const { shouldRecordSystemAdminAuditListView } = await import(
      "../../src/features/audit-viewer/sys-audit-view-event.server"
    );

    expect(shouldRecordSystemAdminAuditListView({ auditPage: 1, auditPageSize: 25 })).toBe(
      true,
    );
    expect(shouldRecordSystemAdminAuditListView({ auditPage: 2, auditPageSize: 25 })).toBe(
      false,
    );
  });

  it("redacts sensitive metadata keys", async () => {
    const { redactAuditMetadata } = await import(
      "../../src/features/audit-viewer/sys-audit-metadata.redact.shared"
    );

    const redacted = redactAuditMetadata({
      apiKey: "live_secret",
      note: "visible",
    }) as Record<string, unknown>;

    expect(redacted.apiKey).toBe("[redacted]");
    expect(redacted.note).toBe("visible");
  });

  it("orders evidence timeline chronologically", async () => {
    const { listSystemAdminAuditTargetTimeline } = await import(
      "../../src/features/audit-viewer/sys-audit.query.server"
    );

    mockSearchAudit.mockResolvedValue({
      rows: [
        {
          id: "a",
          organizationId: "org_1",
          actorAuthUserId: "actor_1",
          entityType: "erp-record",
          entityId: "rec_1",
          targetType: "erp-record",
          targetId: "rec_1",
          action: "finance.invoice.create",
          summary: "Earlier",
          metadata: {},
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        },
        {
          id: "b",
          organizationId: "org_1",
          actorAuthUserId: "actor_1",
          entityType: "erp-record",
          entityId: "rec_1",
          targetType: "erp-record",
          targetId: "rec_1",
          action: "finance.invoice.update",
          summary: "Later",
          metadata: {},
          createdAt: new Date("2026-01-02T00:00:00.000Z"),
          updatedAt: new Date("2026-01-02T00:00:00.000Z"),
        },
      ],
      totalCount: 2,
    });

    const timeline = await listSystemAdminAuditTargetTimeline({
      organizationId: "org_1",
      targetType: "erp-record",
      targetId: "rec_1",
    });

    expect(timeline[0]?.id).toBe("a");
    expect(timeline[1]?.id).toBe("b");
    expect(mockSearchAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ sortDirection: "asc" }),
      }),
    );
  });

  it("scopes audit search to the organization", async () => {
    const { searchSystemAdminAuditEvents } = await import(
      "../../src/features/audit-viewer/sys-audit.query.server"
    );

    await searchSystemAdminAuditEvents({
      organizationId: "org_isolated",
      params: { auditPage: 1, auditPageSize: 25 },
    });

    expect(mockSearchAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org_isolated",
        filters: expect.objectContaining({
          sortDirection: "desc",
        }),
      }),
    );
  });

  it("exports JSON when format is json", async () => {
    mockSearchAudit.mockResolvedValue({
      rows: [sampleAuditRow],
      totalCount: 1,
    });

    const formData = new FormData();
    formData.set("format", "json");
    const result = await exportSystemAdminAuditLogsAction(formData);

    expect(result.ok).toBe(true);
    if (result.ok && result.data) {
      expect(result.data.format).toBe("json");
      expect(result.data.fileExtension).toBe("json");
      expect(result.data.encoding).toBe("utf8");
      expect(JSON.parse(result.data.content).rows).toHaveLength(1);
    }
  });

  it("exports XLSX with base64 encoding", async () => {
    mockSearchAudit.mockResolvedValue({
      rows: [sampleAuditRow],
      totalCount: 1,
    });

    const formData = new FormData();
    formData.set("format", "xlsx");
    const result = await exportSystemAdminAuditLogsAction(formData);

    expect(result.ok).toBe(true);
    if (result.ok && result.data) {
      expect(result.data.format).toBe("xlsx");
      expect(result.data.encoding).toBe("base64");
      expect(result.data.fileExtension).toBe("xlsx");
      expect(Buffer.from(result.data.content, "base64").length).toBeGreaterThan(
        0,
      );
    }
  });

  it("exports PDF with base64 encoding", async () => {
    mockSearchAudit.mockResolvedValue({
      rows: [sampleAuditRow],
      totalCount: 1,
    });

    const formData = new FormData();
    formData.set("format", "pdf");
    const result = await exportSystemAdminAuditLogsAction(formData);

    expect(result.ok).toBe(true);
    if (result.ok && result.data) {
      expect(result.data.format).toBe("pdf");
      expect(result.data.encoding).toBe("base64");
      expect(result.data.fileExtension).toBe("pdf");
      expect(Buffer.from(result.data.content, "base64").subarray(0, 4)).toEqual(
        Buffer.from("%PDF"),
      );
    }
  });
});
