import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import {
  completeHrOnboardingAction,
  completeHrOnboardingChecklistItemAction,
  startHrOnboardingAction,
} from "../actions/hr-onboarding.actions.server";
import type {
  HrOnboardingCaseWindow,
  HrOnboardingChecklistItemRow,
} from "../contracts/hr-onboarding.contract";
import {
  buildHrOnboardingListSurface,
  hrOnboardingSurfaceKey,
} from "../surface/hr-onboarding-list.surface";
import { hrOnboardingUiCopy } from "../surface/hr-onboarding-ui.copy.shared";
import {
  HrOnboardingChecklistForm,
  HrOnboardingCompleteForm,
  HrOnboardingStartForm,
} from "./hr-onboarding-forms.component.client";

export function HrOnboardingSection({
  window,
  searchValue,
  canWrite,
  employees,
  checklistItems,
}: {
  window: HrOnboardingCaseWindow;
  searchValue?: string;
  canWrite: boolean;
  employees: ReadonlyArray<{ id: string; label: string }>;
  checklistItems: readonly HrOnboardingChecklistItemRow[];
}) {
  const inProgressCases = window.rows
    .filter((row) => row.status === "in_progress")
    .map((row) => ({
      id: row.id,
      label: `${row.employeeNumber} — ${row.employeeDisplayName}`,
    }));

  const pendingChecklist = checklistItems
    .filter((item) => item.status === "pending")
    .map((item) => ({
      id: item.id,
      label: item.title,
    }));

  return (
    <div className="flex flex-col gap-surface-2xl">
      {canWrite ? (
        <>
          <SectionPanel
            title={hrOnboardingUiCopy.start.title}
            description={hrOnboardingUiCopy.start.description}
          >
            <HrOnboardingStartForm
              employees={employees}
              startAction={startHrOnboardingAction}
            />
          </SectionPanel>
          {pendingChecklist.length > 0 ? (
            <SectionPanel
              title={hrOnboardingUiCopy.checklist.title}
              description={hrOnboardingUiCopy.checklist.description}
            >
              <HrOnboardingChecklistForm
                items={pendingChecklist}
                completeAction={completeHrOnboardingChecklistItemAction}
              />
            </SectionPanel>
          ) : null}
          <SectionPanel
            title={hrOnboardingUiCopy.complete.title}
            description={hrOnboardingUiCopy.complete.description}
          >
            <HrOnboardingCompleteForm
              inProgressCases={inProgressCases}
              completeAction={completeHrOnboardingAction}
            />
          </SectionPanel>
        </>
      ) : null}
      <GovernedPatternCListSection
        title={hrOnboardingUiCopy.section.title}
        description={hrOnboardingUiCopy.section.description}
        surfaceKey={hrOnboardingSurfaceKey}
        listConfiguration={buildHrOnboardingListSurface({ window, searchValue })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}

export function HrOnboardingAccessDenied() {
  const denied = hrOnboardingUiCopy.accessDenied;

  return (
    <SectionPanel title={denied.title}>
      <p className="type-muted">{denied.description}</p>
    </SectionPanel>
  );
}
