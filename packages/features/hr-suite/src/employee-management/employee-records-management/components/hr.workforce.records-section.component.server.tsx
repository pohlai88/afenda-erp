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

import type { HrRecordsPageModel } from "../data/hr.workforce.records.page-model.server";
import { hrRecordsAssignmentsSurfaceKey } from "../surface/hr.workforce.records-assignments-list.surface";
import { hrRecordsAuditTrailSurfaceKey } from "../surface/hr.workforce.records-audit-trail-list.surface";
import { hrRecordsDirectorySurfaceKey } from "../surface/hr.workforce.records-directory-list.surface";
import { hrRecordsDocumentReferencesSurfaceKey } from "../surface/hr.workforce.records-document-references-list.surface";
import { hrRecordsIncompleteSurfaceKey } from "../surface/hr.workforce.records-incomplete-list.surface";
import { hrRecordsOverviewStatSurfaceKey } from "../surface/hr.workforce.records-overview-stat.surface";
import { hrRecordsSeparatedSurfaceKey } from "../surface/hr.workforce.records-separated-list.surface";
import { hrRecordsStatusHistorySurfaceKey } from "../surface/hr.workforce.records-status-history-list.surface";
import { hrRecordsUiCopy } from "../surface/hr.workforce.records-ui.copy.shared";
import { HrRecordsCreateEmployeeForm } from "./hr.workforce.records-create-form.component.client";
import {
  HrRecordsDirectoryTrailingCell,
  HrRecordsSeparatedTrailingCell,
} from "./hr.workforce.records-list-trailing.component.client";

const recordsForbiddenState = {
  variant: "forbidden" as const,
  title: hrRecordsUiCopy.accessDenied.title,
  description: hrRecordsUiCopy.accessDenied.description,
};

function HrRecordsSensitiveAccessNotice({
  description,
}: {
  description: string;
}) {
  const copy = hrRecordsUiCopy.sensitiveAccess;

  return (
    <Alert>
      <AlertTitle>{copy.title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

function HrRecordsGovernedListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
  loadError,
  canWrite = false,
  canViewSensitive = false,
  TrailingCell,
  sensitiveAccessDescription,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: ListSurfaceRendererConfigurationInput;
  loadError?: EmptyState;
  canWrite?: boolean;
  canViewSensitive?: boolean;
  TrailingCell?: ComponentType<GovernedListTrailingCellProps>;
  sensitiveAccessDescription?: string;
}) {
  const effectiveWrite =
    canWrite && (canViewSensitive || sensitiveAccessDescription === undefined);

  return (
    <div className="flex flex-col gap-surface-md">
      {!canViewSensitive && sensitiveAccessDescription ? (
        <HrRecordsSensitiveAccessNotice
          description={sensitiveAccessDescription}
        />
      ) : null}
      <GovernedPatternCListSection
        title={title}
        description={description}
        surfaceKey={surfaceKey}
        listConfiguration={listConfiguration}
        loadError={loadError}
        parentAccessAllowed
        layout="embedded"
        forbidden={recordsForbiddenState}
        trailingColumn={
          effectiveWrite && TrailingCell && !loadError
            ? {
                header: hrRecordsUiCopy.trailing.actionsHeader,
                Cell: TrailingCell,
                context: { surfaceKey },
              }
            : undefined
        }
      />
    </div>
  );
}

export function HrRecordsWorkbenchSection({
  model,
}: {
  model: HrRecordsPageModel;
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
        title={copy.overview.statsTitle}
        description={copy.overview.statsDescription}
      >
        <GovernedPatternBStatSection
          title={copy.overview.statsTitle}
          surfaceKey={hrRecordsOverviewStatSurfaceKey}
          layout="embedded"
          statGroups={model.overviewStatGroups}
        />
      </SectionPanel>

      {model.canWrite ? (
        <SectionPanel
          title={copy.create.panelTitle}
          description={copy.create.panelDescription}
        >
          <HrRecordsCreateEmployeeForm />
        </SectionPanel>
      ) : null}

      <HrRecordsGovernedListSection
        title={copy.incomplete.sectionTitle}
        description={copy.incomplete.sectionDescription}
        surfaceKey={hrRecordsIncompleteSurfaceKey}
        listConfiguration={
          model.incompleteList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.incompleteLoadError}
      />

      <HrRecordsGovernedListSection
        title={copy.directory.sectionTitle}
        description={copy.directory.sectionDescription}
        surfaceKey={hrRecordsDirectorySurfaceKey}
        listConfiguration={
          model.directoryList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.directoryLoadError}
        canWrite={model.canWrite}
        canViewSensitive={model.canViewSensitive}
        sensitiveAccessDescription={copy.sensitiveAccess.directoryDescription}
        TrailingCell={HrRecordsDirectoryTrailingCell}
      />

      <HrRecordsGovernedListSection
        title={copy.separated.sectionTitle}
        description={copy.separated.sectionDescription}
        surfaceKey={hrRecordsSeparatedSurfaceKey}
        listConfiguration={
          model.separatedList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.separatedLoadError}
        canWrite={model.canWrite}
        canViewSensitive={model.canViewSensitive}
        TrailingCell={HrRecordsSeparatedTrailingCell}
      />

      <HrRecordsGovernedListSection
        title={copy.assignments.sectionTitle}
        description={copy.assignments.sectionDescription}
        surfaceKey={hrRecordsAssignmentsSurfaceKey}
        listConfiguration={
          model.assignmentsList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.assignmentsLoadError}
      />

      <HrRecordsGovernedListSection
        title={copy.statusHistory.sectionTitle}
        description={copy.statusHistory.sectionDescription}
        surfaceKey={hrRecordsStatusHistorySurfaceKey}
        listConfiguration={
          model.statusHistoryList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.statusHistoryLoadError}
      />

      <HrRecordsGovernedListSection
        title={copy.documentReferences.sectionTitle}
        description={copy.documentReferences.sectionDescription}
        surfaceKey={hrRecordsDocumentReferencesSurfaceKey}
        listConfiguration={
          model.documentReferencesList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.documentReferencesLoadError}
      />

      <HrRecordsGovernedListSection
        title={copy.auditTrail.sectionTitle}
        description={copy.auditTrail.sectionDescription}
        surfaceKey={hrRecordsAuditTrailSurfaceKey}
        listConfiguration={
          model.auditTrailList as ListSurfaceRendererConfigurationInput
        }
        loadError={model.auditTrailLoadError}
      />
    </div>
  );
}

export function HrRecordsAccessDeniedPanel() {
  const copy = hrRecordsUiCopy;

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
