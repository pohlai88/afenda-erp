import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import type { ComponentType } from "react";
import { Alert, SectionPanel } from "@afenda/ui";

import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client";

import {
  HrBenefitsEnrollmentCreateForm,
  HrBenefitsEnrollmentsTrailingCell,
  HrBenefitsLifeEventRecordForm,
  HrBenefitsNewHireEnrollmentForm,
} from "../client";
import type { HrBenefitsPageModel } from "../data/hr.payroll.benefits.page-model.server";
import {
  hrBenefitsAuditTrailSurfaceKey,
  hrBenefitsEligibilityRulesSurfaceKey,
  hrBenefitsEnrollmentsSurfaceKey,
  hrBenefitsOpenEnrollmentSurfaceKey,
  hrBenefitsPlansSurfaceKey,
  hrBenefitsProvidersSurfaceKey,
} from "../data/hr.payroll.benefits-search-params.parse.shared";
import { HrBenefitsReportsExportPanel } from "./hr.payroll.benefits-reports.component.client";
import { hrBenefitsUiCopy } from "../surface/hr.payroll.benefits-ui.copy.shared";

const benefitsForbiddenState = {
  variant: "forbidden" as const,
  title: hrBenefitsUiCopy.accessDenied.title,
  description: hrBenefitsUiCopy.accessDenied.description,
};

function HrBenefitsListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
  TrailingCell,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: HrBenefitsPageModel["plansList"];
  TrailingCell?: ComponentType<GovernedListTrailingCellProps>;
}) {
  return (
    <GovernedPatternCListSection
      title={title}
      description={description}
      surfaceKey={surfaceKey}
      listConfiguration={listConfiguration}
      forbidden={benefitsForbiddenState}
      layout="embedded"
      {...(TrailingCell
        ? {
            trailingColumn: {
              header: "Actions",
              Cell: TrailingCell,
            },
          }
        : {})}
    />
  );
}

export function HrBenefitsAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrBenefitsUiCopy.accessDenied.title}
      description={hrBenefitsUiCopy.accessDenied.description}
    />
  );
}

/** Benefits workbench — Pattern C lists (HRM-BEN-001..014 foundation). */
export function HrBenefitsWorkbenchSection({
  pageModel,
  canWrite = false,
}: {
  pageModel: HrBenefitsPageModel;
  canWrite?: boolean;
}) {
  return (
    <div className="@container flex flex-col gap-surface-lg">
      {!pageModel.canViewSensitive ? (
        <Alert variant="default" title="Sensitive benefit detail restricted">
          {hrBenefitsUiCopy.sensitiveAccess.enrollmentsDescription}
        </Alert>
      ) : null}
      {canWrite ? (
        <>
          <HrBenefitsNewHireEnrollmentForm />
          <HrBenefitsLifeEventRecordForm />
          <HrBenefitsEnrollmentCreateForm />
        </>
      ) : null}
      <HrBenefitsListSection
        title={hrBenefitsUiCopy.plans.surfaceHeaderTitle}
        description="Benefit plan catalog with category, provider, and contribution references."
        surfaceKey={hrBenefitsPlansSurfaceKey}
        listConfiguration={pageModel.plansList}
      />
      <HrBenefitsListSection
        title={hrBenefitsUiCopy.eligibilityRules.surfaceHeaderTitle}
        description="Eligibility by legal entity, location, employment type, grade, level, and tenure."
        surfaceKey={hrBenefitsEligibilityRulesSurfaceKey}
        listConfiguration={pageModel.eligibilityRulesList}
      />
      <HrBenefitsListSection
        title={hrBenefitsUiCopy.openEnrollment.surfaceHeaderTitle}
        description="Controlled open enrollment periods and linked plans."
        surfaceKey={hrBenefitsOpenEnrollmentSurfaceKey}
        listConfiguration={pageModel.openEnrollmentList}
      />
      <HrBenefitsListSection
        title={hrBenefitsUiCopy.enrollments.surfaceHeaderTitle}
        description="New hire, open enrollment, and life-event enrollments with coverage status."
        surfaceKey={hrBenefitsEnrollmentsSurfaceKey}
        listConfiguration={pageModel.enrollmentsList}
        TrailingCell={canWrite ? HrBenefitsEnrollmentsTrailingCell : undefined}
      />
      <HrBenefitsListSection
        title={hrBenefitsUiCopy.providers.surfaceHeaderTitle}
        description="Insurance carriers, benefit vendors, and plan administrators."
        surfaceKey={hrBenefitsProvidersSurfaceKey}
        listConfiguration={pageModel.providersList}
      />
      <SectionPanel
        headingLevel={2}
        title={hrBenefitsUiCopy.reports.sectionTitle}
        description={hrBenefitsUiCopy.reports.sectionDescription}
      >
        {!pageModel.canViewSensitive ? (
          <p className="type-muted mb-surface-md">
            {hrBenefitsUiCopy.sensitiveAccess.reportsDescription}
          </p>
        ) : null}
        <HrBenefitsReportsExportPanel />
      </SectionPanel>
      <HrBenefitsListSection
        title={hrBenefitsUiCopy.auditTrail.surfaceHeaderTitle}
        description="Enrollment, eligibility, waiver, approval, change, termination, and deduction audit history."
        surfaceKey={hrBenefitsAuditTrailSurfaceKey}
        listConfiguration={pageModel.auditTrailList}
      />
    </div>
  );
}
