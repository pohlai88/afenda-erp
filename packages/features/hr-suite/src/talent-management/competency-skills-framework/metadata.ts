import { HR_CSF_LIST_SURFACE_KEYS } from "./data/hr.talent.csf-search-params.parse.shared";

export {
  HR_CSF_LIST_SURFACE_KEYS,
  hrCsfAuditSearchParam,
  hrCsfAuditSurfaceKey,
  hrCsfCompetenciesSearchParam,
  hrCsfCompetenciesSurfaceKey,
  hrCsfGapsSearchParam,
  hrCsfGapsSurfaceKey,
  hrCsfMatchingSearchParam,
  hrCsfMatchingSurfaceKey,
  hrCsfReportsSearchParam,
  hrCsfReportsSurfaceKey,
  hrCsfSkillsSearchParam,
  hrCsfSkillsSurfaceKey,
  hrCsfReportGroupByParam,
  hrCsfMatchTargetKindParam,
  hrCsfMatchTargetCodeParam,
  parseHrCsfSearchParams,
  toHrCsfHubPageModelInput,
  toHrCsfReportsPageModelInput,
  toHrCsfAuditPageModelInput,
  toHrCsfMatchingPageModelInput,
  type HrCsfListSurfaceKey,
  type HrCsfSearchParams,
} from "./data/hr.talent.csf-search-params.parse.shared";

export const HR_CSF_LIST_SURFACE_COLUMNS_BY_KEY = {
  "hr.talent.csf.competencies.list": "hr.talent.csf.competencies.columns",
  "hr.talent.csf.skills.list": "hr.talent.csf.skills.columns",
  "hr.talent.csf.gaps.list": "hr.talent.csf.gaps.columns",
  "hr.talent.csf.reports.list": "hr.talent.csf.reports.columns",
  "hr.talent.csf.audit.list": "hr.talent.csf.audit.columns",
  "hr.talent.csf.matching.list": "hr.talent.csf.matching.columns",
} as const;

export function getHrCsfListSurfaceKeys() {
  return HR_CSF_LIST_SURFACE_KEYS;
}

export { hrCsfUiCopy } from "./surface/hr.talent.csf-ui.copy.shared";

export {
  hrCsfCompetenciesColumnsId,
  hrCsfSkillsColumnsId,
  hrCsfGapsColumnsId,
  hrCsfReportsColumnsId,
  hrCsfAuditColumnsId,
  hrCsfMatchingColumnsId,
} from "./surface/hr.talent.csf-surface-columns.shared";

export {
  hrCsfRoutePaths,
  type HrCsfRoutePath,
} from "./contracts/hr.talent.csf-route.contract";

export {
  CSF_REQUIREMENT_COVERAGE,
  CSF_ACCEPTANCE_CRITERIA_COVERAGE,
  assertCsfCoverageComplete,
  assertCsfAcceptanceCriteriaComplete,
} from "./data/hr.talent.csf-acceptance-coverage.shared";
