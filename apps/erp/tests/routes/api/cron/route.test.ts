import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { GET as getReminders } from "@/app/api/cron/reminders/route";
import { GET as getSyncs } from "@/app/api/cron/syncs/route";
import { GET as getHousekeeping } from "@/app/api/cron/housekeeping/route";
import { GET as getLynxOutcomes } from "@/app/api/cron/lynx-outcomes/route";

describe("cron routes", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = "cron-route-secret";
    cronHistory.createCronRunHistory.mockClear();
    cronHistory.finishCronRunHistory.mockClear();
  });

  it("rejects unauthenticated reminder sweeps", async () => {
    const response = await getReminders(
      new Request("http://localhost/api/cron/reminders"),
    );

    expect(response.status).toBe(401);
  });

  it("runs reminder sweeps with bearer auth", async () => {
    const response = await getReminders(
      new Request("http://localhost/api/cron/reminders", {
        headers: {
          authorization: "Bearer cron-route-secret",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      job: "reminders",
    });
    expect(cronHistory.finishCronRunHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "cron_run_route",
        status: "success",
      }),
    );
  });

  it("runs sync sweeps with bearer auth", async () => {
    const response = await getSyncs(
      new Request("http://localhost/api/cron/syncs", {
        headers: {
          authorization: "Bearer cron-route-secret",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      job: "syncs",
    });
  });

  it("runs housekeeping sweeps with bearer auth", async () => {
    const response = await getHousekeeping(
      new Request("http://localhost/api/cron/housekeeping", {
        headers: {
          authorization: "Bearer cron-route-secret",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      job: "housekeeping",
    });
  });

  it("rejects unauthenticated Lynx outcome sweeps", async () => {
    const response = await getLynxOutcomes(
      new Request("http://localhost/api/cron/lynx-outcomes"),
    );

    expect(response.status).toBe(401);
  });

  it("runs Lynx outcome sweeps with bearer auth", async () => {
    const response = await getLynxOutcomes(
      new Request("http://localhost/api/cron/lynx-outcomes", {
        headers: {
          authorization: "Bearer cron-route-secret",
        },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      job: "lynx-outcomes",
      monitorCount: 3,
      workflowSessionsCreated: 1,
    });
  });
});
