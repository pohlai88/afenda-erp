import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import type {
  EmptyState,
  ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface/schemas";
import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";
import { SectionPanel } from "@afenda/ui";
import type { ComponentType } from "react";
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client";

import type { HrLifecyclePageModel } from "./hr.workforce.lifecycle.page-model.server";
import { hrLifecycleAuditTrailSurfaceKey } from "./hr.workforce.lifecycle-audit-trail-list.surface";
import { hrLifecycleOverviewSurfaceKey } from "./hr.workforce.lifecycle-overview-list.surface";
import { hrLifecyclePendingTransitionsSurfaceKey } from "./hr.workforce.lifecycle-pending-transitions-list.surface";
import { hrLifecycleProbationDueSurfaceKey } from "./hr.workforce.lifecycle-probation-due-list.surface";
import { hrLifecycleContractReviewsSurfaceKey } from "./hr.workforce.lifecycle-contract-reviews-list.surface";
import { hrLifecycleOnboardingCasesSurfaceKey } from "./hr.workforce.lifecycle-onboarding-cases-list.surface";
import { hrLifecycleNoticePeriodSurfaceKey } from "./hr.workforce.lifecycle-notice-period-list.surface";
import { hrLifecycleOffboardingCasesSurfaceKey } from "./hr.workforce.lifecycle-offboarding-cases-list.surface";
import { hrLifecycleOverviewStatSurfaceKey } from "./hr.workforce.lifecycle-overview-stat.surface";
import { hrLifecycleUiCopy } from "./hr.workforce.lifecycle-ui.copy.shared";
import { HrLifecycleExitPanel } from "./hr.workforce.lifecycle-exit-panel.component.client";
import { HrLifecycleMovementPanel } from "./hr.workforce.lifecycle-movement-panel.component.client";
import {
  HrLifecycleNoticePeriodTrailingCell,
  HrLifecycleOverviewTrailingCell,
  HrLifecyclePendingTransitionsTrailingCell,
  HrLifecycleProbationDueTrailingCell,
  HrLifecycleContractReviewsTrailingCell,
} from "./hr.workforce.lifecycle-list-trailing.component.client";

const lifecycleForbiddenState = {
  variant: "forbidden" as const,
  title: hrLifecycleUiCopy.accessDenied.title,
  description: hrLifecycleUiCopy.accessDenied.description,
};

function HrLifecycleGovernedListSection({
  canWrite,
  title,
  description,
  surfaceKey,
  listConfiguration,
  loadError,
  actionsHeader,
  TrailingCell,
}: {
  canWrite: boolean;
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: ListSurfaceRendererConfigurationInput;
  loadError?: EmptyState;
  actionsHeader: string;
  TrailingCell: ComponentType<GovernedListTrailingCellProps>;
}) {
  return (
    <GovernedPatternCListSection
      title={title}
      description={description}
      surfaceKey={surfaceKey}
      listConfiguration={listConfiguration}
      loadError={loadError}
      parentAccessAllowed
      layout="embedded"
      forbidden={lifecycleForbiddenState}
      trailingColumn={
        canWrite && !loadError
          ? {
              header: actionsHeader,
              Cell: TrailingCell,
              context: { surfaceKey },
            }
          : undefined
      }
    />
  );
}

function HrLifecycleReadOnlyListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
  loadError,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: ListSurfaceRendererConfigurationInput;
  loadError?: EmptyState;
}) {
  return (
    <GovernedPatternCListSection
      title={title}
      description={description}
      surfaceKey={surfaceKey}
      listConfiguration={listConfiguration}
      loadError={loadError}
      parentAccessAllowed
      layout="embedded"
      forbidden={lifecycleForbiddenState}
    />
  );
}

