import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  archiveHrComplianceObligation,
  archiveHrEmployeeDocument,
  assignHrComplianceCorrectiveAction,
  createHrComplianceException,
  listHrComplianceAlertsWindow,
  listHrComplianceExceptionsWindow,
  listHrComplianceEvidenceLinksWindow,
  listHrComplianceFilingsWindow,
  listHrComplianceRegulatoryCalendarWindow,
  listHrComplianceObligationsWindow,
  listHrEmployeeDirectoryWindow,
  listHrEmployeeLaborLawRequirementsWindow,
  listHrEmployeePolicyAcknowledgementsWindow,
  listHrEmployeeSafetyTrainingRequirementsWindow,
  listHrEmployeeWorkplaceSafetyRequirementsWindow,
  listHrWorkAuthorizationDocumentsWindow,
  listHrWorkEligibilityWindow,
  resolveHrComplianceException,
  ensureHrWorkAuthorizationDocuments,
  ensureHrWorkEligibilityTracking,
  linkHrComplianceEvidence,
  buildComplianceExceptionSourceReferenceId,
  HR_COMPLIANCE_EXCEPTION_AUTO_RESOLVED_NOTE,
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
  registerHrEmployeeDocument,
  unlinkHrComplianceEvidence,
  updateHrComplianceEvidenceSubmissionState,
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

  async function loadIntegrationOwnerEmployeeId() {
    const directory = await listHrEmployeeDirectoryWindow({
      organizationId,
      limit: 25,
    });
    const ownerEmployeeId = directory.rows.find(
      (row) => row.employmentStatus === "active",
    )?.id;
    expect(ownerEmployeeId).toBeTruthy();
    return ownerEmployeeId as string;
  }

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

    const ownerEmployeeId = await loadIntegrationOwnerEmployeeId();

    await expect(
      createHrComplianceException({
        organizationId,
        title: "Incomplete corrective pair",
        complianceArea: "integration",
        itemType: "gap",
        correctiveActionOwnerEmployeeId: ownerEmployeeId,
      }),
    ).rejects.toMatchObject({
      code: "corrective_action_assignment_incomplete",
    });

    await expect(
      updateHrComplianceCorrectiveActionProgress({
        organizationId,
        exceptionId: created.exceptionId,
        progressNote: "Should fail before assignment",
      }),
    ).rejects.toMatchObject({
      code: "corrective_action_not_assigned",
    });

    const createdWithCorrective = await createHrComplianceException({
      organizationId,
      title: "Integration exception with corrective at create",
      complianceArea: "integration",
      itemType: "gap",
      severity: "high",
      correctiveActionDescription: "Initial corrective plan",
      correctiveActionOwnerEmployeeId: ownerEmployeeId,
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
      correctiveActionOwnerEmployeeId: ownerEmployeeId,
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
    "auto-resolves and reopens filing-linked exceptions when overdue posture returns (HRM-CMP-017)",
    async () => {
      const filingCode = `INT-EXC-${Date.now()}`;
      const pastDeadline = new Date("2020-03-01T00:00:00.000Z");
      const upserted = await upsertHrComplianceObligation({
        organizationId,
        code: filingCode,
        title: "Overdue filing exception cycle",
        complianceArea: "filing",
        requirementKind: "filing",
        dueDate: pastDeadline,
      });

      await syncHrComplianceFilings({ organizationId });

      const filings = await listHrComplianceFilingsWindow({
        organizationId,
        search: filingCode,
        limit: 5,
      });
      const filingId = filings.rows[0]?.id;
      expect(filingId).toBeTruthy();

      const sourceReferenceId = buildComplianceExceptionSourceReferenceId({
        sourceKind: "filing",
        sourceId: filingId as string,
        gapKind: "overdue",
      });

      const materialized = await syncHrComplianceExceptions({ organizationId });
      expect(materialized.createdCount).toBeGreaterThanOrEqual(1);

      const openAfterMaterialize = await listHrComplianceExceptionsWindow({
        organizationId,
        search: filingCode,
        openOnly: true,
        limit: 10,
      });
      const exceptionId = openAfterMaterialize.rows[0]?.id;
      expect(exceptionId).toBeTruthy();
      expect(openAfterMaterialize.rows[0]?.gapKind).toBe("overdue");

      const ownerEmployeeId = await loadIntegrationOwnerEmployeeId();

      await assignHrComplianceCorrectiveAction({
        organizationId,
        exceptionId: exceptionId as string,
        correctiveActionDescription: "File statutory return",
        correctiveActionOwnerEmployeeId: ownerEmployeeId,
        correctiveActionDueDate: new Date("2026-08-01T00:00:00.000Z"),
      });

      const inProgress = await listHrComplianceExceptionsWindow({
        organizationId,
        search: filingCode,
        openOnly: true,
        limit: 5,
      });
      expect(inProgress.rows[0]?.status).toBe("in_progress");
      expect(inProgress.rows[0]?.correctiveActionOwnerEmployeeId).toBe(
        ownerEmployeeId,
      );
      expect(inProgress.rows[0]?.correctiveActionDueDate).toBeTruthy();

      await updateHrComplianceFiling({
        organizationId,
        filingId: filingId as string,
        status: "submitted",
        reviewNotes: "cleared overdue for exception auto-resolve",
      });

      const autoResolved = await syncHrComplianceExceptions({ organizationId });
      expect(autoResolved.resolvedCount).toBeGreaterThanOrEqual(1);

      const openAfterResolve = await listHrComplianceExceptionsWindow({
        organizationId,
        search: filingCode,
        openOnly: true,
        limit: 5,
      });
      expect(
        openAfterResolve.rows.some((row) => row.id === exceptionId),
      ).toBe(false);

      await updateHrComplianceFiling({
        organizationId,
        filingId: filingId as string,
        status: "pending",
        filingDeadline: pastDeadline,
        reviewNotes: "restored overdue posture",
      });

      const reopened = await syncHrComplianceExceptions({ organizationId });
      expect(reopened.reopenedCount).toBeGreaterThanOrEqual(1);

      const openAfterReopen = await listHrComplianceExceptionsWindow({
        organizationId,
        search: filingCode,
        openOnly: true,
        limit: 5,
      });
      const reopenedRow = openAfterReopen.rows.find((row) => row.id === exceptionId);
      expect(reopenedRow?.status).toBe("open");
      expect(reopenedRow?.gapKind).toBe("overdue");
      expect(reopenedRow?.correctiveActionOwnerEmployeeId).toBeNull();
      expect(reopenedRow?.correctiveActionDueDate).toBeNull();

      expect(sourceReferenceId).toContain(filingId as string);
      expect(HR_COMPLIANCE_EXCEPTION_AUTO_RESOLVED_NOTE).toContain("Auto-resolved");

      await archiveHrComplianceObligation({
        organizationId,
        obligationId: upserted.obligationId,
      });
      await syncHrComplianceFilings({ organizationId });
      await syncHrComplianceExceptions({ organizationId });
    },
    45_000,
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
      const alertOwnerEmployeeId = await loadIntegrationOwnerEmployeeId();
      const created = await createHrComplianceException({
        organizationId,
        title: exceptionTitle,
        complianceArea: "integration",
        itemType: "gap",
        severity: "high",
        correctiveActionDescription: "Resolve integration gap",
        correctiveActionOwnerEmployeeId: alertOwnerEmployeeId,
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

  it(
    "links, updates, and unlinks compliance evidence documents (HRM-CMP-020)",
    async () => {
      const employeeId = await loadIntegrationOwnerEmployeeId();

      await ensureHrWorkAuthorizationDocuments({ organizationId });
      const workAuthWindow = await listHrWorkAuthorizationDocumentsWindow({
        organizationId,
        limit: 10,
      });
      const workAuthRow = workAuthWindow.rows.find(
        (row) => row.employeeId === employeeId,
      );
      expect(workAuthRow).toBeTruthy();

      const { documentId } = await registerHrEmployeeDocument({
        organizationId,
        employeeId,
        documentType: "work_permit_scan",
        title: "Integration work permit scan",
        blobUrl: "https://example.test/work-permit.pdf",
        mimeType: "application/pdf",
        sizeBytes: 4096,
      });

      const existingLinks = await listHrComplianceEvidenceLinksWindow({
        organizationId,
        recordKind: "work_auth_document",
        recordId: workAuthRow!.id,
        limit: 100,
      });
      for (const row of existingLinks.rows) {
        await unlinkHrComplianceEvidence({
          organizationId,
          evidenceLinkId: row.id,
        });
      }

      const linked = await linkHrComplianceEvidence({
        organizationId,
        recordKind: "work_auth_document",
        recordId: workAuthRow!.id,
        employeeDocumentId: documentId,
        notes: "integration evidence link",
      });
      expect(linked.evidenceLinkId).toBeTruthy();

      await expect(
        linkHrComplianceEvidence({
          organizationId,
          recordKind: "work_auth_document",
          recordId: workAuthRow!.id,
          employeeDocumentId: documentId,
        }),
      ).rejects.toMatchObject({
        code: "evidence_link_already_exists",
      });

      const window = await listHrComplianceEvidenceLinksWindow({
        organizationId,
        recordKind: "work_auth_document",
        recordId: workAuthRow!.id,
        limit: 10,
      });
      const linkedRow = window.rows.find(
        (row) => row.employeeDocumentId === documentId,
      );
      expect(linkedRow).toBeTruthy();
      expect(linkedRow?.employeeDocumentId).toBe(documentId);
      expect(linkedRow?.submissionState).toBe("draft");

      const updated = await updateHrComplianceEvidenceSubmissionState({
        organizationId,
        evidenceLinkId: linked.evidenceLinkId,
        submissionState: "submitted",
      });
      expect(updated.evidenceLinkId).toBe(linked.evidenceLinkId);

      const submittedWindow = await listHrComplianceEvidenceLinksWindow({
        organizationId,
        submissionState: "submitted",
        limit: 10,
      });
      expect(
        submittedWindow.rows.some((row) => row.id === linked.evidenceLinkId),
      ).toBe(true);

      const unlinked = await unlinkHrComplianceEvidence({
        organizationId,
        evidenceLinkId: linked.evidenceLinkId,
      });
      expect(unlinked.evidenceLinkId).toBe(linked.evidenceLinkId);

      const afterUnlink = await listHrComplianceEvidenceLinksWindow({
        organizationId,
        recordKind: "work_auth_document",
        recordId: workAuthRow!.id,
        limit: 10,
      });
      expect(
        afterUnlink.rows.some((row) => row.employeeDocumentId === documentId),
      ).toBe(false);
    },
    30_000,
  );

  it(
    "excludes archived employee documents from evidence windows and work-auth linkedEvidenceCount (HRM-CMP-020)",
    async () => {
      const employeeId = await loadIntegrationOwnerEmployeeId();

      await ensureHrWorkAuthorizationDocuments({ organizationId });
      const workAuthWindow = await listHrWorkAuthorizationDocumentsWindow({
        organizationId,
        limit: 10,
      });
      const workAuthRow = workAuthWindow.rows.find(
        (row) => row.employeeId === employeeId,
      );
      expect(workAuthRow).toBeTruthy();

      const { documentId } = await registerHrEmployeeDocument({
        organizationId,
        employeeId,
        documentType: "work_permit_scan",
        title: "Archive filter work permit scan",
        blobUrl: "https://example.test/archive-filter.pdf",
        mimeType: "application/pdf",
        sizeBytes: 2048,
      });

      const linked = await linkHrComplianceEvidence({
        organizationId,
        recordKind: "work_auth_document",
        recordId: workAuthRow!.id,
        employeeDocumentId: documentId,
      });

      const beforeArchive = await listHrWorkAuthorizationDocumentsWindow({
        organizationId,
        limit: 10,
      });
      const rowBefore = beforeArchive.rows.find((row) => row.id === workAuthRow!.id);
      expect(rowBefore?.linkedEvidenceCount).toBeGreaterThan(0);

      await archiveHrEmployeeDocument({
        organizationId,
        documentId,
      });

      const listAfterArchive = await listHrComplianceEvidenceLinksWindow({
        organizationId,
        recordKind: "work_auth_document",
        recordId: workAuthRow!.id,
        limit: 10,
      });
      expect(
        listAfterArchive.rows.some((row) => row.id === linked.evidenceLinkId),
      ).toBe(false);

      const workAuthAfter = await listHrWorkAuthorizationDocumentsWindow({
        organizationId,
        limit: 10,
      });
      const rowAfter = workAuthAfter.rows.find((row) => row.id === workAuthRow!.id);
      expect(rowAfter?.linkedEvidenceCount).toBe(0);

      await unlinkHrComplianceEvidence({
        organizationId,
        evidenceLinkId: linked.evidenceLinkId,
      });
    },
    30_000,
  );
});
