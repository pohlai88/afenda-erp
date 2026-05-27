import { describe, expect, it, vi } from "vitest";
import { authorizeCronRequest, runCronJob } from "@/lib/cron";

vi.mock("@afenda/observability", () => ({
  getRequestId: vi.fn(() => "req_cron"),
  logServerEvent: vi.fn(),
}));

describe("cron authorization", () => {
  it("accepts requests with the configured bearer secret", () => {
    process.env.CRON_SECRET = "cron-test-secret";

    expect(
      authorizeCronRequest(
        new Request("http://localhost/api/cron/reminders", {
          headers: {
            authorization: "Bearer cron-test-secret",
          },
        }),
      ),
    ).toBe(true);
  });

  it("rejects requests without authorization", () => {
    process.env.CRON_SECRET = "cron-test-secret";

    expect(
      authorizeCronRequest(new Request("http://localhost/api/cron/reminders")),
    ).toBe(false);
  });
});

describe("runCronJob", () => {
  it("returns 401 when cron authorization fails", async () => {
    process.env.CRON_SECRET = "cron-test-secret";

    const response = await runCronJob({
      request: new Request("http://localhost/api/cron/reminders"),
      jobName: "reminders",
      operation: "cron.reminders",
      execute: async () => ({ processed: 0 }),
    });

    expect(response.status).toBe(401);
  });

  it("returns success payload when job executes", async () => {
    process.env.CRON_SECRET = "cron-test-secret";

    const response = await runCronJob({
      request: new Request("http://localhost/api/cron/reminders", {
        headers: {
          authorization: "Bearer cron-test-secret",
        },
      }),
      jobName: "reminders",
      operation: "cron.reminders",
      execute: async () => ({ processed: 2 }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      job: "reminders",
      processed: 2,
    });
  });
});
