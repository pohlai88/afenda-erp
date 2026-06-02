import { describe, expect, it, vi } from "vitest";
import { ERP_CRON_HTTP_ROUTES } from "@/contracts/erp-http.contract";
import { authorizeCronRequest, runCronJob } from "@/lib/cron";

const { createCronRunHistory, finishCronRunHistory } = vi.hoisted(() => ({
  createCronRunHistory: vi.fn(async () => "cron_run_1"),
  finishCronRunHistory: vi.fn(async () => undefined),
}));

vi.mock("@afenda/db", () => ({
  createCronRunHistory,
  finishCronRunHistory,
}));

vi.mock("@afenda/observability", () => ({
  getRequestId: vi.fn(() => "req_cron"),
  logServerEvent: vi.fn(),
}));

describe("cron authorization", () => {
  it("accepts requests with the configured bearer secret", () => {
    process.env.CRON_SECRET = "cron-test-secret";

    expect(
      authorizeCronRequest(
        new Request(`http://localhost${ERP_CRON_HTTP_ROUTES.reminders}`, {
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
      authorizeCronRequest(new Request(`http://localhost${ERP_CRON_HTTP_ROUTES.reminders}`)),
    ).toBe(false);
  });
});

describe("runCronJob", () => {
  it("returns 401 when cron authorization fails", async () => {
    process.env.CRON_SECRET = "cron-test-secret";
    createCronRunHistory.mockClear();

    const response = await runCronJob({
      request: new Request(`http://localhost${ERP_CRON_HTTP_ROUTES.reminders}`),
      jobName: "reminders",
      operation: "cron.reminders",
      execute: async () => ({ processed: 0 }),
    });

    expect(response.status).toBe(401);
    expect(createCronRunHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        jobName: "reminders",
        status: "rejected",
        errorMessage: "Unauthorized cron request.",
      }),
    );
  });

  it("returns success payload when job executes", async () => {
    process.env.CRON_SECRET = "cron-test-secret";
    createCronRunHistory.mockClear();
    finishCronRunHistory.mockClear();

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
    expect(createCronRunHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        jobName: "reminders",
        status: "started",
        route: ERP_CRON_HTTP_ROUTES.reminders,
      }),
    );
    expect(finishCronRunHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "cron_run_1",
        status: "success",
        result: { processed: 2 },
      }),
    );
  });

  it("persists failed cron run history", async () => {
    process.env.CRON_SECRET = "cron-test-secret";
    createCronRunHistory.mockClear();
    finishCronRunHistory.mockClear();

    const response = await runCronJob({
      request: new Request("http://localhost/api/cron/reminders", {
        headers: {
          authorization: "Bearer cron-test-secret",
        },
      }),
      jobName: "reminders",
      operation: "cron.reminders",
      execute: async () => {
        throw new Error("boom");
      },
    });

    expect(response.status).toBe(500);
    expect(finishCronRunHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "cron_run_1",
        status: "failed",
        errorMessage: "boom",
      }),
    );
  });
});
