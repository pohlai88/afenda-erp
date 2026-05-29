import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  changeHrEmploymentStatus,
  listHrLifecycleEventsForEmployee,
  listHrLifecycleOverviewWindow,
  recordHrEmployeeMovement,
  recordHrProbationOutcome,
  updateHrEmployeeCore,
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

describe.skipIf(!integrationEnabled)("hr lifecycle commands integration", () => {
  const organizationId = process.env.HR_SEED_TEST_ORG_ID ?? "org_afenda_demo";

  it("records probation outcome and employment status transitions with events", async () => {
    const overview = await listHrLifecycleOverviewWindow({
      organizationId,
      limit: 1,
    });
    const employee = overview.rows[0];
    expect(employee).toBeDefined();

    await updateHrEmployeeCore({
      organizationId,
      employeeId: employee!.id,
      employmentStatus: "probation",
    });

    const probationEnd = new Date("2026-12-31T00:00:00.000Z");
    const extended = await recordHrProbationOutcome({
      organizationId,
      employeeId: employee!.id,
      outcome: "extended",
      probationEndDate: probationEnd,
      reason: "integration_test_extension",
    });
    expect(extended.eventId).toBeTruthy();

    const confirmed = await recordHrProbationOutcome({
      organizationId,
      employeeId: employee!.id,
      outcome: "confirmed",
      reason: "integration_test_confirmation",
    });
    expect(confirmed.eventId).toBeTruthy();

    const statusChange = await changeHrEmploymentStatus({
      organizationId,
      employeeId: employee!.id,
      toStatus: "active",
      reason: "integration_test_active",
    });
    expect(statusChange.eventId).toBeTruthy();

    const events = await listHrLifecycleEventsForEmployee({
      organizationId,
      employeeId: employee!.id,
      limit: 10,
    });
    expect(events.some((event) => event.kind === "confirmation")).toBe(true);
    expect(events.some((event) => event.kind === "probation_extended")).toBe(
      true,
    );

    const afterOverview = await listHrLifecycleOverviewWindow({
      organizationId,
      limit: 25,
      search: employee!.employeeNumber,
    });
    const row = afterOverview.rows.find((item) => item.id === employee!.id);
    expect(row?.employmentStatus).toBe("active");
  });

  it("records employee movement with lifecycle event", async () => {
    const overview = await listHrLifecycleOverviewWindow({
      organizationId,
      limit: 1,
    });
    const employee = overview.rows[0];
    expect(employee).toBeDefined();

    const departments = await import("@afenda/db").then((db) =>
      db.listHrDepartments({ organizationId, limit: 1 }),
    );
    const department = departments[0];
    expect(department).toBeDefined();

    const moved = await recordHrEmployeeMovement({
      organizationId,
      employeeId: employee!.id,
      movementKind: "transfer",
      placement: { currentDepartmentId: department!.id },
      reason: "integration_test_movement",
    });
    expect(moved.eventId).toBeTruthy();

    const events = await listHrLifecycleEventsForEmployee({
      organizationId,
      employeeId: employee!.id,
      limit: 20,
    });
    expect(events.some((event) => event.kind === "transfer")).toBe(true);
  });
});
