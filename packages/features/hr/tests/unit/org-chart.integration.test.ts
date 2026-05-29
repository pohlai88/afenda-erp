import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadHrOrgChartModel } from "../../src/workforce/org-chart/data/hr-org-chart.query.server";
import { listHrEmployeeDirectory } from "../../src/workforce/employees/data/hr-employees.query.server";

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

const SEEDED_EMPLOYEE_NUMBERS = ["E-001", "E-002", "E-003"] as const;

describe.skipIf(!integrationEnabled)("hr workforce (integration)", () => {
  const organizationId = process.env.HR_SEED_TEST_ORG_ID ?? "org_afenda_demo";

  it("returns employee directory including seeded workforce baseline", async () => {
    const window = await listHrEmployeeDirectory({
      organizationId,
      limit: 25,
    });

    expect(window.pageSize).toBe(25);
    expect(window.totalCount).toBeGreaterThanOrEqual(SEEDED_EMPLOYEE_NUMBERS.length);

    const numbers = window.rows.map((row) => row.employeeNumber);
    for (const seededNumber of SEEDED_EMPLOYEE_NUMBERS) {
      expect(numbers).toContain(seededNumber);
    }
  });

  it("loads reporting lines and department tree for seeded org", async () => {
    const model = await loadHrOrgChartModel({ organizationId, limit: 100 });

    expect(model.reportingLines.length).toBeGreaterThanOrEqual(
      SEEDED_EMPLOYEE_NUMBERS.length,
    );

    const seededLines = model.reportingLines.filter((line) =>
      SEEDED_EMPLOYEE_NUMBERS.includes(
        line.employeeNumber as (typeof SEEDED_EMPLOYEE_NUMBERS)[number],
      ),
    );
    expect(seededLines).toHaveLength(SEEDED_EMPLOYEE_NUMBERS.length);
    expect(
      seededLines.filter((line) => line.managerEmployeeId !== null),
    ).toHaveLength(2);

    expect(model.departmentTree).toHaveLength(2);
    expect(model.departmentTree.map((row) => row.code).sort()).toEqual([
      "OPS",
      "PEOPLE",
    ]);
  });
});
