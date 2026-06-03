import { beforeEach, describe, expect, it, vi } from "vitest";
import { ERP_CRON_HTTP_ROUTES } from "@/kitchen-sinks/erp-http.contract";

const cronHistory = vi.hoisted(() => ({
  createCronRunHistory: vi.fn(async () => "cron_run_retention"),
  finishCronRunHistory: vi.fn(async () => undefined),
}));

const retentionSweep = vi.hoisted(() => ({
  executeDocumentRetentionExpirySweepCommand: vi.fn(async () => ({
    mode: "all-orgs",
    organizationCount: 1,
    completedOrganizationCount: 1,
    expiredDocumentCount: 0,
  })),
}));

vi.mock("@afenda/db", () => ({
  createCronRunHistory: cronHistory.createCronRunHistory,
  finishCronRunHistory: cronHistory.finishCronRunHistory,
}));

vi.mock("@afenda/observability/server", () => ({
  getRequestId: vi.fn(() => "req_retention_cron"),
  logServerEvent: vi.fn(),
}));

vi.mock("@afenda/feature-system-admin/server", () => retentionSweep);

import { GET as getDocumentRetentionSweep } from "@/app/api/internal/v1/cron/document-retention-sweep/route";

describe("document retention sweep cron route", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = "cron-retention-secret";
    cronHistory.createCronRunHistory.mockClear();
    cronHistory.finishCronRunHistory.mockClear();
    retentionSweep.executeDocumentRetentionExpirySweepCommand.mockClear();
  });

  it("rejects unauthenticated retention sweeps", async () => {
    const response = await getDocumentRetentionSweep(
      new Request(
        `http://localhost${ERP_CRON_HTTP_ROUTES.documentRetentionSweep}`,
      ),
    );

    expect(response.status).toBe(401);
    expect(
      retentionSweep.executeDocumentRetentionExpirySweepCommand,
    ).not.toHaveBeenCalled();
  });

  it("dispatches retention sweep command when authorized", async () => {
    const response = await getDocumentRetentionSweep(
      new Request(
        `http://localhost${ERP_CRON_HTTP_ROUTES.documentRetentionSweep}`,
        {
          headers: { authorization: "Bearer cron-retention-secret" },
        },
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      job: "document-retention-sweep",
    });
    expect(cronHistory.createCronRunHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        jobName: "document-retention-sweep",
        route: ERP_CRON_HTTP_ROUTES.documentRetentionSweep,
      }),
    );
    expect(
      retentionSweep.executeDocumentRetentionExpirySweepCommand,
    ).toHaveBeenCalledWith({
      organizationId: null,
    });
  });
});
