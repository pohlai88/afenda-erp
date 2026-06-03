import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type { HrPerformanceAppraisalsPageModel } from "./hr.talent.performance.page-model.server";
import {
  hrPerformanceAppraisalsApprovalsSurfaceKey,
  hrPerformanceAppraisalsAuditTrailSurfaceKey,
  hrPerformanceAppraisalsCyclesSurfaceKey,
  hrPerformanceAppraisalsGoalsSurfaceKey,
  hrPerformanceAppraisalsOutcomesSurfaceKey,
  hrPerformanceAppraisalsReportsSurfaceKey,
  hrPerformanceAppraisalsReviewsSurfaceKey,
} from "./hr.talent.performance-search-params.parse.shared";
import { hrPerformanceAppraisalsUiCopy } from "./hr.talent.performance-ui.copy.shared";

const performanceForbiddenState = {
  variant: "forbidden" as const,
  title: hrPerformanceAppraisalsUiCopy.accessDenied.title,
  description: hrPerformanceAppraisalsUiCopy.accessDenied.description,
};

function HrPerformanceListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: Parameters<typeof GovernedPatternCListSection>[0]["listConfiguration"];
}) {
  return (
    <GovernedPatternCListSection
      title={title}
      description={description}
      surfaceKey={surfaceKey}
      listConfiguration={listConfiguration}
      forbidden={performanceForbiddenState}
      layout="embedded"
    />
  );
}

export function HrPerformanceAppraisalsSection({
  pageModel,
}: {
  pageModel: HrPerformanceAppraisalsPageModel;
}) {
  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <HrPerformanceListSection
        title={hrPerformanceAppraisalsUiCopy.cycles.surfaceHeaderTitle}
        description="Review cycle setup, periods, deadlines, and eligible population."
        surfaceKey={hrPerformanceAppraisalsCyclesSurfaceKey}
        listConfiguration={pageModel.cyclesList}
      />
      <HrPerformanceListSection
        title={hrPerformanceAppraisalsUiCopy.reviews.surfaceHeaderTitle}
        description="Assigned employee reviews with workflow, meeting, and rating state."
        surfaceKey={hrPerformanceAppraisalsReviewsSurfaceKey}
        listConfiguration={pageModel.reviewsList}
      />
      <HrPerformanceListSection
        title={hrPerformanceAppraisalsUiCopy.goals.surfaceHeaderTitle}
        description="Weighted employee and manager goals with target achievement."
        surfaceKey={hrPerformanceAppraisalsGoalsSurfaceKey}
        listConfiguration={pageModel.goalsList}
      />
      <HrPerformanceListSection
        title={hrPerformanceAppraisalsUiCopy.approvals.surfaceHeaderTitle}
        description="Manager, HR, calibration, and final approval steps."
        surfaceKey={hrPerformanceAppraisalsApprovalsSurfaceKey}
        listConfiguration={pageModel.approvalsList}
      />
      <HrPerformanceListSection
        title={hrPerformanceAppraisalsUiCopy.outcomes.surfaceHeaderTitle}
        description="Authorized final ratings and outcome references for downstream planning."
        surfaceKey={hrPerformanceAppraisalsOutcomesSurfaceKey}
        listConfiguration={pageModel.outcomesList}
      />
      <HrPerformanceListSection
        title={hrPerformanceAppraisalsUiCopy.reports.surfaceHeaderTitle}
        description={`Grouped by ${pageModel.reportGroupBy.replaceAll("_", " ")}.`}
        surfaceKey={hrPerformanceAppraisalsReportsSurfaceKey}
        listConfiguration={pageModel.reportsList}
      />
      {pageModel.auditTrailList ? (
        <HrPerformanceListSection
          title={hrPerformanceAppraisalsUiCopy.audit.surfaceHeaderTitle}
          description="Append-only appraisal audit evidence."
          surfaceKey={hrPerformanceAppraisalsAuditTrailSurfaceKey}
          listConfiguration={pageModel.auditTrailList}
        />
      ) : null}
    </div>
  );
}

export function HrPerformanceAppraisalsAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrPerformanceAppraisalsUiCopy.accessDenied.title}
      description={hrPerformanceAppraisalsUiCopy.accessDenied.description}
    />
  );
}
