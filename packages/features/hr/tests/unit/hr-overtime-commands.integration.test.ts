import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  approveHrOvertimeRequest,
  cancelHrOvertimeRequest,
  listHrOvertimeRequestsWindow,
  rejectHrOvertimeRequest,
  submitHrOvertimeRequest,
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

describe.skipIf(!integrationEnabled)("hr overtime commands integration", () => {
  const organizationId = process.env.HR_SEED_TEST_ORG_ID ?? "org_afenda_demo";

  it("submits, approves, rejects, and cancels overtime requests", async () => {
    const directory = await import("@afenda/db").then((db) =>
      db.listHrEmployeeDirectoryWindow({ organizationId, limit: 1 }),
    );
    const employeeId = directory.rows[0]?.id;
    expect(employeeId).toBeDefined();

    const submitted = await submitHrOvertimeRequest({
      organizationId,
      employeeId: employeeId!,
      overtimeType: "regular",
      workDate: new Date("2026-06-15T00:00:00.000Z"),
      hours: 3.5,
      reason: "integration_test_overtime",
    });
    expect(submitted.requestId).toBeTruthy();

    const pending = await listHrOvertimeRequestsWindow({
      organizationId,
      pendingOnly: true,
      limit: 25,
    });
    expect(pending.rows.some((row) => row.id === submitted.requestId)).toBe(
      true,
    );

    const approved = await approveHrOvertimeRequest({
      organizationId,
      requestId: submitted.requestId,
      decisionNote: "approved in test",
    });
    expect(approved.requestId).toBe(submitted.requestId);

    const submitForReject = await submitHrOvertimeRequest({
      organizationId,
      employeeId: employeeId!,
      overtimeType: "weekend",
      workDate: new Date("2026-06-20T00:00:00.000Z"),
      hours: 2,
    });
    const rejected = await rejectHrOvertimeRequest({
      organizationId,
      requestId: submitForReject.requestId,
    });
    expect(rejected.requestId).toBe(submitForReject.requestId);

    const submitForCancel = await submitHrOvertimeRequest({
      organizationId,
      employeeId: employeeId!,
      overtimeType: "holiday",
      workDate: new Date("2026-06-25T00:00:00.000Z"),
      hours: 4,
    });
    const cancelled = await cancelHrOvertimeRequest({
      organizationId,
      requestId: submitForCancel.requestId,
    });
    expect(cancelled.requestId).toBe(submitForCancel.requestId);
  });
});
