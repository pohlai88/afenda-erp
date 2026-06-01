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

import type { HrDocumentsPageModel } from "../data/hr.workforce.documents.page-model.server";
import {
  hrDocumentsRepositorySurfaceKey,
  hrDocumentsRequirementsSurfaceKey,
  hrDocumentsMissingSurfaceKey,
  hrDocumentsExpiringSurfaceKey,
  hrDocumentsRetentionSurfaceKey,
  hrDocumentsAuditTrailSurfaceKey,
  hrDocumentsAcknowledgmentsSurfaceKey,
} from "../surface/hr.workforce.documents-surface-metadata.shared";
import { hrDocumentsOverviewStatSurfaceKey } from "../surface/hr.workforce.documents-overview-stat.surface";
import { hrDocumentsUiCopy } from "../surface/hr.workforce.documents-ui.copy.shared";
import {
  HrDocumentsRegisterForm,
  HrDocumentsRequirementUpsertForm,
  HrDocumentsRetentionPolicyForm,
  HrDocumentsAcknowledgmentForm,
} from "./hr.workforce.documents-forms.component.client";
import { HrDocumentsRepositoryTrailingCell } from "./hr.workforce.documents-list-trailing.component.client";

const documentsForbiddenState = {
  variant: "forbidden" as const,
  title: hrDocumentsUiCopy.accessDenied.title,
  description: hrDocumentsUiCopy.accessDenied.description,
};

