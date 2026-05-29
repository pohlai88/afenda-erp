import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  cancelHrOffboarding,
  completeHrOffboarding,
  completeHrOffboardingClearanceItem,
  listHrLifecycleEventsForEmployee,
  listHrOffboardingCasesWindow,
  listHrOffboardingClearanceItems,
  startHrOffboarding,
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

describe.skipIf(!integrationEnabled)("hr offboarding commands integration", () => {
  const organizationId = process.env.HR_SEED_TEST_ORG_ID ?? "org_afenda_demo";

  it("starts, completes, and records lifecycle events for offboarding", async () => {
    const directory = await import("@afenda/db").then((db) =>
      db.listHrEmployeeDirectoryWindow({ organizationId, limit: 1 }),
    );
    const employeeId = directory.rows[0]?.id;
    expect(employeeId).toBeDefined();

    await updateHrEmployeeCore({
      organizationId,
      employeeId: employeeId!,
      employmentStatus: "active",
    });

    const started = await startHrOffboarding({
      organizationId,
      employeeId: employeeId!,
      reason: "integration_test_offboarding",
      lastWorkingDate: new Date("2026-12-15T00:00:00.000Z"),
    });
    expect(started.caseId).toBeTruthy();

    const inProgress = await listHrOffboardingCasesWindow({
      organizationId,
      status: "in_progress",
      limit: 25,
    });
    expect(inProgress.rows.some((row) => row.id === started.caseId)).toBe(true);

    const clearanceItems = await listHrOffboardingClearanceItems({
      organizationId,
      caseId: started.caseId,
    });
    expect(clearanceItems.length).toBeGreaterThan(0);
    for (const item of clearanceItems) {
      await completeHrOffboardingClearanceItem({
        organizationId,
        itemId: item.id,
      });
    }

    const completed = await completeHrOffboarding({
      organizationId,
      caseId: started.caseId,
    });
    expect(completed.caseId).toBe(started.caseId);

    const events = await listHrLifecycleEventsForEmployee({
      organizationId,
      employeeId: employeeId!,
      limit: 10,
    });
    expect(events.some((event) => event.kind === "offboarding_start")).toBe(true);
    expect(events.some((event) => event.kind === "offboarding_complete")).toBe(
      true,
    );
  });

  it("cancels an in-progress offboarding case and restores prior status", async () => {
    const directory = await import("@afenda/db").then((db) =>
      db.listHrEmployeeDirectoryWindow({ organizationId, limit: 5 }),
    );
    const employee = directory.rows.find((row) => row.employmentStatus === "active");
    expect(employee).toBeDefined();

    const started = await startHrOffboarding({
      organizationId,
      employeeId: employee!.id,
      reason: "integration_test_cancel",
    });

    const cancelled = await cancelHrOffboarding({
      organizationId,
      caseId: started.caseId,
      reason: "withdrawn",
    });
    expect(cancelled.caseId).toBe(started.caseId);

    const after = await import("@afenda/db").then((db) =>
      db.listHrEmployeeDirectoryWindow({
        organizationId,
        limit: 5,
        search: employee!.employeeNumber,
      }),
    );
    const row = after.rows.find((item) => item.id === employee!.id);
    expect(row?.employmentStatus).toBe("active");
  });
});
