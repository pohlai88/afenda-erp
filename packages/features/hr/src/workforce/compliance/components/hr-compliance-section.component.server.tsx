import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import {
  archiveHrComplianceObligationAction,
  assignHrComplianceCorrectiveActionAction,
  createHrComplianceExceptionAction,
  resolveHrComplianceExceptionAction,
  updateHrComplianceCorrectiveActionProgressAction,
  upsertHrComplianceObligationAction,
  waiveHrComplianceExceptionAction,
} from "../actions/hr-compliance.actions.server";
import type {
  HrComplianceExceptionWindow,
  HrComplianceObligationWindow,
} from "../contracts/hr-compliance.contract";
import { buildHrComplianceExceptionsListSurface } from "../surface/hr-compliance-exceptions-list.surface";
import { buildHrComplianceObligationsListSurface } from "../surface/hr-compliance-obligations-list.surface";
import {
  hrComplianceExceptionsSurfaceKey,
  hrComplianceObligationsSurfaceKey,
  hrComplianceUiCopy,
} from "../surface/hr-compliance-ui.copy.shared";
import {
  HrComplianceExceptionAssignCorrectiveForm,
  HrComplianceExceptionCorrectiveProgressForm,
  HrComplianceExceptionCreateForm,
  HrComplianceExceptionResolveForm,
  HrComplianceExceptionWaiveForm,
  HrComplianceObligationArchiveForm,
  HrComplianceObligationUpsertForm,
} from "./hr-compliance-forms.component.client";

export function HrComplianceSection({
  obligationsWindow,
  exceptionsWindow,
  obligationsSearch,
  exceptionsSearch,
  canWrite,
  employees,
}: {
  obligationsWindow: HrComplianceObligationWindow;
  exceptionsWindow: HrComplianceExceptionWindow;
  obligationsSearch?: string;
  exceptionsSearch?: string;
  canWrite: boolean;
  employees: ReadonlyArray<{ id: string; label: string }>;
}) {
  const obligationOptions = obligationsWindow.rows.map((row) => ({
    id: row.id,
    label: `${row.code} — ${row.title}`,
  }));

  const openExceptions = exceptionsWindow.rows
    .filter((row) => row.status === "open" || row.status === "in_progress")
    .map((row) => ({
      id: row.id,
      label: `${row.complianceArea} — ${row.title}`,
    }));

  return (
    <div className="flex flex-col gap-surface-2xl">
      {canWrite ? (
        <>
          <SectionPanel
            title={hrComplianceUiCopy.obligations.upsert.title}
            description={hrComplianceUiCopy.obligations.upsert.description}
          >
            <HrComplianceObligationUpsertForm
              upsertAction={upsertHrComplianceObligationAction}
            />
          </SectionPanel>
          {obligationOptions.length > 0 ? (
            <SectionPanel
              title={hrComplianceUiCopy.obligations.archive.title}
              description={hrComplianceUiCopy.obligations.archive.description}
            >
              <HrComplianceObligationArchiveForm
                obligations={obligationOptions}
                archiveAction={archiveHrComplianceObligationAction}
              />
            </SectionPanel>
          ) : null}
          <SectionPanel
            title={hrComplianceUiCopy.exceptions.create.title}
            description={hrComplianceUiCopy.exceptions.create.description}
          >
            <HrComplianceExceptionCreateForm
              employees={employees}
              createAction={createHrComplianceExceptionAction}
            />
          </SectionPanel>
          {openExceptions.length > 0 ? (
            <>
              <SectionPanel
                title={hrComplianceUiCopy.exceptions.assignCorrective.title}
                description={
                  hrComplianceUiCopy.exceptions.assignCorrective.description
                }
              >
                <HrComplianceExceptionAssignCorrectiveForm
                  openExceptions={openExceptions}
                  assignAction={assignHrComplianceCorrectiveActionAction}
                />
              </SectionPanel>
              <SectionPanel
                title={hrComplianceUiCopy.exceptions.correctiveProgress.title}
                description={
                  hrComplianceUiCopy.exceptions.correctiveProgress.description
                }
              >
                <HrComplianceExceptionCorrectiveProgressForm
                  openExceptions={openExceptions}
                  progressAction={
                    updateHrComplianceCorrectiveActionProgressAction
                  }
                />
              </SectionPanel>
              <SectionPanel
                title={hrComplianceUiCopy.exceptions.resolve.title}
                description={hrComplianceUiCopy.exceptions.resolve.description}
              >
                <HrComplianceExceptionResolveForm
                  openExceptions={openExceptions}
                  resolveAction={resolveHrComplianceExceptionAction}
                />
              </SectionPanel>
              <SectionPanel
                title={hrComplianceUiCopy.exceptions.waive.title}
                description={hrComplianceUiCopy.exceptions.waive.description}
              >
                <HrComplianceExceptionWaiveForm
                  openExceptions={openExceptions}
                  waiveAction={waiveHrComplianceExceptionAction}
                />
              </SectionPanel>
            </>
          ) : null}
        </>
      ) : null}
      <GovernedPatternCListSection
        title={hrComplianceUiCopy.obligations.section.title}
        description={hrComplianceUiCopy.obligations.section.description}
        surfaceKey={hrComplianceObligationsSurfaceKey}
        listConfiguration={buildHrComplianceObligationsListSurface({
          window: obligationsWindow,
          searchValue: obligationsSearch,
        })}
        parentAccessAllowed
        layout="embedded"
      />
      <GovernedPatternCListSection
        title={hrComplianceUiCopy.exceptions.section.title}
        description={hrComplianceUiCopy.exceptions.section.description}
        surfaceKey={hrComplianceExceptionsSurfaceKey}
        listConfiguration={buildHrComplianceExceptionsListSurface({
          window: exceptionsWindow,
          searchValue: exceptionsSearch,
        })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}

export function HrComplianceAccessDenied() {
  const denied = hrComplianceUiCopy.accessDenied;

  return (
    <SectionPanel title={denied.title}>
      <p className="type-muted">{denied.description}</p>
    </SectionPanel>
  );
}
