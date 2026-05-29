import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  approveHrLeaveRequest,
  cancelHrLeaveRequest,
  listHrLeaveRequestsWindow,
  rejectHrLeaveRequest,
  submitHrLeaveRequest,
} from "@afenda/db";
import { describe, expect, it } from "vitest";

const packageRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(packageRoot, "../../../../..");

config({ path: resolve(repoRoot, ".env.local") });
config({ path: resolve(repoRoot, ".env.config"), override: false });
config({ path: resolve(repoRoot, ".secret.config"), override: true });

const integrationEnabled = Boolean(
  process.env.DATABASE_URL ??
    process.env.NEON_PREVIEW_DATABASE_URL ??
    process.env.DATABASE_MIGRATION_URL,
);

describe.skipIf(!integrationEnabled)("hr leave commands integration", () => {
  const organizationId = process.env.HR_SEED_TEST_ORG_ID ?? "org_afenda_demo";

  it("submits, approves, rejects, and cancels leave requests", async () => {
    const directory = await import("@afenda/db").then((db) =>
      db.listHrEmployeeDirectoryWindow({ organizationId, limit: 1 }),
    );
    const employeeId = directory.rows[0]?.id;
    expect(employeeId).toBeDefined();

    const submitted = await submitHrLeaveRequest({
      organizationId,
      employeeId: employeeId!,
      leaveType: "annual",
      startAt: new Date("2026-08-01T00:00:00.000Z"),
      endAt: new Date("2026-08-03T23:59:59.999Z"),
      reason: "integration_test_leave",
    });
    expect(submitted.requestId).toBeTruthy();

    const pending = await listHrLeaveRequestsWindow({
      organizationId,
      pendingOnly: true,
      limit: 25,
    });
    expect(pending.rows.some((row) => row.id === submitted.requestId)).toBe(
      true,
    );

    const approved = await approveHrLeaveRequest({
      organizationId,
      requestId: submitted.requestId,
      decisionNote: "approved in test",
    });
    expect(approved.requestId).toBe(submitted.requestId);

    const submitForReject = await submitHrLeaveRequest({
      organizationId,
      employeeId: employeeId!,
      leaveType: "sick",
      startAt: new Date("2026-09-01T00:00:00.000Z"),
      endAt: new Date("2026-09-01T23:59:59.999Z"),
    });
    const rejected = await rejectHrLeaveRequest({
      organizationId,
      requestId: submitForReject.requestId,
    });
    expect(rejected.requestId).toBe(submitForReject.requestId);

    const submitForCancel = await submitHrLeaveRequest({
      organizationId,
      employeeId: employeeId!,
      leaveType: "unpaid",
      startAt: new Date("2026-10-01T00:00:00.000Z"),
      endAt: new Date("2026-10-02T23:59:59.999Z"),
    });
    const cancelled = await cancelHrLeaveRequest({
      organizationId,
      requestId: submitForCancel.requestId,
    });
    expect(cancelled.requestId).toBe(submitForCancel.requestId);
  });
});
