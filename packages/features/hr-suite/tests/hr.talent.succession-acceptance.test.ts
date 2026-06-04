import { describe, expect, it } from "vitest";

import {
  SUCCESSION_ACCEPTANCE_CRITERIA_COVERAGE,
  SUCCESSION_REQUIREMENT_COVERAGE,
  assertSuccessionAcceptanceCriteriaComplete,
  assertSuccessionCoverageComplete,
} from "./hr.talent.succession-coverage.shared";
import { buildHrSuccessionPageModel } from "./hr.talent.succession.page-model.server";
import {
  parseHrSuccessionSearchParams,
  toHrSuccessionPageModelInput,
} from "./hr.talent.succession-search-params.parse.shared";
import {
  buildHrSuccessionBenchStrengthRows,
  buildHrSuccessionNotifications,
  buildHrSuccessionReportRows,
  createHrSuccessionCriticalRole,
  emitHrSuccessionAuditEvent,
  filterHrSuccessionRecordsForAccess,
  getHrSuccessionStore,
  listApprovedSuccessionRecommendationsForLifecycle,
  nominateHrSuccessionSuccessor,
  resetHrSuccessionStoreForTests,
} from "./hr.talent.succession-store.shared";
import { hrTalentSuccessionAuditActions } from "../events/hr.talent.succession.event";

const ORG = "org_succession_test";

describe("HRM-SUC-001..030 coverage registry", () => {
  it("registers all thirty functional requirements", () => {
    assertSuccessionCoverageComplete();
    const codes = SUCCESSION_REQUIREMENT_COVERAGE.map((entry) => entry.code);
    for (let index = 1; index <= 30; index += 1) {
      expect(codes).toContain(`HRM-SUC-${String(index).padStart(3, "0")}`);
    }
  });

  it("maps all enterprise acceptance criteria as shipped", () => {
    assertSuccessionAcceptanceCriteriaComplete();
    expect(SUCCESSION_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(24);
    expect(
      SUCCESSION_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (row) => row.status === "shipped",
      ),
    ).toBe(true);
  });
});

