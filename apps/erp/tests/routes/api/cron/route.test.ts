import { beforeEach, describe, expect, it, vi } from "vitest";
import { ERP_CRON_HTTP_ROUTES } from "@/contracts/erp-http.contract";

const cronHistory = vi.hoisted(() => ({
  createCronRunHistory: vi.fn(async () => "cron_run_route"),
  finishCronRunHistory: vi.fn(async () => undefined),
}));

vi.mock("@afenda/db", () => ({
  createCronRunHistory: cronHistory.createCronRunHistory,
  finishCronRunHistory: cronHistory.finishCronRunHistory,
}));

vi.mock("@afenda/observability", () => ({
  getRequestId: vi.fn(() => "req_cron_route"),
  logServerEvent: vi.fn(),
}));

vi.mock("@afenda/workflows", () => ({
  runReminderSweep: vi.fn(async () => ({ processedOrganizations: 1 })),
  runSyncSweep: vi.fn(async () => ({ syncedOrganizations: 1 })),
  runHousekeepingSweep: vi.fn(async () => ({ cleanedOrganizations: 1 })),
}));

vi.mock("@afenda/feature-lynx/server", () => ({
  runLynxOutcomeSweep: vi.fn(async () => ({
    organizationCount: 1,
    runCount: 1,
    monitorCount: 3,
    watchCount: 1,
    blockedCount: 0,
    workflowSessionsCreated: 1,
    workflowSessionsUpdated: 0,
  })),
}));

import { GET as getReminders } from "@/app/api/internal/v1/cron/reminders/route";
import { GET as getSyncs } from "@/app/api/internal/v1/cron/syncs/route";
import { GET as getHousekeeping } from "@/app/api/internal/v1/cron/housekeeping/route";
import { GET as getLynxOutcomes } from "@/app/api/internal/v1/cron/lynx-outcomes/route";

describe("cron routes", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = "cron-route-secret";
    cronHistory.createCronRunHistory.mockClear();
    cronHistory.finishCronRunHistory.mockClear();
  });

  it("rejects unauthenticated reminder sweeps", async () => {
    const response = await getReminders(
      new Request(`http://localhost${ERP_CRON_HTTP_ROUTES.reminders}`),
    );

    expect(response.status).toBe(401);
  });

  it("runs reminder sweeps when authorized", async () => {
    const response = await getReminders(
      new Request(`http://localhost${ERP_CRON_HTTP_ROUTES.reminders}`, {
        headers: { authorization: "Bearer cron-route-secret" },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      job: "reminders",
    });
    expect(cronHistory.createCronRunHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        jobName: "reminders",
        route: ERP_CRON_HTTP_ROUTES.reminders,
      }),
    );
  });

  it("runs sync sweeps when authorized", async () => {
    const response = await getSyncs(
      new Request(`http://localhost${ERP_CRON_HTTP_ROUTES.syncs}`, {
        headers: { authorization: "Bearer cron-route-secret" },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      job: "syncs",
    });
  });

  it("runs housekeeping sweeps when authorized", async () => {
    const response = await getHousekeeping(
      new Request(`http://localhost${ERP_CRON_HTTP_ROUTES.housekeeping}`, {
        headers: { authorization: "Bearer cron-route-secret" },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      job: "housekeeping",
    });
  });

  it("rejects unauthenticated lynx outcome sweeps", async () => {
    const response = await getLynxOutcomes(
      new Request(`http://localhost${ERP_CRON_HTTP_ROUTES.lynxOutcomes}`),
    );

    expect(response.status).toBe(401);
  });

  it("runs lynx outcome sweeps when authorized", async () => {
    const response = await getLynxOutcomes(
      new Request(`http://localhost${ERP_CRON_HTTP_ROUTES.lynxOutcomes}`, {
        headers: { authorization: "Bearer cron-route-secret" },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      job: "lynx-outcomes",
    });
  });
});
