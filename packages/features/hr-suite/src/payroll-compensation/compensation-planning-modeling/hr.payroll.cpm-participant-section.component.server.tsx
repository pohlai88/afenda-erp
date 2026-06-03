import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { Alert, AlertDescription, AlertTitle, SectionPanel } from "@afenda/ui";
import Link from "next/link";

import { hrCpmCycleDetailRoutePath } from "./hr.payroll.cpm-route.contract";
import type { HrCpmParticipantPageModel } from "./hr.payroll.cpm-participant.page-model.server";
import { hrCpmRecommendationsSurfaceKey } from "./hr.payroll.cpm-search-params.parse.shared";
import {
  hrCpmParticipantContextSurfaceKey,
  hrCpmSalaryBandSurfaceKey,
} from "./hr.payroll.cpm-surface-columns.shared";
import { hrCpmUiCopy } from "./hr.payroll.cpm-ui.copy.shared";
import { HrCpmRecommendationCreateForm } from "./hr.payroll.cpm-recommendation-form.component.client";
import { HrCpmRecommendationsTrailingCell } from "./hr.payroll.cpm-workflow-trailing.component.client";

const cpmForbiddenState = {
  variant: "forbidden" as const,
  title: hrCpmUiCopy.accessDenied.title,
  description: hrCpmUiCopy.accessDenied.description,
};

export function HrCpmParticipantPlanningSection({
  pageModel,
}: {
  pageModel: HrCpmParticipantPageModel;
}) {
  const copy = hrCpmUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={pageModel.participant.employeeLabel}
        description={`${pageModel.cycle.code} — ${pageModel.cycle.name}`}
        aside={
          <Link
            className="type-muted hover:text-foreground"
            href={hrCpmCycleDetailRoutePath(pageModel.cycle.id)}
          >
            {copy.participantDetail.backLabel}
          </Link>
        }
      />

      {pageModel.participant.eligibilityStatus !== "eligible" ? (
        <Alert>
          <AlertTitle>Participant eligibility</AlertTitle>
          <AlertDescription>
            This employee is marked {pageModel.participant.eligibilityStatus}.
            Recommendations may require exception handling.
          </AlertDescription>
        </Alert>
      ) : null}

      <SectionPanel
        title={copy.participantContext.sectionTitle}
        description={copy.participantContext.sectionDescription}
      >
        <GovernedPatternBStatSection
          title={copy.participantContext.sectionTitle}
          surfaceKey={hrCpmParticipantContextSurfaceKey}
          layout="embedded"
          statGroups={pageModel.participantContextStatGroups}
        />
      </SectionPanel>

      <SectionPanel
        title={copy.salaryBand.sectionTitle}
        description={copy.salaryBand.sectionDescription}
      >
        {!pageModel.salaryBand ? (
          <Alert>
            <AlertTitle>{copy.salaryBand.notConfiguredTitle}</AlertTitle>
            <AlertDescription>
              {copy.salaryBand.notConfiguredDescription}
            </AlertDescription>
          </Alert>
        ) : null}
        <GovernedPatternBStatSection
          title={copy.salaryBand.sectionTitle}
          surfaceKey={hrCpmSalaryBandSurfaceKey}
          layout="embedded"
          statGroups={pageModel.salaryBandStatGroups}
        />
      </SectionPanel>

      {pageModel.canWrite ? (
        <SectionPanel
          title={copy.recommendationForm.title}
          description={copy.recommendationForm.description}
        >
          <HrCpmRecommendationCreateForm
            cycleId={pageModel.cycle.id}
            participantId={pageModel.participant.participantId}
            employeeId={pageModel.participant.employeeId}
            currentSalary={pageModel.participant.currentSalary ?? 0}
            budgetPoolId={pageModel.participant.budgetPoolId}
            grade={pageModel.participant.currentGrade}
            legalEntityCode={pageModel.participant.legalEntityCode}
            canWrite={pageModel.canWrite}
          />
        </SectionPanel>
      ) : null}

      <SectionPanel
        title={copy.participantDetail.recommendationsTitle}
        description={copy.participantDetail.recommendationsDescription}
      >
        <GovernedPatternCListSection
          title={copy.participantDetail.recommendationsTitle}
          description={copy.participantDetail.recommendationsDescription}
          surfaceKey={hrCpmRecommendationsSurfaceKey}
          listConfiguration={pageModel.recommendationsList}
          forbidden={cpmForbiddenState}
          layout="embedded"
          trailingColumn={
            pageModel.canWrite || pageModel.canApprove
              ? {
                  header: copy.recommendations.trailingActionsHeader,
                  Cell: HrCpmRecommendationsTrailingCell,
                }
              : undefined
          }
        />
      </SectionPanel>
    </div>
  );
}
