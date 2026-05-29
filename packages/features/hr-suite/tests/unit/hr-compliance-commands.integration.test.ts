import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  archiveHrComplianceObligation,
  assignHrComplianceCorrectiveAction,
  createHrComplianceException,
  listHrComplianceExceptionsWindow,
  listHrComplianceObligationsWindow,
  listHrEmployeeLaborLawRequirementsWindow,
  resolveHrComplianceException,
  syncHrEmployeeLaborLawRequirements,
  updateHrComplianceCorrectiveActionProgress,
  updateHrEmployeeLaborLawRequirementStatus,
  upsertHrComplianceObligation,
  waiveHrComplianceException,
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

describe.skipIf(!integrationEnabled)("hr compliance commands integration", () => {
  const organizationId = process.env.HR_SEED_TEST_ORG_ID ?? "org_afenda_demo";
  const obligationCode = `INT-CMP-${Date.now()}`;

  it(
    "upserts obligation, archives it, and manages exceptions",
    async () => {
    const upserted = await upsertHrComplianceObligation({
      organizationId,
      code: obligationCode,
      title: "Integration test obligation",
      complianceArea: "integration",
      requirementKind: "test",
    });
    expect(upserted.obligationId).toBeTruthy();

    const obligations = await listHrComplianceObligationsWindow({
      organizationId,
      search: obligationCode,
      limit: 10,
    });
    expect(
      obligations.rows.some((row) => row.id === upserted.obligationId),
    ).toBe(true);

    const created = await createHrComplianceException({
      organizationId,
      title: "Integration test exception",
      complianceArea: "integration",
      itemType: "gap",
      severity: "medium",
    });
    expect(created.exceptionId).toBeTruthy();

    const createdWithCorrective = await createHrComplianceException({
      organizationId,
      title: "Integration exception with corrective at create",
      complianceArea: "integration",
      itemType: "gap",
      severity: "high",
      correctiveActionDescription: "Initial corrective plan",
      correctiveActionDueDate: new Date("2026-07-01T00:00:00.000Z"),
    });
    const withCorrectiveRows = await listHrComplianceExceptionsWindow({
      organizationId,
      openOnly: true,
      limit: 25,
    });
    const correctiveRow = withCorrectiveRows.rows.find(
      (row) => row.id === createdWithCorrective.exceptionId,
    );
    expect(correctiveRow?.status).toBe("in_progress");

    const open = await listHrComplianceExceptionsWindow({
      organizationId,
      openOnly: true,
      limit: 25,
    });
    expect(open.rows.some((row) => row.id === created.exceptionId)).toBe(true);

    const assigned = await assignHrComplianceCorrectiveAction({
      organizationId,
      exceptionId: created.exceptionId,
      correctiveActionDescription: "Complete training",
      correctiveActionDueDate: new Date("2026-06-01T00:00:00.000Z"),
    });
    expect(assigned.exceptionId).toBe(created.exceptionId);

    const progressed = await updateHrComplianceCorrectiveActionProgress({
      organizationId,
      exceptionId: created.exceptionId,
      progressNote: "Training scheduled",
    });
    expect(progressed.exceptionId).toBe(created.exceptionId);

    const resolved = await resolveHrComplianceException({
      organizationId,
      exceptionId: created.exceptionId,
      resolutionNote: "integration resolved",
    });
    expect(resolved.exceptionId).toBe(created.exceptionId);

    const waivedException = await createHrComplianceException({
      organizationId,
      title: "Integration waive exception",
      complianceArea: "integration",
      itemType: "gap",
      severity: "low",
    });
    const waived = await waiveHrComplianceException({
      organizationId,
      exceptionId: waivedException.exceptionId,
      waiverReason: "integration waiver",
      approvalReference: "APR-INT-1",
    });
    expect(waived.exceptionId).toBe(waivedException.exceptionId);

    const archived = await archiveHrComplianceObligation({
      organizationId,
      obligationId: upserted.obligationId,
    });
    expect(archived.obligationId).toBe(upserted.obligationId);
  },
    30_000,
  );

  it(
    "tracks labor law requirements applicable to employees",
    async () => {
    const laborCode = `INT-LL-${Date.now()}`;
    const upserted = await upsertHrComplianceObligation({
      organizationId,
      code: laborCode,
      title: "Maximum weekly hours register",
      complianceArea: "labor_law",
      requirementKind: "labor_law",
    });

    const synced = await syncHrEmployeeLaborLawRequirements({ organizationId });
    expect(synced.totalTracked).toBeGreaterThanOrEqual(synced.createdCount);

    const window = await listHrEmployeeLaborLawRequirementsWindow({
      organizationId,
      search: laborCode,
      limit: 10,
    });
    expect(window.rows.length).toBeGreaterThan(0);

    const requirementId = window.rows[0]?.id;
    expect(requirementId).toBeTruthy();

    const updated = await updateHrEmployeeLaborLawRequirementStatus({
      organizationId,
      requirementId: requirementId as string,
      status: "compliant",
      reviewNotes: "integration verified",
    });
    expect(updated.requirementId).toBe(requirementId);

    await archiveHrComplianceObligation({
      organizationId,
      obligationId: upserted.obligationId,
    });
  },
    30_000,
  );
});
