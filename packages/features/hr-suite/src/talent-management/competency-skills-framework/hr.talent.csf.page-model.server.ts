import type { HrCsfReportGroupBy, HrCsfMatchTargetKind } from "./hr.talent.csf-constants.shared";
import { listHrCsfAuditTrailWindow } from "./hrs-hr-talent-csf-audit-server";
import {
  buildHrCsfReportRows,
  filterHrCsfReportRows,
} from "./hrs-hr-talent-csf-reports-server";
import { findEmployeesMatchingRequiredSkills } from "./hrs-hr-talent-csf-matching-server";
import {
  listHrCsfTrainingDevelopmentGapExposure,
  listHrCsfLmsLearningRecommendations,
  listHrCsfPerformanceAppraisalCompetencyRefs,
  listHrCsfSuccessionReadinessIndicators,
} from "./hrs-hr-talent-csf-integration-server";
import {
  listHrCsfCompetenciesFromStore,
  listHrCsfGapsFromStore,
  listHrCsfSkillsFromStore,
} from "./hr.talent.csf-store.shared";
import type { HrCsfHubPageModelInput } from "./hr.talent.csf-search-params.parse.shared";
import {
  buildHrCsfAuditListSurface,
  buildHrCsfCompetenciesListSurface,
  buildHrCsfGapsListSurface,
  buildHrCsfMatchingListSurface,
  buildHrCsfReportsListSurface,
  buildHrCsfSkillsListSurface,
} from "./hr.talent.csf-lists.surface";

const DEFAULT_PAGE_SIZE = 25;

function parseReportGroupBy(value?: string): HrCsfReportGroupBy {
  const allowed: readonly HrCsfReportGroupBy[] = [
    "employee",
    "role",
    "department",
    "job_family",
    "grade",
    "proficiency",
  ];
  if (value && allowed.includes(value as HrCsfReportGroupBy)) {
    return value as HrCsfReportGroupBy;
  }
  return "department";
}

function parseMatchTargetKind(value?: string): HrCsfMatchTargetKind {
  const allowed: readonly HrCsfMatchTargetKind[] = ["role", "project", "critical_position"];
  if (value && allowed.includes(value as HrCsfMatchTargetKind)) {
    return value as HrCsfMatchTargetKind;
  }
  return "role";
}

export type HrCsfHubPageModel = {
  competenciesList: ReturnType<typeof buildHrCsfCompetenciesListSurface>;
  skillsList: ReturnType<typeof buildHrCsfSkillsListSurface>;
  gapsList: ReturnType<typeof buildHrCsfGapsListSurface>;
  integrationCounts: {
    trainingGaps: number;
    lmsRecommendations: number;
    performanceRefs: number;
    successionIndicators: number;
  };
};

export type HrCsfReportsPageModel = {
  reportsList: ReturnType<typeof buildHrCsfReportsListSurface>;
  reportGroupBy: HrCsfReportGroupBy;
};

export type HrCsfAuditPageModel = {
  auditList: ReturnType<typeof buildHrCsfAuditListSurface>;
};

export type HrCsfMatchingPageModel = {
  matchingList: ReturnType<typeof buildHrCsfMatchingListSurface>;
  targetKind: HrCsfMatchTargetKind;
  targetCode: string;
};

export async function buildHrCsfHubPageModel(
  input: HrCsfHubPageModelInput,
): Promise<HrCsfHubPageModel> {
  const search = input.searchParams ?? {};
  const competencies = listHrCsfCompetenciesFromStore(input.organizationId);
  const skills = listHrCsfSkillsFromStore(input.organizationId);
  const gaps = listHrCsfGapsFromStore(input.organizationId, input.visibleEmployeeIds);

  const exposureQuery = {
    organizationId: input.organizationId,
    employeeIds: input.visibleEmployeeIds,
    lmsEnabled: input.lmsEnabled,
    performanceAuthorized: input.canExposePerformance,
    successionAuthorized: input.canExposeSuccession && input.canReadReadiness,
  };

  const [trainingGaps, lmsRecommendations, performanceRefs, successionIndicators] =
    await Promise.all([
      listHrCsfTrainingDevelopmentGapExposure(exposureQuery),
      listHrCsfLmsLearningRecommendations(exposureQuery),
      listHrCsfPerformanceAppraisalCompetencyRefs(exposureQuery),
      listHrCsfSuccessionReadinessIndicators(exposureQuery),
    ]);

  return {
    competenciesList: buildHrCsfCompetenciesListSurface({
      rows: competencies,
      searchValue: search.competenciesSearch,
    }),
    skillsList: buildHrCsfSkillsListSurface({
      rows: skills,
      searchValue: search.skillsSearch,
    }),
    gapsList: buildHrCsfGapsListSurface({
      rows: gaps,
      searchValue: search.gapsSearch,
    }),
    integrationCounts: {
      trainingGaps: trainingGaps.length,
      lmsRecommendations: lmsRecommendations.length,
      performanceRefs: performanceRefs.length,
      successionIndicators: successionIndicators.length,
    },
  };
}

export async function buildHrCsfReportsPageModel(
  input: HrCsfHubPageModelInput,
): Promise<HrCsfReportsPageModel> {
  const search = input.searchParams ?? {};
  const groupBy = parseReportGroupBy(search.reportGroupBy);
  const rows = buildHrCsfReportRows({
    organizationId: input.organizationId,
    groupBy,
    filter: {
      departmentName: search.reportDepartment,
      jobFamily: search.reportJobFamily,
      grade: search.reportGrade,
      proficiencyLevel: search.reportProficiency,
    },
    visibleEmployeeIds: input.visibleEmployeeIds,
  });

  return {
    reportGroupBy: groupBy,
    reportsList: buildHrCsfReportsListSurface({
      rows: filterHrCsfReportRows(rows, search.reportsSearch),
      searchValue: search.reportsSearch,
    }),
  };
}

export async function buildHrCsfAuditPageModel(
  input: HrCsfHubPageModelInput,
): Promise<HrCsfAuditPageModel | null> {
  if (!input.canReadAudit) {
    return null;
  }

  const search = input.searchParams ?? {};
  const auditWindow = await listHrCsfAuditTrailWindow({
    organizationId: input.organizationId,
    limit: DEFAULT_PAGE_SIZE,
    search: search.auditSearch,
  });

  return {
    auditList: buildHrCsfAuditListSurface({
      window: auditWindow,
      searchValue: search.auditSearch,
    }),
  };
}

export async function buildHrCsfMatchingPageModel(
  input: HrCsfHubPageModelInput,
): Promise<HrCsfMatchingPageModel> {
  const search = input.searchParams ?? {};
  const targetKind = parseMatchTargetKind(search.matchTargetKind);
  const targetCode = search.matchTargetCode?.trim() || "SR-ENG";

  const matches = await findEmployeesMatchingRequiredSkills({
    organizationId: input.organizationId,
    targetKind,
    targetCode,
    visibleEmployeeIds: input.visibleEmployeeIds,
    actorAuthUserId: null,
  });

  return {
    targetKind,
    targetCode,
    matchingList: buildHrCsfMatchingListSurface({
      rows: matches,
      searchValue: search.matchingSearch,
    }),
  };
}
