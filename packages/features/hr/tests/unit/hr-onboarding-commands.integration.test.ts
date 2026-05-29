import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  completeHrOnboarding,
  completeHrOnboardingChecklistItem,
  listHrOnboardingChecklistItems,
  listHrOnboardingCasesWindow,
  startHrOnboarding,
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

describe.skipIf(!integrationEnabled)("hr onboarding commands integration", () => {
  const organizationId = process.env.HR_SEED_TEST_ORG_ID ?? "org_afenda_demo";

  it("starts onboarding with checklist and completes case", async () => {
    const directory = await import("@afenda/db").then((db) =>
      db.listHrEmployeeDirectoryWindow({ organizationId, limit: 5 }),
    );
    const employee =
      directory.rows.find((row) => row.employmentStatus === "onboarding") ??
      directory.rows[0];
    expect(employee).toBeDefined();

    await updateHrEmployeeCore({
      organizationId,
      employeeId: employee!.id,
      employmentStatus: "onboarding",
    });

    const started = await startHrOnboarding({
      organizationId,
      employeeId: employee!.id,
      targetStatus: "active",
    });
    expect(started.caseId).toBeTruthy();

    const checklist = await listHrOnboardingChecklistItems({
      organizationId,
      caseId: started.caseId,
    });
    expect(checklist.length).toBeGreaterThan(0);

    for (const item of checklist) {
      await completeHrOnboardingChecklistItem({
        organizationId,
        itemId: item.id,
      });
    }

    const completed = await completeHrOnboarding({
      organizationId,
      caseId: started.caseId,
    });
    expect(completed.caseId).toBe(started.caseId);

    const cases = await listHrOnboardingCasesWindow({
      organizationId,
      limit: 10,
    });
    expect(
      cases.rows.find((row) => row.id === started.caseId)?.status,
    ).toBe("completed");
  });
});
