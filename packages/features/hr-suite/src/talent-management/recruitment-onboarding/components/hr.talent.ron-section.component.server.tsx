import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type { HrRonPageModel } from "../data/hr.talent.ron.page-model.server";
import {
  hrRonApplicationsSurfaceKey,
  hrRonAuditTrailSurfaceKey,
  hrRonInterviewsSurfaceKey,
  hrRonOffersSurfaceKey,
  hrRonOnboardingTasksSurfaceKey,
  hrRonPostingsSurfaceKey,
  hrRonReadinessSurfaceKey,
  hrRonReportsSurfaceKey,
  hrRonRequisitionsSurfaceKey,
} from "../data/hr.talent.ron-search-params.parse.shared";
import { hrRonUiCopy } from "../surface/hr.talent.ron-ui.copy.shared";

const ronForbiddenState = {
  variant: "forbidden" as const,
  title: hrRonUiCopy.accessDenied.title,
  description: hrRonUiCopy.accessDenied.description,
};

function HrRonListSection({
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
      forbidden={ronForbiddenState}
      layout="embedded"
    />
  );
}

export function HrRonSection({ pageModel }: { pageModel: HrRonPageModel }) {
  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <HrRonListSection
        title={hrRonUiCopy.requisitions.surfaceHeaderTitle}
        description="Hiring requests, approval state, manager ownership, and budget references."
        surfaceKey={hrRonRequisitionsSurfaceKey}
        listConfiguration={pageModel.requisitionsList}
      />
      <HrRonListSection
        title={hrRonUiCopy.postings.surfaceHeaderTitle}
        description="Internal and external job postings with publishing targets."
        surfaceKey={hrRonPostingsSurfaceKey}
        listConfiguration={pageModel.postingsList}
      />
      <HrRonListSection
        title={hrRonUiCopy.applications.surfaceHeaderTitle}
        description="Candidate applications, sources, stages, and hiring status."
        surfaceKey={hrRonApplicationsSurfaceKey}
        listConfiguration={pageModel.applicationsList}
      />
      <HrRonListSection
        title={hrRonUiCopy.interviews.surfaceHeaderTitle}
        description="Interview schedules, panel assignments, and notification state."
        surfaceKey={hrRonInterviewsSurfaceKey}
        listConfiguration={pageModel.interviewsList}
      />
      <HrRonListSection
        title={hrRonUiCopy.offers.surfaceHeaderTitle}
        description="Offer proposals, salary terms, approval, and acceptance state."
        surfaceKey={hrRonOffersSurfaceKey}
        listConfiguration={pageModel.offersList}
      />
      <HrRonListSection
        title={hrRonUiCopy.onboardingTasks.surfaceHeaderTitle}
        description="Generated onboarding checklist tasks by owner and readiness impact."
        surfaceKey={hrRonOnboardingTasksSurfaceKey}
        listConfiguration={pageModel.onboardingTasksList}
      />
      <HrRonListSection
        title={hrRonUiCopy.readiness.surfaceHeaderTitle}
        description="Readiness for Employee Records, Payroll, IAM, Documents, and Lifecycle."
        surfaceKey={hrRonReadinessSurfaceKey}
        listConfiguration={pageModel.readinessList}
      />
      <HrRonListSection
        title={hrRonUiCopy.reports.surfaceHeaderTitle}
        description={`Grouped by ${pageModel.reportGroupBy.replaceAll("_", " ")}.`}
        surfaceKey={hrRonReportsSurfaceKey}
        listConfiguration={pageModel.reportsList}
      />
      {pageModel.auditTrailList ? (
        <HrRonListSection
          title={hrRonUiCopy.audit.surfaceHeaderTitle}
          description="Append-only recruitment and onboarding audit evidence."
          surfaceKey={hrRonAuditTrailSurfaceKey}
          listConfiguration={pageModel.auditTrailList}
        />
      ) : null}
    </div>
  );
}

export function HrRonAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrRonUiCopy.accessDenied.title}
      description={hrRonUiCopy.accessDenied.description}
    />
  );
}
