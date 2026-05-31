import type {
  HrCsfIntegrationExposureQuery,
  HrCsfIntegrationPorts,
  HrCsfLmsLearningRecommendation,
  HrCsfPerformanceAppraisalCompetencyRef,
  HrCsfSuccessionReadinessIndicator,
  HrCsfTrainingDevelopmentGapExposure,
} from "../contracts/hr.talent.csf-integration.contract";
import { hrTalentCsfAuditActions } from "../events/hr.talent.csf-audit.event";
import {
  compareCareerPathSkillRequirements,
  summarizeCareerPathReadiness,
} from "./hr.talent.csf-career-path.shared";
import { emitHrCsfAuditTrailEvent } from "./hr.talent.csf-audit.server";
import {
  listHrCsfEmployeeProficienciesFromStore,
  listHrCsfGapsFromStore,
} from "./hr.talent.csf-store.shared";

const noopPorts: HrCsfIntegrationPorts = {
  trainingDevelopment: {
    async publishGapExposure(rows) {
      return { publishedCount: rows.length };
    },
  },
  lms: {
    async publishLearningRecommendations(rows) {
      return { publishedCount: rows.length };
    },
  },
  performanceAppraisals: {
    async publishCompetencyReferences(rows) {
      return { publishedCount: rows.length };
    },
  },
  successionPlanning: {
    async publishReadinessIndicators(rows) {
      return { publishedCount: rows.length };
    },
  },
};

function courseTitleForCode(code: string): string {
  if (code === "LMS-REACT-201") return "Advanced React patterns";
  if (code === "LMS-SQL-101") return "SQL fundamentals for analysts";
  return code;
}

/** HRM-CSF-023 — expose competency and skill gaps to Training & Development. */
export async function listHrCsfTrainingDevelopmentGapExposure(
  query: HrCsfIntegrationExposureQuery,
): Promise<readonly HrCsfTrainingDevelopmentGapExposure[]> {
  const gaps = listHrCsfGapsFromStore(query.organizationId, query.employeeIds);
  const rows = gaps.map((gap) => ({
    organizationId: query.organizationId,
    employeeId: gap.employeeId,
    employeeDisplayName: gap.employeeDisplayName,
    gapId: gap.id,
    gapKind: gap.gapKind,
    itemCode: gap.itemCode,
    itemName: gap.itemName,
    requiredLevel: gap.requiredLevel,
    currentLevel: gap.currentLevel,
    severity: gap.severity,
    developmentPriority: gap.priority,
    recommendedActions: gap.recommendedActions,
  }));

  await emitHrCsfAuditTrailEvent({
    organizationId: query.organizationId,
    action: hrTalentCsfAuditActions.integration.exposeTraining,
    summary: `Exposed ${rows.length} gaps to Training & Development`,
    metadata: { rowCount: rows.length },
  });

  return rows;
}

/** HRM-CSF-024 — expose learning recommendations to LMS when enabled. */
export async function listHrCsfLmsLearningRecommendations(
  query: HrCsfIntegrationExposureQuery,
): Promise<readonly HrCsfLmsLearningRecommendation[]> {
  if (!query.lmsEnabled) {
    return [];
  }

  const gaps = listHrCsfGapsFromStore(query.organizationId, query.employeeIds);
  const rows: HrCsfLmsLearningRecommendation[] = [];

  for (const gap of gaps) {
    for (const courseCode of gap.linkedCourseCodes) {
      rows.push({
        organizationId: query.organizationId,
        employeeId: gap.employeeId,
        gapId: gap.id,
        courseCode,
        courseTitle: courseTitleForCode(courseCode),
        learningPathCode: gap.gapKind === "skill" ? "LP-TECH" : undefined,
        proficiencyTarget: gap.requiredLevel,
        enabled: true,
      });
    }
  }

  await emitHrCsfAuditTrailEvent({
    organizationId: query.organizationId,
    action: hrTalentCsfAuditActions.integration.exposeLms,
    summary: `Exposed ${rows.length} LMS learning recommendations`,
    metadata: { rowCount: rows.length },
  });

  return rows;
}

