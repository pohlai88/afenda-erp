import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  archiveHrComplianceObligation,
  assignHrComplianceCorrectiveAction,
  createHrComplianceException,
  listHrComplianceAlertsWindow,
  listHrComplianceExceptionsWindow,
  listHrComplianceFilingsWindow,
  listHrComplianceRegulatoryCalendarWindow,
  listHrComplianceObligationsWindow,
  listHrEmployeeLaborLawRequirementsWindow,
  listHrEmployeePolicyAcknowledgementsWindow,
  listHrEmployeeSafetyTrainingRequirementsWindow,
  listHrEmployeeWorkplaceSafetyRequirementsWindow,
  listHrWorkAuthorizationDocumentsWindow,
  listHrWorkEligibilityWindow,
  resolveHrComplianceException,
  ensureHrWorkAuthorizationDocuments,
  ensureHrWorkEligibilityTracking,
  syncHrComplianceFilings,
  syncHrComplianceExceptions,
  syncHrEmployeeLaborLawRequirements,
  syncHrEmployeePolicyAcknowledgements,
  syncHrEmployeeSafetyTrainingRequirements,
  syncHrEmployeeWorkplaceSafetyRequirements,
  updateHrComplianceCorrectiveActionProgress,
  updateHrComplianceFiling,
  updateHrEmployeeLaborLawRequirementStatus,
  updateHrEmployeePolicyAcknowledgementStatus,
  updateHrEmployeeSafetyTrainingRequirementStatus,
  updateHrEmployeeWorkplaceSafetyRequirementStatus,
  updateHrWorkAuthorizationDocument,
  updateHrWorkEligibilityStatus,
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

    await ensureHrWorkAuthorizationDocuments({ organizationId });
    const exceptionSync = await syncHrComplianceExceptions({ organizationId });
    expect(exceptionSync.totalOpen).toBeGreaterThanOrEqual(0);
    expect(exceptionSync.reopenedCount).toBeGreaterThanOrEqual(0);
    expect(
      exceptionSync.createdCount +
        exceptionSync.resolvedCount +
        exceptionSync.reopenedCount,
    ).toBeGreaterThanOrEqual(0);
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

  it(
    "tracks mandatory HR policy acknowledgments by employee and policy version",
    async () => {
      const policyCode = `INT-PA-${Date.now()}`;
      const upserted = await upsertHrComplianceObligation({
        organizationId,
        code: policyCode,
        title: "Code of conduct",
        complianceArea: "acknowledgement",
        requirementKind: "policy_acknowledgement",
        dueDate: new Date("2020-01-01T00:00:00.000Z"),
      });

      const synced = await syncHrEmployeePolicyAcknowledgements({ organizationId });
      expect(synced.totalTracked).toBeGreaterThanOrEqual(synced.createdCount);

      const window = await listHrEmployeePolicyAcknowledgementsWindow({
        organizationId,
        search: policyCode,
        limit: 10,
      });
      expect(window.rows.length).toBeGreaterThan(0);
      expect(window.rows[0]?.obligationCode).toBe(policyCode);

      const overdueWindow = await listHrEmployeePolicyAcknowledgementsWindow({
        organizationId,
        search: "overdue",
        limit: 50,
      });
      expect(
        overdueWindow.rows.some((row) => row.obligationCode === policyCode),
      ).toBe(true);

      const requirementId = window.rows[0]?.id;
      expect(requirementId).toBeTruthy();

      const updated = await updateHrEmployeePolicyAcknowledgementStatus({
        organizationId,
        requirementId: requirementId as string,
        status: "overdue",
        reviewNotes: "acknowledged in integration test",
      });
      expect(updated.requirementId).toBe(requirementId);

      const storedWindow = await listHrEmployeePolicyAcknowledgementsWindow({
        organizationId,
        search: policyCode,
        limit: 10,
      });
      expect(storedWindow.rows[0]?.status).toBe("pending");

      await updateHrEmployeePolicyAcknowledgementStatus({
        organizationId,
        requirementId: requirementId as string,
        status: "compliant",
        reviewNotes: "acknowledged in integration test",
      });

      await archiveHrComplianceObligation({
        organizationId,
        obligationId: upserted.obligationId,
      });
    },
    30_000,
  );

  it(
    "tracks mandatory filing requirements and filing deadlines",
    async () => {
      const filingCode = `INT-FIL-${Date.now()}`;
      const filingDeadline = new Date("2026-12-31T00:00:00.000Z");
      const upserted = await upsertHrComplianceObligation({
        organizationId,
        code: filingCode,
        title: "EPF monthly declaration",
        complianceArea: "filing",
        requirementKind: "filing",
        dueDate: filingDeadline,
      });

      const synced = await syncHrComplianceFilings({ organizationId });
      expect(synced.totalTracked).toBeGreaterThanOrEqual(synced.createdCount);

      const window = await listHrComplianceFilingsWindow({
        organizationId,
        search: filingCode,
        limit: 10,
      });
      expect(window.rows.length).toBeGreaterThan(0);
      expect(window.rows[0]?.obligationCode).toBe(filingCode);
      expect(window.rows[0]?.filingDeadline?.toISOString()).toBe(
        filingDeadline.toISOString(),
      );

      const filingId = window.rows[0]?.id;
      expect(filingId).toBeTruthy();

      const updated = await updateHrComplianceFiling({
        organizationId,
        filingId: filingId as string,
        status: "submitted",
        reviewNotes: "submitted in integration test",
      });
      expect(updated.filingId).toBe(filingId);

      const afterSubmit = await listHrComplianceFilingsWindow({
        organizationId,
        search: filingCode,
        limit: 10,
      });
      expect(afterSubmit.rows[0]?.status).toBe("submitted");
      expect(afterSubmit.rows[0]?.submittedAt).toBeTruthy();

      await archiveHrComplianceObligation({
        organizationId,
        obligationId: upserted.obligationId,
      });

      const resynced = await syncHrComplianceFilings({ organizationId });
      expect(resynced.removedCount).toBeGreaterThanOrEqual(1);
    },
    30_000,
  );

  it(
    "aggregates filing deadlines into the regulatory calendar window",
    async () => {
      const filingCode = `INT-CAL-${Date.now()}`;
      const filingDeadline = new Date("2027-03-15T00:00:00.000Z");
      const upserted = await upsertHrComplianceObligation({
        organizationId,
        code: filingCode,
        title: "SOCSO monthly declaration",
        complianceArea: "filing",
        requirementKind: "filing",
        dueDate: filingDeadline,
      });

      await syncHrComplianceFilings({ organizationId });

      const window = await listHrComplianceRegulatoryCalendarWindow({
        organizationId,
        search: filingCode,
        limit: 10,
      });

      expect(window.mergeTruncated).toBe(false);
      expect(window.rows.length).toBeGreaterThan(0);
      expect(window.rows[0]?.entryKind).toBe("filing");
      expect(window.rows[0]?.title).toContain(filingCode);
      expect(window.rows[0]?.deadlineAt.toISOString()).toBe(
        filingDeadline.toISOString(),
      );

      await archiveHrComplianceObligation({
        organizationId,
        obligationId: upserted.obligationId,
      });
    },
    30_000,
  );

  it(
    "derives overdue filings and corrective actions into the compliance alerts window",
    async () => {
      const filingCode = `INT-ALR-${Date.now()}`;
      const pastDeadline = new Date("2020-06-01T00:00:00.000Z");
      const upserted = await upsertHrComplianceObligation({
        organizationId,
        code: filingCode,
        title: "Overdue statutory filing",
        complianceArea: "filing",
        requirementKind: "filing",
        dueDate: pastDeadline,
      });

      await syncHrComplianceFilings({ organizationId });

      const filingAlerts = await listHrComplianceAlertsWindow({
        organizationId,
        search: filingCode,
        limit: 10,
      });

      expect(filingAlerts.mergeTruncated).toBe(false);
      expect(filingAlerts.rows.length).toBeGreaterThan(0);
      const filingAlert = filingAlerts.rows.find((row) =>
        row.title.includes(filingCode),
      );
      expect(filingAlert?.alertKind).toBe("deadline");
      expect(filingAlert?.severity).toBe("critical");
      expect(filingAlert?.sourceKind).toBe("filing");

      const exceptionTitle = `INT-ALR-CA-${Date.now()}`;
      const created = await createHrComplianceException({
        organizationId,
        title: exceptionTitle,
        complianceArea: "integration",
        itemType: "gap",
        severity: "high",
        correctiveActionDescription: "Resolve integration gap",
        correctiveActionDueDate: new Date("2020-01-01T00:00:00.000Z"),
      });

      const correctiveAlerts = await listHrComplianceAlertsWindow({
        organizationId,
        search: exceptionTitle,
        limit: 10,
      });
      const correctiveAlert = correctiveAlerts.rows.find((row) =>
        row.title.includes(exceptionTitle),
      );
      expect(correctiveAlert?.alertKind).toBe("overdue_action");
      expect(correctiveAlert?.severity).toBe("critical");
      expect(correctiveAlert?.sourceKind).toBe("corrective_action");

      await waiveHrComplianceException({
        organizationId,
        exceptionId: created.exceptionId,
        waiverReason: "integration cleanup",
        approvalReference: "APR-INT-ALR",
      });

      await archiveHrComplianceObligation({
        organizationId,
        obligationId: upserted.obligationId,
      });
    },
    30_000,
  );

  it(
    "tracks safety training requirements applicable to employees",
    async () => {
      const trainingCode = `INT-TRN-${Date.now()}`;
      const upserted = await upsertHrComplianceObligation({
        organizationId,
        code: trainingCode,
        title: "Mandatory fire safety certification",
        complianceArea: "safety",
        requirementKind: "training",
      });

      const synced = await syncHrEmployeeSafetyTrainingRequirements({
        organizationId,
      });
      expect(synced.totalTracked).toBeGreaterThanOrEqual(synced.createdCount);

      const window = await listHrEmployeeSafetyTrainingRequirementsWindow({
        organizationId,
        search: trainingCode,
        limit: 10,
      });
      expect(window.rows.length).toBeGreaterThan(0);

      const requirementId = window.rows[0]?.id;
      expect(requirementId).toBeTruthy();

      const certificationExpiresAt = new Date("2027-06-01T00:00:00.000Z");
      const updated = await updateHrEmployeeSafetyTrainingRequirementStatus({
        organizationId,
        requirementId: requirementId as string,
        status: "compliant",
        reviewNotes: "integration verified",
        certificationExpiresAt,
      });
      expect(updated.requirementId).toBe(requirementId);

      const resynced = await syncHrEmployeeSafetyTrainingRequirements({
        organizationId,
      });
      expect(resynced.dueDateUpdatedCount).toBe(0);

      const afterSync = await listHrEmployeeSafetyTrainingRequirementsWindow({
        organizationId,
        search: trainingCode,
        limit: 10,
      });
      const syncedRow = afterSync.rows.find((row) => row.id === requirementId);
      expect(syncedRow?.status).toBe("compliant");
      expect(syncedRow?.dueDate?.toISOString()).toBe(
        certificationExpiresAt.toISOString(),
      );

      await archiveHrComplianceObligation({
        organizationId,
        obligationId: upserted.obligationId,
      });
    },
    30_000,
  );

  it(
    "tracks workplace safety requirements applicable to employees",
    async () => {
      const safetyCode = `INT-SAF-${Date.now()}`;
      const upserted = await upsertHrComplianceObligation({
        organizationId,
        code: safetyCode,
        title: "Annual safety induction",
        complianceArea: "safety",
        requirementKind: "safety",
      });

      const synced = await syncHrEmployeeWorkplaceSafetyRequirements({
        organizationId,
      });
      expect(synced.totalTracked).toBeGreaterThanOrEqual(synced.createdCount);

      const window = await listHrEmployeeWorkplaceSafetyRequirementsWindow({
        organizationId,
        search: safetyCode,
        limit: 10,
      });
      expect(window.rows.length).toBeGreaterThan(0);

      const requirementId = window.rows[0]?.id;
      expect(requirementId).toBeTruthy();

      const certificationExpiresAt = new Date("2027-12-01T00:00:00.000Z");
      const updated = await updateHrEmployeeWorkplaceSafetyRequirementStatus({
        organizationId,
        requirementId: requirementId as string,
        status: "compliant",
        reviewNotes: "integration verified",
        certificationExpiresAt,
      });
      expect(updated.requirementId).toBe(requirementId);

      const afterUpdate = await listHrEmployeeWorkplaceSafetyRequirementsWindow({
        organizationId,
        search: safetyCode,
        limit: 10,
      });
      const updatedRow = afterUpdate.rows.find((row) => row.id === requirementId);
      expect(updatedRow?.status).toBe("compliant");
      expect(updatedRow?.dueDate?.toISOString()).toBe(
        certificationExpiresAt.toISOString(),
      );

      const resynced = await syncHrEmployeeWorkplaceSafetyRequirements({
        organizationId,
      });
      expect(resynced.dueDateUpdatedCount).toBe(0);

      const afterResync = await listHrEmployeeWorkplaceSafetyRequirementsWindow({
        organizationId,
        search: safetyCode,
        limit: 10,
      });
      const resyncedRow = afterResync.rows.find((row) => row.id === requirementId);
      expect(resyncedRow?.dueDate?.toISOString()).toBe(
        certificationExpiresAt.toISOString(),
      );

      await archiveHrComplianceObligation({
        organizationId,
        obligationId: upserted.obligationId,
      });
    },
    30_000,
  );

  it(
    "tracks work eligibility status for active employees",
    async () => {
      const ensured = await ensureHrWorkEligibilityTracking({ organizationId });
      expect(ensured.totalTracked).toBeGreaterThanOrEqual(ensured.createdCount);

      const window = await listHrWorkEligibilityWindow({
        organizationId,
        limit: 10,
      });
      expect(window.rows.length).toBeGreaterThan(0);

      const workEligibilityId = window.rows[0]?.id;
      expect(workEligibilityId).toBeTruthy();

      const updated = await updateHrWorkEligibilityStatus({
        organizationId,
        workEligibilityId: workEligibilityId as string,
        status: "eligible",
        expiresAt: new Date("2027-01-01T00:00:00.000Z"),
        reviewNotes: "integration verified",
      });
      expect(updated.workEligibilityId).toBe(workEligibilityId);
    },
    30_000,
  );

  it(
    "tracks work authorization document status for active employees",
    async () => {
      const ensured = await ensureHrWorkAuthorizationDocuments({ organizationId });
      expect(ensured.totalTracked).toBeGreaterThanOrEqual(ensured.createdCount);
      expect(ensured.totalTracked % 4).toBe(0);

      const window = await listHrWorkAuthorizationDocumentsWindow({
        organizationId,
        limit: 10,
      });
      expect(window.rows.length).toBeGreaterThan(0);
      expect(window.rows.some((row) => row.status === "missing")).toBe(true);

      const workAuthDocumentId = window.rows[0]?.id;
      expect(workAuthDocumentId).toBeTruthy();

      const updated = await updateHrWorkAuthorizationDocument({
        organizationId,
        workAuthDocumentId: workAuthDocumentId as string,
        status: "verified",
        documentNumber: "WP-12345",
        issuedAt: new Date("2024-06-01T00:00:00.000Z"),
        expiresAt: new Date("2027-06-01T00:00:00.000Z"),
        reviewNotes: "integration verified",
      });
      expect(updated.workAuthDocumentId).toBe(workAuthDocumentId);

      const readWorkAuthRow = async (workAuthDocumentId: string) => {
        const page = await listHrWorkAuthorizationDocumentsWindow({
          organizationId,
          search: "WP-12345",
          limit: 25,
        });
        return page.rows.find((entry) => entry.id === workAuthDocumentId);
      };

      const afterFirstUpdate = await readWorkAuthRow(workAuthDocumentId as string);
      const firstVerifiedAt = afterFirstUpdate?.verifiedAt;
      expect(firstVerifiedAt).toBeTruthy();

      const renewed = await updateHrWorkAuthorizationDocument({
        organizationId,
        workAuthDocumentId: workAuthDocumentId as string,
        status: "verified",
        documentNumber: "WP-12345",
        issuedAt: new Date("2024-06-01T00:00:00.000Z"),
        expiresAt: new Date("2028-06-01T00:00:00.000Z"),
        reviewNotes: "renewed expiry",
      });
      expect(renewed.workAuthDocumentId).toBe(workAuthDocumentId);

      const row = await readWorkAuthRow(workAuthDocumentId as string);
      expect(row?.verifiedAt).toEqual(firstVerifiedAt);
      expect(row?.expiresAt?.toISOString()).toBe("2028-06-01T00:00:00.000Z");

      const reflagged = await updateHrWorkAuthorizationDocument({
        organizationId,
        workAuthDocumentId: workAuthDocumentId as string,
        status: "verified",
        documentNumber: "",
        reviewNotes: "cleared evidence",
      });
      expect(reflagged.workAuthDocumentId).toBe(workAuthDocumentId);
      expect(reflagged.status).toBe("missing");

      const afterReflag = await listHrWorkAuthorizationDocumentsWindow({
        organizationId,
        search: "missing",
        limit: 100,
      });
      const missingRow = afterReflag.rows.find((entry) => entry.id === workAuthDocumentId);
      expect(missingRow?.status).toBe("missing");

      expect(
        missingRow,
      ).toBeTruthy();
    },
    30_000,
  );
});