function HrDocumentsSensitiveAccessNotice({
  description,
}: {
  description: string;
}) {
  const copy = hrDocumentsUiCopy.sensitiveAccess;

  return (
    <Alert>
      <AlertTitle>{copy.title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

function HrDocumentsReadOnlyGovernedListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
  loadError,
  canViewSensitive = false,
  sensitiveAccessDescription,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: ListSurfaceRendererConfigurationInput;
  loadError?: EmptyState;
  canViewSensitive?: boolean;
  sensitiveAccessDescription?: string;
}) {
  return (
    <div className="flex flex-col gap-surface-md">
      {!canViewSensitive && sensitiveAccessDescription ? (
        <HrDocumentsSensitiveAccessNotice
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
        forbidden={documentsForbiddenState}
      />
    </div>
  );
}

function HrDocumentsGovernedListSection({
  canWrite,
  canViewSensitive = false,
  title,
  description,
  surfaceKey,
  listConfiguration,
  loadError,
  actionsHeader,
  TrailingCell,
  sensitiveAccessDescription,
}: {
  canWrite: boolean;
  canViewSensitive?: boolean;
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: ListSurfaceRendererConfigurationInput;
  loadError?: EmptyState;
  actionsHeader: string;
  TrailingCell: ComponentType<GovernedListTrailingCellProps>;
  sensitiveAccessDescription?: string;
}) {
  return (
    <div className="flex flex-col gap-surface-md">
      {!canViewSensitive && sensitiveAccessDescription ? (
        <HrDocumentsSensitiveAccessNotice
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
        forbidden={documentsForbiddenState}
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
    </div>
  );
}

export function HrDocumentsAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={1}
      title={hrDocumentsUiCopy.accessDenied.title}
      description={hrDocumentsUiCopy.accessDenied.description}
    >
      <p className="type-muted">{documentsForbiddenState.description}</p>
    </SectionPanel>
  );
}

export function HrDocumentsWorkbenchSection({
  model,
}: {
  model: HrDocumentsPageModel;
}) {
  const copy = hrDocumentsUiCopy;

  return (
    <div className="flex flex-col gap-surface-xl">
        <SectionPanel
          headingLevel={1}
          title={copy.page.title}
          description={copy.page.description}
        />

        <SectionPanel
          title={copy.overview.sectionTitle}
          description={copy.overview.sectionDescription}
        >
          <GovernedPatternBStatSection
            title={copy.overview.sectionTitle}
            surfaceKey={hrDocumentsOverviewStatSurfaceKey}
            layout="embedded"
            loadError={model.overviewLoadError}
            statGroups={model.overviewStatGroups}
          />
        </SectionPanel>

        {model.canWrite ? (
          <SectionPanel
            title={copy.repository.sectionTitle}
            description={copy.repository.registerPanelDescription}
          >
            <HrDocumentsRegisterForm
              employeeOptions={model.employeePickerOptions}
            />
          </SectionPanel>
        ) : null}

        <HrDocumentsGovernedListSection
          canWrite={model.canWrite}
          canViewSensitive={model.canViewSensitive}
          title={copy.repository.sectionTitle}
          description={copy.repository.sectionDescription}
          surfaceKey={hrDocumentsRepositorySurfaceKey}
          listConfiguration={model.repositoryList}
          loadError={model.repositoryLoadError}
          actionsHeader={copy.repository.colActions}
          TrailingCell={HrDocumentsRepositoryTrailingCell}
          sensitiveAccessDescription={copy.sensitiveAccess.repositoryDescription}
        />

        {model.canWrite ? (
          <SectionPanel
            title={copy.requirements.sectionTitle}
            description={copy.requirements.upsertPanelDescription}
          >
            <HrDocumentsRequirementUpsertForm />
          </SectionPanel>
        ) : null}

        <HrDocumentsReadOnlyGovernedListSection
          title={copy.requirements.sectionTitle}
          description={copy.requirements.sectionDescription}
          surfaceKey={hrDocumentsRequirementsSurfaceKey}
          listConfiguration={model.requirementsList}
          loadError={model.requirementsLoadError}
        />

        <HrDocumentsReadOnlyGovernedListSection
          title={copy.missing.sectionTitle}
          description={copy.missing.sectionDescription}
          surfaceKey={hrDocumentsMissingSurfaceKey}
          listConfiguration={model.missingList}
          loadError={model.missingLoadError}
        />

        <HrDocumentsReadOnlyGovernedListSection
          canViewSensitive={model.canViewSensitive}
          title={copy.expiring.sectionTitle}
          description={copy.expiring.sectionDescription}
          surfaceKey={hrDocumentsExpiringSurfaceKey}
          listConfiguration={model.expiringList}
          loadError={model.expiringLoadError}
          sensitiveAccessDescription={copy.sensitiveAccess.repositoryDescription}
        />

        {model.canWrite ? (
          <SectionPanel
            title={copy.retention.sectionTitle}
            description={copy.retention.upsertPanelDescription}
          >
            <HrDocumentsRetentionPolicyForm />
          </SectionPanel>
        ) : null}

        <HrDocumentsReadOnlyGovernedListSection
          title={copy.retention.sectionTitle}
          description={copy.retention.sectionDescription}
          surfaceKey={hrDocumentsRetentionSurfaceKey}
          listConfiguration={model.retentionList}
          loadError={model.retentionLoadError}
        />

        <HrDocumentsReadOnlyGovernedListSection
          title={copy.auditTrail.sectionTitle}
          description={copy.auditTrail.sectionDescription}
          surfaceKey={hrDocumentsAuditTrailSurfaceKey}
          listConfiguration={model.auditTrailList}
          loadError={model.auditTrailLoadError}
        />

        {model.canWrite ? (
          <SectionPanel
            title={copy.acknowledgments.sectionTitle}
            description={copy.acknowledgments.recordPanelDescription}
          >
            <HrDocumentsAcknowledgmentForm
              employeeOptions={model.employeePickerOptions}
            />
          </SectionPanel>
        ) : null}

        <HrDocumentsReadOnlyGovernedListSection
          title={copy.acknowledgments.sectionTitle}
          description={copy.acknowledgments.sectionDescription}
          surfaceKey={hrDocumentsAcknowledgmentsSurfaceKey}
          listConfiguration={model.acknowledgmentsList}
          loadError={model.acknowledgmentsLoadError}
        />
      </div>
  );
}