describe("HRM-SUC domain behavior", () => {
  it("validates critical roles, successors, and audit evidence", () => {
    const role = createHrSuccessionCriticalRole({
      id: "suc-role-test-finance-director",
      organizationId: ORG,
      roleCode: "ROLE-FIN-DIR",
      roleTitle: "Finance Director",
      orgUnitId: "org-finance",
      orgUnitName: "Finance",
      departmentId: "dept-finance",
      departmentName: "Finance",
      legalEntityCode: "MY01",
      positionId: "pos-finance-director",
      jobFamily: "Finance",
      grade: "G8",
      incumbentEmployeeId: "emp-fin-001",
      incumbentDisplayName: "Ivy Lim",
      businessImpact: "critical",
      leadershipLevel: "senior_leadership",
      vacancyRisk: "high",
      replacementDifficulty: "hard",
      reviewCycleId: "suc-cycle-2026-h1",
      nextReviewDueAt: "2026-10-31",
      active: true,
      createdAt: "2026-05-01T00:00:00.000Z",
      updatedAt: "2026-05-01T00:00:00.000Z",
    });
    const successor = nominateHrSuccessionSuccessor({
      id: "suc-nom-test-finance",
      organizationId: ORG,
      criticalRoleId: role.id,
      employeeId: "emp-fin-002",
      employeeDisplayName: "Maya Wong",
      currentRoleTitle: "Finance Controller",
      managerEmployeeId: "emp-fin-001",
      successorType: "primary",
      readinessLevel: "ready_now",
      readinessScore: 94,
      readinessAssessedAt: "2026-05-16T00:00:00.000Z",
      performanceReference: {
        appraisalId: "perf-fin-2026",
        reviewCycleId: "cycle-2026-annual",
        reviewPeriod: "2026 Annual",
        finalRatingLabel: "Exceptional",
        performanceOutcomeCode: "exceptional",
        managerRecommendationKinds: ["promotion"],
      },
      potentialAssessment: {
        potentialLevel: "exceptional",
        leadershipPotentialScore: 92,
        learningAgilityScore: 91,
        businessImpactScore: 90,
        growthCapacityScore: 89,
        assessedByUserId: "hr-test",
        assessedAt: "2026-05-16T00:00:00.000Z",
      },
      gridEnabled: true,
      gridCell: "star",
      retentionRisk: "low",
      competencyGapIds: [],
      developmentPlanId: null,
      nominatedByUserId: "hr-test",
      nominatedAt: "2026-05-16T00:00:00.000Z",
      approvedAt: "2026-05-20T00:00:00.000Z",
    });

    const store = resetHrSuccessionStoreForTests(ORG);
    const audit = emitHrSuccessionAuditEvent({
      store,
      organizationId: ORG,
      action: hrTalentSuccessionAuditActions.successor.nominate,
      actorId: "hr-test",
      targetId: successor.id,
      targetType: "successor",
      summary: `Nominated ${successor.employeeDisplayName}`,
    });

    expect(role.roleTitle).toBe("Finance Director");
    expect(successor.readinessLevel).toBe("ready_now");
    expect(audit.summary).toContain("Nominated");
    expect(store.auditEvents.some((row) => row.id === audit.id)).toBe(true);
  });

  it("calculates bench strength, reports risk, and creates notifications", () => {
    resetHrSuccessionStoreForTests(ORG);
    const store = getHrSuccessionStore(ORG);
    const benchRows = buildHrSuccessionBenchStrengthRows({
      store,
      groupBy: "role",
    });
    const engineeringBench = benchRows.find(
      (row) => row.groupKey === "suc-role-vp-eng",
    );
    expect(engineeringBench?.noReadySuccessorCount).toBe(1);
    expect(engineeringBench?.riskLevel).toBe("critical");

    const reportRows = buildHrSuccessionReportRows({
      store,
      groupBy: "risk",
    });
    expect(reportRows.some((row) => row.groupKey === "critical")).toBe(true);

    const notifications = buildHrSuccessionNotifications({ store });
    expect(
      notifications.some((row) => row.type === "missing_successor"),
    ).toBe(true);
    expect(notifications.some((row) => row.type === "development_gap")).toBe(
      true,
    );
  });

  it("restricts successor performance and potential when restricted access is absent", () => {
    resetHrSuccessionStoreForTests(ORG);
    const visible = filterHrSuccessionRecordsForAccess({
      store: getHrSuccessionStore(ORG),
      access: {
        role: "manager",
        visibleEmployeeIds: ["emp-alex"],
        canReadRestricted: false,
        canReadAudit: false,
        canExposeLifecycle: false,
      },
    });

    expect(visible.successors.some((row) => row.employeeId === "emp-alex")).toBe(
      true,
    );
    const alex = visible.successors.find((row) => row.employeeId === "emp-alex");
    expect(alex?.performanceReference).toBeNull();
    expect(alex?.potentialAssessment.leadershipPotentialScore).toBe(0);
    expect(visible.auditEvents).toHaveLength(0);
  });

  it("exposes approved lifecycle recommendation references when authorized", () => {
    resetHrSuccessionStoreForTests(ORG);
    const rows = listApprovedSuccessionRecommendationsForLifecycle({
      store: getHrSuccessionStore(ORG),
      authorized: true,
    });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]?.employeeId).toBe("emp-alex");
    expect(rows[0]?.movementType).toBe("promotion");
  });
});

describe("HRM-SUC page model and Pattern C lists", () => {
  it("builds list configurations and hides lifecycle/audit rows without access", async () => {
    resetHrSuccessionStoreForTests(ORG);
    const searchParams = parseHrSuccessionSearchParams({
      successionReportGroupBy: "risk",
    });
    const pageModel = await buildHrSuccessionPageModel(
      toHrSuccessionPageModelInput({
        organizationId: ORG,
        canWrite: false,
        canApprove: false,
        canReadAudit: false,
        canReadRestricted: false,
        canExposeLifecycle: false,
        searchParams,
      }),
    );

    expect(pageModel.criticalRolesList.rows.length).toBeGreaterThan(0);
    expect(pageModel.successorsList.rows.length).toBeGreaterThan(0);
    expect(pageModel.developmentPlansList.rows.length).toBeGreaterThan(0);
    expect(pageModel.lifecycleRecommendationsList).toBeNull();
    expect(pageModel.auditTrailList).toBeNull();
    expect(pageModel.reportGroupBy).toBe("risk");
  });

  it("includes lifecycle recommendations and audit list when access is granted", async () => {
    resetHrSuccessionStoreForTests(ORG);
    const pageModel = await buildHrSuccessionPageModel(
      toHrSuccessionPageModelInput({
        organizationId: ORG,
        canWrite: true,
        canApprove: true,
        canReadAudit: true,
        canReadRestricted: true,
        canExposeLifecycle: true,
      }),
    );

    expect(pageModel.lifecycleRecommendationsList?.rows.length).toBeGreaterThan(
      0,
    );
    expect(pageModel.auditTrailList?.rows.length).toBeGreaterThan(0);
  });
});
