import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import type {
  EmptyState,
  ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface/schemas";
import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";
import { SectionPanel } from "@afenda/ui";

import type { HrFwaPageModel } from "../data/hr.time.fwa.page-model.server";
import {
  hrFwaArrangementsSurfaceKey,
  hrFwaAuditTrailSurfaceKey,
  hrFwaComplianceSurfaceKey,
  hrFwaReportsSurfaceKey,
  hrFwaRequestsSurfaceKey,
} from "../surface/hr.time.fwa-surface-metadata.shared";
import { hrFwaUiCopy } from "../surface/hr.time.fwa-ui.copy.shared";

const fwaForbiddenState = {
  variant: "forbidden" as const,
  title: hrFwaUiCopy.accessDenied.title,
  description: hrFwaUiCopy.accessDenied.description,
};

function HrFwaGovernedListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
  loadError,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration?: ListSurfaceRendererConfigurationInput;
  loadError?: EmptyState;
}) {
  if (!listConfiguration) {
    return (
      <SectionPanel headingLevel={3} title={title} description={description}>
        <Alert variant="destructive">
          <AlertTitle>{loadError?.title ?? "Unavailable"}</AlertTitle>
          <AlertDescription>
            {loadError?.description ?? "Could not load this section."}
          </AlertDescription>
        </Alert>
      </SectionPanel>
    );
  }

  return (
    <GovernedPatternCListSection
      title={title}
      description={description}
      surfaceKey={surfaceKey}
      listConfiguration={listConfiguration}
      loadError={loadError}
      parentAccessAllowed
      layout="embedded"
      forbidden={fwaForbiddenState}
    />
  );
}

export function HrFwaAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrFwaUiCopy.accessDenied.title}
      description={hrFwaUiCopy.accessDenied.description}
    />
  );
}

export function HrFwaWorkbenchSection({ model }: { model: HrFwaPageModel }) {
  return (
    <div className="@container flex flex-col gap-surface-lg">
      <HrFwaGovernedListSection
        title={hrFwaUiCopy.arrangements.sectionTitle}
        description={hrFwaUiCopy.arrangements.emptyDescription}
        surfaceKey={hrFwaArrangementsSurfaceKey}
        listConfiguration={model.arrangements}
        loadError={model.arrangementsLoadError}
      />
      <HrFwaGovernedListSection
        title={hrFwaUiCopy.requests.sectionTitle}
        description={hrFwaUiCopy.requests.emptyDescription}
        surfaceKey={hrFwaRequestsSurfaceKey}
        listConfiguration={model.requests}
        loadError={model.requestsLoadError}
      />
      {model.compliance || model.complianceLoadError ? (
        <HrFwaGovernedListSection
          title={hrFwaUiCopy.compliance.sectionTitle}
          description={hrFwaUiCopy.compliance.emptyDescription}
          surfaceKey={hrFwaComplianceSurfaceKey}
          listConfiguration={model.compliance}
          loadError={model.complianceLoadError}
        />
      ) : null}
      <HrFwaGovernedListSection
        title={hrFwaUiCopy.reports.sectionTitle}
        description={hrFwaUiCopy.reports.emptyDescription}
        surfaceKey={hrFwaReportsSurfaceKey}
        listConfiguration={model.reports}
        loadError={model.reportsLoadError}
      />
      {model.auditTrail || model.auditTrailLoadError ? (
        <HrFwaGovernedListSection
          title={hrFwaUiCopy.audit.sectionTitle}
          description={hrFwaUiCopy.audit.emptyDescription}
          surfaceKey={hrFwaAuditTrailSurfaceKey}
          listConfiguration={model.auditTrail}
          loadError={model.auditTrailLoadError}
        />
      ) : null}
    </div>
  );
}
