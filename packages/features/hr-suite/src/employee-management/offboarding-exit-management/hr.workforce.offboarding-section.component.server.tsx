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
import Link from "next/link";
import type { HrOffboardingPageModel } from "./hr.workforce.offboarding.page-model.server";
import { hrLifecycleRoutePaths } from "../employee-lifecycle-management/hr.workforce.lifecycle-route.contract";
import { hrOffboardingApprovalsSurfaceKey } from "./hr.workforce.offboarding-approvals-list.surface";
import { hrOffboardingAssetsSurfaceKey } from "./hr.workforce.offboarding-assets-list.surface";
import { hrOffboardingAuditTrailSurfaceKey } from "./hr.workforce.offboarding-audit-trail-list.surface";
import { hrOffboardingCasesSurfaceKey } from "./hr.workforce.offboarding-cases-list.surface";
import { hrOffboardingClearanceSurfaceKey } from "./hr.workforce.offboarding-clearance-list.surface";
import { hrOffboardingOverdueSurfaceKey } from "./hr.workforce.offboarding-overdue-list.surface";
import { hrOffboardingOverviewStatSurfaceKey } from "./hr.workforce.offboarding-overview-stat.surface";
import { hrOffboardingSettlementSurfaceKey } from "./hr.workforce.offboarding-settlement-list.surface";
import { hrOffboardingUiCopy } from "./hr.workforce.offboarding-ui.copy.shared";
import { HrOffboardingInitiatePanel } from "./hr.workforce.offboarding-forms.component.client";
import { HrOffboardingListTrailingCell } from "./hr.workforce.offboarding-list-trailing.component.client";

const offboardingForbiddenState = {
  variant: "forbidden" as const,
  title: hrOffboardingUiCopy.accessDenied.title,
  description: hrOffboardingUiCopy.accessDenied.description,
};

function HrOffboardingGovernedListSection({
  canWrite,
  title,
  description,
  surfaceKey,
  listConfiguration,
  loadError,
  withTrailing,
}: {
  canWrite: boolean;
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: ListSurfaceRendererConfigurationInput;
  loadError?: EmptyState;
  withTrailing?: boolean;
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
      forbidden={offboardingForbiddenState}
      trailingColumn={
        canWrite && withTrailing && !loadError
          ? {
              header: hrOffboardingUiCopy.trailing.actionsHeader,
              Cell: HrOffboardingListTrailingCell,
              context: { surfaceKey },
            }
          : undefined
      }
    />
  );
}

function HrOffboardingReadOnlyListSection({
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
      forbidden={offboardingForbiddenState}
    />
  );
}

export function HrOffboardingWorkbenchSection({
  model,
}: {
  model: HrOffboardingPageModel;
}) {
  const copy = model.copy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />

      {!model.canViewSensitive ? (
        <Alert>
          <AlertTitle>{copy.sensitiveAccess.title}</AlertTitle>
          <AlertDescription>{copy.sensitiveAccess.description}</AlertDescription>
        </Alert>
      ) : null}

      <SectionPanel
        title={copy.overview.postureTitle}
        description={copy.overview.clearanceTitle}
      >
        <GovernedPatternBStatSection
          title={copy.overview.postureTitle}
          surfaceKey={hrOffboardingOverviewStatSurfaceKey}
          layout="embedded"
          statGroups={model.overviewStatGroups}
        />
      </SectionPanel>

      {model.canWrite ? (
        <HrOffboardingInitiatePanel employeeOptions={model.employeeOptions} />
      ) : null}

      <SectionPanel
        title="Lifecycle workbench"
        description="Initiate notice period or stage changes before starting exit execution here."
      >
        <Link
          href={hrLifecycleRoutePaths.lifecycle}
          className="type-control font-medium underline-offset-4 hover:underline"
        >
          Open lifecycle workbench
        </Link>
      </SectionPanel>

      <HrOffboardingGovernedListSection
        canWrite={model.canWrite}
        title={copy.cases.sectionTitle}
        description={copy.cases.emptyDescription}
        surfaceKey={hrOffboardingCasesSurfaceKey}
        listConfiguration={
          model.casesList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.casesLoadError}
        withTrailing
      />

      <HrOffboardingGovernedListSection
        canWrite={model.canWrite}
        title={copy.clearance.sectionTitle}
        description={copy.clearance.emptyDescription}
        surfaceKey={hrOffboardingClearanceSurfaceKey}
        listConfiguration={
          model.clearanceList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.clearanceLoadError}
        withTrailing
      />

      <HrOffboardingGovernedListSection
        canWrite={model.canWrite}
        title={copy.approvals.sectionTitle}
        description={copy.approvals.emptyDescription}
        surfaceKey={hrOffboardingApprovalsSurfaceKey}
        listConfiguration={
          model.approvalsList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.approvalsLoadError}
        withTrailing
      />

      <HrOffboardingGovernedListSection
        canWrite={model.canWrite}
        title={copy.assets.sectionTitle}
        description={copy.assets.emptyDescription}
        surfaceKey={hrOffboardingAssetsSurfaceKey}
        listConfiguration={
          model.assetsList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.assetsLoadError}
        withTrailing
      />

      <HrOffboardingReadOnlyListSection
        title={copy.settlement.sectionTitle}
        description={copy.settlement.emptyDescription}
        surfaceKey={hrOffboardingSettlementSurfaceKey}
        listConfiguration={
          model.settlementList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.settlementLoadError}
      />

      <HrOffboardingReadOnlyListSection
        title={copy.overdue.sectionTitle}
        description={copy.overdue.emptyDescription}
        surfaceKey={hrOffboardingOverdueSurfaceKey}
        listConfiguration={
          model.overdueList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.overdueLoadError}
      />

      <HrOffboardingReadOnlyListSection
        title={copy.auditTrail.sectionTitle}
        description={copy.auditTrail.emptyDescription}
        surfaceKey={hrOffboardingAuditTrailSurfaceKey}
        listConfiguration={
          model.auditTrailList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.auditTrailLoadError}
      />
    </div>
  );
}

export function HrOffboardingAccessDeniedPanel() {
  const copy = hrOffboardingUiCopy;

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
