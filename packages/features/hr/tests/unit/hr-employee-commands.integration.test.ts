import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  archiveHrEmployee,
  createHrEmployee,
  HrEmployeeCommandError,
  listHrEmployeeAssignments,
  listHrDepartments,
  updateHrEmployeeCore,
} from "@afenda/db";
import { listHrEmployeeDirectoryWindow } from "@afenda/db";

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

describe.skipIf(!integrationEnabled)("hr employee commands (integration)", () => {
  const organizationId = process.env.HR_SEED_TEST_ORG_ID ?? "org_afenda_demo";
  const employeeNumber = `E-TEST-${Date.now()}`;

  it("creates, updates placement, archives, and hides from active directory", async () => {
    const departments = await listHrDepartments({ organizationId, limit: 5 });
    expect(departments.length).toBeGreaterThan(0);

    const created = await createHrEmployee({
      organizationId,
      employeeNumber,
      legalName: "Test Worker",
      preferredName: "Tester",
      email: `${employeeNumber.toLowerCase()}@afenda.local`,
      placement: {
        currentDepartmentId: departments[0]?.id ?? null,
      },
      assignmentReason: "integration_test",
    });

    const assignments = await listHrEmployeeAssignments({
      organizationId,
      employeeId: created.employeeId,
      limit: 10,
    });
    expect(assignments.length).toBe(1);
    expect(assignments[0]?.assignmentStatus).toBe("active");

    const updated = await updateHrEmployeeCore({
      organizationId,
      employeeId: created.employeeId,
      legalName: "Test Worker Updated",
    });
    expect(updated.changedFields).toContain("legalName");

    await archiveHrEmployee({
      organizationId,
      employeeId: created.employeeId,
    });

    await expect(
      updateHrEmployeeCore({
        organizationId,
        employeeId: created.employeeId,
        legalName: "Should Fail",
      }),
    ).rejects.toBeInstanceOf(HrEmployeeCommandError);

    const directory = await listHrEmployeeDirectoryWindow({
      organizationId,
      limit: 50,
    });

    expect(
      directory.rows.some((row) => row.employeeNumber === employeeNumber),
    ).toBe(false);
  });
});
