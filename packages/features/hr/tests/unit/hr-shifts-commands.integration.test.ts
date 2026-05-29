import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  cancelHrShiftAssignment,
  createHrShiftTemplate,
  listHrShiftAssignmentsWindow,
  publishHrShiftAssignment,
  scheduleHrShiftAssignment,
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

describe.skipIf(!integrationEnabled)("hr shifts commands integration", () => {
  const organizationId = process.env.HR_SEED_TEST_ORG_ID ?? "org_afenda_demo";

  it("creates templates, schedules, publishes, and cancels assignments", async () => {
    const directory = await import("@afenda/db").then((db) =>
      db.listHrEmployeeDirectoryWindow({ organizationId, limit: 1 }),
    );
    const employeeId = directory.rows[0]?.id;
    expect(employeeId).toBeDefined();

    const suffix = Date.now();
    const template = await createHrShiftTemplate({
      organizationId,
      code: `INT${suffix}`,
      name: "Integration day",
      startTime: "09:00",
      endTime: "17:00",
    });

    const scheduled = await scheduleHrShiftAssignment({
      organizationId,
      employeeId: employeeId!,
      templateId: template.templateId,
      shiftDate: new Date("2026-07-01T00:00:00.000Z"),
      notes: "integration_test_shift",
    });
    expect(scheduled.assignmentId).toBeTruthy();

    const pending = await listHrShiftAssignmentsWindow({
      organizationId,
      scheduledOnly: true,
      limit: 25,
    });
    expect(pending.rows.some((row) => row.id === scheduled.assignmentId)).toBe(
      true,
    );

    const published = await publishHrShiftAssignment({
      organizationId,
      assignmentId: scheduled.assignmentId,
    });
    expect(published.assignmentId).toBe(scheduled.assignmentId);

    const scheduleForCancel = await scheduleHrShiftAssignment({
      organizationId,
      employeeId: employeeId!,
      templateId: template.templateId,
      shiftDate: new Date("2026-07-02T00:00:00.000Z"),
    });
    const cancelled = await cancelHrShiftAssignment({
      organizationId,
      assignmentId: scheduleForCancel.assignmentId,
    });
    expect(cancelled.assignmentId).toBe(scheduleForCancel.assignmentId);
  });
});
