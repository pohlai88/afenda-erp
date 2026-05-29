import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  listHrAttendanceRecordsWindow,
  recordHrAttendancePunch,
  voidHrAttendancePunch,
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

describe.skipIf(!integrationEnabled)("hr attendance commands integration", () => {
  const organizationId = process.env.HR_SEED_TEST_ORG_ID ?? "org_afenda_demo";

  it("records punches idempotently and voids records", async () => {
    const directory = await import("@afenda/db").then((db) =>
      db.listHrEmployeeDirectoryWindow({ organizationId, limit: 1 }),
    );
    const employeeId = directory.rows[0]?.id;
    expect(employeeId).toBeDefined();

    const key = `integration-att-${Date.now()}`;
    const first = await recordHrAttendancePunch({
      organizationId,
      employeeId: employeeId!,
      punchType: "clock_in",
      idempotencyKey: key,
    });
    expect(first.created).toBe(true);

    const duplicate = await recordHrAttendancePunch({
      organizationId,
      employeeId: employeeId!,
      punchType: "clock_in",
      idempotencyKey: key,
    });
    expect(duplicate.created).toBe(false);
    expect(duplicate.recordId).toBe(first.recordId);

    const clockOut = await recordHrAttendancePunch({
      organizationId,
      employeeId: employeeId!,
      punchType: "clock_out",
    });
    expect(clockOut.created).toBe(true);

    const window = await listHrAttendanceRecordsWindow({
      organizationId,
      employeeId: employeeId!,
      limit: 10,
    });
    expect(window.rows.length).toBeGreaterThanOrEqual(2);

    const voided = await voidHrAttendancePunch({
      organizationId,
      recordId: clockOut.recordId,
    });
    expect(voided.recordId).toBe(clockOut.recordId);
  });
});