export function HrLifecycleWorkbenchSection({
  model,
}: {
  model: HrLifecyclePageModel;
}) {
  const copy = model.copy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />

      <SectionPanel
        title={copy.overview.statsTitle}
        description={copy.overview.statsDescription}
      >
        <GovernedPatternBStatSection
          title={copy.overview.statsTitle}
          surfaceKey={hrLifecycleOverviewStatSurfaceKey}
          layout="embedded"
          statGroups={model.overviewStatGroups}
        />
      </SectionPanel>

      <HrLifecycleGovernedListSection
        canWrite={model.canWrite}
        title={copy.pendingTransitions.sectionTitle}
        description={copy.pendingTransitions.sectionDescription}
        surfaceKey={hrLifecyclePendingTransitionsSurfaceKey}
        listConfiguration={
          model.pendingTransitionsList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.pendingTransitionsLoadError}
        actionsHeader={copy.pendingTransitions.trailingCancelLabel}
        TrailingCell={HrLifecyclePendingTransitionsTrailingCell}
      />

      <HrLifecycleGovernedListSection
        canWrite={model.canWrite}
        title={copy.probationDue.sectionTitle}
        description={copy.probationDue.sectionDescription}
        surfaceKey={hrLifecycleProbationDueSurfaceKey}
        listConfiguration={
          model.probationDueList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.probationDueLoadError}
        actionsHeader={copy.probationDue.trailingOutcomeLabel}
        TrailingCell={HrLifecycleProbationDueTrailingCell}
      />

      <HrLifecycleGovernedListSection
        canWrite={model.canWrite}
        title={copy.contractReviews.sectionTitle}
        description={copy.contractReviews.sectionDescription}
        surfaceKey={hrLifecycleContractReviewsSurfaceKey}
        listConfiguration={
          model.contractReviewsList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.contractReviewsLoadError}
        actionsHeader={copy.contractReviews.trailingRenewLabel}
        TrailingCell={HrLifecycleContractReviewsTrailingCell}
      />

      <HrLifecycleReadOnlyListSection
        title={copy.onboardingCases.sectionTitle}
        description={copy.onboardingCases.sectionDescription}
        surfaceKey={hrLifecycleOnboardingCasesSurfaceKey}
        listConfiguration={
          model.onboardingCasesList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.onboardingCasesLoadError}
      />

      <HrLifecycleGovernedListSection
        canWrite={model.canWrite}
        title={copy.noticePeriod.sectionTitle}
        description={copy.noticePeriod.sectionDescription}
        surfaceKey={hrLifecycleNoticePeriodSurfaceKey}
        listConfiguration={
          model.noticePeriodList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.noticePeriodLoadError}
        actionsHeader={copy.noticePeriod.trailingStartOffboarding}
        TrailingCell={HrLifecycleNoticePeriodTrailingCell}
      />

      <HrLifecycleReadOnlyListSection
        title={copy.offboardingCases.sectionTitle}
        description={copy.offboardingCases.sectionDescription}
        surfaceKey={hrLifecycleOffboardingCasesSurfaceKey}
        listConfiguration={
          model.offboardingCasesList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.offboardingCasesLoadError}
      />

      {model.canWrite ? (
        <SectionPanel
          title={copy.exit.panelTitle}
          description={copy.exit.panelDescription}
        >
          <HrLifecycleExitPanel />
        </SectionPanel>
      ) : null}

      {model.canWrite ? (
        <SectionPanel
          title={copy.movement.panelTitle}
          description={copy.movement.panelDescription}
        >
          <HrLifecycleMovementPanel />
        </SectionPanel>
      ) : null}

      <HrLifecycleGovernedListSection
        canWrite={model.canWrite}
        title={copy.overview.rosterTitle}
        description={copy.overview.rosterDescription}
        surfaceKey={hrLifecycleOverviewSurfaceKey}
        listConfiguration={
          model.overviewList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.overviewLoadError}
        actionsHeader={copy.overview.trailingScheduleLabel}
        TrailingCell={HrLifecycleOverviewTrailingCell}
      />

      <GovernedPatternCListSection
        title={copy.auditTrail.sectionTitle}
        description={copy.auditTrail.sectionDescription}
        surfaceKey={hrLifecycleAuditTrailSurfaceKey}
        listConfiguration={
          model.auditTrailList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.auditTrailLoadError}
        parentAccessAllowed
        layout="embedded"
        forbidden={lifecycleForbiddenState}
      />
    </div>
  );
}

export function HrLifecycleAccessDeniedPanel() {
  const copy = hrLifecycleUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />
      <Alert variant="destructive">
        <AlertTitle>{copy.accessDenied.title}</AlertTitle>
        <AlertDescription>{copy.accessDenied.description}</AlertDescription>
      </Alert>
    </div>
  );
}
