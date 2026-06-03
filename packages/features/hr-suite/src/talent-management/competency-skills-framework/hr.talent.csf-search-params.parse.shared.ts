export const hrCsfCompetenciesSearchParam = "csfCompetenciesSearch";
export const hrCsfSkillsSearchParam = "csfSkillsSearch";
export const hrCsfGapsSearchParam = "csfGapsSearch";
export const hrCsfReportsSearchParam = "csfReportsSearch";
export const hrCsfAuditSearchParam = "csfAuditSearch";
export const hrCsfMatchingSearchParam = "csfMatchingSearch";
export const hrCsfReportGroupByParam = "csfReportGroupBy";
export const hrCsfReportDepartmentParam = "csfReportDepartment";
export const hrCsfReportJobFamilyParam = "csfReportJobFamily";
export const hrCsfReportGradeParam = "csfReportGrade";
export const hrCsfReportProficiencyParam = "csfReportProficiency";
export const hrCsfMatchTargetKindParam = "csfMatchTargetKind";
export const hrCsfMatchTargetCodeParam = "csfMatchTargetCode";

export const hrCsfCompetenciesSurfaceKey = "hr.talent.csf.competencies.list";
export const hrCsfSkillsSurfaceKey = "hr.talent.csf.skills.list";
export const hrCsfGapsSurfaceKey = "hr.talent.csf.gaps.list";
export const hrCsfReportsSurfaceKey = "hr.talent.csf.reports.list";
export const hrCsfAuditSurfaceKey = "hr.talent.csf.audit.list";
export const hrCsfMatchingSurfaceKey = "hr.talent.csf.matching.list";

export const HR_CSF_LIST_SURFACE_KEYS = [
  hrCsfCompetenciesSurfaceKey,
  hrCsfSkillsSurfaceKey,
  hrCsfGapsSurfaceKey,
  hrCsfReportsSurfaceKey,
  hrCsfAuditSurfaceKey,
  hrCsfMatchingSurfaceKey,
] as const;

export type HrCsfListSurfaceKey = (typeof HR_CSF_LIST_SURFACE_KEYS)[number];

export type HrCsfSearchParams = {
  competenciesSearch?: string;
  skillsSearch?: string;
  gapsSearch?: string;
  reportsSearch?: string;
  auditSearch?: string;
  matchingSearch?: string;
  reportGroupBy?: string;
  reportDepartment?: string;
  reportJobFamily?: string;
  reportGrade?: string;
  reportProficiency?: string;
  matchTargetKind?: string;
  matchTargetCode?: string;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parseHrCsfSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
): HrCsfSearchParams {
  if (!searchParams) {
    return {};
  }

  return {
    competenciesSearch: readSearchParam(searchParams, hrCsfCompetenciesSearchParam),
    skillsSearch: readSearchParam(searchParams, hrCsfSkillsSearchParam),
    gapsSearch: readSearchParam(searchParams, hrCsfGapsSearchParam),
    reportsSearch: readSearchParam(searchParams, hrCsfReportsSearchParam),
    auditSearch: readSearchParam(searchParams, hrCsfAuditSearchParam),
    matchingSearch: readSearchParam(searchParams, hrCsfMatchingSearchParam),
    reportGroupBy: readSearchParam(searchParams, hrCsfReportGroupByParam),
    reportDepartment: readSearchParam(searchParams, hrCsfReportDepartmentParam),
    reportJobFamily: readSearchParam(searchParams, hrCsfReportJobFamilyParam),
    reportGrade: readSearchParam(searchParams, hrCsfReportGradeParam),
    reportProficiency: readSearchParam(searchParams, hrCsfReportProficiencyParam),
    matchTargetKind: readSearchParam(searchParams, hrCsfMatchTargetKindParam),
    matchTargetCode: readSearchParam(searchParams, hrCsfMatchTargetCodeParam),
  };
}

export type HrCsfHubPageModelInput = {
  organizationId: string;
  canWriteCsf: boolean;
  canReadAudit: boolean;
  canReadReadiness: boolean;
  canExposePerformance: boolean;
  canExposeSuccession: boolean;
  visibleEmployeeIds: readonly string[] | null;
  lmsEnabled: boolean;
  searchParams?: HrCsfSearchParams;
};

export function toHrCsfHubPageModelInput(input: HrCsfHubPageModelInput) {
  return input;
}

export function toHrCsfReportsPageModelInput(input: HrCsfHubPageModelInput) {
  return input;
}

export function toHrCsfAuditPageModelInput(input: HrCsfHubPageModelInput) {
  return input;
}

export function toHrCsfMatchingPageModelInput(input: HrCsfHubPageModelInput) {
  return input;
}
