import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";
import { SectionPanel } from "@afenda/ui";

import type { HrCompliancePageModel } from "../data/hr.workforce.compliance.page-model.server";
import {
  hrComplianceExceptionsSurfaceKey,
  hrComplianceLaborLawRequirementsSurfaceKey,
  hrComplianceObligationsSurfaceKey,
  hrComplianceWorkEligibilitySurfaceKey,
  hrComplianceUiCopy,
} from "../surface";
import {
  HrComplianceExceptionCreateForm,
  HrComplianceLaborLawSyncForm,
  HrComplianceObligationUpsertForm,
  HrComplianceWorkEligibilityEnsureForm,
} from "./hr.workforce.compliance-forms.component.client";
import {
  HrComplianceExceptionsTrailingCell,
  HrComplianceLaborLawRequirementsTrailingCell,
  HrComplianceObligationsTrailingCell,
  HrComplianceWorkEligibilityTrailingCell,
} from "./hr.workforce.compliance-list-trailing.component.client";

export function HrComplianceWorkbenchSection({
  model,
  departments = [],
}: {
  model: HrCompliancePageModel;
  departments?: ReadonlyArray<{ id: string; name: string }>;
}) {
  const copy = hrComplianceUiCopy;

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

      <GovernedPatternCListSection
        title={copy.obligations.sectionTitle}
        description={copy.obligations.sectionDescription}
        surfaceKey={hrComplianceObligationsSurfaceKey}
        listConfiguration={model.obligationsList}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={
          model.canWrite
            ? {
                header: copy.obligations.colActions,
                Cell: HrComplianceObligationsTrailingCell,
                context: { surfaceKey: hrComplianceObligationsSurfaceKey },
              }
            : undefined
        }
      />

      {model.canWrite ? (
        <SectionPanel
          title={copy.laborLaw.syncTitle}
          description={copy.laborLaw.syncDescription}
        >
          <HrComplianceLaborLawSyncForm />
        </SectionPanel>
      ) : null}

      <GovernedPatternCListSection
        title={copy.laborLaw.sectionTitle}
        description={copy.laborLaw.sectionDescription}
        surfaceKey={hrComplianceLaborLawRequirementsSurfaceKey}
        listConfiguration={model.laborLawRequirementsList}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={
          model.canWrite
            ? {
                header: copy.laborLaw.colActions,
                Cell: HrComplianceLaborLawRequirementsTrailingCell,
                context: {
                  surfaceKey: hrComplianceLaborLawRequirementsSurfaceKey,
                },
              }
            : undefined
        }
      />

      {model.canWrite ? (
        <SectionPanel
          title={copy.workEligibility.ensureTitle}
          description={copy.workEligibility.ensureDescription}
        >
          <HrComplianceWorkEligibilityEnsureForm />
        </SectionPanel>
      ) : null}

      <GovernedPatternCListSection
        title={copy.workEligibility.sectionTitle}
        description={copy.workEligibility.sectionDescription}
        surfaceKey={hrComplianceWorkEligibilitySurfaceKey}
        listConfiguration={model.workEligibilityList}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={
          model.canWrite
            ? {
                header: copy.workEligibility.colActions,
                Cell: HrComplianceWorkEligibilityTrailingCell,
                context: {
                  surfaceKey: hrComplianceWorkEligibilitySurfaceKey,
                },
              }
            : undefined
        }
      />

      {model.canWrite ? (
        <SectionPanel
          title={copy.exceptions.createTitle}
          description={copy.exceptions.createDescription}
        >
          <HrComplianceExceptionCreateForm />
        </SectionPanel>
      ) : null}

      <GovernedPatternCListSection
        title={copy.exceptions.sectionTitle}
        description={copy.exceptions.sectionDescription}
        surfaceKey={hrComplianceExceptionsSurfaceKey}
        listConfiguration={model.exceptionsList}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={
          model.canWrite
            ? {
                header: copy.exceptions.colActions,
                Cell: HrComplianceExceptionsTrailingCell,
                context: { surfaceKey: hrComplianceExceptionsSurfaceKey },
              }
            : undefined
        }
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
