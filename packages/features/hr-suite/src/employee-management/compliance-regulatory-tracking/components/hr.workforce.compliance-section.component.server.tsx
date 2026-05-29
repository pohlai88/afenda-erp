import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import type {
  EmptyState,
  ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface/schemas";
import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";
import { SectionPanel } from "@afenda/ui";
import type { ComponentType } from "react";
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client";

import type { HrCompliancePageModel } from "../data/hr.workforce.compliance.page-model.server";
import {
  hrComplianceAlertsSurfaceKey,
  hrComplianceExceptionsSurfaceKey,
  hrComplianceFilingsSurfaceKey,
  hrComplianceLaborLawRequirementsSurfaceKey,
  hrComplianceObligationsSurfaceKey,
  hrCompliancePolicyAcknowledgementsSurfaceKey,
  hrComplianceRegulatoryCalendarSurfaceKey,
  hrComplianceSafetyTrainingRequirementsSurfaceKey,
  hrComplianceWorkAuthDocumentsSurfaceKey,
  hrComplianceWorkEligibilitySurfaceKey,
  hrComplianceWorkplaceSafetyRequirementsSurfaceKey,
} from "../surface/hr.workforce.compliance-surface-metadata.shared";
import { hrComplianceUiCopy } from "../surface/hr.workforce.compliance-ui.copy.shared";
import {
  HrComplianceExceptionCreateForm,
  HrComplianceFilingSyncForm,
  HrComplianceLaborLawSyncForm,
  HrComplianceObligationUpsertForm,
  HrCompliancePolicyAcknowledgementSyncForm,
  HrComplianceSafetyTrainingSyncForm,
  HrComplianceWorkAuthDocumentsEnsureForm,
  HrComplianceWorkEligibilityEnsureForm,
  HrComplianceWorkplaceSafetySyncForm,
} from "./hr.workforce.compliance-forms.component.client";
import {
  HrComplianceExceptionsTrailingCell,
  HrComplianceFilingsTrailingCell,
  HrComplianceLaborLawRequirementsTrailingCell,
  HrComplianceObligationsTrailingCell,
  HrCompliancePolicyAcknowledgementsTrailingCell,
  HrComplianceSafetyTrainingRequirementsTrailingCell,
  HrComplianceWorkAuthDocumentsTrailingCell,
  HrComplianceWorkEligibilityTrailingCell,
  HrComplianceWorkplaceSafetyRequirementsTrailingCell,
} from "./hr.workforce.compliance-list-trailing.component.client";

const complianceForbiddenState = {
  variant: "forbidden" as const,
  title: hrComplianceUiCopy.accessDenied.title,
  description: hrComplianceUiCopy.accessDenied.description,
};

function HrComplianceGovernedListSection({
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
      forbidden={complianceForbiddenState}
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

function HrComplianceReadOnlyGovernedListSection({
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
      forbidden={complianceForbiddenState}
    />
  );
}

export function HrComplianceWorkbenchSection({
  model,
}: {
  model: HrCompliancePageModel;
}) {
  const copy = hrComplianceUiCopy;
  const departments = model.departments;

  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />

      {model.canWrite ? (
        <SectionPanel
          title={copy.obligations.registerTitle}
          description={copy.obligations.registerDescription}
        >
          <HrComplianceObligationUpsertForm departments={departments} />
        </SectionPanel>
      ) : null}

      <HrComplianceReadOnlyGovernedListSection
        title={copy.alerts.sectionTitle}
        description={
          model.alertsMergeTruncated
            ? `${copy.alerts.sectionDescription} ${copy.alerts.mergeTruncatedNotice}`
            : copy.alerts.sectionDescription
        }
        surfaceKey={hrComplianceAlertsSurfaceKey}
        listConfiguration={model.alertsList}
        loadError={model.alertsLoadError}
      />

      <HrComplianceGovernedListSection
        canWrite={model.canWrite}
        title={copy.obligations.sectionTitle}
        description={copy.obligations.sectionDescription}
        surfaceKey={hrComplianceObligationsSurfaceKey}
        listConfiguration={model.obligationsList}
        loadError={model.obligationsLoadError}
        actionsHeader={copy.obligations.colActions}
        TrailingCell={HrComplianceObligationsTrailingCell}
      />

      {model.canWrite ? (
        <SectionPanel
          title={copy.filing.syncTitle}
          description={copy.filing.syncDescription}
        >
          <HrComplianceFilingSyncForm />
        </SectionPanel>
      ) : null}

      <HrComplianceGovernedListSection
        canWrite={model.canWrite}
        title={copy.filing.sectionTitle}
        description={copy.filing.sectionDescription}
        surfaceKey={hrComplianceFilingsSurfaceKey}
        listConfiguration={model.filingsList}
        loadError={model.filingsLoadError}
        actionsHeader={copy.filing.colActions}
        TrailingCell={HrComplianceFilingsTrailingCell}
      />

      <HrComplianceReadOnlyGovernedListSection
        title={copy.regulatoryCalendar.sectionTitle}
        description={
          model.regulatoryCalendarMergeTruncated
            ? `${copy.regulatoryCalendar.sectionDescription} ${copy.regulatoryCalendar.mergeTruncatedNotice}`
            : copy.regulatoryCalendar.sectionDescription
        }
        surfaceKey={hrComplianceRegulatoryCalendarSurfaceKey}
        listConfiguration={model.regulatoryCalendarList}
        loadError={model.regulatoryCalendarLoadError}
      />

      {model.canWrite ? (
        <SectionPanel
          title={copy.policyAcknowledgement.syncTitle}
          description={copy.policyAcknowledgement.syncDescription}
        >
          <HrCompliancePolicyAcknowledgementSyncForm />
        </SectionPanel>
      ) : null}

      <HrComplianceGovernedListSection
        canWrite={model.canWrite}
        title={copy.policyAcknowledgement.sectionTitle}
        description={copy.policyAcknowledgement.sectionDescription}
        surfaceKey={hrCompliancePolicyAcknowledgementsSurfaceKey}
        listConfiguration={model.policyAcknowledgementsList}
        loadError={model.policyAcknowledgementsLoadError}
        actionsHeader={copy.policyAcknowledgement.colActions}
        TrailingCell={HrCompliancePolicyAcknowledgementsTrailingCell}
      />

      {model.canWrite ? (
        <SectionPanel
          title={copy.laborLaw.syncTitle}
          description={copy.laborLaw.syncDescription}
        >
          <HrComplianceLaborLawSyncForm />
        </SectionPanel>
      ) : null}

      <HrComplianceGovernedListSection
        canWrite={model.canWrite}
        title={copy.laborLaw.sectionTitle}
        description={copy.laborLaw.sectionDescription}
        surfaceKey={hrComplianceLaborLawRequirementsSurfaceKey}
        listConfiguration={model.laborLawRequirementsList}
        loadError={model.laborLawRequirementsLoadError}
        actionsHeader={copy.laborLaw.colActions}
        TrailingCell={HrComplianceLaborLawRequirementsTrailingCell}
      />

      {model.canWrite ? (
        <SectionPanel
          title={copy.safetyTraining.syncTitle}
          description={copy.safetyTraining.syncDescription}
        >
          <HrComplianceSafetyTrainingSyncForm />
        </SectionPanel>
      ) : null}

      <HrComplianceGovernedListSection
        canWrite={model.canWrite}
        title={copy.safetyTraining.sectionTitle}
        description={copy.safetyTraining.sectionDescription}
        surfaceKey={hrComplianceSafetyTrainingRequirementsSurfaceKey}
        listConfiguration={model.safetyTrainingRequirementsList}
        loadError={model.safetyTrainingRequirementsLoadError}
        actionsHeader={copy.safetyTraining.colActions}
        TrailingCell={HrComplianceSafetyTrainingRequirementsTrailingCell}
      />

      {model.canWrite ? (
        <SectionPanel
          title={copy.workplaceSafety.syncTitle}
          description={copy.workplaceSafety.syncDescription}
        >
          <HrComplianceWorkplaceSafetySyncForm />
        </SectionPanel>
      ) : null}

      <HrComplianceGovernedListSection
        canWrite={model.canWrite}
        title={copy.workplaceSafety.sectionTitle}
        description={copy.workplaceSafety.sectionDescription}
        surfaceKey={hrComplianceWorkplaceSafetyRequirementsSurfaceKey}
        listConfiguration={model.workplaceSafetyRequirementsList}
        loadError={model.workplaceSafetyRequirementsLoadError}
        actionsHeader={copy.workplaceSafety.colActions}
        TrailingCell={HrComplianceWorkplaceSafetyRequirementsTrailingCell}
      />

      {model.canWrite ? (
        <SectionPanel
          title={copy.workEligibility.ensureTitle}
          description={copy.workEligibility.ensureDescription}
        >
          <HrComplianceWorkEligibilityEnsureForm />
        </SectionPanel>
      ) : null}

      <HrComplianceGovernedListSection
        canWrite={model.canWrite}
        title={copy.workEligibility.sectionTitle}
        description={copy.workEligibility.sectionDescription}
        surfaceKey={hrComplianceWorkEligibilitySurfaceKey}
        listConfiguration={model.workEligibilityList}
        loadError={model.workEligibilityLoadError}
        actionsHeader={copy.workEligibility.colActions}
        TrailingCell={HrComplianceWorkEligibilityTrailingCell}
      />

      {model.canWrite ? (
        <SectionPanel
          title={copy.workAuthDocuments.ensureTitle}
          description={copy.workAuthDocuments.ensureDescription}
        >
          <HrComplianceWorkAuthDocumentsEnsureForm />
        </SectionPanel>
      ) : null}

      <HrComplianceGovernedListSection
        canWrite={model.canWrite}
        title={copy.workAuthDocuments.sectionTitle}
        description={copy.workAuthDocuments.sectionDescription}
        surfaceKey={hrComplianceWorkAuthDocumentsSurfaceKey}
        listConfiguration={model.workAuthDocumentsList}
        loadError={model.workAuthDocumentsLoadError}
        actionsHeader={copy.workAuthDocuments.colActions}
        TrailingCell={HrComplianceWorkAuthDocumentsTrailingCell}
      />

      {model.canWrite ? (
        <SectionPanel
          title={copy.exceptions.createTitle}
          description={copy.exceptions.createDescription}
        >
          <HrComplianceExceptionCreateForm />
        </SectionPanel>
      ) : null}

      <HrComplianceGovernedListSection
        canWrite={model.canWrite}
        title={copy.exceptions.sectionTitle}
        description={copy.exceptions.sectionDescription}
        surfaceKey={hrComplianceExceptionsSurfaceKey}
        listConfiguration={model.exceptionsList}
        loadError={model.exceptionsLoadError}
        actionsHeader={copy.exceptions.colActions}
        TrailingCell={HrComplianceExceptionsTrailingCell}
      />
    </div>
  );
}

export function HrComplianceAccessDeniedPanel() {
  const copy = hrComplianceUiCopy;

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