/** HRM-CSF-025 — expose competency references to Performance Appraisals when authorized. */
export async function listHrCsfPerformanceAppraisalCompetencyRefs(
  query: HrCsfIntegrationExposureQuery,
): Promise<readonly HrCsfPerformanceAppraisalCompetencyRef[]> {
  if (!query.performanceAuthorized) {
    return [];
  }

  const proficiencies = listHrCsfEmployeeProficienciesFromStore(
    query.organizationId,
    query.employeeIds,
  ).filter((row) => row.itemKind === "competency");

  const rows = proficiencies.map((row) => ({
    organizationId: query.organizationId,
    employeeId: row.employeeId,
    competencyCode: row.itemCode,
    competencyName: row.itemName,
    requiredLevel: "competent" as const,
    assessedLevel: row.currentLevel,
    lastAssessedAt: row.lastAssessedAt,
    assessorKind: row.assessorKind,
    evidenceSummary: row.evidenceSummary,
  }));

  await emitHrCsfAuditTrailEvent({
    organizationId: query.organizationId,
    action: hrTalentCsfAuditActions.integration.exposePerformance,
    summary: `Exposed ${rows.length} competency references to Performance Appraisals`,
    metadata: { rowCount: rows.length },
  });

  return rows;
}

/** HRM-CSF-026 — expose readiness indicators to Succession Planning when authorized. */
export async function listHrCsfSuccessionReadinessIndicators(
  query: HrCsfIntegrationExposureQuery,
): Promise<readonly HrCsfSuccessionReadinessIndicator[]> {
  if (!query.successionAuthorized) {
    return [];
  }

  const proficiencies = listHrCsfEmployeeProficienciesFromStore(
    query.organizationId,
    query.employeeIds,
  );
  const employees = new Map<
    string,
    {
      employeeDisplayName: string;
      roleCode: string;
      roleName: string;
      skillCount: number;
      competencyCount: number;
    }
  >();

  for (const row of proficiencies) {
    const bucket = employees.get(row.employeeId) ?? {
      employeeDisplayName: row.employeeDisplayName,
      roleCode: row.roleCode,
      roleName: row.roleName,
      skillCount: 0,
      competencyCount: 0,
    };
    if (row.itemKind === "skill") {
      bucket.skillCount += 1;
    } else {
      bucket.competencyCount += 1;
    }
    employees.set(row.employeeId, bucket);
  }

  const rows: HrCsfSuccessionReadinessIndicator[] = [];

  for (const [employeeId, bucket] of employees) {
    const comparisons = compareCareerPathSkillRequirements({
      organizationId: query.organizationId,
      employeeId,
      targetRoleCode: "ENG-MGR",
    });
    const summary = summarizeCareerPathReadiness(comparisons);
    const criticalGaps = listHrCsfGapsFromStore(query.organizationId, [employeeId]).filter(
      (gap) => gap.severity === "critical" || gap.severity === "high",
    );

    rows.push({
      organizationId: query.organizationId,
      employeeId,
      employeeDisplayName: bucket.employeeDisplayName,
      targetRoleCode: "ENG-MGR",
      targetRoleName: "Engineering Manager",
      readinessScorePct: summary.readinessScorePct,
      criticalGapCount: criticalGaps.length,
      leadershipPipelineEligible: summary.readinessScorePct >= 70,
      skillCoveragePct: summary.readinessScorePct,
      competencyCoveragePct: bucket.competencyCount > 0 ? 100 : 0,
    });
  }

  await emitHrCsfAuditTrailEvent({
    organizationId: query.organizationId,
    action: hrTalentCsfAuditActions.integration.exposeSuccession,
    summary: `Exposed ${rows.length} readiness indicators to Succession Planning`,
    metadata: { rowCount: rows.length },
  });

  return rows;
}

/** Publish all integration exposures through downstream ports. */
export async function publishHrCsfIntegrationExposures(
  query: HrCsfIntegrationExposureQuery & {
    ports?: Partial<HrCsfIntegrationPorts>;
  },
) {
  const ports = { ...noopPorts, ...query.ports };
  const [training, lms, performance, succession] = await Promise.all([
    listHrCsfTrainingDevelopmentGapExposure(query),
    listHrCsfLmsLearningRecommendations(query),
    listHrCsfPerformanceAppraisalCompetencyRefs(query),
    listHrCsfSuccessionReadinessIndicators(query),
  ]);

  const [trainingResult, lmsResult, performanceResult, successionResult] =
    await Promise.all([
      ports.trainingDevelopment.publishGapExposure(training),
      ports.lms.publishLearningRecommendations(lms),
      ports.performanceAppraisals.publishCompetencyReferences(performance),
      ports.successionPlanning.publishReadinessIndicators(succession),
    ]);

  return {
    training: trainingResult,
    lms: lmsResult,
    performance: performanceResult,
    succession: successionResult,
  };
}

export { noopPorts as defaultHrCsfIntegrationPorts };
