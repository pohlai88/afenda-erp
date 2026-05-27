import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@afenda/workflows", () => ({
  runReminderSweep: vi.fn(async () => ({ processedOrganizations: 1 })),
  runSyncSweep: vi.fn(async () => ({ syncedOrganizations: 1 })),
  runHousekeepingSweep: vi.fn(async () => ({ cleanedOrganizations: 1 })),
}));

import { GET as getReminders } from "@/app/api/cron/reminders/route";
import { GET as getSyncs } from "@/app/api/cron/syncs/route";
import { GET as getHousekeeping } from "@/app/api/cron/housekeeping/route";

describe("cron routes", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = "cron-route-secret";
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
});
