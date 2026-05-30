import {
  listHrBenefitAuditTrailWindow,
  listHrBenefitEligibilityRulesWindow,
  listHrBenefitEnrollmentsWindow,
  listHrBenefitOpenEnrollmentWindowsWindow,
  listHrBenefitPlansWindow,
  listHrBenefitProvidersWindow,
} from "@afenda/db";

import { buildHrBenefitsAuditTrailListSurface } from "../surface/hr.payroll.benefits-audit-trail-list.surface";
import { buildHrBenefitsEligibilityRulesListSurface } from "../surface/hr.payroll.benefits-eligibility-rules-list.surface";
import { buildHrBenefitsEnrollmentsListSurface } from "../surface/hr.payroll.benefits-enrollments-list.surface";
import { buildHrBenefitsOpenEnrollmentListSurface } from "../surface/hr.payroll.benefits-open-enrollment-list.surface";
import { buildHrBenefitsPlansListSurface } from "../surface/hr.payroll.benefits-plans-list.surface";
import { buildHrBenefitsProvidersListSurface } from "../surface/hr.payroll.benefits-providers-list.surface";
import {
  hrBenefitsAuditTrailSurfaceKey,
  hrBenefitsEligibilityRulesSurfaceKey,
  hrBenefitsEnrollmentsSurfaceKey,
  hrBenefitsOpenEnrollmentSurfaceKey,
  hrBenefitsPlansSurfaceKey,
  hrBenefitsProvidersSurfaceKey,
} from "./hr.payroll.benefits-search-params.parse.shared";

const BENEFITS_DEFAULT_PAGE_SIZE = 25;

export type HrBenefitsPageModelInput = {
  organizationId: string;
  canWrite: boolean;
  canViewSensitive?: boolean;
  plansSearch?: string;
  eligibilityRulesSearch?: string;
  openEnrollmentSearch?: string;
  enrollmentsSearch?: string;
  providersSearch?: string;
  auditTrailSearch?: string;
};

export type HrBenefitsPageModel = {
  canViewSensitive: boolean;
  plansList: ReturnType<typeof buildHrBenefitsPlansListSurface>;
  eligibilityRulesList: ReturnType<typeof buildHrBenefitsEligibilityRulesListSurface>;
  openEnrollmentList: ReturnType<typeof buildHrBenefitsOpenEnrollmentListSurface>;
  enrollmentsList: ReturnType<typeof buildHrBenefitsEnrollmentsListSurface>;
  providersList: ReturnType<typeof buildHrBenefitsProvidersListSurface>;
  auditTrailList: ReturnType<typeof buildHrBenefitsAuditTrailListSurface>;
  surfaceKeys: {
    plans: typeof hrBenefitsPlansSurfaceKey;
    eligibilityRules: typeof hrBenefitsEligibilityRulesSurfaceKey;
    openEnrollment: typeof hrBenefitsOpenEnrollmentSurfaceKey;
    enrollments: typeof hrBenefitsEnrollmentsSurfaceKey;
    providers: typeof hrBenefitsProvidersSurfaceKey;
    auditTrail: typeof hrBenefitsAuditTrailSurfaceKey;
  };
};

export async function buildHrBenefitsPageModel(
  input: HrBenefitsPageModelInput,
): Promise<HrBenefitsPageModel> {
  const [
    plansWindow,
    eligibilityRulesWindow,
    openEnrollmentWindow,
    enrollmentsWindow,
    providersWindow,
    auditTrailWindow,
  ] = await Promise.all([
    listHrBenefitPlansWindow({
      organizationId: input.organizationId,
      limit: BENEFITS_DEFAULT_PAGE_SIZE,
      search: input.plansSearch,
    }),
    listHrBenefitEligibilityRulesWindow({
      organizationId: input.organizationId,
      limit: BENEFITS_DEFAULT_PAGE_SIZE,
      search: input.eligibilityRulesSearch,
    }),
    listHrBenefitOpenEnrollmentWindowsWindow({
      organizationId: input.organizationId,
      limit: BENEFITS_DEFAULT_PAGE_SIZE,
      search: input.openEnrollmentSearch,
    }),
    listHrBenefitEnrollmentsWindow({
      organizationId: input.organizationId,
      limit: BENEFITS_DEFAULT_PAGE_SIZE,
      search: input.enrollmentsSearch,
    }),
    listHrBenefitProvidersWindow({
      organizationId: input.organizationId,
      limit: BENEFITS_DEFAULT_PAGE_SIZE,
      search: input.providersSearch,
    }),
    listHrBenefitAuditTrailWindow({
      organizationId: input.organizationId,
      limit: BENEFITS_DEFAULT_PAGE_SIZE,
      search: input.auditTrailSearch,
    }),
  ]);

  return {
    canViewSensitive: input.canViewSensitive ?? false,
    plansList: buildHrBenefitsPlansListSurface({
      window: { ...plansWindow, rows: [...plansWindow.rows] },
      searchValue: input.plansSearch,
    }),
    eligibilityRulesList: buildHrBenefitsEligibilityRulesListSurface({
      window: { ...eligibilityRulesWindow, rows: [...eligibilityRulesWindow.rows] },
      searchValue: input.eligibilityRulesSearch,
    }),
    openEnrollmentList: buildHrBenefitsOpenEnrollmentListSurface({
      window: { ...openEnrollmentWindow, rows: [...openEnrollmentWindow.rows] },
      searchValue: input.openEnrollmentSearch,
    }),
    enrollmentsList: buildHrBenefitsEnrollmentsListSurface({
      canWrite: input.canWrite,
      window: { ...enrollmentsWindow, rows: [...enrollmentsWindow.rows] },
      searchValue: input.enrollmentsSearch,
    }),
    providersList: buildHrBenefitsProvidersListSurface({
      window: { ...providersWindow, rows: [...providersWindow.rows] },
      searchValue: input.providersSearch,
    }),
    auditTrailList: buildHrBenefitsAuditTrailListSurface({
      window: { ...auditTrailWindow, rows: [...auditTrailWindow.rows] },
      searchValue: input.auditTrailSearch,
    }),
    surfaceKeys: {
      plans: hrBenefitsPlansSurfaceKey,
      eligibilityRules: hrBenefitsEligibilityRulesSurfaceKey,
      openEnrollment: hrBenefitsOpenEnrollmentSurfaceKey,
      enrollments: hrBenefitsEnrollmentsSurfaceKey,
      providers: hrBenefitsProvidersSurfaceKey,
      auditTrail: hrBenefitsAuditTrailSurfaceKey,
    },
  };
}
