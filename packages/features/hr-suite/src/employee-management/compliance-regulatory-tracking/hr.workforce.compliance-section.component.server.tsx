import { GovernedPatternBStatSection, GovernedPatternCListSection } from "@afenda/governed-surface/server";
import type {
  EmptyState,
  ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface/schemas";
import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";
import { SectionPanel } from "@afenda/ui";
import type { ComponentType } from "react";
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client";

import type { HrCompliancePageModel } from "./hr.workforce.compliance.page-model.server";
import {
  hrComplianceAlertsSurfaceKey,
  hrComplianceExceptionsSurfaceKey,
  hrComplianceFilingsSurfaceKey,
  hrComplianceLaborLawRequirementsSurfaceKey,
  hrComplianceStatutoryRequirementsSurfaceKey,
  hrComplianceObligationsSurfaceKey,
  hrCompliancePolicyAcknowledgementsSurfaceKey,
  hrComplianceRegulatoryCalendarSurfaceKey,
  hrComplianceSafetyTrainingRequirementsSurfaceKey,
  hrComplianceWorkAuthDocumentsSurfaceKey,
  hrComplianceWorkEligibilitySurfaceKey,
  hrComplianceWorkplaceSafetyRequirementsSurfaceKey,
  hrComplianceEvidenceLinksSurfaceKey,
  hrComplianceAuditTrailSurfaceKey,
  hrComplianceReviewQueueSurfaceKey,
} from "./hr.workforce.compliance-surface-metadata.shared";
import { hrComplianceOverviewBreakdownSurfaceKey } from "./hr.workforce.compliance-overview-breakdown-list.surface";
import { hrComplianceOverviewStatSurfaceKey } from "./hr.workforce.compliance-overview-stat.surface";
import { hrComplianceUiCopy } from "./hr.workforce.compliance-ui.copy.shared";
import {
  HrComplianceExceptionCreateForm,
  HrComplianceFilingSyncForm,
  HrComplianceLaborLawSyncForm,
  HrComplianceStatutorySyncForm,
  HrComplianceObligationUpsertForm,
  HrCompliancePolicyAcknowledgementSyncForm,
  HrComplianceSafetyTrainingSyncForm,
  HrComplianceWorkAuthDocumentsEnsureForm,
  HrComplianceWorkEligibilityEnsureForm,
  HrComplianceWorkplaceSafetySyncForm,
  HrComplianceEvidenceLinkForm,
} from "./hr.workforce.compliance-forms.component.client";
import {
  HrComplianceExceptionsTrailingCell,
  HrComplianceFilingsTrailingCell,
  HrComplianceLaborLawRequirementsTrailingCell,
  HrComplianceStatutoryRequirementsTrailingCell,
  HrComplianceObligationsTrailingCell,
  HrCompliancePolicyAcknowledgementsTrailingCell,
  HrComplianceSafetyTrainingRequirementsTrailingCell,
  HrComplianceWorkAuthDocumentsTrailingCell,
  HrComplianceWorkEligibilityTrailingCell,
  HrComplianceWorkplaceSafetyRequirementsTrailingCell,
  HrComplianceEvidenceLinksTrailingCell,
  HrComplianceReviewQueueTrailingCell,
} from "./hr.workforce.compliance-list-trailing.component.client";
import { HrComplianceTrailingPickerProvider } from "./hr.workforce.compliance.trailing-pickers.component.client";
import { HrComplianceReportsExportPanel } from "./hr.workforce.compliance-reports.component.client";

const complianceForbiddenState = {
  variant: "forbidden" as const,
  title: hrComplianceUiCopy.accessDenied.title,
  description: hrComplianceUiCopy.accessDenied.description,
};

function HrComplianceSensitiveAccessNotice({
  description,
}: {
  description: string;
}) {
  const copy = hrComplianceUiCopy.sensitiveAccess;

  return (
    <Alert>
      <AlertTitle>{copy.title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

function HrComplianceGovernedListSection({
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
  const effectiveWrite =
    canWrite && (canViewSensitive || sensitiveAccessDescription === undefined);

  return (
    <div className="flex flex-col gap-surface-md">
      {!canViewSensitive && sensitiveAccessDescription ? (
        <HrComplianceSensitiveAccessNotice
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
        forbidden={complianceForbiddenState}
        trailingColumn={
          effectiveWrite && !loadError
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

function HrComplianceReadOnlyGovernedListSection({
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
        <HrComplianceSensitiveAccessNotice
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
        forbidden={complianceForbiddenState}
      />
    </div>
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
    <HrComplianceTrailingPickerProvider
      employeeOptions={model.employeePickerOptions}
      documentOptions={model.documentPickerOptions}
    >
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

      <SectionPanel
        title={copy.overview.sectionTitle}
        description={copy.overview.sectionDescription}
      >
        <GovernedPatternBStatSection
          title={copy.overview.sectionTitle}
          surfaceKey={hrComplianceOverviewStatSurfaceKey}
          layout="embedded"
          loadError={model.overviewLoadError}
          statGroups={model.overviewStatGroups}
        />
      </SectionPanel>

      <HrComplianceReadOnlyGovernedListSection
        title={copy.overviewBreakdown.sectionTitle}
        description={copy.overviewBreakdown.sectionDescription}
        surfaceKey={hrComplianceOverviewBreakdownSurfaceKey}
        listConfiguration={model.overviewBreakdownList}
        loadError={model.overviewLoadError}
      />

      <HrComplianceReadOnlyGovernedListSection
        canViewSensitive={model.canViewSensitive}
        title={copy.alerts.sectionTitle}
        description={
          model.alertsMergeTruncated
            ? `${copy.alerts.sectionDescription} ${copy.alerts.mergeTruncatedNotice}`
            : copy.alerts.sectionDescription
        }
        surfaceKey={hrComplianceAlertsSurfaceKey}
        listConfiguration={model.alertsList}
        loadError={model.alertsLoadError}
        sensitiveAccessDescription={copy.sensitiveAccess.alertsDescription}
      />

      <HrComplianceGovernedListSection
        canWrite={model.canWrite}
        canViewSensitive={model.canViewSensitive}
        title={copy.reviewQueue.sectionTitle}
        description={
          model.reviewQueueMergeTruncated
            ? `${copy.reviewQueue.sectionDescription} ${copy.reviewQueue.mergeTruncatedNotice}`
            : copy.reviewQueue.sectionDescription
        }
        surfaceKey={hrComplianceReviewQueueSurfaceKey}
        listConfiguration={model.reviewQueueList}
        loadError={model.reviewQueueLoadError}
        actionsHeader={copy.reviewQueue.colActions}
        TrailingCell={HrComplianceReviewQueueTrailingCell}
        sensitiveAccessDescription={copy.sensitiveAccess.reviewQueueDescription}
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
          title={copy.statutory.syncTitle}
          description={copy.statutory.syncDescription}
        >
          <HrComplianceStatutorySyncForm />
        </SectionPanel>
      ) : null}

      <HrComplianceGovernedListSection
        canWrite={model.canWrite}
        title={copy.statutory.sectionTitle}
        description={copy.statutory.sectionDescription}
        surfaceKey={hrComplianceStatutoryRequirementsSurfaceKey}
        listConfiguration={model.statutoryRequirementsList}
        loadError={model.statutoryRequirementsLoadError}
        actionsHeader={copy.statutory.colActions}
        TrailingCell={HrComplianceStatutoryRequirementsTrailingCell}
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
        canViewSensitive={model.canViewSensitive}
        title={copy.workEligibility.sectionTitle}
        description={copy.workEligibility.sectionDescription}
        surfaceKey={hrComplianceWorkEligibilitySurfaceKey}
        listConfiguration={model.workEligibilityList}
        loadError={model.workEligibilityLoadError}
        actionsHeader={copy.workEligibility.colActions}
        TrailingCell={HrComplianceWorkEligibilityTrailingCell}
        sensitiveAccessDescription={copy.sensitiveAccess.workEligibilityDescription}
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
        canViewSensitive={model.canViewSensitive}
        title={copy.workAuthDocuments.sectionTitle}
        description={copy.workAuthDocuments.sectionDescription}
        surfaceKey={hrComplianceWorkAuthDocumentsSurfaceKey}
        listConfiguration={model.workAuthDocumentsList}
        loadError={model.workAuthDocumentsLoadError}
        actionsHeader={copy.workAuthDocuments.colActions}
        TrailingCell={HrComplianceWorkAuthDocumentsTrailingCell}
        sensitiveAccessDescription={copy.sensitiveAccess.workAuthDescription}
      />

      {model.canWrite ? (
        <SectionPanel
          title={copy.exceptions.createTitle}
          description={copy.exceptions.createDescription}
        >
          <HrComplianceExceptionCreateForm
            employeeOptions={model.employeePickerOptions}
          />
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

      {model.canWrite ? (
        <SectionPanel
          title={copy.evidenceLinks.linkFormTitle}
          description={copy.evidenceLinks.linkFormDescription}
        >
          <HrComplianceEvidenceLinkForm
            documentOptions={model.documentPickerOptions}
          />
        </SectionPanel>
      ) : null}

      <HrComplianceGovernedListSection
        canWrite={model.canWrite}
        canViewSensitive={model.canViewSensitive}
        title={copy.evidenceLinks.sectionTitle}
        description={copy.evidenceLinks.sectionDescription}
        surfaceKey={hrComplianceEvidenceLinksSurfaceKey}
        listConfiguration={model.evidenceLinksList}
        loadError={model.evidenceLinksLoadError}
        actionsHeader={copy.evidenceLinks.colActions}
        TrailingCell={HrComplianceEvidenceLinksTrailingCell}
        sensitiveAccessDescription={copy.sensitiveAccess.evidenceLinksDescription}
      />

      <SectionPanel
        title={copy.reports.sectionTitle}
        description={copy.reports.sectionDescription}
      >
        <HrComplianceReportsExportPanel />
      </SectionPanel>

      <HrComplianceReadOnlyGovernedListSection
        canViewSensitive={model.canViewSensitive}
        title={copy.auditTrail.sectionTitle}
        description={copy.auditTrail.sectionDescription}
        surfaceKey={hrComplianceAuditTrailSurfaceKey}
        listConfiguration={model.auditTrailList}
        loadError={model.auditTrailLoadError}
        sensitiveAccessDescription={copy.sensitiveAccess.auditTrailDescription}
      />
    </div>
    </HrComplianceTrailingPickerProvider>
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
